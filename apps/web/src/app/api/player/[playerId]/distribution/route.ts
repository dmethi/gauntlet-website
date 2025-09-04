import { NextRequest, NextResponse } from 'next/server';
import { getVarianceModel } from '@gauntlet/sim-engine/src/models/variance';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const { playerId } = params;
    const { searchParams } = new URL(request.url);

    const position = searchParams.get('position');
    const projectionStr = searchParams.get('projection');

    if (!position || !projectionStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: position, projection' },
        { status: 400 }
      );
    }

    const projection = parseFloat(projectionStr);
    if (isNaN(projection) || projection < 0) {
      return NextResponse.json({ error: 'Invalid projection value' }, { status: 400 });
    }

    // Get distribution data from simulation engine
    const distributionResult = await getVarianceModel(playerId, position, projection);

    // Determine data source based on sample sizes
    let dataSource: 'player' | 'position' | 'synthetic' = 'synthetic';
    let sampleSize = 0;

    if (distributionResult.playerOutcomes.sampleSize >= 8) {
      dataSource = 'player';
      sampleSize = distributionResult.playerOutcomes.sampleSize;
    } else if (distributionResult.positionDist.sampleSize >= 25) {
      dataSource = 'position';
      sampleSize = distributionResult.positionDist.sampleSize;
    }

    const response = {
      p10: distributionResult.p10,
      p25: distributionResult.p25,
      median: distributionResult.median,
      p75: distributionResult.p75,
      p90: distributionResult.p90,
      mean: distributionResult.mean,
      sampleSize,
      dataSource,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [PLAYER DISTRIBUTION API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get player distribution',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
