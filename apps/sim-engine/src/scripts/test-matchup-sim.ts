import { PrismaClient } from '@gauntlet/api/src/generated/prisma';
import { Lineup, simulateMatchupProbability } from '../models/matchup';

const prisma = new PrismaClient();

// Helper to get average projection
async function getAvgProjection(playerId: string): Promise<number> {
  const projections = await prisma.projectionError.findMany({
    where: { playerId },
    orderBy: { week: 'desc' },
    take: 8,
  });

  if (projections.length === 0) {
    throw new Error(`No projections found for player ${playerId}`);
  }

  return projections.reduce((sum, p) => sum + p.projectedPoints, 0) / projections.length;
}

async function getPlayer(name: string) {
  const player = await prisma.player.findFirst({
    where: { fullName: name },
  });
  if (!player) {
    throw new Error(`Player not found: ${name}`);
  }

  const projection = await getAvgProjection(player.id);

  return {
    id: player.id,
    name: player.fullName,
    position: player.position,
    projection,
  };
}

async function main() {
  try {
    // First let's find players we know have data
    console.log('Finding players with projection data...');

    const qbs = ['Patrick Mahomes', 'Josh Allen', 'Justin Fields', 'Geno Smith'];
    const rbs = ['Christian McCaffrey', 'Breece Hall', 'Javonte Williams'];
    const wrs = ['Tyreek Hill', 'Justin Jefferson', 'Chris Olave'];
    const tes = ['Travis Kelce', 'Sam LaPorta'];

    const availablePlayers: Record<
      string,
      Array<{ id: string; name: string; position: string; projection: number }>
    > = {
      QB: [],
      RB: [],
      WR: [],
      TE: [],
    };

    // Test each player
    for (const name of [...qbs, ...rbs, ...wrs, ...tes]) {
      try {
        const player = await getPlayer(name);
        availablePlayers[player.position].push(player);
        console.log(`✓ ${name} (${player.projection.toFixed(1)} proj)`);
      } catch (error) {
        console.log(`✗ ${name} (no data)`);
      }
    }

    // Create two realistic lineups from available players
    const team1: Lineup = {
      qb: availablePlayers.QB[0], // Mahomes
      rb1: availablePlayers.RB[0], // CMC
      rb2: availablePlayers.RB[1], // Hall
      wr1: availablePlayers.WR[0], // Hill
      wr2: availablePlayers.WR[1], // Jefferson
      wr3: availablePlayers.WR[2], // Olave
      te: availablePlayers.TE[0], // Kelce
      flex: availablePlayers.RB[2], // Williams
    };

    const team2: Lineup = {
      qb: availablePlayers.QB[2], // Fields
      rb1: availablePlayers.RB[1], // Hall
      rb2: availablePlayers.RB[2], // Williams
      wr1: availablePlayers.WR[1], // Jefferson
      wr2: availablePlayers.WR[2], // Olave
      wr3: availablePlayers.WR[0], // Hill
      te: availablePlayers.TE[1], // LaPorta
      flex: availablePlayers.RB[0], // CMC
    };

    // Calculate projected totals
    const team1Proj = Object.values(team1).reduce((sum, p) => sum + p.projection, 0);
    const team2Proj = Object.values(team2).reduce((sum, p) => sum + p.projection, 0);

    console.log('\nTeam 1 Lineup:');
    Object.entries(team1).forEach(([pos, player]) => {
      console.log(`${pos.toUpperCase()}: ${player.name} (${player.projection.toFixed(1)} proj)`);
    });
    console.log(`Total Projected: ${team1Proj.toFixed(1)}`);

    console.log('\nTeam 2 Lineup:');
    Object.entries(team2).forEach(([pos, player]) => {
      console.log(`${pos.toUpperCase()}: ${player.name} (${player.projection.toFixed(1)} proj)`);
    });
    console.log(`Total Projected: ${team2Proj.toFixed(1)}`);

    // Run simulations
    console.log('\nRunning 10,000 Monte Carlo simulations...\n');
    const result = await simulateMatchupProbability(team1, team2, 10000);

    // Display results
    console.log('Win Probabilities:');
    console.log(`Team 1: ${(result.team1WinPct * 100).toFixed(1)}%`);
    console.log(`Team 2: ${(result.team2WinPct * 100).toFixed(1)}%`);

    console.log('\nTeam 1 Score Distribution:');
    console.log(`10th percentile: ${result.team1Scores.p10.toFixed(1)}`);
    console.log(`Median: ${result.team1Scores.median.toFixed(1)} (proj: ${team1Proj.toFixed(1)})`);
    console.log(`90th percentile: ${result.team1Scores.p90.toFixed(1)}`);
    console.log(`Mean: ${result.team1Scores.mean.toFixed(1)}`);

    console.log('\nTeam 2 Score Distribution:');
    console.log(`10th percentile: ${result.team2Scores.p10.toFixed(1)}`);
    console.log(`Median: ${result.team2Scores.median.toFixed(1)} (proj: ${team2Proj.toFixed(1)})`);
    console.log(`90th percentile: ${result.team2Scores.p90.toFixed(1)}`);
    console.log(`Mean: ${result.team2Scores.mean.toFixed(1)}`);

    console.log('\nBetting Lines:');
    const favorite = result.impliedOdds.spread < 0 ? 'Team 1' : 'Team 2';
    const underdog = result.impliedOdds.spread < 0 ? 'Team 2' : 'Team 1';
    console.log(`${favorite} favored by ${Math.abs(result.impliedOdds.spread)} points`);
    console.log(
      `Money Line: ${favorite} ${result.impliedOdds.team1MoneyLine < 0 ? result.impliedOdds.team1MoneyLine : result.impliedOdds.team2MoneyLine}, ${underdog} +${result.impliedOdds.team1MoneyLine > 0 ? result.impliedOdds.team1MoneyLine : result.impliedOdds.team2MoneyLine}`
    );
    console.log(`Over/Under: ${result.impliedOdds.total} points`);
  } catch (error) {
    console.error('Error running matchup simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
