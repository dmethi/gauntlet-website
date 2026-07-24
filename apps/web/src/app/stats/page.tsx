import { SeasonPlaceholder } from '@/components/season-placeholder';

export const metadata = {
  title: 'Stats Hub — The Gauntlet',
};

export default function StatsPage() {
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
