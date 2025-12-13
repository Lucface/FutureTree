'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Glow - Wrapper component that adds a glow effect to children
 *
 * Creates a premium glow effect behind any element, useful for
 * highlighting important content or creating visual depth.
 *
 * @example
 * ```tsx
 * <Glow variant="primary" intensity="medium">
 *   <Button>Important Action</Button>
 * </Glow>
 * ```
 */

type GlowVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
type GlowIntensity = 'subtle' | 'medium' | 'strong';

interface GlowProps {
  /** Color variant */
  variant?: GlowVariant;
  /** Glow intensity */
  intensity?: GlowIntensity;
  /** Custom glow color (HSL values, e.g., "217 91% 60%") */
  customColor?: string;
  /** Whether to animate the glow */
  animated?: boolean;
  /** Blur radius multiplier */
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  /** Content to wrap */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

const variantColors: Record<Exclude<GlowVariant, 'custom'>, string> = {
  primary: 'var(--primary)',
  success: 'var(--chart-1)',
  warning: 'var(--chart-4)',
  danger: 'var(--destructive)',
  info: 'var(--chart-2)',
};

const intensityOpacity: Record<GlowIntensity, { inner: number; outer: number }> = {
  subtle: { inner: 0.15, outer: 0.05 },
  medium: { inner: 0.3, outer: 0.1 },
  strong: { inner: 0.5, outer: 0.2 },
};

const blurSizes: Record<string, { inner: number; outer: number }> = {
  sm: { inner: 10, outer: 20 },
  md: { inner: 20, outer: 40 },
  lg: { inner: 30, outer: 60 },
  xl: { inner: 40, outer: 80 },
};

export function Glow({
  variant = 'primary',
  intensity = 'medium',
  customColor,
  animated = false,
  blur = 'md',
  children,
  className,
}: GlowProps) {
  const color = variant === 'custom' && customColor ? customColor : variantColors[variant as Exclude<GlowVariant, 'custom'>];
  const opacities = intensityOpacity[intensity];
  const blurValues = blurSizes[blur];

  // Generate box-shadow
  const glowShadow = [
    `0 0 ${blurValues.inner}px hsl(${color} / ${opacities.inner})`,
    `0 0 ${blurValues.outer}px hsl(${color} / ${opacities.outer})`,
  ].join(', ');

  return (
    <div
      className={cn(
        'relative inline-flex',
        animated && 'animate-pulse-glow',
        className
      )}
      style={{
        '--glow-shadow': glowShadow,
      } as React.CSSProperties}
    >
      {/* Glow layer (behind content) */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{ boxShadow: glowShadow }}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export type { GlowProps, GlowVariant, GlowIntensity };
