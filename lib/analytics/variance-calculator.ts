import { db } from '@/lib/db';
import {
  pathOutcomes,
  strategicPaths,
  outcomeSurveys,
} from '@/database/schema';
import { eq, and, isNotNull, count } from 'drizzle-orm';

/**
 * Variance Analysis for PathMap Learning Loop
 *
 * Calculates the difference between predicted and actual outcomes
 * to improve future predictions.
 */

export interface VarianceMetrics {
  // Core metrics
  timelineVariancePercent: number;
  costVariancePercent: number;
  successRateActual: number;
  successRatePredicted: number;

  // Sample size
  totalOutcomes: number;
  completedSurveys: number;

  // Breakdown by outcome type
  outcomeDistribution: {
    success: number;
    partial: number;
    failure: number;
    pivoted: number;
    abandoned: number;
  };

  // Failure attribution
  failureAttribution: {
    reality: number; // Bad input data
    understanding: number; // Bad analysis
    decision: number; // Bad recommendation
    action: number; // Bad execution
  };

  // Trends
  varianceTrend: 'improving' | 'stable' | 'worsening';
}

export interface PathVarianceData {
  pathId: string;
  pathName: string;
  metrics: VarianceMetrics;
  lastUpdated: Date;
}

/**
 * Calculate variance metrics for a specific path
 */
export async function calculatePathVariance(
  pathId: string
): Promise<VarianceMetrics | null> {
  // Get all completed outcomes for this path
  const outcomes = await db.query.pathOutcomes.findMany({
    where: and(
      eq(pathOutcomes.pathId, pathId),
      isNotNull(pathOutcomes.actualOutcome)
    ),
  });

  if (outcomes.length === 0) {
    return null;
  }

  // Calculate timeline variance
  const timelineData = outcomes.filter(
    (o) => o.predictedTimeline && o.actualTimeline
  );
  const timelineVariance =
    timelineData.length > 0
      ? timelineData.reduce((sum, o) => {
          const variance =
            ((o.actualTimeline! - o.predictedTimeline!) / o.predictedTimeline!) *
            100;
          return sum + variance;
        }, 0) / timelineData.length
      : 0;

  // Calculate cost variance
  const costData = outcomes.filter(
    (o) => o.predictedCost && o.actualCost
  );
  const costVariance =
    costData.length > 0
      ? costData.reduce((sum, o) => {
          const predicted = parseFloat(o.predictedCost!);
          const actual = parseFloat(o.actualCost!);
          const variance = ((actual - predicted) / predicted) * 100;
          return sum + variance;
        }, 0) / costData.length
      : 0;

  // Calculate success rates
  const successOutcomes = outcomes.filter(
    (o) => o.actualOutcome === 'success' || o.actualOutcome === 'partial'
  );
  const successRateActual = (successOutcomes.length / outcomes.length) * 100;

  const predictedRates = outcomes.filter((o) => o.predictedSuccessRate);
  const successRatePredicted =
    predictedRates.length > 0
      ? predictedRates.reduce(
          (sum, o) => sum + parseFloat(o.predictedSuccessRate!),
          0
        ) / predictedRates.length
      : 0;

  // Outcome distribution
  const outcomeDistribution = {
    success: outcomes.filter((o) => o.actualOutcome === 'success').length,
    partial: outcomes.filter((o) => o.actualOutcome === 'partial').length,
    failure: outcomes.filter((o) => o.actualOutcome === 'failure').length,
    pivoted: outcomes.filter((o) => o.actualOutcome === 'pivoted').length,
    abandoned: outcomes.filter((o) => o.actualOutcome === 'abandoned').length,
  };

  // Failure attribution
  const failedOutcomes = outcomes.filter(
    (o) =>
      o.actualOutcome === 'failure' ||
      o.actualOutcome === 'pivoted' ||
      o.actualOutcome === 'abandoned'
  );
  const failureAttribution = {
    reality: failedOutcomes.filter((o) => o.failureLayer === 'reality').length,
    understanding: failedOutcomes.filter(
      (o) => o.failureLayer === 'understanding'
    ).length,
    decision: failedOutcomes.filter((o) => o.failureLayer === 'decision')
      .length,
    action: failedOutcomes.filter((o) => o.failureLayer === 'action').length,
  };

  // Determine trend (would need historical data for real implementation)
  const varianceTrend: 'improving' | 'stable' | 'worsening' = 'stable';

  // Count completed surveys
  const completedSurveys = await db
    .select({ count: count() })
    .from(outcomeSurveys)
    .where(eq(outcomeSurveys.status, 'completed'));

  return {
    timelineVariancePercent: Math.round(timelineVariance * 10) / 10,
    costVariancePercent: Math.round(costVariance * 10) / 10,
    successRateActual: Math.round(successRateActual * 10) / 10,
    successRatePredicted: Math.round(successRatePredicted * 10) / 10,
    totalOutcomes: outcomes.length,
    completedSurveys: completedSurveys[0]?.count || 0,
    outcomeDistribution,
    failureAttribution,
    varianceTrend,
  };
}

