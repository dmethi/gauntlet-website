import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; season: string; week: string } }
) {
  const { leagueId, week } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');
  try {
    const w = Number(week);
    if (!leagueId || Number.isNaN(w)) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'BAD_REQUEST', message: 'leagueId and numeric week are required' },
        },
        { status: 400 }
      );
    }
    const prisma = await getPrisma();
    const data = await prisma.rosterWeekAggregate.findMany({ where: { leagueId, week: w } });
    return NextResponse.json({ ok: true, data, meta: { leagueId, week: w, count: data.length } });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('rollups:week error', {
      leagueId,
      week,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debug
      ? {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'Failed to fetch week rollups',
            leagueId,
            week,
            hasDbUrl: Boolean(process.env.DATABASE_URL),
            detail: (error as Error).message,
          },
        }
      : { ok: false, error: { code: 'INTERNAL', message: 'Failed to fetch week rollups' } };
    return NextResponse.json(body, { status: 500 });
  }
}
