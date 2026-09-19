import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../lib/api';
import { loginFormSchema, type LoginFormValues } from '../lib/schemas';

export default function AdminLoginPage() {
  const { authenticated, mustChangePassword, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  if (!loading && authenticated) {
    return (
      <Navigate
        to={mustChangePassword ? '/admin/change-password' : '/admin/dashboard'}
        replace
      />
    );
  }

  const onSubmit = async (values: LoginFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/admin/login', values);
      await refresh();
      navigate(data.data.mustChangePassword ? '/admin/change-password' : '/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),_transparent_45%),linear-gradient(#f4f7f8,#e8eef1)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Link to="/" className="mb-8 self-center">
          <Logo />
        </Link>
        <div className="card-surface p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-900">Admin Login</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage registrations.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="username" className="label-field">
                Username
              </label>
              <input id="username" className="input-field" autoComplete="username" {...register('username')} />
              {errors.username && <p className="error-text">{errors.username.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label-field">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/" className="font-semibold text-brand-800 hover:underline">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
