# WEB-REPORT: Detailed Section Breakdown & Data Requirements

**Last Updated**: October 8, 2025  
**Purpose**: Granular mapping of every report section, data needs, and tool
calls

---

## 📋 Report Type 1: Weekly Recap (Post-Game)

**Generated**: Tuesday after games complete  
**Purpose**: Analyze completed week's results  
**Total Sections**: 8 primary sections + 12 matchup narratives = 20 sections

---

### Section 1: League Overview & Week Summary

**Purpose**: Set the stage for the week, highlight biggest stories

**Required Data**:

```typescript
{
  week: number;
  season: string;
  leagues: {
    afc: {
      leagueId: string;
      name: string;
      topScorer: { teamName: string, score: number, rosterId: number };
      lowestScorer: { teamName: string, score: number, rosterId: number };
      closestGame: { margin: number, teams: string[] };
      biggestBlowout: { margin: number, teams: string[] };
    };
    nfc: { ... }; // same structure
  };
  standingsSnapshot: {
    undefeated: Array<{ teamName: string, record: string, league: string }>;
    winless: Array<{ teamName: string, record: string, league: string }>;
    playoffBubble: Array<{ teamName: string, record: string, playoffOdds: number }>;
  };
  weekHighlights: {
    topPlayerPerformance: { name: string, position: string, points: number, team: string };
    biggestUpset: { underdog: string, favorite: string, projectedSpread: number, actualMargin: number };
    streaks: Array<{ teamName: string, type: 'win' | 'loss', length: number }>;
  };
}
```

**Tools Called**:

1. `fetch_league_data(week)` → Basic league info
2. `fetch_all_matchups(week)` → All 12 matchups with scores
3. `fetch_standings(week)` → Current standings after this week
4. `calculate_week_summary_stats(matchups)` → Aggregate stats (top scorer,
   closest game, etc.)
5. `fetch_playoff_odds(week)` → Current playoff probabilities
6. `identify_storylines(matchups, standings, history)` → Key narratives

**Output Format**:

- 3-4 paragraphs
- 200-300 words
- Tone: Engaging, sets dramatic tone
- Must mention: Top story, standings impact, looking ahead

**Example Style** (from Week 5):

> "Week 5 delivered heartbreak, heroics, and history. Jeffrey's Marginal Returns
> stayed perfect at 5–0, demolishing Ziyan's streak in the process. Vinny
> finally escaped 0–4 hell with his first victory..."

---

### Section 2: AFC Matchup Narratives (6 games)

**Purpose**: Tell the story of each AFC matchup with player-level detail + game
flow analysis

**Required Data Per Matchup**:

```typescript
{
  matchupId: number;
  leagueId: string;
  teamA: {
    rosterId: number;
    teamName: string;
    ownerNames: string[];
    recordBefore: { wins: number, losses: number };
    recordAfter: { wins: number, losses: number };
    totalScore: number;
    boxscore: Array<{
      playerId: string;
      playerName: string;
      position: string;
      points: number;
      projectedPoints: number; // for boom/bust analysis
    }>;
    topPerformers: Array<{ name: string, points: number, position: string }>;
    disappointments: Array<{ name: string, points: number, position: string, projected: number }>;
  };
  teamB: { ... }; // same structure
  margin: number;
  combinedPoints: number;
  context: {
    wasUpset: boolean;
    projectedWinner: string;
    projectedSpread: number;
    playoffImplications: string; // "eliminated", "must-win", "clinching scenario", "neutral"
  };
  historicalContext: {
    h2hRecord: { teamA: number, teamB: number };
    lastMeetingWeek: number;
    lastMeetingScore: { teamA: number, teamB: number };
  };
  gameFlow: {
    // Compressed time-series data (5-min cron captures)
    scoreOverTime: Array<{
      timestamp: string;
      teamAScore: number;
      teamBScore: number;
    }>;
    winProbabilityOverTime: Array<{
      timestamp: string;
      teamAWinProb: number;
      teamBWinProb: number;
    }>;
    // Summary metrics (to reduce token usage)
    biggestLead: { team: string, points: number, timestamp: string };
    leadChanges: number;
    winProbSwings: Array<{
      timestamp: string;
      magnitude: number; // How much win prob changed
      trigger: string; // Which player/play caused it
    }>;
    gameState: 'blowout' | 'competitive' | 'comeback' | 'wire-to-wire';
    excitementScore: number; // 0-100, based on volatility
  };
}
```

**Tools Called** (per matchup):

