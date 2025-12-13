import { Resend } from 'resend';

// Initialize Resend client
// In development, we allow undefined for local testing
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'PathMap <noreply@futuretree.ai>';
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Check if email sending is configured
 */
export function isEmailConfigured(): boolean {
  return !!resendApiKey;
}
