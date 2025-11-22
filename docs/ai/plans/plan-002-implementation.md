# Implementation Plan: CI Ledger MVP (plan-002)

## Context and Starting Point
- Base code: FastAPI intranet demo (auth, users, tokens, items) with React/Vite frontend. Renamed product: **CI Ledger**.
- Goal: deliver the high-level design in `plan-001-high-level.md` as a production-ready change ledger (events, agents, tools, toolchains, webhooks, timeline UI) without regressing auth/user flows.
- Principles: ship in thin vertical slices (API + UI + tests), preserve RBAC, keep migrations reversible, prefer background tasks/queues for ingestion.

## Phase 0 - Baseline & Enablers ✅
- Validate dev workflow: ensure Docker Compose services start, smoke-test existing auth/login and item CRUD, and document env vars (.env) for new services.
- Dependency hygiene: pin backend/ frontend versions, add pre-commit/formatters if missing, and enable minimal observability (request logging, error tracing hooks).
- Decide data store path: confirm SQLite WAL for MVP; size and concurrency risks noted with upgrade path to Postgres in backlog.

Status: Docker/dev flow works; SQLite MVP retained. Pre-commit not added.

## Phase 1 - Domain Model & Persistence (DB + Migrations) ✅
- Model new tables with SQLModel: `events`, `agents`, `tools`, `toolchains`, `event_agents`, `event_tools`, optional `tags`, plus enum/severity/type constants.
- Add Alembic migration(s): create tables, indexes (timestamp, severity, agent_id, event_type), and constraints (FKs, cascading rules, non-null for titles/timestamps).
- Seed/fixtures: sample agents/tools/events for UI dev and automated integration tests.
- Data access layer: CRUD/query helpers for pagination and filters (date range, agent, tool, type, severity, source, search on title/description).

Status: Models and migrations in place; seeds available for dev/tests.

## Phase 2 - Core API & RBAC (FastAPI) ✅ (remaining: webhook/poller RBAC)
- Routers: replace/augment `items` with event/agent/tool/toolchain CRUD and timeline/query endpoints; reuse auth dependencies for RBAC (admin vs editor vs viewer scopes).
- Filtering/timeline endpoint: optimized query that joins junction tables, supports time-bucket ordering and optional aggregation for swimlanes.
- Validation & schemas: Pydantic/SQLModel models for create/update/read; enforce metadata JSON structure and enum validation.
- Tests: API tests for CRUD, filters, authorization rules, and migration idempotency; update OpenAPI tags/descriptions.

Status: Event/agent/tool/toolchain CRUD and filters implemented; event responses now include agents/tools/tags. Items router re-registered for legacy tests. Webhook/poller RBAC still pending.

## Phase 3 - Frontend Experience (React + Vite) ✅ (remaining polish)
- Timeline view: implement using chosen library (e.g., vis-timeline or react-chrono) with swimlanes per agent, severity/type color scheme, zoom controls, and responsive layout.
- Filter panel: multi-select agents/labels/tools/toolchains, date range, event type/severity checkboxes, search box, and "save filter" presets (local storage).
- Event detail: modal/page showing full event, related events (same agent/tool/time window), external links, and comment/notes placeholder.
- List/table view: sortable, export-to-CSV, and pagination consistent with backend filters.
- Auth integration: reuse existing login/token flow; gate edit actions to admins/editors; protect routes and handle token refresh/expiry.
- Frontend tests: component/unit for filters and timeline rendering; e2e happy-path flows (login, filter, view event, export).

Status: New Events and Inventory screens built with filters, table/timeline toggle, slide-over details, admin actions; tokens/profile/login/register flows unchanged. Playwright smoke added (login page). Export/CSV and advanced timeline remain backlog. No end-to-end auth flow yet (needs seeded user or test login helper).

## Phase 4 - Automation & Ingestion 🚧 (partial)
- Webhooks: FastAPI endpoints for Jenkins/generic receivers; parse payloads into internal event schema, validate signatures/hmac if configured.
- Pollers: background tasks or separate worker container for Jenkins agent config polling, Docker image tracking, and package version checks; schedule via APScheduler/Cron.
- Normalization: shared transformer module to map external payloads to `events` with tool/agent linkage and metadata; dedupe logic to avoid noisy duplicates.
- Reliability: queue/retry strategy (start with in-process background tasks, allow pluggable message queue later); ingestion metrics/logging.

Status: Jenkins webhook implemented with optional HMAC verification; auto upserts agents/tools/tags and creates events with source=webhook. Poller scaffold added (disabled by default) with configurable interval. Queue/metrics remain open.

Status: Not started. No webhooks/pollers; ingestion remains manual via API/ui.

## Phase 5 - UX Enhancements & Collaboration (Backlog)
- Advanced search: free-text search over title/description/metadata; saved searches; label/tag management.
- Correlation helpers: related events suggestions (same agent/tool within window), quick links to Jenkins job/run, and outage/rollback flags.
- Data entry polish: quick-add outage form, bulk CSV import with validation report, and inline edit for severity/tags.

## Phase 6 - Operations, Security, and Rollout
- Security: tighten CORS, rate limiting for public webhook endpoints, audit trail for manual edits, and role definitions (viewer/editor/admin) wired through API/FE.
- Observability: request/ingestion logs, basic metrics (events ingested per source, webhook failures), health checks for pollers, and uptime endpoints.
- Backup/retention: SQLite WAL + periodic backup job; retention policy for old events; archiving hooks ready for Postgres migration.
- Deployment: update docker-compose to include collector/backup services; CI pipeline for lint/test/build; migration/seed steps added to release checklist.

## Success Criteria & Exit Checks
- End-to-end slice: authenticated user can view timeline and list, filter by agent/date/type, and see seeded events.
- Admin/editor can create/update/delete events, agents, tools, and toolchains with audit trail and validation.
- Webhook/poller path creates events tagged with source, visible on timeline, and covered by tests.
- All new APIs documented in OpenAPI and guides; CI runs backend/unit and frontend/e2e smoke tests.

Status summary (MVP today):
- ✅ Phases 0–3 delivered (core models/APIs/UI, Playwright smoke).
- 🚧 Phase 4–6 not started; ingestion via webhooks/pollers and ops hardening are future work.
