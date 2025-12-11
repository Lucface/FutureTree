'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  /** The target value to count to */
  value: number;
  /** Direction of counting animation */
  direction?: 'up' | 'down';
  /** Duration of the animation in seconds */
  duration?: number;
  /** Intl.NumberFormat options for formatting */
  formatOptions?: Intl.NumberFormatOptions;
  /** Additional CSS classes */
  className?: string;
  /** Prefix to display before the number (e.g., "$") */
  prefix?: string;
  /** Suffix to display after the number (e.g., "%") */
  suffix?: string;
}

/**
 * AnimatedCounter - Numbers that count up/down when they enter the viewport.
 *
 * Used for the "wow" moments:
 * - Success rate percentages (87% → counts from 0)
 * - Company counts ("15 companies" → counts from 0)
 * - Revenue figures ($2M → counts from 0)
 * - Timeline months (16 mo → counts from 0)
 *
 * @example
 * <AnimatedCounter value={87} suffix="%" className="text-6xl font-bold" />
 * <AnimatedCounter value={15} className="text-5xl" />
 * <AnimatedCounter value={2000000} prefix="$" formatOptions={{ notation: 'compact' }} />
 */
export function AnimatedCounter({
  value,
  direction = 'up',
  duration = 2,
  formatOptions = {},
  className,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);

  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    duration: duration * 1000,
  });

  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === 'down' ? 0 : value);
    }
  }, [motionValue, isInView, value, direction]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest: number) => {
      if (ref.current) {
        const formatted = Intl.NumberFormat('en-US', formatOptions).format(
          Math.round(latest)
        );
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, formatOptions, prefix, suffix]);

  // Initialize with the starting value
  const initialValue = direction === 'down' ? value : 0;
  const formattedInitial = Intl.NumberFormat('en-US', formatOptions).format(initialValue);

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedInitial}{suffix}
    </span>
  );
}
