# WEB-COMP-007: Split Transaction Analysis Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟢 LOW  
**Estimated Time**: 1.5 hours  
**Dependencies**: WEB-EXTRACT-007

---

## Objective

Break down `TransactionAnalysis.tsx` (852 lines) into maintainable
sub-components for analyzing adds, drops, trades, and waiver activity.

---

## Current State

**File**: `apps/web/src/app/stats/components/TransactionAnalysis.tsx`  
**Lines**: 852 lines  
**Issues**:

- Single component handling all transaction types
- Transaction grading logic inline
- Repeated table patterns
- Complex filtering/sorting mixed with display
- No memoization

---

## Target Structure

```
apps/web/src/features/transactions/components/
├── TransactionAnalysis/
│   ├── TransactionAnalysis.tsx         # Main container (~80 lines)
│   ├── TransactionAnalysis.test.tsx
│   ├── TransactionSummary.tsx          # Overview stats (~100 lines)
│   ├── TransactionSummary.test.tsx
│   ├── AddsDropsTable.tsx              # Add/drop analysis (~150 lines)
│   ├── AddsDropsTable.test.tsx
│   ├── TradesTable.tsx                 # Trade analysis (~150 lines)
│   ├── TradesTable.test.tsx
│   ├── WaiverActivity.tsx              # Waiver priority (~120 lines)
│   ├── WaiverActivity.test.tsx
│   ├── TransactionGrading.tsx          # Grade by transaction (~120 lines)
│   ├── TransactionGrading.test.tsx
│   ├── utils.ts                         # Transaction utilities
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract Transaction Utilities (20 min)

Create `utils.ts` with:

- `gradeTransaction()` - Evaluate add/drop quality
- `calculatePointsImpact()` - Points gained/lost
- `analyzeWaiverEfficiency()` - Waiver priority usage
- `calculateTradeValue()` - Trade balance analysis
- `groupByTransactionType()` - Type-based grouping
- `calculateManagerActivity()` - Transaction frequency

### Step 2: Create Summary Component (15 min)

Transaction overview showing:

- Total transactions by type
- Most active managers
- Best/worst moves
- Activity timeline

### Step 3: Create Detail Tables (40 min)

- **AddsDropsTable**: All adds/drops with grades
- **TradesTable**: Trade history with value analysis
- **WaiverActivity**: Waiver priority and usage patterns

### Step 4: Create Grading Component (20 min)

**TransactionGrading**: Individual transaction grades with explanations.

### Step 5: Main Container and Tests (20 min)

### Step 6: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <100 lines
- [ ] 5+ sub-components created
- [ ] All transaction logic in utils
- [ ] Utils have 90%+ test coverage
- [ ] All components use `memo()`
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/transactions/components
pnpm tsc --noEmit
pnpm lint
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-007: Split TransactionAnalysis Component.

Please:
1. Read apps/web/src/app/stats/components/TransactionAnalysis.tsx
2. Create features/transactions/components/TransactionAnalysis/ directory
3. Extract transaction grading utilities to utils.ts
4. Create TransactionSummary and AddsDropsTable components
5. Follow arrow function and memo() patterns
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-007  
**Related**: WEB-UTIL-002 (Transaction utilities)

---

**Estimated Total Time**: 1.5 hours
