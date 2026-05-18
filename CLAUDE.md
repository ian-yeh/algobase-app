# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Algobase** is a speedcubing training app that tracks solve times and provides performance analytics. It's a full-stack monorepo with a React frontend and FastAPI backend, connected to Supabase for authentication and PostgreSQL for data storage.

### Architecture

**Frontend** (`/web`): React 19 + TypeScript + Vite
- Supabase Auth UI for authentication
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for performance visualizations
- API calls to the FastAPI backend

**Backend** (`/backend`): FastAPI + SQLAlchemy + PostgreSQL
- Structured as: Routers → Services → Models
- Uses Pydantic schemas for request/response validation
- Supabase JWT tokens for authentication
- Alembic for database migrations

**Database**: PostgreSQL (hosted on Neon)
- Models: User, Solve
- Managed with SQLAlchemy ORM and Alembic migrations

## Commands

### Frontend Development
```bash
cd web
npm run dev        # Start dev server with HMR (Vite)
npm run build      # Build for production (tsc + vite build)
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

### Backend Development
```bash
cd backend
source .venv/bin/activate  # Activate virtual environment
uvicorn app.main:app --reload  # Start FastAPI dev server (hot reload)
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "migration description"  # Create migration
alembic upgrade head        # Apply migrations
alembic downgrade -1        # Rollback one migration
```

## Key File Structure

### Frontend
- `src/pages/` — Page components (Landing, Home, Timer, etc.)
- `src/components/` — Reusable UI components
- `src/features/` — Feature-specific logic (e.g., solve timer, insights)
- `src/contexts/` — React Context for global state (auth, user data)
- `src/lib/` — Utilities and API client integration
- `src/hooks/` — Custom React hooks

### Backend
- `app/routers/` — API endpoints (`/user`, `/solve`)
- `app/models/` — SQLAlchemy ORM models
- `app/schemas/` — Pydantic validation schemas
- `app/services/` — Business logic (calculations, data processing)
- `app/core/` — Auth, config, and middleware setup
- `alembic/versions/` — Database migrations

## Authentication Flow

- **Frontend**: Uses Supabase Auth UI, stores JWT in session
- **Backend**: Validates JWT tokens from `Authorization: Bearer <token>` header
- **Source**: `app/core/auth.py` handles token validation; routers check auth before returning user data

## API Integration

Frontend calls the backend at `http://localhost:8000` (dev) via fetch/async functions. Key endpoints:
- `GET /users/{user_id}` — Get user data
- `POST /solves` — Record a new solve
- `GET /solves/{user_id}` — Get user's solves with analytics

## Environment Variables

### Backend (`.env` in `/backend`)
- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `SUPABASE_JWT_SECRET` — Secret key for JWT validation

### Frontend (`.env` in `/web`)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

## Development Notes

- **CORS**: Currently set to allow all origins (`["*"]`) in `app/main.py` — restrict to frontend URL in production
- **Error Handling**: Frontend has centralized error boundaries in pages; backend returns standard HTTP status codes
- **Migrations**: Always run migrations before pushing to ensure schema stays in sync

## Deployment

Frontend and backend can be deployed separately:
- **Frontend**: Build output in `/web/dist/`, deploy to Vercel, Netlify, or similar
- **Backend**: Deploy FastAPI app using Docker, Railway, Heroku, or similar (ensure `DATABASE_URL` is set)

## Common Tasks

- **Add a new user metric**: Add column to User model → create Alembic migration → add schema field → expose in router
- **Add a new solve endpoint**: Create router handler → add service logic → add response schema → export from routers
- **Update frontend styling**: Tailwind CSS via `src/index.css`; components use `className` directly

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
