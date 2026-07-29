/**
 * Root error boundary.
 *
 * Catches render and data failures in any segment that has no closer
 * `error.tsx`, so a thrown error shows a recoverable page instead of the raw
 * Next error screen. `reset()` re-renders the failed segment in place.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error('[Gauntlet Error]', error);
  }, [error]);

  return (
    <div className="px-2 md:px-4 py-6 space-y-8">
      <PageHeader title="Something Went Wrong" subtitle="This page failed to load." />

      <Card className="max-w-2xl mx-auto border-destructive/50">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive" />

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Unexpected Error</h2>
            <p className="text-muted-foreground">
              An error occurred while rendering this page. Retrying often clears a transient
              upstream failure.
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground font-mono">Reference: {error.digest}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/competition">
                <Home className="h-4 w-4 mr-2" />
                Go to Competition
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
