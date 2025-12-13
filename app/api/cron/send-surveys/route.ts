import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCronRequest,
  cronUnauthorizedResponse,
  logCronExecution,
} from '@/lib/cron/verify';
import {
  getSurveysDueForSending,
  markSurveyAsSent,
} from '@/lib/jobs/survey-scheduler';
import { sendSurveyEmail } from '@/lib/email/send-survey';
import { isEmailConfigured } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 second timeout

// Cron job to send pending surveys
// Schedule: Every 2 hours (see vercel.json)
// Fetches all surveys that are due for sending and
// delivers them via email (if configured).
export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return cronUnauthorizedResponse();
  }

  const startTime = Date.now();
  logCronExecution('send-surveys', { status: 'started' });

  // Check if email is configured
  if (!isEmailConfigured()) {
    logCronExecution('send-surveys', {
      status: 'skipped',
      reason: 'Email not configured',
    });

    return NextResponse.json({
      success: true,
      warning: 'Email service not configured (RESEND_API_KEY missing)',
      surveysProcessed: 0,
      sent: 0,
      failed: 0,
    });
  }

  try {
    // Get all surveys that are due
    const dueSurveys = await getSurveysDueForSending();

    let sent = 0;
    let failed = 0;
    const errors: Array<{ surveyId: string; error: string }> = [];

    // Process each survey
    for (const survey of dueSurveys) {
      // Only send email if delivery method is email and we have an email
      if (survey.deliveryMethod === 'email' && survey.recipientEmail) {
        const result = await sendSurveyEmail(survey);

        if (result.success) {
          await markSurveyAsSent(survey.id, result.messageId);
          sent++;
        } else {
          failed++;
          errors.push({
            surveyId: survey.id,
            error: result.error || 'Unknown error',
          });
          console.error(
            `[CRON] Failed to send survey ${survey.id}:`,
            result.error
          );
        }
      }
    }

    const duration = Date.now() - startTime;

    const summary = {
      success: true,
      surveysProcessed: dueSurveys.length,
      sent,
      failed,
      duration,
      ...(errors.length > 0 && { errors }),
    };

    logCronExecution('send-surveys', {
      status: 'completed',
      ...summary,
    });

    return NextResponse.json(summary);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logCronExecution('send-surveys', {
      status: 'failed',
      error: errorMessage,
      duration,
    });

    console.error('[CRON] Survey delivery failed:', error);

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
