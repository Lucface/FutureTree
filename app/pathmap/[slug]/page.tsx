'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import { TreeNavigator, EvidencePanel, type TreeNode } from '@/components/pathmap';
import { usePathMapAnalytics } from '@/hooks/usePathMapAnalytics';
import type { DecisionNode, StrategicPath } from '@/database/schema';

// Mock path data (matches seed)
const mockPaths: Record<string, StrategicPath> = {
  'vertical-specialization': {
    id: '1',
    name: 'Vertical Specialization',
    slug: 'vertical-specialization',
    summary: 'Become the go-to expert in a specific industry niche',
    description:
      'Transform from a generalist service provider to a specialized expert commanding premium rates.',
    successRate: '72.00',
    caseCount: 34,
    timelineP25: 6,
    timelineP75: 18,
    capitalP25: '5000.00',
    capitalP75: '25000.00',
    riskScore: '0.35',
    confidenceLevel: 'high',
    lastAggregated: new Date(),
    rootNodeId: 'v_root',
    icon: 'Target',
    color: 'blue',
    sortOrder: 1,
    isActive: true,
    contradictionFlags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Mock nodes data (matches seed structure)
const mockNodes: Record<string, DecisionNode[]> = {
  'vertical-specialization': [
    {
      id: 'v_root',
      pathId: '1',
      parentId: null,
      label: 'Choose Your Vertical',
      description:
        'Select the industry vertical where you have existing expertise, network connections, or passion.',
      type: 'decision',
      disclosureLevel: 1,
      cost: '0.00',
      durationWeeks: 2,
      successProbability: '95.00',
      dependencies: [],
      riskFactors: ['Analysis paralysis', 'Market too small', 'Too competitive'],
      caseStudyIds: [],
      benchmarkData: {},
      mitigationStrategies: [],
      linkedDocuments: [],
      children: ['v_identify'],
      sortOrder: 0,
      position: { x: 250, y: 0 },
      confidenceLevel: 'high',
      lastValidated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'v_identify',
      pathId: '1',
      parentId: 'v_root',
      label: 'Identify Pain Points',
      description:
        'Research and validate the top 3-5 recurring problems your target vertical faces.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '500.00',
      durationWeeks: 4,
      successProbability: '85.00',
      dependencies: ['Industry contacts', 'Research time'],
      riskFactors: ['Insufficient research', 'Misreading market signals'],
      caseStudyIds: [],
      benchmarkData: { avgInterviews: 12, conversionRate: 0.23 },
      mitigationStrategies: [
        'Conduct 15+ customer interviews',
        'Validate with paid pilot',
      ],
      linkedDocuments: [],
      children: ['v_position'],
      sortOrder: 1,
      position: { x: 250, y: 150 },
      confidenceLevel: 'high',
      lastValidated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'v_position',
      pathId: '1',
      parentId: 'v_identify',
      label: 'Craft Positioning',
      description:
        'Develop messaging that clearly articulates your unique value to the vertical.',
      type: 'milestone',
      disclosureLevel: 2,
      cost: '2000.00',
      durationWeeks: 3,
      successProbability: '80.00',
      dependencies: ['Pain point research', 'Competitive analysis'],
      riskFactors: ['Generic positioning', 'Price-based competition'],
      caseStudyIds: [],
      benchmarkData: {},
      mitigationStrategies: [],
      linkedDocuments: [],
      children: ['v_pricing', 'v_marketing'],
      sortOrder: 2,
      position: { x: 250, y: 300 },
      confidenceLevel: 'medium',
      lastValidated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'v_pricing',
      pathId: '1',
      parentId: 'v_position',
      label: 'Premium Pricing Strategy',
      description:
        'Set pricing 30-50% above generalist competitors based on specialized value.',
      type: 'decision',
      disclosureLevel: 2,
      cost: '0.00',
      durationWeeks: 1,
      successProbability: '70.00',
      dependencies: ['Clear positioning', 'Value documentation'],
      riskFactors: ['Price resistance', 'Underpricing'],
      caseStudyIds: [],
      benchmarkData: {},
      mitigationStrategies: [],
      linkedDocuments: [],
      children: [],
      sortOrder: 3,
      position: { x: 100, y: 450 },
      confidenceLevel: 'medium',
      lastValidated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'v_marketing',
      pathId: '1',
      parentId: 'v_position',
      label: 'Vertical Marketing Launch',
      description:
        'Execute targeted marketing: industry conferences, publications, LinkedIn groups.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '5000.00',
      durationWeeks: 8,
      successProbability: '75.00',
      dependencies: ['Positioning', 'Content assets', 'Event calendar'],
      riskFactors: ['Low visibility', 'Wrong channels'],
      caseStudyIds: [],
      benchmarkData: {},
      mitigationStrategies: [],
      linkedDocuments: [],
      children: ['v_delivery'],
      sortOrder: 4,
      position: { x: 400, y: 450 },
      confidenceLevel: 'medium',
      lastValidated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'v_delivery',
      pathId: '1',
      parentId: 'v_marketing',
      label: 'Specialized Delivery',
      description:
        'Develop vertical-specific processes, templates, and case studies.',
      type: 'outcome',
      disclosureLevel: 3,
      cost: '3000.00',
      durationWeeks: 12,
      successProbability: '85.00',
      dependencies: ['Client projects', 'Feedback loops'],
      riskFactors: ['Quality inconsistency', 'Scale challenges'],
      caseStudyIds: [],
      benchmarkData: {},
      mitigationStrategies: [],
      linkedDocuments: [
        { title: 'SOP Template', url: '/docs/sop-template.pdf' },
        { title: 'Case Study Framework', url: '/docs/case-study.pdf' },
      ],
      children: [],
      sortOrder: 5,
      position: { x: 400, y: 600 },
      confidenceLevel: 'high',
      lastValidated: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PathTreePage({ params }: PageProps) {
  const [disclosureLevel, setDisclosureLevel] = useState<1 | 2 | 3>(2);
  const [selectedNode, setSelectedNode] = useState<DecisionNode | null>(null);
  const evidenceOpenTime = useRef<number>(0);

  // For now, use mock data. In production, fetch from API based on slug
  const resolvedParams = { slug: 'vertical-specialization' }; // Simplified for mock
  const path = mockPaths[resolvedParams.slug];
  const nodes = mockNodes[resolvedParams.slug] || [];

  // Analytics hook - tracks session automatically
  const analytics = usePathMapAnalytics({
    pathId: path?.id,
    mode: 'self-serve',
  });

  // Track disclosure level changes
  const handleDisclosureLevelChange = useCallback(
    (newLevel: 1 | 2 | 3) => {
      if (newLevel !== disclosureLevel && path) {
        analytics.trackDisclosureLevelChanged({
          previousLevel: disclosureLevel,
          newLevel,
          pathId: path.id,
        });
      }
      setDisclosureLevel(newLevel);
    },
    [disclosureLevel, path, analytics]
  );

  // Track node selection for evidence panel
  const handleNodeSelect = useCallback(
    (treeNode: TreeNode) => {
      // Find the full DecisionNode from our nodes array
      const node = nodes.find((n) => n.id === treeNode.id);
      if (!node) return;

      evidenceOpenTime.current = Date.now();

      // Determine what evidence types are available
      const evidenceTypes: string[] = [];
      if (node.caseStudyIds?.length) evidenceTypes.push('case_studies');
      if (node.benchmarkData && Object.keys(node.benchmarkData).length) evidenceTypes.push('benchmarks');
      if (node.linkedDocuments?.length) evidenceTypes.push('documents');

      analytics.trackEvidenceViewed({
        nodeId: node.id,
        nodeLabel: node.label,
        nodeType: node.type,
        evidenceTypes,
      });

      setSelectedNode(node);
    },
    [analytics, nodes]
  );

  // Track evidence panel close
  const handleCloseEvidence = useCallback(() => {
    if (selectedNode) {
      const timeSpentMs = Date.now() - evidenceOpenTime.current;
      analytics.trackEvidenceClosed(selectedNode.id, timeSpentMs);
    }
    setSelectedNode(null);
  }, [selectedNode, analytics]);

  if (!path) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Path not found</p>
        <Link href="/pathmap" className="text-primary hover:underline">
          Back to paths
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/pathmap"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to paths
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{path.name}</h1>
            <p className="text-muted-foreground mt-1">{path.description}</p>
          </div>

          {/* Disclosure Level Toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => handleDisclosureLevelChange(1)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                disclosureLevel === 1
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-4 w-4 inline mr-1" />
              Simple
            </button>
            <button
              onClick={() => handleDisclosureLevelChange(2)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                disclosureLevel === 2
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => handleDisclosureLevelChange(3)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                disclosureLevel === 3
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Tree Navigator */}
      <div className="border rounded-lg bg-card">
        <TreeNavigator
          nodes={nodes as TreeNode[]}
          disclosureLevel={disclosureLevel}
          onNodeSelect={handleNodeSelect}
          analytics={analytics}
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* Evidence Panel (Layer 3 Detail View) */}
      {selectedNode && (
        <EvidencePanel
          node={selectedNode}
          onClose={handleCloseEvidence}
          analytics={analytics}
        />
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-400" />
          <span>Decision Point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span>Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-400" />
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-400" />
          <span>Outcome</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs">Click nodes with ▼ to expand/collapse</span>
        </div>
      </div>
    </div>
  );
}
