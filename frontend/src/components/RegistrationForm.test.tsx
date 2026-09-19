import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistrationForm from '../components/RegistrationForm';
import Header from '../components/Header';
import AdminLoginPage from '../pages/AdminLoginPage';
import { AuthProvider } from '../context/AuthContext';

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

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await user.click(screen.getByRole('button', { name: /register now/i }));
    expect(await screen.findAllByText(/required|at least|select/i)).not.toHaveLength(0);
  });

  it('submits successfully and shows registration id', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { registrationId: '11111111-1111-4111-8111-111111111111', message: 'Registration successful!' } },
    } as never);

    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/^name$/i), 'Jane Doe');
    await user.click(screen.getByLabelText(/^female$/i));
    await user.type(screen.getByLabelText(/^age$/i), '30');
    await user.type(screen.getByLabelText(/phone number/i), '+14155552671');
    await user.type(screen.getByLabelText(/^address$/i), '123 Market Street');
    await user.type(screen.getByLabelText(/^occupation$/i), 'Designer');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /register now/i }));

    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument();
    expect(screen.getByText('11111111-1111-4111-8111-111111111111')).toBeInTheDocument();
  });

  it('shows an error message when the API fails', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValue({
      isAxiosError: true,
      response: { data: { success: false, error: { message: 'Unable to save registration.' } } },
    });

    // Make axios.isAxiosError return true for our fake error via getErrorMessage path —
    // we rely on getErrorMessage fallback when not axios error shape from real axios.
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/^name$/i), 'Jane Doe');
    await user.click(screen.getByLabelText(/^male$/i));
    await user.type(screen.getByLabelText(/^age$/i), '30');
    await user.type(screen.getByLabelText(/phone number/i), '+14155552671');
    await user.type(screen.getByLabelText(/^address$/i), '123 Market Street');
    await user.type(screen.getByLabelText(/^occupation$/i), 'Designer');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /register now/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('Header navigation', () => {
  it('toggles the mobile menu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: /open menu/i });
    await user.click(toggle);
    expect(screen.getByRole('navigation', { name: /mobile/i })).toBeVisible();
  });
});

describe('AdminLoginPage', () => {
  it('renders login fields', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { authenticated: false } },
    } as never);

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
