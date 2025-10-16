import { memo } from 'react';
import { BarChart3 } from 'lucide-react';
import type { SimulationData } from '@/features/matchups/types';
import { ScoreBoxPlot } from './ScoreBoxPlot';

interface ScoreRangesDisplayProps {
  readonly simulationData: SimulationData;
}

/**
 * ScoreRangesDisplay - Shows score projections with box plot visualizations
 */
export const ScoreRangesDisplay = memo<ScoreRangesDisplayProps>(props => {
  const { simulationData } = props;

  const maxScale = Math.max(200, simulationData.team1Scores.p90, simulationData.team2Scores.p90);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Score Ranges
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Team 1 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">{simulationData.teams[0].teamName}</div>
          <div className="text-2xl font-bold">{simulationData.team1Scores.median.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            Range: {simulationData.team1Scores.p10.toFixed(1)} -{' '}
            {simulationData.team1Scores.p90.toFixed(1)}
          </div>
          <div className="mt-2">
            <ScoreBoxPlot
              scores={simulationData.team1Scores}
              maxScale={maxScale}
              teamColor="rgb(99, 102, 241)" // Indigo for team 1
              width={300}
              height={24}
            />
          </div>
        </div>

        {/* Team 2 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">{simulationData.teams[1].teamName}</div>
          <div className="text-2xl font-bold">{simulationData.team2Scores.median.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            Range: {simulationData.team2Scores.p10.toFixed(1)} -{' '}
            {simulationData.team2Scores.p90.toFixed(1)}
          </div>
          <div className="mt-2">
            <ScoreBoxPlot
              scores={simulationData.team2Scores}
              maxScale={maxScale}
              teamColor="rgb(16, 185, 129)" // Emerald for team 2
              width={300}
              height={24}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ScoreRangesDisplay.displayName = 'ScoreRangesDisplay';
