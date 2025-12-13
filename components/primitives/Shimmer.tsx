'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Shimmer - Loading placeholder with animated gradient
 *
 * An enhanced skeleton component with shimmer animation for premium loading states.
 * More sophisticated than basic skeleton, with multiple variants.
 *
 * @example
 * ```tsx
 * // Basic text shimmer
 * <Shimmer variant="text" className="w-32" />
 *
 * // Card shimmer
 * <Shimmer variant="card" className="h-48" />
 *
 * // Circle avatar shimmer
 * <Shimmer variant="avatar" size="lg" />
 * ```
 */

const shimmerVariants = cva(
  // Base shimmer animation
  [
    'relative overflow-hidden',
    'bg-muted/50',
    // Shimmer gradient overlay
    'before:absolute before:inset-0',
    'before:-translate-x-full',
    'before:animate-[shimmer_2s_infinite]',
    'before:bg-gradient-to-r',
    'before:from-transparent before:via-white/10 before:to-transparent',
    'dark:before:via-white/5',
  ],
  {
    variants: {
      variant: {
        // Single line text
        text: 'h-4 rounded',
        // Multiple line paragraph
        paragraph: 'h-4 rounded',
        // Heading text
        heading: 'h-8 rounded',
        // Circular avatar
        avatar: 'rounded-full',
        // Rectangular image
        image: 'rounded-lg',
        // Card container
        card: 'rounded-xl',
        // Button shape
        button: 'h-10 rounded-md',
        // Badge shape
        badge: 'h-6 rounded-full',
        // Custom (no preset shape)
        custom: '',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
      },
    },
    compoundVariants: [
      // Avatar sizes
      { variant: 'avatar', size: 'sm', class: 'h-8 w-8' },
      { variant: 'avatar', size: 'md', class: 'h-10 w-10' },
      { variant: 'avatar', size: 'lg', class: 'h-12 w-12' },
      { variant: 'avatar', size: 'xl', class: 'h-16 w-16' },
      // Badge sizes
      { variant: 'badge', size: 'sm', class: 'w-12' },
      { variant: 'badge', size: 'md', class: 'w-16' },
      { variant: 'badge', size: 'lg', class: 'w-20' },
    ],
    defaultVariants: {
      variant: 'text',
      size: 'md',
    },
  }
);

export interface ShimmerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shimmerVariants> {
  /** Number of lines (for paragraph variant) */
  lines?: number;
}

export function Shimmer({ className, variant, size, lines = 1, ...props }: ShimmerProps) {
  // For paragraph variant, render multiple lines
  if (variant === 'paragraph' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              shimmerVariants({ variant, size }),
              // Last line is shorter
              i === lines - 1 && 'w-3/4'
            )}
            {...props}
          />
        ))}
      </div>
    );
  }

  return <div className={cn(shimmerVariants({ variant, size }), className)} {...props} />;
}

/**
 * ShimmerGroup - Container for multiple shimmer elements
 *
 * Provides consistent spacing and optional stagger animation.
 */
interface ShimmerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between children */
  gap?: 'sm' | 'md' | 'lg';
  /** Direction of children */
  direction?: 'row' | 'column';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function ShimmerGroup({
  children,
  gap = 'md',
  direction = 'column',
  className,
  ...props
}: ShimmerGroupProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'column' ? 'flex-col' : 'flex-row',
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { shimmerVariants };
