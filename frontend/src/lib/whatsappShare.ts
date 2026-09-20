export function buildRegistrationWhatsAppMessage(name: string, registrationId: string): string {
  return [
    'Hello! I have successfully registered for Emergent Technologies.',
    '',
    `Name: ${name}`,
    `Registration ID: ${registrationId}`,
    '',
    'Thank you!',
  ].join('\n');
}

/** Official click-to-chat URL with no recipient — user chooses who to send to. */
export function buildWhatsAppShareUrl(name: string, registrationId: string): string {
  const text = buildRegistrationWhatsAppMessage(name, registrationId);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
