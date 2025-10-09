/**
 * Simplified Weekly Recap Generator
 *
 * No LangGraph orchestration - just clean, straightforward TypeScript.
 *
 * Flow:
 * 1. Fetch all data in parallel
 * 2. Generate narratives in parallel (where possible)
 * 3. Combine into JSON blob
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from './gemini-client';
import {
  calculateTopPositionPerformersEnhanced,
  checkAllHistoricalRecordsTool,
  fetchLeagueOverviewTool,
  fetchMatchupDataTool,
  fetchPowerRankingsTool,
  fetchStandingsTool,
} from './tools';
import {
  CLOSING_COMMENTARY_PROMPT,
  HALL_OF_FAME_PROMPT,
  HALL_OF_SHAME_PROMPT,
  LEAGUE_OVERVIEW_PROMPT,
  MATCHUP_NARRATIVE_PROMPT,
  POWER_RANKINGS_PROMPT,
  STANDINGS_PROMPT,
} from './prompts';

export interface WeeklyRecapReport {
  week: number;
  season: number;
  generatedAt: string;
  leagueOverview: string;
  hallOfFame: string;
  hallOfShame: string;
  powerRankings: string;
  standings: string;
  matchupNarratives: Array<{
    matchupId: string;
    league: string;
    narrative: string;
  }>;
  closing: string;
  errors: string[];
}

/**
 * Helper: Extract text from Gemini response
 */
const extractText = (response: any): string => {
  if (typeof response.content === 'string') {
    return response.content;
  }
  if (Array.isArray(response.content)) {
    return response.content
      .map((item: any) => (typeof item === 'string' ? item : 'text' in item ? item.text : ''))
      .join('');
  }
  return '';
};

/**
 * Helper: Generate a narrative using Gemini
 */
const generateNarrative = async (prompt: string): Promise<string> => {
  const client = createGeminiClient();
  const response = await client.invoke([new HumanMessage({ content: prompt })]);
  return extractText(response);
};

/**
 * Generate League Overview narrative
 */
const generateLeagueOverview = async (week: number): Promise<string> => {
  console.log('📊 Generating league overview...');

  const data = await fetchLeagueOverviewTool.execute({ week });

  const context = `
Week ${week} League Overview Data:

## Overall Scoring
- Total Points: ${data.totalPoints.toFixed(2)}
- Average per Team: ${data.averagePoints.toFixed(2)}
- Highest Score: ${data.highestScore.toFixed(2)} (${data.highestScorer})
- Lowest Score: ${data.lowestScore.toFixed(2)} (${data.lowestScorer})

## Game Distribution
- Close Games (≤10 pts): ${data.closeGames}
- Blowouts (>20 pts): ${data.blowouts}
- Closest Matchup: ${data.closestMatchup.winner} def. ${data.closestMatchup.loser}, ${data.closestMatchup.margin.toFixed(2)} pts
- Biggest Blowout: ${data.biggestBlowout.winner} def. ${data.biggestBlowout.loser}, ${data.biggestBlowout.margin.toFixed(2)} pts

${LEAGUE_OVERVIEW_PROMPT}`;

  return generateNarrative(context);
};

/**
 * Generate Hall of Fame narrative
 */
