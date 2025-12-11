'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PotentialitySkeletonProps {
  className?: string;
}

/**
 * PotentialitySkeleton - Loading state for potentiality results.
 *
 * Mimics the structure of the potentiality reveal with:
 * - Header section skeleton
 * - Three path cards
 * - Recommendation banner
 * - Case study previews
 *
 * @example
 * {isLoading ? <PotentialitySkeleton /> : <PotentialityReveal {...data} />}
 */
export function PotentialitySkeleton({ className }: PotentialitySkeletonProps) {
  return (
    <div className={cn('max-w-6xl mx-auto px-4 py-16', className)}>
      {/* Header */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-24 w-96 mx-auto rounded-2xl" />
      </div>

      {/* Path Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-gray-100 dark:border-dark-border p-6"
          >
            <Skeleton className="h-6 w-3/4 mx-auto mb-6" />

            {/* Success Rate */}
            <div className="py-4 text-center">
              <Skeleton className="h-16 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>

            {/* Meta Row */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <div className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation Banner */}
      <div className="bg-gray-50 dark:bg-dark-elevated rounded-2xl p-6 mb-12">
        <Skeleton className="h-5 w-32 mx-auto mb-3" />
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto mb-4" />
        <div className="flex justify-center gap-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Case Studies */}
      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-dark-border p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 dark:border-dark-border">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="text-center">
                    <Skeleton className="h-3 w-10 mx-auto mb-1" />
                    <Skeleton className="h-5 w-12 mx-auto" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-4 w-20 mt-4" />
              <Skeleton className="h-12 w-full mt-4" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex justify-center gap-4 mt-12">
        <Skeleton className="h-12 w-48 rounded-full" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>
    </div>
  );
}
