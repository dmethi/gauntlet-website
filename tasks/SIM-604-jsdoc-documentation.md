# Task SIM-604: Add JSDoc to All Exported Functions

**Category:** CLEAN  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 45 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Add comprehensive JSDoc documentation to all 11 exported functions in sim-engine. This provides IDE tooltips, improves developer experience, and serves as inline API documentation.

---

## 🎯 Objective

Document all exported functions with complete JSDoc including description, @param tags, @returns tags, and @example sections following the pattern established in apps/server.

---

## 📂 Context Needed

**Files to Document:**
- `apps/sim-engine/src/models/matchup.ts` (2 exported functions)
- `apps/sim-engine/src/models/variance.ts` (5 exported functions)
- `apps/sim-engine/src/data/variance-loader.ts` (3 exported functions)
- `apps/sim-engine/src/simulations/season-sim.ts` (1 exported function)

**Reference:**
- `apps/server/src/lib/gauntlet-api-client.ts` (lines 1-100) - JSDoc examples
- `apps/server/src/lib/historical-data.ts` (lines 1-50) - JSDoc examples

---

## 📝 Steps

### 1. Document matchup.ts Functions

**Function 1: simulateMatchupProbabilityFromPlayers**

```typescript
/**
 * Simulate a matchup between two teams using Monte Carlo sampling.
 * 
 * Performs 10,000+ iterations sampling from historical player and position variance
 * distributions to generate win probabilities, score distributions, and implied betting odds.
 * 
 * Supports three game states:
 * - Pre-game: Uses full projections with variance
 * - Live game: Combines actual scores + simulated remaining projections
 * - Post-game: Uses actual scores + minimal remaining projection
 * 
 * @param team1Players - Array of LineupPlayer objects for team 1 (typically 8-9 players)
 * @param team2Players - Array of LineupPlayer objects for team 2 (typically 8-9 players)
 * @param iterations - Number of Monte Carlo iterations to run (default: 10000, min 100 for testing)
 * @param gameProgress - Game completion percentage from 0 (start) to 1 (end)
 * @param liveNflTeams - Optional Set of NFL team codes currently playing live games
 * 
 * @returns Promise<MatchupSimulationResult> containing:
 *   - team1WinPct/team2WinPct: Win probabilities (sum to 1.0)
 *   - medianMargin: Expected point differential
 *   - team1Scores/team2Scores: Score distributions (mean, median, p10, p90)
 *   - impliedOdds: Betting lines (spread, total, moneyline)
 * 
 * @example
 * // Pre-game simulation
 * const result = await simulateMatchupProbabilityFromPlayers(
 *   [{ id: '1', position: 'QB', projection: 24.5 }, ...],
 *   [{ id: '2', position: 'QB', projection: 22.3 }, ...],
 *   10000,
 *   0
 * );
 * console.log(`Team 1 Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
 * 
 * @example
 * // Live game simulation with actual scores
 * const result = await simulateMatchupProbabilityFromPlayers(
 *   [{ id: '1', position: 'QB', projection: 24.5, currentScore: 18.2, nflTeam: 'KC' }, ...],
 *   [{ id: '2', position: 'QB', projection: 22.3, currentScore: 12.4, nflTeam: 'BUF' }, ...],
 *   10000,
 *   0.65, // 65% game complete
 *   new Set(['KC', 'BUF'])
 * );
 * console.log(`Updated Win%: ${(result.team1WinPct * 100).toFixed(1)}%`);
 */
