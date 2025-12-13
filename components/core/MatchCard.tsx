'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Star,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Surface } from '@/components/primitives';
import { ProgressRing } from '@/components/primitives';
import { Shimmer, ShimmerGroup } from '@/components/primitives';

/**
 * MatchCard - Case study/path match result card
 *
 * Displays matched paths or case studies in discovery results with
 * match percentage, key attributes, and visual hierarchy.
 *
 * @example
 * ```tsx
 * <MatchCard
 *   match={matchResult}
 *   rank={1}
 *   onExplore={handleExplore}
 * />
 * ```
 */

const matchCardVariants = cva(
  'group relative overflow-hidden transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'hover:shadow-md hover:-translate-y-0.5',
        featured: 'hover:shadow-lg hover:-translate-y-1',
        compact: '',
      },
      rank: {
        1: '',  // Best match - special styling applied separately
        2: '',
        3: '',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      rank: 'default',
    },
  }
);

// Match data type
interface MatchData {
  id: string;
  name: string;
  slug?: string;
  matchPercentage: number;
  summary?: string;
  // Business profile attributes
  industry?: string;
  companySize?: string;
  revenue?: string;
  // Match breakdown
  matchBreakdown?: {
    industryFit?: number;
    budgetAlignment?: number;
    timelineCompatible?: number;
    capabilityMatch?: number;
  };
  // Path-specific
  successRate?: number;
  timeline?: string;
  caseCount?: number;
  // Case study-specific
  outcome?: string;
  highlights?: string[];
}

export interface MatchCardProps extends Omit<VariantProps<typeof matchCardVariants>, 'rank'> {
  /** Match result data */
  match: MatchData;
  /** Rank position (1 = best match) */
  rank?: number;
  /** Click handler */
  onExplore?: (match: MatchData) => void;
  /** Link href */
  href?: string;
  /** Show match breakdown */
  showBreakdown?: boolean;
  /** Additional className */
  className?: string;
}

export function MatchCard({
  match,
  variant = 'default',
  rank,
  onExplore,
  href,
  showBreakdown = false,
  className,
}: MatchCardProps) {
  const isBestMatch = rank === 1;
  const matchPercent = Math.round(match.matchPercentage);

  const wrapperClassName = cn(
    'block cursor-pointer',
    matchCardVariants({ variant }),
    className
  );

  const cardContent = (
    <Surface
      variant={isBestMatch ? 'raised' : 'interactive'}
      glow={isBestMatch ? 'success' : 'none'}
      padding="none"
      className={cn('h-full', isBestMatch && 'ring-2 ring-emerald-500/20')}
    >
      {/* Best Match Badge */}
      {isBestMatch && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-current" />
          BEST MATCH
        </div>
      )}

      <div className={cn('relative p-5', isBestMatch && 'pt-10')}>
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Match Percentage Ring */}
          <ProgressRing
            value={matchPercent}
            size="md"
            variant={getMatchVariant(matchPercent)}
          >
            <span className="font-mono text-lg font-bold">{matchPercent}%</span>
          </ProgressRing>

          {/* Title & Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {match.name}
              </h3>
              <ChevronRight
                className={cn(
                  'h-5 w-5 text-muted-foreground flex-shrink-0',
                  'transition-transform duration-200 group-hover:translate-x-1'
                )}
              />
            </div>

            {match.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {match.summary}
              </p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mt-3">
              {match.industry && (
                <QuickStat icon={Building2} value={match.industry} />
              )}
              {match.companySize && (
                <QuickStat icon={Users} value={match.companySize} />
              )}
              {match.revenue && (
                <QuickStat icon={DollarSign} value={match.revenue} />
              )}
            </div>
          </div>
        </div>

        {/* Match Breakdown */}
        {showBreakdown && match.matchBreakdown && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Why this matches you
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {match.matchBreakdown.industryFit !== undefined && (
                <BreakdownItem
                  label="Industry fit"
                  value={match.matchBreakdown.industryFit}
                />
              )}
              {match.matchBreakdown.budgetAlignment !== undefined && (
                <BreakdownItem
                  label="Budget alignment"
                  value={match.matchBreakdown.budgetAlignment}
                />
              )}
              {match.matchBreakdown.timelineCompatible !== undefined && (
                <BreakdownItem
                  label="Timeline compatible"
                  value={match.matchBreakdown.timelineCompatible}
                />
              )}
              {match.matchBreakdown.capabilityMatch !== undefined && (
                <BreakdownItem
                  label="Capability match"
                  value={match.matchBreakdown.capabilityMatch}
                />
              )}
            </div>
          </div>
        )}

        {/* Outcome/Highlights (for case studies) */}
        {match.outcome && (
          <div className="mt-4 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{match.outcome}</p>
            </div>
          </div>
        )}

        {/* Highlights */}
        {match.highlights && match.highlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {match.highlights.slice(0, 3).map((highlight, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {(match.successRate || match.timeline || match.caseCount) && (
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            {match.successRate && (
              <span>{Math.round(match.successRate)}% success rate</span>
            )}
            {match.timeline && <span>{match.timeline}</span>}
            {match.caseCount && <span>{match.caseCount} case studies</span>}
          </div>
        )}
      </div>
    </Surface>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: rank ? (rank - 1) * 0.1 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {href ? (
        <Link href={href} className={wrapperClassName}>
          {cardContent}
        </Link>
      ) : (
        <div
          className={wrapperClassName}
          onClick={onExplore ? () => onExplore(match) : undefined}
        >
          {cardContent}
        </div>
      )}
    </motion.div>
  );
}

// Helper components
function QuickStat({ icon: Icon, value }: { icon: React.ElementType; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {value}
    </span>
  );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium">{percent}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percent >= 80 ? 'bg-emerald-500' :
              percent >= 60 ? 'bg-amber-500' : 'bg-muted-foreground'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function
function getMatchVariant(percent: number): 'success' | 'warning' | 'info' {
  if (percent >= 80) return 'success';
  if (percent >= 60) return 'warning';
  return 'info';
}

// Skeleton loader
export function MatchCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <Surface variant="default" padding="none" className="h-full">
      {featured && <Shimmer variant="custom" className="h-8 w-full rounded-none" />}
      <div className={cn('p-5', featured && 'pt-4')}>
        <ShimmerGroup gap="md">
          <div className="flex items-start gap-4">
            <Shimmer variant="avatar" size="lg" />
            <div className="flex-1 space-y-2">
              <Shimmer variant="heading" className="w-3/4 h-5" />
              <Shimmer variant="text" className="w-full" />
              <div className="flex gap-3 mt-3">
                <Shimmer variant="text" className="w-16 h-4" />
                <Shimmer variant="text" className="w-16 h-4" />
              </div>
            </div>
          </div>
          <Shimmer variant="card" className="h-16 mt-4" />
        </ShimmerGroup>
      </div>
    </Surface>
  );
}

export type { MatchData };
