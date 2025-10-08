# WEB-REPORT: Weekly Preview Structure (Revised)

**Based on feedback from October 8, 2025**  
**Vision**: Data-driven, visual preview focused on matchup timelines and key
decisions

---

## 🎯 Weekly Preview Philosophy

**What we're NOT doing**:

- ❌ Narrative-heavy "matchup predictions" without real news context (AI slop
  risk)
- ❌ Power rankings projection (redundant)
- ❌ Bold predictions (gimmicky)

**What we ARE doing**:

- ✅ **Timeslot-based matchup evolution** (like Week 3 report bottom section)
- ✅ **Key start/sit decisions** per team
- ✅ **League odds & playoff implications**
- ✅ **Must-watch games** with clear methodology
- ✅ **Injury impact** flagging
- ✅ **Data visualizations** (charts for game flow predictions)

---

## 📊 Revised Preview Sections (4 sections, down from 6)

### Section 1: Week Overview & Storylines

**Keep as-is** — This is solid

**Purpose**: Frame the week's most compelling narratives

**Data**: Standings, playoff picture, hot/cold teams

**Output**: 3-4 paragraphs, 200-250 words

---

### Section 2: Matchup-by-Matchup Analysis (Visual/Data-Driven)

**Purpose**: Show how each matchup is expected to evolve over time by timeslot

**Replaces**: Matchup Predictions (which risked being AI slop)

**Format**: Per-matchup breakdown with:

1. **Projected final scores** (from simulation engine)
2. **Win probability** (e.g., Team A 65%, Team B 35%)
3. **Timeslot breakdown** (how score is expected to accumulate)
4. **Key players by timeslot**
5. **Projected score over time chart** (visual)

**Required Data Per Matchup**:

```typescript
{
  matchupId: number;
  leagueId: string;
  teamA: {
    teamName: string;
    record: string;
    projectedFinalScore: number;
    winProbability: number;
    playersByTimeslot: {
      'Thu 8:15pm': Array<{ name: string, position: string, projection: number }>;
      'Sun 1:00pm': Array<{ ... }>;
      'Sun 4:05pm': Array<{ ... }>;
      'Sun 8:20pm': Array<{ ... }>;
      'Mon 8:15pm': Array<{ ... }>;
    };
    projectedScoreByTimeslot: {
      'Thu 8:15pm': number; // Cumulative
      'Sun 1:00pm': number;
      'Sun 4:05pm': number;
      'Sun 8:20pm': number;
      'Mon 8:15pm': number; // Final
    };
  };
  teamB: { ... }; // Same structure
  projectedCloseness: 'blowout' | 'competitive' | 'toss-up'; // Based on spread
  spread: number; // Projected margin
  keyMatchup: string; // e.g., "Team A's RBs vs Team B's WRs"
  playoffStakes: string; // "Elimination game", "Winner controls playoff seeding", etc.
}
```

**Tools Called**:

1. `fetch_upcoming_matchups(week)` → Matchup pairings
2. `fetch_player_timeslots(week, playerIds)` → When each player plays
3. `fetch_projections(week, playerIds)` → Individual projections
4. `run_simulation(teamA, teamB)` → Win probability
5. `calculate_timeslot_accumulation(players, projections, timeslots)` → Score
   buildup

**Output Format** (per matchup):

