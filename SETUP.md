# FutureTree - Setup Guide

## Prerequisites

- Node.js 20+ (for Next.js 15 + React 19)
- Python 3.10+
- PostgreSQL 15+ (with pgvector extension)
- pnpm (or npm/yarn)

## Environment Setup

### 1. Install Dependencies

```bash
# Install Node dependencies
pnpm install

# Install Python dependencies
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/futuretree"

# API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# TwentyFive Integration
TWENTYFIVE_API_URL="http://localhost:5000"
TWENTYFIVE_WEBHOOK_SECRET="your-webhook-secret"

# Session
SESSION_SECRET="generate-a-random-secret"
```

### 3. Database Setup

```bash
# Install pgvector extension
psql -d futuretree -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
pnpm db:push

# Seed initial data (case studies, strategic paths)
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Next.js frontend (port 3000)
pnpm dev

# Terminal 2: Express backend (port 4000)
pnpm dev:server

# Terminal 3: Python AI service (port 8000)
cd ai-service
source venv/bin/activate
python main.py
```

## Verify Installation

1. Open http://localhost:3000
2. You should see the FutureTree landing page
3. Check API health: http://localhost:4000/health
4. Check AI service: http://localhost:8000/health

## Common Issues

### PostgreSQL Connection Error

- Verify PostgreSQL is running: `psql -l`
- Check DATABASE_URL in `.env`

### pgvector Extension Missing

```sql
-- Connect to your database
psql -d futuretree

-- Install pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

### Port Already in Use

- Frontend (3000): Change in `package.json` dev script
- Backend (4000): Change in `server/index.ts`
- AI Service (8000): Change in `ai-service/main.py`

## Next Steps

1. Read [FUTURETREE-VISION.md](./FUTURETREE-VISION.md) for complete architecture
2. Explore [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. Review case study schema in [docs/DATABASE.md](./docs/DATABASE.md)
4. Start with [docs/GETTING-STARTED.md](./docs/GETTING-STARTED.md)
