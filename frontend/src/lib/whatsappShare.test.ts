import { describe, expect, it } from 'vitest';
import { buildRegistrationWhatsAppMessage, buildWhatsAppShareUrl } from './whatsappShare';

describe('whatsappShare', () => {
  it('builds the expected confirmation message', () => {
    const message = buildRegistrationWhatsAppMessage('Jane Doe', '11111111-1111-4111-8111-111111111111');
    expect(message).toContain('Jane Doe');
    expect(message).toContain('11111111-1111-4111-8111-111111111111');
    expect(message).toContain('Emergent Technologies');
  });

  it('builds a wa.me URL with encoded text and no recipient', () => {
    const url = buildWhatsAppShareUrl('Jane Doe', '11111111-1111-4111-8111-111111111111');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(url).not.toMatch(/wa\.me\/\d/);
    const encoded = url.replace('https://wa.me/?text=', '');
    const decoded = decodeURIComponent(encoded);
    expect(decoded).toContain('Name: Jane Doe');
    expect(decoded).toContain('Registration ID: 11111111-1111-4111-8111-111111111111');
  });
});
