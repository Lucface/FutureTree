/**
 * FutureTree Pattern Components
 *
 * Higher-level layout patterns that compose primitives and core components
 * into reusable page structures. These patterns define the visual rhythm
 * and interaction patterns across the application.
 *
 * @example
 * ```tsx
 * import {
 *   StaggeredReveal,
 *   HeroSection,
 *   SplitView,
 *   ResultsLayout,
 *   WizardLayout,
 * } from '@/components/patterns';
 *
 * // Hero section with metrics
 * <HeroSection
 *   headline="Strategic Intelligence"
 *   metrics={[{ value: 700, suffix: '+', label: 'Case Studies' }]}
 *   primaryCta={{ label: 'Get Started', href: '/discover' }}
 * />
 *
 * // Path explorer with evidence panel
 * <SplitView
 *   main={<DecisionTree />}
 *   panel={<EvidencePanel />}
 * />
 *
 * // Discovery wizard
 * <WizardLayout
 *   steps={['Industry', 'Size', 'Goals']}
 *   currentStep={step}
 *   onStepChange={setStep}
 * >
 *   {renderStep()}
 * </WizardLayout>
 * ```
 */

// Staggered Reveal Patterns
export {
  StaggeredReveal,
  StaggeredGrid,
  StaggeredList,
  type StaggeredRevealProps,
  type StaggeredGridProps,
  type StaggeredListProps,
} from './StaggeredReveal';

// Hero Section Pattern
export {
  HeroSection,
  HeroSkeleton,
  type HeroSectionProps,
  type HeroMetric,
  type HeroCta,
} from './HeroSection';

// Split View Pattern
export {
  SplitView,
  SplitViewSkeleton,
  type SplitViewProps,
} from './SplitView';

// Results Layout Pattern
export {
  ResultsLayout,
  ResultsLayoutSkeleton,
  type ResultsLayoutProps,
} from './ResultsLayout';

// Wizard Layout Pattern
export {
  WizardLayout,
  WizardStepContent,
  WizardLayoutSkeleton,
  type WizardLayoutProps,
  type WizardStep,
  type WizardStepContentProps,
} from './WizardLayout';
