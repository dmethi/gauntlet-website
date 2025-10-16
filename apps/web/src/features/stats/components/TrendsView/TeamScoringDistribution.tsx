import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RidgePlot } from '@/app/stats/components/RidgePlot';
import type { TrendsViewProps } from '@/features/stats';
import { buildTeamRidgePlot } from './utils';

export const TeamScoringDistribution = ({
  allTeamEntries,
}: Pick<TrendsViewProps, 'allTeamEntries'>) => {
  const { chartData, domain } = buildTeamRidgePlot(allTeamEntries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Scoring Distribution Analysis</CardTitle>
        <CardDescription>
          Ridge plots showing each team&apos;s scoring distribution shape. Narrow ridges =
          consistent, wide ridges = volatile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[800px]">
          <RidgePlot data={chartData} domain={domain} height={800} title="Team Weekly Scores" />
        </div>
        <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
          <h4 className="font-semibold mb-2">Reading Team Ridge Plots</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
            <div>
              <span className="font-semibold">🎯 Narrow Ridge:</span> Tall, thin curve = consistent
              scoring.
            </div>
            <div>
              <span className="font-semibold">🌊 Wide Ridge:</span> Flat, spread curve = volatile
              performance.
            </div>
            <div>
              <span className="font-semibold">📍 Median Line:</span> Dashed vertical line shows
              typical output.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
