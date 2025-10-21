# Integration Constraints

## Purpose

Constraints that span multiple domains or external system boundaries. Use this
doc when a constraint doesn't fit neatly into a single feature or technical
area.

---

## Sleeper API Client Usage

### Unified Client Pattern

**All Sleeper API calls** must go through `@/lib/sleeper/unified-client`. Never
use direct `fetch()` calls to Sleeper endpoints.

**Rationale**:

- Centralized rate limiting (Sleeper has undocumented limits)
- Consistent error handling and retry logic
- Caching layer reduces redundant calls
- Easier to mock in tests

```typescript
// ❌ WRONG: Direct fetch
const response = await fetch(`https://api.sleeper.app/v1/league/${id}`);

// ✅ CORRECT: Use unified client
import { sleeperClient } from '@/lib/sleeper/unified-client';
const league = await sleeperClient.getLeague(id);
```

---

### Caching Strategy

**Cache duration by data type**:

- **Player metadata** (names, positions): 24 hours (rarely changes mid-season)
- **League settings**: 1 hour (trades, settings can change weekly)
- **Rosters**: 5 minutes (lineup changes happen frequently)
- **Matchups**: No cache during game day, 1 hour on off-days
- **Transactions**: Real-time (no cache)

**Rationale**: Balance freshness with API load. Cache expiration tuned based on
how frequently data actually changes in Sleeper.

**Flexibility**: Individual features can override cache via `{ fresh: true }`
option if they need real-time data.

```typescript
// Force fresh data (bypasses cache)
const rosters = await sleeperClient.getRosters(leagueId, { fresh: true });
```

---

### Error Handling

Client should handle these Sleeper API errors gracefully:

| Error           | Status | Handling                                              |
| --------------- | ------ | ----------------------------------------------------- |
| Rate limit      | 429    | Exponential backoff, retry after 60s                  |
| Not found       | 404    | Return null, don't throw (league might not exist yet) |
| Server error    | 500+   | Retry 3x, then fall back to cached data if available  |
| Network timeout | -      | Retry 3x with increasing timeout (5s, 10s, 20s)       |

**Never show raw API errors to users.** Map to user-friendly messages:

```typescript
// ❌ BAD: Leaks implementation
throw new Error('Sleeper API returned 429');

// ✅ GOOD: User-actionable message
throw new Error('Unable to load data. Please try again in a moment.');
```

---

## Gemini API for Report Narratives

### Usage Constraints

Only `apps/web/src/lib/reports/recap` should call Gemini API for narrative
generation.

**Why restricted**:

- API costs money per token
- Rate limits apply
- Consistency in tone/style requires centralized prompts

**Current use case**: Weekly recap report narrative ("What happened this week in
your league?")

---

### Prompt Structure

All Gemini prompts must follow this pattern:

```typescript
const prompt = `
You are a fantasy football analyst writing a weekly recap.

Context:
- League: ${leagueName}
- Week: ${week}
- Top performer: ${topTeam}

Guidelines:
- Be concise (3-4 paragraphs max)
- Celebrate high performers
- Note interesting trades or waiver pickups
- Avoid jargon (explain football terms)

Data:
${JSON.stringify(weekData, null, 2)}
`;
```

**Key sections**:

1. **Role definition** - Sets tone and style
2. **Context** - Gives Gemini situational awareness
3. **Guidelines** - Constraints on output format
4. **Data** - Structured input for analysis

**Rationale**: Consistent prompt structure improves output quality and makes
prompts easier to version/test.

---

### Retry and Fallback

If Gemini API fails (timeout, rate limit, server error):

1. **Retry once** after 5s delay
2. **If retry fails**, fall back to template-based narrative
3. **Never block report generation** - data tables are more important than prose

```typescript
try {
  narrative = await gemini.generate(prompt);
} catch (error) {
  log.warn('Gemini failed, using template fallback', error);
  narrative = generateTemplateNarrative(weekData); // Deterministic fallback
}
```

**Rationale**: Users rely on weekly reports. Better to send report with boring
narrative than no report at all.

---

## Caching Across Features

### When to Use React Query

Use React Query for:

- API data that changes over time (rosters, matchups, stats)
- Data shared across multiple components
- Data that needs background refetching

**Don't use** for:

- Computed values (use `useMemo` instead)
- Component-local state
- Data that never changes (constants)

---

### Cache Key Conventions

```typescript
// Pattern: [domain, ...identifiers, ...filters]

