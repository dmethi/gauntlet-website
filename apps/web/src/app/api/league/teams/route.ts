import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET() {
  try {
    const prisma = await getPrisma();
    const leagues = await prisma.league.findMany({
      include: {
        rosters: {
          include: {
            owner: true,
          },
        },
      },
    });
    const league = leagues[0];
    if (!league) return NextResponse.json({ teams: [] });
    const teams = league.rosters.map(r => {
      const md = r.owner?.metadata as Prisma.JsonValue | null | undefined;
      let teamName: string | undefined;
      if (md && typeof md === 'object' && !Array.isArray(md)) {
        const obj = md as Prisma.JsonObject;
        const val = obj['team_name'];
        if (typeof val === 'string') teamName = val;
      }
      return {
        id: r.id,
        name: teamName || r.owner?.displayName || r.owner?.username || `Team ${r.id}`,
        owner: r.owner?.displayName || r.owner?.username || 'Unknown',
      };
    });
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
