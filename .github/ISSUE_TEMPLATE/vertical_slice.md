---
name: Vertical Slice
about:
  A feature slice for implementation (schema + logic + API + tests in one PR)
title: '[Slice] '
labels: slice
assignees: ''
---

## Objective

<!-- What this slice delivers, in 1-2 sentences. Focus on the user/system outcome, not implementation details. -->

## Scope

### In Scope

<!-- Checklist of everything this slice includes. Be specific — this IS the work. -->

- [ ]
- [ ]
- [ ]

### Out of Scope

<!-- Explicit boundaries. What this slice must NOT touch. Be aggressive here — scope creep kills slices. -->

-
-

## Context

<!-- Relevant patterns, existing code, architectural decisions. Link to files/docs the agent should read first. -->

- **Patterns to follow**:
  <!-- e.g., "follow pattern in src/modules/example/" -->
- **Related code**: <!-- files/directories to study before starting -->
- **Architecture docs**: <!-- relevant docs in docs/ -->

## Guardrails

<!-- Invariants that must hold. What must NOT break. -->

- [ ] All existing tests pass
- [ ] No type/lint errors introduced
- [ ] No secrets or PII in code/logs

## Test Plan

<!-- How to verify this slice works. Include exact commands. -->

```bash
pnpm test
```

### Happy Path

<!-- Key scenarios that must work -->

-

### Failure Path

<!-- Error scenarios and edge cases to cover -->

-

### Regression

<!-- Existing functionality that must not break -->

-

## Rollout Notes

<!-- Deployment considerations -->

- [ ] No special deployment steps
- [ ] Requires DB migration
- [ ] Requires env var update: <!-- which one? -->

## Definition of Done

- [ ] All scope items checked off
- [ ] Guardrails verified
- [ ] Tests written and passing
- [ ] PR created with detailed description (WHY, not WHAT)
- [ ] Ready for human review
