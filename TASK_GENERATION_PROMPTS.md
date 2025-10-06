# Task Generation Prompts

**Purpose**: Copy-paste ready prompts for analyzing codebase areas and generating tasks  
**Use**: Open fresh Cursor session, copy prompt, paste, follow workflow

---

## 🎯 Workflow Overview

```
Session 1: Inventory → Session 2: Analyze → Session 3: Generate → Session 4: Update
   (15 min)              (30 min)             (30 min)            (10 min)
```

---

## 📋 Session 1: Inventory Analysis

### Prompt: Analyze Directory
```
I'm analyzing [DIRECTORY_PATH] to generate refactoring tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the analysis process section)
2. List all files in [DIRECTORY_PATH]

Then create an inventory following the "For Directories" checklist:
- Total files
- Large files (>500 lines)
- Empty files
- Files without tests
- Priority order

Use the directory analysis format from TASK_GENERATOR_GUIDE.md.
```

### Example: Analyze lib/ directory
```
I'm analyzing apps/web/src/lib/ to generate refactoring tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the analysis process section)
2. List all files in apps/web/src/lib/

Then create an inventory following the "For Directories" checklist:
- Total files
- Large files (>500 lines)
- Empty files
- Files without tests
- Priority order

Use the directory analysis format from TASK_GENERATOR_GUIDE.md.
```

---

## 📄 Session 2: Analyze Specific File

### Prompt: Analyze Large File
```
I'm analyzing [FILE_PATH] ([N] lines) to break it into manageable tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the "For Large Files" checklist)
2. [FILE_PATH] (scan structure only - identify sections, don't read every line)

Then complete the "For Large Files" checklist:
- Types defined (where, how many)
- Pure functions (list them)
- Hook logic (identify sections)
- Sub-components (if applicable)
- Tests exist?
- eslint-disable count
- Relative imports count

Provide task breakdown with time estimates.
```

### Example: Analyze manager-analytics.ts
```
I'm analyzing apps/web/src/lib/manager-analytics.ts (1,347 lines) to break it into manageable tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the "For Large Files" checklist)
2. apps/web/src/lib/manager-analytics.ts (scan structure only - identify sections)

Then complete the "For Large Files" checklist:
- Types defined (where, how many)
- Pure functions (list them)
- Hook logic (identify sections)
- Tests exist?
- eslint-disable count
- Relative imports count

Provide task breakdown with time estimates.
```

### Prompt: Analyze Component
```
I'm analyzing [COMPONENT_PATH] to identify refactoring opportunities.

Please read:
1. TASK_GENERATOR_GUIDE.md
2. REFACTORING_EXAMPLE.md (the component splitting pattern)
3. [COMPONENT_PATH] (structure analysis - count lines, identify sections)

Then tell me:
- Total lines
- State variables count
- useMemo/useCallback count
- Inline helper functions
- Sub-sections that could be components
- Potential custom hooks
- Tests exist?

Suggest task breakdown following the example in REFACTORING_EXAMPLE.md.
```

### Example: Analyze start-sit-efficiency.tsx
```
I'm analyzing apps/web/src/components/start-sit-efficiency.tsx to identify refactoring opportunities.

Please read:
1. TASK_GENERATOR_GUIDE.md
2. REFACTORING_EXAMPLE.md (the component splitting pattern)
3. apps/web/src/components/start-sit-efficiency.tsx (structure analysis)

Then tell me:
- Total lines
- State variables count
- useMemo/useCallback count
- Inline helper functions
- Sub-sections that could be components
- Potential custom hooks
- Tests exist?

Suggest task breakdown following the example in REFACTORING_EXAMPLE.md.
```

---

## 📝 Session 3: Generate Task Files

### Prompt: Generate Tasks from Analysis
```
Based on the analysis of [FILE/DIRECTORY], create task files.

Please read:
1. TASK_GENERATOR_GUIDE.md (task templates section)
2. Previous analysis (in this conversation)

Generate these task files:
[List tasks identified in analysis, e.g.:
- EXTRACT-020-manager-analytics-types.md
- UTIL-020-manager-analytics-concentration.md
- UTIL-021-manager-analytics-pacing.md
- etc.]

Use the appropriate template from TASK_GENERATOR_GUIDE.md for each task type.
Follow the format exactly - include all sections.

Start with the first task file.
```

### Prompt: Generate Single Task
```
Create task file: [TASK-ID]-[name].md

Please read:
1. TASK_GENERATOR_GUIDE.md (the [TASK_TYPE] template)
2. [SOURCE_FILE] lines [X-Y] (the specific section to extract)

Generate task file following the template:
- Use [TASK_TYPE] template (EXTRACT, UTIL, HOOK, or COMP)
- Include specific line numbers
- Add context budget estimates
- Include acceptance criteria
- Add Cursor prompt
- Estimated time

Save as: tasks/[TASK-ID]-[name].md
```

---

## 📊 Session 4: Update Progress

### Prompt: Update Progress Tracker
```
Update tasks/PROGRESS.md with new tasks.

Please read:
1. tasks/PROGRESS.md
2. New task files generated (list them)

Then update:
- Add new tasks to "Up Next" or "Queued" section
- Update task counts by category
- Add to task registry with range
- Update metrics if applicable

Maintain the existing format.
```

---

## 🎯 Complete Workflow Example

