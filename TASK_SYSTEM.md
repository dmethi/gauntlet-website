# Task System for Incremental Refactoring

**Purpose**: Break down refactoring work into atomic, context-efficient tasks
that fit within Cursor's Claude-4.5-Sonnet context window.

---

## Core Principles

### 1. **Atomic Tasks**

Each task should be completable in one Cursor session without context bloat:

- ✅ Single file or small group of related files (<3 files)
- ✅ Clear start and end state
- ✅ Testable outcome
- ✅ Can be completed in 30-60 minutes

### 2. **Context Efficiency**

Optimize for AI context window usage:

- ✅ Max 2-3 files to read at once
- ✅ Clear, focused instructions
- ✅ No "figure it out" tasks
- ✅ Explicit acceptance criteria

### 3. **Independence**

Tasks should have minimal dependencies:

- ✅ Can be done in any order within a group
- ✅ Doesn't require massive code review
- ✅ Changes are isolated
- ✅ Easy to rollback if needed

### 4. **Incremental Value**

Each task should provide immediate value:

- ✅ Code is better after completion
- ✅ Tests still pass
- ✅ No breaking changes
- ✅ Can be committed independently

---

## Task Structure

Each task follows this format:

```markdown
# Task ID: [CATEGORY]-[NUMBER]

## Overview

Brief description of what this task accomplishes.

## Context Needed

- File: path/to/file.ts (lines X-Y) - What to look at
- File: path/to/other.ts (lines A-B) - Reference

## Objective

Specific, measurable goal.

## Steps

1. Read X
2. Extract Y
3. Create Z
4. Test

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests pass
- [ ] TypeScript compiles

## Estimated Context Usage

- Files to read: 2
- Lines to process: ~300
- New files: 1
- Risk: Low/Medium/High

## Related Tasks

- Depends on: TASK-001
- Blocks: TASK-003
```

---

## Task Categories

### SETUP-XXX: Infrastructure Setup

Foundation work that enables other tasks.

- Testing infrastructure
- ESLint configuration
- Folder structure
- Build configuration

