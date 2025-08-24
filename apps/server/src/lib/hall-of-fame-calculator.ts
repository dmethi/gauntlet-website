/**
 * Hall of Fame Calculation Engine
 * Computes all weekly team-based stats for Hall of Fame and Shame records
 */

import { PrismaClient, Matchup, MatchupSummary, RosterWeekAggregate } from '@prisma/client';

const prisma = new PrismaClient();

// Result interface for calculated stats
export interface HallOfFameCalculationResult {
  categoryName: string;
  rosterId: number;
  week: number;
  season: string;
  value: number;
  contextData: any;
  achievedAt: Date;
}

// Extended matchup data for calculations
interface EnrichedMatchup extends Matchup {
  roster: {
    id: number;
    ownerId: string | null;
    owner: { displayName: string } | null;
  };
  opponent?: EnrichedMatchup;
  isWin?: boolean;
  isLoss?: boolean;
  margin?: number;
}

export class HallOfFameCalculator {
  /**
   * Calculate all Hall of Fame stats for a specific week across all teams in a league
   */
  async calculateWeeklyStats(
    leagueId: string,
    week: number,
    season: string = '2024'
  ): Promise<HallOfFameCalculationResult[]> {
    console.log(`🔢 Calculating Hall of Fame stats for league ${leagueId}, week ${week}`);

    // Get all matchups for this week with enriched data
    const matchups = await this.getEnrichedMatchups(leagueId, week);

    if (matchups.length === 0) {
      console.log(`⚠️  No matchups found for league ${leagueId}, week ${week}`);
      return [];
    }

    const results: HallOfFameCalculationResult[] = [];

    // Calculate all stat categories
    results.push(...(await this.calculateScoreAndMarginStats(matchups, week, season)));
    results.push(...(await this.calculateLineupQualityStats(matchups, week, season)));
    results.push(...(await this.calculatePositionalSplitStats(matchups, week, season)));
    results.push(...(await this.calculateVolatilityStats(matchups, week, season)));

    console.log(`✅ Calculated ${results.length} stat results for week ${week}`);
    return results;
  }

  /**
   * Get matchups with opponent data and win/loss context
   */
  private async getEnrichedMatchups(leagueId: string, week: number): Promise<EnrichedMatchup[]> {
    const matchups = await prisma.matchup.findMany({
      where: {
        leagueId,
        week,
      },
      include: {
        roster: {
          include: {
            owner: {
              select: { displayName: true },
            },
          },
        },
      },
      orderBy: { rosterId: 'asc' },
    });

    // Group by matchupId to pair opponents
    const matchupPairs: { [key: number]: EnrichedMatchup[] } = {};
    matchups.forEach(matchup => {
      if (matchup.matchupId) {
        if (!matchupPairs[matchup.matchupId]) matchupPairs[matchup.matchupId] = [];
        matchupPairs[matchup.matchupId].push(matchup as EnrichedMatchup);
      }
    });

    // Enrich with opponent data and win/loss status
    const enrichedMatchups: EnrichedMatchup[] = [];
    Object.values(matchupPairs).forEach(pair => {
      if (pair.length === 2) {
        const [teamA, teamB] = pair;

        // Determine win/loss
        teamA.isWin = teamA.points > teamB.points;
        teamA.isLoss = teamA.points < teamB.points;
        teamA.opponent = teamB;
        teamA.margin = Math.abs(teamA.points - teamB.points);

        teamB.isWin = teamB.points > teamA.points;
        teamB.isLoss = teamB.points < teamA.points;
        teamB.opponent = teamA;
        teamB.margin = Math.abs(teamB.points - teamA.points);

        enrichedMatchups.push(teamA, teamB);
      }
    });

    return enrichedMatchups;
  }

