import { db } from '@/lib/db';
import {
  strategicPaths,
  pathOutcomes,
  metricRecalculationJobs,
} from '@/database/schema';
import { eq, and, isNotNull, count, sql, desc } from 'drizzle-orm';
import { updatePathContradictionFlags } from '@/lib/analytics/contradiction-detector';

/**
 * Metric Recalculation Pipeline
 *
 * Recalculates path metrics based on outcome data.
 * Part of the Learning Loop in the 5-layer framework.
 */

export interface RecalculationResult {
  pathId: string;
  pathName: string;
  outcomesProcessed: number;
  previousValues: Record<string, number>;
  newValues: Record<string, number>;
  changePercent: Record<string, number>;
  newModelVersion: number;
}

// Threshold for triggering recalculation (minimum new outcomes)
const OUTCOME_THRESHOLD = 5;

/**
 * Check if a path needs recalculation
 */
export async function checkRecalculationNeeded(
  pathId: string
): Promise<boolean> {
  // Get the last recalculation job
  const lastJob = await db.query.metricRecalculationJobs.findFirst({
    where: and(
      eq(metricRecalculationJobs.pathId, pathId),
      eq(metricRecalculationJobs.status, 'completed')
    ),
    orderBy: [desc(metricRecalculationJobs.completedAt)],
  });

  // Count outcomes since last recalculation
  const outcomesQuery = db
    .select({ count: count() })
    .from(pathOutcomes)
    .where(
      and(
        eq(pathOutcomes.pathId, pathId),
        isNotNull(pathOutcomes.actualOutcome),
        lastJob?.completedAt
          ? sql`${pathOutcomes.createdAt} > ${lastJob.completedAt}`
          : sql`true`
      )
    );

  const result = await outcomesQuery;
  const newOutcomeCount = result[0]?.count || 0;

  return newOutcomeCount >= OUTCOME_THRESHOLD;
}

/**
 * Recalculate metrics for a specific path
 */
