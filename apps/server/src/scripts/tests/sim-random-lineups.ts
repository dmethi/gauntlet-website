import prisma from '../../lib/prisma.js';
import { simulateMatchupProbability, type LineupPlayer } from '@gauntlet/sim-engine';

function pick<T>(arr: T[], n: number): T[] {
  const copy = arr.slice();
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function randInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomProjectionForPosition(pos: string): number {
  switch (pos) {
    case 'QB':
      return randInRange(15, 30);
    case 'RB':
      return randInRange(8, 20);
    case 'WR':
      return randInRange(8, 20);
    case 'TE':
      return randInRange(5, 15);
    default:
      return randInRange(3, 10);
  }
}

async function samplePlayers(): Promise<Record<string, any[]>> {
  const [qbs, rbs, wrs, tes] = await Promise.all([
    prisma.player.findMany({ where: { position: 'QB' }, take: 100 }),
    prisma.player.findMany({ where: { position: 'RB' }, take: 300 }),
    prisma.player.findMany({ where: { position: 'WR' }, take: 300 }),
    prisma.player.findMany({ where: { position: 'TE' }, take: 150 }),
  ]);
  return { QB: qbs, RB: rbs, WR: wrs, TE: tes } as const;
}

function toLineupPlayers(players: any[]): LineupPlayer[] {
  return players.map(p => ({
    id: p.id,
    name: p.fullName,
    position: p.position,
    projection: randomProjectionForPosition(p.position),
  }));
}

async function buildRandomLineupArray(): Promise<LineupPlayer[]> {
  const pool = await samplePlayers();
  const lineup: LineupPlayer[] = [];
  lineup.push(...toLineupPlayers(pick(pool.QB, 1)));
  lineup.push(...toLineupPlayers(pick(pool.RB, 2)));
  lineup.push(...toLineupPlayers(pick(pool.WR, 3)));
  lineup.push(...toLineupPlayers(pick(pool.TE, 1)));
  // FLEX from RB/WR/TE
  const flexPool = [...pool.RB, ...pool.WR, ...pool.TE];
  lineup.push(...toLineupPlayers(pick(flexPool, 1)));
  return lineup;
}

async function main() {
  const iterations = parseInt(process.argv[2] || '5000', 10);

  const [team1, team2] = await Promise.all([
    buildRandomLineupArray(),
    buildRandomLineupArray(),
  ]);

  const sim = await simulateMatchupProbability(team1, team2, iterations, 0);
  console.log(JSON.stringify({ team1, team2, sim }, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


