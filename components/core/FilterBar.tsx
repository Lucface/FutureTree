'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Search,
  X,
  ChevronDown,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Surface } from '@/components/primitives';

/**
 * FilterBar - Search and filter controls
 *
 * A flexible filter bar with search input, filter chips, dropdowns,
 * and sort controls for filtering lists and grids.
 *
 * @example
 * ```tsx
 * <FilterBar
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   filters={[
 *     { id: 'industry', label: 'Industry', options: [...] },
 *     { id: 'stage', label: 'Stage', options: [...] },
 *   ]}
 *   activeFilters={activeFilters}
 *   onFilterChange={handleFilterChange}
 * />
 * ```
 */

const filterBarVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-background border rounded-xl',
      elevated: 'bg-card border rounded-xl shadow-sm',
      minimal: 'bg-transparent',
      sticky: 'bg-background/95 backdrop-blur-sm border-b sticky top-0 z-30',
    },
    size: {
      sm: 'p-2 gap-2',
      md: 'p-3 gap-3',
      lg: 'p-4 gap-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

// Filter option type
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Filter definition
interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// Sort option
interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

// Active filter value
type ActiveFilterValue = string | string[];

export interface FilterBarProps extends VariantProps<typeof filterBarVariants> {
  /** Search input value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Show search input */
  showSearch?: boolean;
  /** Filter definitions */
  filters?: FilterDefinition[];
  /** Active filter values */
  activeFilters?: Record<string, ActiveFilterValue>;
  /** Filter change handler */
  onFilterChange?: (filterId: string, value: ActiveFilterValue) => void;
  /** Clear all filters */
  onClearFilters?: () => void;
  /** Sort options */
  sortOptions?: SortOption[];
  /** Active sort */
  activeSort?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Sort change handler */
  onSortChange?: (sortId: string, direction: 'asc' | 'desc') => void;
  /** Result count */
  resultCount?: number;
  /** Additional className */
  className?: string;
  /** Children (additional controls) */
  children?: React.ReactNode;
}

export function FilterBar({
  variant = 'default',
  size = 'md',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = true,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  sortOptions = [],
  activeSort,
  sortDirection = 'desc',
  onSortChange,
  resultCount,
  className,
  children,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return value ? count + 1 : count;
  }, 0);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn(filterBarVariants({ variant, size }), 'flex flex-wrap items-center', className)}>
      {/* Search Input */}
      {showSearch && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className={cn(
              'w-full pl-9 pr-8 py-2 text-sm',
              'bg-muted/50 border border-transparent rounded-lg',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
              'transition-colors'
            )}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div ref={dropdownRef} className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const isOpen = openDropdown === filter.id;
            const activeValue = activeFilters[filter.id];
            const hasValue = Array.isArray(activeValue) ? activeValue.length > 0 : !!activeValue;
            const FilterIcon = filter.icon;

            return (
              <div key={filter.id} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : filter.id)}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  aria-label={`Filter by ${filter.label}${hasValue ? ` (${Array.isArray(activeValue) ? activeValue.length : 1} selected)` : ''}`}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg',
                    'border transition-all',
                    hasValue
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted/50 border-transparent hover:border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {FilterIcon && <FilterIcon className="h-3.5 w-3.5" />}
                  <span>{filter.label}</span>
                  {hasValue && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary/20 rounded-full">
                      {Array.isArray(activeValue) ? activeValue.length : 1}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 z-50"
                    >
                      <Surface
                        variant="raised"
                        padding="sm"
                        className="min-w-[180px] max-h-[280px] overflow-y-auto shadow-lg"
                        role="listbox"
                        aria-label={`${filter.label} options`}
                      >
                        <div className="space-y-0.5">
                          {filter.options.map((option) => {
                            const isSelected = filter.multiple
                              ? (activeValue as string[] | undefined)?.includes(option.value)
                              : activeValue === option.value;

                            return (
                              <button
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  if (filter.multiple) {
                                    const current = (activeValue as string[]) || [];
                                    const next = isSelected
                                      ? current.filter((v) => v !== option.value)
                                      : [...current, option.value];
                                    onFilterChange?.(filter.id, next);
                                  } else {
                                    onFilterChange?.(
                                      filter.id,
                                      isSelected ? '' : option.value
                                    );
                                    setOpenDropdown(null);
                                  }
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md',
                                  'transition-colors',
                                  isSelected
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted text-foreground'
                                )}
                              >
                                <span>{option.label}</span>
                                <div className="flex items-center gap-2">
                                  {option.count !== undefined && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.count}
                                    </span>
                                  )}
                                  {isSelected && <Check className="h-3.5 w-3.5" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </Surface>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Sort */}
      {sortOptions.length > 0 && (
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === 'sort' ? null : 'sort')
            }
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg',
              'bg-muted/50 border border-transparent hover:border-border',
              'text-muted-foreground hover:text-foreground transition-all'
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort</span>
            {activeSort && (
              <>
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
              </>
            )}
          </button>

          <AnimatePresence>
            {openDropdown === 'sort' && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-1 z-50"
              >
                <Surface
                  variant="raised"
                  padding="sm"
                  className="min-w-[160px] shadow-lg"
                >
                  <div className="space-y-0.5">
                    {sortOptions.map((option) => {
                      const isSelected = activeSort === option.value;

                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const newDirection =
                              isSelected && sortDirection === 'desc' ? 'asc' : 'desc';
                            onSortChange?.(option.value, newDirection);
                            setOpenDropdown(null);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md',
                            'transition-colors',
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground'
                          )}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Surface>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Clear Filters */}
      {activeFilterCount > 0 && onClearFilters && (
        <button
          onClick={onClearFilters}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg',
            'text-muted-foreground hover:text-foreground transition-colors'
          )}
        >
          <X className="h-3.5 w-3.5" />
          Clear all
        </button>
      )}

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="ml-auto text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </div>
      )}

      {/* Custom children */}
      {children}
    </div>
  );
}

