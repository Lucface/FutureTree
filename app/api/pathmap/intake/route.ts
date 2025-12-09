import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { intakeFormSchema } from '@/lib/validations/intake';
import { nanoid } from 'nanoid';

/**
 * POST /api/pathmap/intake
 * Saves client context from the intake form
 * Returns contextId for personalized path recommendations
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = intakeFormSchema.safeParse(body);

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

    const data = validationResult.data;

    // Generate a session ID for anonymous tracking
    const sessionId = nanoid(16);

    // Prepare the insert data, handling optional fields
    const insertData: typeof schema.clientContexts.$inferInsert = {
      sessionId,

      // Business profile
      industry: data.industry === 'other' && data.industryOther
        ? data.industryOther
        : data.industry,
      companySize: data.companySize,
      annualRevenue: data.annualRevenue ? String(data.annualRevenue) : null,
      yearsInBusiness: data.yearsInBusiness ?? null,

      // Strategic context
      currentStage: data.currentStage,
      primaryGoal: data.primaryGoal,
      biggestChallenge: data.biggestChallenge,
      timelinePreference: data.timelinePreference,
      riskTolerance: data.riskTolerance,

      // Constraints
      availableCapital: String(data.availableCapital),
      budgetFlexibility: data.budgetFlexibility,

      // Store additional info in preferences
      preferences: {
        additionalConstraints: data.additionalConstraints || null,
        originalIndustry: data.industry,
        submittedAt: new Date().toISOString(),
      },
    };

    // Insert into database
    const [result] = await db
      .insert(schema.clientContexts)
      .values(insertData)
      .returning({ id: schema.clientContexts.id });

    if (!result) {
      throw new Error('Failed to create client context');
    }

    const contextId = result.id;

    return NextResponse.json({
      success: true,
      contextId,
      redirectUrl: `/pathmap?context=${contextId}`,
      message: 'Your information has been saved. Generating personalized recommendations...',
    });
  } catch (error) {
    console.error('Error in /api/pathmap/intake:', error);

    // Handle specific database errors
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        {
          success: false,
          message: 'A context with this information already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save your information. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pathmap/intake/:contextId
 * Retrieves a client context by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contextId = searchParams.get('id');

    if (!contextId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Context ID is required',
        },
        { status: 400 }
      );
    }

    const context = await db.query.clientContexts.findFirst({
      where: (contexts, { eq }) => eq(contexts.id, contextId),
    });

    if (!context) {
      return NextResponse.json(
        {
          success: false,
          message: 'Context not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('Error in GET /api/pathmap/intake:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve context',
      },
      { status: 500 }
    );
  }
}
