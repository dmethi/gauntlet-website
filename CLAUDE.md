Before making code changes, read and follow:

- docs/AGENTS.md (operating manual: worktrees, vertical slices, constraints)
- docs/ENGINEERING_PRINCIPLES.md (how to edit: principles and process) When
  relevant: docs/ETHOS.md, docs/solutions/,
  docs/solutions/patterns/critical-patterns.md

Before starting work, read ../shared-agent-config/skills/INDEX.md. If any skill
is relevant to the current task, read and follow it.

## TypeScript Type Safety

When reviewing or writing TypeScript code, proactively identify "impossible
states":

- Multiple boolean flags representing mutually exclusive states (isError +
  isInfo + isWarning)
- Optional fields that should be required in certain states
- Type definitions allowing nonsensical combinations

**Action**: Use `/impossible-states` skill to refactor these patterns into
discriminated unions. **When**: During code reviews, new features with state
management, or refactoring sessions. **Goal**: Catch errors at compile-time, not
runtime.
