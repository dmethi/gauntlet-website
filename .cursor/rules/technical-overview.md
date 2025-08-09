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

### Current Implementation Status (2025-08)

- Dynamic roster support
  - `simulateMatchupProbability` accepts either fixed `Lineup` or arrays of `LineupPlayer` (incl. SUPER_FLEX)
  - Server builds starters from `Roster.starters`; no hard-coded slots
- Variance & projections
  - Half-PPR (`pts_half_ppr`) with fallback to PPR
  - Empirical outcome sampler (position + recent player outcomes) with linear in-game variance decay
  - Prefetched sampling context for fast 10k Monte Carlo loops
  - Gaussian CV sampler retained as fallback
- Live state & persistence
  - ESPN scoreboard polling for game state/clock (linear `gameProgress`), fallback to points/projection ratio
  - Persistent time-series snapshots in `LiveWinProbSample`
- CI/cron
  - GitHub Actions workflow schedules `live-sims` every 10 minutes during NFL windows (Weeks 1–17)

### How to Run (local)

- Ingest data (example season 2023)
  - `pnpm --filter @gauntlet/server exec tsx src/scripts/data-ingestion/index.ts`

- Build variance metrics (hydrate models)
  - Ensure `DATABASE_URL` is set
  - `pnpm --filter @gauntlet/server metrics:calc 2022`
  - `pnpm --filter @gauntlet/server metrics:calc 2023`
  - `pnpm --filter @gauntlet/server metrics:calc 2024`
  - Verify: `pnpm --filter @gauntlet/server readiness:variance 2023`

- Run live sims (manual)
  - `pnpm --filter @gauntlet/server live-sims <leagueId>`

- Validate sims with scripts
  - Deterministic regression: `pnpm --filter @gauntlet/server regression:matchup <leagueId> <week> <rosterAId> <rosterBId> [iterations]`
  - Random lineups (sanity): `pnpm --filter @gauntlet/server exec tsx src/scripts/tests/sim-random-lineups.ts [iterations]`

### API

- `POST /api/calculate-win-prob`
  - Body: `{ matchups: Array<{ matchupId, roster_id, starters?, points }>, iterations?, gameProgressOverride?, timestamp? }`
  - Behavior: Builds starters from `Roster.starters`, half-PPR projections, computes `gameProgress` (or uses override), runs Monte Carlo, returns win pct, distributions, implied odds; persists `LiveWinProbSample` when league context is known

### Live Win Probability Persistence (Planned)

- Storage goals
  - Persist a time series of matchup win probability and scores every ~10 minutes during live games
  - Use for post-game excitement metrics and auditability
- Proposed Prisma models
  - `LiveWinProbSample`
    - `id` (cuid)
    - `leagueId` (string)
    - `week` (int)
    - `matchupId` (int)
    - `rosterAId` (int)
    - `rosterBId` (int)
    - `timestamp` (DateTime)
    - `gameProgress` (float 0–1)
    - `winProbA` (float 0–1)
    - `winProbB` (float 0–1)
    - `projectedFinalA` (float)
    - `projectedFinalB` (float)
    - `currentScoreA` (float)
    - `currentScoreB` (float)
    - `spread` (float)
    - `total` (float)
    - indexes: `(leagueId, week, matchupId)`, `(timestamp)`
- Scheduling
  - Cron (e.g., GitHub Actions) every 10 minutes during NFL live windows
  - Job flow: ingest live stats and NFL state → compute gameProgress (linear) → run sims for active matchups → upsert `LiveWinProbSample`
  - Retention: keep full series for the season; optional pruning policy by season if needed later

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

## Project Management TODOs

- **1. Data hygiene (Sleeper ingestion + Prisma alignment)**
  - [Done] Inventory endpoints and map → Prisma models
  - [Done] Implement ingestion for: league, users, rosters, players, matchups, draft(+picks), transactions
  - [Done] Weekly stats/projections ingestion (undocumented) and 2023 backfill (weeks 1–18)
  - [Planned] Trending players snapshot and NFL state capture
  - [Ongoing] Validation/idempotency improvements and minimal seed dataset

