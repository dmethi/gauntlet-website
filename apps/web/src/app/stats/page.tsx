import { Suspense } from 'react';
import { StatsContent } from './stats-content';
import {
  buildStatsDataset,
  serializeStatsDataset,
  type PlainStatsDataset,
} from '@/lib/stats/compose';
import { CURRENT_LEAGUES } from '@/config/leagues';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StatsPageProps {
  searchParams: {
    team?: string;
    view?: string;
    week?: string;
  };
}

async function getStatsData() {
  // Use existing league configuration
  const leagueIds = CURRENT_LEAGUES.map(l => l.id);
  const labels = CURRENT_LEAGUES.map(l => l.name);

  const dataset = await buildStatsDataset({
    leagueIds,
    labels,
    weekRange: { from: 1, to: 18 }, // Get all available weeks
  });
  return serializeStatsDataset(dataset);
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const dataset = (await getStatsData()) as PlainStatsDataset;

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='container mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight'>Stats Hub</h1>
          <p className='text-muted-foreground mt-2'>
            Individual team analysis and weekly performance breakdowns
          </p>
        </div>

        <Suspense fallback={<StatsPageSkeleton />}>
          <StatsContent dataset={dataset} searchParams={searchParams} leagues={CURRENT_LEAGUES} />
        </Suspense>
      </div>
    </div>
  );
}

function StatsPageSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='h-20 bg-muted animate-pulse rounded-lg' />
      <div className='h-12 bg-muted animate-pulse rounded-lg' />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='h-96 bg-muted animate-pulse rounded-lg' />
        <div className='h-96 bg-muted animate-pulse rounded-lg' />
      </div>
    </div>
  );
}
