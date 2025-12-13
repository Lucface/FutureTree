'use client';

import { motion } from 'framer-motion';
import { AnimatedCounter } from './ui/animated-counter';
import { cn } from '@/lib/utils';

interface PathCardProps {
  name: string;
  description?: string;
  companies: number;
  successRate: number;
  avgTimeline: string;
  capitalRequired?: string;
  isRecommended?: boolean;
  color: 'green' | 'blue' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500',
    ring: 'ring-blue-200 dark:ring-blue-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500',
    ring: 'ring-purple-200 dark:ring-purple-800',
  },
};

export function PathCard({
  name,
  description,
  companies,
  successRate,
  avgTimeline,
  capitalRequired,
  isRecommended,
  color,
  onClick,
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
        'border-2',
        isRecommended ? `border-emerald-500 ring-2 ${colors.ring}` : colors.border
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={cn('px-3 py-1 text-xs font-semibold text-white rounded-full', colors.badge)}>
            ★ RECOMMENDED
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
        {name}
      </h3>

      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
          {description}
        </p>
      )}

      <div className="space-y-3">
        {/* Companies Count */}
        <div className="flex justify-between items-baseline text-sm">
          <span className="text-gray-600 dark:text-gray-400">Companies</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
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
        <div className={cn(
          'grid gap-4 pt-4 border-t',
          capitalRequired ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{avgTimeline}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">avg timeline</p>
          </div>
          {capitalRequired && (
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{capitalRequired}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">capital needed</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
