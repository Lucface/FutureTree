/**
 * Expected Monetary Value (EMV) Calculations
 *
 * EMV = (successProbability × estimatedRevenue) - ((1 - successProbability) × cost)
 *
 * Used for What-If scenario simulations to help clients understand
 * the expected value of different strategic decisions.
 */

import type {
  EmvInputs,
  EmvResult,
  WhatIfAdjustments,
  WhatIfResult,
} from './types';

// ============================================
// EMV Calculation
// ============================================

/**
 * Calculate Expected Monetary Value
 *
 * @param inputs - Success probability, revenue, and cost
 * @returns EMV result with breakdown
 */
export function calculateEmv(inputs: EmvInputs): EmvResult {
  const { successProbability, estimatedRevenue, cost } = inputs;

  // Validate inputs
  const prob = Math.max(0, Math.min(1, successProbability));
  const revenue = Math.max(0, estimatedRevenue);
  const investmentCost = Math.max(0, cost);

  // Expected value if successful
  const successValue = prob * revenue;

  // Expected loss if failed
  const failureLoss = (1 - prob) * investmentCost;

  // EMV = expected gain - expected loss
  const emv = successValue - failureLoss;

  // Risk-reward ratio (revenue potential / cost)
  const riskRewardRatio = investmentCost > 0 ? revenue / investmentCost : 0;

  return {
    emv,
    successValue,
    failureLoss,
    riskRewardRatio,
  };
}

// ============================================
// What-If Adjustments
// ============================================

/**
 * Apply what-if adjustments to EMV inputs
 *
 * @param base - Original EMV inputs
 * @param adjustments - Percentage/absolute changes to apply
 * @returns Adjusted EMV inputs
 */
export function applyWhatIfAdjustments(
  base: EmvInputs,
  adjustments: WhatIfAdjustments
): EmvInputs {
  // Apply cost delta (percentage)
  const adjustedCost = base.cost * (1 + adjustments.costDelta / 100);

  // Apply success probability delta (percentage points)
  const adjustedProbability = Math.max(
    0.01,
    Math.min(0.99, base.successProbability + adjustments.successProbabilityDelta / 100)
  );

  // Timeline delta affects estimated revenue (longer timeline = potentially more revenue)
  // But for now, keep revenue constant - timeline primarily affects decision psychology
  const adjustedRevenue = base.estimatedRevenue;

  return {
    successProbability: adjustedProbability,
    estimatedRevenue: adjustedRevenue,
    cost: adjustedCost,
  };
}

/**
 * Calculate what-if scenario comparison
 *
 * @param baseInputs - Original EMV inputs
 * @param adjustments - What-if changes to apply
 * @returns Comparison of original vs adjusted EMV
 */
export function calculateWhatIf(
  baseInputs: EmvInputs,
  adjustments: WhatIfAdjustments
): WhatIfResult {
  const original = calculateEmv(baseInputs);
  const adjustedInputs = applyWhatIfAdjustments(baseInputs, adjustments);
  const adjusted = calculateEmv(adjustedInputs);

  const emvChange = adjusted.emv - original.emv;
  const emvChangePercent =
    original.emv !== 0 ? (emvChange / Math.abs(original.emv)) * 100 : 0;

  return {
    original,
    adjusted,
    adjustments,
    emvChange,
    emvChangePercent,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Default adjustments (no change)
 */
export const DEFAULT_ADJUSTMENTS: WhatIfAdjustments = {
  costDelta: 0,
  timelineDelta: 0,
  successProbabilityDelta: 0,
};

/**
 * Adjustment limits for sliders
 */
export const ADJUSTMENT_LIMITS = {
  costDelta: { min: -30, max: 30, step: 5 },
  timelineDelta: { min: -6, max: 6, step: 1 },
  successProbabilityDelta: { min: -15, max: 15, step: 1 },
};

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 0): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Get color class based on EMV change direction
 */
export function getEmvChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

/**
 * Calculate breakeven probability
 * The probability at which EMV = 0
 */
export function calculateBreakevenProbability(cost: number, revenue: number): number {
  if (revenue + cost === 0) return 0;
  return cost / (revenue + cost);
}

/**
 * Calculate sensitivity - how much EMV changes per % probability change
 */
export function calculateSensitivity(revenue: number, cost: number): number {
  return (revenue + cost) / 100;
}

/**
 * Estimate revenue from path data
 * Uses capital range and success rate to estimate potential return
 */
export function estimateRevenueFromPath(
  capitalP75: number,
  successRate: number,
  multiplier: number = 3
): number {
  // Simple heuristic: successful paths typically return 2-5x investment
  // Adjusted by success rate confidence
  return capitalP75 * multiplier * (successRate / 100);
}