```markdown
### [Team A] vs [Team B]

**Projected**: Team A 124.5, Team B 108.2 (Team A 68% win probability)
**Spread**: 16.3 points **Key Matchup**: Team A's Sunday afternoon slate (3
players, 45 projected) vs Team B's Thursday + Monday (2 players, 38 projected)

**Score Evolution**: | Timeslot | Team A | Team B | Notes |
|----------|--------|--------|-------| | Thu 8:15pm | 0.0 | 18.2 | Team B's TE
gets early start | | Sun 1:00pm | 62.5 | 45.8 | Team A's RBs dominate early
window | | Sun 4:05pm | 98.4 | 73.6 | Competitive afternoon, Team A extends lead
| | Sun 8:20pm | 115.3 | 89.4 | Team A's QB in primetime | | Mon 8:15pm | 124.5
| 108.2 | Team B's WR makes it closer but not enough |

**Key Players to Watch**:

- **Team A**: QB (23.5 proj, Sun 8:20pm), RB1 (18.7 proj, Sun 1:00pm)
- **Team B**: WR1 (22.1 proj, Mon 8:15pm) — needs big Monday to complete
  comeback

**Stakes**: Team A win clinches playoff spot. Team B loss = elimination.
```

**Why This Works**:

- ✅ Data-driven (no AI slop, just projections)
- ✅ Visual (can be charted)
- ✅ Tells a story (how the game unfolds)
- ✅ Actionable (know which timeslots matter)
- ✅ Similar to Week 3 report style

---

### Section 3: Must-Watch Games + Key Decisions

**Purpose**: Highlight top 3-4 games + critical start/sit decisions across the
league

**Part A: Must-Watch Games**

**Methodology for Selection**:

1. **Closest projected spread** (< 5 points = toss-up)
2. **Highest playoff stakes** (elimination, seeding battles)
3. **Combined star power** (sum of projected top performers)
4. **Rivalry/historical significance** (if H2H record is close)

**Scoring Formula**:

```typescript
mustWatchScore =
  (spreadCloseness × 0.3) +      // Closer spread = more interesting
  (playoffStakes × 0.4) +         // Elimination games = must-watch
  (starPower × 0.2) +             // High-scoring potential = fun
  (rivalryFactor × 0.1);          // History adds spice
```

**Required Data**:

```typescript
{
  mustWatchGames: Array<{
    matchupId: number;
    teams: [string, string];
    league: string;
    projectedSpread: number;
    playoffStakes: string; // "Elimination game", "1st place showdown", etc.
    combinedProjection: number;
    keyPlayers: string[]; // Top 3-4 stars
    whyWatch: string; // "Closest game of the week, playoff implications massive"
    mustWatchScore: number; // 0-100
  }>;
}
```

**Output Format**:

```markdown
### Must-Watch Games

1. **[Team A] vs [Team B]** (Spread: 2.3 pts)
   - Why Watch: Closest projected game of the week. Winner stays in playoff
     race, loser faces elimination.
   - Key Players: [Player A] (24.5 proj), [Player B] (22.1 proj), [Player C]
     (21.8 proj)
   - Prediction: Toss-up (52% Team A, 48% Team B)

2. **[Team C] vs [Team D]** (Spread: 4.1 pts)
   - Why Watch: Battle for first place. Both teams 4-1, this decides division
     lead.
   - Key Players: [Player D] (28.2 proj) vs [Player E] (26.5 proj) — elite QB
     duel
   - Prediction: Team C slight edge (58% win probability)

3. **[Team E] vs [Team F]** (Spread: 3.8 pts)
   - Why Watch: Revenge game. Team E blew out Team F in Week 2, now Team F has
     chance to even score.
   - Key Players: [Player F] (23.4 proj), [Player G] (20.9 proj)
   - Prediction: Team E 55%, but Team F has upset potential
```

---

**Part B: Key Start/Sit Decisions**

**Methodology**:

1. Flag decisions where projected difference < 3 points (too close to call)
2. Flag decisions where both options have high upside (boom-bust scenarios)
3. Flag decisions that could swing matchup outcome (player projected > 10% of
   team total)
4. Group by team, show max 2-3 toughest decisions per team

**Required Data**:

```typescript
{
  decisions: Array<{
    teamName: string;
    position: string; // FLEX, WR2, RB2, etc.
    options: Array<{
      playerName: string;
      projection: number;
      upside: number; // 90th percentile outcome
      floor: number; // 10th percentile outcome
      timeslot: string;
      nflMatchup: string; // e.g., "vs TEN" (favorable/unfavorable)
    }>;
    recommendation: string; // "Start [Player A] for floor, [Player B] for ceiling"
    difficultyScore: number; // 0-100, how tough the call is
  }>;
}
```

