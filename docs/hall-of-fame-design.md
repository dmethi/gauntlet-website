# Hall of Fame & Shame - Complete Design Document

## 🎯 Overview

The Gauntlet Hall of Fame & Shame is a **cross-league leaderboard system** that
tracks legendary performances and epic fails across ALL Gauntlet leagues and
seasons. Unlike traditional per-league leaderboards, this creates a unified
record book for the entire Gauntlet ecosystem.

### Vision Statement

Create the definitive record book of Gauntlet history - where a 150-point
performance in 2024 League A competes directly with a 145-point performance from
2025 League B for the title of "Highest Score EVER in Gauntlet History."

## 📊 Scope & Categories

### A. Score & Margin (5 stats)

**Scope**: Individual team performances and head-to-head results

- `highest_points` - Single highest scoring week across all leagues/seasons
- `lowest_points` - Single lowest scoring week (above 0)
- `biggest_margin` - Largest margin of victory in any matchup
- `smallest_margin` - Closest game ever played
- `most_bench_points` - Highest bench score in a single week

### B. Weekly - Team Subject (8 stats)

**Scope**: Team-level weekly achievements

- `perfect_lineup` - Optimal lineup score (all starters hit ceiling)
- `worst_lineup` - Suboptimal lineup score (all starters hit floor)
- `biggest_boom` - Largest positive projection variance
- `biggest_bust` - Largest negative projection variance
- `most_bench_regret` - Highest points left on bench
- `luckiest_week` - Best win despite lower score than opponent
- `unluckiest_week` - Loss despite higher score than typical winner
- `most_volatile_week` - Highest variance between starters

### C. Weekly - Matchup Subject (6 stats) ⭐ **NEW CATEGORIES**

**Scope**: Head-to-head matchup achievements

- `most_exciting_game` - Composite score: win probability swings + total
  points + margin
- `biggest_blowout` - Largest margin of victory
- `closest_game` - Smallest margin of victory
- `highest_combined_points` - Total points by both teams
- `lowest_combined_points` - Total points by both teams
- `most_one_sided_game` - Large margin + low loser score (embarrassing defeats)

### D. Lineup Quality (7 stats)

**Scope**: Weekly lineup construction and optimization

- `total_donuts` - Most players scoring 0 points in starting lineup
- `longest_donut_streak` - Most consecutive weeks with ≥1 donut
- `best_sleeper_pick` - Lowest-owned player with highest score
- `worst_chalk_pick` - Highest-owned player with lowest score
- `star_concentration_index` - Percentage of team points from top 1-2 players
- `boom_count` - Most starters exceeding 90th percentile vs position baseline
- `bust_count` - Most starters below 10th percentile vs position baseline

### E. Volatility & Luck (6 stats)

**Scope**: Performance consistency and luck-based outcomes

- `highest_ceiling` - Best possible weekly score with optimal lineup
- `lowest_floor` - Worst possible weekly score with worst lineup decisions
- `biggest_ceiling_gap` - Difference between actual and optimal score
- `most_consistent_week` - Lowest standard deviation among starters
- `most_volatile_week` - Highest standard deviation among starters
- `luckiest_injury_dodge` - Started player who got injured mid-game but scored
  well

## 🔧 Technical Architecture

### Cross-League Data Model

```typescript
// Configuration-driven league management
const GAUNTLET_LEAGUES = {
  '2024': {
    leagues: ['997670420490801152', 'LEAGUE_ID_2'],
    name: 'Gauntlet 2024',
    active: true,
  },
  '2025': {
    leagues: ['LEAGUE_ID_3', 'LEAGUE_ID_4', 'LEAGUE_ID_5'],
    name: 'Gauntlet 2025',
    active: false,
  },
};
```

### Client-Side Architecture ⭐ **PREFERRED APPROACH**

**Data Flow:**

1. **Configuration Lookup** → Get all leagues for target season
2. **Parallel API Calls** → Fetch matchup data from each league
3. **In-Memory Aggregation** → Combine all matchup data across leagues
4. **Real-Time Calculation** → Calculate Hall of Fame records from combined
   dataset
5. **Smart Caching** → Cache by season (30 days past, 4 hours current)

**Benefits:**

- ✅ **Simpler Architecture** - No database preprocessing required
- ✅ **True Cross-League** - Records span entire Gauntlet ecosystem
- ✅ **Real-Time Data** - Always uses latest available information
- ✅ **Rate Limit Safe** - <50 API calls vs thousands for preprocessing
- ✅ **Highly Cacheable** - Past seasons rarely change
- ✅ **Scalable** - Automatically handles new leagues

### Cache Strategy

