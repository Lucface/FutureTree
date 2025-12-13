'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ChevronRight, Clock } from 'lucide-react';
import { SURVEY_TYPES, type SurveyType } from '@/lib/pathmap/survey-types';
import { OutcomeSurveyModal } from './OutcomeSurveyModal';

interface PendingSurvey {
  id: string;
  surveyType: SurveyType;
  scheduledFor: Date;
  explorationId: string;
  pathId: string;
  pathName: string;
}

interface SurveyPromptBannerProps {
  sessionId: string;
  className?: string;
}

/**
 * Survey Prompt Banner
 *
 * Displays a banner when users have pending outcome surveys
 * Shows at top of PathMap pages
 */
export function SurveyPromptBanner({
  sessionId,
  className,
}: SurveyPromptBannerProps) {
  const [pendingSurveys, setPendingSurveys] = useState<PendingSurvey[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<PendingSurvey | null>(null);

  // Fetch pending surveys
  useEffect(() => {
    async function fetchSurveys() {
      try {
        const res = await fetch(
          `/api/pathmap/surveys/schedule?sessionId=${sessionId}`
        );
        if (!res.ok) return;

        const data = await res.json();
        setPendingSurveys(
          data.surveys.map((s: PendingSurvey) => ({
            ...s,
            scheduledFor: new Date(s.scheduledFor),
          }))
        );
      } catch (err) {
        console.error('Error fetching surveys:', err);
      }
    }

    fetchSurveys();
  }, [sessionId]);

  const handleSurveyComplete = useCallback(() => {
    // Remove completed survey from list
    setPendingSurveys((prev) =>
      prev.filter((s) => s.id !== activeSurvey?.id)
    );
    setActiveSurvey(null);
  }, [activeSurvey]);

  const handleSurveySkip = useCallback(() => {
    // Remove skipped survey from list
    setPendingSurveys((prev) =>
      prev.filter((s) => s.id !== activeSurvey?.id)
    );
    setActiveSurvey(null);
  }, [activeSurvey]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  // Don't show if dismissed or no pending surveys
  if (dismissed || pendingSurveys.length === 0) {
    return null;
  }

  const firstSurvey = pendingSurveys[0];
  const config = SURVEY_TYPES[firstSurvey.surveyType];

  // Calculate how overdue the survey is
  const now = new Date();
  const daysOverdue = Math.floor(
    (now.getTime() - firstSurvey.scheduledFor.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            relative bg-gradient-to-r from-primary/10 to-primary/5
            border border-primary/20 rounded-lg p-4
            ${className || ''}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">
                {config.label} Survey Ready
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Help us improve path recommendations by sharing your progress
                on <span className="font-medium">{firstSurvey.pathName}</span>
              </p>

              {/* Time indicator */}
              {daysOverdue > 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysOverdue === 1
                    ? 'Due yesterday'
                    : `${daysOverdue} days overdue`}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setActiveSurvey(firstSurvey)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Take Survey
                  <ChevronRight className="h-4 w-4" />
                </button>

                {pendingSurveys.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{pendingSurveys.length - 1} more pending
                  </span>
                )}
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors"
              title="Dismiss for now"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Survey Modal */}
      {activeSurvey && (
        <OutcomeSurveyModal
          open={!!activeSurvey}
          onClose={() => setActiveSurvey(null)}
          surveyId={activeSurvey.id}
          surveyType={activeSurvey.surveyType}
          pathName={activeSurvey.pathName}
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
        />
      )}
    </>
  );
}

/**
 * Compact Survey Prompt
 *
 * Smaller version for sidebar or secondary areas
 */
export function CompactSurveyPrompt({
  sessionId,
  className,
}: SurveyPromptBannerProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(
          `/api/pathmap/surveys/schedule?sessionId=${sessionId}`
        );
        if (!res.ok) return;

        const data = await res.json();
        setCount(data.surveys.length);
      } catch (err) {
        console.error('Error fetching surveys:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [sessionId]);

  if (loading || count === 0) {
    return null;
  }

  return (
    <div
      className={`
      flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-sm
      ${className || ''}
    `}
    >
      <div className="relative">
        <Bell className="h-4 w-4 text-primary" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
          {count}
        </span>
      </div>
      <span className="text-muted-foreground">
        {count} survey{count !== 1 ? 's' : ''} pending
      </span>
    </div>
  );
}

export default SurveyPromptBanner;
