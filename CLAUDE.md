# FutureTree - Claude Code Project Guide

**Project Location:** `~/Developer/personal/futuretree`
**Type:** Strategic Intelligence Platform for Small Business Growth
**Last Updated:** 2025-11-20

---

## Quick Start

### Development
```bash
npm run dev               # Next.js dev server (port 3000)
npm run dev:server        # Express backend with watch mode
npm run dev:ai            # Python AI service (cd ai-service && python main.py)
```

### Database Operations
```bash
npm run db:push           # Push schema to PostgreSQL
npm run db:generate       # Generate migrations
npm run db:studio         # Open Drizzle Studio
npm run db:seed           # Seed initial data
npm run db:seed:cases     # Seed case studies
npm run db:seed:paths     # Seed strategic paths
```

### Testing & Quality
```bash
npm test                  # Vitest tests
npm run test:ui           # Vitest UI dashboard
npm run lint              # Next.js linting
npm run type-check        # TypeScript checking
npm run format            # Prettier formatting
```

---

## Technology Stack

- **Frontend:** Next.js 15.1.4, React 19.0.0, TailwindCSS 4.0.0
- **UI:** Radix UI components, Framer Motion, React Day Picker
- **Backend:** Express 4.21.2, PostgreSQL, Drizzle ORM 0.37.0
- **Data:** TanStack Query 5.62.11, TanStack Table 8.21.0
- **Visualization:** ReactFlow 11.11.4 (strategy maps), Recharts 2.15.2
- **State:** Zustand 5.0.2
- **Validation:** Zod 3.24.1, React Hook Form 7.54.2
- **Theming:** next-themes 0.4.4 (dark mode)
- **Notifications:** Sonner 1.7.3 (toast notifications)
- **AI Service:** Python (in ai-service/ directory)

---

## Project Purpose

**Strategic Intelligence Platform** helping small businesses:
- Map competitive landscape with interactive visualizations
- Discover strategic growth paths with AI-powered insights
- Analyze case studies from similar businesses
- Plan and execute strategic initiatives
- Track progress against goals

---

## Project Structure

```
futuretree/
├── app/                   # Next.js App Router
│   ├── (routes)/         # Application routes
│   ├── api/              # API endpoints
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
│
├── components/            # React components
│   ├── ui/               # Radix UI primitives
│   ├── strategy-map/     # ReactFlow strategy visualizations
│   ├── case-studies/     # Case study components
│   └── [feature]/        # Feature-specific components
│
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes/           # API route handlers
│   └── lib/              # Server utilities
│
├── database/              # Drizzle ORM
│   ├── schema.ts         # Database schema
│   └── seeds/            # Seed scripts
│       ├── index.ts      # Main seed
│       ├── case-studies.ts  # Case study data
│       └── strategic-paths.ts  # Strategic path templates
│
├── ai-service/            # Python AI service
│   ├── main.py           # FastAPI server
│   ├── models/           # AI models
│   └── tools/            # AI tools
│
├── lib/                   # Shared utilities
│   ├── db/               # Database client
│   ├── api/              # API client
│   └── utils.ts          # Helper functions
│
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── public/                # Static assets
```

---

## Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/futuretree"

# AI Service
OPENAI_API_KEY="sk-proj_your_key"
AI_SERVICE_URL="http://localhost:8000"

# App Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Development Workflow

### Starting Development (3 Services)
```bash
# Terminal 1: Next.js frontend
npm run dev

# Terminal 2: Express backend (optional if using Next.js API routes)
npm run dev:server

# Terminal 3: Python AI service
npm run dev:ai
```

### Database Changes
```bash
# 1. Edit schema
vim database/schema.ts

# 2. Push to database
npm run db:push

# 3. Generate migrations (for version control)
npm run db:generate

# 4. Test with seed data
npm run db:seed
```