1. `fetch_matchup_details(leagueId, week, matchupId)` → Full box scores
2. `fetch_team_names(leagueId, [rosterIdA, rosterIdB])` → Resolve team names
3. `fetch_owner_names(leagueId, [rosterIdA, rosterIdB])` → Owner names
4. `fetch_projections(leagueId, week, [rosterIdA, rosterIdB])` → Pre-game
   projections
5. `fetch_team_records(leagueId, [rosterIdA, rosterIdB], week)` → Before/after
   records
6. `calculate_top_performers(boxscore, topN=3)` → Identify stars
7. `calculate_disappointments(boxscore, projections)` → Identify busts
8. `fetch_h2h_history(leagueId, rosterIdA, rosterIdB)` → Historical context
9. `calculate_playoff_implications(standings, record)` → Playoff impact
10. **`fetch_game_flow_compressed(leagueId, week, matchupId)`** → Compressed
    time-series data
11. **`analyze_game_flow(scoreTimeSeries, winProbTimeSeries)`** → Extract key
    moments

---

**🔧 Game Flow Data Compression Strategy**

**Challenge**: Cron jobs capture score + win probability every 5 minutes during
games:

- 3-hour game = 36 data points per matchup
- 12 matchups = 432 data points per week
- Raw data = ~4,000 tokens if sent to LLM directly

**Solution**: Intelligent compression to ~500 tokens (7x reduction)

**Compression Algorithm**:

1. **Keep only key moments** (36 points → 5-8 points):
   - Game start
   - Lead changes (when score crosses)
   - Big win prob swings (> 15% in one update)
   - Halftime (optional)
   - Final score

2. **Calculate derived metrics**:
   - `leadChanges`: Count of score crossovers
   - `biggestLead`: Max margin at any point
   - `biggestWinProbSwing`: Largest win prob change + what triggered it
   - `gameState`: Classification (blowout | competitive | comeback |
     wire-to-wire)
   - `excitementScore`: 0-100 based on volatility

3. **Store full data separately**:
   - Full time-series → Database (for charts/visualization)
   - Compressed summary → LLM prompt

**Example**:

**Before Compression** (36 data points, ~600 tokens):

```json
[
  { "time": "Sun 1:00pm", "teamA": 0, "teamB": 0, "winProbA": 0.52 },
  { "time": "Sun 1:05pm", "teamA": 0, "teamB": 7.2, "winProbA": 0.43 },
  { "time": "Sun 1:10pm", "teamA": 6.5, "teamB": 7.2, "winProbA": 0.48 }
  // ... 33 more points
]
```

**After Compression** (5 key moments + summary, ~40 tokens):

```json
{
  "keyMoments": [
    { "time": "Sun 1:05pm", "event": "Team B early lead", "score": "0-7.2" },
    {
      "time": "Sun 2:15pm",
      "event": "Team A takes lead",
      "score": "24.5-18.2"
    },
    {
      "time": "Sun 4:30pm",
      "event": "Team B retakes lead",
      "score": "38.2-42.5"
    },
    { "time": "Mon 11:15pm", "event": "Final", "score": "94.56-92.27" }
  ],
  "summary": {
    "leadChanges": 4,
    "biggestLead": { "team": "Team B", "points": 12.3 },
    "biggestWinProbSwing": {
      "magnitude": 27,
      "trigger": "Team A RB touchdown"
    },
    "gameState": "back-and-forth",
    "excitementScore": 87
  }
}
```

**Token Savings Per Week**:

- Raw: 4,000 tokens
- Compressed: 500 tokens
- **Savings**: 3,500 tokens per recap report

---

**Output Format**:

- 2 paragraphs per team (4 paragraphs total)
- 250-350 words per matchup
- Structure:
  - **Para 1 (Winner)**: How they won, top performers, record impact
  - **Para 2 (Winner)**: Secondary contributors, context, trajectory
  - **Para 3 (Loser)**: Why they lost, what went wrong, disappointments
  - **Para 4 (Loser)**: Bright spots (if any), record impact, outlook

**Example Style** (with game flow):

> "Heartbreak by 2.29 points. Nolan led by 12 at halftime, but Arpit & Yash's
> Baker Mayfield (27.2) torched the Sunday afternoon slate. Win probability
> swung from 75% Nolan to 55% Arpit in a single quarter. The lead changed 3
> times, and it came down to Monday Night Football—Nolan's Kareem Hunt (18.7) vs
> Arpit's Calvin Ridley (15.6). Hunt delivered, but it wasn't enough. Excitement
> score: 87/100 (thriller).
>
> Nolan had the firepower—Josh Allen (20.9), Kareem Hunt (18.7), and Amon-Ra
> (14.0)—but Baker's explosion changed everything. When your QB and RB1 deliver
> 40 combined and you still lose, it's a gut punch..."

