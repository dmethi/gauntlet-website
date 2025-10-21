# @gauntlet/models

Legacy domain models for league management and scoring. These abstractions
pre-date the feature-first refactor in `apps/web` and are gradually being
evaluated for consolidation or retirement.

## Current Contents

- `src/league.ts` – High-level league orchestration helpers (roster lookups,
  standings calculations).
- `src/index.ts` – Barrel exports for consumers that still depend on the legacy
  API.

## Design Considerations

- **Migration status** – Many responsibilities are moving into
  `apps/web/src/features/*`; before adding new code here, confirm the target
  architecture in `docs/README.md`.
- **Testing** – Jest is configured for historical reasons; new code should
  prefer Vitest unless there is a blocking dependency.
- **Dependencies** – Leans on `@gauntlet/types` and `@gauntlet/lib`; keep
  interfaces aligned so consumers can swap in feature modules.

## Commands

```bash
pnpm --filter @gauntlet/models build       # tsc
pnpm --filter @gauntlet/models type-check  # tsc --noEmit
pnpm --filter @gauntlet/models test        # jest
```

Document any new patterns or migration decisions directly in this README so it’s
clear how the package fits into the evolving architecture.
