'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useInView, useSpring, useMotionValue, motion } from 'motion/react';

/**
 * ProgressRing - Circular progress indicator with animation
 *
 * A premium circular gauge for displaying percentages and scores.
 * Supports gradient strokes, animations, and nested content.
 *
 * @example
 * ```tsx
 * <ProgressRing value={87} size="lg" variant="success">
 *   <span className="text-2xl font-bold">87%</span>
 *   <span className="text-xs text-muted-foreground">success</span>
 * </ProgressRing>
 * ```
 */

interface ProgressRingProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size of the ring */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Stroke width relative to size */
  strokeWidth?: 'thin' | 'normal' | 'thick';
  /** Show the track (background ring) */
  showTrack?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Content to display in center */
  children?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Whether to animate on view */
  animateOnView?: boolean;
}

const sizeConfig = {
  sm: { size: 48, viewBox: 48, radius: 18 },
  md: { size: 80, viewBox: 80, radius: 32 },
  lg: { size: 120, viewBox: 120, radius: 48 },
  xl: { size: 160, viewBox: 160, radius: 64 },
} as const;

const strokeWidthConfig = {
  thin: 0.1,    // 10% of radius
  normal: 0.15, // 15% of radius
  thick: 0.2,   // 20% of radius
} as const;

const variantGradients: Record<string, { start: string; end: string }> = {
  default: { start: 'hsl(var(--foreground))', end: 'hsl(var(--foreground))' },
  primary: { start: 'hsl(217, 91%, 60%)', end: 'hsl(263, 70%, 50%)' },
  success: { start: 'hsl(142, 76%, 36%)', end: 'hsl(165, 82%, 51%)' },
  warning: { start: 'hsl(43, 96%, 56%)', end: 'hsl(25, 95%, 53%)' },
  danger: { start: 'hsl(0, 84%, 60%)', end: 'hsl(350, 89%, 60%)' },
  info: { start: 'hsl(217, 91%, 60%)', end: 'hsl(199, 89%, 48%)' },
};

export function ProgressRing({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  strokeWidth = 'normal',
  showTrack = true,
  animationDuration = 1000,
  children,
  className,
  animateOnView = true,
}: ProgressRingProps) {
  const ref = React.useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  // Normalize value to 0-100
  const normalizedValue = Math.min(Math.max((value / max) * 100, 0), 100);

  // Get configuration
  const config = sizeConfig[size];
  const strokeW = config.radius * strokeWidthConfig[strokeWidth];
  const circumference = 2 * Math.PI * config.radius;

  // Animated stroke offset
  const motionValue = useMotionValue(circumference);
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 20,
    duration: animationDuration / 1000,
  });

  // Update animation when in view
  React.useEffect(() => {
    if (!animateOnView || isInView) {
      const targetOffset = circumference - (normalizedValue / 100) * circumference;
      motionValue.set(targetOffset);
    }
  }, [isInView, normalizedValue, circumference, animateOnView, motionValue]);

  // Gradient ID (unique per instance)
  const gradientId = React.useId();
  const gradient = variantGradients[variant];

  // Center coordinates
  const center = config.viewBox / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        ref={ref}
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradient.start} />
            <stop offset="100%" stopColor={gradient.end} />
          </linearGradient>
        </defs>

        {/* Track (background ring) */}
        {showTrack && (
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeW}
            className="text-muted/30"
          />
        )}

        {/* Progress ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: springValue }}
          className="transition-colors"
        />
      </svg>

      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}

export type { ProgressRingProps };
