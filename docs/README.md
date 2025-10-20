# Gauntlet Service Overview

## Product Intent
- High-stakes fantasy football companion that automates the league analysis and weekly recap reports the commissioner previously crafted manually.
- Two Sleeper leagues (AFC/NFC) form a unified 24-team experience; features surface cross-league insights while respecting league-specific identifiers.
- Built to practice enterprise-quality full-stack patterns and accelerate AI-assisted development without sacrificing maintainability.

## Architectural Shape
- **Monorepo (pnpm workspaces + Turborepo)** with three apps and five packages:
  - `apps/web` – Next.js 14 client/SSR app that drives UI, APIs, and cron-triggered workflows.
  - `apps/server` – Background jobs + database access for historical odds snapshots, shared as a package.
  - `apps/sim-engine` – Monte Carlo simulation engine for win probabilities.
  - `packages/*` – Shared types, utilities, domain models, tokens, and UI primitives.
- Feature-first organization inside the web app (`features/<name>` directories for hooks/components/utils; Next.js routes stay as thin composition shells).
- Shared type system lives in `@gauntlet/types`; all Sleeper/Gauntlet domain contracts flow from there.

## Data Sources & Flows
- **Sleeper API** – Primary source for real-time league data; consumed via unified client adapters.
- **Gauntlet historical DB** – Optional persistence for live win probability snapshots (accessed through `@gauntlet/server`).
- **Gemini AI** – Generates narrative content for recap reports (triggered via cron endpoints).
- **Precomputed static blobs** – Stored under `apps/web/data/` as interim scaffolding while features are refactored into loaders/services.

## AI Collaboration Heuristics
- Keep context modular: extract long-running scripts or dense data transforms into dedicated `services/` or `features/<domain>/utils/`.
- Maintain discipline around type coverage so AI can infer intent (`as const` for literals, `ReturnType<typeof>` for derived contracts).
- Codify heuristics in `.cursorrules`; keep this document authoritative for business intent and architectural guardrails.

## Testing & Quality Expectations
- Turborepo pipelines for `lint`, `type-check`, `test`; these should pass locally before feature work lands.
- Vitest powers unit/integration tests across apps/packages; Jest remains only in legacy packages (`packages/models`).
- Coverage thresholds configured in `apps/web` and `apps/sim-engine`; cron workflows should avoid I/O reliance for deterministic tests.

## Deployment & Operations
- Target deployment is Vercel for the web app (API routes + serverless cron entrypoints).
- Background jobs can run via GitHub Actions or external cron services (cron-job.org).
- Avoid filesystem writes at runtime on Vercel; use providers (S3, Supabase) when durable storage is required.

## Roadmap Themes
- Finish migrating mega-pages to feature modules with typed data loaders.
- Unify design system + rebrand assets, prioritizing mobile responsiveness.
- Expand analytics (variance models, playoff projections, external APIs) while keeping simulation logic isolated for possible Rust rewrite.
- Capture design decisions per module (see the README in each `apps/*` and `packages/*` directory).

