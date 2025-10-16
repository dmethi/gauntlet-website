import { memo } from 'react';
import { DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SimulationData } from '@/features/matchups/types';
import { formatOdds } from '@/shared/utils/formatting';
import {
  calculateWinProbFromSpread,
  formatMargin,
  getWinProbColor,
  probToMoneyline,
} from './utils';

interface WinMarginCalculatorProps {
  readonly simulationData: SimulationData;
  readonly marginSlider: number[];
  readonly onMarginChange: (margin: number[]) => void;
}

/**
 * WinMarginCalculator - Interactive margin slider to calculate win probabilities at different spreads
 */
export const WinMarginCalculator = memo<WinMarginCalculatorProps>(props => {
  const { simulationData, marginSlider, onMarginChange } = props;

  const winProbs = calculateWinProbFromSpread(marginSlider[0], simulationData);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Win Margin Calculator
      </h4>

      {/* Spread Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Win Margin</span>
          <Badge variant="outline">
            {formatMargin(
              marginSlider[0],
              simulationData.teams[0].teamName,
              simulationData.teams[1].teamName,
            )}
          </Badge>
        </div>

        <input
          type="range"
          value={marginSlider[0]}
          onChange={e => onMarginChange([parseFloat(e.target.value)])}
          min={-21}
          max={21}
          step={0.5}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
          aria-label="Point spread margin slider"
        />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center">
            <div className="font-medium">{simulationData.teams[0].teamName}</div>
            <div className={getWinProbColor(winProbs.team1)}>
              {(winProbs.team1 * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {formatOdds(probToMoneyline(winProbs.team1))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">{simulationData.teams[1].teamName}</div>
            <div className={getWinProbColor(winProbs.team2)}>
              {(winProbs.team2 * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {formatOdds(probToMoneyline(winProbs.team2))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

WinMarginCalculator.displayName = 'WinMarginCalculator';
