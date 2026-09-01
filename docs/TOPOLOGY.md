# Product Topology

This document defines **what we're building** (and explicitly what we're NOT
building) for Gauntlet.

## What Gauntlet Is

A **fantasy football companion application** that automates league analysis,
live win-probability simulations, and weekly preview/recap reports for a private
multi-league Sleeper group. The 2026 season has three leagues. The registry may
grow in later seasons and is not expected to shrink back to a fixed AFC/NFC
pair.

### Core Value Propositions

1. **Automated Analysis**
   - Replace manual commissioner work
   - Generate weekly recap reports automatically
   - Surface insights across every registered league

2. **Live Win Probability**
   - Monte Carlo simulations during games
   - Real-time odds updates
   - Historical snapshots for analysis

3. **Cross-League Insights**
   - Unified presentation across registered leagues
   - Compare performance across leagues
   - League-wide statistics and rankings

4. **Enterprise Hygiene Sandbox**
   - Practice production-quality patterns
   - AI-friendly architecture
   - Maintainable codebase

## What We're Building (In Scope)

### ✅ Features & Capabilities

**Core Analysis:**

- League standings and rankings
- Matchup analysis and predictions
- Historical performance tracking
- Points-for/points-against analysis
- Positional breakdowns

**Live Simulations:**

- Monte Carlo win probability engine
- Real-time odds during games
- Simulation snapshots for history
- Sub-200ms response time requirement

**Weekly Recaps:**

- One combined weekly artifact with visibly separate league sections
- Monday-night recap and Thursday-morning preview generation
- Narrative generation from a structured context blob
- Statistical highlights
- Performance summaries
- Matchup recaps

**Draft Analysis:**

- Draft grades and analysis
- Pick efficiency
- Positional value assessment

**Playoff Projections:**

- Playoff odds calculation
- Seeding scenarios
- Elimination tracking

**Statistics:**

- Team statistics
- Player statistics
- League-wide analytics
- Variance and consistency metrics

**Manager Profiles:**

- Email one-time-code authentication
- One editable profile per authenticated person
- Profiles linked to a current Sleeper owner or co-owner identity
- Multiple managers may share one Sleeper roster
- Personal details folded into existing manager routes for signed-in viewers

### ❌ Explicitly Out of Scope

**Betting & Gambling:**

- No real-money betting
- No odds for gambling purposes
- No integration with sportsbooks
- Entertainment/analysis only

**Other Sports:**

- Football only (NFL fantasy)
- No basketball, baseball, hockey, etc.
- No college sports

**Other Fantasy Platforms:**

- Sleeper only
- No ESPN, Yahoo, NFL.com support
- No generic fantasy adapter

**Social Features:**

- No comments or discussion
- No trade chat
- No direct messaging, follows, or activity feeds
- Gauntlet profiles lightly enrich manager pages; Sleeper still handles league
  social activity

**Mobile App:**

- Web only (responsive)
- No native iOS/Android
- Use Sleeper app for mobile

**League Management:**

- No commissioner tools
- No lineup setting
- No trade processing
- Sleeper handles management

**Player News & Injuries:**

- No news aggregation
- No injury tracking
- External sources for this

## Domain Boundaries

### 1. Matchups (`features/matchups/`)

**Owns:** Matchup display, head-to-head analysis, live scores **Data:** Sleeper
API (matchups, rosters, players) **Constraint:** Process each league separately,
then combine

### 2. Statistics (`features/stats/`)

**Owns:** Team stats, player stats, league rankings **Data:** Derived from
Sleeper matchup data **Constraint:** Use shared utils from
`@/shared/utils/stats`

### 3. Draft Analysis (`features/draft-analysis/`)

**Owns:** Draft grades, pick analysis, positional value **Data:** Sleeper draft
data **Constraint:** Historical analysis only (draft is past)

### 4. Playoffs (`features/playoffs/`)

**Owns:** Playoff odds, seeding, elimination **Data:** Derived from standings +
simulation **Constraint:** Simulation engine provides probabilities

