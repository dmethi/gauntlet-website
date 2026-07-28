import { SeasonPlaceholder } from '@/components/season-placeholder';
import { StatsSeasonView } from '@/app/stats/stats-season-view';

export const metadata = {
  title: 'Stats Hub — The Gauntlet',
};

interface StatsPageProps {
  searchParams: {
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
  };
}

export default function StatsPage({ searchParams }: StatsPageProps) {
  // Dev-only: `?preview=2025` renders this page against real archived data,
  // via the same StatsSeasonView the 2025 archive page uses, so the real UI
  // can be checked before the 2026 season has any data of its own.
  if (process.env.NODE_ENV !== 'production' && searchParams.preview) {
    return <StatsSeasonView season={searchParams.preview} searchParams={searchParams} />;
  }

  return (
    <SeasonPlaceholder
      title="Stats Hub"
      subtitle="2026 season — coming soon"
      blurb="Team and player stats will show up here once the 2026 season is live."
      archiveHref="/archive/2025/stats"
      archiveLabel="See the 2025 stats"
    />
  );
}
