import { NextRequest, NextResponse } from 'next/server';
import { getDraftByLeague, getLeagueById, getRostersByLeague } from '@/lib/api-replacements';
import { getCurrentLeagues } from '@/config/leagues';
import { sleeperClient } from '@/lib/sleeper/unified-client';

// This route needs to be dynamic since it uses query parameters
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
  try {
    let leagueId = request.nextUrl.searchParams.get('leagueId');

    if (!leagueId) {
      // Use first current league as default (same convention as /api/league/overview)
      const currentLeagues = getCurrentLeagues();
      if (currentLeagues.length === 0) {
        return NextResponse.json({ ok: false, error: 'No leagues configured' }, { status: 404 });
      }
      leagueId = currentLeagues[0].id;
    }

    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json({ ok: false, error: 'League not found' }, { status: 404 });
    }

    const [draft, rosters, allPlayers] = await Promise.all([
      getDraftByLeague(leagueId),
      getRostersByLeague(leagueId),
      sleeperClient.fetchAllPlayers(),
    ]);

    if (!draft) {
      return NextResponse.json({
        ok: true,
        data: {
          league: { id: league.id, name: league.name, season: String(league.season) },
          draft: null,
          picks: [],
        },
      });
    }

    const rosterInfo = new Map<number, { name: string; owner: string }>();
    for (const r of rosters) {
      // r.owner is the raw Sleeper user object (fetchRostersWithOwners), so it
      // uses Sleeper's snake_case display_name, not the transformed displayName.
      const name =
        r.owner?.metadata?.team_name ||
        r.owner?.display_name ||
        r.owner?.username ||
        `Team ${r.rosterId}`;
      const owner = r.owner?.display_name || r.owner?.username || 'Unknown';
      rosterInfo.set(r.rosterId, { name, owner });
    }

    const picks = draft.picks.map(pick => {
      const sleeperPlayer = allPlayers[pick.playerId];
      const team = rosterInfo.get(pick.rosterId);
      const playerName =
        sleeperPlayer?.full_name ||
        [sleeperPlayer?.first_name, sleeperPlayer?.last_name].filter(Boolean).join(' ') ||
        'Unknown Player';
      return {
        pickNo: pick.pickNo,
        round: pick.round,
        rosterId: pick.rosterId,
        rosterName: team?.name || `Team ${pick.rosterId}`,
        ownerName: team?.owner || 'Unknown',
        isKeeper: !!pick.isKeeper,
        player: {
          id: pick.playerId,
          name: playerName,
          position: sleeperPlayer?.position || null,
          team: sleeperPlayer?.team || null,
        },
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        league: { id: league.id, name: league.name, season: String(league.season) },
        draft: {
          id: draft.id,
          status: draft.status,
          type: draft.type,
          slotToRosterId: Object.values(draft.slotToRosterId ?? {}),
        },
        picks,
      },
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch draft',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};
