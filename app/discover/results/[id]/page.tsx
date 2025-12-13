'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreeDeciduous,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalysisLoading } from '@/components/analysis-loading';
import { PotentialityReveal } from '@/components/potentiality-reveal';

interface BusinessProfile {
  id: string;
  companyName: string;
  industry: string;
  subIndustry?: string;
  location?: string;
  teamSize?: string;
  currentRevenue?: string;
  revenueGrowth?: string;
  biggestChallenge?: string;
  growthGoal?: string;
  qualifications?: {
    certifications?: string[];
    equipment?: string[];
    specialSkills?: string[];
  };
  socialProof?: {
    notableClients?: string[];
    awards?: string[];
  };
}

interface CaseStudy {
  id: string;
  companyName: string;
  industry: string;
  subIndustry?: string;
  location?: string;
  startingState: {
    revenue?: string;
    teamSize?: string;
    challenges?: string[];
  };
  endingState: {
    revenue?: string;
    revenueGrowth?: string;
    achievements?: string[];
  };
  strategyType: string;
  expansionType?: string;
  targetMarket?: string;
  timeline?: {
    totalMonths?: number;
  };
  outcomes?: {
    revenueMultiplier?: number;
  };
  summary?: string;
  advice?: string;
  matchScore?: string;
  matchReason?: string;
}

const revenueLabels: Record<string, string> = {
  under_100k: '<$100K',
  '100k_250k': '$100K-$250K',
  '250k_500k': '$250K-$500K',
  '500k_1m': '$500K-$1M',
  '1m_2.5m': '$1M-$2.5M',
  '2.5m_5m': '$2.5M-$5M',
  '5m_plus': '$5M+',
};

const strategyLabels: Record<string, { label: string; color: 'green' | 'blue' | 'purple' }> = {
  vertical_specialization: { label: 'Vertical Specialization', color: 'green' },
  content_led_growth: { label: 'Content-Led Growth', color: 'blue' },
  partnership_expansion: { label: 'Partnership Expansion', color: 'purple' },
};

