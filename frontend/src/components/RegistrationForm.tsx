import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { getErrorMessage } from '../lib/api';
import { genderOptions, registrationFormSchema, type RegistrationFormValues } from '../lib/schemas';
import { buildWhatsAppShareUrl } from '../lib/whatsappShare';

type Confirmation = {
  name: string;
  registrationId: string;
};

export default function RegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      age: undefined as unknown as number,
      phoneNumber: '',
      address: '',
      occupation: '',
      consent: undefined as unknown as true,
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    setServerError(null);
    setCopied(false);

    try {
      const { data } = await api.post('/registrations', values);
      setConfirmation({
        name: data.data.name || values.name,
        registrationId: data.data.registrationId,
      });
      reset();
    } catch (error) {
      setConfirmation(null);
      setServerError(getErrorMessage(error, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = async () => {
    if (!confirmation) return;
    await navigator.clipboard.writeText(confirmation.registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const registerAnother = () => {
    setConfirmation(null);
    setServerError(null);
    setCopied(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (confirmation) {
    const whatsappUrl = buildWhatsAppShareUrl(confirmation.name, confirmation.registrationId);

    return (
      <section id="register" className="border-t border-slate-200 bg-white" aria-labelledby="confirm-heading">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div
            className="card-surface px-5 py-8 text-center sm:px-10 sm:py-12"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-600">
              Registration complete
            </p>
            <h2 id="confirm-heading" className="mt-2 font-display text-2xl font-bold text-brand-900 sm:text-3xl">
              Registration successful!
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Thank you, <span className="font-semibold text-ink">{confirmation.name}</span>. Your details
              have been saved.
            </p>

            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left">
              <p className="text-sm font-medium text-emerald-800">Unique registration ID</p>
              <code className="mt-2 block break-all rounded-md bg-white px-3 py-2 text-sm text-emerald-900">
                {confirmation.registrationId}
              </code>
              <button type="button" className="btn-secondary mt-3 !px-3 !py-2 text-xs" onClick={copyId}>
                {copied ? 'Copied' : 'Copy Registration ID'}
              </button>
            </div>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex justify-center"
                data-testid="whatsapp-share-link"
              >
                Share Confirmation on WhatsApp
              </a>
              <button type="button" className="btn-secondary" onClick={registerAnother}>
                Back to Home
              </button>
            </div>

            <p className="mt-4 text-xs text-muted">
              Sharing on WhatsApp is optional. You choose the recipient and press Send yourself — nothing is
              sent automatically.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="border-t border-slate-200 bg-white" aria-labelledby="register-heading">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h2 id="register-heading" className="font-display text-2xl font-bold text-brand-900 sm:text-3xl">
            Register with Us
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Submit your details to connect with Emergent Technologies. Fields marked required must be completed.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-surface space-y-5 p-5 sm:p-8"
          noValidate
        >
          <div>
            <label htmlFor="name" className="label-field">
              Name
            </label>
            <input id="name" className="input-field" autoComplete="name" {...register('name')} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <fieldset>
              <legend className="label-field">Gender</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50"
                  >
                    <input type="radio" value={option.value} {...register('gender')} />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {errors.gender && <p className="error-text">{errors.gender.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="age" className="label-field">
                Age
              </label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                className="input-field"
                {...register('age')}
              />
              {errors.age && <p className="error-text">{errors.age.message}</p>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="label-field">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                className="input-field"
                placeholder="+919876543210 or 9876543210"
                autoComplete="tel"
                {...register('phoneNumber')}
              />
              <p className="mt-1 text-xs text-muted">Include country code when possible (India: +91).</p>
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="label-field">
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              className="input-field resize-y"
              autoComplete="street-address"
              {...register('address')}
            />
            {errors.address && <p className="error-text">{errors.address.message}</p>}
          </div>

          <div>
            <label htmlFor="occupation" className="label-field">
              Occupation
            </label>
            <input
              id="occupation"
              className="input-field"
              autoComplete="organization-title"
              {...register('occupation')}
            />
            {errors.occupation && <p className="error-text">{errors.occupation.message}</p>}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" className="mt-1" {...register('consent')} />
              <span>
                I agree to the processing of my personal information for registration and follow-up
                communication. We protect your data and do not sell personal information. You may
                request access or deletion by contacting Emergent Technologies.
              </span>
            </label>
            {errors.consent && <p className="error-text">{errors.consent.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Register Now'}
          </button>
        </form>
      </div>
    </section>
  );
}
