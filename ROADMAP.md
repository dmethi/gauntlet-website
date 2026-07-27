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

- [x] Remove the `'AFC' | 'NFC'` literal union; replace with `string` (a
      generic, non-exhaustive league label) across every real consumer found by
      a fresh grep (not the stale ~15-file estimate — `draft/analysis` had moved
      to `app/archive/2025/draft-analysis/` and turned out to have no
      literal-union type declarations at all, just runtime string checks, so it
      wasn't a consumer): `packages/types/src/index.ts` (`Team.conference`,
      confirmed zero real consumers), `config/leagues.ts` (`League.conference`,
      the source type), `features/playoffs/types.ts`, `ScenarioBuilder.tsx`,
      `useScenarioSummary.ts`, `useLeagueSummary.ts`, `seeding-simulator.ts`,
      `features/waiver-analysis/types.ts` + `cross-league.ts` (3-way
      `'AFC'|'NFC'|'EQUAL'` also loosened), `lib/reports/recap/types.ts`, and
      recap tools `standings.ts`, `hall-of-shame.ts`,
      `hall-of-fame-enhanced.ts`, `power-rankings.ts`, `upcoming.ts` — plus
      their now-redundant `as 'AFC' | 'NFC'` assertions. Deleted
      `packages/types/src/index.d.ts`/`index.js`, stray compiled build artifacts
      checked into `src/` (package.json's `types`/`main` point at
      `dist/src/...`; nothing imported from `src/`) that duplicated the old
      non-optional union and would have confused future greps.
      Type-signature-only change — zero runtime logic touched;
      `pnpm     type-check`/`lint`/`test` all pass (876/876, one pre-existing
      unseeded k-means test flake unrelated to this change, confirmed flaky on
      `main` too). **Flagged, not fixed here** (real 2-way runtime logic, not
      just typing — needs the N-league redesign, separate slice):
      `useLeagueSummary.ts` and `useScenarioSummary.ts` read static JSON shaped
      `{afc, nfc}`
      (`generate-league-summaries.ts`/`generate-scenario-summaries.ts`); all of
      `waiver-analysis/utils/cross-league.ts` is a two-argument comparison
      engine with hardcoded afc-/nfc-prefixed fields; `recap/tools/standings.ts`
      and `upcoming.ts` return `{afc, nfc}` and drop a 3rd league via
      `.find(l => l.conference === 'AFC'|'NFC')` (both now have an inline
      comment saying so). `hall-of-shame.ts`, `power-rankings.ts`, and
      `hall-of-fame-enhanced.ts` were re-checked and do **not** have this
      problem — they already return flat per-league arrays from Phase 1's
      registry iteration.
- [x] Retired the Week 14 Cross-League Championship feature rather than
      redesigning it for N leagues: the user confirmed it isn't running again
      this season, so an N-league redesign would have built support for a
      feature that won't be used. Deleted `cross-league-simulator.ts`,
      `CrossLeagueBattle.tsx`, `useCrossLeagueBattle.ts`, their
      `CrossLeaguePlayer`/`CrossLeagueMatchup`/`CrossLeagueBattleResults`/
      `CrossLeagueSimulationConfig` types, and the "Cross-League" tab on
      `/competition/playoff-scenarios` (now renders the Seeding view directly,
      no `Tabs` wrapper for a single remaining tab). The round-robin-vs-bracket
      question this item was tracking is moot now that the feature is gone.
- [x] Retired this item rather than fixing it: the hardcoded 2-column UI
      (`draft1`/`draft2`, `AFC`/`NFC` labels) no longer lives at
      `app/draft/analysis/page.tsx` — that route is now just a
      `SeasonPlaceholder` stub for the 2026 season with no draft data rendering
      at all. The actual 2-column code lives at
      `app/archive/2025/draft-analysis/page.tsx`, a frozen archive of the 2025
      season, which genuinely had exactly 2 leagues (AFC/NFC). Hardcoding that
      there is accurate history, not tech debt — the same reasoning as the
      Cross-League retirement above. Building an N-league draft analysis page
      for the live 2026 route is new feature work, not a fix to existing code;
      not scoped here.