- **2. Weekly rollup tables (computed data for rendering)**
  - [Done] Added models/migrations: `LeagueWeekSummary`, `MatchupSummary`, `RosterWeekAggregate`, `SeasonSuperlatives`, `PlayerStatusHistory`
  - [Done] Implemented rollup computation (points, projectedPoints, optimalPoints, managerDelta/Score, streak, rollingAvg3, expectedWins/luck, positionalPoints, MVP, injuryPoints, powerRank)
  - [Done] Backfilled rollups for 2023 weeks 1–18
  - [Done] Implemented Hall of Fame/Shame generator with: overall weekly highs/lows, most in loss/least in win, blowout/closest, bench blunder, positional weekly highs/lows, positional season totals highs/lows, longest streaks, best/worst manager, luckiest/unluckiest
  - [Next] Add excitement-based and upset categories once time-series and/or betting lines are integrated
  - [Next] Transaction score and draft pick value rollups
  - [Next] Persist live win-prob time-series per matchup (see Live Win Probability Persistence), and store current scores each interval

- **3. UI build-out (Next.js app)**
  - League dashboard: standings, trends, key metrics
  - Team page: roster, weekly performance, projections vs actuals
  - Transactions pages: adds/drops/trades with filters
  - Wire to API/rollups, add loading/error/empty states; chart components for key visualizations

- **4. Simulation engine integration**
  - Integrate player/position curves and variance models; ensure DB-backed variance is used when available
  - Implement matchup and season sims endpoints; return win prob, distributions, implied odds
  - Support dynamic roster slots (including SUPER_FLEX) by consuming `Roster.starters` and `League.rosterPositions`
  - Standardize projections to half-PPR (`pts_half_ppr` fallback to `pts_ppr`)
  - Validate against sample scenarios; tune iteration counts for HTTP vs offline scripts

- **Tracking and structure**
  - Each TODO translates into one or more issues with: scope, acceptance criteria, data shape impacts
  - Branch naming: `feat/<area>-<short-description>` or `chore/<area>-<short-description>`
  - Keep a short design note for schema changes (reasoning, alt options, migration impact)

### Sleeper Endpoint Coverage (Checklist)

- Official (per league)
  - [Implemented] `/league/{leagueId}` → `League` (ingestion: `ingestLeague`)
  - [Implemented] `/league/{leagueId}/users` → `User` (ingestion: `ingestUsers`)
  - [Implemented] `/league/{leagueId}/rosters` → `Roster` (ingestion: `ingestRosters`)
  - [Implemented] `/league/{leagueId}/matchups/{week}` → `Matchup` (ingestion: `ingestMatchups`)
  - [Implemented] `/league/{leagueId}/transactions/{week}` → `Transaction` (ingestion: `ingestTransactions`)
  - [Implemented] `/draft/{draftId}` → `Draft` (ingestion: `ingestDraft`)
  - [Implemented] `/draft/{draftId}/picks` → `DraftPick` (ingestion: `ingestDraft`)

- Official (global)
  - [Implemented] `/players/nfl` → `Player` (ingestion: `ingestPlayers`)
  - [Planned] `/players/nfl/trending/{add|drop}` → rollup/snapshot table (see Weekly Rollups plan)
  - [Planned] `/state/nfl` → config/state table for current season/week

- Undocumented but used
  - [Implemented] `/stats/nfl/{seasonType}/{season}/{week}` → `PlayerStats(statsType='stats')`
  - [Implemented] `/projections/nfl/{seasonType}/{season}/{week}` → `PlayerStats(statsType='projections')`

Notes
- Add retry/backoff and rate limiting; prefer idempotent upserts.
- Maintain an ingestion manifest (season, weeks processed, timestamps) to support resume and backfill.

## Weekly Rollups: Strategy and Plan

- Pros/Cons
  - Precomputed tables
    - Pros: fast reads, deterministic outputs, easy to cache/version; great for charts and dashboards
    - Cons: storage overhead, ETL orchestration, must keep in sync after late data corrections
  - Views/materialized views
    - Pros: lower duplication, simpler maintenance; materialized views can be refreshed
    - Cons: limited Prisma support; refresh coordination; potentially slower without proper indexes
  - On-demand + in-memory cache
    - Pros: minimal storage, flexible
    - Cons: variable latency, cache invalidation complexity, heavier DB load during peak