const generateHallOfFame = async (week: number): Promise<string> => {
  console.log('🏆 Generating Hall of Fame...');

  const [records, topPerformers] = await Promise.all([
    checkAllHistoricalRecordsTool.execute({ week }),
    calculateTopPositionPerformersEnhanced.execute({ week }),
  ]);

  // Separate team vs matchup records
  const newRecords = records.recordBreakdowns.filter(r => r.isRecord);
  const top10 = records.recordBreakdowns.filter(r => r.isTopTen && !r.isRecord);

  // Team/manager records (individual achievements)
  const teamRecords = newRecords.filter(r => r.group === 'weekly_team');
  const teamTop10 = top10.filter(r => r.group === 'weekly_team');

  // Matchup records (combined scores from both teams)
  const matchupRecords = newRecords.filter(r => r.group === 'weekly_matchup');
  const matchupTop10 = top10.filter(r => r.group === 'weekly_matchup');

  const teamRecordsText =
    teamRecords.length > 0
      ? teamRecords
          .map(
            r =>
              `- **${r.categoryName}** (#${r.weekRank}): ${r.weekValue} (${r.manager}, ${r.league})`,
          )
          .join('\n')
      : 'No new individual/team records this week.';

  const teamTop10Text =
    teamTop10.length > 0
      ? teamTop10
          .slice(0, 5)
          .map(
            r =>
              `- **${r.categoryName}** (#${r.weekRank}): ${r.weekValue} (${r.manager}, ${r.league})`,
          )
          .join('\n')
      : '';

  const matchupRecordsText =
    matchupRecords.length > 0
      ? matchupRecords
          .map(
            r =>
              `- **${r.categoryName}** (#${r.weekRank}): ${r.weekValue} (Matchup featuring ${r.manager}, ${r.league})`,
          )
          .join('\n')
      : '';

  const matchupTop10Text =
    matchupTop10.length > 0
      ? matchupTop10
          .slice(0, 3)
          .map(
            r =>
              `- **${r.categoryName}** (#${r.weekRank}): ${r.weekValue} (Matchup featuring ${r.manager}, ${r.league})`,
          )
          .join('\n')
      : '';

  // Build top performers section
  const buildPositionList = (position: string) => {
    const performers = topPerformers[position] || [];
    if (performers.length === 0) return 'No standout performances';

    return performers
      .slice(0, 5)
      .map((p, i) => {
        const ownershipText = p.ownership
          .map(o => `\n   ${o.league}: ${o.manager} (${o.teamName}) - ${o.status}`)
          .join('');
        return `${i + 1}. ${p.playerName} - ${p.points.toFixed(1)} pts${ownershipText}`;
      })
      .join('\n');
  };

  const context = `
Week ${week} Hall of Fame Data:

## New Individual/Team All-Time Records
${teamRecordsText}

${matchupRecordsText ? `## New Matchup-Level All-Time Records\n${matchupRecordsText}\n` : ''}

## Top 10 Individual/Team Performances
${teamTop10Text}

${matchupTop10Text ? `## Top 10 Matchup-Level Performances\n${matchupTop10Text}\n` : ''}

## Top Position Performers

### Quarterbacks
${buildPositionList('QB')}

### Running Backs
${buildPositionList('RB')}

### Wide Receivers
${buildPositionList('WR')}

### Tight Ends
${buildPositionList('TE')}

### Kickers
${buildPositionList('K')}

### Defenses
${buildPositionList('DEF')}

${HALL_OF_FAME_PROMPT}`;

  return generateNarrative(context);
};

/**
 * Generate Hall of Shame narrative
 */
const generateHallOfShame = async (week: number): Promise<string> => {
  console.log('💀 Generating Hall of Shame...');

  // Import the comprehensive Hall of Shame tool
  const { fetchHallOfShameTool } = await import('./tools/hall-of-shame');
  const data = await fetchHallOfShameTool.execute({ week });

  // Build comprehensive data context
  const context = `
Week ${week} Hall of Shame Data:

## Worst Scoring Teams (Bottom ${data.worstTeams.length})
${data.worstTeams
  .map(
    t => `${t.rank}. ${t.manager} (${t.teamName}) - ${t.totalScore.toFixed(2)} pts [${t.league}]`,
  )
  .join('\n')}

## Biggest Busts League-Wide (Top ${data.biggestBusts.length} Projection Misses)
${data.biggestBusts
  .map(p => {
    const ownersText = p.ownedBy
      .map(o => `${o.manager} [${o.league}]${o.started ? ' - STARTED' : ' - benched'}`)
      .join(', ');
    return `- ${p.playerName} (${p.position}): Projected ${p.projected.toFixed(1)}, delivered ${p.actual.toFixed(1)} (missed by ${Math.abs(p.diff).toFixed(1)} pts)
  Affected: ${ownersText}`;
  })
  .join('\n\n')}

## Summary
- Total Teams Analyzed: ${data.totalTeamsAnalyzed}
- Total Bust Candidates Found: ${data.totalPlayersAnalyzed}

${HALL_OF_SHAME_PROMPT}`;

  return generateNarrative(context);
};

/**
 * Generate Power Rankings narrative
 */
const generatePowerRankings = async (week: number): Promise<string> => {
  console.log('📊 Generating power rankings...');

  const data = await fetchPowerRankingsTool.execute({ currentWeek: week });

  if (!data.changes.tiers || data.changes.tiers.length === 0) {
    return 'Power rankings are currently being calculated. Check back soon!';
  }

  const tiersText = data.changes.tiers
    .map(tier => {
      const teamsText = tier.teams
        .map(team => {
          const movement =
            team.movement > 0
              ? `↑${team.movement}`
              : team.movement < 0
                ? `↓${Math.abs(team.movement)}`
                : '—';
          return `#${team.rank} ${movement} ${team.ownerName} (${team.teamName}) - ${team.record} - ${team.pointsFor.toFixed(1)} PF - ${team.league}`;
        })
        .join('\n');

      return `### ${tier.label} (${tier.teamCount} teams, scores: ${tier.scoreRange.min.toFixed(1)}-${tier.scoreRange.max.toFixed(1)}, avg: ${tier.avgScore.toFixed(1)})
${teamsText}`;
    })
    .join('\n\n');

  const riserText = data.changes.biggestRiser
    ? `${data.changes.biggestRiser.ownerName} (${data.changes.biggestRiser.teamName}) - Moved from #${data.changes.biggestRiser.previousRank} to #${data.changes.biggestRiser.rank} (↑${data.changes.biggestRiser.movement})`
    : 'None';

  const fallerText = data.changes.biggestFaller
    ? `${data.changes.biggestFaller.ownerName} (${data.changes.biggestFaller.teamName}) - Moved from #${data.changes.biggestFaller.previousRank} to #${data.changes.biggestFaller.rank} (↓${Math.abs(data.changes.biggestFaller.movement)})`
    : 'None';

  const notableText = data.changes.notableChanges
    .map(
      team =>
        `- ${team.ownerName} (${team.teamName}): #${team.previousRank} → #${team.rank} (${team.movement > 0 ? `↑${team.movement}` : `↓${Math.abs(team.movement)}`})`,
    )
    .join('\n');

  const context = `
Week ${week} Power Rankings Data:

## Tier Structure (${data.changes.tiers.length} tiers)

${tiersText}

## Notable Changes

### Biggest Riser
${riserText}

### Biggest Faller
${fallerText}

### Other Notable Changes (moved 3+ spots)
${notableText}

${POWER_RANKINGS_PROMPT}

**IMPORTANT**: Cover ALL tiers in your narrative, not just the top!`;

  return generateNarrative(context);
};

