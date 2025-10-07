import { NextResponse } from 'next/server';
import { analyzeStartSitEfficiency } from '@/features/start-sit/utils';

export async function GET() {
  try {
    const data = await analyzeStartSitEfficiency();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running start/sit efficiency analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to run start/sit efficiency analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// Force refresh the analysis (ignores cache)
export async function POST() {
  try {
    console.log('🔄 Force refreshing start/sit efficiency analysis (server-computed)...');
    const data = await analyzeStartSitEfficiency();
    return NextResponse.json({
      message: 'Analysis regeneration completed',
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error('Error force refreshing analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to refresh analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
