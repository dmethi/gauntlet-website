# Gauntlet Architecture

## Purpose

This document captures repo-level architectural decisions and constraints. It
helps developers (human and AI) understand **why** the system is built the way
it is, not just **what** it does.

For cross-feature constraints, see `docs/constraints/`. For module-specific
decisions, consult the README in each `apps/*` or `packages/*` directory.

---

## Core Problem

**Fantasy football analysis across a registry-defined set of separate Sleeper
leagues.** The 2026 season has three leagues; later seasons may add more.

Key challenges:

- IDs are **not globally unique** (matchup IDs 1-6 repeat across leagues)
- Real-time simulation of win probabilities requires fast Monte Carlo
  computation
- Weekly recap reports need narrative synthesis alongside statistical analysis
- System must remain maintainable by small team with heavy AI collaboration

---

## Architectural Decisions

### Why Monorepo (Turborepo + pnpm Workspaces)?

**Context**: Early prototypes used separate repos for web, server, and
simulation engine. Type drift and duplicate utilities became maintenance burden.

**Decision**: Unified monorepo with shared packages and coordinated builds.

**Tradeoffs**:

- ✅ Single source of truth for types (`@gauntlet/types`)
- ✅ Shared utilities prevent duplication
- ✅ Easier to refactor cross-cutting concerns
- ❌ Requires discipline to avoid circular dependencies
- ❌ Slightly more complex local dev setup

**Constraint**: All domain types **must** live in `@gauntlet/types`. Local type
definitions are only allowed for UI state, component props, or route-specific
transforms.

---

### Why TypeScript Strict Mode?

**Context**: Fantasy football domain is complex (rosters, matchups, projections,
transactions). Runtime errors in production are unacceptable when users rely on
data for decisions.

**Decision**: `strict: true` in all `tsconfig.json` files with explicit return
types on exported functions.

**Tradeoffs**:

- ✅ Catches multi-league ID confusion at compile time
- ✅ Makes refactoring safe (breaking changes surface immediately)
- ✅ AI agents can reason about contracts without guessing
- ❌ More verbose code (explicit typing required)
- ❌ Steeper learning curve for contributors

**Constraint**: Build must pass with zero type errors before any task is
considered complete.

---

### Why Feature-Based Organization (Not Layer-Based)?

**Context**: Traditional MVC/layer organization (`/components`, `/hooks`,
`/utils`) made it hard to reason about feature boundaries and led to mega-files.

**Decision**: Organize by domain under `apps/web/src/features/<domain>` with
co-located components, hooks, utils, and tests.

```
features/
  matchups/
    components/
    hooks/
    utils/
    types.ts
    index.ts
```

**Tradeoffs**:

- ✅ Features are self-contained (easier to understand, test, delete)
- ✅ AI agents can reason about feature scope without reading entire codebase
- ✅ Clear ownership boundaries
- ❌ Shared utilities need decision tree (feature vs. shared)
- ❌ Some duplication between features (acceptable tradeoff)

**Constraint**: Routes in `apps/web/src/app` should be thin orchestration
layers. Business logic lives in features.

---

### Why Arrow Functions + Factory Pattern (Not Classes)?

**Context**: Early iterations used OOP with classes. Led to verbose code and
made testing harder.

**Decision**: Arrow functions everywhere with factory pattern for stateful
objects.

```typescript
// Factory pattern for services
export const createSimulator = (config: Config): Simulator => {
  const cache = new Map();
  return {
    simulate: (matchup: Matchup): Odds => {
      /* ... */
    },
  };
};
```

**Tradeoffs**:

- ✅ Functions are easier to test (pure inputs/outputs)
- ✅ Closures for state are more explicit than class properties
- ✅ Composition over inheritance aligns with React patterns
- ❌ Less familiar to developers from OOP backgrounds
- ❌ Factory setup can feel verbose for simple cases

**Constraint**: No `class` declarations. Use factories with arrow functions.

---

### Why Monte Carlo Simulation (Not Analytical Win Probability)?

**Context**: Fantasy scoring has non-normal distributions (boom/bust players
like wide receivers). Analytical approaches assume normality.

**Decision**: Monte Carlo simulation engine in `@gauntlet/sim-engine` using
10,000 iterations.

**Tradeoffs**:

- ✅ Handles non-normal distributions accurately
- ✅ Easier to explain to users ("ran 10k simulations")
- ✅ Can incorporate correlations (e.g., QB + WR stacks)
- ❌ More computationally expensive than analytical
- ❌ Requires careful tuning (iteration count vs. performance)

**Constraint**: Simulation **must** complete in <200ms for UI responsiveness.
Iteration count is tuned for this target (flexible if performance improves).

See `docs/constraints/simulations.md` for cross-feature simulation contracts.

---

### Why Two-Tier Quality Gates?

**Context**: Initially had binary pass/fail checks. This blocked progress on
large refactors and created friction with AI agents making small improvements.

**Decision**:

- **Tier 1 (Hard Blocks)**: Build, type-check, tests must pass
- **Tier 2 (Tech Debt Review)**: Present findings, user decides what to fix

**Tradeoffs**:

- ✅ Maintains quality baseline (Tier 1) while allowing pragmatic decisions
  (Tier 2)
- ✅ AI agents can present tradeoffs instead of guessing priorities
- ✅ Documents accepted tech debt explicitly
- ❌ Requires discipline to actually review Tier 2 findings
- ❌ More complex to explain than simple pass/fail

