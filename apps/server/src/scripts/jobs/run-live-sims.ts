import prisma from '../../lib/prisma.js';
import axios from 'axios';
import { simulateMatchupProbability } from '@gauntlet/sim-engine';

async function fetchEspnScoreboard() {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
  const { data } = await axios.get(url, { timeout: 10000 });
  return data as any;
}

function computeGameProgressFromEspn(status: any): number {
  // Simple linear proxy: if in-game, map period/clock to 0..1; else 0 pre, 1 post
  const type = status?.type || {};
  const state = type.state; // 'pre', 'in', 'post'
  if (state === 'pre') return 0;
  if (state === 'post') return 1;
  const period = (type as any).period || 1;
  const clock = (type as any).clock || 0; // seconds remaining in period
  // NFL: 4 quarters, 900 sec each; basic approx
  const total = 4 * 900;
  const elapsed = (period - 1) * 900 + (900 - clock);
  return Math.min(Math.max(elapsed / total, 0), 1);
}

async function buildPlayersFromRoster(rosterId: number, week: number) {
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
  const scoreboard = await fetchEspnScoreboard();
  const events = (scoreboard.events || []) as any[];

  // Identify active/in-progress games
  const inProgress = events.filter(ev => ev?.competitions?.[0]?.status?.type?.state === 'in');
  if (inProgress.length === 0) {
    console.log('No live NFL games currently in progress. Skipping.');
    process.exit(0);
  }

  // For this league, find current week's paired matchups
  const matchups = await prisma.matchup.findMany({ where: { leagueId, week } });
  const byMatchupId: Record<number, any[]> = {};
  for (const m of matchups) {
    if (m.matchupId == null) continue;
    byMatchupId[m.matchupId] = byMatchupId[m.matchupId] || [];
    byMatchupId[m.matchupId].push(m);
  }

  for (const [mid, pair] of Object.entries(byMatchupId)) {
    if ((pair as any[]).length !== 2) continue;
    const [a, b] = pair as any[];

    // Compute game progress: prefer ESPN, fallback to points/projection ratio
    const espnType = inProgress[0]?.competitions?.[0]?.status?.type; // crude approximation
    const espnProgress = computeGameProgressFromEspn(espnType);

    const [team1Players, team2Players] = await Promise.all([
      buildPlayersFromRoster(a.rosterId, week),
      buildPlayersFromRoster(b.rosterId, week),
    ]);

    // Fallback progress if no ESPN
    const projA = team1Players.reduce((s, p) => s + p.projection, 0);
    const projB = team2Players.reduce((s, p) => s + p.projection, 0);
    const ratioA = projA > 0 ? (a.points || 0) / projA : 0;
    const ratioB = projB > 0 ? (b.points || 0) / projB : 0;
    const fallbackProgress = Math.max(0, Math.min(1, Math.max(ratioA, ratioB)));
    const gameProgress = Number.isFinite(espnProgress) ? espnProgress : fallbackProgress;

    const sim = await simulateMatchupProbability(
      team1Players as any,
      team2Players as any,
      10000,
      gameProgress
    );

    await (prisma as any).liveWinProbSample.create({
      data: {
        leagueId,
        week,
        matchupId: Number(mid),
        rosterAId: a.rosterId,
        rosterBId: b.rosterId,
        gameProgress,
        winProbA: sim.team1WinPct,
        winProbB: sim.team2WinPct,
        projectedFinalA: sim.team1Scores.mean,
        projectedFinalB: sim.team2Scores.mean,
        currentScoreA: a.points || 0,
        currentScoreB: b.points || 0,
        spread: sim.impliedOdds.spread,
        total: sim.impliedOdds.total,
      },
    });
  }

  console.log('Live sims complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
