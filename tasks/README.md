# Refactoring Tasks Directory

This directory contains **atomic, context-efficient tasks** for incrementally
refactoring the Gauntlet codebase to enterprise standards.

---

## 📋 Quick Start

### 1. Read the System

```bash
cat TASK_SYSTEM.md
```

Understand how tasks are structured and how to work with them.

### 2. Check Progress

```bash
cat tasks/PROGRESS.md
```

See what's done, what's next, and current metrics.

### 3. Start First Task

```bash
cat tasks/SETUP-001-testing-infrastructure.md
```

Follow the steps exactly.

---

## 🗂️ Task Categories

### SETUP-XXX: Infrastructure (Do First)

Foundation work that enables all other tasks.

**Files**:

- `SETUP-001-testing-infrastructure.md` - Vitest + React Testing Library
- `SETUP-002-test-utilities.md` - Custom render, factories, helpers

**Priority**: ⚠️ **HIGH** - Must complete before refactoring

---

### EXTRACT-XXX: Type Extraction (Quick Wins)

Moving types from implementation to dedicated files.

**Files**:

- `EXTRACT-001-manager-analysis-types.md` - Manager analysis component types

**Priority**: ⚠️ **HIGH** - Clarifies interfaces, enables other work  
**Time**: 15-20 min each  
**Risk**: 🟢 Low (TypeScript validates)

---

### UTIL-XXX: Utility Extraction (Build Foundation)

Creating testable utility functions from inline code.

**Files**:

- `UTIL-001-manager-analysis-formatting.md` - Currency, percentage, number
  formatting

**Priority**: 🟡 **MEDIUM** - Enables component splitting  
**Time**: 30-40 min each  
**Risk**: 🟢 Low (pure functions, easy to test)

---

### HOOK-XXX: Hook Extraction (Complex Logic)

Extracting stateful logic into custom hooks.

**Priority**: 🟡 **MEDIUM**  
**Time**: 45-60 min each  
**Risk**: 🟡 Medium (React-specific, needs careful testing)

---

### COMP-XXX: Component Splitting (Big Impact)

Breaking large components into focused sub-components.

**Priority**: 🟢 **NORMAL** (do after utils/hooks)  
**Time**: 1-2 hours each  
**Risk**: 🟡 Medium (UI changes, visual testing needed)

---

### TEST-XXX: Test Writing (Validation)

Adding tests to refactored code.

**Priority**: ⚠️ **HIGH** (do alongside refactoring)  
**Time**: 20-30 min each  
**Risk**: 🟢 Low (additive only)

---

## 🎯 Recommended Order

### Week 1: Foundation

```
1. SETUP-001  (30-45 min)  ⚠️ REQUIRED FIRST
2. SETUP-002  (45-60 min)  ⚠️ REQUIRED
3. EXTRACT-001 (15-20 min) ✅ Quick win
4. UTIL-001   (30-40 min)  ✅ Build momentum
```

### Week 2: Build Steam

```
5. EXTRACT-002 through EXTRACT-005
6. UTIL-002 through UTIL-004
7. Start HOOK-001
```

### Week 3+: Component Work

```
8. HOOK-001, HOOK-002
9. COMP-001 (big one!)
10. Continue with remaining tasks
```

---

## 🔧 Working with Tasks

### Opening a Task

```bash
# Read the task
cat tasks/SETUP-001-testing-infrastructure.md

# Open in editor
code tasks/SETUP-001-testing-infrastructure.md
```

### Cursor Prompt Template

```
I'm working on [TASK-ID]. Please:

1. Read tasks/[TASK-ID]-[name].md
2. Read [file] (lines X-Y only)
3. [Specific action from task]

Follow the task steps exactly.
```

### Completing a Task

```bash
# 1. Verify acceptance criteria
# 2. Run tests
pnpm test

# 3. Check TypeScript
pnpm tsc --noEmit

# 4. Commit with task ID
git add .
git commit -m "feat([TASK-ID]): [description]"

# 5. Update PROGRESS.md
# - Move task from "In Progress" to "Completed"
# - Update metrics
```

