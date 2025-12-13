import { db } from '@/lib/db';
import {
  pathOutcomes,
  strategicPaths,
} from '@/database/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

/**
 * Contradiction Detector for PathMap Learning Loop
 *
 * Identifies contradictions between predicted and actual outcomes
 * that may indicate problems with the model or data.
 */

export interface Contradiction {
  id: string;
  type: 'metric' | 'outcome' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  pathId: string;
  pathName: string;
  nodeId?: string;
  nodeName?: string;
  description: string;
  evidence: {
    predicted: string | number;
    actual: string | number;
    variance: number;
  };
  suggestedAction: string;
  detectedAt: Date;
}

export interface ContradictionSummary {
  totalContradictions: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
  };
  byType: {
    metric: number;
    outcome: number;
    pattern: number;
  };
  topContradictions: Contradiction[];
}

/**
 * Detect contradictions for a specific path
 */
export async function detectContradictionsForPath(
  pathId: string
): Promise<Contradiction[]> {
  const contradictions: Contradiction[] = [];

  // Get path details
  const path = await db.query.strategicPaths.findFirst({
    where: eq(strategicPaths.id, pathId),
  });

  if (!path) return contradictions;

  // Get all completed outcomes
  const outcomes = await db.query.pathOutcomes.findMany({
    where: and(
      eq(pathOutcomes.pathId, pathId),
      isNotNull(pathOutcomes.actualOutcome)
    ),
  });

  if (outcomes.length < 3) {
    // Not enough data to detect patterns
    return contradictions;
  }

  // 1. Check for timeline contradictions
  const timelineOutcomes = outcomes.filter(
    (o) => o.predictedTimeline && o.actualTimeline
  );
  if (timelineOutcomes.length >= 3) {
    const avgVariance =
      timelineOutcomes.reduce((sum, o) => {
        return (
          sum +
          ((o.actualTimeline! - o.predictedTimeline!) / o.predictedTimeline!) *
            100
        );
      }, 0) / timelineOutcomes.length;

    if (Math.abs(avgVariance) > 30) {
      contradictions.push({
        id: `timeline-${pathId}`,
        type: 'metric',
        severity: Math.abs(avgVariance) > 50 ? 'high' : 'medium',
        pathId,
        pathName: path.name,
        description: `Timeline predictions consistently ${avgVariance > 0 ? 'underestimate' : 'overestimate'} actual duration`,
        evidence: {
          predicted: `${path.timelineP25}-${path.timelineP75} months`,
          actual: `${Math.round(avgVariance)}% ${avgVariance > 0 ? 'longer' : 'shorter'}`,
          variance: avgVariance,
        },
        suggestedAction:
          avgVariance > 0
            ? 'Increase timeline estimates by reviewing recent case studies'
            : 'Decrease timeline estimates or verify efficiency gains',
        detectedAt: new Date(),
      });
    }
  }

  // 2. Check for cost contradictions
  const costOutcomes = outcomes.filter(
    (o) => o.predictedCost && o.actualCost
  );
  if (costOutcomes.length >= 3) {
    const avgCostVariance =
      costOutcomes.reduce((sum, o) => {
        const predicted = parseFloat(o.predictedCost!);
        const actual = parseFloat(o.actualCost!);
        return sum + ((actual - predicted) / predicted) * 100;
      }, 0) / costOutcomes.length;

    if (Math.abs(avgCostVariance) > 25) {
      contradictions.push({
        id: `cost-${pathId}`,
        type: 'metric',
        severity: Math.abs(avgCostVariance) > 40 ? 'high' : 'medium',
        pathId,
        pathName: path.name,
        description: `Cost predictions consistently ${avgCostVariance > 0 ? 'underestimate' : 'overestimate'} actual spend`,
        evidence: {
          predicted: `$${path.capitalP25}-$${path.capitalP75}`,
          actual: `${Math.round(avgCostVariance)}% ${avgCostVariance > 0 ? 'higher' : 'lower'}`,
          variance: avgCostVariance,
        },
        suggestedAction:
          avgCostVariance > 0
            ? 'Review cost assumptions, may be missing hidden costs'
            : 'Verify if efficiencies are sustainable or outliers',
        detectedAt: new Date(),
      });
    }
  }

  // 3. Check for success rate contradictions
  const successCount = outcomes.filter(
    (o) => o.actualOutcome === 'success' || o.actualOutcome === 'partial'
  ).length;
  const actualSuccessRate = (successCount / outcomes.length) * 100;
  const predictedSuccessRate = path.successRate
    ? parseFloat(path.successRate)
    : null;

  if (predictedSuccessRate && outcomes.length >= 5) {
    const successVariance = actualSuccessRate - predictedSuccessRate;

    if (Math.abs(successVariance) > 20) {
      contradictions.push({
        id: `success-${pathId}`,
        type: 'outcome',
        severity: Math.abs(successVariance) > 35 ? 'high' : 'medium',
        pathId,
        pathName: path.name,
        description: `Actual success rate differs significantly from prediction`,
        evidence: {
          predicted: `${predictedSuccessRate.toFixed(1)}%`,
          actual: `${actualSuccessRate.toFixed(1)}%`,
          variance: successVariance,
        },
        suggestedAction:
          successVariance < 0
            ? 'Investigate failure patterns, may need additional requirements'
            : 'Success rate may be higher than estimated, consider updating',
        detectedAt: new Date(),
      });
    }
  }

  // 4. Check for outcome pattern contradictions
  const abandonedCount = outcomes.filter(
    (o) => o.actualOutcome === 'abandoned'
  ).length;
  if (abandonedCount / outcomes.length > 0.3) {
    contradictions.push({
      id: `abandoned-${pathId}`,
      type: 'pattern',
      severity: 'high',
      pathId,
      pathName: path.name,
      description: 'High abandonment rate detected',
      evidence: {
        predicted: '<10%',
        actual: `${Math.round((abandonedCount / outcomes.length) * 100)}%`,
        variance: (abandonedCount / outcomes.length) * 100 - 10,
      },
      suggestedAction:
        'Investigate why users abandon this path - may need better prerequisites or early gates',
      detectedAt: new Date(),
    });
  }

  // 5. Check for pivot pattern
  const pivotedCount = outcomes.filter(
    (o) => o.actualOutcome === 'pivoted'
  ).length;
  if (pivotedCount / outcomes.length > 0.25) {
    contradictions.push({
      id: `pivot-${pathId}`,
      type: 'pattern',
      severity: 'medium',
      pathId,
      pathName: path.name,
      description: 'High pivot rate indicates path may not fit client needs',
      evidence: {
        predicted: '<15%',
        actual: `${Math.round((pivotedCount / outcomes.length) * 100)}%`,
        variance: (pivotedCount / outcomes.length) * 100 - 15,
      },
      suggestedAction:
        'Review intake criteria - clients may be mismatched to this path',
      detectedAt: new Date(),
    });
  }

  return contradictions;
}

