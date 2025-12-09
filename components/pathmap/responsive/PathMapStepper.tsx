'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  DollarSign,
  TrendingUp,
  Info,
} from 'lucide-react';
import type { TreeNode } from '../TreeNavigator';

interface PathMapStepperProps {
  nodes: TreeNode[];
  disclosureLevel?: 1 | 2 | 3;
  onNodeSelect?: (node: TreeNode) => void;
  onComplete?: () => void;
  className?: string;
}

/**
 * PathMap Stepper Component
 *
 * Wizard-style navigation for mobile devices.
 * Presents one decision/node at a time with navigation controls.
 */
export function PathMapStepper({
  nodes,
  disclosureLevel = 2,
  onNodeSelect,
  onComplete,
  className,
}: PathMapStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Filter visible nodes by disclosure level and flatten to linear sequence
  const visibleNodes = useMemo(() => {
    // Get nodes filtered by disclosure level
    const filtered = nodes.filter((n) => n.disclosureLevel <= disclosureLevel);

    // Sort by depth then sort order
    const getDepth = (node: TreeNode): number => {
      if (!node.parentId) return 0;
      const parent = nodes.find((n) => n.id === node.parentId);
      return parent ? 1 + getDepth(parent) : 0;
    };

    return [...filtered].sort((a, b) => {
      const depthA = getDepth(a);
      const depthB = getDepth(b);
      if (depthA !== depthB) return depthA - depthB;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [nodes, disclosureLevel]);

  const currentNode = visibleNodes[currentIndex];
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === visibleNodes.length - 1;
  const progress = ((currentIndex + 1) / visibleNodes.length) * 100;

  const goNext = useCallback(() => {
    setCompletedSteps((prev) => new Set([...prev, currentIndex]));
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, visibleNodes.length - 1));
    }
  }, [currentIndex, isLastStep, onComplete, visibleNodes.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Get type-based styling
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'decision':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30';
      case 'phase':
        return 'text-green-500 bg-green-50 dark:bg-green-950/30';
      case 'milestone':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-950/30';
      case 'outcome':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900';
    }
  };

  if (!currentNode) {
    return (
      <div className={`text-center text-muted-foreground p-8 ${className || ''}`}>
        No nodes to display at this disclosure level.
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Progress Bar */}
      <div className="flex-shrink-0 h-1 bg-muted/50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-3 px-4 overflow-x-auto">
        {visibleNodes.map((node, idx) => (
          <button
            key={node.id}
            onClick={() => goToStep(idx)}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              text-xs font-medium transition-colors touch-manipulation
              ${
                idx === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps.has(idx)
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {completedSteps.has(idx) ? (
              <Check className="h-4 w-4" />
            ) : (
              idx + 1
            )}
          </button>
        ))}
      </div>

      {/* Step Counter */}
      <div className="flex-shrink-0 text-center text-sm text-muted-foreground pb-2">
        Step {currentIndex + 1} of {visibleNodes.length}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Type Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`
                  text-xs font-medium px-2 py-1 rounded-full
                  ${getTypeColor(currentNode.type)}
                `}
              >
                {currentNode.type.charAt(0).toUpperCase() + currentNode.type.slice(1)}
              </span>
              {currentNode.confidenceLevel && (
                <span className="text-xs text-muted-foreground">
                  Confidence: {currentNode.confidenceLevel}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold">{currentNode.label}</h2>

            {/* Description */}
            {currentNode.description && (
              <p className="text-muted-foreground">{currentNode.description}</p>
            )}

            {/* Metrics (Layer 2+) */}
            {disclosureLevel >= 2 && (
              <div className="grid grid-cols-3 gap-3">
                {currentNode.cost && (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="text-sm font-medium">
                      ${parseFloat(currentNode.cost).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Cost</div>
                  </div>
                )}
                {currentNode.durationWeeks && (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-sm font-medium">
                      {currentNode.durationWeeks} weeks
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                )}
                {currentNode.successProbability && (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <div className="text-sm font-medium">
                      {parseFloat(currentNode.successProbability).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                )}
              </div>
            )}

            {/* Dependencies (Layer 2+) */}
            {disclosureLevel >= 2 &&
              currentNode.dependencies &&
              currentNode.dependencies.length > 0 && (
                <div className="p-3 border rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Dependencies
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentNode.dependencies.map((dep, idx) => (
                      <li key={idx}>• {dep}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Risk Factors (Layer 3) */}
            {disclosureLevel >= 3 &&
              currentNode.riskFactors &&
              currentNode.riskFactors.length > 0 && (
                <div className="p-3 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <h4 className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">
                    Risk Factors
                  </h4>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    {currentNode.riskFactors.map((risk, idx) => (
                      <li key={idx}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Mitigation Strategies (Layer 3) */}
            {disclosureLevel >= 3 &&
              currentNode.mitigationStrategies &&
              currentNode.mitigationStrategies.length > 0 && (
                <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-950/30">
                  <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-400">
                    Mitigation Strategies
                  </h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    {currentNode.mitigationStrategies.map((strategy, idx) => (
                      <li key={idx}>• {strategy}</li>
                    ))}
                  </ul>
                </div>
              )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-t bg-background">
        <button
          onClick={goPrev}
          disabled={isFirstStep}
          className={`
            flex items-center gap-1 px-4 py-2.5 rounded-lg
            font-medium transition-colors touch-manipulation
            ${
              isFirstStep
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-foreground hover:bg-muted'
            }
          `}
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>

        <button
          onClick={() => onNodeSelect?.(currentNode)}
          className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
        >
          View Details
        </button>

        <button
          onClick={goNext}
          className="flex items-center gap-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors touch-manipulation"
        >
          {isLastStep ? (
            <>
              Complete
              <Check className="h-5 w-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PathMapStepper;
