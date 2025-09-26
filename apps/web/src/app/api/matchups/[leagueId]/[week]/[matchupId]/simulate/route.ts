import { NextRequest, NextResponse } from 'next/server';
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import { getMatchups, getProjections, getPlayers, getLeague } from '@/lib/sleeper-direct';
import {
  calculateLeagueProjections,
  type ScoringSettings,
} from '@/lib/calculate-league-projections';
import axios from 'axios';

interface NFLGameState {
  team: string;
  state: 'pre' | 'in' | 'post';
  gameProgress: number; // 0-1 based on actual minutes elapsed
  minutesElapsed: number;
  minutesRemaining: number;
  gameDescription: string;
}

async function fetchEspnScoreboard() {
  try {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
    const { data } = await axios.get(url, { timeout: 10000 });
    return data;
  } catch (error) {
    console.warn('Failed to fetch ESPN scoreboard:', error);
    return null;
  }
}

function normalizeNflTeamAbbreviation(abbreviation?: string): string | undefined {
  if (!abbreviation) return abbreviation;
  const mapping: Record<string, string> = { WSH: 'WAS', JAC: 'JAX' };
  return mapping[abbreviation] || abbreviation;
}

/**
 * Build NFL game state map from ESPN scoreboard
 * This gives us the actual minute-by-minute progress of each NFL game
 */
function buildNflGameStateMap(espnData: any): Map<string, NFLGameState> {
  const gameStates = new Map<string, NFLGameState>();

  if (!espnData?.events) return gameStates;

  for (const event of espnData.events) {
    const competition = event?.competitions?.[0];
    const status = competition?.status?.type;

    if (!competition?.competitors || !status) continue;

    // Calculate actual game progress based on minutes
    let gameProgress = 0;
    let minutesElapsed = 0;
    let minutesRemaining = 60; // NFL game is 60 minutes
    let gameDescription = status.description || 'Unknown';

    if (status.state === 'pre') {
      gameProgress = 0;
      minutesElapsed = 0;
      minutesRemaining = 60;
    } else if (status.state === 'post') {
      gameProgress = 1;
      minutesElapsed = 60;
      minutesRemaining = 0; // Game is over, no time remaining
    } else if (status.state === 'in') {
      const period = status.period || 1;
      const clock = status.clock || 0; // seconds remaining in period

      // NFL: 4 quarters, 15 minutes (900 seconds) each
      const totalGameSeconds = 4 * 15 * 60; // 3600 seconds
      const elapsedSeconds = (period - 1) * 15 * 60 + (15 * 60 - clock);

      gameProgress = Math.min(Math.max(elapsedSeconds / totalGameSeconds, 0), 1);
      minutesElapsed = elapsedSeconds / 60;
      minutesRemaining = Math.max(0, 60 - minutesElapsed);

      // Enhanced description for live games
      const clockMinutes = Math.floor(clock / 60);
      const clockSeconds = clock % 60;
      gameDescription = `Q${period} ${clockMinutes}:${clockSeconds.toString().padStart(2, '0')}`;
    }

    // Apply to both teams in this game
    for (const competitor of competition.competitors) {
      const abbr = normalizeNflTeamAbbreviation(competitor.team?.abbreviation);
      if (abbr) {
        gameStates.set(abbr, {
          team: abbr,
          state: status.state as 'pre' | 'in' | 'post',
          gameProgress,
          minutesElapsed,
          minutesRemaining,
          gameDescription,
        });
      }
    }
  }

  return gameStates;
}

