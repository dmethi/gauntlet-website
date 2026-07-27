# Scratchpad

Ephemeral working memory, not an archive. Settled facts go to module cards
(`docs/modules/*.md`) or a promoted `ROADMAP.md` item — prune entries here as
they resolve rather than letting them accumulate.

## Active

- `CURRENT_LEAGUES`/`CURRENT_SEASON` flipped to 2026 (2026-07-27, follow-up to
  the entry below same day): fixed the 8 call sites that read `CURRENT_LEAGUES`
  or `LEAGUE_IDS.AFC`/`.NFC` but were actually about a fixed 2025
  archive/lookback view, pinning each to `getLeaguesForSeason('2025')` instead —
  `app/api/stats/route.ts` (only consumer: `archive/2025/stats`),
  `useWaiverAnalytics.ts` and `useTransactionAnalysisModel.ts` (only reachable
  via `stats-content.tsx`, itself only reachable via the archive page — verified
  `app/stats/page.tsx` is still the `SeasonPlaceholder` stub before relying on
  that), `lib/year-in-review/season-stats.ts` and
  `api/year-in-review/league-structure/route.ts` (feed `/year-in-review`, whose
  metadata literally says "Season 2025 in review" — the `[0]`/`[1]` Year-1
  indexing in `league-structure` is intentional historical logic, left alone,
  only the season pin changed), `seeding-simulator.ts`'s
  `runBothLeagueSimulations` and `team-score-sampler.ts`'s
  `fetchBothLeagueDistributions` (feeds/would-feed
  `/competition/playoff-scenarios`; the latter confirmed still has zero callers
  — kept the literal `'AFC'`/`'NFC'` string labels since `useLeagueSummary.ts`
  keys off those against frozen static JSON, only the league-ID lookup moved off
  `LEAGUE_IDS`), and `useClientCalculations.ts`'s `LEAGUE_IDS.AFC` fallback
  (dead code today, fixed for consistency, same pattern as
  `useLeagueOverviewClient.ts`). Also fixed two tests that broke on the flip
  because they read `CURRENT_LEAGUES` directly instead of pinning to 2025 like
  the code they exercise: `__tests__/integration/multi-league.test.ts`'s "has
  two distinct league IDs" (asserted `conference === 'AFC'/'NFC'` presence,
  which 2026's Legion I/II/III leagues don't have) and
  `useTransactionAnalysisModel.test.ts`'s "processes transactions from both
  leagues" (mocked fetch URLs off `CURRENT_LEAGUES` ids that no longer matched
  what the hook — now pinned to 2025 — actually requests).
  `pnpm type-check`/`lint`/`test` all clean (910/910, same as baseline); dev
  server smoke-tested on port 3411 — `/archive/2025/stats`,
  `/archive/2025/hall-of-fame`, `/year-in-review`, `/competition`,
  `/competition/playoff-scenarios`, `/league/overview`, `/start-sit` all 200, no
  new console/server errors; `/competition` now renders 3 "Legion" leagues, no
  leftover "Gauntlet AFC"/"NFC" strings. Untouched per the recap-pipeline scope:
  `lib/reports/recap/nodes/standings-node.ts`,
  `batch-matchup-narratives-node.ts`, `recap/orchestrator.ts`,
  `recap/integration.ts`, `api/cron/recap-report/runner.ts`, the one-off
  `scripts/*.ts` (including `collect-weekly-context.ts`,
  `generate-weekly-enrichment.ts` which still read `CURRENT_LEAGUES`),
  `useLeagueSummary.ts`/its static JSON, and
  `recap/tools/standings.ts`/`upcoming.ts`'s `{afc,nfc}` pick-out — all still
  hardcoded 2-league, as intended, cron/offline-only or explicitly frozen. Noted
  but not touched: `shared/utils/calculations/index.ts` imports `LEAGUE_IDS`
  from `@/lib/constants` but never references it in the file body (pre-existing
  dead import, unrelated to this flip — flagging in case a future cleanup wants
  it). `lib/constants.ts`'s `LEAGUE_IDS`/`DEFAULT_LEAGUE_ID` still have real
  consumers (the recap pipeline above) so were not removed.
