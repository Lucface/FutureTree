import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { compare } from 'bcryptjs';

/**
 * Request schema for accessing a share link
 */
const accessShareLinkSchema = z.object({
  slug: z.string().min(8).max(12),
  password: z.string().optional(),
});

/**
 * POST /api/pathmap/share/access
 * Access a shared path link (verify password, increment view count)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = accessShareLinkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { slug, password } = validationResult.data;

    // Find the share link
    const shareLink = await db.query.sharedPathLinks.findFirst({
      where: (links, { eq }) => eq(links.slug, slug),
      with: {
        path: {
          with: {
            nodes: true,
          },
        },
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        {
          success: false,
          message: 'Share link not found',
        },
        { status: 404 }
      );
    }

    // Check if expired
    if (shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: 'This share link has expired',
          expired: true,
        },
        { status: 410 }
      );
    }

    // Check view limit (before incrementing)
    if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
      return NextResponse.json(
        {
          success: false,
          message: 'This share link has reached its view limit',
          viewLimitReached: true,
        },
        { status: 410 }
      );
    }

    // Verify password if required
    if (shareLink.password) {
      if (!password) {
        return NextResponse.json(
          {
            success: false,
            message: 'Password required',
            requiresPassword: true,
          },
          { status: 401 }
        );
      }

      const isValidPassword = await compare(password, shareLink.password);
      if (!isValidPassword) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid password',
          },
          { status: 401 }
        );
      }
    }

    // Increment view count
    await db
      .update(schema.sharedPathLinks)
      .set({
        viewCount: sql`${schema.sharedPathLinks.viewCount} + 1`,
      })
      .where(eq(schema.sharedPathLinks.id, shareLink.id));

    // Return the shared path data with state
    return NextResponse.json({
      success: true,
      data: {
        path: {
          id: shareLink.path.id,
          name: shareLink.path.name,
          slug: shareLink.path.slug,
          summary: shareLink.path.summary,
          description: shareLink.path.description,
          successRate: shareLink.path.successRate,
          caseCount: shareLink.path.caseCount,
          timelineP25: shareLink.path.timelineP25,
          timelineP75: shareLink.path.timelineP75,
          capitalP25: shareLink.path.capitalP25,
          capitalP75: shareLink.path.capitalP75,
          riskScore: shareLink.path.riskScore,
          confidenceLevel: shareLink.path.confidenceLevel,
          icon: shareLink.path.icon,
          color: shareLink.path.color,
        },
        nodes: shareLink.path.nodes.map((node) => ({
          id: node.id,
          pathId: node.pathId,
          parentId: node.parentId,
          label: node.label,
          description: node.description,
          type: node.type,
          disclosureLevel: node.disclosureLevel,
          cost: node.cost,
          durationWeeks: node.durationWeeks,
          successProbability: node.successProbability,
          dependencies: node.dependencies,
          riskFactors: node.riskFactors,
          mitigationStrategies: node.mitigationStrategies,
          children: node.children,
          sortOrder: node.sortOrder,
          position: node.position,
          confidenceLevel: node.confidenceLevel,
        })),
        state: shareLink.state,
        shareInfo: {
          title: shareLink.title,
          viewCount: shareLink.viewCount + 1,
          maxViews: shareLink.maxViews,
          expiresAt: shareLink.expiresAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error accessing share link:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to access share link',
      },
      { status: 500 }
    );
  }
}
