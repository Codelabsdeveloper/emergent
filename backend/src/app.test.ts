import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('./config/database', () => {
  return {
    prisma: {
      registration: {
        create: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      admin: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    },
  };
});

process.env.NODE_ENV = 'test';

import bcrypt from 'bcryptjs';
import { createApp } from './app';
import { prisma } from './config/database';

const app = createApp();

describe('API integration (mocked database)', () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  it('creates a registration and returns a UUID', async () => {
    const id = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    vi.mocked(prisma.registration.create).mockResolvedValue({
      id,
      createdAt: new Date(),
    } as never);

    const res = await request(app).post('/api/registrations').send({
      name: 'Alex Rivera',
      gender: 'MALE',
      age: 35,
      phoneNumber: '+14155552671',
      address: '45 Innovation Way',
      occupation: 'Product Manager',
      consent: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.registrationId).toBe(id);
    expect(res.body.data.message).toBe('Registration successful!');
  });

  it('rejects invalid registration payloads', async () => {
    const res = await request(app).post('/api/registrations').send({
      name: 'A',
      gender: 'MALE',
      age: 200,
      phoneNumber: 'bad',
      address: '',
      occupation: '',
      consent: false,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns a safe error when the database fails', async () => {
    vi.mocked(prisma.registration.create).mockRejectedValue(new Error('db down'));
    const res = await request(app).post('/api/registrations').send({
      name: 'Alex Rivera',
      gender: 'MALE',
      age: 35,
      phoneNumber: '+14155552671',
      address: '45 Innovation Way',
      occupation: 'Product Manager',
      consent: true,
    });
    expect(res.status).toBe(500);
    expect(res.body.error.message).not.toMatch(/db down/i);
  });

  it('rejects invalid admin credentials', async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue(null);
    const res = await request(app).post('/api/admin/login').send({
      username: 'nope',
      password: 'wrong',
    });
    expect(res.status).toBe(401);
  });

  it('logs in with valid admin credentials', async () => {
    const passwordHash = await bcrypt.hash('Password1', 10);
    vi.mocked(prisma.admin.findUnique).mockResolvedValue({
      id: 'admin-1',
      username: 'Emergent',
      passwordHash,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    } as never);
    vi.mocked(prisma.admin.update).mockResolvedValue({} as never);

    const res = await request(app).post('/api/admin/login').send({
      username: 'Emergent',
      password: 'Password1',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('Emergent');
  });

  it('blocks unauthorized access to protected routes', async () => {
    const res = await request(app).get('/api/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });

  it('exposes a health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});
