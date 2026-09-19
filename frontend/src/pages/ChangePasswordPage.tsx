import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../lib/api';
import { changePasswordSchema, type ChangePasswordFormValues } from '../lib/schemas';

export default function ChangePasswordPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/admin/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      await refresh();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to change password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card-surface p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-900">Change Password</h1>
          <p className="mt-1 text-sm text-muted">
            For security, you must change the initial admin password before accessing the dashboard.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="currentPassword" className="label-field">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="input-field"
                autoComplete="current-password"
                {...register('currentPassword')}
              />
              {errors.currentPassword && <p className="error-text">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label htmlFor="newPassword" className="label-field">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="input-field"
                autoComplete="new-password"
                {...register('newPassword')}
              />
              {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label-field">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