- Recommendation
  - Use precomputed tables for league- and matchup-level weekly aggregates that drive UI.
  - Optionally add materialized views on top for convenience; expose through Prisma via `@@map` only if needed.
  - Recompute rollups after each weekly ingestion and on-demand when corrections occur (idempotent, by partition).

- Existing tables
  - `PlayerStats` (stats/projections by week/season, unique composite key)
  - `WeeklyMetrics` (per league/roster/week: points, expected wins, luck, opponent points)
  - [New] `RosterWeekAggregate`, `MatchupSummary`, `LeagueWeekSummary`, `SeasonSuperlatives`, `PlayerStatusHistory`

- New precomputed tables (proposed)
  - `LeagueWeekSummary`
    - Fields: `leagueId`, `week`, `medianPoints`, `averagePoints`, `maxPoints`, `minPoints`, `totalPoints`, timestamps
    - Uniqueness: `(leagueId, week)`; indexes on `(leagueId, week)`
    - Source: aggregate from `Matchup` and/or `WeeklyMetrics`
  - `MatchupSummary`
    - Fields: `leagueId`, `week`, `matchupId`, `rosterAId`, `rosterBId`, `pointsA`, `pointsB`, `winnerRosterId`, `margin`, timestamps
    - Uniqueness: `(leagueId, week, matchupId)`; indexes on `(leagueId, week)`
    - Source: consolidate paired `Matchup` rows
  - `RosterWeekAggregate`
    - Fields: `leagueId`, `rosterId`, `week`, `points`, `projectedPoints`, `benchPoints`, `opponentRosterId`, timestamps
    - Uniqueness: `(leagueId, rosterId, week)`; indexes on `(leagueId, week)` and `(rosterId, week)`
    - Source: `Matchup.players_points`, starters vs bench, projections from `PlayerStats`
  - `TrendingSnapshot` (optional, if needed for UX)
    - Fields: `capturedAt`, `type` ('add'|'drop'), `hours`, `playerId`, `rank`
    - Uniqueness: `(capturedAt, type, playerId)`
    - Source: `/players/nfl/trending/*`
  - `NFLState` (optional)
    - Fields: `capturedAt`, `season`, `week`, `seasonType`, `leg`
    - Uniqueness: `(capturedAt)`; add latest view or keep only most recent row

- ETL flow
  - After ingesting players/leagues/rosters/matchups/transactions for a given `(season, week)`:
    1. Ingest stats/projections for `(season, week)`
    2. Compute `MatchupSummary` and `RosterWeekAggregate`
    3. Compute `LeagueWeekSummary` and update `WeeklyMetrics`
    4. Write idempotently with upserts; record progress in ingestion manifest

- Backfill policy
  - Support full-season backfill (weeks 1–18) and per-week re-run; keep deterministic computations in pure functions.

## Weekly Rollups Metric Definitions (v0)

- **Foundational inputs (per league/week)**
  - `Matchup` (actual points, starters, players, players_points)
  - `PlayerStats(statsType='projections')` (projected points per player)
  - `PlayerStats(statsType='stats')` (actual stat details if needed)
  - `League.rosterPositions` (slot constraints)
  - Optional: sims pre/post-game win prob (if available) for clutch defs

- **Proposed storage: `RosterWeekAggregate` (new)**
  - `leagueId, rosterId, week`
  - `points` (actual from `Matchup`)
  - `projectedPoints` (sum of starter projections)
  - `optimalPoints` (best legal lineup using actuals)
  - `managerDelta` = `optimalPoints - points` (aka manager points); `managerScore` = `points / optimalPoints`
  - `opponentRosterId`, `opponentPoints`
  - `won` (0/1), `streak` (signed length; positive win streak, negative loss streak)
  - `rollingAvg3` (mean of last 3 weeks `points` for this roster)
  - `expectedWins` (see below), `luck` = `won - expectedWins`
  - `positionalPoints` JSON (sum by position for starters), `opponentPositionalPoints` JSON
  - `mvpPlayerId` (see below), `mvpValue`

