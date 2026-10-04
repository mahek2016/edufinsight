import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err: any) {
    console.warn('PostgreSQL Database not reachable. Please verify DATABASE_URL in .env (e.g. Neon, Supabase, or local Postgres).');
    return false;
  }
}

