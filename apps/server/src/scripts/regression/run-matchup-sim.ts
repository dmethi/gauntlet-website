import prisma from '../../lib/prisma.js';
import { simulateMatchupProbability } from '@gauntlet/sim-engine';

function seedRandom(seed: number) {
  let s = seed >>> 0;
  return function () {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

async function buildLineupFromRoster(rosterId: number, week: number) {
  const roster = await prisma.roster.findUnique({ where: { id: rosterId } });
  const playerIds = roster?.starters || [];
  const [players, stats] = await Promise.all([
    prisma.player.findMany({ where: { id: { in: playerIds } } }),
    prisma.playerStats.findMany({
      where: {
        playerId: { in: playerIds },
        statsType: 'projections',
        season: new Date().getFullYear().toString(),
        week,
      },
    }),
  ]);
  const byId = new Map(players.map(p => [p.id, p] as const));
  return (playerIds || [])
    .map(pid => {
      const p = byId.get(pid);
      if (!p) return null;
      const proj = stats.find(s => s.playerId === pid);
      return {
        id: p.id,
        name: p.fullName,
        position: p.position,
        projection: (proj?.stats as any)?.pts_half_ppr ?? (proj?.stats as any)?.pts_ppr ?? 0,
      };
    })
    .filter(Boolean) as any[];
}

async function main() {
  const leagueId = process.argv[2];
  const week = parseInt(process.argv[3] || '1', 10);
  const rosterA = parseInt(process.argv[4] || '1', 10);
  const rosterB = parseInt(process.argv[5] || '2', 10);
  const iterations = parseInt(process.argv[6] || '2000', 10);

  if (!leagueId) {
    console.error(
      'Usage: ts-node run-matchup-sim.ts <leagueId> <week> <rosterAId> <rosterBId> [iterations]'
    );
    process.exit(1);
  }

  // Optional: seed RNG for reproducibility in test runs
  const seed = 123456789;
  const rand = seedRandom(seed);
  (global as any).Math.random = rand;

  const [team1, team2] = await Promise.all([
    buildLineupFromRoster(rosterA, week),
    buildLineupFromRoster(rosterB, week),
  ]);

  const result = await simulateMatchupProbability(team1 as any, team2 as any, iterations, 0);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
