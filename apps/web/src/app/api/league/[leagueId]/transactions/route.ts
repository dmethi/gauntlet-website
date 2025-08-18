import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(_request: Request, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params;
  try {
    const prisma = await getPrisma();
    const txns = await prisma.transaction.findMany({
      where: { leagueId },
      orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });

    type PlayerLite = { id: string; fullName: string; position: string; team: string | null };

    const playerIds = new Set<string>();
    const collectFromMapping = (mapping: Prisma.JsonValue | null) => {
      if (!mapping) return;
      if (Array.isArray(mapping)) {
        for (const pid of mapping as Array<string | number>) playerIds.add(String(pid));
      } else if (typeof mapping === 'object') {
        for (const pid of Object.keys(mapping as Prisma.JsonObject)) playerIds.add(String(pid));
      }
    };
    for (const t of txns) {
      collectFromMapping(t.adds as Prisma.JsonValue | null);
      collectFromMapping(t.drops as Prisma.JsonValue | null);
    }

    const players = playerIds.size
      ? await prisma.player.findMany({ where: { id: { in: Array.from(playerIds) } } })
      : [];
    const idToPlayer: Record<string, PlayerLite> = Object.fromEntries(
      players.map(p => [
        String(p.id),
        { id: p.id, fullName: p.fullName, position: p.position, team: p.team },
      ])
    );
    const ensureDst = (pid: string) => {
      if (/^[A-Z]{2,3}$/.test(pid) && !idToPlayer[pid]) {
        idToPlayer[pid] = { id: pid, fullName: `${pid} D/ST`, position: 'DEF', team: pid };
      }
    };
    playerIds.forEach(pid => ensureDst(pid));

    const toRosterPlayerGroups = (
      mapping: Prisma.JsonValue | null,
      fallbackRosterIds: number[]
    ): Array<{ rosterId: number; players: PlayerLite[] }> => {
      const grouped: Record<number, PlayerLite[]> = {};
      if (mapping && typeof mapping === 'object' && !Array.isArray(mapping)) {
        for (const [playerId, rid] of Object.entries(mapping as Prisma.JsonObject)) {
          const rosterId = Number(rid);
          if (!grouped[rosterId]) grouped[rosterId] = [];
          const p = idToPlayer[String(playerId)];
          if (p) grouped[rosterId].push(p);
        }
      } else if (Array.isArray(mapping)) {
        const rid = Number(fallbackRosterIds?.[0]);
        grouped[rid] = (mapping as Array<string | number>)
          .map(pid => idToPlayer[String(pid)])
          .filter((p): p is PlayerLite => Boolean(p));
      }
      return Object.entries(grouped).map(([rid, playersArr]) => ({
        rosterId: Number(rid),
        players: playersArr,
      }));
    };

    const data = txns.map(t => {
      const adds = toRosterPlayerGroups(t.adds as Prisma.JsonValue | null, t.rosterIds || []);
      const drops = toRosterPlayerGroups(t.drops as Prisma.JsonValue | null, t.rosterIds || []);
      const created = (t as unknown as { transactionAt?: Date }).transactionAt || t.createdAt;
      return {
        id: t.id,
        type: t.type,
        status: t.status,
        createdAt: created.toISOString(),
        rosterIds: t.rosterIds,
        adds,
        drops,
        waiver: (t as unknown as { waiver?: Prisma.JsonValue }).waiver ?? null,
        settings: (t.settings as Prisma.JsonValue) ?? undefined,
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:[leagueId]:transactions error', {
      leagueId,
      message: (error as Error).message,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
