import { memo, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { colors } from '../../../../../../../brand/colors';
import type { WeeklyPerformanceRow } from './utils';
import { getRankColor, getTextColor } from '@/shared/utils/colors';

interface WeeklyPerformanceChartProps {
  rows: WeeklyPerformanceRow[];
  teamCount: number;
}

export const WeeklyPerformanceChart = memo(({ rows, teamCount }: WeeklyPerformanceChartProps) => {
  const maxScore = useMemo(() => {
    if (rows.length === 0) return 0;
    return Math.max(...rows.map(row => Math.max(row.teamScore, row.opponentScore)));
  }, [rows]);

  if (rows.length === 0) {
    return (
      <section className="border-b border-border/70 pb-8">
        <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
          Weekly Performance
        </h3>
        <p className="text-sm text-muted-foreground">No weekly data available</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 border-b border-border/70 pb-8">
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
            <div key={row.week} className="space-y-3 bg-muted/30 p-3 sm:rounded-md sm:border">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-sm font-semibold">Week {row.week}</span>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-bold ${
                      row.result === 'W'
                        ? 'border-success/30 bg-success/15 text-success'
                        : row.result === 'L'
                          ? 'border-destructive/30 bg-destructive/15 text-destructive'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {row.result}
                  </span>
                  {row.opponentKey ? (
                    <span className="break-all text-xs text-muted-foreground">
                      vs {row.opponentKey}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
                  <span
                    className="rounded-full px-2 py-1 font-medium"
                    style={{
                      backgroundColor: getRankColor(row.rank24, teamCount),
                      color: getTextColor(getRankColor(row.rank24, teamCount)),
                    }}
                  >
                    Rank {teamCount}: {row.rank24 || '—'}
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

              <div
                className="space-y-1"
                role="img"
                aria-label={`Week ${row.week} score comparison: team ${row.teamScore.toFixed(1)}, opponent ${row.opponentScore.toFixed(1)}`}
              >
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

              <details
                className="group rounded-md border border-border/70 bg-background/70 md:hidden"
                aria-label={`Week ${row.week} complete details`}
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-xs font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  League and opponent detail
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="grid gap-2 border-t border-border/70 p-2 text-xs">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-muted-foreground">vs League Avg</span>
                    <span className="font-mono font-semibold">
                      {row.vsLeagueAverage > 0 ? '+' : ''}
                      {row.vsLeagueAverage.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-muted-foreground">vs League Median</span>
                    <span className="font-mono font-semibold">
                      {row.vsLeagueMedian > 0 ? '+' : ''}
                      {row.vsLeagueMedian.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-muted-foreground">Opponent rank ({teamCount})</span>
                    <span className="font-mono font-semibold">{row.opponentRank24 || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-muted-foreground">Opponent rank (league)</span>
                    <span className="font-mono font-semibold">{row.opponentRankLeague || '—'}</span>
                  </div>
                </div>
              </details>

              <div className="hidden gap-2 text-xs md:grid md:grid-cols-4">
                <div className="bg-background/70 p-2">
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
                <div className="bg-background/70 p-2">
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
                <div className="bg-background/70 p-2">
                  <div className="text-muted-foreground">Opp Rank ({teamCount})</div>
                  <div
                    className="rounded-full px-2 py-1 text-center font-medium"
                    style={{
                      backgroundColor: getRankColor(row.opponentRank24, teamCount),
                      color: getTextColor(getRankColor(row.opponentRank24, teamCount)),
                    }}
                  >
                    {row.opponentRank24 || '—'}
                  </div>
                </div>
                <div className="bg-background/70 p-2">
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