**Priority**: High (do first)  
**Risk**: Low (doesn't touch business logic)

### EXTRACT-XXX: Type Extraction

Moving types from implementation files to types.ts.

- Single file operations
- Low risk
- High value (clarifies interfaces)

**Priority**: High (do early)  
**Risk**: Low (TypeScript validates)

### UTIL-XXX: Utility Extraction

Moving helper functions to utility files.

- Focus on pure functions
- Easy to test
- Clear boundaries

**Priority**: Medium  
**Risk**: Low (easy to test)

### HOOK-XXX: Hook Extraction

Creating custom hooks from inline logic.

- More complex than utils
- Requires understanding of React hooks
- Needs careful testing

**Priority**: Medium  
**Risk**: Medium (React-specific)

### COMP-XXX: Component Splitting

Breaking large components into sub-components.

- Most complex
- Requires UI understanding
- Visual testing needed

**Priority**: Medium (after hooks/utils)  
**Risk**: Medium-High (UI changes)

### TEST-XXX: Test Writing

Adding tests to newly extracted code.

- Can be done in parallel
- Clear acceptance criteria
- Validates refactoring

**Priority**: High (do alongside refactoring)  
**Risk**: Low (additive only)

### CLEAN-XXX: Cleanup Tasks

Final polish and optimization.

- Remove old files
- Add documentation
- Remove eslint-disable
- Add JSDoc

**Priority**: Low (do last)  
**Risk**: Low

---

## Task Sequencing Strategy

### Phase 1: Foundation (Do First)

```
SETUP-001 → SETUP-002 → SETUP-003
    ↓
All other tasks enabled
```

### Phase 2: Type Extraction (Quick Wins)

```
EXTRACT-001  EXTRACT-002  EXTRACT-003
     ↓            ↓            ↓
(Can be done in parallel)
```

### Phase 3: Logic Extraction (Order Matters)

```
UTIL-001 → TEST-001
    ↓
HOOK-001 → TEST-002
    ↓
COMP-001 → TEST-003
```

### Phase 4: Component Refactoring (Sequential)

```
COMP-001 → UTIL-002 → HOOK-002 → TEST-004 → CLEAN-001
```

---

## Working with Tasks

### Starting a Task

1. **Read the task file**

   ```bash
   cat tasks/EXTRACT-001-manager-analysis-types.md
   ```

2. **Open Cursor with focused context**

   ```
   Prompt: "I'm working on EXTRACT-001. Please read:
   - tasks/EXTRACT-001-manager-analysis-types.md
   - apps/web/src/components/manager-analysis.tsx (lines 1-100)

   Let's extract types as specified."
   ```

3. **Follow task steps exactly**

4. **Verify acceptance criteria**

5. **Commit with task ID**
   ```bash
   git commit -m "feat(EXTRACT-001): extract manager-analysis types"
   ```

### Context Management Tips

#### ✅ DO:

- **Reference specific line ranges** when asking Cursor to read files
- **Break large files into sections** (e.g., "read lines 1-300, then 301-600")
- **Use task IDs in all prompts** to maintain context
- **Close unrelated files** in your IDE
- **Start new Cursor sessions** for new tasks

#### ❌ DON'T:

- Ask Cursor to "read the whole file" if it's >500 lines
- Try to do multiple tasks in one session
- Keep old conversation context when starting new task
- Reference files that aren't needed for the task

### Example Cursor Prompts

#### Good (Context Efficient) ✅

```
"Working on EXTRACT-001. Read tasks/EXTRACT-001.md and
apps/web/src/components/manager-analysis.tsx lines 46-120
(just the interfaces). Extract these types to a new types.ts file."
```

#### Bad (Context Bloat) ❌

```
"Refactor manager-analysis.tsx to follow best practices.
Make it better and add tests."
```

### Progress Tracking

Create a simple progress file:

```markdown
# Refactoring Progress

## Completed ✅

- [x] SETUP-001: Testing infrastructure
- [x] EXTRACT-001: Manager analysis types

## In Progress 🔄

- [ ] UTIL-001: Manager analysis utils (50% done)

## Blocked 🚫

- [ ] COMP-001: Split manager analysis (waiting on UTIL-001)

## Up Next ⏭️

- [ ] EXTRACT-002: Draft analytics types
- [ ] UTIL-002: Draft analytics utils
```

---

## Task Templates

### Template: Type Extraction

```markdown
# Task: EXTRACT-[NUMBER]-[feature]-types

## Overview

Extract type definitions from [file] to separate types.ts file.

## Context Needed

- File: [path] (lines [X-Y]) - Type definitions only

## Objective

Move all interfaces and types to [new-path]/types.ts

## Steps

1. Create [new-path]/types.ts
2. Copy interfaces from [file] lines [X-Y]
3. Export all types
4. Update imports in [file]
5. Run TypeScript check

## Acceptance Criteria

- [ ] All types in separate file
- [ ] Original file imports from types.ts
- [ ] No TypeScript errors
- [ ] File compiles

## Estimated Context Usage

- Files to read: 1 (just type definitions section)
- Lines to process: ~100-200
- New files: 1
- Risk: Low
```

### Template: Utility Extraction

```markdown
# Task: UTIL-[NUMBER]-[feature]-[utility-name]

## Overview

Extract [function names] from [file] to utils/[name].ts

## Context Needed

- File: [path] (lines [X-Y]) - Function definitions
- (Optional) Reference: [path] - Usage examples

## Objective

Create testable utility function(s) in dedicated file

## Steps

1. Create utils/[name].ts
2. Move function(s) from [file]
3. Add JSDoc comments
4. Create utils/[name].test.ts
5. Write tests (aim for 100% coverage)
6. Update imports in original file
7. Verify tests pass

## Acceptance Criteria

- [ ] Function(s) in separate file
- [ ] JSDoc added with examples
- [ ] Tests written (100% coverage)
- [ ] All tests pass
- [ ] Original file updated
- [ ] No breaking changes

## Estimated Context Usage

- Files to read: 1-2
- Lines to process: ~50-150
- New files: 2 (util + test)
- Risk: Low
```

### Template: Hook Extraction

```markdown
# Task: HOOK-[NUMBER]-[feature]-[hook-name]

## Overview

Extract hook logic from [component] to custom hook

## Context Needed

- File: [component-path] (lines [X-Y]) - Hook logic section
- Reference: React hooks patterns

## Objective

Create reusable custom hook: use[Name]

## Steps

1. Create hooks/use[Name].ts
2. Extract state and logic from component
3. Define clear props and return types
4. Add JSDoc
5. Create hooks/use[Name].test.ts
6. Write tests with @testing-library/react
7. Update component to use hook
8. Verify component works

## Acceptance Criteria

- [ ] Hook in separate file
- [ ] Props and return types explicit
- [ ] JSDoc with usage example
- [ ] Tests using renderHook
- [ ] Component simplified
- [ ] All tests pass
- [ ] No UI regressions

## Estimated Context Usage

- Files to read: 1
- Lines to process: ~100-200
- New files: 2 (hook + test)
- Risk: Medium
```

---

## Context Budget Guidelines

### Small Task (Safe) ✅

- **Files to read**: 1-2
- **Lines to process**: <300
- **Complexity**: Low (pure functions, types)
- **Cursor sessions**: 1
- **Risk**: Low

**Example**: Extract types, create utility function

### Medium Task (Manageable) ⚠️

- **Files to read**: 2-3
- **Lines to process**: 300-600
- **Complexity**: Medium (hooks, state logic)
- **Cursor sessions**: 1-2
- **Risk**: Medium

**Example**: Extract custom hook, split component

### Large Task (Split It!) 🚫

- **Files to read**: 4+
- **Lines to process**: >600
- **Complexity**: High (multiple concerns)
- **Cursor sessions**: 3+
- **Risk**: High

**Action**: Break into smaller tasks!

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: "Boil the Ocean"

**Bad Task**: "Refactor manager-analysis.tsx"

- Too vague
- Too large (1,625 lines)
- Unclear acceptance criteria

**Good Tasks**:

- EXTRACT-001: Extract types (100 lines)
- UTIL-001: Extract formatting utils (50 lines)
- HOOK-001: Extract sorting hook (80 lines)

### ❌ Anti-Pattern 2: "Read Everything"

**Bad Prompt**: "Read the entire manager-analytics.ts file and refactor it"

- Context overload
- AI loses focus
- Poor results

**Good Prompt**: "Read manager-analytics.ts lines 200-280 (just the
concentration calculation functions). Extract these to
calculations/concentration.ts"

