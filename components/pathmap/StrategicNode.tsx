'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Flag,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { MetricBadge } from './MetricBadge';
import { cn } from '@/lib/utils';

// Node types and their visual representation
const nodeTypeConfig = {
  decision: {
    icon: GitBranch,
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    label: 'Decision',
  },
  phase: {
    icon: Flag,
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/50',
    label: 'Phase',
  },
  milestone: {
    icon: CheckCircle2,
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
    label: 'Milestone',
  },
  outcome: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    label: 'Outcome',
  },
  risk: {
    icon: AlertTriangle,
    borderColor: 'border-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    label: 'Risk',
  },
};

export interface StrategicNodeData {
  id: string;
  label: string;
  description?: string;
  type: keyof typeof nodeTypeConfig;
  disclosureLevel: number;
  cost?: string;
  durationWeeks?: number;
  successProbability?: string;
  riskFactors?: string[];
  confidenceLevel?: string;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: (nodeId: string) => void;
  onSelect?: (nodeId: string) => void;
}

function StrategicNodeComponent({ data, selected }: NodeProps<StrategicNodeData>) {
  const config = nodeTypeConfig[data.type] || nodeTypeConfig.phase;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative min-w-[200px] max-w-[280px] rounded-lg border-2 bg-card shadow-md transition-all',
        config.borderColor,
        selected && 'ring-2 ring-primary ring-offset-2',
        'hover:shadow-lg'
      )}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
      />

      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-t-md cursor-pointer',
          config.bgColor
        )}
        onClick={() => data.hasChildren && data.onToggleExpand(data.id)}
      >
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {config.label}
        </span>
        {data.hasChildren && (
          <motion.div
            className="ml-auto"
            animate={{ rotate: data.isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-3">
        <h3 className="font-semibold text-sm leading-tight">{data.label}</h3>

        {/* Layer 2 content: Show basic metrics */}
        {data.disclosureLevel >= 2 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              {data.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {data.description}
                </p>
              )}

              {/* Metrics row */}
              <div className="flex flex-wrap gap-1.5">
                {data.successProbability && (
                  <MetricBadge
                    type="success-rate"
                    value={data.successProbability}
                    size="sm"
                  />
                )}
                {data.durationWeeks && (
                  <MetricBadge
                    type="timeline"
                    value={Math.ceil(data.durationWeeks / 4)}
                    size="sm"
                  />
                )}
                {data.cost && parseFloat(data.cost) > 0 && (
                  <MetricBadge type="cost" value={data.cost} size="sm" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Layer 3 content: Show risk factors and confidence */}
        {data.disclosureLevel >= 3 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t"
            >
              {data.riskFactors && data.riskFactors.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Risk Factors:
                  </span>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {data.riskFactors.slice(0, 2).map((risk, i) => (
                      <li key={i} className="truncate">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.confidenceLevel && (
                <div className="mt-2">
                  <MetricBadge
                    type="confidence"
                    value={data.confidenceLevel}
                    size="sm"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* View Details button (shows at Layer 2+) */}
        {data.disclosureLevel >= 2 && data.onSelect && (
          <button
            onClick={() => data.onSelect?.(data.id)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors"
          >
            <Info className="h-3 w-3" />
            View Details
          </button>
        )}
      </div>

      {/* Bottom Handle */}
      {data.hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
        />
      )}
    </div>
  );
}

export const StrategicNode = memo(StrategicNodeComponent);
