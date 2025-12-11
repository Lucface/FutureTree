'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/premium';

type PathColor = 'green' | 'blue' | 'purple';

interface PathCardProps {
  /** Path name */
  name: string;
  /** Number of companies that took this path */
  companies: number;
  /** Success rate percentage */
  successRate: number;
  /** Average timeline (e.g., "16 mo") */
  avgTimeline: string;
  /** Capital required (e.g., "$35K") */
  capitalRequired: string;
  /** Whether this is the recommended path */
  isRecommended?: boolean;
  /** Color theme for the card */
  color: PathColor;
  /** Click handler */
  onClick?: () => void;
  /** Optional description */
  description?: string;
}

const colorClasses: Record<PathColor, {
  bg: string;
  border: string;
  accent: string;
  badge: string;
  bgHover: string;
}> = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    accent: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-500',
    bgHover: 'hover:bg-green-100/80 dark:hover:bg-green-900/40',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500',
    bgHover: 'hover:bg-blue-100/80 dark:hover:bg-blue-900/40',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500',
    bgHover: 'hover:bg-purple-100/80 dark:hover:bg-purple-900/40',
  },
};

/**
 * PathCard - Strategic path comparison card.
 *
 * Shows side-by-side strategic paths with visual hierarchy.
 * The recommended path gets special highlighting.
 *
 * @example
 * <PathCard
 *   name="Vertical Specialization"
 *   companies={8}
 *   successRate={87}
 *   avgTimeline="16 mo"
 *   capitalRequired="$35K"
 *   isRecommended
 *   color="green"
 * />
 */
export function PathCard({
  name,
  companies,
  successRate,
  avgTimeline,
  capitalRequired,
  isRecommended = false,
  color,
  onClick,
  description,
}: PathCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-300 cursor-pointer',
        colors.bg,
        colors.bgHover,
        'border-2',
        isRecommended
          ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800'
          : colors.border
      )}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              'px-3 py-1 text-xs font-semibold text-white rounded-full',
              colors.badge
            )}
          >
            ★ RECOMMENDED
          </span>
        </div>
      )}

      {/* Path Name */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        {name}
      </h3>

      {/* Optional Description */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          {description}
        </p>
      )}

      <div className="space-y-3">
        {/* Companies Count */}
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600 dark:text-gray-400">Companies</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            <AnimatedCounter value={companies} /> took this path
          </span>
        </div>

        {/* Success Rate - THE BIG NUMBER */}
        <div className="py-4 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <AnimatedCounter
              value={successRate}
              className={cn('text-5xl font-bold', colors.accent)}
            />
            <span className={cn('text-2xl font-bold', colors.accent)}>%</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">success rate</p>
        </div>

        {/* Timeline & Capital */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {avgTimeline}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">avg timeline</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {capitalRequired}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">capital needed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