```typescript
// Cache keys by season (not league)
const cacheKey = `gauntlet-hall-of-fame-${season}`;

// Expiration logic
const expiration =
  season < currentSeason
    ? 30 * 24 * 60 * 60 * 1000 // 30 days for past seasons
    : 4 * 60 * 60 * 1000; // 4 hours for current season
```

## 🧮 Calculation Formulas

### Matchup Subject Formulas

#### Most Exciting Game

```typescript
const excitementScore =
  pointsScore * 0.4 + marginScore * 0.6 + winProbSwing * 0.2;

// Where:
// pointsScore = normalize(totalPoints, 100, 300)  // More points = more exciting
// marginScore = normalize(1/margin, 0, 1)        // Closer = more exciting
// winProbSwing = sum of 10-minute win probability changes
```

#### Most One-Sided Game

```typescript
const oneSidedScore = margin * (1.5 - loserScore / 150);

// Combines large margin with embarrassingly low loser score
// 50-point margin with 60-point loser = 50 * (1.5 - 0.4) = 55
// 30-point margin with 120-point loser = 30 * (1.5 - 0.8) = 21
```

#### Win Probability Integration

```typescript
// TODO: Integrate with LiveWinProbSample model
const winProbSwing = liveWinProbSamples
  .sort((a, b) => a.timeElapsed - b.timeElapsed)
  .reduce((total, sample, index, arr) => {
    if (index === 0) return total;
    const swing = Math.abs(
      sample.winProbability - arr[index - 1].winProbability
    );
    return total + swing;
  }, 0);
```

### Score & Margin Formulas

#### Biggest Boom/Bust

```typescript
// Requires player projection data
const boom = actualScore - projectedScore; // Positive = boom
const bust = projectedScore - actualScore; // Positive = bust

// Variance-adjusted (TODO)
const adjustedBoom = boom / Math.sqrt(projectionVariance);
```

#### Perfect/Worst Lineup

```typescript
// Requires roster optimization
const perfectScore = optimizeLineup(rosterPlayers, 'maximize');
const worstScore = optimizeLineup(rosterPlayers, 'minimize');
const actualScore = getCurrentLineupScore(startingPlayers);

const perfection = actualScore / perfectScore; // 1.0 = perfect
const regret = perfectScore - actualScore; // Points left on table
```

## 🗄️ Database Schema

### Core Models

```prisma
model HallOfFameCategory {
  id          String @id @default(cuid())
  name        String @unique  // e.g., "most_exciting_game"
  displayName String          // e.g., "Most Exciting Game"
  description String?
  groupName   String          // e.g., "Weekly – Matchup Subject"
  statType    String          // "high", "low", "both"
  sortOrder   Int

  records HallOfFameRecord[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HallOfFameRecord {
  id         String @id @default(cuid())
  categoryId String
  category   HallOfFameCategory @relation(fields: [categoryId], references: [id])

  leagueId   String
  season     String
  week       Int?         // NULL for season-long records

  rosterId   Int
  roster     Roster @relation(fields: [rosterId], references: [id])

  value      Float        // The record value (points, margin, etc.)
  rank       Int          // 1-5 for top/bottom 5
  recordType String       // "highest" or "lowest"

  contextData Json?       // Additional context (opponent, players, etc.)
  achievedAt  DateTime

  @@unique([categoryId, leagueId, recordType, rank])
  @@index([categoryId, recordType, value])
}
```

### Required Supporting Data

```prisma
// Live win probability samples for excitement calculation
model LiveWinProbSample {
  id              String @id @default(cuid())
  matchupId       Int
  matchup         MatchupSummary @relation(fields: [matchupId], references: [id])

  timeElapsed     Int     // Minutes elapsed in games
  winProbability  Float   // 0.0 to 1.0
  sampleType      String  // "scheduled", "live", "final"

  createdAt DateTime @default(now())

  @@unique([matchupId, timeElapsed])
}

// Enhanced matchup summaries
model MatchupSummary {
  id            Int @id @default(autoincrement())
  leagueId      String
  week          Int
  season        String @default("2024")

  // Teams
  team1RosterId Int
  team1Score    Float
  team1Roster   Roster @relation("Team1", fields: [team1RosterId], references: [id])

  team2RosterId Int
  team2Score    Float
  team2Roster   Roster @relation("Team2", fields: [team2RosterId], references: [id])

  // Results
  winnerId      Int?
  margin        Float?
  totalPoints   Float?

  // Context
  matchupId     Int?    // Sleeper matchup ID

  // Relations
  liveWinProbSamples LiveWinProbSample[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([leagueId, week, season, matchupId])
}
```

## 🎮 User Experience

### UI Components

