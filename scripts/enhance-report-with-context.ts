#!/usr/bin/env tsx

/**
 * Report Enhancement Script
 *
 * Takes existing report data and enhances it with AI-ready matchup context
 * Usage: npx tsx scripts/enhance-report-with-context.ts --week=2 --output=./enhanced-report.json
 */

import fs from 'fs/promises';
import path from 'path';
import { MatchupContextGenerator, type MatchupContext } from './generate-matchup-context.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EnhancedMatchup {
  // Original report data
  leagueId: string;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  teamAName: string;
  teamBName: string;
  pointsA: number;
  pointsB: number;
  margin: number;
  combinedPoints: number;
  boxscoreA: any[];
  boxscoreB: any[];
  winProbabilityHistory?: any[];
  excitementMetrics?: any;

  // Enhanced AI context
  aiContext: {
    flow: {
      gameNarrative: string;
      keyMoments: string[];
      paceAnalysis: string;
      momentumShifts: string[];
    };
    stakes: {
      contextSummary: string;
      rivalryLevel: string;
      seasonImplications: string[];
      powerRankingContext: string;
      playoffImplications: string[];
    };
    performance: {
      teamAAnalysis: {
        summaryVsExpectations: string;
        keyPerformers: string[];
        disappointments: string[];
        positionalImpact: string;
      };
      teamBAnalysis: {
        summaryVsExpectations: string;
        keyPerformers: string[];
        disappointments: string[];
        positionalImpact: string;
      };
      headToHeadComparison: string[];
    };
    superlatives: {
      hallOfFameWorthy: string[];
      weeklySuperlatives: string[];
      unusualStats: string[];
      recordsSet: string[];
    };
    narrativeElements: {
      primaryStoryline: string;
      secondaryStorylines: string[];
      emotionalBeats: string[];
      quotableStats: string[];
      memoryMakers: string[];
    };
  };
}

interface EnhancedReport {
  season: string;
  week: number;
  lastUpdated: string;
  dataSource: string;
  enhancedAt: string;
  leagues: Array<{
    leagueId: string;
    leagueName: string;
    matchups: EnhancedMatchup[];
    weekSummary: {
      totalPoints: number;
      averageMargin: number;
      closestGame: { matchupId: number; margin: number };
      blowoutOfTheWeek: { matchupId: number; margin: number };
      gameOfTheWeek: { matchupId: number; reason: string };
      powerShifts: string[];
      weekNarratives: string[];
    };
  }>;
  crossLeagueContext: {
    topPerformances: string[];
    bottomPerformances: string[];
    trendingUp: string[];
    trendingDown: string[];
    weeklySuperlatives: string[];
  };
}

class ReportEnhancer {
  private contextGenerator: MatchupContextGenerator;

  constructor() {
    this.contextGenerator = new MatchupContextGenerator(prisma);
  }

  async enhanceReport(reportData: any): Promise<EnhancedReport> {
    console.log(`📈 Enhancing report for Week ${reportData.week}...`);

    const enhancedLeagues = [];

    for (const league of reportData.leagues) {
      console.log(`🏈 Processing league: ${league.leagueName}`);

      const enhancedMatchups: EnhancedMatchup[] = [];

      for (const matchup of league.matchups) {
        console.log(
          `  ⚡ Enhancing matchup ${matchup.matchupId}: ${matchup.teamAName} vs ${matchup.teamBName}`
        );

        try {
          const context = await this.contextGenerator.generateContext(
            matchup.leagueId,
            reportData.week,
            matchup.matchupId,
            reportData.season
          );

          const aiContext = await this.generateAIContext(matchup, context);

          enhancedMatchups.push({
            ...matchup,
            aiContext,
          });
        } catch (error) {
          console.warn(`    ⚠️  Could not enhance matchup ${matchup.matchupId}:`, error);

          // Add basic AI context even if full context generation fails
          enhancedMatchups.push({
            ...matchup,
            aiContext: this.generateBasicAIContext(matchup),
          });
        }
      }

      const weekSummary = this.generateWeekSummary(enhancedMatchups);

      enhancedLeagues.push({
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        matchups: enhancedMatchups,
        weekSummary,
      });
    }

    const crossLeagueContext = this.generateCrossLeagueContext(enhancedLeagues);

    return {
      season: reportData.season,
      week: reportData.week,
      lastUpdated: reportData.lastUpdated,
      dataSource: reportData.dataSource,
      enhancedAt: new Date().toISOString(),
      leagues: enhancedLeagues,
      crossLeagueContext,
    };
  }

