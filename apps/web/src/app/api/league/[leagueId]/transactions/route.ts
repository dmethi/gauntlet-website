import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactionsByWeek,
  getAllTransactionsByLeague,
  getCurrentWeek,
} from '@/lib/api-replacements';

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = params.leagueId;
    const weekParam = searchParams.get('week');
    const limit = parseInt(searchParams.get('limit') || '0');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    let transactions: any[];

    if (weekParam) {
      // Fetch specific week
      const week = parseInt(weekParam, 10);
      if (!Number.isFinite(week) || week < 1 || week > 18) {
        return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
      }
      transactions = await getTransactionsByWeek(leagueId, week);
    } else {
      // Fetch all transactions across all weeks
      transactions = await getAllTransactionsByLeague(leagueId);
    }

    // Apply pagination if requested
    let paginatedTransactions = transactions;
    if (limit > 0) {
      paginatedTransactions = transactions.slice(offset, offset + limit);
    }

    return NextResponse.json({
      ok: true,
      data: paginatedTransactions,
      count: paginatedTransactions.length,
      totalCount: transactions.length,
      week: weekParam ? parseInt(weekParam, 10) : 'all',
      leagueId,
      dbQueries: 0,
      dataSource: 'sleeper-api',
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
