'use client';

import { useFormContext } from 'react-hook-form';
import {
  BUSINESS_STAGES,
  BUSINESS_STAGE_LABELS,
  TIMELINE_PREFERENCES,
  TIMELINE_LABELS,
  RISK_TOLERANCES,
  RISK_TOLERANCE_LABELS,
  type IntakeFormData,
} from '@/lib/validations/intake';

export function StrategicContextStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  return (
    <div className="space-y-6">
      {/* Current Stage */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          What stage is your business at? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {BUSINESS_STAGES.map((stage) => (
            <label
              key={stage}
              className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                watch('currentStage') === stage
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                {...register('currentStage')}
                value={stage}
                className="sr-only"
              />
              <span className="text-sm">{BUSINESS_STAGE_LABELS[stage]}</span>
            </label>
          ))}
        </div>
        {errors.currentStage && (
          <p className="text-sm text-red-500">{errors.currentStage.message}</p>
        )}
      </div>

      {/* Primary Goal */}
      <div className="space-y-2">
        <label htmlFor="primaryGoal" className="block text-sm font-medium">
          What is your primary strategic goal? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="primaryGoal"
          {...register('primaryGoal')}
          rows={3}
          placeholder="e.g., Expand into enterprise clients while maintaining profitability..."
          className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Be specific about what success looks like</span>
          <span>{watch('primaryGoal')?.length || 0}/500</span>
        </div>
        {errors.primaryGoal && (
          <p className="text-sm text-red-500">{errors.primaryGoal.message}</p>
        )}
      </div>

      {/* Biggest Challenge */}
      <div className="space-y-2">
        <label htmlFor="biggestChallenge" className="block text-sm font-medium">
          What is your biggest challenge right now? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="biggestChallenge"
          {...register('biggestChallenge')}
          rows={3}
          placeholder="e.g., Struggling to differentiate from competitors, sales cycle too long..."
          className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>What&apos;s blocking you from achieving your goal?</span>
          <span>{watch('biggestChallenge')?.length || 0}/500</span>
        </div>
        {errors.biggestChallenge && (
          <p className="text-sm text-red-500">{errors.biggestChallenge.message}</p>
        )}
      </div>

      {/* Timeline Preference */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          What&apos;s your preferred timeline? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIMELINE_PREFERENCES.map((timeline) => (
            <label
              key={timeline}
              className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                watch('timelinePreference') === timeline
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                {...register('timelinePreference')}
                value={timeline}
                className="sr-only"
              />
              <span className="text-2xl mb-1">
                {timeline === 'quick' ? '🚀' : timeline === 'moderate' ? '⚖️' : '🌱'}
              </span>
              <span className="text-sm font-medium capitalize">{timeline}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {timeline === 'quick'
                  ? '1-3 months'
                  : timeline === 'moderate'
                  ? '3-12 months'
                  : '12+ months'}
              </span>
            </label>
          ))}
        </div>
        {errors.timelinePreference && (
          <p className="text-sm text-red-500">{errors.timelinePreference.message}</p>
        )}
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          What&apos;s your risk tolerance? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RISK_TOLERANCES.map((risk) => (
            <label
              key={risk}
              className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                watch('riskTolerance') === risk
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                {...register('riskTolerance')}
                value={risk}
                className="sr-only"
              />
              <span className="text-2xl mb-1">
                {risk === 'conservative' ? '🛡️' : risk === 'moderate' ? '⚡' : '🎯'}
              </span>
              <span className="text-sm font-medium capitalize">{risk}</span>
              <span className="text-xs text-muted-foreground mt-1 px-2">
                {risk === 'conservative'
                  ? 'Proven strategies'
                  : risk === 'moderate'
                  ? 'Balanced approach'
                  : 'High reward'}
              </span>
            </label>
          ))}
        </div>
        {errors.riskTolerance && (
          <p className="text-sm text-red-500">{errors.riskTolerance.message}</p>
        )}
      </div>
    </div>
  );
}
