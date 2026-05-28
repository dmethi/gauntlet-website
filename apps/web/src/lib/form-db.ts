import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { formPrisma: PrismaClient };

export const formDb =
  globalForPrisma.formPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.formPrisma = formDb;
