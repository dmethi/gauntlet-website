'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrackedPosition } from '@/lib/stats/positions';
import { colors } from '../../../../../../brand/colors';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { rank } from '@/lib/stats/ranks';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import {
  getPositionSummaries,
  getTopPositionalAdvantages,
} from '@/lib/stats/positional-advantages';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import type { PlainStatsDataset } from '@/lib/stats/compose';

// Define proper types
interface TeamInfo {
  teamName: string;
  leagueName: string;
}

interface TeamScore {
  week: number;
  value: number;
}

interface TeamData {
  teamInfo: TeamInfo;
  teamScores: TeamScore[];
}

interface PositionData {
  teams: [string, any][];
  // Add other properties as needed
}

interface LeagueViewProps {
  selectedWeek: string;
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  setSelectedWeek: (week: string) => void;
  availableWeeks: number[];
  dataset: PlainStatsDataset;
  fromWeek: number;
  toWeek: number;
}

export function LeagueView({
  selectedWeek,
  allTeamEntries,
  positionsMap,
  setSelectedWeek,
  availableWeeks,
  dataset,
  fromWeek,
  toWeek,
}: LeagueViewProps) {
  const isSeasonView = selectedWeek === 'season';
  const weekNum = isSeasonView ? null : parseInt(selectedWeek, 10);

  // Track expanded player breakdown rows in League View
  const [expandedLeagueRows, setExpandedLeagueRows] = useState<Set<string>>(new Set());

  // Build league rankings data
  const leagueData = useMemo(() => {
    const teams = allTeamEntries
      .map(([key, t]) => {
        const teamTotal = isSeasonView
          ? t.teamScores
              .filter((d: TeamScore) => d.value > 0)
              .reduce((a: number, d: TeamScore) => a + d.value, 0)
          : t.teamScores.find((d: TeamScore) => d.week === weekNum)?.value || 0;

        // Get positional data
        const posScores: Record<TrackedPosition, number> = {
          QB: 0,
          RB: 0,
          WR: 0,
          TE: 0,
          DEF: 0,
        };

        for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]) {
          const posData = positionsMap.get(position);
          const posTeamsMap = new Map(posData?.teams || []);
          const teamPosData = posTeamsMap.get(key);

          if (teamPosData) {
            posScores[position] = isSeasonView
              ? teamPosData.scores
                  .filter((d: any) => d.value > 0)
                  .reduce((a: number, d: any) => a + d.value, 0)
              : teamPosData.scores.find((d: any) => d.week === weekNum)?.value || 0;
          }
        }

        return {
          key,
          teamInfo: t.teamInfo,
          teamTotal,
          positions: posScores,
        };
      })
      .filter(team => team.teamTotal > 0); // Only include teams with data

    // Calculate ranks
    const teamTotals = teams.map(t => t.teamTotal);
    const teamRanks = rank(teamTotals);

    const positionRanks: Record<TrackedPosition, number[]> = {
      QB: rank(teams.map(t => t.positions.QB)),
      RB: rank(teams.map(t => t.positions.RB)),
      WR: rank(teams.map(t => t.positions.WR)),
      TE: rank(teams.map(t => t.positions.TE)),
      DEF: rank(teams.map(t => t.positions.DEF)),
    };

    return teams
      .map((team, index) => ({
        ...team,
        rank: teamRanks[index],
        positionRanks: {
          QB: positionRanks.QB[index],
          RB: positionRanks.RB[index],
          WR: positionRanks.WR[index],
          TE: positionRanks.TE[index],
          DEF: positionRanks.DEF[index],
        },
      }))
      .sort((a, b) => a.rank - b.rank); // Sort by overall rank
  }, [allTeamEntries, positionsMap, weekNum, isSeasonView]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>League Rankings</CardTitle>
          <CardDescription>
            {isSeasonView
              ? 'Season totals - All 24 teams ranked by performance. Color-coded positions show strengths (green) and weaknesses (red).'
              : `Week ${weekNum} - All 24 teams ranked by performance. Color-coded positions show strengths (green) and weaknesses (red). Click position tables to see players.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-medium">View</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="season">Season Overview</SelectItem>
                {availableWeeks.map(week => (
                  <SelectItem key={week} value={String(week)}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-center">Rank</th>
                  <th className="px-3 py-2 text-left">Team</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  {isSeasonView && (
                    <th className="px-3 py-2 text-center min-w-[120px]">Weekly Trend</th>
                  )}
                  <th className="px-3 py-2 text-center">QB</th>
                  <th className="px-3 py-2 text-center">RB</th>
                  <th className="px-3 py-2 text-center">WR</th>
                  <th className="px-3 py-2 text-center">TE</th>
                  <th className="px-3 py-2 text-center">DEF</th>
                </tr>
              </thead>
              <tbody>
                {leagueData.map((team, _index) => (
                  <tr key={team.key} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 text-center">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(team.rank, 24),
                          color: getTextColor(getRankColor(team.rank, 24)),
                        }}
                      >
                        {team.rank}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{team.teamInfo.teamName}</div>
                      <div className="text-xs text-muted-foreground">
                        {team.teamInfo.leagueName}
                      </div>
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono font-bold"
                      style={{ color: colors.core.regalGold }}
                    >
                      {team.teamTotal.toFixed(1)}
                    </td>
                    {isSeasonView && (
                      <td className="px-2 py-2">
                        <div className="w-28 h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={(() => {
                                // Get weekly scores for sparkline
                                const teamData = allTeamEntries.find(([k]) => k === team.key);
                                if (!teamData) return [];

                                return teamData[1].teamScores
                                  .filter((d: TeamScore) => d.value > 0)
                                  .map((d: TeamScore) => ({
                                    week: d.week,
                                    score: d.value,
                                  }));
                              })()}
                            >
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke={colors.core.regalGold}
                                strokeWidth={2}
                                dot={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  color: 'white',
                                  fontSize: '11px',
                                  padding: '4px 8px',
                                }}
                                formatter={(value, _name) => [
                                  `${Number(value).toFixed(1)} pts`,
                                  `Week`,
                                ]}
                                labelFormatter={week => `Week ${week}`}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    )}
                    {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
                      <td key={position} className="px-2 py-2 text-center">
                        <div className="space-y-2">
                          {/* Position heatmap cell */}
                          <div
                            className="rounded-lg p-2 transition-colors min-w-[70px]"
                            style={{
                              backgroundColor: getRankColor(team.positionRanks[position], 24),
                            }}
                          >
                            <div
                              className="font-mono font-bold text-xs"
                              style={{
                                color: getTextColor(getRankColor(team.positionRanks[position], 24)),
                              }}
                            >
                              #{team.positionRanks[position]}
                            </div>
                            <div
                              className="font-mono text-xs"
                              style={{
                                color: getTextColor(getRankColor(team.positionRanks[position], 24)),
                              }}
                            >
                              {team.positions[position].toFixed(1)}
                            </div>
                          </div>

                          {/* Position sparkline (season view only) */}
                          {isSeasonView && (
                            <div className="w-16 h-6">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={(() => {
                                    // Get weekly positional scores
                                    const posData = positionsMap.get(position);
                                    const posTeamsMap = new Map(posData?.teams || []);
                                    const teamPosData = posTeamsMap.get(team.key);

                                    if (!teamPosData) return [];

                                    return teamPosData.scores
                                      .filter((d: any) => d.value !== 0)
                                      .map((d: any) => ({
                                        week: d.week,
                                        score: d.value,
                                      }));
                                  })()}
                                >
                                  <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke={
                                      team.positionRanks[position] <= 6
                                        ? colors.rdylgn[8] // Elite = green
                                        : team.positionRanks[position] <= 12
                                          ? colors.rdylgn[5] // Average = yellow
                                          : colors.rdylgn[2] // Below average = red
                                    }
                                    strokeWidth={1.5}
                                    dot={false}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'rgba(0,0,0,0.8)',
                                      border: 'none',
                                      borderRadius: '4px',
                                      color: 'white',
                                      fontSize: '10px',
                                      padding: '3px 6px',
                                    }}
                                    formatter={value => [
                                      `${Number(value).toFixed(1)} pts`,
                                      position,
                                    ]}
                                    labelFormatter={week => `Week ${week}`}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color Legend */}
          <div className="mt-4 p-3 bg-muted/20 rounded-md text-xs">
            <h4 className="font-semibold mb-2">Position Color Guide</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-muted-foreground">
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: colors.rdylgn[9] }}
                ></span>
                <strong>Top 10%</strong>
              </div>
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: colors.rdylgn[8] }}
                ></span>
                <strong>Top 25%</strong>
              </div>
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: colors.rdylgn[7] }}
                ></span>
                <strong>Top 50%</strong>
              </div>
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: colors.rdylgn[5] }}
                ></span>
                <strong>Middle</strong>
              </div>
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: colors.rdylgn[3] }}
                ></span>
                <strong>Bottom 25%</strong>
              </div>
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: colors.rdylgn[1] }}
                ></span>
                <strong>Bottom 10%</strong>
              </div>
            </div>
          </div>

          {/* Position Tables */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
              Position Rankings
            </h3>

            {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => {
              // Build position-specific data (removed useMemo to avoid React Hook in callback)
              const teams = allTeamEntries
                .map(([key, t]) => {
                  const posData = positionsMap.get(position);
                  const posTeamsMap = new Map(posData?.teams || []);
                  const teamPosData = posTeamsMap.get(key);

                  if (!teamPosData) return null;

                  const posScore = isSeasonView
                    ? teamPosData.scores
                        .filter((d: any) => d.value > 0)
                        .reduce((a: number, d: any) => a + d.value, 0)
                    : teamPosData.scores.find((d: any) => d.week === weekNum)?.value || 0;

                  return {
                    key,
                    teamInfo: t.teamInfo,
                    posScore,
                  };
                })
                .filter(Boolean)
                .filter(team => team!.posScore > 0) as Array<{
                key: string;
                teamInfo: TeamInfo;
                posScore: number;
              }>;

              // Calculate ranks
              const posScores = teams.map(t => t.posScore);
              const posRanks = rank(posScores);

              const positionData = teams
                .map((team, index) => ({
                  ...team,
                  rank: posRanks[index],
                }))
                .sort((a, b) => a.rank - b.rank);

              return (
                <div key={position} className="rounded-md border">
                  <div className="px-4 py-2" style={{ backgroundColor: colors.core.charcoalSteel }}>
                    <h4 className="font-semibold text-white">
                      {position} Rankings
                      {!isSeasonView && (
                        <span className="ml-2 text-xs text-gray-300">
                          (Click rows to see players)
                        </span>
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
                                      color: getTextColor(
                                        getRankColor(team.rank, positionData.length),
                                      ),
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
        </CardContent>
      </Card>

      {/* Positional Advantages Overview - Only show for season view */}
      {isSeasonView && (
        <Card>
          <CardHeader>
            <CardTitle>Positional Advantages Overview</CardTitle>
            <CardDescription>
              League-wide analysis of positional strengths and weaknesses based on weekly averages
              vs. median
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const { topAdvantages, topDisadvantages } = getTopPositionalAdvantages(
                dataset,
                { from: fromWeek, to: toWeek },
                8,
              );

              return (
                <div className="space-y-6">
                  {/* Top Advantages and Disadvantages */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Top Advantages */}
                    <div className="rounded-md border">
                      <div className="px-4 py-2" style={{ backgroundColor: colors.rdylgn[2] }}>
                        <h4 className="font-semibold text-white">Biggest Positional Advantages</h4>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/20">
                            <tr>
                              <th className="px-3 py-2 text-left">Team</th>
                              <th className="px-3 py-2 text-center">Position</th>
                              <th className="px-3 py-2 text-right">Advantage</th>
                              <th className="px-3 py-2 text-right">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topAdvantages.map(adv => (
                              <tr key={`${adv.teamKey}-${adv.position}`} className="border-t">
                                <td className="px-3 py-2">
                                  <div>
                                    <div className="font-medium">{adv.teamName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {adv.leagueName}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center font-mono font-bold">
                                  {adv.position}
                                </td>
                                <td
                                  className="px-3 py-2 text-right font-mono font-bold"
                                  style={{ color: colors.rdylgn[8] }}
                                >
                                  +{adv.advantage.toFixed(1)}
                                </td>
                                <td
                                  className="px-3 py-2 text-right font-mono"
                                  style={{ color: colors.rdylgn[8] }}
                                >
                                  +{adv.percentageAdvantage.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Disadvantages */}
                    <div className="rounded-md border">
                      <div className="px-4 py-2" style={{ backgroundColor: colors.rdylgn[8] }}>
                        <h4 className="font-semibold text-white">
                          Biggest Positional Disadvantages
                        </h4>
                      </div>
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/20">
                            <tr>
                              <th className="px-3 py-2 text-left">Team</th>
                              <th className="px-3 py-2 text-center">Position</th>
                              <th className="px-3 py-2 text-right">Disadvantage</th>
                              <th className="px-3 py-2 text-right">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topDisadvantages.map(adv => (
                              <tr key={`${adv.teamKey}-${adv.position}`} className="border-t">
                                <td className="px-3 py-2">
                                  <div>
                                    <div className="font-medium">{adv.teamName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {adv.leagueName}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center font-mono font-bold">
                                  {adv.position}
                                </td>
                                <td
                                  className="px-3 py-2 text-right font-mono font-bold"
                                  style={{ color: colors.rdylgn[2] }}
                                >
                                  {adv.advantage.toFixed(1)}
                                </td>
                                <td
                                  className="px-3 py-2 text-right font-mono"
                                  style={{ color: colors.rdylgn[2] }}
                                >
                                  {adv.percentageAdvantage.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Position-by-Position Tables */}
                  <div>
                    <h4
                      className="mb-4 text-md font-semibold"
                      style={{ color: colors.core.charcoalSteel }}
                    >
                      Position-by-Position Rankings
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {(() => {
                        const positionSummaries = getPositionSummaries(dataset, {
                          from: fromWeek,
                          to: toWeek,
                        });

                        return positionSummaries.map(posSummary => (
                          <div key={posSummary.position} className="rounded-md border">
                            <div
                              className="px-3 py-2"
                              style={{ backgroundColor: colors.core.charcoalSteel }}
                            >
                              <h5 className="font-semibold text-white text-center">
                                {posSummary.position} (Median: {posSummary.leagueMedian.toFixed(1)})
                              </h5>
                            </div>
                            <div className="p-3">
                              <table className="w-full text-xs">
                                <thead className="bg-muted/20">
                                  <tr>
                                    <th className="px-2 py-1 text-left text-xs">Team</th>
                                    <th className="px-2 py-1 text-right text-xs">Weekly Avg</th>
                                    <th className="px-2 py-1 text-right text-xs">vs Median</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {posSummary.teams.map(team => {
                                    const advantageColor =
                                      team.advantage === 0
                                        ? colors.rdylgn[5]
                                        : team.advantage > 0
                                          ? colors.rdylgn[8]
                                          : colors.rdylgn[2];

                                    return (
                                      <tr key={team.teamKey} className="border-t">
                                        <td className="px-2 py-1">
                                          <div className="font-medium text-xs">{team.teamName}</div>
                                          <div className="text-xs text-muted-foreground">
                                            #{team.rank}
                                          </div>
                                        </td>
                                        <td
                                          className="px-2 py-1 text-right font-mono text-xs"
                                          style={{ color: colors.core.regalGold }}
                                        >
                                          {team.weeklyAverage.toFixed(1)}
                                        </td>
                                        <td
                                          className="px-2 py-1 text-right font-mono text-xs font-bold"
                                          style={{ color: advantageColor }}
                                        >
                                          {team.advantage > 0 ? '+' : ''}
                                          {team.advantage.toFixed(1)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
