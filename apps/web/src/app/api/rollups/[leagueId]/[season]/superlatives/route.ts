import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; season: string } }
) {
  const { searchParams } = new URL(request.url);
  const { leagueId, season } = params;
  const category = searchParams.get('category') ?? undefined;
  const limit = searchParams.get('limit') ?? undefined;
  const offset = searchParams.get('offset') ?? undefined;
  try {
    const prisma = await getPrisma();
    const take = Math.min(100, Math.max(0, Number(limit ?? '100')));
    const skip = Math.max(0, Number(offset ?? '0'));
    const where: Prisma.SeasonSuperlativesWhereInput = { leagueId, season };
    if (category) where.category = category;
    const [data, total] = await Promise.all([
      prisma.seasonSuperlatives.findMany({ where, take, skip, orderBy: { category: 'asc' } }),
      prisma.seasonSuperlatives.count({ where }),
    ]);
    return NextResponse.json({
      ok: true,
      data,
      meta: { leagueId, season, total, limit: take, offset: skip },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Failed to fetch season superlatives' } },
      { status: 500 }
    );
  }
}
