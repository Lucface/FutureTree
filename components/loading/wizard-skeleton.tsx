'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface WizardSkeletonProps {
  className?: string;
}

/**
 * WizardSkeleton - Loading state for the discovery wizard.
 *
 * Shows placeholder for:
 * - Progress bar
 * - Step header
 * - Form content area
 * - Navigation buttons
 *
 * @example
 * {isLoading ? <WizardSkeleton /> : <DiscoveryWizard {...props} />}
 */
export function WizardSkeleton({ className }: WizardSkeletonProps) {
  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Content Area */}
      <div className="min-h-[300px] space-y-6">
        {/* Options/Form Fields */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-dark-border"
          >
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-8 border-t border-gray-100 dark:border-dark-border">
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>
    </div>
  );
}
