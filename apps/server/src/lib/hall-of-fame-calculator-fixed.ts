/**
 * Fixed Hall of Fame Calculation Engine
 * Updated to handle consolidated categories per user feedback
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

export class HallOfFameCalculatorFixed {
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

    // Calculate all stat categories with new consolidated structure
    results.push(...(await this.calculateScoreAndMarginStats(matchups, week, season)));
    results.push(...(await this.calculateLineupQualityStats(matchups, week, season)));
    results.push(...(await this.calculatePositionalSplitsStats(matchups, week, season)));
    results.push(...(await this.calculateVolatilityStats(matchups, week, season)));

    console.log(`✅ Calculated ${results.length} stat results for week ${week}`);
    return results;
  }

  /**
   * Get enriched matchup data with roster and opponent information
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
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Group by matchup_id to pair opponents and calculate margins
    const matchupGroups = matchups.reduce(
      (acc, matchup) => {
        if (!acc[matchup.matchupId]) acc[matchup.matchupId] = [];
        acc[matchup.matchupId].push(matchup as EnrichedMatchup);
        return acc;
      },
      {} as Record<number, EnrichedMatchup[]>
    );

    const enrichedMatchups: EnrichedMatchup[] = [];

    Object.values(matchupGroups).forEach(pair => {
      if (pair.length === 2) {
        const [matchup1, matchup2] = pair;

        // Set opponent references
        matchup1.opponent = matchup2;
        matchup2.opponent = matchup1;

        // Determine winners and calculate margins
        if (matchup1.points !== null && matchup2.points !== null) {
          if (matchup1.points > matchup2.points) {
            matchup1.isWin = true;
            matchup1.isLoss = false;
            matchup1.margin = matchup1.points - matchup2.points;
            matchup2.isWin = false;
            matchup2.isLoss = true;
            matchup2.margin = matchup2.points - matchup1.points; // negative for loser
          } else if (matchup2.points > matchup1.points) {
            matchup2.isWin = true;
            matchup2.isLoss = false;
            matchup2.margin = matchup2.points - matchup1.points;
            matchup1.isWin = false;
            matchup1.isLoss = true;
            matchup1.margin = matchup1.points - matchup2.points; // negative for loser
          } else {
            // Tie game
            matchup1.isWin = false;
            matchup1.isLoss = false;
            matchup1.margin = 0;
            matchup2.isWin = false;
            matchup2.isLoss = false;
            matchup2.margin = 0;
          }
        }

        enrichedMatchups.push(matchup1, matchup2);
      }
    });

    return enrichedMatchups;
  }

  /**
   * Calculate Score & Margin stats (4 consolidated categories)
   */
  private async calculateScoreAndMarginStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];
    const now = new Date();

    for (const matchup of matchups) {
      if (matchup.points === null) continue;

      const contextData = {
        result: matchup.isWin ? 'win' : matchup.isLoss ? 'loss' : 'tie',
        matchupId: matchup.matchupId,
        opponentId: matchup.opponent?.roster.id,
        opponentName: matchup.opponent?.roster.owner?.displayName,
        opponentPoints: matchup.opponent?.points,
      };

      // 1. Team Points (consolidates highest + lowest)
      results.push({
        categoryName: 'team_points',
        rosterId: matchup.roster.id,
        week,
        season,
        value: matchup.points,
        contextData,
        achievedAt: now,
      });

      // 2. Most Points in a Loss (only for losses)
      if (matchup.isLoss) {
        results.push({
          categoryName: 'most_points_in_loss',
          rosterId: matchup.roster.id,
          week,
          season,
          value: matchup.points,
          contextData,
          achievedAt: now,
        });
      }

      // 3. Fewest Points in a Win (only for wins)
      if (matchup.isWin) {
        results.push({
          categoryName: 'fewest_points_in_win',
          rosterId: matchup.roster.id,
          week,
          season,
          value: matchup.points,
          contextData,
          achievedAt: now,
        });
      }

      // 4. Margin of Victory (consolidates largest + smallest, only for wins)
      if (matchup.isWin && matchup.margin !== undefined) {
        results.push({
          categoryName: 'margin_of_victory',
          rosterId: matchup.roster.id,
          week,
          season,
          value: matchup.margin,
          contextData: {
            ...contextData,
            margin: matchup.margin,
          },
          achievedAt: now,
        });
      }
    }

    return results;
  }

  /**
   * Calculate Lineup Quality stats (2 categories)
   */
  private async calculateLineupQualityStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];
    const now = new Date();

    // Get roster aggregates for bench blunder calculation
    const rosterAggregates = await prisma.rosterWeekAggregate.findMany({
      where: {
        leagueId: matchups[0]?.leagueId,
        week,
      },
    });

    const aggregateMap = rosterAggregates.reduce(
      (acc, agg) => {
        acc[agg.rosterId] = agg;
        return acc;
      },
      {} as Record<number, RosterWeekAggregate>
    );

    for (const matchup of matchups) {
      if (matchup.points === null) continue;

      const roster = aggregateMap[matchup.roster.id];
      if (!roster) continue;

      const contextData = {
        result: matchup.isWin ? 'win' : matchup.isLoss ? 'loss' : 'tie',
        actualPoints: matchup.points,
        matchupId: matchup.matchupId,
      };

      // 1. Bench Blunder (fixed logic: larger blunder = worse)
      // Use managerDelta which is optimal - actual
      if (roster.managerDelta !== null && roster.managerDelta >= 0) {
        results.push({
          categoryName: 'bench_blunder',
          rosterId: matchup.roster.id,
          week,
          season,
          value: roster.managerDelta,
          contextData: {
            ...contextData,
            optimalPoints: roster.optimalPoints,
            managerScore: roster.managerScore,
          },
          achievedAt: now,
        });
      }

      // 2. Total Donuts (now available with donutCount field)
      if (roster.donutCount !== null && roster.donutCount > 0) {
        results.push({
          categoryName: 'total_donuts',
          rosterId: matchup.roster.id,
          week,
          season,
          value: roster.donutCount,
          contextData: {
            ...contextData,
            donutCount: roster.donutCount,
          },
          achievedAt: now,
        });
      }
    }

    return results;
  }

  /**
   * Calculate Volatility stats (3 categories)
   */
  private async calculateVolatilityStats(
    matchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameCalculationResult[]> {
    const results: HallOfFameCalculationResult[] = [];
    const now = new Date();

    // Get roster aggregates for volatility calculations
    const rosterAggregates = await prisma.rosterWeekAggregate.findMany({
      where: {
        leagueId: matchups[0]?.leagueId,
        week,
      },
    });

    const aggregateMap = rosterAggregates.reduce(
      (acc, agg) => {
        acc[agg.rosterId] = agg;
        return acc;
      },
      {} as Record<number, RosterWeekAggregate>
    );

    for (const matchup of matchups) {
      if (matchup.points === null) continue;

      const roster = aggregateMap[matchup.roster.id];
      if (!roster) continue;

      const contextData = {
        result: matchup.isWin ? 'win' : matchup.isLoss ? 'loss' : 'tie',
        teamPoints: matchup.points,
        matchupId: matchup.matchupId,
      };

      // 1. Star Concentration Index (simple top 5 vs bottom 5)
      if (roster.starConcentrationIndex !== null) {
        results.push({
          categoryName: 'star_concentration_index',
          rosterId: matchup.roster.id,
          week,
          season,
          value: roster.starConcentrationIndex,
          contextData,
          achievedAt: now,
        });
      }

      // 2. Boom Count - Calculate from positional rankings
      // Get starters with position data and rankings
      if (matchup.starters && matchup.starters.length > 0) {
        const playerStats = await prisma.playerStats.findMany({
          where: {
            playerId: { in: matchup.starters },
            season,
            week,
          },
        });

        const players = await prisma.player.findMany({
          where: {
            id: { in: matchup.starters },
          },
          select: {
            id: true,
            position: true,
          },
        });

        // Count booms (players ranked top 5 at their position)
        let boomCount = 0;
        let bustCount = 0;
        const boomPlayers: any[] = [];
        const bustPlayers: any[] = [];

        matchup.starters.forEach(playerId => {
          const stat = playerStats.find(s => s.playerId === playerId);
          const player = players.find(p => p.id === playerId);

          if (
            stat?.stats &&
            player?.position &&
            ['QB', 'RB', 'WR', 'TE'].includes(player.position)
          ) {
            const stats = stat.stats as any;
            const rank = stats.pos_rank_ppr;
            const points = stats.pts_ppr || stats.pts_std || 0;

            // Boom: Top 5 at position (rank 1-5)
            if (rank && rank <= 5) {
              boomCount++;
              boomPlayers.push({ playerId, position: player.position, rank, points });
            }

            // Bust: Outside top 25 at position (rank 26+, excludes unranked 999s)
            if (rank && rank >= 26 && rank < 100) {
              bustCount++;
              bustPlayers.push({ playerId, position: player.position, rank, points });
            }
          }
        });

        // Store boom count if > 0
        if (boomCount > 0) {
          results.push({
            categoryName: 'boom_count',
            rosterId: matchup.roster.id,
            week,
            season,
            value: boomCount,
            contextData: {
              ...contextData,
              boomCount,
              boomPlayers,
            },
            achievedAt: now,
          });
        }

        // Store bust count if > 0
        if (bustCount > 0) {
          results.push({
            categoryName: 'bust_count',
            rosterId: matchup.roster.id,
            week,
            season,
            value: bustCount,
            contextData: {
              ...contextData,
              bustCount,
              bustPlayers,
            },
            achievedAt: now,
          });
        }
      }
    }

    return results;
  }

  /**
   * Calculate Positional Splits stats for all matchups in a week
   */
  private async calculatePositionalSplitsStats(
    enrichedMatchups: EnrichedMatchup[],
    week: number,
    season: string
  ): Promise<HallOfFameStatResult[]> {
    const results: HallOfFameStatResult[] = [];
    const now = new Date();

    for (const matchup of enrichedMatchups) {
      const contextData = {
        teamName: matchup.roster.teamName || `Team ${matchup.roster.id}`,
        week,
        season,
        result: matchup.isWin ? 'win' : matchup.isLoss ? 'loss' : 'tie',
        teamPoints: matchup.points,
        matchupId: matchup.matchupId,
      };

      // Get starters with position data
      if (!matchup.starters || matchup.starters.length === 0) {
        continue;
      }

      // Get player stats for this week
      const playerStats = await prisma.playerStats.findMany({
        where: {
          playerId: { in: matchup.starters },
          season,
          week,
        },
      });

      // Get player position data separately
      const players = await prisma.player.findMany({
        where: {
          id: { in: matchup.starters },
        },
        select: {
          id: true,
          position: true,
        },
      });

      // Create starter data with positions and fantasy points
      const starterData = matchup.starters
        .map(playerId => {
          const stat = playerStats.find(s => s.playerId === playerId);
          const player = players.find(p => p.id === playerId);
          const points = stat?.stats
            ? (stat.stats as any).pts_ppr || (stat.stats as any).pts_std || 0
            : 0;
          return {
            playerId,
            position: player?.position || 'UNKNOWN',
            points,
          };
        })
        .filter(s => s.position !== 'UNKNOWN');

      if (starterData.length === 0) {
        continue;
      }

      // Group by position
      const positionGroups = starterData.reduce(
        (groups, starter) => {
          if (!groups[starter.position]) {
            groups[starter.position] = [];
          }
          groups[starter.position].push(starter);
          return groups;
        },
        {} as Record<string, typeof starterData>
      );

      // Calculate combined points for each position (sum of all players at that position)
      ['QB', 'RB', 'WR', 'TE', 'DEF'].forEach(position => {
        const positionPlayers = positionGroups[position] || [];
        if (positionPlayers.length > 0) {
          const totalPoints = positionPlayers.reduce((sum, player) => sum + player.points, 0);
          const playerIds = positionPlayers.map(p => p.playerId);

          results.push({
            categoryName: `highest_${position.toLowerCase()}`,
            rosterId: matchup.roster.id,
            week,
            season,
            value: totalPoints,
            contextData: {
              ...contextData,
              playerIds,
              position,
              totalPoints,
              playerCount: positionPlayers.length,
              individualScores: positionPlayers.map(p => ({
                playerId: p.playerId,
                points: p.points,
              })),
            },
            achievedAt: now,
          });
        }
      });

      // Calculate combined points for QB, RB, WR, TE, DEF - these can also be "lowest"
      ['QB', 'RB', 'WR', 'TE', 'DEF'].forEach(position => {
        const positionPlayers = positionGroups[position] || [];
        if (positionPlayers.length > 0) {
          const totalPoints = positionPlayers.reduce((sum, player) => sum + player.points, 0);
          const playerIds = positionPlayers.map(p => p.playerId);

          results.push({
            categoryName: `lowest_${position.toLowerCase()}`,
            rosterId: matchup.roster.id,
            week,
            season,
            value: totalPoints,
            contextData: {
              ...contextData,
              playerIds,
              position,
              totalPoints,
              playerCount: positionPlayers.length,
              individualScores: positionPlayers.map(p => ({
                playerId: p.playerId,
                points: p.points,
              })),
            },
            achievedAt: now,
          });
        }
      });

      // Calculate highest top-3 starters sum
      const sortedStarters = starterData.sort((a, b) => b.points - a.points);
      const top3Sum = sortedStarters.slice(0, 3).reduce((sum, s) => sum + s.points, 0);

      results.push({
        categoryName: 'highest_top3',
        rosterId: matchup.roster.id,
        week,
        season,
        value: top3Sum,
        contextData: {
          ...contextData,
          top3Players: sortedStarters
            .slice(0, 3)
            .map(s => ({ playerId: s.playerId, points: s.points })),
          top3Sum,
        },
        achievedAt: now,
      });

      // Calculate lowest bottom-3 starters sum
      const bottom3Sum = sortedStarters.slice(-3).reduce((sum, s) => sum + s.points, 0);

      results.push({
        categoryName: 'lowest_bottom3',
        rosterId: matchup.roster.id,
        week,
        season,
        value: bottom3Sum,
        contextData: {
          ...contextData,
          bottom3Players: sortedStarters
            .slice(-3)
            .map(s => ({ playerId: s.playerId, points: s.points })),
          bottom3Sum,
        },
        achievedAt: now,
      });
    }

    return results;
  }
}
