import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  scheduleSurveysForExploration,
  getPendingSurveysForUser,
} from '@/lib/jobs/survey-scheduler';

const scheduleSchema = z.object({
  explorationId: z.string().uuid(),
  recipientEmail: z.string().email().optional(),
});

/**
 * POST /api/pathmap/surveys/schedule
 * Schedule outcome surveys for an exploration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { explorationId, recipientEmail } = scheduleSchema.parse(body);

    await scheduleSurveysForExploration(explorationId, recipientEmail);

    return NextResponse.json({
      success: true,
      message: 'Surveys scheduled successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Survey scheduling error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule surveys' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pathmap/surveys/schedule?sessionId=xxx
 * Get pending surveys for a user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const surveys = await getPendingSurveysForUser(sessionId);

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error('Error fetching pending surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
