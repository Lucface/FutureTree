'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { SURVEY_TYPES, type SurveyType } from '@/lib/pathmap/survey-types';

interface OutcomeSurveyModalProps {
  open: boolean;
  onClose: () => void;
  surveyId: string;
  surveyType: SurveyType;
  pathName: string;
  onSubmit?: () => void;
  onSkip?: () => void;
}

type SurveyResponses = {
  hasStarted?: boolean;
  progressPercent?: number;
  actualSpend?: number;
  outcome?: 'success' | 'partial' | 'failure' | 'pivoted' | 'abandoned';
  lessons?: string;
  wouldRecommend?: number;
  additionalNotes?: string;
};

/**
 * Outcome Survey Modal
 *
 * Modal for completing outcome surveys (30-day, 60-day, 90-day)
 */
export function OutcomeSurveyModal({
  open,
  onClose,
  surveyId,
  surveyType,
  pathName,
  onSubmit,
  onSkip,
}: OutcomeSurveyModalProps) {
  const [responses, setResponses] = useState<SurveyResponses>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const config = SURVEY_TYPES[surveyType];

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/pathmap/surveys/${surveyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit survey');
      }

      setSuccess(true);
      onSubmit?.();
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, [surveyId, responses, onSubmit, onClose]);

  const handleSkip = useCallback(async () => {
    setIsSkipping(true);
    setError(null);

    try {
      const res = await fetch(`/api/pathmap/surveys/${surveyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to skip survey');
      }

      onSkip?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSkipping(false);
    }
  }, [surveyId, onSkip, onClose]);

  const updateResponse = <K extends keyof SurveyResponses>(
    key: K,
    value: SurveyResponses[K]
  ) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  // Render form field based on question type
  const renderQuestion = (question: (typeof config.questions)[number]) => {
    switch (question.type) {
      case 'boolean':
        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                updateResponse(question.id as keyof SurveyResponses, true)
              }
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 transition-colors
                ${
                  responses[question.id as keyof SurveyResponses] === true
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-border hover:border-primary/50'
                }
              `}
            >
              <CheckCircle2
                className={`h-5 w-5 mx-auto mb-1 ${responses[question.id as keyof SurveyResponses] === true ? 'text-green-500' : 'text-muted-foreground'}`}
              />
              <span className="text-sm">Yes</span>
            </button>
            <button
              type="button"
              onClick={() =>
                updateResponse(question.id as keyof SurveyResponses, false)
              }
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 transition-colors
                ${
                  responses[question.id as keyof SurveyResponses] === false
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-border hover:border-primary/50'
                }
              `}
            >
              <AlertCircle
                className={`h-5 w-5 mx-auto mb-1 ${responses[question.id as keyof SurveyResponses] === false ? 'text-red-500' : 'text-muted-foreground'}`}
              />
              <span className="text-sm">No</span>
            </button>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={question.min || 0}
              max={question.max || 100}
              value={
                (responses[question.id as keyof SurveyResponses] as number) || 0
              }
              onChange={(e) =>
                updateResponse(
                  question.id as keyof SurveyResponses,
                  parseInt(e.target.value)
                )
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.min || 0}%</span>
              <span className="font-medium text-foreground">
                {responses[question.id as keyof SurveyResponses] || 0}%
              </span>
              <span>{question.max || 100}%</span>
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="number"
              min={0}
              step={100}
              placeholder="Enter amount"
              value={
                (responses[question.id as keyof SurveyResponses] as number) ||
                ''
              }
              onChange={(e) =>
                updateResponse(
                  question.id as keyof SurveyResponses,
                  parseFloat(e.target.value) || undefined
                )
              }
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            {'options' in question &&
              question.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updateResponse(
                      question.id as keyof SurveyResponses,
                      option.value as SurveyResponses[keyof SurveyResponses]
                    )
                  }
                  className={`
                  w-full text-left py-3 px-4 rounded-lg border-2 transition-colors
                  ${
                    responses[question.id as keyof SurveyResponses] ===
                    option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }
                `}
                >
                  {option.label}
                </button>
              ))}
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-2">
            <div className="flex gap-1 justify-center">
              {Array.from(
                { length: (question.max || 10) - (question.min || 1) + 1 },
                (_, i) => i + (question.min || 1)
              ).map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    updateResponse(question.id as keyof SurveyResponses, rating)
                  }
                  className={`
                    w-10 h-10 rounded-lg transition-colors
                    ${
                      responses[question.id as keyof SurveyResponses] === rating
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-2">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
          </div>
        );

      case 'text':
      case 'textarea':
        const Component = question.type === 'textarea' ? 'textarea' : 'input';
        return (
          <Component
            placeholder={question.label}
            value={
              (responses[question.id as keyof SurveyResponses] as string) || ''
            }
            onChange={(e) =>
              updateResponse(
                question.id as keyof SurveyResponses,
                e.target.value
              )
            }
            className={`w-full px-4 py-2 border rounded-lg bg-background ${question.type === 'textarea' ? 'min-h-[100px] resize-y' : ''}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">{config.label}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Success State */}
              {success ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
                  <p className="text-muted-foreground">
                    Your feedback helps improve path recommendations for
                    everyone.
                  </p>
                </div>
              ) : (
                <>
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Path Name */}
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">
                        Regarding your path:
                      </span>
                      <h3 className="text-lg font-medium">{pathName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    {/* Questions */}
                    {config.questions.map((question, idx) => (
                      <div key={question.id} className="space-y-2">
                        <label className="block text-sm font-medium">
                          {idx + 1}. {question.label}
                        </label>
                        {renderQuestion(question)}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                    <button
                      onClick={handleSkip}
                      disabled={isSkipping || isSubmitting}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip Survey
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSkipping}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: 'linear',
                            }}
                            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default OutcomeSurveyModal;
