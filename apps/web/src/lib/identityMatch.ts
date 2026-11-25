import type { UseOneIDPayload } from './useOneIdService.ts';

const lastTenDigits = (value?: string | null): string =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(-10);

/**
 * Checks that the person who just verified with UseOneID is the same person
 * registered on the platform. A match on email OR phone number is accepted.
 * A missing identity from UseOneID is treated as a failed match.
 */
export function useOneIdMatchesRegisteredPerson(
  payload: UseOneIDPayload | null | undefined,
  expectedEmail?: string | null,
  expectedPhone?: string | null
): { matches: boolean; returnedEmail: string } {
  const returnedEmail = String(payload?.user?.email || '').trim().toLowerCase();
  const returnedPhone = lastTenDigits(payload?.user?.phone);
  const wantedEmail = String(expectedEmail || '').trim().toLowerCase();
  const wantedPhone = lastTenDigits(expectedPhone);

  const emailMatches = Boolean(returnedEmail && wantedEmail && returnedEmail === wantedEmail);
  const phoneMatches = Boolean(returnedPhone.length >= 10 && wantedPhone.length >= 10 && returnedPhone === wantedPhone);

  return { matches: emailMatches || phoneMatches, returnedEmail };
}
