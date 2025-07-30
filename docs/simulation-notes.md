# The Gauntlet - Simulation Engine

## Overview

The Gauntlet's simulation engine provides advanced fantasy football projections
and scenario modeling using statistical analysis, machine learning, and Monte
Carlo methods.

## Core Features

### Player Projections

- **Weekly Projections**: Individual player scoring predictions
- **Floor/Ceiling Analysis**: Range of possible outcomes with confidence
  intervals
- **Matchup-Specific Adjustments**: Opponent-based modifications
- **Season-Long Projections**: Rest-of-season outlook for trades and keeper
  decisions

### Team Simulations

- **Head-to-Head Matchups**: Win probability for individual games
- **Playoff Probability**: Likelihood of making playoffs based on current
  standings
- **Championship Odds**: Probability of winning league championship
- **Schedule Strength**: Analysis of remaining schedule difficulty

## Projection Methodology

### Base Projections

Starting point for all player projections:

```typescript
interface BaseProjection {
  player: Player;
  position: Position;
  projectedStats: {
    attempts: number;
    completions: number;
    yards: number;
    touchdowns: number;
    // ... other stats
  };
  confidence: number; // 0-100%
}
```

### Statistical Models

#### Regression Analysis

- **Historical Performance**: Weight recent games more heavily
- **Target Share**: Receiving target percentage trends
- **Red Zone Usage**: Touchdown opportunity analysis
- **Game Script**: Lead/trail impact on player usage

#### Advanced Metrics

- **Air Yards**: Depth of target for receivers
- **Snap Count Percentage**: Playing time correlation with production
- **Route Running**: Separation and efficiency metrics
- **Pressure Rate**: QB performance under pressure

### Adjustment Factors

#### Matchup Analysis

```typescript
interface MatchupFactor {
  opponent: Team;
  positionRank: number; // 1-32 defense ranking vs position
  recentForm: number; // Last 4 weeks performance
  homeFieldAdvantage: number;
  impact: number; // -1 to +1 multiplier
}
```

#### Environmental Factors

- **Weather**: Wind, precipitation, temperature impact
- **Venue**: Dome vs outdoor, altitude, field conditions
- **Game Time**: Prime time vs early games performance
- **Rest**: Days since last game, bye week bounce

#### Injury Considerations

- **Injury Report Status**: Probable/Questionable/Doubtful impact
- **Injury History**: Recurring injury patterns
- **Replacement Impact**: Backup player skill drop-off
- **Game Flow**: How injuries affect team strategy

## Simulation Algorithms

### Monte Carlo Simulation

Run thousands of simulations to generate probability distributions:

```python
def simulate_player_performance(player, matchup, iterations=10000):
    results = []

    for _ in range(iterations):
        # Apply random variance to base projection
        variance = normal_distribution(0, player.historical_variance)
        projected_points = player.base_projection * (1 + variance)

        # Apply matchup adjustments
        projected_points *= matchup.adjustment_factor

        # Apply environmental factors
        projected_points *= get_environmental_multiplier(matchup)

        results.append(max(0, projected_points))

    return {
        'mean': mean(results),
        'floor': percentile(results, 10),  # 10th percentile
        'ceiling': percentile(results, 90), # 90th percentile
        'std_dev': std_deviation(results)
    }
```

### Team Simulation

Combine individual player simulations for team-level predictions:

```typescript
function simulateMatchup(team1: Team, team2: Team, iterations: number = 10000) {
  const results = {
    team1Wins: 0,
    team2Wins: 0,
    ties: 0,
    averageScores: { team1: 0, team2: 0 },
  };

  for (let i = 0; i < iterations; i++) {
    const team1Score = simulateTeamScore(team1);
    const team2Score = simulateTeamScore(team2);

    if (team1Score > team2Score) {
      results.team1Wins++;
    } else if (team2Score > team1Score) {
      results.team2Wins++;
    } else {
      results.ties++;
    }

    results.averageScores.team1 += team1Score;
    results.averageScores.team2 += team2Score;
  }

  // Calculate win probabilities
  results.averageScores.team1 /= iterations;
  results.averageScores.team2 /= iterations;

  return results;
}
```

## Machine Learning Integration

### Model Training

Training data includes:

- **Historical Player Performance**: 5+ years of weekly stats
- **Game Context**: Score differential, time remaining, down/distance
- **Environmental Data**: Weather, injuries, matchups
- **Team Performance**: Offensive/defensive efficiency metrics

