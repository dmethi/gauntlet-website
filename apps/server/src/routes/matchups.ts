import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// Get matchups for a specific league and week
router.get('/:leagueId/:week', async (req: Request, res: Response) => {
  try {
    const { leagueId, week } = req.params;
    const weekNumber = parseInt(week);

    console.log('🔍 [API] Fetching matchups:', { leagueId, week, weekNumber });

    if (!leagueId || isNaN(weekNumber)) {
      console.error('❌ [API] Invalid parameters:', { leagueId, week, weekNumber });
      return res.status(400).json({
        error: 'Invalid leagueId or week parameter',
      });
    }

    // Get all matchups for the week
    console.log('🗄️ [API] Querying matchups from database...');
    const matchups = await prisma.matchup.findMany({
      where: {
        leagueId,
        week: weekNumber,
      },
      include: {
        roster: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [{ matchupId: 'asc' }, { rosterId: 'asc' }],
    });

    console.log('📊 [API] Found matchups:', matchups.length);
    console.log('📋 [API] Sample matchup data:', matchups[0] || 'No matchups found');

    // Get matchup summaries for pairing information
    console.log('🗄️ [API] Querying matchup summaries...');
    const matchupSummaries = await prisma.matchupSummary.findMany({
      where: {
        leagueId,
        week: weekNumber,
      },
    });

    console.log('📊 [API] Found summaries:', matchupSummaries.length);

    // Group matchups by matchupId
    const groupedMatchups = matchups.reduce(
      (acc, matchup) => {
        const matchupId = matchup.matchupId;
        if (!matchupId) return acc;

        if (!acc[matchupId]) {
          acc[matchupId] = [];
        }
        acc[matchupId].push(matchup);
        return acc;
      },
      {} as Record<number, typeof matchups>
    );

    // Format the response to include paired matchups
    const formattedMatchups = Object.entries(groupedMatchups).map(([matchupId, teams]) => {
      const summary = matchupSummaries.find(s => s.matchupId === parseInt(matchupId));

      return {
        matchupId: parseInt(matchupId),
        teams: teams.map(team => ({
          rosterId: team.rosterId,
          owner: team.roster.owner,
          points: team.points,
          customPoints: team.customPoints,
          starters: team.starters,
          startersPoints: team.startersPoints,
          players: team.players,
          playersPoints: team.playersPoints,
          // Add roster metadata
          rosterSettings: team.roster.settings,
          rosterMetadata: team.roster.metadata,
        })),
        summary: summary
          ? {
              pointsA: summary.pointsA,
              pointsB: summary.pointsB,
              winnerRosterId: summary.winnerRosterId,
              margin: summary.margin,
            }
          : null,
      };
    });

    const response = {
      matchups: formattedMatchups,
      week: weekNumber,
      leagueId,
      totalMatchups: formattedMatchups.length,
    };

    console.log('✅ [API] Sending response:', {
      totalMatchups: response.totalMatchups,
      week: response.week,
      leagueId: response.leagueId,
    });

    return res.json(response);
  } catch (error) {
    console.error('💥 [API] Error fetching matchups:', error);
    return res.status(500).json({
      error: 'Failed to fetch matchups',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get a specific matchup by league, week, and matchupId
router.get('/:leagueId/:week/:matchupId', async (req: Request, res: Response) => {
  try {
    const { leagueId, week, matchupId } = req.params;
    const weekNumber = parseInt(week);
    const matchupIdNumber = parseInt(matchupId);

    if (!leagueId || isNaN(weekNumber) || isNaN(matchupIdNumber)) {
      return res.status(400).json({
        error: 'Invalid parameters',
      });
    }

    // Get the specific matchup
    const matchups = await prisma.matchup.findMany({
      where: {
        leagueId,
        week: weekNumber,
        matchupId: matchupIdNumber,
      },
      include: {
        roster: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { rosterId: 'asc' },
    });

    if (matchups.length === 0) {
      return res.status(404).json({
        error: 'Matchup not found',
      });
    }

    // Get matchup summary
    const summary = await prisma.matchupSummary.findUnique({
      where: {
        leagueId_week_matchupId: {
          leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
        },
      },
    });

    const formattedMatchup = {
      matchupId: matchupIdNumber,
      teams: matchups.map(team => ({
        rosterId: team.rosterId,
        owner: team.roster.owner,
        points: team.points,
        customPoints: team.customPoints,
        starters: team.starters,
        startersPoints: team.startersPoints,
        players: team.players,
        playersPoints: team.playersPoints,
        rosterSettings: team.roster.settings,
        rosterMetadata: team.roster.metadata,
      })),
      summary: summary
        ? {
            pointsA: summary.pointsA,
            pointsB: summary.pointsB,
            winnerRosterId: summary.winnerRosterId,
            margin: summary.margin,
          }
        : null,
    };

    return res.json({
      matchup: formattedMatchup,
      week: weekNumber,
      leagueId,
    });
  } catch (error) {
    console.error('Error fetching specific matchup:', error);
    return res.status(500).json({
      error: 'Failed to fetch matchup',
    });
  }
});

export default router;
