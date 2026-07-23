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
  `standings.ts` migrated to registry iteration as the proof point. Still open
  before Phase 1's checklist is fully done: migrate the remaining 6 recap-tools
  files (`league-overview.ts`, `upcoming.ts`, `composite-tools.ts`,
  `hall-of-shame.ts`, `power-rankings.ts`, `hall-of-fame-enhanced.ts`) onto the
  same registry-iteration pattern, and migrate the ~10 files still bypassing the
  client with raw `fetch('api.sleeper.app/...')` calls (API routes under
  `app/api/`, a few hooks, `lib/api-replacements.ts`, `lib/hooks.ts`,
  `lib/year-in-review/season-stats.ts`) — explicitly excluding
  `hooks/useHallOfFame.ts` (dead, Phase 3 deletes it),
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

## Random open threads

- Pre-existing, unrelated test failures on `main` as of 2026-07-23 (confirmed
  via `git stash` before Phase 1 changes — not caused by this work):
  `LeagueView.test.tsx` ("handles zero scores"), `ScheduleAnalysis.test.tsx` (3
  tests), `TrendsView.test.tsx` (5 tests), and
  `useTransactionAnalysisModel.test.ts` ("analyzes correct number of weeks").
  Worth a look, separate from Phase 1.

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
