import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch league data directly from database
    // You'll need to adjust this query based on your actual schema
    const leagues = await prisma.league.findMany({
      include: {
        rosters: {
          include: {
            user: true,
          },
        },
      },
    });

    // For now, return the first league (adjust as needed)
    const league = leagues[0];

    if (!league) {
      return NextResponse.json({ error: 'No league found' }, { status: 404 });
    }

    return NextResponse.json(league);
  } catch (error) {
    console.error('Error fetching league overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
