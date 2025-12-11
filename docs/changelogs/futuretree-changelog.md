# FutureTree Changelog

All notable changes to FutureTree are documented here.

---

## 2025-12-11 - Premium UI Foundation & Potentiality Reveal

**Session:** soul-of-futuretree-implementation
**Commit:** 040f83d

### What Changed
Implemented Phase 1 (Foundation) and Phase 2 (Potentiality Components) from the "Soul of FutureTree" plan. These are the bleeding-edge 2025 UI patterns that transform the app from Craigslist-style to Linear/Notion/Figma premium aesthetic.

### Components Added

**Phase 1 - Foundation (components/ui/premium/):**
- `AnimatedCounter`: Numbers count up from 0 when entering viewport (for "87% success rate" wow moments)
- `ScrollReveal`: Elements animate in on scroll with configurable direction
- `StaggerContainer/StaggerItem`: Parent-controlled cascading child animations
- `PremiumButton`: Tactile buttons with complex layered shadows
- `BlurRevealText`: Words unblur word-by-word (hero headline effect)

**Phase 1 - Providers (components/providers/):**
- `SmoothScrollProvider`: Lenis smooth scrolling wrapper with reduced-motion support
- `useSmoothScroll`: Hook for programmatic scrolling

**Phase 2 - Potentiality (components/potentiality/):**
- `AnalysisLoading`: Staged progress animation ("Building your profile...", "Matching case studies...")
- `PathCard`: Strategic path comparison with animated success rates
- `CaseStudyCard`: Before/after transformation stories with similarity badges
- `PotentialityReveal`: THE screenshot moment - choreographed reveal with exact timing

### Design System Updates

**Tailwind Config:**
- Strategic path colors: green (vertical), blue (content), purple (partnership)
- Dark mode: Warm charcoal (#0F0F0F) not pure black
- Premium shadow system: premium-sm, premium, premium-lg
- Custom animations: fade-in, slide-up, scale-in

**globals.css:**
- Warm off-white light mode (#FAFAFA)
- Warm charcoal dark mode variables

### Technical Notes
- All components use Framer Motion v12 with useInView for viewport-triggered animations
- Lenis installed for smooth scroll (lerp: 0.1, duration: 1.2)
- Full TypeScript types with proper motion prop handling
- Reduced motion support baked in

### Next Steps
- Phase 3: Integrate components into landing page
- Phase 4: Self-discovery wizard with multi-step flow
- Phase 5: Strategy map with ReactFlow custom nodes

---

## 2025-12-08 18:45 - PathMap Week 5: Learning Loop Complete

**Session:** week5-learning-loop-outcome-tracking
**Commit:** 214f75a

### What Changed
Completed PathMap Week 5: Learning Loop - the final layer of the 5-Layer Systems Framework. This closes the feedback loop by tracking outcomes, detecting contradictions, and recalculating metrics based on real results.

### Features Added

**Database Schema (4 new tables):**
- `integrationWebhooks`: Audit log for webhook events (inbound/outbound)
- `twentyfiveConnections`: TwentyFive CRM credentials storage
- `outcomeSurveys`: 30/60/90-day follow-up surveys
- `metricRecalculationJobs`: Track metric recalculation jobs
- Added `modelVersion` field to strategicPaths for versioning

**Survey Scheduling System:**
- `lib/jobs/survey-scheduler.ts`: Core scheduling with 30/60/90 day survey types
- `app/api/pathmap/surveys/`: Schedule and manage surveys API
- `OutcomeSurveyModal.tsx`: Survey completion modal
- `SurveyPromptBanner.tsx`: Banner for pending surveys

**Variance Analytics Dashboard:**
- `lib/analytics/variance-calculator.ts`: Variance metrics calculation
- `lib/analytics/contradiction-detector.ts`: Detect path contradictions
- `app/pathmap/analytics/page.tsx`: Main analytics dashboard
- `VarianceChart.tsx`: Bar chart for timeline/cost variance
- `AttributionBreakdown.tsx`: Pie charts for outcomes/failure attribution
- `ContradictionList.tsx`: List of detected contradictions

**Metric Recalculation Pipeline:**
- `lib/jobs/metric-recalculator.ts`: Recalculate path metrics from outcomes
- Triggers: threshold_reached, scheduled, manual, outcome_received
- Auto-increments modelVersion on recalculation

**TwentyFive CRM Integration:**
- `lib/integrations/twentyfive/`: Types, HMAC validation, API client
- `app/api/integrations/twentyfive/connect/route.ts`: Connect/disconnect
- `app/api/integrations/twentyfive/export/route.ts`: Export roadmap to CRM
- `app/api/integrations/twentyfive/webhook/route.ts`: Receive webhook events
- HMAC-SHA256 signature validation with timestamp tolerance

### Impact
PathMap now implements the complete 5-Layer Systems Framework:
- **REALITY** → Case studies, market data, client context
- **UNDERSTANDING** → Pattern extraction, path aggregation
- **DECISION** → Recommendation engine, scoring
- **ACTION** → Presentation, export to CRM
- **LEARNING** → Outcome tracking, variance analysis, model improvement (NOW COMPLETE)

---

## 2025-12-08 10:45 - PathMap Analytics Integration (Week 3 Day 1)

**Session:** pathmap-analytics-week3-day1

### What Changed
Completed Week 3 Day 1 of PathMap implementation: PostHog Analytics Integration. Created comprehensive event tracking system for the Learning Layer.

### Features Added
- **Event Definitions** (`lib/analytics/pathmap-events.ts`): 25+ typed events covering session lifecycle, path exploration, node interactions, evidence views, what-if simulations, exports, and intake forms
- **Analytics Hook** (`hooks/usePathMapAnalytics.ts`): Full-featured hook with automatic session tracking, metrics aggregation, and type-safe tracking methods
- **Component Integration**: Analytics now tracks node expand/collapse, disclosure level changes, evidence panel views, and document clicks

### Files Modified
- `lib/analytics/pathmap-events.ts` (NEW)
- `lib/analytics/index.ts` (NEW)
- `hooks/usePathMapAnalytics.ts` (NEW)
- `hooks/index.ts` (NEW)
- `app/pathmap/[slug]/page.tsx`
- `components/pathmap/TreeNavigator.tsx`
- `components/pathmap/EvidencePanel.tsx`
- `.gitignore`

### Impact
PathMap now has full analytics coverage for the Learning Layer. This enables tracking which paths resonate with clients, how deep they explore, and what converts to exports - feeding back into recommendation engine improvements.

---

## 2025-12-08 10:30 - PathMap Foundation Complete (Weeks 1-2)

**Session:** pathmap-foundation

### What Changed
Completed PathMap Weeks 1-2: Foundation and Core Interactivity for the Layered Decision Navigator.

### Features Added
- **Database Schema**: strategicPaths, decisionNodes, clientContexts, pathExplorations, pathOutcomes tables
- **UI Components**: PathSelector, TreeNavigator, StrategicNode, EvidencePanel, MetricBadge, ValidationBadge
- **Pages**: /pathmap (path selection grid), /pathmap/[slug] (tree visualization)
- **Visualization**: ReactFlow + Dagre layout for hierarchical tree display
- **Progressive Disclosure**: 3 levels (Simple/Detailed/Full) with animated transitions

### Impact
PathMap foundation is complete. Users can now browse strategic paths and explore decision trees with progressive disclosure.

---
