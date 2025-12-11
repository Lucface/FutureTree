'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '@/components/ui/premium';

interface SuccessStateProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showShare?: boolean;
  showDownload?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

/**
 * SuccessState - Celebratory success state.
 *
 * Use for:
 * - Wizard completion
 * - Form submission success
 * - Action completion
 *
 * @example
 * <SuccessState
 *   title="Your profile is ready!"
 *   description="We found 15 companies similar to yours."
 *   primaryAction={{ label: 'View Results', onClick: viewResults }}
 * />
 */
export function SuccessState({
  title,
  description,
  primaryAction,
  secondaryAction,
  showShare,
  showDownload,
  onShare,
  onDownload,
  className,
}: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        className
      )}
    >
      {/* Success Icon with Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="relative mb-8"
      >
        {/* Ripple effect */}
        <motion.div
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20"
        />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {title}
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-400 max-w-md mb-8"
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3 justify-center mb-6"
      >
        {primaryAction && (
          <PremiumButton onClick={primaryAction.onClick} className="gap-2">
            {primaryAction.label}
            <ArrowRight className="w-4 h-4" />
          </PremiumButton>
        )}
        {secondaryAction && (
          <PremiumButton variant="secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </PremiumButton>
        )}
      </motion.div>

      {/* Share/Download */}
      {(showShare || showDownload) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          {showShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
          {showDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
