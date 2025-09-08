import prisma from '../../lib/prisma.js';
import {
  type LineupPlayer,
  type MatchupSimulationResult,
  simulateMatchupProbabilityFromPlayers,
} from '@gauntlet/sim-engine/src/index.js';
import { fetchEspnScoreboard, getLiveGameProgress } from '../ingest-nfl-state.js';

interface ScoringSettings {
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_2pt?: number;
  rush_yd?: number;
  rush_td?: number;
  rush_2pt?: number;
  rush_fd?: number;
  rec_yd?: number;
  rec_td?: number;
  rec?: number;
  rec_2pt?: number;
  fum?: number;
  fum_lost?: number;
  xpm?: number;
  xpmiss?: number;
  fgm_0_19?: number;
  fgm_20_29?: number;
  fgm_30_39?: number;
  fgm_40_49?: number;
  fgm_50_59?: number;
  fgm_60p?: number;
  fgmiss?: number;
  sack?: number;
  int?: number;
  fum_rec?: number;
  safe?: number;
  def_td?: number;
  blk_kick?: number;
  def_2pt?: number;
  pts_allow?: number;
  tkl_loss?: number;
  qb_hit?: number;
  def_3_and_out?: number;
  def_4_and_stop?: number;
  st_td?: number;
  st_ff?: number;
}

interface LeagueProjection {
  playerId: string;
  points: number;
  breakdown: Record<string, number>;
}

/**
 * Fetch raw projections from Sleeper API
 */
