# WEB-UTIL-005: Stats Utilities Relocation

**Category**: UTIL  
**Priority**: 🟡 MEDIUM (Quick Win)  
**Estimated Time**: 30 min  
**Dependencies**: WEB-SETUP-004 (feature folder structure)

---

## Objective

Relocate shared stats utilities from `lib/stats/` to `shared/utils/stats/` since
they are used across multiple features (stats hub, matchups, analytics),
establishing proper shared utility organization.

---

## Context Needed

**Files to relocate** (7 files, ~200 lines total):

1. `lib/stats/compose.ts` - Data composition utilities
2. `lib/stats/join.ts` - Data joining utilities
3. `lib/stats/medians.ts` - Statistical calculations (median, mean, stddev,
   percentile)
4. `lib/stats/positional-advantages.ts` - Position advantage calculations
5. `lib/stats/positions.ts` - Position-specific utilities
6. `lib/stats/ranks.ts` - Ranking calculations
7. `lib/stats/teams.ts` - Team data utilities

**Consuming files** (need import updates):

- `app/stats/components/LeagueView.tsx`
- `app/stats/components/TeamView.tsx`
- `app/stats/components/TrendsView.tsx`
- `app/stats/components/ScheduleAnalysis.tsx`
- `lib/manager-analytics.ts`
- 10+ other files

**Total Context**: ~200 lines to move, 15+ files to update

---

## Steps

### 1. Create shared stats utilities directory

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
mkdir -p src/shared/utils/stats
```

### 2. Move stats utility files

```bash
# Move all 7 files at once
mv src/lib/stats/compose.ts src/shared/utils/stats/
mv src/lib/stats/join.ts src/shared/utils/stats/
mv src/lib/stats/medians.ts src/shared/utils/stats/
mv src/lib/stats/positional-advantages.ts src/shared/utils/stats/
mv src/lib/stats/positions.ts src/shared/utils/stats/
mv src/lib/stats/ranks.ts src/shared/utils/stats/
mv src/lib/stats/teams.ts src/shared/utils/stats/
```

### 3. Create barrel export `shared/utils/stats/index.ts`

```typescript
/**
 * Shared statistics utilities
 * Used across stats hub, matchups, and analytics features
 */

// Data composition and joining
export * from './compose';
export * from './join';

// Statistical calculations
export * from './medians';

// Fantasy football specific
export * from './positional-advantages';
export * from './positions';
export * from './ranks';
export * from './teams';
```

### 4. Find and update all imports

```bash
# Find all files importing from lib/stats
grep -r "from '@/lib/stats" src/
grep -r "from '../../lib/stats" src/
grep -r "from '../lib/stats" src/
```

### 5. Update import statements

**Pattern to replace:**

```typescript
// OLD
import { median, mean } from '@/lib/stats/medians';
import { rank } from '@/lib/stats/ranks';

// NEW
import { median, mean, rank } from '@/shared/utils/stats';
```

**Files that need updates** (use search and replace):

Update `app/stats/components/LeagueView.tsx`:

```typescript
// Line ~3: Change import
import { rank } from '@/shared/utils/stats';
```

Update `app/stats/components/TeamView.tsx`:

```typescript
// Line ~3: Change import
import { median, rank } from '@/shared/utils/stats';
```

Update `app/stats/components/TrendsView.tsx`:

```typescript
// Line ~3: Change import
import { rank } from '@/shared/utils/stats';
```

Update `lib/manager-analytics.ts`:

```typescript
// Update stats imports
import { median, mean, percentile } from '@/shared/utils/stats';
```

### 6. Remove old directory

```bash
# Verify directory is empty
ls -la src/lib/stats/

# Remove if empty
rmdir src/lib/stats/
```

### 7. Verify no broken imports

```bash
# Check for any remaining old imports
grep -r "from '@/lib/stats" src/
# Should return no results

# TypeScript compilation check
pnpm tsc --noEmit
```

### 8. Run tests

```bash
# Test stats utilities still work
pnpm test shared/utils/stats

# Test consuming components
pnpm test app/stats
```

---

## Acceptance Criteria

- [ ] All 7 stats utility files in `shared/utils/stats/`
- [ ] Barrel export `index.ts` created with all exports
- [ ] 15+ import statements updated to use `@/shared/utils/stats`
- [ ] Old `lib/stats/` directory removed
- [ ] No remaining imports from `@/lib/stats`
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] No ESLint errors

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Verify all files moved
ls -la src/shared/utils/stats/
# Should show 8 files (7 utils + index.ts)

# Verify old directory removed
test ! -d src/lib/stats && echo "✅ Old directory removed"

# Verify no old imports remain
grep -r "from '@/lib/stats" src/ && echo "❌ Old imports found" || echo "✅ No old imports"

# TypeScript compilation
pnpm tsc --noEmit

# Run tests
pnpm test shared/utils/stats
pnpm test app/stats

# Lint check
pnpm lint
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-UTIL-005: Stats Utilities Relocation.

Please:
1. Create src/shared/utils/stats/ directory
2. Move all 7 files from src/lib/stats/ to src/shared/utils/stats/:
   - compose.ts
   - join.ts
   - medians.ts
   - positional-advantages.ts
   - positions.ts
   - ranks.ts
   - teams.ts
3. Create barrel export index.ts exporting all utilities
4. Find all files importing from '@/lib/stats' and update to '@/shared/utils/stats'
5. Update imports in:
   - app/stats/components/LeagueView.tsx
   - app/stats/components/TeamView.tsx
   - app/stats/components/TrendsView.tsx
   - app/stats/components/ScheduleAnalysis.tsx
   - lib/manager-analytics.ts
   - Any other files found by grep
6. Remove old lib/stats/ directory
7. Verify no broken imports with TypeScript compilation

This is a pure relocation task - no logic changes needed.
```

---

## Related Tasks

**Blocks**: WEB-COMP-002 (TrendsView needs these utils), WEB-HOOK-003 (stats
hooks)  
**Blocked By**: WEB-SETUP-004 (shared folder structure)  
**Related**: WEB-UTIL-002 (color relocation), WEB-UTIL-006 (feature-specific
relocation)

---

## Notes

- **Pure Relocation**: No code changes, just file movement and import updates
- **Quick Win**: 30 minutes, high impact (organizes shared utilities)
- **Cross-Feature**: These utilities are used by stats, matchups, and analytics
- **No Breaking Changes**: All functionality preserved, just better organized
- **Grep Strategy**: Use `grep -r` to find all import statements efficiently

---

## Common Issues & Solutions

**Issue**: TypeScript can't find imports after move  
**Solution**: Verify barrel export includes all functions used

**Issue**: Circular dependency warnings  
**Solution**: These utilities are pure functions, should not cause circular deps

**Issue**: Tests fail after relocation  
**Solution**: Check test files also update their imports

---

**Estimated Context Usage**: 200 lines moved, 15-20 files updated, 30 min total
