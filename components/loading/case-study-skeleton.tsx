'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CaseStudyCardSkeletonProps {
  className?: string;
}

/**
 * CaseStudyCardSkeleton - Loading state for a single case study card.
 *
 * @example
 * {isLoading ? <CaseStudyCardSkeleton /> : <CaseStudyCard {...caseStudy} />}
 */
export function CaseStudyCardSkeleton({ className }: CaseStudyCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 dark:border-dark-border p-6',
        'bg-white dark:bg-dark-surface',
        className
      )}
    >
      {/* Similarity Badge */}
      <div className="absolute -top-3 -right-3">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div>
          <Skeleton className="h-5 w-28 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 dark:border-dark-border">
        <div className="text-center">
          <Skeleton className="h-3 w-10 mx-auto mb-1" />
          <Skeleton className="h-5 w-12 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-3 w-10 mx-auto mb-1" />
          <Skeleton className="h-5 w-12 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-3 w-10 mx-auto mb-1" />
          <Skeleton className="h-5 w-12 mx-auto" />
        </div>
      </div>

      {/* Strategy Badge */}
      <Skeleton className="h-6 w-24 mt-4 rounded-full" />

      {/* Quote */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

interface CaseStudyGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * CaseStudyGridSkeleton - Loading state for a grid of case studies.
 *
 * @example
 * {isLoading ? <CaseStudyGridSkeleton count={6} /> : <CaseStudyGrid caseStudies={data} />}
 */
export function CaseStudyGridSkeleton({ count = 6, className }: CaseStudyGridSkeletonProps) {
  return (
    <div className={cn('grid md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CaseStudyCardSkeleton key={i} />
      ))}
    </div>
  );
}
