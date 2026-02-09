# Issue Grooming Guide

## What is a "Groomed" Issue?

A groomed issue is **execution-ready**. An agent (or developer) can pick it up and produce a mergeable PR without making design decisions or asking clarifying questions.

## Groomed Issue Template

```markdown
## Summary
[1-2 sentences: what this accomplishes and why]

## Autocomplete Readiness
- **Autocomplete-ready**: [yes/no]
- **If yes, implementation steps**: [high-level steps, numbered]
- **If yes, verification guide**: [commands + manual checks]
- **If no, why**: [brief reason: research needed, ambiguous requirements, complex refactor]

## Design Decisions
- **Approach**: [chosen approach]
- **Files to modify**: [explicit paths]
- **Files to create**: [if any, with paths]
- **Patterns to follow**: [reference existing code, e.g., "follow pattern in `src/components/ExistingThing.tsx`"]

## Risk Assessment
- **Blast radius**: [low/medium/high] — [what could break if this goes wrong]
- **Affected areas**: [list user-facing or critical paths impacted]
- **Rollback**: [how to revert if needed, or "standard revert"]

## Implementation Notes
[Any specific guidance, edge cases to handle, or context needed]

## Test Strategy
- **Guardrails**: [what must not break]
- **New functionality**: [what to verify works]
- **Regression check**: [existing flows that must still work]

## Acceptance Criteria
- [ ] [Verifiable criterion 1]
- [ ] [Verifiable criterion 2]
- [ ] Tests pass
- [ ] No type/lint errors

## Out of Scope
[What this PR should NOT touch]
```

## Risk Levels

| Level | Meaning | Review Bar |
|-------|---------|------------|
| **Low** | Isolated change, no critical paths | Standard review |
| **Medium** | Touches shared code or user-facing features | Careful review + manual test |
| **High** | Core infrastructure, payments, auth, data integrity | Thorough review + staging test |

## Grooming Checklist

Before applying the `groomed` label, verify:

- [ ] **No open questions** — All decisions made
- [ ] **Autocomplete readiness captured** — yes/no, steps, verification (or reason if no)
- [ ] **Files specified** — Exact paths, not vague locations
- [ ] **Patterns referenced** — Points to existing code to match
- [ ] **Risk assessed** — Blast radius and affected areas identified
- [ ] **Tests defined** — Guardrails and functionality, not exhaustive cases
- [ ] **Criteria verifiable** — Can objectively check done/not done
- [ ] **Scope bounded** — Clear what's in and out

## Labels

| Label | Meaning |
|-------|---------|
| `needs-grooming` | Issue exists but not execution-ready |
| `groomed` | Ready for agent/developer pickup |

## Workflow

```
[Created] → [needs-grooming] → [groomed] → [In Progress] → [PR] → [Done]
                  ↓                ↓
            LLM + human       Agent picks up
            review            and executes
```

## Tips for Good Grooming

1. **Keep issues small** — If you need extensive code snippets, the issue is probably too big
2. **Reference, don't repeat** — Point to existing patterns instead of re-explaining them
3. **Be specific on boundaries** — "Out of Scope" prevents scope creep during execution
4. **Calibrate risk honestly** — Underestimating blast radius causes production incidents
5. **Think like the executor** — What would you need to know to do this without asking questions?
