# Scratchpad

Ephemeral working memory, not an archive. Committed work goes to Studio Linear,
uncommitted possibilities go to `docs/IDEAS.md`, and settled facts go to the
appropriate repository documentation. Prune entries as they resolve.

## Active

Modern War Room visual identity rework. The chrome/loader audit backlog and the
content-level design pass on Waiver/Transactions/Start-Sit are both closed out
(2026-07-28, commit `ddce119`). No active slice right now — see "Next session"
below for unblocked candidates.

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
  implementations — tracked in Studio Linear, not this item.

## Next session

No work should be selected from this file. Use Studio Linear for committed work
and `docs/IDEAS.md` for possibilities awaiting promotion.
