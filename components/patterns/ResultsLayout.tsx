'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';
import { FilterBar, type FilterDefinition, type SortOption, type ActiveFilterValue, ActiveFilters } from '@/components/core/FilterBar';
import { Shimmer } from '@/components/primitives';
import { LayoutGrid, List, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ResultsLayout - Grid/list view for search and filter results
 *
 * Combines FilterBar with responsive grid/list display, empty states,
 * and loading skeletons. Perfect for path explorer and discovery results.
 *
 * @example
 * ```tsx
 * <ResultsLayout
 *   items={paths}
 *   renderItem={(path) => <PathCard path={path} />}
 *   filters={filterConfig}
 *   isLoading={isLoading}
 * />
 * ```
 */

const layoutVariants = cva('flex flex-col', {
  variants: {
    spacing: {
      default: 'gap-6',
      compact: 'gap-4',
      loose: 'gap-8',
    },
  },
  defaultVariants: {
    spacing: 'default',
  },
});

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    },
    gap: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    cols: 3,
    gap: 'md',
  },
});

interface ResultsLayoutProps<T> extends VariantProps<typeof layoutVariants> {
  /** Items to display */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Key extractor for items */
  keyExtractor?: (item: T, index: number) => string;
  /** Filter configuration */
  filters?: FilterDefinition[];
  /** Current filter values */
  activeFilters?: Record<string, ActiveFilterValue>;
  /** Callback when filters change */
  onFilterChange?: (filterId: string, value: ActiveFilterValue) => void;
  /** Sort options */
  sortOptions?: SortOption[];
  /** Current sort value */
  sortValue?: string;
  /** Callback when sort changes */
  onSortChange?: (value: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Current search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton items to show when loading */
  skeletonCount?: number;
  /** Skeleton render function */
  renderSkeleton?: () => React.ReactNode;
  /** Empty state */
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  /** Error state */
  error?: {
    title: string;
    description?: string;
    retry?: () => void;
  };
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4;
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
  /** View mode (grid or list) */
  viewMode?: 'grid' | 'list';
  /** Show view mode toggle */
  showViewToggle?: boolean;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Header content (above filter bar) */
  header?: React.ReactNode;
  /** Footer content (below results) */
  footer?: React.ReactNode;
  /** Stagger animation delay between items */
  staggerDelay?: number;
  /** Hide filter bar */
  hideFilters?: boolean;
  /** Additional class names */
  className?: string;
}

export function ResultsLayout<T>({
  items,
  renderItem,
  keyExtractor = (_, index) => String(index),
  filters,
  activeFilters,
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange: _onSortChange,
  searchPlaceholder = 'Search...',
  searchQuery,
  onSearchChange,
  isLoading = false,
  skeletonCount = 6,
  renderSkeleton,
  emptyState,
  error,
  cols = 3,
  gap = 'md',
  viewMode: controlledViewMode,
  showViewToggle = true,
  onViewModeChange,
  header,
  footer,
  staggerDelay = 80,
  hideFilters = false,
  spacing,
  className,
}: ResultsLayoutProps<T>) {
  const [internalViewMode, setInternalViewMode] = React.useState<'grid' | 'list'>('grid');
  const viewMode = controlledViewMode ?? internalViewMode;

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (controlledViewMode === undefined) {
      setInternalViewMode(mode);
    }
    onViewModeChange?.(mode);
  };

  // Calculate result count
  const resultCount = items.length;
  const hasActiveFilters = activeFilters && Object.values(activeFilters).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  );

  // Handler for removing individual filter values (used by ActiveFilters component)
  const handleRemoveFilter = React.useCallback((filterId: string, value: string) => {
    if (!onFilterChange || !activeFilters) return;
    const currentValue = activeFilters[filterId];
    if (Array.isArray(currentValue)) {
      onFilterChange(filterId, currentValue.filter((v) => v !== value));
    } else {
      onFilterChange(filterId, '');
    }
  }, [onFilterChange, activeFilters]);

  return (
    <div className={cn(layoutVariants({ spacing }), className)}>
      {/* Header */}
      {header && <div className="flex-none">{header}</div>}

      {/* Filter Bar */}
      {!hideFilters && (
        <FilterBar
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          sortOptions={sortOptions}
          activeSort={sortValue}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          resultCount={resultCount}
        />
      )}

      {/* View Mode Toggle & Active Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Active Filters */}
        {hasActiveFilters && filters && onFilterChange && (
          <ActiveFilters
            filters={filters}
            activeFilters={activeFilters!}
            onRemove={handleRemoveFilter}
          />
        )}

        {/* View Toggle */}
        {showViewToggle && !isLoading && items.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <BlurFade>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">{error.title}</h3>
            {error.description && (
              <p className="mt-1 text-muted-foreground max-w-sm">{error.description}</p>
            )}
            {error.retry && (
              <Button variant="outline" className="mt-4" onClick={error.retry}>
                Try Again
              </Button>
            )}
          </div>
        </BlurFade>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className={cn(gridVariants({ cols, gap }))}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i}>
              {renderSkeleton ? (
                renderSkeleton()
              ) : (
                <Shimmer variant="card" className="h-64" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && emptyState && (
        <BlurFade>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">{emptyState.title}</h3>
            {emptyState.description && (
              <p className="mt-1 text-muted-foreground max-w-sm">{emptyState.description}</p>
            )}
            {emptyState.action && (
              <Button className="mt-4" onClick={emptyState.action.onClick}>
                {emptyState.action.label}
              </Button>
            )}
          </div>
        </BlurFade>
      )}

      {/* Results */}
      {!isLoading && !error && items.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              viewMode === 'grid'
                ? gridVariants({ cols, gap })
                : 'flex flex-col gap-3'
            )}
          >
            {items.map((item, index) => (
              <motion.div
                key={keyExtractor(item, index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * (staggerDelay / 1000),
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Footer */}
      {footer && <div className="flex-none">{footer}</div>}
    </div>
  );
}

/**
 * ResultsLayoutSkeleton - Full page skeleton for results layout
 */
export function ResultsLayoutSkeleton({
  cols = 3,
  gap = 'md',
  skeletonCount = 6,
  className,
}: {
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  skeletonCount?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Filter skeleton */}
      <div className="flex gap-4">
        <Shimmer className="h-10 w-64" />
        <Shimmer className="h-10 w-32" />
        <Shimmer className="h-10 w-32" />
        <div className="ml-auto">
          <Shimmer className="h-10 w-28" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className={cn(gridVariants({ cols, gap }))}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Shimmer key={i} variant="card" className="h-64" />
        ))}
      </div>
    </div>
  );
}

export type { ResultsLayoutProps };
