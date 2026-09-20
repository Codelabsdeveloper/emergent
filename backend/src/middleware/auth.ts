import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    username?: string;
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session?.adminId) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }
  return next();
}