**Key Requirements**:

- ✅ Must mention actual scores (validated by audit)
- ✅ Must mention top 3-4 performers per team with point totals
- ✅ Must include record before/after in title or first sentence
- ✅ Should mention playoff implications if significant
- ✅ Should compare projections vs actuals for boom/bust narrative

---

### Section 3: NFC Matchup Narratives (6 games)

**Same structure as AFC** (see Section 2)

**Tools Called**: Identical to Section 2, just with NFC league ID

---

### Section 4: Hall of Fame

**Purpose**: Celebrate the week's best performances

**Required Data**:

```typescript
{
  categories: {
    highestScoringTeam: {
      teamName: string;
      score: number;
      league: string;
      topPlayers: Array<{ name: string, position: string, points: number }>;
    };
    biggestBlowout: {
      winner: string;
      loser: string;
      margin: number;
      winnerScore: number;
    };
    closestGame: {
      winner: string;
      loser: string;
      margin: number;
      totalPoints: number;
    };
    topQBPerformance: {
      playerName: string;
      teamName: string;
      points: number;
      stats: { passingYds: number, passingTDs: number, rushingYds?: number };
    };
    topRBPerformance: { ... };
    topWRPerformance: { ... };
    topTEPerformance: { ... };
    bestCombination: {
      teamName: string;
      position1: { name: string, position: string, points: number };
      position2: { name: string, position: string, points: number };
      combinedPoints: number;
      description: string; // e.g., "QB-RB1 stack"
    };
    luckiestWin: {
      teamName: string;
      opponentScore: number;
      theirScore: number;
      projectedToLose: boolean;
      projectedSpread: number;
    };
  };
}
```

**Tools Called**:

1. `fetch_all_matchups(week)` → All game data
2. `calculate_top_team_score(matchups)` → Highest scorer
3. `calculate_biggest_blowout(matchups)` → Largest margin
4. `calculate_closest_game(matchups)` → Smallest margin
5. `fetch_all_player_stats(week)` → Individual player performances
6. `calculate_top_position_performers(playerStats, position)` → Best QB, RB, WR,
   TE
7. `calculate_best_position_stack(matchups)` → Best multi-position combo
8. `calculate_luckiest_win(matchups, projections)` → Biggest upset

**Output Format**:

- 5-8 entries
- Each entry: 1-2 sentences
- Include key stats (scores, margins, player points)
- Tone: Celebratory, superlative

**Example**:

> "**Highest Scoring Team**: DJ Herbussy (146.4) — Akhil C's squad exploded with
> Bucky Irving (32.4), Justin Herbert (27.6), and Emeka Egbuka (24.8) leading a
> balanced attack."

---

### Section 5: Hall of Shame

**Purpose**: Highlight the week's worst performances (in good fun)

**Required Data**:

```typescript
{
  categories: {
    lowestScoringTeam: {
      teamName: string;
      score: number;
      league: string;
      worstStarters: Array<{ name: string, position: string, points: number }>;
    };
    biggestUnderperformer: {
      playerName: string;
      position: string;
      actualPoints: number;
      projectedPoints: number;
      teamName: string;
      difference: number;
    };
    worstStartSitDecision: {
      teamName: string;
      playerStarted: { name: string, points: number };
      playerBenched: { name: string, points: number };
      pointsLeft: number;
    };
    badBeatLoss: {
      teamName: string;
      theirScore: number;
      opponentScore: number;
      margin: number;
      percentileScore: number; // e.g., "90th percentile but still lost"
    };
    eliminationWatch: {
      teamName: string;
      record: string;
      playoffOdds: number;
      mustWinOut: boolean;
    };
  };
}
```

**Tools Called**:

1. `fetch_all_matchups(week)` → All game data
2. `calculate_lowest_team_score(matchups)` → Lowest scorer
3. `fetch_projections(week)` → Expected performance
4. `calculate_biggest_busts(playerStats, projections)` → Worst underperformers
5. `calculate_worst_start_sit_decisions(matchups, rosters, benchScores)` →
   Lineup mistakes
6. `calculate_bad_beat_losses(matchups, leagueScoreDistribution)` → High scorers
   who lost
7. `calculate_elimination_watch(standings, remainingWeeks)` → Teams in trouble

**Output Format**:

- 4-6 entries
- Each entry: 1-2 sentences
- Tone: Sympathetic but honest, "tough luck" framing
- Avoid being mean-spirited

**Example**:

> "**Worst Start/Sit Decision**: Nolan left 23.4 points on the bench (benched
> player X who went off). That's the difference between 2-3 and 3-2."

