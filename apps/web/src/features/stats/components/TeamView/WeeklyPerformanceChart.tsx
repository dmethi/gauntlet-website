import { memo, useMemo } from 'react';
import { colors } from '../../../../../../../brand/colors';
import type { WeeklyPerformanceRow } from './utils';
import { getRankColor, getTextColor } from '@/shared/utils/colors';

interface WeeklyPerformanceChartProps {
  rows: WeeklyPerformanceRow[];
}

export const WeeklyPerformanceChart = memo(({ rows }: WeeklyPerformanceChartProps) => {
  const maxScore = useMemo(() => {
    if (rows.length === 0) return 0;
    return Math.max(...rows.map(row => Math.max(row.teamScore, row.opponentScore)));
  }, [rows]);

  if (rows.length === 0) {
    return (
      <section className="rounded-md border p-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
          Weekly Performance
        </h3>
        <p className="text-sm text-muted-foreground">No weekly data available</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-md border p-4">
      <header>
        <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
          Weekly Performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Weekly scores with opponent comparisons and league deltas
        </p>
      </header>

      <div className="space-y-3">
        {rows.map(row => {
          const teamWidth = maxScore > 0 ? Math.round((row.teamScore / maxScore) * 100) : 0;
          const oppWidth = maxScore > 0 ? Math.round((row.opponentScore / maxScore) * 100) : 0;

          return (
            <div key={row.week} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">Week {row.week}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold text-white ${
                      row.result === 'W'
                        ? 'bg-green-600'
                        : row.result === 'L'
                          ? 'bg-red-600'
                          : 'bg-slate-400'
                    }`}
                  >
                    {row.result}
                  </span>
                  {row.opponentKey ? (
                    <span className="text-xs text-muted-foreground">vs {row.opponentKey}</span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span
                    className="rounded-full px-2 py-1 font-medium"
                    style={{
                      backgroundColor: getRankColor(row.rank24, 24),
                      color: getTextColor(getRankColor(row.rank24, 24)),
                    }}
                  >
                    Rank 24: {row.rank24 || '—'}
                  </span>
                  <span
                    className="rounded-full px-2 py-1 font-medium"
                    style={{
                      backgroundColor: getRankColor(row.rankLeague, 12),
                      color: getTextColor(getRankColor(row.rankLeague, 12)),
                    }}
                  >
                    League: {row.rankLeague || '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-muted-foreground">Team</span>
                  <div className="relative h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${teamWidth}%`,
                        backgroundColor: colors.core.regalGold,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm">{row.teamScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-muted-foreground">Opponent</span>
                  <div className="relative h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${oppWidth}%`,
                        backgroundColor: colors.rdylgn[3],
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm">{row.opponentScore.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid gap-2 text-xs md:grid-cols-4">
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">vs League Avg</div>
                  <div
                    className="font-mono font-semibold"
                    style={{
                      color:
                        row.vsLeagueAverage === 0
                          ? colors.rdylgn[5]
                          : row.vsLeagueAverage > 0
                            ? colors.rdylgn[8]
                            : colors.rdylgn[2],
                    }}
                  >
                    {row.vsLeagueAverage > 0 ? '+' : ''}
                    {row.vsLeagueAverage.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">vs League Median</div>
                  <div
                    className="font-mono font-semibold"
                    style={{
                      color:
                        row.vsLeagueMedian === 0
                          ? colors.rdylgn[5]
                          : row.vsLeagueMedian > 0
                            ? colors.rdylgn[8]
                            : colors.rdylgn[2],
                    }}
                  >
                    {row.vsLeagueMedian > 0 ? '+' : ''}
                    {row.vsLeagueMedian.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Opp Rank (24)</div>
                  <div
                    className="rounded-full px-2 py-1 text-center font-medium"
                    style={{
                      backgroundColor: getRankColor(row.opponentRank24, 24),
                      color: getTextColor(getRankColor(row.opponentRank24, 24)),
                    }}
                  >
                    {row.opponentRank24 || '—'}
                  </div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Opp Rank (League)</div>
                  <div
                    className="rounded-full px-2 py-1 text-center font-medium"
                    style={{
                      backgroundColor: getRankColor(row.opponentRankLeague, 12),
                      color: getTextColor(getRankColor(row.opponentRankLeague, 12)),
                    }}
                  >
                    {row.opponentRankLeague || '—'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

WeeklyPerformanceChart.displayName = 'WeeklyPerformanceChart';