/**
 * Generate Standings narrative
 */
const generateStandings = async (week: number): Promise<string> => {
  console.log('📋 Generating standings...');

  const data = await fetchStandingsTool.execute({ week });

  const buildStandingsText = (standings: typeof data.afc) => {
    const teams = standings.allTeams;
    const playoffTeams = teams.filter(t => t.playoffSeed);
    const otherTeams = teams.filter(t => !t.playoffSeed);

    const playoffText = playoffTeams
      .map(
        t =>
          `[${t.playoffSeed}] ${t.ownerName} (${t.teamName}) - ${t.wins}-${t.losses}${t.ties > 0 ? `-${t.ties}` : ''} - ${t.pointsFor.toFixed(2)} PF`,
      )
      .join('\n');

    const otherText = otherTeams
      .map(
        t =>
          `${t.ownerName} (${t.teamName}) - ${t.wins}-${t.losses}${t.ties > 0 ? `-${t.ties}` : ''} - ${t.pointsFor.toFixed(2)} PF`,
      )
      .join('\n');

    return `### Playoff Teams\n${playoffText}\n\n### Other Teams\n${otherText}`;
  };

  const context = `
Week ${week} Standings Data:

## AFC Standings
${buildStandingsText(data.afc)}

## NFC Standings
${buildStandingsText(data.nfc)}

${STANDINGS_PROMPT}`;

  return generateNarrative(context);
};

/**
 * Generate all matchup narratives
 */
