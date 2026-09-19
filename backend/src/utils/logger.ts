import winston from 'winston';
import { env } from '../config/env';

const redactKeys = [
  'password',
  'passwordHash',
  'phoneNumber',
  'address',
  'phone',
  'session',
  'cookie',
  'authorization',
];

function sanitize(meta: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (redactKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      cleaned[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitize(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const safeMeta = sanitize(meta as Record<string, unknown>);
      const metaStr = Object.keys(safeMeta).length ? ` ${JSON.stringify(safeMeta)}` : '';
      return `${timestamp} [${level}] ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