- 2026 league IDs registered, `CURRENT_LEAGUES` flip deferred (2026-07-27): real
  Sleeper IDs for the 3 new 2026 leagues supplied by the user —
  `1387520086092312576` (Legion I: The Throne), `1387520168866885632` (Legion
  II: The Keep), `1387520236663615488` (Legion III: The Forge), all
  `previousLeagueId: null` (no 2025 lineage) — and registered in
  `LEAGUE_REGISTRY['2026']`. `CURRENT_LEAGUES`/`CURRENT_SEASON` deliberately
  **not** flipped to 2026 yet: `LEAGUE_IDS.AFC`/`.NFC` (in `lib/constants.ts`)
  look up by `conference === 'AFC'|'NFC'`, and 2026's leagues are labeled
  `'Legion I'|'II'|'III'` instead — flipping today would silently resolve
  `LEAGUE_IDS.AFC`/`.NFC` to `''` in every consumer that still hardcodes them as
  a 2-way split: `features/playoffs/simulations/seeding-simulator.ts` (feeds the
  live `/competition/playoff-scenarios` page's hardcoded AFC/NFC 2-button
  selector), `team-score-sampler.ts` (dead code, no callers, harmless),
  `lib/reports/recap/nodes/standings-node.ts` (downstream of
  `recap/tools/standings.ts`, already flagged in Phase 2 as 2-league-only, plus
  a hardcoded LLM prompt template literally saying "cover BOTH leagues (AFC and
  NFC)"), `lib/reports/recap/nodes/batch-matchup-narratives-node.ts` (hardcodes
  "12 matchups (6 AFC + 6 NFC)" — assumes exactly 6 matchups/league), and
  `hooks/useClientCalculations.ts`'s `leagueId || LEAGUE_IDS.AFC` fallback (same
  pattern already fixed in `useLeagueOverviewClient.ts` this session). Going one
  layer deeper, `SeedingTable.tsx`'s "Week 14 Preview" narrative section reads a
  **pre-generated static JSON** (`data/league-summaries.json`, built offline by
  `scripts/generate-league-summaries.ts`, itself hardcoded `{afc, nfc}` with an
  existing inline comment flagging the gap) — and since these are brand-new
  leagues, there's no real season data yet to regenerate that file against
  anyway. **User decision: scrap the N-league redesign of all of the above for
  now** rather than presolve for a feature that needs real season data to be
  meaningful — revisit once the season is underway and this can be
  auto-generated/verified against real data. `useLeagueOverviewClient.ts`'s
  default-league fallback was corrected to stay pinned to
  `getLeaguesForSeason ('2025')` (matching `CURRENT_LEAGUES`) rather than the
  premature 2026-first-with-2025-fallback logic from earlier in this session.
  `pnpm type-check`/`lint`/`test` (910/910) all clean.
- Pre-season roadmap seeding (2026-07-23): `ROADMAP.md` created, modeled on
  driveff's phased structure, covering the data-layer foundation, 3-league
  (5-league-history) migration, Hall of Fame consolidation, and a page inventory
  audit ahead of design/performance/tech-debt remediation. The prior
  "factory→diffusion seeding backlog" entries below are resolved
  (`docs/AGENTS.md` + `ENGINEERING_PRINCIPLES.md` exist, `ROADMAP.md` now
  seeded) and have been replaced by this.
- Phase 1 data layer foundation (2026-07-23): registry (`config/leagues.ts`),
  hardened Sleeper client (`unified-client.ts` + fixture replay), and the
  manager-history helper are done and tested (`pnpm test`/`type-check`/`lint`
  all clean, only pre-existing unrelated failures remain — see below).
  `standings.ts` migrated to registry iteration as the proof point.