export const simulateMatchupProbabilityFromPlayers = async (
  // ... implementation
);
```

**Function 2: simulateMatchupProbability**

```typescript
/**
 * Simulate a matchup using Lineup objects or LineupPlayer arrays.
 * 
 * Convenience wrapper around simulateMatchupProbabilityFromPlayers that accepts
 * either Lineup objects (with named positions) or LineupPlayer arrays.
 * 
 * @param team1 - Lineup object or array of LineupPlayer for team 1
 * @param team2 - Lineup object or array of LineupPlayer for team 2
 * @param iterations - Number of Monte Carlo iterations (default: 10000)
 * @param gameProgress - Game completion percentage 0-1 (default: 0)
 * 
 * @returns Promise<MatchupSimulationResult> with win probabilities and score distributions
 * 
 * @example
 * // Using Lineup objects
 * const result = await simulateMatchupProbability(
 *   { qb: {...}, rb1: {...}, rb2: {...}, ... },
 *   { qb: {...}, rb1: {...}, rb2: {...}, ... },
 *   10000
 * );
 * 
 * @example
 * // Using LineupPlayer arrays
 * const result = await simulateMatchupProbability(
 *   [qbPlayer, rb1Player, rb2Player, ...],
 *   [qbPlayer, rb1Player, rb2Player, ...],
 *   10000
 * );
 */
export const simulateMatchupProbability = async (
  // ... implementation
);
```

### 2. Document variance.ts Functions

**Function 1: buildSamplingContext**

```typescript
/**
 * Build a sampling context for fast synchronous Monte Carlo simulations.
 * 
 * Pre-fetches historical variance distributions for all players and positions,
 * enabling 10,000+ iterations without repeated database/data lookups. This is
 * a critical performance optimization for real-time simulations.
 * 
 * @param playerIds - Array of Sleeper player IDs to fetch variance data for
 * @param positions - Array of NFL positions (QB, RB, WR, TE, K, DEF)
 * 
 * @returns Promise<SamplingContext> containing Maps of variance distributions:
 *   - positionToOutcomes: Position-level variance distributions
 *   - playerToOutcomes: Player-specific variance distributions
 *   - playerSampleCounts: Number of historical games per player
 *   - positionSampleCounts: Number of historical games per position
 * 
 * @example
 * const playerIds = ['4866', '7564', '8110']; // Mahomes, McCaffrey, Jefferson
 * const positions = ['QB', 'RB', 'WR'];
 * const ctx = await buildSamplingContext(playerIds, positions);
 * 
 * // Now use ctx for 10,000 fast synchronous samples
 * for (let i = 0; i < 10000; i++) {
 *   const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', 24.5);
 * }
 */
export const buildSamplingContext = async (
  // ... implementation
);
```

**Function 2: samplePlayerScoreFromContext**

```typescript
/**
 * Fast synchronous player score sampling using pre-fetched variance context.
 * 
 * Samples from historical variance distributions without async operations,
 * enabling high-performance Monte Carlo loops. Uses 70% player-specific
 * variance when available (≥8 games), otherwise falls back to position variance.
 * 
 * @param ctx - Pre-built SamplingContext from buildSamplingContext()
 * @param playerId - Sleeper player ID to sample for
 * @param position - NFL position (QB, RB, WR, TE, K, DEF)
 * @param projection - Fantasy point projection for the player
 * @param gameProgress - Game completion 0-1, reduces variance for live games (default: 0)
 * 
 * @returns number - Simulated fantasy score for this iteration
 * 
 * @throws Error if projection < 0 or gameProgress not in [0, 1]
 * 
 * @example
 * const ctx = await buildSamplingContext(['4866'], ['QB']);
 * 
 * // Pre-game simulation (full variance)
 * const score1 = samplePlayerScoreFromContext(ctx, '4866', 'QB', 24.5, 0);
 * 
 * // Live game simulation (65% complete, reduced variance)
 * const score2 = samplePlayerScoreFromContext(ctx, '4866', 'QB', 24.5, 0.65);
 */
