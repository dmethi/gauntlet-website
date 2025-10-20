# @gauntlet/web

Next.js 14 application that powers the Gauntlet UI, API routes, and cron-style automation. Organized around feature modules to keep business logic testable and AI-friendly.

## Domain Responsibilities
- Render cross-league dashboards, matchup insights, and historical analytics for two Sleeper leagues.
- Expose API routes for on-demand calculations (matchup simulations, reports, live odds) and cron entrypoints.
- Orchestrate recap report generation, including Gemini narrative synthesis and file persistence.

## Architectural Decisions
- **Feature-first layout** – `src/features/<domain>` contains components, hooks, and utils; Next.js routes in `src/app` should only compose feature primitives.
- **Shared utilities** – Cross-feature helpers live under `src/shared/`; infrastructure-specific code (API clients, storage) lives in `src/lib/`.
- **Data scaffolding** – Legacy static blobs remain in `src/data/` and `data/` as migration targets. New work should favor loaders/services that can be swapped for real APIs.
- **Testing surface** – Vitest with Testing Library; tests reside next to modules (`*.test.ts(x)`) and in `src/__tests__/integration` for multi-feature flows. TypeScript excludes these temporarily until typings are tightened.
- **Cron endpoints** – Routes under `src/app/api/cron/*` wrap reusable runners in `src/lib/reports` or `src/lib/api-replacements` to keep serverless handlers thin.

## Key Packages
- `@gauntlet/types` – Sleeper and Gauntlet domain contracts (use instead of local type definitions).
- `@gauntlet/server` – Historical snapshot access and logging utilities.
- `@gauntlet/sim-engine` – Monte Carlo simulations for win probability endpoints.
- `@gauntlet/ui` / `@gauntlet/tokens` – Shared UI primitives and design tokens.

## Commands
```bash
pnpm --filter @gauntlet/web dev          # Next.js dev server
pnpm --filter @gauntlet/web build        # Production build
pnpm --filter @gauntlet/web lint         # ESLint (flat config)
pnpm --filter @gauntlet/web type-check   # tsc --noEmit
pnpm --filter @gauntlet/web test         # Vitest run
pnpm --filter @gauntlet/web test:watch   # Vitest watch UI
```

## Current Refactor Focus
- Extract mega-pages (e.g., `app/league/draft/page.tsx`) into typed loaders + feature components.
- Replace synchronous file persistence with pluggable storage providers for recap reports.
- Normalize data loaders so feature modules rely on services instead of static blobs.
- Improve mobile layouts alongside the pending rebrand.

Document feature-level decisions (data contracts, performance tricks, heuristics) by adding short README snippets within each `features/<domain>` directory as migrations progress.

