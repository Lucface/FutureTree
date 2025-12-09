import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generatePdfBuffer } from '@/lib/pdf';

interface RouteParams {
  params: Promise<{
    pathId: string;
  }>;
}

/**
 * GET /api/pathmap/[pathId]/export/pdf
 * Export a path and its nodes as PDF
 *
 * Query params:
 * - disclosureLevel: Filter nodes by disclosure level (1, 2, or 3), defaults to 2
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { pathId } = await params;
    const { searchParams } = new URL(request.url);
    const disclosureLevelParam = searchParams.get('disclosureLevel');

    // Parse disclosure level
    let disclosureLevel: 1 | 2 | 3 = 2;
    if (disclosureLevelParam) {
      const level = parseInt(disclosureLevelParam, 10);
      if (level >= 1 && level <= 3) {
        disclosureLevel = level as 1 | 2 | 3;
      }
    }

    // Validate pathId format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pathId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid path ID format' },
        { status: 400 }
      );
    }

    // Fetch path with nodes
    const path = await db.query.strategicPaths.findFirst({
      where: eq(schema.strategicPaths.id, pathId),
      with: {
        nodes: true,
      },
    });

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Path not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePdfBuffer({
      path,
      nodes: path.nodes,
      disclosureLevel,
      generatedAt: new Date(),
    });

    // Generate filename
    const slug = path.slug || path.name.toLowerCase().replace(/\s+/g, '-');
    const date = new Date().toISOString().split('T')[0];
    const filename = `pathmap-${slug}-${date}.pdf`;

    // Return as downloadable file
    // Convert Node.js Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
