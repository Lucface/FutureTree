import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { twentyfiveConnections } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { testConnection } from '@/lib/integrations/twentyfive';

const connectSchema = z.object({
  contextId: z.string().uuid(),
  apiKey: z.string().min(10),
  webhookSecret: z.string().min(10),
});

/**
 * POST /api/integrations/twentyfive/connect
 * Create or update TwentyFive connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contextId, apiKey, webhookSecret } = connectSchema.parse(body);

    // Test the connection first
    const testResult = await testConnection({
      apiKey,
      webhookSecret,
    });

    if (!testResult.success) {
      return NextResponse.json(
        { error: 'Connection test failed', details: testResult.message },
        { status: 400 }
      );
    }

    // Check for existing connection
    const existing = await db.query.twentyfiveConnections.findFirst({
      where: eq(twentyfiveConnections.contextId, contextId),
    });

    if (existing) {
      // Update existing
      await db
        .update(twentyfiveConnections)
        .set({
          apiKey,
          webhookSecret,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(twentyfiveConnections.id, existing.id));

      return NextResponse.json({
        success: true,
        message: 'Connection updated',
        connectionId: existing.id,
      });
    }

    // Create new connection
    const [connection] = await db
      .insert(twentyfiveConnections)
      .values({
        contextId,
        apiKey,
        webhookSecret,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Connection created',
      connectionId: connection.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('TwentyFive connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/twentyfive/connect?contextId=xxx
 * Disconnect TwentyFive integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const contextId = request.nextUrl.searchParams.get('contextId');

    if (!contextId) {
      return NextResponse.json(
        { error: 'contextId is required' },
        { status: 400 }
      );
    }

    await db
      .update(twentyfiveConnections)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(twentyfiveConnections.contextId, contextId));

    return NextResponse.json({
      success: true,
      message: 'Connection disabled',
    });
  } catch (error) {
    console.error('TwentyFive disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/twentyfive/connect?contextId=xxx
 * Get connection status
 */
export async function GET(request: NextRequest) {
  try {
    const contextId = request.nextUrl.searchParams.get('contextId');

    if (!contextId) {
      return NextResponse.json(
        { error: 'contextId is required' },
        { status: 400 }
      );
    }

    const connection = await db.query.twentyfiveConnections.findFirst({
      where: eq(twentyfiveConnections.contextId, contextId),
      columns: {
        id: true,
        isActive: true,
        syncEnabled: true,
        syncFrequency: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        createdAt: true,
      },
    });

    if (!connection) {
      return NextResponse.json({
        connected: false,
      });
    }

    return NextResponse.json({
      connected: connection.isActive,
      connectionId: connection.id,
      syncEnabled: connection.syncEnabled,
      syncFrequency: connection.syncFrequency,
      lastSyncAt: connection.lastSyncAt,
      lastSyncStatus: connection.lastSyncStatus,
      createdAt: connection.createdAt,
    });
  } catch (error) {
    console.error('TwentyFive status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
