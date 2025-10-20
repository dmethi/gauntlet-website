# Documentation Coverage

This document tracks which parts of the codebase have design documentation vs. "unknown" areas that need coverage as we touch them.

## Repo-Level Documentation

- ✅ `docs/ARCHITECTURE.md` - Core architectural decisions
- ✅ `docs/constraints/multi-league.md` - Multi-league processing patterns
- ✅ `docs/constraints/simulations.md` - Simulation engine contracts
- ✅ `docs/constraints/integrations.md` - API clients and cross-feature data flow

## Module Documentation

### Apps

| Module | README | Design Docs | Status |
|--------|--------|-------------|--------|
| `apps/web` | ✅ Basic | ❓ Features need docs | In progress |
| `apps/server` | ✅ Basic | ❓ Unknown | Needs review |
| `apps/sim-engine` | ✅ Basic | ❓ Unknown | Needs review |

### Packages

| Package | README | Design Docs | Status |
|---------|--------|-------------|--------|
| `packages/types` | ✅ Basic | ❓ Unknown | Needs review |
| `packages/lib` | ✅ Basic | ❓ Unknown | Needs review |
| `packages/models` | ✅ Basic | ❓ Legacy | Under evaluation |
| `packages/ui` | ✅ Basic | ❓ Unknown | Needs review |
| `packages/tokens` | ✅ Basic | ❓ Unknown | Needs review |

## Feature Documentation

Features in `apps/web/src/features/`:

| Feature | README | Invariants | Status |
|---------|--------|------------|--------|
| `draft-analysis` | ❌ | ❌ | Unknown |
| `matchups` | ❌ | ❌ | **Next target** |
| `playoffs` | ❌ | ❌ | Unknown |
| `start-sit` | ❌ | ❌ | Unknown |
| `stats` | ❌ | ❌ | Unknown |
| `transactions` | ❌ | ❌ | Unknown |

## Documentation Strategy

### Phase 1: Matchups Feature (Reference Implementation)

Goal: Fully document one feature end-to-end to establish pattern.

**Target**: `apps/web/src/features/matchups/`

**Deliverables**:
- `README.md` - Purpose, constraints, architecture
- Inline rationale in key files:
  - `hooks/useMatchupOdds.ts` - Caching strategy
  - `utils/simulator.ts` - Monte Carlo rationale
  - `components/MatchupCard.tsx` - UI decisions (if bespoke)

**Success Criteria**:
- Can understand feature without reading all code
- Clear what's flexible vs. fixed
- Conflicts with constraints are surfaced

### Phase 2: Expand to 2-3 More Features

Based on learnings from matchups, apply pattern to:
- `stats` (likely has complex calculations)
- `playoffs` (bracket logic has edge cases)
- One more TBD based on active work

### Phase 3: Fill Gaps

As we touch features during normal development:
- Add minimal README if missing
- Document bespoke logic inline
- Update this coverage doc

## Adding New Documentation

When documenting a new feature or module:

1. **Start with README.md**:
   ```markdown
   # Feature Name

   ## Purpose
   What problem does this solve? What's the user-facing value?

   ## Key Constraints
   - Performance targets
   - Data dependencies
   - UI requirements

   ## Architecture
   - Key files and their roles
   - Data flow
   - External dependencies
   ```

2. **Add inline rationale** to files with bespoke logic:
   - Algorithm choices
   - Performance optimizations
   - Workarounds for external constraints
   - Magic numbers with business justification

3. **Update this file**:
   - Mark feature as documented
   - Note any open questions or future work

## Open Questions

Areas that need design decisions documented:

1. **Historical data strategy** - How should we cache/persist historical snapshots?
2. **Report generation** - Where do generated PDFs live? (filesystem vs. cloud)
3. **Real-time updates** - What's the long-term strategy for live data?
4. **Package consolidation** - Should `@gauntlet/models` merge into `@gauntlet/types`?

These should move to `docs/ARCHITECTURE.md` once decisions are made.

## Maintenance

**When to update this doc**:
- After documenting a new feature
- After discovering undocumented areas during work
- After making architectural decisions that affect multiple modules

**Who maintains**: Anyone working on the codebase (human or AI).

**Review cadence**: Check monthly or when starting major refactors.
