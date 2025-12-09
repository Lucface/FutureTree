'use client';

import { useFormContext } from 'react-hook-form';
import {
  INDUSTRIES,
  INDUSTRY_LABELS,
  COMPANY_SIZES,
  COMPANY_SIZE_LABELS,
  type IntakeFormData,
} from '@/lib/validations/intake';

export function BusinessProfileStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  const selectedIndustry = watch('industry');

  return (
    <div className="space-y-6">
      {/* Industry */}
      <div className="space-y-2">
        <label htmlFor="industry" className="block text-sm font-medium">
          What industry are you in? <span className="text-red-500">*</span>
        </label>
        <select
          id="industry"
          {...register('industry')}
          className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select your industry...</option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {INDUSTRY_LABELS[industry]}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="text-sm text-red-500">{errors.industry.message}</p>
        )}
      </div>

      {/* Industry Other (conditional) */}
      {selectedIndustry === 'other' && (
        <div className="space-y-2">
          <label htmlFor="industryOther" className="block text-sm font-medium">
            Please specify your industry
          </label>
          <input
            id="industryOther"
            type="text"
            {...register('industryOther')}
            placeholder="e.g., Agricultural Technology"
            className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.industryOther && (
            <p className="text-sm text-red-500">{errors.industryOther.message}</p>
          )}
        </div>
      )}

      {/* Company Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          How many people work at your company? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPANY_SIZES.map((size) => (
            <label
              key={size}
              className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                watch('companySize') === size
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                {...register('companySize')}
                value={size}
                className="sr-only"
              />
              <span className="text-sm">{COMPANY_SIZE_LABELS[size]}</span>
            </label>
          ))}
        </div>
        {errors.companySize && (
          <p className="text-sm text-red-500">{errors.companySize.message}</p>
        )}
      </div>

      {/* Annual Revenue (optional) */}
      <div className="space-y-2">
        <label htmlFor="annualRevenue" className="block text-sm font-medium">
          Annual Revenue <span className="text-muted-foreground">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <input
            id="annualRevenue"
            type="number"
            {...register('annualRevenue', { valueAsNumber: true })}
            placeholder="0"
            min="0"
            className="w-full pl-7 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This helps us recommend paths appropriate for your scale.
        </p>
        {errors.annualRevenue && (
          <p className="text-sm text-red-500">{errors.annualRevenue.message}</p>
        )}
      </div>

      {/* Years in Business (optional) */}
      <div className="space-y-2">
        <label htmlFor="yearsInBusiness" className="block text-sm font-medium">
          Years in Business <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="yearsInBusiness"
          type="number"
          {...register('yearsInBusiness', { valueAsNumber: true })}
          placeholder="0"
          min="0"
          max="200"
          className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {errors.yearsInBusiness && (
          <p className="text-sm text-red-500">{errors.yearsInBusiness.message}</p>
        )}
      </div>
    </div>
  );
}
