'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import {
  PATHMAP_EVENTS,
  type SessionStartedProps,
  type SessionEndedProps,
  type PathSelectedProps,
  type NodeExpandedProps,
  type NodeCollapsedProps,
  type DisclosureLevelChangedProps,
  type EvidenceViewedProps,
  type WhatIfAdjustedProps,
  type ExportCompletedProps,
  type IntakeStepCompletedProps,
  type RecommendationShownProps,
} from '@/lib/analytics/pathmap-events';

interface UsePathMapAnalyticsOptions {
  pathId?: string;
  contextId?: string;
  mode?: 'presenter' | 'self-serve';
}

interface SessionMetrics {
  startTime: number;
  nodesExplored: Set<string>;
  maxDepthReached: number;
  disclosureLevelsUsed: Set<number>;
  exported: boolean;
}

/**
 * PathMap Analytics Hook
 *
 * Provides type-safe tracking methods for PathMap interactions.
 * Automatically handles session lifecycle and aggregates metrics.
 *
 * @example
 * ```tsx
 * const { trackNodeExpanded, trackDisclosureLevelChanged } = usePathMapAnalytics({
 *   pathId: 'vertical-specialization',
 *   contextId: 'ctx_123',
 *   mode: 'self-serve'
 * });
 * ```
 */
