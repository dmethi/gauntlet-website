import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SimulationData } from '@/features/matchups/types';
import { formatOdds } from '@/shared/utils/formatting';
import { getWinProbColor } from './utils';

interface SimulationSummaryProps {
  readonly simulationData: SimulationData;
}

/**
 * SimulationSummary - Displays win probabilities and implied odds for both teams
 */
export const SimulationSummary = memo<SimulationSummaryProps>(props => {
  const { simulationData } = props;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="text-center space-y-2">
            <div className="font-semibold text-sm">{simulationData.teams[0].teamName}</div>
            <div className={`text-3xl font-bold ${getWinProbColor(simulationData.team1WinPct)}`}>
              {(simulationData.team1WinPct * 100).toFixed(1)}%
            </div>
            <Badge variant="outline" className="text-xs">
              {formatOdds(simulationData.impliedOdds.team1MoneyLine)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="text-center space-y-2">
            <div className="font-semibold text-sm">{simulationData.teams[1].teamName}</div>
            <div className={`text-3xl font-bold ${getWinProbColor(simulationData.team2WinPct)}`}>
              {(simulationData.team2WinPct * 100).toFixed(1)}%
            </div>
            <Badge variant="outline" className="text-xs">
              {formatOdds(simulationData.impliedOdds.team2MoneyLine)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SimulationSummary.displayName = 'SimulationSummary';
