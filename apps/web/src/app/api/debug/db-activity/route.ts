import { NextResponse } from 'next/server';
import { getDbStats } from '@/lib/prisma-with-logging';

export async function GET() {
  const stats = getDbStats();

  // Also check what's in memory
  const processInfo = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    isVercel: !!process.env.VERCEL,
    vercelRegion: process.env.VERCEL_REGION,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json({
    dbStats: stats,
    processInfo,
    timestamp: new Date().toISOString(),
  });
}
