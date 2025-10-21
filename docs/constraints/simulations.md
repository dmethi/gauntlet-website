# Simulation Constraints

## Purpose

Cross-feature contracts for Monte Carlo simulation engine
(`@gauntlet/sim-engine`) used by matchup odds, playoff brackets, and start/sit
recommendations.

---

## Core Invariants

### 1. Simulation Output Format

All simulation functions must return results matching this contract:

```typescript
interface SimulationResult {
  winProbability: number; // Must be 0.0 to 1.0
  iterations: number; // Actual iterations run (may differ from requested)
  confidence: number; // 0.0 to 1.0, based on sample size
  details?: {
    mean: number;
    median: number;
    p10: number; // 10th percentile
    p90: number; // 90th percentile
  };
}
```

**Rationale**: Consumers (UI, reports, analytics) rely on this shape.
`winProbability` is the single most important field and must always be present.

**Validation**:

```typescript
// Every simulation result should satisfy:
assert(result.winProbability >= 0 && result.winProbability <= 1);
assert(result.confidence >= 0 && result.confidence <= 1);
assert(result.iterations > 0);
```

---

### 2. Performance Budget

All simulation calls **must complete within 200ms** for UI responsiveness.

**Current implementation**: 10,000 iterations chosen to meet this target on
typical hardware.

**Flexibility**: Iteration count can be adjusted if:

- Performance improves (hardware upgrades, algorithm optimization)
- Background jobs have relaxed latency requirements
- UI shows progressive results (partial simulations displayed while computing)

**When changing iteration count**:

```typescript
// Document the reasoning inline
const SIMULATION_ITERATIONS = 15000; // Increased from 10k after moving to WebWorkers
```

---

### 3. Player Projection Distributions

Simulations assume player score distributions are:

- **Non-normal** (boom/bust players have high variance)
- **Independent** (except for explicitly modeled correlations like QB-WR stacks)

**Rationale**: This is why we use Monte Carlo instead of analytical approaches.
Changing this assumption would require architectural rethink.

**Current approach**: Sample from historical game logs (last 8 weeks) to capture
actual distribution shape.

**Flexibility**: Sampling strategy can change (e.g., weighted by recency,
adjusted for opponent) but must preserve non-normality.

---

### 4. Correlation Modeling

Certain player pairs have correlated outcomes and should be sampled together:

- **QB + WR on same team** - Positive correlation (TD pass helps both)
- **Opposing RBs** - Negative correlation (game script favors one)
- **Defense vs. opposing offense** - Negative correlation (DEF scores when
  offense fails)

**Current status**: Basic QB-WR stacking implemented. Other correlations are
future work.

**Constraint**: When adding correlations, must be based on measurable historical
data, not intuition. Document the correlation coefficient and source.

---

## Feature-Specific Usage

### Matchup Odds (`apps/web/src/features/matchups`)

**Requirements**:

- Must handle mid-week roster changes (players locked/unlocked)
- Should cache results at `leagueId + week + matchupId` granularity
- Invalidate cache when lineup changes or new projections available

**Performance target**: <200ms for single matchup, <1s for all 6 matchups in a
week

**Tradeoff accepted**: Mid-week staleness (cached odds may not reflect latest
roster moves). Users understand "as of lineup lock."

---

### Playoff Bracket (`apps/web/src/features/playoffs`)

**Requirements**:

- Multi-round simulation (simulate entire bracket, not just one matchup)
- Must handle different bracket sizes (12 teams = 2 rounds, 14 teams = 3 rounds)

**Performance target**: <2s for full bracket (multiple matchups)

**Flexibility**: Can reduce iterations per matchup (e.g., 5k instead of 10k)
since users care about relative odds, not absolute precision.

---

### Start/Sit Recommendations (`apps/web/src/features/start-sit`)

**Requirements**:

- Compare multiple lineup permutations (up to 10 scenarios)
- Show delta in win probability for each swap

**Performance target**: <5s for full analysis (10 scenarios × 10k iterations
each)

**Flexibility**: Can use progressive rendering (show partial results while
computing) since this is an interactive tool, not real-time display.

---

## Algorithm Choices

### Why Monte Carlo (Not Analytical)?

**Decision context**: Analytical approaches (e.g., Gaussian convolution) are
faster but assume normal distributions.

**Fantasy football scoring is non-normal**:

