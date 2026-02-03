# Engineering Tradeoffs & Decision Guidance

This document serves as a **compass** for agents and contributors when making
implementation decisions.

## General Philosophy

We optimize for:

1. **Correctness** over speed (users rely on our data)
2. **Type safety** over flexibility (catches multi-league bugs)
3. **Simplicity** over performance (until measured)
4. **Clarity** over cleverness

## Tradeoff Matrix

| Dimension                      | Our Stance                         | Rationale                                 |
| ------------------------------ | ---------------------------------- | ----------------------------------------- |
| **Type Safety vs Flexibility** | Type safety wins                   | Multi-league bugs are our #1 enemy        |
| **Simplicity vs Performance**  | Simplicity until proven bottleneck | Premature optimization wastes time        |
| **Build vs Buy**               | Buy (libraries) for infrastructure | Focus on fantasy domain, not reinventing  |
| **Abstraction vs Duplication** | Duplicate until 3rd use            | Let patterns emerge naturally             |
| **Classes vs Functions**       | Functions always                   | Factories + closures > inheritance        |
| **Sync vs Async**              | Async for I/O, sync for transforms | Don't block, but keep transforms readable |
| **Small Files vs Cohesion**    | Small files (< 800 lines)          | Maintainability over co-location          |

## Specific Decision Guides

### When to Add a Dependency

**Default: Don't.**

Only add if:

- Solves a **current** problem (not hypothetical)
- > 1M weekly npm downloads
- Commit in last 3 months
- Doesn't significantly increase bundle

**Examples:**

- ✅ React Query for data fetching (solves real complexity)
- ✅ Zod for runtime validation (type-safe, small)
- ❌ Lodash for one `groupBy` (write 5 lines instead)
- ❌ Moment.js (use native Date or date-fns)

### When to Optimize Performance

**Default: Don't (yet).**

Only optimize when:

1. You have **measured** the bottleneck
2. It affects a **user-facing** experience
3. The issue is **reproducible**

**Process:**

1. Add timing/logging
2. Measure baseline
3. Optimize
4. Measure again
5. Document in code comment

**Examples:**

- ✅ Optimize simulation if >200ms (user-facing latency)
- ✅ Add memoization if same calculation runs 100x
- ❌ "This loop could be faster" without measurement
- ❌ Optimize background job that runs once/hour

### When to Abstract / Create Helpers

**Rule of Three:** Wait until you've written the same logic **3 times**.

**Why?**

- First time: learning the problem
- Second time: seeing variation
- Third time: pattern is clear

**Examples:**

- ✅ Create `processLeagueMatchups()` after 3 uses
- ✅ Extract `calculateWinProbability()` after 3 uses
- ❌ Create `GenericDataProcessor<T>` for one use case

### Multi-League Data Handling

**Always process separately, combine late.**

| Decision           | Choice                    | Rationale                     |
| ------------------ | ------------------------- | ----------------------------- |
| When to merge data | At presentation layer     | Prevents ID collision bugs    |
| Key format         | `${leagueId}-${rosterId}` | Globally unique composite key |
| Processing order   | AFC first, then NFC       | Consistent, predictable       |
| Validation         | Assert league ID present  | Catch bugs early              |

```typescript
// ✅ CORRECT pattern
const afcData = processLeague(afcRaw, 'afc');
const nfcData = processLeague(nfcRaw, 'nfc');
return [...afcData, ...nfcData];

// ❌ WRONG pattern
const merged = [...afcRaw, ...nfcRaw];
return processAll(merged); // ID collisions!
```

### File Organization

| Decision             | Choice              | Rationale                              |
| -------------------- | ------------------- | -------------------------------------- |
| **Feature vs Layer** | Feature-based       | Self-contained, easier to reason about |
| **Types location**   | `@gauntlet/types`   | Single source of truth                 |
| **Shared utils**     | `@/shared/utils/`   | Cross-feature, 3+ uses                 |
| **Feature utils**    | `features/x/utils/` | Domain-specific                        |

**Decision tree for new code:**