---

### Section 6: Power Rankings Commentary

**Purpose**: Explain power ranking changes with narrative context

**Required Data**:

```typescript
{
  rankings: Array<{
    rank: number;
    teamName: string;
    rosterId: number;
    leagueId: string;
    league: string; // "AFC" | "NFC"
    record: { wins: number; losses: number };
    powerScore: number;
    change: number; // +3, -2, 0, etc.
    changeLabel: string; // "+3", "-2", "--"
    context: {
      recentForm: Array<'W' | 'L'>; // last 3 weeks
      pointsForPerWeek: number;
      pointsAgainstPerWeek: number;
      strengthOfSchedule: number; // 0-1 scale
      projectedPlayoffOdds: number;
    };
    keyPlayers: Array<{ name: string; position: string; avgPoints: number }>;
  }>;
  tierBreaks: Array<number>; // e.g., [6, 12, 18] = tiers 1-6, 7-12, 13-18, 19-24
}
```

**Tools Called**:

1. `fetch_power_rankings(week)` → Current rankings
2. `fetch_power_rankings(week - 1)` → Previous week rankings
3. `calculate_ranking_changes(current, previous)` → Deltas
4. `fetch_team_stats(week, rosterId)` → Points for/against, record
5. `calculate_strength_of_schedule(rosterId, opponents)` → SOS metric
6. `fetch_playoff_odds(week, rosterId)` → Playoff probability
7. `identify_tier_breaks(rankings, powerScores)` → Natural clustering

**Output Format**:

- Brief commentary on each tier (3-4 tiers)
- Mention movers & shakers (biggest +/- changes)
- 150-200 words total
- Tone: Analytical, objective

**Example**:

> "**Top Tier (Ranks 1-5)**: Jeffrey (5-0) stands alone at the top, but the next
> four teams are separated by just 3 power rating points. Joel, Akhil C,
> Christian, and Ben all have legitimate title shots..."

---

### Section 7: Standings & Playoff Picture

**Purpose**: Show current standings by division/conference

**Required Data**:

```typescript
{
  leagues: Array<{
    leagueId: string;
    leagueName: string;
    divisions: Record<
      string,
      Array<{
        rosterId: number;
        teamName: string;
        ownerName: string;
        wins: number;
        losses: number;
        pointsFor: number;
        pointsAgainst: number;
        divisionRank: number;
        playoffSeed: number | null; // if playoffs started today
        playoffOdds: number;
        magicNumber: number | null; // games to clinch
        eliminationNumber: number | null; // games to elimination
      }>
    >;
  }>;
  playoffFormat: {
    teamsPerLeague: number; // usually 6
    byeDivisionWinners: boolean;
  }
}
```

**Tools Called**:

1. `fetch_league_settings(leagueId)` → Playoff format
2. `fetch_standings(week)` → Current records
3. `fetch_divisions(leagueId)` → Division assignments
4. `calculate_playoff_seeds(standings, format)` → Current seeding
5. `calculate_playoff_odds(standings, remainingSchedule)` → Playoff probability
6. `calculate_magic_numbers(standings, remainingWeeks)` → Clinch scenarios
7. `calculate_elimination_numbers(standings, remainingWeeks)` → Elimination
   scenarios

**Output Format**:

- Table format (handled by React component, just provide data)
- Optional: 1-2 sentence summary per division
- Tone: Factual, standings-focused

---

### Section 8: Upcoming Matchups Preview

**Purpose**: Look ahead to next week's games

**Required Data**:

```typescript
{
  nextWeek: number;
  matchups: Array<{
    matchupId: number;
    leagueId: string;
    league: string; // "AFC" | "NFC"
    teamA: {
      rosterId: number;
      teamName: string;
      record: { wins: number, losses: number };
      powerRank: number;
      projectedScore: number;
      winProbability: number;
    };
    teamB: { ... }; // same structure
    context: {
      isRivalry: boolean;
      lastMeetingWeek: number | null;
      lastMeetingWinner: string | null;
      playoffImplications: string; // "elimination game", "must-win for both", etc.
    };
    headline: string; // e.g., "Battle for First Place", "Relegation Six-Pointer"
  }>;
}
```

**Tools Called**:

1. `fetch_next_week_matchups(week + 1)` → Upcoming pairings
2. `fetch_team_names(leagueId, rosterIds)` → Resolve names
3. `fetch_team_records(leagueId, rosterIds, week)` → Current records
4. `fetch_projections(week + 1, rosterIds)` → Projected scores
5. `calculate_win_probabilities(projections)` → Win odds
6. `fetch_h2h_history(rosterA, rosterB)` → Historical context
7. `calculate_playoff_implications(standings, matchups)` → Stakes