- [x] Bump `CURRENT_SEASON`; wire in the new season's leagues once IDs are
      provided. Real IDs supplied and registered in `LEAGUE_REGISTRY['2026']`
      (`1387520086092312576` Legion I: The Throne, `1387520168866885632` Legion
      II: The Keep, `1387520236663615488` Legion III: The Forge; no 2025
      lineage). **Done (2026-07-27):** `CURRENT_LEAGUES`/`CURRENT_SEASON`
      flipped to 2026. Flipping was blocked on 8 call sites that read
      `CURRENT_LEAGUES`/`LEAGUE_IDS.AFC`/`.NFC` but were actually pinned in
      intent to the 2025 archive/lookback views (stats archive, waiver analysis,
      transaction analysis, year-in-review, playoff-scenarios) — all 8 now
      explicitly call `getLeaguesForSeason('2025')` instead of trusting
      "current". See `SCRATCHPAD.md`'s "Active" section (2026-07-27 entry) for
      the file-by-file list, the two tests that needed the same fix, and what
      was deliberately left on the old hardcoded AFC/NFC pattern (the
      recap/report-generation pipeline — cron/offline-only, out of scope, slated
      for a full rebuild borrowing from DriveFF per its own roadmap item — plus
      the one-off `scripts/*.ts` and the frozen `useLeagueSummary.ts` static
      JSON).
- [x] Landed multi-league safety tests (folds in `GITHUB_ISSUES.md`'s "Add
      Multi-League Safety Tests" item — see GITHUB_ISSUES.md:104-116 for its 4
      asks). Confirmed which flagged 2-way combination points from this phase's
      first checklist item are already N-league-safe vs. not before writing
      tests: `config/leagues.ts` (registry) and `recap/tools/power-rankings.ts`
      (composite `{leagueId, rosterId}` throughout, cross-league z-score
      combination happens only after per-league fetch) are safe;
      `recap/tools/standings.ts`/`upcoming.ts`'s final `{afc, nfc}` pick-out
      step, `useLeagueSummary.ts`/ `useScenarioSummary.ts` (static JSON shaped
      `{afc, nfc}`), and all of `waiver-analysis/utils/cross-league.ts`
      (two-positional-arg design) remain 2-league-only, unchanged here (still
      tracked as a separate N-league redesign). Added 4 new test suites against
      real production code, each verified to catch a real regression
      (mutation-tested: broke the composite-key match / merged leagues before
      grouping, confirmed the new test failed, then reverted):
      `config/leagues.test.ts` (season separation, composite-key/ID uniqueness
      across the real registry), `recap/tools/power-rankings.test.ts` and
      `recap/tools/standings.test.ts` (colliding `roster_id` fixtures across 2
      mocked leagues — each league fetched/computed separately, no cross-league
      leakage, `{afc, nfc}`/movement-tracking combination happens only at the
      presentation-layer step), `waiver-analysis/utils/cross-league.test.ts` (a
      `playerId` present in both leagues' transactions stays two separate stat
      blocks, never summed). The existing
      `__tests__/integration/multi-league.test.ts` was left as-is — it tests
      hand-rolled synthetic patterns, not real production functions, which is
      exactly the gap these 4 new suites close. 19 new tests, all green; full
      suite 895/896 (same pre-existing unseeded k-means flake noted above,
      unrelated to this change); `pnpm type-check`/`lint` clean.

## Phase 3 — Hall of Fame / Hall of Shame + manager profiles

- [x] Delete confirmed-dead code: a fresh repo-wide grep (app, scripts, recap
      tooling, tests) found only 3 of the claimed candidates with zero real
      consumers, so only those were deleted: the legacy
      `app/hall-of-fame/page.tsx` (nothing linked to it — sidebar.tsx only links
      `/hall-of-fame-enhanced`; the separate
      `app/archive/2025/hall-of-fame/page.tsx` uses `useHallOfFameEnhanced` +
      `features/hall-of-fame/utils`, not this page), `hooks/useHallOfFame.ts`
      (only consumer was the deleted page), and `lib/hall-of-fame-categories.ts`
      (zero references anywhere). The other 4 `lib/hall-of-fame-*.ts` "shims" —
      `hall-of-fame-aggregations.ts`, `hall-of-fame-calculations.ts`,
      `hall-of-fame-data-service.ts`, `hall-of-fame-expanded-categories.ts` —
      are NOT dead: they're imported by
      `apps/web/src/scripts/audit-hall-of-fame.ts`, which this same Phase 3 (see
      item below) explicitly wants re-run later. Left in place until that audit
      script is rebuilt on the Phase 1 registry or retired. `pnpm test` /
      `type-check` / `lint` all pass after the deletion.
