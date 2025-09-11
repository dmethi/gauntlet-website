/**
 * League Overview API - Migrated to Sleeper API
 * This is the new version that directly queries Sleeper API instead of database
 */

import { NextRequest, NextResponse } from 'next/server';
import SleeperAPIService from '@/../../server/src/services/sleeper/sleeper-api.service';
import ArchiveService from '@/../../server/src/services/archive/archive.service';

/**
 * Get current NFL week
 */
async function getCurrentWeek(): Promise<number> {
  const sleeper = SleeperAPIService.getInstance();
  const nflState = await sleeper.getNFLState();
  return nflState.week;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.url
    ? new URL(request.url)
    : { searchParams: new URLSearchParams() };
  const leagueId = searchParams.get('leagueId') || SleeperAPIService.LEAGUE_IDS.AFC;
  const debug = searchParams.has('debug');

  try {
    const startTime = Date.now();
    const sleeper = SleeperAPIService.getInstance();
    const archive = new ArchiveService();

    // Get current week
    const currentWeek = await getCurrentWeek();

    // Fetch all data in parallel from Sleeper
    const [league, rosters, users, nflState] = (await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getRosters(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getNFLState(),
    ])) as [any, any[], any[], any];

    // Fetch all matchups for the season in parallel
    const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1);
    const allMatchups = (await Promise.all(
      weeks.map(week => sleeper.getMatchups(leagueId, week))
    )) as any[][];

    // Build user map for quick lookups
    const userMap = new Map(users.map(u => [u.user_id, u]));

    // Process rosters with owner information
    const enrichedRosters = rosters.map(roster => {
      const owner = userMap.get(roster.owner_id) || null;

      // Format matchups for this roster
      const rosterMatchups: Array<{
        week: number;
        points: number;
        matchupId: number;
      }> = [];
      allMatchups.forEach((weekMatchups, weekIndex) => {
        const week = weekIndex + 1;
        const matchup = weekMatchups.find(m => m.roster_id === roster.roster_id);
        if (matchup) {
          rosterMatchups.push({
            week,
            points: matchup.points || 0,
            matchupId: matchup.matchup_id,
          });
        }
      });

      return {
        // Note: Using Sleeper's roster_id directly, no ID offset needed!
        id: roster.roster_id,
        leagueId,
        ownerId: roster.owner_id,
        coOwners: roster.co_owners || [],
        players: roster.players || [],
        starters: roster.starters || [],
        reserve: roster.reserve || [],
        settings: roster.settings || {},
        metadata: roster.metadata || {},

        // Enriched data
        owner: owner
          ? {
              id: owner.user_id,
              username: owner.username || owner.display_name,
              displayName: owner.display_name,
              avatar: owner.avatar,
              metadata: owner.metadata,
              isBot: owner.is_bot || false,
            }
          : null,

        // Simplified matchups
        matchups: rosterMatchups,

        // Calculate basic stats
        stats: {
          totalPoints: rosterMatchups.reduce((sum, m) => sum + m.points, 0),
          averagePoints:
            rosterMatchups.length > 0
              ? rosterMatchups.reduce((sum, m) => sum + m.points, 0) / rosterMatchups.length
              : 0,
          wins: 0, // Will be calculated from matchups
          losses: 0, // Will be calculated from matchups
        },
      };
    });

    // Calculate wins/losses
    allMatchups.forEach(weekMatchups => {
      const matchupGroups = new Map<number, any[]>();

      // Group by matchup_id
      weekMatchups.forEach(m => {
        if (!matchupGroups.has(m.matchup_id)) {
          matchupGroups.set(m.matchup_id, []);
        }
        matchupGroups.get(m.matchup_id)!.push(m);
      });

      // Determine winners
      matchupGroups.forEach(pair => {
        if (pair.length === 2) {
          const [team1, team2] = pair;
          const winner = (team1.points || 0) > (team2.points || 0) ? team1 : team2;
          const loser = winner === team1 ? team2 : team1;

          const winnerRoster = enrichedRosters.find(r => r.id === winner.roster_id);
          const loserRoster = enrichedRosters.find(r => r.id === loser.roster_id);

          if (winnerRoster) winnerRoster.stats.wins++;
          if (loserRoster) loserRoster.stats.losses++;
        }
      });
    });

    // Format response
    const response = {
      // League data
      id: league.league_id,
      name: league.name,
      season: league.season,
      seasonType: league.season_type,
      status: league.status,
      sport: league.sport,
      totalRosters: league.total_rosters,
      settings: league.settings,
      scoringSettings: league.scoring_settings,
      rosterPositions: league.roster_positions,
      metadata: league.metadata,
      previousLeagueId: league.previous_league_id,
      draftId: league.draft_id,

      // Current state
      currentWeek: nflState.week,

      // Enriched rosters
      rosters: enrichedRosters,

      // Metadata
      _meta: {
        source: 'sleeper_api',
        cached: false,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };

    // Archive for historical tracking (async, don't wait)
    if (!debug) {
      archive
        .saveSnapshot('league', leagueId, response, {
          week: currentWeek,
          season: league.season,
        })
        .catch(console.error);
    }

    // Cache headers for edge caching
    const isLive = await sleeper.isGameLive();
    const cacheSeconds = isLive ? 30 : 300; // 30s if live, 5 min otherwise

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=60`,
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Data-Source': 'sleeper_api',
      },
    });
  } catch (error) {
    console.error('❌ API Error:', error);

    // Try to load from archive as fallback
    const archive = new ArchiveService();
    const archived = await archive.loadSnapshot('league', leagueId);

    if (archived) {
      console.log('📁 Using archived data as fallback');
      return NextResponse.json(
        {
          ...archived,
          _meta: {
            ...(archived._meta || {}),
            fallback: true,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        {
          headers: {
            'X-Data-Source': 'archive_fallback',
            'Cache-Control': 'public, s-maxage=60', // Short cache for fallback
          },
        }
      );
    }

    // No fallback available
    return NextResponse.json(
      {
        error: 'Failed to fetch league data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
