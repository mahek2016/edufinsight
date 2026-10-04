import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { calculateStudyCost, calculateFunding } from '../services/financialCalculations';

export async function getStudyPlan(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { studyPlan: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    return res.json({ studyPlan: profile.studyPlan });
  } catch (error) {
    console.error('getStudyPlan error:', error);
    return res.status(500).json({ error: 'Failed to retrieve study plan.' });
  }
}

export async function saveStudyPlan(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      country,
      university,
      courseName,
      durationYears,
      currency,
      exchangeRateToBase,
      tuitionFee,
      livingCost,
      otherExpenses,
      isTop100University
    } = req.body;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { studyPlan: true, fundingSource: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // Calculate total study cost using the pure calculation service
    const costCalculation = calculateStudyCost({
      tuitionFee: Number(tuitionFee) || 0,
      livingCost: Number(livingCost) || 0,
      otherExpenses: Number(otherExpenses) || 0,
      durationYears: Number(durationYears) || 1,
      exchangeRateToBase: Number(exchangeRateToBase) || 1
    });

    const studyPlan = await prisma.studyPlan.upsert({
      where: { studentProfileId: profile.id },
      update: {
        country: country || 'United States',
        university: university || '',
        courseName: courseName || '',
        durationYears: Number(durationYears) || 1,
        currency: currency || 'USD',
        exchangeRateToBase: costCalculation.exchangeRateToBase,
        tuitionFee: Number(tuitionFee) || 0,
        livingCost: Number(livingCost) || 0,
        otherExpenses: Number(otherExpenses) || 0,
        totalStudyCost: costCalculation.totalStudyCost,
        isTop100University: Boolean(isTop100University)
      },
      create: {
        studentProfileId: profile.id,
        country: country || 'United States',
        university: university || '',
        courseName: courseName || '',
        durationYears: Number(durationYears) || 1,
        currency: currency || 'USD',
        exchangeRateToBase: costCalculation.exchangeRateToBase,
        tuitionFee: Number(tuitionFee) || 0,
        livingCost: Number(livingCost) || 0,
        otherExpenses: Number(otherExpenses) || 0,
        totalStudyCost: costCalculation.totalStudyCost,
        isTop100University: Boolean(isTop100University)
      }
    });

    // If funding source exists, update funding gap dynamically
    if (profile.fundingSource) {
      const updatedFunding = calculateFunding({
        totalStudyCost: costCalculation.totalStudyCost,
        savings: profile.fundingSource.savings,
        scholarship: profile.fundingSource.scholarship,
        feesAlreadyPaid: profile.fundingSource.feesAlreadyPaid,
        familyContribution: profile.fundingSource.familyContribution,
        otherFunding: profile.fundingSource.otherFunding
      });

      await prisma.fundingSource.update({
        where: { id: profile.fundingSource.id },
        data: {
          fundingGap: updatedFunding.fundingGap,
          estimatedLoanRequirement: updatedFunding.estimatedLoanRequirement
        }
      });
    }

    return res.json({
      message: 'Study plan saved successfully.',
      studyPlan,
      calculation: costCalculation
    });
  } catch (error) {
    console.error('saveStudyPlan error:', error);
    return res.status(500).json({ error: 'Failed to save study plan details.' });
  }
}
