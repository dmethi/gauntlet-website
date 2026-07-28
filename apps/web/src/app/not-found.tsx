/**
 * Root 404 boundary.
 *
 * Next renders this for any unmatched URL, and for any `notFound()` call in a
 * segment that has no closer `not-found.tsx`. Route families that own a more
 * specific recovery (the dynamic recap report route) keep their own sibling
 * boundary; this page is the site-wide fallback, not a replacement for them.
 */

import Link from 'next/link';
import { PageHeader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="px-2 md:px-4 py-6 space-y-8">
      <PageHeader title="Page Not Found" subtitle="This page does not exist on The Gauntlet." />

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <Compass className="h-16 w-16 mx-auto text-muted-foreground" />

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">We could not find that page</h2>
            <p className="text-muted-foreground">
              The link may be out of date, or the page may have moved. The Competition page is the
              best place to pick up current standings, matchups, and weekly recaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/competition">
                <Home className="h-4 w-4 mr-2" />
                Go to Competition
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/competition/reports">Browse Weekly Reports</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
