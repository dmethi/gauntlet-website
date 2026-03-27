# Bounded Context: <name>

> Part of the `<project>` domain map. Updated when this context's boundaries,
> aggregates, or events change — not per slice.

## Purpose

<!-- One sentence: what this context owns and why it exists as a distinct boundary -->

## Aggregates

<!-- The core domain objects this context is responsible for -->

| Aggregate | Owns | Key Fields |
| --------- | ---- | ---------- |
| `<Name>`  | ...  | ...        |

## Domain Events

<!-- Events produced or consumed by this context -->

| Event         | Direction           | Counterparty |
| ------------- | ------------------- | ------------ |
| `<EventName>` | produces / consumes | `<context>`  |

## API Boundary

<!-- What this context exposes to the rest of the system -->

- `<endpoint or function>` — <what it does>

## External Dependencies

<!-- Third-party services or other contexts this depends on -->

- `<context or service>` — <what we use from it>

## Invariants

<!-- Rules that must always hold within this context. Violations are bugs. -->

- ...

## Open Questions

<!-- Unresolved design decisions — remove when resolved -->

- ...
