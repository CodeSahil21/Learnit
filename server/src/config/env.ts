import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.union([z.string(), z.number()]).default('7d'),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
