'use client';

import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface StrategyEdgeData {
  label?: string;
  animated?: boolean;
  probability?: number;
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'gray';
}

const colorMap: Record<string, string> = {
  green: '#10b981',  // emerald-500
  blue: '#3b82f6',   // blue-500
  purple: '#8b5cf6', // purple-500
  amber: '#f59e0b',  // amber-500
  gray: '#9ca3af',   // gray-400
};

/**
 * StrategyEdge - Custom animated edge for strategy maps.
 *
 * Features:
 * - Animated dash pattern (optional)
 * - Color-coded by path type
 * - Label with probability
 * - Smooth bezier curves
 *
 * @example
 * const edges = [
 *   {
 *     id: 'e1-2',
 *     source: '1',
 *     target: '2',
 *     type: 'strategy',
 *     data: { label: 'Vertical', probability: 87, color: 'green', animated: true }
 *   }
 * ];
 */
export const StrategyEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style,
    markerEnd,
  }: EdgeProps<StrategyEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const strokeColor = colorMap[data?.color || 'gray'];

    return (
      <>
        {/* Background edge (for glow effect) */}
        <BaseEdge
          id={`${id}-bg`}
          path={edgePath}
          style={{
            ...style,
            strokeWidth: 6,
            stroke: 'transparent',
          }}
        />

        {/* Main edge */}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: 2,
            stroke: strokeColor,
            strokeDasharray: data?.animated ? '5 5' : undefined,
            animation: data?.animated ? 'dash 1s linear infinite' : undefined,
          }}
        />

        {/* Animated particles (if animated) */}
        {data?.animated && (
          <motion.circle
            r={4}
            fill="currentColor"
            className={cn(
              data?.color === 'green' && 'text-emerald-500',
              data?.color === 'blue' && 'text-blue-500',
              data?.color === 'purple' && 'text-purple-500',
              data?.color === 'amber' && 'text-amber-500',
              (!data?.color || data?.color === 'gray') && 'text-gray-400'
            )}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </motion.circle>
        )}

        {/* Label */}
        {(data?.label || data?.probability !== undefined) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs font-medium',
                  'bg-white dark:bg-dark-surface',
                  'border border-gray-200 dark:border-dark-border',
                  'shadow-sm'
                )}
              >
                {data?.label && (
                  <span className="text-gray-700 dark:text-gray-300">
                    {data.label}
                  </span>
                )}
                {data?.probability !== undefined && (
                  <span
                    className={cn(
                      'ml-1 font-bold',
                      data?.color === 'green' && 'text-emerald-600 dark:text-emerald-400',
                      data?.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                      data?.color === 'purple' && 'text-purple-600 dark:text-purple-400',
                      data?.color === 'amber' && 'text-amber-600 dark:text-amber-400',
                      (!data?.color || data?.color === 'gray') && 'text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {data.probability}%
                  </span>
                )}
              </motion.div>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

StrategyEdge.displayName = 'StrategyEdge';
