import { Router, Request, Response } from 'express';
import { getLeagueOverview, getTeams } from '../services/league.service';

const router = Router();

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const league = await getLeagueOverview();
    if (league) {
      res.json(league);
    } else {
      res.status(404).json({ error: 'League not found' });
    }
  } catch (error) {
    console.error('Error fetching league overview:', error);
    res.status(500).json({ error: 'Failed to fetch league overview' });
  }
});

router.get('/teams', async (req: Request, res: Response) => {
  try {
    console.log('[API Route] /teams endpoint hit');
    const teams = await getTeams();
    console.log(`[API Route] Returning ${teams.length} teams`);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

export default router;
