/**
 * Reports List API Route
 *
 * Returns a list of available weekly recap reports from the file system.
 * Used by the competition page and reports feed page.
 * Supports both new format and legacy reports.
 */

import { NextResponse } from 'next/server';
import { getAvailableReports } from '@/lib/reports/recap/utils/report-loader';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');

    // Get all available reports (includes both new and legacy)
    let reports = await getAvailableReports();

    // Apply limit if specified
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be between 1 and 100.' },
          { status: 400 },
        );
      }
      reports = reports.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error('Error fetching reports list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reports list',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
