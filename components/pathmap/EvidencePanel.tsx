'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  ExternalLink,
  TrendingUp,
  Shield,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { MetricBadge } from './MetricBadge';
import { cn } from '@/lib/utils';
import type { DecisionNode } from '@/database/schema';
import type { PathMapAnalytics } from '@/hooks/usePathMapAnalytics';

interface EvidencePanelProps {
  node: DecisionNode | null;
  onClose: () => void;
  analytics?: PathMapAnalytics;
  className?: string;
}

export function EvidencePanel({ node, onClose, analytics, className }: EvidencePanelProps) {
  if (!node) return null;

  const benchmarkEntries = node.benchmarkData
    ? Object.entries(node.benchmarkData as Record<string, number>)
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed right-0 top-0 h-full w-96 bg-card border-l shadow-xl z-50 overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h2 className="font-semibold text-lg truncate pr-2">{node.label}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-6">
          {/* Description */}
          {node.description && (
            <section>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {node.description}
              </p>
            </section>
          )}

          {/* Key Metrics */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Key Metrics
            </h3>
            <div className="flex flex-wrap gap-2">
              {node.successProbability && (
                <MetricBadge
                  type="success-rate"
                  value={node.successProbability}
                  label="Success"
                />
              )}
              {node.durationWeeks && (
                <MetricBadge
                  type="timeline"
                  value={Math.ceil(node.durationWeeks / 4)}
                  label="Duration"
                />
              )}
              {node.cost && parseFloat(node.cost) > 0 && (
                <MetricBadge type="cost" value={node.cost} label="Est. Cost" />
              )}
              {node.confidenceLevel && (
                <MetricBadge
                  type="confidence"
                  value={node.confidenceLevel}
                  label="Confidence"
                />
              )}
            </div>
          </section>

          {/* Dependencies */}
          {node.dependencies && node.dependencies.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dependencies
              </h3>
              <ul className="space-y-1.5">
                {node.dependencies.map((dep, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2 text-foreground"
                  >
                    <span className="text-muted-foreground">•</span>
                    {dep}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Risk Factors */}
          {node.riskFactors && node.riskFactors.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {node.riskFactors.map((risk, i) => (
                  <li
                    key={i}
                    className="text-sm p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md text-red-800 dark:text-red-200"
                  >
                    {risk}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Mitigation Strategies */}
          {node.mitigationStrategies && node.mitigationStrategies.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Mitigation Strategies
              </h3>
              <ul className="space-y-2">
                {node.mitigationStrategies.map((strategy, i) => (
                  <li
                    key={i}
                    className="text-sm p-2 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 rounded-md text-green-800 dark:text-green-200"
                  >
                    {strategy}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Benchmark Data */}
          {benchmarkEntries.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Benchmark Data
              </h3>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                {benchmarkEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-medium">
                      {typeof value === 'number' && value < 1
                        ? `${(value * 100).toFixed(0)}%`
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Linked Documents */}
          {node.linkedDocuments && node.linkedDocuments.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Related Documents
              </h3>
              <div className="space-y-2">
                {(node.linkedDocuments as { title: string; url: string }[]).map(
                  (doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        analytics?.trackDocumentClicked(node.id, doc.url, doc.title);
                      }}
                      className="flex items-center gap-2 p-2 bg-muted/50 hover:bg-muted rounded-md transition-colors text-sm group"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{doc.title}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )
                )}
              </div>
            </section>
          )}

          {/* Case Studies Placeholder */}
          {node.caseStudyIds && node.caseStudyIds.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Related Case Studies
              </h3>
              <p className="text-sm text-muted-foreground italic">
                {node.caseStudyIds.length} case studies available.
                Click to explore detailed examples.
              </p>
            </section>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
