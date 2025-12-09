'use client';

import { useState, useEffect } from 'react';

/**
 * Media Query Hook
 *
 * Watches a media query and returns whether it matches.
 * Handles SSR safely by defaulting to false.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// Preset breakpoint hooks

/**
 * Returns true if screen is mobile (<640px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 640px)');
}

/**
 * Returns true if screen is tablet (640px-1024px)
 */
export function useIsTablet(): boolean {
  const isAboveSm = useMediaQuery('(min-width: 640px)');
  const isBelowLg = !useMediaQuery('(min-width: 1024px)');
  return isAboveSm && isBelowLg;
}

/**
 * Returns true if screen is desktop (>=1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Returns the current breakpoint name
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

export default useMediaQuery;