**Output Format**:

- List of matchups grouped by league
- Each matchup: 1 line with teams, records, brief context
- Tone: Anticipatory, "must-watch" framing

**Example**:

> "**AFC**: Joel (4-1) vs Vinay (1-4) — Projected 128-105 in Joel's favor. Vinay
> needs a miracle upset to stay alive."

---

### Section 9: Closing Commentary

**Purpose**: Big-picture takeaways, season narrative, meta-analysis

**Required Data**:

```typescript
{
  seasonContext: {
    weeksComplete: number;
    weeksRemaining: number;
    playoffWeekStart: number;
  };
  trends: {
    dominantPositions: Array<{ position: string, topScorers: string[], avgPoints: number }>;
    surpriseTeams: Array<{ teamName: string, expectedRecord: string, actualRecord: string }>;
    disappointingTeams: Array<{ teamName: string, expectedRecord: string, actualRecord: string }>;
    tightRaces: Array<{ description: string, teams: string[] }>;
  };
  weeklyVariance: {
    highestScore: number;
    lowestScore: number;
    scoringRange: number;
    avgMarginOfVictory: number;
  };
  lookAhead: {
    nextWeekHeadlines: string[];
    playoffPictureStatus: string; // "wide open", "favorites emerging", "separation happening"
  };
}
```

**Tools Called**:

1. `fetch_season_settings()` → Season structure
2. `calculate_position_trends(allMatchups, positions)` → Which positions
   dominating
3. `calculate_surprise_teams(preseasonProjections, actualRecords)` →
   Over/underperformers
4. `calculate_weekly_variance(weekMatchups)` → Scoring distribution
5. `calculate_next_week_headlines(upcomingMatchups, standings)` → Preview
   teasers

**Output Format**:

- 2-3 paragraphs
- 150-200 words
- Tone: Reflective, big-picture, forward-looking
- Must mention: Season progress, playoff picture, next week tease

**Example**:

> "Week 5 separated contenders from pretenders. The middle is chaos: 14 teams
> between 2–3 and 4–1, separated by tiebreakers and luck. Week 6 will test who's
> real and who's been riding variance..."

---

## 📋 Report Type 2: Weekly Preview (Pre-Game)

**Generated**: Thursday before games start  
**Purpose**: Set up the week's matchups and predictions  
**Total Sections**: 6 primary sections

---

### Preview Section 1: Week Overview & Storylines

**Purpose**: Frame the week's most compelling narratives

**Required Data**:

```typescript
{
  week: number;
  season: string;
  keyStorylines: Array<{
    headline: string; // e.g., "Undefeated Teams Face Toughest Tests Yet"
    description: string;
    teamsInvolved: string[];
    stakes: string; // "playoff positioning", "elimination game", etc.
  }>;
  powerShifts: {
    risingTeams: Array<{ teamName: string, recentRecord: string, trend: string }>;
    fallingTeams: Array<{ teamName: string, recentRecord: string, trend: string }>;
  };
  playoffPicture: {
    locked: string[]; // teams with clinched spots
    bubble: string[]; // teams fighting for spots
    eliminated: string[]; // teams mathematically out
  };
}
```

**Tools Called**:

1. `fetch_standings(week - 1)` → Current standings
2. `fetch_upcoming_matchups(week)` → This week's games
3. `identify_key_storylines(matchups, standings, history)` → Narrative hooks
4. `calculate_recent_form(standings, recentWeeks=3)` → Hot/cold teams
5. `calculate_playoff_picture(standings, remainingWeeks)` → Playoff status

**Output Format**:

- 3-4 paragraphs
- 200-250 words
- Tone: Anticipatory, dramatic setup
- Must mention: Top storyline, playoff stakes, key matchups

---

### Preview Section 2: Matchup Predictions (12 games)

**Purpose**: Predict each game with analysis

**Required Data Per Matchup**:

```typescript
{
  matchupId: number;
  leagueId: string;
  league: string;
  teamA: {
    rosterId: number;
    teamName: string;
    record: { wins: number, losses: number };
    powerRank: number;
    projectedScore: number;
    projectedStarters: Array<{
      playerId: string;
      name: string;
      position: string;
      projectedPoints: number;
      recentForm: { last3Avg: number, trend: 'up' | 'down' | 'stable' };
    }>;
    keyAdvantages: string[]; // e.g., ["QB edge", "Strong RB corps"]
    keyWeaknesses: string[]; // e.g., ["Thin at WR", "Tough matchup for TE"]
  };
  teamB: { ... };
  prediction: {
    favorite: string; // team name
    spread: number;
    winProbability: { teamA: number, teamB: number };
    confidence: 'low' | 'medium' | 'high';
    xFactor: string; // "If Player X has big game, Team A wins"
  };
  context: {
    h2hHistory: { teamA: number, teamB: number };
    lastMeeting: { week: number, score: string, winner: string } | null;
    playoffImplications: string;
  };
}
```

