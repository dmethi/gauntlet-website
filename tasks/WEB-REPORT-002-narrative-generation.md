# WEB-REPORT-002: Narrative Generation System

**Task ID**: WEB-REPORT-002  
**Category**: Reports  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: ⏱️ 2 hours

---

## 📋 Overview

Build the narrative generation system that creates human-readable, engaging
matchup recaps and league overviews from validated data.

This task focuses on generating accurate, data-driven narratives WITHOUT
hallucinations or fabricated details.

---

## 🎯 Objective

Create narrative generation functions that:

1. Generate matchup recaps with proper context (scores, top performers,
   disappointments)
2. Identify key storylines (blowouts, upsets, close games)
3. Format player mentions correctly (name + points)
4. Generate league-wide overviews and power ranking narratives
5. NEVER make up data - only use what's provided

**Success Criteria**:

- Narratives accurately reflect the data
- Player names and scores match actual performance
- Tone is engaging but factual
- All narratives are structured for easy auditing
- No fabricated players, scores, or storylines

---

## 📂 Context Needed

### Prerequisites:

- **WEB-REPORT-001** must be complete (data fetcher working)

### Files to Create:

1. `apps/web/src/lib/reports/narrative-writer.ts` - Narrative generation logic
2. `apps/web/src/lib/reports/narrative-templates.ts` - Reusable templates and
   phrases

### Reference Files:

1. `apps/web/src/app/competition/reports/2025/week-4/page.tsx` (lines 50-300) -
   Example narratives
2. `tasks/WEB-REPORT-001-automated-reports-foundation.md` - Data structures

---

## 🔨 Steps

### 1. Create Narrative Types (15 min)

Add to `apps/web/src/lib/reports/types.ts`:

```typescript
/**
 * Narrative structures for auditing
 */

export interface MatchupNarrative {
  matchupId: number;
  leagueId: string;
  title: string;
  recap: string[];
  facts: {
    winner: string;
    loser: string;
    winnerScore: number;
    loserScore: number;
    margin: number;
    topPerformers: string[];
    disappointments: string[];
  };
}

export interface LeagueOverview {
  leagueName: 'AFC' | 'NFC';
  summary: string;
  keyStorylines: string[];
  standingsMovement: string[];
}

export interface PowerRankingNarrative {
  rank: number;
  teamName: string;
  commentary: string;
  trend: 'rising' | 'falling' | 'stable';
}
```

### 2. Create Narrative Templates (30 min)

Create `apps/web/src/lib/reports/narrative-templates.ts`:

**Requirements**:

- Reusable opening phrases for different game types
- Closing phrases for different margins
- Player mention formatters
- Avoid repetitive language

**Template Categories**:

```typescript
export const openings = {
  blowout: [
    '{winner} absolutely dominated {loser} in a {margin}-point shellacking.',
    '{winner} ran away with this one, crushing {loser} by {margin} points.',
  ],
  close: [
    '{winner} survived a nail-biter, edging {loser} by just {margin} points.',
    'In a battle that came down to the wire, {winner} outlasted {loser} by {margin}.',
  ],
  competitive: [
    '{winner} took care of business against {loser}, winning by {margin} points.',
    '{winner} handled {loser} in a solid {margin}-point victory.',
  ],
};

export const closings = {
  blowout: [
    'When your entire lineup shows up, this is what dominance looks like.',
    'A complete team performance from top to bottom.',
  ],
  close: [
    'These are the games that separate contenders from pretenders.',
    'Survival mode activated—and it worked.',
  ],
  competitive: [
    'A professional performance from start to finish.',
    'Exactly the kind of win that builds momentum.',
  ],
};

export const formatPlayer = (name: string, points: number): string => {
  return `${name} (${points.toFixed(1)})`;
};

export const selectRandomTemplate = <T>(templates: T[]): T => {
  return templates[Math.floor(Math.random() * templates.length)];
};
```

### 3. Create Narrative Writer (75 min)

Create `apps/web/src/lib/reports/narrative-writer.ts`:

**Core Functions**:

