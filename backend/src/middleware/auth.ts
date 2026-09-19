import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    username?: string;
    mustChangePassword?: boolean;
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session?.adminId) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }
  return next();
}

export function requirePasswordChanged(req: Request, _res: Response, next: NextFunction) {
  if (req.session?.mustChangePassword) {
    return next(
      new AppError(
        'Password change required before accessing the dashboard',
        403,
        'PASSWORD_CHANGE_REQUIRED'
      )
    );
  }
  return next();
}
