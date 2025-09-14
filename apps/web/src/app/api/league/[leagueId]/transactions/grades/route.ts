import { NextResponse } from 'next/server';

// This route has been temporarily disabled during database migration
// It will be replaced with Sleeper API calls or static data
export async function GET() {
  return NextResponse.json({
    message: 'This endpoint is being migrated to use Sleeper API instead of database',
    data: [],
    dbQueries: 0,
    dataSource: 'migration-in-progress',
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'This endpoint is being migrated to use Sleeper API instead of database',
    data: [],
    dbQueries: 0,
    dataSource: 'migration-in-progress',
  });
}
