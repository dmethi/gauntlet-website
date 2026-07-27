# Scratchpad

Ephemeral working memory, not an archive. Settled facts go to module cards
(`docs/modules/*.md`) or a promoted `ROADMAP.md` item — prune entries here as
they resolve rather than letting them accumulate.

## Active

Nothing in flight right now.

## Needs a closer look

- `app/api/reports/[season]/[week]/route.ts` is a ~1000-line legacy fallback
  path (`loadRecapReport` is tried first; this is what runs when that returns
  null) that inline-duplicates logic already migrated into
  `recap/tools/{standings,power-rankings,upcoming}.ts`. Not migrated onto the
  registry — needs a live/dead-code determination (is the fallback path ever
  actually hit in production, or could it be deleted in favor of the recap
  tools?) before a 1000-line rewrite is worth the risk.

## Blocked

- 2025 archive/2026 shell/owner-linkage slice (2026-07-23) landed
  (`/archive/2025`, `/managers/[ownerId]`, `LEAGUE_REGISTRY['2026']: []`)
  without real 2026 league IDs, per user decision. Same-day follow-up relocated
  the 5 primary nav pages (`/competition`, `/stats`, `/matchups`,
  `/hall-of-fame-enhanced`, `/draft/analysis`) to
  `/archive/2025/{competition,stats,matchups,hall-of-fame,draft-analysis}`, with
  the old top-level paths now rendering a shared `SeasonPlaceholder` component
  (`apps/web/src/components/season-placeholder.tsx`) — primary nav is a
  2026-default by construction. `app/stats/`'s support files
  (`stats-content.tsx`, `components/`, `constants/`, `utils/`, `types.ts`)
  deliberately stayed at their original path (imported externally by
  `features/transactions`/`features/stats`/`shared/utils`);
  `competition/reports/*` and `competition/playoff-scenarios` also stayed put,
  reachable via the moved competition page's own absolute links. Real 2026
  league IDs landed 2026-07-27 and are registered in `LEAGUE_REGISTRY['2026']`;
  `/competition` was wired to real 2026 data the same day. Still open: replace
  the remaining 4 `SeasonPlaceholder` pages (`/stats`, `/matchups`,
  `/hall-of-fame-enhanced`, `/draft/analysis`) with real 2026 feature
  implementations — tracked under `ROADMAP.md` Phase 4/5, not this item.

## Next session

Phase 5 item 7 — design pass on the 22 live pages still on stock shadcn — is
next, but per user request (2026-07-27) it needs its own research/scoping pass
first (font wiring, semantic win/loss/grade token layer, reconciling the two
team-color palettes) rather than diving straight into page-by-page changes.
