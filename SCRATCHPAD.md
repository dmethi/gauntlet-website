# Scratchpad

Ephemeral working memory, not an archive. Settled facts go to module cards
(`docs/modules/*.md`) or a promoted `ROADMAP.md` item — prune entries here as
they resolve rather than letting them accumulate.

## Active

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

- `cross-league-simulator.ts`'s redesign approach for N leagues — round-robin
  vs. seeded bracket — deliberately left open in `ROADMAP.md` Phase 2, decide
  when that slice starts.
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

- 2026-07-23: `apps/server`'s `historical-data.test.ts` (13 tests) and
  `snapshot-validator.test.ts` (10 tests) are failing — looks like a Prisma-mock
  setup problem, not investigated yet. Separate and larger than the web-suite
  debt above; needs its own scoping pass before starting.

## Blocked

- Phase 2 (3-league migration) is blocked on the 3 new Sleeper league IDs for
  the upcoming season — to be supplied once those leagues are created. Phase 1
  (data layer foundation) is NOT blocked on this and should start first
  regardless.

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
