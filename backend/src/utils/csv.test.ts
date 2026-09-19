import { describe, expect, it } from 'vitest';
import { escapeCsvCell } from './csv';
import { registrationSchema } from '../validators/schemas';

describe('escapeCsvCell', () => {
  it('wraps values in quotes and escapes quotes', () => {
    expect(escapeCsvCell('hello "world"')).toBe('"hello ""world"""');
  });

  it('neutralizes formula injection', () => {
    expect(escapeCsvCell('=cmd()')).toBe('"\'=cmd()"');
    expect(escapeCsvCell('+123')).toBe('"\'+123"');
    expect(escapeCsvCell('-1+1')).toBe('"\'-1+1"');
    expect(escapeCsvCell('@sum')).toBe('"\'@sum"');
  });
});

describe('registrationSchema', () => {
  const valid = {
    name: 'Alex Rivera',
    gender: 'MALE',
    age: 35,
    phoneNumber: '+14155552671',
    address: '45 Innovation Way',
    occupation: 'Product Manager',
    consent: true,
  };

  it('accepts valid registration payloads', () => {
    expect(registrationSchema.parse(valid).name).toBe('Alex Rivera');
  });

  it('rejects invalid age and phone', () => {
    expect(registrationSchema.safeParse({ ...valid, age: 0 }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, phoneNumber: 'abc' }).success).toBe(false);
  });
});
