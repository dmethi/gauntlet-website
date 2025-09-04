import prisma from '../../lib/prisma.js';
import {
  simulateMatchupProbabilityFromPlayers,
  type LineupPlayer,
  type MatchupSimulationResult,
} from '@gauntlet/sim-engine/src/index.js';

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
  if (probability >= 0.5) {
    return Math.round((-100 * probability) / (1 - probability));
  } else {
    return Math.round((100 * (1 - probability)) / probability);
  }
}

/**
 * Build lineup players from roster data
 */
async function buildLineupPlayers(
  rosterId: number,
  week: number,
  leagueProjections: Record<string, LeagueProjection>
): Promise<LineupPlayer[]> {
  // Get roster and matchup data
  const matchupData = await prisma.matchup.findFirst({
    where: { rosterId, week },
    include: { roster: { include: { owner: true } } },
  });

  if (!matchupData) {
    throw new Error(`No matchup data found for roster ${rosterId}, week ${week}`);
  }

  // Get player details
  const playerIds = matchupData.starters || [];
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
  });

  const playersMap = new Map(players.map(p => [p.id, p]));

  return playerIds
    .map(playerId => {
      const player = playersMap.get(playerId);
      if (!player) return null;

      const projection = leagueProjections[playerId]?.points || 0;
      const currentPoints = (matchupData.playersPoints as Record<string, number>)?.[playerId] || 0;

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
  triggerType: string = 'manual'
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
    });

    if (matchups.length !== 2) {
      console.log(`⚠️ Matchup ${matchupId} has ${matchups.length} teams, skipping`);
      return;
    }

    const [teamA, teamB] = matchups;

    // Build lineup players for both teams
    const [team1Players, team2Players] = await Promise.all([
      buildLineupPlayers(teamA.rosterId, week, leagueProjections),
      buildLineupPlayers(teamB.rosterId, week, leagueProjections),
    ]);

    if (team1Players.length === 0 || team2Players.length === 0) {
      console.log(`⚠️ Empty lineups for matchup ${matchupId}, skipping`);
      return;
    }

    // Debug: Log team projections
    const team1Total = team1Players.reduce((sum, p) => sum + p.projection, 0);
    const team2Total = team2Players.reduce((sum, p) => sum + p.projection, 0);
    console.log(
      `📊 Team projections: Team A ${team1Total.toFixed(1)} pts, Team B ${team2Total.toFixed(1)} pts (diff: ${Math.abs(team1Total - team2Total).toFixed(1)} pts)`
    );

    // Run 100k simulation
    const startTime = Date.now();
    console.log(`   Running 100,000 simulations...`);

    const simulation: MatchupSimulationResult = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      100000, // 100k iterations
      gameProgress // Game progress (0 = pre-game, 1 = complete)
    );

    const computeTimeMs = Date.now() - startTime;
    console.log(`   ✅ Simulation complete in ${computeTimeMs}ms`);

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
        leagueId,
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

function parseArgs(): SimulationOptions {
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

  // Calculate game progress for live updates
  let gameProgress = 0;
  if (isLive) {
    // Simplified: assume ~2.5 hours into game during live windows
    // In reality, you'd call NFL API or parse game data for exact progress
    const now = new Date();
    const currentHour = now.getUTCHours();

    // Rough game progress estimation based on time
    if (currentHour >= 18 && currentHour <= 20) {
      gameProgress = Math.min(0.4, (currentHour - 18) / 3); // Early game
    } else if (currentHour >= 21 && currentHour <= 23) {
      gameProgress = Math.min(0.7, 0.4 + (currentHour - 21) / 3); // Mid game
    } else {
      gameProgress = Math.min(0.95, 0.7 + 0.25); // Late game
    }
  }

  return { week, leagueId, isLive, triggerType, gameProgress };
}

/**
 * Main function to run batch simulations
 */
