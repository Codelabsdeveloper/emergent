import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboardPage from '../pages/AdminDashboardPage';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
    getErrorMessage: actual.getErrorMessage,
  };
});

import api from '../lib/api';

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/admin/me') {
        return {
          data: {
            success: true,
            data: { authenticated: true, username: 'Emergent' },
          },
        } as never;
      }
      throw new Error(`Unexpected GET ${url}`);
    });
  });

  it('shows a loading state then dashboard stats', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/admin/me') {
        return {
          data: {
            success: true,
            data: { authenticated: true, username: 'Emergent' },
          },
        } as never;
      }
      if (url === '/admin/dashboard/stats') {
        return { data: { success: true, data: { total: 3, today: 1, thisMonth: 2 } } } as never;
      }
      if (url === '/admin/registrations') {
        return {
          data: {
            success: true,
            data: {
              items: [],
              pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
            },
          },
        } as never;
      }
      throw new Error(`Unexpected GET ${url}`);
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading registrations/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
    expect(screen.getByText(/no registrations found/i)).toBeInTheDocument();
  });

  it('shows an error state when the API fails', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/admin/me') {
        return {
          data: {
            success: true,
            data: { authenticated: true, username: 'Emergent' },
          },
        } as never;
      }
      throw Object.assign(new Error('fail'), {
        isAxiosError: true,
        response: { data: { success: false, error: { message: 'Failed to load dashboard data.' } } },
      });
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load dashboard data/i);
  });
});
