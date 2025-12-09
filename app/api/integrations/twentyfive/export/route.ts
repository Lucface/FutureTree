import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { pathExplorations } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { exportRoadmap, getSyncStatus } from '@/lib/integrations/twentyfive';
import { scheduleSurveysForExploration } from '@/lib/jobs/survey-scheduler';

const exportSchema = z.object({
  pathId: z.string().uuid(),
  contextId: z.string().uuid(),
  explorationId: z.string().uuid().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  scheduleSurveys: z.boolean().optional().default(true),
});

/**
 * POST /api/integrations/twentyfive/export
 * Export a roadmap to TwentyFive CRM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pathId,
      contextId,
      explorationId,
      clientName,
      clientEmail,
      scheduleSurveys,
    } = exportSchema.parse(body);

    // Export to TwentyFive
    const result = await exportRoadmap(pathId, contextId, {
      clientName,
      clientEmail,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Export failed',
          details: result.error,
        },
        { status: 400 }
      );
    }

    // Update exploration record if provided
    if (explorationId) {
      await db
        .update(pathExplorations)
        .set({
          exportedAt: new Date(),
          exportType: 'crm',
          converted: true,
        })
        .where(eq(pathExplorations.id, explorationId));

      // Schedule outcome surveys if requested
      if (scheduleSurveys) {
        await scheduleSurveysForExploration(explorationId, clientEmail);
      }
    }

    return NextResponse.json({
      success: true,
      projectId: result.data?.projectId,
      projectUrl: result.data?.projectUrl,
      surveysScheduled: scheduleSurveys,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('TwentyFive export error:', error);
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/twentyfive/export?contextId=xxx
 * Get export/sync status
 */
export async function GET(request: NextRequest) {
  try {
    const contextId = request.nextUrl.searchParams.get('contextId');

    if (!contextId) {
      return NextResponse.json(
        { error: 'contextId is required' },
        { status: 400 }
      );
    }

    const status = await getSyncStatus(contextId);

    return NextResponse.json({
      status,
    });
  } catch (error) {
    console.error('TwentyFive status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
