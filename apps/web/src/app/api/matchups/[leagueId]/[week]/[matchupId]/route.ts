import { NextRequest, NextResponse } from 'next/server';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import {
  type ScoringSettings,
  calculateLeagueProjections,
} from '@/lib/calculate-league-projections';
import type { SleeperRoster, SleeperUser } from '@gauntlet/types';

interface MatchupTeam {
  rosterId: number;
  teamName: string;
  ownerName: string;
  points: number;
  projectedPoints: number;
  starters: Array<{
    id: string;
    name: string;
    position: string;
    points: number;
    projectedPoints: number;
    nflTeam?: string;
  }>;
  bench: Array<{
    id: string;
    name: string;
    position: string;
    points: number;
    projectedPoints: number;
    nflTeam?: string;
  }>;
  remainingPlayers: number;
  playersActive: number;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

interface MatchupDetails {
  matchupId: number;
  teams: [MatchupTeam, MatchupTeam];
  winner: MatchupTeam | null;
  isComplete: boolean;
  margin: number;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string; week: string; matchupId: string } }
) {
  try {
    const { leagueId, week, matchupId } = params;
    const weekNumber = parseInt(week, 10);
    const targetMatchupId = parseInt(matchupId, 10);

    // Fetch all required data
    const [league, matchups, users, rosters, rawProjections, playersData] = await Promise.all([
      sleeperClient.fetchLeague(leagueId),
      sleeperClient.fetchMatchups(leagueId, weekNumber),
      sleeperClient.fetchUsers(leagueId),
      sleeperClient.fetchRosters(leagueId),
      sleeperClient.fetchWeeklyProjections(weekNumber, '2025'),
      sleeperClient.fetchAllPlayers(),
    ]);

    if (!matchups || !Array.isArray(matchups)) {
      return NextResponse.json({ error: 'No matchups found' }, { status: 404 });
    }

    // Find the specific matchup
    const targetMatchups = matchups.filter(m => m.matchup_id === targetMatchupId);
    if (targetMatchups.length !== 2) {
      return NextResponse.json({ error: 'Matchup not found or incomplete' }, { status: 404 });
    }

    // Process projections
    const rawProjectionsArray: any[] = Array.isArray(rawProjections)
      ? rawProjections
      : rawProjections
        ? Object.entries(rawProjections).map(([playerId, projection]) => ({
            ...(typeof projection === 'object' && projection !== null ? projection : {}),
            player_id: playerId,
          }))
        : [];

    const scoringSettings: ScoringSettings = (league?.scoring_settings as ScoringSettings) || {};
    const leagueProjections = calculateLeagueProjections(rawProjectionsArray, scoringSettings);
    const projectionOf = (playerId: string): number => leagueProjections[playerId]?.points || 0;

    // Create lookup maps
    const usersById = new Map<string, SleeperUser>(users.map(u => [u.user_id, u]));
    const rostersById = new Map<number, SleeperRoster>(rosters.map(r => [r.roster_id, r]));

    // Build team data
    const teams: MatchupTeam[] = targetMatchups.map(matchup => {
      const roster = rostersById.get(matchup.roster_id);
      const owner = roster ? usersById.get(roster.owner_id) : null;
      const starters = matchup.starters || [];
      const players = roster?.players || [];
      const bench = players.filter((p: string) => !starters.includes(p));
      const starterPoints = (matchup.starters_points as Record<string, number> | undefined) || {};

      // Build starter players
      const starterPlayers = starters.map((playerId: string, index: number) => {
        const player = playersData[playerId] || {};
        const actualPoints = Number(starterPoints[index.toString()] || 0);
        return {
          id: playerId,
          name: player.full_name || playerId,
          position: player.position || 'FLEX',
          points: actualPoints,
          projectedPoints: projectionOf(playerId),
          nflTeam: player.team || undefined,
        };
      });

      // Build bench players
      const benchPlayers = bench.map((playerId: string) => {
        const player = playersData[playerId] || {};
        return {
          id: playerId,
          name: player.full_name || playerId,
          position: player.position || 'FLEX',
          points: 0, // Bench players don't have points in current week
          projectedPoints: projectionOf(playerId),
          nflTeam: player.team || undefined,
        };
      });

      return {
        rosterId: matchup.roster_id,
        teamName: owner?.display_name || owner?.username || `Team ${matchup.roster_id}`,
        ownerName: owner?.display_name || owner?.username || `Owner ${matchup.roster_id}`,
        points: matchup.points || 0,
        projectedPoints: starterPlayers.reduce((sum: number, p: any) => sum + p.projectedPoints, 0),
        starters: starterPlayers,
        bench: benchPlayers,
        remainingPlayers: starterPlayers.filter((p: any) => p.points === 0).length,
        playersActive: starterPlayers.filter((p: any) => p.points > 0).length,
        owner: {
          id: owner?.user_id || '',
          username: owner?.username || '',
          displayName: owner?.display_name || '',
          avatar: owner?.avatar || null,
        },
      };
    });

    // Determine winner
    let winner: MatchupTeam | null = null;
    let isComplete = false;
    let margin = 0;

    if (teams.length === 2) {
      const [teamA, teamB] = teams;
      margin = Math.abs(teamA.points - teamB.points);

      // Consider complete if both teams have some points or if it's late in the week
      if (teamA.points > 0 || teamB.points > 0) {
        if (teamA.points > teamB.points) {
          winner = teamA;
        } else if (teamB.points > teamA.points) {
          winner = teamB;
        }
        // Only mark as complete if there's a clear winner and significant points
        isComplete = margin > 0 && (teamA.points > 50 || teamB.points > 50);
      }
    }

    const matchupDetails: MatchupDetails = {
      matchupId: targetMatchupId,
      teams: teams as [MatchupTeam, MatchupTeam],
      winner,
      isComplete,
      margin,
    };

    return NextResponse.json({
      matchup: matchupDetails,
      week: weekNumber,
      leagueId,
    });
  } catch (error) {
    console.error('Error fetching individual matchup:', error);
    return NextResponse.json({ error: 'Failed to fetch matchup details' }, { status: 500 });
  }
}
