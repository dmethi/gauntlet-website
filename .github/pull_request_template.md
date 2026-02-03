# Pull Request

## Closes

Closes #<!-- Issue number -->

## Summary

<!-- Explain WHY this change was made, not just WHAT changed.
     Include:
     - Motivation for the change
     - Design decisions made
     - Alternatives considered (if applicable)
-->

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Documentation
- [ ] Test coverage

## Multi-League Safety

<!-- CRITICAL: Verify league data handling -->

- [ ] Does not touch league data processing
- [ ] Processes AFC and NFC separately, then combines
- [ ] Uses composite keys where needed (`${leagueId}-${id}`)
- [ ] No early merging of league data

## Type Safety

- [ ] All types from `@gauntlet/types` (no local redefinitions)
- [ ] Explicit return types on exported functions
- [ ] No `any` types
- [ ] No `@ts-ignore` without justification

## Code Patterns

- [ ] Arrow functions only (no classes)
- [ ] Factory pattern for stateful objects
- [ ] Named exports (no default exports)

## Test Plan

```bash
pnpm lint        # Must pass
pnpm type-check  # Must pass - zero errors
pnpm build       # Must pass
pnpm test        # Must pass
```

## Tier 1 Checks (Must Pass)

- [ ] `pnpm build` passes
- [ ] `pnpm type-check` passes (zero type errors)
- [ ] `pnpm test` passes
- [ ] No files > 800 lines (or justified below)

## Tier 2 Tech Debt Review

<!-- Present findings, user decides what to fix -->

**🔴 Critical Issues (Strongly Recommend Fixing):**

<!-- Files >700 lines, console.log spam, redefined types, etc. -->

- None / List issues

**⚠️ Recommendations (Consider Addressing):**

<!-- Files 400-700 lines, few console.log, missing JSDoc, etc. -->

- None / List issues

**💡 Suggestions (Nice to Have):**

<!-- Minor improvements, documentation, etc. -->

- None / List issues

## Accepted Tech Debt

<!-- If accepting Tier 2 issues, document rationale -->

- None / List with rationale:
  - `file.ts` is 750 lines — Rationale: cohesive domain logic, splitting would
    hurt readability

## Changed Files

<!-- List key files modified -->

-
-

## Screenshots (if UI changes)

**Before:**

<!-- screenshot -->

**After:**

<!-- screenshot -->

---

## Final Checklist

- [ ] Build passes
- [ ] Type-check passes (zero errors)
- [ ] Tests pass
- [ ] No files > 800 lines (or justified)
- [ ] No secrets or API keys committed
- [ ] Multi-league safety verified
- [ ] Types from `@gauntlet/types`
- [ ] Arrow functions only
- [ ] Tech debt review presented
- [ ] Ready for human review
