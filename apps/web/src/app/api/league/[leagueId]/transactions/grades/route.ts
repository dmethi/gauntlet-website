import { NextResponse } from 'next/server';

// This route has been temporarily disabled during database migration
// It will be replaced with Sleeper API calls or static data
export const GET = async () => {
  return NextResponse.json({
    message: 'This endpoint is being migrated to use Sleeper API instead of database',
    data: [],
    dbQueries: 0,
    dataSource: 'migration-in-progress',
  });
};

export const POST = async () => {
  return NextResponse.json({
    message: 'This endpoint is being migrated to use Sleeper API instead of database',
    data: [],
    dbQueries: 0,
    dataSource: 'migration-in-progress',
  });
};
