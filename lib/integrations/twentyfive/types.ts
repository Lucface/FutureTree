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
  | 'task_completed'
  | 'questionnaire_response'; // JDA team questionnaire responses

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
  | TaskCompletedData
  | QuestionnaireResponseData;

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

/**
 * Questionnaire Response Data (JDA Team Questionnaire)
 *
 * This is the payload TwentyFive sends when a team member submits
 * the AI readiness questionnaire. Used for:
 * - Team sentiment analysis
 * - AI adoption path customization
 * - Progress tracking
 *
 * Jesse's 7 Core Questions:
 * 1. currentAiUsage - Normalize that everyone uses AI
 * 2. tasksUsingAi - Find existing patterns
 * 3. tasksCouldUseAi - Surface aspirations
 * 4. goals - Define success criteria
 * 5. uncertainTasks - Find the gold mine (high-value opportunities)
 * 6. tasksNotForAi - Establish boundaries
 * 7. aiFeeling - Surface hidden fears/hopes
 *
 * Additional context:
 * 8. ipOwnershipConcerns - Jim's concern about IP
 * 9. reputationConcerns - Professional identity
 * 10. creativeControl - Where AI shouldn't override
 * 11. qualityExpectations - Success metrics
 * 12. learningPreferences - How to train
 */
export interface QuestionnaireResponseData {
  // Respondent info
  respondentId: string;
  respondentEmail: string;
  respondentName?: string;
  respondentRole: 'architect' | 'designer' | 'admin' | 'principal' | 'other';
  companyId?: string; // For multi-tenant routing

  // Submission metadata
  submittedAt: string;
  questionnaireVersion?: string; // Track schema changes

  // Core responses (Jesse's 7 questions)
  responses: QuestionnaireResponse[];

  // Calculated scores (optional, TwentyFive may pre-calculate)
  scores?: {
    aiReadinessScore?: number; // 1-100
    sentimentCategory?: 'skeptic' | 'curious' | 'eager';
    adoptionBarriers?: string[];
    highValueOpportunities?: string[];
  };
}

export interface QuestionnaireResponse {
  questionId: string;
  questionText?: string; // For context in logs
  answerType: 'text' | 'number' | 'scale' | 'multiselect' | 'boolean';
  answer: string | number | string[] | boolean;
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
