# @gauntlet/types

Shared TypeScript types and interfaces used across The Gauntlet monorepo.

## Usage

```typescript
import { Player, League, SimulationResult } from '@gauntlet/types';

const player: Player = {
  id: 'player_123',
  name: 'Josh Allen',
  position: 'QB',
  team: { /* ... */ },
  status: 'active',
  fantasyPoints: 342.5,
  projectedPoints: 22.8,
  byeWeek: 12
};
```

## Type Categories

### Core Fantasy Types
- `Player` - Individual NFL players
- `FantasyTeam` - User's fantasy team
- `League` - Fantasy league configuration
- `Position` - Player positions (QB, RB, WR, etc.)

### Scoring System Types
- `ScoringSystem` - Complete scoring configuration
- `PassingScoring`, `RushingScoring`, etc. - Position-specific scoring

### Simulation Types
- `SimulationResult` - Matchup simulation outcomes
- `PlayerProjection` - Individual player projections
- `ProjectionFactor` - Factors affecting projections

### API Types
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API responses

### User Management
- `User` - User account information

## Development

```bash
# Build types
pnpm build

# Watch for changes
pnpm dev

# Type check
pnpm type-check
``` 