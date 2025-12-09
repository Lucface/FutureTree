'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  VarianceChart,
  VarianceSummaryCard,
  AttributionBreakdown,
  LayerExplanationCard,
  ContradictionList,
} from '@/components/pathmap/analytics';
import type { VarianceMetrics, PathVarianceData } from '@/lib/analytics/variance-calculator';
import type { ContradictionSummary } from '@/lib/analytics/contradiction-detector';

interface AnalyticsData {
  variance: {
    overall: VarianceMetrics;
    byPath: PathVarianceData[];
  };
  contradictions: ContradictionSummary;
  generatedAt: string;
}

/**
 * PathMap Analytics Dashboard
 *
 * Displays variance analysis, contradiction detection, and
 * failure attribution for the learning loop
 */
export default function AnalyticsPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<AnalyticsData>({
    queryKey: ['pathmap-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/pathmap/analytics/global');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { variance, contradictions, generatedAt } = data;
  const overall = variance.overall;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            PathMap Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Variance analysis and learning loop insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Updated: {new Date(generatedAt).toLocaleTimeString()}
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <VarianceSummaryCard
          label="Timeline Variance"
          variance={overall.timelineVariancePercent}
          sampleSize={overall.totalOutcomes}
          trend={overall.varianceTrend}
        />
        <VarianceSummaryCard
          label="Cost Variance"
          variance={overall.costVariancePercent}
          sampleSize={overall.totalOutcomes}
          trend={overall.varianceTrend}
        />
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Actual Success Rate
            </span>
            {overall.successRateActual >= overall.successRatePredicted ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div className="text-2xl font-bold mt-1">
            {overall.successRateActual.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {overall.successRatePredicted.toFixed(1)}% predicted
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Data Points</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-1">{overall.totalOutcomes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overall.completedSurveys} surveys completed
          </p>
        </div>
      </div>

      {/* Variance Charts */}
      {variance.byPath.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <VarianceChart data={variance.byPath} metric="timeline" />
          </div>
          <div className="p-4 border rounded-lg">
            <VarianceChart data={variance.byPath} metric="cost" />
          </div>
        </div>
      )}

      {/* Attribution & Contradictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attribution Breakdown (2 cols) */}
        <div className="lg:col-span-2">
          <AttributionBreakdown
            outcomeDistribution={overall.outcomeDistribution}
            failureAttribution={overall.failureAttribution}
          />
        </div>

        {/* Layer Explanation */}
        <div>
          <LayerExplanationCard />
        </div>
      </div>

      {/* Contradictions */}
      <ContradictionList summary={contradictions} />

      {/* Empty State */}
      {overall.totalOutcomes === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Outcome Data Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Analytics will populate as clients complete outcome surveys.
            The learning loop improves predictions over time.
          </p>
        </div>
      )}

      {/* Path Selector (for drilling down) */}
      {variance.byPath.length > 0 && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">Drill Down by Path</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {variance.byPath.map((pathData) => (
              <a
                key={pathData.pathId}
                href={`/pathmap/analytics/${pathData.pathId}`}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {pathData.pathName}
                  </span>
                  {contradictions.topContradictions.some(
                    (c) => c.pathId === pathData.pathId
                  ) && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {pathData.metrics.timelineVariancePercent > 0 ? '+' : ''}
                    {pathData.metrics.timelineVariancePercent.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {pathData.metrics.costVariancePercent > 0 ? '+' : ''}
                    {pathData.metrics.costVariancePercent.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {pathData.metrics.totalOutcomes}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
