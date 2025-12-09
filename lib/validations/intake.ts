import { z } from 'zod';

/**
 * PathMap Client Intake Form Validation Schemas
 *
 * Multi-step form for capturing client context to power path recommendations.
 * Aligned with clientContexts database table.
 */

// Industry options
export const INDUSTRIES = [
  'technology',
  'healthcare',
  'finance',
  'retail',
  'manufacturing',
  'professional-services',
  'real-estate',
  'education',
  'hospitality',
  'construction',
  'media-entertainment',
  'nonprofit',
  'other',
] as const;

export const INDUSTRY_LABELS: Record<(typeof INDUSTRIES)[number], string> = {
  technology: 'Technology / Software',
  healthcare: 'Healthcare / Medical',
  finance: 'Finance / Banking',
  retail: 'Retail / E-commerce',
  manufacturing: 'Manufacturing',
  'professional-services': 'Professional Services',
  'real-estate': 'Real Estate',
  education: 'Education',
  hospitality: 'Hospitality / Travel',
  construction: 'Construction',
  'media-entertainment': 'Media / Entertainment',
  nonprofit: 'Nonprofit',
  other: 'Other',
};

// Company size tiers
export const COMPANY_SIZES = ['solo', '2-10', '11-50', '51-200', '200+'] as const;

export const COMPANY_SIZE_LABELS: Record<(typeof COMPANY_SIZES)[number], string> = {
  solo: 'Solo (just me)',
  '2-10': 'Small team (2-10)',
  '11-50': 'Growing team (11-50)',
  '51-200': 'Medium (51-200)',
  '200+': 'Large (200+)',
};

// Business stage
export const BUSINESS_STAGES = ['startup', 'growth', 'scale', 'mature'] as const;

export const BUSINESS_STAGE_LABELS: Record<(typeof BUSINESS_STAGES)[number], string> = {
  startup: 'Startup (0-2 years, finding product-market fit)',
  growth: 'Growth (2-5 years, scaling revenue)',
  scale: 'Scale (5-10 years, expanding operations)',
  mature: 'Mature (10+ years, optimizing efficiency)',
};

// Timeline preference
export const TIMELINE_PREFERENCES = ['quick', 'moderate', 'patient'] as const;

export const TIMELINE_LABELS: Record<(typeof TIMELINE_PREFERENCES)[number], string> = {
  quick: 'Quick wins (1-3 months)',
  moderate: 'Balanced approach (3-12 months)',
  patient: 'Long-term transformation (12+ months)',
};

// Risk tolerance
export const RISK_TOLERANCES = ['conservative', 'moderate', 'aggressive'] as const;

export const RISK_TOLERANCE_LABELS: Record<(typeof RISK_TOLERANCES)[number], string> = {
  conservative: 'Conservative (proven strategies, lower risk)',
  moderate: 'Moderate (balanced risk/reward)',
  aggressive: 'Aggressive (willing to take calculated risks)',
};

// Budget flexibility
export const BUDGET_FLEXIBILITIES = ['fixed', 'flexible', 'unlimited'] as const;

export const BUDGET_FLEXIBILITY_LABELS: Record<(typeof BUDGET_FLEXIBILITIES)[number], string> = {
  fixed: 'Fixed budget (hard limit)',
  flexible: 'Flexible (can adjust if ROI is clear)',
  unlimited: 'Investment mindset (budget follows opportunity)',
};

// ============================================
// Step 1: Business Profile Schema
// ============================================
export const businessProfileSchema = z.object({
  industry: z.enum(INDUSTRIES, {
    required_error: 'Please select your industry',
  }),
  industryOther: z.string().max(100).optional(),
  companySize: z.enum(COMPANY_SIZES, {
    required_error: 'Please select your company size',
  }),
  annualRevenue: z
    .number()
    .min(0, 'Revenue cannot be negative')
    .max(1_000_000_000, 'Please enter a realistic revenue figure')
    .optional()
    .nullable(),
  yearsInBusiness: z
    .number()
    .int('Years must be a whole number')
    .min(0, 'Years cannot be negative')
    .max(200, 'Please enter a realistic number of years')
    .optional()
    .nullable(),
});

export type BusinessProfile = z.infer<typeof businessProfileSchema>;

// ============================================
// Step 2: Strategic Context Schema
// ============================================
export const strategicContextSchema = z.object({
  currentStage: z.enum(BUSINESS_STAGES, {
    required_error: 'Please select your current business stage',
  }),
  primaryGoal: z
    .string()
    .min(10, 'Please provide more detail about your goal (at least 10 characters)')
    .max(500, 'Please keep your goal description under 500 characters'),
  biggestChallenge: z
    .string()
    .min(10, 'Please provide more detail about your challenge (at least 10 characters)')
    .max(500, 'Please keep your challenge description under 500 characters'),
  timelinePreference: z.enum(TIMELINE_PREFERENCES, {
    required_error: 'Please select your timeline preference',
  }),
  riskTolerance: z.enum(RISK_TOLERANCES, {
    required_error: 'Please select your risk tolerance',
  }),
});