```typescript
/**
 * Generate a matchup narrative from validated data
 *
 * @param matchup - Complete matchup data with all players
 * @returns Structured narrative with facts for auditing
 */
export const generateMatchupNarrative = (
  matchup: MatchupData
): MatchupNarrative => {
  // Determine winner/loser
  const winner =
    matchup.teamA.points > matchup.teamB.points ? matchup.teamA : matchup.teamB;
  const loser =
    matchup.teamA.points > matchup.teamB.points ? matchup.teamB : matchup.teamA;

  // Classify game type
  const gameType =
    matchup.margin > 30
      ? 'blowout'
      : matchup.margin < 10
        ? 'close'
        : 'competitive';

  // Find top performers (20+ points)
  const winnerTopPerformers = winner.starters
    .filter(p => p.points >= 20)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  const loserTopPerformers = loser.starters
    .filter(p => p.points >= 20)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  // Find disappointments (<10 points for key positions)
  const winnerDisappointments = winner.starters.filter(
    p => p.points < 10 && ['QB', 'RB', 'WR', 'TE'].includes(p.position || '')
  );

  const loserDisappointments = loser.starters.filter(
    p => p.points < 10 && ['QB', 'RB', 'WR', 'TE'].includes(p.position || '')
  );

  // Build narrative paragraphs
  const paragraphs: string[] = [];

  // Opening
  const opening = selectRandomTemplate(openings[gameType])
    .replace('{winner}', winner.ownerName)
    .replace('{loser}', loser.ownerName)
    .replace('{margin}', matchup.margin.toFixed(1));
  paragraphs.push(opening);

  // Winner's top performers
  if (winnerTopPerformers.length > 0) {
    const performerList = winnerTopPerformers
      .map(p => formatPlayer(p.name, p.points))
      .join(', ');
    paragraphs.push(`${winner.ownerName} rode ${performerList} to victory.`);
  }

  // Winner's disappointments (if they still won)
  if (winnerDisappointments.length > 0 && gameType !== 'blowout') {
    const disappointmentList = winnerDisappointments
      .map(p => formatPlayer(p.name, p.points))
      .join(', ');
    paragraphs.push(
      `Even with ${disappointmentList} underperforming, ` +
        `${winner.ownerName} had enough depth to pull through.`
    );
  }

  // Loser's effort
  if (loserTopPerformers.length > 0) {
    const performerList = loserTopPerformers
      .slice(0, 2)
      .map(p => formatPlayer(p.name, p.points))
      .join(' and ');
    paragraphs.push(
      `${loser.ownerName} got solid performances from ${performerList}, ` +
        `but it wasn't enough.`
    );
  }

  // Loser's disappointments
  if (loserDisappointments.length > 0) {
    const disappointmentList = loserDisappointments
      .map(p => formatPlayer(p.name, p.points))
      .join(', ');
    paragraphs.push(`${disappointmentList} left massive holes in the lineup.`);
  }

  // Closing
  const closing = selectRandomTemplate(closings[gameType]);
  paragraphs.push(closing);

  // Build structured narrative with facts
  return {
    matchupId: matchup.matchupId,
    leagueId: matchup.leagueId,
    title: `${winner.teamName} def. ${loser.teamName}`,
    recap: paragraphs,
    facts: {
      winner: winner.ownerName,
      loser: loser.ownerName,
      winnerScore: winner.points,
      loserScore: loser.points,
      margin: matchup.margin,
      topPerformers: [
        ...winnerTopPerformers.map(p => p.name),
        ...loserTopPerformers.map(p => p.name),
      ],
      disappointments: [
        ...winnerDisappointments.map(p => p.name),
        ...loserDisappointments.map(p => p.name),
      ],
    },
  };
};

/**
 * Generate league overview narrative
 */
export const generateLeagueOverview = (
  leagueName: 'AFC' | 'NFC',
  matchups: MatchupData[]
): LeagueOverview => {
  const blowouts = matchups.filter(m => m.margin > 30);
  const closeGames = matchups.filter(m => m.margin < 10);

  // TODO: Implement league overview logic
  // - Identify biggest blowout
  // - Identify closest game
  // - Note any upsets (if we have previous rankings)

  return {
    leagueName,
    summary: `Week overview for ${leagueName}`,
    keyStorylines: [],
    standingsMovement: [],
  };
};

/**
 * Generate power ranking narrative
 */
