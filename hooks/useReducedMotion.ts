'use client';

import { useState, useEffect } from 'react';

/**
 * useReducedMotion - Detects user's reduced motion preference
 *
 * Respects the user's system preference for reduced motion.
 * Use this to conditionally disable animations for accessibility.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <motion.div
 *     animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
 *     transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
 *   />
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * getReducedMotionVariant - Helper to get motion-safe animation variants
 *
 * @example
 * ```tsx
 * const variants = getReducedMotionVariant(
 *   prefersReducedMotion,
 *   { opacity: 0, y: 20 }, // initial
 *   { opacity: 1, y: 0 }   // animate
 * );
 * ```
 */
export function getReducedMotionVariant<T>(
  prefersReducedMotion: boolean,
  initial: T,
  animate: T
): { initial: T | Record<string, never>; animate: T | Record<string, never> } {
  if (prefersReducedMotion) {
    return { initial: {}, animate: {} };
  }
  return { initial, animate };
}
