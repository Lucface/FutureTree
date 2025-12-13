'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CaseStudyCardProps {
  /** Company name */
  company: string;
  /** Industry */
  industry: string;
  /** Company logo URL */
  logo?: string;
  /** Revenue before transformation */
  beforeRevenue: string;
  /** Revenue after transformation */
  afterRevenue: string;
  /** Time to achieve transformation */
  timeline: string;
  /** Strategy used */
  strategy: string;
  /** Key quote from the case study */
  quote: string;
  /** Similarity score to current user (0-100) */
  similarity: number;
  /** Click handler */
  onClick?: () => void;
}

/**
 * CaseStudyCard - Transformation story with before/after metrics.
 *
 * Shows rich case study data including:
 * - Company logo and identity
 * - Before/After transformation metrics
 * - Timeline
 * - Strategy tag
 * - Key insight quote
 * - Similarity match percentage
 *
 * @example
 * <CaseStudyCard
 *   company="Sandwich Video"
 *   industry="Videography"
 *   logo="/logos/sandwich.png"
 *   beforeRevenue="$500K"
 *   afterRevenue="$7.5M"
 *   timeline="24 mo"
 *   strategy="Vertical Specialization"
 *   quote="We stopped being generalists and became the go-to for tech startups."
 *   similarity={92}
 * />
 */
export function CaseStudyCard({
  company,
  industry,
  logo,
  beforeRevenue,
  afterRevenue,
  timeline,
  strategy,
  quote,
  similarity,
  onClick,
}: CaseStudyCardProps) {
  // Determine similarity color
  const getSimilarityColor = (score: number): string => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-gray-500';
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'group relative bg-white dark:bg-dark-surface rounded-2xl',
        'border border-gray-200 dark:border-dark-border p-6',
        'shadow-sm hover:shadow-lg dark:hover:shadow-2xl',
        'transition-shadow duration-300',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Similarity Badge */}
      <div className="absolute -top-3 -right-3">
        <Badge
          className={cn(
            'text-white px-3 py-1 font-semibold',
            getSimilarityColor(similarity)
          )}
        >
          {similarity}% match
        </Badge>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {logo ? (
          <Image
            src={logo}
            alt={company}
            width={48}
            height={48}
            className="w-12 h-12 rounded-lg object-contain bg-gray-100 dark:bg-dark-elevated p-1"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-elevated flex items-center justify-center">
            <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
              {company.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{company}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{industry}</p>
        </div>
      </div>

      {/* Transformation Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 dark:border-dark-border">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Before
          </p>
          <p className="text-lg font-semibold text-gray-400 line-through">
            {beforeRevenue}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            After
          </p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {afterRevenue}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Timeline
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {timeline}
          </p>
        </div>
      </div>

      {/* Strategy Tag */}
      <div className="mt-4">
        <Badge variant="outline" className="dark:border-dark-border dark:text-gray-300">
          {strategy}
        </Badge>
      </div>

      {/* Quote */}
      <blockquote className="mt-4 text-sm text-gray-600 dark:text-gray-400 italic">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Hover Indicator */}
      {onClick && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            View story →
          </span>
        </div>
      )}
    </motion.div>
  );
}
