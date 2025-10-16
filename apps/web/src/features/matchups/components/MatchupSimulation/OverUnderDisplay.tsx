import { memo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SimulationData } from '@/features/matchups/types';
import { formatOdds } from '@/shared/utils/formatting';
import { getOverUnderDisplay, getWinProbColor, probToMoneyline } from './utils';

interface OverUnderDisplayProps {
  readonly simulationData: SimulationData;
}

/**
 * OverUnderDisplay - Shows over/under probabilities for total points
 */
export const OverUnderDisplay = memo<OverUnderDisplayProps>(props => {
  const { simulationData } = props;

  const ouDisplay = getOverUnderDisplay(simulationData);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Total Points</span>
        <Badge variant="outline">O/U {ouDisplay.total}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="font-medium flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Over {ouDisplay.total}
          </div>
          <div className={`text-lg font-semibold ${getWinProbColor(ouDisplay.over)}`}>
            {(ouDisplay.over * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {formatOdds(probToMoneyline(ouDisplay.over))}
          </div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="font-medium flex items-center justify-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Under {ouDisplay.total}
          </div>
          <div className={`text-lg font-semibold ${getWinProbColor(ouDisplay.under)}`}>
            {(ouDisplay.under * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {formatOdds(probToMoneyline(ouDisplay.under))}
          </div>
        </div>
      </div>
    </div>
  );
});

OverUnderDisplay.displayName = 'OverUnderDisplay';
