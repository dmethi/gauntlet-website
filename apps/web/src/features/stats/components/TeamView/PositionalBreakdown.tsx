import { memo, useMemo, useState } from 'react';
import { colors } from '../../../../../../../brand/colors';
import type { PlayerContributionGroup, PositionalBreakdownResult } from './utils';
import type { TrackedPosition } from '@/shared/utils/stats';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { PlayerContributions } from './PlayerContributions';

interface PositionalBreakdownProps {
  breakdown: Map<TrackedPosition, PositionalBreakdownResult>;
  contributions: Map<TrackedPosition, PlayerContributionGroup[]>;
}

const positionOrder: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

export const PositionalBreakdown = memo(
  ({ breakdown, contributions }: PositionalBreakdownProps) => {
    const [expandedPositions, setExpandedPositions] = useState<Set<TrackedPosition>>(new Set());

    const rows = useMemo(() => {
      return positionOrder
        .map(position => {
          const data = breakdown.get(position);
          if (!data) return null;
          return { position, data };
        })
        .filter(
          (entry): entry is { position: TrackedPosition; data: PositionalBreakdownResult } =>
            entry !== null,
        );
    }, [breakdown]);

    if (rows.length === 0) {
      return (
        <section className="rounded-md border p-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            Positional Breakdown
          </h3>
          <p className="text-sm text-muted-foreground">
            No positional data available for this team.
          </p>
        </section>
      );
    }

    const toggle = (position: TrackedPosition) => {
      setExpandedPositions(prev => {
        const next = new Set(prev);
        if (next.has(position)) {
          next.delete(position);
        } else {
          next.add(position);
        }
        return next;
      });
    };

    return (
      <section className="space-y-4 rounded-md border p-4">
        <header>
          <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            Positional Breakdown
          </h3>
          <p className="text-sm text-muted-foreground">
            Season totals and weekly performance by position. Click a position to view detailed
            trends and player contributions.
          </p>
        </header>

        <div className="space-y-4">
          {rows.map(({ position, data }) => {
            const isExpanded = expandedPositions.has(position);
            const summary = data.summary;
            const positionContributions = contributions.get(position) ?? [];

            return (
              <div key={position} className="rounded-md border">
                <button
                  type="button"
                  onClick={() => toggle(position)}
                  className="flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left"
                  style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                >
                  <div>
                    <div className="text-base font-semibold">{position}</div>
                    <div className="text-xs text-white/80">
                      Season total {summary.seasonTotal.toFixed(1)} · Rank 24{' '}
                      {summary.rank24 || '—'} · League {summary.rankLeague || '—'}
                    </div>
                  </div>
                  <span className="text-sm text-white/80">
                    {isExpanded ? 'Hide' : 'Show'} details
                  </span>
                </button>

                <div className="grid gap-4 border-b p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-md border p-3">
                    <div className="text-xs uppercase text-muted-foreground">Season Total</div>
                    <div
                      className="font-mono text-lg font-semibold"
                      style={{ color: colors.core.regalGold }}
                    >
                      {summary.seasonTotal.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Games Played: {summary.gamesPlayed}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs uppercase text-muted-foreground">League Metrics</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Avg</span>
                      <span className="font-mono">{summary.leagueAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Median</span>
                      <span className="font-mono">{summary.leagueMedian.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs uppercase text-muted-foreground">Ranks</div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">24-team</span>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(summary.rank24, 24),
                          color: getTextColor(getRankColor(summary.rank24, 24)),
                        }}
                      >
                        {summary.rank24 || '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">League</span>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(summary.rankLeague, 12),
                          color: getTextColor(getRankColor(summary.rankLeague, 12)),
                        }}
                      >
                        {summary.rankLeague || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs uppercase text-muted-foreground">Opponent Totals</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total</span>
                      <span className="font-mono">{summary.opponentTotal.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rank 24</span>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(summary.opponentRank24, 24),
                          color: getTextColor(getRankColor(summary.opponentRank24, 24)),
                        }}
                      >
                        {summary.opponentRank24 || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rank League</span>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(summary.opponentRankLeague, 12),
                          color: getTextColor(getRankColor(summary.opponentRankLeague, 12)),
                        }}
                      >
                        {summary.opponentRankLeague || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="space-y-4 p-4">
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-3 py-2 text-left">Week</th>
                            <th className="px-3 py-2 text-right">Team</th>
                            <th className="px-3 py-2 text-center">Rank (24)</th>
                            <th className="px-3 py-2 text-center">Rank (League)</th>
                            <th className="px-3 py-2 text-right">Opponent</th>
                            <th className="px-3 py-2 text-center">Opp Rank (24)</th>
                            <th className="px-3 py-2 text-center">Opp Rank (League)</th>
                            <th className="px-3 py-2 text-right">vs Avg</th>
                            <th className="px-3 py-2 text-right">vs Median</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.weekly.map(row => (
                            <tr key={row.week} className="border-t">
                              <td className="px-3 py-2 font-medium">Week {row.week}</td>
                              <td
                                className="px-3 py-2 text-right font-mono font-bold"
                                style={{ color: colors.core.regalGold }}
                              >
                                {row.teamPoints.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className="rounded-full px-2 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: getRankColor(row.rank24, 24),
                                    color: getTextColor(getRankColor(row.rank24, 24)),
                                  }}
                                >
                                  {row.rank24 || '—'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className="rounded-full px-2 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: getRankColor(row.rankLeague, 12),
                                    color: getTextColor(getRankColor(row.rankLeague, 12)),
                                  }}
                                >
                                  {row.rankLeague || '—'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {row.opponentPoints.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className="rounded-full px-2 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: getRankColor(row.opponentRank24, 24),
                                    color: getTextColor(getRankColor(row.opponentRank24, 24)),
                                  }}
                                >
                                  {row.opponentRank24 || '—'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className="rounded-full px-2 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: getRankColor(row.opponentRankLeague, 12),
                                    color: getTextColor(getRankColor(row.opponentRankLeague, 12)),
                                  }}
                                >
                                  {row.opponentRankLeague || '—'}
                                </span>
                              </td>
                              <td
                                className="px-3 py-2 text-right font-mono text-xs"
                                style={{
                                  color:
                                    row.vsAverage === 0
                                      ? colors.rdylgn[5]
                                      : row.vsAverage > 0
                                        ? colors.rdylgn[8]
                                        : colors.rdylgn[2],
                                }}
                              >
                                {row.vsAverage > 0 ? '+' : ''}
                                {row.vsAverage.toFixed(1)}
                              </td>
                              <td
                                className="px-3 py-2 text-right font-mono text-xs"
                                style={{
                                  color:
                                    row.vsMedian === 0
                                      ? colors.rdylgn[5]
                                      : row.vsMedian > 0
                                        ? colors.rdylgn[8]
                                        : colors.rdylgn[2],
                                }}
                              >
                                {row.vsMedian > 0 ? '+' : ''}
                                {row.vsMedian.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <PlayerContributions
                      position={position}
                      contributions={positionContributions}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  },
);

PositionalBreakdown.displayName = 'PositionalBreakdown';