1. Is it a domain type? → `@gauntlet/types`
2. Is it used by 3+ features? → `@/shared/`
3. Is it feature-specific? → `features/x/`
4. Is it infrastructure? → `@/lib/`

### Testing Strategy

| Test Type       | When to Write               | Coverage Target |
| --------------- | --------------------------- | --------------- |
| **Unit tests**  | Business logic, transforms  | 80%+            |
| **Integration** | Feature modules, API routes | Critical paths  |
| **E2E**         | User flows (if added)       | Happy path only |

**What to mock:**

- ✅ External APIs (Sleeper, Gemini)
- ✅ Database (if applicable)
- ❌ Internal modules (test real integration)
- ❌ Utility functions (test real behavior)

### Error Handling

| Scenario             | Approach                                 |
| -------------------- | ---------------------------------------- |
| Missing data         | Return null/undefined, let caller decide |
| Invalid input        | Throw with context (IDs, values)         |
| External API failure | Retry with backoff, then throw           |
| Unexpected state     | Log and throw (don't swallow)            |

```typescript
// Good: Contextual error
if (!matchup) {
  throw new Error(
    `Matchup not found: league=${leagueId}, week=${week}, id=${matchupId}`
  );
}

// Bad: Generic error
if (!matchup) throw new Error('Not found');
```

### Component Patterns

| Decision                | Choice                        | Rationale                       |
| ----------------------- | ----------------------------- | ------------------------------- |
| **memo()**              | Use for components with props | Prevent unnecessary re-renders  |
| **displayName**         | Always set                    | Better debugging                |
| **Props destructuring** | Inside body, not signature    | Cleaner diffs, easier debugging |
| **Complex state**       | Extract to custom hook        | Keep components focused on UI   |

```typescript
// ✅ Correct pattern
export const MatchupCard = memo<Props>(props => {
  const { matchup, onSelect } = props;
  // ...
});
MatchupCard.displayName = 'MatchupCard';
```

### API Route Patterns

| Decision            | Choice                 | Rationale                      |
| ------------------- | ---------------------- | ------------------------------ |
| **Validation**      | Zod schemas            | Type-safe, runtime validation  |
| **Error responses** | Structured JSON        | Consistent client handling     |
| **Caching**         | React Query strategies | Appropriate per data freshness |

**Caching strategies:**

- Real-time data: `staleTime: 0, refetchInterval: 10000`
- Dynamic data: `staleTime: 5min`
- Static data: `staleTime: 24h`

### Simulation Engine

| Decision           | Choice       | Rationale                        |
| ------------------ | ------------ | -------------------------------- |
| **Method**         | Monte Carlo  | Handles non-normal distributions |
| **Iterations**     | 10,000       | Balance accuracy vs latency      |
| **Latency target** | <200ms       | UI responsiveness                |
| **Correlation**    | QB-WR stacks | Realistic outcome modeling       |

### Logging & Debugging

| Decision            | Choice                  | Rationale              |
| ------------------- | ----------------------- | ---------------------- |
| **Production logs** | No console.log          | Use structured logging |
| **Debug mode**      | `SLEEPER_DEBUG=1`       | Environment-based      |
| **Error logs**      | Include context, no PII | Debuggable but safe    |

## When This Doc Doesn't Help

If your decision isn't covered:

1. **Check constraints docs** (`docs/constraints/`)
2. **Check feature READMEs** (`apps/*/README.md`)
3. **Check ARCHITECTURE.md** for ADRs
4. **Ask in PR/issue** if still unclear
5. **Document your decision** for next time

## Quick Reference

**Before making a decision, ask:**

| Question                            | If Yes   | If No                      |
| ----------------------------------- | -------- | -------------------------- |
| Is it type-safe?                    | Proceed  | Fix types first            |
| Does it process leagues separately? | Proceed  | Refactor                   |
| Is it under 800 lines?              | Proceed  | Split file                 |
| Is there a test?                    | Proceed  | Add test for critical path |
| Is the pattern used 3+ times?       | Abstract | Keep duplicated            |

---

**Remember:** These are guidelines, not laws. Use judgment. Document deviations
in your PR.
