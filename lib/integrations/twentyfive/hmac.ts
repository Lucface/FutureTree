import { createHmac, timingSafeEqual } from 'crypto';

/**
 * HMAC Signature Validation for TwentyFive Webhooks
 *
 * Validates incoming webhook signatures to ensure authenticity.
 * Uses HMAC-SHA256 with timing-safe comparison.
 */

// Maximum time window for valid signatures (5 minutes)
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Generate HMAC signature for outbound requests
 */
export function generateSignature(
  payload: string,
  secret: string,
  timestamp: number = Date.now()
): { signature: string; timestamp: number } {
  const signatureBase = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signatureBase)
    .digest('hex');

  return {
    signature: `v1=${signature}`,
    timestamp,
  };
}

/**
 * Validate incoming webhook signature
 */
export function validateSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: number
): { valid: boolean; error?: string } {
  // Check timestamp freshness
  const now = Date.now();
  const diff = Math.abs(now - timestamp);

  if (diff > TIMESTAMP_TOLERANCE_MS) {
    return {
      valid: false,
      error: `Timestamp too old: ${Math.round(diff / 1000)}s difference (max ${TIMESTAMP_TOLERANCE_MS / 1000}s)`,
    };
  }

  // Extract signature value (format: "v1=xxxx")
  const signatureValue = signature.replace('v1=', '');

  // Generate expected signature
  const signatureBase = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(signatureBase)
    .digest('hex');

  // Timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signatureValue, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return {
        valid: false,
        error: 'Signature length mismatch',
      };
    }

    const isValid = timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Signature validation failed',
    };
  }
}

/**
 * Parse webhook headers
 */
export function parseWebhookHeaders(headers: Headers): {
  signature: string | null;
  timestamp: number | null;
  event: string | null;
} {
  return {
    signature: headers.get('X-TwentyFive-Signature'),
    timestamp: headers.get('X-TwentyFive-Timestamp')
      ? parseInt(headers.get('X-TwentyFive-Timestamp')!, 10)
      : null,
    event: headers.get('X-TwentyFive-Event'),
  };
}

/**
 * Create signed request headers for outbound API calls
 */
export function createSignedHeaders(
  payload: string,
  apiKey: string,
  webhookSecret: string
): Record<string, string> {
  const timestamp = Date.now();
  const { signature } = generateSignature(payload, webhookSecret, timestamp);

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'X-TwentyFive-Signature': signature,
    'X-TwentyFive-Timestamp': timestamp.toString(),
  };
}
