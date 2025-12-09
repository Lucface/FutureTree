'use client';

import { motion } from 'framer-motion';
import {
  Target,
  FileText,
  Users,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricBadge } from './MetricBadge';
import { cn } from '@/lib/utils';
import type { StrategicPath } from '@/database/schema';

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Target,
  FileText,
  Users,
  Sparkles,
};

// Map color names to Tailwind classes
const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
  },
};

interface PathSelectorProps {
  paths: StrategicPath[];
  selectedPathId?: string;
  onSelectPath: (path: StrategicPath) => void;
  isLoading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PathSelector({
  paths,
  selectedPathId,
  onSelectPath,
  isLoading = false,
}: PathSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="h-6 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="h-6 w-20 rounded-full bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No strategic paths available yet
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon or contact support
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {paths.map((path) => {
        const Icon = iconMap[path.icon || 'Sparkles'] || Sparkles;
        const colors = colorMap[path.color || 'blue'] || colorMap.blue;
        const isSelected = selectedPathId === path.id;

        return (
          <motion.div key={path.id} variants={item}>
            <Card
              className={cn(
                'group cursor-pointer transition-all duration-200 hover:shadow-lg',
                colors.border,
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => onSelectPath(path)}
            >
              <CardHeader className={cn('pb-3', colors.bg)}>
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'rounded-full p-2.5',
                      'bg-white dark:bg-gray-900',
                      'shadow-sm'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', colors.icon)} />
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-5 w-5 text-muted-foreground',
                      'transition-transform group-hover:translate-x-1'
                    )}
                  />
                </div>
                <CardTitle className="mt-3 text-lg">{path.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {path.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                {/* Primary metrics */}
                <div className="flex flex-wrap gap-2">
                  {path.successRate && (
                    <MetricBadge
                      type="success-rate"
                      value={path.successRate}
                      size="sm"
                    />
                  )}
                  {path.timelineP25 && path.timelineP75 && (
                    <MetricBadge
                      type="timeline"
                      value={`${path.timelineP25}-${path.timelineP75}`}
                      size="sm"
                    />
                  )}
                  {path.riskScore && (
                    <MetricBadge type="risk" value={path.riskScore} size="sm" />
                  )}
                </div>

                {/* Secondary metrics */}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {path.caseCount
                      ? `Based on ${path.caseCount} case studies`
                      : 'New path'}
                  </span>
                  {path.confidenceLevel && (
                    <MetricBadge
                      type="confidence"
                      value={path.confidenceLevel}
                      size="sm"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
