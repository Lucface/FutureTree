import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  recalculatePath,
  recalculateAllPaths,
  checkRecalculationNeeded,
  getRecalculationHistory,
} from '@/lib/jobs/metric-recalculator';

const recalculateSchema = z.object({
  pathId: z.string().uuid().optional(),
  force: z.boolean().optional().default(false),
});

/**
 * POST /api/pathmap/analytics/recalculate
 * Trigger metric recalculation for a path or all paths
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathId, force } = recalculateSchema.parse(body);

    if (pathId) {
      // Recalculate specific path
      if (!force) {
        const needsRecalc = await checkRecalculationNeeded(pathId);
        if (!needsRecalc) {
          return NextResponse.json({
            success: false,
            message: 'Path does not need recalculation yet',
            needsRecalculation: false,
          });
        }
      }

      const result = await recalculatePath(pathId, 'manual', 'api');

      return NextResponse.json({
        success: true,
        result,
      });
    } else {
      // Recalculate all paths that need it
      const results = await recalculateAllPaths();

      return NextResponse.json({
        success: true,
        pathsRecalculated: results.length,
        results,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Recalculation error:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate metrics' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pathmap/analytics/recalculate?pathId=xxx
 * Get recalculation status and history
 */
export async function GET(request: NextRequest) {
  try {
    const pathId = request.nextUrl.searchParams.get('pathId');

    if (!pathId) {
      return NextResponse.json(
        { error: 'pathId is required' },
        { status: 400 }
      );
    }

    const [needsRecalc, history] = await Promise.all([
      checkRecalculationNeeded(pathId),
      getRecalculationHistory(pathId),
    ]);

    return NextResponse.json({
      pathId,
      needsRecalculation: needsRecalc,
      history: history.map((h) => ({
        id: h.id,
        triggerType: h.triggerType,
        status: h.status,
        outcomesProcessed: h.outcomesProcessed,
        createdAt: h.createdAt,
        completedAt: h.completedAt,
        newModelVersion: h.newModelVersion,
      })),
    });
  } catch (error) {
    console.error('Error fetching recalculation status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
