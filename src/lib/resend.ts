import { Resend } from 'resend';

// Only initialize Resend if the API key is present.
// This prevents initialization errors on the client where the key is missing.
const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export function getResendClient() {
  if (!resend) {
    if (typeof window === 'undefined') {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    // On the client, we should never reach this if we use Server Actions
    return null;
  }
  return resend;
}
