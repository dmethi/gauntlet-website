/**
 * 404 page for non-existent recap reports
 */

import Link from 'next/link';
import { PageHeader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="px-2 md:px-4 py-6 space-y-8">
      <PageHeader title="Report Not Found" subtitle="This weekly recap report does not exist." />

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground" />

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Report Not Available</h3>
            <p className="text-muted-foreground">
              The weekly recap report you're looking for hasn't been generated yet or doesn't exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/competition/reports">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Reports
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/competition">Return to Competition Page</Link>
            </Button>
          </div>

          <div className="pt-6 text-sm text-muted-foreground">
            <p>
              Reports are typically generated on Tuesday mornings after each NFL week concludes.
              Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
