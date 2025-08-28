import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  try {
    const prisma = await getPrisma();

    // Fetch all leagues with rosters, owners, and co-owners
    const leagues = await prisma.league.findMany({
      include: {
        rosters: {
          include: {
            owner: true,
          },
        },
        _count: {
          select: {
            rosters: true,
            matchups: true,
            transactions: true,
          },
        },
      },
      orderBy: [{ season: 'desc' }, { name: 'asc' }],
    });

    // Fetch co-owner details for all rosters
    const allCoOwnerIds = new Set<string>();
    leagues.forEach(league => {
      league.rosters.forEach(roster => {
        if (roster.coOwners && roster.coOwners.length > 0) {
          roster.coOwners.forEach(coOwnerId => allCoOwnerIds.add(coOwnerId));
        }
      });
    });

    const coOwnerUsers =
      allCoOwnerIds.size > 0
        ? await prisma.user.findMany({
            where: { id: { in: Array.from(allCoOwnerIds) } },
          })
        : [];

    // Add co-owner details to each roster
    const leaguesWithCoOwners = leagues.map(league => ({
      ...league,
      rosters: league.rosters.map(roster => ({
        ...roster,
        coOwnerDetails:
          roster.coOwners
            ?.map(coOwnerId => coOwnerUsers.find(user => user.id === coOwnerId))
            .filter(Boolean) || [],
      })),
    }));

    return NextResponse.json({
      ok: true,
      data: leaguesWithCoOwners,
      count: leaguesWithCoOwners.length,
    });
  } catch (error) {
    console.error('leagues API error:', {
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });

    const body = debug
      ? {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'Failed to fetch leagues',
            hasDbUrl: Boolean(process.env.DATABASE_URL),
            detail: (error as Error).message,
          },
        }
      : {
          ok: false,
          error: 'Internal Server Error',
        };

    return NextResponse.json(body, { status: 500 });
  }
}
