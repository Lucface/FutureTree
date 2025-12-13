/**
 * Similarity Matching Engine
 *
 * Powers the "Magic Moment" in FutureTree - matching a business profile
 * to relevant case studies with explainable scoring.
 *
 * The algorithm considers:
 * 1. Industry/niche alignment
 * 2. Revenue stage similarity
 * 3. Team size compatibility
 * 4. Challenge/goal matching
 * 5. Capability overlap
 * 6. Geographic relevance
 */

import type { BusinessProfile, CaseStudy } from '@/database/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface MatchScore {
  overall: number; // 0-100
  breakdown: {
    industry: number;
    revenue: number;
    teamSize: number;
    challenges: number;
    capabilities: number;
    geography: number;
  };
  explanation: string;
  keyTakeaways: string[];
}

export interface CaseStudyMatch {
  caseStudy: CaseStudy;
  score: MatchScore;
  rank: number;
}

export interface MatchingResult {
  profile: BusinessProfile;
  matches: CaseStudyMatch[];
  totalCandidates: number;
  matchedAboveThreshold: number;
  recommendedPath: {
    strategyType: string;
    caseStudyCount: number;
    avgSuccessRate: number;
    avgTimeline: number;
  } | null;
  generatedAt: Date;
}

// ============================================================================
// SCORING WEIGHTS
// ============================================================================

const WEIGHTS = {
  industry: 0.30, // Industry match is most important
  revenue: 0.20, // Similar stage
  teamSize: 0.15, // Similar scale
  challenges: 0.15, // Facing similar problems
  capabilities: 0.10, // Have similar starting capabilities
  geography: 0.10, // Same market dynamics
};

// Threshold for including in results (0-100)
const MATCH_THRESHOLD = 40;

// Maximum matches to return
const MAX_MATCHES = 50;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;

  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return (intersection.size / union.size) * 100;
}

/**
 * Fuzzy match two strings
 */
function fuzzyMatch(a: string | null | undefined, b: string | null | undefined): number {
  if (!a || !b) return 0;

  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  // Exact match
  if (strA === strB) return 100;

  // Contains match
  if (strA.includes(strB) || strB.includes(strA)) return 80;

  // Word overlap
  const wordsA = new Set(strA.split(/\s+/));
  const wordsB = new Set(strB.split(/\s+/));
  const overlap = [...wordsA].filter(w => wordsB.has(w)).length;

  if (overlap > 0) {
    return Math.min(60, overlap * 20);
  }

  return 0;
}

/**
 * Map revenue range strings to numeric values for comparison
 */
function revenueToNumeric(revenue: string | null | undefined): number {
  if (!revenue) return 0;

  const ranges: Record<string, number> = {
    'under_10k': 5000,
    'under_100k': 50000,
    '10k_50k': 30000,
    '50k_100k': 75000,
    '100k_250k': 175000,
    '250k_500k': 375000,
    '500k_1m': 750000,
    '1m_2.5m': 1750000,
    '2.5m_5m': 3750000,
    '5m_10m': 7500000,
    '5m_plus': 7500000,
    '10m_plus': 15000000,
  };

  return ranges[revenue.toLowerCase()] || 0;
}

/**
 * Calculate revenue stage similarity (closer = higher score)
 */
function revenueSimilarity(a: string | null | undefined, b: string | null | undefined): number {
  const numA = revenueToNumeric(a);
  const numB = revenueToNumeric(b);

  if (numA === 0 || numB === 0) return 30; // Partial score for unknown

  // Calculate log-scale difference (revenue is exponential)
  const logA = Math.log10(numA);
  const logB = Math.log10(numB);
  const diff = Math.abs(logA - logB);

  // Convert to 0-100 score (0 diff = 100, 3 orders of magnitude diff = 0)
  return Math.max(0, 100 - (diff / 3) * 100);
}

/**
 * Map team size strings to numeric values
 */
function teamSizeToNumeric(size: string | null | undefined): number {
  if (!size) return 0;

  const sizes: Record<string, number> = {
    'solo': 1,
    '2_5': 3.5,
    '6_10': 8,
    '11_25': 18,
    '26_50': 38,
    '51_100': 75,
    '50_plus': 75,
    '100_plus': 150,
  };

  return sizes[size.toLowerCase()] || 0;
}

