import { NextRequest, NextResponse } from 'next/server';
import { getMatchupsByWeek, getRostersByLeague, getUsersByLeague } from '@/lib/api-replacements';
import { getLeague, getNFLState, getProjections } from '@/lib/sleeper-direct';
import {
  type ScoringSettings,
  calculateLeagueProjections,
} from '@/lib/calculate-league-projections';

type User = {
  id: string;
  username?: string;
  displayName?: string;
  avatar?: string | null;
  metadata?: unknown;
};
type Roster = {
  id: string;
  rosterId: number;
  leagueId: string;
  ownerId: string;
  owner?: User | null;
  starters?: string[];
  players?: string[];
  settings?: Record<string, unknown>;
};
type SleeperMatchup = {
  id: string;
  leagueId: string;
  week: number;
  rosterId: number;
  matchupId: number;
  points: number;
  starters?: string[];
  players?: string[];
  starterPoints?: Record<string, number>;
};

// Helper to resolve a user-facing team name
function resolveTeamName(roster: any, owner: any): string {
  const rosterMetaName = ((roster?.metadata as any) || {})?.team_name as string | undefined;
  const ownerMetaName = ((owner?.metadata as any) || {})?.team_name as string | undefined;
  const ownerDisplay = owner?.displayName as string | undefined;
  const ownerUser = owner?.username as string | undefined;
  const name = rosterMetaName || ownerMetaName || ownerDisplay || ownerUser;
  if (!name) return `Team ${roster?.rosterId ?? ''}`.trim();
  return String(name);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  try {
    const leagueId = params.leagueId;
    const weekNumber = parseInt(params.week, 10);

    if (!leagueId || Number.isNaN(weekNumber)) {
      return NextResponse.json({ error: 'Invalid leagueId or week parameter' }, { status: 400 });
    }

    // Fetch from Sleeper (no database)
    const [rosters, users, matchups, nflState, league] = await Promise.all([
      getRostersByLeague(leagueId),
      getUsersByLeague(leagueId),
      getMatchupsByWeek(leagueId, weekNumber),
      getNFLState(),
      getLeague(leagueId),
    ]);

    // Debug logs to verify data fidelity (guarded by env flag)
    if (process.env.MATCHUPS_API_DEBUG === '1') {
      try {
        // eslint-disable-next-line no-console
        console.log('[MATCHUPS API] leagueId=%s week=%d', leagueId, weekNumber);
        // eslint-disable-next-line no-console
        console.log(
          '[MATCHUPS API] counts: rosters=%d users=%d matchups=%d',
          Array.isArray(rosters) ? rosters.length : -1,
          Array.isArray(users) ? users.length : -1,
          Array.isArray(matchups) ? matchups.length : -1
        );
        const sample = (matchups as any[])[0];
        if (sample) {
          // eslint-disable-next-line no-console
          console.log('[MATCHUPS API] sample matchup:', {
            rosterId: (sample as any)?.rosterId,
            matchupId: (sample as any)?.matchupId,
            startersCount: Array.isArray((sample as any)?.starters)
              ? (sample as any).starters.length
              : 0,
            starters: (sample as any)?.starters?.slice?.(0, 10) || [],
            points: (sample as any)?.points,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[MATCHUPS API] debug logging error', e);
      }
    }

    // Build lookups
    const usersById = new Map<string, User>(users.map((u: User) => [u.id, u]));
    const rostersById = new Map<number, Roster>(rosters.map((r: Roster) => [r.rosterId, r]));

    // Fetch projections for this week/season
    const season = nflState?.season || '2025';
    const rawProjections = await getProjections(weekNumber, season);

    // Convert projections to array while preserving player_id
    const rawProjectionsArray: any[] = Array.isArray(rawProjections)
      ? rawProjections
      : rawProjections
        ? Object.entries(rawProjections).map(([playerId, projection]) => ({
            ...(typeof projection === 'object' && projection !== null ? projection : {}),
            player_id: playerId,
          }))
        : [];

    // Calculate league-specific projections using scoring settings
    const scoringSettings: ScoringSettings = (league?.scoring_settings as ScoringSettings) || {};
    const leagueProjections = calculateLeagueProjections(rawProjectionsArray, scoringSettings);
    const projectionOf = (playerId: string): number => leagueProjections[playerId]?.points || 0;

    // Group sleeper matchups by matchupId
    const pairs = new Map<number, SleeperMatchup[]>();
    for (const m of matchups as unknown as SleeperMatchup[]) {
      if (m.matchupId == null) continue;
      const arr = pairs.get(m.matchupId) || [];
      arr.push(m);
      pairs.set(m.matchupId, arr);
    }

    // Format to client shape
    const formatted = Array.from(pairs.entries()).map(([mid, group]) => {
      const [a, b] =
        group.length === 2 ? group.sort((x, y) => x.rosterId - y.rosterId) : [group[0], null];
      const rosterA: Roster | null = a ? (rostersById.get(a.rosterId) ?? null) : null;
      const rosterB: Roster | null = b ? (rostersById.get(b.rosterId) ?? null) : null;
      const ownerA: User | null = rosterA ? (usersById.get(rosterA.ownerId) ?? null) : null;
      const ownerB: User | null = rosterB ? (usersById.get(rosterB.ownerId) ?? null) : null;

      const makeTeam = (m: SleeperMatchup | null, roster: Roster | null, owner: User | null) => {
        const starters = (m?.starters || []) as string[];
        const starterPoints = m?.starterPoints || {};

        // Create actual points mapping using array indices
        const starterActualPoints: Record<string, number> = {};
        starters.forEach((playerId, index) => {
          // Handle both array and object formats from Sleeper API
          const pointValue = Array.isArray(starterPoints)
            ? starterPoints[index]
            : starterPoints[index.toString()];
          starterActualPoints[playerId] = Number(pointValue || 0);
        });

        return {
          rosterId: m?.rosterId ?? 0,
          teamName: resolveTeamName(roster, owner),
          ownerName: owner?.displayName || owner?.username || 'Unknown',
          points: Number(m?.points || 0),
          projectedPoints: Number(
            starters.reduce((s: number, pid: string) => s + projectionOf(pid), 0)
          ),
          players: (m?.players || []) as string[],
          starters,
          owner,
          playerProjections: Object.fromEntries(
            ((m?.players || []) as string[]).map(pid => [pid, projectionOf(pid)])
          ),
          starterProjections: Object.fromEntries(starters.map(pid => [pid, projectionOf(pid)])),
          starterActualPoints, // Add actual points for each starter
        };
      };

      const teams = [makeTeam(a, rosterA, ownerA)] as any[];
      if (b) teams.push(makeTeam(b, rosterB, ownerB));

      return {
        matchupId: mid,
        teams,
        summary: { winnerRosterId: null },
        isComplete: false,
      };
    });

    return NextResponse.json({
      matchups: formatted,
      week: weekNumber,
      season,
      dbQueries: 0,
      dataSource: 'sleeper-api',
    });
  } catch (error) {
    console.error('matchups route error', error);
    return NextResponse.json({ error: 'Failed to fetch matchups' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
