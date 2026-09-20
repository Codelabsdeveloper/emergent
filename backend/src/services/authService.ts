import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { LoginInput } from '../validators/schemas';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function authenticateAdmin(input: LoginInput) {
  const admin = await prisma.admin.findUnique({ where: { username: input.username } });

  if (!admin) {
    logger.warn('Admin login failed: unknown username');
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new AppError(
      'Account temporarily locked due to too many failed attempts. Try again later.',
      429,
      'ACCOUNT_LOCKED'
    );
  }

  const valid = await bcrypt.compare(input.password, admin.passwordHash);
  if (!valid) {
    const failedLoginAttempts = admin.failedLoginAttempts + 1;
    const lockedUntil =
      failedLoginAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_DURATION_MS)
        : null;

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts,
        lockedUntil,
      },
    });

    logger.warn('Admin login failed: invalid password', { adminId: admin.id });
    throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  logger.info('Admin login successful', { adminId: admin.id });

  return {
    id: admin.id,
    username: admin.username,
  };
}

export async function getAdminById(id: string) {
  return prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });
}