/**
 * Calculate team size similarity
 */
function teamSizeSimilarity(a: string | null | undefined, b: string | null | undefined): number {
  const numA = teamSizeToNumeric(a);
  const numB = teamSizeToNumeric(b);

  if (numA === 0 || numB === 0) return 30;

  // Calculate ratio-based difference
  const ratio = Math.max(numA, numB) / Math.min(numA, numB);

  // Convert to score (ratio of 1 = 100, ratio of 10 = 0)
  return Math.max(0, 100 - ((ratio - 1) / 9) * 100);
}

/**
 * Extract challenges from profile
 */
function extractChallenges(profile: BusinessProfile): string[] {
  const challenges: string[] = [];

  if (profile.biggestChallenge) {
    challenges.push(profile.biggestChallenge);
  }

  if (profile.growthGoal) {
    challenges.push(profile.growthGoal);
  }

  // Add inferred challenges from profile data
  const mp = profile.marketPosition as Record<string, unknown> | null;
  if (mp?.vulnerabilities && Array.isArray(mp.vulnerabilities)) {
    challenges.push(...(mp.vulnerabilities as string[]));
  }

  return challenges;
}

/**
 * Extract capabilities from profile
 */
function extractCapabilities(profile: BusinessProfile): string[] {
  const capabilities: string[] = [];

  // From qualifications
  const quals = profile.qualifications as Record<string, string[]> | null;
  if (quals) {
    if (quals.certifications) capabilities.push(...quals.certifications);
    if (quals.equipment) capabilities.push(...quals.equipment);
    if (quals.tools) capabilities.push(...quals.tools);
    if (quals.specialSkills) capabilities.push(...quals.specialSkills);
  }

  // From core competencies
  const comps = profile.coreCompetencies as Record<string, string[]> | null;
  if (comps) {
    if (comps.primary) capabilities.push(...comps.primary);
    if (comps.secondary) capabilities.push(...comps.secondary);
  }

  // From infrastructure
  const infra = profile.infrastructure as Record<string, unknown> | null;
  if (infra?.techStack && Array.isArray(infra.techStack)) {
    capabilities.push(...(infra.techStack as string[]));
  }

  return capabilities;
}

/**
 * Extract location for geographic matching
 */
