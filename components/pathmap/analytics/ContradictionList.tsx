'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wrench,
} from 'lucide-react';
import type { Contradiction, ContradictionSummary } from '@/lib/analytics/contradiction-detector';

interface ContradictionListProps {
  summary: ContradictionSummary;
  className?: string;
}

/**
 * Contradiction List
 *
 * Displays detected contradictions with severity indicators
 * and suggested actions
 */
export function ContradictionList({ summary, className }: ContradictionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSeverityIcon = (severity: Contradiction['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityStyles = (severity: Contradiction['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30';
    }
  };

  if (summary.totalContradictions === 0) {
    return (
      <div className={`p-6 border rounded-lg text-center ${className || ''}`}>
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-3">
          <Info className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-medium">No Contradictions Detected</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Predictions are aligning well with actual outcomes
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Summary Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Detected Contradictions</h3>
        <div className="flex items-center gap-3 text-sm">
          {summary.bySeverity.high > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {summary.bySeverity.high}
            </span>
          )}
          {summary.bySeverity.medium > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              {summary.bySeverity.medium}
            </span>
          )}
          {summary.bySeverity.low > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <Info className="h-4 w-4" />
              {summary.bySeverity.low}
            </span>
          )}
        </div>
      </div>

      {/* Contradiction List */}
      <div className="space-y-3">
        {summary.topContradictions.map((contradiction) => (
          <div
            key={contradiction.id}
            className={`border rounded-lg overflow-hidden ${getSeverityStyles(contradiction.severity)}`}
          >
            <button
              onClick={() =>
                setExpandedId(
                  expandedId === contradiction.id ? null : contradiction.id
                )
              }
              className="w-full flex items-center gap-3 p-3 text-left"
            >
              {getSeverityIcon(contradiction.severity)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {contradiction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contradiction.pathName} • {contradiction.type}
                </p>
              </div>
              {expandedId === contradiction.id ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {expandedId === contradiction.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 border-t border-current/10">
                    {/* Evidence */}
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-center p-2 bg-background rounded">
                        <p className="text-xs text-muted-foreground">
                          Predicted
                        </p>
                        <p className="font-medium text-sm">
                          {contradiction.evidence.predicted}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <p className="text-xs text-muted-foreground">Actual</p>
                        <p className="font-medium text-sm">
                          {contradiction.evidence.actual}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <p className="text-xs text-muted-foreground">
                          Variance
                        </p>
                        <p
                          className={`font-medium text-sm ${Math.abs(contradiction.evidence.variance) > 25 ? 'text-red-600' : 'text-yellow-600'}`}
                        >
                          {contradiction.evidence.variance > 0 ? '+' : ''}
                          {contradiction.evidence.variance.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Suggested Action */}
                    <div className="mt-3 p-2 bg-background rounded-lg">
                      <div className="flex items-start gap-2">
                        <Wrench className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Suggested Action
                          </p>
                          <p className="text-sm">
                            {contradiction.suggestedAction}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Path Link */}
                    <a
                      href={`/pathmap/analytics/${contradiction.pathId}`}
                      className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline"
                    >
                      View Path Analytics
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Contradiction Badge
 *
 * Small indicator showing contradiction count
 */
export function ContradictionBadge({
  count,
  highSeverity,
}: {
  count: number;
  highSeverity: number;
}) {
  if (count === 0) return null;

  return (
    <span
      className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
      ${
        highSeverity > 0
          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
      }
    `}
    >
      <AlertTriangle className="h-3 w-3" />
      {count}
    </span>
  );
}

export default ContradictionList;
