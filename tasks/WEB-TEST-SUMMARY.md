# WEB Testing Tasks - Summary & Strategy

**Status**: Fully Specified ✅  
**Total Estimated Time**: 10 hours  
**Priority**: 🔴 CRITICAL

---

## Overview

Comprehensive testing initiative to achieve enterprise-grade test coverage across the Gauntlet Fantasy Football web application. Focus on locking down existing features with tests before building new ones.

---

## Task Breakdown

| Task | Focus | Estimated Time | Priority | Dependencies |
|------|-------|----------------|----------|--------------|
| WEB-TEST-001 | Component Tests | 3 hours | 🔴 Critical | WEB-COMP-001 through WEB-COMP-010 |
| WEB-TEST-002 | Hook Tests | 2 hours | 🔴 Critical | WEB-HOOK-001, 002, 003 |
| WEB-TEST-003 | Utility Tests | 2 hours | 🔴 Critical | WEB-UTIL-001, 002, 003, 004 |
| WEB-TEST-004 | Integration & E2E | 3 hours | 🟡 High | WEB-TEST-001, 002, 003 |

**Total**: 10 hours of focused testing work

---

## Testing Philosophy

### Why Testing-First Now?

**Current State**:
- ✅ 10 major component splits completed
- ✅ 3 custom hooks extracted
- ✅ Feature-based architecture in place
- ⚠️ Test coverage gaps in new features
- ⚠️ No integration tests for multi-league system

**Rationale**:
- Lock down existing features before building more
- Prevent regressions during future refactoring
- Document expected behavior
- Enable confident code changes
- Catch multi-league bugs early

### Coverage Targets

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| Components | ~40% | 80%+ | 🔴 Critical |
| Hooks | ~60% | 100% | 🔴 Critical |
| Utilities | ~70% | 95%+ | 🔴 Critical |
| Integration | 0% | Key flows covered | 🟡 High |
| **Overall** | **~50%** | **85%+** | **🔴 Critical** |

---

## Task Details

### WEB-TEST-001: Component Tests (3 hours)

**Objective**: Add comprehensive integration tests for all migrated feature components.

**Focus Areas**:
1. Draft Analysis - ManagerAnalysis component (45 min)
2. Stats Components - TeamView, TrendsView, LeagueView, ScheduleAnalysis (90 min)
3. Matchups - MatchupSimulation (20 min)
4. Transactions - TransactionAnalysis expansion (15 min)
5. Playoffs - PlayoffBracket (15 min)
6. Coverage report and gap filling (15 min)

**Test Strategy**:
- Test user-visible behavior, not implementation
- Verify data calculations and transformations
- Test user interactions (clicks, filters, sorts)
- Cover edge cases (empty data, errors)
- Integration between sub-components

**Success Metrics**:
- 80%+ coverage on all feature components
- All critical user paths tested
- Tests run fast (<5 seconds total)
- All tests passing

**Key Deliverables**:
- 7 new component test files
- Shared test fixtures in `src/test/fixtures/`
- Coverage report showing 80%+ component coverage

---

### WEB-TEST-002: Hook Tests (2 hours)

**Objective**: Achieve 100% test coverage on all custom React hooks.

**Focus Areas**:
1. Untested hooks (60 min):
   - `useMatchupTimeSeries` - Real-time matchup data
   - `useTransactionAnalysisModel` - Transaction processing
   - `useStartSitEfficiencyModel` - Lineup decisions
   - `useTeamViewModel` - Team data processing
   - `useHallOfFameData` - Record calculations

2. Expand existing tests (30 min):
   - Draft analysis hooks - add edge cases
   - Stats hooks - add error scenarios
   - MatchupOdds - add network failure cases

3. Integration tests (30 min):
   - Hook combinations
   - Data flow between hooks

**Test Strategy**:
- Test initial state, state updates, side effects
- Test loading, error, and success states
- Test refetch on parameter changes
- Test cleanup functions
- Test memoization

**Success Metrics**:
- 100% coverage on all custom hooks
- All async hooks test loading/error states
- Cleanup functions tested

