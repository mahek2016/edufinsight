import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { calculateNetWorth } from '../services/financialCalculations';

export async function getFinancialProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        financialProfile: {
          include: {
            assets: true,
            liabilities: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    return res.json({ financialProfile: profile.financialProfile });
  } catch (error) {
    console.error('getFinancialProfile error:', error);
    return res.status(500).json({ error: 'Failed to retrieve financial profile.' });
  }
}

export async function saveIncomeDetails(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { monthlyIncome, annualIncome, otherIncome, cibilScore, coApplicantType, coApplicantIncome } = req.body;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // Update studentProfile CIBIL and co-applicant details
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        cibilScore: cibilScore !== undefined ? (Number(cibilScore) || null) : profile.cibilScore,
        coApplicantType: coApplicantType || profile.coApplicantType,
        coApplicantIncome: coApplicantIncome !== undefined ? Number(coApplicantIncome) : profile.coApplicantIncome
      }
    });

    const financialProfile = await prisma.financialProfile.upsert({
      where: { studentProfileId: profile.id },
      update: {
        monthlyIncome: Number(monthlyIncome) || 0,
        annualIncome: Number(annualIncome) || 0,
        otherIncome: Number(otherIncome) || 0
      },
      create: {
        studentProfileId: profile.id,
        monthlyIncome: Number(monthlyIncome) || 0,
        annualIncome: Number(annualIncome) || 0,
        otherIncome: Number(otherIncome) || 0
      }
    });

    return res.json({
      message: 'Income details saved successfully.',
      financialProfile
    });
  } catch (error) {
    console.error('saveIncomeDetails error:', error);
    return res.status(500).json({ error: 'Failed to save income details.' });
  }
}

export async function addAsset(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { assetType, description, value } = req.body;

    if (!assetType || value === undefined) {
      return res.status(400).json({ error: 'Asset type and positive value are required.' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        financialProfile: {
          include: { assets: true, liabilities: true }
        }
      }
    });

    if (!profile || !profile.financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found.' });
    }

    const newAsset = await prisma.asset.create({
      data: {
        financialProfileId: profile.financialProfile.id,
        assetType,
        description: description || '',
        value: Number(value) || 0
      }
    });

    // Recalculate net worth
    const updatedAssets = [...profile.financialProfile.assets, newAsset];
    const netWorthCalc = calculateNetWorth(updatedAssets, profile.financialProfile.liabilities);

    const updatedProfile = await prisma.financialProfile.update({
      where: { id: profile.financialProfile.id },
      data: {
        totalAssets: netWorthCalc.totalAssets,
        netWorth: netWorthCalc.netWorth
      },
      include: { assets: true, liabilities: true }
    });

    return res.status(201).json({
      message: 'Asset added successfully.',
      asset: newAsset,
      financialProfile: updatedProfile,
      calculation: netWorthCalc
    });
  } catch (error) {
    console.error('addAsset error:', error);
    return res.status(500).json({ error: 'Failed to add asset item.' });
  }
}

export async function deleteAsset(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        financialProfile: {
          include: { assets: true, liabilities: true }
        }
      }
    });

    if (!profile || !profile.financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found.' });
    }

    await prisma.asset.delete({
      where: { id }
    });

    const updatedAssets = profile.financialProfile.assets.filter((a) => a.id !== id);
    const netWorthCalc = calculateNetWorth(updatedAssets, profile.financialProfile.liabilities);

    const updatedProfile = await prisma.financialProfile.update({
      where: { id: profile.financialProfile.id },
      data: {
        totalAssets: netWorthCalc.totalAssets,
        netWorth: netWorthCalc.netWorth
      },
      include: { assets: true, liabilities: true }
    });

    return res.json({
      message: 'Asset removed successfully.',
      financialProfile: updatedProfile,
      calculation: netWorthCalc
    });
  } catch (error) {
    console.error('deleteAsset error:', error);
    return res.status(500).json({ error: 'Failed to delete asset.' });
  }
}

export async function addLiability(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { liabilityType, description, outstandingAmount, monthlyEmi } = req.body;

    if (!liabilityType || outstandingAmount === undefined) {
      return res.status(400).json({ error: 'Liability type and outstanding balance are required.' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        financialProfile: {
          include: { assets: true, liabilities: true }
        }
      }
    });

    if (!profile || !profile.financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found.' });
    }

    const newLiability = await prisma.liability.create({
      data: {
        financialProfileId: profile.financialProfile.id,
        liabilityType,
        description: description || '',
        outstandingAmount: Number(outstandingAmount) || 0,
        monthlyEmi: Number(monthlyEmi) || 0
      }
    });

    // Recalculate net worth
    const updatedLiabilities = [...profile.financialProfile.liabilities, newLiability];
    const netWorthCalc = calculateNetWorth(profile.financialProfile.assets, updatedLiabilities);

    const updatedProfile = await prisma.financialProfile.update({
      where: { id: profile.financialProfile.id },
      data: {
        totalLiabilities: netWorthCalc.totalLiabilities,
        netWorth: netWorthCalc.netWorth
      },
      include: { assets: true, liabilities: true }
    });

    return res.status(201).json({
      message: 'Liability added successfully.',
      liability: newLiability,
      financialProfile: updatedProfile,
      calculation: netWorthCalc
    });
  } catch (error) {
    console.error('addLiability error:', error);
    return res.status(500).json({ error: 'Failed to add liability.' });
  }
}

export async function deleteLiability(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        financialProfile: {
          include: { assets: true, liabilities: true }
        }
      }
    });

    if (!profile || !profile.financialProfile) {
      return res.status(404).json({ error: 'Financial profile not found.' });
    }

    await prisma.liability.delete({
      where: { id }
    });

    const updatedLiabilities = profile.financialProfile.liabilities.filter((l) => l.id !== id);
    const netWorthCalc = calculateNetWorth(profile.financialProfile.assets, updatedLiabilities);

    const updatedProfile = await prisma.financialProfile.update({
      where: { id: profile.financialProfile.id },
      data: {
        totalLiabilities: netWorthCalc.totalLiabilities,
        netWorth: netWorthCalc.netWorth
      },
      include: { assets: true, liabilities: true }
    });

    return res.json({
      message: 'Liability removed successfully.',
      financialProfile: updatedProfile,
      calculation: netWorthCalc
    });
  } catch (error) {
    console.error('deleteLiability error:', error);
    return res.status(500).json({ error: 'Failed to delete liability.' });
  }
}
