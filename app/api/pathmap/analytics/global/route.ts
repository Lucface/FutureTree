import { NextRequest, NextResponse } from 'next/server';
import { calculateGlobalVariance } from '@/lib/analytics/variance-calculator';
import { detectAllContradictions } from '@/lib/analytics/contradiction-detector';

/**
 * GET /api/pathmap/analytics/global
 * Get global variance and contradiction metrics across all paths
 */
export async function GET(_request: NextRequest) {
  try {
    // Fetch variance and contradictions in parallel
    const [varianceData, contradictionData] = await Promise.all([
      calculateGlobalVariance(),
      detectAllContradictions(),
    ]);

    return NextResponse.json({
      variance: varianceData,
      contradictions: contradictionData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching global analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
