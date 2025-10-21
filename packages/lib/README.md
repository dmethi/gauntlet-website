# @gauntlet/lib

Shared infrastructure utilities: report templating, validation helpers, retry
logic, and bridge code between apps.

## Scope

- `report/` – Markdown renderers, overlay builders, and storage adapters for
  recap reports.
- `utils.ts` – Generic numeric/stat helpers used across simulations and
  analytics.
- Re-export barrel used by `apps/web` and `apps/server` to avoid deep relative
  imports.

## Design Decisions

- **Side-effect free** – Modules expose pure functions where possible so they
  can run in Node, serverless, or browser environments.
- **Backwards compatibility** – Some exports mirror legacy names
  (`ManagerAnalytics`, etc.) while features migrate to new folders; mark
  deprecated symbols with comments as they are phased out.
- **Storage abstraction** – File-system storage lives here temporarily; plan to
  replace with provider-based implementations (S3/Supabase) behind the same
  interface.
- **TS-first** – Compiles with `tsc`; JavaScript stubs (`src/index.js`) exist
  only for consumers that still import `.js` paths.

## Commands

```bash
pnpm --filter @gauntlet/lib build   # tsc
pnpm --filter @gauntlet/lib dev     # tsc -w
```

Add concise comments above non-obvious exports so AI-assisted refactors
understand intent. For larger subsystems, supplement with a short README in the
relevant subdirectory.
