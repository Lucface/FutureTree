/**
 * PathMap Type Definitions
 *
 * Core types for the PathMap recommendation engine and UI components.
 */

import type { IntakeFormData } from '@/lib/validations/intake';

// ============================================
// Scoring & Recommendation Types
// ============================================

/**
 * Breakdown of how well a path aligns with client context
 */
export interface ContextAlignmentBreakdown {
  /** How well path matches client's industry (0-1) */
  industryMatch: number;
  /** How well capital requirements fit client's budget (0-1) */
  capitalFit: number;
  /** How well timeline matches client's preference (0-1) */
  timelineMatch: number;
  /** How well path suits client's business stage (0-1) */
  stageAlignment: number;
}

/**
 * Weights for context alignment scoring
 */
export const ALIGNMENT_WEIGHTS: Record<keyof ContextAlignmentBreakdown, number> = {
  industryMatch: 0.25,
  capitalFit: 0.3,
  timelineMatch: 0.25,
  stageAlignment: 0.2,
};

/**
 * Full scoring result for a single path
 */
export interface PathScore {
  pathId: string;
  pathName: string;

  /** Overall recommendation score (0-100) */
  overallScore: number;

  /** Raw context alignment score before risk adjustment (0-1) */
  contextAlignmentScore: number;

  /** Score adjusted for path risk vs client tolerance (0-100) */
  riskAdjustedScore: number;

  /** Detailed alignment breakdown */
  breakdown: ContextAlignmentBreakdown;

  /** Human-readable explanations for why this path fits */
  fitExplanation: string[];

  /** Warnings about potential mismatches */
  warnings: string[];

  /** Rank among all scored paths (1 = best) */
  rank: number;
}

/**
 * Request payload for recommendation API
 */
export interface RecommendationRequest {
  /** Existing context ID to use */
  contextId?: string;
  /** Or provide context directly */
  context?: IntakeFormData;
}

/**
 * Response from recommendation API
 */
export interface RecommendationResponse {
  /** Ranked list of path scores */
  scores: PathScore[];
  /** Context used for scoring */
  contextId: string;
  /** Timestamp of scoring */
  scoredAt: string;
  /** Number of paths evaluated */
  pathsEvaluated: number;
}

// ============================================
// EMV (Expected Monetary Value) Types
// ============================================

/**
 * Inputs for EMV calculation
 */
export interface EmvInputs {
  /** Probability of success (0-1) */
  successProbability: number;
  /** Estimated revenue if successful */
  estimatedRevenue: number;
  /** Cost to execute */
  cost: number;
}

/**
 * Result of EMV calculation
 */
export interface EmvResult {
  /** Expected Monetary Value */
  emv: number;
  /** Expected value if successful */
  successValue: number;
  /** Expected loss if failed */
  failureLoss: number;
  /** Risk-reward ratio */
  riskRewardRatio: number;
}

/**
 * What-If scenario adjustments
 */
export interface WhatIfAdjustments {
  /** Percentage change to cost (-30 to +30) */
  costDelta: number;
  /** Weeks added/removed from timeline (-6 to +6) */
  timelineDelta: number;
  /** Percentage point change to success probability (-15 to +15) */
  successProbabilityDelta: number;
}

/**
 * What-If simulation result
 */
export interface WhatIfResult {
  original: EmvResult;
  adjusted: EmvResult;
  adjustments: WhatIfAdjustments;
  /** Absolute change in EMV */
  emvChange: number;
  /** Percentage change in EMV */
  emvChangePercent: number;
}

// ============================================
// Path Exploration Types
// ============================================

/**
 * Snapshot of exploration state for saving/sharing
 */
export interface ExplorationState {
  pathId: string;
  contextId?: string;
  disclosureLevel: 1 | 2 | 3;
  expandedNodeIds: string[];
  selectedNodeId?: string;
  whatIfAdjustments?: Record<string, WhatIfAdjustments>;
  notes?: string;
}

/**
 * Export options for PDF/CSV generation
 */
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'share-link';
  includeEvidence: boolean;
  includeBenchmarks: boolean;
  includeWhatIf: boolean;
  disclosureLevel: 1 | 2 | 3;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
  };
}

// ============================================
// Share Link Types
// ============================================

/**
 * Configuration for creating a share link
 */
export interface ShareLinkConfig {
  pathId: string;
  explorationId?: string;
  state: ExplorationState;
  expiresInDays: number;
  maxViews?: number;
  password?: string;
}

/**
 * Share link data returned from API
 */
export interface ShareLink {
  id: string;
  slug: string;
  url: string;
  expiresAt: string;
  maxViews?: number;
  viewCount: number;
  hasPassword: boolean;
  createdAt: string;
}

// ============================================
// UI State Types
// ============================================

/**
 * PathMap presentation mode
 */
export type PathMapMode = 'presenter' | 'self-serve';

/**
 * Mode-specific feature configuration
 */
export interface ModeConfig {
  /** Who controls disclosure level */
  disclosureControl: 'presenter' | 'personal';
  /** Can nodes be freely expanded */
  nodeExpansion: 'locked' | 'free';
  /** Show onboarding tooltips */
  showOnboarding: boolean;
  /** Show hints/contextual help */
  showHints: boolean;
}

export const MODE_CONFIGS: Record<PathMapMode, ModeConfig> = {
  presenter: {
    disclosureControl: 'presenter',
    nodeExpansion: 'locked',
    showOnboarding: false,
    showHints: false,
  },
  'self-serve': {
    disclosureControl: 'personal',
    nodeExpansion: 'free',
    showOnboarding: true,
    showHints: true,
  },
};

// ============================================
// Node Type Helpers
// ============================================

export type NodeType = 'decision' | 'phase' | 'milestone' | 'outcome' | 'risk';

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  decision: 'blue',
  phase: 'green',
  milestone: 'purple',
  outcome: 'emerald',
  risk: 'red',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  decision: 'Decision Point',
  phase: 'Phase',
  milestone: 'Milestone',
  outcome: 'Outcome',
  risk: 'Risk Factor',
};

// ============================================
// Confidence Levels
// ============================================

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const CONFIDENCE_THRESHOLDS = {
  high: { minCases: 20, minSuccessVariance: 0.1 },
  medium: { minCases: 10, minSuccessVariance: 0.2 },
  low: { minCases: 0, minSuccessVariance: 1.0 },
};

export function getConfidenceLevel(caseCount: number, successVariance: number): ConfidenceLevel {
  if (caseCount >= 20 && successVariance <= 0.1) return 'high';
  if (caseCount >= 10 && successVariance <= 0.2) return 'medium';
  return 'low';
}
