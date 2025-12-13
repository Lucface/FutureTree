import { db } from '@/lib/db';
import {
  outcomeSurveys,
  pathExplorations,
  type NewOutcomeSurvey,
} from '@/database/schema';
import { eq, and, lte } from 'drizzle-orm';
import { SURVEY_TYPES, type SurveyType } from '@/lib/pathmap/survey-types';

// Re-export for backward compatibility with existing imports
export { SURVEY_TYPES, type SurveyType };

/**
 * Schedule all surveys for an exploration
 * Called after a user exports/converts a path
 */
export async function scheduleSurveysForExploration(
  explorationId: string,
  recipientEmail?: string
): Promise<void> {
  const exploration = await db.query.pathExplorations.findFirst({
    where: eq(pathExplorations.id, explorationId),
    with: {
      context: true,
    },
  });

  if (!exploration) {
    throw new Error(`Exploration not found: ${explorationId}`);
  }

  // Use provided email or try to get from context
  const email = recipientEmail || exploration.context?.email;

  const now = new Date();
  const surveysToCreate: NewOutcomeSurvey[] = [];

  for (const [type, config] of Object.entries(SURVEY_TYPES)) {
    const scheduledFor = new Date(now);
    scheduledFor.setDate(scheduledFor.getDate() + config.delayDays);

    surveysToCreate.push({
      explorationId,
      surveyType: type,
      scheduledFor,
      status: 'scheduled',
      recipientEmail: email || undefined,
      deliveryMethod: email ? 'email' : 'in_app',
    });
  }

  await db.insert(outcomeSurveys).values(surveysToCreate);
}

/**
 * Get surveys due for sending
 * Should be called by a cron job or queue processor
 */
export async function getSurveysDueForSending(): Promise<
  Array<{
    id: string;
    explorationId: string;
    surveyType: string;
    recipientEmail: string | null;
    scheduledFor: Date;
    deliveryMethod: string | null;
  }>
> {
  const now = new Date();

  const dueSurveys = await db.query.outcomeSurveys.findMany({
    where: and(
      eq(outcomeSurveys.status, 'scheduled'),
      lte(outcomeSurveys.scheduledFor, now)
    ),
    columns: {
      id: true,
      explorationId: true,
      surveyType: true,
      recipientEmail: true,
      scheduledFor: true,
      deliveryMethod: true,
    },
  });

  return dueSurveys;
}

/**
 * Mark a survey as sent
 * @param surveyId - The ID of the survey
 * @param _messageId - Optional email message ID (logged but not stored)
 */
export async function markSurveyAsSent(
  surveyId: string,
  _messageId?: string
): Promise<void> {
  // Note: messageId is logged by the cron job for debugging but not persisted
  await db
    .update(outcomeSurveys)
    .set({
      status: 'sent',
      sentAt: new Date(),
    })
    .where(eq(outcomeSurveys.id, surveyId));
}

/**
 * Get pending surveys for a user (for in-app display)
 */
export async function getPendingSurveysForUser(
  sessionId: string
): Promise<
  Array<{
    id: string;
    surveyType: SurveyType;
    scheduledFor: Date;
    explorationId: string;
    pathId: string;
    pathName: string;
  }>
> {
  const explorations = await db.query.pathExplorations.findMany({
    where: eq(pathExplorations.sessionId, sessionId),
    columns: { id: true },
  });

  const explorationIds = explorations.map((e) => e.id);
  if (explorationIds.length === 0) return [];

  const now = new Date();
  const surveys = await db.query.outcomeSurveys.findMany({
    where: and(
      eq(outcomeSurveys.status, 'scheduled'),
      lte(outcomeSurveys.scheduledFor, now)
    ),
    with: {
      exploration: {
        with: {
          path: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Filter to only this user's explorations
  return surveys
    .filter((s) => explorationIds.includes(s.explorationId))
    .map((s) => ({
      id: s.id,
      surveyType: s.surveyType as SurveyType,
      scheduledFor: s.scheduledFor,
      explorationId: s.explorationId,
      pathId: s.exploration.path.id,
      pathName: s.exploration.path.name,
    }));
}

/**
 * Submit survey responses
 */
export async function submitSurveyResponse(
  surveyId: string,
  responses: {
    hasStarted?: boolean;
    progressPercent?: number;
    actualSpend?: number;
    outcome?: 'success' | 'partial' | 'failure' | 'pivoted' | 'abandoned';
    lessons?: string;
    wouldRecommend?: number;
    additionalNotes?: string;
  }
): Promise<void> {
  await db
    .update(outcomeSurveys)
    .set({
      status: 'completed',
      completedAt: new Date(),
      responses,
    })
    .where(eq(outcomeSurveys.id, surveyId));
}

/**
 * Skip a survey (user opts out)
 */
export async function skipSurvey(surveyId: string): Promise<void> {
  await db
    .update(outcomeSurveys)
    .set({
      status: 'skipped',
    })
    .where(eq(outcomeSurveys.id, surveyId));
}

/**
 * Get survey with full details for display
 */
export async function getSurveyById(surveyId: string) {
  const survey = await db.query.outcomeSurveys.findFirst({
    where: eq(outcomeSurveys.id, surveyId),
    with: {
      exploration: {
        with: {
          path: true,
        },
      },
    },
  });

  if (!survey) return null;

  return {
    ...survey,
    config: SURVEY_TYPES[survey.surveyType as SurveyType],
  };
}

/**
 * Expire old uncompleted surveys
 */
export async function expireOldSurveys(): Promise<number> {
  // Expire surveys that are 30 days past their scheduled date and still pending
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  await db
    .update(outcomeSurveys)
    .set({ status: 'expired' })
    .where(
      and(
        eq(outcomeSurveys.status, 'sent'),
        lte(outcomeSurveys.scheduledFor, cutoff)
      )
    );

  return 0; // Drizzle doesn't return count easily, would need raw query
}
