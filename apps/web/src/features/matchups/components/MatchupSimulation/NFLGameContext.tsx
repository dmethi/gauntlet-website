import { memo } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SimulationData } from '@/features/matchups/types';

interface NFLGameContextProps {
  readonly simulationData: SimulationData;
}

/**
 * NFLGameContext - Shows NFL game progress and transparency information
 */
export const NFLGameContext = memo<NFLGameContextProps>(props => {
  const { simulationData } = props;

  // Check if nflGameContext exists
  const nflGameContext = (simulationData as any).nflGameContext;
  if (!nflGameContext) return null;

  return (
    <div className="pt-4 border-t">
      <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        NFL Game Progress
        <Badge variant="outline" className="text-xs">
          {(nflGameContext.averageGameProgress * 100).toFixed(0)}% Complete
        </Badge>
      </h4>

      <div className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="font-medium">Avg. Minutes Remaining</div>
            <div className="text-lg font-semibold text-blue-600">
              {nflGameContext.averageMinutesRemaining.toFixed(1)}m
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <div className="font-medium">NFL Games</div>
            <div className="text-lg font-semibold text-green-600">
              {nflGameContext.totalNflGames}
            </div>
          </div>
        </div>

        {/* Game States */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Game States:</div>
          <div className="flex flex-wrap gap-2">
            {nflGameContext.gameStates.map((state: any) => (
              <Badge
                key={state.team}
                variant={
                  state.state === 'post'
                    ? 'destructive'
                    : state.state === 'in'
                      ? 'default'
                      : 'secondary'
                }
                className="text-xs"
              >
                {state.team}:{' '}
                {state.state === 'post'
                  ? 'Final'
                  : state.state === 'in'
                    ? state.gameDescription
                    : 'Scheduled'}
              </Badge>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border-l-2 border-blue-200">
          <strong>Minutes-Based Projections:</strong> Player projections are automatically adjusted
          based on actual NFL game time remaining. Completed games = 0 projection remaining, live
          games = proportional to time left.
        </div>
      </div>
    </div>
  );
});

NFLGameContext.displayName = 'NFLGameContext';