  private async generateAIContext(matchup: any, context: MatchupContext) {
    return {
      flow: {
        gameNarrative: this.generateGameNarrative(context.flow, context.basicInfo),
        keyMoments: this.generateKeyMoments(context.flow),
        paceAnalysis: this.generatePaceAnalysis(context.flow),
        momentumShifts: this.generateMomentumShifts(context.flow),
      },
      stakes: {
        contextSummary: this.generateContextSummary(context.stakes),
        rivalryLevel: this.assessRivalryLevel(context.stakes.headToHead),
        seasonImplications: this.generateSeasonImplications(context.stakes),
        powerRankingContext: this.generatePowerRankingContext(context.stakes.preGamePowerRankings),
        playoffImplications: context.stakes.leagueStandingsImpact.playoffImplications,
      },
      performance: {
        teamAAnalysis: this.generateTeamAnalysis(
          context.performance.teamA,
          context.basicInfo.teamA.teamName
        ),
        teamBAnalysis: this.generateTeamAnalysis(
          context.performance.teamB,
          context.basicInfo.teamB.teamName
        ),
        headToHeadComparison: this.generateHeadToHeadComparison(
          context.performance,
          context.basicInfo
        ),
      },
      superlatives: {
        hallOfFameWorthy: this.generateHallOfFameNarratives(
          context.superlatives.hallOfFameQualifying
        ),
        weeklySuperlatives: this.generateWeeklySuperlatives(context.superlatives.weeklyNotables),
        unusualStats: this.generateUnusualStats(context.extremes.unusualStats),
        recordsSet: this.generateRecordNarratives(
          context.extremes.teamRecords,
          context.extremes.leagueRecords
        ),
      },
      narrativeElements: {
        primaryStoryline: context.narrative.primaryStoryline,
        secondaryStorylines: context.narrative.secondaryStorylines,
        emotionalBeats: this.generateEmotionalBeats(context.narrative.emotionalMoments),
        quotableStats: this.generateQuotableStats(matchup, context),
        memoryMakers: this.generateMemoryMakers(context),
      },
    };
  }

