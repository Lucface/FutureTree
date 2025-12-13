/**
 * Survey Types with their scheduling delays
 *
 * Shared between client and server code.
 * Keep this file free of database imports to allow client-side usage.
 */
export const SURVEY_TYPES = {
  '30day': {
    label: '30-Day Check-in',
    delayDays: 30,
    description: 'Have you started implementing your chosen path?',
    questions: [
      { id: 'hasStarted', type: 'boolean', label: 'Have you started?' },
      {
        id: 'progressPercent',
        type: 'number',
        label: 'Estimated progress (%)',
        min: 0,
        max: 100,
      },
      { id: 'additionalNotes', type: 'text', label: 'Any notes?' },
    ],
  },
  '60day': {
    label: '60-Day Progress',
    delayDays: 60,
    description: 'How far along are you in your strategic path?',
    questions: [
      {
        id: 'progressPercent',
        type: 'number',
        label: 'Progress (%)',
        min: 0,
        max: 100,
      },
      {
        id: 'actualSpend',
        type: 'currency',
        label: 'Actual spend so far',
      },
      { id: 'additionalNotes', type: 'text', label: 'Challenges faced?' },
    ],
  },
  '90day': {
    label: '90-Day Outcome',
    delayDays: 90,
    description: 'What was the outcome of your strategic path?',
    questions: [
      {
        id: 'outcome',
        type: 'select',
        label: 'Outcome',
        options: [
          { value: 'success', label: 'Success - achieved goals' },
          { value: 'partial', label: 'Partial - some goals met' },
          { value: 'failure', label: 'Did not achieve goals' },
          { value: 'pivoted', label: 'Pivoted to different approach' },
          { value: 'abandoned', label: 'Abandoned the path' },
        ],
      },
      {
        id: 'actualSpend',
        type: 'currency',
        label: 'Total spend',
      },
      { id: 'lessons', type: 'textarea', label: 'Key lessons learned?' },
      {
        id: 'wouldRecommend',
        type: 'rating',
        label: 'Would you recommend this path to others?',
        min: 1,
        max: 10,
      },
    ],
  },
} as const;

export type SurveyType = keyof typeof SURVEY_TYPES;
