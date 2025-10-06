# Task Generator Guide

**Purpose**: Systematically analyze parts of the codebase and generate
context-efficient tasks  
**Use**: Open fresh Cursor session, reference this guide + target code  
**Output**: New task files following established standards

---

## 🎯 How to Use This Guide

### For Each Area of the Codebase:

1. **Open fresh Cursor session** (avoid context bloat)
2. **Reference this guide** + vision documents
3. **Analyze target directory/file**
4. **Generate tasks** following templates below
5. **Add to tasks/** directory
6. **Update tasks/PROGRESS.md**

---

## 📚 Vision Documents (Reference These)

When generating tasks, reference these standards:

### Enterprise Patterns

- **CODING_CONVENTIONS.MD** - PrizePicks enterprise standards
  - Arrow functions, props destructuring, memoization
  - Component structure, barrel exports
  - Import conventions, type patterns

### Gauntlet Standards

- **.cursorrules** - Gauntlet-specific patterns
  - Multi-league architecture
  - Sleeper API usage
  - Type system (@gauntlet/types)

### Task Standards

- **TASK_SYSTEM.md** - How tasks should be structured
  - Context budgets (<300 lines = small, <600 = medium)
  - Acceptance criteria patterns
  - Related tasks format

### Examples

- **REFACTORING_EXAMPLE.md** - Concrete before/after
- **tasks/SETUP-001-\*.md** - Example task structure
- **tasks/UTIL-001-\*.md** - Example utility task

---

## 🔍 Analysis Process (Use in Fresh Cursor Session)

### Step 1: Inventory Analysis

**Cursor Prompt Template**:

```
I'm analyzing [DIRECTORY/FILE] to generate refactoring tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (this file)
2. [TARGET_DIRECTORY] (list files only, don't read contents yet)

Then tell me:
- What files exist
- Which appear to be in use (imported elsewhere)
- Which appear unused
- Rough file sizes
- Any obvious issues (huge files, empty files, etc.)
```

**Example**:

```
I'm analyzing apps/web/src/lib/ to generate refactoring tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md
2. List files in apps/web/src/lib/

Then tell me what we're working with.
```

### Step 2: Detailed Analysis (One File at a Time)

**Cursor Prompt Template**:

```
Now let's analyze [SPECIFIC_FILE]:

Read [SPECIFIC_FILE] and tell me:
1. File size (lines)
2. Main purpose
3. Types defined (should be in types.ts?)
4. Utility functions (pure functions that could be extracted?)
5. Complex logic (could be hooks or services?)
6. Imports (any relative path hell?)
7. Tests (do they exist?)
8. Patterns violated (from CODING_CONVENTIONS.MD)

Based on this, suggest task breakdown.
```

### Step 3: Task Generation

**Cursor Prompt Template**:

```
Based on the analysis, create tasks for [FILE/DIRECTORY]:

Use templates from TASK_GENERATOR_GUIDE.md.
Follow standards from TASK_SYSTEM.md.
Keep each task <60 min, <3 files, <500 lines.

Generate task files following the format.
```

---

## 📋 Task Templates by Type

### Template 1: Type Extraction

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
3. Add JSDoc comments
4. Export all types
5. Update imports in [file]
6. Run TypeScript check: `pnpm tsc --noEmit`

## Acceptance Criteria

- [ ] All types in separate file
- [ ] JSDoc comments added
- [ ] Original file imports from types.ts
- [ ] No TypeScript errors
- [ ] File compiles

## Estimated Context Usage

- Files to read: 1 (just type section)
- Lines to process: ~100-200
- New files: 1
- Risk: **Low** (TypeScript validates)

## Related Tasks

- **Depends on**: [if any]
- **Blocks**: [if any]

## Cursor Prompt

\`\`\` I'm working on EXTRACT-[NUMBER]. Please:

1. Read tasks/EXTRACT-[NUMBER]-[name].md
2. Read [file] lines [X-Y] only (types section)
3. Create types.ts as specified
4. Update imports in original file
5. Verify no TypeScript errors \`\`\`

## Commit Message

\`\`\` feat(EXTRACT-[NUMBER]): extract [feature] types

- Create [path]/types.ts
- Move [N] interfaces to types file
- Add JSDoc comments
- Update imports \`\`\`

## Estimated Time

⏱️ **15-20 minutes**
```

### Template 2: Utility Extraction

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
2. Move function(s) from [file] lines [X-Y]
3. Add JSDoc comments with examples
4. Create utils/[name].test.ts
5. Write tests (aim for 100% coverage)
6. Create utils/index.ts (if first util in feature)
7. Update imports in original file
8. Run tests: `pnpm test [path]`

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
- Risk: **Low** (pure functions)

## Related Tasks

- **Depends on**: EXTRACT-[X] (types)
- **Related**: Other UTIL tasks

## Cursor Prompt

\`\`\` I'm working on UTIL-[NUMBER]. Please:

1. Read tasks/UTIL-[NUMBER]-[name].md
2. Read [file] lines [X-Y] (just the function)
3. Create utils/[name].ts with the function
4. Create utils/[name].test.ts with comprehensive tests
5. Update imports in original file
6. Run tests to verify \`\`\`

## Commit Message

\`\`\` feat(UTIL-[NUMBER]): extract [utility-name] utility

- Create utils/[name].ts with [function]
- Add comprehensive tests (100% coverage)
- Add JSDoc with examples
- Update [N] usages in original file \`\`\`

## Estimated Time

⏱️ **30-40 minutes**
```

### Template 3: Hook Extraction

```markdown
# Task: HOOK-[NUMBER]-[feature]-[hook-name]

## Overview

Extract hook logic from [component] to custom hook

## Context Needed

- File: [component-path] (lines [X-Y]) - Hook logic section
- Reference: React hooks best practices

## Objective

Create reusable custom hook: use[Name]

## Steps

1. Create hooks/use[Name].ts
2. Extract state and logic from component lines [X-Y]
3. Define clear props and return types in separate types.ts
4. Add JSDoc with usage example
5. Create hooks/use[Name].test.ts
6. Write tests with @testing-library/react-hooks
7. Update component to use hook
8. Verify component works: `pnpm dev`
9. Run tests: `pnpm test [path]`

## Acceptance Criteria

- [ ] Hook in separate file
- [ ] Props and return types explicit
- [ ] JSDoc with usage example
- [ ] Tests using renderHook
- [ ] Component simplified
- [ ] All tests pass
- [ ] No UI regressions

## Estimated Context Usage

- Files to read: 1 (component section)
- Lines to process: ~100-200
- New files: 2 (hook + test)
- Risk: **Medium** (React-specific)

## Related Tasks

- **Depends on**: EXTRACT-[X] (types), UTIL-[Y] (utils)
- **Blocks**: COMP-[Z] (component split)

## Cursor Prompt

\`\`\` I'm working on HOOK-[NUMBER]. Please:

1. Read tasks/HOOK-[NUMBER]-[name].md
2. Read [component] lines [X-Y] (just the hook logic)
3. Create hooks/use[Name].ts
4. Create hooks/use[Name].test.ts with renderHook tests
5. Update component to use the hook
6. Verify tests pass \`\`\`

## Commit Message

\`\`\` feat(HOOK-[NUMBER]): extract use[Name] hook

- Create hooks/use[Name].ts
- Add comprehensive tests with renderHook
- Add JSDoc with usage example
- Update component to use hook
- Simplify component logic \`\`\`

## Estimated Time

⏱️ **45-60 minutes**
```

### Template 4: Component Splitting

```markdown
# Task: COMP-[NUMBER]-split-[component-name]

## Overview

Break [component] into focused sub-components

## Context Needed

- File: [component-path] - Full component
- Reference: REFACTORING_EXAMPLE.md (component splitting pattern)

## Objective

Split [N]-line component into [M] focused components

## Steps

1. Identify logical sections in component
2. Create folder structure: components/[ComponentName]/
3. Create sub-component files:
   - [SubComponent1].tsx
   - [SubComponent2].tsx
   - etc.
4. Create types.ts for component-specific types
5. Move JSX sections to sub-components
6. Create tests for each sub-component
7. Update main component to use sub-components
8. Add memo() to all components
9. Verify UI works: `pnpm dev`
10. Run tests: `pnpm test`

## Acceptance Criteria

- [ ] Main component <200 lines
- [ ] Each sub-component <150 lines
- [ ] All components have types.ts
- [ ] All components memoized
- [ ] Tests for all components
- [ ] No visual regressions
- [ ] All tests pass

## Estimated Context Usage

- Files to read: 1 (component - analyze structure first)
- Lines to process: Varies (do in phases)
- New files: [M+2] (M components + types + index)
- Risk: **Medium-High** (UI changes)

## Related Tasks

- **Depends on**: UTIL-[X], HOOK-[Y] (extract logic first!)
- **Blocks**: None

## Cursor Prompt

\`\`\` I'm working on COMP-[NUMBER]. Please:

1. Read tasks/COMP-[NUMBER]-[name].md
2. Read [component] and identify logical sections
3. Create first sub-component: [SubComponent1]
4. Then we'll iterate on others

Let's do this incrementally, one sub-component at a time. \`\`\`

## Commit Message

\`\`\` feat(COMP-[NUMBER]): split [component-name] into sub-components

- Create [M] focused sub-components
- Add types.ts for component types
- Add memo() to all components
- Add tests for all components
- Main component: [OLD] → [NEW] lines \`\`\`

## Estimated Time

⏱️ **1-2 hours** (do incrementally!)

## Notes

- Extract utils/hooks FIRST before splitting component
- Do one sub-component at a time
- Test after each sub-component
- Can split this into COMP-[N]a, COMP-[N]b, etc. if needed
```

### Template 5: Cleanup Task

```markdown
# Task: CLEAN-[NUMBER]-[description]

## Overview

Clean up [description] in [directory/file]

## Context Needed

- File/Directory: [path]

## Objective

[Specific cleanup goal]

## Steps

[Specific to cleanup type:

- Remove unused files
- Remove eslint-disable comments
- Add JSDoc to exports
- Fix import ordering
- Remove empty directories
- etc.]

## Acceptance Criteria

- [ ] [Specific to cleanup]
- [ ] Tests still pass
- [ ] No breaking changes

## Estimated Context Usage

- Files to read: [N]
- Lines to process: [~X]
- Risk: **Low**

## Cursor Prompt

\`\`\` I'm working on CLEAN-[NUMBER]. Please:

1. Read tasks/CLEAN-[NUMBER]-[name].md
2. [Specific action] \`\`\`

## Commit Message

\`\`\` chore(CLEAN-[NUMBER]): [description]

- [List changes] \`\`\`

## Estimated Time

⏱️ **15-30 minutes**
```

---

## 🎯 Analysis Checklists

### For Large Files (>500 lines)

Use this checklist to break down a large file:

```markdown
## File: [name] ([N] lines)

### Analysis

- [ ] Types defined: [list or "none"] → Extract to: EXTRACT-[N]-[feature]-types

- [ ] Pure functions: [list or "none"] → Extract to:
      UTIL-[N]-[feature]-[util-name]

- [ ] Hook logic: [list or "none"] → Extract to: HOOK-[N]-[feature]-[hook-name]

- [ ] Sub-components: [list or "none"] → Extract to: COMP-[N]-split-[component]

- [ ] Tests exist: [yes/no] → Create: TEST-[N]-[feature]-[test-name]

- [ ] eslint-disable: [count] → Fix: CLEAN-[N]-remove-eslint-disable

- [ ] Relative imports: [count] → Fix: CLEAN-[N]-fix-imports

### Proposed Tasks (in order)

1. EXTRACT-[N] - Types (15 min)
2. UTIL-[N] - Utils (30 min each)
3. HOOK-[N] - Hooks (45 min each)
4. COMP-[N] - Split component (1-2 hrs)
5. TEST-[N] - Add tests (30 min)
6. CLEAN-[N] - Final cleanup (15 min)

### Total Estimated Time: [X hours]
```

### For Directories

```markdown
## Directory: [path]

### Inventory

- Total files: [N]
- Large files (>500 lines): [list]
- Empty files: [list]
- Unused files: [list]
- Test coverage: [%]

### Prioritization

1. **Setup** (if needed): Testing infrastructure
2. **Quick wins**: Type extraction, unused file removal
3. **Foundation**: Utility extraction
4. **Complex**: Hook extraction, component splitting
5. **Polish**: Tests, documentation, cleanup

### Task List

[Generated from analysis above]

### Estimated Total Time: [X weeks]
```

---

## 🔄 Workflow for New Areas

### Example: Analyzing `apps/web/src/components/`

#### Session 1: Inventory (Fresh Cursor)

```
I'm analyzing apps/web/src/components/ to generate tasks.

Please:
1. Read TASK_GENERATOR_GUIDE.md
2. List all files in apps/web/src/components/
3. Identify files >500 lines
4. Check which files have tests

Create an inventory following the "For Directories" checklist.
```

#### Session 2: Analyze First Large File (Fresh Cursor)

```
I'm analyzing components/start-sit-efficiency.tsx (1,163 lines).

Please:
1. Read TASK_GENERATOR_GUIDE.md
2. Read components/start-sit-efficiency.tsx (structure only, not full content)
3. Use "For Large Files" checklist
4. Generate task breakdown

Follow the analysis checklist in TASK_GENERATOR_GUIDE.md.
```

#### Session 3: Generate Tasks (Fresh Cursor)

```
Based on analysis of start-sit-efficiency.tsx, create task files:

Use templates from TASK_GENERATOR_GUIDE.md:
1. EXTRACT-010-start-sit-types.md
2. UTIL-010-start-sit-calculations.md
3. HOOK-010-start-sit-filtering.md
4. COMP-010-split-start-sit.md

Follow the templates exactly.
```

#### Session 4: Update Progress (Fresh Cursor)

```
Update tasks/PROGRESS.md:

Add these new tasks:
- EXTRACT-010 through EXTRACT-015
- UTIL-010 through UTIL-015
- etc.

Update totals and categories.
```

---

## 📊 Task Numbering Convention

### By Category Ranges

```
SETUP:   001-009   (Foundation)
EXTRACT: 010-099   (Type extraction)
UTIL:    100-199   (Utility extraction)
HOOK:    200-299   (Hook extraction)
COMP:    300-399   (Component splitting)
TEST:    400-499   (Test writing)
CLEAN:   500-599   (Cleanup)
```

### Tracking

Keep a task registry in `tasks/PROGRESS.md`:

```markdown
## Task Registry

### Manager Analysis (001-050)

- EXTRACT-001: Manager analysis types
- UTIL-001: Formatting utils
- UTIL-002: Color utils
- HOOK-001: Sorting hook
- COMP-001: Split main component

### Start-Sit Efficiency (051-100)

- EXTRACT-010: Start-sit types
- UTIL-010: Calculation utils
- etc.
```

---

## 🎓 Example: Full Analysis of `lib/` Directory

### Step 1: Inventory (Cursor Session 1)

```markdown
## Directory: apps/web/src/lib/

### Files Found

1. draft-analytics.ts (650 lines) 🔴
2. manager-analytics.ts (1,347 lines) 🔴🔴
3. hall-of-fame-data-service.ts (438 lines) 🟡
4. hooks.ts (726 lines) 🔴
5. utils.ts (100 lines) ✅
6. constants.ts (50 lines) ✅
7. [etc.]

### Issues Identified

- 🔴🔴 Critical: manager-analytics.ts (1,347 lines!)
- 🔴 Critical: hooks.ts (726 lines, should be split)
- 🔴 Critical: draft-analytics.ts (650 lines)
- 🟡 Important: hall-of-fame-data-service.ts (438 lines)
```

### Step 2: Analyze First File (Cursor Session 2)

```markdown
## File: lib/manager-analytics.ts (1,347 lines)

### Contains

- Types: 15 interfaces (lines 1-120)
- Utilities:
  - Concentration calculations (lines 200-280)
  - Pacing calculations (lines 300-380)
  - Clustering logic (lines 400-550)
  - Overlap analysis (lines 600-750)
- Main export: generateManagerAnalytics (lines 800-1,347)
- Tests: ❌ None

### Proposed Task Breakdown

1. EXTRACT-020: Types (20 min)
2. UTIL-020: Concentration utils (40 min)
3. UTIL-021: Pacing utils (40 min)
4. UTIL-022: Clustering utils (60 min)
5. UTIL-023: Overlap utils (60 min)
6. TEST-020: Test all utils (2 hours)

Total: ~5 hours → Results in 8+ files with tests
```

### Step 3: Generate Tasks (Cursor Session 3)

```
Create these task files following templates from TASK_GENERATOR_GUIDE.md:

1. EXTRACT-020-manager-analytics-types.md
2. UTIL-020-manager-analytics-concentration.md
3. UTIL-021-manager-analytics-pacing.md
4. UTIL-022-manager-analytics-clustering.md
5. UTIL-023-manager-analytics-overlap.md
6. TEST-020-manager-analytics-utils.md

Use the Utility Extraction template for UTIL tasks.
Use the Type Extraction template for EXTRACT tasks.
```

---

## 💡 Tips for Effective Task Generation

### DO:

- ✅ **Start with inventory** - Know what you're dealing with
- ✅ **Analyze one file at a time** - Avoid context overload
- ✅ **Use fresh Cursor sessions** - Clean slate for each analysis
- ✅ **Reference vision docs** - Maintain standards
- ✅ **Keep tasks <60 min** - Break down if larger
- ✅ **Include context budgets** - Help future you

### DON'T:

- ❌ Try to analyze entire codebase at once
- ❌ Generate tasks without understanding the code
- ❌ Skip the checklist process
- ❌ Create tasks without clear acceptance criteria
- ❌ Forget to update PROGRESS.md

---

## 🚀 Quick Reference

### Generate Tasks for New Area

```bash
# 1. Fresh Cursor session
# 2. Prompt:
"I'm analyzing [DIRECTORY] to generate refactoring tasks.

Please:
1. Read TASK_GENERATOR_GUIDE.md
2. List files in [DIRECTORY]
3. Use inventory checklist
4. Identify issues and priorities"

# 3. For each large file:
"Analyze [FILE] using 'For Large Files' checklist from TASK_GENERATOR_GUIDE.md"

# 4. Generate tasks:
"Create task files for [FILE] using templates from TASK_GENERATOR_GUIDE.md"

# 5. Update tracking:
"Update tasks/PROGRESS.md with new tasks"
```

---

## 📋 Task Generation Checklist

Before creating tasks for an area:

- [ ] Inventoried all files
- [ ] Identified large files (>500 lines)
- [ ] Checked for tests
- [ ] Listed relative imports
- [ ] Found eslint-disable comments
- [ ] Identified unused files
- [ ] Prioritized tasks
- [ ] Estimated time per task
- [ ] Numbered tasks sequentially
- [ ] Used appropriate templates
- [ ] Updated PROGRESS.md

---

## 🎯 Success Metrics

### Per Analysis Session

- **Files analyzed**: 1-3
- **Tasks generated**: 3-8
- **Time spent**: <60 min
- **Context efficiency**: Used fresh sessions

### Per Area Completed

- **Tasks created**: All following standards
- **Estimates included**: Time, context, risk
- **Dependencies mapped**: Know what blocks what
- **Progress tracked**: Updated PROGRESS.md

---

## 📚 Files This Guide References

```
Vision & Standards:
- CODING_CONVENTIONS.MD
- .cursorrules
- TASK_SYSTEM.md
- REFACTORING_EXAMPLE.md

Task Examples:
- tasks/SETUP-001-*.md
- tasks/EXTRACT-001-*.md
- tasks/UTIL-001-*.md

Tracking:
- tasks/PROGRESS.md
```

---

**Remember**: This guide helps you scale the refactoring system across the
entire codebase while maintaining context efficiency! 🚀