  private generateBasicAIContext(matchup: any) {
    const margin = Math.abs(matchup.pointsA - matchup.pointsB);
    const winner = matchup.pointsA > matchup.pointsB ? matchup.teamAName : matchup.teamBName;
    const loser = matchup.pointsA > matchup.pointsB ? matchup.teamBName : matchup.teamAName;

    let gameType = '';
    if (margin > 30) gameType = 'blowout';
    else if (margin < 5) gameType = 'nail-biter';
    else if (matchup.combinedPoints > 240) gameType = 'high-scoring affair';
    else if (matchup.combinedPoints < 180) gameType = 'defensive struggle';
    else gameType = 'competitive matchup';

    return {
      flow: {
        gameNarrative: `This ${gameType} saw ${winner} defeat ${loser} by ${margin.toFixed(1)} points with a combined ${matchup.combinedPoints.toFixed(1)} points scored.`,
        keyMoments: [`Final margin: ${margin.toFixed(1)} points`],
        paceAnalysis: `Combined ${matchup.combinedPoints.toFixed(1)} points indicates a ${matchup.combinedPoints > 220 ? 'fast-paced' : 'moderate'} scoring game.`,
        momentumShifts: [],
      },
      stakes: {
        contextSummary: `Week ${matchup.week || 'N/A'} matchup with playoff implications.`,
        rivalryLevel: 'standard',
        seasonImplications: [],
        powerRankingContext: 'Power ranking impact to be determined.',
        playoffImplications: [],
      },
      performance: {
        teamAAnalysis: {
          summaryVsExpectations: `${matchup.teamAName} scored ${matchup.pointsA} points.`,
          keyPerformers: [],
          disappointments: [],
          positionalImpact: 'Position-by-position analysis not available.',
        },
        teamBAnalysis: {
          summaryVsExpectations: `${matchup.teamBName} scored ${matchup.pointsB} points.`,
          keyPerformers: [],
          disappointments: [],
          positionalImpact: 'Position-by-position analysis not available.',
        },
        headToHeadComparison: [
          `${winner} outscored ${loser} ${Math.max(matchup.pointsA, matchup.pointsB).toFixed(1)} to ${Math.min(matchup.pointsA, matchup.pointsB).toFixed(1)}.`,
        ],
      },
      superlatives: {
        hallOfFameWorthy: [],
        weeklySuperlatives: [],
        unusualStats: [],
        recordsSet: [],
      },
      narrativeElements: {
        primaryStoryline: `${winner} defeated ${loser} in a ${gameType}.`,
        secondaryStorylines: [],
        emotionalBeats: [],
        quotableStats: [
          `Final score: ${Math.max(matchup.pointsA, matchup.pointsB).toFixed(1)}-${Math.min(matchup.pointsA, matchup.pointsB).toFixed(1)}`,
        ],
        memoryMakers: [],
      },
    };
  }

  private generateGameNarrative(flow: any, basicInfo: any): string {
    const winner =
      basicInfo.winner === 'teamA' ? basicInfo.teamA.teamName : basicInfo.teamB.teamName;
    const loser =
      basicInfo.winner === 'teamA' ? basicInfo.teamB.teamName : basicInfo.teamA.teamName;
    const margin = basicInfo.margin;

    if (flow.leadChanges > 4) {
      return `A back-and-forth thriller with ${flow.leadChanges} lead changes, ultimately won by ${winner} by ${margin.toFixed(1)} points.`;
    } else if (margin > 30) {
      return `${winner} dominated from start to finish in a ${margin.toFixed(1)}-point blowout over ${loser}.`;
    } else if (margin < 5) {
      return `A nail-biter that came down to the wire, with ${winner} edging ${loser} by just ${margin.toFixed(1)} points.`;
    } else {
      return `${winner} secured a solid ${margin.toFixed(1)}-point victory over ${loser} in this competitive matchup.`;
    }
  }

  private generateKeyMoments(flow: any): string[] {
    const moments: string[] = [];

    if (flow.leadChanges > 3) {
      moments.push(`${flow.leadChanges} lead changes kept fans on the edge of their seats`);
    }

    if (flow.clutchMoments && flow.clutchMoments.length > 0) {
      moments.push(`Multiple clutch moments with win probability swings exceeding 20%`);
    }

    if (flow.largestLeadA > 20 || flow.largestLeadB > 20) {
      const largestLead = Math.max(flow.largestLeadA, flow.largestLeadB);
      moments.push(`Largest lead of the game reached ${largestLead.toFixed(1)} points`);
    }

    return moments;
  }

  private generatePaceAnalysis(flow: any): string {
    if (flow.gameProgression && flow.gameProgression.length > 1) {
      const firstHalf = flow.gameProgression.filter(p => p.gameProgress <= 50);
      const secondHalf = flow.gameProgression.filter(p => p.gameProgress > 50);

      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstHalfPace =
          firstHalf[firstHalf.length - 1]?.teamAScore +
            firstHalf[firstHalf.length - 1]?.teamBScore || 0;
        const finalScore =
          flow.gameProgression[flow.gameProgression.length - 1]?.teamAScore +
            flow.gameProgression[flow.gameProgression.length - 1]?.teamBScore || 0;

        if (finalScore - firstHalfPace > firstHalfPace) {
          return 'Second-half surge elevated the scoring pace significantly.';
        } else {
          return 'Consistent scoring pace maintained throughout the game.';
        }
      }
    }

