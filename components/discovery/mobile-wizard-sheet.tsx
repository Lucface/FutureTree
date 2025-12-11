'use client';

import { ReactNode, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '@/components/ui/premium';

interface MobileWizardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

/**
 * MobileWizardSheet - Bottom sheet wizard for mobile devices.
 *
 * Features:
 * - Draggable bottom sheet
 * - Snap points (full, half, closed)
 * - Smooth spring animations
 * - Progress indicator
 * - Fixed bottom navigation
 *
 * @example
 * <MobileWizardSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Business Identity"
 *   currentStep={0}
 *   totalSteps={4}
 *   onNext={handleNext}
 *   onBack={handleBack}
 * >
 *   {stepContent}
 * </MobileWizardSheet>
 */
export function MobileWizardSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isLastStep = false,
  isSubmitting = false,
  nextLabel,
  backLabel,
}: MobileWizardSheetProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 200 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            ref={constraintsRef}
            initial={{ y: '100%' }}
            animate={{ y: '5%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 h-[95vh]',
              'bg-white dark:bg-dark-surface',
              'rounded-t-3xl shadow-2xl overflow-hidden',
              'flex flex-col'
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-border rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Progress */}
            <div className="px-6 pb-4">
              <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      backgroundColor:
                        i <= currentStep
                          ? 'rgb(17 24 39)'
                          : 'rgb(229 231 235)',
                    }}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      'dark:bg-dark-muted'
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% complete</span>
              </div>
            </div>

            {/* Header */}
            <div className="px-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto">{children}</div>

            {/* Fixed Bottom Navigation */}
            <div
              className={cn(
                'sticky bottom-0 inset-x-0 p-6',
                'bg-gradient-to-t from-white dark:from-dark-surface',
                'via-white/80 dark:via-dark-surface/80 to-transparent',
                'pt-12'
              )}
            >
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <PremiumButton
                    variant="secondary"
                    className="flex-1"
                    onClick={onBack}
                    disabled={isSubmitting}
                  >
                    {backLabel || 'Back'}
                  </PremiumButton>
                )}
                <PremiumButton
                  className="flex-1"
                  onClick={onNext}
                  isLoading={isSubmitting}
                >
                  {nextLabel || (isLastStep ? 'See Results' : 'Continue')}
                </PremiumButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
