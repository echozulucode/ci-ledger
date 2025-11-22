# Plan: BDD Feature Files (plan-004-bdd)

## Context
- Product: FastAPI/React intranet app with auth, RBAC, personal access tokens, item CRUD, admin, and security hardening (see `CONTEXT.md`).
- Goal: create clean, automation-ready Gherkin feature files that describe system behavior, organized by user need and best practices from `docs/bdd/bdd_gherkin_best_practices.md` (also see the PDF copy in the same folder).
- Constraints: one behavior per scenario (single When/Then), concise declarative steps (3-5 lines), minimal Background, Scenario Outlines only for clear data variation, and consistent tagging for traceability.

## Principles & Conventions
- One feature per capability; short narrative (As a/I want/So that) in each file.
- Scenarios: single When/Then pair; extend with And/But; no UI/URL/technical details.
- Background: only if every scenario needs the same Given; otherwise repeat key Given steps.
- Scenario Outlines: use Examples for data sets; keep tables small.
- Tagging strategy:
  - Domain: `@auth`, `@users`, `@tokens`, `@items`, `@ui`, `@ops`, `@security`, `@api`.
  - Persona/scope: `@admin`, `@user`, `@anonymous`, `@ldap`.
  - Purpose: `@smoke` (critical happy path), `@negative`, `@regression`.

## Deliverables (Feature File Set)
- Authentication & Authorization
  - `authentication/login.feature` (@auth @api @smoke) — local login/logout, token expiry/refresh rejection.
  - `authentication/password-reset.feature` (@auth @negative) — request/reset flow, invalid/expired token paths.
  - `authentication/ldap-login.feature` (@auth @ldap) — AD login success/failure, disabled account handling.
  - `authorization/rbac.feature` (@auth @admin @security) — admin vs user access guards across endpoints/routes.
- User Management
  - `users/profile.feature` (@users) — view/update own profile, validation errors.
  - `users/admin-crud.feature` (@admin @security) — create/disable/reactivate users, role changes, guarded operations.
  - `users/search-filter.feature` (@users) — search/filter/paginate users, empty-result handling.
- Personal Access Tokens
  - `tokens/create.feature` (@tokens @security) — scoped PAT issuance, one-time display.
  - `tokens/manage.feature` (@tokens) — list/revoke/expiry handling, visibility rules.
  - `tokens/use.feature` (@tokens @api) — API auth via PAT, scope enforcement, revoked/expired rejection.
- Items / Entity Management
  - `items/crud.feature` (@items @api @smoke) — create/read/update/delete own item.
  - `items/ownership.feature` (@items @security) — denial for others’ items, admin override.
  - `items/search.feature` (@items) — filter/sort/paginate items; outline for filter combos.
- Security & Compliance
  - `security/password-policy.feature` (@security @negative) — complexity rules, rejection cases.
  - `security/jwt-validity.feature` (@security) — signature/expiry validation, refresh rejection.
  - `security/input-validation.feature` (@security @negative) — block SQLi/XSS-style inputs at API layer.
  - `security/audit-logging.feature` (@security @admin) — log sensitive events without secrets.
- UI/UX Flows
  - `ui/navigation.feature` (@ui) — global nav, protected-route redirects.
  - `ui/form-validation.feature` (@ui) — inline errors, disabled submit, success toasts.
  - `ui/responsive.feature` (@ui) — essential controls visible at key breakpoints (mobile/tablet/desktop).
- Operations & Health
  - `ops/healthchecks.feature` (@ops @smoke) — liveness/readiness, DB/LDAP status payloads.
  - `ops/configuration.feature` (@ops @admin) — view redacted config, test LDAP connection safely.

## Execution Steps
1) Inventory & gap check: review existing `features/` set for reuse; map to the deliverables list and note missing files.
2) Skeletons: create feature files with narratives, tags, and minimal Background (only when common to all scenarios).
3) Happy-path first: draft @smoke scenarios per file (single behavior, 3-5 steps, declarative).
4) Negative & variants: add @negative and Scenario Outlines for data variations (credentials, filters, PAT scopes, device breakpoints).
5) Review & align: peer-review for best-practice adherence (one When/Then, declarative wording), ensure tags match strategy.
6) Automation readiness: ensure steps are parameterizable and align with planned step definitions (API/UI harness), then link to requirements via tags where applicable.
