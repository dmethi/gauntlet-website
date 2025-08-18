import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const teamId = Number(params.id);

  try {
    const roster = await prisma.roster.findUnique({
      where: { id: teamId },
      include: {
        user: true,
        league: {
          include: {
            rosters: {
              include: {
                user: true,
              },
            },
          },
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
