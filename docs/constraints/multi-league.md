# Multi-League Constraints

## Problem

Gauntlet tracks a registry-defined set of separate Sleeper leagues. The 2026
season has **three leagues**, and future seasons may add more. IDs from the
Sleeper API are **only unique within a league**, not globally.

**Critical invariants**:

- Matchup IDs repeat across leagues
- Roster IDs only unique within a league
- Processing data from multiple leagues simultaneously creates ID collisions

---

## Core Pattern: Process Separately, Combine Last

```typescript
// ❌ WRONG: Merges too early, loses league context
const allMatchups = leagueInputs.flatMap(input => input.matchups);
const grouped = groupBy(allMatchups, m => m.matchup_id);
// Result: unrelated matchups share groups (collision!)

// ✅ CORRECT: Process leagues independently
const results = leagueInputs.map(({ leagueId, matchups }) =>
  processLeague(matchups, leagueId)
);
const combined = results.flat();
```

**Rationale**: Data must maintain league context throughout processing pipeline.
Only merge at presentation layer when league distinction is no longer needed.

---

## Composite Key Pattern

When storing or indexing multi-league data, always use composite keys:

```typescript
// Matchup keys
const matchupKey = `${leagueId}-${week}-${matchupId}`;

// Roster keys
const rosterKey = `${leagueId}-${rosterId}`;

// Team keys (if roster represents a team)
const teamKey = `${leagueId}-${userId}`;
```

**Rationale**: Ensures uniqueness across leagues. Makes data provenance explicit
in logs/debugging.

---

## Data Flow Requirements

### API Fetching

```typescript
// Always fetch leagues in parallel, keep separate
const leagueData = await Promise.all(
  leagueRefs.map(async ({ leagueId }) => ({
    leagueId,
    data: await sleeperClient.getLeague(leagueId),
  }))
);

// Process each league with its context attached
const results = await Promise.all(
  leagueData.map(({ leagueId, data }) => processLeagueData(data, leagueId))
);
```

**Never** create a generic "league processor" that loses track of which league
is being processed.

---

### React Query Keys

```typescript
// ❌ WRONG: Loses league context
const matchupKey = ['matchup', week, matchupId];

// ✅ CORRECT: League is part of the key
const matchupKey = ['matchup', leagueId, week, matchupId];
```

**Rationale**: Prevents cache collisions when displaying data from multiple
leagues.

---

### Database Storage

When persisting historical data (in `apps/server`), schema must enforce league
context:

```prisma
model Matchup {
  id        String @id @default(uuid())
  leagueId  String  // Required, not nullable
  week      Int
  matchupId Int     // Not unique alone!

  @@unique([leagueId, week, matchupId])
}
```

**Rationale**: Database constraints prevent accidentally storing ambiguous data.

---

## Common Mistakes

### Mistake 1: Grouping Before Processing

```typescript
// ❌ Creates 6 matchup groups instead of 12
const all = [...afcMatchups, ...nfcMatchups];
const groups = groupBy(all, m => m.matchup_id);
```

**Fix**: Group within each league, then combine groups.

---

### Mistake 2: Shared Lookup Tables

```typescript
// ❌ Roster lookup loses league context
const rosterMap = new Map<number, Roster>();
leagueRosters
  .flatMap(input => input.rosters)
  .forEach(r => rosterMap.set(r.roster_id, r)); // Overwrites!
```

**Fix**: Use composite keys or nested maps:

```typescript
// Option A: Composite key
const rosterMap = new Map<string, Roster>();
leagueRosters.forEach(({ leagueId, rosters }) =>
  rosters.forEach(r => rosterMap.set(`${leagueId}-${r.roster_id}`, r))
);

// Option B: Nested map (preferred for frequent league-based lookups)
const rostersByLeague = new Map<string, Map<number, Roster>>();
leagueRosters.forEach(({ leagueId, rosters }) =>
  rostersByLeague.set(leagueId, new Map(rosters.map(r => [r.roster_id, r])))
);
```

---

### Mistake 3: Implicit League Assumptions

```typescript
// ❌ Function assumes single league
function calculateStandings(rosters: Roster[]): Standings {
  return rosters.sort((a, b) => b.wins - a.wins);
}

// ✅ Explicit league parameter
function calculateStandings(rosters: Roster[], leagueId: string): Standings {
  return rosters
    .sort((a, b) => b.wins - a.wins)
    .map(r => ({
      ...r,
      leagueId, // Attach context
    }));
}
```

**Rationale**: Even if current function doesn't use `leagueId`, downstream
consumers will need it. Attach early.

---

## Testing Multi-League Logic

Every function that processes league data should have tests covering:

1. **Single league** - Verify logic works correctly in isolation
2. **Multiple leagues** - Verify no cross-league contamination
3. **ID collisions** - Explicitly test that same IDs from different leagues
   don't conflict

```typescript
describe('processMatchups', () => {
  it('handles same matchup_id across leagues', () => {
    const leagueOne = [{ matchup_id: 1, roster_id: 1 }];
    const leagueTwo = [{ matchup_id: 1, roster_id: 1 }];

    const results = processMultiLeague([
      { leagueId: 'league-one', matchups: leagueOne },
      { leagueId: 'league-two', matchups: leagueTwo },
    ]);

    expect(results).toHaveLength(2); // Not 1!
    expect(results[0].key).toBe('league-one-1-1');
    expect(results[1].key).toBe('league-two-1-1');
  });
});
```

---

## When to Merge Leagues

Only merge when:

- Displaying combined standings (with league indicator in UI)
- Aggregate statistics (total points across all teams)
- Cross-league comparisons across registered leagues

**UI Requirement**: Always show league context (badge, color, icon) when
displaying merged data.

---

The league registry is the source of truth for the season's league set. Do not
encode a maximum count or fall back to AFC/NFC-shaped contracts.

**Constraint remains the same**: Process separately, combine last.
