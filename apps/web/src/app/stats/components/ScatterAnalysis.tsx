'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { colors } from '../../../../../../brand/colors';
import { median, TrackedPosition } from '@/shared/utils/stats';

// Define proper types (matching LeagueView.tsx pattern)
interface TeamInfo {
  teamName: string;
  leagueName: string;
  avatar?: string;
}

interface TeamScore {
  week: number;
  value: number;
}

interface TeamData {
  teamInfo: TeamInfo;
  teamScores: TeamScore[];
  opponentScores: TeamScore[];
}

interface PositionalTeamData {
  scores: { week: number; value: number }[];
}

interface PositionData {
  teams: [string, PositionalTeamData][];
  // Add other properties as needed
}

interface ScatterAnalysisProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
}

export const ScatterAnalysis = ({ allTeamEntries, positionsMap }: ScatterAnalysisProps) => {
  return (
    <div className="space-y-8">
      {/* Overall Team Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle>Team Efficiency Analysis</CardTitle>
          <CardDescription>
            Points For vs Points Against. Teams in upper-left are dominant (high offense, low
            opponent scoring).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                data={(() => {
                  const data = allTeamEntries
                    .map(([teamKey, team]) => {
                      const pointsFor = team.teamScores
                        .filter(d => d.value > 0)
                        .reduce((sum, d) => sum + d.value, 0);
                      const pointsAgainst = team.opponentScores
                        .filter(d => d.value > 0)
                        .reduce((sum, d) => sum + d.value, 0);
                      const gamesPlayed = team.teamScores.filter(d => d.value > 0).length;

                      return {
                        teamKey,
                        teamName: team.teamInfo.teamName,
                        leagueName: team.teamInfo.leagueName,
                        pointsFor: gamesPlayed > 0 ? pointsFor / gamesPlayed : 0,
                        pointsAgainst: gamesPlayed > 0 ? pointsAgainst / gamesPlayed : 0,
                        totalFor: pointsFor,
                        totalAgainst: pointsAgainst,
                        gamesPlayed,
                      };
                    })
                    .filter(t => t.gamesPlayed > 0);

                  return data;
                })()}
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              >
                <XAxis
                  type="number"
                  dataKey="pointsFor"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  label={{
                    value: 'Skill',
                    position: 'insideBottom',
                    offset: -10,
                    style: { textAnchor: 'middle', fontSize: '12px' },
                  }}
                  tick={{ fontSize: 11 }}
                  tickFormatter={value => Number(value).toFixed(0)}
                />
                <YAxis
                  type="number"
                  dataKey="pointsAgainst"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  reversed={true}
                  label={{
                    value: 'Luck',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px' },
                  }}
                  tick={{ fontSize: 11 }}
                  tickFormatter={value => Number(value).toFixed(0)}
                />
                {/* Median reference lines */}
                <ReferenceLine
                  x={median(
                    allTeamEntries
                      .map(([, team]) => {
                        const pointsFor = team.teamScores
                          .filter(d => d.value > 0)
                          .reduce((sum, d) => sum + d.value, 0);
                        const gamesPlayed = team.teamScores.filter(d => d.value > 0).length;
                        return gamesPlayed > 0 ? pointsFor / gamesPlayed : 0;
                      })
                      .filter(x => x > 0),
                  )}
                  stroke="rgba(156, 163, 175, 0.8)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <ReferenceLine
                  y={median(
                    allTeamEntries
                      .map(([, team]) => {
                        const pointsAgainst = team.opponentScores
                          .filter(d => d.value > 0)
                          .reduce((sum, d) => sum + d.value, 0);
                        const gamesPlayed = team.teamScores.filter(d => d.value > 0).length;
                        return gamesPlayed > 0 ? pointsAgainst / gamesPlayed : 0;
                      })
                      .filter(x => x > 0),
                  )}
                  stroke="rgba(156, 163, 175, 0.8)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className="p-4 rounded-lg shadow-xl border min-w-[240px]"
                          style={{
                            backgroundColor: colors.core.charcoalSteel,
                            borderColor: colors.core.regalGold,
                            color: 'white',
                          }}
                        >
                          <div
                            className="font-bold text-lg mb-1"
                            style={{ color: colors.core.regalGold }}
                          >
                            {data.teamName}
                          </div>
                          <div className="text-xs text-gray-300 mb-3">{data.leagueName}</div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: colors.rdylgn[8] }}
                                ></div>
                                <span className="font-medium">Points Scored</span>
                              </div>
                              <div className="ml-5">
                                <div className="font-bold text-lg">
                                  {data.pointsFor.toFixed(1)}/game
                                </div>
                                <div className="text-xs text-gray-400">
                                  {data.totalFor.toFixed(1)} season total
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: colors.rdylgn[2] }}
                                ></div>
                                <span className="font-medium">Points Allowed</span>
                              </div>
                              <div className="ml-5">
                                <div className="font-bold text-lg">
                                  {data.pointsAgainst.toFixed(1)}/game
                                </div>
                                <div className="text-xs text-gray-400">
                                  {data.totalAgainst.toFixed(1)} season total
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  dataKey="pointsFor"
                  shape={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: { teamKey: string; teamName: string; [key: string]: any };
                  }) => {
                    const { cx, cy, payload } = props;
                    if (!payload || !cx || !cy) return <g></g>;

                    // Find team data to get avatar
                    const teamData = allTeamEntries.find(([k]) => k === payload.teamKey)?.[1];
                    const avatarUrl = teamData?.teamInfo.avatar;

                    if (avatarUrl) {
                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={14}
                            fill="white"
                            stroke={colors.core.regalGold}
                            strokeWidth={3}
                          />
                          <image
                            x={cx - 12}
                            y={cy - 12}
                            width={24}
                            height={24}
                            href={avatarUrl}
                            clipPath="circle(12px at 12px 12px)"
                            aria-label={`${payload.teamName} avatar`}
                          />
                        </g>
                      );
                    } else {
                      // Fallback to initials
                      const initials = payload.teamName
                        .split(' ')
                        .map((word: string) => word[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={12}
                            fill={colors.core.regalGold}
                            stroke="rgba(0,0,0,0.3)"
                            strokeWidth={2}
                          />
                          <text
                            x={cx}
                            y={cy + 1}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill="white"
                          >
                            {initials}
                          </text>
                        </g>
                      );
                    }
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Positional Efficiency Analysis */}
      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
        <Card key={position}>
          <CardHeader>
            <CardTitle>{position} Efficiency Analysis</CardTitle>
            <CardDescription>
              {position} Points For vs Points Against. Shows which teams excel at {position} offense
              vs defense.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  data={(() => {
                    const posData = positionsMap.get(position);
                    const posTeamsMap = new Map(posData?.teams || []);

                    return allTeamEntries
                      .map(([teamKey, team]) => {
                        const teamPosData = posTeamsMap.get(teamKey);

                        // Points for (our position scoring)
                        const posPointsFor =
                          teamPosData?.scores
                            .filter(d => d.value !== 0)
                            .reduce((sum, d) => sum + d.value, 0) || 0;

                        // Points against (opponent position scoring vs us) - CALCULATE MANUALLY
                        let posPointsAgainst = 0;
                        if (teamPosData) {
                          // For each week this team played, get opponent's position score
                          for (const scoreData of teamPosData.scores) {
                            if (scoreData.value === 0) continue;

                            // Find who this team played against that week
                            const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                            const opponentScore = teamData?.opponentScores.find(
                              (d: TeamScore) => d.week === scoreData.week,
                            );

                            if (opponentScore && opponentScore.value > 0) {
                              // Find the opponent team by looking for matching opponent score
                              for (const [oppKey, oppTeam] of allTeamEntries) {
                                if (oppKey === teamKey) continue;
                                const oppTeamScore = oppTeam.teamScores.find(
                                  (d: TeamScore) => d.week === scoreData.week,
                                );
                                if (
                                  oppTeamScore &&
                                  Math.abs(oppTeamScore.value - opponentScore.value) < 0.01
                                ) {
                                  // Found the opponent - get their position score that week
                                  const oppPosData = posTeamsMap.get(oppKey);
                                  const oppPosScore =
                                    oppPosData?.scores.find(
                                      (d: { week: number; value: number }) =>
                                        d.week === scoreData.week,
                                    )?.value || 0;
                                  posPointsAgainst += oppPosScore;
                                  break;
                                }
                              }
                            }
                          }
                        }

                        const gamesPlayed =
                          teamPosData?.scores.filter(d => d.value !== 0).length || 0;

                        return {
                          teamKey,
                          teamName: team.teamInfo.teamName,
                          leagueName: team.teamInfo.leagueName,
                          pointsFor: gamesPlayed > 0 ? posPointsFor / gamesPlayed : 0,
                          pointsAgainst: gamesPlayed > 0 ? posPointsAgainst / gamesPlayed : 0,
                          gamesPlayed,
                          totalFor: posPointsFor,
                          totalAgainst: posPointsAgainst,
                        };
                      })
                      .filter(t => t.gamesPlayed > 0);
                  })()}
                  margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                >
                  <XAxis
                    type="number"
                    dataKey="pointsFor"
                    domain={['dataMin - 2', 'dataMax + 2']}
                    label={{
                      value: 'Skill',
                      position: 'insideBottom',
                      offset: -10,
                      style: { textAnchor: 'middle', fontSize: '12px' },
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => Number(value).toFixed(0)}
                  />
                  <YAxis
                    type="number"
                    dataKey="pointsAgainst"
                    domain={['dataMin - 2', 'dataMax + 2']}
                    reversed={true}
                    label={{
                      value: 'Luck',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px' },
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => Number(value).toFixed(0)}
                  />
                  {/* Median reference lines */}
                  <ReferenceLine
                    x={(() => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);
                      const values = allTeamEntries
                        .map(([teamKey]) => {
                          const teamPosData = posTeamsMap.get(teamKey);
                          const pointsFor =
                            teamPosData?.scores
                              .filter(d => d.value !== 0)
                              .reduce((sum, d) => sum + d.value, 0) || 0;
                          const gamesPlayed =
                            teamPosData?.scores.filter(d => d.value !== 0).length || 0;
                          return gamesPlayed > 0 ? pointsFor / gamesPlayed : 0;
                        })
                        .filter(x => x !== 0);
                      return median(values);
                    })()}
                    stroke="#6b7280"
                    strokeDasharray="8 4"
                    strokeWidth={2}
                  />
                  <ReferenceLine
                    y={(() => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);

                      // Use same calculation as chart data
                      const chartData = allTeamEntries
                        .map(([teamKey, _team]) => {
                          const teamPosData = posTeamsMap.get(teamKey);

                          let posPointsAgainst = 0;
                          if (teamPosData) {
                            for (const scoreData of teamPosData.scores) {
                              if (scoreData.value === 0) continue;

                              const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                              const opponentScore = teamData?.opponentScores.find(
                                (d: TeamScore) => d.week === scoreData.week,
                              );

                              if (opponentScore && opponentScore.value > 0) {
                                for (const [oppKey, oppTeam] of allTeamEntries) {
                                  if (oppKey === teamKey) continue;
                                  const oppTeamScore = oppTeam.teamScores.find(
                                    (d: TeamScore) => d.week === scoreData.week,
                                  );
                                  if (
                                    oppTeamScore &&
                                    Math.abs(oppTeamScore.value - opponentScore.value) < 0.01
                                  ) {
                                    const oppPosData = posTeamsMap.get(oppKey);
                                    const oppPosScore =
                                      oppPosData?.scores.find(
                                        (d: { week: number; value: number }) =>
                                          d.week === scoreData.week,
                                      )?.value || 0;
                                    posPointsAgainst += oppPosScore;
                                    break;
                                  }
                                }
                              }
                            }
                          }

                          const gamesPlayed =
                            teamPosData?.scores.filter(d => d.value !== 0).length || 0;
                          return gamesPlayed > 0 ? posPointsAgainst / gamesPlayed : 0;
                        })
                        .filter(x => x > 0);

                      return median(chartData);
                    })()}
                    stroke="#6b7280"
                    strokeDasharray="8 4"
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className="p-4 rounded-lg shadow-xl border min-w-[280px]"
                            style={{
                              backgroundColor: colors.core.charcoalSteel,
                              borderColor: colors.core.regalGold,
                              color: 'white',
                            }}
                          >
                            <div
                              className="font-bold text-lg mb-1"
                              style={{ color: colors.core.regalGold }}
                            >
                              {data.teamName}
                            </div>
                            <div className="text-xs text-gray-300 mb-3">{data.leagueName}</div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors.rdylgn[8] }}
                                  ></div>
                                  <span className="font-medium">{position} Scored</span>
                                </div>
                                <div className="ml-5">
                                  <div className="font-bold text-lg">
                                    {data.pointsFor.toFixed(1)}/game
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {data.totalFor.toFixed(1)} season total
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors.rdylgn[2] }}
                                  ></div>
                                  <span className="font-medium">{position} Allowed</span>
                                </div>
                                <div className="ml-5">
                                  <div className="font-bold text-lg">
                                    {data.pointsAgainst.toFixed(1)}/game
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {data.totalAgainst.toFixed(1)} season total
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    dataKey="pointsFor"
                    shape={(props: {
                      cx?: number;
                      cy?: number;
                      payload?: { teamKey: string; teamName: string; [key: string]: any };
                    }) => {
                      const { cx, cy, payload } = props;
                      if (!payload || !cx || !cy) return <g></g>;

                      // Find team data to get avatar
                      const teamData = allTeamEntries.find(([k]) => k === payload.teamKey)?.[1];
                      const avatarUrl = teamData?.teamInfo.avatar;

                      if (avatarUrl) {
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={12}
                              fill="white"
                              stroke={colors.core.regalGold}
                              strokeWidth={2}
                            />
                            <image
                              x={cx - 10}
                              y={cy - 10}
                              width={20}
                              height={20}
                              href={avatarUrl}
                              clipPath="circle(10px at 10px 10px)"
                              aria-label={`${payload.teamName} avatar`}
                            />
                          </g>
                        );
                      } else {
                        // Fallback to initials
                        const initials = payload.teamName
                          .split(' ')
                          .map((word: string) => word[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill={colors.core.regalGold}
                              stroke="rgba(0,0,0,0.3)"
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy + 1}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill="white"
                            >
                              {initials}
                            </text>
                          </g>
                        );
                      }
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
