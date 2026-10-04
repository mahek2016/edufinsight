import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { matchLenders } from '../services/lenderMatching';
import { evaluateFinancialReadiness } from '../services/financialCalculations';
import { getFormattedSeedLenders } from '../data/lenderData';

const LEGAL_DISCLAIMER =
  'This assessment is for decision-support and educational purposes only and does not guarantee loan approval or rejection. Final interest rates, sanctioned amounts, and eligibility are determined exclusively by the lender after formal credit appraisal and physical verification.';

export async function generateAssessment(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        studyPlan: true,
        fundingSource: true,
        financialProfile: {
          include: {
            assets: true,
            liabilities: true
          }
        },
        collaterals: true,
        documents: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // Load dynamic lenders from PostgreSQL database or fallback to seed format
    let lendersList: any[] = [];
    try {
      lendersList = await prisma.lender.findMany({
        include: {
          criteria: true
        }
      });
    } catch (e) {
      console.warn('Lender query from DB failed, falling back to seed structure');
    }

    if (!lendersList || lendersList.length === 0) {
      lendersList = getFormattedSeedLenders();
    }

    const totalStudyCost = profile.studyPlan?.totalStudyCost || 0;
    const totalFunding = profile.fundingSource?.totalAvailableFunding || 0;
    const fundingGap = profile.fundingSource?.fundingGap || totalStudyCost;
    const estimatedLoanRequirement = profile.fundingSource?.estimatedLoanRequirement || Math.max(0, fundingGap);

    const netWorth = profile.financialProfile?.netWorth || 0;
    const monthlyIncome = profile.financialProfile?.monthlyIncome || 0;
    const totalMonthlyEmi = (profile.financialProfile?.liabilities || []).reduce(
      (sum, l) => sum + (l.monthlyEmi || 0),
      0
    );

    const totalCollateral = profile.collaterals.reduce(
      (sum, c) => sum + (c.availableCollateralValue || 0),
      0
    );

    const uploadedDocTypes = profile.documents.map((d) => d.documentType);

    // 1. Run Financial Readiness Evaluation (Original Feature #2)
    const readinessSnapshot = evaluateFinancialReadiness({
      monthlyIncome,
      totalMonthlyEmi,
      netWorth,
      loanRequirement: estimatedLoanRequirement,
      totalAvailableFunding: totalFunding,
      totalStudyCost,
      availableCollateral: totalCollateral,
      uploadedDocumentCount: profile.documents.length
    });

    // 2. Run Dynamic Explainable Lender Matching Engine
    const matchingResult = matchLenders(
      {
        estimatedLoanRequirement,
        gender: profile.gender,
        cibilScore: profile.cibilScore,
        isTop100University: profile.studyPlan?.isTop100University || false,
        university: profile.studyPlan?.university || '',
        courseName: profile.studyPlan?.courseName || '',
        totalAvailableCollateral: totalCollateral,
        coApplicantType: profile.coApplicantType,
        coApplicantIncome: profile.coApplicantIncome,
        uploadedDocumentTypes: uploadedDocTypes
      },
      lendersList as any
    );

    // 3. Persist Assessment in PostgreSQL if DB is available
    let savedAssessment: any = null;
    try {
      savedAssessment = await prisma.assessment.create({
        data: {
          studentProfileId: profile.id,
          totalStudyCost,
          availableFunding: totalFunding,
          fundingGap,
          estimatedLoanRequirement,
          netWorth,
          totalCollateral,
          cibilScore: profile.cibilScore,
          potentialRoute: matchingResult.potentialFinancingRoute,
          readinessCategory: readinessSnapshot.category,
          readinessScoreExplanation: readinessSnapshot as any,
          missingInformation: matchingResult.missingInformation as any,
          documentChecklist: matchingResult.generalDocumentChecklist as any,
          disclaimer: LEGAL_DISCLAIMER,
          lenderMatches: {
            create: matchingResult.lenderMatches.map((m) => ({
              lenderId: m.lenderId,
              lenderName: m.lenderName,
              loanType: m.loanType as any,
              effectiveRate: m.effectiveRate,
              rateNote: m.rateNote || null,
              isPotentialMatch: m.isPotentialMatch,
              relevanceScore: m.relevanceScore,
              matchReasons: m.matchReasons as any,
              unmetCriteria: m.unmetCriteria as any,
              missingDocuments: m.missingDocuments as any
            }))
          }
        },
        include: {
          lenderMatches: true
        }
      });
    } catch (dbErr) {
      console.warn('Could not persist assessment to database, returning real-time computed assessment.');
    }

    const responsePayload = savedAssessment || {
      id: `live-assessment-${Date.now()}`,
      studentProfileId: profile.id,
      totalStudyCost,
      availableFunding: totalFunding,
      fundingGap,
      estimatedLoanRequirement,
      netWorth,
      totalCollateral,
      cibilScore: profile.cibilScore,
      potentialRoute: matchingResult.potentialFinancingRoute,
      readinessCategory: readinessSnapshot.category,
      readinessScoreExplanation: readinessSnapshot,
      missingInformation: matchingResult.missingInformation,
      documentChecklist: matchingResult.generalDocumentChecklist,
      disclaimer: LEGAL_DISCLAIMER,
      lenderMatches: matchingResult.lenderMatches,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      message: 'Assessment generated successfully.',
      assessment: {
        ...responsePayload,
        routeExplanation: matchingResult.routeExplanation,
        readinessSnapshot
      }
    });
  } catch (error) {
    console.error('generateAssessment error:', error);
    return res.status(500).json({ error: 'Failed to generate loan assessment report.' });
  }
}

export async function getLatestAssessment(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const latest = await prisma.assessment.findFirst({
      where: { studentProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        lenderMatches: {
          orderBy: [{ isPotentialMatch: 'desc' }, { relevanceScore: 'desc' }]
        }
      }
    });

    if (!latest) {
      return res.status(404).json({ error: 'No assessments have been generated yet.' });
    }

    return res.json({ assessment: latest });
  } catch (error) {
    console.error('getLatestAssessment error:', error);
    return res.status(500).json({ error: 'Failed to retrieve latest assessment.' });
  }
}

export async function getAssessmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        lenderMatches: {
          orderBy: [{ isPotentialMatch: 'desc' }, { relevanceScore: 'desc' }]
        },
        studentProfile: {
          include: {
            user: { select: { fullName: true, email: true } },
            studyPlan: true,
            fundingSource: true,
            financialProfile: {
              include: { assets: true, liabilities: true }
            },
            collaterals: true,
            documents: true
          }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    return res.json({ assessment });
  } catch (error) {
    console.error('getAssessmentById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessment by ID.' });
  }
}