const generateMatchupNarratives = async (
  week: number,
): Promise<WeeklyRecapReport['matchupNarratives']> => {
  console.log('🎬 Generating matchup narratives...');

  const data = await fetchMatchupDataTool.execute({ week });
  const narratives: WeeklyRecapReport['matchupNarratives'] = [];

  for (const matchup of data.matchups) {
    try {
      // Build player lists with game timing
      const team1Players =
        matchup.team1.topPerformers.length > 0
          ? matchup.team1.topPerformers
              .map(
                p =>
                  `- ${p.playerName} (${p.position}): ${p.points.toFixed(2)} pts${p.gameWindow ? ` [${p.gameWindow}]` : ''}`,
              )
              .join('\n')
          : 'No player data available';

      const team2Players =
        matchup.team2.topPerformers.length > 0
          ? matchup.team2.topPerformers
              .map(
                p =>
                  `- ${p.playerName} (${p.position}): ${p.points.toFixed(2)} pts${p.gameWindow ? ` [${p.gameWindow}]` : ''}`,
              )
              .join('\n')
          : 'No player data available';

      // Calculate total points to help with tone
      const totalPoints = matchup.team1.score + matchup.team2.score;
      const scoreContext =
        totalPoints > 220
          ? 'High-scoring affair'
          : totalPoints < 160
            ? 'Low-scoring slugfest'
            : 'Moderate scoring';

      const context = `
Week ${week} Matchup: ${matchup.league} Matchup ${matchup.matchupId}

## Teams & Records
${matchup.team1.teamName} (${matchup.team1.ownerName}) - Record: ${matchup.team1.record}
${matchup.team2.teamName} (${matchup.team2.ownerName}) - Record: ${matchup.team2.record}

## Final Score
${matchup.team1.teamName}: ${matchup.team1.score.toFixed(2)}
${matchup.team2.teamName}: ${matchup.team2.score.toFixed(2)}
Total: ${totalPoints.toFixed(2)} (${scoreContext})

Winner: ${matchup.winner}
Margin: ${matchup.margin.toFixed(2)} points

## ${matchup.team1.ownerName}'s Top 3 Performers
${team1Players}

## ${matchup.team2.ownerName}'s Top 3 Performers
${team2Players}

${MATCHUP_NARRATIVE_PROMPT}

**CRITICAL**: Use ONLY the player names, points, and records listed above. Do NOT make up data. Records shown are ENTERING this week (before this game).`;

      const narrative = await generateNarrative(context);

      narratives.push({
        matchupId: `${matchup.league}-${matchup.matchupId}`,
        league: matchup.league,
        narrative,
      });
    } catch (error) {
      console.error(
        `Failed to generate narrative for ${matchup.league}-${matchup.matchupId}:`,
        error,
      );
      narratives.push({
        matchupId: `${matchup.league}-${matchup.matchupId}`,
        league: matchup.league,
        narrative: 'Unable to generate matchup narrative.',
      });
    }
  }

  return narratives;
};

/**
 * Generate closing commentary
 */
const generateClosing = async (
  week: number,
  sections: {
    leagueOverview: string;
    powerRankings: string;
    standings: string;
  },
): Promise<string> => {
  console.log('📝 Generating closing commentary...');

  const context = `
Week ${week} Recap Sections Summary:

## League Overview
${sections.leagueOverview}

## Power Rankings
${sections.powerRankings}

## Standings
${sections.standings}

${CLOSING_COMMENTARY_PROMPT}

**IMPORTANT**: Keep it under 150 words. Be specific about actual events this week. No made-up names.`;

  return generateNarrative(context);
};

/**
 * Main function: Generate complete weekly recap report
 */
export const generateWeeklyRecap = async (
  week: number,
  season = 2025,
): Promise<WeeklyRecapReport> => {
  console.log(`\n🏈 Generating Weekly Recap - Week ${week}, ${season} Season\n`);

  const errors: string[] = [];
  const startTime = Date.now();

  try {
    // Step 1: Generate all sections in parallel
    const [leagueOverview, hallOfFame, hallOfShame, powerRankings, standings] = await Promise.all([
      generateLeagueOverview(week).catch(err => {
        errors.push(`League Overview: ${err.message}`);
        return 'Unable to generate league overview.';
      }),
      generateHallOfFame(week).catch(err => {
        errors.push(`Hall of Fame: ${err.message}`);
        return 'Unable to generate Hall of Fame.';
      }),
      generateHallOfShame(week).catch(err => {
        errors.push(`Hall of Shame: ${err.message}`);
        return 'Unable to generate Hall of Shame.';
      }),
      generatePowerRankings(week).catch(err => {
        errors.push(`Power Rankings: ${err.message}`);
        return 'Unable to generate power rankings.';
      }),
      generateStandings(week).catch(err => {
        errors.push(`Standings: ${err.message}`);
        return 'Unable to generate standings.';
      }),
    ]);

    // Step 2: Generate matchup narratives (sequential, dependent on previous sections)
    const matchupNarratives = await generateMatchupNarratives(week).catch(err => {
      errors.push(`Matchup Narratives: ${err.message}`);
      return [];
    });

    // Step 3: Generate closing (needs all sections)
    const closing = await generateClosing(week, {
      leagueOverview,
      powerRankings,
      standings,
    }).catch(err => {
      errors.push(`Closing: ${err.message}`);
      return 'Unable to generate closing commentary.';
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Report generated in ${duration}s\n`);

    return {
      week,
      season,
      generatedAt: new Date().toISOString(),
      leagueOverview,
      hallOfFame,
      hallOfShame,
      powerRankings,
      standings,
      matchupNarratives,
      closing,
      errors,
    };
  } catch (error) {
    console.error('Fatal error generating report:', error);
    throw error;
  }
};
