---
target: current mobile data-system work in commit 007299f
total_score: 23
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 3
target_identity: 'file:/Users/dhruv/Documents/GitHub/gauntlet-website-worktrees/codex-mobile-layout-audit-fixes/apps/web/src/features/stats/components/LeagueView/LeagueRankingsTable.tsx'
target_fingerprint: 'sha256:96788691a19d2a506c3821d6519839ec3ac28f7b58f8a0864a75a7e8eeafec9e'
target_path: /Users/dhruv/Documents/GitHub/gauntlet-website-worktrees/codex-mobile-layout-audit-fixes/apps/web/src/features/stats/components/LeagueView/LeagueRankingsTable.tsx
timestamp: 2026-09-14T21-51-08Z
slug: onents-leagueview-leaguerankingstable-tsx-18647956
---

## Design Health Score

| #         | Heuristic                           |     Score | Key issue                                                                                             |
| --------- | ----------------------------------- | --------: | ----------------------------------------------------------------------------------------------------- |
| 1         | Visibility of system status         |         2 | Active view is clear, but Transactions uses a wordless multi-second loading overlay.                  |
| 2         | Match between system and real world |         3 | Fantasy terminology is natural; Adjusted VORP and color/grade scales need context.                    |
| 3         | User control and freedom            |         2 | No jump, collapse, clear-all, or return-to-summary affordances on very long views.                    |
| 4         | Consistency and standards           |         3 | Shared list anatomy works, but several adjacent data views remain desktop tables.                     |
| 5         | Error prevention                    |         2 | A hard-coded 24-team denominator misclassifies colors in the live 36-team dataset.                    |
| 6         | Recognition rather than recall      |         2 | Legends arrive after the data and interactive transaction rows have no detail affordance.             |
| 7         | Flexibility and efficiency          |         2 | Some filtering and keyboard support exist; League lacks search, jumps, and mobile trend accelerators. |
| 8         | Aesthetic and minimalist design     |         3 | Surfaces are restrained, but full repeated datasets produce extreme page length.                      |
| 9         | Error recognition and recovery      |         2 | Little visible evidence of actionable recovery; dialog close does not restore focus.                  |
| 10        | Help and documentation              |         2 | Descriptions exist, but matrix scrolling and metric meanings are not explained in context.            |
| **Total** |                                     | **23/40** | **Acceptable**                                                                                        |

## Design Specificity Verdict

The shell is distinctly Gauntlet: crest, collegiate display type, crimson/gold
palette, medieval league names, rank markers, and fantasy-football vocabulary.
Desktop League View is especially authored through its heatmap and trend layer.
The new mobile DataList system is coherent but only moderately product-specific;
without the shell, its title/subtitle/metric anatomy could belong to another
analytics app. Product character should come from accurate competitive signals
and sport-specific interaction, not renewed card decoration.

The static detector returned zero findings across the 13 changed markup files.
The injected runtime detector found 546 messages in League, 437 in Schedule, and
121 in Transactions. Most were systemic `undersized-ui-text` and `low-contrast`
findings that static source scanning could not resolve through runtime colors.
`shape-assembled-illustration` was a TanStack devtools false positive;
buried-raster and several nesting warnings were outside the change or not
verified failures.

## Overall Impression

The list-versus-matrix decision is correct and substantially improves local
readability. The biggest remaining opportunity is to turn mobile from a
vertically restyled desktop report into a focused operating workflow. Right now
users can read each record, but still have to process every record.

## What's Working

- League rankings now fit the phone viewport without lateral hunting while
  keeping identity, total, rank, and positional context visible.
- DataList establishes a disciplined divider-led system with semantic
  list/description-list structure and tabular numerals.
- TableViewport creates labeled, keyboard-focusable matrix regions, and
  transaction records support Enter/Space activation.

## Priority Issues

1. **[P1] Ranking color semantics use the wrong cohort size.** The live UI has
   36 teams, but copy and `getRankColor` calls use 24 in LeagueRankingsTable,
   ScheduleStrengthTable, and ScheduleDifficultyTable. This produces factually
   misleading visual classification. Derive the cohort size from the data and
   explicitly define the population for positional ranks. Suggested command:
   `$impeccable harden`.

2. **[P1] Brand colors fail as functional text colors.** Runtime measurements
   found white on `#1a9850` at 3.7:1, white on `#a6d96a` at 1.6:1, regal gold on
   the light surface at 2.0:1, and dozens of matrix foreground/background
   failures. Preserve the palette, but separate decorative brand tokens from
   accessible text/surface pairs and use non-color rank cues. Suggested command:
   `$impeccable colorize`.

3. **[P1] Mobile remains a document dump rather than a prioritized workflow.**
   League renders 36 standings records followed by multiple complete rankings;
   Schedule leads with a 36x36 matrix; Transactions places a 36-row manager
   table before its actionable records. The new rows are taller and clearer but
   amplify scroll length, while the mobile League branch also removes the trend
   layer. Lead with My Team, Top 5, movers, and a compact trend; disclose full
   standings, matrices, and positional detail deliberately. Suggested command:
   `$impeccable distill`.

4. **[P2] The mobile control/type floor is too small.** Metric labels render at
   10px in hundreds of visible instances. Stats tabs are 28px high; selectors
   are 36px; transaction controls are 32-38px. Raise functional text to at least
   11-12px and interactive controls to 44px without reintroducing boxed padding.
   Suggested command: `$impeccable adapt`.

5. **[P2] Interaction and scroll affordances are incomplete.** Transaction rows
   open details but look static; closing their dialog sends focus to BODY. The
   999px Stats nav strip and an adjacent manager table are unnamed and not
   keyboard-focusable, and matrices lack a visible scroll cue. Add a consistent
   detail indicator, focus restoration, named scroll regions, and an edge fade
   or More affordance for navigation. Suggested command: `$impeccable audit`.

## Persona Red Flags

**Alex, power user:** no League team search, position sort, My Team jump, or
compact trend; filters arrive late in Transactions; full datasets have no
collapse or jump tools.

**Sam, accessibility-dependent:** hundreds of 10px labels, contrast failures in
rank/semantic colors, color-heavy ranking communication, inaccessible adjacent
manager rows, and dialog focus not restored. The new transaction keyboard
support and labeled matrix viewport are meaningful improvements.

**Casey, distracted mobile user:** eight undersized horizontally hidden nav
destinations, wordless loading, long uninterrupted 36-team streams, and a 36x36
matrix as Schedule's opening artifact make one-handed, interrupted use
unnecessarily hard.

## Minor Observations

- No page-level horizontal overflow was measured on League, Schedule, or
  Transactions at 390px.
- The desktop League table remains the stronger analytical comparison surface.
- The `sm` switch at 640px needs a narrow-tablet/landscape check.
- Live Transactions contained unresolved UNKNOWN player labels, which appears
  data-related and pre-existing.

## Questions to Consider

- Should mobile default to My Team plus a competition summary, or remain a
  complete ledger?
- Which single season trend matters most on mobile: trajectory, consistency, or
  positional weakness?
- Should Schedule be team-first with the full matrix explicitly labeled as an
  expert view?
