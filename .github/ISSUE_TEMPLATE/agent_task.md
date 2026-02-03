---
name: Agent Task
about: A task for AI agents to work on
title: '[Domain] Brief description'
labels: ''
assignees: ''
---

## Goal

<!-- What should be accomplished? (1-2 sentences) -->

## Non-Goals

<!-- What is explicitly OUT of scope for this task? -->

-

## Acceptance Criteria

<!-- Checklist of requirements to consider this done -->

- [ ]
- [ ]
- [ ]

## Files Likely Touched

<!-- List files/directories that will probably be modified -->

-
-

## Multi-League Safety

<!-- Does this touch league data processing? -->

- [ ] Does not touch league data
- [ ] Processes leagues separately (verified)
- [ ] Uses composite keys (`${leagueId}-${rosterId}`)

## Type Safety

<!-- Type-related considerations -->

- [ ] Uses types from `@gauntlet/types`
- [ ] No local type redefinitions
- [ ] Explicit return types on exports

## Test Plan

<!-- How should this be tested? -->

```bash
pnpm lint
pnpm type-check
pnpm build
pnpm test
```

## Definition of Done

- [ ] Code implemented
- [ ] Build passes
- [ ] Type-check passes (zero errors)
- [ ] Tests pass
- [ ] File sizes < 800 lines
- [ ] No console.log in production code
- [ ] PR submitted

---

## For Agents

**Before starting:**

1. Read `docs/AGENTS.md` (if exists) or `.cursorrules`
2. Read `docs/ARCHITECTURE.md`
3. Check `docs/constraints/` for domain rules

**While working:**

- Process AFC/NFC data separately
- Use types from `@gauntlet/types`
- Arrow functions only (no classes)
- Keep files under 800 lines

**When done:**

- Link PR to this issue (`Closes #X`)
- Document any accepted tech debt
- Present Tier 2 findings to user
