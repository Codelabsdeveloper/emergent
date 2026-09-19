import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from './errorHandler';

/**
 * Basic CSRF mitigation for cookie-authenticated mutating requests:
 * require Origin/Referer to match the configured frontend origin.
 */
export function csrfOriginCheck(req: Request, _res: Response, next: NextFunction) {
  // In tests, skip Origin checks so Supertest requests are not blocked.
  if (env.nodeEnv === 'test') {
    return next();
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  if (!req.path.startsWith('/api/admin')) {
    return next();
  }

  if (req.path === '/api/admin/login' || req.path.endsWith('/login')) {
    return next();
  }

  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowed = env.corsOrigin.replace(/\/$/, '');

  const originOk = origin ? origin.replace(/\/$/, '') === allowed : false;
  const refererOk = referer ? referer.startsWith(allowed) : false;

  if (!originOk && !refererOk) {
    return next(new AppError('Invalid request origin', 403, 'CSRF_REJECTED'));
  }

  return next();
}