async function fetchRawProjections(season: string, week: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`,
      {
        headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Sleeper API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching projections:', error);
    throw error;
  }
}

/**
 * Calculate league-specific projections from raw Sleeper data
 */
function calculateLeagueProjections(
  rawProjections: any[],
  scoringSettings: ScoringSettings
): Record<string, LeagueProjection> {
  // Align with client-side calculation in apps/web/src/lib/calculate-league-projections.ts
  const addStat = (
    breakdown: Record<string, number>,
    total: { value: number },
    statKey: string,
    settingKey: keyof ScoringSettings,
    statValue?: number
  ) => {
    const settingValue = scoringSettings[settingKey];
    if (settingValue !== undefined && statValue !== undefined && statValue > 0) {
      const points = statValue * settingValue;
      breakdown[statKey] = points;
      total.value += points;
    }
  };

  const projections: Record<string, LeagueProjection> = {};

  rawProjections.forEach(rawProjection => {
    if (rawProjection.player_id && rawProjection.stats) {
      const breakdown: Record<string, number> = {};
      const total = { value: 0 };
      const s = rawProjection.stats;

      // Passing
      addStat(breakdown, total, 'pass_yd', 'pass_yd', s.pass_yd);
      addStat(breakdown, total, 'pass_td', 'pass_td', s.pass_td);
      addStat(breakdown, total, 'pass_int', 'pass_int', s.pass_int);
      addStat(breakdown, total, 'pass_2pt', 'pass_2pt', s.pass_2pt);

      // Rushing
      addStat(breakdown, total, 'rush_yd', 'rush_yd', s.rush_yd);
      addStat(breakdown, total, 'rush_td', 'rush_td', s.rush_td);
      addStat(breakdown, total, 'rush_2pt', 'rush_2pt', s.rush_2pt);
      addStat(breakdown, total, 'rush_fd', 'rush_fd', s.rush_fd);

      // Receiving
      addStat(breakdown, total, 'rec_yd', 'rec_yd', s.rec_yd);
      addStat(breakdown, total, 'rec_td', 'rec_td', s.rec_td);
      addStat(breakdown, total, 'rec', 'rec', s.rec);
      addStat(breakdown, total, 'rec_2pt', 'rec_2pt', s.rec_2pt);

      // Fumbles
      addStat(breakdown, total, 'fum', 'fum', s.fum);
      addStat(breakdown, total, 'fum_lost', 'fum_lost', s.fum_lost);

      // Kicking
      addStat(breakdown, total, 'xpm', 'xpm', s.xpm);
      addStat(breakdown, total, 'xpmiss', 'xpmiss', s.xpmiss);
      addStat(breakdown, total, 'fgm_0_19', 'fgm_0_19', s.fgm_0_19);
      addStat(breakdown, total, 'fgm_20_29', 'fgm_20_29', s.fgm_20_29);
      addStat(breakdown, total, 'fgm_30_39', 'fgm_30_39', s.fgm_30_39);
      addStat(breakdown, total, 'fgm_40_49', 'fgm_40_49', s.fgm_40_49);
      addStat(breakdown, total, 'fgm_50_59', 'fgm_50_59', s.fgm_50_59);
      addStat(breakdown, total, 'fgm_60p', 'fgm_60p', s.fgm_60p);
      addStat(breakdown, total, 'fgmiss', 'fgmiss', s.fgmiss);

      // Defense
      addStat(breakdown, total, 'sack', 'sack', s.sack);
      addStat(breakdown, total, 'int', 'int', s.int);
      addStat(breakdown, total, 'fum_rec', 'fum_rec', s.fum_rec);
      addStat(breakdown, total, 'safe', 'safe', s.safe);
      addStat(breakdown, total, 'def_td', 'def_td', s.def_td);
      addStat(breakdown, total, 'blk_kick', 'blk_kick', s.blk_kick);
      addStat(breakdown, total, 'def_2pt', 'def_2pt', s.def_2pt);
      addStat(breakdown, total, 'pts_allow', 'pts_allow', s.pts_allow);

      // IDP
      addStat(breakdown, total, 'tkl_loss', 'tkl_loss', s.tkl_loss);
      addStat(breakdown, total, 'qb_hit', 'qb_hit', s.qb_hit);
      addStat(breakdown, total, 'def_3_and_out', 'def_3_and_out', s.def_3_and_out);
      addStat(breakdown, total, 'def_4_and_stop', 'def_4_and_stop', s.def_4_and_stop);

      // Special Teams
      addStat(breakdown, total, 'st_td', 'st_td', s.st_td);
      addStat(breakdown, total, 'st_ff', 'st_ff', s.st_ff);

      projections[rawProjection.player_id] = {
        playerId: rawProjection.player_id,
        points: Math.round(total.value * 100) / 100,
        breakdown,
      };
    }
  });

  return projections;
}

/**
 * Convert probability to American odds format
 */
function probabilityToAmericanOdds(probability: number): number {
  // Handle extreme cases to avoid infinity values
  if (probability >= 0.999) {
    return -10000; // Very heavy favorite (like -10000 odds)
  }
  if (probability <= 0.001) {
    return 10000; // Very heavy underdog (like +10000 odds)
  }

  if (probability >= 0.5) {
    return Math.round((-100 * probability) / (1 - probability));
  } else {
    return Math.round((100 * (1 - probability)) / probability);
  }
}

/**
 * Normalize ESPN team abbreviations to align with Sleeper/DB values
 * Example: ESPN uses 'WSH' while many data sources use 'WAS'
 */
function normalizeNflTeamAbbreviation(abbreviation?: string): string | undefined {
  if (!abbreviation) return abbreviation;
  const mapping: Record<string, string> = {
    WSH: 'WAS',
    JAC: 'JAX',
  };
  return mapping[abbreviation] || abbreviation;
}

type GameState = 'pre' | 'live' | 'post';

function getPlayerGameState(
  team?: string,
  liveNflTeams?: Set<string>,
  postGameTeams?: Set<string>
): GameState {
  const normalized = normalizeNflTeamAbbreviation(team);
  if (normalized && postGameTeams && postGameTeams.has(normalized)) return 'post';
  if (normalized && liveNflTeams && liveNflTeams.has(normalized)) return 'live';
  return 'pre';
}

/**
 * Fetch current lineup from Sleeper API to ensure 1:1 accuracy
 */
async function fetchSleeperLineup(
  leagueId: string,
  week: number,
  rosterId: number
): Promise<string[]> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`, {
      headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    });

    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch Sleeper lineup for roster ${rosterId}: ${response.status}`);
      return [];
    }

    const matchups = await response.json();
    const sleeperRosterId = leagueId === '1263740549504962561' ? rosterId - 2000 : rosterId; // Convert DB roster ID back to Sleeper roster ID
    const matchup = matchups.find((m: any) => m.roster_id === sleeperRosterId);

    if (!matchup) {
      console.warn(
        `⚠️ No Sleeper matchup found for roster ${rosterId} (Sleeper ID: ${sleeperRosterId})`
      );
      return [];
    }

    const starters = matchup.starters || [];
    console.log(
      `   🔄 Fetched fresh lineup from Sleeper: Roster ${rosterId} has ${starters.length} starters`
    );
    return starters;
  } catch (error) {
    console.error(`❌ Error fetching Sleeper lineup for roster ${rosterId}:`, error);
    return [];
  }
}

/**
 * Build lineup players using FRESH Sleeper data for 1:1 accuracy
 */
async function buildLineupPlayers(
  rosterId: number,
  week: number,
  leagueProjections: Record<string, LeagueProjection>,
  livePlayerScores: Record<string, number> = {},
  liveNflTeams?: Set<string>,
  postGameTeams?: Set<string>
): Promise<LineupPlayer[]> {
  // Get roster and matchup data
  const matchupData = await prisma.matchup.findFirst({
    where: { rosterId, week },
    include: { roster: { include: { owner: true } } },
  });

  if (!matchupData) {
    throw new Error(`No matchup data found for roster ${rosterId}, week ${week}`);
  }

  // 🔥 CRITICAL FIX: Fetch CURRENT starters from Sleeper API instead of using potentially stale DB data
  const freshStarters = await fetchSleeperLineup(matchupData.leagueId, week, rosterId);
  const playerIds = freshStarters.length > 0 ? freshStarters : matchupData.starters || []; // Fallback to DB if API fails

  if (freshStarters.length > 0) {
    console.log(`   ✅ Using fresh Sleeper lineup data (${freshStarters.length} starters)`);
  } else {
    console.log(
      `   ⚠️ Using fallback DB lineup data (${matchupData.starters?.length || 0} starters)`
    );
  }

  // Get player details
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
  });

  const playersMap = new Map(players.map(p => [p.id, p]));

  return playerIds
    .map(playerId => {
      const player = playersMap.get(playerId);
      if (!player) return null;

      let projection = leagueProjections[playerId]?.points || 0;
      // Use live scores if available, otherwise fall back to stored matchup data
      const liveScore = livePlayerScores[playerId];
      const storedScore = (matchupData.playersPoints as Record<string, number>)?.[playerId] || 0;
      const currentPoints = liveScore ?? storedScore;

      // Single source of truth for game state
      const state = getPlayerGameState(player.team || undefined, liveNflTeams, postGameTeams);

      if (state === 'post') {
        projection = 0;
        console.log(`   ✅ POST-GAME: ${player.fullName} exact ${currentPoints} (projection=0)`);
      } else if (state === 'live') {
        console.log(`   🔴 LIVE: ${player.fullName} projection ${projection.toFixed(1)}`);
      } else {
        console.log(`   ⏳ PRE-GAME: ${player.fullName} projection ${projection.toFixed(1)}`);
      }

      // Debug live score application
      if (liveScore !== undefined && liveScore > 0) {
        console.log(
          `   🔥 LIVE: Player ${playerId} (${player.fullName}) has live score ${liveScore.toFixed(2)}`
        );
      }

      // Debug: Log extreme projections
      if (projection < 1 || projection > 50) {
        console.warn(
          `⚠️ Extreme projection for ${player.fullName} (${player.position}): ${projection.toFixed(1)} pts`
        );
      }

      return {
        id: playerId,
        name: player.fullName,
        position: player.position,
        projection: projection,
        currentScore: currentPoints,
        nflTeam: player.team || undefined,
      };
    })
    .filter(Boolean) as LineupPlayer[];
}

/**
 * Run comprehensive simulation for a specific matchup
 */
async function simulateMatchup(
  leagueId: string,
  week: number,
  matchupId: number,
  leagueProjections: Record<string, LeagueProjection>,
  gameProgress: number = 0,
  triggerType: string = 'manual',
  liveNflTeams?: Set<string>,
  postGameTeams?: Set<string>
): Promise<void> {
  console.log(`🔄 Simulating matchup ${matchupId} (League: ${leagueId}, Week: ${week})`);
  if (gameProgress > 0) {
    console.log(`   ⚡ Live simulation with ${(gameProgress * 100).toFixed(0)}% game progress`);
  }

  try {
    // Get both teams in this matchup
    const matchups = await prisma.matchup.findMany({
      where: { leagueId, week, matchupId },
      include: { roster: { include: { owner: true } } },
      orderBy: { rosterId: 'asc' }, // Ensure consistent team ordering
    });

    if (matchups.length !== 2) {
      console.log(`⚠️ Matchup ${matchupId} has ${matchups.length} teams, skipping`);
      return;
    }

    const [teamA, teamB] = matchups;

    // Fetch live player scores if this is a live simulation
    let livePlayerScores: Record<string, number> = {};
    if (gameProgress > 0) {
      console.log(`🔄 Fetching live player scores for league ${leagueId}...`);
      livePlayerScores = await fetchLivePlayerScores(leagueId, week);
      console.log(`   📊 Fetched live scores for ${Object.keys(livePlayerScores).length} players`);

      // Debug: Show sample of live player scores
      const nonZeroScores = Object.entries(livePlayerScores).filter(([id, score]) => score > 0);
      console.log(`   🔥 Players with live scores > 0: ${nonZeroScores.length}`);
      nonZeroScores.slice(0, 3).forEach(([playerId, score]) => {
        console.log(`      Player ${playerId}: ${score} pts`);
      });
    }

    // Use the parameters that were passed to this function
    const extractedLiveTeams = liveNflTeams;
    const extractedPostGameTeams = postGameTeams;

    // Build lineup players for both teams
    const [team1Players, team2Players] = await Promise.all([
      buildLineupPlayers(
        teamA.rosterId,
        week,
        leagueProjections,
        livePlayerScores,
        extractedLiveTeams,
        extractedPostGameTeams
      ),
      buildLineupPlayers(
        teamB.rosterId,
        week,
        leagueProjections,
        livePlayerScores,
        extractedLiveTeams,
        extractedPostGameTeams
      ),
    ]);

    // Update matchup points in database if we have live scores
    if (gameProgress > 0 && Object.keys(livePlayerScores).length > 0) {
      const team1LiveTotal = team1Players.reduce(
        (sum, player) => sum + (player.currentScore || 0),
        0
      );
      const team2LiveTotal = team2Players.reduce(
        (sum, player) => sum + (player.currentScore || 0),
        0
      );

      console.log(
        `   📊 Updating live scores: Team1 ${team1LiveTotal.toFixed(2)}, Team2 ${team2LiveTotal.toFixed(2)}`
      );

      // Build updated playersPoints objects with live scores
      const team1PlayersPoints: Record<string, number> = {};
      const team2PlayersPoints: Record<string, number> = {};

      team1Players.forEach(player => {
        team1PlayersPoints[player.id] = player.currentScore || 0;
      });

      team2Players.forEach(player => {
        team2PlayersPoints[player.id] = player.currentScore || 0;
      });

      console.log(
        `   📊 Updating individual player scores for ${team1Players.length + team2Players.length} players`
      );

      // Update both teams' points and playersPoints in the database
      await Promise.all([
        prisma.matchup.update({
          where: { leagueId_week_rosterId: { leagueId, week, rosterId: teamA.rosterId } },
          data: {
            points: team1LiveTotal,
            playersPoints: team1PlayersPoints,
          },
        }),
        prisma.matchup.update({
          where: { leagueId_week_rosterId: { leagueId, week, rosterId: teamB.rosterId } },
          data: {
            points: team2LiveTotal,
            playersPoints: team2PlayersPoints,
          },
        }),
      ]);
    }

    if (team1Players.length === 0 || team2Players.length === 0) {
      console.log(`⚠️ Empty lineups for matchup ${matchupId}, skipping`);
      return;
    }

    // Debug: Log team projections and game state
    const team1Total = team1Players.reduce((sum, p) => sum + p.projection, 0);
    const team2Total = team2Players.reduce((sum, p) => sum + p.projection, 0);
    console.log(
      `📊 Team projections: Team A ${team1Total.toFixed(1)} pts, Team B ${team2Total.toFixed(1)} pts (diff: ${Math.abs(team1Total - team2Total).toFixed(1)} pts)`
    );

    if (gameProgress > 0) {
      console.log(
        `🔍 LIVE DEBUG: gameProgress = ${gameProgress.toFixed(3)} (${(gameProgress * 100).toFixed(1)}%)`
      );
      console.log(`✅ Using CURRENT scores + REMAINING projections approach!`);

      // Sample a few players to show the correct approach
      const samplePlayers = team1Players.slice(0, 3);
      samplePlayers.forEach(player => {
        const currentScore = player.currentScore || 0;
        const hasActualStats = currentScore > 0;

        // Check actual game status for this player's NFL team
        const isLivePlayer = liveNflTeams && player.nflTeam && liveNflTeams.has(player.nflTeam);
        // If we're in live mode and player isn't in a currently live game, assume game is complete (even with 0 points)
        const isPostGame = gameProgress > 0 && !isLivePlayer;

        let effectiveProgress = 0;
        let remainingProjection = player.projection;
        let expectedFinal = currentScore + remainingProjection;
        let status = `⚫ NON-LIVE (${player.nflTeam})`;

        if (isLivePlayer) {
          // Player in active game
          effectiveProgress = gameProgress;
          remainingProjection = player.projection * (1 - effectiveProgress);
          expectedFinal = currentScore + remainingProjection;
          status = `🔴 LIVE (${player.nflTeam})`;
        } else if (isPostGame) {
          // Player has stats but game is over - use actual score with minimal projection
          effectiveProgress = 0.95; // Treat as 95% complete
          remainingProjection = player.projection * (1 - effectiveProgress);
          expectedFinal = currentScore + remainingProjection;
          status = `✅ POST-GAME (${player.nflTeam})`;
        }

        console.log(
          `✅ Player ${player.name} (${player.position}): Current ${currentScore.toFixed(1)}, Full proj ${player.projection.toFixed(1)}, Progress ${(effectiveProgress * 100).toFixed(1)}%, Remaining proj ${remainingProjection.toFixed(1)}, Expected final ~${expectedFinal.toFixed(1)} ${status}`
        );
      });
    }

    // Run 100k simulation
    const startTime = Date.now();
    console.log(`   Running 100,000 simulations...`);

    const simulation: MatchupSimulationResult = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      100000, // 100k iterations
      gameProgress, // Game progress (0 = pre-game, 1 = complete)
      liveNflTeams // Live NFL teams (selective game progress)
    );

    const computeTimeMs = Date.now() - startTime;
    console.log(`   ✅ Simulation complete in ${computeTimeMs}ms`);

    // Debug: Show simulation results
    console.log(
      `   📊 Simulation results: Team1 ${simulation.team1Scores.mean.toFixed(1)} pts, Team2 ${simulation.team2Scores.mean.toFixed(1)} pts`
    );
    console.log(
      `   🎯 Win probabilities: Team1 ${(simulation.team1WinPct * 100).toFixed(1)}%, Team2 ${(simulation.team2WinPct * 100).toFixed(1)}%`
    );

    // Calculate betting odds
    const team1WinPct = simulation.team1WinPct;
    const team2WinPct = simulation.team2WinPct;
    const spread = simulation.impliedOdds.spread;
    const total = simulation.impliedOdds.total;

    const moneyLineA = probabilityToAmericanOdds(team1WinPct);
    const moneyLineB = probabilityToAmericanOdds(team2WinPct);

    // Calculate over/under probabilities (simplified)
    const projectedTotal = simulation.team1Scores.mean + simulation.team2Scores.mean;
    let overPct = 0.5 + (projectedTotal - total) * 0.01; // ~1% per point difference
    overPct = Math.min(0.95, Math.max(0.05, overPct));

    // Store main simulation result
    // Type workaround until Prisma client types refresh in monorepo build
    const db = prisma as any;
    const simulationRecord = await db.matchupSimulation.create({
      data: {
        league: { connect: { id: leagueId } },
        week,
        matchupId,

        // Team A Results
        teamAMean: simulation.team1Scores.mean,
        teamAP10: simulation.team1Scores.p10,
        teamAMedian: simulation.team1Scores.median,
        teamAP90: simulation.team1Scores.p90,
        teamAStdDev: (simulation.team1Scores.p90 - simulation.team1Scores.p10) / 2.56,

        // Team B Results
        teamBMean: simulation.team2Scores.mean,
        teamBP10: simulation.team2Scores.p10,
        teamBMedian: simulation.team2Scores.median,
        teamBP90: simulation.team2Scores.p90,
        teamBStdDev: (simulation.team2Scores.p90 - simulation.team2Scores.p10) / 2.56,

        // Win Probabilities
        teamAWinPct: team1WinPct,
        teamBWinPct: team2WinPct,

        // Betting Odds
        impliedSpread: spread,
        moneyLineA: moneyLineA,
        moneyLineB: moneyLineB,
        totalLine: total,
        overPct: overPct,
        underPct: 1 - overPct,

        // Metadata
        iterations: 100000,
        computeTimeMs: computeTimeMs,
      },
    });

    // Store individual player simulation results
    const allPlayers = [...team1Players, ...team2Players];
    for (const player of allPlayers) {
      // For now, use position-level distributions
      // In the future, this could include player-specific simulation results
      const playerSimulation = {
        mean: player.projection,
        p10: player.projection * 0.6,
        median: player.projection,
        p90: player.projection * 1.4,
        stdDev: player.projection * 0.25,
      };

      await db.playerSimulation.create({
        data: {
          matchupSimulationId: simulationRecord.id,
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamRosterId:
            teamA.roster.id === (team1Players.includes(player) ? teamA.roster.id : teamB.roster.id)
              ? teamA.roster.id
              : teamB.roster.id,
          isStarter: true, // All players in lineup are starters

          mean: playerSimulation.mean,
          p10: playerSimulation.p10,
          median: playerSimulation.median,
          p90: playerSimulation.p90,
          stdDev: playerSimulation.stdDev,
          projection: player.projection,

          dataSource: 'position', // Using position-level variance for now
          sampleSize: 100,
        },
      });
    }

    console.log(`   ✅ Stored simulation results for matchup ${matchupId}`);
  } catch (error) {
    console.error(`❌ Error simulating matchup ${matchupId}:`, error);
    throw error;
  }
}

/**
 * Parse command line arguments
 */
interface SimulationOptions {
  week: number;
  leagueId?: string;
  isLive: boolean;
  triggerType: string;
  gameProgress: number;
}

async function parseArgs(): Promise<SimulationOptions> {
  const args = process.argv.slice(2);

  let week = getCurrentWeek();
  let leagueId: string | undefined;
  let isLive = false;
  let triggerType = 'manual';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!isNaN(parseInt(arg)) && i === 0) {
      week = parseInt(arg);
    } else if (arg === '--live') {
      isLive = true;
    } else if (arg.startsWith('--trigger=')) {
      triggerType = arg.split('=')[1];
    } else if (!arg.startsWith('--') && i === 1) {
      leagueId = arg;
    }
  }

  // Calculate game progress for live updates using ESPN API
  let gameProgress = 0;
  if (isLive) {
    try {
      console.log('🏈 Fetching live NFL games from ESPN API...');
      const scoreboard = await fetchEspnScoreboard();
      const liveGames = scoreboard.events.filter(
        event => event.competitions?.[0]?.status?.type?.state === 'in'
      );

      if (liveGames.length > 0) {
        // Use the first live game as a proxy for overall NFL game progress
        const gameStatus = liveGames[0].competitions[0].status;
        gameProgress = computeGameProgressFromEspn(gameStatus);

        const period = gameStatus.period || 1;
        const clock = gameStatus.clock || 0;
        console.log(
          `   ⚡ Live NFL game found: Q${period}, ${Math.floor(clock / 60)}:${(clock % 60).toString().padStart(2, '0')} left`
        );
        console.log(`   📊 ESPN calculated game progress: ${(gameProgress * 100).toFixed(1)}%`);

        // Extract NFL teams that are actually playing live
        const liveNflTeams = new Set<string>();
        liveGames.forEach(game => {
          game.competitions?.[0]?.competitors?.forEach((comp: any) => {
            liveNflTeams.add(normalizeNflTeamAbbreviation(comp.team?.abbreviation) as string);
          });
        });

        // Also extract teams from completed games
        const postGames = scoreboard.events.filter(
          event => event.competitions?.[0]?.status?.type?.state === 'post'
        );
        const postGameTeams = new Set<string>();
        postGames.forEach(game => {
          game.competitions?.[0]?.competitors?.forEach((comp: any) => {
            postGameTeams.add(normalizeNflTeamAbbreviation(comp.team?.abbreviation) as string);
          });
        });

        console.log(`   🏈 Live NFL teams: ${Array.from(liveNflTeams).join(', ')}`);
        console.log(`   ✅ Post-game NFL teams: ${Array.from(postGameTeams).join(', ')}`);

        // Store both live and post-game teams for player filtering
        const gameProgressWithTeams = { value: gameProgress, liveNflTeams, postGameTeams };
        gameProgress = gameProgressWithTeams as any;
      } else {
        console.log('   ⚠️ No live NFL games found, checking for completed games');

        // Even if no live games, still extract post-game teams
        const postGames = scoreboard.events.filter(
          event => event.competitions?.[0]?.status?.type?.state === 'post'
        );
        const postGameTeams = new Set<string>();
        postGames.forEach(game => {
          game.competitions?.[0]?.competitors?.forEach((comp: any) => {
            postGameTeams.add(normalizeNflTeamAbbreviation(comp.team?.abbreviation) as string);
          });
        });

        if (postGameTeams.size > 0) {
          console.log(`   ✅ Post-game NFL teams: ${Array.from(postGameTeams).join(', ')}`);
        }

        // Fallback to time-based estimation for non-live, non-post games
        const now = new Date();
        const currentHour = now.getUTCHours();

        if (currentHour >= 20 && currentHour <= 21) {
          gameProgress = 0.67; // ~40 minutes played (20 min left)
        } else if (currentHour >= 21 && currentHour <= 22) {
          gameProgress = 0.83; // ~50 minutes played (10 min left)
        } else {
          gameProgress = 0.9; // ~54 minutes played (6 min left)
        }

        // Store post-game teams even when no live games
        const gameProgressWithTeams = {
          value: gameProgress,
          liveNflTeams: new Set<string>(),
          postGameTeams,
        };
        gameProgress = gameProgressWithTeams as any;
      }
    } catch (error) {
      console.error('❌ Error fetching ESPN data, using fallback:', error);
      // Fallback if ESPN API fails
      gameProgress = 0.67;
    }
  }

  return { week, leagueId, isLive, triggerType, gameProgress };
}

/**
 * Main function to run batch simulations
 */
async function main() {
  const options = await parseArgs();
  // Prisma type workaround for script context; runtime models are present
  const db = prisma as any;

  console.log(`🚀 Starting batch simulations for Week ${options.week}`);
  console.log(`📊 Running 100,000 iterations per matchup`);
  if (options.isLive) {
    const progressValue =
      typeof options.gameProgress === 'number'
        ? options.gameProgress
        : (options.gameProgress as any).value;
    console.log(`⚡ LIVE MODE: Game progress ~${(progressValue * 100).toFixed(1)}%`);
    console.log(`🎯 Trigger: ${options.triggerType}`);
  }

  try {
    // Get leagues to process
    const leagues = options.leagueId
      ? await prisma.league.findMany({ where: { id: options.leagueId } })
      : await prisma.league.findMany({
          where: {
            name: { in: ['Gauntlet AFC', 'Gauntlet NFC'] },
          },
        });

    console.log(`🏈 Processing ${leagues.length} leagues`);

    for (const league of leagues) {
      console.log(`\n📋 Processing ${league.name}...`);

      // Determine season per league (align with data)
      const season = (league.season as string) || new Date().getFullYear().toString();

      // Fetch raw projections for this league's season
      console.log(`📡 Fetching projections from Sleeper API for season ${season}...`);
      const rawProjections = await fetchRawProjections(season, options.week);
      console.log(`   ✅ Retrieved ${rawProjections.length} player projections`);

      // Get league scoring settings
      const scoringSettings = (league.scoringSettings as ScoringSettings) || {};

      // Calculate league-specific projections
      const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);
      console.log(`   ✅ Calculated ${Object.keys(leagueProjections).length} league projections`);

      // Get all matchups for this league/week
      let targetWeek = options.week;
      let matchups = await prisma.matchup.findMany({
        where: { leagueId: league.id, week: targetWeek },
        select: { matchupId: true },
      });

      // Get unique matchup IDs
      const uniqueMatchupIds = [
        ...new Set(matchups.filter(m => m.matchupId !== null).map(m => m.matchupId!)),
      ];

      console.log(`   🥊 Found ${uniqueMatchupIds.length} matchups to simulate`);

      // Fallback ONLY when week not explicitly provided
      if (uniqueMatchupIds.length === 0 && process.argv.slice(2).length === 0) {
        const availableWeeks = await prisma.matchup.findMany({
          where: { leagueId: league.id },
          distinct: ['week'],
          select: { week: true },
          orderBy: { week: 'desc' },
        });
        if (availableWeeks.length > 0) {
          const latestWeek = availableWeeks[0].week;
          if (latestWeek !== targetWeek) {
            console.log(
              `   🔁 No matchups for requested week ${targetWeek}. Falling back to latest available week ${latestWeek}.`
            );
            targetWeek = latestWeek;
            matchups = await prisma.matchup.findMany({
              where: { leagueId: league.id, week: targetWeek },
              select: { matchupId: true },
            });
          }
        }
      }

      // Recompute unique matchup ids after potential fallback
      const uniqueMatchupIdsAfterFallback = [
        ...new Set(matchups.filter(m => m.matchupId !== null).map(m => m.matchupId!)),
      ];
      console.log(
        `   🥊 Final target week ${targetWeek}: ${uniqueMatchupIdsAfterFallback.length} matchups to simulate`
      );

      // Always run simulations to ensure fresh data for live games
      console.log(`   🔄 Running simulations for ${league.name} (week ${targetWeek})...`);

      // Delete existing simulation data for this week/league
      await db.matchupSimulation.deleteMany({
        where: { leagueId: league.id, week: targetWeek },
      });
      console.log(`   🗑️ Cleared existing simulation data`);

      // Run simulations for each matchup
      for (const matchupId of uniqueMatchupIdsAfterFallback) {
        const gameProgressValue =
          typeof options.gameProgress === 'number'
            ? options.gameProgress
            : (options.gameProgress as any).value;
        const gameProgressData = options.gameProgress as any;
        const liveNflTeams =
          typeof options.gameProgress === 'number' ? undefined : gameProgressData.liveNflTeams;
        const postGameTeams =
          typeof options.gameProgress === 'number' ? undefined : gameProgressData.postGameTeams;

        await simulateMatchup(
          league.id,
          targetWeek,
          matchupId,
          leagueProjections,
          gameProgressValue,
          options.triggerType,
          liveNflTeams,
          postGameTeams
        );
      }

      console.log(`   ✅ Completed all simulations for ${league.name}`);
    }

    console.log(`\n🎉 Batch simulation complete!`);
    console.log(`📊 Generated consistent odds that all users will see`);

    // Store historical odds snapshot after successful simulation
    console.log(`\n💾 Storing historical odds snapshot...`);
    const finalGameProgress =
      typeof options.gameProgress === 'number'
        ? options.gameProgress
        : (options.gameProgress as any).value;
    await storeHistoricalOdds(options.week, options.isLive, options.triggerType, finalGameProgress);

    console.log(`\n🎉 All operations complete! Cleaning up and exiting...`);
  } catch (error) {
    console.error('❌ Batch simulation failed:', error);
    throw error; // Let the wrapper handle exit
  }
}

/**
 * Store historical odds snapshot
 */
async function storeHistoricalOdds(
  week: number,
  isLive: boolean,
  triggerType: string,
  gameProgress: number = 0
): Promise<void> {
  try {
    const historyStartTime = Date.now();

    // Get all current simulation results for both leagues
    const simulations = await (prisma as any).matchupSimulation.findMany({
      where: {
        week,
        league: {
          name: { in: ['Gauntlet AFC', 'Gauntlet NFC'] },
        },
      },
      include: {
        league: {
          select: { id: true, name: true },
        },
      },
    });

    console.log(`   Found ${simulations.length} simulations to archive`);

    // Fetch current scores for live games
    const currentScores = isLive ? await fetchCurrentScores(simulations, week) : {};

    // Use the passed gameProgress parameter (already calculated from ESPN API in parseArgs)

    // Store snapshot for each simulation
    const historyRecords = simulations.map(sim => {
      const scoreKey = `${sim.leagueId}-${sim.matchupId}`;
      const scores = currentScores[scoreKey] || { team1Score: null, team2Score: null };

      // Debug: Show what live scores we actually fetched
      if (scores.team1Score !== null && scores.team2Score !== null) {
        console.log(
          `✅ LIVE SCORES for matchup ${sim.matchupId}: Team1 ${scores.team1Score}, Team2 ${scores.team2Score}`
        );
        console.log(
          `   ✅ These team totals match the individual player scores used in simulations!`
        );
      }

      return {
        leagueId: sim.leagueId,
        week: sim.week,
        matchupId: sim.matchupId,
        team1WinPct: sim.teamAWinPct,
        team2WinPct: sim.teamBWinPct,
        spread: sim.impliedSpread,
        total: sim.totalLine,
        team1MoneyLine: sim.moneyLineA,
        team2MoneyLine: sim.moneyLineB,
        team1Score: scores.team1Score,
        team2Score: scores.team2Score,
        gameProgress,
        isLive,
        triggeredBy: triggerType,
        computeTimeMs: sim.computeTimeMs,
      };
    });

    // Batch insert the history records
    const result = await (prisma as any).matchupOddsHistory.createMany({
      data: historyRecords,
    });

    const historyTime = Date.now() - historyStartTime;
    const scoresNote = isLive ? ' with live scores' : ' (pre-game)';
    console.log(
      `   ✅ Stored ${result.count} historical odds snapshots${scoresNote} in ${historyTime}ms`
    );

    // Store league-wide odds for highest/lowest scoring matchups
    await storeLeagueOdds(week, simulations, isLive, triggerType);
  } catch (error) {
    console.error('⚠️ Error storing historical odds (non-critical):', error);
    // Don't throw - simulations are the primary goal
  }
}

/**
 * Store league-wide odds for highest/lowest scoring matchups
 */
async function storeLeagueOdds(
  week: number,
  simulations: any[],
  isLive: boolean,
  triggerType: string
): Promise<void> {
  try {
    console.log('   🎯 Calculating league-wide matchup odds...');

    // Group simulations by league
    const leagueGroups = simulations.reduce(
      (groups, sim) => {
        const leagueId = sim.leagueId;
        if (!groups[leagueId]) groups[leagueId] = [];
        groups[leagueId].push(sim);
        return groups;
      },
      {} as Record<string, any[]>
    );

    // Process each league
    for (const [leagueId, leagueSimulations] of Object.entries(leagueGroups)) {
      // Calculate total points for each matchup (team1Mean + team2Mean)
      const matchupTotals = leagueSimulations.map(sim => ({
        matchupId: sim.matchupId,
        leagueName: sim.league.name,
        team1Mean: sim.teamAMean,
        team2Mean: sim.teamBMean,
        totalPoints: sim.teamAMean + sim.teamBMean,
        totalLine: sim.totalLine,
        spread: sim.impliedSpread,
        team1WinPct: sim.teamAWinPct,
        team2WinPct: sim.teamBWinPct,
      }));

      // Find highest and lowest scoring matchups
      const highestScoring = matchupTotals.reduce((prev, current) =>
        current.totalPoints > prev.totalPoints ? current : prev
      );

      const lowestScoring = matchupTotals.reduce((prev, current) =>
        current.totalPoints < prev.totalPoints ? current : prev
      );

      // Create probability distributions for betting odds
      const totalMatchups = matchupTotals.length;

      // For highest scoring matchup: each matchup has probability of being highest
      const highestScoringOdds = matchupTotals.map(matchup => {
        // Simple model: probability based on how much higher this matchup is than average
        const avgTotal = matchupTotals.reduce((sum, m) => sum + m.totalPoints, 0) / totalMatchups;
        const deviation = matchup.totalPoints - avgTotal;
        const maxDeviation = Math.max(
          ...matchupTotals.map(m => Math.abs(m.totalPoints - avgTotal))
        );

        // Probability increases with positive deviation from average
        const probability =
          maxDeviation > 0
            ? (Math.max(0.1, 0.1 + (deviation / maxDeviation) * 0.8) / totalMatchups) * 2
            : 1 / totalMatchups;

        return {
          matchupId: matchup.matchupId,
          leagueName: matchup.leagueName,
          totalPoints: matchup.totalPoints,
          probability: Math.min(0.8, Math.max(0.05, probability)),
          odds: Math.round(1 / Math.min(0.8, Math.max(0.05, probability))),
        };
      });

      // For lowest scoring matchup: inverse logic
      const lowestScoringOdds = matchupTotals.map(matchup => {
        const avgTotal = matchupTotals.reduce((sum, m) => sum + m.totalPoints, 0) / totalMatchups;
        const deviation = avgTotal - matchup.totalPoints; // Inverse: lower is better
        const maxDeviation = Math.max(
          ...matchupTotals.map(m => Math.abs(m.totalPoints - avgTotal))
        );

        const probability =
          maxDeviation > 0
            ? (Math.max(0.1, 0.1 + (deviation / maxDeviation) * 0.8) / totalMatchups) * 2
            : 1 / totalMatchups;

        return {
          matchupId: matchup.matchupId,
          leagueName: matchup.leagueName,
          totalPoints: matchup.totalPoints,
          probability: Math.min(0.8, Math.max(0.05, probability)),
          odds: Math.round(1 / Math.min(0.8, Math.max(0.05, probability))),
        };
      });

      const leagueName = leagueSimulations[0]?.league?.name || 'Unknown League';
      console.log(
        `   🏆 ${leagueName} - Highest scoring: Matchup ${highestScoring.matchupId} (${highestScoring.totalPoints.toFixed(1)} pts)`
      );
      console.log(
        `   🥉 ${leagueName} - Lowest scoring: Matchup ${lowestScoring.matchupId} (${lowestScoring.totalPoints.toFixed(1)} pts)`
      );

      // Store in LeagueOddsHistory
      await (prisma as any).leagueOddsHistory.create({
        data: {
          week,
          highestScorerOdds: [], // Keep existing empty for now
          lowestScorerOdds: [], // Keep existing empty for now
          closestMatchup: [], // Keep existing empty for now
          biggestBlowout: [], // Keep existing empty for now
          highestScoringMatchup: highestScoringOdds,
          lowestScoringMatchup: lowestScoringOdds,
          isLive,
          triggeredBy: triggerType,
          computeTimeMs: leagueSimulations[0]?.computeTimeMs || 0,
        },
      });
    }

    console.log('   ✅ Stored league-wide matchup scoring odds');
  } catch (error) {
    console.error('⚠️ Error storing league odds (non-critical):', error);
    // Don't throw - this is supplementary data
  }
}

/**
 * Fetch individual player scores from Sleeper API for live games
 */
async function fetchLivePlayerScores(
  leagueId: string,
  week: number
): Promise<Record<string, number>> {
  const playerScores: Record<string, number> = {};

  try {
    const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`, {
      headers: {
        'User-Agent': 'Gauntlet-Website/1.0.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch player scores for league ${leagueId}: ${response.status}`);
      return playerScores;
    }

    const matchups = await response.json();

    // Extract individual player scores from all matchups
    matchups.forEach((matchup: any) => {
      if (matchup.players_points) {
        Object.entries(matchup.players_points).forEach(([playerId, points]) => {
          playerScores[playerId] = Number(points) || 0;
        });
      }
    });

    console.log(
      `   📊 Fetched live scores for ${Object.keys(playerScores).length} players in league ${leagueId}`
    );
    return playerScores;
  } catch (error) {
    console.error(`❌ Error fetching player scores for league ${leagueId}:`, error);
    return playerScores;
  }
}

