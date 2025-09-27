import { NextRequest, NextResponse } from 'next/server';
import {
  computeWeeklyRollups,
  getCurrentWeek,
  getRostersByLeague,
  getUsersByLeague,
} from '@/lib/api-replacements';

export async function GET(
  _request: NextRequest,
  { params }: { params: { leagueId: string; season: string } }
) {
  try {
    const { leagueId, season } = params;

    if (!leagueId || !season) {
      return NextResponse.json({ error: 'League ID and season are required' }, { status: 400 });
    }

    // Get current week and basic league data
    const [currentWeek, rosters, users] = await Promise.all([
      getCurrentWeek(),
      getRostersByLeague(leagueId),
      getUsersByLeague(leagueId),
    ]);

    const weeks = Array.from({ length: Math.min(currentWeek, 18) }, (_, i) => i + 1);

    // Compute rollups for all weeks
    const rollups = await Promise.all(
      weeks.map(async week => {
        try {
          const rollup = await computeWeeklyRollups(leagueId, week);
          return { week, ...rollup };
        } catch (error) {
          console.warn(`Failed to compute rollup for week ${week}:`, error);
          return null;
        }
      })
    );

    const validRollups = rollups.filter(r => r !== null);
    const allRosterAggregates = validRollups.flatMap(r => r.rosterWeekAggregates);
    const allMatchupSummaries = validRollups.flatMap(r => r.matchupSummaries);

    // Build user/roster lookup
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    const rosterMap = new Map(rosters.map((r: any) => [r.rosterId, r]));

    // Helper function to get team name
    const getTeamName = (rosterId: number) => {
      const roster = rosterMap.get(rosterId) as any;
      if (!roster) return `Team ${rosterId}`;
      const owner = userMap.get(roster.ownerId) as any;
      return (
        owner?.metadata?.team_name || owner?.displayName || owner?.username || `Team ${rosterId}`
      );
    };

    // Calculate superlatives
    const superlatives = {
      // Highest single-week score
      highestScore: (() => {
        const best = allRosterAggregates.reduce(
          (max, agg) => (agg.points > max.points ? agg : max),
          { points: -1, rosterId: 0, week: 0 }
        );

        return {
          category: 'Highest Single-Week Score',
          rosterId: best.rosterId,
          teamName: getTeamName(best.rosterId),
          value: best.points,
          week: best.week,
          description: `${best.points.toFixed(1)} points in Week ${best.week}`,
        };
      })(),

      // Lowest single-week score
      lowestScore: (() => {
        const worst = allRosterAggregates.reduce(
          (min, agg) => (agg.points < min.points && agg.points > 0 ? agg : min),
          { points: Infinity, rosterId: 0, week: 0 }
        );

        return {
          category: 'Lowest Single-Week Score',
          rosterId: worst.rosterId,
          teamName: getTeamName(worst.rosterId),
          value: worst.points,
          week: worst.week,
          description: `${worst.points.toFixed(1)} points in Week ${worst.week}`,
        };
      })(),

      // Biggest blowout
      biggestBlowout: (() => {
        const biggest = allMatchupSummaries.reduce(
          (max, matchup) => (matchup.margin > max.margin ? matchup : max),
          {
            margin: -1,
            winnerRosterId: 0,
            pointsA: 0,
            pointsB: 0,
            week: 0,
            rosterAId: 0,
            rosterBId: 0,
          }
        );

        const winner = biggest.pointsA > biggest.pointsB ? biggest.rosterAId : biggest.rosterBId;
        const loser = biggest.pointsA > biggest.pointsB ? biggest.rosterBId : biggest.rosterAId;
        const winnerScore = Math.max(biggest.pointsA, biggest.pointsB);
        const loserScore = Math.min(biggest.pointsA, biggest.pointsB);

        return {
          category: 'Biggest Blowout',
          rosterId: winner,
          teamName: getTeamName(winner),
          value: biggest.margin,
          week: biggest.week,
          description: `${getTeamName(winner)} beat ${getTeamName(loser)} ${winnerScore.toFixed(1)} - ${loserScore.toFixed(1)} (${biggest.margin.toFixed(1)} point margin)`,
        };
      })(),

      // Closest matchup
      closestMatchup: (() => {
        const closest = allMatchupSummaries.reduce(
          (min, matchup) => (matchup.margin < min.margin && matchup.margin >= 0 ? matchup : min),
          {
            margin: Infinity,
            winnerRosterId: 0,
            pointsA: 0,
            pointsB: 0,
            week: 0,
            rosterAId: 0,
            rosterBId: 0,
          }
        );

        const winner = closest.pointsA > closest.pointsB ? closest.rosterAId : closest.rosterBId;
        const loser = closest.pointsA > closest.pointsB ? closest.rosterBId : closest.rosterAId;
        const winnerScore = Math.max(closest.pointsA, closest.pointsB);
        const loserScore = Math.min(closest.pointsA, closest.pointsB);

        return {
          category: 'Closest Matchup',
          rosterId: winner,
          teamName: getTeamName(winner),
          value: closest.margin,
          week: closest.week,
          description: `${getTeamName(winner)} beat ${getTeamName(loser)} ${winnerScore.toFixed(1)} - ${loserScore.toFixed(1)} (${closest.margin.toFixed(1)} point margin)`,
        };
      })(),

      // Most consistent (lowest standard deviation)
      mostConsistent: (() => {
        const rosterStats = new Map<number, { points: number[]; rosterId: number }>();

        allRosterAggregates.forEach(agg => {
          if (!rosterStats.has(agg.rosterId)) {
            rosterStats.set(agg.rosterId, { points: [], rosterId: agg.rosterId });
          }
          rosterStats.get(agg.rosterId)!.points.push(agg.points);
        });

        let mostConsistent = { stdDev: Infinity, rosterId: 0, avgPoints: 0 };

        for (const [rosterId, stats] of rosterStats) {
          if (stats.points.length < 3) continue; // Need at least 3 games

          const avg = stats.points.reduce((a, b) => a + b, 0) / stats.points.length;
          const variance =
            stats.points.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / stats.points.length;
          const stdDev = Math.sqrt(variance);

          if (stdDev < mostConsistent.stdDev) {
            mostConsistent = { stdDev, rosterId, avgPoints: avg };
          }
        }

        return {
          category: 'Most Consistent',
          rosterId: mostConsistent.rosterId,
          teamName: getTeamName(mostConsistent.rosterId),
          value: mostConsistent.stdDev,
          description: `${mostConsistent.avgPoints.toFixed(1)} avg points, ${mostConsistent.stdDev.toFixed(1)} std dev`,
        };
      })(),
    };

    return NextResponse.json({
      leagueId,
      season,
      currentWeek,
      superlatives: Object.values(superlatives),
      weeksAnalyzed: validRollups.length,
      dbQueries: 0,
      dataSource: 'sleeper-api-computed',
    });
  } catch (error) {
    console.error('Error computing superlatives:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute superlatives',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
