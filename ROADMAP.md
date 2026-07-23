# Gauntlet Roadmap

This is the backlog — not a changelog. Phased checklist (`- [ ]`/`- [x]`),
modeled on driveff's `ROADMAP.md`. No GitHub Issues per item; work is picked up
directly from this file. See `SCRATCHPAD.md` for open questions and handoff
context between sessions, and `docs/AGENTS.md` for hard constraints (especially:
leagues must be processed separately until the presentation layer — Phase 1/2
below exist because that constraint is currently violated).

## Phase 0 — Season readiness findings (context, not actionable)

Findings from the pre-season audit (2026-07-23) that motivate everything below:

- `apps/web/src/lib/constants.ts:6-12` — `LEAGUE_IDS = {AFC, NFC}` is an object,
  not a list; `DEFAULT_LEAGUE_ID` hardcodes AFC. `CURRENT_SEASON = '2024'`
  (`:28`) is stale.
- A literal `'AFC' | 'NFC'` type union is repeated across ~15 files
  (`features/playoffs/types.ts:202`, `ScenarioBuilder.tsx`,
  `useScenarioSummary.ts`, `useLeagueSummary.ts`, `seeding-simulator.ts:1212`,
  `recap/types.ts:561,618`, recap `tools/*.ts`) — this violates
  `docs/AGENTS.md`'s hard constraint that leagues are processed separately until
  the presentation layer.
- `cross-league-simulator.ts:8,86-87,114-115` and `CrossLeagueMatchup`
  (`types.ts:228-243`, fixed `afcTeam`/`nfcTeam` fields) is a hardcoded 2-side
  bracket model.
- `app/draft/analysis/page.tsx:454-1189` hardcodes a 2-column `draft1`/ `draft2`
  UI with AFC/NFC labels.
- `ALL_GAUNTLET_LEAGUES`
  (`features/hall-of-fame/hooks/useHallOfFameData.ts: 13-19`) has exactly one
  season entry (`2025: {AFC, NFC}`) — no prior seasons registered, no shape that
  supports a variable league count.
- Hall of Fame duplication: `/hall-of-fame-enhanced` (linked from
  `sidebar.tsx:173`) is live/canonical. `/hall-of-fame` page,
  `useHallOfFame.ts`, and
  `lib/hall-of-fame-{aggregations,calculations, categories,data-service,expanded-categories}.ts`
  (deprecated re-export shims) are dead code.
- No `Manager`/`League`/`Season` tables exist anywhere
  (`apps/web/prisma/ schema.prisma` only has
  `ReturnConfirmation`/`WaitlistEntry`/`Proposal`). Manager identity is
  Sleeper's `owner_id`, stable across every league that user has joined —
  cross-league manager history is an aggregation problem over a league registry,
  not a schema migration.
- No single Sleeper API boundary — Sleeper endpoints are called ad hoc from many
  files (~10+ independent `Promise.all([fetch(AFC), fetch(NFC)])` call sites in
  recap tools/report nodes). Sibling repo `driveff` already solved this with
  `src/lib/sleeper/client.ts` (one boundary, fixture-replay tested) and
  `src/lib/leagues/` — worth porting the _shape_ of that convention.
- Design: real brand material exists (crimson/gold palette in `brand/colors.ts`,
  Geizer/Montserrat fonts, a real logo) but is barely used — stock shadcn
  "new-york/stone" everywhere. `--font-avenir` (`globals.css:95`) is referenced
  but never loaded, silently falling back to system sans. No semantic
  win/loss/grade token layer. Two uncoordinated team-color palettes
  (`brand/team-colors.json` vs. `tailwind.config.js` `viz.team`).
- Slow page loads flagged as a widespread complaint — not yet root-caused.

## Phase 1 — Data layer foundation

Build this first — Phases 2 and 3 both depend on it.

- [x] Single Sleeper API client boundary:
      `apps/web/src/lib/sleeper/unified-client.ts` hardened in place (existing
      class-based boundary kept, not rewritten) with Sleeper ID validation and
      `SLEEPER_FIXTURES=1` fixture replay, modeled on driveff's
      `src/lib/sleeper/client.ts`. Added `fetchTransactions`,
      `fetchWinnersBracket`, `fetchLosersBracket`.
