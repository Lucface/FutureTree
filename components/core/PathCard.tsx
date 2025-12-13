'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Target,
  FileText,
  Users,
  Sparkles,
  ChevronRight,
  Clock,
  TrendingUp,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Surface } from '@/components/primitives';
import { ProgressRing } from '@/components/primitives';
import { Shimmer, ShimmerGroup } from '@/components/primitives';

/**
 * PathCard - Strategic path preview card
 *
 * A premium card component for displaying strategic paths with
 * metrics, success rates, and visual hierarchy.
 *
 * @example
 * ```tsx
 * <PathCard
 *   path={strategicPath}
 *   variant="default"
 *   onSelect={handleSelect}
 * />
 * ```
 */

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Target,
  FileText,
  Users,
  Sparkles,
};

// Color variants for path types
const colorVariants = {
  blue: {
    gradient: 'from-blue-500/10 to-transparent',
    icon: 'text-blue-500 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  green: {
    gradient: 'from-emerald-500/10 to-transparent',
    icon: 'text-emerald-500 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    gradient: 'from-purple-500/10 to-transparent',
    icon: 'text-purple-500 dark:text-purple-400',
    ring: 'ring-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  orange: {
    gradient: 'from-orange-500/10 to-transparent',
    icon: 'text-orange-500 dark:text-orange-400',
    ring: 'ring-orange-500/20',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
} as const;

const pathCardVariants = cva('group relative overflow-hidden transition-all duration-300', {
  variants: {
    variant: {
      default: 'hover:shadow-lg hover:-translate-y-1',
      compact: 'hover:shadow-md',
      featured: 'hover:shadow-xl hover:-translate-y-2',
    },
    selected: {
      true: 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    selected: false,
  },
});

// Strategic path data type (matches database schema)
interface StrategicPathData {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description?: string | null;
  successRate?: string | null;
  caseCount?: number | null;
  timelineP25?: number | null;
  timelineP75?: number | null;
  capitalP25?: string | null;
  capitalP75?: string | null;
  riskScore?: string | null;
  confidenceLevel?: string | null;
  icon?: string | null;
  color?: string | null;
}

export interface PathCardProps extends VariantProps<typeof pathCardVariants> {
  /** Strategic path data */
  path: StrategicPathData;
  /** Click handler */
  onSelect?: (path: StrategicPathData) => void;
  /** Link href (alternative to onSelect) */
  href?: string;
  /** Show success rate ring */
  showSuccessRing?: boolean;
  /** Additional className */
  className?: string;
}

export function PathCard({
  path,
  variant = 'default',
  selected = false,
  onSelect,
  href,
  showSuccessRing = true,
  className,
}: PathCardProps) {
  const Icon = iconMap[path.icon || 'Sparkles'] || Sparkles;
  const colors = colorVariants[(path.color as keyof typeof colorVariants) || 'blue'];
  const successRate = path.successRate ? parseFloat(path.successRate) : null;

  const wrapperClassName = cn(
    'block cursor-pointer',
    pathCardVariants({ variant, selected }),
    className
  );

  const cardContent = (
    <Surface
      variant="interactive"
      glow={selected ? 'primary' : 'none'}
      padding="none"
      className="h-full"
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity',
          colors.gradient
        )}
      />

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0 p-2.5 rounded-xl',
                'bg-background/80 backdrop-blur-sm',
                'border border-border/50',
                'shadow-sm'
              )}
            >
              <Icon className={cn('h-5 w-5', colors.icon)} />
            </div>

            {/* Title & Summary */}
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-foreground truncate">
                {path.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {path.summary}
              </p>
            </div>
          </div>

          {/* Success Ring (featured variant) */}
          {showSuccessRing && successRate && variant === 'featured' && (
            <ProgressRing value={successRate} size="sm" variant="success">
              <span className="font-mono text-xs font-bold">{Math.round(successRate)}%</span>
            </ProgressRing>
          )}

          {/* Arrow (default variant) */}
          {variant !== 'featured' && (
            <ChevronRight
              className={cn(
                'h-5 w-5 text-muted-foreground flex-shrink-0',
                'transition-transform duration-200 group-hover:translate-x-1'
              )}
            />
          )}
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap gap-2">
          {/* Success Rate Badge */}
          {successRate && variant !== 'featured' && (
            <MetricBadge
              icon={TrendingUp}
              label={`${Math.round(successRate)}% success`}
              variant="success"
            />
          )}

          {/* Timeline Badge */}
          {path.timelineP25 && path.timelineP75 && (
            <MetricBadge
              icon={Clock}
              label={`${path.timelineP25}-${path.timelineP75} mo`}
              variant="neutral"
            />
          )}

          {/* Risk Badge */}
          {path.riskScore && (
            <MetricBadge
              icon={Shield}
              label={getRiskLabel(parseFloat(path.riskScore))}
              variant={getRiskVariant(parseFloat(path.riskScore))}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {path.caseCount
              ? `Based on ${path.caseCount} case studies`
              : 'New strategy'}
          </span>

          {path.confidenceLevel && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                getConfidenceStyle(path.confidenceLevel)
              )}
            >
              {path.confidenceLevel}
            </span>
          )}
        </div>
      </div>
    </Surface>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {href ? (
        <Link href={href} className={wrapperClassName}>
          {cardContent}
        </Link>
      ) : (
        <div
          className={wrapperClassName}
          onClick={onSelect ? () => onSelect(path) : undefined}
        >
          {cardContent}
        </div>
      )}
    </motion.div>
  );
}

// Helper components
interface MetricBadgeProps {
  icon: LucideIcon;
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
}

function MetricBadge({ icon: Icon, label, variant }: MetricBadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variantStyles[variant]
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// Helper functions
function getRiskLabel(riskScore: number): string {
  if (riskScore <= 0.3) return 'Low risk';
  if (riskScore <= 0.6) return 'Med risk';
  return 'High risk';
}

function getRiskVariant(riskScore: number): 'success' | 'warning' | 'danger' {
  if (riskScore <= 0.3) return 'success';
  if (riskScore <= 0.6) return 'warning';
  return 'danger';
}

function getConfidenceStyle(level: string): string {
  switch (level.toLowerCase()) {
    case 'high':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'medium':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'low':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

// Skeleton loader
export function PathCardSkeleton() {
  return (
    <Surface variant="default" padding="none" className="h-full">
      <div className="p-5">
        <ShimmerGroup gap="md">
          <div className="flex items-start gap-3">
            <Shimmer variant="avatar" size="md" className="rounded-xl" />
            <div className="flex-1 space-y-2">
              <Shimmer variant="heading" className="w-3/4 h-5" />
              <Shimmer variant="text" className="w-full" />
              <Shimmer variant="text" className="w-2/3" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Shimmer variant="badge" size="md" />
            <Shimmer variant="badge" size="md" />
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-border/50">
            <Shimmer variant="text" className="w-32 h-3" />
            <Shimmer variant="badge" size="sm" />
          </div>
        </ShimmerGroup>
      </div>
    </Surface>
  );
}

export type { StrategicPathData };
