# 🏈 Gauntlet Monorepo

Gauntlet is a fantasy football companion that automates league analysis, live win-probability simulations, and weekly recap reports across two Sleeper leagues (AFC/NFC). The project doubles as an enterprise hygiene sandbox: clean architecture, strict typing, and AI-friendly patterns are first-class goals.

## Orientation
- **Service charter & architectural intent**: `docs/README.md`
- **Development rules for AI collaborators**: `.cursorrules`
- **Module deep-dives**: see the README in each `apps/*` and `packages/*` directory

## Repository Layout
```
apps/
  web/         # Next.js 14 app (UI, API routes, cron entrypoints)
  server/      # Background jobs + Prisma access to historical DB
  sim-engine/  # Monte Carlo simulation engine (TypeScript)
packages/
  types/       # Canonical Sleeper & Gauntlet type system
  lib/         # Shared utilities and report tooling
  models/      # Legacy domain models (under evaluation)
  tokens/      # Design tokens (Tailwind preset, theme)
  ui/          # Shared UI primitives / Storybook playground
brand/         # Branding assets
scripts/       # One-off maintenance scripts (root scope)
docs/          # Service overview and architecture notes
```

## Getting Started
```bash
# install dependencies (turbo + pnpm workspaces)
pnpm install

# spin up the Next.js dev server
pnpm --filter @gauntlet/web dev

# run targeted scripts (see module READMEs for details)
pnpm lint
pnpm type-check
pnpm test
```

### Environment
- Node.js ≥ 18, pnpm ≥ 9
- Copy `.env.example` files per module (e.g. `apps/web/.env.example`)
- PostgreSQL is required only when running the historical snapshot jobs (`apps/server`)

## Quality Gates
- `pnpm lint` → ESLint flat configs per package
- `pnpm type-check` → Turborepo orchestrated `tsc --noEmit`
- `pnpm test` → Vitest (web, sim-engine, server) + Jest (legacy models)
- Coverage artifacts live locally (`coverage/` dirs) and are ignored by git

## Module Summaries
- [`apps/web`](apps/web/README.md) – Feature-based Next.js app powering UI, APIs, and report generation.
- [`apps/server`](apps/server/README.md) – Background job runner for live odds snapshots and DB utilities.
- [`apps/sim-engine`](apps/sim-engine/README.md) – Simulation library focused on performant Monte Carlo win probabilities.
- [`packages/types`](packages/types/README.md) – Source-of-truth TypeScript contracts for Sleeper and Gauntlet domains.
- [`packages/lib`](packages/lib/README.md) – Shared infrastructure helpers (report templating, validation, calculations).
- [`packages/models`](packages/models/README.md) – Legacy models; slated for consolidation with feature modules.
- [`packages/ui`](packages/ui/README.md) – Shared UI primitives and Storybook workspace.
- [`packages/tokens`](packages/tokens/README.md) – Design tokens and Tailwind preset.

## Development Philosophy
1. **Feature isolation** – Keep route files thin; real logic lives in `features/<domain>` with tests and typed inputs.
2. **Type-first** – Centralize domain types in `@gauntlet/types`; prefer inference helpers (`ReturnType`, `as const`) over `any`.
3. **AI-aware scaffolding** – Document design decisions, use small focused modules, and maintain consistent naming to help automations stay on track.
4. **Continuous cleanup** – Identify mega-files, lint suppressions, and data blobs during each feature cycle and capture accepted debt explicitly.

## Contributing
1. Fork or branch off `main`.
2. Keep the pipelines green (`pnpm lint && pnpm type-check && pnpm test`).
3. Document meaningful architectural choices in the relevant module README.
4. Open a PR describing scope, testing, and any accepted debt.

Questions or new ideas? Capture them in module READMEs or start a discussion in `docs/`.