export function usePathMapAnalytics(options: UsePathMapAnalyticsOptions = {}) {
  const posthog = usePostHog();
  const { pathId, contextId, mode = 'self-serve' } = options;

  // Session state
  const [sessionId] = useState(() => `ps_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const sessionMetrics = useRef<SessionMetrics>({
    startTime: Date.now(),
    nodesExplored: new Set(),
    maxDepthReached: 0,
    disclosureLevelsUsed: new Set([2]), // Default disclosure level
    exported: false,
  });

  // Track session start on mount
  useEffect(() => {
    const props: SessionStartedProps = {
      pathId,
      contextId,
      mode,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    posthog?.capture(PATHMAP_EVENTS.SESSION_STARTED, {
      ...props,
      $session_id: sessionId,
    });

    // Track session end on unmount
    return () => {
      const metrics = sessionMetrics.current;
      const endProps: SessionEndedProps = {
        sessionDurationMs: Date.now() - metrics.startTime,
        nodesExplored: metrics.nodesExplored.size,
        maxDepthReached: metrics.maxDepthReached,
        disclosureLevelsUsed: Array.from(metrics.disclosureLevelsUsed),
        exported: metrics.exported,
      };

      posthog?.capture(PATHMAP_EVENTS.SESSION_ENDED, {
        ...endProps,
        $session_id: sessionId,
        pathId,
        contextId,
      });
    };
  }, [posthog, sessionId, pathId, contextId, mode]);

  // Path selection
  const trackPathSelected = useCallback(
    (props: PathSelectedProps) => {
      posthog?.capture(PATHMAP_EVENTS.PATH_SELECTED, {
        ...props,
        $session_id: sessionId,
        contextId,
      });
    },
    [posthog, sessionId, contextId]
  );

  const trackPathDeselected = useCallback(
    (pathId: string) => {
      posthog?.capture(PATHMAP_EVENTS.PATH_DESELECTED, {
        pathId,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId]
  );

  // Node interactions
  const trackNodeExpanded = useCallback(
    (props: NodeExpandedProps) => {
      // Update session metrics
      sessionMetrics.current.nodesExplored.add(props.nodeId);
      sessionMetrics.current.maxDepthReached = Math.max(
        sessionMetrics.current.maxDepthReached,
        props.depth
      );

      posthog?.capture(PATHMAP_EVENTS.NODE_EXPANDED, {
        ...props,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackNodeCollapsed = useCallback(
    (props: NodeCollapsedProps) => {
      posthog?.capture(PATHMAP_EVENTS.NODE_COLLAPSED, {
        ...props,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackNodeClicked = useCallback(
    (nodeId: string, nodeLabel: string) => {
      posthog?.capture(PATHMAP_EVENTS.NODE_CLICKED, {
        nodeId,
        nodeLabel,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  // Disclosure level
  const trackDisclosureLevelChanged = useCallback(
    (props: DisclosureLevelChangedProps) => {
      sessionMetrics.current.disclosureLevelsUsed.add(props.newLevel);

      posthog?.capture(PATHMAP_EVENTS.DISCLOSURE_LEVEL_CHANGED, {
        ...props,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId]
  );

  // Evidence panel
  const trackEvidenceViewed = useCallback(
    (props: EvidenceViewedProps) => {
      posthog?.capture(PATHMAP_EVENTS.EVIDENCE_VIEWED, {
        ...props,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackEvidenceClosed = useCallback(
    (nodeId: string, timeSpentMs: number) => {
      posthog?.capture(PATHMAP_EVENTS.EVIDENCE_CLOSED, {
        nodeId,
        timeSpentMs,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackDocumentClicked = useCallback(
    (nodeId: string, documentUrl: string, documentTitle: string) => {
      posthog?.capture(PATHMAP_EVENTS.DOCUMENT_CLICKED, {
        nodeId,
        documentUrl,
        documentTitle,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  // What-If simulator
  const trackWhatIfOpened = useCallback(
    (nodeId: string) => {
      posthog?.capture(PATHMAP_EVENTS.WHAT_IF_OPENED, {
        nodeId,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackWhatIfAdjusted = useCallback(
    (props: WhatIfAdjustedProps) => {
      posthog?.capture(PATHMAP_EVENTS.WHAT_IF_ADJUSTED, {
        ...props,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackWhatIfSaved = useCallback(
    (nodeId: string, adjustments: Record<string, number>) => {
      posthog?.capture(PATHMAP_EVENTS.WHAT_IF_SAVED, {
        nodeId,
        adjustments,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackWhatIfReset = useCallback(
    (nodeId: string) => {
      posthog?.capture(PATHMAP_EVENTS.WHAT_IF_RESET, {
        nodeId,
        $session_id: sessionId,
        pathId,
      });
    },
    [posthog, sessionId, pathId]
  );

  // Export
  const trackExportStarted = useCallback(
    (format: string) => {
      posthog?.capture(PATHMAP_EVENTS.EXPORT_STARTED, {
        format,
        pathId,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId, pathId]
  );

  const trackExportCompleted = useCallback(
    (props: ExportCompletedProps) => {
      sessionMetrics.current.exported = true;

      posthog?.capture(PATHMAP_EVENTS.EXPORT_COMPLETED, {
        ...props,
        $session_id: sessionId,
        contextId,
      });
    },
    [posthog, sessionId, contextId]
  );

  const trackShareLinkCreated = useCallback(
    (expiresInDays: number, hasPassword: boolean) => {
      posthog?.capture(PATHMAP_EVENTS.SHARE_LINK_CREATED, {
        pathId,
        expiresInDays,
        hasPassword,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId, pathId]
  );

  // Intake form
  const trackIntakeStarted = useCallback(
    (referrer?: string) => {
      posthog?.capture(PATHMAP_EVENTS.INTAKE_STARTED, {
        referrer,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId]
  );

  const trackIntakeStepCompleted = useCallback(
    (props: IntakeStepCompletedProps) => {
      posthog?.capture(PATHMAP_EVENTS.INTAKE_STEP_COMPLETED, {
        ...props,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId]
  );

  const trackIntakeCompleted = useCallback(
    (newContextId: string, totalTimeMs: number) => {
      posthog?.capture(PATHMAP_EVENTS.INTAKE_COMPLETED, {
        contextId: newContextId,
        totalTimeMs,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId]
  );

  const trackIntakeAbandoned = useCallback(
    (lastStep: number, timeSpentMs: number) => {
      posthog?.capture(PATHMAP_EVENTS.INTAKE_ABANDONED, {
        lastStep,
        timeSpentMs,
        $session_id: sessionId,
      });
    },
    [posthog, sessionId]
  );

  // Recommendations
  const trackRecommendationShown = useCallback(
    (props: RecommendationShownProps) => {
      posthog?.capture(PATHMAP_EVENTS.RECOMMENDATION_SHOWN, {
        ...props,
        $session_id: sessionId,
        contextId,
      });
    },
    [posthog, sessionId, contextId]
  );

  const trackRecommendationAccepted = useCallback(
    (acceptedPathId: string, rank: number) => {
      posthog?.capture(PATHMAP_EVENTS.RECOMMENDATION_ACCEPTED, {
        pathId: acceptedPathId,
        rank,
        $session_id: sessionId,
        contextId,
      });
    },
    [posthog, sessionId, contextId]
  );

  const trackRecommendationDismissed = useCallback(
    (dismissedPathId: string, reason?: string) => {
      posthog?.capture(PATHMAP_EVENTS.RECOMMENDATION_DISMISSED, {
        pathId: dismissedPathId,
        reason,
        $session_id: sessionId,
        contextId,
      });
    },
    [posthog, sessionId, contextId]
  );

  return {
    sessionId,

    // Path
    trackPathSelected,
    trackPathDeselected,

    // Nodes
    trackNodeExpanded,
    trackNodeCollapsed,
    trackNodeClicked,

    // Disclosure
    trackDisclosureLevelChanged,

    // Evidence
    trackEvidenceViewed,
    trackEvidenceClosed,
    trackDocumentClicked,

    // What-If
    trackWhatIfOpened,
    trackWhatIfAdjusted,
    trackWhatIfSaved,
    trackWhatIfReset,

    // Export
    trackExportStarted,
    trackExportCompleted,
    trackShareLinkCreated,

    // Intake
    trackIntakeStarted,
    trackIntakeStepCompleted,
    trackIntakeCompleted,
    trackIntakeAbandoned,

    // Recommendations
    trackRecommendationShown,
    trackRecommendationAccepted,
    trackRecommendationDismissed,
  };
}

export type PathMapAnalytics = ReturnType<typeof usePathMapAnalytics>;
