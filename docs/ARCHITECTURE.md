# FutureTree - System Architecture

## Overview

FutureTree is built as a multi-tier application with clear separation of concerns.

See [FUTURETREE-VISION.md](../FUTURETREE-VISION.md) for the complete 30,000+ word technical architecture deep dive.

## Quick Architecture Summary

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Next.js 15)       │
│   React 19 + Tailwind v4 + shadcn/ui   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Business Logic (Express + TypeScript) │
│   Case Studies, Roadmaps, Financial    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   AI Layer (Python + FastAPI)          │
│   RAG, Research, Prediction, Chatbot   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Data Layer (PostgreSQL + pgvector)    │
│   Case Studies, Roadmaps, Embeddings   │
└─────────────────────────────────────────┘
```

## Key Components

### Frontend

- **Next.js 15** with App Router
- **React 19** with Server Components
- **ReactFlow** for decision trees
- **Recharts** for analytics

### Backend

- **Express** API server
- **Drizzle ORM** for database
- **pgvector** for semantic search

### AI Service

- **FastAPI** server (Python)
- **LangChain** for RAG
- **CrewAI** for multi-agent systems
- **Claude/OpenAI** for intelligence

## Data Flow

1. User creates roadmap in FutureTree UI
2. Frontend calls Express API
3. API queries PostgreSQL + AI service
4. AI analyzes case studies (semantic search)
5. Returns recommendations
6. User exports to TwentyFive CRM
7. Performance data flows back weekly

For complete architecture details, see [FUTURETREE-VISION.md](../FUTURETREE-VISION.md) Part 4.
