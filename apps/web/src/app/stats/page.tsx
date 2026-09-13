import { StatsSeasonView } from '@/app/stats/stats-season-view';

export const metadata = {
  title: 'Stats Hub — The Gauntlet',
};

interface StatsPageProps {
  searchParams: Promise<{
    preview?: string;
    team?: string;
    view?:
      | 'team'
      | 'league'
      | 'schedule'
      | 'trends'
      | 'scatter'
      | 'transactions'
      | 'start-sit'
      | 'waiver-analysis';
    week?: string;
  }>;
}

export default async function StatsPage(props: StatsPageProps) {
  const searchParams = await props.searchParams;
  // Dev-only: `?preview=2025` renders this page against real archived data,
  // via the same StatsSeasonView the 2025 archive page uses, so the real UI
  // can be checked before the 2026 season has any data of its own.
  if (process.env.NODE_ENV !== 'production' && searchParams.preview) {
    return <StatsSeasonView season={searchParams.preview} searchParams={searchParams} />;
  }

  return <StatsSeasonView season="2026" searchParams={searchParams} />;
}
