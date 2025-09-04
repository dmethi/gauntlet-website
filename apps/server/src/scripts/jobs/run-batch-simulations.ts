import prisma from '../../lib/prisma.js';
import { 
  simulateMatchupProbabilityFromPlayers, 
  type LineupPlayer,
  type MatchupSimulationResult 
} from '@gauntlet/sim-engine';

interface ScoringSettings {
  pass_yd?: number; pass_td?: number; pass_int?: number; pass_2pt?: number;
  rush_yd?: number; rush_td?: number; rush_2pt?: number; rush_fd?: number;
  rec_yd?: number; rec_td?: number; rec?: number; rec_2pt?: number;
  fum?: number; fum_lost?: number;
  xpm?: number; xpmiss?: number; fgm_0_19?: number; fgm_20_29?: number;
  fgm_30_39?: number; fgm_40_49?: number; fgm_50_59?: number; fgm_60p?: number; fgmiss?: number;
  sack?: number; int?: number; fum_rec?: number; safe?: number; def_td?: number;
  blk_kick?: number; def_2pt?: number; pts_allow?: number;
  tkl_loss?: number; qb_hit?: number; def_3_and_out?: number; def_4_and_stop?: number;
  st_td?: number; st_ff?: number;
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
      { cache: 'no-store' }
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
  const projections: Record<string, LeagueProjection> = {};
  
  rawProjections.forEach(rawProjection => {
    if (rawProjection.player_id && rawProjection.stats) {
      let totalPoints = 0;
      const breakdown: Record<string, number> = {};
      
      for (const statKey in scoringSettings) {
        if (scoringSettings.hasOwnProperty(statKey) && rawProjection.stats.hasOwnProperty(statKey)) {
          const score = (rawProjection.stats[statKey] || 0) * (scoringSettings[statKey as keyof ScoringSettings] || 0);
          totalPoints += score;
          breakdown[statKey] = score;
        }
      }
      
      projections[rawProjection.player_id] = {
        playerId: rawProjection.player_id,
        points: Math.round(totalPoints * 100) / 100,
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
    return Math.round(-100 * probability / (1 - probability));
  } else {
    return Math.round(100 * (1 - probability) / probability);
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
    include: { roster: { include: { owner: true } } }
  });

  if (!matchupData) {
    throw new Error(`No matchup data found for roster ${rosterId}, week ${week}`);
  }

  // Get player details
  const playerIds = matchupData.starters || [];
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } }
  });

  const playersMap = new Map(players.map(p => [p.id, p]));

  return playerIds.map(playerId => {
    const player = playersMap.get(playerId);
    if (!player) return null;

    const projection = leagueProjections[playerId]?.points || 0;
    const currentPoints = (matchupData.playersPoints as Record<string, number>)?.[playerId] || 0;

    return {
      id: playerId,
      name: player.fullName,
      position: player.position,
      projection: projection,
      currentScore: currentPoints,
    };
  }).filter(Boolean) as LineupPlayer[];
}

/**
 * Run comprehensive simulation for a specific matchup
 */
async function simulateMatchup(
  leagueId: string,
  week: number,
  matchupId: number,
  leagueProjections: Record<string, LeagueProjection>
): Promise<void> {
  console.log(`🔄 Simulating matchup ${matchupId} (League: ${leagueId}, Week: ${week})`);
  
  try {
    // Get both teams in this matchup
    const matchups = await prisma.matchup.findMany({
      where: { leagueId, week, matchupId },
      include: { roster: { include: { owner: true } } }
    });

    if (matchups.length !== 2) {
      console.log(`⚠️ Matchup ${matchupId} has ${matchups.length} teams, skipping`);
      return;
    }

    const [teamA, teamB] = matchups;
    
    // Build lineup players for both teams
    const [team1Players, team2Players] = await Promise.all([
      buildLineupPlayers(teamA.rosterId, week, leagueProjections),
      buildLineupPlayers(teamB.rosterId, week, leagueProjections)
    ]);

    if (team1Players.length === 0 || team2Players.length === 0) {
      console.log(`⚠️ Empty lineups for matchup ${matchupId}, skipping`);
      return;
    }

    // Run 100k simulation
    const startTime = Date.now();
    console.log(`   Running 100,000 simulations...`);
    
    const simulation: MatchupSimulationResult = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      100000, // 100k iterations
      0       // Game progress (0 = pre-game)
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
    const simulationRecord = await prisma.matchupSimulation.create({
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
      }
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

      await prisma.playerSimulation.create({
        data: {
          matchupSimulationId: simulationRecord.id,
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamRosterId: teamA.roster.id === (team1Players.includes(player) ? teamA.roster.id : teamB.roster.id) 
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
        }
      });
    }

    console.log(`   ✅ Stored simulation results for matchup ${matchupId}`);
    
  } catch (error) {
    console.error(`❌ Error simulating matchup ${matchupId}:`, error);
    throw error;
  }
}

/**
 * Main function to run batch simulations
 */
async function main() {
  const args = process.argv.slice(2);
  const week = args[0] ? parseInt(args[0]) : getCurrentWeek();
  const leagueId = args[1]; // Optional: specific league, otherwise do both
  
  console.log(`🚀 Starting batch simulations for Week ${week}`);
  console.log(`📊 Running 100,000 iterations per matchup`);
  
  try {
    // Get the current season
    const currentYear = new Date().getFullYear();
    const season = currentYear.toString();
    
    // Fetch raw projections from Sleeper
    console.log(`📡 Fetching projections from Sleeper API...`);
    const rawProjections = await fetchRawProjections(season, week);
    console.log(`   ✅ Retrieved ${rawProjections.length} player projections`);
    
    // Get leagues to process
    const leagues = leagueId 
      ? await prisma.league.findMany({ where: { id: leagueId } })
      : await prisma.league.findMany({
          where: {
            name: { in: ['Gauntlet AFC', 'Gauntlet NFC'] }
          }
        });
    
    console.log(`🏈 Processing ${leagues.length} leagues`);
    
    for (const league of leagues) {
      console.log(`\n📋 Processing ${league.name}...`);
      
      // Get league scoring settings
      const scoringSettings = (league.scoringSettings as ScoringSettings) || {};
      
      // Calculate league-specific projections
      const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);
      console.log(`   ✅ Calculated ${Object.keys(leagueProjections).length} league projections`);
      
      // Get all matchups for this league/week
      const matchups = await prisma.matchup.findMany({
        where: { leagueId: league.id, week },
        select: { matchupId: true }
      });
      
      // Get unique matchup IDs
      const uniqueMatchupIds = [...new Set(
        matchups
          .filter(m => m.matchupId !== null)
          .map(m => m.matchupId!)
      )];
      
      console.log(`   🥊 Found ${uniqueMatchupIds.length} matchups to simulate`);
      
      // Delete existing simulation data for this week/league
      await prisma.matchupSimulation.deleteMany({
        where: { leagueId: league.id, week }
      });
      console.log(`   🗑️ Cleared existing simulation data`);
      
      // Run simulations for each matchup
      for (const matchupId of uniqueMatchupIds) {
        await simulateMatchup(league.id, week, matchupId, leagueProjections);
      }
      
      console.log(`   ✅ Completed all simulations for ${league.name}`);
    }
    
    console.log(`\n🎉 Batch simulation complete!`);
    console.log(`📊 Generated consistent odds that all users will see`);
    
  } catch (error) {
    console.error('❌ Batch simulation failed:', error);
    process.exit(1);
  }
}

/**
 * Get current NFL week
 */
function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2024-09-05'); // NFL season start
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.max(1, Math.min(18, Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1));
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
