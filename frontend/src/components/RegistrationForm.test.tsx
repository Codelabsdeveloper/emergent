import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistrationForm from '../components/RegistrationForm';
import Header from '../components/Header';
import AdminLoginPage from '../pages/AdminLoginPage';
import { AuthProvider } from '../context/AuthContext';
import { buildWhatsAppShareUrl } from '../lib/whatsappShare';

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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name$/i), 'Jane Doe');
  await user.click(screen.getByLabelText(/^female$/i));
  await user.type(screen.getByLabelText(/^age$/i), '30');
  await user.type(screen.getByLabelText(/phone number/i), '+14155552671');
  await user.type(screen.getByLabelText(/^address$/i), '123 Market Street');
  await user.type(screen.getByLabelText(/^occupation$/i), 'Designer');
  await user.click(screen.getByRole('checkbox'));
}

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

  it('shows confirmation screen with name, id, and WhatsApp share link after success', async () => {
    const user = userEvent.setup();
    const registrationId = '11111111-1111-4111-8111-111111111111';
    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: {
          registrationId,
          name: 'Jane Doe',
          message: 'Registration successful!',
        },
      },
    } as never);

    render(<RegistrationForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /register now/i }));

    expect(await screen.findByRole('heading', { name: /registration successful/i })).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(registrationId)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /register now/i })).not.toBeInTheDocument();

    const share = screen.getByTestId('whatsapp-share-link');
    expect(share).toHaveAttribute('href', buildWhatsAppShareUrl('Jane Doe', registrationId));
    expect(share).toHaveAttribute('target', '_blank');
  });

  it('prevents duplicate submissions while a request is in progress', async () => {
    const user = userEvent.setup();
    let resolvePost: (value: unknown) => void = () => undefined;
    vi.mocked(api.post).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }) as never
    );

    render(<RegistrationForm />);
    await fillValidForm(user);

    const submit = screen.getByRole('button', { name: /register now/i });
    await user.click(submit);
    expect(submit).toBeDisabled();
    expect(api.post).toHaveBeenCalledTimes(1);

    resolvePost({
      data: {
        success: true,
        data: {
          registrationId: '11111111-1111-4111-8111-111111111111',
          name: 'Jane Doe',
          message: 'Registration successful!',
        },
      },
    });

    expect(await screen.findByRole('heading', { name: /registration successful/i })).toBeInTheDocument();
  });

  it('shows an error and no success screen when the API fails', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValue(new Error('network'));

    render(<RegistrationForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /register now/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /registration successful/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('whatsapp-share-link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register now/i })).toBeInTheDocument();
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
