import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('postgresql://neondb_owner:npg_3nBTXN5YwIqj@ep-floral-leaf-b5r82avv-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('bike-erp-super-secure-jwt-secret-key-production-change-this-2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters').default('bike-erp-refresh-token-secret-key-production-change-this-2026'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000)
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
