import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { type Lineup, type LineupPlayer, simulateMatchupProbability } from '@gauntlet/sim-engine';

const prisma = new PrismaClient();

interface Matchup {
  matchupId: number;
  roster_id: number;
  points: number;
  starters: string[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      matchups,
      timestamp,
      iterations = 2000,
      decayMode = 'linear',
      gameProgressOverride,
    } = await request.json();

    // Group matchups by matchupId
    const matchupPairs = matchups.reduce((acc: Record<number, Matchup[]>, matchup: Matchup) => {
      if (!matchup.matchupId) return acc;
      if (!acc[matchup.matchupId]) {
        acc[matchup.matchupId] = [];
      }
      acc[matchup.matchupId].push(matchup);
      return acc;
    }, {});

    // Process each matchup
    const results = await Promise.all(
      Object.values(matchupPairs).map(async (pair: any) => {
        if (pair.length !== 2) return null;

        const [team1, team2] = pair;

        // Build fixed-shape lineups from roster starters stored in DB
        const currentWeek = getCurrentWeek();
        const [team1Lineup, team2Lineup, roster1, roster2] = await Promise.all([
          buildLineupFromRoster(team1.roster_id, currentWeek),
          buildLineupFromRoster(team2.roster_id, currentWeek),
          prisma.roster.findUnique({ where: { id: team1.roster_id } }),
          prisma.roster.findUnique({ where: { id: team2.roster_id } }),
        ]);

        // Calculate game progress
        const team1Progress = calculateGameProgressFromPlayers(
          Object.values(team1Lineup),
          team1.points
        );
        const team2Progress = calculateGameProgressFromPlayers(
          Object.values(team2Lineup),
          team2.points
        );
        const computedProgress = Math.max(team1Progress, team2Progress);
        const gameProgress =
          typeof gameProgressOverride === 'number'
            ? Math.min(Math.max(gameProgressOverride, 0), 1)
            : computedProgress;

        // Run simulation
        const simResult = await simulateMatchupProbability(
          team1Lineup,
          team2Lineup,
          iterations,
          gameProgress
        );

        const leagueId = roster1?.leagueId || roster2?.leagueId;
        const week = currentWeek;

        // Persist snapshot to LiveWinProbSample
        if (leagueId) {
          await (prisma as any).liveWinProbSample.create({
            data: {
              leagueId,
              week,
              matchupId: team1.matchupId,
              rosterAId: team1.roster_id,
              rosterBId: team2.roster_id,
              timestamp: timestamp ? new Date(timestamp) : new Date(),
              gameProgress,
              winProbA: simResult.team1WinPct,
              winProbB: simResult.team2WinPct,
              projectedFinalA: simResult.team1Scores.mean,
              projectedFinalB: simResult.team2Scores.mean,
              currentScoreA: team1.points,
              currentScoreB: team2.points,
              spread: simResult.impliedOdds.spread,
              total: simResult.impliedOdds.total,
            },
          });
        }

        return {
          matchupId: team1.matchupId,
          team1: {
            rosterId: team1.roster_id,
            currentScore: team1.points,
            projectedFinal: simResult.team1Scores.mean,
            winProbability: simResult.team1WinPct,
            confidenceInterval: {
              low: simResult.team1Scores.p10,
              high: simResult.team1Scores.p90,
            },
            impliedOdds: simResult.impliedOdds.team1MoneyLine,
          },
          team2: {
            rosterId: team2.roster_id,
            currentScore: team2.points,
            projectedFinal: simResult.team2Scores.mean,
            winProbability: simResult.team2WinPct,
            confidenceInterval: {
              low: simResult.team2Scores.p10,
              high: simResult.team2Scores.p90,
            },
            impliedOdds: simResult.impliedOdds.team2MoneyLine,
          },
          spread: simResult.impliedOdds.spread,
          overUnder: simResult.impliedOdds.total,
          timestamp,
        };
      })
    );

    return NextResponse.json({ results: results.filter(Boolean) });
  } catch (error) {
    console.error('Error calculating win probabilities:', error);
    return NextResponse.json({ error: 'Failed to calculate win probabilities' }, { status: 500 });
  }
}

// Helper functions (copied from server)
async function buildPlayersFromRoster(rosterId: number, week: number): Promise<LineupPlayer[]> {
  const roster = await prisma.roster.findUnique({ where: { id: rosterId } });
  const playerIds = roster?.starters || [];
  if (playerIds.length === 0) return [];

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

  return playerIds
    .map(pid => {
      const player = byId.get(pid);
      if (!player) return null;
      const proj = stats.find(s => s.playerId === pid);
      const projection = (proj?.stats as any)?.pts_half_ppr ?? (proj?.stats as any)?.pts_ppr ?? 0;
      const lp: LineupPlayer = {
        id: player.id,
        name: player.fullName,
        position: player.position,
        projection,
      };
      return lp;
    })
    .filter((p): p is LineupPlayer => Boolean(p));
}

function calculateGameProgressFromPlayers(players: LineupPlayer[], currentPoints: number): number {
  const totalProjected = players.reduce((sum, p) => sum + p.projection, 0);
  if (totalProjected === 0) return 0;
  return Math.min(Math.max(currentPoints / totalProjected, 0), 1);
}

async function buildLineupFromRoster(rosterId: number, week: number): Promise<Lineup> {
  const players = await buildPlayersFromRoster(rosterId, week);

  const lineup: Partial<Lineup> = {};
  const flexCandidates: LineupPlayer[] = [];

  for (const p of players) {
    switch (p.position) {
      case 'QB':
        if (!lineup.qb) lineup.qb = p;
        break;
      case 'RB':
        if (!lineup.rb1) lineup.rb1 = p;
        else if (!lineup.rb2) lineup.rb2 = p;
        else flexCandidates.push(p);
        break;
      case 'WR':
        if (!lineup.wr1) lineup.wr1 = p;
        else if (!lineup.wr2) lineup.wr2 = p;
        else if (!lineup.wr3) lineup.wr3 = p;
        else flexCandidates.push(p);
        break;
      case 'TE':
        if (!lineup.te) lineup.te = p;
        else flexCandidates.push(p);
        break;
      default:
        // ignore K/DEF for now
        break;
    }
  }

  if (!lineup.flex && flexCandidates.length > 0) {
    flexCandidates.sort((a, b) => b.projection - a.projection);
    lineup.flex = flexCandidates[0];
  }

  const placeholder = (pos: string): LineupPlayer => ({
    id: `placeholder_${pos}`,
    name: `Placeholder ${pos}`,
    position: pos,
    projection: 0,
  });

  return {
    qb: lineup.qb || placeholder('QB'),
    rb1: lineup.rb1 || placeholder('RB'),
    rb2: lineup.rb2 || placeholder('RB'),
    wr1: lineup.wr1 || placeholder('WR'),
    wr2: lineup.wr2 || placeholder('WR'),
    wr3: lineup.wr3 || placeholder('WR'),
    te: lineup.te || placeholder('TE'),
    flex: lineup.flex || placeholder('RB'),
  };
}

function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2024-09-05'); // Update each season
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1;
}
