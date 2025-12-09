import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  boolean,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// PATHMAP: Strategic Path Navigation System
// ============================================================================

/**
 * Strategic Paths (Layer 1)
 * Top-level growth strategies aggregated from case studies
 * Examples: "Vertical Specialization", "Content-Led Growth", "Partnership Expansion"
 */
export const strategicPaths = pgTable('strategic_paths', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core identity
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  summary: text('summary').notNull(), // One-liner for quick scan
  description: text('description'), // Detailed explanation

  // Layer 1 aggregated metrics (calculated from case studies)
  successRate: decimal('success_rate', { precision: 5, scale: 2 }), // % of companies that succeeded
  caseCount: integer('case_count').default(0), // Number of supporting case studies
  timelineP25: integer('timeline_p25'), // 25th percentile months
  timelineP75: integer('timeline_p75'), // 75th percentile months
  capitalP25: decimal('capital_p25', { precision: 12, scale: 2 }), // 25th percentile $
  capitalP75: decimal('capital_p75', { precision: 12, scale: 2 }), // 75th percentile $
  riskScore: decimal('risk_score', { precision: 3, scale: 2 }), // 0.00 - 1.00

  // Validation metadata (for framework alignment)
  confidenceLevel: varchar('confidence_level', { length: 20 }).default('low'), // 'high', 'medium', 'low'
  lastAggregated: timestamp('last_aggregated'),
  contradictionFlags: jsonb('contradiction_flags').$type<string[]>().default([]),
  modelVersion: integer('model_version').default(1).notNull(), // Incremented when metrics are recalculated

  // Tree structure
  rootNodeId: uuid('root_node_id'), // Points to first decision_node

  // Display settings
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  color: varchar('color', { length: 20 }), // Tailwind color
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Decision Nodes (Layers 2-3)
 * Individual steps, phases, decisions, and milestones within a strategic path
 */
export const decisionNodes = pgTable('decision_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathId: uuid('path_id').references(() => strategicPaths.id, { onDelete: 'cascade' }).notNull(),
  parentId: uuid('parent_id'), // Self-reference handled via relations

  // Core identity
  label: varchar('label', { length: 200 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'phase', 'decision', 'milestone', 'outcome', 'risk'

  // Disclosure level (1=quick scan, 2=deeper dive, 3=full vault)
  disclosureLevel: integer('disclosure_level').default(2).notNull(),

  // Layer 2 metrics
  cost: decimal('cost', { precision: 12, scale: 2 }),
  durationWeeks: integer('duration_weeks'),
  successProbability: decimal('success_probability', { precision: 5, scale: 2 }),
  dependencies: jsonb('dependencies').$type<string[]>().default([]),
  riskFactors: jsonb('risk_factors').$type<string[]>().default([]),

  // Layer 3 evidence
  caseStudyIds: jsonb('case_study_ids').$type<string[]>().default([]),
  benchmarkData: jsonb('benchmark_data').$type<Record<string, number>>().default({}),
  mitigationStrategies: jsonb('mitigation_strategies').$type<string[]>().default([]),
  linkedDocuments: jsonb('linked_documents').$type<Array<{ title: string; url: string }>>().default([]),

  // Tree structure
  children: jsonb('children').$type<string[]>().default([]), // Child node IDs (denormalized for quick access)
  sortOrder: integer('sort_order').default(0),

  // ReactFlow positioning
  position: jsonb('position').$type<{ x: number; y: number }>().default({ x: 0, y: 0 }),

  // Validation metadata
  confidenceLevel: varchar('confidence_level', { length: 20 }).default('medium'),
  lastValidated: timestamp('last_validated'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Client Contexts (Intake Data)
 * Captures client information for personalized path recommendations
 */
export const clientContexts = pgTable('client_contexts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Client identity (can be anonymous)
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  companyName: varchar('company_name', { length: 200 }),

  // Business profile
  industry: varchar('industry', { length: 100 }),
  companySize: varchar('company_size', { length: 50 }), // 'solo', '2-10', '11-50', '51-200', '200+'
  annualRevenue: decimal('annual_revenue', { precision: 14, scale: 2 }),
  yearsInBusiness: integer('years_in_business'),

  // Strategic context
  currentStage: varchar('current_stage', { length: 100 }), // 'startup', 'growth', 'scale', 'mature'
  primaryGoal: text('primary_goal'),
  biggestChallenge: text('biggest_challenge'),
  timelinePreference: varchar('timeline_preference', { length: 50 }), // 'quick', 'moderate', 'patient'
  riskTolerance: varchar('risk_tolerance', { length: 50 }), // 'conservative', 'moderate', 'aggressive'

  // Budget constraints
  availableCapital: decimal('available_capital', { precision: 14, scale: 2 }),
  budgetFlexibility: varchar('budget_flexibility', { length: 50 }), // 'fixed', 'flexible', 'unlimited'

  // Preferences (for recommendation scoring)
  preferences: jsonb('preferences').$type<Record<string, unknown>>().default({}),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Path Explorations (Learning Layer - Tracking)
 * Records client interactions with PathMap for analytics and learning
 */
export const pathExplorations = pgTable('path_explorations', {
  id: uuid('id').primaryKey().defaultRandom(),
  contextId: uuid('context_id').references(() => clientContexts.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 100 }).notNull(),

  // What was explored
  pathId: uuid('path_id').references(() => strategicPaths.id, { onDelete: 'cascade' }).notNull(),
  nodesExpanded: jsonb('nodes_expanded').$type<string[]>().default([]),
  maxDepthReached: integer('max_depth_reached').default(1),

  // Time spent
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  totalTimeSeconds: integer('total_time_seconds'),

  // Engagement metrics
  evidenceViewed: jsonb('evidence_viewed').$type<string[]>().default([]),
  whatIfSimulations: integer('what_if_simulations').default(0),

  // Outcome
  exportedAt: timestamp('exported_at'),
  exportType: varchar('export_type', { length: 50 }), // 'pdf', 'link', 'crm', 'csv'
  converted: boolean('converted').default(false), // Did they take action?

  // Feedback
  rating: integer('rating'), // 1-5 stars
  feedback: text('feedback'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Path Outcomes (Learning Layer - Results)
 * Tracks actual outcomes vs predicted for model refinement
 */
export const pathOutcomes = pgTable('path_outcomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  explorationId: uuid('exploration_id').references(() => pathExplorations.id, { onDelete: 'cascade' }).notNull(),
  pathId: uuid('path_id').references(() => strategicPaths.id, { onDelete: 'cascade' }).notNull(),

  // Predicted values (at time of exploration)
  predictedTimeline: integer('predicted_timeline'), // months
  predictedCost: decimal('predicted_cost', { precision: 12, scale: 2 }),
  predictedSuccessRate: decimal('predicted_success_rate', { precision: 5, scale: 2 }),

  // Actual values (collected later via survey)
  actualTimeline: integer('actual_timeline'),
  actualCost: decimal('actual_cost', { precision: 12, scale: 2 }),
  actualOutcome: varchar('actual_outcome', { length: 50 }), // 'success', 'partial', 'failure', 'pivoted', 'abandoned'

  // Variance analysis
  timelineVariance: decimal('timeline_variance', { precision: 5, scale: 2 }), // %
  costVariance: decimal('cost_variance', { precision: 5, scale: 2 }), // %

  // Attribution (which layer caused deviation)
  attributionNotes: text('attribution_notes'),
  failureLayer: varchar('failure_layer', { length: 50 }), // 'reality', 'understanding', 'decision', 'action'

  // Survey data
  surveyCompletedAt: timestamp('survey_completed_at'),
  lessonLearned: text('lesson_learned'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Shared Path Links (Sharing)
 * Shareable links to specific path explorations with state preservation
 */
export const sharedPathLinks = pgTable('shared_path_links', {
  id: uuid('id').primaryKey().defaultRandom(),

  // References
  pathId: uuid('path_id').references(() => strategicPaths.id, { onDelete: 'cascade' }).notNull(),
  explorationId: uuid('exploration_id').references(() => pathExplorations.id, { onDelete: 'set null' }),

  // Link identity
  slug: varchar('slug', { length: 12 }).notNull().unique(), // nanoid

  // Preserved state
  state: jsonb('state').$type<{
    disclosureLevel: 1 | 2 | 3;
    expandedNodeIds: string[];
    selectedNodeId?: string;
    notes?: string;
  }>().notNull(),

  // Access control
  expiresAt: timestamp('expires_at').notNull(),
  maxViews: integer('max_views'),
  viewCount: integer('view_count').default(0).notNull(),
  password: varchar('password', { length: 255 }), // bcrypt hash

  // Metadata
  createdBy: varchar('created_by', { length: 100 }), // session ID or user ID
  title: varchar('title', { length: 200 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const strategicPathsRelations = relations(strategicPaths, ({ many, one }) => ({
  nodes: many(decisionNodes),
  explorations: many(pathExplorations),
  outcomes: many(pathOutcomes),
  sharedLinks: many(sharedPathLinks),
  rootNode: one(decisionNodes, {
    fields: [strategicPaths.rootNodeId],
    references: [decisionNodes.id],
  }),
}));

export const decisionNodesRelations = relations(decisionNodes, ({ one, many }) => ({
  path: one(strategicPaths, {
    fields: [decisionNodes.pathId],
    references: [strategicPaths.id],
  }),
  parent: one(decisionNodes, {
    fields: [decisionNodes.parentId],
    references: [decisionNodes.id],
    relationName: 'parentChild',
  }),
  childNodes: many(decisionNodes, {
    relationName: 'parentChild',
  }),
}));

export const clientContextsRelations = relations(clientContexts, ({ many }) => ({
  explorations: many(pathExplorations),
}));

export const pathExplorationsRelations = relations(pathExplorations, ({ one, many }) => ({
  context: one(clientContexts, {
    fields: [pathExplorations.contextId],
    references: [clientContexts.id],
  }),
  path: one(strategicPaths, {
    fields: [pathExplorations.pathId],
    references: [strategicPaths.id],
  }),
  outcomes: many(pathOutcomes),
}));

export const pathOutcomesRelations = relations(pathOutcomes, ({ one }) => ({
  exploration: one(pathExplorations, {
    fields: [pathOutcomes.explorationId],
    references: [pathExplorations.id],
  }),
  path: one(strategicPaths, {
    fields: [pathOutcomes.pathId],
    references: [strategicPaths.id],
  }),
}));

export const sharedPathLinksRelations = relations(sharedPathLinks, ({ one }) => ({
  path: one(strategicPaths, {
    fields: [sharedPathLinks.pathId],
    references: [strategicPaths.id],
  }),
  exploration: one(pathExplorations, {
    fields: [sharedPathLinks.explorationId],
    references: [pathExplorations.id],
  }),
}));

// ============================================================================
// LEARNING LOOP: Outcome Tracking & Integration
// ============================================================================

/**
 * Integration Webhooks (Audit Log)
 * Tracks all webhook communications for debugging and retry logic
 */
export const integrationWebhooks = pgTable('integration_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Direction and service
  direction: varchar('direction', { length: 20 }).notNull(), // 'outbound', 'inbound'
  service: varchar('service', { length: 50 }).notNull(), // 'twentyfive', 'posthog', etc.
  endpoint: varchar('endpoint', { length: 500 }).notNull(),

  // Payload
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}),
  responseCode: integer('response_code'),
  responseBody: jsonb('response_body').$type<Record<string, unknown>>(),

  // Status tracking
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'success', 'failed', 'retrying'
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(3).notNull(),
  nextRetryAt: timestamp('next_retry_at'),
  lastError: text('last_error'),

  // Metadata
  correlationId: varchar('correlation_id', { length: 100 }), // For tracking related webhooks

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

/**
 * TwentyFive Connections (CRM Integration)
 * Stores encrypted credentials for TwentyFive CRM integration
 */
export const twentyfiveConnections = pgTable('twentyfive_connections', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Link to client context
  contextId: uuid('context_id').references(() => clientContexts.id, { onDelete: 'cascade' }),

  // Credentials (encrypted at rest)
  apiKey: text('api_key').notNull(), // Encrypted
  webhookSecret: text('webhook_secret').notNull(), // For HMAC validation

  // Connection status
  isActive: boolean('is_active').default(true).notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  lastSyncStatus: varchar('last_sync_status', { length: 20 }), // 'success', 'failed'

  // Sync settings
  syncEnabled: boolean('sync_enabled').default(true).notNull(),
  syncFrequency: varchar('sync_frequency', { length: 20 }).default('realtime'), // 'realtime', 'daily', 'weekly'

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Outcome Surveys (Scheduled Follow-ups)
 * Tracks scheduled and completed outcome surveys
 */
export const outcomeSurveys = pgTable('outcome_surveys', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Links
  explorationId: uuid('exploration_id').references(() => pathExplorations.id, { onDelete: 'cascade' }).notNull(),
  outcomeId: uuid('outcome_id').references(() => pathOutcomes.id, { onDelete: 'cascade' }),

  // Survey type and timing
  surveyType: varchar('survey_type', { length: 20 }).notNull(), // '30day', '60day', '90day'
  scheduledFor: timestamp('scheduled_for').notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('scheduled').notNull(), // 'scheduled', 'sent', 'completed', 'expired', 'skipped'
  sentAt: timestamp('sent_at'),
  completedAt: timestamp('completed_at'),

  // Delivery method
  deliveryMethod: varchar('delivery_method', { length: 20 }).default('email'), // 'email', 'in_app', 'posthog'
  recipientEmail: varchar('recipient_email', { length: 255 }),

  // Responses (stored after completion)
  responses: jsonb('responses').$type<{
    hasStarted?: boolean;
    progressPercent?: number;
    actualSpend?: number;
    outcome?: 'success' | 'partial' | 'failure' | 'pivoted' | 'abandoned';
    lessons?: string;
    wouldRecommend?: number; // 1-10 NPS
    additionalNotes?: string;
  }>(),

  // Reminder tracking
  reminderCount: integer('reminder_count').default(0).notNull(),
  lastReminderAt: timestamp('last_reminder_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Metric Recalculation Jobs (Model Updates)
 * Tracks when and why metrics were recalculated
 */
export const metricRecalculationJobs = pgTable('metric_recalculation_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Scope
  pathId: uuid('path_id').references(() => strategicPaths.id, { onDelete: 'cascade' }),
  nodeId: uuid('node_id').references(() => decisionNodes.id, { onDelete: 'cascade' }),
  scope: varchar('scope', { length: 20 }).default('path').notNull(), // 'path', 'node', 'global'

  // Trigger
  triggerType: varchar('trigger_type', { length: 30 }).notNull(), // 'threshold_reached', 'scheduled', 'manual', 'outcome_received'
  triggeredBy: varchar('triggered_by', { length: 100 }), // User ID or 'system'

  // Processing
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'processing', 'completed', 'failed'
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),

  // Results
  outcomesProcessed: integer('outcomes_processed').default(0).notNull(),
  metricsUpdated: jsonb('metrics_updated').$type<{
    previousValues: Record<string, number>;
    newValues: Record<string, number>;
    changePercent: Record<string, number>;
  }>(),

  // Model versioning
  previousModelVersion: integer('previous_model_version'),
  newModelVersion: integer('new_model_version'),

  // Error tracking
  errorMessage: text('error_message'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// LEARNING LOOP RELATIONS
// ============================================================================

export const integrationWebhooksRelations = relations(integrationWebhooks, ({}) => ({}));

export const twentyfiveConnectionsRelations = relations(twentyfiveConnections, ({ one }) => ({
  context: one(clientContexts, {
    fields: [twentyfiveConnections.contextId],
    references: [clientContexts.id],
  }),
}));

export const outcomeSurveysRelations = relations(outcomeSurveys, ({ one }) => ({
  exploration: one(pathExplorations, {
    fields: [outcomeSurveys.explorationId],
    references: [pathExplorations.id],
  }),
  outcome: one(pathOutcomes, {
    fields: [outcomeSurveys.outcomeId],
    references: [pathOutcomes.id],
  }),
}));

export const metricRecalculationJobsRelations = relations(metricRecalculationJobs, ({ one }) => ({
  path: one(strategicPaths, {
    fields: [metricRecalculationJobs.pathId],
    references: [strategicPaths.id],
  }),
  node: one(decisionNodes, {
    fields: [metricRecalculationJobs.nodeId],
    references: [decisionNodes.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type StrategicPath = typeof strategicPaths.$inferSelect;
export type NewStrategicPath = typeof strategicPaths.$inferInsert;

export type DecisionNode = typeof decisionNodes.$inferSelect;
export type NewDecisionNode = typeof decisionNodes.$inferInsert;

export type ClientContext = typeof clientContexts.$inferSelect;
export type NewClientContext = typeof clientContexts.$inferInsert;

export type PathExploration = typeof pathExplorations.$inferSelect;
export type NewPathExploration = typeof pathExplorations.$inferInsert;

export type PathOutcome = typeof pathOutcomes.$inferSelect;
export type NewPathOutcome = typeof pathOutcomes.$inferInsert;

export type SharedPathLink = typeof sharedPathLinks.$inferSelect;
export type NewSharedPathLink = typeof sharedPathLinks.$inferInsert;

export type IntegrationWebhook = typeof integrationWebhooks.$inferSelect;
export type NewIntegrationWebhook = typeof integrationWebhooks.$inferInsert;

export type TwentyfiveConnection = typeof twentyfiveConnections.$inferSelect;
export type NewTwentyfiveConnection = typeof twentyfiveConnections.$inferInsert;

export type OutcomeSurvey = typeof outcomeSurveys.$inferSelect;
export type NewOutcomeSurvey = typeof outcomeSurveys.$inferInsert;

export type MetricRecalculationJob = typeof metricRecalculationJobs.$inferSelect;
export type NewMetricRecalculationJob = typeof metricRecalculationJobs.$inferInsert;