### Using ReactFlow for Strategy Maps
```typescript
// Import ReactFlow components
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Strategy map nodes represent business elements
const nodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Current State' } },
  { id: '2', position: { x: 200, y: 0 }, data: { label: 'Target State' } }
];

// Edges represent strategic paths
const edges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Growth Path' }
];
```

---

## Key Features

### Strategy Mapping
- **Interactive Visualization:** ReactFlow-based strategic maps
- **Node Types:** Current state, target state, milestones, competitors
- **Pathfinding:** AI-suggested paths from current to target
- **Drag & Drop:** Intuitive map building

### Case Studies
- **Similar Businesses:** Learn from companies in similar situations
- **Success Patterns:** Identify what worked for others
- **Seeded Data:** Multiple case studies for different industries
- **Filtering:** By industry, size, growth stage

### AI Insights
- **Strategic Analysis:** AI-powered recommendations
- **Pattern Recognition:** Identify successful patterns
- **Risk Assessment:** Evaluate strategic risks
- **Path Optimization:** Suggest optimal growth paths

---

## Ports

- **Next.js:** 3000
- **Express Backend:** 3001 (if running separately)
- **AI Service:** 8000
- **PostgreSQL:** 5432
- **Drizzle Studio:** https://local.drizzle.studio

---

## Code Style

### Next.js Patterns
- **App Router:** All routes in `app/` directory
- **Server Components:** Default
- **Client Components:** Use `'use client'` when needed
- **API Routes:** `app/api/[feature]/route.ts`

### React Patterns
- **Hooks:** Custom hooks for data fetching (TanStack Query)
- **State:** Zustand for global, useState for local
- **Forms:** React Hook Form + Zod validation
- **Styling:** TailwindCSS 4 utility classes

---

## Testing

### Running Tests
```bash
npm test                  # Vitest watch mode
npm run test:ui           # Visual test runner
```

### Test Structure
```
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
└── e2e/                  # End-to-end tests
```

---

## Common Workflows

### Creating a New Strategy Map
1. Define nodes (business states, milestones)
2. Add edges (strategic paths between states)
3. Use ReactFlow hooks for interactivity
4. Save map to database via API

### Adding a Case Study
1. Edit `database/seeds/case-studies.ts`
2. Add case study data (company, industry, strategy, results)
3. Run `npm run db:seed:cases`
4. Appears in case study browser

### Integrating AI Analysis
1. Call AI service API endpoint
2. Pass strategic context (current state, goals, constraints)
3. Receive AI-generated insights and recommendations
4. Display in UI with React components

---

## Known Quirks

⚠️ **Three-service architecture**: Frontend (Next.js), Backend (Express), AI (Python)
- Start all three for full functionality
- AI service optional for basic features

⚠️ **ReactFlow CSS required**: Import 'reactflow/dist/style.css' globally
- Already included in app/layout.tsx

⚠️ **Engine requirements**: Requires Node.js >=20.0.0 and pnpm >=9.0.0
- Use correct package manager: `pnpm install` (not `npm`)

---

## Documentation

### In-Project
- Check `docs/` directory for architecture diagrams
- See `examples/` for usage examples

### External
- [Next.js 15](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [ReactFlow](https://reactflow.dev/)
- [TanStack Query](https://tanstack.com/query/latest)

### Centralized
- `~/Documents/claude-projects/changelogs/futuretree-changelog.md`
- `~/Documents/claude-projects/plans/futuretree-plan.md`

---

## Git Workflow

```bash
feat: Add competitor analysis to strategy maps
fix: Correct ReactFlow node positioning
docs: Update strategy mapping guide
test: Add case study filtering tests

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Next Steps for New Contributors

1. Install pnpm globally: `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. Set up environment: `cp .env.example .env.local`
4. Create database and update DATABASE_URL
5. Push schema: `pnpm run db:push`
6. Seed data: `pnpm run db:seed`
7. Start dev server: `pnpm run dev`
8. Visit: http://localhost:3000

---

**Remember:** This is a living document. Update it as the project evolves!