async function main() {
  const options = parseArgs();
  // Prisma type workaround for script context; runtime models are present
  const db = prisma as any;

  console.log(`🚀 Starting batch simulations for Week ${options.week}`);
  console.log(`📊 Running 100,000 iterations per matchup`);
  if (options.isLive) {
    console.log(`⚡ LIVE MODE: Game progress ~${(options.gameProgress * 100).toFixed(0)}%`);
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

      // Staleness guard: skip recompute if recent and complete
      const latestSim = await db.matchupSimulation.findFirst({
        where: { leagueId: league.id, week: targetWeek },
        orderBy: { createdAt: 'desc' },
      });
      const simsCount = await db.matchupSimulation.count({
        where: { leagueId: league.id, week: targetWeek },
      });

      const now = Date.now();
      const lastRunMs = latestSim ? new Date(latestSim.createdAt).getTime() : 0;
      const ageMinutes = latestSim ? (now - lastRunMs) / (60 * 1000) : Infinity;
      const freshnessThresholdMinutes = options.isLive ? 10 : 12 * 60; // 10m live, 12h non-live

      if (
        latestSim &&
        simsCount >= uniqueMatchupIdsAfterFallback.length &&
        ageMinutes < freshnessThresholdMinutes
      ) {
        console.log(
          `   ⏭️  Skipping ${league.name} (week ${targetWeek}) — fresh results exist (${ageMinutes.toFixed(
            1
          )}m old, threshold ${freshnessThresholdMinutes}m)`
        );
        continue;
      }

      // Delete existing simulation data for this week/league
      await db.matchupSimulation.deleteMany({
        where: { leagueId: league.id, week: targetWeek },
      });
      console.log(`   🗑️ Cleared existing simulation data`);

      // Run simulations for each matchup
      for (const matchupId of uniqueMatchupIdsAfterFallback) {
        await simulateMatchup(
          league.id,
          targetWeek,
          matchupId,
          leagueProjections,
          options.gameProgress,
          options.triggerType
        );
      }

      console.log(`   ✅ Completed all simulations for ${league.name}`);
    }

    console.log(`\n🎉 Batch simulation complete!`);
    console.log(`📊 Generated consistent odds that all users will see`);

    // Store historical odds snapshot after successful simulation
    console.log(`\n💾 Storing historical odds snapshot...`);
    await storeHistoricalOdds(targetWeek, isLive, trigger);
    
  } catch (error) {
    console.error('❌ Batch simulation failed:', error);
    process.exit(1);
  }
}

/**
 * Store historical odds snapshot
 */
async function storeHistoricalOdds(
  week: number,
  isLive: boolean,
  triggerType: string
): Promise<void> {
  try {
    const historyStartTime = Date.now();

    // Get all current simulation results for both leagues
    const simulations = await prisma.matchupSimulation.findMany({
      where: {
        week,
        league: {
          name: { in: ['Gauntlet AFC', 'Gauntlet NFC'] },
        },
      },
      include: {
        league: {
          select: { id: true, name: true, sleeperLeagueId: true },
        },
      },
    });

    console.log(`   Found ${simulations.length} simulations to archive`);

    // Fetch current scores for live games
    const currentScores = isLive ? await fetchCurrentScores(simulations, week) : {};

    // Calculate game progress based on live status
    let gameProgress = 0;
    if (isLive) {
      const now = new Date();
      const currentHour = now.getUTCHours();

      if (currentHour >= 18 && currentHour <= 20) {
        gameProgress = Math.min(0.4, (currentHour - 18) / 3);
      } else if (currentHour >= 21 && currentHour <= 23) {
        gameProgress = Math.min(0.7, 0.4 + (currentHour - 21) / 3);
      } else {
        gameProgress = Math.min(0.95, 0.7 + 0.25);
      }
    }

    // Store snapshot for each simulation
    const historyRecords = simulations.map(sim => {
      const scoreKey = `${sim.leagueId}-${sim.matchupId}`;
      const scores = currentScores[scoreKey] || { team1Score: null, team2Score: null };
      
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
    const result = await prisma.matchupOddsHistory.createMany({
      data: historyRecords,
    });

    const historyTime = Date.now() - historyStartTime;
    const scoresNote = isLive ? ' with live scores' : ' (pre-game)';
    console.log(`   ✅ Stored ${result.count} historical odds snapshots${scoresNote} in ${historyTime}ms`);
  } catch (error) {
    console.error('⚠️ Error storing historical odds (non-critical):', error);
    // Don't throw - simulations are the primary goal
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
    const leagueGroups = simulations.reduce((groups, sim) => {
      const leagueId = sim.league.sleeperLeagueId;
      if (!groups[leagueId]) groups[leagueId] = [];
      groups[leagueId].push(sim);
      return groups;
    }, {} as Record<string, any[]>);

    // Fetch matchups for each league
    for (const [sleeperLeagueId, sims] of Object.entries(leagueGroups)) {
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
          console.warn(`⚠️ Failed to fetch scores for league ${sleeperLeagueId}: ${response.status}`);
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

        console.log(`   📊 Fetched scores for ${Object.keys(matchupGroups).length} matchups in league ${sleeperLeagueId}`);
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

// Run the script
main()
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
