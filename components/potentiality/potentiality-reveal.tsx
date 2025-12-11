'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedCounter, PremiumButton } from '@/components/ui/premium';
import { PathCard } from './path-card';
import { CaseStudyCard } from './case-study-card';

// Types for the data
interface PathData {
  id: string;
  name: string;
  companies: number;
  successRate: number;
  avgTimeline: string;
  capitalRequired: string;
  color: 'green' | 'blue' | 'purple';
  description?: string;
}

interface RecommendationData {
  pathId: string;
  title: string;
  reason: string;
  successRate: number;
  timeline: string;
  marginDelta: string;
}

interface CaseStudyData {
  id: string;
  company: string;
  industry: string;
  logo?: string;
  beforeRevenue: string;
  afterRevenue: string;
  timeline: string;
  strategy: string;
  quote: string;
  similarity: number;
}

interface PotentialityRevealProps {
  /** Number of matching companies found */
  matchCount: number;
  /** Available strategic paths */
  paths: PathData[];
  /** AI recommendation */
  recommendation: RecommendationData;
  /** Similar case studies */
  caseStudies: CaseStudyData[];
  /** Callback when user wants to explore decision tree */
  onExploreTree?: () => void;
  /** Callback when user wants to view all case studies */
  onViewCaseStudies?: () => void;
  /** Callback when user clicks on a path card */
  onPathClick?: (pathId: string) => void;
  /** Callback when user clicks on a case study */
  onCaseStudyClick?: (caseStudyId: string) => void;
}

/**
 * PotentialityReveal - THE screenshot moment. The big reveal.
 *
 * Choreographed animation sequence:
 * - 0.0s: Header fades in
 * - 0.3s: Match count scales in, number counts up
 * - 0.8s: Path cards stagger in
 * - 1.8s: Recommendation banner slides in
 * - 2.3s: Case study cards stagger in
 * - 3.0s: CTA buttons fade up
 *
 * @example
 * <PotentialityReveal
 *   matchCount={15}
 *   paths={[...]}
 *   recommendation={{...}}
 *   caseStudies={[...]}
 *   onExploreTree={() => router.push('/decision-tree')}
 * />
 */
export function PotentialityReveal({
  matchCount,
  paths,
  recommendation,
  caseStudies,
  onExploreTree,
  onViewCaseStudies,
  onPathClick,
  onCaseStudyClick,
}: PotentialityRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Your Potentiality
        </h1>

        {/* The Big Number - The "wow" moment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: timing.matchCount }}
          className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-6 rounded-2xl shadow-premium-lg"
        >
          <span className="text-lg opacity-80 block">We found</span>
          <span className="block text-5xl md:text-6xl font-bold my-2">
            <AnimatedCounter value={matchCount} /> companies
          </span>
          <span className="text-lg opacity-80 block">
            similar to you that reached your goal
          </span>
        </motion.div>
      </motion.div>

      {/* Act 2: The Three Paths */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: timing.pathCards }}
        className="grid md:grid-cols-3 gap-6 mb-12"
      >
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
              name={path.name}
              companies={path.companies}
              successRate={path.successRate}
              avgTimeline={path.avgTimeline}
              capitalRequired={path.capitalRequired}
              color={path.color}
              isRecommended={path.id === recommendation.pathId}
              description={path.description}
              onClick={() => onPathClick?.(path.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Act 3: The Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: timing.recommendation }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30
                   border border-green-200 dark:border-green-800
                   rounded-2xl p-6 mb-12 text-center"
      >
        <span className="text-green-600 dark:text-green-400 font-semibold">
          ★ RECOMMENDED PATH
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {recommendation.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          {recommendation.reason}
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-4 text-sm">
          <span className="text-gray-900 dark:text-white">
            <strong className="text-green-600 dark:text-green-400">
              {recommendation.successRate}%
            </strong>{' '}
            success rate
          </span>
          <span className="text-gray-900 dark:text-white">
            <strong>{recommendation.timeline}</strong> avg timeline
          </span>
          <span className="text-gray-900 dark:text-white">
            <strong className="text-green-600 dark:text-green-400">
              {recommendation.marginDelta}
            </strong>{' '}
            margin improvement
          </span>
        </div>
      </motion.div>

      {/* Act 4: Case Studies Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: timing.caseStudies }}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Companies that took this path
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
                company={study.company}
                industry={study.industry}
                logo={study.logo}
                beforeRevenue={study.beforeRevenue}
                afterRevenue={study.afterRevenue}
                timeline={study.timeline}
                strategy={study.strategy}
                quote={study.quote}
                similarity={study.similarity}
                onClick={() => onCaseStudyClick?.(study.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Act 5: The CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: timing.cta }}
        className="text-center mt-12"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PremiumButton size="lg" onClick={onExploreTree}>
            Explore Decision Tree
          </PremiumButton>
          <PremiumButton variant="secondary" size="lg" onClick={onViewCaseStudies}>
            View All Case Studies
          </PremiumButton>
        </div>
      </motion.div>
    </div>
  );
}
