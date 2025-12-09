# FutureTree Changelog

All notable changes to FutureTree are documented here.

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
