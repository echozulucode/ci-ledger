# Playwright E2E Notes

## How to run
- From `frontend/`: `npm run test:e2e` (starts Vite dev server on 127.0.0.1:4173 per `playwright.config.ts`).
- To point at a running backend/frontend instead of the auto-start dev server, set `PLAYWRIGHT_BASE_URL` (and optionally `PLAYWRIGHT_HOST`/`PLAYWRIGHT_PORT`) and run `npm run test:e2e`.
- Install browsers once: `npx playwright install chromium`.

## Current coverage
- `tests/e2e/smoke.spec.ts`: loads the login page.
- `tests/e2e/authenticated-flows.spec.ts`: mocks auth + events APIs, exercises login to dashboard and viewing events.

## Mocking behavior
- Tests intercept `**/api/auth/*`, `**/api/events*`, `**/api/agents*`, `**/api/tools*`, `**/api/tags*` to return fixtures. Update these routes if your backend shape changes or if you want to hit a real API (remove the routes and use a seeded user).

## Tips
- Keep Vite proxy pointing at your backend when testing real calls (`VITE_API_BASE_URL` or proxy config).
- Use `trace=on-first-retry` (default in config) to inspect failures: `npx playwright show-trace test-results/...zip`.
