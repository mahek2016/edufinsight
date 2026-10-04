import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { calculateFunding } from '../services/financialCalculations';

export async function getFunding(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { fundingSource: true, studyPlan: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    return res.json({
      fundingSource: profile.fundingSource,
      studyPlanTotalCost: profile.studyPlan?.totalStudyCost || 0
    });
  } catch (error) {
    console.error('getFunding error:', error);
    return res.status(500).json({ error: 'Failed to retrieve funding details.' });
  }
}

export async function saveFunding(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { savings, scholarship, feesAlreadyPaid, familyContribution, otherFunding } = req.body;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { studyPlan: true, fundingSource: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const totalStudyCost = profile.studyPlan?.totalStudyCost || 0;

    const fundingCalculation = calculateFunding({
      totalStudyCost,
      savings: Number(savings) || 0,
      scholarship: Number(scholarship) || 0,
      feesAlreadyPaid: Number(feesAlreadyPaid) || 0,
      familyContribution: Number(familyContribution) || 0,
      otherFunding: Number(otherFunding) || 0
    });

    const fundingSource = await prisma.fundingSource.upsert({
      where: { studentProfileId: profile.id },
      update: {
        savings: Number(savings) || 0,
        scholarship: Number(scholarship) || 0,
        feesAlreadyPaid: Number(feesAlreadyPaid) || 0,
        familyContribution: Number(familyContribution) || 0,
        otherFunding: Number(otherFunding) || 0,
        totalAvailableFunding: fundingCalculation.totalAvailableFunding,
        fundingGap: fundingCalculation.fundingGap,
        estimatedLoanRequirement: fundingCalculation.estimatedLoanRequirement
      },
      create: {
        studentProfileId: profile.id,
        savings: Number(savings) || 0,
        scholarship: Number(scholarship) || 0,
        feesAlreadyPaid: Number(feesAlreadyPaid) || 0,
        familyContribution: Number(familyContribution) || 0,
        otherFunding: Number(otherFunding) || 0,
        totalAvailableFunding: fundingCalculation.totalAvailableFunding,
        fundingGap: fundingCalculation.fundingGap,
        estimatedLoanRequirement: fundingCalculation.estimatedLoanRequirement
      }
    });

    return res.json({
      message: 'Funding details saved successfully.',
      fundingSource,
      calculation: fundingCalculation
    });
  } catch (error) {
    console.error('saveFunding error:', error);
    return res.status(500).json({ error: 'Failed to save funding details.' });
  }
}
