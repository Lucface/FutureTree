'use client';

import * as React from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';

/**
 * StaggeredReveal - Orchestrates staggered BlurFade animations for children
 *
 * Automatically applies incrementing delays to create cascading reveal effects.
 * Perfect for lists, grids, and sequential content reveals.
 *
 * @example
 * ```tsx
 * <StaggeredReveal stagger={100} direction="up">
 *   <PathCard />
 *   <PathCard />
 *   <PathCard />
 * </StaggeredReveal>
 * ```
 */
interface StaggeredRevealProps {
  children: React.ReactNode;
  /** Base delay in milliseconds (default: 0) */
  baseDelay?: number;
  /** Delay between each child in milliseconds (default: 80) */
  stagger?: number;
  /** Animation direction (default: 'up') */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Animation duration in seconds (default: 0.5) */
  duration?: number;
  /** Blur amount (default: '6px') */
  blur?: string;
  /** Offset distance in pixels (default: 20) */
  offset?: number;
  /** Whether to trigger animation when in view (default: true) */
  inView?: boolean;
  /** Margin for in-view detection (default: '-50px') */
  inViewMargin?: string;
  /** Additional class names */
  className?: string;
  /** Wrapper element type */
  as?: 'div' | 'ul' | 'ol' | 'section' | 'article';
  /** Child wrapper element type */
  childAs?: 'div' | 'li' | 'span';
}

export function StaggeredReveal({
  children,
  baseDelay = 0,
  stagger = 80,
  direction = 'up',
  duration = 0.5,
  blur = '6px',
  offset = 20,
  inView = true,
  inViewMargin = '-50px',
  className,
  as: Component = 'div',
  childAs = 'div',
}: StaggeredRevealProps) {
  const childArray = React.Children.toArray(children);

  return (
    <Component className={cn(className)}>
      {childArray.map((child, index) => (
        <BlurFade
          key={index}
          delay={(baseDelay + index * stagger) / 1000}
          direction={direction}
          duration={duration}
          blur={blur}
          offset={offset}
          inView={inView}
          inViewMargin={inViewMargin as `${number}px`}
        >
          {childAs === 'li' ? <li>{child}</li> : child}
        </BlurFade>
      ))}
    </Component>
  );
}

/**
 * StaggeredGrid - Grid layout with staggered reveal
 *
 * Combines CSS Grid with StaggeredReveal for beautiful grid animations.
 */
interface StaggeredGridProps extends Omit<StaggeredRevealProps, 'as' | 'childAs'> {
  /** Grid columns (responsive) */
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Grid gap */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function StaggeredGrid({
  children,
  cols = { default: 1, sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className,
  ...props
}: StaggeredGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <StaggeredReveal className={gridClasses} {...props}>
      {children}
    </StaggeredReveal>
  );
}

/**
 * StaggeredList - List with staggered reveal
 *
 * For ordered or unordered lists with cascading animations.
 */
interface StaggeredListProps extends Omit<StaggeredRevealProps, 'as' | 'childAs'> {
  /** List type */
  ordered?: boolean;
}

export function StaggeredList({
  children,
  ordered = false,
  className,
  ...props
}: StaggeredListProps) {
  return (
    <StaggeredReveal
      as={ordered ? 'ol' : 'ul'}
      childAs="li"
      className={cn('space-y-2', className)}
      {...props}
    >
      {children}
    </StaggeredReveal>
  );
}

export type { StaggeredRevealProps, StaggeredGridProps, StaggeredListProps };
