import { memo, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PlayerContributionGroup, PositionalBreakdownResult } from './utils';
import type { TrackedPosition } from '@/shared/utils/stats';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { PlayerContributions } from './PlayerContributions';
import { deltaTextClass } from '@/lib/stat-colors';

interface PositionalBreakdownProps {
  breakdown: Map<TrackedPosition, PositionalBreakdownResult>;
  contributions: Map<TrackedPosition, PlayerContributionGroup[]>;
  teamCount: number;
}

const positionOrder: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

export const PositionalBreakdown = memo(
  ({ breakdown, contributions, teamCount }: PositionalBreakdownProps) => {
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
        <section className="border-b border-border/70 pb-8">
          <h3 className="text-lg font-semibold text-primary">Positional Breakdown</h3>
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
      <section className="space-y-4 border-b border-border/70 pb-8">
        <header>
          <h3 className="text-lg font-semibold text-primary">Positional Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Season totals and weekly performance by position. Open a position to view detailed
            trends and player contributions.
          </p>
        </header>

        <div className="space-y-4">
          {rows.map(({ position, data }) => {
            const isExpanded = expandedPositions.has(position);
            const summary = data.summary;
            const positionContributions = contributions.get(position) ?? [];

            return (
              <div key={position} className="border-y md:rounded-md md:border">
                <button
                  type="button"
                  onClick={() => toggle(position)}
                  aria-expanded={isExpanded}
                  aria-controls={`position-${position}-details`}
                  className="flex min-h-11 w-full items-center justify-between gap-3 border-b bg-foreground px-4 py-3 text-left text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <div>
                    <div className="text-base font-semibold">{position}</div>
                    <div className="text-xs text-background/80">
                      Season total {summary.seasonTotal.toFixed(1)} · Rank {teamCount}{' '}
                      {summary.rank24 || '—'} · League {summary.rankLeague || '—'}
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-sm text-background/80">
                    {isExpanded ? 'Hide' : 'Show'} details
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                <div className="grid divide-y border-b px-1 sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:p-4 lg:grid-cols-4">
                  <div className="py-3 sm:rounded-md sm:border sm:p-3">
                    <div className="text-xs uppercase text-muted-foreground">Season Total</div>
                    <div className="font-mono text-lg font-semibold text-secondary">
                      {summary.seasonTotal.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Games Played: {summary.gamesPlayed}
                    </div>
                  </div>
                  <div className="py-3 sm:rounded-md sm:border sm:p-3">
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
                  <div className="py-3 sm:rounded-md sm:border sm:p-3">
                    <div className="text-xs uppercase text-muted-foreground">Ranks</div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{teamCount}-team</span>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(summary.rank24, teamCount),
                          color: getTextColor(getRankColor(summary.rank24, teamCount)),
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
                  <div className="py-3 sm:rounded-md sm:border sm:p-3">
                    <div className="text-xs uppercase text-muted-foreground">Opponent Totals</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total</span>
                      <span className="font-mono">{summary.opponentTotal.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rank {teamCount}</span>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(summary.opponentRank24, teamCount),
                          color: getTextColor(getRankColor(summary.opponentRank24, teamCount)),
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
                  <div id={`position-${position}-details`} className="space-y-4 p-4">
                    <div className="space-y-2 sm:hidden" data-mobile-ledger={`${position}-weeks`}>
                      {data.weekly.map(row => (
                        <details
                          key={row.week}
                          className="group rounded-md border bg-muted/20"
                          aria-label={`${position} week ${row.week} complete details`}
                        >
                          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                            <span>
                              <span className="block text-sm font-semibold">Week {row.week}</span>
                              <span className="text-xs text-muted-foreground">
                                {row.teamPoints.toFixed(1)} points · rank {row.rank24 || '—'}
                              </span>
                            </span>
                            <ChevronDown
                              aria-hidden="true"
                              className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
                            />
                          </summary>
                          <dl className="grid grid-cols-2 gap-3 border-t border-border/70 p-3 text-xs">
                            <div>
                              <dt className="text-muted-foreground">League rank</dt>
                              <dd className="font-mono font-semibold">{row.rankLeague || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Opponent</dt>
                              <dd className="font-mono font-semibold">
                                {row.opponentPoints.toFixed(1)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Opponent rank ({teamCount})</dt>
                              <dd className="font-mono font-semibold">
                                {row.opponentRank24 || '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Opponent league rank</dt>
                              <dd className="font-mono font-semibold">
                                {row.opponentRankLeague || '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">vs average</dt>
                              <dd
                                className={`font-mono font-semibold ${deltaTextClass(row.vsAverage)}`}
                              >
                                {row.vsAverage > 0 ? '+' : ''}
                                {row.vsAverage.toFixed(1)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">vs median</dt>
                              <dd
                                className={`font-mono font-semibold ${deltaTextClass(row.vsMedian)}`}
                              >
                                {row.vsMedian > 0 ? '+' : ''}
                                {row.vsMedian.toFixed(1)}
                              </dd>
                            </div>
                          </dl>
                        </details>
                      ))}
                    </div>

                    <div
                      className="hidden overflow-x-auto rounded-md border sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      role="region"
                      aria-label={`${position} weekly performance table`}
                      tabIndex={0}
                    >
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-3 py-2 text-left">Week</th>
                            <th className="px-3 py-2 text-right">Team</th>
                            <th className="px-3 py-2 text-center">Rank ({teamCount})</th>
                            <th className="px-3 py-2 text-center">Rank (League)</th>
                            <th className="px-3 py-2 text-right">Opponent</th>
                            <th className="px-3 py-2 text-center">Opp Rank ({teamCount})</th>
                            <th className="px-3 py-2 text-center">Opp Rank (League)</th>
                            <th className="px-3 py-2 text-right">vs Avg</th>
                            <th className="px-3 py-2 text-right">vs Median</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.weekly.map(row => (
                            <tr key={row.week} className="border-t">
                              <td className="px-3 py-2 font-medium">Week {row.week}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-secondary">
                                {row.teamPoints.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className="rounded-full px-2 py-1 text-xs font-medium"
                                  style={{
                                    backgroundColor: getRankColor(row.rank24, teamCount),
                                    color: getTextColor(getRankColor(row.rank24, teamCount)),
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
                                    backgroundColor: getRankColor(row.opponentRank24, teamCount),
                                    color: getTextColor(
                                      getRankColor(row.opponentRank24, teamCount),
                                    ),
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
                                className={`px-3 py-2 text-right font-mono text-xs ${deltaTextClass(row.vsAverage)}`}
                              >
                                {row.vsAverage > 0 ? '+' : ''}
                                {row.vsAverage.toFixed(1)}
                              </td>
                              <td
                                className={`px-3 py-2 text-right font-mono text-xs ${deltaTextClass(row.vsMedian)}`}
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
