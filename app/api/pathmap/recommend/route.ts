import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { rankPaths } from '@/lib/pathmap/scoring';
import type { RecommendationResponse } from '@/lib/pathmap/types';
import {
  intakeFormSchema,
  INDUSTRIES,
  COMPANY_SIZES,
  BUSINESS_STAGES,
  TIMELINE_PREFERENCES,
  RISK_TOLERANCES,
  BUDGET_FLEXIBILITIES,
} from '@/lib/validations/intake';

type Industry = (typeof INDUSTRIES)[number];
type CompanySize = (typeof COMPANY_SIZES)[number];
type BusinessStage = (typeof BUSINESS_STAGES)[number];
type TimelinePreference = (typeof TIMELINE_PREFERENCES)[number];
type RiskTolerance = (typeof RISK_TOLERANCES)[number];
type BudgetFlexibility = (typeof BUDGET_FLEXIBILITIES)[number];

/**
 * Request schema for recommendations
 */
const recommendRequestSchema = z.object({
  contextId: z.string().uuid().optional(),
  context: intakeFormSchema.optional(),
}).refine(
  (data) => data.contextId || data.context,
  { message: 'Either contextId or context must be provided' }
);

/**
 * POST /api/pathmap/recommend
 * Get ranked path recommendations based on client context
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = recommendRequestSchema.safeParse(body);

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

    const { contextId, context } = validationResult.data;
    let clientContext = context;
    const resolvedContextId = contextId;

    // If contextId provided, fetch from database
    if (contextId && !context) {
      const dbContext = await db.query.clientContexts.findFirst({
        where: (contexts, { eq }) => eq(contexts.id, contextId),
      });

      if (!dbContext) {
        return NextResponse.json(
          {
            success: false,
            message: 'Context not found',
          },
          { status: 404 }
        );
      }

      // Transform DB context to IntakeFormData format
      clientContext = {
        industry: (dbContext.industry as Industry) || 'other',
        industryOther: undefined,
        companySize: (dbContext.companySize as CompanySize) || 'solo',
        annualRevenue: dbContext.annualRevenue ? Number(dbContext.annualRevenue) : null,
        yearsInBusiness: dbContext.yearsInBusiness,
        currentStage: (dbContext.currentStage as BusinessStage) || 'growth',
        primaryGoal: dbContext.primaryGoal || '',
        biggestChallenge: dbContext.biggestChallenge || '',
        timelinePreference: (dbContext.timelinePreference as TimelinePreference) || 'moderate',
        riskTolerance: (dbContext.riskTolerance as RiskTolerance) || 'moderate',
        availableCapital: dbContext.availableCapital ? Number(dbContext.availableCapital) : 0,
        budgetFlexibility: (dbContext.budgetFlexibility as BudgetFlexibility) || 'flexible',
        additionalConstraints: (dbContext.preferences as Record<string, unknown>)?.additionalConstraints as string || null,
      };
    }

    if (!clientContext) {
      return NextResponse.json(
        {
          success: false,
          message: 'No context data available',
        },
        { status: 400 }
      );
    }

    // Fetch all active strategic paths
    const paths = await db.query.strategicPaths.findMany({
      where: (paths, { eq }) => eq(paths.isActive, true),
    });

    if (paths.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No strategic paths available',
        },
        { status: 404 }
      );
    }

    // Calculate recommendations
    const scores = rankPaths(paths, clientContext);

    const response: RecommendationResponse = {
      scores,
      contextId: resolvedContextId || 'anonymous',
      scoredAt: new Date().toISOString(),
      pathsEvaluated: paths.length,
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Error in /api/pathmap/recommend:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pathmap/recommend?contextId={id}
 * Get recommendations for a specific context
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contextId = searchParams.get('contextId');

    if (!contextId) {
      return NextResponse.json(
        {
          success: false,
          message: 'contextId is required',
        },
        { status: 400 }
      );
    }

    // Delegate to POST handler
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ contextId }),
      headers: { 'Content-Type': 'application/json' },
    });

    return POST(postRequest);
  } catch (error) {
    console.error('Error in GET /api/pathmap/recommend:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get recommendations',
      },
      { status: 500 }
    );
  }
}
