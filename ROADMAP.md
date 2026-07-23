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

- [ ] Single Sleeper API client boundary: one module all Sleeper HTTP calls go
      through, modeled on driveff's `src/lib/sleeper/client.ts`.
- [ ] League registry: a generic `season → League[]` structure (each league =
      Sleeper league ID + label + link to prior-season league ID), replacing
      `LEAGUE_IDS` / `ALL_GAUNTLET_LEAGUES`. Must support a variable number of
      leagues per season (2 for 2025, 3 for the new season, whatever comes
      after) — not an `{afc, nfc}` shape.
- [ ] Register known history explicitly: 2025's 2 leagues now; leave a clear
      slot for the new season's 3 league IDs (supplied once created — tracked in
      `SCRATCHPAD.md` as blocked).
- [ ] Replace the ~10+ scattered `Promise.all([fetch(AFC), fetch(NFC)])` call
      sites (recap tools, report nodes) with iteration over the registry.
- [ ] Manager-history aggregation helper: given a Sleeper `owner_id`, walk every
      registered league/season and return that manager's full roster/matchup
      history — the building block Hall of Fame and manager profile pages both
      need.
- [ ] Fixture-replay tests for Sleeper-dependent logic, matching driveff's
      `concept--sleeper-client-boundary.md` /
      `concept--sleeper-fixture-     replay.md` pattern.

## Phase 2 — 3-league (5-league-history) migration

Builds on Phase 1's registry.

- [ ] Remove the `'AFC' | 'NFC'` literal union; replace with the generic
      league-key type from the registry, across the ~15 files found in Phase 0.
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