### ❌ Anti-Pattern 3: "Fix All The Things"

**Bad Task**: "Update all components to use memo()"

- Too many files
- Context overload
- Can't test properly

**Good Tasks**:

- COMP-001: Add memo() to ManagerAnalysis
- COMP-002: Add memo() to ManagerTable
- COMP-003: Add memo() to ManagerFilters

### ❌ Anti-Pattern 4: "Figure It Out"

**Bad Task**: "Make the code better"

- No clear objective
- AI has to guess
- Inconsistent results

**Good Task**: "Extract formatCurrency and formatPercentage functions to
utils/formatting.ts. Add tests. Update 3 import locations."

---

## Success Metrics

Track these per task:

- ✅ **Completion time**: <60 minutes
- ✅ **Context efficiency**: <3 files read
- ✅ **Test coverage**: Added or maintained
- ✅ **Breaking changes**: 0
- ✅ **TypeScript errors**: 0
- ✅ **Rollback ease**: Single commit

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│           TASK CHECKLIST (Use Every Time)               │
├─────────────────────────────────────────────────────────┤
│ Before Starting:                                        │
│  ☐ Task file read                                      │
│  ☐ Context files identified (<3 files)                 │
│  ☐ Acceptance criteria clear                           │
│  ☐ Tests planned                                       │
│                                                         │
│ During Work:                                            │
│  ☐ Using specific line ranges in prompts              │
│  ☐ Closing unrelated files                            │
│  ☐ Testing as you go                                   │
│  ☐ Following task steps exactly                        │
│                                                         │
│ Before Committing:                                      │
│  ☐ All acceptance criteria met                        │
│  ☐ Tests pass                                          │
│  ☐ TypeScript compiles                                │
│  ☐ No eslint errors                                    │
│  ☐ Task ID in commit message                          │
│                                                         │
│ Context Budget Check:                                   │
│  ☐ <3 files read                                       │
│  ☐ <500 lines processed                               │
│  ☐ Single clear objective                             │
│  ☐ Can explain task in 2 sentences                    │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Review this system** - Make sure it makes sense
2. **Look at task files** in `tasks/` directory
3. **Start with SETUP-001** - Testing infrastructure
4. **Track progress** in PROGRESS.md
5. **One task at a time** - No shortcuts!

Remember: **Small, focused, tested, committed.** Repeat until done! 🚀