- **Proposed storage: `MatchupSummary` (new)**
  - `leagueId, week, matchupId`
  - `rosterAId, rosterBId, pointsA, pointsB, winnerRosterId, margin`
  - Optional: `preGameWinProbA/B`, `postGameClutchDelta` if sims available

- **Proposed storage: `LeagueWeekSummary` (new)**
  - `leagueId, week` and `medianPoints, averagePoints, maxPoints, minPoints, stdDev`

- **Metric definitions**
  - Power rank value
    - v0: z-score blend: `0.5*z(points_per_week_mean)` + `0.3*z(expectedWins_cum)` + `0.2*z(rollingAvg3)`; compute per week using cumulative to date
  - 3-week moving average
    - `rollingAvg3` from `RosterWeekAggregate`
  - Win/loss, win streaks
    - `won` from `MatchupSummary`; `streak` computed cumulatively per roster
  - Optimal points
    - Maximize actual points subject to `League.rosterPositions`; use `Player.position` and prevent duplicates; tie-break by highest bench
  - Manager score/manager points
    - `managerDelta` and `managerScore` as above
  - Points lost to injury
    - v0 proxy: sum over starters with `status='IR'|'Inactive'` of `projection - actual`, clipped at 0; requires projections; refine when snap data available
  - Expected wins/luck
    - v0 method: median system: `expectedWins = points >= leagueMedian ? 1 : 0` per week; `luck = won - expectedWins`
    - alt: fractional method: fraction of teams outscored; can switch later
  - Player value/MVP
    - v0: for each starter, `value = actual - projection`; MVP is max `value`; store `mvpPlayerId`, `mvpValue`
  - Recompute pick score, transaction score
    - v0 weekly: sum contributions from players acquired since prior week
      - `transactionScore = Σ(actual_points_of_new_acquisitions)` minus points of dropped players if they outscored replacement on bench
      - Draft pick score deferred to season rollup; placeholder field can be added later
  - Positional points, opponent positional points
    - Aggregate starter actuals by `Player.position`; opponent from `MatchupSummary` peer
  - Hall of fame + shame (seasonal superlatives)
    - Maintain separate seasonal aggregation that scans `RosterWeekAggregate`:
      - Extremes: highest single week/3-week/5-week scores; most points in loss; least in win
      - Bust/Clutch of year: largest negative/positive cumulative `postGameClutchDelta` or `(actual - projection)` sums
      - Longest win/loss streaks
  - Clutch rating
    - v0: `clutch = (won ? 1 : 0) - expectedWinProb_preGame`; if sims unavailable, use `sign(points - projection_total)` scaled by `abs(margin)`
  - Payout page
    - UI feature consuming season totals; not a rollup metric
  - Schedule luck
    - v0: `scheduleLuck = actualWins - expectedWins_cum`; also expose strength of schedule = `avg(opponentPoints)`

- **Computation order (per league/week)**
  1. Build `LeagueWeekSummary` (median/statistics)
  2. Build `MatchupSummary`
  3. Build `RosterWeekAggregate` (uses 1 and 2 and projections)
  4. Update cumulative fields (streaks, power rank, schedule luck)

- **Open questions**
  - Power rank: okay with the z-score blend weights (0.5/0.3/0.2) for v0?
  - Expected wins: prefer median system (0/1) or fractional (outscore fraction) for v0?
  - Injury points: accept projection-minus-actual proxy for starters with `Inactive/IR` for v0?
  - Transaction score: limit to adds/drops, or include trades with attribution across rosters?
  - Clutch rating: require sim-based expected win prob, or use projection delta fallback for v0?

## Hall of Fame & Shame (v0)

- Principles
  - Use direct observable outcomes (points, margins, stats, win-prob series); avoid advanced computed value metrics here
  - Rankings scoped per league and season; ties allowed; store references for reproducibility

- Data requirements
  - Matchups: `/league/{leagueId}/matchups/{week}` → points, starters, bench
  - Time-series win probabilities (optional but preferred): from `/api/calculate-win-prob` runs stored in `apps/web/data/winprob-timeseries-*`
  - Player stats: `/stats/nfl/regular/{season}/{week}` (undocumented) for passing/receiving/rushing/TDs/INTs/turnovers
  - Optional betting lines: `BettingLine(leagueId, week, matchupId, spread, moneylineA, moneylineB, source)`; if unavailable, fallback to pre-game sim win prob

