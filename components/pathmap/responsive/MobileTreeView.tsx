'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import type { TreeNode } from '../TreeNavigator';

interface MobileTreeViewProps {
  nodes: TreeNode[];
  disclosureLevel?: 1 | 2 | 3;
  onNodeSelect?: (node: TreeNode) => void;
  className?: string;
}

/**
 * Mobile Tree View Component
 *
 * Accordion-based tree navigation for mobile devices.
 * Replaces ReactFlow canvas on small screens.
 */
export function MobileTreeView({
  nodes,
  disclosureLevel = 2,
  onNodeSelect,
  className,
}: MobileTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Expand root nodes by default
    return new Set(nodes.filter((n) => !n.parentId).map((n) => n.id));
  });

  // Build tree structure
  const nodeMap = useMemo(() => {
    const map = new Map<string, TreeNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const getChildren = useCallback(
    (parentId: string): TreeNode[] => {
      return nodes.filter((n) => n.parentId === parentId);
    },
    [nodes]
  );

  const getDepth = useCallback(
    (nodeId: string): number => {
      const node = nodeMap.get(nodeId);
      if (!node || !node.parentId) return 0;
      return 1 + getDepth(node.parentId);
    },
    [nodeMap]
  );

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Get type-based styling
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'decision':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-900',
          icon: 'text-blue-500',
        };
      case 'phase':
        return {
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-900',
          icon: 'text-green-500',
        };
      case 'milestone':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-900',
          icon: 'text-purple-500',
        };
      case 'outcome':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-900',
          icon: 'text-amber-500',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-500',
        };
    }
  };

  // Render a single node
  const renderNode = (node: TreeNode) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const depth = getDepth(node.id);
    const styles = getTypeStyles(node.type);

    // Filter by disclosure level
    if (node.disclosureLevel > disclosureLevel) {
      return null;
    }

    return (
      <div key={node.id} className="relative">
        {/* Node Card */}
        <div
          className={`
            relative border rounded-lg overflow-hidden
            ${styles.bg} ${styles.border}
            ${depth > 0 ? 'ml-4' : ''}
          `}
          style={{ marginLeft: depth * 16 }}
        >
          {/* Connector line for children */}
          {depth > 0 && (
            <div
              className="absolute left-0 top-1/2 w-4 h-px bg-gray-300 dark:bg-gray-700"
              style={{ left: -16 }}
            />
          )}

          {/* Header */}
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpand(node.id);
              }
              onNodeSelect?.(node);
            }}
            className="w-full flex items-center gap-3 p-4 text-left touch-manipulation"
          >
            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <span className={styles.icon}>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </span>
            )}
            {!hasChildren && <span className="w-5" />}

            {/* Label and Type */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{node.label}</span>
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${styles.bg} ${styles.icon} border ${styles.border}
                  `}
                >
                  {node.type}
                </span>
              </div>

              {/* Description (if expanded or no children) */}
              {node.description && (!hasChildren || isExpanded) && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {node.description}
                </p>
              )}
            </div>
          </button>

          {/* Metrics (Layer 2+) */}
          {disclosureLevel >= 2 && (
            <div className="px-4 pb-3 flex flex-wrap gap-3 text-sm">
              {node.cost && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  {parseFloat(node.cost).toLocaleString()}
                </span>
              )}
              {node.durationWeeks && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {node.durationWeeks}w
                </span>
              )}
              {node.successProbability && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {parseFloat(node.successProbability).toFixed(0)}%
                </span>
              )}
            </div>
          )}

          {/* Risk Factors (Layer 3) */}
          {disclosureLevel >= 3 &&
            node.riskFactors &&
            node.riskFactors.length > 0 && (
              <div className="px-4 pb-3">
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  Risk Factors
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {node.riskFactors.slice(0, 3).map((risk, idx) => (
                    <li key={idx} className="truncate">
                      • {risk}
                    </li>
                  ))}
                  {node.riskFactors.length > 3 && (
                    <li className="text-muted-foreground/60">
                      +{node.riskFactors.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2 space-y-2"
            >
              {children.map((child) => renderNode(child))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Get root nodes
  const rootNodes = nodes.filter((n) => !n.parentId);

  return (
    <div className={`space-y-3 ${className || ''}`}>
      {rootNodes.map((node) => renderNode(node))}
    </div>
  );
}

export default MobileTreeView;
