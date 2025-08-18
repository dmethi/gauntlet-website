import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function POST(request: Request) {
  try {
    const { playerIds, season, week } = (await request.json()) as {
      playerIds: string[];
      season: string;
      week: number;
    };
    const ids = Array.isArray(playerIds) ? playerIds.filter(Boolean) : [];
    if (ids.length === 0 || !season || !week) {
      return NextResponse.json({
        playerStats: {},
        week,
        season,
        requested: ids.length,
        foundStats: 0,
        foundProjections: 0,
      });
    }
    const prisma = await getPrisma();
    const rows = await prisma.playerStats.findMany({
      where: { playerId: { in: ids }, season, week: Number(week) },
    });
    const statsMap: Record<
      string,
      {
        actual: Record<string, number> | null;
        projections: Record<string, number> | null;
        hasActual: boolean;
        hasProjections: boolean;
      }
    > = {};
    for (const pid of ids) {
      statsMap[pid] = { actual: null, projections: null, hasActual: false, hasProjections: false };
    }
    for (const row of rows) {
      const entry = statsMap[row.playerId] || {
        actual: null,
        projections: null,
        hasActual: false,
        hasProjections: false,
      };
      if (row.statsType === 'stats') {
        entry.actual = row.stats as unknown as Record<string, number>;
        entry.hasActual = true;
      } else if (row.statsType === 'projections') {
        entry.projections = row.stats as unknown as Record<string, number>;
        entry.hasProjections = true;
      }
      statsMap[row.playerId] = entry;
    }
    const foundStats = rows.filter(r => r.statsType === 'stats').length;
    const foundProjections = rows.filter(r => r.statsType === 'projections').length;
    return NextResponse.json({
      playerStats: statsMap,
      week,
      season,
      requested: ids.length,
      foundStats,
      foundProjections,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('players:stats:batch error', { message: (error as Error).message });
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 });
  }
}