- [x] League registry: `apps/web/src/config/leagues.ts` evolved in place (it
      already existed as a flat `CURRENT_LEAGUES`/`ALL_LEAGUES` list used by 17+
      call sites — chose to extend it rather than build a competing module) into
      `LEAGUE_REGISTRY: Record<SeasonId, League[]>` with
      `getLeaguesForSeason`/`getAllLeagues`/`getAllSeasons` accessors and a
      `previousLeagueId` field per league. Old `CURRENT_LEAGUES`/`ALL_LEAGUES`/
      `getCurrentLeagues`/`getLeagueConfig`/`getLeaguesBySeason` kept as
      registry-backed compat shims — no call-site rewrite needed.
- [x] Register known history explicitly: 2025's 2 leagues registered in
      `LEAGUE_REGISTRY['2025']`. The new season's key is deliberately absent
      (not a placeholder) with a comment pointing at `SCRATCHPAD.md`'s Blocked
      section — every accessor already treats an unregistered season as `[]`.
- [x] Replace the ~10+ scattered `Promise.all([fetch(AFC), fetch(NFC)])` call
      sites (recap tools, report nodes) with iteration over the registry. All 7
      `apps/web/src/lib/reports/recap/tools/*.ts` files (`standings.ts`,
      `league-overview.ts`, `upcoming.ts`, `composite-tools.ts`,
      `hall-of-shame.ts`, `power-rankings.ts`, `hall-of-fame-enhanced.ts`) now
      iterate `getCurrentLeagues()` instead of hardcoding
      `LEAGUE_IDS.AFC`/`.NFC` — every external return shape (`{afc, nfc}`,
      `league: 'AFC'|'NFC'`) unchanged.
- [x] Migrate server-side raw-`fetch('api.sleeper.app/...')` bypass files onto
      the hardened client: `app/api/nfl-state/route.ts`,
      `app/api/team/[id]/route.ts`, `app/api/cron/live-odds/snapshot-runner.ts`,
      and the remaining transaction/draft calls in `lib/api-replacements.ts` now
      go through `sleeperClient`. Only
      `app/api/reports/[season]/[week]/route.ts` (huge legacy fallback path
      duplicating logic already migrated in `recap/tools/*.ts`) remains
      unmigrated — needs a live/dead-code call before a rewrite, not a
      mechanical swap.
- [x] Caching: `unified-client.ts`'s hardcoded `cache: 'no-store'` (Next 14
      defaults an un-annotated `fetch()` to `force-cache`, the _opposite_ of
      Next 15+ — this was flagged mid-session and confirmed against real route
      files before proceeding) is gone; ~20 routes that implicitly relied on it
      for freshness (`nfl-state`, `team/[id]`, `matchups/*`, `leagues-static`,
      `league-direct`, `rollups/*`, `win-probability/*`, etc.) got an explicit
      `export const dynamic = 'force-dynamic'` to compensate. `fetchFromSleeper`
      gained an optional `next?: {revalidate}` passthrough so individual calls
      can opt into ISR; `year-in-review/league-structure/route.ts` and
      `lib/year-in-review/season-stats.ts` are migrated onto `sleeperClient`
      using it, preserving their original `revalidate: 3600` behavior.
- [x] `packages/types/src/index.ts:46`'s `Team.conference` loosened to optional
      — **turned out to have zero real consumers** (nothing in the repo imports
      the `Team` type; the ~17-consumer estimate in this item's original note
      conflated it with `config/leagues.ts`'s `League.conference`, which was
      already optional). No further changes needed; Phase 2's broader "remove
      the AFC/NFC literal union" item (the ~15-file cluster with real consumers:
      `features/playoffs/types.ts`, `config/leagues.ts` consumers in
      waiver-analysis/recap tools) is unaffected and still open.
- [x] Client/server split for `unified-client.ts`: new
      `apps/web/src/lib/sleeper/browser-client.ts` holds the shared
      fetch/config/error-handling logic (class `BrowserSleeperClient`) with no
      `fs` import; `unified-client.ts` now `extends` it, overriding a
      `tryFixture` hook to layer `SLEEPER_FIXTURES` replay back on top for
      server code. All existing `unified-client.ts` imports/exports are
      unchanged. A `next build` surfaced that the "no client component currently
      imports it" assumption from the original finding was wrong —
      `draft-data-fetcher.ts` (used by `'use client'`
      `app/draft/analysis/page.tsx`), `useHallOfFameData.ts` (used by
      `'use client'` `app/hall-of-fame-enhanced/page.tsx`),
      `shared/utils/stats/compose.ts`, and all 3
      `features/playoffs/simulations/*.ts` files were already pulling
      `fs/promises` into client bundles before this session; all 4 are now
      migrated onto `browser-client.ts`'s factories
      (`createBrowserDraftClient`/`createBrowserServiceClient`/
      `createBrowserStatsClient`/`browserSleeperClient`). Verified via a full
      `next build` (zero webpack "Can't resolve 'fs/promises'" errors) plus
      `pnpm test`/`type-check`/`lint`.
