/**
 * Matchups API - Migrated to Sleeper API
 * Fetches matchup data directly from Sleeper with projections
 */

import { NextRequest, NextResponse } from 'next/server';
import SleeperAPIService from '../../../../../../../server/src/services/sleeper/sleeper-api.service';
import prisma from '../../../../../../../server/src/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  const { leagueId, week } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  try {
    const startTime = Date.now();
    const weekNumber = parseInt(week);

    if (!leagueId || Number.isNaN(weekNumber)) {
      return NextResponse.json({ error: 'Invalid leagueId or week parameter' }, { status: 400 });
    }

    const sleeper = SleeperAPIService.getInstance();

    // First get NFL state to use in projections call
    const nflState = await sleeper.getNFLState();

    // Fetch all required data in parallel
    const [league, rosters, users, matchups, projections, players] = (await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getRosters(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getMatchups(leagueId, weekNumber),
      sleeper.getProjections(weekNumber, nflState?.season || '2025'),
      sleeper.getPlayers(),
    ])) as [any, any[], any[], any[], any, any];

    // Try to fetch odds/simulations from our minimal DB (if they exist)
    let simulations: any[] = [];
    try {
      simulations = await prisma.matchupSimulation.findMany({
        where: {
          leagueId,
          week: weekNumber,
        },
      });
    } catch (e) {
      // Database might not have simulation data yet
      console.log('No simulation data available');
    }

    // Build user and roster maps
    const userMap = new Map(users.map(u => [u.user_id, u]));
    const rosterMap = new Map(rosters.map(r => [r.roster_id, r]));

    // Process matchups with enriched data
    const enrichedMatchups = matchups.map(matchup => {
      const roster = rosterMap.get(matchup.roster_id);
      const owner = roster ? userMap.get(roster.owner_id) : null;

      // Calculate projected points for starters
      let projectedPoints = 0;
      const starterProjections: Record<string, number> = {};

      if (matchup.starters) {
        matchup.starters.forEach((playerId: string) => {
          const projection = projections[playerId];
          if (projection) {
            const points = calculateProjectedPoints(projection, league.scoring_settings);
            starterProjections[playerId] = points;
            projectedPoints += points;
          }
        });
      }

      // Find simulation data for this matchup (if exists)
      const simulation = simulations.find(s => s.matchupId === matchup.matchup_id);

      return {
        // Core matchup data
        matchupId: matchup.matchup_id,
        rosterId: matchup.roster_id,
        week: weekNumber,
        points: matchup.points || 0,
        customPoints: matchup.custom_points,

        // Players
        starters: matchup.starters || [],
        startersPoints: matchup.starters_points || {},
        players: matchup.players || [],
        playersPoints: matchup.players_points || {},

        // Projections
        projectedPoints,
        starterProjections,

        // Roster/Owner info
        roster: roster
          ? {
              id: roster.roster_id,
              settings: roster.settings,
              metadata: roster.metadata,
            }
          : null,

        owner: owner
          ? {
              id: owner.user_id,
              username: owner.username || owner.display_name,
              displayName: owner.display_name,
              avatar: owner.avatar,
              teamName: owner.metadata?.team_name || owner.display_name,
            }
          : null,

        // Odds/Simulation data (if available)
        odds: simulation
          ? {
              winProbability:
                matchup.roster_id === simulation.rosterAId
                  ? simulation.teamAWinPct
                  : simulation.teamBWinPct,
              projectedScore:
                matchup.roster_id === simulation.rosterAId
                  ? simulation.teamAMean
                  : simulation.teamBMean,
              spread: simulation.impliedSpread,
              moneyLine:
                matchup.roster_id === simulation.rosterAId
                  ? simulation.moneyLineA
                  : simulation.moneyLineB,
            }
          : null,
      };
    });

    // Group matchups by matchup_id
    const matchupPairs = new Map<number, any[]>();
    enrichedMatchups.forEach(m => {
      if (!matchupPairs.has(m.matchupId)) {
        matchupPairs.set(m.matchupId, []);
      }
      matchupPairs.get(m.matchupId)!.push(m);
    });

    // Format response
    const response = {
      league: {
        id: league.league_id,
        name: league.name,
        totalRosters: league.total_rosters,
        scoringSettings: league.scoring_settings,
      },
      week: weekNumber,
      matchups: enrichedMatchups,
      matchupPairs: Array.from(matchupPairs.entries()).map(([id, teams]) => ({
        matchupId: id,
        teams,
      })),
      _meta: {
        source: 'sleeper_api',
        hasSimulations: simulations.length > 0,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };

    // Cache headers
    const isLive = await sleeper.isGameLive();
    const cacheSeconds = isLive ? 10 : 60; // 10s if live, 60s otherwise

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=30`,
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Data-Source': 'sleeper_api',
      },
    });
  } catch (error) {
    console.error('❌ Matchups API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch matchups',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate projected points based on scoring settings
 */
function calculateProjectedPoints(projection: any, scoringSettings: any): number {
  let points = 0;

  // Standard scoring categories
  const scoring = scoringSettings || {};

  // Passing
  if (projection.pass_yd !== undefined) {
    points += projection.pass_yd * (scoring.pass_yd || 0.04);
  }
  if (projection.pass_td !== undefined) {
    points += projection.pass_td * (scoring.pass_td || 4);
  }
  if (projection.pass_int !== undefined) {
    points += projection.pass_int * (scoring.pass_int || -1);
  }

  // Rushing
  if (projection.rush_yd !== undefined) {
    points += projection.rush_yd * (scoring.rush_yd || 0.1);
  }
  if (projection.rush_td !== undefined) {
    points += projection.rush_td * (scoring.rush_td || 6);
  }

  // Receiving
  if (projection.rec !== undefined) {
    points += projection.rec * (scoring.rec || 0.5); // Half PPR default
  }
  if (projection.rec_yd !== undefined) {
    points += projection.rec_yd * (scoring.rec_yd || 0.1);
  }
  if (projection.rec_td !== undefined) {
    points += projection.rec_td * (scoring.rec_td || 6);
  }

  // Fumbles
  if (projection.fum_lost !== undefined) {
    points += projection.fum_lost * (scoring.fum_lost || -2);
  }

  // Kicking
  if (projection.fgm !== undefined) {
    points += projection.fgm * (scoring.fgm || 3);
  }
  if (projection.xpm !== undefined) {
    points += projection.xpm * (scoring.xpm || 1);
  }

  // Defense/Special Teams
  if (projection.def_td !== undefined) {
    points += projection.def_td * (scoring.def_td || 6);
  }
  if (projection.sack !== undefined) {
    points += projection.sack * (scoring.sack || 1);
  }
  if (projection.int !== undefined) {
    points += projection.int * (scoring.int || 2);
  }

  return Math.round(points * 100) / 100; // Round to 2 decimal places
}
