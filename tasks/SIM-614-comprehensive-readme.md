# Task SIM-614: Create Comprehensive README

**Category:** DOCUMENTATION  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 45 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Create comprehensive README.md documenting sim-engine API, usage examples, variance models, performance characteristics, and development setup.

---

## 🎯 Objective

Write README with 8 sections covering features, installation, quick start, API reference, variance models, performance, contributing, and license.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/src/index.ts` - All exports
- `apps/sim-engine/src/models/matchup.ts` (lines 1-50) - Main simulation function
- `apps/sim-engine/src/data/variance-loader.ts` (lines 1-100) - Data loading
- `apps/sim-engine/package.json` - Package metadata

**Files to Create:**
- `apps/sim-engine/README.md` - Comprehensive documentation

---

## 📝 Steps

### 1. Create README.md

Create `apps/sim-engine/README.md`:

```markdown
# @gauntlet/sim-engine

Monte Carlo simulation engine for fantasy football matchup win probability and score distributions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

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
  { id: '4866', position: 'QB', projection: 24.5 },  // Patrick Mahomes
  { id: '7564', position: 'RB', projection: 18.2 },  // Christian McCaffrey
  { id: '8110', position: 'WR', projection: 16.8 },  // Justin Jefferson
  // ... more players
];

const team2: LineupPlayer[] = [
  { id: '421', position: 'QB', projection: 22.3 },
  // ... more players
];

const result = await simulateMatchupProbabilityFromPlayers(
  team1,
  team2,
  10000  // iterations
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
    currentScore: 18.2,  // Already scored 18.2 points
    nflTeam: 'KC',       // Kansas City Chiefs
  },
  // ... more players
];

const result = await simulateMatchupProbabilityFromPlayers(
  team1Live,
  team2Live,
  10000,
  0.65,  // 65% game complete
  new Set(['KC', 'BUF'])  // Live NFL teams
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
): Promise<MatchupSimulationResult>
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
): Promise<SamplingContext>
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
): number
```

Fast synchronous player score sampling using pre-fetched context.

---

### Variance Data Functions

#### `getPositionDistribution`

```typescript
async function getPositionDistribution(
  position: string
): Promise<{ outcomes: number[], sampleSize: number }>
```

Get historical variance distribution for NFL position (QB, RB, WR, TE, K, DEF).

---

#### `getPlayerOutcomes`

```typescript
async function getPlayerOutcomes(
  playerId: string
): Promise<{ outcomes: number[], sampleSize: number }>
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
  // ... more fields
}
```

Get variance data metadata and quality metrics.

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

| Position | Std Dev | Predictability |
|----------|---------|----------------|
| **K** (Kickers) | 0.50 | Most consistent |
| **QB** | 0.80 | High consistency |
| **TE** | 0.99 | Moderate variance |
| **RB** | 0.98 | High variance |
| **WR** | 0.98 | High variance |
| **DEF** | 0.75 | Moderate-high variance |

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
   await prewarmVarianceData();  // Loads data once
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

**Test Coverage:** 80%+ across all modules

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
│   │   └── variance-updater.ts      # Weekly update logic
│   ├── lib/
│   │   ├── logger.ts         # Structured logging
│   │   ├── result.ts         # Result type for error handling
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
6. Updates `variance-data.json`

### Automated Schedule

Recommended: Run Tuesday 3am ET after Monday Night Football

```cron
0 3 * * 2 cd /path/to/gauntlet && pnpm --filter @gauntlet/server run update-variance
```

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

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Review existing documentation in `/docs`
- Check API reference above

---

## 🙏 Acknowledgments

- **Sleeper API** for player stats and projections
- **Historical Data** (2022-2024 seasons) for variance models
- **Monte Carlo Methods** for simulation accuracy
```

### 2. Verify README Renders Correctly

```bash
# Preview README (if using markdown preview tool)
cat apps/sim-engine/README.md

# Check for broken links
# Check for proper code formatting
```

### 3. Add Examples Directory (Optional)

Create `apps/sim-engine/examples/basic-simulation.ts`:

```typescript
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import type { LineupPlayer } from '@gauntlet/types';

/**
 * Basic pre-game simulation example
 */
async function basicExample() {
  const team1: LineupPlayer[] = [
    { id: '4866', position: 'QB', projection: 24.5 },
    { id: '7564', position: 'RB', projection: 18.2 },
    { id: '8110', position: 'WR', projection: 16.8 },
    { id: '6794', position: 'TE', projection: 12.4 },
    // Add more players for full lineup
  ];

  const team2: LineupPlayer[] = [
    { id: '421', position: 'QB', projection: 22.3 },
    // ... more players
  ];

  const result = await simulateMatchupProbabilityFromPlayers(team1, team2, 10000);

  console.log('Simulation Results:');
  console.log(`Team 1 Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
  console.log(`Team 2 Win%: ${(result.team2WinPct * 100).toFixed(1)}%`);
  console.log(`\nExpected Scores:`);
  console.log(`Team 1: ${result.team1Scores.median.toFixed(1)} pts`);
  console.log(`Team 2: ${result.team2Scores.median.toFixed(1)} pts`);
  console.log(`\nBetting Lines:`);
  console.log(`Spread: ${result.impliedOdds.spread}`);
  console.log(`Total: ${result.impliedOdds.total}`);
  console.log(`Team 1 ML: ${result.impliedOdds.team1MoneyLine}`);
}

basicExample().catch(console.error);
```

---

## ✅ Acceptance Criteria

- [ ] README.md created with 8+ major sections
- [ ] Quick start examples for pre-game, live game, metrics
- [ ] Complete API reference for all 11 exported functions
- [ ] Variance models explanation with data sources
- [ ] Performance benchmarks documented
- [ ] Development setup instructions
- [ ] Weekly update job documentation
- [ ] Contributing guidelines
- [ ] All code examples are copy-paste functional
- [ ] No broken links or formatting issues
- [ ] README renders correctly on GitHub

---

## 🔗 Related Tasks

**Depends On:**
- SIM-604: Add JSDoc to All Exported Functions (can reference documentation)

**Blocks:**
- SIM-615: Add Package Quality Badges (README needed for badges)

---

## 📊 Context Usage

- **Files to read:** 4 files (~500 lines)
- **Files to create:** 1 file (~500 lines)
- **Time estimate:** 45 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-614. Please:

1. Read apps/sim-engine/src/index.ts for all exports
2. Read apps/sim-engine/package.json for metadata
3. Create comprehensive README.md with 8 sections:
   - Features
   - Installation
   - Quick Start (3 examples)
   - API Reference (11 functions)
   - Variance Models
   - Performance
   - Development
   - Contributing
4. Add code examples that are copy-paste functional
5. Document weekly variance update job
6. Verify markdown renders correctly

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify README exists
ls -lah apps/sim-engine/README.md

# Check for broken links (manual review or use tool)
# Check code block formatting
grep -c '```' apps/sim-engine/README.md  # Should be even number

# Preview README (use markdown preview tool or GitHub)
cat apps/sim-engine/README.md
```

---

## 📝 Commit Message Template

```
docs(sim-engine): create comprehensive README documentation (SIM-614)

- Add 500+ line README with 8 major sections
- Features: Monte Carlo simulations, variance models, live game support
- Installation and quick start with 3 examples
- Complete API reference for 11 exported functions
- Variance models explanation with historical data sources
- Performance benchmarks and optimization tips
- Development setup and project structure
- Weekly variance update job documentation
- Contributing guidelines and support information
- All code examples are copy-paste functional
- Ready for enterprise use and open-source contributions

Part of sim-engine enterprise readiness initiative
```

