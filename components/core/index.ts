/**
 * FutureTree Core Components
 *
 * Higher-level components built on primitives for common UI patterns.
 * These components handle specific use cases in the FutureTree design system.
 *
 * @example
 * ```tsx
 * import {
 *   PathCard,
 *   MatchCard,
 *   EvidencePanel,
 *   FilterBar,
 * } from '@/components/core';
 * ```
 */

// PathCard - Strategic path preview card
export {
  PathCard,
  PathCardSkeleton,
  type PathCardProps,
  type StrategicPathData,
} from './PathCard';

// MatchCard - Case study/path match result card
export {
  MatchCard,
  MatchCardSkeleton,
  type MatchCardProps,
  type MatchData,
} from './MatchCard';

// EvidencePanel - Collapsible evidence/detail panel
export {
  EvidencePanel,
  EvidencePanelSkeleton,
  type EvidencePanelProps,
  type EvidenceSection,
  type MetricItem,
  type ListItem,
  type DocumentItem,
  type SectionType,
} from './EvidencePanel';

// FilterBar - Search and filter controls
export {
  FilterBar,
  FilterBarSkeleton,
  ActiveFilters,
  type FilterBarProps,
  type FilterDefinition,
  type FilterOption,
  type SortOption,
  type ActiveFilterValue,
} from './FilterBar';
