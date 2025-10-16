import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RidgePlot } from '@/app/stats/components/RidgePlot';
import type { TrendsViewProps } from '@/features/stats';
import { buildPositionRidgePlot } from './utils';
import type { TrackedPosition } from '@/shared/utils/stats';

export const PositionScoringDistribution = ({
  allTeamEntries,
  positionsMap,
}: Pick<TrendsViewProps, 'allTeamEntries' | 'positionsMap'>) => {
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

  return (
    <>
      {positions.map(position => {
        const { chartData, domain } = buildPositionRidgePlot(
          position,
          allTeamEntries,
          positionsMap,
        );

        return (
          <Card key={position}>
            <CardHeader>
              <CardTitle>{position} Scoring Distribution Analysis</CardTitle>
              <CardDescription>
                Ridge plots highlighting {position} scoring distribution. Narrow ridges = consistent
                units, wide ridges = volatile performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <RidgePlot
                  data={chartData}
                  domain={domain}
                  height={600}
                  title={`${position} Weekly Scores`}
                />
              </div>
              <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
                <h4 className="font-semibold mb-2">{position} Ridge Plot Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
                  <div>
                    <span className="font-semibold">🎯 Narrow Ridge:</span> Tall, thin curve =
                    consistent {position} scoring.
                  </div>
                  <div>
                    <span className="font-semibold">🌊 Wide Ridge:</span> Flat, spread curve =
                    volatile {position} performance.
                  </div>
                  <div>
                    <span className="font-semibold">📍 Median Line:</span> Dashed line shows typical{' '}
                    {position} production.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
