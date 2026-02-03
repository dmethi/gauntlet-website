# Engineering Ethos

This document defines **how we build** at Gauntlet. These principles guide
decision-making when the path isn't obvious.

## Core Principles

### 1. Type Safety is Non-Negotiable

TypeScript strict mode catches bugs before they reach users.

**Why:**

- Multi-league ID confusion caught at compile time
- Refactoring is safe (breaking changes surface immediately)
- AI agents can reason about contracts without guessing
- Runtime errors in production are unacceptable

**Enforcement:**

- `strict: true` in all `tsconfig.json` files
- Explicit return types on exported functions
- All domain types from `@gauntlet/types`
- Build must pass with zero type errors

### 2. Process Leagues Separately

The #1 source of bugs: treating matchup IDs as globally unique.

**Rule:** Always process AFC and NFC data independently, then combine at the
presentation layer.

**Why:**

- Matchup IDs 1-6 repeat in both leagues
- Roster IDs only unique within a league
- Early merging causes data corruption

```typescript
// ✅ CORRECT
const afcResults = processLeague(afcMatchups);
const nfcResults = processLeague(nfcMatchups);
const combined = [...afcResults, ...nfcResults];

// ❌ WRONG
const all = [...afcMatchups, ...nfcMatchups];
const grouped = groupBy(all, m => m.matchup_id); // BUG!
```

### 3. Feature-Based Organization

Keep code organized by domain, not by technical layer.

**Why:**

- Features are self-contained and easier to understand
- AI agents can reason about scope without reading entire codebase
- Clear ownership boundaries
- Easier to test, refactor, or delete

**Structure:**

```
features/
  matchups/
    components/
    hooks/
    utils/
    types.ts
    index.ts
```

**Rule:** Routes in `apps/web/src/app` should be thin orchestration. Business
logic lives in features.

### 4. Arrow Functions + Factory Pattern

No classes. Use arrow functions and factories.

**Why:**

- Functions are easier to test (pure inputs/outputs)
- Closures for state are more explicit than class properties
- Composition over inheritance aligns with React patterns
- More consistent codebase

```typescript
// ✅ CORRECT: Factory pattern
export const createSimulator = (config: Config): Simulator => {
  const cache = new Map();
  return {
    simulate: (matchup: Matchup): Odds => {
      /* ... */
    },
  };
};

// ❌ WRONG: Class-based
export class Simulator {
  /* ... */
}
```

### 5. Two-Tier Quality System

Hard blocks vs. recommendations.

**Tier 1 (Must Pass):**

- Build (`pnpm build`)
- Type-check (`pnpm type-check`)
- Tests (`pnpm test`)
- File size < 800 lines

**Tier 2 (Present & Decide):**

- Files 400-700 lines (consider splitting)
- Console.log statements (suggest DEBUG pattern)
- Missing JSDoc on exports
- Opportunities for refactoring

**Philosophy:** Maintain quality baseline while allowing pragmatic decisions on
non-critical items.

## Default Approach

When unsure, follow this:

1. **Check constraints docs** — `docs/constraints/` has domain-specific rules
2. **Check feature READMEs** — Module-specific decisions documented
3. **Use existing patterns** — How do similar features handle this?
4. **Process separately** — When in doubt, keep league data separate
5. **Ask if missing context** — Better to ask than guess wrong

## Code Quality Standards

### What we optimize for:

- **Type coverage** — 100% strict TypeScript
- **Testability** — Pure functions, dependency injection
- **Readability** — Explicit over clever
- **Performance** — <200ms simulation latency

### What we DON'T optimize for (yet):

- **Maximum abstraction** — Wait for patterns to emerge
- **100% test coverage** — Focus on critical paths
- **Micro-optimizations** — Correctness first

## Dependency Policy

**Default: Don't add dependencies.**

Only add if:

1. Solves a problem **right now** (not hypothetical)
2. Widely adopted (>1M weekly downloads)
3. Actively maintained (commit in last 3 months)
4. Doesn't bloat bundle significantly

**Document rationale in PR.**

## When to Refactor

**Refactor when:**

- You're touching the code anyway (boy scout rule)
- Same logic appears 3+ times
- Tests are hard to write due to coupling
- File exceeds 800 lines

**Don't refactor when:**

- "It's not how I'd write it"
- No test coverage (add tests first)
- In the middle of a feature PR (separate it)

## Error Handling

Errors should be:

1. **Actionable** — Tell the developer what to do
2. **Contextual** — Include relevant IDs and values
3. **Logged** — With enough info to debug
4. **Not swallowed** — Don't hide failures

```typescript
// ✅ Good: Actionable error with context
throw new Error(
  `Matchup not found: league=${leagueId}, week=${week}, matchupId=${matchupId}`
);

// ❌ Bad: Vague error
throw new Error('Not found');
```

## Testing Philosophy

**Test:**

- Business logic (always)
- Multi-league processing (critical)
- Simulation engine (core value)
- Data transformations (error-prone)

**Don't test:**

- UI rendering details
- Third-party library internals
- Trivial getters/setters

**Integration > Unit:**

- Prefer testing feature modules end-to-end
- Mock external APIs (Sleeper, Gemini)
- Don't mock internal modules

## Communication

- **Document decisions** — In feature READMEs or commit messages
- **Surface conflicts** — If approach conflicts with docs, explain tension
- **Present findings** — Tier 2 issues as recommendations, not blockers
- **Ask when unclear** — Better to ask than make wrong assumptions

## What Makes a Good PR

✅ **Good:**

- Solves one problem
- Types pass with zero errors
- Tests pass
- File sizes reasonable
- Multi-league safety verified
- Tech debt documented if accepted

❌ **Bad:**

- Multiple unrelated changes
- Type errors or build failures
- Classes instead of factories
- Merged league data before processing
- Console.log spam without rationale

## Philosophy Summary

| Principle        | Stance                                       |
| ---------------- | -------------------------------------------- |
| **Type Safety**  | Non-negotiable (strict mode, explicit types) |
| **Multi-League** | Process separately, combine late             |
| **Organization** | Feature-based, not layer-based               |
| **Functions**    | Arrow functions + factories, no classes      |
| **Quality**      | Two-tier (hard blocks + recommendations)     |
| **Abstraction**  | Wait for 3 uses before extracting            |
| **Testing**      | Critical paths > coverage percentage         |

## Remember

**We're building a fantasy football companion, not a trading system.**

- Correctness matters (users make decisions based on our data)
- Performance matters (<200ms simulation latency)
- Maintainability matters (small team, AI collaboration)
- Perfectionism doesn't matter (ship and iterate)

**Target:** 9.0/10 enterprise hygiene score through incremental improvements.
