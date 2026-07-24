import { SeasonPlaceholder } from '@/components/season-placeholder';

export const metadata = {
  title: 'Draft Analysis — The Gauntlet',
};

export default function DraftAnalysisPage() {
  return (
    <SeasonPlaceholder
      title="Draft Analysis"
      subtitle="2026 season — coming soon"
      blurb="Draft grades and analysis will show up here once the 2026 draft happens."
      archiveHref="/archive/2025/draft-analysis"
      archiveLabel="See the 2025 draft analysis"
    />
  );
}
