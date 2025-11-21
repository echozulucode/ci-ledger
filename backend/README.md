# CI Ledger Backend

FastAPI + SQLModel API for the CI Ledger change tracker (events, agents, tools, toolchains, tags).

## Local setup
- Install deps: `cd backend && pip install -r requirements.txt`
- Run migrations (creates tables): `cd backend && alembic upgrade head`
- Start API: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Docs: http://localhost:8000/docs

## Database
- Default DB: SQLite (`DATABASE_URL` in `.env`); WAL recommended in production. Upgrade path to Postgres is planned if concurrency/size grows.
- Seed (optional for dev/tests): set `SEED_SAMPLE_DATA=true` (development only) or import `app.seeds.seed_sample_data` and call with a SQLModel `Session`.

## Auth
- JWT password flow: `/api/auth/login`
- Personal Access Tokens: `/api/users/me/tokens` (prefix `pat_`), usable as Bearer tokens.

## Key endpoints
- Events: `/api/events` (filters: start/end, agent_id, tool_id, event_type, severity, source, search)
- Agents: `/api/agents`
- Tools: `/api/tools`
- Toolchains: `/api/toolchains` and `/api/toolchains/{id}/tools`
- Tags: `/api/tags`
- Users/tokens: `/api/users`, `/api/users/me`, `/api/users/me/tokens`
- Legacy `items` endpoints are retired; use events/agents/tools instead.

## Testing
- Run: `cd backend && pytest`
- In CI/local, ensure dependencies installed and migrations applied before tests that hit the DB.

## Docker compose (full stack)
- `docker-compose up --build` (backend :8000, frontend :3000)
