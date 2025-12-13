'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Database, Brain, Compass, Rocket } from 'lucide-react';
import type { VarianceMetrics } from '@/lib/analytics/variance-calculator';

interface AttributionBreakdownProps {
  outcomeDistribution: VarianceMetrics['outcomeDistribution'];
  failureAttribution: VarianceMetrics['failureAttribution'];
  className?: string;
}

/**
 * Attribution Breakdown
 *
 * Pie charts showing outcome distribution and failure attribution
 * aligned with the 5-layer systems framework
 */
export function AttributionBreakdown({
  outcomeDistribution,
  failureAttribution,
  className,
}: AttributionBreakdownProps) {
  const OUTCOME_COLORS = {
    success: 'hsl(var(--chart-1))',
    partial: 'hsl(var(--chart-2))',
    failure: 'hsl(var(--destructive))',
    pivoted: 'hsl(var(--chart-4))',
    abandoned: 'hsl(var(--muted-foreground))',
  };

  const LAYER_COLORS = {
    reality: '#3b82f6', // Blue
    understanding: '#8b5cf6', // Purple
    decision: '#f59e0b', // Amber
    action: '#ef4444', // Red
  };

  const outcomeData = Object.entries(outcomeDistribution)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

  const attributionData = Object.entries(failureAttribution)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

  const totalOutcomes = Object.values(outcomeDistribution).reduce(
    (a, b) => a + b,
    0
  );
  const totalFailures = Object.values(failureAttribution).reduce(
    (a, b) => a + b,
    0
  );

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; value: number } }>;
  }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-muted-foreground">Count: {data.value}</p>
      </div>
    );
  };

  const LayerIcon = ({ layer }: { layer: string }) => {
    switch (layer.toLowerCase()) {
      case 'reality':
        return <Database className="h-4 w-4" />;
      case 'understanding':
        return <Brain className="h-4 w-4" />;
      case 'decision':
        return <Compass className="h-4 w-4" />;
      case 'action':
        return <Rocket className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className || ''}`}>
      {/* Outcome Distribution */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-4">Outcome Distribution</h3>
        {totalOutcomes > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {outcomeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        OUTCOME_COLORS[
                          entry.name.toLowerCase() as keyof typeof OUTCOME_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {outcomeData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        OUTCOME_COLORS[
                          entry.name.toLowerCase() as keyof typeof OUTCOME_COLORS
                        ],
                    }}
                  />
                  <span className="text-sm">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No outcome data yet
          </div>
        )}
      </div>

      {/* Failure Attribution (5-Layer Framework) */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-4">Failure Attribution (by Layer)</h3>
        {totalFailures > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={attributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {attributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        LAYER_COLORS[
                          entry.name.toLowerCase() as keyof typeof LAYER_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {attributionData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          LAYER_COLORS[
                            entry.name.toLowerCase() as keyof typeof LAYER_COLORS
                          ],
                      }}
                    />
                    <LayerIcon layer={entry.name} />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No failure attribution data yet
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Layer Explanation Card
 *
 * Explains what each layer means for debugging
 */
export function LayerExplanationCard() {
  const layers = [
    {
      name: 'Reality',
      icon: Database,
      color: '#3b82f6',
      description: 'Bad input data - case studies outdated or biased',
      action: 'Update data sources, add more diverse cases',
    },
    {
      name: 'Understanding',
      icon: Brain,
      color: '#8b5cf6',
      description: 'Bad pattern extraction - metrics calculated incorrectly',
      action: 'Review aggregation logic, recalculate from source',
    },
    {
      name: 'Decision',
      icon: Compass,
      color: '#f59e0b',
      description: 'Bad recommendation - wrong path suggested for context',
      action: 'Tune scoring weights, add more context factors',
    },
    {
      name: 'Action',
      icon: Rocket,
      color: '#ef4444',
      description: 'Bad execution - client didn\'t follow path correctly',
      action: 'Improve guidance, add checkpoints, better UX',
    },
  ];

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">Understanding Failure Layers</h3>
      <div className="space-y-3">
        {layers.map((layer) => (
          <div key={layer.name} className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${layer.color}20` }}
            >
              <layer.icon className="h-4 w-4" style={{ color: layer.color }} />
            </div>
            <div>
              <p className="font-medium text-sm">{layer.name}</p>
              <p className="text-xs text-muted-foreground">
                {layer.description}
              </p>
              <p className="text-xs text-primary mt-0.5">→ {layer.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttributionBreakdown;
