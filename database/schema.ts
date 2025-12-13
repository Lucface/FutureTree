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

  // Architecture-specific fields (for creative/professional service firms)
  firmType: varchar('firm_type', { length: 50 }), // 'residential', 'commercial', 'mixed', 'specialty'
  designTools: jsonb('design_tools').$type<string[]>().default([]), // ['Revit', 'SketchUp', 'Rhino', 'Affinity', etc.]
  currentAiFamiliarity: integer('current_ai_familiarity'), // 1-5 scale
  avgProjectsPerMonth: integer('avg_projects_per_month'),
  teamComposition: jsonb('team_composition').$type<{
    architects?: number;
    designers?: number;
    admin?: number;
    other?: number;
  }>(),

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
 * Team Questionnaire Responses (JDA AI Readiness)
 * Stores individual team member responses to the AI readiness questionnaire
 * Enables sentiment analysis, progress tracking, and path customization
 */
export const teamQuestionnaireResponses = pgTable('team_questionnaire_responses', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Respondent info
  respondentId: varchar('respondent_id', { length: 100 }).notNull(), // From TwentyFive
  respondentEmail: varchar('respondent_email', { length: 255 }).notNull(),
  respondentName: varchar('respondent_name', { length: 255 }),
  respondentRole: varchar('respondent_role', { length: 50 }).notNull(), // 'architect', 'designer', 'admin', 'principal', 'other'

  // Company/Context link (for multi-tenant)
  clientContextId: uuid('client_context_id').references(() => clientContexts.id, { onDelete: 'set null' }),
  companyId: varchar('company_id', { length: 100 }), // From TwentyFive, for routing

  // Questionnaire metadata
  questionnaireVersion: varchar('questionnaire_version', { length: 20 }).default('v1'),

  // Raw responses (Jesse's 7+ questions)
  responses: jsonb('responses').$type<{
    questionId: string;
    questionText?: string;
    answerType: 'text' | 'number' | 'scale' | 'multiselect' | 'boolean';
    answer: string | number | string[] | boolean;
  }[]>().notNull(),

  // Calculated scores
  aiReadinessScore: integer('ai_readiness_score'), // 1-100
  sentimentCategory: varchar('sentiment_category', { length: 20 }), // 'skeptic', 'curious', 'eager'
  adoptionBarriers: jsonb('adoption_barriers').$type<string[]>(),
  highValueOpportunities: jsonb('high_value_opportunities').$type<string[]>(),

  // Status
  status: varchar('status', { length: 20 }).default('received').notNull(), // 'received', 'analyzed', 'actioned'

  // Timestamps
  submittedAt: timestamp('submitted_at').notNull(), // When respondent submitted
  receivedAt: timestamp('received_at').defaultNow().notNull(), // When webhook received
  analyzedAt: timestamp('analyzed_at'),
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
// SELF-DISCOVERY: Business Profile & Potentiality Engine
// ============================================================================

/**
 * Business Profiles (Core Self-Discovery)
 * Captures the complete business identity for personalized recommendations
 * Generic schema - works for ANY industry (video production, architecture, consulting, etc.)
 */
export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core Identity
  companyName: varchar('company_name', { length: 200 }).notNull(),
  industry: varchar('industry', { length: 100 }).notNull(), // 'video_production', 'architecture', 'consulting'
  subIndustry: varchar('sub_industry', { length: 100 }), // 'corporate_video', 'residential', 'management'
  location: varchar('location', { length: 200 }),
  yearsInBusiness: integer('years_in_business'),
  teamSize: varchar('team_size', { length: 50 }), // 'solo', '2_5', '6_10', '11_25', '26_50', '50_plus'

  // Qualified Specifications (What makes them capable)
  qualifications: jsonb('qualifications').$type<{
    certifications?: string[];
    licenses?: string[];
    equipment?: string[];
    tools?: string[];
    specialSkills?: string[];
  }>().default({}),

  // Social Proof (What validates their reputation)
  socialProof: jsonb('social_proof').$type<{
    portfolioStrength?: 'weak' | 'moderate' | 'strong' | 'exceptional';
    notableClients?: string[];
    testimonialCount?: number;
    awards?: string[];
    caseStudiesDocumented?: number;
    brandRecognition?: 'local' | 'regional' | 'national' | 'international';
  }>().default({}),

  // Infrastructure (What they have to work with)
  infrastructure: jsonb('infrastructure').$type<{
    teamComposition?: Record<string, number>; // { 'videographers': 2, 'editors': 1 }
    processes?: string[]; // What workflows they have
    capacity?: 'underutilized' | 'optimal' | 'stretched' | 'maxed';
    techStack?: string[];
  }>().default({}),

  // History (What they've accomplished)
  history: jsonb('history').$type<{
    industriesServed?: string[];
    projectTypes?: string[];
    avgProjectValue?: number;
    totalProjectsCompleted?: number;
    notableProjects?: string[];
    yearsOfExperience?: Record<string, number>; // { 'corporate': 5, 'events': 3 }
  }>().default({}),

  // Current Position (Where they are now)
  currentRevenue: varchar('current_revenue', { length: 50 }), // 'under_100k', '100k_250k', etc.
  revenueGrowth: varchar('revenue_growth', { length: 50 }), // 'declining', 'flat', 'moderate', 'strong', 'rapid'
  biggestChallenge: text('biggest_challenge'),
  growthGoal: text('growth_goal'),

  // Calculated Insights (AI-generated analysis)
  marketPosition: jsonb('market_position').$type<{
    tier?: 'emerging' | 'established' | 'leader' | 'dominant';
    competitiveAdvantages?: string[];
    vulnerabilities?: string[];
    marketShare?: 'tiny' | 'small' | 'moderate' | 'significant' | 'major';
  }>(),

  coreCompetencies: jsonb('core_competencies').$type<{
    primary?: string[];
    secondary?: string[];
    emerging?: string[];
    underutilized?: string[];
  }>(),

  expansionPaths: jsonb('expansion_paths').$type<{
    vertical?: { market: string; viability: number; notes?: string }[];
    horizontal?: { capability: string; viability: number; notes?: string }[];
    recommended?: string;
  }>(),

  // Profile completion tracking
  completionPercent: integer('completion_percent').default(0),
  lastAnalyzedAt: timestamp('last_analyzed_at'),

  // Session/user tracking
  sessionId: varchar('session_id', { length: 100 }),
  userId: uuid('user_id'), // For future auth integration

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Case Studies (Intelligence Engine)
 * Real-world examples of business transformations for matching and recommendations
 * Sourced from Starter Story, podcasts, interviews, public data
 */
export const caseStudies = pgTable('case_studies', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Company Identity
  companyName: varchar('company_name', { length: 200 }).notNull(),
  industry: varchar('industry', { length: 100 }).notNull(),
  subIndustry: varchar('sub_industry', { length: 100 }),
  location: varchar('location', { length: 200 }),

  // Starting State (Where they began)
  startingState: jsonb('starting_state').$type<{
    revenue?: string; // Revenue range
    teamSize?: string;
    yearsInBusiness?: number;
    challenges?: string[];
    capabilities?: string[];
    marketPosition?: string;
  }>().notNull(),

  // Ending State (Where they got to)
  endingState: jsonb('ending_state').$type<{
    revenue?: string;
    teamSize?: string;
    revenueGrowth?: string; // '2x', '5x', '10x'
    achievements?: string[];
    newCapabilities?: string[];
    marketPosition?: string;
  }>().notNull(),

  // Strategy Used
  strategyType: varchar('strategy_type', { length: 100 }).notNull(), // 'vertical_specialization', 'content_led', 'partnership'
  expansionType: varchar('expansion_type', { length: 50 }), // 'vertical', 'horizontal', 'evolution'
  targetMarket: varchar('target_market', { length: 100 }), // 'healthcare', 'legal', 'enterprise'

  // Journey Details
  timeline: jsonb('timeline').$type<{
    totalMonths?: number;
    phases?: { name: string; months: number; description?: string }[];
    keyMilestones?: { month: number; event: string }[];
  }>(),

  keyActions: jsonb('key_actions').$type<{
    action: string;
    impact: string;
    difficulty?: 'easy' | 'moderate' | 'hard';
  }[]>().default([]),

  capitalInvested: jsonb('capital_invested').$type<{
    total?: number;
    breakdown?: Record<string, number>;
    fundingSource?: string;
  }>(),

  // Outcomes & Lessons
  outcomes: jsonb('outcomes').$type<{
    revenueMultiplier?: number;
    profitMarginChange?: number;
    teamGrowth?: number;
    newClientsGained?: number;
    customMetrics?: Record<string, number>;
  }>(),

  pitfalls: jsonb('pitfalls').$type<{
    challenge: string;
    howOvercome?: string;
    advice?: string;
  }[]>().default([]),

  lessonsLearned: text('lessons_learned'),
  advice: text('advice'), // Direct advice from founder

  // Source Information
  sourceUrl: varchar('source_url', { length: 500 }),
  sourcePlatform: varchar('source_platform', { length: 50 }), // 'starter_story', 'youtube', 'podcast', 'interview'
  sourceDate: timestamp('source_date'),
  founderQuotes: jsonb('founder_quotes').$type<string[]>().default([]),

  // Matching metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  matchingKeywords: jsonb('matching_keywords').$type<string[]>().default([]),

  // Quality & validation
  confidenceLevel: varchar('confidence_level', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'verified'
  isVerified: boolean('is_verified').default(false),
  verifiedBy: varchar('verified_by', { length: 100 }),

  // Display
  featuredImage: varchar('featured_image', { length: 500 }),
  summary: text('summary'), // One-paragraph summary for cards

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Profile-CaseStudy Matches (Recommendations)
 * Links business profiles to relevant case studies with match scores
 */
export const profileCaseStudyMatches = pgTable('profile_case_study_matches', {
  id: uuid('id').primaryKey().defaultRandom(),

  profileId: uuid('profile_id').references(() => businessProfiles.id, { onDelete: 'cascade' }).notNull(),
  caseStudyId: uuid('case_study_id').references(() => caseStudies.id, { onDelete: 'cascade' }).notNull(),

  // Match scoring
  overallScore: decimal('overall_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  industryMatch: decimal('industry_match', { precision: 5, scale: 2 }),
  revenueMatch: decimal('revenue_match', { precision: 5, scale: 2 }),
  teamSizeMatch: decimal('team_size_match', { precision: 5, scale: 2 }),
  capabilityMatch: decimal('capability_match', { precision: 5, scale: 2 }),
  challengeMatch: decimal('challenge_match', { precision: 5, scale: 2 }),

  // Why this match matters
  matchReason: text('match_reason'),
  keyTakeaways: jsonb('key_takeaways').$type<string[]>().default([]),

  // User interaction
  wasViewed: boolean('was_viewed').default(false),
  wasHelpful: boolean('was_helpful'),
  userNotes: text('user_notes'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Industry Profiles (Flexible Extension)
 * Stores industry-specific data that doesn't fit in the generic businessProfiles
 * Allows different industries to have different fields without schema changes
 */
export const industryProfiles = pgTable('industry_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),

  profileId: uuid('profile_id').references(() => businessProfiles.id, { onDelete: 'cascade' }).notNull(),
  industryType: varchar('industry_type', { length: 50 }).notNull(), // 'video_production', 'architecture', etc.

  // Flexible industry-specific data
  profileData: jsonb('profile_data').$type<Record<string, unknown>>().default({}),

  // Examples:
  // video_production: { cameraGear: [], editingSoftware: [], productionTypes: [] }
  // architecture: { firmType: 'residential', designTools: [], projectScale: 'commercial' }
  // consulting: { specialties: [], frameworks: [], clientTypes: [] }

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Discovery Sessions (Analytics)
 * Tracks user journey through the self-discovery process
 */
export const discoverySessions = pgTable('discovery_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),

  profileId: uuid('profile_id').references(() => businessProfiles.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 100 }).notNull(),

  // Progress tracking
  currentStep: integer('current_step').default(1).notNull(),
  totalSteps: integer('total_steps').default(4).notNull(),
  completedSteps: jsonb('completed_steps').$type<number[]>().default([]),

  // Time tracking
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  totalTimeSeconds: integer('total_time_seconds'),

  // Device/context
  userAgent: text('user_agent'),
  referrer: varchar('referrer', { length: 500 }),

  // Outcome
  wasAbandoned: boolean('was_abandoned').default(false),
  abandonedAtStep: integer('abandoned_at_step'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// SELF-DISCOVERY RELATIONS
// ============================================================================

export const businessProfilesRelations = relations(businessProfiles, ({ many }) => ({
  caseStudyMatches: many(profileCaseStudyMatches),
  industryProfiles: many(industryProfiles),
  discoverySessions: many(discoverySessions),
}));

export const caseStudiesRelations = relations(caseStudies, ({ many }) => ({
  profileMatches: many(profileCaseStudyMatches),
}));

export const profileCaseStudyMatchesRelations = relations(profileCaseStudyMatches, ({ one }) => ({
  profile: one(businessProfiles, {
    fields: [profileCaseStudyMatches.profileId],
    references: [businessProfiles.id],
  }),
  caseStudy: one(caseStudies, {
    fields: [profileCaseStudyMatches.caseStudyId],
    references: [caseStudies.id],
  }),
}));

export const industryProfilesRelations = relations(industryProfiles, ({ one }) => ({
  profile: one(businessProfiles, {
    fields: [industryProfiles.profileId],
    references: [businessProfiles.id],
  }),
}));

export const discoverySessionsRelations = relations(discoverySessions, ({ one }) => ({
  profile: one(businessProfiles, {
    fields: [discoverySessions.profileId],
    references: [businessProfiles.id],
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

export type TeamQuestionnaireResponse = typeof teamQuestionnaireResponses.$inferSelect;
export type NewTeamQuestionnaireResponse = typeof teamQuestionnaireResponses.$inferInsert;

export type MetricRecalculationJob = typeof metricRecalculationJobs.$inferSelect;
export type NewMetricRecalculationJob = typeof metricRecalculationJobs.$inferInsert;

// Self-Discovery types
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type NewBusinessProfile = typeof businessProfiles.$inferInsert;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type NewCaseStudy = typeof caseStudies.$inferInsert;

export type ProfileCaseStudyMatch = typeof profileCaseStudyMatches.$inferSelect;
export type NewProfileCaseStudyMatch = typeof profileCaseStudyMatches.$inferInsert;

export type IndustryProfile = typeof industryProfiles.$inferSelect;
export type NewIndustryProfile = typeof industryProfiles.$inferInsert;

export type DiscoverySession = typeof discoverySessions.$inferSelect;
export type NewDiscoverySession = typeof discoverySessions.$inferInsert;
