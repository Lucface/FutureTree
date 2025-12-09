/**
 * PathMap Library Exports
 */

// Types
export * from './types';

// Scoring Algorithm
export {
  calculatePathScore,
  rankPaths,
  getTopRecommendations,
  calculateIndustryMatch,
  calculateCapitalFit,
  calculateTimelineMatch,
  calculateStageAlignment,
  calculateRiskAdjustment,
} from './scoring';

// EMV Calculations
export {
  calculateEmv,
  applyWhatIfAdjustments,
  calculateWhatIf,
  calculateBreakevenProbability,
  calculateSensitivity,
  estimateRevenueFromPath,
  formatCurrency,
  formatPercent,
  getEmvChangeColor,
  DEFAULT_ADJUSTMENTS,
  ADJUSTMENT_LIMITS,
} from './emv';
