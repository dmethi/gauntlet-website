'use client';

import { memo, useState } from 'react';
import { TrackedPosition } from '@/shared/utils/stats';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { colors } from '../../../../../../../brand/colors';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { PositionData, TeamData } from './utils';
import { calculatePositionRankings } from './utils';

interface PositionRankingsSectionProps {
  readonly allTeamEntries: [string, TeamData][];
  readonly positionsMap: Map<TrackedPosition, PositionData>;
  readonly weekNum: number | null;
  readonly isSeasonView: boolean;
  readonly dataset: PlainStatsDataset;
}

export const PositionRankingsSection = memo<PositionRankingsSectionProps>(props => {
  const { allTeamEntries, positionsMap, weekNum, isSeasonView, dataset } = props;

  // Track expanded player breakdown rows
  const [expandedLeagueRows, setExpandedLeagueRows] = useState<Set<string>>(new Set());

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
        Position Rankings
      </h3>

      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => {
        const positionData = calculatePositionRankings(
          allTeamEntries,
          positionsMap,
          position,
          weekNum,
          isSeasonView,
        );

        return (
          <div key={position} className="rounded-md border">
            <div className="px-4 py-2" style={{ backgroundColor: colors.core.charcoalSteel }}>
              <h4 className="font-semibold text-white">
                {position} Rankings
                {!isSeasonView && (
                  <span className="ml-2 text-xs text-gray-300">(Click rows to see players)</span>
                )}
              </h4>
            </div>

            <div className="p-4">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-3 py-2 text-center">Rank</th>
                      <th className="px-3 py-2 text-left">Team</th>
                      <th className="px-3 py-2 text-right">Points</th>
                      {!isSeasonView && <th className="px-3 py-2 text-center">Players</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {positionData.flatMap(team => {
                      const rowKey = `league-${position}-${team.key}`;
                      const isExpanded = expandedLeagueRows.has(rowKey);
                      const rows = [];

                      // Main team row
                      rows.push(
                        <tr
                          key={team.key}
                          className={`border-t hover:bg-muted/20 ${!isSeasonView ? 'cursor-pointer' : ''}`}
                          onClick={
                            !isSeasonView
                              ? () => {
                                  const newExpanded = new Set(expandedLeagueRows);
                                  if (isExpanded) {
                                    newExpanded.delete(rowKey);
                                  } else {
                                    newExpanded.add(rowKey);
                                  }
                                  setExpandedLeagueRows(newExpanded);
                                }
                              : undefined
                          }
                        >
                          <td className="px-3 py-2 text-center">
                            <span
                              className="rounded-full px-2 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: getRankColor(team.rank, positionData.length),
                                color: getTextColor(getRankColor(team.rank, positionData.length)),
                              }}
                            >
                              {team.rank}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <div>
                                <div className="font-medium">{team.teamInfo.teamName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {team.teamInfo.leagueName}
                                </div>
                              </div>
                              {!isSeasonView && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className="px-3 py-2 text-right font-mono font-bold"
                            style={{ color: colors.core.regalGold }}
                          >
                            {team.posScore.toFixed(1)}
                          </td>
                          {!isSeasonView && (
                            <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                              Click to expand
                            </td>
                          )}
                        </tr>,
                      );

                      // Player breakdown row (if expanded and weekly view)
                      if (isExpanded && !isSeasonView && weekNum) {
                        const weekPlayerData = dataset.weeklyPlayerData[weekNum]?.[team.key];
                        const playersForPosition = weekPlayerData?.positions[position] || [];

                        rows.push(
                          <tr key={`${team.key}-breakdown`} className="bg-muted/5">
                            <td colSpan={4} className="p-0">
                              <PlayerBreakdownRow
                                players={playersForPosition}
                                position={position}
                              />
                            </td>
                          </tr>,
                        );
                      }

                      return rows;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

PositionRankingsSection.displayName = 'PositionRankingsSection';
