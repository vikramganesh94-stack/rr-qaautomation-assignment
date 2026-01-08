# TMDB Discover – QA Automation Suite

Tech: TypeScript + Playwright + POM. Deterministic selectors via roles/text, API assertions via network capture, console + HTML reporting, structured logging with Pino.

## Project layout
- src/pages – Page Objects (HomePage)
- src/fixtures – Custom fixtures (home, logger)
- src/utils – Logger + API helpers
- src/config – Environment defaults
- tests/e2e – Specs (filters, pagination, negative)
- docs/test-cases.md – Step-by-step scenarios
- docs/defects.md – Known issues log

## Test strategy
- Coverage: filters (type, genre, year, rating, title, category links), pagination (next/prev, direct, boundary), negative (broken slugs, failing last pages, invalid filter mix).
- Design: POM, data-driven (env overrides), API + UI dual assertions, resilience via role/text selectors and soft fallback on known issues.
- Oracles: UI list not empty/empty-state, API status 2xx, params include filters, pagination indicator updates, no crash on bad slugs.
- Determinism: waits on API responses (waitForDiscoveryResponse), capped timeouts, retry once in config.

## Setup
1) Install deps
```bash
npm install
npx playwright install --with-deps
```
2) Optional env (.env)
```
BASE_URL=https://tmdb-discover.surge.sh
HEADLESS=true
GENRE=Action
TITLE_KEYWORD=Avatar
MAX_PAGE=5
LOG_LEVEL=info
```

## Run tests
- All: `npm test`
- Headed: `npm run test:headed`
- Debug: `npm run test:debug`
- HTML report: `npm run report` (opens reports/html/index.html)

## Logging & reporting
- Pino logs to console (pretty) and file logs/tests.log.
- Playwright reporters: list + HTML (reports/html) + JSON (reports/results.json).
- Artifacts on failure: screenshot, trace, video (retain-on-failure).

## API/network validation
- waitForDiscoveryResponse waits for discover/search/category calls and asserts status.
- Tests log captured URL, status, method, payload preview; attach to logger for debugging.

## CI approach (conceptual)
- Pipeline: npm ci -> npx playwright install --with-deps -> npm test -> publish reports/html as artifact -> optionally run in Docker with browser image.
- Matrix: run chromium + webkit (already configured projects), headless by default; nightly headed run for flake detection.
- Gating: fail build on non-zero exit; upload traces/videos for triage.

## Defects observed (see docs/defects.md)
- Broken slug reliability and pagination tail issues documented with repro steps.