// Active Filter Chips - display active filters as removable chips
interface ActiveFiltersProps {
  filters: FilterDefinition[];
  activeFilters: Record<string, ActiveFilterValue>;
  onRemove: (filterId: string, value: string) => void;
  className?: string;
}

export function ActiveFilters({
  filters,
  activeFilters,
  onRemove,
  className,
}: ActiveFiltersProps) {
  const activeChips: { filterId: string; filterLabel: string; value: string; label: string }[] = [];

  filters.forEach((filter) => {
    const activeValue = activeFilters[filter.id];
    if (!activeValue) return;

    const values = Array.isArray(activeValue) ? activeValue : [activeValue];
    values.forEach((value) => {
      const option = filter.options.find((o) => o.value === value);
      if (option) {
        activeChips.push({
          filterId: filter.id,
          filterLabel: filter.label,
          value,
          label: option.label,
        });
      }
    });
  });

  if (activeChips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {activeChips.map((chip) => (
        <motion.span
          key={`${chip.filterId}-${chip.value}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full',
            'bg-primary/10 text-primary border border-primary/20'
          )}
        >
          <span className="text-primary/60">{chip.filterLabel}:</span>
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip.filterId, chip.value)}
            className="ml-0.5 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.span>
      ))}
    </div>
  );
}

// Skeleton loader
export function FilterBarSkeleton({
  variant = 'default',
  showSearch = true,
  filterCount = 3,
}: {
  variant?: 'default' | 'elevated' | 'minimal' | 'sticky';
  showSearch?: boolean;
  filterCount?: number;
}) {
  return (
    <div
      className={cn(
        filterBarVariants({ variant, size: 'md' }),
        'flex items-center gap-3'
      )}
    >
      {showSearch && (
        <div className="flex-1 min-w-[200px] max-w-md h-9 bg-muted rounded-lg animate-pulse" />
      )}
      {Array.from({ length: filterCount }).map((_, i) => (
        <div
          key={i}
          className="w-24 h-8 bg-muted rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export type { FilterDefinition, FilterOption, SortOption, ActiveFilterValue };
