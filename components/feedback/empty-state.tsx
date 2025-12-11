'use client';

import { motion } from 'framer-motion';
import { FileSearch, Compass, Lightbulb, BookOpen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '@/components/ui/premium';
import { ReactNode } from 'react';

type EmptyType = 'no-results' | 'no-data' | 'no-matches' | 'get-started';

interface EmptyStateProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyContent: Record<EmptyType, { title: string; description: string; Icon: typeof FileSearch }> = {
  'no-results': {
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    Icon: FileSearch,
  },
  'no-data': {
    title: 'No data yet',
    description: 'Start by adding your first entry to see information here.',
    Icon: Plus,
  },
  'no-matches': {
    title: 'No matches found',
    description: 'We couldn\'t find any case studies matching your profile. Try broadening your criteria.',
    Icon: Compass,
  },
  'get-started': {
    title: 'Ready to discover your potential?',
    description: 'Complete the discovery wizard to see strategic paths tailored to your business.',
    Icon: Lightbulb,
  },
};

/**
 * EmptyState - Friendly empty states with call-to-action.
 *
 * Types:
 * - no-results: Search with no results
 * - no-data: Empty collection
 * - no-matches: No matching case studies
 * - get-started: Onboarding prompt
 *
 * @example
 * <EmptyState
 *   type="get-started"
 *   action={{ label: 'Start Discovery', onClick: startWizard }}
 * />
 */
export function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const content = emptyContent[type];
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;
  const IconComponent = content.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16',
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-elevated flex items-center justify-center mb-6"
      >
        {icon || <IconComponent className="w-8 h-8 text-gray-400 dark:text-gray-500" />}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
      >
        {displayTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-gray-600 dark:text-gray-400 max-w-sm mb-6"
      >
        {displayDescription}
      </motion.p>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <PremiumButton onClick={action.onClick}>{action.label}</PremiumButton>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * EmptyStateInline - Compact empty state for inline use.
 *
 * @example
 * <EmptyStateInline message="No case studies found" />
 */
export function EmptyStateInline({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-8 text-gray-500 dark:text-gray-400',
        className
      )}
    >
      <BookOpen className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
