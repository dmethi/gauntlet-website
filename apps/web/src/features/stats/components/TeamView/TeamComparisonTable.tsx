import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TeamTotalsResult } from './utils';
import { getRankColor, getTextColor } from '@/shared/utils/colors';

interface TeamComparisonTableProps {
  fromWeek: number;
  toWeek: number;
  data: TeamTotalsResult;
  teamCount: number;
}

export const TeamComparisonTable = memo(
  ({ fromWeek, toWeek, data, teamCount }: TeamComparisonTableProps) => {
    const weeklyAverage = data.gamesPlayed > 0 ? data.teamTotal / data.gamesPlayed : data.teamTotal;
    const opponentWeeklyAverage =
      data.gamesPlayed > 0 ? data.opponentTotal / data.gamesPlayed : data.opponentTotal;
    const leagueWeeklyAverage =
      data.leagueAverageByWeek.length > 0
        ? data.leagueAverageByWeek.reduce((sum, value) => sum + value, 0) /
          data.leagueAverageByWeek.length
        : 0;
    const leagueWeeklyMedian =
      data.leagueMedianByWeek.length > 0
        ? data.leagueMedianByWeek.reduce((sum, value) => sum + value, 0) /
          data.leagueMedianByWeek.length
        : 0;
    const comparisonRows = [
      {
        label: 'Total Points',
        team: data.teamTotal,
        opponent: data.opponentTotal,
        leagueAverage: data.leagueAverage,
        leagueMedian: data.leagueMedian,
      },
      {
        label: 'Weekly Average',
        team: weeklyAverage,
        opponent: opponentWeeklyAverage,
        leagueAverage: leagueWeeklyAverage,
        leagueMedian: leagueWeeklyMedian,
      },
    ];

    return (
      <section className="border-b border-border/70 pb-8">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-primary">
            League Comparison (Weeks {fromWeek}-{toWeek})
          </h3>
        </div>

        <div className="space-y-2 sm:hidden" data-mobile-ledger="team-comparison">
          {comparisonRows.map(row => (
            <details
              key={row.label}
              className="group border-y border-border/70 bg-muted/20"
              aria-label={`${row.label} complete comparison`}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <span>
                  <span className="block text-xs font-semibold text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="font-mono text-base font-bold text-secondary">
                    {row.team.toFixed(1)}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    vs {row.opponent.toFixed(1)}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/70 px-3 py-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">League average</dt>
                  <dd className="font-mono font-semibold">{row.leagueAverage.toFixed(1)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">League median</dt>
                  <dd className="font-mono font-semibold">{row.leagueMedian.toFixed(1)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Rank ({teamCount})</dt>
                  <dd className="font-mono font-semibold">{data.seasonRank24 || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">League rank</dt>
                  <dd className="font-mono font-semibold">{data.seasonRankLeague || '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Average opponent rank</dt>
                  <dd className="font-mono font-semibold">
                    {data.averageOpponentRank ? data.averageOpponentRank.toFixed(1) : '—'}
                  </dd>
                </div>
              </dl>
            </details>
          ))}
        </div>

        <div
          className="hidden overflow-x-auto border-y border-border/70 sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          role="region"
          aria-label="League comparison table"
          tabIndex={0}
        >
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Metric</th>
                <th className="px-4 py-3 text-right">Team</th>
                <th className="px-4 py-3 text-right">Opponent</th>
                <th className="px-4 py-3 text-right">League Avg</th>
                <th className="px-4 py-3 text-right">League Median</th>
                <th className="px-4 py-3 text-center">Rank ({teamCount})</th>
                <th className="px-4 py-3 text-center">Rank (League)</th>
                <th className="px-4 py-3 text-center">Avg Opp Rank</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 font-medium">Total Points</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-secondary">
                  {data.teamTotal.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono">{data.opponentTotal.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono">{data.leagueAverage.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono">{data.leagueMedian.toFixed(1)}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(data.seasonRank24, teamCount),
                      color: getTextColor(getRankColor(data.seasonRank24, teamCount)),
                    }}
                  >
                    {data.seasonRank24 || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(data.seasonRankLeague, 12),
                      color: getTextColor(getRankColor(data.seasonRankLeague, 12)),
                    }}
                  >
                    {data.seasonRankLeague || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(
                        Math.round(data.averageOpponentRank || 0),
                        teamCount,
                      ),
                      color: getTextColor(
                        getRankColor(Math.round(data.averageOpponentRank || 0), teamCount),
                      ),
                    }}
                  >
                    {data.averageOpponentRank ? data.averageOpponentRank.toFixed(1) : '—'}
                  </span>
                </td>
              </tr>
              <tr className="border-t bg-muted/20">
                <td className="px-4 py-3 font-medium">Weekly Average</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-secondary">
                  {weeklyAverage.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {opponentWeeklyAverage.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono">{leagueWeeklyAverage.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono">{leagueWeeklyMedian.toFixed(1)}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(data.seasonRank24, teamCount),
                      color: getTextColor(getRankColor(data.seasonRank24, teamCount)),
                    }}
                  >
                    {data.seasonRank24 || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(data.seasonRankLeague, 12),
                      color: getTextColor(getRankColor(data.seasonRankLeague, 12)),
                    }}
                  >
                    {data.seasonRankLeague || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: getRankColor(
                        Math.round(data.averageOpponentRank || 0),
                        teamCount,
                      ),
                      color: getTextColor(
                        getRankColor(Math.round(data.averageOpponentRank || 0), teamCount),
                      ),
                    }}
                  >
                    {data.averageOpponentRank ? data.averageOpponentRank.toFixed(1) : '—'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  },
);

TeamComparisonTable.displayName = 'TeamComparisonTable';
