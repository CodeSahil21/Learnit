import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from './env';

const connectionString = process.env.DATABASE_URL || env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function connectDb() {
  return prisma.$connect();
}

export async function disconnectDb() {
  await prisma.$disconnect();
  await pool.end();
}
