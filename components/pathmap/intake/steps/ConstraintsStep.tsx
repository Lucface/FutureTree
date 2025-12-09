'use client';

import { useFormContext } from 'react-hook-form';
import {
  BUDGET_FLEXIBILITIES,
  BUDGET_FLEXIBILITY_LABELS,
  type IntakeFormData,
} from '@/lib/validations/intake';

export function ConstraintsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  const capitalValue = watch('availableCapital') || 0;

  // Format capital for display
  const formatCapital = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Available Capital */}
      <div className="space-y-2">
        <label htmlFor="availableCapital" className="block text-sm font-medium">
          Available Capital for Strategic Investment <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          How much can you invest in implementing your chosen strategic path?
        </p>

        {/* Capital slider with presets */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[5000, 25000, 100000, 500000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setValue('availableCapital', amount, { shouldValidate: true });
                }}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  capitalValue === amount
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                {formatCapital(amount)}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              id="availableCapital"
              type="number"
              {...register('availableCapital', { valueAsNumber: true })}
              placeholder="Enter amount"
              min="0"
              className="w-full pl-7 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {capitalValue > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">{formatCapital(capitalValue)}</span>
                <span className="text-muted-foreground"> available for investment</span>
              </p>
            </div>
          )}
        </div>
        {errors.availableCapital && (
          <p className="text-sm text-red-500">{errors.availableCapital.message}</p>
        )}
      </div>

      {/* Budget Flexibility */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Budget Flexibility <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {BUDGET_FLEXIBILITIES.map((flexibility) => (
            <label
              key={flexibility}
              className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                watch('budgetFlexibility') === flexibility
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                {...register('budgetFlexibility')}
                value={flexibility}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {flexibility === 'fixed'
                    ? '🔒'
                    : flexibility === 'flexible'
                    ? '🔄'
                    : '🚀'}
                </span>
                <div>
                  <span className="text-sm font-medium capitalize">{flexibility}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {BUDGET_FLEXIBILITY_LABELS[flexibility]}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.budgetFlexibility && (
          <p className="text-sm text-red-500">{errors.budgetFlexibility.message}</p>
        )}
      </div>

      {/* Additional Constraints */}
      <div className="space-y-2">
        <label htmlFor="additionalConstraints" className="block text-sm font-medium">
          Additional Constraints <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="additionalConstraints"
          {...register('additionalConstraints')}
          rows={3}
          placeholder="e.g., Limited team bandwidth, regulatory requirements, existing tech stack constraints..."
          className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Any other factors that might limit which paths are feasible for you?
        </p>
        {errors.additionalConstraints && (
          <p className="text-sm text-red-500">{errors.additionalConstraints.message}</p>
        )}
      </div>
    </div>
  );
}
