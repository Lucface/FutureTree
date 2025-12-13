'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Surface - Premium card-like container with optional glow effects
 *
 * A foundational primitive for all card-based layouts in FutureTree.
 * Supports multiple visual variants and glow effects for premium feel.
 *
 * @example
 * ```tsx
 * <Surface variant="raised" glow="primary" padding="lg">
 *   <PathCard />
 * </Surface>
 * ```
 */

const surfaceVariants = cva(
  // Base styles
  'relative overflow-hidden rounded-lg transition-all',
  {
    variants: {
      variant: {
        // Default flat surface
        default: 'bg-card border border-border',
        // Elevated with subtle shadow
        raised: 'bg-card border border-border shadow-md hover:shadow-lg',
        // Recessed/inset appearance
        sunken: 'bg-muted/50 border border-border/50',
        // Interactive card that responds to hover
        interactive:
          'bg-card border border-border cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5',
        // Ghost - minimal borders, transparent
        ghost: 'bg-transparent border border-transparent hover:bg-muted/30',
        // Outlined - just border, no fill
        outlined: 'bg-transparent border-2 border-border hover:border-primary/50',
      },
      glow: {
        none: '',
        // Primary brand glow
        primary: [
          'before:absolute before:inset-0 before:rounded-lg',
          'before:bg-gradient-to-br before:from-primary/5 before:to-transparent',
          'before:pointer-events-none before:transition-opacity',
          'hover:before:from-primary/10',
        ].join(' '),
        // Success/positive glow (green)
        success: [
          'before:absolute before:inset-0 before:rounded-lg',
          'before:bg-gradient-to-br before:from-chart-1/10 before:to-transparent',
          'before:pointer-events-none',
        ].join(' '),
        // Info/neutral glow (blue)
        info: [
          'before:absolute before:inset-0 before:rounded-lg',
          'before:bg-gradient-to-br before:from-chart-2/10 before:to-transparent',
          'before:pointer-events-none',
        ].join(' '),
        // Warning glow (amber)
        warning: [
          'before:absolute before:inset-0 before:rounded-lg',
          'before:bg-gradient-to-br before:from-chart-4/10 before:to-transparent',
          'before:pointer-events-none',
        ].join(' '),
        // Danger glow (red)
        danger: [
          'before:absolute before:inset-0 before:rounded-lg',
          'before:bg-gradient-to-br before:from-destructive/10 before:to-transparent',
          'before:pointer-events-none',
        ].join(' '),
      },
      padding: {
        none: 'p-0',
        xs: 'p-2',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      glow: 'none',
      padding: 'md',
      radius: 'lg',
    },
  }
);

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  /** Element to render as (for polymorphism) */
  as?: React.ElementType;
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, glow, padding, radius, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(surfaceVariants({ variant, glow, padding, radius }), className)}
        {...props}
      >
        {/* Content sits above the glow overlay */}
        <div className="relative z-10">{children}</div>
      </Component>
    );
  }
);

Surface.displayName = 'Surface';

export { Surface, surfaceVariants };
