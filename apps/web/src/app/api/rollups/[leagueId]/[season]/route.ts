import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; season: string } }
) {
  const { leagueId } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');
  try {
    const prisma = await getPrisma();
    const [rosterWeekAggregates, leagueWeekSummaries] = await Promise.all([
      prisma.rosterWeekAggregate.findMany({
        where: { leagueId },
        orderBy: { week: 'asc' },
      }),
      prisma.leagueWeekSummary.findMany({
        where: { leagueId },
        orderBy: { week: 'asc' },
      }),
    ]);
    return NextResponse.json({
      ok: true,
      data: { rosterWeekAggregates, leagueWeekSummaries },
      meta: { leagueId },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('rollups:seasonal error', {
      leagueId,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debug
      ? {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'Failed to fetch seasonal aggregates',
            leagueId,
            hasDbUrl: Boolean(process.env.DATABASE_URL),
            detail: (error as Error).message,
          },
        }
      : { ok: false, error: { code: 'INTERNAL', message: 'Failed to fetch seasonal aggregates' } };
    return NextResponse.json(body, { status: 500 });
  }
}
