import { NextRequest } from 'next/server';

/**
 * Verify that a cron request is authorized
 *
 * In development: Allow all requests
 * In production: Verify the Authorization header matches CRON_SECRET
 */
export function verifyCronRequest(request: NextRequest): boolean {
  // In development, allow all cron requests
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, verify the secret
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, deny all requests
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured - denying request');
    return false;
  }

  // Vercel sends the secret in the Authorization header
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${cronSecret}`;

  if (authHeader !== expectedToken) {
    console.warn('[CRON] Invalid authorization header');
    return false;
  }

  return true;
}

/**
 * Standard unauthorized response for cron endpoints
 */
export function cronUnauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Log cron job execution details
 */
export function logCronExecution(
  jobName: string,
  details: Record<string, unknown>
): void {
  console.log(
    `[CRON:${jobName}]`,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...details,
    })
  );
}
