'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ValidationStatus = 'high' | 'medium' | 'low' | 'warning' | 'error';

interface ValidationBadgeProps {
  status: ValidationStatus;
  label?: string;
  tooltip?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  ValidationStatus,
  {
    icon: typeof CheckCircle2;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    pulseColor?: string;
  }
> = {
  high: {
    icon: CheckCircle2,
    label: 'High Confidence',
    colorClass: 'text-green-700 dark:text-green-400',
    bgClass: 'bg-green-50 dark:bg-green-950/50',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  medium: {
    icon: Info,
    label: 'Medium Confidence',
    colorClass: 'text-yellow-700 dark:text-yellow-400',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/50',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
  },
  low: {
    icon: HelpCircle,
    label: 'Low Confidence',
    colorClass: 'text-gray-600 dark:text-gray-400',
    bgClass: 'bg-gray-50 dark:bg-gray-800/50',
    borderClass: 'border-gray-200 dark:border-gray-700',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Data Concerns',
    colorClass: 'text-orange-700 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/50',
    borderClass: 'border-orange-200 dark:border-orange-800',
    pulseColor: 'bg-orange-400',
  },
  error: {
    icon: AlertCircle,
    label: 'Contradictory Data',
    colorClass: 'text-red-700 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/50',
    borderClass: 'border-red-200 dark:border-red-800',
    pulseColor: 'bg-red-400',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

const iconSizes = {
  sm: 12,
  md: 14,
};

export function ValidationBadge({
  status,
  label,
  tooltip,
  showIcon = true,
  size = 'md',
  className,
}: ValidationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative inline-flex items-center rounded-full font-medium border',
        sizeClasses[size],
        config.bgClass,
        config.colorClass,
        config.borderClass,
        className
      )}
      title={tooltip}
    >
      {/* Pulse indicator for warnings/errors */}
      {config.pulseColor && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.pulseColor
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              config.pulseColor
            )}
          />
        </span>
      )}

      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{displayLabel}</span>
    </motion.div>
  );
}

// Compound component for showing data freshness
interface DataFreshnessBadgeProps {
  lastUpdated: Date | null;
  threshold?: number; // Days before considered stale
  className?: string;
}

export function DataFreshnessBadge({
  lastUpdated,
  threshold = 30,
  className,
}: DataFreshnessBadgeProps) {
  if (!lastUpdated) {
    return (
      <ValidationBadge
        status="low"
        label="No data"
        tooltip="No aggregation data available"
        className={className}
      />
    );
  }

  const daysSince = Math.floor(
    (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince > threshold * 2) {
    return (
      <ValidationBadge
        status="warning"
        label={`${daysSince}d old`}
        tooltip={`Data last updated ${daysSince} days ago. Consider refreshing.`}
        className={className}
      />
    );
  }

  if (daysSince > threshold) {
    return (
      <ValidationBadge
        status="medium"
        label={`${daysSince}d old`}
        tooltip={`Data last updated ${daysSince} days ago.`}
        className={className}
      />
    );
  }

  return (
    <ValidationBadge
      status="high"
      label="Fresh"
      tooltip={`Data updated ${daysSince === 0 ? 'today' : `${daysSince}d ago`}`}
      className={className}
    />
  );
}

// Compound component for showing contradiction warnings
interface ContradictionBadgeProps {
  flags: string[] | null;
  className?: string;
}

export function ContradictionBadge({ flags, className }: ContradictionBadgeProps) {
  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <ValidationBadge
      status="error"
      label={`${flags.length} issue${flags.length > 1 ? 's' : ''}`}
      tooltip={flags.join('; ')}
      className={className}
    />
  );
}
