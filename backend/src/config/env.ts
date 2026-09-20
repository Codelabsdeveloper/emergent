import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 4000),
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://emergent:emergent_dev_password@localhost:5432/emergent'
  ),
  sessionSecret: required('SESSION_SECRET', 'dev-only-change-me-session-secret-32chars'),
  corsOrigin: required('CORS_ORIGIN', 'http://localhost:5173'),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
  // Required when frontend (Netlify) and API (Render) are on different domains
  cookieSameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none' | undefined) ||
    (isProduction ? 'none' : 'lax'),
  sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 8),
  adminUsername: process.env.ADMIN_USERNAME || 'Emergent',
  adminPassword: process.env.ADMIN_PASSWORD || 'Password1',
  trustProxy: process.env.TRUST_PROXY === 'true' || isProduction,
};
