import Link from 'next/link';
import { Archive, ChevronRight } from 'lucide-react';
import { Container, PageHeader } from '@gauntlet/ui';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REPORT_ARCHIVE_LINK, REPORT_HUB_SECTIONS } from '../competition-links';
import { ReportList } from './report-list';

export default function ReportsPage() {
  return (
    <Container className="py-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Reports"
          subtitle="Previews, recaps, and live coverage for the 2026 Gauntlet season"
        />
        <Button asChild variant="outline" className="shrink-0 self-start">
          <Link href={REPORT_ARCHIVE_LINK.href}>
            <Archive className="h-4 w-4" />
            {REPORT_ARCHIVE_LINK.label}
          </Link>
        </Button>
      </div>

      <div className="space-y-12">
        {REPORT_HUB_SECTIONS.map(section => (
          <section key={section.id} aria-labelledby={`${section.id}-heading`}>
            <div className="mb-4 border-b pb-3">
              <h2 id={`${section.id}-heading`} className="text-xl font-bold">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.links.map(link => (
                <Link key={link.href} href={link.href}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-4 text-base">
                        {link.label}
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {section.id === 'recaps' && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Weekly recaps
                </h3>
                <ReportList season={2026} />
              </div>
            )}
          </section>
        ))}
      </div>
    </Container>
  );
}
