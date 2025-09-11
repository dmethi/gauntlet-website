import { NextRequest, NextResponse } from 'next/server';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  try {
    const prisma = await getPrisma();
    const { leagueId, week } = params;
    const weekNum = parseInt(week, 10);

    // Fetch win probability samples for the specified league and week
    const samples = await prisma.liveWinProbSample.findMany({
      where: {
        leagueId,
        week: weekNum,
      },
      orderBy: [{ matchupId: 'asc' }, { timestamp: 'asc' }],
    });

    return NextResponse.json(samples);
  } catch (error) {
    console.error('Error fetching win probability data:', error);
    return NextResponse.json({ error: 'Failed to fetch win probability data' }, { status: 500 });
  }
}
