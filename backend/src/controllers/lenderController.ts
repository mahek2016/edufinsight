import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { getFormattedSeedLenders } from '../data/lenderData';

export async function getLenders(_req: Request, res: Response) {
  try {
    const lenders = await prisma.lender.findMany({
      include: {
        criteria: {
          orderBy: { loanType: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (lenders.length > 0) {
      return res.json({ lenders, source: 'database' });
    }

    return res.json({
      lenders: getFormattedSeedLenders(),
      source: 'seed_reference',
      note: 'Run npm run prisma:seed to populate PostgreSQL database.'
    });
  } catch (error) {
    return res.json({
      lenders: getFormattedSeedLenders(),
      source: 'seed_fallback',
      note: 'PostgreSQL database offline or unmigrated; running on GradGuide reference dataset.'
    });
  }
}

export async function getLenderById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const lender = await prisma.lender.findFirst({
      where: {
        OR: [{ id }, { code: id.toUpperCase() }]
      },
      include: {
        criteria: true
      }
    });

    if (lender) {
      return res.json({ lender });
    }

    const seedMatch = getFormattedSeedLenders().find(
      (l) => l.id === id || l.code.toUpperCase() === id.toUpperCase()
    );

    if (seedMatch) {
      return res.json({ lender: seedMatch });
    }

    return res.status(404).json({ error: 'Lender not found.' });
  } catch (error) {
    console.error('getLenderById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve lender details.' });
  }
}
