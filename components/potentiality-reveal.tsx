'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedCounter } from './ui/animated-counter';
import { PathCard } from './path-card';
import { CaseStudyCard } from './case-study-card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, Target, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PathData {
  id: string;
  name: string;
  description?: string;
  companies: number;
  successRate: number;
  avgTimeline: string;
  capitalRequired?: string;
  color: 'green' | 'blue' | 'purple';
}

interface CaseStudyData {
  id: string;
  company: string;
  industry: string;
  subIndustry?: string;
  location?: string;
  beforeRevenue: string;
  afterRevenue: string;
  timeline: string;
  strategy: string;
  strategyLabel: string;
  quote?: string;
  similarity: number;
}

interface RecommendationData {
  pathId: string;
  title: string;
  reason: string;
  successRate: number;
  timeline: string;
  marginDelta: string;
}

interface PotentialityRevealProps {
  companyName: string;
  matchCount: number;
  paths: PathData[];
  recommendation: RecommendationData;
  caseStudies: CaseStudyData[];
  onPathClick?: (pathId: string) => void;
  onCaseStudyClick?: (caseStudyId: string) => void;
}

export function PotentialityReveal({
  companyName,
  matchCount,
  paths,
  recommendation,
  caseStudies,
  onPathClick,
  onCaseStudyClick,
}: PotentialityRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Choreography timing (in seconds)
  const timing = {
    header: 0,
    matchCount: 0.3,
    pathCards: 0.8,
    recommendation: 1.8,
    caseStudies: 2.3,
    cta: 3.0,
  };

  return (
    <div ref={ref} className="max-w-6xl mx-auto px-4 py-16">
      {/* Act 1: The Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: timing.header }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Your Potentiality Report</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {companyName}&apos;s Growth Potential
        </h1>

        {/* The Big Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: timing.matchCount }}
          className="inline-block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-6 rounded-2xl shadow-2xl"
        >
          <span className="text-lg opacity-80 block mb-1">We found</span>
          <span className="block">
            <AnimatedCounter
              value={matchCount}
              className="text-5xl md:text-6xl font-bold"
            />
            <span className="text-5xl md:text-6xl font-bold ml-3">companies</span>
          </span>
          <span className="text-lg opacity-80 block mt-1">similar to yours that reached their goals</span>
        </motion.div>
      </motion.div>

      {/* Act 2: The Three Paths */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: timing.pathCards }}
        className="mb-12"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">
          Choose Your Path
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {paths.map((path, i) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: timing.pathCards + i * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <PathCard
                {...path}
                isRecommended={path.id === recommendation.pathId}
                onClick={() => onPathClick?.(path.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Act 3: The Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: timing.recommendation }}
        className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50
                   border border-emerald-200 dark:border-emerald-800
                   rounded-2xl p-8 mb-12"
      >
        <div className="text-center">
          <Badge className="bg-emerald-500 text-white mb-4">
            <Target className="h-3 w-3 mr-1" />
            RECOMMENDED PATH
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {recommendation.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
            {recommendation.reason}
          </p>
          <div className="flex justify-center gap-8 mt-6 text-sm">
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {recommendation.successRate}%
              </span>
              <span className="text-gray-500 dark:text-gray-400">success rate</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {recommendation.timeline}
              </span>
              <span className="text-gray-500 dark:text-gray-400">avg timeline</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {recommendation.marginDelta}
              </span>
              <span className="text-gray-500 dark:text-gray-400">margin improvement</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Act 4: Case Studies Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: timing.caseStudies }}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Companies That Took This Path
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.slice(0, 3).map((study, i) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: timing.caseStudies + 0.3 + i * 0.1,
              }}
            >
              <CaseStudyCard
                {...study}
                onClick={() => onCaseStudyClick?.(study.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Act 5: The CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: timing.cta }}
        className="text-center mt-12"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pathmap">
            <Button size="lg" className="gap-2">
              Explore Decision Tree
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="gap-2">
            View All Case Studies
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
