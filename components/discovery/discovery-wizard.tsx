'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumButton } from '@/components/ui/premium';

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component: ReactNode;
}

interface DiscoveryWizardProps {
  steps: WizardStep[];
  onComplete: (data: Record<string, unknown>) => void;
  onStepChange?: (step: number, data: Record<string, unknown>) => void;
  formData: Record<string, unknown>;
  setFormData: (data: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

/**
 * DiscoveryWizard - Multi-step wizard with premium animations.
 *
 * Features:
 * - Smooth step transitions with AnimatePresence
 * - Animated progress bar
 * - Step indicators with completion states
 * - Mobile-friendly design
 *
 * @example
 * <DiscoveryWizard
 *   steps={wizardSteps}
 *   onComplete={handleSubmit}
 *   formData={formData}
 *   setFormData={setFormData}
 * />
 */
export function DiscoveryWizard({
  steps,
  onComplete,
  onStepChange,
  formData,
  setFormData,
  isSubmitting = false,
}: DiscoveryWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(formData);
    } else {
      setDirection(1);
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep, formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep, formData);
    }
  };

  const goToStep = (index: number) => {
    if (index < currentStep) {
      setDirection(-1);
      setCurrentStep(index);
      onStepChange?.(index, formData);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step Indicators */}
      <div className="mb-8">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-dark-elevated rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gray-900 dark:bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Step dots with labels */}
        <div className="flex justify-between">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <button
                key={s.id}
                onClick={() => goToStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'flex flex-col items-center gap-2 transition-all',
                  index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isComplete
                      ? 'rgb(17 24 39)'
                      : isActive
                        ? 'rgb(17 24 39)'
                        : 'rgb(229 231 235)',
                  }}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    isComplete || isActive ? 'text-white' : 'text-gray-500',
                    'dark:bg-dark-elevated'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Step Header */}
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
              >
                {step.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-gray-600 dark:text-gray-400"
              >
                {step.subtitle}
              </motion.p>
            </div>

            {/* Step Component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {step.component}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-8 border-t border-gray-200 dark:border-dark-border">
        <PremiumButton variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
          Back
        </PremiumButton>
        <PremiumButton onClick={handleNext} isLoading={isSubmitting}>
          {isLastStep ? 'See My Potentiality' : 'Continue'}
        </PremiumButton>
      </div>
    </div>
  );
}