- [x] Manager-history aggregation helper:
      `apps/web/src/lib/leagues/manager-history.ts`
      (`getManagerHistory(ownerId, client?, weeksPerLeague?)`), unit-tested with
      a mocked client in `manager-history.test.ts`. Not wired into any UI —
      Phase 3's job.
- [x] Fixture-replay tests for Sleeper-dependent logic:
      `apps/web/src/lib/sleeper/unified-client.test.ts`, modeled on driveff's
      `client.test.ts`. A capture script
      (`apps/web/src/scripts/capture-sleeper-fixtures.ts`) exists but has not
      been run — it needs live network access and was intentionally left for a
      human/agent with that access; the `fixtures/` dir only has one
      hand-authored mechanism-test fixture so far, not real captured league
      data.

## Phase 2 — 3-league (5-league-history) migration

Builds on Phase 1's registry.

- [ ] Remove the `'AFC' | 'NFC'` literal union; replace with the generic
      league-key type from the registry, across the ~15 files found in Phase 0.
      Note (2026-07-23, from a driveff comparison): `config/leagues.ts`'s
      `League.conference` field is already optional, but
      `packages/types/src/index.ts:46`'s `conference: 'AFC' | 'NFC'` is
      non-optional — start by loosening that one, then update its ~17 consumers
      (`features/playoffs/*`, `features/waiver-analysis/*`,
      `lib/reports/recap/tools/*`) to treat conference as an optional label
      rather than an exhaustive 2-way discriminant. driveff has no equivalent
      code to port here — it deleted the multi-league concept entirely (see its
      ADR 0001), so this is a gauntlet-only fix.
- [ ] Redesign `cross-league-simulator.ts` for N leagues — round-robin vs.
      seeded bracket is an open design question, decide when this slice starts.
- [ ] Fix `draft/analysis` page's hardcoded 2-column UI.
- [ ] Bump `CURRENT_SEASON`; wire in the new season's leagues once IDs are
      provided.
- [ ] Land multi-league safety tests (see `GITHUB_ISSUES.md`'s existing,
      unimplemented "Add Multi-League Safety Tests" item — fold it in here
      rather than tracking it twice).

## Phase 3 — Hall of Fame / Hall of Shame + manager profiles

- [ ] Delete confirmed-dead code: legacy `/hall-of-fame` page,
      `useHallOfFame.ts`, and the 5 deprecated `lib/hall-of-fame-*.ts` shims
      (once import-checked clean).
- [ ] Rebuild Hall of Fame/Shame aggregation on the Phase 1 registry so it
      automatically covers all 5 current league instances (and future ones)
      instead of a hardcoded per-season map.
- [ ] Manager profile pages: surface full cross-league history using the Phase 1
      aggregation helper.
- [ ] Re-run `apps/web/src/scripts/audit-hall-of-fame.ts` against real
      multi-league data before season launch to catch data-completeness gaps.

## Phase 4 — Page inventory audit

Own phase, done before any redesign work starts.

- [ ] Enumerate every route/page in `apps/web/src/app`.
- [ ] Quick pass/fail per page on three axes: design (generic vs. on-brand),
      performance (rough load-time/waterfall check), tech debt (dead code,
      duplicated logic, stale patterns).
- [ ] Output a prioritized list — input to Phase 5, not a commitment to fix
      everything at once.

## Phase 5 — Page-by-page remediation

Driven by Phase 4's prioritized list.

- [ ] Design: wire the font gap (Avenir vs. loaded Montserrat/Geizer), add a
      semantic grade/win-loss token layer, reconcile the two team-color palettes
      — apply starting with Phase 4's highest-priority pages.
- [ ] Performance: root-cause the slow-loading pages Phase 4 flags (waterfalled
      fetches, missing caching/memoization, oversized payloads — diagnosed per
      page, not assumed).
- [ ] Tech debt: clean up per-page issues Phase 4 flags as pages are touched.

## Explicitly out of scope (for now)

- GitHub Issues as the tracking mechanism — this file is the tracker.
- Pre-deciding Phase 2's cross-league-simulator redesign approach (round-robin
  vs. bracket) — left open until that slice starts.
