/**
 * PathMap Mode Store
 *
 * Zustand store for managing presenter vs self-serve mode
 * and related UI states.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Operating mode for PathMap
 * - presenter: Live meeting mode with locked controls
 * - self-serve: Client explores independently
 */
export type PathMapMode = 'presenter' | 'self-serve';

/**
 * Onboarding step for first-time users
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * PathMap mode store state
 */
interface PathMapModeState {
  // Mode
  mode: PathMapMode;
  setMode: (mode: PathMapMode) => void;

  // Presenter controls
  isLocked: boolean;
  setLocked: (locked: boolean) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  currentOnboardingStep: number;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;

  // Hints/tooltips
  showHints: boolean;
  toggleHints: () => void;
  setShowHints: (show: boolean) => void;

  // Presenter-specific
  presenterDisclosureLevel: 1 | 2 | 3;
  setPresenterDisclosureLevel: (level: 1 | 2 | 3) => void;
  presenterExpandedNodes: Set<string>;
  setPresenterExpandedNodes: (nodes: Set<string>) => void;
  presenterFocusNodeId: string | null;
  setPresenterFocusNodeId: (nodeId: string | null) => void;
}

/**
 * Onboarding steps for self-serve mode
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PathMap',
    description:
      'Explore strategic paths with progressive disclosure. Click on any path to begin.',
    targetSelector: '[data-onboarding="path-selector"]',
    position: 'bottom',
  },
  {
    id: 'disclosure-levels',
    title: 'Disclosure Levels',
    description:
      'Use the disclosure toggle to reveal more detail. Level 1 is overview, Level 3 shows full research.',
    targetSelector: '[data-onboarding="disclosure-toggle"]',
    position: 'bottom',
  },
  {
    id: 'tree-navigation',
    title: 'Navigate the Tree',
    description:
      'Click on nodes to expand/collapse branches. Each node represents a decision or milestone.',
    targetSelector: '[data-onboarding="tree-navigator"]',
    position: 'top',
  },
  {
    id: 'evidence-panel',
    title: 'View Evidence',
    description:
      'Click any node to open the evidence panel and see supporting case studies and data.',
    targetSelector: '[data-onboarding="evidence-panel"]',
    position: 'left',
  },
];

/**
 * PathMap Mode Store
 */
export const usePathMapModeStore = create<PathMapModeState>()(
  persist(
    (set) => ({
      // Mode
      mode: 'self-serve',
      setMode: (mode) =>
        set({
          mode,
          // When switching to presenter mode, hide hints
          showHints: mode === 'self-serve',
        }),

      // Presenter controls
      isLocked: false,
      setLocked: (isLocked) => set({ isLocked }),

      // Onboarding
      hasCompletedOnboarding: false,
      currentOnboardingStep: 0,
      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true, currentOnboardingStep: 0 }),
      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false, currentOnboardingStep: 0 }),
      nextOnboardingStep: () =>
        set((state) => ({
          currentOnboardingStep: Math.min(
            state.currentOnboardingStep + 1,
            ONBOARDING_STEPS.length - 1
          ),
        })),
      prevOnboardingStep: () =>
        set((state) => ({
          currentOnboardingStep: Math.max(state.currentOnboardingStep - 1, 0),
        })),

      // Hints/tooltips
      showHints: true,
      toggleHints: () => set((state) => ({ showHints: !state.showHints })),
      setShowHints: (showHints) => set({ showHints }),

      // Presenter-specific
      presenterDisclosureLevel: 2,
      setPresenterDisclosureLevel: (presenterDisclosureLevel) =>
        set({ presenterDisclosureLevel }),
      presenterExpandedNodes: new Set(),
      setPresenterExpandedNodes: (presenterExpandedNodes) =>
        set({ presenterExpandedNodes }),
      presenterFocusNodeId: null,
      setPresenterFocusNodeId: (presenterFocusNodeId) =>
        set({ presenterFocusNodeId }),
    }),
    {
      name: 'pathmap-mode',
      partialize: (state) => ({
        mode: state.mode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        showHints: state.showHints,
      }),
    }
  )
);

export default usePathMapModeStore;