---

## 📊 Task Anatomy

Every task file contains:

### Header

- **Task ID**: Unique identifier
- **Overview**: What this accomplishes
- **Context Needed**: Exactly what files/lines to read

### Body

- **Objective**: Measurable goal
- **Steps**: Explicit instructions (follow exactly)
- **Acceptance Criteria**: Checklist for completion

### Footer

- **Estimated Context Usage**: How much to read/process
- **Related Tasks**: Dependencies and blockers
- **Cursor Prompt**: Copy-paste ready prompt
- **Verification**: Commands to verify completion

---

## 🎯 Task Selection Guide

### I have 30 minutes

→ Pick an **EXTRACT** task (15-20 min) or quick **UTIL** task

### I have 1 hour

→ Pick a **UTIL** or **HOOK** task

### I have 2 hours

→ Pick a **COMP** task or do 3-4 small tasks

### I'm just starting

→ Start with **SETUP-001** (required foundation)

### I want a quick win

→ Do **EXTRACT-001** (easy, safe, valuable)

### I want to make big impact

→ Do **COMP-001** (but do UTIL/HOOK tasks first!)

---

## ⚠️ Important Rules

### DO:

- ✅ Read task file completely before starting
- ✅ Use specific line ranges in Cursor prompts
- ✅ Follow steps exactly as written
- ✅ Verify all acceptance criteria
- ✅ Run tests before committing
- ✅ Use task ID in commit message
- ✅ Update PROGRESS.md after completion

### DON'T:

- ❌ Skip task steps or improvise
- ❌ Ask Cursor to "read entire file" if >500 lines
- ❌ Try multiple tasks in one session
- ❌ Commit without verifying acceptance criteria
- ❌ Ignore test failures
- ❌ Leave TODOs or console.logs

---

## 📈 Success Metrics

### Per Task

- ⏱️ **Completion time**: <60 minutes
- 📄 **Files read**: <3
- 📏 **Lines processed**: <500
- ✅ **Acceptance criteria**: 100% met
- 🧪 **Tests**: All passing
- 🚫 **Breaking changes**: 0

### Overall

Track in `PROGRESS.md`:

- Tasks completed per week
- Largest file size (decreasing)
- Test coverage (increasing)
- eslint-disable count (decreasing)

---

## 🆘 Help & Troubleshooting

### Task is too large

**Solution**: Break it down further

- Create TASK-XXXa, TASK-XXXb, etc.
- Each should be <60 min

### Context window filling up

**Solution**: You're reading too much

- Use specific line ranges
- Close unrelated files
- Start fresh Cursor session

### Tests failing after change

**Solution**: Revert and try again

```bash
git reset --hard HEAD
```

Re-read task, follow steps more carefully

### Can't find a task file

**Solution**: Create it!

- Copy template from TASK_SYSTEM.md
- Follow same structure
- Keep it atomic (<60 min)

---

## 🎓 Learning Resources

### Related Docs

- `TASK_SYSTEM.md` - Complete task system guide
- `GAP_ANALYSIS.md` - What needs to be done (high level)
- `REFACTORING_EXAMPLE.md` - Detailed before/after example
- `REFACTORING_ACTION_PLAN.md` - 8-week roadmap

### Patterns

As you complete tasks, document patterns in `PROGRESS.md` under "Learnings &
Patterns"

---

## 🚀 Ready to Start?

```bash
# 1. Read the system
cat TASK_SYSTEM.md

# 2. Check your status
cat tasks/PROGRESS.md

# 3. Start first task
cat tasks/SETUP-001-testing-infrastructure.md

# 4. Let's go! 💪
```

---

## 📬 Task Requests

Need a task that doesn't exist yet?

1. Check if it can be combined with existing task
2. If truly new, create following TASK_SYSTEM.md template
3. Keep it atomic (<60 min, <3 files, <500 lines)
4. Add to PROGRESS.md in appropriate category

---

**Remember**: Small, focused, tested, committed. Repeat until done! 🎯
