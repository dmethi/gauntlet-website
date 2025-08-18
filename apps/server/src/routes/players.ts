import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// Get players by IDs (for matchup player lookups)
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { playerIds } = req.body;

    if (!playerIds || !Array.isArray(playerIds)) {
      return res.status(400).json({
        error: 'playerIds array is required',
      });
    }

    console.log('🔍 [API] Fetching players for IDs:', playerIds.length);

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: playerIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        team: true,
        position: true,
      },
    });

    console.log('📊 [API] Found players:', players.length);

    // Create a lookup map for easy access
    const playerMap = players.reduce(
      (acc, player) => {
        acc[player.id] = player;
        return acc;
      },
      {} as Record<string, (typeof players)[0]>
    );

    return res.json({
      players: playerMap,
      found: players.length,
      requested: playerIds.length,
    });
  } catch (error) {
    console.error('💥 [API] Error fetching players:', error);
    return res.status(500).json({
      error: 'Failed to fetch players',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get a single player by ID
router.get('/:playerId', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        team: true,
        position: true,
        status: true,
        injuryStatus: true,
        number: true,
        age: true,
        yearsExp: true,
      },
    });

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
        playerId,
      });
    }

    return res.json({ player });
  } catch (error) {
    console.error('💥 [API] Error fetching player:', error);
    return res.status(500).json({
      error: 'Failed to fetch player',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search players by name (for future use)
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const players = await prisma.player.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        team: true,
        position: true,
      },
      take: limit,
      orderBy: { fullName: 'asc' },
    });

    return res.json({
      players,
      query,
      found: players.length,
    });
  } catch (error) {
    console.error('💥 [API] Error searching players:', error);
    return res.status(500).json({
      error: 'Failed to search players',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get player stats for a specific week and season
router.get('/:playerId/stats/:season/:week', async (req: Request, res: Response) => {
  try {
    const { playerId, season, week } = req.params;
    const weekNumber = parseInt(week);

    if (isNaN(weekNumber)) {
      return res.status(400).json({
        error: 'Invalid week parameter',
      });
    }

    const [actualStats, projections] = await Promise.all([
      prisma.playerStats.findUnique({
        where: {
          playerId_week_season_statsType: {
            playerId,
            week: weekNumber,
            season,
            statsType: 'stats',
          },
        },
      }),
      prisma.playerStats.findUnique({
        where: {
          playerId_week_season_statsType: {
            playerId,
            week: weekNumber,
            season,
            statsType: 'projections',
          },
        },
      }),
    ]);

    return res.json({
      playerId,
      week: weekNumber,
      season,
      actual: actualStats?.stats || null,
      projections: projections?.stats || null,
      hasActual: !!actualStats,
      hasProjections: !!projections,
    });
  } catch (error) {
    console.error('💥 [API] Error fetching player stats:', error);
    return res.status(500).json({
      error: 'Failed to fetch player stats',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get player stats for multiple players (batch)
router.post('/stats/batch', async (req: Request, res: Response) => {
  try {
    const { playerIds, season, week } = req.body;
    const weekNumber = parseInt(week);

    if (!playerIds || !Array.isArray(playerIds) || !season || isNaN(weekNumber)) {
      return res.status(400).json({
        error: 'playerIds array, season, and week are required',
      });
    }

    console.log('🔍 [API] Fetching stats for players:', playerIds.length, 'week', weekNumber);

    const [actualStats, projections] = await Promise.all([
      prisma.playerStats.findMany({
        where: {
          playerId: { in: playerIds },
          week: weekNumber,
          season,
          statsType: 'stats',
        },
      }),
      prisma.playerStats.findMany({
        where: {
          playerId: { in: playerIds },
          week: weekNumber,
          season,
          statsType: 'projections',
        },
      }),
    ]);

    // Organize by playerId for easy lookup
    const statsMap = actualStats.reduce(
      (acc, stat) => {
        acc[stat.playerId] = stat.stats;
        return acc;
      },
      {} as Record<string, any>
    );

    const projectionsMap = projections.reduce(
      (acc, proj) => {
        acc[proj.playerId] = proj.stats;
        return acc;
      },
      {} as Record<string, any>
    );

    const result = playerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = {
          actual: statsMap[playerId] || null,
          projections: projectionsMap[playerId] || null,
          hasActual: !!statsMap[playerId],
          hasProjections: !!projectionsMap[playerId],
        };
        return acc;
      },
      {} as Record<string, any>
    );

    console.log('📊 [API] Found stats for:', Object.keys(statsMap).length, 'players');
    console.log('📊 [API] Found projections for:', Object.keys(projectionsMap).length, 'players');

    return res.json({
      playerStats: result,
      week: weekNumber,
      season,
      requested: playerIds.length,
      foundStats: Object.keys(statsMap).length,
      foundProjections: Object.keys(projectionsMap).length,
    });
  } catch (error) {
    console.error('💥 [API] Error fetching batch player stats:', error);
    return res.status(500).json({
      error: 'Failed to fetch player stats',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