**Key Deliverables**:
- 5 new hook test files
- Expanded tests for existing hooks
- Integration test suite for hook combinations

---

### WEB-TEST-003: Utility Tests (2 hours)

**Objective**: Ensure 95-100% test coverage on all utility functions.

**Focus Areas**:
1. Shared stats utilities (45 min):
   - `compose.ts` - Data composition
   - `medians.ts` - Statistical calculations
   - `ranks.ts` - Ranking logic
   - `positional-advantages.ts` - Position analysis

2. Feature utilities (45 min):
   - `draft-analysis/utils/analytics.ts` - Draft calculations
   - `matchups/utils/swing-analysis.ts` - Swing point calculations
   - `reports/utils/narratives.ts` - Narrative helpers

3. Legacy lib utils (30 min):
   - Critical subset of `lib/manager-analytics.ts`
   - Critical subset of `lib/draft-analytics.ts`

**Test Strategy**:
- Test with known inputs/outputs
- Test edge cases (empty, null, boundary conditions)
- Test error cases
- Verify complex calculations with external tools

**Success Metrics**:
- 95%+ coverage on all utility files
- All pure functions fully tested
- Edge cases covered

**Key Deliverables**:
- ~10 new utility test files
- Comprehensive edge case coverage
- Verified calculations with known outputs

---

### WEB-TEST-004: Integration & E2E Tests (3 hours)

**Objective**: Test multi-league system interactions and critical user flows.

**Focus Areas**:
1. Multi-league data processing (60 min):
   - Stats aggregation across leagues
   - Matchup grouping by league
   - Composite key generation
   - Rankings and comparisons

2. API route integration (45 min):
   - `/api/stats` - League-wide statistics
   - `/api/matchups/[leagueId]/[week]` - Matchup data
   - `/api/draft/analysis` - Draft analytics
   - `/api/transactions` - Transaction processing

3. User flow tests (45 min):
   - Stats page: view → select team → view details
   - Matchups: select → simulate → view results
   - Draft analysis: filter → sort → view details

4. Cache integration (30 min):
   - Multi-league cache keys don't collide
   - Cache invalidation works
   - React Query integration

**Test Strategy**:
- Focus on multi-league bug patterns
- Verify composite keys used correctly
- Test complete user journeys
- Ensure league separation maintained

**Success Metrics**:
- All multi-league scenarios tested
- Critical user flows verified
- No cache key collisions
- API routes return correct data

**Key Deliverables**:
- Multi-league integration test suite
- API route tests
- User flow tests
- Cache integration tests

---

## Multi-League Testing (Critical!)

### The Bug Pattern We're Preventing

**WRONG** (creates 6 groups of 4 teams):
```typescript
const all = [...afcMatchups, ...nfcMatchups];
const grouped = groupBy(all, m => m.matchup_id);
```

**CORRECT** (creates 12 groups of 2 teams):
```typescript
const afcResults = processLeague(afcMatchups);
const nfcResults = processLeague(nfcMatchups);
const combined = [...afcResults, ...nfcResults];
```

### What to Test

**Composite Keys**:
- `${leagueId}-${rosterId}` for teams
- `${leagueId}-${week}-${matchupId}` for matchups
- Always include `leagueId` in grouping operations

**League Separation**:
- Process AFC and NFC separately
- Combine results only after processing
- Rankings: both overall (1-24) and within-league (1-12)

**Edge Cases**:
- Leagues with different week counts
- Missing data from one league
- Roster IDs that overlap between leagues

---

## Execution Strategy

### Week 1: Core Testing (Days 1-3)

**Day 1** (3 hours): WEB-TEST-001 - Component Tests
- Morning: ManagerAnalysis + TeamView
- Afternoon: TrendsView + LeagueView + ScheduleAnalysis

**Day 2** (2 hours): WEB-TEST-002 - Hook Tests
- Morning: Untested hooks (all 5)
- Afternoon: Expand existing tests + integration

