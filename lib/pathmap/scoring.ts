/**
 * PathMap Recommendation Scoring Algorithm
 *
 * Scores strategic paths based on how well they align with client context.
 *
 * Formula:
 *   overallScore = (successRate × contextAlignment) - (riskScore × (1 - riskTolerance))
 *
 * Context Alignment (weighted):
 *   - industryMatch (25%)
 *   - capitalFit (30%)
 *   - timelineMatch (25%)
 *   - stageAlignment (20%)
 */

import type { StrategicPath, ClientContext } from '@/database/schema';
import type { IntakeFormData } from '@/lib/validations/intake';
import {
  type PathScore,
  type ContextAlignmentBreakdown,
  ALIGNMENT_WEIGHTS,
} from './types';

// ============================================
// Industry Matching
// ============================================

/**
 * Industry affinity matrix - how well each path fits different industries
 * 1.0 = perfect fit, 0.5 = neutral, 0.0 = poor fit
 */
const INDUSTRY_PATH_AFFINITY: Record<string, Record<string, number>> = {
  'vertical-specialization': {
    technology: 0.9,
    healthcare: 0.95,
    finance: 0.85,
    'professional-services': 1.0,
    'real-estate': 0.8,
    manufacturing: 0.7,
    retail: 0.6,
    education: 0.75,
    hospitality: 0.6,
    construction: 0.75,
    'media-entertainment': 0.65,
    nonprofit: 0.7,
    other: 0.7,
  },
  'content-led-growth': {
    technology: 1.0,
    'professional-services': 0.95,
    education: 0.9,
    'media-entertainment': 0.85,
    healthcare: 0.7,
    finance: 0.75,
    retail: 0.8,
    'real-estate': 0.65,
    manufacturing: 0.5,
    hospitality: 0.7,
    construction: 0.55,
    nonprofit: 0.85,
    other: 0.7,
  },
  'partnership-expansion': {
    'professional-services': 0.95,
    technology: 0.85,
    healthcare: 0.8,
    finance: 0.75,
    'real-estate': 0.9,
    manufacturing: 0.7,
    retail: 0.8,
    education: 0.7,
    hospitality: 0.85,
    construction: 0.8,
    'media-entertainment': 0.75,
    nonprofit: 0.8,
    other: 0.75,
  },
};

/**
 * Calculate industry match score
 */
export function calculateIndustryMatch(
  pathSlug: string,
  clientIndustry: string
): number {
  const pathAffinity = INDUSTRY_PATH_AFFINITY[pathSlug];
  if (!pathAffinity) {
    // Unknown path - return neutral score
    return 0.7;
  }

  return pathAffinity[clientIndustry] ?? 0.7;
}

// ============================================
// Capital Fit
// ============================================

/**
 * Calculate how well client's capital fits the path's requirements
 * Uses path's P25-P75 capital range
 */
export function calculateCapitalFit(
  pathCapitalP25: number | null,
  pathCapitalP75: number | null,
  clientCapital: number,
  budgetFlexibility: string
): number {
  // If path has no capital data, return neutral
  if (!pathCapitalP25 || !pathCapitalP75) {
    return 0.7;
  }

  const p25 = Number(pathCapitalP25);
  const p75 = Number(pathCapitalP75);
  const midpoint = (p25 + p75) / 2;

  // Flexibility multiplier
  const flexMultiplier =
    budgetFlexibility === 'unlimited' ? 1.5 :
    budgetFlexibility === 'flexible' ? 1.2 : 1.0;

  const effectiveCapital = clientCapital * flexMultiplier;

  // Perfect fit: within P25-P75 range
  if (effectiveCapital >= p25 && effectiveCapital <= p75) {
    return 1.0;
  }

  // Slightly above P75 - still good
  if (effectiveCapital > p75 && effectiveCapital <= p75 * 1.5) {
    return 0.9;
  }

  // Well above P75 - overqualified (slight penalty)
  if (effectiveCapital > p75 * 1.5) {
    return 0.8;
  }

  // Below P25 - score based on how far below
  const shortfall = (p25 - effectiveCapital) / p25;
  // Cap minimum at 0.2
  return Math.max(0.2, 1 - shortfall);
}

// ============================================
// Timeline Match
// ============================================

/**
 * Map timeline preferences to target month ranges
 */
const TIMELINE_RANGES = {
  quick: { min: 1, max: 3 },
  moderate: { min: 3, max: 12 },
  patient: { min: 12, max: 36 },
};

/**
 * Calculate how well path timeline matches client preference
 */