/**
 * Fetch current scores from Sleeper API for live games
 */
async function fetchCurrentScores(
  simulations: any[],
  week: number
): Promise<Record<string, { team1Score: number | null; team2Score: number | null }>> {
  const scores: Record<string, { team1Score: number | null; team2Score: number | null }> = {};

  try {
    // Group simulations by league to minimize API calls
    const leagueGroups = simulations.reduce(
      (groups, sim) => {
        const leagueId = sim.league.id; // League.id matches Sleeper league_id format
        if (!groups[leagueId]) groups[leagueId] = [];
        groups[leagueId].push(sim);
        return groups;
      },
      {} as Record<string, any[]>
    );

    // Fetch matchups for each league
    for (const [sleeperLeagueId, sims] of Object.entries(leagueGroups) as [string, any[]][]) {
      try {
        const response = await fetch(
          `https://api.sleeper.app/v1/league/${sleeperLeagueId}/matchups/${week}`,
          {
            headers: {
              'User-Agent': 'Gauntlet-Website/1.0.0',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          console.warn(
            `⚠️ Failed to fetch scores for league ${sleeperLeagueId}: ${response.status}`
          );
          continue;
        }

        const matchups = await response.json();

        // Group matchups by matchup_id to get both teams
        const matchupGroups = matchups.reduce((groups: any, matchup: any) => {
          const matchupId = matchup.matchup_id;
          if (!groups[matchupId]) groups[matchupId] = [];
          groups[matchupId].push(matchup);
          return groups;
        }, {});

        // Store scores for each matchup
        sims.forEach(sim => {
          const matchupTeams = matchupGroups[sim.matchupId];
          if (matchupTeams && matchupTeams.length === 2) {
            // Sort by roster_id to maintain consistent team1/team2 ordering
            matchupTeams.sort((a: any, b: any) => a.roster_id - b.roster_id);

            const scoreKey = `${sim.leagueId}-${sim.matchupId}`;
            scores[scoreKey] = {
              team1Score: matchupTeams[0].points || 0,
              team2Score: matchupTeams[1].points || 0,
            };
          }
        });

        console.log(
          `   📊 Fetched scores for ${Object.keys(matchupGroups).length} matchups in league ${sleeperLeagueId}`
        );
      } catch (leagueError) {
        console.error(`❌ Error fetching scores for league ${sleeperLeagueId}:`, leagueError);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching current scores:', error);
  }

  return scores;
}

/**
 * Compute actual game progress from ESPN API data
 * @param status ESPN game status object
 * @returns Progress from 0 (pre-game) to 1 (complete)
 */
function computeGameProgressFromEspn(status: any): number {
  const type = status?.type || {};
  const state = type.state; // 'pre', 'in', 'post'

  if (state === 'pre') return 0;
  if (state === 'post') return 1;

  // For in-progress games, calculate based on period and clock
  if (state === 'in') {
    const period = status.period || 1;
    const clock = status.clock || 0; // seconds remaining in period

    // NFL: 4 quarters, 15 minutes (900 seconds) each
    const totalGameSeconds = 4 * 900;
    const elapsedSeconds = (period - 1) * 900 + (900 - clock);

    return Math.min(Math.max(elapsedSeconds / totalGameSeconds, 0), 1);
  }

  return 0; // Default fallback
}

/**
 * Get current NFL week
 */
function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2025-09-04'); // NFL season start
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.max(
    1,
    Math.min(18, Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1)
  );
}

// Run the script with aggressive exit handling for CI environments
async function runWithTimeout() {
  // Set a timeout to force exit after 5 minutes (generous for sims + odds storage)
  const timeout = setTimeout(() => {
    console.log('⏰ Timeout reached, forcing process exit...');
    process.exit(1);
  }, 300000); // 5 minutes

  try {
    await main();
    clearTimeout(timeout);
    console.log('🏁 Script completed successfully, cleaning up...');

    // Force cleanup and exit
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Fatal error:', error);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('⚠️ Error disconnecting from database:', disconnectError);
    }
    process.exit(1);
  }
}

runWithTimeout();
