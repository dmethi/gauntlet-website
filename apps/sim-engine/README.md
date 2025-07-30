# The Gauntlet Simulation Engine

Advanced fantasy football simulation engine for projecting game outcomes, player
performance, and season-long scenarios.

## Features

- Player performance modeling with statistical variance
- Head-to-head matchup simulations
- Full season simulations with playoff scenarios
- Monte Carlo simulation methods
- Custom scoring system support
- Historical data integration

## Usage

### CLI Commands

```bash
# Run test simulation
pnpm sim:test

# Simulate full season (17 weeks)
pnpm sim:season

# Simulate specific matchup
pnpm sim:matchup --team1 team_123 --team2 team_456

# Custom week count
gauntlet-sim season --weeks 14
```

### Programmatic Usage

```typescript
import { runTestSimulation } from '@gauntlet/sim-engine';

const results = await runTestSimulation();
console.log(results);
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build
pnpm build

# Run tests
pnpm test
```

## Simulation Models

### 🎯 Win Probability Engine (In Development)

**Status:** Research complete, implementation pending  
**Purpose:** Real-time fantasy matchup win probability for pre-game odds and
live updates

- **Data-driven variance constants** from 10 years of historical Sleeper API
  data
- **Lightweight Monte Carlo simulation** for browser/edge execution
- **Game progress decay modeling** for live probability updates
- **Position-specific volatility** based on 20,000+ player performances

📚 **Full documentation:**
[`src/simulations/win-probability-engine.md`](src/simulations/win-probability-engine.md)

### Legacy Simulation Models (Placeholder)

- Base projections from historical data
- Matchup-specific adjustments
- Weather and venue factors
- Injury probability modeling
- Lineup optimization and roster analysis
- Playoff probability calculations
