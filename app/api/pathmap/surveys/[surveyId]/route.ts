import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSurveyById,
  submitSurveyResponse,
  skipSurvey,
} from '@/lib/jobs/survey-scheduler';

interface RouteParams {
  params: Promise<{ surveyId: string }>;
}

/**
 * GET /api/pathmap/surveys/[surveyId]
 * Get survey details for display
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { surveyId } = await params;

    const survey = await getSurveyById(surveyId);

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    );
  }
}

const submitSchema = z.object({
  responses: z.object({
    hasStarted: z.boolean().optional(),
    progressPercent: z.number().min(0).max(100).optional(),
    actualSpend: z.number().min(0).optional(),
    outcome: z
      .enum(['success', 'partial', 'failure', 'pivoted', 'abandoned'])
      .optional(),
    lessons: z.string().optional(),
    wouldRecommend: z.number().min(1).max(10).optional(),
    additionalNotes: z.string().optional(),
  }),
});

/**
 * POST /api/pathmap/surveys/[surveyId]
 * Submit survey responses
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { surveyId } = await params;
    const body = await request.json();
    const { responses } = submitSchema.parse(body);

    const survey = await getSurveyById(surveyId);
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    if (survey.status === 'completed') {
      return NextResponse.json(
        { error: 'Survey already completed' },
        { status: 400 }
      );
    }

    await submitSurveyResponse(surveyId, responses);

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Survey submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pathmap/surveys/[surveyId]
 * Skip/opt-out of a survey
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { surveyId } = await params;

    const survey = await getSurveyById(surveyId);
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    await skipSurvey(surveyId);

    return NextResponse.json({
      success: true,
      message: 'Survey skipped',
    });
  } catch (error) {
    console.error('Error skipping survey:', error);
    return NextResponse.json(
      { error: 'Failed to skip survey' },
      { status: 500 }
    );
  }
}
