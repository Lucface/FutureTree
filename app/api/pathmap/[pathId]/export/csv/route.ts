import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generatePathCsv, generateCsvFilename } from '@/lib/csv';

interface RouteParams {
  params: Promise<{
    pathId: string;
  }>;
}

/**
 * GET /api/pathmap/[pathId]/export/csv
 * Export a path and its nodes as CSV
 *
 * Query params:
 * - disclosureLevel: Filter nodes by disclosure level (1, 2, or 3)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { pathId } = await params;
    const { searchParams } = new URL(request.url);
    const disclosureLevelParam = searchParams.get('disclosureLevel');

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

    // Filter by disclosure level if specified
    let nodes = path.nodes;
    if (disclosureLevelParam) {
      const level = parseInt(disclosureLevelParam, 10);
      if (level >= 1 && level <= 3) {
        nodes = nodes.filter((n) => n.disclosureLevel <= level);
      }
    }

    // Generate CSV
    const csv = generatePathCsv(path, nodes);
    const filename = generateCsvFilename(path);

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
