import { Request, Response, Router } from 'express';
import { getLeagueOverview, getTeams } from '../services/league.service.js';
import prisma from '../lib/prisma.js';

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

// Roster details: metadata for players on a roster within a league
router.get('/:leagueId/rosters/:rosterId', async (req: Request, res: Response) => {
  try {
    const { leagueId, rosterId } = req.params as { leagueId: string; rosterId: string };
    const idNum = Number(rosterId);
    if (!leagueId || Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'leagueId and numeric rosterId are required' });
    }

    const roster = await prisma.roster.findFirst({
      where: { leagueId, id: idNum },
      select: { id: true, starters: true, players: true },
    });
    if (!roster) return res.status(404).json({ error: 'Roster not found' });

    const players = await prisma.player.findMany({
      where: { id: { in: roster.players } },
      select: { id: true, fullName: true, position: true, team: true },
    });

    return res.json({ rosterId: roster.id, starters: roster.starters, players });
  } catch (err) {
    console.error('Error fetching roster details:', err);
    return res.status(500).json({ error: 'Failed to fetch roster details' });
  }
});

// League transactions with expanded player details for adds/drops
router.get('/:leagueId/transactions', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params as { leagueId: string };
    if (!leagueId) return res.status(400).json({ error: 'leagueId is required' });

    const txns = await prisma.transaction.findMany({
      where: { leagueId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    console.log(`[transactions] leagueId=${leagueId} count=${txns.length}`);
    if (txns.length > 0) {
      const sample = txns.slice(0, 3).map(t => ({
        id: t.id,
        type: t.type,
        rosterIds: t.rosterIds,
        addsType: typeof (t as any).adds,
        dropsType: typeof (t as any).drops,
        addsPreview:
          (t as any).adds && typeof (t as any).adds === 'object'
            ? Object.entries((t as any).adds as Record<string, unknown>).slice(0, 3)
            : Array.isArray((t as any).adds)
              ? (t as any).adds.slice(0, 3)
              : (t as any).adds,
        dropsPreview:
          (t as any).drops && typeof (t as any).drops === 'object'
            ? Object.entries((t as any).drops as Record<string, unknown>).slice(0, 3)
            : Array.isArray((t as any).drops)
              ? (t as any).drops.slice(0, 3)
              : (t as any).drops,
      }));
      console.log('[transactions] sample', JSON.stringify(sample, null, 2));
    }

    // Collect player ids from adds/drops (handles arrays and maps of playerId -> rosterId)
    const playerIds = new Set<string>();
    const collectFromMapping = (mapping: unknown) => {
      if (!mapping) return;
      if (Array.isArray(mapping)) {
        for (const pid of mapping as string[]) playerIds.add(String(pid));
      } else if (typeof mapping === 'object') {
        for (const pid of Object.keys(mapping as Record<string, unknown>))
          playerIds.add(String(pid));
      }
    };
    for (const t of txns as any[]) {
      collectFromMapping((t as any).adds);
      collectFromMapping((t as any).drops);
    }

    const players = await prisma.player.findMany({
      where: { id: { in: Array.from(playerIds) } },
      select: { id: true, fullName: true, position: true, team: true },
    });
    const idToPlayer: Record<string, any> = Object.fromEntries(players.map(p => [String(p.id), p]));
    // Add defense/special-team fallbacks for team-abbrev ids like "HOU", "DEN", etc.
    const maybeMakeDst = (pid: string) => {
      if (/^[A-Z]{2,3}$/.test(pid) && !idToPlayer[pid]) {
        idToPlayer[pid] = { id: pid, fullName: `${pid} D/ST`, position: 'DEF', team: pid };
      }
    };
    playerIds.forEach(pid => maybeMakeDst(pid));
    // logging removed

    const toRosterPlayerGroups = (
      mapping: unknown,
      fallbackRosterIds: number[]
    ): Array<{ rosterId: number; players: any[] }> => {
      const grouped: Record<number, any[]> = {};
      if (mapping && typeof mapping === 'object' && !Array.isArray(mapping)) {
        // Sleeper format: { [playerId]: rosterId }
        for (const [playerId, rid] of Object.entries(mapping as Record<string, unknown>)) {
          const rosterId = Number(rid);
          if (!grouped[rosterId]) grouped[rosterId] = [];
          const p = idToPlayer[playerId];
          if (p) grouped[rosterId].push(p);
        }
      } else if (Array.isArray(mapping)) {
        // Fallback: assume array of playerIds applied to the first roster in the transaction
        const rid = Number(fallbackRosterIds?.[0]);
        grouped[rid] = (mapping as string[]).map(pid => idToPlayer[String(pid)]).filter(Boolean);
      }
      const result = Object.entries(grouped).map(([rid, players]) => ({
        rosterId: Number(rid),
        players,
      }));
      return result;
    };

    const data = txns.map(t => {
      const addsRaw = (t as any).adds as unknown;
      const dropsRaw = (t as any).drops as unknown;
      const addDetails = toRosterPlayerGroups(addsRaw, t.rosterIds || []);
      const dropDetails = toRosterPlayerGroups(dropsRaw, t.rosterIds || []);
      return {
        id: t.id,
        type: t.type,
        status: t.status,
        createdAt: t.createdAt,
        rosterIds: t.rosterIds,
        adds: addDetails,
        drops: dropDetails,
        waiver: (t as any).waiver ?? null,
        settings: t.settings,
      };
    });

    return res.json({ ok: true, data });
  } catch (err) {
    console.error('Error fetching league transactions:', err);
    return res.status(500).json({ error: 'Failed to fetch league transactions' });
  }
});

export default router;
