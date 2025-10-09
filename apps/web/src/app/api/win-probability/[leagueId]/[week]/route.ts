import { NextRequest, NextResponse } from 'next/server';
import {
  calculateWinProbability,
  getMatchupsByWeek,
  getRostersByLeague,
} from '@/lib/api-replacements';

export const GET = async (
  _request: NextRequest,
  { params }: { params: { leagueId: string; week: string } },
) => {
  try {
    const { leagueId, week } = params;
    const weekNumber = parseInt(week, 10);

    if (!leagueId || !Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 18) {
      return NextResponse.json({ error: 'Invalid leagueId or week parameter' }, { status: 400 });
    }

    // Fetch matchups and rosters from Sleeper
    const [matchups, rosters] = await Promise.all([
      getMatchupsByWeek(leagueId, weekNumber),
      getRostersByLeague(leagueId),
    ]);

    // Map roster ID to starters
    const rostersMap = new Map(rosters.map(r => [r.rosterId, r]));

    // Group matchups by matchupId
    const matchupPairs = new Map<number, any[]>();
    matchups.forEach(m => {
      if (!matchupPairs.has(m.matchupId)) {
        matchupPairs.set(m.matchupId, []);
      }
      matchupPairs.get(m.matchupId)!.push(m);
    });

    // Calculate win probabilities for each matchup
    const results = await Promise.all(
      Array.from(matchupPairs.values()).map(async pair => {
        if (pair.length !== 2) return null;

        const [team1, team2] = pair;
        const roster1 = rostersMap.get(team1.rosterId);
        const roster2 = rostersMap.get(team2.rosterId);

        if (!roster1?.starters || !roster2?.starters) return null;

        const winProb = await calculateWinProbability(
          roster1.starters,
          roster2.starters,
          weekNumber,
        );

        return {
          matchupId: team1.matchupId,
          week: weekNumber,
          team1: {
            rosterId: team1.rosterId,
            currentPoints: team1.points || 0,
            winProbability: winProb.team1WinPct,
          },
          team2: {
            rosterId: team2.rosterId,
            currentPoints: team2.points || 0,
            winProbability: winProb.team2WinPct,
          },
          iterations: winProb.iterations,
        };
      }),
    );

    const validResults = results.filter(r => r !== null);

    return NextResponse.json({
      leagueId,
      week: weekNumber,
      matchups: validResults,
      count: validResults.length,
      dbQueries: 0,
      dataSource: 'real-time-calculation',
    });
  } catch (error) {
    console.error('Error calculating league win probabilities:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate win probabilities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};