// League data
['league', leagueId][('league', leagueId, 'rosters')][
  ('league', leagueId, 'users')
][
  // Matchup data (include week)
  ('matchups', leagueId, week)
][('matchup-odds', leagueId, week, matchupId)][
  // Player data
  'players'
][('player', playerId)][ // All players (cached 24h)
  // Stats (include time range)
  ('stats', leagueId, 'season')
][('stats', leagueId, 'weeks', startWeek, endWeek)];
```

**Rationale**: Hierarchical keys make invalidation easier. Can invalidate all
matchup data with `queryClient.invalidateQueries(['matchups'])`.

---

### Invalidation Strategy

**When to invalidate**:

- After user action (trade, roster change)
- When entering a new week
- After cron job completes (new projections loaded)

```typescript
// Invalidate specific matchup
queryClient.invalidateQueries(['matchup-odds', leagueId, week, matchupId]);

// Invalidate entire week (rosters changed)
queryClient.invalidateQueries(['matchups', leagueId, week]);
```

**Don't over-invalidate**: Invalidating root keys (e.g., `['league']`) clears
everything, forcing full refetch.

---

## Cross-Feature Data Flow

### Shared Data Pipeline

Several features need similar data processing:

1. **Fetch raw Sleeper data** (via unified client)
2. **Normalize IDs** (apply multi-league composite keys)
3. **Enrich with player metadata** (names, positions, photos)
4. **Apply feature-specific transforms**

**Location of shared steps**: `apps/web/src/shared/data-loaders/`

**Feature-specific transforms**: Keep in feature's `utils/` folder

**Rationale**: Avoids duplication while keeping feature logic isolated.

---

### Example: Matchup Data Flow

```
Sleeper API
    ↓
unified-client (caching, retry)
    ↓
multi-league-normalizer (composite keys, parallel processing)
    ↓
player-enricher (add names, positions)
    ↓
matchup-analyzer (feature-specific: odds, scoring pace)
    ↓
UI components
```

Each step is a pure function that can be tested independently.

---

## Report Generation Pipeline

Weekly recap reports combine data from multiple features:

1. **League standings** (`features/stats`)
2. **Matchup results** (`features/matchups`)
3. **Top performers** (`features/stats`)
4. **Transactions** (`features/transactions`)
5. **Gemini narrative** (external API)

**Orchestration**: `apps/web/src/lib/reports/recap/generate-recap.ts`

**Constraint**: Each feature exposes a `getData()` function that returns JSON.
Report generator composes them.

```typescript
// Feature contract for reports
export const getMatchupDataForReport = async (
  leagueId: string,
  week: number
): Promise<MatchupReportData> => {
  // Feature owns the shape of MatchupReportData
  // Report generator doesn't care about implementation
};
```

**Rationale**: Keeps report generator thin. Features control their own data
shapes.

---

## Development vs. Production Modes

### Environment-Specific Behavior

Some integrations behave differently in development:

| Integration | Development                 | Production               |
| ----------- | --------------------------- | ------------------------ |
| Sleeper API | Real API with shorter cache | Real API with full cache |
| Gemini API  | Mock responses (faster)     | Real API                 |
| Cron jobs   | Manual trigger only         | Scheduled via Vercel     |
| Database    | Optional (feature flags)    | Required for history     |

**How to toggle**: Use `process.env.NODE_ENV`

```typescript
const ENABLE_GEMINI = process.env.NODE_ENV === 'production';

const narrative = ENABLE_GEMINI
  ? await gemini.generate(prompt)
  : generateMockNarrative(); // Deterministic for dev
```

**Rationale**: Faster local development, conserves API quotas during iteration.

---

## Type System Contracts

### Central Types Only

**All domain types** must be imported from `@gauntlet/types`:

```typescript
// ✅ CORRECT
import type { SleeperLeague, SleeperRoster, SleeperMatchup } from '@gauntlet/types';

// ❌ WRONG: Redefining in local file
interface SleeperLeague { ... }
```

**Local types allowed for**:

- Component props (`ButtonProps`, `TableProps`)
- UI-specific state (`FormState`, `ModalState`)
- Route-specific transforms (`PageData`, `ApiResponse`)

**Rationale**: Prevents type drift. If Sleeper API changes, we update
`@gauntlet/types` once.

---

### Type Guards for External Data

All data from external APIs should be validated at the boundary:

```typescript
import { z } from 'zod';

// Define schema at integration point
const SleeperLeagueSchema = z.object({
  league_id: z.string(),
  name: z.string(),
  season: z.string(),
  // ... complete schema
});

// Validate before using
const rawData = await fetch(url).then(r => r.json());
const league = SleeperLeagueSchema.parse(rawData); // Throws if invalid
```

**Rationale**: External APIs can change without notice. Validation catches
breaking changes before they cause runtime errors.

---

## Changing Integration Contracts

Before modifying any pattern in this doc:

1. **Check dependents** - Which features rely on this integration?
2. **Propose migration** - How will existing code adapt?
3. **Update tests** - Integration tests should cover new behavior
4. **Document breaking changes** - Add migration guide if needed

**Don't silently break contracts** - coordinate with feature owners (or update
features yourself).
