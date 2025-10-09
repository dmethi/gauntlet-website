/**
 * Error boundary for recap report pages
 */

'use client';

import { useEffect } from 'react';
import { PageHeader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error('[Recap Report Error]', error);
  }, [error]);

  return (
    <div className="px-2 md:px-4 py-6 space-y-8">
      <PageHeader
        title="Error Loading Report"
        subtitle="Something went wrong while loading this report."
      />

      <Card className="max-w-2xl mx-auto border-destructive/50">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive" />

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Failed to Load Report</h3>
            <p className="text-muted-foreground">
              An error occurred while trying to load this weekly recap report.
            </p>
            {error.message && (
              <p className="text-sm text-destructive font-mono bg-destructive/10 p-2 rounded">
                {error.message}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/competition/reports">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Reports
              </Link>
            </Button>
          </div>

          <div className="pt-6 text-sm text-muted-foreground">
            <p>
              If this error persists, please contact the league administrator or try refreshing the
              page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