**Day 3** (2 hours): WEB-TEST-003 - Utility Tests
- Morning: Shared stats utilities
- Afternoon: Feature utilities + lib subset

### Week 2: Integration (Days 4-5)

**Day 4** (2 hours): WEB-TEST-004 Part 1
- Multi-league integration tests
- API route tests

**Day 5** (1 hour): WEB-TEST-004 Part 2
- User flow tests
- Cache integration tests

---

## Test Infrastructure

### Setup (Already Complete)

- ✅ Vitest configured
- ✅ React Testing Library installed
- ✅ Test utilities in place
- ✅ Coverage reporting configured

### Fixtures Needed

Create shared test fixtures:

```
src/test/fixtures/
  ├── stats-data.ts       # Team/league stats
  ├── draft-data.ts       # Manager/draft analysis
  ├── matchup-data.ts     # Matchup/simulation data
  ├── transaction-data.ts # Transaction records
  └── league-data.ts      # Multi-league mock data
```

### Test Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific category
pnpm test components/
pnpm test hooks/
pnpm test utils/
pnpm test __tests__/integration/

# Watch mode
pnpm test:watch

# CI mode (no watch)
pnpm test:ci
```

---

## Success Criteria

### Quantitative
- [ ] 80%+ coverage on components
- [ ] 100% coverage on hooks
- [ ] 95%+ coverage on utilities
- [ ] All critical user flows covered
- [ ] All multi-league scenarios tested

### Qualitative
- [ ] Tests are readable and maintainable
- [ ] Tests verify behavior, not implementation
- [ ] Tests run fast (<30 seconds total)
- [ ] No flaky tests
- [ ] Clear test names and descriptions

### Build Status
- [ ] All tests pass: `pnpm test`
- [ ] Coverage report generated
- [ ] TypeScript compilation passes
- [ ] No console errors in tests
- [ ] CI pipeline green

---

## Post-Testing Benefits

### Immediate Benefits
- ✅ Confidence to refactor without fear
- ✅ Catch regressions before production
- ✅ Document expected behavior
- ✅ Faster debugging (tests pinpoint issues)

### Long-Term Benefits
- ✅ Faster onboarding (tests show how code works)
- ✅ Safer dependency upgrades
- ✅ Easier code reviews (tests verify behavior)
- ✅ Foundation for E2E tests

### Unblocked Work
After testing is complete, we can confidently:
- Migrate remaining pages (WEB-PAGE-001, 002, 003)
- Refactor remaining large components
- Add new features without regression risk
- Optimize performance (tests catch breakage)

---

## Next Steps After Testing

### Immediate Next (After Testing Complete)

**WEB-PAGE Tasks** (3 pages, ~3 hours total):
1. WEB-PAGE-001: Migrate Draft Pages
2. WEB-PAGE-002: Migrate Stats Pages  
3. WEB-PAGE-003: Migrate Matchup Pages

**Remaining COMP Tasks** (5 components):
4. WEB-COMP-011: Split ScatterAnalysis (625 lines)
5. WEB-COMP-012: Split RecapReportView (644 lines)
6. WEB-COMP-013: Split league-wide-odds (564 lines)
7. WEB-COMP-014: Split matchup-charts (466 lines)
8. WEB-COMP-015: Split ManagerDetailModal (280 lines)

---

## Resources

### Documentation
- `tasks/WEB-TEST-001.md` - Component test details
- `tasks/WEB-TEST-002.md` - Hook test details
- `tasks/WEB-TEST-003.md` - Utility test details
- `tasks/WEB-TEST-004.md` - Integration test details
- `CODING_CONVENTIONS.MD` - Testing patterns

### Examples
- `features/matchups/components/MatchupOddsPreview/` - Well-tested component
- `features/start-sit/components/StartSitEfficiency/` - Hook + component tests
- `features/hall-of-fame/utils/` - Comprehensive utility tests

---

**Status**: Ready to Execute ✅  
**Priority**: Start with WEB-TEST-001 immediately  
**Goal**: Lock down existing features before building more

---

*Last Updated: October 16, 2025*