export function calculateTimelineMatch(
  pathTimelineP25: number | null,
  pathTimelineP75: number | null,
  timelinePreference: string
): number {
  if (!pathTimelineP25 || !pathTimelineP75) {
    return 0.7;
  }

  const p25 = Number(pathTimelineP25);
  const p75 = Number(pathTimelineP75);
  const pathMidpoint = (p25 + p75) / 2;

  const preferred = TIMELINE_RANGES[timelinePreference as keyof typeof TIMELINE_RANGES];
  if (!preferred) {
    return 0.7;
  }

  const preferredMidpoint = (preferred.min + preferred.max) / 2;

  // Check overlap between path range and preferred range
  const overlapStart = Math.max(p25, preferred.min);
  const overlapEnd = Math.min(p75, preferred.max);

  if (overlapEnd >= overlapStart) {
    // There is overlap - calculate how much
    const overlapRange = overlapEnd - overlapStart;
    const preferredRange = preferred.max - preferred.min;
    const overlapRatio = overlapRange / preferredRange;
    return 0.7 + (0.3 * overlapRatio);
  }

  // No overlap - score based on distance
  const distance = Math.abs(pathMidpoint - preferredMidpoint);
  const maxReasonableDistance = 12; // months
  return Math.max(0.3, 1 - (distance / maxReasonableDistance));
}

// ============================================
// Stage Alignment
// ============================================

/**
 * Stage compatibility matrix
 * Shows how well each path suits different business stages
 */
const STAGE_PATH_ALIGNMENT: Record<string, Record<string, number>> = {
  'vertical-specialization': {
    startup: 0.6,
    growth: 1.0,
    scale: 0.85,
    mature: 0.7,
  },
  'content-led-growth': {
    startup: 0.8,
    growth: 1.0,
    scale: 0.9,
    mature: 0.75,
  },
  'partnership-expansion': {
    startup: 0.5,
    growth: 0.9,
    scale: 1.0,
    mature: 0.85,
  },
};

/**
 * Calculate how well path suits client's business stage
 */
export function calculateStageAlignment(
  pathSlug: string,
  clientStage: string
): number {
  const pathStages = STAGE_PATH_ALIGNMENT[pathSlug];
  if (!pathStages) {
    return 0.7;
  }

  return pathStages[clientStage] ?? 0.7;
}

// ============================================
// Risk Adjustment
// ============================================

/**
 * Map risk tolerance to adjustment factor
 */
const RISK_TOLERANCE_FACTORS = {
  conservative: 0.2,
  moderate: 0.5,
  aggressive: 0.8,
};

/**
 * Calculate risk-adjusted score
 * Penalizes risky paths for conservative clients, rewards for aggressive
 */
export function calculateRiskAdjustment(
  pathRiskScore: number,
  riskTolerance: string
): number {
  const toleranceFactor = RISK_TOLERANCE_FACTORS[riskTolerance as keyof typeof RISK_TOLERANCE_FACTORS] ?? 0.5;

  // For conservative clients: high path risk = big penalty
  // For aggressive clients: high path risk = small penalty (or even bonus for moderate risk)
  const penalty = pathRiskScore * (1 - toleranceFactor);

  return Math.max(0, 1 - penalty);
}

// ============================================
// Explanation Generation
// ============================================

/**
 * Generate human-readable explanations for the score
 */
export function generateFitExplanations(
  breakdown: ContextAlignmentBreakdown,
  pathName: string
): string[] {
  const explanations: string[] = [];

  if (breakdown.industryMatch >= 0.9) {
    explanations.push(`${pathName} is an excellent fit for your industry`);
  } else if (breakdown.industryMatch >= 0.75) {
    explanations.push(`${pathName} works well in your industry`);
  }

  if (breakdown.capitalFit >= 0.9) {
    explanations.push('Your available capital is well-suited for this path');
  } else if (breakdown.capitalFit >= 0.75) {
    explanations.push('Your budget aligns with typical investments for this path');
  }

  if (breakdown.timelineMatch >= 0.85) {
    explanations.push('Timeline expectations match well');
  }

  if (breakdown.stageAlignment >= 0.9) {
    explanations.push("Perfect for your current business stage");
  } else if (breakdown.stageAlignment >= 0.75) {
    explanations.push('Well-suited for your stage of growth');
  }

  return explanations;
}

/**
 * Generate warnings about potential mismatches
 */
