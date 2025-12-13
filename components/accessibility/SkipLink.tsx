'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipLink - Accessible skip-to-content link
 *
 * Provides keyboard users a way to skip past navigation directly
 * to the main content. Appears only when focused.
 *
 * @example
 * ```tsx
 * // In layout.tsx:
 * <body>
 *   <SkipLink />
 *   <Header />
 *   <main id="main-content">
 *     {children}
 *   </main>
 * </body>
 * ```
 */

interface SkipLinkProps {
  /** Target element ID (default: "main-content") */
  targetId?: string;
  /** Link text */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function SkipLink({
  targetId = 'main-content',
  children = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Visually hidden until focused
        'sr-only focus:not-sr-only',
        // Styling when visible
        'fixed top-4 left-4 z-[100]',
        'px-4 py-2 text-sm font-medium',
        'bg-primary text-primary-foreground',
        'rounded-lg shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * VisuallyHidden - Hide content visually but keep accessible to screen readers
 *
 * @example
 * ```tsx
 * <button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 * ```
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** Render as a different element */
  as?: React.ElementType;
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}

/**
 * LiveRegion - Announce dynamic content changes to screen readers
 *
 * @example
 * ```tsx
 * <LiveRegion>
 *   {isLoading ? 'Loading results...' : `${results.length} results found`}
 * </LiveRegion>
 * ```
 */
interface LiveRegionProps {
  children: React.ReactNode;
  /** Politeness level: 'polite' waits, 'assertive' interrupts */
  politeness?: 'polite' | 'assertive';
  /** Type of change: 'additions' | 'removals' | 'all' */
  relevant?: 'additions' | 'removals' | 'all';
  /** Element type */
  as?: React.ElementType;
  /** Additional class names */
  className?: string;
}

export function LiveRegion({
  children,
  politeness = 'polite',
  relevant = 'additions',
  as: Component = 'div',
  className,
}: LiveRegionProps) {
  return (
    <Component
      role="status"
      aria-live={politeness}
      aria-relevant={relevant}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {children}
    </Component>
  );
}