**Tools Called**:

1. `fetch_matchup_pairings(week)` → Who plays who
2. `fetch_team_records(leagueId, rosterIds, week - 1)` → Current records
3. `fetch_projections(week, rosterIds)` → Projected scores
4. `fetch_rosters_with_starters(leagueId, rosterIds)` → Expected lineups
5. `fetch_player_projections(week, playerIds)` → Individual projections
6. `calculate_recent_form(playerIds, weeks=3)` → Trends
7. `run_simulation(teamA, teamB)` → Monte Carlo win probability
8. `identify_key_matchups(teamAStarters, teamBStarters)` → Position battles
9. `fetch_h2h_history(rosterA, rosterB)` → Historical data

**Output Format**:

- 2-3 paragraphs per matchup
- 150-200 words
- Structure:
  - **Para 1**: Matchup overview, records, stakes
  - **Para 2**: Team A strengths, projected key players
  - **Para 3**: Team B strengths, prediction with spread

**Example**:

> "**Joel's To Infinity and Bijan (4-1) vs Vinay's vchak (1-4)**
>
> Joel enters as a heavy favorite with his Patrick Mahomes–Bijan Robinson
> foundation. Projected 128-105, this looks like a mismatch on paper. Joel's
> riding a 3-game win streak and sits atop the AFC power rankings.
>
> Vinay desperately needs an upset to keep playoff hopes alive. Bo Nix has been
> solid (22 PPG), but the supporting cast hasn't shown up consistently. If CMC
> can return to Week 1 form (28 points), there's an outside shot.
>
> **Prediction: Joel 128, Vinay 105 (70% confidence). Joel's depth is too
> much.**"

---

### Preview Section 3: Must-Watch Games

**Purpose**: Highlight the 3-4 most compelling matchups

**Required Data**:

```typescript
{
  games: Array<{
    matchupId: number;
    teams: string[];
    league: string;
    whyWatch: string; // "Closest projected spread", "Playoff elimination game", etc.
    projectedMargin: number;
    playoffImplications: string;
    xFactor: string;
    predictionSummary: string; // 1-sentence prediction
  }>;
}
```

**Tools Called**:

1. `identify_must_watch_games(allMatchups, criteria)` → Top games by interest
2. Reuse data from Section 2 (matchup predictions)

**Output Format**:

- 3-4 game highlights
- 50-75 words per game
- Tone: Hype, "don't miss this" framing

---

### Preview Section 4: Injury Report & Lineup Notes

**Purpose**: Flag questionable players and key start/sit decisions

**Required Data**:

```typescript
{
  injuries: Array<{
    playerId: string;
    playerName: string;
    position: string;
    team: string; // NFL team
    status: 'OUT' | 'DOUBTFUL' | 'QUESTIONABLE';
    affectedFantasyTeams: string[]; // Gauntlet team names
    projectedImpact: 'high' | 'medium' | 'low';
    replacement: {
      playerId: string;
      name: string;
      projectedPoints: number;
    } | null;
  }>;
  keyDecisions: Array<{
    teamName: string;
    dilemma: string; // e.g., "Start Njoku or Kmet at TE?"
    options: Array<{ name: string; projectedPoints: number; upside: string }>;
    recommendation: string;
  }>;
}
```

**Tools Called**:

1. `fetch_nfl_injury_report(week)` → NFL injury data
2. `fetch_all_rosters(leagues)` → Who owns these players
3. `calculate_injury_impact(injuries, rosters, projections)` → Fantasy impact
4. `identify_start_sit_dilemmas(rosters, projections)` → Tough calls

**Output Format**:

- Bullet list format
- Brief, actionable
- Tone: Informative, advisory

---

### Preview Section 5: Power Rankings Projection

**Purpose**: Show current power rankings heading into the week

**Same data as Recap Section 6**, but pre-week instead of post-week

---

### Preview Section 6: Bold Predictions

**Purpose**: Make 3-5 spicy predictions for the week

**Required Data**:

```typescript
{
  predictions: Array<{
    category: string; // "Upset Alert", "Breakout Performance", "Biggest Blowout", etc.
    prediction: string;
    confidence: 'low' | 'medium' | 'high';
    reasoning: string;
  }>;
}
```

