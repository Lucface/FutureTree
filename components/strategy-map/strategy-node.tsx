'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock, DollarSign, Users } from 'lucide-react';

export type StrategyNodeType = 'current' | 'decision' | 'outcome' | 'milestone';

export interface StrategyNodeData {
  label: string;
  type: StrategyNodeType;
  description?: string;
  probability?: number;
  timeline?: string;
  capital?: string;
  caseStudyCount?: number;
  status?: 'active' | 'completed' | 'warning';
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'gray';
}

const typeStyles: Record<StrategyNodeType, string> = {
  current: 'bg-gray-900 text-white border-gray-700 dark:bg-white dark:text-gray-900 dark:border-gray-200',
  decision: 'bg-white text-gray-900 border-gray-200 dark:bg-dark-surface dark:text-white dark:border-dark-border',
  outcome: 'bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-900 border-emerald-200 dark:from-emerald-950/30 dark:to-green-950/30 dark:text-emerald-100 dark:border-emerald-800',
  milestone: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-800',
};

const colorAccents: Record<string, { bg: string; text: string; border: string }> = {
  green: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500',
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500',
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500',
  },
  gray: {
    bg: 'bg-gray-500',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500',
  },
};

/**
 * StrategyNode - Custom ReactFlow node for strategy maps.
 *
 * Node Types:
 * - current: Current state (dark bg, center position)
 * - decision: Strategic fork point (white bg, branching)
 * - outcome: Final result (green gradient)
 * - milestone: Key checkpoint (blue bg)
 *
 * @example
 * const nodes = [
 *   { id: '1', type: 'strategy', data: { label: 'Current State', type: 'current' }, position: { x: 0, y: 0 } },
 *   { id: '2', type: 'strategy', data: { label: 'Go Vertical', type: 'decision', probability: 87 }, position: { x: 200, y: 100 } },
 * ];
 */
export const StrategyNode = memo(({ data, selected }: NodeProps<StrategyNodeData>) => {
  const colorScheme = colorAccents[data.color || 'gray'];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'px-5 py-4 rounded-xl border-2 shadow-lg min-w-[180px] max-w-[250px]',
        typeStyles[data.type],
        selected && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-dark-background'
      )}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          '!w-3 !h-3 !border-2 !border-white dark:!border-dark-surface',
          data.type === 'current' ? '!bg-gray-400' : '!bg-gray-400'
        )}
      />

      {/* Status indicator */}
      {data.status && (
        <div className="absolute -top-2 -right-2">
          {data.status === 'completed' && (
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          )}
          {data.status === 'warning' && (
            <div className="bg-amber-500 rounded-full p-1">
              <AlertCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="text-center">
        <p className="font-semibold text-base leading-tight">{data.label}</p>

        {data.description && (
          <p className="text-xs opacity-70 mt-1 line-clamp-2">{data.description}</p>
        )}

        {/* Probability indicator */}
        {data.probability !== undefined && (
          <div className="mt-3 flex items-center justify-center gap-1">
            <span className={cn('text-2xl font-bold', colorScheme.text)}>
              {data.probability}%
            </span>
            <span className="text-xs opacity-60">success</span>
          </div>
        )}

        {/* Meta info row */}
        {(data.timeline || data.capital || data.caseStudyCount) && (
          <div className="mt-3 pt-3 border-t border-current/10 flex justify-center gap-4 text-xs opacity-70">
            {data.timeline && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {data.timeline}
              </div>
            )}
            {data.capital && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {data.capital}
              </div>
            )}
            {data.caseStudyCount && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {data.caseStudyCount}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          '!w-3 !h-3 !border-2 !border-white dark:!border-dark-surface',
          '!bg-gray-400'
        )}
      />
    </motion.div>
  );
});

StrategyNode.displayName = 'StrategyNode';
