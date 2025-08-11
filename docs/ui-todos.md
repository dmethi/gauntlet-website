### UI Plan and Progress

#### Progress (implemented)

- Tokens/theming: brand-aligned CSS variables with light/dark; Tailwind preset
  in `packages/tokens` wired to `apps/web`.
- shadcn/ui: initialized and added Button, Card, Dialog, Dropdown, Tooltip,
  Table, Badge, Skeleton, etc.
- Shared UI: `packages/ui` with `ChartContainer`, `ChartLegend`,
  `ChartSkeleton`, `Container`, `PageHeader`, `Stack/Inline`.
- Charts: Recharts theming, categorical + RdYlGn palettes, legend injected via
  actions.
- League Overview: sortable leaderboard, themed chart with empty/skeleton
  states, sidebar link to Playground.

#### Near-term tasks

- Canonical rank: render stable rank (initially by Record) independent of
  visible sort; later power-rank blend.
- Divisions: 3-division (4 teams each) view on League Overview (tabs/segmented
  control).
- Record correctness: compute from authoritative data (weekly
  aggregates/matchups) not placeholders.
- Motion polish: table row hover/press, page header actions, transitions
  (respect animations.md).

##### Bugs/TODOs (Team pages)

- Remove chart legend/label from polar (radar) chart to reduce clutter.
- Filter out unknown/invalid positional buckets (e.g., `UNK`) when aggregating
  positional points.
- Transactions: show detailed adds/drops/draft picks with player names and FAAB
  amounts.
- Playoffs: ingest Sleeper playoff bracket/toilet data and render a separate
  playoffs analysis section; compute final placing.
- Radar compare: allow selecting other teams to overlay normalized positional
  radar for comparisons (in progress: chart API accepts comparisons array).

---

### Information Architecture and Page Specs

---

Status checkpoint (UI implementation)

- Teams index: grid of team blocks with avatar/initials, links to `team/[id]`.
- Team page: header with avatar, regular-season KPIs (Weeks 1–playoff_start-1),
  weekly charts with league average overlay, matchups table split by regular
  season vs playoffs.
- Positional analytics: seasonal bar chart (team vs opponent vs league avg) and
  normalized radar (0–1); filters to positions: QB/RB/WR/TE/K/DEF; compare
  overlay supported.
- Roster section: starters and bench with player name/position/team.
- Transactions: server route with player expansion and D/ST fallback; UI lists
  Adds/Drops player names; FAAB/picks pending.
- Hooks stability fixes; colors import fixed; weekly averages correctly applied
  to charts; playoff opponent points handled.

#### Competition Dashboard (`/competition`)

- Purpose: entity above leagues; cross-league view for promotion/relegation.
- Content: weekly recaps, cross-league power rankings, previews (implied odds),
  tier movement (future seasons).
- Data: aggregate across `League` ids via `LeagueWeekSummary`,
  `SeasonSuperlatives`, derived cross-league rollups.
- Components: `PageHeader`, `StatCard`, `DataTable`, `ChartContainer`, `Tabs`.

#### League Overview (`/league/overview`)

- Content:
  - Leaderboard with stable Rank (canonical) and alternate sorts (record,
    points, expected wins, luck).
  - Weekly averages chart; filters by week range.
  - Future: Divisional breakdown (3 x 4) via tabs/segmented control; division
    standings.
- Data: `RosterWeekAggregate` (wins/losses, points, expectedWins, luck),
  `LeagueWeekSummary` (median/avg), `MatchupSummary` (links).
- Components: `DataTable`, `TeamBadge` (later), `ChartContainer`, `Tabs`,
  `DropdownMenu`.

#### Team Detail (`/team/[id]` and `/team/[id]/stats`)

- Content:
  - KPIs: record, points, expectedWins, luck, streak.
  - Rolling averages (points), luck vs expected wins, matchup history.
  - Current roster: player cards with positions; link to player profiles
    (future).
  - Owner link: cross-year profile; team is per-year; owner spans seasons.
