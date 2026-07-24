import { SeasonPlaceholder } from '@/components/season-placeholder';

export const metadata = {
  title: 'Competition — The Gauntlet',
};

export default function CompetitionPage() {
  return (
    <SeasonPlaceholder
      title="Competition"
      subtitle="2026 season — coming soon"
      blurb="Standings, playoff results, and season recaps will show up here once the 2026 season is live."
      archiveHref="/archive/2025/competition"
      archiveLabel="See the 2025 competition"
    />
  );
}
