import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCronRequest,
  cronUnauthorizedResponse,
  logCronExecution,
} from '@/lib/cron/verify';
import { expireOldSurveys } from '@/lib/jobs/survey-scheduler';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 second timeout

/**
 * Cron job to expire old surveys
 * Schedule: Daily at 2 AM (0 2 * * *)
 *
 * Marks surveys as expired if they are:
 * - 30+ days past their scheduled date
 * - Still in 'sent' status (never completed)
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return cronUnauthorizedResponse();
  }

  const startTime = Date.now();
  logCronExecution('expire-surveys', { status: 'started' });

  try {
    // Expire old surveys
    const expiredCount = await expireOldSurveys();
    const duration = Date.now() - startTime;

    const summary = {
      success: true,
      expiredCount,
      duration,
    };

    logCronExecution('expire-surveys', {
      status: 'completed',
      ...summary,
    });

    return NextResponse.json(summary);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logCronExecution('expire-surveys', {
      status: 'failed',
      error: errorMessage,
      duration,
    });

    console.error('[CRON] Survey expiration failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
      },
      { status: 500 }
    );
  }
}
