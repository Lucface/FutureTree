'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Meteors } from '@/components/ui/meteors';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

/**
 * HeroSection - Premium hero section pattern for landing pages
 *
 * Combines animated text, metrics, CTAs, and atmospheric effects
 * for a high-impact first impression.
 *
 * @example
 * ```tsx
 * <HeroSection
 *   headline="Strategic Intelligence"
 *   subheadline="Real data from 700+ business journeys"
 *   primaryCta={{ label: 'Discover Your Path', href: '/discover' }}
 *   metrics={[
 *     { value: 700, suffix: '+', label: 'Case Studies' },
 *     { value: 87, suffix: '%', label: 'Success Rate' },
 *   ]}
 * />
 * ```
 */

const heroVariants = cva(
  'relative flex flex-col items-center justify-center text-center overflow-hidden',
  {
    variants: {
      size: {
        default: 'min-h-[calc(100vh-4rem)] py-20',
        compact: 'min-h-[60vh] py-16',
        full: 'min-h-screen py-24',
      },
      background: {
        default: 'bg-background',
        gradient: 'bg-gradient-to-b from-background via-background/95 to-muted/20',
        dark: 'bg-background/95',
      },
    },
    defaultVariants: {
      size: 'default',
      background: 'default',
    },
  }
);

interface HeroMetric {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

interface HeroCta {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
}

interface HeroSectionProps extends VariantProps<typeof heroVariants> {
  /** Main headline text */
  headline: string;
  /** Optional animated gradient for headline */
  animatedHeadline?: boolean;
  /** Subheadline text */
  subheadline?: string;
  /** Key metrics to display */
  metrics?: HeroMetric[];
  /** Primary call-to-action */
  primaryCta?: HeroCta;
  /** Secondary call-to-action */
  secondaryCta?: HeroCta;
  /** Show meteor background effect */
  meteors?: boolean;
  /** Number of meteors (default: 15) */
  meteorCount?: number;
  /** Badge text above headline */
  badge?: string;
  /** Additional content below CTAs */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function HeroSection({
  headline,
  animatedHeadline = true,
  subheadline,
  metrics,
  primaryCta,
  secondaryCta,
  meteors = true,
  meteorCount = 15,
  badge,
  size,
  background,
  children,
  className,
}: HeroSectionProps) {
  return (
    <section className={cn(heroVariants({ size, background }), className)}>
      {/* Meteor Background */}
      {meteors && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Meteors number={meteorCount} />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        {badge && (
          <BlurFade delay={0} direction="down">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {badge}
            </motion.div>
          </BlurFade>
        )}

        {/* Headline */}
        <BlurFade delay={0.1} direction="up">
          {animatedHeadline ? (
            <AnimatedGradientText className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {headline}
            </AnimatedGradientText>
          ) : (
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
              {headline}
            </h1>
          )}
        </BlurFade>

        {/* Subheadline */}
        {subheadline && (
          <BlurFade delay={0.2} direction="up">
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto">
              {subheadline}
            </p>
          </BlurFade>
        )}

        {/* Metrics Row */}
        {metrics && metrics.length > 0 && (
          <BlurFade delay={0.3} direction="up">
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="font-mono text-3xl font-bold text-foreground sm:text-4xl">
                    {metric.prefix}
                    <NumberTicker value={metric.value} delay={0.5 + index * 0.1} />
                    {metric.suffix}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </BlurFade>
        )}

        {/* CTAs */}
        {(primaryCta || secondaryCta) && (
          <BlurFade delay={0.5} direction="up">
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  {...(primaryCta.external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  <ShimmerButton className="px-8 py-3 text-base font-medium">
                    {primaryCta.label}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </ShimmerButton>
                </Link>
              )}

              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  {...(secondaryCta.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  className={cn(
                    'inline-flex items-center gap-1 px-6 py-3 text-base font-medium',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors duration-200'
                  )}
                >
                  {secondaryCta.label}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </BlurFade>
        )}

        {/* Additional Content */}
        {children && (
          <BlurFade delay={0.6} direction="up">
            <div className="mt-12">{children}</div>
          </BlurFade>
        )}
      </div>
    </section>
  );
}

/**
 * HeroSkeleton - Loading state for hero section
 */
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)] py-20',
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* Badge skeleton */}
        <div className="mb-6 h-8 w-32 mx-auto rounded-full bg-muted animate-pulse" />

        {/* Headline skeleton */}
        <div className="h-16 w-3/4 mx-auto rounded-lg bg-muted animate-pulse" />

        {/* Subheadline skeleton */}
        <div className="mt-6 h-8 w-2/3 mx-auto rounded-lg bg-muted animate-pulse" />

        {/* Metrics skeleton */}
        <div className="mt-10 flex justify-center gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-10 w-20 mx-auto rounded-lg bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-24 mx-auto rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* CTA skeleton */}
        <div className="mt-10 flex justify-center gap-4">
          <div className="h-12 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-12 w-32 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export type { HeroSectionProps, HeroMetric, HeroCta };
