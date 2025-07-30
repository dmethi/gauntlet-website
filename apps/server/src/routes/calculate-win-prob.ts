import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { simulateMatchupProbability, type Lineup, type LineupPlayer } from '@gauntlet/sim-engine';

const prisma = new PrismaClient();
const router = Router();

interface Matchup {
  matchupId: number;
  roster_id: number;
  points: number;
  starters: string[];
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { matchups, timestamp } = req.body;

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

        // Get player projections and current points
        const [team1Lineup, team2Lineup] = await Promise.all([
          buildLineup(team1.starters),
          buildLineup(team2.starters),
        ]);

        // Calculate game progress (rough estimate based on current points vs projections)
        const team1Progress = calculateGameProgress(team1Lineup, team1.points);
        const team2Progress = calculateGameProgress(team2Lineup, team2.points);
        const gameProgress = Math.max(team1Progress, team2Progress);

        // Run simulation
        const simResult = await simulateMatchupProbability(
          team1Lineup,
          team2Lineup,
          1000, // Reduced for API performance
          gameProgress
        );

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

    return res.json({ results: results.filter(Boolean) });
  } catch (error) {
    console.error('Error calculating win probabilities:', error);
    return res.status(500).json({ error: 'Failed to calculate win probabilities' });
  }
});

async function buildLineup(playerIds: string[]): Promise<Lineup> {
  // Get player data and projections
  const players: any[] = await prisma.player.findMany({
    where: { id: { in: playerIds } },
  });

  const stats = await prisma.playerStats.findMany({
    where: {
      playerId: { in: playerIds },
      statsType: 'projections',
      season: new Date().getFullYear().toString(),
      week: getCurrentWeek(),
    },
  });

  // Map players to lineup positions
  const lineup: Partial<Lineup> = {};
  let flexCandidates: LineupPlayer[] = [];

  for (const player of players) {
    const projection = stats.find((s: any) => s.playerId === player.id);
    const playerData: LineupPlayer = {
      id: player.id,
      name: player.fullName,
      position: player.position,
      projection: (projection?.stats as any)?.pts_ppr || 0,
    };

    switch (player.position) {
      case 'QB':
        if (!lineup.qb) lineup.qb = playerData;
        break;
      case 'RB':
        if (!lineup.rb1) lineup.rb1 = playerData;
        else if (!lineup.rb2) lineup.rb2 = playerData;
        else flexCandidates.push(playerData);
        break;
      case 'WR':
        if (!lineup.wr1) lineup.wr1 = playerData;
        else if (!lineup.wr2) lineup.wr2 = playerData;
        else if (!lineup.wr3) lineup.wr3 = playerData;
        else flexCandidates.push(playerData);
        break;
      case 'TE':
        if (!lineup.te) lineup.te = playerData;
        else flexCandidates.push(playerData);
        break;
    }
  }

  // Fill in any missing positions with placeholder players
  const placeholder = (pos: string): LineupPlayer => ({
    id: `placeholder_${pos}`,
    name: `Placeholder ${pos}`,
    position: pos,
    projection: 0,
  });

  // Use highest projected remaining player for FLEX
  if (flexCandidates.length > 0) {
    flexCandidates.sort((a, b) => b.projection - a.projection);
    lineup.flex = flexCandidates[0];
  }

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

function calculateGameProgress(lineup: Lineup, currentPoints: number): number {
  const totalProjected: number = Object.values(lineup).reduce(
    (sum: number, player: LineupPlayer) => sum + player.projection,
    0
  );
  if (totalProjected === 0) return 0;
  return Math.min(Math.max(currentPoints / totalProjected, 0), 1);
}

function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2024-09-05'); // Update each season
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1;
}

export default router;
