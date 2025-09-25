#!/usr/bin/env tsx

/**
 * Matchup Recap Context Generator
 *
 * Generates comprehensive statistical context for AI-driven matchup recaps
 * Usage: npx tsx scripts/generate-matchup-context.ts --leagueId=123 --week=2 --matchupId=5
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface MatchupContext {
  // Basic matchup info
  basicInfo: {
    leagueId: string;
    leagueName: string;
    week: number;
    season: string;
    matchupId: number;
    teamA: {
      rosterId: number;
      teamName: string;
      owner: string;
      finalScore: number;
    };
    teamB: {
      rosterId: number;
      teamName: string;
      owner: string;
      finalScore: number;
    };
    winner: 'teamA' | 'teamB' | 'tie';
    margin: number;
    combinedPoints: number;
  };

  // Matchup flow analysis
  flow: {
    gameProgression: Array<{
      timestamp: string;
      gameProgress: number;
      teamAScore: number;
      teamBScore: number;
      teamAWinProb: number;
      teamBWinProb: number;
      leader: 'teamA' | 'teamB' | 'tie';
      leadSize: number;
    }>;
    leadChanges: number;
    avgWinProbSwing: number;
    largestLeadA: number;
    largestLeadB: number;
    timeLeading: {
      teamA: number; // percentage of game
      teamB: number;
      tied: number;
    };
    clutchMoments: Array<{
      timestamp: string;
      situation: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  };

  // Stakes and context
  stakes: {
    preGamePowerRankings: {
      teamA: { rank: number; score: number; change: number };
      teamB: { rank: number; score: number; change: number };
    };
    seasonContext: {
      teamA: {
        record: { wins: number; losses: number };
        last3Games: { wins: number; losses: number; avgPoints: number };
        seasonAvg: number;
        trend: 'hot' | 'cold' | 'steady';
        playoffPosition: string;
      };
      teamB: {
        record: { wins: number; losses: number };
        last3Games: { wins: number; losses: number; avgPoints: number };
        seasonAvg: number;
        trend: 'hot' | 'cold' | 'steady';
        playoffPosition: string;
      };
    };
    headToHead: {
      allTimeRecord: { teamAWins: number; teamBWins: number };
      lastMeetingWeek?: number;
      lastMeetingScore?: { teamA: number; teamB: number };
      rivalryLevel: 'high' | 'medium' | 'low';
    };
    leagueStandingsImpact: {
      beforeGame: { teamARank: number; teamBRank: number };
      afterGame: { teamARank: number; teamBRank: number };
      playoffImplications: string[];
    };
  };

  // Performance analysis
  performance: {
    teamA: {
      vsSeasonAvg: number; // percentage above/below
      vsProjRecent: number; // vs recent 3-week average
      efficiency: {
        pointsPerStarter: number;
        benchPoints: number;
        optimalLineupPoints: number;
        benchRegret: number;
      };
      positionalBreakdown: Array<{
        position: string;
        points: number;
        vsLeagueAvg: number;
        impact: 'carried' | 'neutral' | 'failed';
      }>;
      keyPerformers: Array<{
        playerId: string;
        name: string;
        points: number;
        vsProjection: number;
        impact: 'boom' | 'bust' | 'expected';
      }>;
    };
    teamB: {
      // Same structure as teamA
      vsSeasonAvg: number;
      vsProjRecent: number;
      efficiency: {
        pointsPerStarter: number;
        benchPoints: number;
        optimalLineupPoints: number;
        benchRegret: number;
      };
      positionalBreakdown: Array<{
        position: string;
        points: number;
        vsLeagueAvg: number;
        impact: 'carried' | 'neutral' | 'failed';
      }>;
      keyPerformers: Array<{
        playerId: string;
        name: string;
        points: number;
        vsProjection: number;
        impact: 'boom' | 'bust' | 'expected';
      }>;
    };
  };

  // Statistical superlatives
  superlatives: {
    hallOfFameQualifying: Array<{
      category: string;
      description: string;
      value: number;
      team: 'teamA' | 'teamB';
      rank: number;
      allTimeRank?: number;
    }>;
    weeklyNotables: Array<{
      type: 'high' | 'low' | 'unusual';
      description: string;
      value: number;
      context: string;
    }>;
    playerSuperlatives: Array<{
      playerId: string;
      playerName: string;
      achievement: string;
      value: number;
      rank: number;
    }>;
  };

  // Narrative elements
  narrative: {
    gameType: 'blowout' | 'nailbiter' | 'back-and-forth' | 'defensive-struggle' | 'shootout';
    primaryStoryline: string;
    secondaryStorylines: string[];
    emotionalMoments: Array<{
      timestamp: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    seasonImplications: string[];
  };

  // Statistical extremes and records
  extremes: {
    teamRecords: Array<{
      team: 'teamA' | 'teamB';
      record: string;
      value: number;
      previousRecord?: { value: number; holder: string };
    }>;
    leagueRecords: Array<{
      record: string;
      value: number;
      holder: 'teamA' | 'teamB';
      previousRecord?: { value: number; holder: string };
    }>;
    unusualStats: Array<{
      statistic: string;
      value: number;
      rarity: 'rare' | 'very-rare' | 'historic';
      context: string;
    }>;
  };

  // Meta information
  meta: {
    generatedAt: string;
    dataSource: 'database' | 'api';
    confidence: number; // 0-1 score for data completeness
    missingData: string[];
  };
}

class MatchupContextGenerator {
  constructor(private prisma: PrismaClient) {}

  async generateContext(
    leagueId: string,
    week: number,
    matchupId: number,
    season: string = '2025'
  ): Promise<MatchupContext> {
    console.log(`Generating context for matchup ${matchupId} in week ${week}...`);

    // Fetch all required data in parallel
    const [
      matchupData,
      teamStats,
      powerRankings,
      winProbHistory,
      playerStats,
      hallOfFameData,
      leagueStandings,
    ] = await Promise.all([
      this.getMatchupData(leagueId, week, matchupId),
      this.getTeamStats(leagueId, season, week),
      this.getPowerRankings(leagueId, week),
      this.getWinProbHistory(leagueId, week, matchupId),
      this.getPlayerStats(leagueId, week),
      this.getHallOfFameData(leagueId, week),
      this.getLeagueStandings(leagueId, week),
    ]);

    const basicInfo = await this.generateBasicInfo(matchupData);
    const flow = await this.generateFlowAnalysis(winProbHistory, matchupData);
    const stakes = await this.generateStakesAnalysis(
      teamStats,
      powerRankings,
      leagueStandings,
      basicInfo
    );
    const performance = await this.generatePerformanceAnalysis(matchupData, teamStats, playerStats);
    const superlatives = await this.generateSuperlatives(hallOfFameData, matchupData, playerStats);
    const narrative = await this.generateNarrative(basicInfo, flow, stakes, performance);
    const extremes = await this.generateExtremes(matchupData, playerStats, hallOfFameData);

    return {
      basicInfo,
      flow,
      stakes,
      performance,
      superlatives,
      narrative,
      extremes,
      meta: {
        generatedAt: new Date().toISOString(),
        dataSource: 'database',
        confidence: this.calculateConfidence(matchupData, teamStats, winProbHistory),
        missingData: this.identifyMissingData(matchupData, teamStats, winProbHistory),
      },
    };
  }

  private async getMatchupData(leagueId: string, week: number, matchupId: number) {
    // Implementation would fetch from your existing matchup data structure
    // This is a placeholder - you'd integrate with your existing data fetching logic
    return {}; // Placeholder
  }

  private async getTeamStats(leagueId: string, season: string, week: number) {
    // Fetch team seasonal stats, recent performance, trends
    return {}; // Placeholder
  }

  private async getPowerRankings(leagueId: string, week: number) {
    // Fetch current power rankings and recent changes
    return {}; // Placeholder
  }

  private async getWinProbHistory(leagueId: string, week: number, matchupId: number) {
    // Fetch live win probability samples
    return await this.prisma.liveWinProbSample.findMany({
      where: { leagueId, week, matchupId },
      orderBy: { timestamp: 'asc' },
    });
  }

  private async getPlayerStats(leagueId: string, week: number) {
    // Fetch player performance data, projections vs actuals
    return {}; // Placeholder
  }

  private async getHallOfFameData(leagueId: string, week: number) {
    // Fetch any Hall of Fame/Shame qualifying performances
    return await this.prisma.hallOfFameRecord.findMany({
      where: { leagueId, week },
      include: { category: true },
    });
  }

  private async getLeagueStandings(leagueId: string, week: number) {
    // Fetch league standings before and after this week
    return {}; // Placeholder
  }

  private async generateBasicInfo(matchupData: any) {
    // Extract basic matchup information
    return {
      leagueId: '',
      leagueName: '',
      week: 0,
      season: '',
      matchupId: 0,
      teamA: {
        rosterId: 0,
        teamName: '',
        owner: '',
        finalScore: 0,
      },
      teamB: {
        rosterId: 0,
        teamName: '',
        owner: '',
        finalScore: 0,
      },
      winner: 'teamA' as const,
      margin: 0,
      combinedPoints: 0,
    };
  }

  private async generateFlowAnalysis(winProbHistory: any[], matchupData: any) {
    // Analyze game flow from win probability data
    const gameProgression = winProbHistory.map(sample => ({
      timestamp: sample.timestamp,
      gameProgress: sample.gameProgress,
      teamAScore: sample.currentScoreA,
      teamBScore: sample.currentScoreB,
      teamAWinProb: sample.winProbA,
      teamBWinProb: sample.winProbB,
      leader: sample.currentScoreA > sample.currentScoreB ? ('teamA' as const) : ('teamB' as const),
      leadSize: Math.abs(sample.currentScoreA - sample.currentScoreB),
    }));

    // Calculate lead changes
    let leadChanges = 0;
    let currentLeader = null;
    for (const point of gameProgression) {
      if (point.leader !== currentLeader) {
        leadChanges++;
        currentLeader = point.leader;
      }
    }

    return {
      gameProgression,
      leadChanges,
      avgWinProbSwing: this.calculateAvgWinProbSwing(gameProgression),
      largestLeadA: Math.max(...gameProgression.map(p => p.teamAScore - p.teamBScore)),
      largestLeadB: Math.max(...gameProgression.map(p => p.teamBScore - p.teamAScore)),
      timeLeading: this.calculateTimeLeading(gameProgression),
      clutchMoments: this.identifyClutchMoments(gameProgression),
    };
  }

  private async generateStakesAnalysis(
    teamStats: any,
    powerRankings: any,
    leagueStandings: any,
    basicInfo: any
  ) {
    // Analyze the stakes and context of the matchup
    return {
      preGamePowerRankings: {
        teamA: { rank: 0, score: 0, change: 0 },
        teamB: { rank: 0, score: 0, change: 0 },
      },
      seasonContext: {
        teamA: {
          record: { wins: 0, losses: 0 },
          last3Games: { wins: 0, losses: 0, avgPoints: 0 },
          seasonAvg: 0,
          trend: 'steady' as const,
          playoffPosition: '',
        },
        teamB: {
          record: { wins: 0, losses: 0 },
          last3Games: { wins: 0, losses: 0, avgPoints: 0 },
          seasonAvg: 0,
          trend: 'steady' as const,
          playoffPosition: '',
        },
      },
      headToHead: {
        allTimeRecord: { teamAWins: 0, teamBWins: 0 },
        rivalryLevel: 'low' as const,
      },
      leagueStandingsImpact: {
        beforeGame: { teamARank: 0, teamBRank: 0 },
        afterGame: { teamARank: 0, teamBRank: 0 },
        playoffImplications: [],
      },
    };
  }

  private async generatePerformanceAnalysis(matchupData: any, teamStats: any, playerStats: any) {
    // Analyze how teams performed relative to expectations
    return {
      teamA: {
        vsSeasonAvg: 0,
        vsProjRecent: 0,
        efficiency: {
          pointsPerStarter: 0,
          benchPoints: 0,
          optimalLineupPoints: 0,
          benchRegret: 0,
        },
        positionalBreakdown: [],
        keyPerformers: [],
      },
      teamB: {
        vsSeasonAvg: 0,
        vsProjRecent: 0,
        efficiency: {
          pointsPerStarter: 0,
          benchPoints: 0,
          optimalLineupPoints: 0,
          benchRegret: 0,
        },
        positionalBreakdown: [],
        keyPerformers: [],
      },
    };
  }

  private async generateSuperlatives(hallOfFameData: any[], matchupData: any, playerStats: any) {
    // Extract notable achievements and records
    return {
      hallOfFameQualifying: [],
      weeklyNotables: [],
      playerSuperlatives: [],
    };
  }

  private async generateNarrative(basicInfo: any, flow: any, stakes: any, performance: any) {
    // Generate narrative elements based on statistical analysis
    let gameType: 'blowout' | 'nailbiter' | 'back-and-forth' | 'defensive-struggle' | 'shootout';

    if (basicInfo.margin > 30) {
      gameType = 'blowout';
    } else if (basicInfo.margin < 5) {
      gameType = 'nailbiter';
    } else if (flow.leadChanges > 3) {
      gameType = 'back-and-forth';
    } else if (basicInfo.combinedPoints < 180) {
      gameType = 'defensive-struggle';
    } else {
      gameType = 'shootout';
    }

    return {
      gameType,
      primaryStoryline: this.generatePrimaryStoryline(basicInfo, flow, stakes, performance),
      secondaryStorylines: [],
      emotionalMoments: [],
      seasonImplications: [],
    };
  }

  private async generateExtremes(matchupData: any, playerStats: any, hallOfFameData: any[]) {
    // Identify statistical extremes and records
    return {
      teamRecords: [],
      leagueRecords: [],
      unusualStats: [],
    };
  }

  private calculateAvgWinProbSwing(progression: any[]): number {
    if (progression.length < 2) return 0;

    let totalSwing = 0;
    for (let i = 1; i < progression.length; i++) {
      const swing = Math.abs(progression[i].teamAWinProb - progression[i - 1].teamAWinProb);
      totalSwing += swing;
    }

    return totalSwing / (progression.length - 1);
  }

  private calculateTimeLeading(progression: any[]) {
    let teamATime = 0;
    let teamBTime = 0;
    let tiedTime = 0;

    for (const point of progression) {
      if (point.teamAScore > point.teamBScore) {
        teamATime++;
      } else if (point.teamBScore > point.teamAScore) {
        teamBTime++;
      } else {
        tiedTime++;
      }
    }

    const total = progression.length;
    return {
      teamA: (teamATime / total) * 100,
      teamB: (teamBTime / total) * 100,
      tied: (tiedTime / total) * 100,
    };
  }

  private identifyClutchMoments(progression: any[]) {
    // Identify high-leverage moments in the game
    return progression
      .filter(point => {
        const winProbDiff = Math.abs(point.teamAWinProb - point.teamBWinProb);
        return winProbDiff < 0.2 && point.gameProgress > 0.5; // Close game in 2nd half
      })
      .map(point => ({
        timestamp: point.timestamp,
        situation: `Close game (${Math.round(point.teamAWinProb * 100)}% vs ${Math.round(point.teamBWinProb * 100)}%)`,
        impact: 'high' as const,
      }));
  }

  private generatePrimaryStoryline(
    basicInfo: any,
    flow: any,
    stakes: any,
    performance: any
  ): string {
    // Generate the primary narrative based on the data
    return 'Primary storyline generated from statistical analysis';
  }

  private calculateConfidence(matchupData: any, teamStats: any, winProbHistory: any[]): number {
    // Calculate confidence score based on data completeness
    let score = 1.0;

    if (!matchupData || Object.keys(matchupData).length === 0) score -= 0.3;
    if (!teamStats || Object.keys(teamStats).length === 0) score -= 0.2;
    if (!winProbHistory || winProbHistory.length === 0) score -= 0.2;

    return Math.max(0, score);
  }

  private identifyMissingData(matchupData: any, teamStats: any, winProbHistory: any[]): string[] {
    const missing: string[] = [];

    if (!matchupData || Object.keys(matchupData).length === 0) {
      missing.push('matchup-data');
    }
    if (!teamStats || Object.keys(teamStats).length === 0) {
      missing.push('team-stats');
    }
    if (!winProbHistory || winProbHistory.length === 0) {
      missing.push('win-probability-history');
    }

    return missing;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const leagueId = args.find(arg => arg.startsWith('--leagueId='))?.split('=')[1];
  const week = parseInt(args.find(arg => arg.startsWith('--week='))?.split('=')[1] || '0');
  const matchupId = parseInt(
    args.find(arg => arg.startsWith('--matchupId='))?.split('=')[1] || '0'
  );
  const season = args.find(arg => arg.startsWith('--season='))?.split('=')[1] || '2025';
  const output =
    args.find(arg => arg.startsWith('--output='))?.split('=')[1] || './matchup-context.json';

  if (!leagueId || !week || !matchupId) {
    console.error(
      'Usage: npx tsx scripts/generate-matchup-context.ts --leagueId=123 --week=2 --matchupId=5 [--season=2025] [--output=./context.json]'
    );
    process.exit(1);
  }

  const generator = new MatchupContextGenerator(prisma);

  try {
    const context = await generator.generateContext(leagueId, week, matchupId, season);

    // Write to file
    await fs.writeFile(output, JSON.stringify(context, null, 2));
    console.log(`✅ Matchup context generated successfully: ${output}`);
    console.log(`📊 Confidence: ${(context.meta.confidence * 100).toFixed(1)}%`);

    if (context.meta.missingData.length > 0) {
      console.log(`⚠️  Missing data: ${context.meta.missingData.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Error generating matchup context:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MatchupContextGenerator, type MatchupContext };
