import { SeasonPlaceholder } from '@/components/season-placeholder';
import { MatchupsView } from '@/app/matchups/matchups-view';
import { getLeaguesForSeason } from '@/config/leagues';

export const metadata = {
  title: 'Matchups — The Gauntlet',
};

interface MatchupsPageProps {
  searchParams: {
    preview?: string;
  };
}

export default function MatchupsPage({ searchParams }: MatchupsPageProps) {
  // Dev-only: `?preview=2025` renders this page against real archived data,
  // via the same MatchupsView the 2025 archive page uses, so the real UI
  // can be checked before the 2026 season has any data of its own.
  if (process.env.NODE_ENV !== 'production' && searchParams.preview) {
    return <MatchupsView leagues={getLeaguesForSeason(searchParams.preview)} />;
  }

  return (
    <SeasonPlaceholder
      title="Matchups"
      subtitle="2026 season — coming soon"
      blurb="Weekly matchups will show up here once the 2026 season is live."
      archiveHref="/archive/2025/matchups"
      archiveLabel="See the 2025 matchups"
    />
  );
}
