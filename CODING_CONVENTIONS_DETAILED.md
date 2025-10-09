# Gauntlet Fantasy Football - Detailed Coding Conventions

This document provides detailed examples, explanations, and patterns referenced in `.cursorrules`. Use this as a reference when you need deeper context.

## Table of Contents
- [Type System Deep Dive](#type-system-deep-dive)
- [Function Patterns Examples](#function-patterns-examples)
- [Multi-League Architecture](#multi-league-architecture)
- [Sleeper API Strategy](#sleeper-api-strategy)
- [File Organization Patterns](#file-organization-patterns)
- [Component Patterns Deep Dive](#component-patterns-deep-dive)
- [Performance Optimization](#performance-optimization)
- [Testing Philosophy](#testing-philosophy)
- [Development Workflows](#development-workflows)

---

## Type System Deep Dive

### Central Type Definitions (MANDATORY)

**ALWAYS import domain types from `@gauntlet/types`:**

```typescript
// ✅ CORRECT: Import from central package
import type { 
  SleeperLeague, 
  SleeperRoster, 
  SleeperMatchup,
  SleeperUser,
  SleeperPlayer,
  PlayerStats,
  NFLState,
} from '@gauntlet/types';

// ❌ WRONG: Redefining types locally
interface SleeperLeague { ... }
interface SleeperRoster { ... }
```

### Central Types Available

**Sleeper API Types** (`@gauntlet/types`):
- Core: `SleeperLeague`, `SleeperRoster`, `SleeperUser`, `SleeperMatchup`, `SleeperPlayer`
- Stats: `PlayerStats` (100+ stat fields), `NFLState`
- Draft: `SleeperDraft`, `SleeperDraftPick`, `SleeperTradedPick`
- Transactions: `SleeperTransaction`, `SleeperPlayoffMatchup`
- Multi-league keys: `TeamKey`, `MatchupKey`, `PlayerWeekKey`
- Type literals: `LeagueStatus`, `TransactionType`, `NFLPosition`, `RosterPosition`

**Simulation & Variance Types** (`@gauntlet/types`):
- Lineup: `LineupPlayer`, `Lineup`
- Results: `MatchupResult`, `MatchupSimulationResult`, `ScoreDistribution`, `ImpliedOdds`
- Variance: `PositionVarianceRecord`, `PlayerVarianceRecord`, `ProjectionErrorRecord`, `VarianceData`
- Sampling: `SamplingContext`

**Server & Metrics Types** (`@gauntlet/types`):
- API Client: `GauntletAPIOptions`, `LeagueOddsResponse`, `MatchupSimulationResponse`
- Snapshot: `CompleteSnapshot`, `PreviousSnapshot`, `ValidationResult`
- Metrics: `Metrics`, `MetricsSummary`
- Database: `ModelStats`

### When to Define Local Types

✅ **Component-specific props** (e.g., `ButtonProps`, `ModalProps`)
✅ **Route-specific request/response shapes** (API transformations)
✅ **UI-only state management types** (view-specific state)
✅ **Temporary transformation types** (internal to a single function/file)

❌ **Sleeper API responses** (use `@gauntlet/types`)
❌ **Cross-app domain models** (use `@gauntlet/types`)
❌ **Analytics data structures** (use `@gauntlet/types` if shared)

### Domain-Specific Types

```typescript
// ✅ Always use composite keys for uniqueness
type TeamKey = `${string}-${number}`; // leagueId-rosterId
type MatchupKey = `${string}-${number}-${number}`; // leagueId-week-matchupId
type PlayerWeekKey = `${number}:${string}`; // week:playerId

// ✅ Simulation result interfaces
interface MatchupSimulation {
  team1WinPct: number;
  team2WinPct: number;
  team1Scores: ScoreDistribution;
  team2Scores: ScoreDistribution;
  iterations: number;
  generatedAt: string;
}
```

---

## Function Patterns Examples

### Arrow Functions Over Classes

**ALWAYS use arrow functions and factory patterns. NEVER use classes:**

```typescript
// ✅ CORRECT: Arrow function factory pattern
export const createMetrics = (): Metrics => {
  const counters = new Map<string, number>();
  const timers = new Map<string, number[]>();

  return {
    increment: (metric: string, value = 1): void => {
      const current = counters.get(metric) || 0;
      counters.set(metric, current + value);
    },
    getSummary: (): MetricsSummary => {
      return { counters: Object.fromEntries(counters), timers: {...} };
    }
  };
};

// ✅ CORRECT: Standalone arrow functions
export const calculateScore = (player: Player): number => {
  return player.stats.reduce((sum, stat) => sum + stat.points, 0);
};

// ✅ CORRECT: Arrow function API client factory
export const createAPIClient = (options: ClientOptions = {}): APIClient => {
  const baseUrl = options.baseUrl || 'https://api.example.com';
  
  return {
    fetchData: async (id: string): Promise<Data> => {
      const response = await fetch(`${baseUrl}/data/${id}`);
      return response.json();
    }
  };
};

// ❌ WRONG: Class-based approach
export class Metrics {
  private counters = new Map();
  increment(metric: string): void { ... }
}

// ❌ WRONG: Regular function declaration
export function calculateScore(player: Player): number {
  return player.stats.reduce((sum, stat) => sum + stat.points, 0);
}
```

### Why Arrow Functions & Factory Pattern?

**Benefits:**
- ✅ **Consistent code style** across entire codebase
- ✅ **Lexical `this` binding** eliminates context bugs
- ✅ **Closure-based state** more functional and composable
- ✅ **Better tree-shaking** for unused exports
- ✅ **TypeScript inference** works better with arrow functions
- ✅ **Testability** factory pattern enables easy mocking

### Converting Classes to Factory Pattern

**Before (Class):**
```typescript
export class APIClient {
  private baseUrl: string;
  
  constructor(options: Options) {
    this.baseUrl = options.baseUrl || 'default';
  }
  
  async fetch(id: string): Promise<Data> {
    return await fetch(`${this.baseUrl}/${id}`).then(r => r.json());
  }
}

const client = new APIClient({ baseUrl: 'https://api.com' });
```

**After (Factory):**
```typescript
export const createAPIClient = (options: Options = {}): APIClient => {
  const baseUrl = options.baseUrl || 'default';
  
  return {
    fetch: async (id: string): Promise<Data> => {
      return await fetch(`${baseUrl}/${id}`).then(r => r.json());
    }
  };
};

const client = createAPIClient({ baseUrl: 'https://api.com' });
```

---

## Multi-League Architecture

### Multi-League System Foundation

⚠️ **CRITICAL**: This system manages TWO separate Sleeper leagues as one umbrella competition:
- **AFC League**: `1263744209295245312` (12 teams)
- **NFC League**: `1263740549504962561` (12 teams)
- **Total**: 24 teams competing across both leagues

### Multi-League Data Conflicts (CRITICAL BUG PATTERNS)

When aggregating data across leagues, you MUST avoid these patterns:

```typescript
// ❌ WRONG: Creates 6 groups of 4 teams instead of 12 groups of 2 teams
const allMatchups = [...afcMatchups, ...nfcMatchups];
const grouped = groupBy(allMatchups, m => m.matchup_id);

// ✅ CORRECT: Process leagues separately, then combine results
const afcResults = processLeagueMatchups(afcMatchups);
const nfcResults = processLeagueMatchups(nfcMatchups);
const combined = [...afcResults, ...nfcResults];

// ✅ CORRECT: Use composite keys for uniqueness
const teamKey = `${leagueId}-${roster_id}`;
const matchupKey = `${leagueId}-${week}-${matchup_id}`;
```

**Key Principles:**
- Matchup IDs are NOT unique across leagues (both use 1-6)
- Roster IDs are only unique within a league
- Always validate 24-team totals, never assume 12-team counts
- Process leagues individually, then aggregate results

---

## Sleeper API Strategy

### Unified Sleeper Client

**Migration Complete (11/11)!** Always use the unified client:

```typescript
// ✅ CORRECT: Use unified client
import { sleeperClient, createStatsClient } from '@/lib/sleeper/unified-client';

// For general API calls
const league = await sleeperClient.fetchLeague(leagueId);
const rosters = await sleeperClient.fetchRostersWithOwners(leagueId);

// For stats/analytics
const statsClient = createStatsClient();
const playerStats = await statsClient.fetchWeeklyPlayerStats(week);

// ❌ WRONG: Direct API calls
const response = await fetch(`https://api.sleeper.app/v1/league/${id}`);
```

### Why We Unified

**Problems Solved:**
- ❌ **Inconsistent error handling** - some threw, some returned null
- ❌ **Duplicated API calls** - same endpoints implemented 4+ times
- ❌ **Different caching strategies** - memory vs none vs headers-based
- ❌ **No smart caching** - 11K+ players fetched multiple times

**Benefits:**
- ✅ **100% Data Integrity** - Validated across 40+ tests
- ✅ **Smart Caching** - 1 week cache for players
- ✅ **Consistent Error Handling** - Configurable strategies
- ✅ **Single Source of Truth**

### Caching Strategy

```typescript
// ✅ CORRECT: Cache based on data volatility
const players = await client.fetchAllPlayers(); // 1 week cache - static
const stats = await client.fetchWeeklyPlayerStats(week); // 1 hour - semi-static
const matchups = await client.fetchMatchups(leagueId, week); // No cache - live
```

### React Query Strategies

```typescript
export const FETCH_STRATEGIES = {
  // Live scoring data
  realTime: {
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 10000,
    cache: 'no-store'
  },
  
  // Roster/lineup data
  dynamic: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always'
  },
  
  // Player database, historical data
  static: {
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: false
  }
};
```

---

## File Organization Patterns

### Feature-Based Architecture

```
/shared/                        # Cross-feature shared code
  /utils/
    /stats/                     # Statistical utilities
    /calculations/              # Client-side calculations
  /components/                  # Shared components
  /hooks/                       # Shared hooks

/features/                      # Feature-based organization
  /draft-analysis/
    /components/
    /hooks/
    /utils/
    types.ts
    index.ts
  /matchups/
  /stats/
  /transactions/
  /start-sit/
  /reports/

/lib/                           # Infrastructure code only
  /sleeper/                     # Sleeper API client (unified)
  constants.ts
  utils.ts
  hooks.ts

/components/ui/                 # shadcn/ui primitives

/app/                           # Next.js routes (minimal logic)
  /api/
  /[feature]/
```

### Shared Utilities Reference

**Statistics (`@/shared/utils/stats`):**
- `median(values)` - Calculate median
- `mean(values)` - Calculate mean/average
- `standardDeviation(values)` - Calculate standard deviation
- `percentile(values, p)` - Calculate percentile
- `rank(values)` - Rank values (1 = highest)
- `percentileRank(values)` - Get percentile ranks

**Position Analysis (`@/shared/utils/stats`):**
- `getStarterPositionPoints(config)` - Calculate position points
- `aggregatePositionPoints(weekly, range)` - Aggregate across weeks
- `calculatePositionalMedians(dataset, range)` - Position medians
- `calculateAllPositionalAdvantages(dataset, range)` - All team advantages

**Client Calculations (`@/shared/utils/calculations`):**
- `calculateTeamStats(matchups, rosters, ...)` - Team season stats
- `calculatePositionalScoring(matchups, players, ...)` - Position scoring
- `calculationCache` - Shared calculation cache instance

---

## Component Patterns Deep Dive

### Proper Component Structure

```typescript
// ✅ CORRECT: Complete component pattern
import { memo, useMemo } from 'react';
import type { ManagerData } from './types';

interface ManagerTableProps {
  readonly data: ManagerData[];
  readonly onSort?: (field: string) => void;
  readonly loading?: boolean;
}

export const ManagerTable = memo<ManagerTableProps>((props) => {
  const { data, onSort, loading = false } = props;
  
  // Extract complex calculations to useMemo
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.score - a.score);
  }, [data]);
  
  // Component logic (max 200 lines)
  
  return (
    <table className="w-full">
      {/* JSX */}
    </table>
  );
});

ManagerTable.displayName = 'ManagerTable';
```

### Extract Calculations to Hooks

```typescript
// ✅ CORRECT: Custom hook for complex state/calculations
const useManagerStats = (data: ManagerData[]) => {
  return useMemo(() => {
    return {
      total: data.length,
      average: mean(data.map(d => d.score)),
      median: median(data.map(d => d.score)),
      topPerformer: maxBy(data, d => d.score)
    };
  }, [data]);
};

// Use in component
export const ManagerAnalysis = memo((props) => {
  const { data } = props;
  const stats = useManagerStats(data);
  
  return <div>{/* Use stats */}</div>;
});
```

### Split Large Components

```typescript
// ❌ WRONG: 1,624-line mega-component
export const ManagerAnalysis = () => {
  // 50 useState declarations
  // 200 lines of useMemo
  // 1000+ lines of JSX
};

// ✅ CORRECT: Split into focused sub-components
// ManagerAnalysis/index.tsx (100 lines)
export const ManagerAnalysis = memo((props) => {
  const { data } = props;
  const [filters, setFilters] = useState(defaultFilters);
  
  return (
    <div>
      <ManagerFilters filters={filters} onChange={setFilters} />
      <ManagerTable data={filteredData} onSort={handleSort} />
      <ManagerStats summary={summary} />
    </div>
  );
});

// ManagerAnalysis/ManagerTable.tsx (150 lines)
export const ManagerTable = memo(({ data, onSort }) => {
  // Table implementation
});

// ManagerAnalysis/ManagerFilters.tsx (80 lines)
export const ManagerFilters = memo(({ filters, onChange }) => {
  // Filter UI
});
```

---

## Performance Optimization

### Parallel API Calls

```typescript
// ✅ ALWAYS prefer parallel API calls
const [league1, league2, players, nflState] = await Promise.all([
  fetchLeague(id1),
  fetchLeague(id2),
  fetchPlayers(),
  fetchNFLState()
]);

// ✅ Process multi-week data in parallel
const weeklyData = await Promise.all(
  weeks.map(week => fetchMatchups(leagueId, week))
);

// ❌ WRONG: Sequential calls
const league1 = await fetchLeague(id1);
const league2 = await fetchLeague(id2);
const players = await fetchPlayers();
```

### Multi-Layer Caching

```typescript
// Layer 1: Browser localStorage (static data)
const BROWSER_CACHE_KEYS = {
  PLAYERS: 'gauntlet_players_v1', // 1 week expiry
  LEAGUE_SETTINGS: 'gauntlet_settings_v1', // Season-long
};

// Layer 2: React Query in-memory cache (dynamic data)
export const CACHE_STRATEGIES = {
  LIVE_SCORES: { staleTime: 0, gcTime: 5 * 60 * 1000 },
  MATCHUPS: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 },
  ROSTERS: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000 },
};

// Layer 3: Server-side cache (API layer)
const SERVER_CACHE_DURATION = {
  PLAYERS: 7 * 24 * 60 * 60 * 1000, // 1 week
  STATS: 60 * 60 * 1000, // 1 hour
  LIVE_DATA: 0, // No cache
};
```

---

## Testing Philosophy

### Integration Over Unit Tests

- **Focus**: API-dependent workflows over isolated functions
- **Mock Strategy**: Use captured JSON fixtures from actual Sleeper responses
- **Multi-League Testing**: Always test with both AFC and NFC league datasets
- **Performance Testing**: Validate heavy operations (10K+ simulations, 24-team aggregations)

### Critical Test Scenarios

```typescript
// ✅ CORRECT: Co-located test file
// calculateStats.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTeamStats } from './calculateStats';
import { createMockMatchups } from '@/shared/test/factories';

describe('calculateTeamStats', () => {
  it('calculates correct averages for team', () => {
    const matchups = createMockMatchups({ count: 10 });
    const stats = calculateTeamStats(matchups);
    expect(stats.pointsFor).toBe(120.5);
  });
  
  it('handles empty matchup array', () => {
    expect(calculateTeamStats([])).toEqual({ 
      pointsFor: 0, 
      pointsAgainst: 0 
    });
  });
  
  it('handles multi-league data correctly', () => {
    const afcMatchups = createMockMatchups({ leagueId: 'afc', count: 6 });
    const nfcMatchups = createMockMatchups({ leagueId: 'nfc', count: 6 });
    // Process separately
    const afcStats = calculateTeamStats(afcMatchups);
    const nfcStats = calculateTeamStats(nfcMatchups);
    // Verify 12 matchups total, not 6 with 4 teams each
    expect(afcStats.matchups).toBe(6);
    expect(nfcStats.matchups).toBe(6);
  });
});
```

---

## Development Workflows

### Data-First Development

```typescript
// PHASE 1: Data Strategy & Validation (Use debug scripts)
// 1. Write temporary debug script
const debugScript = `
  const data = await fetch('/api/sleeper/...');
  console.log('Structure:', data);
  // Validate multi-league aggregation
  // Test edge cases
`;

// 2. Build core data functions
const fetchAndTransformData = async () => {
  // Handle errors upfront
  // Use composite keys
  // Apply league-specific calculations
};

// 3. Test with actual API calls

// PHASE 2: UI Implementation (After data works)
// 4. Build UI components
// 5. Add loading states and error boundaries
// 6. Clean up debug scripts
```

### Environment-Based Debug Pattern

```typescript
const DEBUG = process.env.SLEEPER_DEBUG === '1';
if (DEBUG) {
  console.log('[SLEEPER API] Fetching', url, 'with params', params);
  console.log('[DEBUG] Response:', { status, data: data?.slice(0, 2) });
}
```

### API Route Patterns

```typescript
// ✅ Structured error responses
return NextResponse.json({
  error: 'Failed to fetch league data',
  message: error.message,
  _meta: {
    source: 'sleeper_api',
    responseTime: `${Date.now() - startTime}ms`,
    fallback: false
  }
}, { status: 500 });
```

---

## Import/Export Standards

```typescript
// ✅ CORRECT: Type-only imports
import type { SleeperLeague, SleeperRoster } from '@gauntlet/types';
import { sleeperClient } from '@/lib/sleeper/unified-client';

// ✅ CORRECT: Import ordering
// 1. React/Next.js
import { memo, useMemo } from 'react';
// 2. External packages
import { useQuery } from '@tanstack/react-query';
// 3. Internal packages
import type { SleeperMatchup } from '@gauntlet/types';
// 4. Absolute imports
import { calculateStats } from '@/shared/utils/stats';
// 5. Relative imports
import { ManagerTable } from './ManagerTable';
// 6. Types
import type { ManagerData } from './types';

// ✅ CORRECT: Barrel exports
// features/draft-analysis/components/index.ts
export { ManagerAnalysis } from './ManagerAnalysis';
export { PositionChart } from './PositionChart';
```

---

## Simulation Engine Strategy

### Monte Carlo Simulation Principles

- **Iterations**: Minimum 10,000 for statistical significance
- **Variance Source**: Historical projection vs actual performance (2022-2024 data)
- **Player vs Position Weighting**: 70% player-specific, 30% position-level
- **Distribution Sampling**: Direct historical sampling, not assumed normal distributions

### Position Variance Constants

```typescript
const POSITION_VARIANCE = {
  K: 0.50,   // Most predictable
  QB: 0.80,  // Moderate variance
  TE: 0.99,  // Highly volatile
  RB: 0.98,  // Highly volatile
  WR: 0.98,  // Highly volatile
  DEF: 0.75  // Moderate-high variance
};
```

---

*This document complements the concise `.cursorrules` file with detailed examples and explanations. Last updated: October 2025*

