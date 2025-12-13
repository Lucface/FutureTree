'use client';

import * as React from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricValue - Animated numeric display with trend indicator
 *
 * A premium metric display component that wraps NumberTicker with
 * additional features: suffix, prefix, labels, and trend indicators.
 *
 * @example
 * ```tsx
 * <MetricValue
 *   value={87}
 *   suffix="%"
 *   label="Success Rate"
 *   trend="up"
 *   trendValue="+5%"
 * />
 * ```
 */

type TrendDirection = 'up' | 'down' | 'neutral';

interface MetricValueProps {
  /** The numeric value to display */
  value: number;
  /** Starting value for animation (default: 0) */
  startValue?: number;
  /** Text to display after the number (e.g., "%", "mo", "+") */
  suffix?: string;
  /** Text to display before the number (e.g., "$", "~") */
  prefix?: string;
  /** Label displayed above the metric */
  label?: string;
  /** Description displayed below the metric */
  description?: string;
  /** Number of decimal places */
  decimalPlaces?: number;
  /** Trend direction for indicator */
  trend?: TrendDirection;
  /** Trend value text (e.g., "+5%", "-2.3%") */
  trendValue?: string;
  /** Animation delay in seconds */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
  /** Whether to skip animation (show value immediately) */
  static?: boolean;
}

const sizeClasses = {
  sm: {
    value: 'text-xl',
    label: 'text-xs',
    suffix: 'text-sm',
    trend: 'text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    value: 'text-2xl',
    label: 'text-xs',
    suffix: 'text-base',
    trend: 'text-xs',
    icon: 'h-3.5 w-3.5',
  },
  lg: {
    value: 'text-4xl',
    label: 'text-sm',
    suffix: 'text-xl',
    trend: 'text-sm',
    icon: 'h-4 w-4',
  },
  xl: {
    value: 'text-5xl',
    label: 'text-base',
    suffix: 'text-2xl',
    trend: 'text-sm',
    icon: 'h-5 w-5',
  },
} as const;

const trendColors: Record<TrendDirection, string> = {
  up: 'text-emerald-500 dark:text-emerald-400',
  down: 'text-red-500 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

const TrendIcon = ({ direction, className }: { direction: TrendDirection; className?: string }) => {
  switch (direction) {
    case 'up':
      return <TrendingUp className={className} />;
    case 'down':
      return <TrendingDown className={className} />;
    case 'neutral':
      return <Minus className={className} />;
  }
};

export function MetricValue({
  value,
  startValue = 0,
  suffix,
  prefix,
  label,
  description,
  decimalPlaces = 0,
  trend,
  trendValue,
  delay = 0,
  size = 'md',
  className,
  static: isStatic = false,
}: MetricValueProps) {
  const classes = sizeClasses[size];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Label */}
      {label && (
        <span
          className={cn(
            'font-medium text-muted-foreground uppercase tracking-wider',
            classes.label
          )}
        >
          {label}
        </span>
      )}

      {/* Value row */}
      <div className="flex items-baseline gap-1">
        {/* Prefix */}
        {prefix && (
          <span className={cn('font-mono font-bold text-foreground', classes.suffix)}>
            {prefix}
          </span>
        )}

        {/* Animated number */}
        {isStatic ? (
          <span className={cn('font-mono font-bold text-foreground tabular-nums', classes.value)}>
            {Intl.NumberFormat('en-US', {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            }).format(value)}
          </span>
        ) : (
          <NumberTicker
            value={value}
            startValue={startValue}
            delay={delay}
            decimalPlaces={decimalPlaces}
            className={cn('font-mono font-bold text-foreground', classes.value)}
          />
        )}

        {/* Suffix */}
        {suffix && (
          <span className={cn('font-mono font-bold text-foreground', classes.suffix)}>
            {suffix}
          </span>
        )}

        {/* Trend indicator */}
        {trend && (
          <div className={cn('flex items-center gap-0.5 ml-2', trendColors[trend], classes.trend)}>
            <TrendIcon direction={trend} className={classes.icon} />
            {trendValue && <span className="font-medium">{trendValue}</span>}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <span className={cn('text-muted-foreground', classes.label)}>{description}</span>
      )}
    </div>
  );
}

export type { MetricValueProps, TrendDirection };
