'use client';

import { useFormContext } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import {
  getFieldLabel,
  INTAKE_STEPS,
  type IntakeFormData,
} from '@/lib/validations/intake';

interface ReviewSectionProps {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, stepNumber, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {stepNumber}
          </span>
          <h3 className="font-medium">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-primary hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface ReviewRowProps {
  label: string;
  value: string | null | undefined;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">
        {value || <span className="text-muted-foreground italic">Not provided</span>}
      </span>
    </div>
  );
}

interface ReviewStepProps {
  onGoToStep: (step: number) => void;
}

export function ReviewStep({ onGoToStep }: ReviewStepProps) {
  const { watch } = useFormContext<IntakeFormData>();
  const formData = watch();

  return (
    <div className="space-y-6">
      {/* Confirmation Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        <div>
          <h3 className="font-medium text-green-800 dark:text-green-300">
            Almost there!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            Review your information below, then click Submit to get personalized path
            recommendations.
          </p>
        </div>
      </div>

      {/* Step 1: Business Profile */}
      <ReviewSection
        title={INTAKE_STEPS[0].title}
        stepNumber={1}
        onEdit={() => onGoToStep(1)}
      >
        <ReviewRow label="Industry" value={getFieldLabel('industry', formData.industry)} />
        {formData.industry === 'other' && formData.industryOther && (
          <ReviewRow label="Industry (Specified)" value={formData.industryOther} />
        )}
        <ReviewRow
          label="Company Size"
          value={getFieldLabel('companySize', formData.companySize)}
        />
        <ReviewRow
          label="Annual Revenue"
          value={getFieldLabel('annualRevenue', formData.annualRevenue)}
        />
        <ReviewRow
          label="Years in Business"
          value={getFieldLabel('yearsInBusiness', formData.yearsInBusiness)}
        />
      </ReviewSection>

      {/* Step 2: Strategic Context */}
      <ReviewSection
        title={INTAKE_STEPS[1].title}
        stepNumber={2}
        onEdit={() => onGoToStep(2)}
      >
        <ReviewRow
          label="Business Stage"
          value={getFieldLabel('currentStage', formData.currentStage)}
        />
        <ReviewRow
          label="Timeline Preference"
          value={getFieldLabel('timelinePreference', formData.timelinePreference)}
        />
        <ReviewRow
          label="Risk Tolerance"
          value={getFieldLabel('riskTolerance', formData.riskTolerance)}
        />
        <div className="py-2 border-b">
          <span className="text-muted-foreground block mb-1">Primary Goal</span>
          <p className="text-sm">{formData.primaryGoal || 'Not provided'}</p>
        </div>
        <div className="py-2">
          <span className="text-muted-foreground block mb-1">Biggest Challenge</span>
          <p className="text-sm">{formData.biggestChallenge || 'Not provided'}</p>
        </div>
      </ReviewSection>

      {/* Step 3: Constraints */}
      <ReviewSection
        title={INTAKE_STEPS[2].title}
        stepNumber={3}
        onEdit={() => onGoToStep(3)}
      >
        <ReviewRow
          label="Available Capital"
          value={getFieldLabel('availableCapital', formData.availableCapital)}
        />
        <ReviewRow
          label="Budget Flexibility"
          value={getFieldLabel('budgetFlexibility', formData.budgetFlexibility)}
        />
        {formData.additionalConstraints && (
          <div className="py-2">
            <span className="text-muted-foreground block mb-1">Additional Constraints</span>
            <p className="text-sm">{formData.additionalConstraints}</p>
          </div>
        )}
      </ReviewSection>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center">
        Your information is used solely to personalize your strategic recommendations.
        We never share your data with third parties.
      </p>
    </div>
  );
}
