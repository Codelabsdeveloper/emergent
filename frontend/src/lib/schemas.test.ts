import { describe, expect, it } from 'vitest';
import { registrationFormSchema, loginFormSchema } from '../lib/schemas';

describe('registrationFormSchema', () => {
  const valid = {
    name: 'Jane Doe',
    gender: 'FEMALE' as const,
    age: 28,
    phoneNumber: '+14155552671',
    address: '123 Market Street, San Francisco, CA',
    occupation: 'Engineer',
    consent: true as const,
  };

  it('accepts a valid payload', () => {
    expect(registrationFormSchema.parse(valid).name).toBe('Jane Doe');
  });

  it('rejects short names', () => {
    const result = registrationFormSchema.safeParse({ ...valid, name: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone numbers', () => {
    const result = registrationFormSchema.safeParse({ ...valid, phoneNumber: 'abc' });
    expect(result.success).toBe(false);
  });

  it('accepts Indian local numbers', () => {
    const result = registrationFormSchema.safeParse({ ...valid, phoneNumber: '9876543210' });
    expect(result.success).toBe(true);
  });

  it('requires consent', () => {
    const result = registrationFormSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});

describe('loginFormSchema', () => {
  it('requires username and password', () => {
    expect(loginFormSchema.safeParse({ username: '', password: '' }).success).toBe(false);
    expect(loginFormSchema.safeParse({ username: 'Emergent', password: 'Password1' }).success).toBe(
      true
    );
  });
});
