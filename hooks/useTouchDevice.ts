'use client';

import { useState, useEffect } from 'react';

/**
 * Touch Device Detection Hook
 *
 * Detects if the current device supports touch input.
 * Useful for enabling touch-specific interactions.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    // Primary detection methods
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is IE-specific
      navigator.msMaxTouchPoints > 0;

    setIsTouch(hasTouch);

    // Listen for first touch event (for hybrid devices)
    const handleTouch = () => {
      setIsTouch(true);
      window.removeEventListener('touchstart', handleTouch);
    };

    // Listen for mouse movement (for hybrid devices that prefer mouse)
    const handleMouse = () => {
      // Only switch to non-touch if we haven't detected touch yet
      if (!hasTouch) {
        setIsTouch(false);
      }
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return isTouch;
}

/**
 * Returns true if device supports pointer events with coarse precision
 * (typical for touch devices)
 */
export function useCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsCoarse(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setIsCoarse(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isCoarse;
}

export default useTouchDevice;