export type StrategicContext = z.infer<typeof strategicContextSchema>;

// ============================================
// Step 3: Constraints Schema
// ============================================
export const constraintsSchema = z.object({
  availableCapital: z
    .number()
    .min(0, 'Capital cannot be negative')
    .max(100_000_000, 'Please enter a realistic capital figure'),
  budgetFlexibility: z.enum(BUDGET_FLEXIBILITIES, {
    required_error: 'Please select your budget flexibility',
  }),
  additionalConstraints: z
    .string()
    .max(500, 'Please keep additional constraints under 500 characters')
    .optional()
    .nullable(),
});

export type Constraints = z.infer<typeof constraintsSchema>;

// ============================================
// Complete Intake Form Schema
// ============================================
export const intakeFormSchema = z.object({
  // Step 1
  ...businessProfileSchema.shape,
  // Step 2
  ...strategicContextSchema.shape,
  // Step 3
  ...constraintsSchema.shape,
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

// ============================================
// API Request/Response Types
// ============================================
export const createContextRequestSchema = intakeFormSchema;

export const createContextResponseSchema = z.object({
  contextId: z.string().uuid(),
  redirectUrl: z.string(),
  createdAt: z.string().datetime(),
});

export type CreateContextRequest = z.infer<typeof createContextRequestSchema>;
export type CreateContextResponse = z.infer<typeof createContextResponseSchema>;

// ============================================
// Form Step Metadata
// ============================================
export const INTAKE_STEPS = [
  {
    id: 1,
    name: 'business-profile',
    title: 'Business Profile',
    description: 'Tell us about your business',
    schema: businessProfileSchema,
    fields: ['industry', 'industryOther', 'companySize', 'annualRevenue', 'yearsInBusiness'],
  },
  {
    id: 2,
    name: 'strategic-context',
    title: 'Strategic Context',
    description: 'What are you trying to achieve?',
    schema: strategicContextSchema,
    fields: ['currentStage', 'primaryGoal', 'biggestChallenge', 'timelinePreference', 'riskTolerance'],
  },
  {
    id: 3,
    name: 'constraints',
    title: 'Constraints',
    description: 'What resources do you have available?',
    schema: constraintsSchema,
    fields: ['availableCapital', 'budgetFlexibility', 'additionalConstraints'],
  },
  {
    id: 4,
    name: 'review',
    title: 'Review',
    description: 'Confirm your information',
    schema: intakeFormSchema,
    fields: [],
  },
] as const;

export type IntakeStepName = (typeof INTAKE_STEPS)[number]['name'];

// ============================================
// Default Values for Form
// ============================================
export const intakeFormDefaults: Partial<IntakeFormData> = {
  industry: undefined,
  companySize: undefined,
  annualRevenue: null,
  yearsInBusiness: null,
  currentStage: undefined,
  primaryGoal: '',
  biggestChallenge: '',
  timelinePreference: 'moderate',
  riskTolerance: 'moderate',
  availableCapital: 0,
  budgetFlexibility: 'flexible',
  additionalConstraints: null,
};

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate a specific step of the intake form
 */
export function validateStep(step: number, data: Partial<IntakeFormData>) {
  const stepConfig = INTAKE_STEPS.find((s) => s.id === step);
  if (!stepConfig) {
    throw new Error(`Invalid step: ${step}`);
  }

  // For review step, validate entire form
  if (step === 4) {
    return intakeFormSchema.safeParse(data);
  }

  return stepConfig.schema.safeParse(data);
}

/**
 * Get human-readable label for a field value
 */
export function getFieldLabel(
  field: keyof IntakeFormData,
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return 'Not specified';

  switch (field) {
    case 'industry':
      return INDUSTRY_LABELS[value as (typeof INDUSTRIES)[number]] || String(value);
    case 'companySize':
      return COMPANY_SIZE_LABELS[value as (typeof COMPANY_SIZES)[number]] || String(value);
    case 'currentStage':
      return BUSINESS_STAGE_LABELS[value as (typeof BUSINESS_STAGES)[number]] || String(value);
    case 'timelinePreference':
      return TIMELINE_LABELS[value as (typeof TIMELINE_PREFERENCES)[number]] || String(value);
    case 'riskTolerance':
      return RISK_TOLERANCE_LABELS[value as (typeof RISK_TOLERANCES)[number]] || String(value);
    case 'budgetFlexibility':
      return BUDGET_FLEXIBILITY_LABELS[value as (typeof BUDGET_FLEXIBILITIES)[number]] || String(value);
    case 'annualRevenue':
    case 'availableCapital':
      return typeof value === 'number' ? `$${value.toLocaleString()}` : String(value);
    case 'yearsInBusiness':
      return typeof value === 'number' ? `${value} years` : String(value);
    default:
      return String(value);
  }
}
