'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import {
  intakeFormSchema,
  intakeFormDefaults,
  validateStep,
  INTAKE_STEPS,
  type IntakeFormData,
} from '@/lib/validations/intake';
import { usePathMapAnalytics } from '@/hooks/usePathMapAnalytics';
import {
  BusinessProfileStep,
  StrategicContextStep,
  ConstraintsStep,
  ReviewStep,
} from './steps';

interface IntakeFormProps {
  onComplete?: (contextId: string) => void;
}

export function IntakeForm({ onComplete }: IntakeFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  const analytics = usePathMapAnalytics({ mode: 'self-serve' });

  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: intakeFormDefaults,
    mode: 'onBlur',
  });

  const { handleSubmit, trigger, getValues } = methods;

  // Track step completion
  const trackStepCompleted = useCallback(
    (step: number) => {
      const stepConfig = INTAKE_STEPS[step - 1];
      const timeSpentMs = Date.now() - stepStartTime;
      const values = getValues();
      const fieldsCompleted = stepConfig.fields.filter((field) => {
        const value = values[field as keyof IntakeFormData];
        return value !== undefined && value !== null && value !== '';
      });

      analytics.trackIntakeStepCompleted({
        step,
        stepName: stepConfig.name as 'business-profile' | 'strategic-context' | 'constraints' | 'review',
        fieldsCompleted,
        timeSpentMs,
      });

      setStepStartTime(Date.now());
    },
    [analytics, getValues, stepStartTime]
  );

  // Validate current step before proceeding
  const validateCurrentStep = async () => {
    const data = getValues();
    const result = validateStep(currentStep, data);

    if (!result.success) {
      // Trigger validation to show errors
      const stepConfig = INTAKE_STEPS[currentStep - 1];
      await trigger([...stepConfig.fields] as (keyof IntakeFormData)[]);
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    trackStepCompleted(currentStep);

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setStepStartTime(Date.now());
    }
  };

  const handleGoToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
      setStepStartTime(Date.now());
    }
  };

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/pathmap/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save your information');
      }

      const result = await response.json();

      // Track completion
      analytics.trackIntakeCompleted(result.contextId, Date.now() - stepStartTime);

      if (onComplete) {
        onComplete(result.contextId);
      } else {
        router.push(result.redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BusinessProfileStep />;
      case 2:
        return <StrategicContextStep />;
      case 3:
        return <ConstraintsStep />;
      case 4:
        return <ReviewStep onGoToStep={handleGoToStep} />;
      default:
        return null;
    }
  };

  const currentStepConfig = INTAKE_STEPS[currentStep - 1];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Stepper */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {INTAKE_STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => index + 1 < currentStep && handleGoToStep(index + 1)}
                  disabled={index + 1 > currentStep}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index + 1 < currentStep
                      ? 'bg-primary text-primary-foreground cursor-pointer'
                      : index + 1 === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </button>
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block ${
                    index + 1 === currentStep
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">{currentStepConfig.title}</h2>
          <p className="text-muted-foreground mt-1">{currentStepConfig.description}</p>
        </div>

        {/* Step Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Get Recommendations
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
