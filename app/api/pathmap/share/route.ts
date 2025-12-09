import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import {
  createShareSlug,
  createShareUrl,
  calculateExpirationDate,
} from '@/lib/share';
import { hash, compare } from 'bcryptjs';

/**
 * Request schema for creating a share link
 */
const createShareLinkSchema = z.object({
  pathId: z.string().uuid(),
  explorationId: z.string().uuid().optional(),
  state: z.object({
    disclosureLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    expandedNodeIds: z.array(z.string()),
    selectedNodeId: z.string().optional(),
    notes: z.string().optional(),
  }),
  expiresInDays: z.number().min(1).max(90).default(7),
  maxViews: z.number().min(1).max(1000).optional(),
  password: z.string().min(4).max(50).optional(),
  title: z.string().max(200).optional(),
});

/**
 * POST /api/pathmap/share
 * Create a new shareable link for a path exploration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createShareLinkSchema.safeParse(body);

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

    const { pathId, explorationId, state, expiresInDays, maxViews, password, title } =
      validationResult.data;

    // Verify path exists
    const path = await db.query.strategicPaths.findFirst({
      where: (paths, { eq }) => eq(paths.id, pathId),
    });

    if (!path) {
      return NextResponse.json(
        {
          success: false,
          message: 'Path not found',
        },
        { status: 404 }
      );
    }

    // Generate unique slug
    const slug = createShareSlug();

    // Hash password if provided
    const passwordHash = password ? await hash(password, 10) : null;

    // Calculate expiration
    const expiresAt = calculateExpirationDate(expiresInDays);

    // Insert share link
    const [shareLink] = await db
      .insert(schema.sharedPathLinks)
      .values({
        pathId,
        explorationId: explorationId || null,
        slug,
        state,
        expiresAt,
        maxViews: maxViews || null,
        password: passwordHash,
        title: title || null,
        createdBy: null, // Could be set from session
      })
      .returning();

    if (!shareLink) {
      throw new Error('Failed to create share link');
    }

    const url = createShareUrl(slug);

    return NextResponse.json({
      success: true,
      shareLink: {
        id: shareLink.id,
        slug: shareLink.slug,
        url,
        expiresAt: shareLink.expiresAt.toISOString(),
        maxViews: shareLink.maxViews,
        viewCount: shareLink.viewCount,
        hasPassword: !!shareLink.password,
        title: shareLink.title,
        createdAt: shareLink.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create share link',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pathmap/share?slug={slug}
 * Get share link details (for validation before viewing)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: 'Slug is required',
        },
        { status: 400 }
      );
    }

    const shareLink = await db.query.sharedPathLinks.findFirst({
      where: (links, { eq }) => eq(links.slug, slug),
      with: {
        path: true,
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

    // Check view limit
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

    return NextResponse.json({
      success: true,
      shareLink: {
        id: shareLink.id,
        slug: shareLink.slug,
        title: shareLink.title,
        pathName: shareLink.path.name,
        pathSlug: shareLink.path.slug,
        requiresPassword: !!shareLink.password,
        expiresAt: shareLink.expiresAt.toISOString(),
        viewCount: shareLink.viewCount,
        maxViews: shareLink.maxViews,
      },
    });
  } catch (error) {
    console.error('Error getting share link:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get share link',
      },
      { status: 500 }
    );
  }
}
