/**
 * PathMap Analytics Event Definitions
 *
 * All events tracked during PathMap sessions for the Learning Layer.
 * These events feed back into the recommendation engine and help
 * identify which paths resonate with which client contexts.
 */

// Event name constants
export const PATHMAP_EVENTS = {
  // Session lifecycle
  SESSION_STARTED: 'pathmap_session_started',
  SESSION_ENDED: 'pathmap_session_ended',

  // Path exploration
  PATH_SELECTED: 'pathmap_path_selected',
  PATH_DESELECTED: 'pathmap_path_deselected',

  // Node interactions
  NODE_EXPANDED: 'pathmap_node_expanded',
  NODE_COLLAPSED: 'pathmap_node_collapsed',
  NODE_CLICKED: 'pathmap_node_clicked',

  // Disclosure level
  DISCLOSURE_LEVEL_CHANGED: 'pathmap_disclosure_level_changed',

  // Evidence/details
  EVIDENCE_VIEWED: 'pathmap_evidence_viewed',
  EVIDENCE_CLOSED: 'pathmap_evidence_closed',
  DOCUMENT_CLICKED: 'pathmap_document_clicked',

  // What-If simulator
  WHAT_IF_OPENED: 'pathmap_what_if_opened',
  WHAT_IF_ADJUSTED: 'pathmap_what_if_adjusted',
  WHAT_IF_SAVED: 'pathmap_what_if_saved',
  WHAT_IF_RESET: 'pathmap_what_if_reset',

  // Export
  EXPORT_STARTED: 'pathmap_export_started',
  EXPORT_COMPLETED: 'pathmap_export_completed',
  SHARE_LINK_CREATED: 'pathmap_share_link_created',

  // Intake form
  INTAKE_STARTED: 'pathmap_intake_started',
  INTAKE_STEP_COMPLETED: 'pathmap_intake_step_completed',
  INTAKE_COMPLETED: 'pathmap_intake_completed',
  INTAKE_ABANDONED: 'pathmap_intake_abandoned',

  // Recommendations
  RECOMMENDATION_SHOWN: 'pathmap_recommendation_shown',
  RECOMMENDATION_ACCEPTED: 'pathmap_recommendation_accepted',
  RECOMMENDATION_DISMISSED: 'pathmap_recommendation_dismissed',
} as const;

export type PathMapEventName = (typeof PATHMAP_EVENTS)[keyof typeof PATHMAP_EVENTS];

// Event property types
export interface SessionStartedProps {
  pathId?: string;
  contextId?: string;
  mode: 'presenter' | 'self-serve';
  referrer?: string;
}

export interface SessionEndedProps {
  sessionDurationMs: number;
  nodesExplored: number;
  maxDepthReached: number;
  disclosureLevelsUsed: number[];
  exported: boolean;
}

export interface PathSelectedProps {
  pathId: string;
  pathName: string;
  sourceContext: 'selector' | 'recommendation' | 'share-link' | 'direct';
}

export interface NodeExpandedProps {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  parentNodeId: string | null;
  depth: number;
  disclosureLevel: number;
}

export interface NodeCollapsedProps {
  nodeId: string;
  nodeLabel: string;
  childrenHidden: number;
}

export interface DisclosureLevelChangedProps {
  previousLevel: 1 | 2 | 3;
  newLevel: 1 | 2 | 3;
  pathId: string;
}

export interface EvidenceViewedProps {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  evidenceTypes: string[]; // ['case_studies', 'benchmarks', 'documents']
  timeSpentMs?: number;
}

export interface WhatIfAdjustedProps {
  nodeId: string;
  parameter: 'cost' | 'timeline' | 'successProbability';
  originalValue: number;
  newValue: number;
  percentChange: number;
  newEmv: number;
}

export interface ExportCompletedProps {
  format: 'pdf' | 'csv' | 'share-link' | 'crm';
  pathId: string;
  nodesIncluded: number;
  disclosureLevel: number;
  includedSections: string[];
}

export interface IntakeStepCompletedProps {
  step: number;
  stepName: 'business-profile' | 'strategic-context' | 'constraints' | 'review';
  fieldsCompleted: string[];
  timeSpentMs: number;
}

export interface RecommendationShownProps {
  pathId: string;
  pathName: string;
  rank: number;
  score: number;
  contextAlignment: number;
  reason: string;
}

// Union type for all event properties
export type PathMapEventProps =
  | { event: typeof PATHMAP_EVENTS.SESSION_STARTED; props: SessionStartedProps }
  | { event: typeof PATHMAP_EVENTS.SESSION_ENDED; props: SessionEndedProps }
  | { event: typeof PATHMAP_EVENTS.PATH_SELECTED; props: PathSelectedProps }
  | { event: typeof PATHMAP_EVENTS.PATH_DESELECTED; props: { pathId: string } }
  | { event: typeof PATHMAP_EVENTS.NODE_EXPANDED; props: NodeExpandedProps }
  | { event: typeof PATHMAP_EVENTS.NODE_COLLAPSED; props: NodeCollapsedProps }
  | { event: typeof PATHMAP_EVENTS.NODE_CLICKED; props: { nodeId: string; nodeLabel: string } }
  | { event: typeof PATHMAP_EVENTS.DISCLOSURE_LEVEL_CHANGED; props: DisclosureLevelChangedProps }
  | { event: typeof PATHMAP_EVENTS.EVIDENCE_VIEWED; props: EvidenceViewedProps }
  | { event: typeof PATHMAP_EVENTS.EVIDENCE_CLOSED; props: { nodeId: string; timeSpentMs: number } }
  | { event: typeof PATHMAP_EVENTS.DOCUMENT_CLICKED; props: { nodeId: string; documentUrl: string; documentTitle: string } }
  | { event: typeof PATHMAP_EVENTS.WHAT_IF_OPENED; props: { nodeId: string } }
  | { event: typeof PATHMAP_EVENTS.WHAT_IF_ADJUSTED; props: WhatIfAdjustedProps }
  | { event: typeof PATHMAP_EVENTS.WHAT_IF_SAVED; props: { nodeId: string; adjustments: Record<string, number> } }
  | { event: typeof PATHMAP_EVENTS.WHAT_IF_RESET; props: { nodeId: string } }
  | { event: typeof PATHMAP_EVENTS.EXPORT_STARTED; props: { format: string; pathId: string } }
  | { event: typeof PATHMAP_EVENTS.EXPORT_COMPLETED; props: ExportCompletedProps }
  | { event: typeof PATHMAP_EVENTS.SHARE_LINK_CREATED; props: { pathId: string; expiresInDays: number; hasPassword: boolean } }
  | { event: typeof PATHMAP_EVENTS.INTAKE_STARTED; props: { referrer?: string } }
  | { event: typeof PATHMAP_EVENTS.INTAKE_STEP_COMPLETED; props: IntakeStepCompletedProps }
  | { event: typeof PATHMAP_EVENTS.INTAKE_COMPLETED; props: { contextId: string; totalTimeMs: number } }
  | { event: typeof PATHMAP_EVENTS.INTAKE_ABANDONED; props: { lastStep: number; timeSpentMs: number } }
  | { event: typeof PATHMAP_EVENTS.RECOMMENDATION_SHOWN; props: RecommendationShownProps }
  | { event: typeof PATHMAP_EVENTS.RECOMMENDATION_ACCEPTED; props: { pathId: string; rank: number } }
  | { event: typeof PATHMAP_EVENTS.RECOMMENDATION_DISMISSED; props: { pathId: string; reason?: string } };
