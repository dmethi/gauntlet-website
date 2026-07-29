/**
 * Loading skeleton for the dynamic recap report route.
 */

import { PageHeader } from '@gauntlet/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LoadingRecapReport = () => {
  return (
    <div className="px-2 md:px-4 py-6 space-y-8 overflow-x-hidden">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-5 w-[200px]" />
      </div>

      {/* League Overview Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>

      {/* Hall of Fame/Shame Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matchups Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Power Rankings Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingRecapReport;
