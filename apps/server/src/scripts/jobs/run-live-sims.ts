import prisma from '../../lib/prisma.js';
import axios from 'axios';
import { simulateMatchupProbabilityFromPlayers, type LineupPlayer } from '@gauntlet/sim-engine';
// Note: Using direct calculation instead of importing from web lib to avoid path issues
// This mirrors the same logic used in the matchups page

interface ScoringSettings {
  [key: string]: number | undefined;
}

/**
 * Simple league projection calculation - mirrors web lib logic
 */
function calculateLeagueProjections(
  projections: any[],
  scoringSettings: ScoringSettings
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const projection of projections) {
    if (!projection.player_id) continue;

    // Simple calculation - just use pts_half_ppr if available, or calculate basic points
    let points = projection.pts_half_ppr || 0;

    // If no pts_half_ppr, do basic calculation using common scoring
    if (!points && scoringSettings) {
      points =
        (projection.rush_yd || 0) * (scoringSettings.rush_yd || 0.1) +
        (projection.rush_td || 0) * (scoringSettings.rush_td || 6) +
        (projection.rec || 0) * (scoringSettings.rec || 0.5) +
        (projection.rec_yd || 0) * (scoringSettings.rec_yd || 0.1) +
        (projection.rec_td || 0) * (scoringSettings.rec_td || 6) +
        (projection.pass_yd || 0) * (scoringSettings.pass_yd || 0.04) +
        (projection.pass_td || 0) * (scoringSettings.pass_td || 4);
    }

    result[projection.player_id] = { points };
  }

  return result;
}

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

async function getProjections(week: number): Promise<Record<string, any>> {
  try {
    const url = `https://api.sleeper.app/v1/projections/nfl/${2025}/${week}`;
    const response = await axios.get(url);
    return response.data || {};
  } catch (error) {
    console.warn('Failed to fetch projections:', error);
    return {};
  }
}

async function getPlayers(): Promise<Record<string, any>> {
  try {
    const url = 'https://api.sleeper.app/v1/players/nfl';
    const response = await axios.get(url);
    return response.data || {};
  } catch (error) {
    console.warn('Failed to fetch players:', error);
    return {};
  }
}

