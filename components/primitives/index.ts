/**
 * FutureTree Primitives
 *
 * Low-level, reusable building blocks for the FutureTree design system.
 * These components are the foundation for all higher-level patterns.
 *
 * @example
 * ```tsx
 * import {
 *   Surface,
 *   MetricValue,
 *   ProgressRing,
 *   Shimmer,
 *   Glow,
 *   IconBadge,
 * } from '@/components/primitives';
 * ```
 */

// Surface - Card-like containers with glow effects
export { Surface, surfaceVariants, type SurfaceProps } from './Surface';

// MetricValue - Animated numeric displays with trends
export { MetricValue, type MetricValueProps, type TrendDirection } from './MetricValue';

// ProgressRing - Circular progress indicators
export { ProgressRing, type ProgressRingProps } from './ProgressRing';

// Shimmer - Loading placeholders with animation
export { Shimmer, ShimmerGroup, shimmerVariants, type ShimmerProps } from './Shimmer';

// Glow - Wrapper for glow effects
export { Glow, type GlowProps, type GlowVariant, type GlowIntensity } from './Glow';

// IconBadge - Icons with status indicators
export {
  IconBadge,
  iconBadgeVariants,
  type IconBadgeProps,
  type StatusType,
} from './IconBadge';