- Weekly team superlatives
  - Highest single-week score: max `points`
  - Lowest single-week score: min `points`
  - Most points in loss: max `points` where `won=0`
  - Least points in win: min `points` where `won=1`
  - Largest blowout: max `|pointsA - pointsB|`
  - Closest win: min positive `|pointsA - pointsB|`
  - Biggest over-performance vs projection: max `(points - projectedPoints)`
  - Biggest under-performance vs projection: min `(points - projectedPoints)`
  - Biggest bench blunder: max `(optimalPoints - points)`

- Rolling/team season superlatives
  - Highest 3-week total: max sum over any 3-week window
  - Highest 5-week total: max sum over any 5-week window
  - Longest win streak: max positive `streak`
  - Longest losing streak: min negative `streak`
  - Luckiest win (weekly): max `(won - expectedWins)`
  - Unluckiest loss (weekly): min `(won - expectedWins)`
  - Highest season schedule luck: max `actualWins_cum - expectedWins_cum`

- Game excitement (requires win-prob time-series)
  - Most exciting matchup: max `ExcitementScore = 0.6*maxSwing + 0.4*volatility` where
    - `maxSwing = max |p[i] - p[i-1]|`, `volatility = stdev(p)` for either side’s win prob series
  - Most boring matchup: min `ExcitementScore`
  - Most lead changes: max count of sign changes in `(p - 0.5)` across series
  - Most clutch comeback: winner had min(`p`) ≤ 0.2 at any time, then won; rank by lowest min(`p`)

- Biggest upset (betting)
  - With betting lines: highest upset index = `-log(preGameWinProb_winner)` derived from moneyline or spread-implied probability
  - Fallback: use pre-game sim win probability if betting unavailable

- Positional/player superlatives (as started in fantasy)
  - Highest and lowest single-week at each position (QB, RB, WR, TE, DEF)
  - Season-most and least cumulative points at each position (sum of weeks when started)
  - Highest bench single-week (any position): max bench points of a single player
  - Most TDs in a week by a single player; Most turnovers in a week

- Stats-based superlatives (as started)
  - Weekly highs/lows: passing yards, rushing yards, receiving yards, total TDs, interceptions thrown, fumbles lost
  - Season highs: cumulative for the above

- Storage suggestions
  - `SeasonSuperlatives(leagueId, season, category, week?, rosterId?, playerId?, matchupId?, value, metadata)`
  - Persist weekly winners and season-to-date leaders after each rollup job for auditability

- Computation notes
  - Use `MatchupSummary` and `RosterWeekAggregate` for points/margins
  - Use time-series JSON for excitement metrics if DB storage not yet implemented
  - Map Sleeper `PlayerStats` keys to counting stats; enforce consistent scoring season-wide

## Assistant Operating Rules in Cursor

- **Clarify-first**
  - When requirements are ambiguous, ask targeted questions before implementing
  - If the user is unavailable, proceed with explicit written assumptions and call them out in the summary

- **Plan-and-branch**
  - For substantive changes: create a brief plan (what/why/impact), then work in a dedicated branch with conventional commits
  - Keep edits scoped, avoid unrelated refactors; update or add migrations for schema changes

- **Use the TODOs as the source of truth**
  - Tie work items to the TODO roadmap; keep progress visible and update status as tasks complete
  - Reflect constraints (performance, data fidelity, API shapes) in acceptance criteria to avoid regressions

- **Regression safety**
  - Maintain green `build`, `lint`, `type-check`, `test` before marking tasks done
  - For schema changes: run migrations, regenerate Prisma clients where needed, and backfill data if required
  - For API changes: version or provide backward-compatible responses when feasible

- **Definition of Done (per task)**
  - Code implemented with clear types and tests where applicable
  - Docs updated (this file, or small design note for schema/API changes)
  - Local verification performed; assumptions captured; next steps identified if any

## Do Not

- Do not use CommonJS; do not write raw SQL (use Prisma)
- Do not duplicate types; import from `@gauntlet/types`
- Do not hard-code season values in new code; centralize in config