type PageState = 'loading' | 'analyzing' | 'results' | 'error';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a fresh visit (show analysis) or returning (show results)
  const [hasSeenAnalysis, setHasSeenAnalysis] = useState(false);

  useEffect(() => {
    // Check session storage to see if user has already seen the analysis animation
    const seen = sessionStorage.getItem(`analysis-${profileId}`);
    if (seen) {
      setHasSeenAnalysis(true);
    }
  }, [profileId]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/discover?profileId=${profileId}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        setProfile(data.profile);
        setCaseStudies(data.caseStudies || []);

        // If they've seen the analysis, go straight to results
        // Otherwise show the analysis animation
        if (hasSeenAnalysis) {
          setPageState('results');
        } else {
          setPageState('analyzing');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setPageState('error');
      }
    }
    fetchResults();
  }, [profileId, hasSeenAnalysis]);

  const handleAnalysisComplete = useCallback(() => {
    // Mark that they've seen the analysis
    sessionStorage.setItem(`analysis-${profileId}`, 'true');
    setPageState('results');
  }, [profileId]);

  // Transform case studies to paths data
  const getPathsData = useCallback(() => {
    const strategyCounts: Record<string, { count: number; totalMonths: number; monthsCount: number }> = {};

    caseStudies.forEach((cs) => {
      const strategy = cs.strategyType;
      if (!strategyCounts[strategy]) {
        strategyCounts[strategy] = { count: 0, totalMonths: 0, monthsCount: 0 };
      }
      strategyCounts[strategy].count++;
      if (cs.timeline?.totalMonths) {
        strategyCounts[strategy].totalMonths += cs.timeline.totalMonths;
        strategyCounts[strategy].monthsCount++;
      }
    });

    const total = caseStudies.length || 1;

    return Object.entries(strategyCounts)
      .map(([strategy, data]) => ({
        id: strategy,
        name: strategyLabels[strategy]?.label || strategy.replace(/_/g, ' '),
        companies: data.count,
        successRate: Math.round((data.count / total) * 100 * 0.8 + 20), // Rough success estimate
        avgTimeline: data.monthsCount > 0
          ? `${Math.round(data.totalMonths / data.monthsCount)} mo`
          : '18 mo',
        color: strategyLabels[strategy]?.color || 'green' as const,
      }))
      .sort((a, b) => b.companies - a.companies)
      .slice(0, 3);
  }, [caseStudies]);

  // Get recommendation data
  const getRecommendation = useCallback(() => {
    const paths = getPathsData();
    const topPath = paths[0];

    if (!topPath) {
      return {
        pathId: 'vertical_specialization',
        title: 'Vertical Specialization',
        reason: 'Based on similar companies in your industry, specializing in a specific vertical has shown the highest success rate.',
        successRate: 85,
        timeline: '16 mo',
        marginDelta: '+14%',
      };
    }

    return {
      pathId: topPath.id,
      title: topPath.name,
      reason: `Based on ${caseStudies.length} similar companies, this strategy shows the highest success rate for businesses like yours.`,
      successRate: topPath.successRate,
      timeline: topPath.avgTimeline,
      marginDelta: '+12%',
    };
  }, [caseStudies, getPathsData]);

  // Transform case studies for display
  const getCaseStudyCards = useCallback(() => {
    return caseStudies.slice(0, 6).map((cs) => ({
      id: cs.id,
      company: cs.companyName,
      industry: cs.industry,
      subIndustry: cs.subIndustry,
      location: cs.location,
      beforeRevenue: revenueLabels[cs.startingState?.revenue || ''] || cs.startingState?.revenue || 'N/A',
      afterRevenue: revenueLabels[cs.endingState?.revenue || ''] || cs.endingState?.revenue || 'N/A',
      timeline: cs.timeline?.totalMonths ? `${cs.timeline.totalMonths} mo` : '~18 mo',
      strategy: cs.strategyType,
      strategyLabel: strategyLabels[cs.strategyType]?.label || cs.strategyType,
      quote: cs.advice || cs.summary,
      similarity: parseFloat(cs.matchScore || '75'),
    }));
  }, [caseStudies]);

  // Loading state
  if (pageState === 'loading') {
    return <LoadingSkeleton />;
  }

  // Error state
  if (pageState === 'error' || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'Unable to load your results'}</p>
            <Link href="/discover">
              <Button>Start Over</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Analysis animation state
  if (pageState === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <header className="border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <TreeDeciduous className="h-6 w-6 text-primary" />
              <span className="font-semibold">FutureTree</span>
            </Link>
          </div>
        </header>
        <AnalysisLoading onComplete={handleAnalysisComplete} />
      </div>
    );
  }

  // Results state - THE MAGIC MOMENT
  const pathsData = getPathsData();
  const recommendation = getRecommendation();
  const caseStudyCards = getCaseStudyCards();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <TreeDeciduous className="h-6 w-6 text-primary" />
            <span className="font-semibold">FutureTree</span>
          </Link>
          <Badge variant="outline" className="gap-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Analysis Complete
          </Badge>
        </div>
      </motion.header>

      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PotentialityReveal
              companyName={profile.companyName}
              matchCount={caseStudies.length}
              paths={pathsData.length > 0 ? pathsData : [
                { id: 'vertical_specialization', name: 'Vertical Specialization', companies: 8, successRate: 87, avgTimeline: '16 mo', color: 'green' },
                { id: 'content_led_growth', name: 'Content-Led Growth', companies: 4, successRate: 75, avgTimeline: '24 mo', color: 'blue' },
                { id: 'partnership_expansion', name: 'Partnership Expansion', companies: 3, successRate: 60, avgTimeline: '18 mo', color: 'purple' },
              ]}
              recommendation={recommendation}
              caseStudies={caseStudyCards.length > 0 ? caseStudyCards : [
                {
                  id: 'sample-1',
                  company: 'Sample Company',
                  industry: 'Technology',
                  beforeRevenue: '$500K',
                  afterRevenue: '$2M',
                  timeline: '18 mo',
                  strategy: 'vertical_specialization',
                  strategyLabel: 'Vertical Specialization',
                  quote: 'We focused on healthcare and it changed everything.',
                  similarity: 85,
                },
              ]}
              onPathClick={(pathId) => {
                router.push(`/pathmap?strategy=${pathId}`);
              }}
              onCaseStudyClick={(caseStudyId) => {
                router.push(`/case-studies/${caseStudyId}`);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreeDeciduous className="h-6 w-6 text-primary" />
            <span className="font-semibold">FutureTree</span>
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-32 w-80 mx-auto rounded-2xl" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl mb-12" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
