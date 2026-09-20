import { z } from 'zod';

export const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

/** Accept E.164 (+…) or common 10-digit local numbers (e.g. India). */
function isValidPhone(value: string): boolean {
  const trimmed = value.trim().replace(/[\s()-]/g, '');
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) return true;
  if (/^[6-9]\d{9}$/.test(trimmed)) return true;
  return false;
}

export const registrationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    required_error: 'Please select a gender',
  }),
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
    .refine(isValidPhone, 'Enter a valid phone number (e.g. +919876543210 or 9876543210)'),
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

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