**Output Format**:

```markdown
### League-Wide Key Decisions

**Toughest Calls This Week**:

1. **[Team Name] — FLEX Decision**
   - Option A: [Player X] (Proj: 14.2, Upside: 22, Floor: 8) — Sun 1pm @ LAR
   - Option B: [Player Y] (Proj: 13.8, Upside: 19, Floor: 10) — Sun 4pm vs BUF
   - Recommendation: Player X for ceiling (better matchup), Player Y for floor
     (more consistent)

2. **[Team Name] — WR2 Decision**
   - Option A: [Player Z] (Proj: 11.5, Upside: 18, Floor: 5) — Thu 8pm @ KC
   - Option B: [Player W] (Proj: 12.1, Upside: 16, Floor: 8) — Mon 8pm vs DEN
   - Recommendation: Player W (safer play, better floor). Player Z is boom-bust.

3. **[Team Name] — RB2 Decision**
   - Projections within 0.5 points, both have injury concerns. Monitor news
     closely.
```

---

### Section 4: Injury Report & League Odds

**Part A: Injury Impact**

**What Gets Flagged**:

1. **OUT/DOUBTFUL players** owned in the league (immediate lineup impact)
2. **QUESTIONABLE players** projected > 12 points (high-value decisions)
3. **Backup situations** where injury creates waiver opportunity
4. **Injury impact on matchups** (e.g., "Team A's RB1 out, Team B now favored")

**Required Data**:

```typescript
{
  injuries: Array<{
    playerName: string;
    position: string;
    nflTeam: string;
    status: 'OUT' | 'DOUBTFUL' | 'QUESTIONABLE';
    ownedBy: string[]; // Gauntlet team names
    projection: number; // If he plays
    replacement: { name: string; projection: number } | null;
    impactLevel: 'critical' | 'significant' | 'moderate'; // Based on projection
    matchupImpact: string; // "Team A now underdog in matchup vs Team B"
  }>;
}
```

**Output Format**:

```markdown
### Injury Report

**Critical Impact**:

- **[Player A]** (OUT) — Owned by [Team Name]. Replacement: [Player B] (proj:
  -8.2 points). Team now underdog vs opponent.
- **[Player C]** (DOUBTFUL) — Owned by [Team Name]. If out, start [Player D]
  instead (proj: 11.5).

**Monitor Closely** (Questionable):

- **[Player E]** (Q) — [Team Name] should have backup plan. If out, flex [Player
  F].
- **[Player G]** (Q) — Game-time decision. Check status 90 min before kickoff.

**Waiver Opportunities**:

- **[Player H]** (Backup RB) — Takes over for injured starter. Projected 14+
  points, available in 8 leagues.
```

---

**Part B: League-Wide Playoff Odds**

**Purpose**: Show current playoff picture + how this week's games affect it

**Required Data**:

```typescript
{
  playoffPicture: {
    currentSeeds: Array<{
      seed: number;
      teamName: string;
      record: string;
      playoffOdds: number; // % to make playoffs
      championshipOdds: number; // % to win title
    }>;
    bubble: Array<{
      teamName: string;
      record: string;
      playoffOdds: number;
      scenarioToMakePlayoffs: string; // "Win + 2 other results"
    }>;
    eliminated: string[]; // Teams mathematically out
  };
  thisWeeksImpact: Array<{
    matchup: string;
    stakes: string; // "Winner clinches", "Loser eliminated", etc.
    oddsSwing: number; // How much playoff odds change
  }>;
}
```

**Output Format**:

