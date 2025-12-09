'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  type NodeTypes,
  type FitViewOptions,
} from 'reactflow';
import dagre from 'dagre';
import { StrategicNode, type StrategicNodeData } from './StrategicNode';
import type { DecisionNode } from '@/database/schema';
import type { PathMapAnalytics } from '@/hooks/usePathMapAnalytics';
import 'reactflow/dist/style.css';

// Node dimensions for layout calculation
const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Custom node types for ReactFlow
const nodeTypes: NodeTypes = {
  strategic: StrategicNode,
};

// Fit view options
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
  maxZoom: 1,
};

interface TreeNavigatorProps {
  nodes: DecisionNode[];
  disclosureLevel?: 1 | 2 | 3;
  onNodeSelect?: (node: DecisionNode) => void;
  analytics?: PathMapAnalytics;
  className?: string;
}

export function TreeNavigator({
  nodes: dbNodes,
  disclosureLevel = 2,
  onNodeSelect,
  analytics,
  className,
}: TreeNavigatorProps) {
  // Track which nodes are expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(dbNodes.filter((n) => !n.parentId).map((n) => n.id))
  );

  // Calculate node depth
  const getNodeDepth = useCallback(
    (nodeId: string): number => {
      const node = dbNodes.find((n) => n.id === nodeId);
      if (!node || !node.parentId) return 0;
      return 1 + getNodeDepth(node.parentId);
    },
    [dbNodes]
  );

  // Toggle node expansion
  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      const node = dbNodes.find((n) => n.id === nodeId);
      const isExpanding = !expandedNodes.has(nodeId);

      // Track analytics
      if (analytics && node) {
        if (isExpanding) {
          analytics.trackNodeExpanded({
            nodeId: node.id,
            nodeLabel: node.label,
            nodeType: node.type,
            parentNodeId: node.parentId,
            depth: getNodeDepth(node.id),
            disclosureLevel,
          });
        } else {
          const childrenCount = dbNodes.filter((n) => n.parentId === nodeId).length;
          analytics.trackNodeCollapsed({
            nodeId: node.id,
            nodeLabel: node.label,
            childrenHidden: childrenCount,
          });
        }
      }

      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          // Collapse: remove this node and all descendants
          const nodesToRemove = new Set<string>();
          const findDescendants = (id: string) => {
            nodesToRemove.add(id);
            dbNodes
              .filter((n) => n.parentId === id)
              .forEach((child) => findDescendants(child.id));
          };
          // Don't remove the clicked node, just its children
          dbNodes
            .filter((n) => n.parentId === nodeId)
            .forEach((child) => findDescendants(child.id));
          nodesToRemove.forEach((id) => newSet.delete(id));
          newSet.delete(nodeId);
        } else {
          // Expand: show immediate children
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    [dbNodes, expandedNodes, analytics, disclosureLevel, getNodeDepth]
  );

  // Filter visible nodes based on expansion state
  const visibleNodes = useMemo(() => {
    const visible = new Set<string>();

    // Always show root nodes
    dbNodes.filter((n) => !n.parentId).forEach((n) => visible.add(n.id));

    // Show children of expanded nodes
    expandedNodes.forEach((expandedId) => {
      dbNodes
        .filter((n) => n.parentId === expandedId)
        .forEach((child) => visible.add(child.id));
    });

    return dbNodes.filter((n) => visible.has(n.id));
  }, [dbNodes, expandedNodes]);

  // Handle node selection for evidence panel
  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      if (onNodeSelect) {
        const node = dbNodes.find((n) => n.id === nodeId);
        if (node) {
          onNodeSelect(node);
        }
      }
    },
    [dbNodes, onNodeSelect]
  );

  // Convert DB nodes to ReactFlow nodes
  const reactFlowNodes: Node<StrategicNodeData>[] = useMemo(() => {
    return visibleNodes.map((node) => {
      const hasChildren = dbNodes.some((n) => n.parentId === node.id);
      const isExpanded = expandedNodes.has(node.id);

      return {
        id: node.id,
        type: 'strategic',
        position: node.position || { x: 0, y: 0 },
        data: {
          id: node.id,
          label: node.label,
          description: node.description || undefined,
          type: (node.type as StrategicNodeData['type']) || 'phase',
          disclosureLevel,
          cost: node.cost || undefined,
          durationWeeks: node.durationWeeks || undefined,
          successProbability: node.successProbability || undefined,
          riskFactors: node.riskFactors || [],
          confidenceLevel: node.confidenceLevel || undefined,
          hasChildren,
          isExpanded,
          onToggleExpand: handleToggleExpand,
          onSelect: handleNodeSelect,
        },
      };
    });
  }, [visibleNodes, dbNodes, expandedNodes, disclosureLevel, handleToggleExpand, handleNodeSelect]);

  // Convert to ReactFlow edges
  const reactFlowEdges: Edge[] = useMemo(() => {
    return visibleNodes
      .filter((node) => node.parentId && visibleNodes.some((n) => n.id === node.parentId))
      .map((node) => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId!,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
        },
      }));
  }, [visibleNodes]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(reactFlowNodes, reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes when layout changes
  useMemo(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className={className} style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
