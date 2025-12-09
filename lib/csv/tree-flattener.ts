/**
 * Tree Flattener for CSV Export
 *
 * Converts hierarchical tree data to flat CSV-friendly rows
 */

import type { DecisionNode, StrategicPath } from '@/database/schema';

/**
 * Flat row structure for CSV export
 */
export interface CsvRow {
  node_id: string;
  parent_id: string;
  path_id: string;
  path_name: string;
  label: string;
  type: string;
  disclosure_level: number;
  description: string;
  cost: string;
  duration_weeks: string;
  success_probability: string;
  dependencies: string;
  risk_factors: string;
  mitigation_strategies: string;
  confidence_level: string;
  depth: number;
  sort_order: number;
}

/**
 * CSV column headers
 */
export const CSV_HEADERS: (keyof CsvRow)[] = [
  'node_id',
  'parent_id',
  'path_id',
  'path_name',
  'label',
  'type',
  'disclosure_level',
  'description',
  'cost',
  'duration_weeks',
  'success_probability',
  'dependencies',
  'risk_factors',
  'mitigation_strategies',
  'confidence_level',
  'depth',
  'sort_order',
];

/**
 * Calculate node depth in tree
 */
function calculateDepth(
  node: DecisionNode,
  nodesMap: Map<string, DecisionNode>
): number {
  if (!node.parentId) return 0;
  const parent = nodesMap.get(node.parentId);
  if (!parent) return 0;
  return 1 + calculateDepth(parent, nodesMap);
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: string): string {
  if (!value) return '';
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert array to pipe-separated string for CSV cell
 */
function arrayToString(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return '';
  return arr.join(' | ');
}

/**
 * Flatten tree nodes to CSV rows
 */
export function flattenTreeToRows(
  path: StrategicPath,
  nodes: DecisionNode[]
): CsvRow[] {
  // Create map for quick lookup
  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  // Sort nodes by sort order, then by depth for consistent output
  const sortedNodes = [...nodes].sort((a, b) => {
    const depthA = calculateDepth(a, nodesMap);
    const depthB = calculateDepth(b, nodesMap);
    if (depthA !== depthB) return depthA - depthB;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  return sortedNodes.map((node) => ({
    node_id: node.id,
    parent_id: node.parentId || '',
    path_id: path.id,
    path_name: path.name,
    label: node.label,
    type: node.type,
    disclosure_level: node.disclosureLevel,
    description: node.description || '',
    cost: node.cost || '',
    duration_weeks: node.durationWeeks?.toString() || '',
    success_probability: node.successProbability || '',
    dependencies: arrayToString(node.dependencies),
    risk_factors: arrayToString(node.riskFactors),
    mitigation_strategies: arrayToString(node.mitigationStrategies),
    confidence_level: node.confidenceLevel || '',
    depth: calculateDepth(node, nodesMap),
    sort_order: node.sortOrder ?? 0,
  }));
}

/**
 * Convert rows to CSV string
 */
export function rowsToCsv(rows: CsvRow[]): string {
  // Header row
  const headerLine = CSV_HEADERS.join(',');

  // Data rows
  const dataLines = rows.map((row) =>
    CSV_HEADERS.map((header) => {
      const value = row[header];
      if (typeof value === 'number') return value.toString();
      return escapeCsvValue(value);
    }).join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

/**
 * Generate CSV content for a path and its nodes
 */
export function generatePathCsv(
  path: StrategicPath,
  nodes: DecisionNode[]
): string {
  const rows = flattenTreeToRows(path, nodes);
  return rowsToCsv(rows);
}

/**
 * Generate filename for CSV export
 */
export function generateCsvFilename(path: StrategicPath): string {
  const slug = path.slug || path.name.toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `pathmap-${slug}-${date}.csv`;
}
