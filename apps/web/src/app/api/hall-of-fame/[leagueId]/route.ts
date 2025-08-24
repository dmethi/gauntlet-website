import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  const { searchParams } = new URL(request.url);
  const { leagueId } = params;

  // Query parameters
  const group = searchParams.get('group'); // Filter by category group
  const category = searchParams.get('category'); // Filter by specific category
  const recordType = searchParams.get('type'); // 'top' or 'bottom'
  const season = searchParams.get('season') || '2023'; // Default to 2023
  // No limit needed - Hall of Fame always shows all top 5/bottom 5 records
  const debug = searchParams.has('debug');

  try {
    const prisma = await getPrisma();

    // Build where clause
    const where: Prisma.HallOfFameRecordWhereInput = {
      leagueId,
      season,
    };

    if (recordType && (recordType === 'top' || recordType === 'bottom')) {
      where.recordType = recordType;
    }

    if (category) {
      where.category = {
        name: category,
      };
    } else if (group) {
      where.category = {
        groupName: group,
      };
    }

    // Get records with category and roster details
    const records = await prisma.hallOfFameRecord.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            displayName: true,
            description: true,
            groupName: true,
            statType: true,
          },
        },
        roster: {
          select: {
            id: true,
            owner: {
              select: {
                displayName: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [
        { category: { groupName: 'asc' } },
        { category: { sortOrder: 'asc' } },
        { recordType: 'asc' },
        { rank: 'asc' },
      ],
      // No limit - Hall of Fame should show all top 5/bottom 5 records
    });

    // Get available categories for metadata
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

    // Group categories by group name for easy access
    const categoryGroups = categories.reduce(
      (groups, cat) => {
        if (!groups[cat.groupName]) {
          groups[cat.groupName] = [];
        }
        groups[cat.groupName].push(cat);
        return groups;
      },
      {} as Record<string, typeof categories>
    );

    // Group records by category for easier UI consumption
    const recordsByCategory = records.reduce(
      (groups, record) => {
        const categoryName = record.category.name;
        if (!groups[categoryName]) {
          groups[categoryName] = {
            category: record.category,
            top: [],
            bottom: [],
          };
        }

        if (record.recordType === 'top') {
          groups[categoryName].top.push(record);
        } else {
          groups[categoryName].bottom.push(record);
        }

        return groups;
      },
      {} as Record<string, any>
    );

    return NextResponse.json({
      success: true,
      data: {
        records: recordsByCategory,
        rawRecords: records,
        categories: categoryGroups,
      },
      meta: {
        leagueId,
        season,
        totalRecords: records.length,
        totalCategories: Object.keys(recordsByCategory).length,
        filters: { group, category, recordType },
      },
    });
  } catch (error) {
    console.error('Hall of Fame API error:', {
      leagueId,
      season,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    const body = debug
      ? {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch Hall of Fame records',
            detail: (error as Error).message,
            leagueId,
            season,
          },
        }
      : {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch Hall of Fame records',
          },
        };

    return NextResponse.json(body, { status: 500 });
  }
}