function toLineupPlayersWithMinutes(
  ids: string[],
  leagueProjections: Record<string, any>,
  playersMap: Record<string, any>,
  starterPoints: Record<string, number> | undefined,
  nflGameStates: Map<string, NFLGameState>
) {
  return (ids || []).map((id, index) => {
    const p = playersMap?.[id] || {};
    const currentScore = starterPoints?.[index.toString()] || 0;
    const fullProjection = leagueProjections[id]?.points || 0;

    // Get NFL game state for this player
    const nflTeam = normalizeNflTeamAbbreviation(p.team);
    const gameState = nflTeam ? nflGameStates.get(nflTeam) : null;

    // Calculate remaining projection based on actual game time
    let remainingProjection = fullProjection;

    if (gameState) {
      if (gameState.state === 'post') {
        // Game is over - NO projection remaining
        remainingProjection = 0;
      } else if (gameState.state === 'in') {
        // Game in progress - projection proportional to minutes remaining
        const projectionPerMinute = fullProjection / 60;
        remainingProjection = projectionPerMinute * gameState.minutesRemaining;
      } else {
        // Pre-game - full projection remains
        remainingProjection = fullProjection;
      }
    }

    return {
      id,
      name: p.full_name || id,
      position: p.position || 'FLEX',
      projection: remainingProjection, // This is the key change - adjusted based on actual time
      currentScore: Number(currentScore),
      nflTeam: nflTeam,

      // Additional data for UI transparency
      fullProjection,
      gameState: gameState
        ? {
            state: gameState.state,
            minutesElapsed: gameState.minutesElapsed,
            minutesRemaining: gameState.minutesRemaining,
            gameProgress: gameState.gameProgress,
            gameDescription: gameState.gameDescription,
          }
        : null,
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

    // Fetch data from Sleeper + ESPN
    const [matchups, rawProjections, players, league, espnScoreboard] = await Promise.all([
      getMatchups(leagueId, week),
      getProjections(week, '2025'),
      getPlayers(),
      getLeague(leagueId),
      fetchEspnScoreboard(),
    ]);

    // Build NFL game state map for minutes-based projections
    const nflGameStates = buildNflGameStateMap(espnScoreboard);

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
    const team1Players = toLineupPlayersWithMinutes(
      team1.starters || [],
      leagueProjections,
      playersMap,
      team1.starters_points,
      nflGameStates
    );
    const team2Players = toLineupPlayersWithMinutes(
      team2.starters || [],
      leagueProjections,
      playersMap,
      team2.starters_points,
      nflGameStates
    );

    // Minutes-based simulation with gameProgress=0 since we've adjusted projections
    const sim = await simulateMatchupProbabilityFromPlayers(
      team1Players as any,
      team2Players as any,
      20000, // Doubled from 10k to 20k iterations
      0 // gameProgress=0 since projections are already adjusted based on actual NFL time
    );

    // Calculate aggregate matchup game state for transparency
    const allPlayers = [...team1Players, ...team2Players];
    const gameStates = Array.from(new Set(allPlayers.map(p => p.nflTeam).filter(Boolean)))
      .map(team => (team ? nflGameStates.get(team) : null))
      .filter((state): state is NFLGameState => state !== null && state !== undefined);

    const avgMinutesRemaining =
      gameStates.length > 0
        ? gameStates.reduce((sum, state) => sum + (state?.minutesRemaining ?? 60), 0) /
          gameStates.length
        : 60;

    const avgGameProgress =
      gameStates.length > 0
        ? gameStates.reduce((sum, state) => sum + (state?.gameProgress ?? 0), 0) / gameStates.length
        : 0;

    const response = {
      success: true,
      source: 'sleeper-with-nfl-time-adjustment',
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
        iterations: 20000,
        computeTimeMs: 0,
        generatedAt: new Date().toISOString(),
        // New transparency data
        nflGameContext: {
          totalNflGames: gameStates.length,
          averageMinutesRemaining: avgMinutesRemaining,
          averageGameProgress: avgGameProgress,
          gameStates: gameStates.map(state => ({
            team: state?.team ?? 'UNK',
            state: state?.state ?? 'pre',
            gameDescription: state?.gameDescription ?? 'Scheduled',
            minutesRemaining: state?.minutesRemaining ?? 60,
            gameProgress: state?.gameProgress ?? 0,
          })),
        },
      },
      playersDistributions: [...team1Players, ...team2Players].map(p => ({
        playerId: p.id,
        playerName: p.name,
        position: p.position,
        mean: p.projection, // This is the adjusted projection
        p10: Math.max(0, p.projection * 0.7),
        median: p.projection,
        p90: p.projection * 1.3,
        stdDev: p.projection * 0.15,
        projection: p.projection,
        currentScore: p.currentScore,
        fullProjection: (p as any).fullProjection,
        gameState: (p as any).gameState,
        dataSource: 'minutes-based-adjustment',
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[SIMULATE] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to simulate' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
