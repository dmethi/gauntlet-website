import { memo } from 'react';
import { colors } from '../../../../../../../brand/colors';
import type { TeamTotalsResult } from './utils';

interface TeamSummaryCardProps {
  fromWeek: number;
  toWeek: number;
  data: TeamTotalsResult;
}

const formatRecord = (wins: number, losses: number, ties: number) => {
  if (ties > 0) {
    return `${wins}-${losses}-${ties}`;
  }
  return `${wins}-${losses}`;
};

export const TeamSummaryCard = memo(({ fromWeek, toWeek, data }: TeamSummaryCardProps) => {
  const pointDifferential = data.teamTotal - data.opponentTotal;

  return (
    <section className="space-y-4 rounded-md border bg-card text-card-foreground p-4">
      <header className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
          Team Overview (Weeks {fromWeek}-{toWeek})
        </h3>
        <p className="text-sm text-muted-foreground">
          {data.teamInfo.teamName} · {data.teamInfo.leagueName}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 rounded-md border p-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Season Totals</h4>
          <div className="flex items-center justify-between text-sm">
            <span>Team Points</span>
            <span className="font-mono font-bold" style={{ color: colors.core.regalGold }}>
              {data.teamTotal.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Opponent Points</span>
            <span className="font-mono">{data.opponentTotal.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Point Differential</span>
            <span
              className="font-mono font-bold"
              style={{
                color:
                  pointDifferential === 0
                    ? colors.rdylgn[5]
                    : pointDifferential > 0
                      ? colors.rdylgn[8]
                      : colors.rdylgn[2],
              }}
            >
              {pointDifferential > 0 ? '+' : ''}
              {pointDifferential.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sm font-semibold text-muted-foreground">Record</span>
            <span className="font-semibold">{formatRecord(data.wins, data.losses, data.ties)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3 text-center">
              <div className="text-xs uppercase text-muted-foreground">Rank (24)</div>
              <div className="text-lg font-semibold">{data.seasonRank24 || '—'}</div>
            </div>
            <div className="rounded-md border p-3 text-center">
              <div className="text-xs uppercase text-muted-foreground">Rank (League)</div>
              <div className="text-lg font-semibold">{data.seasonRankLeague || '—'}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Avg Opponent Rank</span>
            <span>{data.averageOpponentRank ? data.averageOpponentRank.toFixed(1) : '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Consistency Score</span>
            <span>{data.consistencyScore}</span>
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-muted-foreground">Top Performers</h4>
            <span className="text-xs text-muted-foreground">Aggregate fantasy points</span>
          </div>
          {data.topPerformers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No player data available</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.topPerformers.map(player => (
                <li
                  key={player.playerId}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {player.team ?? 'FA'} · {player.appearances} wk
                    </div>
                  </div>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: colors.core.regalGold }}
                  >
                    {player.totalPoints.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
});

TeamSummaryCard.displayName = 'TeamSummaryCard';
