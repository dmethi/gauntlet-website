# The Gauntlet – Technical Overview and Code Generation Rules

This document is the authoritative technical overview and set of rules for generating code in this repository. All assistant responses and code edits must align with the conventions and constraints defined here.

## Monorepo and Tooling

- Monorepo: pnpm workspaces, Turbo for orchestration
- TypeScript everywhere; ESM modules only (no CommonJS)
- Workspaces: `apps/web`, `apps/server`, `apps/sim-engine`, `packages/*`
- CI/build tasks (Turbo): `build`, `dev`, `lint`, `type-check`, `test`, `clean`

## High-level Architecture

- Backend API: Express + TypeScript, Prisma ORM (PostgreSQL)
- Frontend: Next.js 14 App Router + Tailwind + Recharts
- Simulation: `@gauntlet/sim-engine` Monte Carlo engine; integrates with Prisma variance data when available
- Shared packages: `@gauntlet/types`, `@gauntlet/models`, `@gauntlet/lib`

### Data Flow (runtime)

Sleeper/ingestion → Prisma/Postgres → API routes (Express/Next) → Next pages/components → Charts/UX.

### Directory Overview

- `apps/server` – Express API, Prisma schema, ingestion/analysis scripts
- `apps/sim-engine` – Simulation models and algorithms (exported as workspace package)
- `apps/web` – Next.js app: pages, components, API routes (uses generated Prisma client for Next)
- `packages/types` – Domain and API TypeScript interfaces
- `packages/models` – Business/domain logic (e.g., `LeagueModel`)
- `packages/lib` – General-purpose utilities and small stat helpers

## Backend (apps/server)

- Entry: `src/index.ts`; bind on port 3001
- Important: add JSON body parsing for JSON endpoints:
  ```ts
  import express from 'express';
  const app = express();
  app.use(express.json());
  ```
- Route modules live under `src/routes/` as `express.Router` modules; mount in `index.ts` under `/api/<feature>`
- Prisma client: prefer the singleton in `src/lib/prisma.ts`
- Ingestion/analysis: scripts under `src/scripts/**` for historical data, metrics, variance models
- Example soon-to-be-mounted endpoint: `src/routes/calculate-win-prob.ts` (calls `@gauntlet/sim-engine`)

### Prisma Schema Highlights

- Sleeper-aligned models: `User`, `League`, `Roster`, `Matchup`, `Transaction`, `TradedPick`, `Draft`, `DraftPick`, `Player`, `PlayerStats`
- Analytics models: `WeeklyMetrics`, `PositionVariance`, `PlayerVariance`, `ProjectionError`
- Core uniqueness and indexes:
  - `Matchup`: unique `(leagueId, week, rosterId)`
  - `PlayerStats`: unique `(playerId, week, season, statsType)`
  - `PositionVariance`: unique `(position, season)`
  - `PlayerVariance`: unique `(playerId, season)`
  - `ProjectionError`: unique `(playerId, week, season)`

## Simulation Engine (apps/sim-engine)

- Exports:
  - `simulateMatchupProbability(team1, team2, iterations?, gameProgress?)`
  - `Lineup` and `LineupPlayer` models: required positions `qb`, `rb1`, `rb2`, `wr1`, `wr2`, `wr3`, `te`, `flex`
- Variance logic:
  - Pulls variance from Prisma `PositionVariance`, `PlayerVariance`, and `ProjectionError`
  - Falls back to conservative distributions when data is sparse
- Output includes win percentages, score distributions (mean/median/p10/p90), and implied odds (moneylines, spread, total)

## Frontend (apps/web)

- Next.js 14 with App Router; Tailwind; charts via `recharts`
- API routes under `src/app/api/**/route.ts` use `NextResponse`
- Uses generated Prisma client in `src/generated/prisma` (checked in); keep in sync with server schema when needed
- Visualization example: `TeamPerformanceChart`, `TeamExpectedPerformanceChart`

## Shared Packages

- `@gauntlet/types` – Domain types: `Player`, `Team`, `League`, scoring systems, simulation results
- `@gauntlet/models` – Domain logic, e.g., `LeagueModel` (standings, playoffs, week advancement)
- `@gauntlet/lib` – Utilities: formatting, percentages, `calculateStdDev`, `calculateNormalizedError`, `getCurrentWeek`, etc.

## Season and Week Handling

- Use shared helper for week computations: `@gauntlet/lib/getCurrentWeek`
- Maintain a single season source of truth in configuration; avoid hard-coded season strings in new code

## API Conventions

- Express endpoints:
  - JSON body parsing enabled
  - `try/catch` with clear 4xx/5xx responses; do not expose stack traces
  - Prefer `@gauntlet/types` for request/response shapes
  - Keep simulations to moderate iterations in HTTP context (e.g., 1000) to avoid blocking
- Next API routes:
  - Use the generated Prisma client: `import { PrismaClient } from '@/generated/prisma'`
  - Structure responses with minimal shape transformations (leave aggregation to services when feasible)

## Coding Standards (for all generated code)

- TypeScript with explicit types for exported/public APIs; avoid `any`
- ESM modules only (`import`/`export`), no CommonJS
- Descriptive names (avoid 1–2 char identifiers); functions are verbs, variables are nouns
- Guard clauses; shallow nesting; handle edge cases first
- Keep code self-explanatory; comments explain "why" for complex logic; no inline narration in code
- Match existing formatting and file organization; avoid reformatting unrelated code

## Integration With Simulation

- Build `Lineup` objects using DB data from `Player` and `PlayerStats` with `statsType: 'projections'`, current `season` and `week`
- Compute `gameProgress` ∈ [0,1] defensively; cap at 1; base on ratio of current to projected team total
- Use `simulateMatchupProbability` for win prob endpoints; return win pct, score distribution, implied odds

## Performance, Caching, Logging

- Use in-process caches for hot distributions with expiry (see variance caches) when appropriate
- Reduce iterations for endpoints; increase for offline scripts
- Logging prefixes: `[API]`, `[SIM]`, `[INGEST]`; avoid verbose logs in hot paths

## Security

- Until auth is implemented, prefer read-only endpoints; add CORS and validation when exposing to browsers
- Validate inputs; sanitize external IDs; avoid leaking internals in errors

## Testing and CI

- Keep Turbo tasks green: `build`, `lint`, `type-check`, `test`
- Export pure logic to packages for unit tests
- Prefer deterministic functions where feasible; isolate randomness in testable helpers

## Known Gaps / Action Items

- Mount missing routes in `apps/server/src/index.ts` (e.g., `/api/calculate-win-prob`); add `express.json()`
- Replace hard-coded season strings and season start dates with shared config
- Document and automate Next Prisma client generation to stay in sync with server schema
- Implement auth and real-time updates per future roadmap when needed

## Do Not

- Do not use CommonJS; do not write raw SQL (use Prisma)
- Do not duplicate types; import from `@gauntlet/types`
- Do not hard-code season values in new code; centralize in config


