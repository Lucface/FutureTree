'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PathVarianceData } from '@/lib/analytics/variance-calculator';

interface VarianceChartProps {
  data: PathVarianceData[];
  metric: 'timeline' | 'cost';
  className?: string;
}

/**
 * Variance Chart
 *
 * Bar chart showing variance between predicted and actual metrics
 * across different paths
 */
export function VarianceChart({ data, metric, className }: VarianceChartProps) {
  const chartData = data.map((d) => ({
    name: d.pathName.length > 20 ? d.pathName.slice(0, 20) + '...' : d.pathName,
    fullName: d.pathName,
    variance:
      metric === 'timeline'
        ? d.metrics.timelineVariancePercent
        : d.metrics.costVariancePercent,
    outcomes: d.metrics.totalOutcomes,
  }));

  const getBarColor = (variance: number) => {
    if (Math.abs(variance) <= 10) return 'hsl(var(--primary))';
    if (Math.abs(variance) <= 25) return 'hsl(var(--chart-3))';
    return 'hsl(var(--destructive))';
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { fullName: string; variance: number; outcomes: number } }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    const variance = data.variance;

    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{data.fullName}</p>
        <p className="text-muted-foreground mt-1">
          {metric === 'timeline' ? 'Timeline' : 'Cost'} Variance:{' '}
          <span
            className={
              Math.abs(variance) <= 10
                ? 'text-primary'
                : Math.abs(variance) <= 25
                  ? 'text-yellow-600'
                  : 'text-destructive'
            }
          >
            {variance > 0 ? '+' : ''}
            {variance.toFixed(1)}%
          </span>
        </p>
        <p className="text-muted-foreground">
          Based on {data.outcomes} outcome{data.outcomes !== 1 ? 's' : ''}
        </p>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {metric === 'timeline' ? 'Timeline' : 'Cost'} Variance by Path
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            ±10% (Good)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            ±25% (Warning)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            &gt;25% (Action)
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <YAxis
            tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
            className="fill-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
          <ReferenceLine
            y={10}
            stroke="hsl(var(--chart-3))"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={-10}
            stroke="hsl(var(--chart-3))"
            strokeDasharray="3 3"
          />
          <Bar dataKey="variance" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.variance)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Variance Summary Card
 *
 * Shows a single variance metric with trend indicator
 */
interface VarianceSummaryCardProps {
  label: string;
  variance: number;
  sampleSize: number;
  trend?: 'improving' | 'stable' | 'worsening';
}

export function VarianceSummaryCard({
  label,
  variance,
  sampleSize,
  trend = 'stable',
}: VarianceSummaryCardProps) {
  const getStatus = () => {
    if (Math.abs(variance) <= 10) return 'good';
    if (Math.abs(variance) <= 25) return 'warning';
    return 'bad';
  };

  const status = getStatus();

  return (
    <div
      className={`
      p-4 rounded-lg border
      ${
        status === 'good'
          ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
          : status === 'warning'
            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900'
            : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
      }
    `}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {trend === 'improving' && (
          <TrendingDown className="h-4 w-4 text-green-600" />
        )}
        {trend === 'stable' && (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )}
        {trend === 'worsening' && (
          <TrendingUp className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div
        className={`
        text-2xl font-bold mt-1
        ${
          status === 'good'
            ? 'text-green-700 dark:text-green-400'
            : status === 'warning'
              ? 'text-yellow-700 dark:text-yellow-400'
              : 'text-red-700 dark:text-red-400'
        }
      `}
      >
        {variance > 0 ? '+' : ''}
        {variance.toFixed(1)}%
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Based on {sampleSize} outcome{sampleSize !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default VarianceChart;
