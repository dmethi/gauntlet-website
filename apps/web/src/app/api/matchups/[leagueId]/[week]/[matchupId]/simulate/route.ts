import { NextRequest, NextResponse } from 'next/server';
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import { getMatchups, getProjections, getPlayers, getLeague } from '@/lib/sleeper-direct';
import {
  calculateLeagueProjections,
  type ScoringSettings,
} from '@/lib/calculate-league-projections';

function toLineupPlayers(
  ids: string[],
  leagueProjections: Record<string, any>,
  playersMap: Record<string, any>,
  starterPoints: Record<string, number> | undefined
) {
  return (ids || []).map((id, index) => {
    const p = playersMap?.[id] || {};
    // starters_points uses array indices as keys, not player IDs
    const currentScore = starterPoints?.[index.toString()] || 0;

    return {
      id,
      name: p.full_name || id,
      position: p.position || 'FLEX',
      projection: leagueProjections[id]?.points || 0,
      currentScore: Number(currentScore),
      nflTeam: p.team || undefined,
    };
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string; week: string; matchupId: string } }
) {
  try {
    const leagueId = params.leagueId;
    const week = parseInt(params.week, 10);
    const matchupId = parseInt(params.matchupId, 10);
    if (!leagueId || !Number.isFinite(week) || !Number.isFinite(matchupId)) {
      return NextResponse.json({ success: false, error: 'Invalid params' }, { status: 400 });
    }

    // Fetch data from Sleeper
    const [matchups, rawProjections, players, league] = await Promise.all([
      getMatchups(leagueId, week),
      getProjections(week, '2025'),
      getPlayers(),
      getLeague(leagueId),
    ]);

    // Convert projections to array while preserving player_id
    const rawProjectionsArray: any[] = Array.isArray(rawProjections)
      ? rawProjections
      : rawProjections
        ? Object.entries(rawProjections).map(([playerId, projection]) => ({
            ...(typeof projection === 'object' && projection !== null ? projection : {}),
            player_id: playerId,
          }))
        : [];

    // Calculate league-specific projections
    const scoringSettings: ScoringSettings = (league?.scoring_settings as ScoringSettings) || {};
    const leagueProjections = calculateLeagueProjections(rawProjectionsArray, scoringSettings);

    const pair = (matchups || []).filter((m: any) => m.matchup_id === matchupId);
    if (pair.length !== 2) {
      return NextResponse.json({ success: false, error: 'Matchup not found' }, { status: 404 });
    }

    const [team1, team2] = pair;
    const playersMap: Record<string, any> = players || {};
    const team1Players = toLineupPlayers(
      team1.starters || [],
      leagueProjections,
      playersMap,
      team1.starters_points
    );
    const team2Players = toLineupPlayers(
      team2.starters || [],
      leagueProjections,
      playersMap,
      team2.starters_points
    );

    // Simulation is working correctly with league-specific projections

    const sim = await simulateMatchupProbabilityFromPlayers(
      team1Players as any,
      team2Players as any,
      20000, // Doubled from 10k to 20k iterations
      0 // TODO: incorporate coarse gameProgress using NFL state if needed
    );

    const response = {
      success: true,
      source: 'sleeper',
      simulation: {
        team1Scores: sim.team1Scores,
        team2Scores: sim.team2Scores,
        team1WinPct: sim.team1WinPct,
        team2WinPct: sim.team2WinPct,
        medianMargin: Math.abs(sim.team1Scores.median - sim.team2Scores.median),
        impliedOdds: sim.impliedOdds,
        teams: [
          { rosterId: team1.roster_id, teamName: `Team ${team1.roster_id}`, players: team1Players },
          { rosterId: team2.roster_id, teamName: `Team ${team2.roster_id}`, players: team2Players },
        ],
        iterations: 10000,
        computeTimeMs: 0,
        generatedAt: new Date().toISOString(),
      },
      playersDistributions: [...team1Players, ...team2Players].map(p => ({
        playerId: p.id,
        playerName: p.name,
        position: p.position,
        mean: p.projection,
        p10: Math.max(0, p.projection * 0.7),
        median: p.projection,
        p90: p.projection * 1.3,
        stdDev: p.projection * 0.15,
        projection: p.projection,
        dataSource: 'projection',
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[SIMULATE] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to simulate' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
