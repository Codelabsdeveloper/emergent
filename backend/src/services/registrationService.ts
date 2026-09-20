import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { RegistrationInput, RegistrationsQuery } from '../validators/schemas';
import { escapeCsvCell } from '../utils/csv';

export async function createRegistration(input: RegistrationInput) {
  try {
    const { consent: _consent, ...data } = input;
    const registration = await prisma.registration.create({
      data: {
        name: data.name,
        gender: data.gender,
        age: data.age,
        phoneNumber: data.phoneNumber,
        address: data.address,
        occupation: data.occupation,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    logger.info('Registration created', { registrationId: registration.id });
    return registration;
  } catch (error) {
    logger.error('Failed to create registration', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Unable to save registration. Please try again later.', 500, 'DB_ERROR');
  }
}

function buildWhere(query: RegistrationsQuery): Prisma.RegistrationWhereInput {
  const where: Prisma.RegistrationWhereInput = {};

  if (query.search) {
    const or: Prisma.RegistrationWhereInput[] = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { phoneNumber: { contains: query.search, mode: 'insensitive' } },
    ];
    if (isUuid(query.search)) {
      or.push({ id: query.search });
    }
    where.OR = or;
  }

  if (query.gender) {
    where.gender = query.gender;
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) {
      where.createdAt.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      const end = new Date(query.dateTo);
      if (/^\d{4}-\d{2}-\d{2}$/.test(query.dateTo)) {
        end.setHours(23, 59, 59, 999);
      }
      where.createdAt.lte = end;
    }
  }

  return where;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function listRegistrations(query: RegistrationsQuery) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [total, items] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { [query.sortBy]: query.sortOrder },
    }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getRegistrationById(id: string) {
  if (!isUuid(id)) {
    throw new AppError('Invalid registration ID', 400, 'INVALID_ID');
  }

  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    throw new AppError('Registration not found', 404, 'NOT_FOUND');
  }
  return registration;
}

export async function getDashboardStats() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, today, thisMonth] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.registration.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  return { total, today, thisMonth };
}

export async function exportRegistrationsCsv(query: RegistrationsQuery) {
  const where = buildWhere(query);
  const items = await prisma.registration.findMany({
    where,
    orderBy: { [query.sortBy]: query.sortOrder },
    take: 10000,
  });

  const headers = [
    'Registration ID',
    'Name',
    'Gender',
    'Age',
    'Phone Number',
    'Address',
    'Occupation',
    'Registration Date',
  ];

  const rows = items.map((item) =>
    [
      item.id,
      item.name,
      item.gender,
      String(item.age),
      item.phoneNumber,
      item.address,
      item.occupation,
      item.createdAt.toISOString(),
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return `\uFEFF${headers.join(',')}\n${rows.join('\n')}`;
}
