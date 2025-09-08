import prisma from '../../lib/prisma.js';
import axios from 'axios';
import {
  simulateMatchupProbabilityFromPlayers,
  type LineupPlayer,
} from '@gauntlet/sim-engine';

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

function normalizeNflTeamAbbreviation(abbreviation?: string): string | undefined {
  if (!abbreviation) return abbreviation;
  const mapping: Record<string, string> = { WSH: 'WAS', JAC: 'JAX' };
  return mapping[abbreviation] || abbreviation;
}

async function fetchSleeperLineup(leagueId: string, week: number, rosterId: number): Promise<string[]> {
  try {
    const res = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
    const sleeperRosterId = leagueId === '1263740549504962561' ? rosterId - 2000 : rosterId;
    const matchup = (res.data as any[]).find(m => m.roster_id === sleeperRosterId);
    return matchup?.starters || [];
  } catch {
    return [];
  }
}

async function fetchLivePlayerScores(leagueId: string, week: number): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};
  try {
    const res = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`, {
      headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    });
    (res.data as any[]).forEach(m => {
      const pp = m.players_points || {};
      Object.entries(pp).forEach(([pid, pts]) => {
        scores[pid] = Number(pts) || 0;
      });
    });
  } catch {}
  return scores;
}

async function buildPlayersFromRoster(
  leagueId: string,
  rosterId: number,
  week: number,
  livePlayerScores: Record<string, number>,
  liveNflTeams: Set<string>,
  postGameTeams: Set<string>
): Promise<LineupPlayer[]> {
  const roster = await prisma.roster.findUnique({ where: { id: rosterId } });
  const freshStarters = await fetchSleeperLineup(leagueId, week, rosterId);
  const playerIds = freshStarters.length > 0 ? freshStarters : roster?.starters || [];

  const players = await prisma.player.findMany({ where: { id: { in: playerIds } } });
  const byId = new Map(players.map(p => [p.id, p] as const));

  return (playerIds || [])
    .map(pid => {
      const p = byId.get(pid);
      if (!p) return null;
      const normalized = normalizeNflTeamAbbreviation(p.team || undefined);
      const state = postGameTeams.has(normalized || '')
        ? 'post'
        : liveNflTeams.has(normalized || '')
          ? 'live'
          : 'pre';

      const projStats = { pts: 0 } as any; // projection will be supplied by engine via players.projection
      let projection = 0; // default

      // We keep projection=0 for post-game; for pre/live we rely on sim engine inputs
      if (state !== 'post') {
        // Pull league-specific projection from playerStats if available as a fallback
        projection = 0; // We prefer engine-side projections; keep 0 to avoid double counting
      }

      const currentScore = livePlayerScores[pid] ?? 0;

      return {
        id: pid,
        name: p.fullName,
        position: p.position,
        projection,
        currentScore,
        nflTeam: normalized,
      } as LineupPlayer;
    })
    .filter(Boolean) as LineupPlayer[];
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
  const liveNflTeams = new Set<string>();
  inProgress.forEach(game => {
    game.competitions?.[0]?.competitors?.forEach((comp: any) => {
      const abbr = normalizeNflTeamAbbreviation(comp.team?.abbreviation);
      if (abbr) liveNflTeams.add(abbr);
    });
  });

  const postGames = events.filter(ev => ev?.competitions?.[0]?.status?.type?.state === 'post');
  const postGameTeams = new Set<string>();
  postGames.forEach(game => {
    game.competitions?.[0]?.competitors?.forEach((comp: any) => {
      const abbr = normalizeNflTeamAbbreviation(comp.team?.abbreviation);
      if (abbr) postGameTeams.add(abbr);
    });
  });

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

    // Compute game progress: use ESPN if available, else default late-game
    const espnType = inProgress[0]?.competitions?.[0]?.status?.type;
    const espnProgress = computeGameProgressFromEspn(espnType);
    const gameProgress = Number.isFinite(espnProgress) ? espnProgress : 0.9;

    const leagueIdStr = a.leagueId;
    const liveScores = await fetchLivePlayerScores(leagueIdStr, week);

    const [team1Players, team2Players] = await Promise.all([
      buildPlayersFromRoster(leagueIdStr, a.rosterId, week, liveScores, liveNflTeams, postGameTeams),
      buildPlayersFromRoster(leagueIdStr, b.rosterId, week, liveScores, liveNflTeams, postGameTeams),
    ]);

    const sim = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      10000,
      gameProgress,
      liveNflTeams
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
