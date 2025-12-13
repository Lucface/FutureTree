import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  integrationWebhooks,
  pathOutcomes,
  pathExplorations,
  twentyfiveConnections,
  teamQuestionnaireResponses,
  clientContexts,
} from '@/database/schema';
import { eq } from 'drizzle-orm';
import {
  validateSignature,
  parseWebhookHeaders,
} from '@/lib/integrations/twentyfive/hmac';
import type {
  TwentyFiveWebhookPayload,
  PerformanceUpdateData,
  ProjectCompletedData,
  MilestoneReachedData,
  QuestionnaireResponseData,
} from '@/lib/integrations/twentyfive/types';
import { recalculatePath } from '@/lib/jobs/metric-recalculator';

/**
 * POST /api/integrations/twentyfive/webhook
 * Receive webhook events from TwentyFive CRM
 */
export async function POST(request: NextRequest) {
  // Parse headers
  const { signature, timestamp, event } = parseWebhookHeaders(request.headers);

  // Read body as text for signature validation
  const bodyText = await request.text();

  // Log incoming webhook
  const [webhookLog] = await db
    .insert(integrationWebhooks)
    .values({
      direction: 'inbound',
      service: 'twentyfive',
      endpoint: '/api/integrations/twentyfive/webhook',
      payload: JSON.parse(bodyText),
      status: 'pending',
      correlationId: event || undefined,
    })
    .returning();

  try {
    // Validate required headers
    if (!signature || !timestamp) {
      await updateWebhookStatus(webhookLog.id, 'failed', 'Missing signature or timestamp');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: TwentyFiveWebhookPayload = JSON.parse(bodyText);

    // Get connection to find webhook secret
    // For now, we'll look up based on correlation ID or use a default
    // In production, the webhook would include a context identifier
    const connections = await db.query.twentyfiveConnections.findMany({
      where: eq(twentyfiveConnections.isActive, true),
    });

    let signatureValid = false;
    // Stored for potential future multi-tenant routing
    let matchedConnectionId: string | null = null;

    // Try to validate against any active connection
    for (const connection of connections) {
      const result = validateSignature(
        bodyText,
        signature,
        connection.webhookSecret,
        timestamp
      );
      if (result.valid) {
        signatureValid = true;
        matchedConnectionId = connection.id; // For logging/debugging
        console.log(`Webhook validated for connection: ${matchedConnectionId}`);
        break;
      }
    }

    if (!signatureValid) {
      await updateWebhookStatus(webhookLog.id, 'failed', 'Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process event
    switch (payload.event) {
      case 'performance_update':
        await handlePerformanceUpdate(
          payload.data as PerformanceUpdateData,
          payload.correlationId
        );
        break;

      case 'project_completed':
        await handleProjectCompleted(
          payload.data as ProjectCompletedData,
          payload.correlationId
        );
        break;

      case 'milestone_reached':
        await handleMilestoneReached(
          payload.data as MilestoneReachedData,
          payload.correlationId
        );
        break;

      case 'questionnaire_response':
        await handleQuestionnaireResponse(
          payload.data as QuestionnaireResponseData,
          payload.correlationId
        );
        break;

      default:
        console.log(`Unhandled webhook event: ${payload.event}`);
    }

    // Update webhook status
    await updateWebhookStatus(webhookLog.id, 'success');

    return NextResponse.json({ received: true });
  } catch (error) {
    await updateWebhookStatus(
      webhookLog.id,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );

    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Update webhook log status
 */
async function updateWebhookStatus(
  id: string,
  status: 'success' | 'failed',
  error?: string
) {
  await db
    .update(integrationWebhooks)
    .set({
      status,
      lastError: error,
      completedAt: new Date(),
    })
    .where(eq(integrationWebhooks.id, id));
}

/**
 * Handle performance update event
 */
async function handlePerformanceUpdate(
  data: PerformanceUpdateData,
  correlationId: string
) {
  // Find related exploration by correlation ID (pathId)
  const explorations = await db.query.pathExplorations.findMany({
    where: eq(pathExplorations.pathId, correlationId),
  });

  if (explorations.length === 0) {
    console.log(`No explorations found for path: ${correlationId}`);
    return;
  }

  // Update or create outcome records
  for (const exploration of explorations) {
    // Check if outcome already exists
    const existingOutcome = await db.query.pathOutcomes.findFirst({
      where: eq(pathOutcomes.explorationId, exploration.id),
    });

    if (existingOutcome) {
      // Update existing
      await db
        .update(pathOutcomes)
        .set({
          actualCost: data.actualCost.toString(),
          actualTimeline: data.actualTimeline,
          costVariance: data.budgetVariance.toString(),
          timelineVariance: data.timelineVariance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(pathOutcomes.id, existingOutcome.id));
    }
  }
}

/**
 * Handle project completed event
 */
async function handleProjectCompleted(
  data: ProjectCompletedData,
  correlationId: string
) {
  // Find related exploration
  const explorations = await db.query.pathExplorations.findMany({
    where: eq(pathExplorations.pathId, correlationId),
  });

  for (const exploration of explorations) {
    // Find or create outcome
    const existingOutcome = await db.query.pathOutcomes.findFirst({
      where: eq(pathOutcomes.explorationId, exploration.id),
    });

    if (existingOutcome) {
      await db
        .update(pathOutcomes)
        .set({
          actualOutcome: data.outcome,
          actualCost: data.actualCost.toString(),
          actualTimeline: data.actualTimelineWeeks,
          lessonLearned: data.lessonsLearned,
          updatedAt: new Date(),
        })
        .where(eq(pathOutcomes.id, existingOutcome.id));
    } else {
      await db.insert(pathOutcomes).values({
        explorationId: exploration.id,
        pathId: correlationId,
        actualOutcome: data.outcome,
        actualCost: data.actualCost.toString(),
        actualTimeline: data.actualTimelineWeeks,
        lessonLearned: data.lessonsLearned,
      });
    }
  }

  // Trigger recalculation if enough outcomes
  await recalculatePath(correlationId, 'outcome_received');
}

/**
 * Handle milestone reached event
 */
async function handleMilestoneReached(
  data: MilestoneReachedData,
  correlationId: string
) {
  // Log milestone progress
  console.log(`Milestone reached for path ${correlationId}: ${data.milestoneName}`);

  // Could update a progress tracking table here
  // For now, we just log it
}

/**
 * Handle questionnaire response event (JDA Team Questionnaire)
 *
 * Stores team member AI readiness responses from TwentyFive
 * Enables sentiment analysis, path customization, and progress tracking
 */
async function handleQuestionnaireResponse(
  data: QuestionnaireResponseData,
  // correlationId available for future logging/tracking
  _correlationId?: string
) {
  void _correlationId;
  console.log(`Questionnaire response received from ${data.respondentEmail}`);

  // Try to find matching client context by company ID
  let clientContextId: string | null = null;
  if (data.companyId) {
    // Look up by session ID pattern (e.g., 'jda-main')
    const context = await db.query.clientContexts.findFirst({
      where: eq(clientContexts.sessionId, data.companyId),
    });
    if (context) {
      clientContextId = context.id;
    }
  }

  // Store the questionnaire response
  await db.insert(teamQuestionnaireResponses).values({
    respondentId: data.respondentId,
    respondentEmail: data.respondentEmail,
    respondentName: data.respondentName,
    respondentRole: data.respondentRole,
    clientContextId,
    companyId: data.companyId,
    questionnaireVersion: data.questionnaireVersion,
    responses: data.responses,
    aiReadinessScore: data.scores?.aiReadinessScore,
    sentimentCategory: data.scores?.sentimentCategory,
    adoptionBarriers: data.scores?.adoptionBarriers,
    highValueOpportunities: data.scores?.highValueOpportunities,
    submittedAt: new Date(data.submittedAt),
  });

  console.log(`✓ Stored questionnaire response for ${data.respondentEmail} (${data.respondentRole})`);

  // Log summary for monitoring
  if (data.scores) {
    console.log(`  AI Readiness Score: ${data.scores.aiReadinessScore}`);
    console.log(`  Sentiment: ${data.scores.sentimentCategory}`);
    if (data.scores.adoptionBarriers?.length) {
      console.log(`  Barriers: ${data.scores.adoptionBarriers.join(', ')}`);
    }
    if (data.scores.highValueOpportunities?.length) {
      console.log(`  Opportunities: ${data.scores.highValueOpportunities.join(', ')}`);
    }
  }
}

/**
 * GET /api/integrations/twentyfive/webhook
 * Verify webhook endpoint (for TwentyFive to confirm it's active)
 */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');

  if (challenge) {
    // Echo back challenge for webhook verification
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ status: 'active' });
}