**Tools Called**:

1. `identify_upset_candidates(matchups, projections)` → Underdog picks
2. `identify_breakout_candidates(players, recentForm, matchups)` → Sleeper picks
3. `identify_blowout_candidates(matchups, teamStrength)` → Lopsided games

**Output Format**:

- 4-5 bold predictions
- 30-50 words each
- Tone: Confident, fun, willing to be wrong

**Example**:

> "**Upset Alert**: Vinay (1-4) stuns Joel (4-1). CMC goes off for 30+, and
> Joel's top guys have down weeks. Projected 128-105 for Joel, but variance says
> this is a 50-50 game. (Low confidence)"

---

## 🔧 Tool Definitions

### Data Fetching Tools

```typescript
// League & Basic Data
fetch_league_data(week: number): Promise<LeagueBasicData>
fetch_all_matchups(week: number): Promise<Matchup[]>
fetch_matchup_details(leagueId: string, week: number, matchupId: number): Promise<MatchupDetail>
fetch_standings(week: number): Promise<Standings>
fetch_team_names(leagueId: string, rosterIds: number[]): Promise<Map<number, string>>
fetch_owner_names(leagueId: string, rosterIds: number[]): Promise<Map<number, string>>

// Projections & Predictions
fetch_projections(week: number, rosterIds?: number[]): Promise<ProjectionData>
fetch_player_projections(week: number, playerIds: string[]): Promise<Map<string, number>>
run_simulation(teamA: RosterData, teamB: RosterData): Promise<SimulationResult>
calculate_win_probabilities(projections: ProjectionData): Promise<Map<string, number>>

// Rosters & Players
fetch_rosters_with_starters(leagueId: string, rosterIds: number[]): Promise<RosterData[]>
fetch_all_player_stats(week: number): Promise<PlayerStats[]>
fetch_nfl_injury_report(week: number): Promise<InjuryData[]>

// Historical & Context
fetch_h2h_history(leagueId: string, rosterA: number, rosterB: number): Promise<H2HRecord>
fetch_power_rankings(week: number): Promise<PowerRanking[]>
fetch_playoff_odds(week: number, rosterId?: number): Promise<PlayoffOdds>

// Advanced Analytics
calculate_recent_form(rosterId: number, weeks: number): Promise<FormData>
calculate_strength_of_schedule(rosterId: number): Promise<number>
identify_key_storylines(matchups: Matchup[], standings: Standings): Promise<Storyline[]>
calculate_position_trends(matchups: Matchup[]): Promise<PositionTrend[]>
```

### Analysis Tools

```typescript
// Summary Stats
calculate_week_summary_stats(matchups: Matchup[]): Promise<WeekSummary>
calculate_top_team_score(matchups: Matchup[]): Promise<TopScorer>
calculate_biggest_blowout(matchups: Matchup[]): Promise<BlowoutData>
calculate_closest_game(matchups: Matchup[]): Promise<ClosestGame>

// Player Analysis
calculate_top_performers(boxscore: BoxScore[], topN: number): Promise<PlayerPerformance[]>
calculate_disappointments(boxscore: BoxScore[], projections: Map<string, number>): Promise<Bust[]>
calculate_top_position_performers(stats: PlayerStats[], position: string): Promise<PlayerPerformance[]>

// Team Analysis
calculate_playoff_implications(standings: Standings, record: Record): Promise<string>
calculate_magic_numbers(standings: Standings, remainingWeeks: number): Promise<Map<number, number>>
calculate_best_position_stack(matchups: Matchup[]): Promise<StackData>

// Start/Sit & Decisions
calculate_worst_start_sit_decisions(matchups: Matchup[], rosters: RosterData[]): Promise<StartSitError[]>
identify_start_sit_dilemmas(rosters: RosterData[], projections: ProjectionData): Promise<Dilemma[]>
```

### Narrative Generation Tools

```typescript
generate_league_overview(data: LeagueOverviewData): Promise<string>
generate_matchup_narrative(data: MatchupNarrativeData): Promise<string>
generate_hall_of_fame_entry(data: HallOfFameData): Promise<string>
generate_power_rankings_commentary(data: PowerRankingData): Promise<string>
generate_closing_commentary(data: ClosingData): Promise<string>
generate_preview_overview(data: PreviewOverviewData): Promise<string>
generate_matchup_prediction(data: MatchupPredictionData): Promise<string>
generate_bold_predictions(data: BoldPredictionData): Promise<string>
```

### Audit Tools