- Phase 1 data layer foundation, continued (2026-07-23): the remaining 6
  recap-tools files (`league-overview.ts`, `upcoming.ts`, `composite-tools.ts`,
  `hall-of-shame.ts`, `power-rankings.ts`, `hall-of-fame-enhanced.ts`) are now
  migrated onto the same registry-iteration pattern as `standings.ts` —
  `getCurrentLeagues().map(...)` replacing every hardcoded
  `LEAGUE_IDS.AFC`/`.NFC` pair, external shapes unchanged. `pnpm test` (same 10
  pre-existing failures, none new), `type-check`, and `lint` all clean. Also
  migrated onto `sleeperClient`: `app/api/nfl-state/route.ts`,
  `app/api/team/[id]/route.ts`, `app/api/cron/live-odds/snapshot-runner.ts`, and
  the transaction/draft raw fetches in `lib/api-replacements.ts`. 4 of the
  originally-catalogued ~10 raw-fetch files were **not** migrated — each is a
  real blocker, not leftover work; see "Needs a closer look" below for
  `year-in-review/league-structure/route.ts`,
  `lib/year-in-review/season-stats.ts`, `reports/[season]/[week]/route.ts`, and
  the 3 client-side hooks + `lib/hooks.ts`'s `usePlayoffBracket`. Excluded as
  previously scoped: `hooks/useHallOfFame.ts` (dead, Phase 3 deletes it),
  `scripts/generate-week4-report.ts` (one-off script), and
  `__tests__/integration/data-flow.test.ts` (unrelated fetch-mock test). Also:
  `apps/web/src/scripts/capture-sleeper-fixtures.ts` exists but hasn't been run
  (needs live network access) — the `SLEEPER_FIXTURES=1` fixtures dir only has
  one hand-authored mechanism-test fixture, not real captured league data yet.
  An adversarial review of this same session's work caught a real bug:
  `unified-client.ts`'s fixture-replay path resolution used `__dirname`, which
  only worked under vitest (vite-node rewrites it) — under
  `next dev`/`next start` it resolves to the bundled output path and 404s on
  every fixture read, silently defeating the whole feature. Fixed to
  `process.cwd() + 'src/lib/sleeper/fixtures'` and verified against both vitest
  and a direct `tsx` run with `apps/web` as cwd (matching `next dev`'s cwd).
  Also fixed: `multi-league.test.ts:64`'s hardcoded `toHaveLength(2)` (plan
  explicitly called this out, was missed in the first pass) now asserts AFC/NFC
  presence instead of an exact count. Two lower-severity items from the review
  were left as comments rather than code changes (both pre-existing tradeoffs,
  not new bugs): `standings.ts`'s `league.conference as 'AFC'|'NFC'` cast will
  silently drop a future conference-less 3rd league's standings if Phase 2 adds
  one without touching this file; `manager-history.ts`'s per-week
  `fetchMatchups` calls are fully serial (no `Promise.all`), fine for today's
  2-league registry but worth batching before it's wired into any UI.

## Needs a closer look

- `apps/web/src/scripts/audit-hall-of-fame.ts` — re-run once Phase 1's league
  registry and the new season's leagues are wired in; it already flags
  data-completeness gaps (missing player stats/win-prob coverage) that are worth
  confirming aren't worse across 5 league instances than they were across 2.
- Page inventory (`ROADMAP.md` Phase 4) hasn't been run yet — "slow loading
  pages" is still an unverified, uninvestigated complaint until that audit
  produces real numbers.
- `app/api/reports/[season]/[week]/route.ts` is a ~1000-line legacy fallback
  path (`loadRecapReport` is tried first; this is what runs when that returns
  null) that inline-duplicates logic already migrated into
  `recap/tools/{standings,power-rankings,upcoming}.ts`. Not migrated onto the
  registry — needs a live/dead-code determination (is the fallback path ever
  actually hit in production, or could it be deleted in favor of the recap
  tools?) before a 1000-line rewrite is worth the risk.

## Session notes (2026-07-23, Phase 1 closeout: caching, conference type, client/server split)

