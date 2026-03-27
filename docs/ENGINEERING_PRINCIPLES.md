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

- Prefer the standard library over third-party packages.
- Prefer small, focused libraries over large frameworks.
- Each new dependency must be justified.
- Before adding a dependency:
  - Is this already solved in the codebase?
  - Can we implement a minimal version ourselves?
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
- **Search `docs/solutions/` and read
  `docs/solutions/patterns/critical-patterns.md` when relevant; apply learnings
  before coding.**
- Ask: "How is this already solved here?"
- Consistency is more important than theoretical correctness.

### 5. Minimize Complexity

- Prefer fewer dependencies over more.
- Prefer simple solutions over clever ones.
- Prefer editing existing code over adding new files.
- Prefer improving existing modules over adding new ones when the change fits.
- If adding significant complexity, pause and justify it.

### 6. Vertical Slice Decomposition

Decompose work into **vertical slices**, not horizontal layers.

A vertical slice delivers one complete feature or capability end-to-end: schema,
domain logic, API, tests. It crosses technical layers but stays within one
feature boundary.

Prefer:

- "Add Identity module (schema + service + controller + tests)"

Over:

- "Add user schema" → "Add auth service" → "Add auth controller" → "Add auth
  tests"

Why:

- Maintains reasoning coherence for agents working on the task.
- Reduces coordination overhead between issues.
- Produces working, testable features at each step.
- Eliminates dependency management between atomic tasks.

Guardrails:

- Each slice should be reviewable (target <1000 LOC of actual changes).
- If a slice exceeds this, split by **feature boundary**, not technical layer.
- Non-goals must be explicit to prevent scope creep.
- One PR = one vertical slice.
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

### 7.5 Domain Map Protocol

Before touching any code, check for `docs/domain/`:

1. **If `docs/domain/current-slice.md` exists** — read it first. It defines what
   you're building, acceptance criteria, constraints, and non-goals. Do not
   implement anything outside it.
2. **Read the context files it references** (`docs/domain/<context>.md`) — these
   define bounded context boundaries and invariants you must not violate.
3. **Read `docs/domain/system.md`** — the full system map. Understand how your
   slice connects to the rest of the system.

If `docs/domain/` does not exist, check with the human before starting. A
missing domain map on an active slice is a signal that planning is incomplete.

**Domain map files are owned by the planning session, not the execution agent.**
Do not rewrite `current-slice.md` during implementation — only append
observations or blockers.

Templates live in `shared-agent-config/templates/domain/`.

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

### 15. Stable Interfaces, Flexible Internals

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
5. **Submit** — PR must deliver one vertical slice, include a clear description
   (WHY not WHAT), and pass CI.

## Dependency Policy

Before adding a dependency, answer: What problem does this solve? Is there an
existing solution in the repo? Can we implement a minimal version ourselves?
What is the maintenance risk? If not justified → do not add it.

## Testing Philosophy

- Test behavior, not implementation details.
- Prefer integration tests over excessive unit mocks.
- Each bug fix should include a test.

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
