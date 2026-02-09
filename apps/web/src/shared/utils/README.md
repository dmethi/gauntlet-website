# Shared Utilities

Cross-feature utilities used by 3+ features. These are domain-agnostic helpers that promote code reuse and maintainability.

## Usage

Import utilities from `@/shared/utils/[module]`:

```typescript
import { playoffWeight } from '@/shared/utils/calculations';
import { formatDelta } from '@/shared/utils/formatting';
import { median } from '@/shared/utils/stats';
```

## Modules

### `@/shared/utils/calculations`

Client-side calculations for team statistics and fantasy metrics.

**`playoffWeight(week: number): number`**
Returns weight multiplier for playoff weeks:

- Weeks 1-14, 18: 1.0 (regular season)
- Week 15: 1.3 (wild card)
- Week 16: 1.6 (semi-finals)
- Week 17: 2.0 (championship)

**`calculateTeamStats(rosters, matchupsByWeek, users)`**
Computes expected wins and luck ratings from matchup data.

**`calculatePositionalScoring(matchupsByWeek, playerStats, rosterId)`**
Calculates positional scoring breakdown for a team.

### `@/shared/utils/formatting`

Number and data formatting utilities.

**`formatDelta(value: number, decimals?: number): string`**
Formats a numeric delta with sign (+/-) and specified decimals:

```typescript
formatDelta(5.5); // '+5.5'
formatDelta(-3.2); // '-3.2'
formatDelta(5.555, 2); // '+5.56'
```

**`formatNumber(value: number, decimals?: number): string`**
Formats a number with thousand separators and decimals.

**`formatCompact(value: number): string`**
Formats large numbers in compact notation (e.g., 1.2K, 3.5M).

**`formatPercentage(value: number, decimals?: number): string`**
Formats a decimal as percentage (e.g., 0.156 → '15.6%').

**`formatOdds(probability: number): string`**
Formats probability as odds (e.g., 0.75 → '3:1').

### `@/shared/utils/stats`

Statistical calculation utilities.

**`median(values: number[]): number`**
Calculates median of an array. Returns 0 for empty arrays.

**`mean(values: number[]): number`**
Calculates arithmetic mean. Returns 0 for empty arrays.

**`standardDeviation(values: number[]): number`**
Calculates population standard deviation.

**`percentile(values: number[], p: number): number`**
Calculates the p-th percentile (0-100).

**`ranks.calcRanks(...)`**
Calculate fantasy ranks across leagues.

**`join.joinWeeklyTeamStats(...)`**
Join weekly stats with projections.

**`compose.composeTeamStats(...)`**
Compose team statistics from multiple sources.

### `@/shared/utils/colors`

Color utilities for charts and UI.

**`getRankColor(rank: number): string`**
Returns color for rank indicator (green for good, red for bad).

**`getPerformanceColor(performance: number): string`**
Returns color based on performance value.

**`DIVERGING_COLORS`**
Color scales for diverging data (e.g., win/loss margins).

**`getTeamColor(index: number): string`**
Returns consistent color for team by index.

## Adding New Utilities

Before adding a utility here:

1. **Verify cross-feature usage** - Must be used by 3+ features
2. **Check for duplicates** - Search existing features for similar utilities
3. **Keep it domain-agnostic** - No feature-specific business logic
4. **Add tests** - Include unit tests in `[module].test.ts`
5. **Document here** - Update this README

## Migration Guide

When moving a utility from a feature to shared:

1. Copy utility to appropriate shared module
2. Add export to module's `index.ts`
3. Update imports in all consuming files
4. Remove original from feature
5. Run tests to verify no regressions
6. Update this README