- **Caching**: the plan going in ("drop `cache: 'no-store'`, Next.js defaults
  apply") was backwards for this repo — it's on **Next 14.1.0**, where an
  un-annotated `fetch()` defaults to `force-cache` (cached indefinitely), not
  `no-store` like Next 15+. Caught this before touching anything and asked the
  user to pick a path; went with the fuller "drop no-store + explicit opt-outs"
  option. Audited every `app/api/**/route.ts` that touches `sleeperClient`
  (directly or via `api-replacements.ts`/feature modules) and added
  `export const dynamic = 'force-dynamic'` to the ~20 that had no existing
  freshness override, so removing the client's hardcoded `no-store` doesn't
  silently cache live scores/matchups. `fetchFromSleeper` gained an optional
  `next?: {revalidate}` passthrough; `year-in-review/league-structure` and
  `lib/year-in-review/season-stats.ts` now go through `sleeperClient` with it,
  closing the last Phase 1 raw-fetch gap.
- **Conference type**: `packages/types/src/index.ts:46`'s `Team.conference`
  loosened to optional per plan, but the "~17 consumers to fix" premise from the
  prior driveff-comparison research was wrong — nothing in the repo actually
  imports `Team` from `@gauntlet/types`. All the `.conference` call sites found
  by grep (waiver-analysis, recap tools, constants.ts) read
  `config/leagues.ts`'s separate `League.conference`, which the roadmap itself
  already noted was optional. Lesson: a memory/roadmap claim naming a specific
  field's consumers should be re-verified by grep before acting on it, not
  assumed current — see the memory-system guidance about stale claims.
- **Client/server split**: split `unified-client.ts` into a new
  `browser-client.ts` (shared `BrowserSleeperClient` class, no `fs` import) +
  `unified-client.ts` (`extends` it, adds `SLEEPER_FIXTURES` replay via a
  `tryFixture` override). Zero import-path changes for existing server
  consumers. The prior scratchpad claim "confirmed no client component currently
  imports it" was **wrong** — a `next build` (not just `type-check`/`test`,
  which don't catch this) turned up 4 more files already pulling `fs/promises`
  into client bundles pre-session: `draft-data-fetcher.ts`
  (`app/draft/analysis`, `'use client'`),
  `features/hall-of-fame/hooks/useHallOfFameData.ts`
  (`app/hall-of-fame-enhanced`, `'use client'`),
  `shared/utils/stats/compose.ts`, and all 3
  `features/playoffs/simulations/*.ts` files. All 4 migrated onto
  `browser-client.ts`. Lesson: `next build` is the only reliable check for this
  class of bug — `tsc --noEmit` and vitest both stay green while the client
  bundle is silently broken.
- Verification for all three: `pnpm test`/`type-check`/`lint` clean (same
  4-file/10-test pre-existing failure baseline, same year-in-review func-style
  lint debt — no new failures), plus a full `next build` for the client/server
  split specifically.
- At commit time, discovered the repo's pre-commit hook runs a full-repo
  `turbo run lint` (not scoped to staged files), so the pre-existing
  year-in-review `func-style` debt (40 errors, all predating this session)
  blocked the commit outright — not just a "known debt, not this slice's job"
  item anymore once it's the thing failing your own commit. Fixed all 40
  (converted `function`/`export function`/`export async function` declarations
  to `const ... = (...) => {}` arrow expressions across 11 files) plus one
  unrelated `react-hooks/rules-of-hooks` violation in `client-layout.tsx` (a
  `useQuery` call after an early `return` for `/year-in-review` paths — fixed by
  hoisting the hook call above the early return and using
  `enabled: !pathname.startsWith('/year-in-review')` to preserve the original
  no-fetch-on-year-in-review behavior, not just silence the linter).
  `pnpm test`/`type-check`/`lint` all clean after.
- Test debt cleanup (2026-07-23), separate from Phase 1: fixed the 9
  pre-existing web failures noted above — `LeagueView`, `ScheduleAnalysis`, and
  `TrendsView` had assertions that drifted from the components they cover (stale
  heading text, ambiguous regex matches, a `teamTotal > 0` "no data yet"
  convention the "zero scores" test didn't account for);
  `useTransactionAnalysisModel` spied on `console.log` but `debugLog` actually
  calls `console.warn`. Also gave `packages/models` `--passWithNoTests` since it
  has no test files yet. `apps/web` now 876/876, `packages/models` passes with 0
  tests. `apps/server`'s failures are untouched — see below, separate scope.

## Random open threads

- 2026-07-23: RESOLVED — `apps/server`'s `historical-data.test.ts` (13 tests)
  and `snapshot-validator.test.ts` (10 tests) failures fixed. Root causes: (1)
  `historical-data.test.ts`'s `vi.mock('../../generated/prisma-historical')`
  resolved to a nonexistent `src/generated/` path (one `../` short of the real
  `apps/server/generated/prisma-historical`), so the mock never intercepted the
  real Prisma client and every call blew up on missing `DATABASE_URL`; fixed the
  mock path. (2) `snapshot-validator.test.ts`'s
  `vi.mock('@/lib/historical-data', ...)` used a different specifier than
  `snapshot-validator.ts`'s own `'./historical-data.js'` relative import —
  Vitest treated them as separate module records, so the mock silently never
  applied and real Prisma calls ran underneath; fixed by mocking the same
  relative specifier the module under test actually imports. (3)
  `hasSignificantChange` never compared `spread`/ `total` at all, even though
  they're median-based betting lines that can diverge from the mean-based
  `simulatedMean` projection under skewed live score distributions (confirmed in
  `apps/sim-engine/src/models/matchup.ts`) — added a >=1.0-point spread/total
  check as a real logic fix, not just a test edit. Also fixed two tests whose
  deltas were too small to cross the documented 10% projection threshold, and a
  stale `select` expectation in `getMatchupWinProbTimeSeries`'s test that
  predated `rosterAId`/`rosterBId` being added to the query. All 62
  `apps/server` tests, lint, and `tsc` build are clean.

## Blocked

- Phase 2's remaining "bump CURRENT_SEASON" item is now unblocked on IDs
  (2026-07-27: real league IDs supplied, registered in
  `LEAGUE_REGISTRY['2026']`) but still blocked on the N-league redesign of
  several hardcoded-to-2-leagues call sites — see the 2026-07-27 Active entry
  below for what's actually gating the `CURRENT_LEAGUES` flip.
- 2025 archive/2026 shell/owner-linkage slice (2026-07-23) landed
  (`/archive/2025`, `/managers/[ownerId]`, `LEAGUE_REGISTRY['2026']: []`)
  without real 2026 league IDs, per user decision. Same-day follow-up superseded
  the "primary nav still points at 2025" decision: the 5 primary nav pages
  (`/competition`, `/stats`, `/matchups`, `/hall-of-fame-enhanced`,
  `/draft/analysis`) were physically relocated to
  `/archive/2025/{competition,stats,matchups,hall-of-fame,draft-analysis}`, and
  the old top-level paths now render a shared `SeasonPlaceholder` component
  (`apps/web/src/components/season-placeholder.tsx`) instead — primary nav is
  now a 2026-default by construction, so the standalone `/2026` shell route was
  deleted as redundant. `app/stats/`'s support files (`stats-content.tsx`,
  `components/`, `constants/`, `utils/`, `types.ts`) deliberately stayed at
  their original path since they're imported externally by
  `features/transactions`/`features/stats`/`shared/utils` — only
  `stats/page.tsx` moved, with its one relative import fixed to
  `@/app/stats/stats-content`. `competition/reports/*` and
  `competition/playoff-scenarios` also deliberately stayed put (reachable via
  the moved competition page's own absolute links), to avoid touching the
  `generateStaticParams`-driven reports system. Follow-up once real 2026 IDs
  land: (1) register the 3 real leagues in `LEAGUE_REGISTRY['2026']`; (2)
  replace the 5 `SeasonPlaceholder` pages with real 2026 feature
  implementations.

## Next session

Start `ROADMAP.md` Phase 1 (data layer foundation) — it's the prerequisite for
both the 3-league migration and Hall of Fame consolidation, so it's the natural
first slice. See `ROADMAP.md` Phase 1's checklist for the concrete first steps
(Sleeper client boundary, league registry, replacing the scattered per-league
fetch pattern).

## Session notes (archive — superseded by Active above)

- 2026-06-25 — Scratchpad created as a seeding breadcrumb during the
  factory→diffusion migration. Seeding backlog (module cards, ROADMAP, testing
  sweep) is now complete as of this session's `ROADMAP.md` creation.