### Feature Engineering

Key features for ML models:

```python
features = [
    'player_age',
    'targets_per_game_l4w',  # Last 4 weeks average
    'red_zone_share',
    'opponent_def_rank_vs_pos',
    'weather_wind_speed',
    'is_home_game',
    'days_rest',
    'injury_probability',
    'team_implied_total',  # Vegas betting total
    'game_script_prediction'  # Expected lead/trail
]
```

### Model Types

- **Linear Regression**: Baseline projections for stable players
- **Random Forest**: Non-linear relationships and feature interactions
- **Neural Networks**: Complex pattern recognition in large datasets
- **Ensemble Methods**: Combine multiple models for improved accuracy

## Validation & Accuracy

### Backtesting

Test projection accuracy against historical results:

```python
def calculate_projection_accuracy(projections, actual_results):
    metrics = {
        'mean_absolute_error': mean(abs(projections - actual_results)),
        'root_mean_square_error': sqrt(mean((projections - actual_results) ** 2)),
        'correlation': correlation_coefficient(projections, actual_results),
        'hit_rate_floor': percent_above_floor(actual_results, projections),
        'hit_rate_ceiling': percent_below_ceiling(actual_results, projections)
    }
    return metrics
```

### Continuous Improvement

- **Weekly Accuracy Reports**: Track projection vs actual performance
- **Model Retraining**: Update models with new data weekly
- **Feature Selection**: Remove/add features based on performance
- **Hyperparameter Tuning**: Optimize model parameters

## Simulation Outputs

### Individual Player

```json
{
  "playerId": "player_123",
  "week": 8,
  "projection": {
    "points": 18.4,
    "floor": 8.2,
    "ceiling": 31.7,
    "confidence": 78
  },
  "factors": [
    {
      "type": "matchup",
      "description": "vs. 32nd ranked pass defense",
      "impact": 0.15
    },
    {
      "type": "weather",
      "description": "Indoor game",
      "impact": 0.05
    }
  ]
}
```

### Team Matchup

```json
{
  "team1": "Team Alpha",
  "team2": "Team Beta",
  "week": 8,
  "simulation": {
    "team1WinPct": 67.3,
    "team2WinPct": 32.7,
    "projectedScores": {
      "team1": 118.6,
      "team2": 104.2
    },
    "confidenceInterval": {
      "team1": [98.1, 139.1],
      "team2": [87.4, 121.0]
    }
  }
}
```

### Season Projections

```json
{
  "teamId": "team_456",
  "currentWeek": 8,
  "seasonProjection": {
    "finalRecord": {
      "wins": 8.4,
      "losses": 5.6
    },
    "playoffProbability": 73.2,
    "championshipProbability": 12.8,
    "strengthOfSchedule": 0.52,
    "projectedFinalRanking": 3
  }
}
```

## API Integration

### Endpoints

```
GET /api/simulations/player/{playerId}/week/{week}
GET /api/simulations/matchup/{team1Id}/{team2Id}/week/{week}
GET /api/simulations/league/{leagueId}/playoffs
GET /api/simulations/trade-analyzer
POST /api/simulations/custom-scenario
```

### Real-time Updates

- **Live Game Impact**: Update projections during games
- **Injury Updates**: Immediate recalculation on injury news
- **Weather Changes**: Adjust for updated weather forecasts
- **Line Movement**: Incorporate Vegas line changes

## Performance Optimization

### Caching Strategy

- **Player Projections**: Cache for 1 hour, invalidate on news
- **Matchup Simulations**: Cache for 4 hours during week
- **Season Projections**: Cache for 24 hours, update after games

### Distributed Computing

- **Parallel Processing**: Run simulations across multiple cores
- **Queue System**: Background processing for computationally intensive
  simulations
- **Database Optimization**: Indexed queries for historical data retrieval

## Future Enhancements

### Advanced Analytics

- **Ownership Optimization**: DFS-style lineup optimization
- **Trade Deadline Strategy**: Multi-team trade scenario analysis
- **Draft Preparation**: Pre-season projection models
- **Keeper/Dynasty Analysis**: Multi-year player valuation

### Real-time Features

- **Live Projection Updates**: During-game adjustment based on usage
- **Alerts System**: Notify users of significant projection changes
- **Streaming Recommendations**: Suggest waiver wire pickups
- **Sit/Start Advisor**: Automated lineup recommendations
