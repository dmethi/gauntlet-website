import { memo } from 'react';
import type { SimulationData } from '@/features/matchups/types';

interface SimulationStatsProps {
  readonly simulationData: SimulationData;
}

/**
 * SimulationStats - Shows summary statistics from the simulation
 */
export const SimulationStats = memo<SimulationStatsProps>(props => {
  const { simulationData } = props;

  return (
    <div className="pt-4 border-t">
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium">Median Margin</div>
          <div className="text-muted-foreground">
            {Math.abs(simulationData.medianMargin).toFixed(1)} pts
          </div>
        </div>
        <div>
          <div className="font-medium">Projected Total</div>
          <div className="text-muted-foreground">
            {(simulationData.team1Scores.mean + simulationData.team2Scores.mean).toFixed(1)}
          </div>
        </div>
        <div>
          <div className="font-medium">Method</div>
          <div className="text-muted-foreground">Minutes-Based</div>
        </div>
      </div>
    </div>
  );
});

SimulationStats.displayName = 'SimulationStats';
