# Critical Patterns

Cross-cutting patterns that apply repo-wide. Read this before writing UI code in
`apps/web`. Each pattern lists what breaks if you don't follow it, not just the
rule.

---

## Semantic color tokens only — never raw Tailwind palette classes

```yaml
tags: [design-tokens, dark-mode, tailwind, accessibility]
category: frontend
module: apps/web (design system)
symptoms:
  - dark mode shows pastel/light-mode-only colored boxes or badges
  - a colored chip or delta looks "off-brand" (blue, purple, orange with no
    brand meaning)
  - a UI review flags "raw Tailwind colors" or "no dark: variant"
```

### The rule

Never hardcode a raw Tailwind palette class (`bg-blue-100`, `text-red-600`,
`border-slate-200`, `bg-green-50`, etc.) in `apps/web`. Use the semantic tokens
defined in `apps/web/src/app/globals.css` / `apps/web/tailwind.config.js`
instead: `bg-background`, `text-foreground`, `bg-card`, `border-border`,
`text-muted-foreground`, `text-primary` (crimson), `text-secondary` (gold),
`text-success` / `bg-success`, `text-destructive` / `bg-destructive`,
`bg-muted`.

For a common set of stat-display cases (signed deltas, two-league badges, tiered
intensity pills, letter-grade badges), use the pre-built helpers in
`apps/web/src/lib/stat-colors.ts` (`deltaTextClass`, `leagueBadgeClass`,
`neutralBadgeClass`, `tieredBadgeClass`, `gradeBadgeClass`) instead of writing a
new ad hoc color conditional.

### Why this is a hard rule, not a style preference

Every semantic token is backed by a CSS variable with a `.dark` override, so it
automatically renders correctly in both themes. A raw Tailwind palette class
like `bg-green-50` almost never has an accompanying `dark:bg-green-950` — it was
written once, in light mode, and never revisited. The failure mode isn't "looks
slightly off," it's a genuine break: a `bg-green-50 text-green-600` stat tile
renders as a near-white, glowing pastel box punched into a charcoal `bg-card`
surface in dark mode. This is invisible in a light-mode-only review or
screenshot and only shows up when someone actually toggles dark mode — which is
exactly how this pattern was discovered (see the 2026-07 Stats Hub design
review: 97 raw-color occurrences across three tabs, all broken in dark mode).

A second, independent failure: colors like blue, purple, and orange have no
meaning in this app's brand system (crimson/gold/steel/success-green only).
Using them for state (e.g. blue = cross-league increase, purple = decrease)
introduces a color language with no cross-app consistency and no basis in the
design tokens — readers have no way to learn what it means.

### Enforcement

This is enforced two ways so it can't silently regress:

1. **ESLint** — `apps/web/eslint.config.mjs` has a scoped `no-restricted-syntax`
   rule (regex-matching both string literals and template literals) on the Stats
   Hub feature directories that were the source of this pattern. `pnpm lint`
   fails on any raw palette class in those files.
2. **Vitest regression test** — `apps/web/src/__tests__/design-tokens.test.ts`
   walks the same scoped files independently of ESLint and fails with the exact
   file:line of any violation. This exists so the guard still catches a
   regression even if lint is skipped locally.

If you're adding a new feature directory with the same class of stat-display UI
(colored deltas, league badges, tiered pills), extend the `SCOPED_DIRS` /
`SCOPED_FILES` lists in both the ESLint config and the Vitest test, and prefer
extending `stat-colors.ts` over inventing a new local color helper.

### Known acceptable exceptions

- `packages/ui` chart/dataviz color palettes (`brand/colors.ts`
  `teamCategorical`, `sequential`, `rdylgn` scales) are intentionally raw hex
  values for data-visualization palettes with 8–12 distinct hues; semantic
  tokens don't have that many distinct colors by design. Don't extend the lint
  rule to chart-palette code.
- One-off marketing/archive pages outside the Stats Hub scope above are not
  currently covered by the lint rule. If you're touching one and see raw colors,
  prefer fixing them, but it won't fail CI yet — add that directory to the
  scoped lists if you do a token pass there.
