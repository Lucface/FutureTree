'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

/**
 * WizardLayout - Multi-step form wizard with progress tracking
 *
 * Handles step navigation, progress display, and animated transitions
 * between steps. Perfect for discovery wizard and intake forms.
 *
 * @example
 * ```tsx
 * <WizardLayout
 *   steps={['Industry', 'Company Size', 'Revenue', 'Goals', 'Challenges']}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 *   onComplete={handleSubmit}
 * >
 *   {currentStep === 0 && <IndustryStep />}
 *   {currentStep === 1 && <CompanySizeStep />}
 *   ...
 * </WizardLayout>
 * ```
 */

const wizardVariants = cva('flex flex-col', {
  variants: {
    size: {
      default: 'max-w-2xl mx-auto',
      wide: 'max-w-4xl mx-auto',
      full: 'w-full',
    },
    padding: {
      default: 'px-4 py-8 sm:px-6 lg:px-8',
      compact: 'px-4 py-4',
      none: '',
    },
  },
  defaultVariants: {
    size: 'default',
    padding: 'default',
  },
});

interface WizardStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface WizardLayoutProps extends VariantProps<typeof wizardVariants> {
  /** Step definitions */
  steps: WizardStep[] | string[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback when step changes */
  onStepChange: (step: number) => void;
  /** Callback when wizard is completed */
  onComplete?: () => void;
  /** Callback when wizard is cancelled */
  onCancel?: () => void;
  /** Step content */
  children: React.ReactNode;
  /** Title shown above progress */
  title?: string;
  /** Whether current step is valid (enables next) */
  isStepValid?: boolean;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Custom labels */
  labels?: {
    back?: string;
    next?: string;
    complete?: string;
    skip?: string;
  };
  /** Show step count (e.g., "Step 2 of 5") */
  showStepCount?: boolean;
  /** Show step labels in progress bar */
  showStepLabels?: boolean;
  /** Allow clicking on progress to navigate */
  clickableProgress?: boolean;
  /** Animation direction based on navigation */
  animationDirection?: 'forward' | 'backward';
  /** Header content (logo, etc.) */
  header?: React.ReactNode;
  /** Footer content (below navigation) */
  footer?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function WizardLayout({
  steps: rawSteps,
  currentStep,
  onStepChange,
  onComplete,
  onCancel,
  children,
  title,
  isStepValid = true,
  isSubmitting = false,
  labels = {},
  showStepCount = true,
  showStepLabels = false,
  clickableProgress = false,
  animationDirection,
  header,
  footer,
  size,
  padding,
  className,
}: WizardLayoutProps) {
  // Normalize steps to WizardStep format
  const steps: WizardStep[] = rawSteps.map((step, i) =>
    typeof step === 'string' ? { id: String(i), label: step } : step
  );

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];

  // Track direction for animations
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');
  const prevStepRef = React.useRef(currentStep);

  React.useEffect(() => {
    if (animationDirection) {
      setDirection(animationDirection);
    } else {
      setDirection(currentStep > prevStepRef.current ? 'forward' : 'backward');
    }
    prevStepRef.current = currentStep;
  }, [currentStep, animationDirection]);

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (currentStepData?.optional && !isLastStep) {
      onStepChange(currentStep + 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (clickableProgress && index <= currentStep) {
      onStepChange(index);
    }
  };

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header */}
      <header className="flex-none border-b border-border bg-background/80 backdrop-blur-sm">
        <div className={cn(wizardVariants({ size, padding: 'compact' }), 'flex items-center justify-between py-4')}>
          {header || <div className="w-10" />}

          {showStepCount && (
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          )}

          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex-none border-b border-border bg-background">
        <div className={cn(wizardVariants({ size, padding: 'none' }), 'py-4 px-4 sm:px-6 lg:px-8')}>
          {title && (
            <h1 className="text-lg font-semibold text-foreground mb-4">{title}</h1>
          )}

          {/* Step Labels */}
          {showStepLabels && (
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!clickableProgress || index > currentStep}
                  className={cn(
                    'text-xs font-medium transition-colors',
                    index === currentStep
                      ? 'text-primary'
                      : index < currentStep
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/50',
                    clickableProgress && index <= currentStep && 'cursor-pointer'
                  )}
                >
                  {step.label}
                </button>
              ))}
            </div>
          )}

          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className={cn(wizardVariants({ size, padding }))}>
          {/* Step Title */}
          <BlurFade key={`title-${currentStep}`} delay={0}>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                {currentStepData?.label}
              </h2>
              {currentStepData?.description && (
                <p className="mt-2 text-muted-foreground">
                  {currentStepData.description}
                </p>
              )}
            </div>
          </BlurFade>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="flex-none border-t border-border bg-background/80 backdrop-blur-sm">
        <div className={cn(wizardVariants({ size, padding: 'compact' }), 'py-4 flex items-center justify-between')}>
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isFirstStep || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {labels.back || 'Back'}
          </Button>

          <div className="flex items-center gap-3">
            {currentStepData?.optional && !isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                {labels.skip || 'Skip'}
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!isStepValid || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isLastStep ? (
                labels.complete || 'Complete'
              ) : (
                <>
                  {labels.next || 'Continue'}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Additional Footer Content */}
        {footer && (
          <div className={cn(wizardVariants({ size, padding: 'compact' }), 'pb-4')}>
            {footer}
          </div>
        )}
      </footer>
    </div>
  );
}

/**
 * WizardStep - Individual step container with validation
 */
interface WizardStepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function WizardStepContent({ children, className }: WizardStepContentProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

/**
 * WizardLayoutSkeleton - Loading state for wizard
 */
export function WizardLayoutSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header skeleton */}
      <div className="flex-none border-b border-border py-4 px-6 flex justify-between">
        <div className="h-8 w-20 rounded bg-muted animate-pulse" />
        <div className="h-5 w-24 rounded bg-muted animate-pulse" />
        <div className="h-8 w-8 rounded bg-muted animate-pulse" />
      </div>

      {/* Progress skeleton */}
      <div className="flex-none border-b border-border py-4 px-6">
        <div className="h-1 w-full rounded bg-muted animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="h-8 w-64 mx-auto rounded bg-muted animate-pulse" />
          <div className="h-5 w-48 mx-auto mt-2 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-14 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-14 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-14 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex-none border-t border-border py-4 px-6 flex justify-between max-w-2xl mx-auto w-full">
        <div className="h-10 w-24 rounded bg-muted animate-pulse" />
        <div className="h-10 w-32 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export type { WizardLayoutProps, WizardStep, WizardStepContentProps };