export const generatePowerRankingsNarrative = (
  ranking: PowerRanking
): PowerRankingNarrative => {
  // TODO: Implement power ranking commentary
  // - Rising teams (improving average)
  // - Falling teams (declining average)
  // - Stable teams (consistent performance)

  return {
    rank: ranking.rank,
    teamName: ranking.teamName,
    commentary: `${ranking.teamName} analysis`,
    trend: 'stable',
  };
};
```

**Key Requirements**:

- ONLY use data from the MatchupData object
- Never fabricate player names or scores
- Keep narratives factual but engaging
- Structure narratives for easy auditing (facts object)

---

## ✅ Acceptance Criteria

### Must Have:

- [ ] `generateMatchupNarrative()` produces accurate recaps
- [ ] All player mentions include actual points from data
- [ ] Winner/loser are correctly identified
- [ ] Top performers and disappointments are data-driven
- [ ] Narratives include structured facts for auditing
- [ ] Templates provide variety without repetition
- [ ] All functions use arrow function syntax
- [ ] Comprehensive JSDoc on all exported functions

### Quality Checks:

- [ ] TypeScript compilation passes with 0 errors
- [ ] No fabricated data (all must come from MatchupData)
- [ ] ESLint passes with 0 errors
- [ ] Code follows CODING_CONVENTIONS.MD patterns

---

## 📊 Estimated Context Usage

- **Files to Read**: 2 (week-4 page for style, data-fetcher for structures)
- **Lines to Process**: ~400 lines total
- **Files to Create**: 2 new files
- **Complexity**: 🟡 Medium (narrative generation logic)

---

## 🔗 Related Tasks

### Blockers:

- **WEB-REPORT-001** (needs data structures)

### Enables:

- **WEB-REPORT-003**: Narrative Auditing & Fact-Checking

### Related:

- **WEB-REPORT-004**: Report Orchestration & Output

---

## 🚀 Cursor Prompt

```
I'm working on WEB-REPORT-002. Please:

1. Read tasks/WEB-REPORT-002-narrative-generation.md
2. Add narrative types to apps/web/src/lib/reports/types.ts
3. Create apps/web/src/lib/reports/narrative-templates.ts with templates
4. Create apps/web/src/lib/reports/narrative-writer.ts with:
   - generateMatchupNarrative() (complete implementation)
   - generateLeagueOverview() (basic implementation)
   - generatePowerRankingsNarrative() (basic implementation)

Focus on generateMatchupNarrative() first - make it complete and accurate.
Test by running against Week 5 data.
```

---

## 🧪 Verification

### Manual Test:

```bash
# Create test script
cat > apps/web/src/scripts/test-narratives.ts << 'EOF'
import { fetchWeeklyReportData } from '@/lib/reports/data-fetcher';
import { generateMatchupNarrative } from '@/lib/reports/narrative-writer';

const data = await fetchWeeklyReportData(5);
const firstMatchup = data.matchups[0];

const narrative = generateMatchupNarrative(firstMatchup);

console.log('Title:', narrative.title);
console.log('\nRecap:');
narrative.recap.forEach(p => console.log(`  ${p}`));
console.log('\nFacts:', narrative.facts);
EOF

# Run test
npx tsx apps/web/src/scripts/test-narratives.ts

# Clean up
rm apps/web/src/scripts/test-narratives.ts
```

### Expected Output:

- Title shows winner def. loser
- Recap has 4-6 paragraphs
- Player names match actual data
- Scores are accurate
- Facts object contains verifiable data

---

## 📝 Notes

### Narrative Quality Guidelines:

- **Be factual**: Only mention what actually happened
- **Be specific**: Use actual names and scores
- **Be varied**: Use templates to avoid repetition
- **Be engaging**: Make it interesting to read
- **Be auditable**: Include facts object for verification

### Common Pitfalls to Avoid:

- ❌ Fabricating player performances
- ❌ Making up storylines not supported by data
- ❌ Using vague language ("some players," "multiple disappointments")
- ❌ Ignoring the facts object (needed for auditing)

### Why Structured Facts Object:

The `facts` object enables WEB-REPORT-003 to audit narratives against actual
data and catch any hallucinations or errors before publication.

---

**Ready to Start?** Complete WEB-REPORT-001 first, then use the Cursor prompt
above! 🚀
