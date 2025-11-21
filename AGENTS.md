# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: FastAPI app (auth, users, tokens, items), Alembic migrations, and SQLite data volume under `backend/data/`. Entrypoint: `app/main.py` and routers in `app/api/`.
- `frontend/`: React + Vite UI in `src/`, served via nginx in Docker. Env sample in `frontend/.env.example`.
- `docs/`: product, API, and AI planning docs (`docs/ai/plans/plan-00x.md`).
- `tests/` and `backend/app/tests/`: API/unit coverage; `features/`: BDD specs; `work/`: scratchpad experiments.

## Build, Test, and Development Commands
- Full stack: `docker-compose up --build` (backend on :8000, frontend on :3000). Stop with `docker-compose down`.
- Backend local: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` after `pip install -r requirements.txt`.
- Backend tests: `cd backend && pytest` (includes httpx async tests).
- Frontend local: `cd frontend && npm install && npm run dev` (Vite on :5173); build with `npm run build`; preview with `npm run preview`.
- Lint/format: Backend `cd backend && black app && pylint app`; Frontend `cd frontend && npm run lint`.

## Coding Style & Naming Conventions
- Python: PEP8, 4-space indents, `snake_case` for vars/functions, `PascalCase` for models/schemas. Keep FastAPI routers thin; move logic into `crud/` or services.
- TypeScript/React: 2-space indents, `camelCase` for props/state, `PascalCase` for components. Keep components small; co-locate CSS/modules.
- Tests mirror modules (e.g., `app/tests/test_users.py`, `frontend/src/__tests__/`).

## Testing Guidelines
- Prefer async httpx tests for API routes; seed data via fixtures. Cover auth guards (admin vs user) and error paths.
- Frontend: use Vitest + Testing Library; focus on user flows (login, filter timeline, CRUD). Snapshot sparingly.
- Target fast feedback: unit tests mandatory for PRs; add regression tests for bugs.

## Commit & Pull Request Guidelines
- Use clear, present-tense commits (optionally Conventional Commits: `feat: add event timeline filters`). Group related changes; avoid mixed-format fixes.
- PRs: include summary, linked issue, screenshots for UI, and test plan (`pytest`, `npm test`, `docker-compose up` smoke). Keep diff focused; update docs when APIs change.
- Do not auto-commit from tools/agents; commits should be created and pushed manually after review.

## Security & Configuration Tips
- Sensitive values live in `.env` files (backend/front). Never commit secrets. Default DB is SQLite; keep WAL files on the mounted volume.
- Webhooks/pollers should validate signatures when enabled; restrict CORS origins in production.