### Analyzing `apps/web/src/lib/stats/` Directory

#### Step 1: Inventory (Fresh Session)
```
I'm analyzing apps/web/src/lib/stats/ to generate refactoring tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the analysis process section)
2. List all files in apps/web/src/lib/stats/

Then create an inventory following the "For Directories" checklist:
- Total files
- Large files (>500 lines)
- Empty files
- Files without tests
- Priority order

Use the directory analysis format from TASK_GENERATOR_GUIDE.md.
```

#### Step 2: Analyze First File (Fresh Session)
```
I'm analyzing apps/web/src/lib/stats/positions.ts to break it into manageable tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the "For Large Files" checklist)
2. apps/web/src/lib/stats/positions.ts (scan structure only)

Then complete the "For Large Files" checklist:
- Types defined (where, how many)
- Pure functions (list them)
- Tests exist?
- eslint-disable count

Provide task breakdown with time estimates.
```

#### Step 3: Generate Tasks (Fresh Session)
```
Based on the analysis of lib/stats/positions.ts, create task files.

Please read:
1. TASK_GENERATOR_GUIDE.md (task templates section)
2. Previous analysis (in this conversation)

Generate these task files:
- EXTRACT-030-stats-positions-types.md
- UTIL-030-stats-positions-calculations.md
- TEST-030-stats-positions.md

Use the appropriate template from TASK_GENERATOR_GUIDE.md for each task type.
Follow the format exactly.

Start with EXTRACT-030.
```

#### Step 4: Update Tracker (Fresh Session)
```
Update tasks/PROGRESS.md with new stats tasks.

Please read:
1. tasks/PROGRESS.md
2. New task files: EXTRACT-030, UTIL-030, TEST-030

Then update:
- Add to "Up Next" section
- Update task counts
- Add to task registry under "Stats (030-080)"
- Update metrics

Maintain existing format.
```

---

## 🔍 Specialized Analysis Prompts

### Identify Unused Files
```
Help me identify unused files in [DIRECTORY].

Please:
1. List all files in [DIRECTORY]
2. For each file, check if it's imported anywhere in apps/web/src/
3. Mark as used/unused
4. Generate CLEAN-[N]-remove-unused-files.md task for unused files

Use grep or file search to find imports.
```

### Find Files Without Tests
```
Help me find files without tests in [DIRECTORY].

Please:
1. List all .ts/.tsx files in [DIRECTORY]
2. Check if corresponding .test.ts/.test.tsx exists
3. List files missing tests
4. Prioritize by file size/importance
5. Generate TEST-[N] tasks for files without tests

Use the Test Writing template from TASK_GENERATOR_GUIDE.md.
```

### Find Large Files Needing Refactoring
```
Help me find large files needing refactoring in [DIRECTORY].

Please:
1. List all files in [DIRECTORY] with line counts
2. Identify files >500 lines
3. Rank by size (largest first)
4. For top 3 largest, suggest task breakdown

Use "For Large Files" checklist from TASK_GENERATOR_GUIDE.md.
```

### Find eslint-disable Issues
```
Help me find and fix eslint-disable comments in [DIRECTORY].

Please:
1. Search for "eslint-disable" in [DIRECTORY]
2. List files with eslint-disable
3. Count per file
4. Generate CLEAN-[N]-remove-eslint-disable tasks

One task per file or group of related files.
```

---

## 📋 Quick Reference

### Session Types
| Session | Time | Output |
|---------|------|--------|
| Inventory | 15 min | Directory analysis |
| Analyze | 30 min | File breakdown |
| Generate | 30 min | Task files |
| Update | 10 min | Progress tracker |

### When to Use Fresh Session
- ✅ **Always** for inventory
- ✅ **Always** for analyzing new file
- ✅ **Always** for generating tasks
- ⚠️ **Maybe** for updating progress (quick, can continue)

### Context Budget Check
Before each prompt ask:
- Am I reading <3 files? ✅
- Are my line ranges specific? ✅
- Is my objective clear? ✅
- Will this take <60 min? ✅

---

## 🎓 Tips for Success

### DO:
- ✅ Copy prompts exactly (they're optimized)
- ✅ Use fresh session for each phase
- ✅ Reference TASK_GENERATOR_GUIDE.md
- ✅ Specify "structure only" for large files
- ✅ Follow up with specific sections

### DON'T:
- ❌ Try to analyze everything at once
- ❌ Ask to "read entire file" if >500 lines
- ❌ Generate tasks without analysis first
- ❌ Skip the checklist process
- ❌ Forget to update PROGRESS.md

---

## 🚀 Getting Started Right Now

### Your Next Command
```bash
# 1. Pick an area to analyze (e.g., lib/, components/, etc.)
# 2. Copy the "Inventory" prompt above
# 3. Open fresh Cursor session
# 4. Paste and customize
# 5. Follow the workflow
```

### Example First Area: `lib/` Directory
```
I'm analyzing apps/web/src/lib/ to generate refactoring tasks.

Please read:
1. TASK_GENERATOR_GUIDE.md (the analysis process section)
2. List all files in apps/web/src/lib/

Then create an inventory following the "For Directories" checklist:
- Total files
- Large files (>500 lines)
- Empty files
- Files without tests
- Priority order

Use the directory analysis format from TASK_GENERATOR_GUIDE.md.
```

**That's it! Start generating tasks across the codebase!** 🎯