async function getLeague(leagueId: string): Promise<any> {
  try {
    const url = `https://api.sleeper.app/v1/league/${leagueId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch league:', error);
    return {};
  }
}

async function getMatchups(leagueId: string, week: number): Promise<any[]> {
  try {
    const url = `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`;
    const response = await axios.get(url);
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch matchups:', error);
    return [];
  }
}

function normalizeNflTeamAbbreviation(abbreviation?: string): string | undefined {
  if (!abbreviation) return abbreviation;
  const mapping: Record<string, string> = { WSH: 'WAS', JAC: 'JAX' };
  return mapping[abbreviation] || abbreviation;
}

/**
 * Build NFL game state map from ESPN scoreboard - EXACT SAME as matchups page
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

    // Calculate remaining projection based on actual game time - EXACT SAME as matchups page
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

      // Debug info for logging
      _debug: {
        fullProjection,
        remainingProjection,
        gameState: gameState
          ? {
              state: gameState.state,
              minutesElapsed: gameState.minutesElapsed,
              minutesRemaining: gameState.minutesRemaining,
              gameProgress: gameState.gameProgress,
              gameDescription: gameState.gameDescription,
            }
          : null,
      },
    };
  });
}

function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2024-09-05');
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1;
}

async function main() {
  const leagueId = process.argv[2];
  if (!leagueId) {
    console.error('Usage: ts-node run-live-sims.ts <leagueId>');
    process.exit(1);
  }

  const week = getCurrentWeek();

  console.log(`🚀 Starting MINUTES-BASED live sims for league ${leagueId}, week ${week}`);

  // Fetch all required data - SAME AS MATCHUPS PAGE
  const [matchups, rawProjections, players, league, espnScoreboard] = await Promise.all([
    getMatchups(leagueId, week),
    getProjections(week),
    getPlayers(),
    getLeague(leagueId),
    fetchEspnScoreboard(),
  ]);

  // Build NFL game state map for minutes-based projections - SAME AS MATCHUPS PAGE
  const nflGameStates = buildNflGameStateMap(espnScoreboard);

  console.log(`📊 NFL Game States:`);
  for (const [team, state] of nflGameStates.entries()) {
    console.log(
      `   ${team}: ${state.state} (${state.minutesElapsed.toFixed(1)}m elapsed, ${state.minutesRemaining.toFixed(1)}m remaining) - ${state.gameDescription}`
    );
  }

  // Convert projections to array while preserving player_id - SAME AS MATCHUPS PAGE
  const rawProjectionsArray = Array.isArray(rawProjections)
    ? rawProjections
    : Object.entries(rawProjections).map(([playerId, projection]) => ({
        ...(typeof projection === 'object' && projection !== null ? projection : {}),
        player_id: playerId,
      }));

  // Calculate league-specific projections - SAME AS MATCHUPS PAGE
  const scoringSettings: ScoringSettings = (league?.scoring_settings as ScoringSettings) || {};
  const leagueProjections = calculateLeagueProjections(rawProjectionsArray, scoringSettings);

  // Group matchups by matchup_id - SAME AS MATCHUPS PAGE
  const matchupGroups = new Map<number, any[]>();
  matchups.forEach(m => {
    if (m.matchup_id) {
      if (!matchupGroups.has(m.matchup_id)) {
        matchupGroups.set(m.matchup_id, []);
      }
      matchupGroups.get(m.matchup_id)!.push(m);
    }
  });

  // Process each matchup - SAME AS MATCHUPS PAGE
  for (const [matchupId, pair] of matchupGroups.entries()) {
    if (pair.length !== 2) continue;

    const [team1, team2] = pair;
    console.log(
      `\n🏈 Processing Matchup ${matchupId}: Roster ${team1.roster_id} vs Roster ${team2.roster_id}`
    );

    // Convert to lineup players with minutes-based adjustments - SAME AS MATCHUPS PAGE
    const team1Players = toLineupPlayersWithMinutes(
      team1.starters || [],
      leagueProjections,
      players,
      team1.starters_points,
      nflGameStates
    );

    const team2Players = toLineupPlayersWithMinutes(
      team2.starters || [],
      leagueProjections,
      players,
      team2.starters_points,
      nflGameStates
    );

    // Debug: Show projection adjustments
    console.log(`   Team 1 Players:`);
    team1Players.forEach(p => {
      const debug = (p as any)._debug;
      if (debug?.gameState) {
        console.log(
          `     ${p.name}: ${debug.fullProjection.toFixed(1)} → ${p.projection.toFixed(1)} pts (${debug.gameState.state}, ${debug.gameState.minutesRemaining.toFixed(1)}m left)`
        );
      } else {
        console.log(`     ${p.name}: ${p.projection.toFixed(1)} pts (no game data)`);
      }
    });

    console.log(`   Team 2 Players:`);
    team2Players.forEach(p => {
      const debug = (p as any)._debug;
      if (debug?.gameState) {
        console.log(
          `     ${p.name}: ${debug.fullProjection.toFixed(1)} → ${p.projection.toFixed(1)} pts (${debug.gameState.state}, ${debug.gameState.minutesRemaining.toFixed(1)}m left)`
        );
      } else {
        console.log(`     ${p.name}: ${p.projection.toFixed(1)} pts (no game data)`);
      }
    });

    // Minutes-based simulation with gameProgress=0 since we've adjusted projections - SAME AS MATCHUPS PAGE
    const sim = await simulateMatchupProbabilityFromPlayers(
      team1Players as any,
      team2Players as any,
      20000, // Same iterations as matchups page
      0 // gameProgress=0 since projections are already adjusted based on actual NFL time
    );

    const team1CurrentScore = team1.points || 0;
    const team2CurrentScore = team2.points || 0;

    console.log(`   📊 Results:`);
    console.log(`     Team 1 Win Probability: ${(sim.team1WinPct * 100).toFixed(1)}%`);
    console.log(`     Team 2 Win Probability: ${(sim.team2WinPct * 100).toFixed(1)}%`);
    console.log(
      `     Projected Final - Team 1: ${sim.team1Scores.mean.toFixed(1)} (current: ${team1CurrentScore.toFixed(1)})`
    );
    console.log(
      `     Projected Final - Team 2: ${sim.team2Scores.mean.toFixed(1)} (current: ${team2CurrentScore.toFixed(1)})`
    );

    // Store in database
    await (prisma as any).liveWinProbSample.create({
      data: {
        leagueId,
        week,
        matchupId,
        rosterAId: team1.roster_id,
        rosterBId: team2.roster_id,
        gameProgress: 0, // We're handling progress via projection adjustments
        winProbA: sim.team1WinPct,
        winProbB: sim.team2WinPct,
        projectedFinalA: sim.team1Scores.mean,
        projectedFinalB: sim.team2Scores.mean,
        currentScoreA: team1CurrentScore,
        currentScoreB: team2CurrentScore,
        spread: sim.impliedOdds.spread,
        total: sim.impliedOdds.total,
      },
    });
  }

  console.log('\n✅ Minutes-based live sims complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
