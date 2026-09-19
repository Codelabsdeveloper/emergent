import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session, { MemoryStore, Store } from 'express-session';
import helmet from 'helmet';
import { env } from './config/env';
import { prisma } from './config/database';
import { csrfOriginCheck } from './middleware/csrf';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import adminAuthRoutes from './routes/adminAuth';
import adminRoutes from './routes/admin';
import registrationRoutes from './routes/registrations';
import { logger } from './utils/logger';

type CreateAppOptions = {
  sessionStore?: Store;
};

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  if (env.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(csrfOriginCheck);

  // File/SQLite local setups use in-memory session store (single-process friendly).
  // For multi-instance production, swap to a shared store (Redis / Postgres).
  const store = options.sessionStore ?? new MemoryStore();

  app.use(
    session({
      name: 'emergent.sid',
      store,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: env.isProduction ? 'strict' : 'lax',
        maxAge: env.sessionMaxAgeMs,
      },
    })
  );

  const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many registration attempts. Please try again later.',
      },
    },
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Please try again later.',
      },
    },
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ success: true, data: { status: 'ok', database: 'up' } });
    } catch {
      res.status(503).json({
        success: false,
        error: { code: 'UNHEALTHY', message: 'Service unavailable' },
      });
    }
  });

  app.use('/api/registrations', registrationLimiter, registrationRoutes);
  app.use('/api/admin/login', loginLimiter);
  app.use('/api/admin', adminAuthRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export async function startServer() {
  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`, { env: env.nodeEnv });
  });
}