export const samplePlayerScoreFromContext = (
  // ... implementation
);
```

**Function 3-5: simulatePlayerScore, simulatePlayerRange, getVarianceModel**

Add similar JSDoc to these functions with:
- Clear description of what they do
- All @param tags with types and descriptions
- @returns with expected output
- @example showing typical usage
- @throws for error conditions

### 3. Document variance-loader.ts Functions

**Function 1: getPositionDistribution**

```typescript
/**
 * Get historical variance distribution for an NFL position.
 * 
 * Loads position-level variance from static JSON data with season fallback
 * (tries 2025 → 2024 → 2023). Returns synthetic normal distribution based on
 * historical mean error and standard deviation.
 * 
 * @param position - NFL position code (QB, RB, WR, TE, K, DEF)
 * 
 * @returns Promise<{ outcomes: number[], sampleSize: number }> where:
 *   - outcomes: Array of relative outcome multipliers (actual/projected)
 *   - sampleSize: Number of historical games this distribution is based on
 * 
 * @example
 * const qbVariance = await getPositionDistribution('QB');
 * console.log(`QB variance based on ${qbVariance.sampleSize} games`);
 * console.log(`Sample outcome: ${qbVariance.outcomes[0]}`); // e.g., 0.85 (15% under)
 */
export const getPositionDistribution = async (
  // ... implementation
);
```

**Function 2-3: getPlayerOutcomes, getDataInfo**

Add similar JSDoc with descriptions, params, returns, and examples.

### 4. Document season-sim.ts Function

```typescript
/**
 * Run a full fantasy season simulation with playoff brackets.
 * 
 * ⚠️ EXPERIMENTAL: This function is a placeholder for future season-long
 * simulation features. Currently returns a not-implemented status.
 * 
 * @param weeks - Number of regular season weeks to simulate
 * 
 * @returns Promise<{ totalWeeks: number, status: string, message: string }>
 * 
 * @example
 * const result = await runSeasonSimulation(14);
 * console.log(result.message); // "Season simulation not yet implemented"
 */
export const runSeasonSimulation = async (weeks: number) => {
  // ... implementation
};
```

### 5. Verify Documentation

```bash
# TypeScript compilation should pass
pnpm build

# Check in VS Code: hover over function names
# Should see full JSDoc tooltip
```

---

## ✅ Acceptance Criteria

- [ ] All 11 exported functions have complete JSDoc
- [ ] Each JSDoc includes: description, @param tags, @returns tag, @example section
- [ ] IDE tooltips show documentation on hover
- [ ] All parameter types and return types documented
- [ ] At least 1 realistic @example per function
- [ ] @throws documented for error conditions
- [ ] TypeScript compilation passes with 0 errors

---

## 🔗 Related Tasks

**Depends On:**
- SIM-602: Convert All Functions to Arrow Functions (function signatures stable)
- SIM-603: Add Barrel Exports (exports organized)

**Blocks:**
- SIM-614: Create Comprehensive README (can reference JSDoc)

---

## 📊 Context Usage

- **Files to update:** 4 files (~1000 lines total)
- **Functions to document:** 11 functions
- **Time estimate:** 45 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-604. Please:

1. Read apps/server/src/lib/gauntlet-api-client.ts (lines 1-100) for JSDoc examples
2. Read apps/sim-engine/src/models/matchup.ts
3. Read apps/sim-engine/src/models/variance.ts
4. Add comprehensive JSDoc to all 11 exported functions
5. Include: description, @param, @returns, @example, @throws
6. Verify with pnpm build

Follow the JSDoc patterns in the task file exactly.
```

---

## ✓ Verification Commands

```bash
# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Manual verification in IDE
# Open each file and hover over exported function names
# Should see complete JSDoc tooltip with examples

# Check no @param or @returns tags missing
grep -r "@param" apps/sim-engine/src/ | wc -l  # Should be 30+
grep -r "@returns" apps/sim-engine/src/ | wc -l  # Should be 11+
grep -r "@example" apps/sim-engine/src/ | wc -l  # Should be 11+
```

---

## 📝 Commit Message Template

```
docs(sim-engine): add comprehensive JSDoc to all exported functions (SIM-604)

- Add JSDoc to 11 exported functions across 4 files
- matchup.ts: 2 functions documented
- variance.ts: 5 functions documented
- variance-loader.ts: 3 functions documented
- season-sim.ts: 1 function documented
- All JSDoc includes: description, @param, @returns, @example
- IDE tooltips now show full documentation on hover
- TypeScript compilation passes with 0 errors

Part of sim-engine enterprise readiness initiative
```

