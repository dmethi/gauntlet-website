import { memo } from 'react';
import { formatOdds } from '@/shared/utils/formatting';
import { formatWinProbability, getWinProbColor } from './utils';

export interface WinProbabilitiesDisplayProps {
  readonly team1Name: string;
  readonly team1WinPct: number;
  readonly team1MoneyLine: number;
  readonly team2Name: string;
  readonly team2WinPct: number;
  readonly team2MoneyLine: number;
}

/**
 * Display win probabilities and moneylines for both teams
 *
 * @example
 * ```tsx
 * <WinProbabilitiesDisplay
 *   team1Name="Chiefs"
 *   team1WinPct={0.65}
 *   team1MoneyLine={-186}
 *   team2Name="Bills"
 *   team2WinPct={0.35}
 *   team2MoneyLine={156}
 * />
 * ```
 */
export const WinProbabilitiesDisplay = memo<WinProbabilitiesDisplayProps>(props => {
  const { team1Name, team1WinPct, team1MoneyLine, team2Name, team2WinPct, team2MoneyLine } = props;

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="text-center">
        <div className="text-xs text-muted-foreground truncate">{team1Name}</div>
        <div className={`font-bold ${getWinProbColor(team1WinPct)}`}>
          {formatWinProbability(team1WinPct)}
        </div>
        <div className="text-xs text-muted-foreground">{formatOdds(team1MoneyLine)}</div>
      </div>

      <div className="text-center">
        <div className="text-xs text-muted-foreground truncate">{team2Name}</div>
        <div className={`font-bold ${getWinProbColor(team2WinPct)}`}>
          {formatWinProbability(team2WinPct)}
        </div>
        <div className="text-xs text-muted-foreground">{formatOdds(team2MoneyLine)}</div>
      </div>
    </div>
  );
});

WinProbabilitiesDisplay.displayName = 'WinProbabilitiesDisplay';