export function generateWarnings(
  breakdown: ContextAlignmentBreakdown,
  pathRiskScore: number,
  riskTolerance: string
): string[] {
  const warnings: string[] = [];

  if (breakdown.capitalFit < 0.5) {
    warnings.push('Capital may be insufficient - consider phased investment');
  }

  if (breakdown.timelineMatch < 0.5) {
    warnings.push('Timeline expectations may not match - adjust expectations');
  }

  if (breakdown.stageAlignment < 0.6) {
    warnings.push('This path is typically better suited for a different business stage');
  }

  if (pathRiskScore > 0.6 && riskTolerance === 'conservative') {
    warnings.push('This is a higher-risk path - consider alternatives');
  }

  if (breakdown.industryMatch < 0.6) {
    warnings.push('Limited case studies in your industry - proceed with caution');
  }

  return warnings;
}

// ============================================
// Main Scoring Function
// ============================================

/**
 * Calculate full score for a single path
 */
export function calculatePathScore(
  path: StrategicPath,
  context: IntakeFormData | ClientContext
): Omit<PathScore, 'rank'> {
  // Extract context properties (works for both IntakeFormData and ClientContext)
  // Cast to 'any' for dynamic access since both types have these properties
  const ctx = context as Record<string, unknown>;
  const industry = (ctx.industry as string) || 'other';
  const availableCapital = Number(ctx.availableCapital) || 0;
  const budgetFlexibility = (ctx.budgetFlexibility as string) || 'fixed';
  const timelinePreference = (ctx.timelinePreference as string) || 'moderate';
  const currentStage = (ctx.currentStage as string) || 'growth';
  const riskTolerance = (ctx.riskTolerance as string) || 'moderate';

  // Calculate individual alignment components
  const breakdown: ContextAlignmentBreakdown = {
    industryMatch: calculateIndustryMatch(path.slug, industry),
    capitalFit: calculateCapitalFit(
      path.capitalP25 ? Number(path.capitalP25) : null,
      path.capitalP75 ? Number(path.capitalP75) : null,
      availableCapital,
      budgetFlexibility || 'fixed'
    ),
    timelineMatch: calculateTimelineMatch(
      path.timelineP25,
      path.timelineP75,
      timelinePreference || 'moderate'
    ),
    stageAlignment: calculateStageAlignment(path.slug, currentStage || 'growth'),
  };

  // Calculate weighted context alignment score
  const contextAlignmentScore =
    breakdown.industryMatch * ALIGNMENT_WEIGHTS.industryMatch +
    breakdown.capitalFit * ALIGNMENT_WEIGHTS.capitalFit +
    breakdown.timelineMatch * ALIGNMENT_WEIGHTS.timelineMatch +
    breakdown.stageAlignment * ALIGNMENT_WEIGHTS.stageAlignment;

  // Get path success rate and risk
  const successRate = path.successRate ? Number(path.successRate) / 100 : 0.5;
  const riskScore = path.riskScore ? Number(path.riskScore) : 0.5;

  // Calculate risk adjustment
  const riskAdjustment = calculateRiskAdjustment(riskScore, riskTolerance || 'moderate');

  // Final score formula
  // overallScore = (successRate × contextAlignment) - (riskScore × (1 - riskTolerance))
  const rawScore = successRate * contextAlignmentScore;
  const riskAdjustedScore = rawScore * riskAdjustment;
  const overallScore = Math.round(riskAdjustedScore * 100);

  return {
    pathId: path.id,
    pathName: path.name,
    overallScore,
    contextAlignmentScore: Math.round(contextAlignmentScore * 100) / 100,
    riskAdjustedScore: Math.round(riskAdjustedScore * 100),
    breakdown,
    fitExplanation: generateFitExplanations(breakdown, path.name),
    warnings: generateWarnings(breakdown, riskScore, riskTolerance || 'moderate'),
  };
}

/**
 * Score and rank all paths for a given context
 */
export function rankPaths(
  paths: StrategicPath[],
  context: IntakeFormData | ClientContext
): PathScore[] {
  // Score all paths
  const scoredPaths = paths
    .filter(p => p.isActive)
    .map(path => calculatePathScore(path, context));

  // Sort by overall score (descending)
  scoredPaths.sort((a, b) => b.overallScore - a.overallScore);

  // Add rank
  return scoredPaths.map((score, index) => ({
    ...score,
    rank: index + 1,
  }));
}

/**
 * Get top N recommended paths
 */
export function getTopRecommendations(
  paths: StrategicPath[],
  context: IntakeFormData | ClientContext,
  topN: number = 3
): PathScore[] {
  const ranked = rankPaths(paths, context);
  return ranked.slice(0, topN);
}
