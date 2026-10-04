import { PrismaClient, LoanType } from '@prisma/client';
import { LENDER_SEED_DATA } from '../src/data/lenderData';

const prisma = new PrismaClient();

export async function seedLenders() {
  console.log('Seeding GradGuide Lender Database...');

  for (const lenderData of LENDER_SEED_DATA) {
    const lender = await prisma.lender.upsert({
      where: { code: lenderData.code },
      update: {
        name: lenderData.name,
        type: lenderData.type,
        description: lenderData.description,
        minCibilScore: lenderData.minCibilScore
      },
      create: {
        code: lenderData.code,
        name: lenderData.name,
        type: lenderData.type,
        description: lenderData.description,
        minCibilScore: lenderData.minCibilScore
      }
    });

    // Remove old criteria to prevent duplication on re-seeding
    await prisma.lenderCriteria.deleteMany({
      where: { lenderId: lender.id }
    });

    for (const crit of lenderData.criteria) {
      await prisma.lenderCriteria.create({
        data: {
          lenderId: lender.id,
          loanType: crit.loanType,
          isOffered: crit.isOffered,
          baseInterestRate: crit.baseInterestRate,
          boysInterestRate: crit.boysInterestRate,
          girlsInterestRate: crit.girlsInterestRate,
          maxRate: crit.maxRate,
          requiresTop100: crit.requiresTop100,
          requiresCollateral: crit.requiresCollateral,
          conditionNote: crit.conditionNote,
          requiredDocumentsList: crit.requiredDocumentsList
        }
      });
    }
    console.log(`Seeded lender: ${lender.name} (${lender.code})`);
  }

  console.log('Lender database seeded successfully from source of truth!');
}

async function main() {
  await seedLenders();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
