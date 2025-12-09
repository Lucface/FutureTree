'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  usePathMapModeStore,
  ONBOARDING_STEPS,
} from '@/lib/stores/pathmap-mode';

interface OnboardingTooltipsProps {
  className?: string;
}

/**
 * Onboarding Tooltips Component
 *
 * Shows step-by-step tooltips for first-time users in self-serve mode
 */
export function OnboardingTooltips({ className }: OnboardingTooltipsProps) {
  const {
    mode,
    hasCompletedOnboarding,
    currentOnboardingStep,
    completeOnboarding,
    nextOnboardingStep,
    prevOnboardingStep,
  } = usePathMapModeStore();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Only show in self-serve mode for users who haven't completed onboarding
  const shouldShow = mode === 'self-serve' && !hasCompletedOnboarding;

  const currentStep = ONBOARDING_STEPS[currentOnboardingStep];
  const isFirstStep = currentOnboardingStep === 0;
  const isLastStep = currentOnboardingStep === ONBOARDING_STEPS.length - 1;

  // Find and track the target element
  useEffect(() => {
    if (!shouldShow || !currentStep) return;

    const updateTargetRect = () => {
      const target = document.querySelector(currentStep.targetSelector);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [shouldShow, currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!shouldShow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        completeOnboarding();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          completeOnboarding();
        } else {
          nextOnboardingStep();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isFirstStep) {
          prevOnboardingStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shouldShow,
    isFirstStep,
    isLastStep,
    completeOnboarding,
    nextOnboardingStep,
    prevOnboardingStep,
  ]);

  // Calculate tooltip position
  const getTooltipPosition = useCallback(() => {
    if (!targetRect || !currentStep) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    let top: number;
    let left: number;

    switch (currentStep.position) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    }

    // Keep tooltip within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    return { top: `${top}px`, left: `${left}px` };
  }, [targetRect, currentStep]);

  if (!shouldShow || !currentStep) {
    return null;
  }

  const position = getTooltipPosition();

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 pointer-events-none ${className || ''}`}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={completeOnboarding}
        />

        {/* Spotlight on target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bg-transparent ring-4 ring-primary/50 rounded-lg pointer-events-none"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-background border rounded-xl shadow-lg p-5 pointer-events-auto"
          style={{
            ...position,
            width: 320,
          }}
        >
          {/* Close button */}
          <button
            onClick={completeOnboarding}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Content */}
          <h3 className="text-lg font-semibold pr-6">{currentStep.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentStep.description}
          </p>

          {/* Progress and Navigation */}
          <div className="mt-4 flex items-center justify-between">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              {ONBOARDING_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    idx === currentOnboardingStep
                      ? 'bg-primary'
                      : idx < currentOnboardingStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevOnboardingStep}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <button
                onClick={isLastStep ? completeOnboarding : nextOnboardingStep}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isLastStep ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Skip link */}
          <button
            onClick={completeOnboarding}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default OnboardingTooltips;
