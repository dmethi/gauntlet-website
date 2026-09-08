import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container, PageHeader } from '@gauntlet/ui';
import { Button } from '@/components/ui/button';
import { ReportList } from '../../report-list';

export default function ReportsArchive2025Page() {
  return (
    <Container className="py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-3">
        <Link href="/competition/reports">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>
      </Button>
      <PageHeader
        title="2025 Report Archive"
        subtitle="Every weekly recap and analysis report from the 2025 Gauntlet season"
      />
      <ReportList
        season={2025}
        emptyTitle="No archived reports found"
        emptyDescription="The 2025 reports could not be found in the report index."
      />
    </Container>
  );
}