  /**
   * A. Score & Margin Stats (6 categories)
   */
  private async calculateScoreAndMarginStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];

    for (const matchup of matchups) {
      const baseContext = {
        opponentId: matchup.opponent?.rosterId,
        opponentName: matchup.opponent?.roster.owner?.displayName,
        opponentPoints: matchup.opponent?.points,
        matchupId: matchup.matchupId,
      };

      // 1. Highest team points (any result)
      results.push({
        categoryName: 'highest_team_points',
        rosterId: matchup.rosterId,
        week,
        season,
        value: matchup.points,
        contextData: {
          ...baseContext,
          result: matchup.isWin ? 'win' : 'loss',
        },
        achievedAt: new Date(),
      });

      // 2. Lowest team points (any result)
      results.push({
        categoryName: 'lowest_team_points',
        rosterId: matchup.rosterId,
        week,
        season,
        value: matchup.points,
        contextData: {
          ...baseContext,
          result: matchup.isWin ? 'win' : 'loss',
        },
        achievedAt: new Date(),
      });

      // 3. Most points in a loss
      if (matchup.isLoss) {
        results.push({
          categoryName: 'most_points_in_loss',
          rosterId: matchup.rosterId,
          week,
          season,
          value: matchup.points,
          contextData: baseContext,
          achievedAt: new Date(),
        });
      }

      // 4. Fewest points in a win
      if (matchup.isWin) {
        results.push({
          categoryName: 'fewest_points_in_win',
          rosterId: matchup.rosterId,
          week,
          season,
          value: matchup.points,
          contextData: baseContext,
          achievedAt: new Date(),
        });
      }

      // 5. Largest margin of victory
      if (matchup.isWin && matchup.margin) {
        results.push({
          categoryName: 'largest_margin_victory',
          rosterId: matchup.rosterId,
          week,
          season,
          value: matchup.margin,
          contextData: baseContext,
          achievedAt: new Date(),
        });
      }

      // 6. Smallest margin of victory
      if (matchup.isWin && matchup.margin) {
        results.push({
          categoryName: 'smallest_margin_victory',
          rosterId: matchup.rosterId,
          week,
          season,
          value: matchup.margin,
          contextData: baseContext,
          achievedAt: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * B. Lineup Quality Stats (3 categories)
   */
  private async calculateLineupQualityStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];

    for (const matchup of matchups) {
      const baseContext = {
        startersCount: matchup.starters.length,
        benchCount: matchup.players.length - matchup.starters.length,
      };

      // Get optimal lineup calculation (if available in RosterWeekAggregate)
      const weekAggregate = await prisma.rosterWeekAggregate.findUnique({
        where: {
          leagueId_rosterId_week: {
            leagueId: matchup.leagueId,
            rosterId: matchup.rosterId,
            week: week,
          },
        },
      });

      // 1. Bench blunder (optimal - actual)
      if (weekAggregate?.optimalPoints && weekAggregate?.managerDelta) {
        results.push({
          categoryName: 'bench_blunder',
          rosterId: matchup.rosterId,
          week,
          season,
          value: weekAggregate.managerDelta,
          contextData: {
            ...baseContext,
            actualPoints: matchup.points,
            optimalPoints: weekAggregate.optimalPoints,
          },
          achievedAt: new Date(),
        });
      }

      // 2. Total donuts (starters with 0 points)
      if (matchup.startersPoints && typeof matchup.startersPoints === 'object') {
        const starterPoints = Object.values(matchup.startersPoints as Record<string, number>);
        const donutCount = starterPoints.filter(points => points === 0).length;

        results.push({
          categoryName: 'total_donuts',
          rosterId: matchup.rosterId,
          week,
          season,
          value: donutCount,
          contextData: {
            ...baseContext,
            starterPoints,
            donutPlayers: Object.entries(matchup.startersPoints as Record<string, number>)
              .filter(([_, points]) => points === 0)
              .map(([playerId, _]) => playerId),
          },
          achievedAt: new Date(),
        });
      }

      // 3. Most negative starters
      if (matchup.startersPoints && typeof matchup.startersPoints === 'object') {
        const starterPoints = Object.values(matchup.startersPoints as Record<string, number>);
        const negativeCount = starterPoints.filter(points => points < 0).length;

        results.push({
          categoryName: 'most_negative_starters',
          rosterId: matchup.rosterId,
          week,
          season,
          value: negativeCount,
          contextData: {
            ...baseContext,
            starterPoints,
            negativePlayers: Object.entries(matchup.startersPoints as Record<string, number>)
              .filter(([_, points]) => points < 0)
              .map(([playerId, points]) => ({ playerId, points })),
          },
          achievedAt: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * C. Positional Split Stats (11 categories)
   */
  private async calculatePositionalSplitStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];

    // Get position data for players
    const allPlayerIds = matchups.flatMap(m => m.starters);
    const players = await prisma.player.findMany({
      where: { id: { in: allPlayerIds } },
      select: { id: true, position: true, fullName: true },
    });
    const playerPositions = new Map(
      players.map(p => [p.id, { position: p.position, name: p.fullName }])
    );

    for (const matchup of matchups) {
      if (!matchup.startersPoints || typeof matchup.startersPoints !== 'object') continue;

      const starterData = Object.entries(matchup.startersPoints as Record<string, number>)
        .map(([playerId, points]) => ({
          playerId,
          points,
          position: playerPositions.get(playerId)?.position || 'UNKNOWN',
          name: playerPositions.get(playerId)?.name || 'Unknown Player',
        }))
        .filter(player => player.position !== 'UNKNOWN');

      // Group by position
      const positionGroups = starterData.reduce(
        (acc, player) => {
          const pos = player.position;
          if (!acc[pos]) acc[pos] = [];
          acc[pos].push(player);
          return acc;
        },
        {} as Record<string, typeof starterData>
      );

      // Calculate positional highs and lows
      const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
      positions.forEach(position => {
        const players = positionGroups[position] || [];
        if (players.length === 0) return;

        // Find best and worst for this position
        const best = players.reduce((max, player) => (player.points > max.points ? player : max));
        const worst = players.reduce((min, player) => (player.points < min.points ? player : min));

        // Highest position weekly
        results.push({
          categoryName: `highest_${position.toLowerCase()}_weekly`,
          rosterId: matchup.rosterId,
          week,
          season,
          value: best.points,
          contextData: {
            playerId: best.playerId,
            playerName: best.name,
            position,
            allPositionPlayers: players,
          },
          achievedAt: new Date(),
        });

        // Lowest position weekly (only for QB, RB, WR, TE)
        if (position !== 'DEF') {
          results.push({
            categoryName: `lowest_${position.toLowerCase()}_weekly`,
            rosterId: matchup.rosterId,
            week,
            season,
            value: worst.points,
            contextData: {
              playerId: worst.playerId,
              playerName: worst.name,
              position,
              allPositionPlayers: players,
            },
            achievedAt: new Date(),
          });
        }
      });

      // Top-3 and Bottom-3 starter combinations
      const sortedStarters = starterData.sort((a, b) => b.points - a.points);
      if (sortedStarters.length >= 3) {
        const top3Sum = sortedStarters.slice(0, 3).reduce((sum, player) => sum + player.points, 0);
        const bottom3Sum = sortedStarters.slice(-3).reduce((sum, player) => sum + player.points, 0);

        results.push({
          categoryName: 'highest_top3_starters',
          rosterId: matchup.rosterId,
          week,
          season,
          value: top3Sum,
          contextData: {
            top3Players: sortedStarters.slice(0, 3),
            allStarters: sortedStarters,
          },
          achievedAt: new Date(),
        });

        results.push({
          categoryName: 'lowest_bottom3_starters',
          rosterId: matchup.rosterId,
          week,
          season,
          value: bottom3Sum,
          contextData: {
            bottom3Players: sortedStarters.slice(-3),
            allStarters: sortedStarters,
          },
          achievedAt: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * D. Volatility Stats (3 categories)
   */
  private async calculateVolatilityStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];

    for (const matchup of matchups) {
      if (!matchup.startersPoints || typeof matchup.startersPoints !== 'object') continue;

      const starterPoints = Object.values(matchup.startersPoints as Record<string, number>);
      const totalPoints = starterPoints.reduce((sum, points) => sum + points, 0);

      if (starterPoints.length < 2 || totalPoints <= 0) continue;

      // Sort starters by points (descending)
      const sortedPoints = [...starterPoints].sort((a, b) => b - a);

      // 1. Star concentration index (% from top 1-2 starters)
      const topStarPoints = sortedPoints[0];
      const top2StarPoints =
        sortedPoints.length > 1 ? sortedPoints[0] + sortedPoints[1] : topStarPoints;
      const concentrationIndex = (top2StarPoints / totalPoints) * 100;

      results.push({
        categoryName: 'star_concentration_index',
        rosterId: matchup.rosterId,
        week,
        season,
        value: concentrationIndex,
        contextData: {
          totalPoints,
          topStarPoints,
          top2StarPoints,
          starterBreakdown: sortedPoints,
          startersCount: starterPoints.length,
        },
        achievedAt: new Date(),
      });

      // 2 & 3. Boom/Bust counts (placeholder - would need positional baselines)
      // For now, using simple thresholds as approximation
      const highThreshold = 20; // Approximate 90th percentile
      const lowThreshold = 5; // Approximate 10th percentile

      const boomCount = starterPoints.filter(points => points > highThreshold).length;
      const bustCount = starterPoints.filter(points => points < lowThreshold).length;

      results.push({
        categoryName: 'boom_count',
        rosterId: matchup.rosterId,
        week,
        season,
        value: boomCount,
        contextData: {
          threshold: highThreshold,
          boomPlayers: starterPoints.filter(points => points > highThreshold),
          allStarters: starterPoints,
        },
        achievedAt: new Date(),
      });

      results.push({
        categoryName: 'bust_count',
        rosterId: matchup.rosterId,
        week,
        season,
        value: bustCount,
        contextData: {
          threshold: lowThreshold,
          bustPlayers: starterPoints.filter(points => points < lowThreshold),
          allStarters: starterPoints,
        },
        achievedAt: new Date(),
      });
    }

    return results;
  }
}

// Utility function to get a calculator instance
export function getHallOfFameCalculator(): HallOfFameCalculator {
  return new HallOfFameCalculator();
}
