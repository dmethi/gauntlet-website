import { NextRequest, NextResponse } from 'next/server';
import {
  getRostersByLeague,
  getUsersByLeague,
  getMatchupsByWeek,
  getCurrentWeek,
} from '@/lib/api-replacements';

export async function GET(
  _request: NextRequest,
  { params }: { params: { leagueId: string; rosterId: string } }
) {
  try {
    const { leagueId, rosterId } = params;
    const rosterIdNumber = parseInt(rosterId, 10);

    if (!leagueId || !Number.isFinite(rosterIdNumber)) {
      return NextResponse.json({ error: 'League ID and roster ID are required' }, { status: 400 });
    }

    // Fetch basic roster and user data
    const [rosters, users, currentWeek] = await Promise.all([
      getRostersByLeague(leagueId),
      getUsersByLeague(leagueId),
      getCurrentWeek(),
    ]);

    // Find the specific roster
    const roster = rosters.find(r => r.rosterId === rosterIdNumber);
    if (!roster) {
      return NextResponse.json({ error: 'Roster not found' }, { status: 404 });
    }

    // Find the owner
    const userMap = new Map(users.map(u => [u.id, u]));
    const owner = userMap.get(roster.ownerId);

    // Fetch matchups for all weeks to get full season data
    const weeks = Array.from({ length: Math.min(currentWeek, 18) }, (_, i) => i + 1);
    const allMatchups = await Promise.all(
      weeks.map(week => getMatchupsByWeek(leagueId, week).catch(() => []))
    );

    // Process matchup history for this roster
    const matchupHistory = [];
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let totalPoints = 0;
    let totalOpponentPoints = 0;

    for (let weekIndex = 0; weekIndex < allMatchups.length; weekIndex++) {
      const week = weekIndex + 1;
      const weekMatchups = allMatchups[weekIndex];

      const rosterMatchup = weekMatchups.find(m => m.rosterId === rosterIdNumber);
      if (rosterMatchup) {
        const opponent = weekMatchups.find(
          m => m.matchupId === rosterMatchup.matchupId && m.rosterId !== rosterIdNumber
        );

        const rosterPoints = rosterMatchup.points || 0;
        const opponentPoints = opponent?.points || 0;

        let result: 'W' | 'L' | 'T' = 'L';
        if (rosterPoints > opponentPoints) {
          result = 'W';
          wins++;
        } else if (rosterPoints === opponentPoints) {
          result = 'T';
          ties++;
        } else {
          losses++;
        }

        totalPoints += rosterPoints;
        totalOpponentPoints += opponentPoints;

        matchupHistory.push({
          week,
          points: rosterPoints,
          opponentPoints,
          result,
          matchupId: rosterMatchup.matchupId,
          opponentRosterId: opponent?.rosterId || null,
        });
      }
    }

    // Calculate additional stats
    const avgPoints = matchupHistory.length > 0 ? totalPoints / matchupHistory.length : 0;
    const avgOpponentPoints =
      matchupHistory.length > 0 ? totalOpponentPoints / matchupHistory.length : 0;

    // Calculate record and winning percentage
    const totalGames = wins + losses + ties;
    const winPercentage = totalGames > 0 ? wins / totalGames : 0;

    // Build response
    const rosterData = {
      id: rosterId,
      rosterId: rosterIdNumber,
      leagueId,
      owner: {
        id: owner?.id || '',
        username: owner?.username || '',
        displayName: owner?.displayName || '',
        avatar: owner?.avatar || null,
        metadata: owner?.metadata || {},
      },
      players: roster.players || [],
      starters: roster.starters || [],
      settings: roster.settings || {},

      // Season statistics
      record: {
        wins,
        losses,
        ties,
        winPercentage,
      },
      points: {
        total: totalPoints,
        average: avgPoints,
        against: totalOpponentPoints,
        averageAgainst: avgOpponentPoints,
      },

      // Matchup history
      matchups: matchupHistory,

      // Metadata
      currentWeek,
      gamesPlayed: matchupHistory.length,
      dbQueries: 0,
      dataSource: 'sleeper-api',
    };

    return NextResponse.json(rosterData);
  } catch (error) {
    console.error('Error fetching roster:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch roster',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
