import { SeasonPlaceholder } from '@/components/season-placeholder';

export const metadata = {
  title: 'Hall of Fame — The Gauntlet',
};

export default function HallOfFameEnhancedPage() {
  return (
    <SeasonPlaceholder
      title="Hall of Fame"
      subtitle="2026 season — coming soon"
      blurb="The best (and worst) performances of the season will show up here once the 2026 season is live."
      archiveHref="/archive/2025/hall-of-fame"
      archiveLabel="See the 2025 Hall of Fame"
    />
  );
}