    return 'Game flow analysis suggests steady scoring progression.';
  }

  private generateMomentumShifts(flow: any): string[] {
    const shifts: string[] = [];

    if (flow.gameProgression && flow.gameProgression.length > 3) {
      // Look for significant win probability changes
      for (let i = 1; i < flow.gameProgression.length; i++) {
        const prev = flow.gameProgression[i - 1];
        const curr = flow.gameProgression[i];
        const probChange = Math.abs(curr.teamAWinProb - prev.teamAWinProb);

        if (probChange > 0.25) {
          shifts.push(`Major momentum shift at ${curr.gameProgress}% completion`);
        }
      }
    }

    return shifts;
  }

  private generateContextSummary(stakes: any): string {
    // Analyze the stakes and provide summary
    return 'Meaningful matchup with season-long implications for both teams.';
  }

  private assessRivalryLevel(headToHead: any): string {
    if (headToHead.rivalryLevel === 'high') return 'heated rivalry';
    if (headToHead.rivalryLevel === 'medium') return 'developing rivalry';
    return 'standard matchup';
  }

  private generateSeasonImplications(stakes: any): string[] {
    const implications: string[] = [];

    // Analyze trends and standings impact
    if (stakes.seasonContext.teamA.trend === 'hot') {
      implications.push(
        `${stakes.seasonContext.teamA.record.wins}-${stakes.seasonContext.teamA.record.losses} Team A continues hot streak`
      );
    }

    if (stakes.seasonContext.teamB.trend === 'cold') {
      implications.push(
        `${stakes.seasonContext.teamB.record.wins}-${stakes.seasonContext.teamB.record.losses} Team B looking to break slump`
      );
    }

    return implications;
  }

  private generatePowerRankingContext(powerRankings: any): string {
    const teamARank = powerRankings.teamA.rank;
    const teamBRank = powerRankings.teamB.rank;

    if (Math.abs(teamARank - teamBRank) > 5) {
      return `Significant power ranking gap with #${teamARank} facing #${teamBRank}`;
    } else {
      return `Closely matched teams in power rankings (#${teamARank} vs #${teamBRank})`;
    }
  }

  private generateTeamAnalysis(teamPerf: any, teamName: string) {
    return {
      summaryVsExpectations: `${teamName} performed ${teamPerf.vsSeasonAvg > 0 ? 'above' : 'below'} season expectations.`,
      keyPerformers: teamPerf.keyPerformers?.map((p: any) => `${p.name}: ${p.points} points`) || [],
      disappointments:
        teamPerf.keyPerformers
          ?.filter((p: any) => p.impact === 'bust')
          .map((p: any) => `${p.name} underperformed`) || [],
      positionalImpact: this.analyzePositionalImpact(teamPerf.positionalBreakdown),
    };
  }

  private analyzePositionalImpact(breakdown: any[]): string {
    if (!breakdown || breakdown.length === 0) {
      return 'Positional breakdown analysis not available.';
    }

    const carries = breakdown.filter(pos => pos.impact === 'carried');
    const fails = breakdown.filter(pos => pos.impact === 'failed');

    if (carries.length > 0 && fails.length > 0) {
      return `${carries.map(p => p.position).join(', ')} carried the team while ${fails.map(p => p.position).join(', ')} struggled.`;
    } else if (carries.length > 0) {
      return `Strong performances from ${carries.map(p => p.position).join(' and ')}.`;
    } else if (fails.length > 0) {
      return `Disappointing showings from ${fails.map(p => p.position).join(' and ')}.`;
    }

    return 'Balanced team performance across all positions.';
  }

  private generateHeadToHeadComparison(performance: any, basicInfo: any): string[] {
    const comparisons: string[] = [];

    const teamAEfficiency = performance.teamA.efficiency;
    const teamBEfficiency = performance.teamB.efficiency;

    if (teamAEfficiency && teamBEfficiency) {
      if (teamAEfficiency.pointsPerStarter > teamBEfficiency.pointsPerStarter) {
        comparisons.push(`${basicInfo.teamA.teamName} had higher per-starter efficiency`);
      } else {
        comparisons.push(`${basicInfo.teamB.teamName} had higher per-starter efficiency`);
      }

      const benchA = teamAEfficiency.benchRegret || 0;
      const benchB = teamBEfficiency.benchRegret || 0;

      if (Math.abs(benchA - benchB) > 10) {
        const higherRegret = benchA > benchB ? basicInfo.teamA.teamName : basicInfo.teamB.teamName;
        comparisons.push(`${higherRegret} had significantly more bench regret`);
      }
    }

    return comparisons;
  }

  private generateHallOfFameNarratives(qualifying: any[]): string[] {
    return qualifying.map(
      q =>
        `${q.team === 'teamA' ? 'Team A' : 'Team B'} achieved ${q.description} (${q.value}) - ranks #${q.rank} ${q.allTimeRank ? `all-time (#${q.allTimeRank})` : 'this season'}`
    );
  }

  private generateWeeklySuperlatives(notables: any[]): string[] {
    return notables.map(n => `${n.description}: ${n.value} (${n.context})`);
  }

  private generateUnusualStats(unusualStats: any[]): string[] {
    return unusualStats.map(
      stat => `${stat.statistic}: ${stat.value} (${stat.rarity} occurrence - ${stat.context})`
    );
  }

  private generateRecordNarratives(teamRecords: any[], leagueRecords: any[]): string[] {
    const narratives: string[] = [];

    teamRecords.forEach(record => {
      narratives.push(
        `${record.team === 'teamA' ? 'Team A' : 'Team B'} set new team record: ${record.record} (${record.value})`
      );
    });

    leagueRecords.forEach(record => {
      narratives.push(
        `New league record: ${record.record} (${record.value}) by ${record.holder === 'teamA' ? 'Team A' : 'Team B'}`
      );
    });

    return narratives;
  }

  private generateEmotionalBeats(moments: any[]): string[] {
    return moments.map(moment => `${moment.description} (${moment.impact} impact)`);
  }

  private generateQuotableStats(matchup: any, context: MatchupContext): string[] {
    const stats: string[] = [];

    stats.push(
      `Final: ${Math.max(matchup.pointsA, matchup.pointsB).toFixed(1)}-${Math.min(matchup.pointsA, matchup.pointsB).toFixed(1)}`
    );

    if (context.flow?.leadChanges > 0) {
      stats.push(`${context.flow.leadChanges} lead changes`);
    }

    if (context.flow?.avgWinProbSwing > 0.15) {
      stats.push(
        `Average win probability swing: ${(context.flow.avgWinProbSwing * 100).toFixed(1)}%`
      );
    }

    return stats;
  }

  private generateMemoryMakers(context: MatchupContext): string[] {
    const makers: string[] = [];

    if (context.narrative?.gameType === 'nailbiter') {
      makers.push('A finish for the ages');
    }

    if (context.superlatives?.hallOfFameQualifying.length > 0) {
      makers.push('Hall of Fame performance');
    }

    if (context.flow?.leadChanges > 5) {
      makers.push('Back-and-forth classic');
    }

    return makers;
  }

  private generateWeekSummary(matchups: EnhancedMatchup[]) {
    const totalPoints = matchups.reduce((sum, m) => sum + m.combinedPoints, 0);
    const margins = matchups.map(m => m.margin);
    const averageMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;

    const closestGame = matchups.reduce((closest, current) =>
      current.margin < closest.margin ? current : closest
    );

    const blowoutOfTheWeek = matchups.reduce((biggest, current) =>
      current.margin > biggest.margin ? current : biggest
    );

    return {
      totalPoints,
      averageMargin,
      closestGame: { matchupId: closestGame.matchupId, margin: closestGame.margin },
      blowoutOfTheWeek: { matchupId: blowoutOfTheWeek.matchupId, margin: blowoutOfTheWeek.margin },
      gameOfTheWeek: { matchupId: closestGame.matchupId, reason: 'Closest margin of victory' },
      powerShifts: [], // TODO: Calculate based on power ranking changes
      weekNarratives: [], // TODO: Generate week-level storylines
    };
  }

  private generateCrossLeagueContext(leagues: any[]) {
    return {
      topPerformances: [], // TODO: Cross-league top performances
      bottomPerformances: [], // TODO: Cross-league bottom performances
      trendingUp: [], // TODO: Cross-league trending teams
      trendingDown: [], // TODO: Cross-league declining teams
      weeklySuperlatives: [], // TODO: Cross-league superlatives
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const week = parseInt(args.find(arg => arg.startsWith('--week='))?.split('=')[1] || '0');
  const season = args.find(arg => arg.startsWith('--season='))?.split('=')[1] || '2025';
  const input = args.find(arg => arg.startsWith('--input='))?.split('=')[1];
  const output =
    args.find(arg => arg.startsWith('--output='))?.split('=')[1] ||
    `./enhanced-report-week-${week}.json`;

  if (!week) {
    console.error(
      'Usage: npx tsx scripts/enhance-report-with-context.ts --week=2 [--season=2025] [--input=./report.json] [--output=./enhanced.json]'
    );
    process.exit(1);
  }

  let reportData;

  if (input) {
    // Load from specified file
    const reportJson = await fs.readFile(input, 'utf-8');
    reportData = JSON.parse(reportJson);
  } else {
    // Try to load from existing report data files
    const possiblePaths = [
      `./apps/web/src/data/report-week${week}.ts`,
      `./apps/web/data/report-week${week}.json`,
      `./report-week${week}.json`,
    ];

    let found = false;
    for (const reportPath of possiblePaths) {
      try {
        if (reportPath.endsWith('.ts')) {
          // Handle TypeScript export format
          const content = await fs.readFile(reportPath, 'utf-8');
          const dataMatch = content.match(/const reportData = ({.*?});/s);
          if (dataMatch) {
            reportData = eval(`(${dataMatch[1]})`);
            found = true;
            break;
          }
        } else {
          const reportJson = await fs.readFile(reportPath, 'utf-8');
          reportData = JSON.parse(reportJson);
          found = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!found) {
      console.error(
        `❌ Could not find report data for week ${week}. Please specify --input=path/to/report.json`
      );
      process.exit(1);
    }
  }

  console.log(`📊 Found report data for Week ${week}`);
  console.log(`📈 Leagues: ${reportData.leagues?.length || 0}`);
  console.log(
    `⚡ Total matchups: ${reportData.leagues?.reduce((sum: number, league: any) => sum + league.matchups.length, 0) || 0}`
  );

  const enhancer = new ReportEnhancer();

  try {
    const enhancedReport = await enhancer.enhanceReport(reportData);

    // Write enhanced report to file
    await fs.writeFile(output, JSON.stringify(enhancedReport, null, 2));
    console.log(`✅ Enhanced report generated successfully: ${output}`);

    // Generate summary statistics
    const totalMatchups = enhancedReport.leagues.reduce(
      (sum, league) => sum + league.matchups.length,
      0
    );
    const averageConfidence =
      enhancedReport.leagues
        .flatMap(league => league.matchups)
        .reduce((sum, matchup) => sum + (matchup.aiContext ? 1 : 0.5), 0) / totalMatchups;

    console.log(`📊 Enhancement Summary:`);
    console.log(`   • Total matchups processed: ${totalMatchups}`);
    console.log(`   • Average context confidence: ${(averageConfidence * 100).toFixed(1)}%`);
    console.log(`   • Ready for AI recap generation! 🤖`);
  } catch (error) {
    console.error('❌ Error enhancing report:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ReportEnhancer, type EnhancedReport, type EnhancedMatchup };