```markdown
### Playoff Picture

**Current Standings** (Top 6 per conference make playoffs):

**AFC**:

1. Joel (4-1) — 95% playoff odds, 22% title odds
2. Neil (3-2) — 78% playoff odds, 8% title odds
3. Anant (2-3) — 45% playoff odds, 3% title odds ...
4. Ben (3-2) — 72% playoff odds, 11% title odds

---

7. Hunter (3-2) — 58% playoff odds, 5% title odds ← Bubble
8. Akhil (2-3) — 42% playoff odds, 2% title odds ← Bubble

**NFC**: [Similar format]

**This Week's Playoff Stakes**:

- **Joel vs Vinay**: Joel win → 99% playoff odds (clinch). Joel loss → 88%
  (still safe).
- **Neil vs Akhil**: Winner → 85% playoff odds. Loser → 35% odds. **Massive
  swing game.**
- **Anant vs Hunter**: Both at 45-55% odds. Winner controls own destiny, loser
  needs help.

**Elimination Watch**:

- Arnav (0-5): Must win out (12 straight) to make playoffs. Practically
  eliminated.
- Vinny (1-4): Needs 5 of 6. Tough road ahead.
```

---

## 📊 Token Estimates (Revised Preview)

| Section                | Input Tokens | Output Tokens | Total       |
| ---------------------- | ------------ | ------------- | ----------- |
| Week Overview          | 2,000        | 350           | 2,350       |
| Matchup Analysis (12)  | 1,000 × 12   | 200 × 12      | 14,400      |
| Must-Watch + Decisions | 2,000        | 400           | 2,400       |
| Injury + Playoff Odds  | 1,500        | 300           | 1,800       |
| **TOTAL**              | **~18,500**  | **~3,650**    | **~22,150** |

**Comparison to Old Preview**:

- Old: ~24K tokens (6 sections)
- New: ~22K tokens (4 sections)
- **Savings**: 2K tokens, more focused content

---

## 🎯 Why This Is Better

### What We Fixed:

1. **No AI Slop**: Removed narrative predictions without news context
2. **More Data-Driven**: Timeslot breakdowns, odds, projections dominate
3. **More Visual**: Score evolution tables can be charted
4. **More Actionable**: Start/sit decisions + injury impacts are concrete
5. **Clear Methodology**: Must-watch games use scoring formula, not vibes

### What We Kept:

1. **Week overview** (sets the stage)
2. **Must-watch games** (highlights best matchups)
3. **Injury report** (critical lineup info)
4. **Playoff odds** (contextualizes stakes)

### What We Added:

1. **Timeslot-based score evolution** (like Week 3 report)
2. **Key start/sit decisions** (league-wide tough calls)
3. **Playoff odds impact per game** (shows what's at stake)

---

## 🔧 New Tools Needed

```typescript
// Timeslot Analysis
fetch_player_timeslots(week: number, playerIds: string[]): Promise<TimeslotMap>
calculate_timeslot_accumulation(players: Player[], projections: Projections): Promise<TimeslotScores>

// Must-Watch Scoring
calculate_must_watch_score(matchup: Matchup): Promise<number>
rank_matchups_by_interest(allMatchups: Matchup[]): Promise<Matchup[]>

// Start/Sit Analysis
identify_tough_decisions(rosters: Roster[], projections: Projections): Promise<Decision[]>
calculate_decision_difficulty(options: Player[]): Promise<number>

// Playoff Odds
calculate_playoff_odds_changes(currentStandings: Standings, thisWeekMatchups: Matchup[]): Promise<OddsImpact>
```

---

## ✅ Approval Checklist

- [x] Removed narrative-heavy matchup predictions
- [x] Removed power rankings projection
- [x] Removed bold predictions
- [x] Added timeslot-based matchup evolution
- [x] Added key start/sit decisions
- [x] Added playoff odds impact
- [x] Clarified must-watch methodology
- [x] Clarified injury report criteria
- [x] More data-driven, less AI slop risk
- [x] Similar to Week 3 report style

---

**Ready to implement after weekly recaps are working!**
