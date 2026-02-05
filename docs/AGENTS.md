# Agent Operating Manual

> This document defines how AI agents should operate in the gauntlet-website codebase.

When making edits, follow [Engineering Principles](ENGINEERING_PRINCIPLES.md).

## Quick Links

- [ETHOS.md](./ETHOS.md) - Engineering principles and values
- [TOPOLOGY.md](./TOPOLOGY.md) - What we're building (scope)
- [TRADEOFFS.md](./TRADEOFFS.md) - Decision-making guidance
- [ISSUE_GROOMING.md](./ISSUE_GROOMING.md) - Issue template for execution-ready tasks

---

## Git Worktree Protocol (Required for Parallel Work)

Multiple agents may work on this repository simultaneously. **Always use git worktrees** to avoid conflicts.

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

- Directory: `../gauntlet-website-worktrees/issue-<NUMBER>` or `../gauntlet-website-worktrees/<agent-id>`
- Branch: `issue-<NUMBER>` or `<agent-id>/<short-description>`

### Working in Your Worktree

1. **Always work in your worktree directory**, not the main repo
2. **Pull latest main before starting:** `git fetch origin && git rebase origin/main`
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
- If you see another agent's worktree touching the same files, coordinate before proceeding

---

## Issue Graph Protocol

The project uses `ISSUE_GRAPH.yaml` (repo root) to track issue dependencies and execution order.

### Before Starting Work

1. **Read `ISSUE_GRAPH.yaml`** to identify the `current_layer`
2. **Only pick issues from the current layer** with `status: pending`
3. If all issues in current layer are `done`, increment `current_layer` and proceed
4. Check `depends_on` - if an issue has dependencies, verify those are `done` first

### While Working

1. **Set issue status to `in_progress`** in ISSUE_GRAPH.yaml when you begin
2. **One agent per issue** - use git worktrees for parallelism (see [Git Worktree Protocol](#git-worktree-protocol-required-for-parallel-work) above)
3. Follow the PR checklist (see below)

### After Completing Work

1. **Set issue status to `done`** in ISSUE_GRAPH.yaml
2. **Close the GitHub issue** with a link to the merged PR
3. If you discovered new issues, add them to the `unassigned` section

### Hygiene (Weekly)

1. Run `gh issue list --state open` and compare against ISSUE_GRAPH.yaml
2. Add any untracked issues to the `unassigned` section
3. Analyze unassigned issues and place them in appropriate layers
4. Update `last_updated` timestamp

---

## PR Checklist

Before submitting a PR, verify:

- [ ] Changes are scoped to ONE issue only
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] No `console.log` statements in production code
- [ ] ISSUE_GRAPH.yaml updated (status → `done`)

---

## Hard Constraints

These are non-negotiable rules. Violating them blocks merge.

1. **Type safety** - No `any` types, no `@ts-ignore` without justification
2. **Process leagues separately** - Never combine league data before the presentation layer (see ETHOS.md)
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
