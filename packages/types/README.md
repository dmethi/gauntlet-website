# @gauntlet/types

Canonical TypeScript contracts for Sleeper data, Gauntlet simulations, and shared server responses.

## Purpose
- Provide a single source of truth for domain types (`SleeperLeague`, `MatchupSimulationResult`, `VarianceData`, etc.).
- Enable inference across the monorepo—import from this package instead of redefining interfaces.
- Serve as documentation for expected API shapes and data invariants.

## Design Decisions
- **Namespaced modules** – Files under `src/` group related domains (`sleeper`, `analytics`, `simulation`, `server`) so consumers can tree-shake what they need.
- **Literal helpers** – Unions and template literal types model composite IDs (`TeamKey`, `MatchupKey`) to prevent stringly-typed bugs.
- **JS entry point** – `index.ts` re-exports modules and compiles to CJS/ESM for compatibility with Vitest, Next.js, and Node scripts.
- **No runtime code** – Pure type definitions keep the package side-effect free and simple to consume in any environment.

## Commands
```bash
pnpm --filter @gauntlet/types build       # tsc --outDir dist
pnpm --filter @gauntlet/types type-check  # tsc --noEmit
pnpm --filter @gauntlet/types lint        # eslint . --ext .ts
```

When introducing new contracts, document them with inline JSDoc so AI helpers and IDEs can surface intent immediately.

