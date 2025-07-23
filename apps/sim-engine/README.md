# The Gauntlet Simulation Engine

Advanced fantasy football simulation engine for projecting game outcomes, player performance, and season-long scenarios.

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

### Player Performance
- Base projections from historical data
- Matchup-specific adjustments
- Weather and venue factors
- Injury probability modeling

### Team Scenarios
- Lineup optimization
- Roster construction analysis
- Trade impact simulation
- Waiver wire strategy

### League Dynamics
- Playoff probability calculations
- Championship odds
- Draft strategy evaluation
- Season-long projections 