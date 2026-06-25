# Engineering Principles & Agent Guidelines

This repository is designed to be worked on by both humans and AI agents. The
goal is clear, minimal, high-signal engineering that is easy to reason about,
extend, and maintain.

When making changes, follow the principles below.

## Core Philosophy

### 1. KISS (Keep It Simple, Stupid)

- Prefer simple, obvious solutions.
- Avoid clever abstractions.
- Code should be readable by a new engineer in under 5 minutes.
- If you need to explain it in a paragraph, it's probably too complex.

### 2. Minimize Dependencies

- Prefer in this order: **stdlib → proven FOSS → custom implementation**. Only
  write custom code when no suitable existing solution exists.
- Prefer small, focused libraries over large frameworks.
- Each new dependency must be justified.
- Before adding a dependency:
  - Is this already solved in the codebase?
  - Is there a proven FOSS package for this? Only if not — can we implement a
    minimal version?
  - Does this introduce long-term maintenance risk?

### 3. Domain-First Design (DDD-Lite)

Structure the code around domain concepts, not technical layers.

Prefer:

- `/billing` → `billing/invoice.ts`, `billing/payment.ts`

Over:

- `/services`, `/controllers`, `/utils`, `/helpers`

Guidelines:

- Each domain should represent a real business concept.
- Domain logic should live close to its data structures.
- Use domain terms in APIs and key types; when domain boundaries are unclear,
  ask.
- Avoid "god" utility folders.

### 4. Study Existing Patterns First

Before implementing anything:

- Search for similar functionality in the codebase.
- Match existing conventions.
- **Read the repo's current truth before coding: module cards
  (`docs/modules/*.md`) for invariants and vocabulary, and `docs/solutions/`
  patterns where present. Apply prior learnings.**
- Ask: "How is this already solved here?"
- Consistency is more important than theoretical correctness.

### 5. Minimize Complexity

- Prefer fewer dependencies over more.
- Prefer simple solutions over clever ones.
- Prefer editing existing code over adding new files. Only create a new file
  when the existing module's complexity genuinely warrants extraction or the
  domain boundary is structurally distinct.
- Prefer improving existing modules over adding new ones when the change fits.
- If adding significant complexity, pause and justify it.

### 6. Build Wide, in Vertical Slices

Default to **diffusion**: build wide across related surfaces in one pass, not
deep planning of a single layer. Implementation illuminates design — don't
assume plan-then-build sequencing. When not blocked on safety, compliance, or
data integrity, build first and decide second.

Cut **vertically, not horizontally**: a change should deliver a capability
end-to-end (schema, domain logic, API, tests) rather than one technical layer
smeared across many features.

Prefer:

- "Add Identity module (schema + service + controller + tests)"

Over:

- "Add user schema" → "Add auth service" → "Add auth controller" → "Add auth
  tests"

Guardrails:

- One coherent change set per session — it may span multiple modules, but stays
  a single reasoning thread.
- Keep it reviewable; when it grows large, split by **feature boundary**, not
  technical layer.
- Make non-goals explicit to prevent scope creep.
- **Stop diffusion and plan first** for safety-critical paths, privacy/PII
  shifts, new infra (queue, cache, dedicated API), or LLM-guardrail changes.
- **If the change affects documented architecture, topology, or system behavior,
  update the relevant docs/diagrams in the same PR.**

### 7. Validate Assumptions Early

Before committing:

- Run the build.
- Run tests.
- Test locally.
- If CI fails: diagnose the root cause; fix the actual issue, not the symptom.

### 8. When in Doubt, Ask

If any of the following occur: ambiguous requirements, multiple valid
approaches, new dependencies, architecture changes → present options and ask for
direction.

## Additional Principles for Agent-Friendly Repos

### 9. Prefer Explicitness Over Magic

- Avoid: hidden side effects, implicit global state, metaprogramming unless
  absolutely necessary.
- Agents perform better when: logic is explicit, data flow is clear, functions
  have single responsibilities.

### 10. Small, Composable Units

- Prefer: small functions, clear inputs and outputs, pure functions where
  possible.
- Avoid: giant multi-purpose classes, deep inheritance trees, hidden
  cross-module coupling.

### 11. One Source of Truth

- Avoid duplicated logic, schemas, or parallel implementations.
- If duplication exists: extract a shared domain module.

### 12. Make the Correct Path the Easy Path

Design APIs and modules so the safe, correct usage is obvious and misuse is
difficult or impossible (e.g. strong typing, clear function names, sensible
defaults).

### 13. Optimize for Readability First

Order of priorities: Correctness → Readability → Simplicity → Performance. Avoid
cleverness. Performance optimizations must be measured, justified, and not
destroy readability.

### 14. No Premature Abstractions

Do not abstract until duplication exists, the pattern is stable, and there is a
second real use case. Rule: First make it work. Then make it clear. Then
abstract.

### 15. Idempotent Mutations

Operations that mutate state must be safe to run more than once. Assume
execution multiplicity — agents retry, CI reruns, deploys repeat.

- Before mutating: check existing state. Do not assume a clean slate.
- A second run must produce the same outcome as the first.
- Migrations, setup scripts, and seed operations must be idempotent by default.

### 16. Stable Interfaces, Flexible Internals

- Public APIs should change rarely; internal implementations can evolve freely.
- When changing an interface: ensure all callers are updated; avoid breaking
  changes when possible.

## Code Change Process (For Agents)

When assigned a task:

1. **Understand** — Read the issue, related files, and search for similar
   patterns. Search `docs/solutions/` and critical-patterns when relevant.
2. **Plan** — Decide which files will change, what the minimal solution is,
   whether new dependencies are required.
3. **Implement** — Make the smallest correct change; follow existing patterns;
   keep functions small and focused.
4. **Validate** — Run build and tests; fix failures at the root.
5. **Submit** — PR delivers one coherent change set, includes a clear
   description (WHY not WHAT), and passes CI.

## Dependency Policy

Before adding a dependency, answer: What problem does this solve? Is there an
existing solution in the repo? Is there a proven FOSS package for this? Only if
not — can we implement a minimal version? What is the maintenance risk? If not
justified → do not add it.

## Testing Philosophy

- Enforce an invariant the **cheapest way that catches a violation**: type →
  lint → test. A runtime test is the last resort, not the default; a type or
  strict lint rule guards every edit, not just covered paths.
- Test behavior, not implementation details.
- Prefer integration tests over excessive unit mocks.
- Each bug fix should include a test.
- No one-off test scripts. Any utility that verifies behavior belongs in the
  test suite and must be reusable, not a throwaway file.
- See `shared-agent-config/skills/testing.md` for the full method (seams,
  invariants, the enforcement ladder).

## Definition of Done

A change is complete when: build passes; tests pass; no unused code remains; no
unnecessary dependencies were added; change is minimal and scoped; **if the
change affects documented architecture or system behavior, docs/diagrams were
updated in the same PR.**

## Red Flags (Stop and Re-evaluate)

Pause and reconsider if: you're adding more than one dependency; you're touching
unrelated modules; you're introducing a new abstraction layer; you're writing a
large "helper" file; the PR is hard to explain in one sentence.

## Guiding Mantra

Simple. Domain-aligned. Minimal. Easy to reason about. Easy for humans and
agents to extend.
