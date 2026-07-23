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

- Nothing yet — will accumulate as Phase 1 work starts.

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
