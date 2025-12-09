/**
 * TwentyFive CRM Integration Types
 *
 * Type definitions for TwentyFive CRM API integration
 */

// Webhook event types from TwentyFive
export type TwentyFiveEventType =
  | 'performance_update'
  | 'project_completed'
  | 'milestone_reached'
  | 'deal_stage_changed'
  | 'task_completed';

// Inbound webhook payload
export interface TwentyFiveWebhookPayload {
  event: TwentyFiveEventType;
  timestamp: string;
  correlationId: string;
  data: TwentyFiveEventData;
}

export type TwentyFiveEventData =
  | PerformanceUpdateData
  | ProjectCompletedData
  | MilestoneReachedData
  | DealStageChangedData
  | TaskCompletedData;

export interface PerformanceUpdateData {
  projectId: string;
  actualCost: number;
  actualTimeline: number; // in weeks
  budgetVariance: number; // percentage
  timelineVariance: number; // percentage
  notes?: string;
}

export interface ProjectCompletedData {
  projectId: string;
  outcome: 'success' | 'partial' | 'failure';
  completedAt: string;
  actualCost: number;
  actualTimelineWeeks: number;
  clientFeedback?: string;
  lessonsLearned?: string;
}

export interface MilestoneReachedData {
  projectId: string;
  milestoneId: string;
  milestoneName: string;
  reachedAt: string;
  onTrack: boolean;
}

export interface DealStageChangedData {
  dealId: string;
  previousStage: string;
  newStage: string;
  changedAt: string;
}

export interface TaskCompletedData {
  projectId: string;
  taskId: string;
  taskName: string;
  completedAt: string;
  completedBy: string;
}

// Outbound: Export roadmap to TwentyFive
export interface RoadmapExportPayload {
  pathId: string;
  pathName: string;
  clientContextId?: string;
  clientName?: string;
  clientEmail?: string;
  phases: RoadmapPhase[];
  metadata: {
    predictedTimeline: number; // months
    predictedCost: number;
    predictedSuccessRate: number;
    disclosureLevel: 1 | 2 | 3;
    exportedAt: string;
  };
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description?: string;
  type: 'phase' | 'milestone' | 'decision' | 'outcome';
  order: number;
  durationWeeks?: number;
  cost?: number;
  dependencies?: string[];
  successCriteria?: string;
}

// TwentyFive API response types
export interface TwentyFiveApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateProjectResponse {
  projectId: string;
  projectUrl: string;
  webhookRegistered: boolean;
}

// Connection configuration
export interface TwentyFiveConnectionConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl?: string;
}

// Sync status
export interface SyncStatus {
  lastSyncAt: Date | null;
  lastSyncStatus: 'success' | 'failed' | null;
  pendingUpdates: number;
  errorMessage?: string;
}
