import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { NewBusinessProfile, NewDiscoverySession, BusinessProfile } from '@/database/schema';
import { findMatches, formatForApi } from '@/lib/matching/similarity-engine';

/**
 * POST /api/discover
 * Creates a new business profile from the self-discovery wizard
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId || nanoid();

    // Parse form data into schema format
    const profileData: NewBusinessProfile = {
      companyName: body.companyName,
      industry: body.industry,
      subIndustry: body.subIndustry || null,
      location: body.location || null,
      yearsInBusiness: parseYearsInBusiness(body.yearsInBusiness),
      teamSize: body.teamSize || null,

      // Qualifications from step 2
      qualifications: {
        certifications: parseList(body.certifications),
        equipment: parseList(body.equipment),
        specialSkills: parseList(body.specializations),
      },

      // Social Proof from step 3
      socialProof: {
        notableClients: parseList(body.notableClients),
        awards: parseList(body.awards),
        caseStudiesDocumented: parseInt(body.caseStudies) || 0,
      },

      // History from step 3
      history: {
        notableProjects: parseList(body.portfolioHighlights),
      },

      // Current Position from step 4
      currentRevenue: body.currentRevenue || null,
      revenueGrowth: body.revenueGrowth || null,
      biggestChallenge: body.biggestChallenge || null,
      growthGoal: body.growthGoal || null,

      // Tracking
      sessionId,
      completionPercent: 100,
    };

    // Insert the business profile
    const [profile] = await db
      .insert(schema.businessProfiles)
      .values(profileData)
      .returning();

    // Create discovery session record
    const sessionData: NewDiscoverySession = {
      profileId: profile.id,
      sessionId,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      completedAt: new Date(),
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
    };

    await db.insert(schema.discoverySessions).values(sessionData);

    // Find matching case studies
    const matches = await findMatchingCaseStudies(profile);

    return NextResponse.json({
      success: true,
      profile,
      matches,
      redirectTo: `/discover/results/${profile.id}`,
    });
  } catch (error) {
    console.error('Error creating business profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/discover?profileId=xxx
 * Gets a business profile and its matched case studies
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      );
    }

    // Get the profile
    const profile = await db.query.businessProfiles.findFirst({
      where: eq(schema.businessProfiles.id, profileId),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get matched case studies
    const matches = await db.query.profileCaseStudyMatches.findMany({
      where: eq(schema.profileCaseStudyMatches.profileId, profileId),
      with: {
        caseStudy: true,
      },
      orderBy: desc(schema.profileCaseStudyMatches.overallScore),
      limit: 10,
    });

    // Get similar case studies if no matches exist yet
    const caseStudies = matches.map((m) => ({
      ...m.caseStudy,
      matchScore: m.overallScore,
      matchReason: m.matchReason,
    }));

    if (caseStudies.length === 0) {
      // Find matching case studies on the fly
      const matchingResult = await findMatchingCaseStudies(profile);
      // Transform topMatches to the expected caseStudies format
      return NextResponse.json({
        profile,
        caseStudies: matchingResult.topMatches.map(m => ({
          id: m.company, // Use company name as temporary ID
          companyName: m.company,
          industry: m.industry,
          strategyType: m.strategy,
          summary: m.summary,
          matchScore: String(m.score),
          matchReason: m.explanation,
          // Fill in default values for missing fields
          startingState: {},
          endingState: {},
          timeline: { totalMonths: 18 },
          outcomes: { revenueMultiplier: 2 },
        })),
        matchingResult,
        analysisComplete: !!profile.marketPosition,
      });
    }

    return NextResponse.json({
      profile,
      caseStudies,
      analysisComplete: !!profile.marketPosition,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseYearsInBusiness(value: string | undefined): number | null {
  if (!value) return null;
  const mapping: Record<string, number> = {
    '0_1': 0,
    '1_3': 2,
    '3_5': 4,
    '5_10': 7,
    '10_plus': 15,
  };
  return mapping[value] ?? null;
}

/**
 * Find matching case studies using the similarity engine
 */
async function findMatchingCaseStudies(profile: BusinessProfile) {
  // Get all case studies for matching
  const allCaseStudies = await db.query.caseStudies.findMany();

  if (allCaseStudies.length === 0) {
    return {
      topMatches: [],
      byStrategy: [],
      summary: {
        totalMatches: 0,
        totalCandidates: 0,
        recommendedPath: null,
      },
    };
  }

  // Use the similarity engine
  const result = findMatches(profile, allCaseStudies, {
    threshold: 30, // Lower threshold to get more results
    maxResults: 50,
  });

  // Format for API response
  const formatted = formatForApi(result);

  // Also store matches in the database for future retrieval
  const matchesToStore = result.matches.slice(0, 20).map((m) => ({
    profileId: profile.id,
    caseStudyId: m.caseStudy.id,
    overallScore: String(m.score.overall),
    industryMatch: String(m.score.breakdown.industry),
    revenueMatch: String(m.score.breakdown.revenue),
    teamSizeMatch: String(m.score.breakdown.teamSize),
    capabilityMatch: String(m.score.breakdown.capabilities),
    challengeMatch: String(m.score.breakdown.challenges),
    matchReason: m.score.explanation,
    keyTakeaways: m.score.keyTakeaways,
  }));

  // Upsert matches
  for (const match of matchesToStore) {
    await db
      .insert(schema.profileCaseStudyMatches)
      .values(match)
      .onConflictDoNothing();
  }

  return formatted;
}