```typescript
validate_scores(narrative: string, matchupData: Matchup): Promise<AuditResult>
validate_player_names(narrative: string, rosterData: RosterData[]): Promise<AuditResult>
validate_records(narrative: string, standings: Standings): Promise<AuditResult>
detect_contradictions(sections: ReportSection[]): Promise<AuditResult>
detect_hallucinations(narrative: string, sourceData: any): Promise<AuditResult>
validate_projections(predictions: string, projectionData: ProjectionData): Promise<AuditResult>
```

---

## 🔁 Audit-Edit Loop Architecture

### When Audit Fails

```typescript
type AuditResult = {
  passed: boolean;
  errors: Array<{
    sectionId: string;
    errorType: 'incorrect_score' | 'wrong_player_name' | 'wrong_record' | 'contradiction' | 'hallucination';
    description: string;
    snippetWithError: string; // Exact text that's wrong
    correctData: any; // What it should be
  }>;
  warnings: Array<{ ... }>; // Non-blocking issues
};

// Audit-Edit Loop Process:
// 1. Generate section
// 2. Run audit on section
// 3. If audit fails:
//    a. Extract error details
//    b. Provide correction context to LLM
//    c. Regenerate ONLY the problematic section
//    d. Re-audit
//    e. If still fails after 2 retries, flag for manual review
// 4. Move to next section
```

### LangGraph Node Structure

```
GENERATE_SECTION
  ↓
AUDIT_SECTION
  ↓
[Decision Node]
  ├─ PASSED → Next Section
  └─ FAILED → REGENERATE_SECTION (with error context)
       ↓
     AUDIT_SECTION (retry)
       ↓
     [Decision Node]
       ├─ PASSED → Next Section
       └─ FAILED → Increment retry count
            ↓
          [Retry count < 2?]
            ├─ YES → REGENERATE_SECTION again
            └─ NO → FLAG_FOR_MANUAL_REVIEW
```

### Regeneration Prompt

When audit fails, we provide this context to LLM:

```typescript
const regenerationPrompt = `
Your previous narrative had the following errors:

${errors
  .map(
    e => `
- **Error Type**: ${e.errorType}
- **Problem**: ${e.description}
- **Wrong Text**: "${e.snippetWithError}"
- **Correct Data**: ${JSON.stringify(e.correctData)}
`
  )
  .join('\n')}

Please regenerate this section with these corrections. Keep the same style and tone, but fix the factual errors.

Original section for reference:
${originalSection}

Source data for verification:
${JSON.stringify(sourceData, null, 2)}
`;
```

---

## 📏 Token Estimates by Section

### Recap Report

| Section         | Input Tokens | Output Tokens | Total       |
| --------------- | ------------ | ------------- | ----------- |
| League Overview | 2,000        | 400           | 2,400       |
| AFC Matchup 1-6 | 1,500 × 6    | 400 × 6       | 11,400      |
| NFC Matchup 1-6 | 1,500 × 6    | 400 × 6       | 11,400      |
| Hall of Fame    | 1,000        | 200           | 1,200       |
| Hall of Shame   | 1,000        | 200           | 1,200       |
| Power Rankings  | 1,500        | 300           | 1,800       |
| Standings       | 500          | 50            | 550         |
| Upcoming        | 1,000        | 150           | 1,150       |
| Closing         | 1,500        | 250           | 1,750       |
| **TOTAL**       | **~25,000**  | **~6,500**    | **~31,500** |

### Preview Report

| Section                  | Input Tokens | Output Tokens | Total       |
| ------------------------ | ------------ | ------------- | ----------- |
| Week Overview            | 2,000        | 350           | 2,350       |
| Matchup Predictions (12) | 1,200 × 12   | 250 × 12      | 17,400      |
| Must-Watch Games         | 800          | 200           | 1,000       |
| Injury Report            | 1,000        | 150           | 1,150       |
| Power Rankings           | 1,500        | 300           | 1,800       |
| Bold Predictions         | 500          | 150           | 650         |
| **TOTAL**                | **~20,000**  | **~4,000**    | **~24,000** |

---

## ✅ Data Quality Checklist

Before generating any narrative, ensure:

- [ ] All matchup scores are from actual API data (not projected)
- [ ] All player names exist in roster data
- [ ] All team records match standings API
- [ ] All projections are from simulation engine API
- [ ] All historical data is accurate (H2H records, etc.)
- [ ] No assumptions made (e.g., "probably", "likely" → use actual data)
- [ ] All positions validated (QB, RB, WR, TE, DEF)
- [ ] Team names resolved correctly (not roster IDs)
- [ ] Owner names included where appropriate

---

**This granular breakdown ensures every section has clear data requirements and
tool dependencies. Ready to implement!**