function extractLocation(profile: BusinessProfile): string {
  return profile.location || '';
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate match score between a profile and a case study
 */
export function calculateMatchScore(
  profile: BusinessProfile,
  caseStudy: CaseStudy
): MatchScore {
  const breakdown = {
    industry: 0,
    revenue: 0,
    teamSize: 0,
    challenges: 0,
    capabilities: 0,
    geography: 0,
  };

  // 1. Industry Match
  const industryMatch = fuzzyMatch(profile.industry, caseStudy.industry);
  const subIndustryMatch = fuzzyMatch(profile.subIndustry, caseStudy.subIndustry);
  breakdown.industry = Math.max(industryMatch, subIndustryMatch * 0.9);

  // Boost for exact industry match
  if (profile.industry?.toLowerCase() === caseStudy.industry?.toLowerCase()) {
    breakdown.industry = 100;
  }

  // 2. Revenue Stage Match
  const startState = caseStudy.startingState as Record<string, string> | null;
  breakdown.revenue = revenueSimilarity(
    profile.currentRevenue,
    startState?.revenue
  );

  // 3. Team Size Match
  breakdown.teamSize = teamSizeSimilarity(
    profile.teamSize,
    startState?.teamSize
  );

  // 4. Challenge/Goal Match
  const profileChallenges = extractChallenges(profile);
  const rawChallenges = startState?.challenges;
  const caseChallenges: string[] = Array.isArray(rawChallenges) ? rawChallenges : [];
  const caseKeywords = caseStudy.matchingKeywords || [];

  const challengeOverlap = jaccardSimilarity(
    profileChallenges,
    [...caseChallenges, ...caseKeywords]
  );
  breakdown.challenges = challengeOverlap;

  // 5. Capability Match
  const profileCapabilities = extractCapabilities(profile);
  const rawCapabilities = startState?.capabilities;
  const caseCapabilities: string[] = Array.isArray(rawCapabilities) ? rawCapabilities : [];

  breakdown.capabilities = jaccardSimilarity(
    profileCapabilities,
    caseCapabilities
  );

  // 6. Geographic Match
  const profileLocation = extractLocation(profile);
  const caseLocation = caseStudy.location || '';

  if (profileLocation && caseLocation) {
    // Same country/region gets partial score
    const locParts1 = profileLocation.toLowerCase().split(',').map(s => s.trim());
    const locParts2 = caseLocation.toLowerCase().split(',').map(s => s.trim());

    const commonParts = locParts1.filter(p => locParts2.includes(p));
    breakdown.geography = commonParts.length > 0 ? 50 + commonParts.length * 20 : 20;
  } else {
    breakdown.geography = 30; // Neutral score for unknown location
  }

  // Calculate weighted overall score
  const overall =
    breakdown.industry * WEIGHTS.industry +
    breakdown.revenue * WEIGHTS.revenue +
    breakdown.teamSize * WEIGHTS.teamSize +
    breakdown.challenges * WEIGHTS.challenges +
    breakdown.capabilities * WEIGHTS.capabilities +
    breakdown.geography * WEIGHTS.geography;

  // Generate explanation
  const explanationParts: string[] = [];

  if (breakdown.industry >= 80) {
    explanationParts.push(`Same industry (${caseStudy.industry})`);
  } else if (breakdown.industry >= 50) {
    explanationParts.push(`Related industry`);
  }

  if (breakdown.revenue >= 70) {
    explanationParts.push(`Similar revenue stage`);
  }

  if (breakdown.teamSize >= 70) {
    explanationParts.push(`Similar team size`);
  }

  if (breakdown.challenges >= 40) {
    explanationParts.push(`Faced similar challenges`);
  }

  // Generate key takeaways
  const keyTakeaways: string[] = [];

  if (caseStudy.strategyType) {
    keyTakeaways.push(`Used ${caseStudy.strategyType.replace(/_/g, ' ')} strategy`);
  }

  const outcomes = caseStudy.outcomes as Record<string, number> | null;
  if (outcomes?.revenueMultiplier) {
    keyTakeaways.push(`Achieved ${outcomes.revenueMultiplier}x revenue growth`);
  }

  const timeline = caseStudy.timeline as Record<string, number> | null;
  if (timeline?.totalMonths) {
    keyTakeaways.push(`Transformation took ~${timeline.totalMonths} months`);
  }

  if (caseStudy.lessonsLearned) {
    keyTakeaways.push(caseStudy.lessonsLearned.substring(0, 100));
  }

  return {
    overall: Math.round(overall),
    breakdown,
    explanation: explanationParts.join(', ') || 'Potential match based on profile analysis',
    keyTakeaways: keyTakeaways.slice(0, 4),
  };
}

// ============================================================================
// MATCHING ENGINE
// ============================================================================

/**
 * Find matching case studies for a business profile
 */
export function findMatches(
  profile: BusinessProfile,
  caseStudies: CaseStudy[],
  options: {
    threshold?: number;
    maxResults?: number;
    strategyFilter?: string[];
  } = {}
): MatchingResult {
  const threshold = options.threshold ?? MATCH_THRESHOLD;
  const maxResults = options.maxResults ?? MAX_MATCHES;
  const strategyFilter = options.strategyFilter;

  // Filter case studies if strategy filter is specified
  let candidates = caseStudies;
  if (strategyFilter && strategyFilter.length > 0) {
    candidates = caseStudies.filter(cs =>
      strategyFilter.includes(cs.strategyType || '')
    );
  }

  // Calculate scores for all candidates
  const scoredMatches: CaseStudyMatch[] = candidates
    .map(cs => ({
      caseStudy: cs,
      score: calculateMatchScore(profile, cs),
      rank: 0,
    }))
    .filter(m => m.score.overall >= threshold)
    .sort((a, b) => b.score.overall - a.score.overall)
    .slice(0, maxResults)
    .map((m, i) => ({ ...m, rank: i + 1 }));

  // Analyze recommended path (most common strategy among top matches)
  const strategyCounts: Record<string, {
    count: number;
    totalTimeline: number;
    totalSuccess: number;
  }> = {};

  for (const match of scoredMatches.slice(0, 20)) {
    const strategy = match.caseStudy.strategyType || 'unknown';
    if (!strategyCounts[strategy]) {
      strategyCounts[strategy] = { count: 0, totalTimeline: 0, totalSuccess: 0 };
    }

    strategyCounts[strategy].count++;

    const timeline = match.caseStudy.timeline as Record<string, number> | null;
    if (timeline?.totalMonths) {
      strategyCounts[strategy].totalTimeline += timeline.totalMonths;
    }

    // Estimate success rate from outcomes
    const outcomes = match.caseStudy.outcomes as Record<string, number> | null;
    if (outcomes?.revenueMultiplier && outcomes.revenueMultiplier > 1) {
      strategyCounts[strategy].totalSuccess += 1;
    }
  }

  // Find best strategy
  let recommendedPath: MatchingResult['recommendedPath'] = null;

  const bestStrategy = Object.entries(strategyCounts)
    .sort(([, a], [, b]) => b.count - a.count)[0];

  if (bestStrategy) {
    const [strategyType, stats] = bestStrategy;
    recommendedPath = {
      strategyType,
      caseStudyCount: stats.count,
      avgSuccessRate: stats.count > 0 ? (stats.totalSuccess / stats.count) * 100 : 0,
      avgTimeline: stats.count > 0 ? Math.round(stats.totalTimeline / stats.count) : 0,
    };
  }

  return {
    profile,
    matches: scoredMatches,
    totalCandidates: candidates.length,
    matchedAboveThreshold: scoredMatches.length,
    recommendedPath,
    generatedAt: new Date(),
  };
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Group matches by strategy type for the "Three Paths" view
 */
export function groupByStrategy(result: MatchingResult): Record<string, {
  matches: CaseStudyMatch[];
  avgScore: number;
  count: number;
  avgTimeline: number;
  successIndicators: number;
}> {
  const groups: Record<string, CaseStudyMatch[]> = {};

  for (const match of result.matches) {
    const strategy = match.caseStudy.strategyType || 'other';
    if (!groups[strategy]) {
      groups[strategy] = [];
    }
    groups[strategy].push(match);
  }

  const summary: ReturnType<typeof groupByStrategy> = {};

  for (const [strategy, matches] of Object.entries(groups)) {
    const avgScore = matches.reduce((sum, m) => sum + m.score.overall, 0) / matches.length;

    let totalTimeline = 0;
    let timelineCount = 0;
    let successIndicators = 0;

    for (const m of matches) {
      const timeline = m.caseStudy.timeline as Record<string, number> | null;
      if (timeline?.totalMonths) {
        totalTimeline += timeline.totalMonths;
        timelineCount++;
      }

      const outcomes = m.caseStudy.outcomes as Record<string, number> | null;
      if (outcomes?.revenueMultiplier && outcomes.revenueMultiplier > 1) {
        successIndicators++;
      }
    }

    summary[strategy] = {
      matches,
      avgScore: Math.round(avgScore),
      count: matches.length,
      avgTimeline: timelineCount > 0 ? Math.round(totalTimeline / timelineCount) : 0,
      successIndicators,
    };
  }

  return summary;
}

/**
 * Get the top N case studies across all strategies
 */
export function getTopMatches(result: MatchingResult, n: number = 5): CaseStudyMatch[] {
  return result.matches.slice(0, n);
}

/**
 * Format match result for API response
 */
export function formatForApi(result: MatchingResult) {
  return {
    summary: {
      totalMatches: result.matchedAboveThreshold,
      totalCandidates: result.totalCandidates,
      recommendedPath: result.recommendedPath,
      generatedAt: result.generatedAt.toISOString(),
    },
    topMatches: getTopMatches(result, 10).map(m => ({
      company: m.caseStudy.companyName,
      industry: m.caseStudy.industry,
      score: m.score.overall,
      explanation: m.score.explanation,
      keyTakeaways: m.score.keyTakeaways,
      strategy: m.caseStudy.strategyType,
      summary: m.caseStudy.summary,
    })),
    byStrategy: Object.entries(groupByStrategy(result)).map(([strategy, data]) => ({
      strategy,
      matchCount: data.count,
      avgScore: data.avgScore,
      avgTimeline: data.avgTimeline,
      successRate: data.count > 0 ? Math.round((data.successIndicators / data.count) * 100) : 0,
      topCompanies: data.matches.slice(0, 3).map(m => m.caseStudy.companyName),
    })),
  };
}
