import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);

/** Normalize to E.164; accepts +country… or local numbers with default region IN. */
export function normalizePhoneNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withPlus = trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/^0+/, '')}`;
  let phone = parsePhoneNumberFromString(withPlus);
  if (!phone?.isValid()) {
    phone = parsePhoneNumberFromString(trimmed, 'IN');
  }
  if (!phone?.isValid()) {
    phone = parsePhoneNumberFromString(trimmed, 'US');
  }
  return phone?.isValid() ? phone.format('E.164') : null;
}

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  gender: genderSchema,
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age must be at most 120'),
  phoneNumber: z
    .string()
    .trim()
    .min(5, 'Phone number is required')
    .max(30, 'Phone number is too long')
    .transform((value, ctx) => {
      const normalized = normalizePhoneNumber(value);
      if (!normalized) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid phone number (e.g. +919876543210 or 9876543210)',
        });
        return z.NEVER;
      }
      return normalized;
    }),
  address: z
    .string()
    .trim()
    .min(5, 'Address is required')
    .max(500, 'Address must be at most 500 characters'),
  occupation: z
    .string()
    .trim()
    .min(2, 'Occupation is required')
    .max(100, 'Occupation must be at most 100 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the privacy notice to register' }),
  }),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(128),
});

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine(
    (value) =>
      value === undefined ||
      /^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isNaN(Date.parse(value)),
    'Invalid date'
  );

export const registrationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional().default(''),
  gender: genderSchema.optional(),
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationsQuery = z.infer<typeof registrationsQuerySchema>;
