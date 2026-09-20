import connectPgSimple from 'connect-pg-simple';
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

const PgSession = connectPgSimple(session);

type CreateAppOptions = {
  sessionStore?: Store;
};

function createSessionStore(override?: Store): Store {
  if (override) return override;
  if (env.nodeEnv === 'test') return new MemoryStore();

  if (!env.databaseUrl.startsWith('postgres')) {
    throw new Error(
      'PostgreSQL session store requires a postgres DATABASE_URL. MemoryStore is not used outside tests.'
    );
  }

  // Persist sessions in PostgreSQL for production / multi-instance safety
  return new PgSession({
    conString: env.databaseUrl,
    tableName: 'session',
    createTableIfMissing: true,
  });
}

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

  app.use(
    session({
      name: 'emergent.sid',
      store: createSessionStore(options.sessionStore),
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: env.cookieSameSite,
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
  app.listen(env.port, '0.0.0.0', () => {
    logger.info(`Server listening on port ${env.port}`, {
      env: env.nodeEnv,
      databaseProvider: env.databaseUrl.startsWith('postgres') ? 'postgresql' : 'other',
      sessionStore: env.nodeEnv === 'test' ? 'memory' : 'postgresql',
    });
  });
}
