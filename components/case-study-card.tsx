'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseStudyCardProps {
  company: string;
  industry: string;
  subIndustry?: string;
  location?: string;
  logo?: string;
  beforeRevenue: string;
  afterRevenue: string;
  timeline: string;
  strategy: string;
  strategyLabel: string;
  quote?: string;
  similarity: number;
  onClick?: () => void;
}

const strategyColors: Record<string, string> = {
  vertical_specialization: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  content_led_growth: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  partnership_expansion: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
};

export function CaseStudyCard({
  company,
  industry,
  subIndustry,
  location,
  logo,
  beforeRevenue,
  afterRevenue,
  timeline,
  strategy,
  strategyLabel,
  quote,
  similarity,
  onClick,
}: CaseStudyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6',
        'shadow-sm hover:shadow-lg transition-shadow duration-300',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Similarity Badge */}
      <div className="absolute -top-3 -right-3">
        <Badge className="bg-emerald-500 text-white px-3 py-1 shadow-lg">
          {similarity}% match
        </Badge>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {logo ? (
          <Image src={logo} alt={company} width={48} height={48} className="w-12 h-12 rounded-lg object-contain" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
              {company.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{company}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {subIndustry || industry} {location && `• ${location}`}
          </p>
        </div>
      </div>

      {/* Transformation Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Before</p>
          <p className="text-lg font-semibold text-gray-400 line-through">{beforeRevenue}</p>
        </div>
        <div className="text-center flex flex-col items-center justify-center">
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">After</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{afterRevenue}</p>
        </div>
      </div>

      {/* Strategy Tag & Timeline */}
      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline" className={strategyColors[strategy] || ''}>
          {strategyLabel}
        </Badge>
        <span className="text-sm text-gray-500 dark:text-gray-400">{timeline}</span>
      </div>

      {/* Quote */}
      {quote && (
        <div className="mt-4 relative">
          <Quote className="absolute -top-1 -left-1 h-4 w-4 text-gray-300 dark:text-gray-600" />
          <blockquote className="pl-5 text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
            {quote}
          </blockquote>
        </div>
      )}
    </motion.div>
  );
}
