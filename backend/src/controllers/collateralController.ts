import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { calculateCollateralSummary } from '../services/financialCalculations';

export async function getCollateral(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        collaterals: true,
        fundingSource: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const loanReq = profile.fundingSource?.estimatedLoanRequirement || 0;
    const summary = calculateCollateralSummary(profile.collaterals, loanReq);

    return res.json({
      collaterals: profile.collaterals,
      summary
    });
  } catch (error) {
    console.error('getCollateral error:', error);
    return res.status(500).json({ error: 'Failed to retrieve collateral records.' });
  }
}

export async function addCollateral(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      collateralType,
      description,
      propertyValue,
      eligibleAssetValue,
      ownershipInfo,
      availableCollateralValue,
      hasEncumbranceCert,
      hasApprovedLayout,
      hasOccupancyCert,
      state
    } = req.body;

    if (!collateralType || propertyValue === undefined) {
      return res.status(400).json({ error: 'Collateral type and property value are required.' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { fundingSource: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const pVal = Number(propertyValue) || 0;
    // Default standard bank haircut/margin (e.g. 75-80%) if eligible value not explicitly provided
    const eVal = eligibleAssetValue !== undefined ? Number(eligibleAssetValue) : pVal * 0.8;
    const aVal = availableCollateralValue !== undefined ? Number(availableCollateralValue) : eVal;

    const collateral = await prisma.collateral.create({
      data: {
        studentProfileId: profile.id,
        collateralType,
        description: description || '',
        propertyValue: pVal,
        eligibleAssetValue: eVal,
        ownershipInfo: ownershipInfo || 'Self / Parents',
        availableCollateralValue: aVal,
        hasEncumbranceCert: Boolean(hasEncumbranceCert),
        hasApprovedLayout: Boolean(hasApprovedLayout),
        hasOccupancyCert: Boolean(hasOccupancyCert),
        state: state || null
      }
    });

    const allCollaterals = await prisma.collateral.findMany({
      where: { studentProfileId: profile.id }
    });

    const loanReq = profile.fundingSource?.estimatedLoanRequirement || 0;
    const summary = calculateCollateralSummary(allCollaterals, loanReq);

    return res.status(201).json({
      message: 'Collateral record added successfully.',
      collateral,
      summary
    });
  } catch (error) {
    console.error('addCollateral error:', error);
    return res.status(500).json({ error: 'Failed to add collateral record.' });
  }
}

export async function deleteCollateral(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { fundingSource: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    await prisma.collateral.delete({
      where: { id }
    });

    const allCollaterals = await prisma.collateral.findMany({
      where: { studentProfileId: profile.id }
    });

    const loanReq = profile.fundingSource?.estimatedLoanRequirement || 0;
    const summary = calculateCollateralSummary(allCollaterals, loanReq);

    return res.json({
      message: 'Collateral record deleted successfully.',
      summary
    });
  } catch (error) {
    console.error('deleteCollateral error:', error);
    return res.status(500).json({ error: 'Failed to delete collateral record.' });
  }
}
