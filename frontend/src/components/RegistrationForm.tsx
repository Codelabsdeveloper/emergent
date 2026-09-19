import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api, { getErrorMessage } from '../lib/api';
import { genderOptions, registrationFormSchema, type RegistrationFormValues } from '../lib/schemas';

export default function RegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
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
    setSuccessId(null);
    setCopied(false);

    try {
      const { data } = await api.post('/registrations', values);
      setSuccessId(data.data.registrationId);
      reset();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = async () => {
    if (!successId) return;
    await navigator.clipboard.writeText(successId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        {successId && (
          <div
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left"
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold text-emerald-800">Registration successful!</p>
            <p className="mt-1 text-sm text-emerald-700">Your unique registration ID:</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-white px-2 py-1 text-sm text-emerald-900 break-all">
                {successId}
              </code>
              <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={copyId}>
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>
          </div>
        )}

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
                placeholder="+14155552671"
                autoComplete="tel"
                {...register('phoneNumber')}
              />
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
