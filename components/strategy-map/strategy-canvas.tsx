'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StrategyNode, StrategyNodeData } from './strategy-node';
import { StrategyEdge, StrategyEdgeData } from './strategy-edge';

// Register custom node and edge types
const nodeTypes: NodeTypes = {
  strategy: StrategyNode,
};

const edgeTypes: EdgeTypes = {
  strategy: StrategyEdge,
};

interface StrategyCanvasProps {
  initialNodes: Node<StrategyNodeData>[];
  initialEdges: Edge<StrategyEdgeData>[];
  onNodeClick?: (node: Node<StrategyNodeData>) => void;
  onEdgeClick?: (edge: Edge<StrategyEdgeData>) => void;
  className?: string;
  readOnly?: boolean;
}

/**
 * StrategyCanvas - Interactive strategy map using ReactFlow.
 *
 * Features:
 * - Custom strategy nodes with probability indicators
 * - Animated edges with particles
 * - Minimap for navigation
 * - Zoom controls
 * - Click handlers for node/edge interaction
 *
 * @example
 * <StrategyCanvas
 *   initialNodes={nodes}
 *   initialEdges={edges}
 *   onNodeClick={(node) => openDetailPanel(node)}
 * />
 */
export function StrategyCanvas({
  initialNodes,
  initialEdges,
  onNodeClick,
  onEdgeClick,
  className,
  readOnly = false,
}: StrategyCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'strategy',
            data: { color: 'gray', animated: false },
          },
          eds
        )
      );
    },
    [setEdges, readOnly]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<StrategyNodeData>) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge<StrategyEdgeData>) => {
      onEdgeClick?.(edge);
    },
    [onEdgeClick]
  );

  // Default viewport settings
  const defaultViewport = useMemo(() => ({ x: 100, y: 50, zoom: 0.8 }), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full h-[600px] rounded-xl overflow-hidden', className)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        attributionPosition="bottom-left"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        className="bg-gray-50 dark:bg-dark-background"
      >
        {/* Background grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(0,0,0,0.05)"
          className="dark:!bg-dark-background"
        />

        {/* Controls */}
        <Controls
          showInteractive={!readOnly}
          className="!bg-white dark:!bg-dark-surface !border-gray-200 dark:!border-dark-border !rounded-lg !shadow-md"
        />

        {/* Minimap */}
        <MiniMap
          nodeColor={(node: Node<StrategyNodeData>) => {
            const data = node.data;
            if (data.type === 'current') return '#1f2937';
            if (data.type === 'outcome') return '#10b981';
            if (data.type === 'milestone') return '#3b82f6';
            return '#9ca3af';
          }}
          maskColor="rgba(0,0,0,0.1)"
          className="!bg-white dark:!bg-dark-surface !border-gray-200 dark:!border-dark-border !rounded-lg"
        />
      </ReactFlow>
    </motion.div>
  );
}

// Helper function to create example strategy map data
export function createExampleStrategyMap() {
  const nodes: Node<StrategyNodeData>[] = [
    {
      id: 'current',
      type: 'strategy',
      position: { x: 250, y: 0 },
      data: {
        label: 'Current State',
        type: 'current',
        description: 'Video Production, $650K revenue',
      },
    },
    {
      id: 'vertical',
      type: 'strategy',
      position: { x: 0, y: 150 },
      data: {
        label: 'Vertical Specialization',
        type: 'decision',
        probability: 87,
        timeline: '16 mo',
        capital: '$35K',
        caseStudyCount: 8,
        color: 'green',
      },
    },
    {
      id: 'content',
      type: 'strategy',
      position: { x: 250, y: 150 },
      data: {
        label: 'Content-Led Growth',
        type: 'decision',
        probability: 75,
        timeline: '24 mo',
        capital: '$15K',
        caseStudyCount: 4,
        color: 'blue',
      },
    },
    {
      id: 'partnership',
      type: 'strategy',
      position: { x: 500, y: 150 },
      data: {
        label: 'Partnership Model',
        type: 'decision',
        probability: 60,
        timeline: '18 mo',
        capital: '$12K',
        caseStudyCount: 3,
        color: 'purple',
      },
    },
    {
      id: 'healthcare',
      type: 'strategy',
      position: { x: -50, y: 300 },
      data: {
        label: 'Healthcare Vertical',
        type: 'milestone',
        description: 'Highest margin opportunity',
        probability: 92,
        color: 'green',
      },
    },
    {
      id: 'biotech',
      type: 'strategy',
      position: { x: 100, y: 300 },
      data: {
        label: 'Biotech Vertical',
        type: 'milestone',
        probability: 85,
        color: 'green',
      },
    },
    {
      id: 'outcome-vertical',
      type: 'strategy',
      position: { x: 25, y: 450 },
      data: {
        label: '$2M+ Revenue',
        type: 'outcome',
        description: '28% → 42% margin',
        status: 'completed',
      },
    },
    {
      id: 'youtube',
      type: 'strategy',
      position: { x: 250, y: 300 },
      data: {
        label: 'YouTube Channel',
        type: 'milestone',
        probability: 70,
        color: 'blue',
      },
    },
    {
      id: 'agency-partner',
      type: 'strategy',
      position: { x: 500, y: 300 },
      data: {
        label: 'Agency Partnership',
        type: 'milestone',
        probability: 65,
        color: 'purple',
      },
    },
  ];

  const edges: Edge<StrategyEdgeData>[] = [
    {
      id: 'e-current-vertical',
      source: 'current',
      target: 'vertical',
      type: 'strategy',
      data: { animated: true, color: 'green', probability: 87 },
    },
    {
      id: 'e-current-content',
      source: 'current',
      target: 'content',
      type: 'strategy',
      data: { color: 'blue', probability: 75 },
    },
    {
      id: 'e-current-partnership',
      source: 'current',
      target: 'partnership',
      type: 'strategy',
      data: { color: 'purple', probability: 60 },
    },
    {
      id: 'e-vertical-healthcare',
      source: 'vertical',
      target: 'healthcare',
      type: 'strategy',
      data: { animated: true, color: 'green', label: 'Recommended' },
    },
    {
      id: 'e-vertical-biotech',
      source: 'vertical',
      target: 'biotech',
      type: 'strategy',
      data: { color: 'green' },
    },
    {
      id: 'e-healthcare-outcome',
      source: 'healthcare',
      target: 'outcome-vertical',
      type: 'strategy',
      data: { animated: true, color: 'green' },
    },
    {
      id: 'e-biotech-outcome',
      source: 'biotech',
      target: 'outcome-vertical',
      type: 'strategy',
      data: { color: 'green' },
    },
    {
      id: 'e-content-youtube',
      source: 'content',
      target: 'youtube',
      type: 'strategy',
      data: { color: 'blue' },
    },
    {
      id: 'e-partnership-agency',
      source: 'partnership',
      target: 'agency-partner',
      type: 'strategy',
      data: { color: 'purple' },
    },
  ];

  return { nodes, edges };
}