/**
 * Calculate global variance metrics across all paths
 */
export async function calculateGlobalVariance(): Promise<{
  overall: VarianceMetrics;
  byPath: PathVarianceData[];
}> {
  // Get all paths with outcomes
  const paths = await db.query.strategicPaths.findMany({
    where: eq(strategicPaths.isActive, true),
    columns: {
      id: true,
      name: true,
    },
  });

  const pathVariances: PathVarianceData[] = [];
  let aggregatedOutcomes: Awaited<
    ReturnType<typeof calculatePathVariance>
  > | null = null;

  for (const path of paths) {
    const metrics = await calculatePathVariance(path.id);
    if (metrics) {
      pathVariances.push({
        pathId: path.id,
        pathName: path.name,
        metrics,
        lastUpdated: new Date(),
      });

      // Aggregate for overall metrics
      if (!aggregatedOutcomes) {
        aggregatedOutcomes = { ...metrics };
      } else {
        // Weight by number of outcomes
        const totalPrev = aggregatedOutcomes.totalOutcomes;
        const totalNew = metrics.totalOutcomes;
        const totalCombined = totalPrev + totalNew;

        aggregatedOutcomes.timelineVariancePercent =
          (aggregatedOutcomes.timelineVariancePercent * totalPrev +
            metrics.timelineVariancePercent * totalNew) /
          totalCombined;
        aggregatedOutcomes.costVariancePercent =
          (aggregatedOutcomes.costVariancePercent * totalPrev +
            metrics.costVariancePercent * totalNew) /
          totalCombined;
        aggregatedOutcomes.successRateActual =
          (aggregatedOutcomes.successRateActual * totalPrev +
            metrics.successRateActual * totalNew) /
          totalCombined;
        aggregatedOutcomes.successRatePredicted =
          (aggregatedOutcomes.successRatePredicted * totalPrev +
            metrics.successRatePredicted * totalNew) /
          totalCombined;

        aggregatedOutcomes.totalOutcomes = totalCombined;
        aggregatedOutcomes.completedSurveys += metrics.completedSurveys;

        // Sum distributions
        for (const key of Object.keys(
          aggregatedOutcomes.outcomeDistribution
        ) as (keyof typeof metrics.outcomeDistribution)[]) {
          aggregatedOutcomes.outcomeDistribution[key] +=
            metrics.outcomeDistribution[key];
        }

        for (const key of Object.keys(
          aggregatedOutcomes.failureAttribution
        ) as (keyof typeof metrics.failureAttribution)[]) {
          aggregatedOutcomes.failureAttribution[key] +=
            metrics.failureAttribution[key];
        }
      }
    }
  }

  // Default empty metrics if no data
  const defaultMetrics: VarianceMetrics = {
    timelineVariancePercent: 0,
    costVariancePercent: 0,
    successRateActual: 0,
    successRatePredicted: 0,
    totalOutcomes: 0,
    completedSurveys: 0,
    outcomeDistribution: {
      success: 0,
      partial: 0,
      failure: 0,
      pivoted: 0,
      abandoned: 0,
    },
    failureAttribution: {
      reality: 0,
      understanding: 0,
      decision: 0,
      action: 0,
    },
    varianceTrend: 'stable',
  };

  return {
    overall: aggregatedOutcomes || defaultMetrics,
    byPath: pathVariances,
  };
}

/**
 * Calculate variance statistics for display
 */
export function formatVarianceForDisplay(variance: number): {
  value: string;
  status: 'good' | 'warning' | 'bad';
  direction: 'over' | 'under' | 'on-target';
} {
  const absVariance = Math.abs(variance);

  let status: 'good' | 'warning' | 'bad';
  if (absVariance <= 10) {
    status = 'good';
  } else if (absVariance <= 25) {
    status = 'warning';
  } else {
    status = 'bad';
  }

  let direction: 'over' | 'under' | 'on-target';
  if (variance > 5) {
    direction = 'over';
  } else if (variance < -5) {
    direction = 'under';
  } else {
    direction = 'on-target';
  }

  return {
    value: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`,
    status,
    direction,
  };
}
