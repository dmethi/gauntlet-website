# Fantasy Football Simulation Engine

A Monte Carlo simulation engine for generating win probability estimates and
betting line equivalents for fantasy football matchups.

## Core Components

### 1. Player Variance Model (`variance.ts`)

- Uses historical projection vs actual data to model player outcome
  distributions
- Calculates position-level and player-specific variance patterns
- Employs Monte Carlo sampling from actual historical distributions rather than
  assuming normal/triangular distributions
- Weights player-specific data (70%) over position-level data (30%) when
  sufficient history exists
- Adjusts variance based on game progress for live simulations

### 2. Matchup Simulator (`matchup.ts`)

- Simulates full lineup matchups using player variance models
- Validates lineup constraints (no duplicates, valid positions)
- Runs thousands of simulations to generate:
  - Win probabilities
  - Score distributions (10th, 25th, 50th, 75th, 90th percentiles)
  - Betting lines (spread, money line, over/under)
- Uses median values for betting lines to reduce impact of outliers

## Key Design Decisions

1. **Direct Distribution Sampling**
   - Instead of fitting to normal/triangular distributions, we sample directly
     from historical outcomes
   - This preserves the true shape of outcome distributions without forcing
     assumptions

2. **Player vs Position-Level Data**
   - Use player-specific patterns when we have enough samples (8+ games)
   - Fall back to position-level distributions for newer/less-used players
   - Weight player data more heavily (70/30) when available

3. **Median-Based Lines**
   - Use median values instead of means for betting lines
   - This provides more stable lines less affected by extreme outcomes

## Future Enhancements

### High Impact

1. **Game Stacks / Correlation**
   - Track team/game context for each player
   - Adjust outcomes to reflect real correlations
   - Example: QB performance affects their WR outcomes

2. **Matchup Adjustments**
   - Factor in opponent strength vs position
   - Adjust variance based on defensive matchups
   - Consider home/away splits

3. **Time-Based Weighting**
   - Weight recent performance more heavily
   - Account for seasonal trends
   - Consider weather impacts late season

### Additional Features

4. **Position Restrictions**
   - Add validation for FLEX positions (RB/WR/TE only)
   - Support for different league formats (Superflex, etc.)

5. **Injury Impact**
   - Track injury status and history
   - Adjust variance for players returning from injury
   - Factor in practice participation

6. **Visualization**
   - Score distribution curves
   - Head-to-head win probability graphs
   - Player contribution to variance
   - Live win probability tracking

7. **Advanced Analytics**
   - Value over replacement simulations
   - Trade analyzer with ROS simulations
   - Playoff odds calculator

8. **Performance Optimization**
   - Cache common distribution patterns
   - Parallel simulation processing
   - Incremental updates for live scoring

## Usage

```typescript
// Example: Simulate a matchup
const result = await simulateMatchupProbability(team1, team2, 10000);

// Results include:
- Win probabilities
- Score distributions
- Betting lines (spread, money line, over/under)
- Individual player contributions
```

## Data Requirements

The simulation engine requires:

- Historical projection vs actual data
- Player metadata (position, team, etc.)
- Recent performance history (8+ weeks ideal)
- Current week projections

## Testing

Test scripts available:

- `test-variance-model.ts`: Test individual player variance models
- `test-matchup-sim.ts`: Test full matchup simulations