```typescript
// Main Hall of Fame page structure
<HallOfFamePage>
  <CrossLeagueDataStatus />     // Cache status, refresh controls
  <HallOfFameStats />          // Total records, leagues, matchups
  <CategoryTabs>               // Score & Margin, Matchup Subject, etc.
    <CategoryGroup>
      <RecordCard>
        <HallOfFameTable />    // Top 5 records
        <HallOfShameTable />   // Bottom 5 records (where applicable)
      </RecordCard>
    </CategoryGroup>
  </CategoryTabs>
</HallOfFamePage>
```

### Record Display Format

```
🏆 Most Exciting Game EVER
┌─────┬─────────────────────────┬──────────┬──────────┐
│  #  │ Matchup                 │   Score  │   Info   │
├─────┼─────────────────────────┼──────────┼──────────┤
│  1  │ John vs Mike (2024 L1)  │   95.7   │  Week 4  │
│  2  │ Sarah vs Tom (2025 L3)  │   94.2   │  Week 7  │
│  3  │ Alex vs Chris (2024 L2) │   91.8   │  Week 12 │
└─────┴─────────────────────────┴──────────┴──────────┘

Score = (Points: 8.5/10) + (Closeness: 9.2/10) + (Win Prob Swings: 8.1/10)
Context: 254.3 combined points, 1.1-point margin, 47% win prob swing
```

## 📈 Implementation Phases

### Phase 1: Foundation (COMPLETED)

- ✅ Prisma schema for categories and records
- ✅ Hall of Fame calculator with matchup categories
- ✅ Cross-league configuration system
- ✅ Client-side architecture design

### Phase 2: Core Data Pipeline

- [ ] **API Endpoints** - Raw matchup data fetching
- [ ] **Live Win Prob** - 10-minute interval sampling during games
- [ ] **Basic Calculations** - Simple stats (points, margins, totals)
- [ ] **Cache Implementation** - Client-side season caching

### Phase 3: Advanced Analytics

- [ ] **Player Projections** - Boom/bust calculations
- [ ] **Lineup Optimization** - Perfect/worst lineup analysis
- [ ] **Win Probability** - Excitement scoring with live data
- [ ] **Volatility Metrics** - Consistency and luck calculations

### Phase 4: Production Features

- [ ] **Real-Time Updates** - Live game integration
- [ ] **Historical Backfill** - Previous seasons data
- [ ] **Performance Optimization** - Calculation caching
- [ ] **Mobile Experience** - Responsive design

## 🔮 Future Enhancements

### Advanced Analytics

- **Injury Impact Analysis** - Last-minute lineup changes due to injuries
- **Weather Game Detection** - Games affected by weather conditions
- **Prime Time Boost** - Performance in Monday/Thursday night games
- **Rivalry Matchups** - Head-to-head historical performance
- **Playoff Pressure** - Performance in high-stakes games

### Cross-Season Evolution

- **Record Progression** - How records have evolved over time
- **Era Comparison** - 2024 vs 2025 vs 2026 performance levels
- **Inflation Adjustment** - Scoring environment changes
- **Legacy Points** - Weighting older records differently

### Social Features

- **Record Notifications** - Alert when records are broken
- **Achievement Unlocks** - Gamification of milestones
- **Trash Talk Integration** - Social features around records
- **Record Predictions** - ML models predicting future records

## 📚 Technical Notes

### Data Sources

- **Primary**: Sleeper API (matchups, rosters, players)
- **Secondary**: ESPN/Yahoo for player projections (if needed)
- **Live Data**: Sleeper real-time scoring updates
- **Historical**: Sleeper historical endpoints

### Performance Considerations

- **API Rate Limits**: <1000 calls/minute to Sleeper
- **Cache Strategy**: Season-based with smart expiration
- **Memory Usage**: ~50MB per season of matchup data
- **Calculation Speed**: <2s for full season analysis

### Error Handling

- **Missing Data**: Graceful degradation with placeholders
- **API Failures**: Retry logic with exponential backoff
- **Cache Corruption**: Automatic cache invalidation
- **Network Issues**: Offline mode with stale data

### Testing Strategy

- **Unit Tests**: Individual calculation functions
- **Integration Tests**: End-to-end data flow
- **Performance Tests**: Large dataset calculations
- **User Tests**: Mobile and desktop experiences

---

## 💭 Development Philosophy

**"Records should tell stories, not just display numbers."**

Every Hall of Fame entry should capture a moment in Gauntlet history - the
context, the stakes, the storyline that made it legendary. Whether it's a
0.22-point thriller that decided playoffs or a 35-point blowout that ended a
rivalry, the Hall of Fame preserves these moments for the entire Gauntlet
community.

**Cross-league unity creates legendary status.\*\*** A record that spans all
leagues and seasons carries more weight than a single-league achievement. This
creates a shared Gauntlet identity across all participants.

---

_This document captures the complete vision for Gauntlet Hall of Fame & Shame as
of January 2025. Implementation to resume in Q2 2025._
