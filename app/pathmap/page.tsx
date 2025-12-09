'use client';

import { useState } from 'react';
import { PathSelector } from '@/components/pathmap';
import type { StrategicPath } from '@/database/schema';

// Mock data for development (matches seed data structure)
const mockPaths: StrategicPath[] = [
  {
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
    contradictionFlags: [],
    modelVersion: 1,
    rootNodeId: null,
    icon: 'Target',
    color: 'blue',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Content-Led Growth',
    slug: 'content-led-growth',
    summary: 'Build authority and inbound leads through valuable content',
    description:
      'Establish yourself as a thought leader through consistent, high-value content.',
    successRate: '65.00',
    caseCount: 28,
    timelineP25: 9,
    timelineP75: 24,
    capitalP25: '2000.00',
    capitalP75: '15000.00',
    riskScore: '0.45',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    contradictionFlags: [],
    modelVersion: 1,
    rootNodeId: null,
    icon: 'FileText',
    color: 'green',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Partnership Expansion',
    slug: 'partnership-expansion',
    summary: 'Grow through strategic alliances and referral partnerships',
    description:
      "Leverage other businesses' audiences and trust to accelerate growth.",
    successRate: '68.00',
    caseCount: 22,
    timelineP25: 4,
    timelineP75: 12,
    capitalP25: '1000.00',
    capitalP75: '10000.00',
    riskScore: '0.40',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    rootNodeId: null,
    icon: 'Users',
    color: 'purple',
    sortOrder: 3,
    isActive: true,
    contradictionFlags: [],
    modelVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function PathMapPage() {
  const [selectedPath, setSelectedPath] = useState<StrategicPath | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">PathMap</h1>
        <p className="text-muted-foreground mt-2">
          Explore strategic growth paths backed by real business case studies.
          Click a path to dive deeper.
        </p>
      </div>

      {/* Layer 1: Path Selection */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Choose Your Path</h2>
        <PathSelector
          paths={mockPaths}
          selectedPathId={selectedPath?.id}
          onSelectPath={setSelectedPath}
        />
      </section>

      {/* Selected Path Preview */}
      {selectedPath && (
        <section className="mt-8 p-6 bg-muted/50 rounded-lg border">
          <h3 className="font-semibold text-lg">{selectedPath.name}</h3>
          <p className="text-muted-foreground mt-1">{selectedPath.description}</p>
          <div className="mt-4">
            <a
              href={`/pathmap/${selectedPath.slug}`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Explore This Path
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
