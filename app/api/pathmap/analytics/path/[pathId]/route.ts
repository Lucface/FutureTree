import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { strategicPaths } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { calculatePathVariance } from '@/lib/analytics/variance-calculator';
import { detectContradictionsForPath } from '@/lib/analytics/contradiction-detector';

interface RouteParams {
  params: Promise<{ pathId: string }>;
}

/**
 * GET /api/pathmap/analytics/path/[pathId]
 * Get variance and contradiction metrics for a specific path
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { pathId } = await params;

    // Verify path exists
    const path = await db.query.strategicPaths.findFirst({
      where: eq(strategicPaths.id, pathId),
      columns: {
        id: true,
        name: true,
        slug: true,
        successRate: true,
        caseCount: true,
        timelineP25: true,
        timelineP75: true,
        capitalP25: true,
        capitalP75: true,
        confidenceLevel: true,
        modelVersion: true,
        lastAggregated: true,
      },
    });

    if (!path) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    // Fetch variance and contradictions in parallel
    const [variance, contradictions] = await Promise.all([
      calculatePathVariance(pathId),
      detectContradictionsForPath(pathId),
    ]);

    return NextResponse.json({
      path,
      variance,
      contradictions,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching path analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
