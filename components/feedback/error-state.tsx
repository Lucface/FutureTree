'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '@/components/ui/premium';

type ErrorType = 'generic' | 'not-found' | 'network' | 'auth' | 'validation';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  className?: string;
}

const errorContent: Record<ErrorType, { title: string; description: string }> = {
  generic: {
    title: 'Something went wrong',
    description: 'We encountered an unexpected error. Please try again or contact support if the problem persists.',
  },
  'not-found': {
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved.",
  },
  network: {
    title: 'Connection lost',
    description: "We couldn't connect to the server. Please check your internet connection and try again.",
  },
  auth: {
    title: 'Access denied',
    description: "You don't have permission to view this page. Please sign in with the correct account.",
  },
  validation: {
    title: 'Invalid data',
    description: 'Some of the information provided is invalid. Please review and try again.',
  },
};

/**
 * ErrorState - Beautiful error messages with actions.
 *
 * Supports multiple error types with appropriate messaging:
 * - generic: General errors
 * - not-found: 404 pages
 * - network: Connection issues
 * - auth: Permission denied
 * - validation: Form/data errors
 *
 * @example
 * <ErrorState
 *   type="network"
 *   onRetry={() => refetch()}
 *   onBack={() => router.back()}
 * />
 */
export function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
  onBack,
  onHome,
  className,
}: ErrorStateProps) {
  const content = errorContent[type];
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-6',
          type === 'auth' && 'bg-amber-100 dark:bg-amber-900/30',
          type === 'not-found' && 'bg-gray-100 dark:bg-dark-elevated',
          type === 'network' && 'bg-blue-100 dark:bg-blue-900/30',
          type === 'validation' && 'bg-red-100 dark:bg-red-900/30',
          type === 'generic' && 'bg-red-100 dark:bg-red-900/30'
        )}
      >
        <AlertCircle
          className={cn(
            'w-10 h-10',
            type === 'auth' && 'text-amber-600 dark:text-amber-400',
            type === 'not-found' && 'text-gray-600 dark:text-gray-400',
            type === 'network' && 'text-blue-600 dark:text-blue-400',
            type === 'validation' && 'text-red-600 dark:text-red-400',
            type === 'generic' && 'text-red-600 dark:text-red-400'
          )}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {displayTitle}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-gray-600 dark:text-gray-400 max-w-md mb-8"
      >
        {displayDescription}
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        {onRetry && (
          <PremiumButton onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </PremiumButton>
        )}
        {onBack && (
          <PremiumButton variant="secondary" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </PremiumButton>
        )}
        {onHome && (
          <PremiumButton variant="ghost" onClick={onHome} className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </PremiumButton>
        )}
      </motion.div>
    </motion.div>
  );
}
