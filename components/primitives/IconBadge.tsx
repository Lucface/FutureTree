'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * IconBadge - Icon with optional status indicator
 *
 * A compact badge component for displaying icons with status dots,
 * commonly used in navigation, lists, and status indicators.
 *
 * @example
 * ```tsx
 * import { Target } from 'lucide-react';
 *
 * <IconBadge icon={Target} status="success" size="lg" />
 * ```
 */

const iconBadgeVariants = cva(
  'relative inline-flex items-center justify-center rounded-lg transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-500 dark:text-red-400',
        info: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
        ghost: 'bg-transparent text-muted-foreground hover:bg-muted',
      },
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
} as const;

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-muted-foreground',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
} as const;

type StatusType = keyof typeof statusColors;

export interface IconBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBadgeVariants> {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Status indicator dot */
  status?: StatusType;
  /** Pulse animation on status dot */
  statusPulse?: boolean;
}

export function IconBadge({
  icon: Icon,
  variant,
  size = 'md',
  status,
  statusPulse = false,
  className,
  ...props
}: IconBadgeProps) {
  return (
    <div className={cn(iconBadgeVariants({ variant, size }), className)} {...props}>
      <Icon className={cn(iconSizes[size ?? 'md'])} />

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 block rounded-full ring-2 ring-background',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            statusColors[status],
            statusPulse && 'animate-pulse'
          )}
        />
      )}
    </div>
  );
}

export { iconBadgeVariants };
export type { StatusType };