- Data: `Roster` (players/starters), `RosterWeekAggregate`, `Player`,
  `PlayerStats`, `User`.
- Components: `ChartContainer` (line/bar), `DataTable`, `StatCard`, `Tabs`,
  `Card`.

#### Matchup Page (`/matchup/[leagueId]/[week]/[matchupId]`)

- Content:
  - Pre/during/post sections: projections vs actuals; dynamic win probability
    series; excitement score; clutch metrics.
  - Players involved (both rosters): starters/bench and contributions; tooltips
    per player.
- Data: `MatchupSummary`, `RosterWeekAggregate`, `LiveWinProbSample`,
  `PlayerStats`.
- Components: `ChartContainer`, `Legend`, `Card`, `DataTable`.

#### Live (`/live`)

- Content: live ticker, active matchups, mini win-prob charts; polling/SSE.
- Components: `MatchupCard`, `LiveTicker`, `Progress`, `Badge`, `Toast`.

#### Analytics (`/analytics`)

- Content: distributions, correlations, filters; positional breakdowns; schedule
  luck.
- Components: Histogram, Scatter, FilterBar (`Select`, `Slider`, `Checkbox`,
  `Popover`), `Card`.

#### Simulations (`/simulations`)

- Content: inputs (week/team/iterations), result summaries, probability
  distributions.
- Components: `Form` primitives, `StatCard`, density/violin chart, `Dialog` for
  scenarios.

#### Trends (`/trends`)

- Content: time-series + small multiples; compare teams.
- Components: `ChartContainer`, `Legend`, `Tabs`, `Select`.

#### Hall of Fame & Shame (`/hall`)

- Content: season and weekly superlatives; historical archive; links to past
  leagues.
- Data: `SeasonSuperlatives`, scans over `RosterWeekAggregate`/`MatchupSummary`.
- Components: `DataTable`, `Card`, `Tabs`.

#### Settings (`/settings`)

- Content: theme, data refresh, league selector.
- Components: Form primitives, `Select`, `Switch`, `Card`.

#### Data Feed (`/data`)

- Content: API viewer, JSON preview, downloads.
- Components: `DataTable`, `CodeBlock`, `Accordion`.

---

### Navigation and Entry Points

- Sidebar (desktop) and bottom tabs (mobile-first): Competition, League
  Overview, Live, Teams (entry to team list or last viewed), Analytics,
  Simulations, Trends, Hall, Settings, Playground (dev-only).
- Contextual links: from leaderboard → team; from schedule/results → matchup;
  from superlatives → team/matchup.
- Archive: Hall of Fame/Shame includes past leagues and season selector; also
  link leagues by `previousLeagueId`.

---

### Cross-cutting

- Responsive rules (mobile-first), safe-area utilities, mobile nav pattern.
- Keyboard shortcuts (later): search, theme toggle.
- Standardize error/loading/empty states.

---

### Definition of Done (per component)

- Storybook optional; `/playground` acceptable for previews during v0.
- A11y checks pass; focus visible; keyboard navigation.
- Motion follows tokens and `prefers-reduced-motion`.

---

### Setup/Follow-ups

- Canonical rank (v0 = Record; later power-rank blend) independent of visible
  sort.
- Divisions view in League Overview (3 x 4 managers) with tabs/segmented
  control.
- Fix team record calculation from authoritative data.

---

Team Pages – Pending polish/TODOs

- Mobile responsiveness: audit and refine layouts for charts, roster lists, and
  transactions on small screens (spacing, font sizes, wrapping).
- Transactions UI/time: render relative time (e.g., 2d ago), group by day, show
  roster owner, and improve long player list layout; add FAAB/picks once server
  payload includes them.
- Radar overlay bug: ensure compare overlay cannot select current team; validate
  compare data set, and visually distinguish overlays; remove polar
  legend/labels for clarity.
- Charts UI polish: consistent card headers, legend theming, dashed league
  average line, accessible tooltips, and improved contrast/color mapping per
  team.