export async function recalculatePath(
  pathId: string,
  triggerType: 'threshold_reached' | 'scheduled' | 'manual' | 'outcome_received',
  triggeredBy: string = 'system'
): Promise<RecalculationResult> {
  // Get current path data
  const path = await db.query.strategicPaths.findFirst({
    where: eq(strategicPaths.id, pathId),
  });

  if (!path) {
    throw new Error(`Path not found: ${pathId}`);
  }

  // Create job record
  const [job] = await db
    .insert(metricRecalculationJobs)
    .values({
      pathId,
      scope: 'path',
      triggerType,
      triggeredBy,
      status: 'processing',
      startedAt: new Date(),
      previousModelVersion: path.modelVersion,
    })
    .returning();

  try {
    // Get all completed outcomes
    const outcomes = await db.query.pathOutcomes.findMany({
      where: and(
        eq(pathOutcomes.pathId, pathId),
        isNotNull(pathOutcomes.actualOutcome)
      ),
    });

    // Store previous values
    const previousValues = {
      successRate: path.successRate ? parseFloat(path.successRate) : 0,
      timelineP25: path.timelineP25 || 0,
      timelineP75: path.timelineP75 || 0,
      capitalP25: path.capitalP25 ? parseFloat(path.capitalP25) : 0,
      capitalP75: path.capitalP75 ? parseFloat(path.capitalP75) : 0,
      riskScore: path.riskScore ? parseFloat(path.riskScore) : 0,
    };

    // Calculate new metrics
    const newValues = calculateNewMetrics(outcomes);

    // Calculate change percentages
    const changePercent: Record<string, number> = {};
    for (const key of Object.keys(previousValues)) {
      const prev = previousValues[key as keyof typeof previousValues];
      const curr = newValues[key as keyof typeof newValues];
      if (prev !== 0) {
        changePercent[key] = ((curr - prev) / prev) * 100;
      } else {
        changePercent[key] = curr > 0 ? 100 : 0;
      }
    }

    // Update path with new metrics
    const newModelVersion = path.modelVersion + 1;

    await db
      .update(strategicPaths)
      .set({
        successRate: newValues.successRate.toFixed(2),
        timelineP25: newValues.timelineP25,
        timelineP75: newValues.timelineP75,
        capitalP25: newValues.capitalP25.toFixed(2),
        capitalP75: newValues.capitalP75.toFixed(2),
        riskScore: newValues.riskScore.toFixed(2),
        caseCount: outcomes.length,
        modelVersion: newModelVersion,
        lastAggregated: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(strategicPaths.id, pathId));

    // Update contradiction flags
    await updatePathContradictionFlags(pathId);

    // Update job as completed
    await db
      .update(metricRecalculationJobs)
      .set({
        status: 'completed',
        completedAt: new Date(),
        outcomesProcessed: outcomes.length,
        metricsUpdated: {
          previousValues,
          newValues,
          changePercent,
        },
        newModelVersion,
      })
      .where(eq(metricRecalculationJobs.id, job.id));

    return {
      pathId,
      pathName: path.name,
      outcomesProcessed: outcomes.length,
      previousValues,
      newValues,
      changePercent,
      newModelVersion,
    };
  } catch (error) {
    // Mark job as failed
    await db
      .update(metricRecalculationJobs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(metricRecalculationJobs.id, job.id));

    throw error;
  }
}

/**
 * Calculate new metrics from outcomes
 */
function calculateNewMetrics(
  outcomes: Array<{
    actualTimeline: number | null;
    actualCost: string | null;
    actualOutcome: string | null;
  }>
): {
  successRate: number;
  timelineP25: number;
  timelineP75: number;
  capitalP25: number;
  capitalP75: number;
  riskScore: number;
} {
  if (outcomes.length === 0) {
    return {
      successRate: 0,
      timelineP25: 0,
      timelineP75: 0,
      capitalP25: 0,
      capitalP75: 0,
      riskScore: 0.5,
    };
  }

  // Calculate success rate
  const successCount = outcomes.filter(
    (o) => o.actualOutcome === 'success' || o.actualOutcome === 'partial'
  ).length;
  const successRate = (successCount / outcomes.length) * 100;

  // Calculate timeline percentiles
  const timelines = outcomes
    .filter((o) => o.actualTimeline)
    .map((o) => o.actualTimeline!)
    .sort((a, b) => a - b);

  const timelineP25 =
    timelines.length > 0
      ? timelines[Math.floor(timelines.length * 0.25)] || timelines[0]
      : 0;
  const timelineP75 =
    timelines.length > 0
      ? timelines[Math.floor(timelines.length * 0.75)] ||
        timelines[timelines.length - 1]
      : 0;

  // Calculate capital percentiles
  const capitals = outcomes
    .filter((o) => o.actualCost)
    .map((o) => parseFloat(o.actualCost!))
    .sort((a, b) => a - b);

  const capitalP25 =
    capitals.length > 0
      ? capitals[Math.floor(capitals.length * 0.25)] || capitals[0]
      : 0;
  const capitalP75 =
    capitals.length > 0
      ? capitals[Math.floor(capitals.length * 0.75)] ||
        capitals[capitals.length - 1]
      : 0;

  // Calculate risk score (based on failure/abandonment rate)
  const failureCount = outcomes.filter(
    (o) =>
      o.actualOutcome === 'failure' ||
      o.actualOutcome === 'abandoned' ||
      o.actualOutcome === 'pivoted'
  ).length;
  const riskScore = Math.min(1, failureCount / outcomes.length);

  return {
    successRate,
    timelineP25,
    timelineP75,
    capitalP25,
    capitalP75,
    riskScore,
  };
}

/**
 * Extended result type for batch recalculation
 */
export interface BatchRecalculationResult extends RecalculationResult {
  recalculated: boolean;
}

/**
 * Check and recalculate all paths that need updating
 * @param triggerType - What triggered this recalculation
 * @param triggeredBy - Who/what initiated the recalculation
 */
export async function recalculateAllPaths(
  triggerType: 'threshold_reached' | 'scheduled' | 'manual' | 'outcome_received' = 'scheduled',
  triggeredBy: string = 'system'
): Promise<BatchRecalculationResult[]> {
  const paths = await db.query.strategicPaths.findMany({
    where: eq(strategicPaths.isActive, true),
    columns: { id: true, name: true },
  });

  const results: BatchRecalculationResult[] = [];

  for (const path of paths) {
    const needsRecalc = await checkRecalculationNeeded(path.id);

    if (needsRecalc) {
      try {
        const result = await recalculatePath(path.id, triggerType, triggeredBy);
        results.push({ ...result, recalculated: true });
      } catch (error) {
        console.error(`Failed to recalculate path ${path.id}:`, error);
        // Add a failed result to track the error
        results.push({
          pathId: path.id,
          pathName: path.name,
          outcomesProcessed: 0,
          previousValues: {},
          newValues: {},
          changePercent: {},
          newModelVersion: 0,
          recalculated: false,
        });
      }
    } else {
      // Path didn't need recalculation
      results.push({
        pathId: path.id,
        pathName: path.name,
        outcomesProcessed: 0,
        previousValues: {},
        newValues: {},
        changePercent: {},
        newModelVersion: 0,
        recalculated: false,
      });
    }
  }

  return results;
}

/**
 * Get recalculation history for a path
 */
export async function getRecalculationHistory(pathId: string) {
  return db.query.metricRecalculationJobs.findMany({
    where: eq(metricRecalculationJobs.pathId, pathId),
    orderBy: [desc(metricRecalculationJobs.createdAt)],
    limit: 10,
  });
}
