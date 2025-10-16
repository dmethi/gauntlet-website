import { memo } from 'react';
import { formatSpreadDisplay, formatTotalDisplay } from './utils';

export interface BettingLinesDisplayProps {
  readonly spread: number;
  readonly total: number;
  readonly team1Name: string;
  readonly team2Name: string;
}

/**
 * Display spread and over/under betting lines
 *
 * @example
 * ```tsx
 * <BettingLinesDisplay
 *   spread={3.5}
 *   total={45.5}
 *   team1Name="Chiefs"
 *   team2Name="Bills"
 * />
 * ```
 */
export const BettingLinesDisplay = memo<BettingLinesDisplayProps>(props => {
  const { spread, total, team1Name, team2Name } = props;

  return (
    <div className="flex justify-between text-xs text-muted-foreground">
      <div>
        <span className="font-medium">Spread:</span>{' '}
        {formatSpreadDisplay(spread, team1Name, team2Name)}
      </div>
      <div>
        <span className="font-medium">O/U:</span> {formatTotalDisplay(total)}
      </div>
    </div>
  );
});

BettingLinesDisplay.displayName = 'BettingLinesDisplay';
