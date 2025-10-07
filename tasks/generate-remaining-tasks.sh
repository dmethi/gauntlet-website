#!/bin/bash

# Script to generate remaining WEB task files
# This creates task files for Phase 2-8 (31 remaining tasks)

TASKS_DIR="/Users/dhruv.methi/Documents/GitHub/gauntlet-website/tasks"
cd "$TASKS_DIR"

echo "Generating WEB task files..."
echo "Total to create: 31 files (Phase 2-8)"
echo ""

# Track count
COUNT=0

# Function to create task file
create_task() {
    local TASK_ID="$1"
    local TASK_NAME="$2"
    local CATEGORY="$3"
    local PRIORITY="$4"
    local TIME="$5"
    local DEPS="$6"
    
    COUNT=$((COUNT + 1))
    echo "[$COUNT/31] Creating $TASK_ID..."
    
    cat > "${TASK_ID}.md" << TASK_EOF
# ${TASK_ID}: ${TASK_NAME}

**Category**: ${CATEGORY}  
**Priority**: ${PRIORITY}  
**Estimated Time**: ${TIME}  
**Dependencies**: ${DEPS}

---

## Objective

[Detailed objective will be filled in - this is a placeholder]

---

## Context Needed

**Read these files**:
1. TBD

**Total Context**: ~XXX lines

---

## Steps

### 1. [Step 1]

[Detailed steps will be filled in]

---

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] TypeScript compilation passes
- [ ] Tests pass (if applicable)

---

## Verification Commands

\`\`\`bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit
pnpm test
pnpm lint
\`\`\`

---

## Cursor Prompt (Copy-Paste Ready)

\`\`\`
I'm working on ${TASK_ID}. Please read the task file and execute the steps.
\`\`\`

---

## Related Tasks

**Blocks**: TBD  
**Blocked By**: ${DEPS}  
**Related**: TBD

---

## Notes

[Task-specific notes]

---

**Estimated Context Usage**: XXX lines read, XXX lines written, ${TIME} total

TASK_EOF
}

# Phase 2: Type Extraction (4 tasks)
create_task "WEB-EXTRACT-001" "Manager Analysis Types" "EXTRACT" "⚠️ HIGH" "20 min" "WEB-SETUP-004"
create_task "WEB-EXTRACT-002" "Manager Analytics Logic Types" "EXTRACT" "⚠️ HIGH" "25 min" "WEB-EXTRACT-001"
create_task "WEB-EXTRACT-003" "Hooks Types" "EXTRACT" "🟡 MEDIUM" "20 min" "WEB-SETUP-004"
create_task "WEB-EXTRACT-004" "Stats Component Types" "EXTRACT" "🟡 MEDIUM" "30 min" "WEB-SETUP-004"

# Phase 3: Utility Extraction (4 tasks)
create_task "WEB-UTIL-001" "Formatting Utilities" "UTIL" "🟡 MEDIUM" "40 min" "WEB-SETUP-003, WEB-EXTRACT-001"
create_task "WEB-UTIL-002" "Color Utilities" "UTIL" "🟡 MEDIUM" "35 min" "WEB-SETUP-003"
create_task "WEB-UTIL-003" "Manager Analytics Calculations" "UTIL" "�� MEDIUM" "1 hour" "WEB-EXTRACT-002, WEB-SETUP-003"
create_task "WEB-UTIL-004" "Hall of Fame Utilities" "UTIL" "🟡 MEDIUM" "45 min" "WEB-SETUP-004"

# Phase 4: Hook Extraction (3 tasks)
create_task "WEB-HOOK-001" "Manager Sorting and Filtering" "HOOK" "🟡 MEDIUM" "1 hour" "WEB-UTIL-001, WEB-UTIL-002"
create_task "WEB-HOOK-002" "Draft Analytics Data Hook" "HOOK" "🟡 MEDIUM" "45 min" "WEB-UTIL-003"
create_task "WEB-HOOK-003" "Stats Hub Hooks" "HOOK" "🟡 MEDIUM" "1 hour" "WEB-EXTRACT-004"

# Phase 5: Component Splitting (5 tasks)
create_task "WEB-COMP-001" "Split Manager Analysis Component" "COMP" "🟢 HIGH" "2 hours" "WEB-HOOK-001, WEB-UTIL-001, WEB-UTIL-002"
create_task "WEB-COMP-002" "Split TrendsView Component" "COMP" "🟢 MEDIUM" "2 hours" "WEB-HOOK-003, WEB-EXTRACT-004"
create_task "WEB-COMP-003" "Split Playoff Bracket Component" "COMP" "🟢 MEDIUM" "1.5 hours" "WEB-SETUP-003"
create_task "WEB-COMP-004" "Split Schedule Analysis Component" "COMP" "🟢 MEDIUM" "1.5 hours" "WEB-HOOK-003"
create_task "WEB-COMP-005" "Split TeamView Component" "COMP" "🟢 MEDIUM" "1.5 hours" "WEB-HOOK-003"

# Phase 6: Page Migration (3 tasks)
create_task "WEB-PAGE-001" "Migrate Draft Analysis Pages" "PAGE" "🟢 MEDIUM" "1 hour" "WEB-COMP-001"
create_task "WEB-PAGE-002" "Migrate Stats Pages" "PAGE" "🟢 MEDIUM" "1 hour" "WEB-COMP-002"
create_task "WEB-PAGE-003" "Migrate Matchup Pages" "PAGE" "🟢 MEDIUM" "45 min" "WEB-SETUP-004"

# Phase 7: Testing (4 tasks)
create_task "WEB-TEST-001" "Component Tests (Critical Paths)" "TEST" "🔴 CRITICAL" "3 hours" "WEB-COMP-001, WEB-COMP-002, WEB-SETUP-003"
create_task "WEB-TEST-002" "Hook Tests" "TEST" "🔴 CRITICAL" "2 hours" "WEB-HOOK-001, WEB-HOOK-002, WEB-HOOK-003, WEB-SETUP-003"
create_task "WEB-TEST-003" "Utility Tests" "TEST" "🔴 CRITICAL" "2 hours" "WEB-UTIL-001, WEB-UTIL-002, WEB-UTIL-003, WEB-SETUP-003"
create_task "WEB-TEST-004" "Integration Tests (API Routes)" "TEST" "🟡 HIGH" "2 hours" "WEB-SETUP-003"

# Phase 8: Cleanup & Polish (8 tasks)
create_task "WEB-CLEAN-001" "Remove Deprecated Files" "CLEAN" "🟢 LOW" "30 min" "WEB-PAGE-001, WEB-PAGE-002, WEB-PAGE-003"
create_task "WEB-CLEAN-002" "Fix ESLint Violations" "CLEAN" "🟡 HIGH" "2 hours" "WEB-SETUP-002, WEB-COMP-001"
create_task "WEB-DOC-001" "Add JSDoc Documentation" "DOC" "🟢 LOW" "2 hours" "WEB-CLEAN-002"
create_task "WEB-DOC-002" "Create Feature READMEs" "DOC" "🟢 LOW" "1 hour" "WEB-DOC-001"

echo ""
echo "✅ Successfully created 31 task files!"
echo "Total files in tasks/: $(ls -1 WEB-*.md | wc -l)"
echo ""
echo "Next steps:"
echo "1. Review generated task files"
echo "2. Fill in detailed steps for each task as needed"
echo "3. Begin execution with WEB-SETUP-001"
