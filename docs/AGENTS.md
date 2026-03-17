# Agent Operating Manual

> This document defines how AI agents should operate in the gauntlet-website
> codebase.

When making edits, follow [Engineering Principles](ENGINEERING_PRINCIPLES.md).

## Quick Links

- [ETHOS.md](./ETHOS.md) - Engineering principles and values
- [TOPOLOGY.md](./TOPOLOGY.md) - What we're building (scope)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System layout and module boundaries
- [TRADEOFFS.md](./TRADEOFFS.md) - Decision-making guidance
- [ISSUE_GROOMING.md](./ISSUE_GROOMING.md) - Execution-readiness checklist and
  workflow

---

## Git Worktree Protocol (Required for Parallel Work)

Multiple agents may work on this repository simultaneously. **Always use git
worktrees** to avoid conflicts.

### Why Worktrees?

- Multiple agents cannot safely share a single working directory
- Worktrees provide isolated working directories sharing the same `.git` history
- Each agent gets its own branch and files without stepping on others

### Setting Up Your Worktree

```bash
# From the main repo directory, create a worktree for your issue
git worktree add ../gauntlet-website-worktrees/issue-<NUMBER> -b issue-<NUMBER>

# Example: Working on issue #42
git worktree add ../gauntlet-website-worktrees/issue-42 -b issue-42

# Navigate to your worktree
cd ../gauntlet-website-worktrees/issue-42
```

### Worktree Naming Convention

- Directory: `../gauntlet-website-worktrees/issue-<NUMBER>`
- Branch: `issue-<NUMBER>` or `issue-<NUMBER>-<short-description>`
- Non-issue explorations may use: `../gauntlet-website-worktrees/<agent-id>` and
  `<agent-id>/<short-description>`

### Working in Your Worktree

1. **Always work in your worktree directory**, not the main repo
2. **Pull latest main before starting:**
   `git fetch origin && git rebase origin/main`
3. **Push your branch regularly** to avoid losing work
4. **Never modify files in another agent's worktree**

### Cleanup After PR Merge

```bash
# After your PR is merged, clean up
cd /path/to/main/gauntlet-website
git worktree remove ../gauntlet-website-worktrees/issue-<NUMBER>
git branch -d issue-<NUMBER>
```

### Conflict Prevention

- Each agent works on **one issue at a time** in **one worktree**
- Check `git worktree list` to see active worktrees before creating new ones
- If you see another agent's worktree touching the same files, coordinate before
  proceeding

---

## Picking Up Work

Issues are structured as **vertical slices** — each delivers one complete
feature end-to-end. Issues use the `vertical_slice` template on GitHub. Treat
legacy references to `groomed_issue` as `vertical_slice` + the
`ISSUE_GROOMING.md` readiness checklist.

### Before Starting

1. Check open issues: `gh issue list --state open --label slice`
2. Pick an unassigned slice issue and confirm it is execution-ready
3. Read the full issue — especially **Scope** and **Out of Scope**
4. Set up a worktree for the issue (see above)

### While Working

1. **Stay within scope** — the In Scope checklist IS the work; Out of Scope is a
   hard boundary
2. **Commit incrementally** — don't save everything for one giant commit
3. **One slice per PR** — each PR closes exactly one issue

### After Completing

1. Verify all scope items are checked off
2. Verify guardrails hold (existing tests pass, no type/lint errors)
3. Create PR using the repo's PR template
4. Link PR to issue (`Closes #X`)

---

## PR Checklist

Before submitting a PR, verify:

- [ ] Changes are scoped to ONE issue only
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] No `console.log` statements in production code
- [ ] Issue linked in PR (`Closes #X`)

---

## Hard Constraints

These are non-negotiable rules. Violating them blocks merge.

1. **Type safety** - No `any` types, no `@ts-ignore` without justification
2. **Process leagues separately** - Never combine league data before the
   presentation layer (see ETHOS.md)
3. **One issue per PR** - Keep changes atomic and reviewable

---

## Common Patterns

> TODO: Expand this section when working on issue #20

### Adding a New Feature

1. Create feature directory: `apps/web/src/features/[name]/`
2. Follow structure: `components/`, `hooks/`, `utils/`, `types.ts`, `index.ts`
3. Export public API from `index.ts`

### Adding a New API Endpoint

1. Add route in `apps/server/`
2. Add types to `@gauntlet/types`
3. Add TanStack Query hook in relevant feature

---

## Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
