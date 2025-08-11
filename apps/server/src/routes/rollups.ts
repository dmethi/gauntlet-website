import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();
const db = prisma as any;

router.get('/:leagueId/:season/weeks/:week', async (req: Request, res: Response) => {
  try {
    const { leagueId, season, week } = req.params as {
      leagueId: string;
      season: string;
      week: string;
    };
    const w = Number(week);
    if (!leagueId || !season || Number.isNaN(w)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'leagueId, season, and numeric week are required',
        },
      });
    }
    const data = await db.rosterWeekAggregate.findMany({ where: { leagueId, week: w } });
    return res.json({ ok: true, data, meta: { leagueId, season, week: w, count: data.length } });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: { code: 'INTERNAL', message: 'Failed to fetch week rollups' } });
  }
});

router.get('/:leagueId/:season/superlatives', async (req: Request, res: Response) => {
  try {
    const { leagueId, season } = req.params as { leagueId: string; season: string };
    const { category, limit, offset } = req.query as {
      category?: string;
      limit?: string;
      offset?: string;
    };
    if (!leagueId || !season) {
      return res.status(400).json({
        ok: false,
        error: { code: 'BAD_REQUEST', message: 'leagueId and season are required' },
      });
    }
    const take = Math.min(100, Math.max(0, Number(limit ?? '100')));
    const skip = Math.max(0, Number(offset ?? '0'));
    const where: any = { leagueId, season };
    if (category) where.category = category;
    const [data, total] = await Promise.all([
      db.seasonSuperlatives.findMany({ where, take, skip, orderBy: { category: 'asc' } }),
      db.seasonSuperlatives.count({ where }),
    ]);
    return res.json({
      ok: true,
      data,
      meta: { leagueId, season, total, limit: take, offset: skip },
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: { code: 'INTERNAL', message: 'Failed to fetch season superlatives' },
    });
  }
});

// Seasonal aggregates for a league (all weeks). Returns roster week aggregates and league week summaries
router.get('/:leagueId/:season/seasonal', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params as { leagueId: string; season: string };
    if (!leagueId) {
      return res
        .status(400)
        .json({ ok: false, error: { code: 'BAD_REQUEST', message: 'leagueId is required' } });
    }
    const [rosterWeekAggregates, leagueWeekSummaries] = await Promise.all([
      db.rosterWeekAggregate.findMany({ where: { leagueId }, orderBy: { week: 'asc' } }),
      db.leagueWeekSummary.findMany({ where: { leagueId }, orderBy: { week: 'asc' } }),
    ]);
    return res.json({
      ok: true,
      data: { rosterWeekAggregates, leagueWeekSummaries },
      meta: { leagueId },
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: { code: 'INTERNAL', message: 'Failed to fetch seasonal aggregates' },
    });
  }
});

export default router;
