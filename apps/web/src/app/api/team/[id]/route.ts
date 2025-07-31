import { PrismaClient } from '../../../../generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const teamId = params.id;
  try {
    const league = await prisma.league.findFirst({
      where: {
        season: '2023',
      },
    });

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    const roster = await prisma.roster.findUnique({
      where: {
        id: parseInt(teamId),
        leagueId: league.id,
      },
      include: {
        owner: true,
        league: true,
        weeklyMetrics: {
          orderBy: { week: 'asc' },
        },
        matchups: {
          orderBy: { week: 'asc' },
        },
      },
    });

    if (!roster) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(roster);
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
