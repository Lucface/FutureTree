'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface StrategyMapSkeletonProps {
  className?: string;
}

/**
 * StrategyMapSkeleton - Loading state for strategy map canvas.
 *
 * Shows a ghost of the ReactFlow canvas with:
 * - Dotted background grid
 * - Animated placeholder nodes
 * - Edge path indicators
 * - Minimap placeholder
 *
 * @example
 * {isLoading ? <StrategyMapSkeleton /> : <StrategyCanvas {...props} />}
 */
export function StrategyMapSkeleton({ className }: StrategyMapSkeletonProps) {
  return (
    <div
      className={cn(
        'relative w-full h-[600px] rounded-xl overflow-hidden',
        'bg-gray-50 dark:bg-dark-background',
        className
      )}
    >
      {/* Dotted Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Ghost Nodes */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Current State Node */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-[80px] left-1/2 -translate-x-1/2"
        >
          <Skeleton className="w-[180px] h-[80px] rounded-xl" />
        </motion.div>

        {/* Decision Nodes Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-[200px] left-0 right-0 flex justify-center gap-12"
        >
          <Skeleton className="w-[160px] h-[100px] rounded-xl" />
          <Skeleton className="w-[160px] h-[100px] rounded-xl" />
          <Skeleton className="w-[160px] h-[100px] rounded-xl" />
        </motion.div>

        {/* Milestone Nodes Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute top-[340px] left-0 right-0 flex justify-center gap-16"
        >
          <Skeleton className="w-[140px] h-[80px] rounded-xl" />
          <Skeleton className="w-[140px] h-[80px] rounded-xl" />
          <Skeleton className="w-[140px] h-[80px] rounded-xl" />
          <Skeleton className="w-[140px] h-[80px] rounded-xl" />
        </motion.div>

        {/* Outcome Node */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute top-[460px] left-1/3"
        >
          <Skeleton className="w-[160px] h-[70px] rounded-xl" />
        </motion.div>

        {/* Ghost Edges (animated dashes) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.path
            d="M 50% 120 L 35% 200"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.path
            d="M 50% 120 L 50% 200"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
          <motion.path
            d="M 50% 120 L 65% 200"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
      </div>

      {/* Controls Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-4 left-4"
      >
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-md p-1">
          <div className="flex flex-col gap-1">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>
      </motion.div>

      {/* Minimap Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-4 right-4"
      >
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-md">
          <Skeleton className="w-[120px] h-[80px] rounded-lg" />
        </div>
      </motion.div>

      {/* Loading Spinner Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-gray-200 dark:border-dark-muted border-t-gray-900 dark:border-t-white rounded-full"
        />
      </div>
    </div>
  );
}
