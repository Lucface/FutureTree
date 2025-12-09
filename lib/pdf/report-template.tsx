/**
 * PDF Report Template
 *
 * React-PDF template for PathMap strategic path reports
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { DecisionNode, StrategicPath } from '@/database/schema';

// Register fonts (using system fonts as fallback)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2',
      fontWeight: 700,
    },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.5,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  metricLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b',
  },
  nodeCard: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nodeLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1e293b',
    flex: 1,
  },
  nodeType: {
    fontSize: 8,
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  nodeDescription: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  nodeMetrics: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  nodeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nodeMetricLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  nodeMetricValue: {
    fontSize: 9,
    fontWeight: 600,
    color: '#334155',
  },
  riskFactorsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  riskFactorsTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 4,
  },
  riskFactor: {
    fontSize: 9,
    color: '#ef4444',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#94a3b8',
  },
  depthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});

// Get type badge color
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    decision: '#3b82f6', // blue
    phase: '#10b981', // green
    milestone: '#8b5cf6', // purple
    outcome: '#f59e0b', // amber
  };
  return colors[type] || '#64748b';
}

// Get depth indicator color
function getDepthColor(depth: number): string {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
  return colors[depth % colors.length];
}

export interface PathMapReportProps {
  path: StrategicPath;
  nodes: DecisionNode[];
  disclosureLevel: 1 | 2 | 3;
  generatedAt?: Date;
}

/**
 * Calculate node depth
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
 * PathMap PDF Report Document
 */
export function PathMapReport({
  path,
  nodes,
  disclosureLevel,
  generatedAt = new Date(),
}: PathMapReportProps) {
  // Create nodes map for depth calculation
  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  // Filter and sort nodes
  const filteredNodes = nodes
    .filter((n) => n.disclosureLevel <= disclosureLevel)
    .map((n) => ({ ...n, depth: calculateDepth(n, nodesMap) }))
    .sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

  // Calculate summary stats
  const totalCost = nodes.reduce((sum, n) => {
    const cost = parseFloat(n.cost || '0');
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const totalWeeks = nodes.reduce((sum, n) => {
    return sum + (n.durationWeeks || 0);
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{path.name}</Text>
          <Text style={styles.subtitle}>
            Strategic Path Report | Generated{' '}
            {generatedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{path.summary}</Text>
            {path.description && (
              <Text style={[styles.summaryText, { marginTop: 8 }]}>
                {path.description}
              </Text>
            )}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Success Rate</Text>
              <Text style={styles.metricValue}>
                {path.successRate
                  ? `${parseFloat(path.successRate).toFixed(0)}%`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Case Studies</Text>
              <Text style={styles.metricValue}>{path.caseCount || 0}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Risk Score</Text>
              <Text style={styles.metricValue}>
                {path.riskScore
                  ? `${(parseFloat(path.riskScore) * 100).toFixed(0)}%`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValue}>
                {path.confidenceLevel
                  ? path.confidenceLevel.charAt(0).toUpperCase() +
                    path.confidenceLevel.slice(1)
                  : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Timeline Range</Text>
              <Text style={styles.metricValue}>
                {path.timelineP25 && path.timelineP75
                  ? `${path.timelineP25}-${path.timelineP75} months`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Capital Range</Text>
              <Text style={styles.metricValue}>
                {path.capitalP25 && path.capitalP75
                  ? `$${parseInt(path.capitalP25).toLocaleString()}-$${parseInt(path.capitalP75).toLocaleString()}`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Est. Total Cost</Text>
              <Text style={styles.metricValue}>
                ${totalCost.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Est. Duration</Text>
              <Text style={styles.metricValue}>{totalWeeks} weeks</Text>
            </View>
          </View>
        </View>

        {/* Decision Nodes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Decision Path ({filteredNodes.length} nodes at Level {disclosureLevel}
            )
          </Text>

          {filteredNodes.map((node) => (
            <View key={node.id} style={styles.nodeCard} wrap={false}>
              <View style={styles.nodeHeader}>
                <View
                  style={[
                    styles.depthIndicator,
                    { backgroundColor: getDepthColor(node.depth) },
                  ]}
                />
                <Text style={styles.nodeLabel}>{node.label}</Text>
                <Text
                  style={[
                    styles.nodeType,
                    { backgroundColor: getTypeColor(node.type) },
                  ]}
                >
                  {node.type.toUpperCase()}
                </Text>
              </View>

              {node.description && (
                <Text style={styles.nodeDescription}>{node.description}</Text>
              )}

              {/* Node Metrics (Layer 2+) */}
              {disclosureLevel >= 2 && (
                <View style={styles.nodeMetrics}>
                  {node.cost && (
                    <View style={styles.nodeMetric}>
                      <Text style={styles.nodeMetricLabel}>Cost:</Text>
                      <Text style={styles.nodeMetricValue}>
                        ${parseFloat(node.cost).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {node.durationWeeks && (
                    <View style={styles.nodeMetric}>
                      <Text style={styles.nodeMetricLabel}>Duration:</Text>
                      <Text style={styles.nodeMetricValue}>
                        {node.durationWeeks} weeks
                      </Text>
                    </View>
                  )}
                  {node.successProbability && (
                    <View style={styles.nodeMetric}>
                      <Text style={styles.nodeMetricLabel}>Success:</Text>
                      <Text style={styles.nodeMetricValue}>
                        {parseFloat(node.successProbability).toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Risk Factors (Layer 3) */}
              {disclosureLevel >= 3 &&
                node.riskFactors &&
                node.riskFactors.length > 0 && (
                  <View style={styles.riskFactorsContainer}>
                    <Text style={styles.riskFactorsTitle}>Risk Factors:</Text>
                    {node.riskFactors.map((risk, idx) => (
                      <Text key={idx} style={styles.riskFactor}>
                        • {risk}
                      </Text>
                    ))}
                  </View>
                )}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            FutureTree PathMap | Disclosure Level {disclosureLevel}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate PDF buffer for a PathMap report
 * This helper allows the API route to generate PDFs without JSX
 */
export async function generatePdfBuffer(props: PathMapReportProps): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  return renderToBuffer(<PathMapReport {...props} />);
}

export default PathMapReport;
