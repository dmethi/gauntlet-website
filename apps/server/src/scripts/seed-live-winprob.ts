import 'dotenv/config';
import prisma from '../lib/prisma.js';

function rng(seed: number) {
  // simple LCG for deterministic runs
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

async function seedLiveWinProb() {
  const leagueId = process.env.SEED_LEAGUE_ID || process.env.LEAGUE_ID;
  const season = process.env.SEED_SEASON || process.env.SEASON || '2023';
  const week = Number(process.env.SEED_WEEK || '1');
  const pointsJitter = Number(process.env.SEED_POINTS_JITTER || '8');
  const samplesPerMatchup = Number(process.env.SEED_SAMPLES || '12');

  if (!leagueId) {
    throw new Error('Provide SEED_LEAGUE_ID or LEAGUE_ID');
  }

  // Get paired matchups by matchupId
  const rows = await prisma.matchup.findMany({
    where: { leagueId, week },
    orderBy: { matchupId: 'asc' },
  });
  const groups = new Map<number, typeof rows>();
  for (const m of rows) {
    if (m.matchupId == null) continue;
    const g = groups.get(m.matchupId) || [];
    g.push(m);
    groups.set(m.matchupId, g);
  }

  let total = 0;
  const now = Date.now();
  for (const [matchupId, g] of groups) {
    if (g.length !== 2) continue;
    const a = g[0];
    const b = g[1];
    const baseA = a.points || 0;
    const baseB = b.points || 0;
    const seed = matchupId * 1000 + week;
    const rand = rng(seed);

    for (let i = 0; i < samplesPerMatchup; i++) {
      const t = new Date(now - (samplesPerMatchup - i) * 10 * 60 * 1000); // every 10 mins
      const progress = Math.min(1, (i + 1) / samplesPerMatchup);
      const jitterA = (rand() - 0.5) * 2 * pointsJitter;
      const jitterB = (rand() - 0.5) * 2 * pointsJitter;
      const scoreA = Math.max(0, baseA * progress + jitterA);
      const scoreB = Math.max(0, baseB * progress + jitterB);

      const meanA = baseA + (1 - progress) * (10 + rand() * 30);
      const meanB = baseB + (1 - progress) * (10 + rand() * 30);
      const winProbA = 1 / (1 + Math.exp(-(scoreA - scoreB) / 12));
      const winProbB = 1 - winProbA;

      await (prisma as any).liveWinProbSample.create({
        data: {
          leagueId,
          week,
          matchupId,
          rosterAId: a.rosterId,
          rosterBId: b.rosterId,
          timestamp: t,
          gameProgress: progress,
          winProbA,
          winProbB,
          projectedFinalA: meanA,
          projectedFinalB: meanB,
          currentScoreA: scoreA,
          currentScoreB: scoreB,
          spread: meanA - meanB,
          total: meanA + meanB,
        },
      });
      total++;
    }
  }

  console.log(`Seeded ${total} LiveWinProbSample rows for league ${leagueId} week ${week}`);
}

seedLiveWinProb()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