- [x] Rebuild Hall of Fame/Shame aggregation on the Phase 1 registry so it
      automatically covers all currently-registered league instances (and future
      ones) instead of a hardcoded per-season map. Turned out to already be
      done: Phase 1's `1980825` replaced `ALL_GAUNTLET_LEAGUES`/`LEAGUE_IDS` in
      `hooks/useHallOfFameData.ts`'s `getAllHistoricalMatchups` with
      `getAllSeasons`/`getLeaguesForSeason` iteration over `config/leagues.ts`,
      and `df78957`/`1c11218` closed the remaining gaps (browser-safe client
      import, dynamic "most recent played season" detection instead of a
      hardcoded `season === '2025'` check). Verified both real consumers still
      resolve through this same registry-backed path: the recap tool
      (`lib/reports/recap/tools/hall-of-fame-enhanced.ts`, dynamic-imports
      `hallOfFameDataService`) and `hooks/useHallOfFameEnhanced.ts` (imports the
      same service; its only page consumer,
      `app/archive/2025/hall-of-fame/page.tsx`, is the archived 2025 recap — the
      live `/hall-of-fame-enhanced` route currently renders a
      `SeasonPlaceholder`, not this data path, pending the 2026 season). What
      was actually missing and got added here: `hooks/useHallOfFameData.test.ts`
      previously exercised `getAllHistoricalMatchups` against the real, unmocked
      `config/leagues.ts` registry (implicitly just today's 2-league 2025
      season), so it couldn't catch a regression back to a hardcoded league
      count. Added a `vi.mock('@/config/leagues', ...)` fixture with 4 seasons
      of varying league counts (0, 1, 3, 2) and 3 new tests asserting
      aggregation walks every league in every season regardless of count, that
      excluding "current" only drops the most-recently-registered non-empty
      season (not just season `'2025'` by name), and that a zero-league season
      doesn't error. `pnpm test` (899/899), `type-check`, and `lint` all pass.
