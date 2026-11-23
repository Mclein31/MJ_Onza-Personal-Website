# FX1 — Flaky Visit Counter Test (`tests/visitors.spec.mjs`)

## Summary
- **Failing test**: `tests/visitors.spec.mjs` → `'a failed first visit can retry and never increments Abacus directly'` on `--project=iphone-14` (WebKit).
- **Pre-fix reproduction**: 3 of 8 runs failed (runs 1, 5, and 7) with `expect(locator('[data-stats-visits]')).toHaveText('101')` timing out after 8000 ms because the DOM rendered `"102"`, not `"0"`.
- **Conclusion**: `scripts/core/stats.js` behaves correctly (no WebKit Web Lock holdover bug and no premature cached-total render). The flakiness was a test-synchronization race in `tests/visitors.spec.mjs`: the test flipped `fail = false` and reloaded before `scripts/main.js` finished booting and before the first load's `/api/stats?type=increment&metric=visits` request had even been sent.

## Pre-Fix Reproduction & Trace Evidence

Running the 8-run loop on `iphone-14` (`--retries=0`) before any edits produced 3 failures (runs 1, 5, 7) and 5 passes (runs 2, 3, 4, 6, 8).

### Error Output (runs 1, 5, 7)
```text
Locator:  locator('[data-stats-visits]')
Expected: "101"
Received: "102"
Timeout:  8000ms
```

### Trace Timelines (`trace.zip` from runs 1, 5, 7)
Wall-clock event timelines extracted from `test.trace` and `1-trace.network` relative to `Navigate` start (`+0.0 ms`):

- **Run 1**:
  - `+0.0 ms` `TEST_START Navigate` (`https://portfolio.test/`)
  - `+261.9 ms` `TEST_END Navigate`
  - `+264.2 ms` `TEST_START Evaluate` (`localStorage.getItem('site_user_has_visited')`)
  - `+311.4 ms` `TEST_END Evaluate` -> `null`; test immediately executes `fail = false`
  - `+312.7 ms` `TEST_START Reload`
  - `+323.2 ms` `NET_START /api/stats?type=get&metric=likes` -> `200` (`{"count":10}`)
  - `+332.2 ms` `NET_START /api/stats?type=increment&metric=visits` -> `status=-1` (aborted by reload, **after** `fail = false` so `fixtures.mjs` already incremented `stats.visits` `100 -> 101`)
  - `+340.2 ms` `NET_START https://portfolio.test/` (reload document) -> `200`
  - `+558.2 ms` `NET_START /api/stats?type=get&metric=likes` -> `200` (`{"count":10}`)
  - `+562.2 ms` `NET_START /api/stats?type=increment&metric=visits` -> `200` (`{"count":102}`)
- **Run 5**:
  - `+256.4 ms` `TEST_END Navigate`; `+307.9 ms` `TEST_END Evaluate`; `+308.4 ms` `TEST_START Reload`
  - `+332.1 ms` first `/api/stats?type=increment&metric=visits` (`status=-1`), `+343.1 ms` reload document
  - `+574.1 ms` second `/api/stats?type=increment&metric=visits` -> `200` (`{"count":102}`)
- **Run 7**:
  - `+251.8 ms` `TEST_END Navigate`; `+302.4 ms` `TEST_END Evaluate`; `+303.2 ms` `TEST_START Reload`
  - `+328.3 ms` first `/api/stats?type=increment&metric=visits` (`status=-1`), `+337.3 ms` reload document
  - `+556.3 ms` second `/api/stats?type=increment&metric=visits` -> `200` (`{"count":102}`)

### Why Passing Pre-Fix Runs Also Missed the 502 Path
Traces from a passing pre-fix run on both `desktop-chrome` and `iphone-14` (`--trace=on`) showed only **one** `/api/stats?type=increment&metric=visits` request (`200 {"count":101}`) across the entire test, on the second load. On fast/non-racing runs, `page.reload()` tore down the first page before `scripts/main.js`'s async `boot()` reached step 11 (`initStats()`), so the first load never even hit the `502` route.

### Why `scripts/core/stats.js` Was Not Changed
1. In `scripts/main.js`, `boot()` awaits dynamic imports (`motion.js`, `nav.js`) before calling `initStats()` at step 11, after `window.load` may already have fired.
2. When `stats.js` runs on the reloaded page, `navigator.locks.request('portfolio-first-visit', loadVisits)` is acquired immediately: in runs 1, 5, and 7, the reloaded page sent `/api/stats?type=increment&metric=visits` within 4–7 ms of `/api/stats?type=get&metric=likes` (`+558.2 ms` vs `+562.2 ms` in run 1; `+567.1 ms` vs `+574.1 ms` in run 5; `+550.3 ms` vs `+556.3 ms` in run 7).
3. `stats.js` already returns `null` for failed `increment` calls without falling back to Abacus `/hit/` and only sets `site_user_has_visited` on a numeric response.

## Fix Applied
Updated `tests/visitors.spec.mjs` (`'a failed first visit can retry and never increments Abacus directly'`):
- Register `page.waitForResponse(...)` before `page.goto('https://portfolio.test/')` for `/api/stats?` with `type=increment`, `metric=visits`, and `status() === 502`.
- `await failedVisit` and wait for `initStats()`'s `Promise.all` + `settle()` to complete (`[data-stats-likes]` has text `'10'` and `[data-stats-visits]` does not have class `is-loading`).
- Assert `localStorage.getItem('site_user_has_visited')` is `null` after the 502 settles, then set `fail = false`, call `page.reload()`, and assert `[data-stats-visits]` has text `'101'` and zero Abacus `/hit/` calls.

## Verification
All checks ran after the final edit to `tests/visitors.spec.mjs`:
- `for i in 1..8`: `npx playwright test tests/visitors.spec.mjs --project=iphone-14 --retries=0 --reporter=line` → **8/8 runs passed** (`2 passed` per run, 0 failures).
- `npx playwright test tests/visitors.spec.mjs --project=desktop-chrome --project=pixel-7 --retries=0 --reporter=line` → **4 passed** (`0 failed`).
- `npm run test:v5 -- -g 'stats' --reporter=line` (`v5b-desktop`, `v5b-iphone14`, `v5b-duo-folded`) → **3 passed** (`0 failed`).
