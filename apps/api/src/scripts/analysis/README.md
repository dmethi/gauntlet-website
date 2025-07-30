# Analysis Scripts

This directory contains scripts used to analyze historical fantasy football data and develop our variance models. These scripts were instrumental in understanding player performance patterns and building the Monte Carlo simulation engine.

## Scripts

### Data Analysis
- `analyze-player-projections.ts`: Analyzes projection accuracy and patterns for individual players
- `analyze-projection-relationships.ts`: Studies relationships between projected and actual points
- `analyze-variance-models.ts`: Evaluates position-level and player-specific variance patterns

### Model Development
- `build-variance-models.ts`: Initial attempts at building variance models (superseded by final implementation)
- `verify-variance-data.ts`: Validates variance model outputs and assumptions

## Key Findings

1. **Normalized Error Issues**
   - Initial approach using `(actual - projected) / projected` led to extreme variances
   - Low projections (< 5 points) produced unrealistic error percentages
   - Switched to analyzing raw point distributions and absolute deviations

2. **Position-Level Patterns**
   - Different positions show distinct variance patterns
   - QBs: Most predictable, tighter ranges
   - WRs/TEs: Higher variance, especially on upside
   - RBs: Moderate variance, more balanced up/downside

3. **Player-Specific Trends**
   - Players with consistent roles show more predictable outcomes
   - High-volume players tend to have lower relative variance
   - Projection level correlates with variance magnitude

4. **Distribution Shapes**
   - Outcomes don't follow normal/triangular distributions
   - Direct sampling from historical patterns more accurate
   - Position-specific distribution shapes evident

## Usage

These scripts are maintained for:
- Reference when improving models
- Understanding historical decision-making
- Analyzing new data patterns

To run any script:
```bash
pnpm tsx apps/api/src/scripts/analysis/[script-name].ts
``` 