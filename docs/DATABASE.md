# FutureTree - Database Schema

## Overview

PostgreSQL 15+ with **pgvector extension** for semantic search of case studies.

See [FUTURETREE-VISION.md](../FUTURETREE-VISION.md) Part 4 for complete schema with all tables, indexes, and queries.

## Core Tables

### 1. case_studies

Business transformation case studies with before/after states, timelines, capital invested, outcomes.

**Key fields:**

- `company_name`, `industry`, `revenue_stage`
- `strategy_type` (array: vertical_specialization, content_led, etc.)
- `before_state` (JSONB: revenue, team_size, challenges)
- `after_state` (JSONB: revenue, team_size, outcomes)
- `timeline`, `capital_invested`, `success_metrics`

### 2. strategic_paths

Pre-built strategic templates (5 playbooks: Vertical Specialization, Content-Led, etc.)

**Key fields:**

- `name`, `slug`, `description`
- `phases` (JSONB array: objectives, duration, cost, features)
- `success_rate`, `avg_timeline`, `avg_capital_required`
- `case_study_ids` (related case studies)

### 3. roadmaps

User-generated strategic roadmaps with visual decision trees.

**Key fields:**

- `user_id`, `title`, `description`, `goal`
- `nodes` (JSONB: milestones, decisions, phases)
- `edges` (JSONB: dependencies)
- `phases` (JSONB: suggested TwentyFive features)
- `export_payload` (JSON sent to TwentyFive)

### 4. outcomes

Performance tracking - actual vs projected metrics.

**Key fields:**

- `roadmap_id`, `phase_number`, `week_number`
- `metrics` (JSONB: revenue, leads, conversion, etc.)
- `variance_from_projection` (JSONB: projected vs actual)
- `adjustments_made` (what user changed)

### 5. embeddings

pgvector embeddings for semantic search (1536 dimensions via OpenAI).

**Key fields:**

- `case_study_id`, `chunk_text`, `chunk_index`
- `embedding` (VECTOR(1536))

**Index:** HNSW for fast similarity search

### 6. users

User accounts with TwentyFive integration.

### 7. sessions

JWT session management.

### 8. audit_logs

Track roadmap exports, data changes.

## Semantic Search Example

```sql
-- Find similar case studies
SELECT cs.*,
       1 - (e.embedding <=> $1::vector) AS similarity
FROM embeddings e
JOIN case_studies cs ON e.case_study_id = cs.id
ORDER BY e.embedding <=> $1::vector
LIMIT 10;
```

Where `$1` is the embedding of user's query.

## Setup

```bash
# Install pgvector
psql -d futuretree -c "CREATE EXTENSION vector;"

# Run migrations
pnpm db:push

# Seed data
pnpm db:seed
```

For complete schema with all columns, indexes, and seed data, see [FUTURETREE-VISION.md](../FUTURETREE-VISION.md) Part 4.
