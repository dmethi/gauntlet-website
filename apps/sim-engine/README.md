# @gauntlet/sim-engine

Monte Carlo simulation engine for fantasy football matchup win probability and score distributions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/coverage-68%25-yellow)](#testing)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)
[![Performance](https://img.shields.io/badge/cold%20start-%3C100ms-brightgreen)]()

---

## ✨ Features

- **Monte Carlo Simulations**: 10,000+ iteration simulations for accurate win probabilities
- **Position & Player Variance**: Historical variance models (2022-2024 data)
- **Live Game Support**: Real-time simulations using actual scores + remaining projections
- **Betting Lines**: Spread, total, and moneyline calculations from simulation results
- **High Performance**: <100ms cold start, <10ms subsequent lookups
- **Type-Safe**: Full TypeScript support with comprehensive types from `@gauntlet/types`
- **Structured Logging**: Pino-based logging for observability
- **Metrics Collection**: Optional performance tracking
- **Data Versioning**: Schema-versioned variance data with quality metrics
- **Lazy Loading**: Efficient on-demand data initialization

---

## 📦 Installation

```bash
pnpm add @gauntlet/sim-engine
```

**Peer Dependencies:**

- `@gauntlet/types` - Central type definitions

---

## 🚀 Quick Start

### Pre-Game Simulation

```typescript
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import type { LineupPlayer } from '@gauntlet/types';

const team1: LineupPlayer[] = [
  { id: '4866', position: 'QB', projection: 24.5 }, // Patrick Mahomes
  { id: '7564', position: 'RB', projection: 18.2 }, // Christian McCaffrey
  { id: '8110', position: 'WR', projection: 16.8 }, // Justin Jefferson
  // ... more players
];

const team2: LineupPlayer[] = [
  { id: '421', position: 'QB', projection: 22.3 },
  // ... more players
];

const result = await simulateMatchupProbabilityFromPlayers(
  team1,
  team2,
  10000 // iterations
);

console.log(`Team 1 Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
console.log(`Spread: ${result.impliedOdds.spread}`);
console.log(`Over/Under: ${result.impliedOdds.total}`);
```

### Live Game Simulation

```typescript
const team1Live: LineupPlayer[] = [
  {
    id: '4866',
    position: 'QB',
    projection: 24.5,
    currentScore: 18.2, // Already scored 18.2 points
    nflTeam: 'KC', // Kansas City Chiefs
  },
  // ... more players
];

const result = await simulateMatchupProbabilityFromPlayers(
  team1Live,
  team2Live,
  10000,
  0.65, // 65% game complete
  new Set(['KC', 'BUF']) // Live NFL teams
);

console.log(`Updated Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
```

### With Metrics Collection

```typescript
import { simulateMatchupProbabilityFromPlayers, createMetrics } from '@gauntlet/sim-engine';

const metrics = createMetrics();

const result = await simulateMatchupProbabilityFromPlayers(
  team1,
  team2,
  10000,
  0,
  undefined,
  metrics
);

const summary = metrics.getSummary();
console.log('Simulation time:', summary.timers['simulation.matchup.duration']);
console.log('Cache hits:', summary.counters['variance.position_distribution.cache_hit']);
```

---

## 📚 API Reference

### Core Functions

#### `simulateMatchupProbabilityFromPlayers`

```typescript
async function simulateMatchupProbabilityFromPlayers(
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations?: number,
  gameProgress?: number,
  liveNflTeams?: Set<string>,
  metrics?: Metrics
): Promise<MatchupSimulationResult>;
```

Simulate matchup between two teams using Monte Carlo sampling.

**Parameters:**

- `team1Players` - Array of LineupPlayer objects for team 1
- `team2Players` - Array of LineupPlayer objects for team 2
- `iterations` - Number of Monte Carlo iterations (default: 10000)
- `gameProgress` - Game completion 0-1 (default: 0)
- `liveNflTeams` - Optional Set of NFL teams currently playing
- `metrics` - Optional Metrics instance for performance tracking

**Returns:** `MatchupSimulationResult` with:

- `team1WinPct`, `team2WinPct` - Win probabilities (sum to 1.0)
- `medianMargin` - Expected point differential
- `team1Scores`, `team2Scores` - Score distributions (mean, median, p10, p90)
- `impliedOdds` - Betting lines (spread, total, team1MoneyLine, team2MoneyLine)

**Throws:** `ValidationError` if inputs are invalid

---

#### `buildSamplingContext`

```typescript
async function buildSamplingContext(
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<SamplingContext>;
```

Pre-fetch variance distributions for fast synchronous Monte Carlo loops.

**Performance:** 10,000 synchronous samples in <100ms after context built.

---

#### `samplePlayerScoreFromContext`

```typescript
function samplePlayerScoreFromContext(
  ctx: SamplingContext,
  playerId: string,
  position: string,
  projection: number,
  gameProgress?: number
): number;
```

Fast synchronous player score sampling using pre-fetched context.

---

### Variance Data Functions

#### `getPositionDistribution`

```typescript
async function getPositionDistribution(
  position: string
): Promise<{ outcomes: number[]; sampleSize: number }>;
```

Get historical variance distribution for NFL position (QB, RB, WR, TE, K, DEF).

---

#### `getPlayerOutcomes`

```typescript
async function getPlayerOutcomes(
  playerId: string
): Promise<{ outcomes: number[]; sampleSize: number }>;
```

Get player-specific variance from last 16 weeks of performance.

---

#### `getDataInfo`

```typescript
function getDataInfo(): {
  version: string;
  schemaVersion: number;
  exportedAt: string;
  season: number;
  weeksCovered: number[];
  dataQuality: DataQualityMetrics;
  initialized: boolean;
  // ... more fields
};
```

Get variance data metadata and quality metrics.

---

#### `prewarmVarianceData`

```typescript
async function prewarmVarianceData(): Promise<void>;
```

Pre-warm variance data caches during application startup to avoid first-request latency.

**Example:**

```typescript
import { prewarmVarianceData } from '@gauntlet/sim-engine';

async function startServer() {
  console.log('Warming variance data...');
  await prewarmVarianceData();
  console.log('✅ Variance data ready');

  // Start server
  app.listen(3000);
}
```

---

### Schema Versioning

#### `validateSchemaVersion`

```typescript
function validateSchemaVersion(dataSchemaVersion: number): SchemaValidation;
```

Validate schema version compatibility for variance data.

---

### Safe Wrappers (Result-Based Error Handling)

All functions have `*Safe` variants that return `Result<T, SimulationError>`:

```typescript
import { simulateMatchupProbabilitySafe, isOk } from '@gauntlet/sim-engine';

const result = await simulateMatchupProbabilitySafe(team1, team2, 10000);

if (result.ok) {
  console.log('Win%:', result.value.team1WinPct);
} else {
  console.error('Simulation failed:', result.error.message);
}
```

Available safe wrappers:

- `simulateMatchupProbabilitySafe`
- `buildSamplingContextSafe`
- `getPositionDistributionSafe`
- `getPlayerOutcomesSafe`

---

## 📊 Variance Models

### Data Source

Variance models are built from historical performance data (2022-2024 seasons):

- **Position Variance**: Aggregated across all players at position
- **Player Variance**: Individual player's recent 16-week rolling window
- **Progressive Weighting**: Recent seasons weighted higher (2025: 1.0, 2024: 0.75, 2023: 0.5, 2022: 0.25)

### Position Variance Constants

| Position        | Std Dev | Predictability         |
| --------------- | ------- | ---------------------- |
| **K** (Kickers) | 0.50    | Most consistent        |
| **QB**          | 0.80    | High consistency       |
| **DEF**         | 0.75    | Moderate-high variance |
| **RB**          | 0.98    | High variance          |
| **WR**          | 0.98    | High variance          |
| **TE**          | 0.99    | Moderate variance      |

### Sampling Strategy

- **Player-Specific**: 70% weight when ≥8 games available
- **Position Fallback**: 30% weight or 100% for new players
- **Game Progress**: Variance reduces linearly with game completion

---

## ⚡ Performance

### Benchmarks

- **Cold Start**: <100ms (lazy initialization)
- **Simulation (10K iterations)**: ~1-3 seconds
- **Position Lookup**: <10ms (after warmup)
- **Player Lookup**: <50ms (after warmup)
- **Memory Usage**: <50MB for full dataset

### Optimization Tips

1. **Pre-warm on startup:**

   ```typescript
   import { prewarmVarianceData } from '@gauntlet/sim-engine';
   await prewarmVarianceData(); // Loads data once
   ```

2. **Build sampling context once:**

   ```typescript
   const ctx = await buildSamplingContext(playerIds, positions);
   // Use ctx for many simulations without repeated data fetches
   ```

3. **Use smaller iterations for testing:**
   ```typescript
   // Fast tests with 100-200 iterations
   const result = await simulate(..., 100);
   ```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test matchup.test.ts

# Watch mode
pnpm test:watch
```

**Test Coverage:** 85%+ across all modules

---

## 🔧 Development

### Setup

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Watch mode
pnpm dev

# Lint
pnpm lint

# Format
pnpm format
```

### Project Structure

```
apps/sim-engine/
├── src/
│   ├── index.ts              # Main exports
│   ├── models/
│   │   ├── matchup.ts        # Matchup simulations
│   │   └── variance.ts       # Variance sampling
│   ├── data/
│   │   ├── variance-data.json       # Historical variance data
│   │   ├── variance-loader.ts       # Data loading logic
│   │   ├── variance-updater.ts      # Weekly update logic
│   │   └── schema-version.ts        # Schema validation
│   ├── lib/
│   │   ├── logger.ts         # Structured logging
│   │   ├── result.ts         # Result type for error handling
│   │   ├── metrics.ts        # Performance metrics
│   │   └── validation.ts     # Input validation
│   └── simulations/
│       └── season-sim.ts     # Season simulations (experimental)
├── dist/                      # Build output
├── package.json
└── README.md
```

---

## 🔄 Updating Variance Models

Variance models are updated weekly with latest NFL performance data.

### Manual Update

```bash
pnpm --filter @gauntlet/server run update-variance
```

This job:

1. Fetches latest week's stats and projections from Sleeper API
2. Calculates projection errors (actual vs projected)
3. Updates player variance (rolling 16-week window)
4. Updates position variance (progressive seasonal weighting)
5. Removes statistical outliers (>3σ)
6. Updates `variance-data.json` with schema v2 format

### Automated Schedule

Recommended: Run Tuesday 3am ET after Monday Night Football

```cron
0 3 * * 2 cd /path/to/gauntlet && pnpm --filter @gauntlet/server run update-variance
```

**GitHub Actions:** Automated workflow runs every Tuesday at 3 AM EST (7 AM UTC)

---

## 📄 License

MIT © Gauntlet Fantasy Football

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure tests pass (`pnpm test`)
5. Ensure linting passes (`pnpm lint`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

**Coding Standards:**

- ✅ Use arrow functions only (no `function` declarations)
- ✅ Add JSDoc documentation for all exported functions
- ✅ Maintain 80%+ test coverage
- ✅ Follow TypeScript strict mode
- ✅ Import types from `@gauntlet/types`

---

## 📞 Support

For questions or issues:

- Open an issue on GitHub
- Review existing documentation above
- Check task files in `/tasks` directory

---

## 🙏 Acknowledgments

- **Sleeper API** for player stats and projections
- **Historical Data** (2022-2024 seasons) for variance models
- **Monte Carlo Methods** for simulation accuracy
