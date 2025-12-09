import { db } from '@/lib/db';
import {
  twentyfiveConnections,
  integrationWebhooks,
  strategicPaths,
  decisionNodes,
  pathExplorations,
  pathOutcomes,
} from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { createSignedHeaders } from './hmac';
import type {
  TwentyFiveConnectionConfig,
  RoadmapExportPayload,
  RoadmapPhase,
  TwentyFiveApiResponse,
  CreateProjectResponse,
  SyncStatus,
} from './types';

/**
 * TwentyFive CRM Client
 *
 * Handles all interactions with TwentyFive CRM API.
 */

const DEFAULT_BASE_URL = 'https://api.twentyfive.io/v1';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 4000, 16000]; // Exponential backoff: 1s, 4s, 16s

/**
 * Get connection configuration for a context
 */
export async function getConnectionConfig(
  contextId: string
): Promise<TwentyFiveConnectionConfig | null> {
  const connection = await db.query.twentyfiveConnections.findFirst({
    where: and(
      eq(twentyfiveConnections.contextId, contextId),
      eq(twentyfiveConnections.isActive, true)
    ),
  });

  if (!connection) return null;

  return {
    apiKey: connection.apiKey,
    webhookSecret: connection.webhookSecret,
    baseUrl: DEFAULT_BASE_URL,
  };
}

/**
 * Make authenticated API request to TwentyFive
 */
async function makeRequest<T>(
  endpoint: string,
  config: TwentyFiveConnectionConfig,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, unknown>,
  retryCount = 0
): Promise<TwentyFiveApiResponse<T>> {
  const url = `${config.baseUrl || DEFAULT_BASE_URL}${endpoint}`;
  const payload = body ? JSON.stringify(body) : '';
  const headers = createSignedHeaders(payload, config.apiKey, config.webhookSecret);

  // Log outbound webhook
  const [webhookLog] = await db
    .insert(integrationWebhooks)
    .values({
      direction: 'outbound',
      service: 'twentyfive',
      endpoint: url,
      payload: body || {},
      status: 'pending',
    })
    .returning();

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: payload || undefined,
    });

    const data = await response.json();

    // Update webhook log
    await db
      .update(integrationWebhooks)
      .set({
        status: response.ok ? 'success' : 'failed',
        responseCode: response.status,
        responseBody: data,
        completedAt: new Date(),
      })
      .where(eq(integrationWebhooks.id, webhookLog.id));

    if (!response.ok) {
      // Handle retry for certain error codes
      if (
        (response.status >= 500 || response.status === 429) &&
        retryCount < MAX_RETRIES
      ) {
        await db
          .update(integrationWebhooks)
          .set({
            status: 'retrying',
            retryCount: retryCount + 1,
            nextRetryAt: new Date(Date.now() + RETRY_DELAYS[retryCount]),
          })
          .where(eq(integrationWebhooks.id, webhookLog.id));

        // Wait and retry
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[retryCount])
        );
        return makeRequest(endpoint, config, method, body, retryCount + 1);
      }

      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: data.error?.message || 'Request failed',
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Log error
    await db
      .update(integrationWebhooks)
      .set({
        status: 'failed',
        lastError: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      })
      .where(eq(integrationWebhooks.id, webhookLog.id));

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS[retryCount])
      );
      return makeRequest(endpoint, config, method, body, retryCount + 1);
    }

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Export a roadmap to TwentyFive as a new project
 */
export async function exportRoadmap(
  pathId: string,
  contextId: string,
  options: {
    clientName?: string;
    clientEmail?: string;
  } = {}
): Promise<TwentyFiveApiResponse<CreateProjectResponse>> {
  const config = await getConnectionConfig(contextId);
  if (!config) {
    return {
      success: false,
      error: {
        code: 'NO_CONNECTION',
        message: 'TwentyFive connection not found for this context',
      },
    };
  }

  // Get path with nodes
  const path = await db.query.strategicPaths.findFirst({
    where: eq(strategicPaths.id, pathId),
    with: {
      nodes: {
        orderBy: (nodes, { asc }) => [asc(nodes.sortOrder)],
      },
    },
  });

  if (!path) {
    return {
      success: false,
      error: {
        code: 'PATH_NOT_FOUND',
        message: 'Strategic path not found',
      },
    };
  }

  // Build roadmap payload
  const phases: RoadmapPhase[] = path.nodes.map((node, index) => ({
    id: node.id,
    name: node.label,
    description: node.description || undefined,
    type: node.type as RoadmapPhase['type'],
    order: index,
    durationWeeks: node.durationWeeks || undefined,
    cost: node.cost ? parseFloat(node.cost) : undefined,
    dependencies: node.dependencies || undefined,
    successCriteria: undefined,
  }));

  const payload: RoadmapExportPayload = {
    pathId: path.id,
    pathName: path.name,
    clientContextId: contextId,
    clientName: options.clientName,
    clientEmail: options.clientEmail,
    phases,
    metadata: {
      predictedTimeline: path.timelineP75 || 0,
      predictedCost: path.capitalP75 ? parseFloat(path.capitalP75) : 0,
      predictedSuccessRate: path.successRate ? parseFloat(path.successRate) : 0,
      disclosureLevel: 2,
      exportedAt: new Date().toISOString(),
    },
  };

  return makeRequest<CreateProjectResponse>(
    '/projects',
    config,
    'POST',
    payload as unknown as Record<string, unknown>
  );
}

/**
 * Get sync status for a connection
 */
export async function getSyncStatus(contextId: string): Promise<SyncStatus> {
  const connection = await db.query.twentyfiveConnections.findFirst({
    where: eq(twentyfiveConnections.contextId, contextId),
  });

  if (!connection) {
    return {
      lastSyncAt: null,
      lastSyncStatus: null,
      pendingUpdates: 0,
    };
  }

  // Count pending webhooks
  const pendingWebhooks = await db.query.integrationWebhooks.findMany({
    where: and(
      eq(integrationWebhooks.service, 'twentyfive'),
      eq(integrationWebhooks.status, 'pending')
    ),
  });

  return {
    lastSyncAt: connection.lastSyncAt,
    lastSyncStatus: connection.lastSyncStatus as 'success' | 'failed' | null,
    pendingUpdates: pendingWebhooks.length,
  };
}

/**
 * Update connection sync status
 */
export async function updateSyncStatus(
  contextId: string,
  status: 'success' | 'failed'
): Promise<void> {
  await db
    .update(twentyfiveConnections)
    .set({
      lastSyncAt: new Date(),
      lastSyncStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(twentyfiveConnections.contextId, contextId));
}

/**
 * Test connection to TwentyFive
 */
export async function testConnection(
  config: TwentyFiveConnectionConfig
): Promise<{ success: boolean; message: string }> {
  const response = await makeRequest<{ status: string }>(
    '/health',
    config,
    'GET'
  );

  if (response.success) {
    return {
      success: true,
      message: 'Connection successful',
    };
  }

  return {
    success: false,
    message: response.error?.message || 'Connection failed',
  };
}
