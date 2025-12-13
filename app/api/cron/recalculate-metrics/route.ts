import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCronRequest,
  cronUnauthorizedResponse,
  logCronExecution,
} from '@/lib/cron/verify';
import { recalculateAllPaths } from '@/lib/jobs/metric-recalculator';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 second timeout

// Cron job to recalculate path metrics
// Schedule: Every 6 hours (see vercel.json)
// Checks all active paths for new outcomes and recalculates
// their metrics when the threshold (5+ new outcomes) is reached.
export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return cronUnauthorizedResponse();
  }

  const startTime = Date.now();
  logCronExecution('recalculate-metrics', { status: 'started' });

  try {
    // Run recalculation for all paths that need it
    const results = await recalculateAllPaths('scheduled', 'cron');
    const duration = Date.now() - startTime;

    const summary = {
      success: true,
      pathsProcessed: results.length,
      recalculated: results.filter((r) => r.recalculated).length,
      skipped: results.filter((r) => !r.recalculated).length,
      duration,
      results: results.map((r) => ({
        pathId: r.pathId,
        pathName: r.pathName,
        recalculated: r.recalculated,
        outcomesProcessed: r.outcomesProcessed,
        newModelVersion: r.newModelVersion,
      })),
    };

    logCronExecution('recalculate-metrics', {
      status: 'completed',
      ...summary,
    });

    return NextResponse.json(summary);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logCronExecution('recalculate-metrics', {
      status: 'failed',
      error: errorMessage,
      duration,
    });

    console.error('[CRON] Metric recalculation failed:', error);

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