- Wide receivers have boom/bust weeks (bimodal or skewed distributions)
- Running backs are more consistent (tighter distributions)
- Defenses can have negative scores (left-skewed)

**Monte Carlo handles this by sampling from actual distributions.**

**Tradeoff**: 10-100x slower than analytical, but more accurate for fantasy use
case.

---

### Why Sample from Historical Game Logs (Not Projections)?

**Decision context**: Could use expert projections (FantasyPros, ESPN) as input.

**Problem**: Projections are point estimates, don't capture variance.

**Solution**: Use last 8 weeks of actual game logs to build empirical
distribution per player.

**Tradeoffs**:

- ✅ Captures actual variance (boom/bust patterns)
- ✅ No dependency on third-party projection APIs
- ❌ Injured weeks skew distribution (need to filter)
- ❌ Small sample size for rookies or newly-traded players

**Flexibility**: Could blend historical + projections in future (weight
projections more heavily for players with thin history).

---

### Why 10,000 Iterations?

**Decision context**: Accuracy improves with more iterations, but latency
increases linearly.

**Tested empirically**:

- 1,000 iterations: ±3% variance in repeated runs (unacceptable)
- 10,000 iterations: ±0.5% variance (acceptable)
- 100,000 iterations: ±0.1% variance (overkill, 10x slower)

**Chosen 10,000 as sweet spot for 200ms target.**

**Flexibility**: This can change if performance improves or requirements change.
Document new reasoning inline.

```typescript
const ITERATIONS = 10000; // Tuned for ±0.5% accuracy and <200ms latency
```

---

## Error Handling

### Insufficient Data

If a player has <3 weeks of game logs (injured, rookie, traded), simulation
should:

1. **Primary**: Use league-average distribution for their position
2. **Fallback**: If no position data, use median projected points (degenerate
   distribution)
3. **Warning**: Emit log message so we can track how often this happens

```typescript
// Inline documentation for edge case
if (player.gameLogs.length < 3) {
  // Use position baseline since insufficient sample size
  // Affects ~5% of rosters (rookies, IR returns)
  return sampleFromPositionBaseline(player.position);
}
```

**Rationale**: Better to show approximate odds than fail or show no data.

---

### Simulation Timeouts

If simulation exceeds 200ms (e.g., due to CPU throttling on mobile):

1. **Return partial results** with `confidence` field reduced
2. **Cache partial results** (better than recomputing from scratch)
3. **Show loading state** in UI with "Low confidence" badge

**Never**: Infinite spinner or crash.

---

## Testing Requirements

Every simulation function must have tests for:

1. **Output shape** - Matches `SimulationResult` contract
2. **Invariants** - Win probabilities sum to ~1.0 (within 1% tolerance)
3. **Performance** - Completes within budget (allow 2x margin for CI)
4. **Edge cases** - Empty rosters, single player, all zeros

```typescript
describe('simulateMatchup', () => {
  it('returns valid probabilities', () => {
    const result = simulateMatchup(team1, team2);
    expect(result.winProbability).toBeGreaterThanOrEqual(0);
    expect(result.winProbability).toBeLessThanOrEqual(1);
  });

  it('completes within performance budget', () => {
    const start = Date.now();
    simulateMatchup(team1, team2);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(400); // 2x budget for CI
  });

  it('handles opposing win probabilities sum to ~1', () => {
    const team1Result = simulateMatchup(team1, team2);
    const team2Result = simulateMatchup(team2, team1);
    const sum = team1Result.winProbability + team2Result.winProbability;
    expect(sum).toBeCloseTo(1.0, 2); // Within 0.01
  });
});
```

---

## Open Questions

1. **Correlation modeling**: Should we model game script (if RB1 booms, RB2 on
   same team likely busts)?
2. **Opponent adjustments**: Should projections adjust based on opposing defense
   strength?
3. **Weather**: Should outdoor games in bad weather reduce passing upside?
4. **WebWorkers**: Should we move simulations off main thread for >50k
   iterations?

These are **not constraints yet** - just areas being researched.

---

## Changing These Constraints

If a new feature needs to violate these contracts:

1. **Document why** (what's the use case?)
2. **Propose alternative** (new contract shape, performance budget, etc.)
3. **Assess blast radius** (what other features are affected?)
4. **Update this doc** after decision is made

**Don't silently violate constraints** - that's how we accumulate tech debt.
