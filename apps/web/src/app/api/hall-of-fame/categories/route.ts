import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  try {
    const prisma = await getPrisma();

    // Get all active categories
    const categories = await prisma.hallOfFameCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        groupName: true,
        statType: true,
        sortOrder: true,
      },
      orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by category group
    const categoryGroups = categories.reduce(
      (groups, category) => {
        const groupName = category.groupName;
        if (!groups[groupName]) {
          groups[groupName] = {
            name: groupName,
            categories: [],
          };
        }
        groups[groupName].categories.push(category);
        return groups;
      },
      {} as Record<string, { name: string; categories: typeof categories }>
    );

    // Get stats about records per category
    const categoryStats = await prisma.hallOfFameRecord.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
    });

    const categoryStatsMap = categoryStats.reduce(
      (map, stat) => {
        map[stat.categoryId] = stat._count.id;
        return map;
      },
      {} as Record<string, number>
    );

    // Add record counts to categories
    const enrichedCategories = categories.map(category => ({
      ...category,
      recordCount: categoryStatsMap[category.id] || 0,
    }));

    const enrichedGroups = Object.values(categoryGroups).map(group => ({
      ...group,
      categories: group.categories.map(cat => ({
        ...cat,
        recordCount: categoryStatsMap[cat.id] || 0,
      })),
      totalRecords: group.categories.reduce((sum, cat) => sum + (categoryStatsMap[cat.id] || 0), 0),
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: enrichedCategories,
        groups: enrichedGroups,
      },
      meta: {
        totalCategories: categories.length,
        totalGroups: Object.keys(categoryGroups).length,
        totalRecords: categoryStats.reduce((sum, stat) => sum + stat._count.id, 0),
      },
    });
  } catch (error) {
    console.error('Hall of Fame Categories API error:', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    const body = debug
      ? {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch Hall of Fame categories',
            detail: (error as Error).message,
          },
        }
      : {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch Hall of Fame categories',
          },
        };

    return NextResponse.json(body, { status: 500 });
  }
}
