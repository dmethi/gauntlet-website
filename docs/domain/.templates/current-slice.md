# Current Slice: #<issue> — <title>

> **Agent:** Read this file first. Then read the context files listed at the
> bottom. Then read `docs/domain/system.md`. This file is replaced at the start
> of each planning session by `/decomposition`.

## What We're Building

<!-- One paragraph: the goal, the user-visible outcome, and why it matters now -->

## Bounded Context

<!-- Which context(s) this slice lives in -->

- **Primary:** `<context-name>`
- **Also touches:** `<context-name>` — <why>

## Acceptance Criteria

<!-- Exact and testable. Each item maps to a test or a verifiable behavior. -->

- [ ] ...
- [ ] ...

## Non-Goals (Hard Boundary)

<!-- What this slice explicitly does NOT do. The agent must not implement these. -->

- ...

## Constraints

<!-- Technical, architectural, or domain constraints the agent must respect -->

- ...

## Integration Points

<!-- How this slice connects to adjacent bounded contexts -->

| Context | What we read from it | What we add/change |
| ------- | -------------------- | ------------------ |
| ...     | ...                  | ...                |

## Test Command

```bash
# Exact command to verify the slice is complete
<test command>
```

## Domain Files to Load Next

<!-- Agent: read these after this file, in order -->

1. `docs/domain/<primary-context>.md` — bounded context detail
2. `docs/domain/system.md` — full system map and invariants
