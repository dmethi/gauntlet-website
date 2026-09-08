import type { Metadata } from 'next';
import { PageHeaderHero } from '@gauntlet/ui';
import draftReportJson from '@/data/reports/opening-2026/draft-report.json';
import { type DraftReport, DraftReportView } from '@/features/opening-reports';

export const metadata: Metadata = {
  title: '2026 Draft Report — The Gauntlet',
  description:
    'Grades, superlatives, shared rosters and price differences from all three 2026 Gauntlet auctions.',
};

export default function DraftAnalysisPage() {
  const report = draftReportJson as DraftReport;
  return (
    <>
      <PageHeaderHero
        title="2026 Draft Report"
        crestSrc="/gauntlet_logo.svg"
        subtitle="The opening market across Legion I, Legion II and Legion III"
      />
      <DraftReportView report={report} />
    </>
  );
}
