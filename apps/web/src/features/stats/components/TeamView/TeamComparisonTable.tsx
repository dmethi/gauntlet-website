import { memo } from 'react';
import { colors } from '../../../../../../../brand/colors';
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

    return (
      <section className="border-b border-border/70 pb-8">
        <div className="mb-3">
          <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            League Comparison (Weeks {fromWeek}-{toWeek})
          </h3>
        </div>

        <div className="overflow-x-auto border-y border-border/70">
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
                <td
                  className="px-4 py-3 text-right font-mono font-bold"
                  style={{ color: colors.core.regalGold }}
                >
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
                <td
                  className="px-4 py-3 text-right font-mono font-bold"
                  style={{ color: colors.core.regalGold }}
                >
                  {weeklyAverage.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {opponentWeeklyAverage.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {data.leagueAverageByWeek.length > 0
                    ? (
                        data.leagueAverageByWeek.reduce((sum, value) => sum + value, 0) /
                        data.leagueAverageByWeek.length
                      ).toFixed(1)
                    : '0.0'}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {data.leagueMedianByWeek.length > 0
                    ? (
                        data.leagueMedianByWeek.reduce((sum, value) => sum + value, 0) /
                        data.leagueMedianByWeek.length
                      ).toFixed(1)
                    : '0.0'}
                </td>
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
