'use client';

import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Users,
} from 'lucide-react';

type MetricType =
  | 'success-rate'
  | 'timeline'
  | 'cost'
  | 'risk'
  | 'confidence'
  | 'case-count';

interface MetricBadgeProps {
  type: MetricType;
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const metricConfig: Record<
  MetricType,
  {
    icon: typeof TrendingUp;
    format: (value: string | number) => string;
    colorClass: (value: string | number) => string;
    bgClass: (value: string | number) => string;
  }
> = {
  'success-rate': {
    icon: TrendingUp,
    format: (v) => `${v}%`,
    colorClass: (v) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      if (num >= 70) return 'text-green-700 dark:text-green-400';
      if (num >= 50) return 'text-yellow-700 dark:text-yellow-400';
      return 'text-red-700 dark:text-red-400';
    },
    bgClass: (v) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      if (num >= 70) return 'bg-green-50 dark:bg-green-950';
      if (num >= 50) return 'bg-yellow-50 dark:bg-yellow-950';
      return 'bg-red-50 dark:bg-red-950';
    },
  },
  timeline: {
    icon: Clock,
    format: (v) => {
      const months = typeof v === 'string' ? parseInt(v) : v;
      return months === 1 ? '1 mo' : `${months} mo`;
    },
    colorClass: () => 'text-blue-700 dark:text-blue-400',
    bgClass: () => 'bg-blue-50 dark:bg-blue-950',
  },
  cost: {
    icon: DollarSign,
    format: (v) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
      return `$${num.toFixed(0)}`;
    },
    colorClass: () => 'text-emerald-700 dark:text-emerald-400',
    bgClass: () => 'bg-emerald-50 dark:bg-emerald-950',
  },
  risk: {
    icon: AlertTriangle,
    format: (v) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      if (num <= 0.3) return 'Low';
      if (num <= 0.6) return 'Medium';
      return 'High';
    },
    colorClass: (v) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      if (num <= 0.3) return 'text-green-700 dark:text-green-400';
      if (num <= 0.6) return 'text-yellow-700 dark:text-yellow-400';
      return 'text-red-700 dark:text-red-400';
    },
    bgClass: (v) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      if (num <= 0.3) return 'bg-green-50 dark:bg-green-950';
      if (num <= 0.6) return 'bg-yellow-50 dark:bg-yellow-950';
      return 'bg-red-50 dark:bg-red-950';
    },
  },
  confidence: {
    icon: CheckCircle,
    format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
    colorClass: (v) => {
      if (v === 'high') return 'text-green-700 dark:text-green-400';
      if (v === 'medium') return 'text-yellow-700 dark:text-yellow-400';
      return 'text-gray-700 dark:text-gray-400';
    },
    bgClass: (v) => {
      if (v === 'high') return 'bg-green-50 dark:bg-green-950';
      if (v === 'medium') return 'bg-yellow-50 dark:bg-yellow-950';
      return 'bg-gray-50 dark:bg-gray-800';
    },
  },
  'case-count': {
    icon: Users,
    format: (v) => `${v} cases`,
    colorClass: () => 'text-purple-700 dark:text-purple-400',
    bgClass: () => 'bg-purple-50 dark:bg-purple-950',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function MetricBadge({
  type,
  value,
  label,
  size = 'md',
  className,
}: MetricBadgeProps) {
  const config = metricConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        config.bgClass(value),
        config.colorClass(value),
        className
      )}
    >
      <Icon size={iconSizes[size]} />
      <span>
        {label && <span className="opacity-70">{label}: </span>}
        {config.format(value)}
      </span>
    </div>
  );
}