**Constraint**: No exceptions to Tier 1. Tier 2 findings should be presented
with recommendations, user decides.

See `.cursorrules` for detailed workflow.

---

### Why Separate Per-League Processing?

**Context**: Sleeper API returns data per-league. Early bugs came from merging
data too early (matchup ID collisions).

**Decision**: Always process leagues separately, then combine results at
presentation layer.

```typescript
// Process each league independently
const results = leagueInputs.map(input => processLeague(input));
const combined = results.flat();
```

**Tradeoffs**:

- ✅ Prevents ID collision bugs (most common error category)
- ✅ Makes data flow explicit
- ✅ Easier to reason about data provenance
- ❌ Some code duplication (acceptable)
- ❌ Slightly more verbose

**Constraint**: **Never** merge league data before processing. Use composite
keys: `${leagueId}-${rosterId}`.

See `docs/constraints/multi-league.md` for detailed patterns.

### Shared Reporting Infrastructure with DriveFF

**Decision**: Gauntlet and DriveFF should use substantially the same reporting
infrastructure. Deterministic analysis produces a structured context blob;
narrative generation, persistence, and rendering operate against that boundary.

Gauntlet produces one combined weekly artifact with clearly separated league
sections. Its context blob may contain richer commissioner-authored lore because
the people and league history are known. That richer context is input data, not
a reason to fork the reporting pipeline.

**Constraint**: Provider ingestion and per-league calculations remain outside
the shared reporting core. Gauntlet must process every league independently and
combine only presentation-ready results. Historical artifacts remain browsable,
but new reports should use the fresh canonical routes rather than preserving a
duplicate legacy generation path.

### Why Clerk Identity + Application-Owned Profiles?

**Context**: Gauntlet needs optional authenticated personal details on its
existing manager pages, including co-managers on the same Sleeper roster,
without becoming an identity provider or copying all league data into Postgres.

**Decision**: Clerk owns sign-in, sessions, and uploaded profile images. The web
app owns one small Prisma `Profile` record per person. Sleeper remains the
source of truth for current league, roster, owner, and co-owner relationships.

**Tradeoffs**:

- ✅ Email-code authentication and image upload stay outside application code
- ✅ Profile fields remain queryable in the existing Postgres database
- ✅ One roster naturally supports multiple profiles
- ❌ Authentication depends on Clerk availability
- ❌ Current-team identity must be revalidated against Sleeper

**Constraints**: Profile mutations derive the Clerk user ID from the server
session, validate the selected identity against current registered leagues, and
never accept a profile owner ID from the browser. `clerkUserId` and
`sleeperUserId` are unique; `(leagueId, rosterId)` is indexed but not unique.

---

## System Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    External Systems                      │
├─────────────────────────────────────────────────────────┤
│ Sleeper API (rosters, matchups, players, transactions)  │
│ Gemini API (narrative synthesis for recap reports)      │
│ Clerk (authentication, sessions, profile images)         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   apps/web (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│ • Feature modules (matchups, stats, profiles, playoffs) │
│ • API routes (simulations, reports, cron)               │
│ • Public analytics/history + signed-in manager details   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Shared Packages                         │
├─────────────────────────────────────────────────────────┤
│ @gauntlet/types       Domain contracts                   │
│ @gauntlet/sim-engine  Monte Carlo simulations            │
│ @gauntlet/lib         Shared utilities                   │
│ @gauntlet/ui          UI primitives                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              apps/server (Background Jobs)               │
├─────────────────────────────────────────────────────────┤
│ • Historical snapshots (Postgres)                        │
│ • Scheduled odds calculations                            │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Choices

| Technology       | Purpose             | Why This Choice                                |
| ---------------- | ------------------- | ---------------------------------------------- |
| **TypeScript**   | Type safety         | Catches multi-league bugs at compile time      |
| **Next.js 15**   | Web framework       | Server components + API routes in one stack    |
| **Turborepo**    | Build orchestration | Caches builds, coordinates multi-package tasks |
| **pnpm**         | Package manager     | Fast, disk-efficient, strict peer dependencies |
| **Vitest**       | Testing             | Fast, TypeScript-native, ESM-first             |
| **React Query**  | Data fetching       | Caching + invalidation without boilerplate     |
| **Tailwind CSS** | Styling             | Utility-first, consistent with design tokens   |
| **Prisma**       | Database ORM        | Type-safe queries, great DX for Postgres       |
| **Clerk**        | Authentication      | Managed email codes, sessions, and user images |

---

## Open Questions

These are architectural decisions we're actively evaluating:

1. **Historical data strategy**: Should we cache all data in Postgres or keep
   web app stateless?
2. **Report persistence**: File system vs. S3 vs. database for weekly recap
   PDFs?
3. **Real-time updates**: Polling vs. webhooks vs. websockets for live scores?
4. **Package consolidation**: Should `@gauntlet/models` merge into
   `@gauntlet/types`?

---

## Learning Resources

- **Multi-league patterns**: `docs/constraints/multi-league.md`
- **Simulation contracts**: `docs/constraints/simulations.md`
- **Development workflow**: `.cursorrules`
- **Module-specific decisions**: `apps/*/README.md`, `packages/*/README.md`

---

_This document should be updated when making architectural decisions that affect
multiple modules. Feature-specific decisions belong in module READMEs._