- [x] Manager profile pages: surface full cross-league history using the Phase 1
      aggregation helper. Turned out to already be substantially done:
      `lib/leagues/manager-history.ts`'s `getManagerHistory` already walked
      every registered season/league for a given `owner_id`, and
      `app/managers/[ownerId]/page.tsx` already rendered it (career record, win
      %, points for/against, season-by-season table), linked from
      `app/team/[id]/page.tsx:216-221`. What was actually missing/broken: -
      **Real bug, fixed**: `manager-history.ts:18` defined a local
      `REGULAR_SEASON_WEEKS = 17` that disagreed with the real constant in
      `lib/constants.ts` (`14`) and, unlike Hall of Fame's
      `useHallOfFameData.ts` (which calls
      `resolveCompletedWeeks(league,       nflState)` per league), had no
      awareness of each league's `playoff_week_start` or in-progress-season
      state. With 17 as the default, playoff-week matchups would have been
      counted as part of the regular-season win/loss record. Fixed by adopting
      `resolveCompletedWeeks` (from `shared/utils/season-weeks.ts`) as the
      default per-league week count — `getManagerHistory` now fetches each
      matched league's `SleeperLeague` + `NFLState` (via two new
      `SleeperHistoryClient` methods, `fetchLeague`/`fetchNFLState`, backed by
      the existing `UnifiedSleeperClient`) and calls `resolveCompletedWeeks` per
      league, only when no explicit `weeksPerLeagueOverride` is passed.
      Confirmed Sleeper's `/league/{id}/matchups/{week}` returns `[]` for weeks
      not yet played (not an error), so `computeSeasonRecord`'s
      `if (!team) continue` already handles out-of-range weeks safely — no
      additional guard needed. Added a regression test
      (`manager-history.test.ts`: "without an override, stops at each league's
      playoff cutoff via `resolveCompletedWeeks`") asserting a
      `playoff_week_start: 15` league stops at week 14 and never fetches
      week 15. - **Missing test coverage, added**:
      `app/managers/[ownerId]/page.tsx` had no test at all (only the helper was
      tested). Added `app/managers/[ownerId]/page.test.tsx` (3 tests: renders
      career record + season table for a known manager, resolves a
      Promise-wrapped `params` object, renders the not-found state for an
      unregistered owner). - **Gaps identified but deliberately left open**: (1)
      no browse/index page listing all managers — the only discovery path is the
      deep link from a team page; building an index means enumerating distinct
      `owner_id`s across every registered league/season, which is new scope
      beyond wiring up the existing helper/page, so it's not done here. (2) Hall
      of Fame records don't link manager names to `/managers/[ownerId]` — the
      only real consumer with a live route, `hooks/useHallOfFameEnhanced.ts`, is
      currently only rendered by the archived
      `app/archive/2025/hall-of-fame/page.tsx` (a `'use client'` page still on
      the old hardcoded `LEAGUE_IDS`, not the Phase 1 registry); the live
      `/hall-of-fame-enhanced` route renders a `SeasonPlaceholder` and doesn't
      reach this code path yet. Linking names there is deferred until that page
      is un-archived/rebuilt on the registry, per the existing Phase 3
      audit-script item above. `pnpm test` (903/903, up from 899), `type-check`,
      and `lint` all pass.
- [ ] Design pass on `app/managers/[ownerId]/page.tsx` — it currently renders
      with generic card/table markup (plain `border-border`/`bg-card` boxes, a
      bare `<table>` for season history), no visual distinction between
      seasons/leagues, and no per-league branding (AFC vs. NFC colors, league
      logos). Candidate improvements: a proper header/hero treating the manager
      like a real profile (avatar, tenure, standout stat), a season-by-season
      view that reads as a timeline/history rather than a spreadsheet row,
      visual highlighting of best/worst seasons, and a browse/index entry point
      (see the deferred gap noted above) so the page is discoverable outside the
      team-page deep link. Should be sequenced with — or folded into — Phase
      4/5's page-by-page redesign pass rather than done in isolation, since it
      needs the same font/token/palette decisions Phase 5 is meant to settle.
- [ ] Re-run `apps/web/src/scripts/audit-hall-of-fame.ts` against real
      multi-league data before season launch to catch data-completeness gaps.

## Phase 4 — Page inventory audit

Own phase, done before any redesign work starts (2026-07-24). Audited via 4
parallel read-only passes over every `page.tsx`/`page.ts` under
`apps/web/src/app` (`api/` routes skipped, per this phase's scope). No code
changed in this phase.

- [x] Enumerated every route: 35 pages total. Status split: - **Live** (22):
      `page.tsx` (root redirect), `competition/playoff-scenarios`,
      `competition/preview/2025/week-3`, `competition/reports`,
      `competition/reports/[season]/[slug]`, `competition/reports/2025/[slug]`,
      `competition/reports/2025/week-1..4` (4 routes), `live`,
      `matchup/[matchupId]`, `matchups/[leagueId]/[week]/[matchupId]`,
      `start-sit`, `team/[id]`, `team/[id]/stats`, `league/draft` (broken, see
      below), `league/overview`, `league/transactions`, `managers/[ownerId]`,
      `year-in-review`, `year-in-review/2026-rules`. - **Placeholder** (5, all
      render `<SeasonPlaceholder>` gating on the un-started 2026 season):
      `competition`, `stats`, `matchups`, `draft/analysis`,
      `hall-of-fame-enhanced`. `competition` is the highest-visibility one — the
      root `/` redirects straight into it, so the entire app's landing
      experience is currently a stub. - **Archived** (6, linked from
      `sidebar.tsx`'s "2025 Archive" item): `archive/2025`,
      `archive/2025/competition`, `archive/2025/draft-analysis`,
      `archive/2025/hall-of-fame`, `archive/2025/matchups`,
      `archive/2025/stats`. - **Unlinked / dev-only** (2, reachable at their URL
      but absent from `sidebar.tsx`'s nav list — Competition, Stats Hub,
      Matchups, Hall of Fame, Draft Analysis, Year in Review, 2025 Archive is
      the full nav): `charts`, `playground`. Both are component/data scaffolding
      sitting directly in the shipped `app/` route tree with no route-group
      isolation or env-gate — publicly reachable in production despite being
      unlinked.
- [x] Design/performance/tech-debt pass-fail audit, one pass per page (findings
      below are the significant ones — see Phase 0 for the shared root causes:
      unloaded `--font-avenir`, no semantic win/loss/grade token layer, two
      uncoordinated team-color palettes): - **Design**: on-brand (real
      `font-geizer`/gold/crimson, not just a stray accent link) on only 6 of 35
      pages: `year-in-review/page.tsx`, `year-in-review/2026-rules/page.tsx`,
      `archive/2025/page.tsx`, `competition/reports/[season]/[slug]` +
      `2025/[slug]` (both delegate to `RecapReportView.tsx`, which uses
      `font-geizer` at lines 61, 97, 219, 355, 427, 624), and
      `playground/page.tsx` (ironic — the one page nobody sees is the most
      faithful to the brand system). Every other live page is stock shadcn
      "new-york/stone" (`bg-card`/`border-border`, default
      `Table`/`Badge`/`Card`) with at best a stray `text-gauntlet-crimson` link
      color. `live/page.tsx` is the least on-brand page found — zero
      crimson/gold/Geizer, pure Tailwind yellow/blue/gray. Color coding is
      inconsistent even within the brand palette: AFC/NFC toggle buttons on
      `competition/playoff-scenarios/page.tsx:89,97` hardcode raw
      `bg-red-500`/`bg-blue-500` (a _third_ uncoordinated color source alongside
      `brand/team-colors.json` and `tailwind.config.js`'s `viz.team`), and
      AFC=red/NFC=blue on `archive/2025/draft-analysis/page.tsx:852,957` is
      inverted vs. AFC=blue/NFC=red on `archive/2025/hall-of-fame/page.tsx`'s
      `getLeagueBadgeColor` (lines 81-85). - **Performance**: the widespread
      "slow page loads" complaint from Phase 0 is now root-caused for at least
      one page: `features/start-sit/utils/analysis.ts:484-498` (backing
      `start-sit/page.tsx`) awaits leagues and weeks in nested sequential loops
      instead of flattening into one `Promise.all` — ~34 sequential round trips
      (2 leagues × up to 17 weeks) for a single page load, matching the page's
      own "This usually takes 15-30 seconds" disclaimer
      (`start-sit/page.tsx:73`). The same sequential-`await`-in-a-loop pattern
      recurs independently in `league/transactions/page.tsx:62-77` (manual
      pagination loop, no `Promise.all`), `archive/2025/matchups/page.tsx:75-84`
      (per-league `fetch` in a `for...of`), and
      `archive/2025/draft-analysis/page.tsx:230-232` (3 independent precompute
      fetches awaited one at a time). Separately, several "archived" pages do
      live client fetches instead of static rendering for data that can never
      change again: `competition/preview/2025/week-3/page.tsx:156-166`
      explicitly sets `cache: 'no-store'`; `archive/2025/stats/page.tsx:50` also
      uses `cache: 'no-store'` and then hand-rolls a buggy `sessionStorage`
      cache workaround (lines 25-46);
      `archive/2025/competition/page.tsx:238-246` fetches live Sleeper data via
      `useLeagueOverviewClient` for a finished season; `archive/2025/matchups`
      even calls the live `/api/nfl-state` endpoint (lines 169-192) to guess
      "the current NFL week" for a season that's over, falling back to a
      hardcoded `week 2` if that fails. `archive/2025/page.tsx` (server
      component, static registry read, zero client fetches) is the model the
      other 5 archive pages should follow instead. - **Tech debt**: one page is
      outright broken — `league/draft/page.tsx:92` fetches `/api/league/draft`
      with no `leagueId` param anywhere in the file, but
      `api/league/draft/route.ts:9-13` 400s without one; even supplied, the
      route's response shape (`{draft, dbQueries, dataSource}`) doesn't match
      what the page expects (`{league, draft, picks}`) — this page can never
      render real content. Two duplicate-route pairs found:
      `matchup/[matchupId]/page.tsx` vs.
      `matchups/[leagueId]/[week]/[matchupId]/page.tsx` (same matchup-detail
      feature, two competing implementations — the `matchups/[leagueId]/...` one
      is the better candidate to keep, it uses brand fonts and batches its
      fetch); `competition/reports/2025/[slug]/page.tsx` vs. the generic
      `competition/reports/[season]/[slug]/page.tsx` (near-identical code,
      `2025/[slug]` also lacks `generateStaticParams` and has a leftover
      module-scope `console.log` at line 8) — and both are shadowed for weeks
      1-4 by the literal `competition/reports/2025/week-1..4` routes anyway, so
      the `[slug]` machinery only serves week 5+. The `getConference()` helper
      is independently reimplemented 5 times across
      `competition/preview/2025/week-3/page.tsx:90-92` and all 4
      `competition/reports/2025/week-*/page.tsx` files. Hardcoded league IDs
      bypassing the Phase 1 registry (`config/leagues.ts`) recur across the live
      surface, not just archive pages: `matchup/[matchupId]/page.tsx:305` and
      `matchups/[leagueId]/[week]/[matchupId]/page.tsx:137` (literal
      `'1263744209295245312'`/name lookup), `charts/page.tsx:6` (a _third_,
      stale sample league ID that doesn't match either real league), and
      `hooks/useLeagueOverviewClient.ts:109` (`leagueId || LEAGUE_IDS.AFC`,
      feeding both `league/overview` and `league/transactions`) — this last one
      is a landmine, since `LEAGUE_IDS` is a mutable "current season" alias that
      will silently repoint once 2026 leagues are registered. Same landmine
      independently confirmed in `archive/2025/hall-of-fame/page.tsx:37` and
      `archive/2025/stats/page.tsx:6`, both of which resolve "2025" through the
      mutable `CURRENT_LEAGUES`/`LEAGUE_IDS` alias instead of an explicit
      `getLeaguesForSeason('2025')` call — an archive page that will mislabel
      2025 data once the season rolls over. AFC/NFC roster-ID offset math
      (`id >= 2000 ? id-2000 : id >= 1000 ? id-1000 : id`) is copy-pasted
      verbatim in `team/[id]/page.tsx:682-687` and
      `league/overview/page.tsx:384-392` instead of a shared helper.
      `archive/2025/hall-of-fame/page.tsx` was also confirmed to be genuinely
      stale, not just unstyled: its season dropdown only offers 2023/2024 (never
      2025), and it's the old _all-time_ Hall of Fame view dropped in verbatim
      under the `/archive/2025` route, now orphaned since the live
      `/hall-of-fame-enhanced` page it used to back was replaced by
      `SeasonPlaceholder` — a dead-code risk if anyone assumes
      `useHallOfFameEnhanced`/`features/hall-of-fame/utils` are unused.
- [x] Prioritized list for Phase 5 (impact-ordered, not a fix commitment): 1.
      **Fix `league/draft/page.tsx`** — currently broken for every user who
      reaches it (missing `leagueId` param, mismatched API response shape).
      Correctness bug, not a style/perf nit. 2. **Un-stub
      `competition/page.tsx`** — the app's landing page (root `/` redirects
      here) is a placeholder; every other finding is invisible to a new visitor
      until this ships. 3. **Root-cause fix for `start-sit`'s sequential
      per-league/per-week fetch loop** (`analysis.ts:484-498`) — the one page
      with concretely diagnosed, self-reported ("15-30 seconds") slowness from
      Phase 0's "widespread complaint." 4. **Consolidate the duplicate
      matchup-detail routes** (`matchup/[matchupId]` vs.
      `matchups/[leagueId]/[week]/[matchupId]`) and the duplicate reports routes
      (`reports/2025/[slug]` vs. `reports/[season]/[slug]`) — two maintenance
      burdens masquerading as one feature each. 5. **Load `--font-avenir` (or
      drop the class references) and land a semantic win/loss/grade token
      layer** — blocks real design fixes on every page in the "generic shadcn"
      bucket (29 of 35) rather than doing it piecemeal per page. 6. **Fix the
      `LEAGUE_IDS`/`CURRENT_LEAGUES` mutable-alias landmine** in
      `useLeagueOverviewClient.ts:109`, `archive/2025/hall-of-fame/page.tsx`,
      and `archive/2025/stats/page.tsx` before the 2026 season is registered —
      currently latent, will silently corrupt 2025 archive data the moment Phase
      2's "bump `CURRENT_SEASON`" item lands. 7. **Design pass on the 22 live,
      non-placeholder pages currently on stock shadcn** — start with the
      highest-traffic ones (`team/[id]`, `league/overview`,
      `matchups/[leagueId]/...`, `managers/[ownerId]`, already tracked in
      Phase 3) rather than the archive pages, which are lower-traffic and, per
      the archive-specific findings above, have a correctness problem (live data
      leaking into frozen pages) that should be fixed before or instead of
      restyling. 8. **Decide the fate of `charts`/`playground`** — remove,
      env-gate, or formally adopt as an internal design-system preview route;
      currently shipping unlinked to production with no policy either way.
- [x] Prioritized-list item 6 fixed (2026-07-27): the two `archive/2025/*` pages
      (`hall-of-fame/page.tsx`, `stats/page.tsx`) now resolve their league IDs
      via an explicit `getLeaguesForSeason('2025')` call, pinned module-scope,
      instead of aliasing the mutable `LEAGUE_IDS`/`CURRENT_LEAGUES` "current
      season" constants — immune to whatever season `config/leagues.ts` treats
      as current going forward. `useLeagueOverviewClient.ts:109`'s fallback
      (used when no `leagueId` is passed, feeding both `league/overview` and
      `league/transactions`) now reads `getLeaguesForSeason('2026')`, per user
      decision to treat 2026 as current now rather than wait for real league IDs
      — with a **temporary** fallback to `getLeaguesForSeason('2025')` since
      `LEAGUE_REGISTRY['2026']` is still `[]` (blocked, see `SCRATCHPAD.md`), so
      the live pages don't break today. That fallback must be deleted once real
      2026 league IDs land. `pnpm type-check`, `pnpm lint`, and `pnpm test`
      (910/910) all pass; dev server smoke-tested on all three routes (200s).
- [x] Prioritized-list item 8 fixed (2026-07-27): deleted `app/charts/` outright
      — a scratch prototype pointed at a stale sample league ID
      (`1049321550490456064`, not a real Gauntlet league) and calling an
      `/api/charts/[leagueId]/[week]` endpoint that no longer exists, so it was
      already broken in production. `app/playground/` (design-token/component
      preview) has real ongoing value, so it stays but now calls Next's
      `notFound()` when `NODE_ENV === 'production'`, making it dev-only instead
      of publicly reachable. Per user decision.

## Phase 5 — Page-by-page remediation

Driven by Phase 4's prioritized list.

- [ ] Design: wire the font gap (Avenir vs. loaded Montserrat/Geizer), add a
      semantic grade/win-loss token layer, reconcile the two team-color palettes
      — apply starting with Phase 4's highest-priority pages.
- [ ] Performance: root-cause the slow-loading pages Phase 4 flags (waterfalled
      fetches, missing caching/memoization, oversized payloads — diagnosed per
      page, not assumed).
- [ ] Tech debt: clean up per-page issues Phase 4 flags as pages are touched.
  - [x] Consolidated the duplicate matchup-detail routes and duplicate reports
        routes (Phase 4 prioritized-list item 4, 2026-07-27). Deleted
        `matchup/[matchupId]/page.tsx`; `matchup-link.tsx` now links straight to
        `matchups/[leagueId]/[week]/[matchupId]`, with `next.config.js`
        permanent redirects covering old bookmarked `/matchup/:matchupId` URLs
        (with/without `leagueId`/`week` query params, defaulting to the Gauntlet
        AFC league and week 1 to match the old route's own defaults). Also
        deleted `competition/reports/2025/[slug]/page.tsx` — no redirect needed,
        since `competition/reports/[season]/[slug]/page.tsx` already generically
        handles any season and Next's static-segment-over-dynamic-segment
        resolution means `/competition/reports/2025/week-N` URLs are unchanged.
        `tsc --noEmit`, lint, and all 910 `apps/web` vitest tests clean.

## Explicitly out of scope (for now)

- GitHub Issues as the tracking mechanism — this file is the tracker.
- Pre-deciding Phase 2's cross-league-simulator redesign approach (round-robin
  vs. bracket) — left open until that slice starts.
