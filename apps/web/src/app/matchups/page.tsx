import { SeasonPlaceholder } from '@/components/season-placeholder';

export const metadata = {
  title: 'Matchups — The Gauntlet',
};

export default function MatchupsPage() {
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