### 5. Reports (`features/reports/`)

**Owns:** Weekly recaps, narrative generation **Data:** Aggregated from all
domains **Constraint:** Gemini API for narrative synthesis

### 6. Simulation Engine (`@gauntlet/sim-engine`)

**Owns:** Monte Carlo simulation, win probability **Data:** Player projections,
matchup context **Constraint:** <200ms response time, 10k iterations

### 7. Profiles (`features/profiles/`)

**Owns:** Profile validation, Sleeper identity claims, profile persistence, and
personal details composed into manager presentation **Data:** Clerk identity,
Gauntlet Postgres, current-season Sleeper rosters/users **Constraint:** One
profile per Clerk user, one profile per Sleeper user, and no uniqueness
constraint on the team key

## System Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    External Systems                      │
├─────────────────────────────────────────────────────────┤
│ Sleeper API ─────── Primary data (rosters, matchups)    │
│ Gemini API ──────── Narrative synthesis for recaps      │
│ Clerk ────────────── Authentication and profile images   │
│ NFL Data ────────── Player projections (if needed)      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   apps/web (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│ • Feature modules (matchups, stats, profiles, playoffs) │
│ • API routes (simulations, reports, cron)               │
│ • Public analytics/history + signed-in manager details   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Shared Packages                         │
├─────────────────────────────────────────────────────────┤
│ @gauntlet/types       Domain contracts (source of truth)│
│ @gauntlet/sim-engine  Monte Carlo simulations           │
│ @gauntlet/lib         Shared utilities                  │
│ @gauntlet/ui          UI primitives                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              apps/server (Background Jobs)               │
├─────────────────────────────────────────────────────────┤
│ • Historical snapshots (Postgres)                        │
│ • Scheduled calculations                                 │
└─────────────────────────────────────────────────────────┘
```

## Multi-League Architecture (CRITICAL)

**The #1 source of bugs:** Treating matchup IDs as globally unique.

### The Problem

- Three Sleeper leagues are registered for 2026; later seasons may add more
- Matchup IDs repeat across leagues
- Roster IDs only unique within a league

### The Solution

- **Always process leagues separately**
- **Then combine results at presentation layer**
- Use composite keys: `${leagueId}-${matchupId}`

```typescript
// ✅ CORRECT: Process separately, then combine
const results = leagueInputs.map(input => processLeague(input));
const combined = results.flat();

// ❌ WRONG: Combine first, then process
const all = leagueInputs.flatMap(input => input.matchups);
const grouped = groupBy(all, m => m.matchup_id); // BUG!
```

See `docs/constraints/multi-league.md` for detailed patterns.

## Non-Functional Requirements

| Requirement            | Target              | Rationale               |
| ---------------------- | ------------------- | ----------------------- |
| **Simulation Latency** | <200ms              | UI responsiveness       |
| **Build Time**         | <2min               | Developer productivity  |
| **Type Coverage**      | 100%                | Catch multi-league bugs |
| **Test Coverage**      | 80%+ critical paths | Confidence in changes   |
| **File Size**          | <800 lines          | Maintainability         |

## Data Sources

| Source          | Purpose                               | Refresh                   |
| --------------- | ------------------------------------- | ------------------------- |
| **Sleeper API** | Rosters, matchups, players            | Real-time during games    |
| **Gauntlet DB** | Profiles, forms, historical snapshots | On mutation / cron        |
| **Clerk**       | Authentication, profile images        | On sign-in / profile edit |
| **Gemini API**  | Narrative generation                  | On-demand (reports)       |
| **Static JSON** | Precomputed data                      | Build-time                |

## Success Metrics

1. **Simulation accuracy** vs. actual outcomes
2. **Report engagement** (views, shares)
3. **Code quality** score (target: 9.0/10)
4. **Build/test speed** (CI pipeline)
5. **Type error count** (target: 0)

---

**Key Takeaway:** Gauntlet is an analysis and reporting tool for a private,
registry-defined set of Sleeper leagues. It is not a fantasy platform, betting
app, or league-management tool.
