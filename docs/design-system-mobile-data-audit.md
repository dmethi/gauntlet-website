# Mobile Data Presentation Audit

## Decision

Gauntlet should not treat every dataset as a table inside a bordered card. On
small screens, the default presentation for record-oriented data is a full-width
list with dividers. Tables remain the right tool for comparison matrices, but
their scroll surface should sit directly in the section and lose its inset frame
on mobile.

Mobile views must preserve analytical parity with desktop. The default is a
compact, complete ledger: identity, the primary outcome, and the metrics needed
to scan every record remain visible. Secondary comparisons and positional or
time-series detail may move into an inline disclosure, but they must not be
removed. Expert matrices remain available behind an explicit, labeled disclosure
when they are not the best mobile entry point.

This keeps the product recognizable through typography, rank markers, gold
result values, and restrained position colors rather than through repeated
rounded containers.

## Audit summary

The code scan found 189 candidate matches across table components, horizontal
overflow regions, and nested bordered containers. The recurring mobile problems
were:

- record-oriented datasets rendered as seven-to-nine-column tables;
- cards containing another rounded, bordered table container;
- metric tiles nested inside cards even when the values belong to one record;
- horizontal scrolling without a named, keyboard-focusable region;
- hover-first rows whose interaction is not obvious on touch devices;
- equal visual weight for primary outcomes and supporting detail.

These are pattern matches, not 189 confirmed defects. Each use still needs
classification as a record list, true comparison matrix, or interactive entity.

## Opinionated component model

| Before                                       | After                                                                                     | Why                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Card → padding → rounded table frame → table | Flat section → `DataList` or `TableViewport`                                              | Removes two layers of horizontal inset and makes the section boundary do the structural work. |
| Ranked records forced into a wide table      | `DataList` on mobile; sortable table from `sm` upward                                     | A phone is better at scanning one record vertically than comparing eight clipped columns.     |
| Comparison matrix squeezed to fit            | Intrinsic-width table in a named, focusable `TableViewport` with a sticky identity column | Preserves real two-dimensional comparison and makes the overflow usable.                      |
| A grid of bordered metric cards per record   | Semantic `dl` metric strip separated by spacing and type                                  | Keeps labels and values legible without manufacturing extra surfaces.                         |
| Hover-only row affordance                    | Minimum 44px touch target, visible focus, and touch active state                          | Gives touch and keyboard users equivalent feedback.                                           |
| Every value shown at once                    | Compact complete ledger with secondary detail in an inline disclosure                     | Preserves analytical parity without forcing desktop density into the first scan.              |

## Foundations

### `DataList`

Use for standings, transactions, waiver activity, draft history, and other
datasets where each row is fundamentally an entity or event. The component
provides semantic list and description-list primitives, full-width dividers,
tabular numerals, and an optional interactive state.

Mobile records should normally contain:

1. identity and context in the header;
2. one visually dominant outcome;
3. no more than three primary metrics in the first metric row;
4. secondary details in a native disclosure when they materially affect the
   decision.

Functional labels must render at 12px or larger. Interactive controls and
disclosure summaries must provide at least a 44px touch target. Compactness
comes from grouping, alignment, and tighter vertical rhythm—not tiny type or
undersized controls.

### `TableViewport`

Use for schedules, cross-league comparisons, time series, and other genuine
matrices. Its responsive surface is flat with edge dividers on mobile and
restores the familiar bordered, rounded treatment on larger screens. A
`scrollLabel` makes the region keyboard-focusable and gives it an accessible
name.

Do not place `TableViewport` inside another bordered table wrapper.

### Existing `Table`

`Table` now delegates its overflow surface to `TableViewport` and accepts
`surface`, `scrollLabel`, and `containerClassName`. Headers and numeric values
use a consistent compact rhythm and tabular numerals.

## Brand rules

- Use the display face for page and section identity, not dense body copy.
- Reserve regal gold for the most important result or rank. Use crimson for
  selection and action, not as a generic container fill.
- Keep position colors as narrow accents or compact labels; avoid turning whole
  records into multicolor panels.
- Use semantic foreground/background token pairs for rank, delta, and status
  color. Every text pair must meet WCAG AA in both themes, and rank or status
  must remain legible without color.
- Prefer typography, rank medallions, and precise dividers over “brand by
  rounded box.”
- Avoid gradients and decorative shadows in data-dense areas. They reduce
  contrast without improving comprehension.
- Preserve generous vertical rhythm. Reclaim horizontal space first; density
  should not mean cramped touch targets.

## Migration order

1. **Foundations:** adopt `DataList`, `TableViewport`, responsive table
   surfaces, and the existing mobile-flat section shell.
2. **Ranked records:** migrate standings, manager rankings, waiver movers, and
   draft lists to mobile `DataList` variants.
3. **Matrices:** migrate schedule, trend, and positional comparison tables to
   labeled `TableViewport` regions with sticky identity columns.
4. **Metric groups:** replace nested metric-card grids with semantic metric
   strips when the values describe the same entity.
5. **Interaction:** audit sortable headers, expandable rows, visible focus, and
   44px touch targets.

## Implementation in this branch

- Added the shared `DataList` family and responsive `TableViewport` primitive.
- Converted league rankings, schedule rankings, expected wins, and transaction
  analysis to purpose-built mobile lists while retaining desktop tables.
- Converted the schedule matrix to the accessible horizontal-scroll pattern.
- Preserved season and positional analysis through compact visible signals and
  inline disclosures instead of removing mobile analytics.
- Migrated League Overview, team matchup history, scoring summaries, and
  league-wide odds to complete mobile ledgers while retaining comparison tables
  on larger screens.
- Raised shared functional-label typography to 12px and corrected the light
  theme's semantic gold and success roles for accessible contrast.
- Removed redundant table frames from league overview, transactions, draft,
  archive standings, and the shared scoring summary.
- Standardized table header hierarchy and numeric alignment at the primitive
  level.
- Propagated the same ledger, disclosure, touch-target, semantic-color, and
  scroll-affordance rules through Stats, Waiver Analysis, Draft Analysis,
  Transactions, and Start/Sit views.

## Library recommendation

No new UI library is necessary. The problem is information architecture rather
than missing table machinery, and the existing React/Tailwind primitives are
enough. If future requirements add column pinning, virtualization, or
user-configurable sorting/filtering, TanStack Table would be a reasonable
behavior layer; it should still render through these Gauntlet presentation
primitives.