/**
 * Detect all contradictions across the system
 */
export async function detectAllContradictions(): Promise<ContradictionSummary> {
  const allContradictions: Contradiction[] = [];

  // Get all active paths
  const paths = await db.query.strategicPaths.findMany({
    where: eq(strategicPaths.isActive, true),
  });

  for (const path of paths) {
    const pathContradictions = await detectContradictionsForPath(path.id);
    allContradictions.push(...pathContradictions);
  }

  // Sort by severity (high first) then by variance
  allContradictions.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return Math.abs(b.evidence.variance) - Math.abs(a.evidence.variance);
  });

  return {
    totalContradictions: allContradictions.length,
    bySeverity: {
      low: allContradictions.filter((c) => c.severity === 'low').length,
      medium: allContradictions.filter((c) => c.severity === 'medium').length,
      high: allContradictions.filter((c) => c.severity === 'high').length,
    },
    byType: {
      metric: allContradictions.filter((c) => c.type === 'metric').length,
      outcome: allContradictions.filter((c) => c.type === 'outcome').length,
      pattern: allContradictions.filter((c) => c.type === 'pattern').length,
    },
    topContradictions: allContradictions.slice(0, 10),
  };
}

/**
 * Update path contradiction flags in database
 */
export async function updatePathContradictionFlags(
  pathId: string
): Promise<void> {
  const contradictions = await detectContradictionsForPath(pathId);

  const flags = contradictions.map((c) => `${c.type}:${c.severity}:${c.id}`);

  await db
    .update(strategicPaths)
    .set({
      contradictionFlags: flags,
      updatedAt: new Date(),
    })
    .where(eq(strategicPaths.id, pathId));
}
