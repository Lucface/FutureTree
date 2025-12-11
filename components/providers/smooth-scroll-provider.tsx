'use client';

import { ReactNode, useEffect, useState } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Smoothness factor (0.1 = smooth, 1 = instant) */
  lerp?: number;
  /** Duration of scroll animation */
  duration?: number;
  /** Whether smooth scrolling is enabled */
  enabled?: boolean;
}

/**
 * SmoothScrollProvider - Buttery smooth scroll experience (Linear-style).
 *
 * Wraps the entire app to provide smooth scrolling via Lenis.
 *
 * @example
 * // In layout.tsx:
 * <SmoothScrollProvider>
 *   {children}
 * </SmoothScrollProvider>
 */
export function SmoothScrollProvider({
  children,
  lerp = 0.1,
  duration = 1.2,
  enabled = true,
}: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const lenisInstance = new Lenis({
      lerp,
      duration,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, [lerp, duration, enabled]);

  // Check for reduced motion preference
  useEffect(() => {
    if (!lenis) return;

    const lenisInstance = lenis; // Capture for closure

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function handleChange(e: MediaQueryListEvent) {
      if (e.matches) {
        lenisInstance.stop();
      } else {
        lenisInstance.start();
      }
    }

    // Initial check
    if (mediaQuery.matches) {
      lenisInstance.stop();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [lenis]);

  return <>{children}</>;
}

/**
 * Hook to access the Lenis instance for programmatic scrolling.
 * Must be used within SmoothScrollProvider.
 */
export function useSmoothScroll() {
  // This could be expanded to use context if needed
  return {
    scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => {
      const lenis = (window as unknown as { lenis?: Lenis }).lenis;
      if (lenis) {
        lenis.scrollTo(target, options);
      } else {
        // Fallback for when Lenis isn't available
        if (typeof target === 'string') {
          const element = document.querySelector(target);
          element?.scrollIntoView({ behavior: 'smooth' });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
  };
}
