'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrackedPosition } from '@/lib/stats/positions';
import { rank } from '@/lib/stats/ranks';
import { median } from '@/lib/stats/medians';
import { colors } from '../../../../../../brand/colors';
import { getRankColor } from '../utils/getRankColor';
import { getTextColor } from '../utils/getTextColor';
import { RidgePlot } from './RidgePlot';
import type { PlainStatsDataset } from '@/lib/stats/compose';

// Define proper types (matching LeagueView.tsx and ScatterAnalysis.tsx pattern)
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
  opponentScores?: TeamScore[];
}

interface PositionalTeamData {
  scores: { week: number; value: number }[];
}

interface PositionData {
  teams: [string, PositionalTeamData][];
  // Add other properties as needed
}

interface TrendsViewProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  dataset: PlainStatsDataset;
}

// Helper function for mean calculation
const mean = (arr: number[]): number => {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Power ranking team interface
interface PowerRankingTeam {
  key: string;
  teamInfo: TeamInfo;
  avgPoints: number;
  expectedWins: number;
  rolling3Avg: number;
  weeklyScores: number;
}

// Ridge plot data interface
interface RidgeTeamData {
  teamName: string;
  leagueName: string;
  teamKey: string;
  min: number;
  max: number;
  pad: number;
  median: number;
  range: number;
  scores: number[];
  gamesPlayed: number;
  xs: number[];
  densityPairs: [number, number][];
  maxDensity: number;
}

export function TrendsView({ allTeamEntries, positionsMap, dataset }: TrendsViewProps) {
  // Calculate league data for sorting (season view for consistency)
  const leagueData = useMemo(() => {
    const teams = allTeamEntries
      .map(([key, t]) => {
        const teamTotal = t.teamScores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0);
        return {
          key,
          teamInfo: t.teamInfo,
          teamTotal,
        };
      })
      .filter(team => team.teamTotal > 0);

    // Calculate ranks
    const teamTotals = teams.map(t => t.teamTotal);
    const teamRanks = rank(teamTotals);

    return teams
      .map((team, index) => ({
        ...team,
        rank: teamRanks[index],
      }))
      .sort((a, b) => a.rank - b.rank);
  }, [allTeamEntries]);

  return (
    <div className='space-y-8'>
      {/* Power Rankings Evolution */}
      <Card>
        <CardHeader>
          <CardTitle>Power Rankings Evolution</CardTitle>
          <CardDescription>
            Advanced power rankings using 50% avg points, 30% expected wins, 20% rolling average.
            Higher scores = stronger teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-auto rounded-md border'>
            <table className='w-full text-xs'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]'>
                    Team
                  </th>
                  {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(week => (
                    <th
                      key={week}
                      className='px-3 py-3 text-center font-semibold min-w-[50px]'
                      style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                    >
                      W{week}
                    </th>
                  ))}
                  <th
                    className='px-3 py-3 text-center font-semibold min-w-[80px]'
                    style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                  >
                    Weekly Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Calculate power rankings for each week
                  const weeklyPowerRankings = new Map<
                    string,
                    {
                      teamInfo: TeamInfo;
                      weeklyScores: number[];
                      weeklyRanks: number[];
                      trend: string;
                    }
                  >();

                  // Helper function to calculate z-scores
                  const calculateZScore = (values: number[]): number[] => {
                    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                    const stdDev = Math.sqrt(
                      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
                    );
                    return stdDev === 0
                      ? values.map(() => 0)
                      : values.map(val => (val - mean) / stdDev);
                  };

                  // For each completed week, calculate power rankings
                  for (let week = 1; week <= dataset.currentWeek - 1; week++) {
                    const weekTeams = allTeamEntries
                      .map(([key, t]) => {
                        // Get team data up to this week
                        const weeklyScores = t.teamScores
                          .filter(d => d.week <= week && d.value > 0)
                          .map(d => d.value);

                        if (weeklyScores.length === 0) return null;

                        // Calculate metrics for power ranking
                        const avgPoints =
                          weeklyScores.reduce((sum, score) => sum + score, 0) / weeklyScores.length;

                        // Expected wins - how many wins this avg score would get vs all opponents
                        let expectedWins = 0;
                        for (let checkWeek = 1; checkWeek <= week; checkWeek++) {
                          const myScore = t.teamScores.find(d => d.week === checkWeek)?.value || 0;
                          if (myScore > 0) {
                            // Count how many teams this score would beat that week
                            let winsThisWeek = 0;
                            let gamesThisWeek = 0;
                            for (const [, otherTeam] of allTeamEntries) {
                              const otherScore =
                                otherTeam.teamScores.find(d => d.week === checkWeek)?.value || 0;
                              if (otherScore > 0) {
                                gamesThisWeek++;
                                if (myScore > otherScore) winsThisWeek++;
                              }
                            }
                            expectedWins += gamesThisWeek > 0 ? winsThisWeek / gamesThisWeek : 0;
                          }
                        }

                        // Rolling 3-week average (or all weeks if < 3)
                        const recentScores = weeklyScores.slice(-3);
                        const rolling3Avg =
                          recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

                        return {
                          key,
                          teamInfo: t.teamInfo,
                          avgPoints,
                          expectedWins,
                          rolling3Avg,
                          weeklyScores: weeklyScores.length,
                        };
                      })
                      .filter(Boolean) as PowerRankingTeam[];

                    if (weekTeams.length === 0) continue;

                    // Calculate z-scores for normalization
                    const avgPointsValues = weekTeams.map(t => t.avgPoints);
                    const expectedWinsValues = weekTeams.map(t => t.expectedWins);
                    const rolling3Values = weekTeams.map(t => t.rolling3Avg);

                    const zAvgPoints = calculateZScore(avgPointsValues);
                    const zExpectedWins = calculateZScore(expectedWinsValues);
                    const zRolling3 = calculateZScore(rolling3Values);

                    // Calculate power scores using the official formula
                    const powerData = weekTeams.map((team, index) => {
                      const powerScore =
                        0.5 * zAvgPoints[index] +
                        0.3 * zExpectedWins[index] +
                        0.2 * zRolling3[index];
                      const normalized = Math.round((100 + powerScore * 15) * 100) / 100;
                      return {
                        ...team,
                        powerScore: normalized,
                      };
                    });

                    // Sort by power score and assign ranks
                    powerData.sort((a, b) => b.powerScore - a.powerScore);
                    powerData.forEach((team, index) => {
                      if (!weeklyPowerRankings.has(team.key)) {
                        weeklyPowerRankings.set(team.key, {
                          teamInfo: team.teamInfo,
                          weeklyScores: [],
                          weeklyRanks: [],
                          trend: '',
                        });
                      }
                      weeklyPowerRankings.get(team.key)!.weeklyScores.push(team.powerScore);
                      weeklyPowerRankings.get(team.key)!.weeklyRanks.push(index + 1);
                    });
                  }

                  // Calculate trends
                  weeklyPowerRankings.forEach(data => {
                    const ranks = data.weeklyRanks;
                    if (ranks.length >= 2) {
                      const recent = ranks.slice(-2);
                      const change = recent[0] - recent[1]; // negative = improved rank (better)
                      if (change < -2)
                        data.trend = '🚀'; // power rising
                      else if (change > 2)
                        data.trend = '📉'; // power falling
                      else data.trend = '➡️'; // stable power
                    } else {
                      data.trend = '➡️';
                    }
                  });

                  // Sort teams by most recent power ranking (not season ranking)
                  const sortedPowerTeams = Array.from(weeklyPowerRankings.entries()).sort(
                    (a, b) => {
                      const aRecentRank = a[1].weeklyRanks[a[1].weeklyRanks.length - 1] || 999;
                      const bRecentRank = b[1].weeklyRanks[b[1].weeklyRanks.length - 1] || 999;
                      return aRecentRank - bRecentRank;
                    }
                  );

                  return sortedPowerTeams.map(([teamKey, data]) => (
                    <tr key={teamKey} className='border-t hover:bg-muted/10'>
                      <td className='sticky left-0 z-10 bg-background border-r px-3 py-2'>
                        <div className='font-medium'>{data.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {data.teamInfo.leagueName}
                        </div>
                      </td>
                      {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i).map(
                        weekIndex => {
                          const weekRank = data.weeklyRanks[weekIndex];
                          const weekScore = data.weeklyScores[weekIndex];
                          return (
                            <td key={weekIndex} className='px-1 py-2 text-center border-r'>
                              {weekRank ? (
                                <div
                                  className='rounded-md p-2 transition-colors'
                                  style={{
                                    backgroundColor: getRankColor(weekRank, 24),
                                  }}
                                >
                                  <div
                                    className='font-mono font-bold text-xs'
                                    style={{
                                      color: getTextColor(getRankColor(weekRank, 24)),
                                    }}
                                  >
                                    #{weekRank}
                                  </div>
                                  <div
                                    className='font-mono text-xs mt-1'
                                    style={{
                                      color: getTextColor(getRankColor(weekRank, 24)),
                                    }}
                                  >
                                    {weekScore?.toFixed(2)}
                                  </div>
                                </div>
                              ) : (
                                <div className='text-xs text-muted-foreground'>—</div>
                              )}
                            </td>
                          );
                        }
                      )}
                      <td className='px-3 py-2 text-center'>
                        <div className='w-16 h-8'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                              data={(() => {
                                // Get actual weekly data with correct week numbers using teamKey
                                const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                                if (!teamData) return [];

                                return teamData.teamScores
                                  .filter(d => d.value > 0)
                                  .map(d => ({
                                    week: d.week,
                                    score: d.value,
                                  }));
                              })()}
                            >
                              <Line
                                type='monotone'
                                dataKey='score'
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
                                  'Score',
                                ]}
                                labelFormatter={week => `Week ${week}`}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
            <h4 className='font-semibold mb-2'>Power Rankings Formula</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground'>
              <div>
                <p>
                  <strong>Components:</strong> 50% Avg Points + 30% Expected Wins + 20% Rolling
                  3-Week Avg
                </p>
              </div>
              <div>
                <p>
                  <strong>Trends:</strong> 🚀 Rising Power (rank up 3+), ➡️ Stable, 📉 Declining
                  Power (rank down 3+)
                </p>
              </div>
            </div>
            <div className='mt-2'>
              <p>
                <strong>Score Range:</strong> ~70-130, where higher = stronger team. Accounts for
                consistency, recent form, and opponent strength.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Trends</CardTitle>
          <CardDescription>
            Track each team&apos;s ranking progression week by week. Green = top performance, Red =
            bottom performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-auto rounded-md border'>
            <table className='w-full text-xs'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]'>
                    Team
                  </th>
                  {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(week => (
                    <th
                      key={week}
                      className='px-3 py-3 text-center font-semibold min-w-[50px]'
                      style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                    >
                      W{week}
                    </th>
                  ))}
                  <th
                    className='px-3 py-3 text-center font-semibold min-w-[80px]'
                    style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                  >
                    Weekly Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Build weekly ranking data for all teams (simple scoring)
                  const weeklyRankings = new Map<
                    string,
                    {
                      teamInfo: TeamInfo;
                      weeklyRanks: number[];
                      weeklyScores: number[];
                      trend: string;
                    }
                  >();

                  // For each completed week, calculate all team ranks
                  for (let week = 1; week <= dataset.currentWeek - 1; week++) {
                    const weekTeams = allTeamEntries
                      .map(([key, t]) => {
                        const weekScore = t.teamScores.find(d => d.week === week)?.value || 0;
                        return { key, teamInfo: t.teamInfo, weekScore };
                      })
                      .filter(t => t.weekScore !== 0) // Include negative scores (defense can be negative)
                      .sort((a, b) => b.weekScore - a.weekScore);

                    // Calculate ranks for all teams this week
                    const weekScores = weekTeams.map(t => t.weekScore);
                    const weekRanks = rank(weekScores);

                    // Assign ranks and scores to each team
                    weekTeams.forEach((team, index) => {
                      if (!weeklyRankings.has(team.key)) {
                        weeklyRankings.set(team.key, {
                          teamInfo: team.teamInfo,
                          weeklyRanks: [],
                          weeklyScores: [],
                          trend: '',
                        });
                      }
                      weeklyRankings.get(team.key)!.weeklyRanks.push(weekRanks[index]);
                      weeklyRankings.get(team.key)!.weeklyScores.push(team.weekScore);
                    });
                  }

                  // Calculate trends for each team
                  weeklyRankings.forEach((data, _teamKey) => {
                    const ranks = data.weeklyRanks;
                    if (ranks.length >= 2) {
                      const recent = ranks.slice(-2);
                      const change = recent[0] - recent[1]; // negative = improved rank (better)
                      if (change < -2)
                        data.trend = '📈'; // improving
                      else if (change > 2)
                        data.trend = '📉'; // declining
                      else data.trend = '➡️'; // stable
                    } else {
                      data.trend = '➡️';
                    }
                  });

                  // Sort teams by current season ranking
                  const sortedTeams = Array.from(weeklyRankings.entries()).sort((a, b) => {
                    const aCurrentRank = leagueData.find(t => t.key === a[0])?.rank || 999;
                    const bCurrentRank = leagueData.find(t => t.key === b[0])?.rank || 999;
                    return aCurrentRank - bCurrentRank;
                  });

                  return sortedTeams.map(([teamKey, data]) => (
                    <tr key={teamKey} className='border-t hover:bg-muted/10'>
                      <td className='sticky left-0 z-10 bg-background border-r px-3 py-2'>
                        <div className='font-medium'>{data.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {data.teamInfo.leagueName}
                        </div>
                      </td>
                      {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i).map(
                        weekIndex => {
                          const weekRank = data.weeklyRanks[weekIndex];
                          const weekScore = data.weeklyScores[weekIndex];
                          return (
                            <td key={weekIndex} className='px-1 py-2 text-center border-r'>
                              {weekRank ? (
                                <div
                                  className='rounded-md p-2 transition-colors'
                                  style={{
                                    backgroundColor: getRankColor(weekRank, 24),
                                  }}
                                >
                                  <div
                                    className='font-mono font-bold text-xs'
                                    style={{
                                      color: getTextColor(getRankColor(weekRank, 24)),
                                    }}
                                  >
                                    #{weekRank}
                                  </div>
                                  <div
                                    className='font-mono text-xs mt-1'
                                    style={{
                                      color: getTextColor(getRankColor(weekRank, 24)),
                                    }}
                                  >
                                    {weekScore?.toFixed(1)}
                                  </div>
                                </div>
                              ) : (
                                <div className='text-xs text-muted-foreground'>—</div>
                              )}
                            </td>
                          );
                        }
                      )}
                      <td className='px-3 py-2 text-center'>
                        <div className='w-16 h-8'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                              data={(() => {
                                // Get actual weekly data with correct week numbers using teamKey
                                const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                                if (!teamData) return [];

                                return teamData.teamScores
                                  .filter(d => d.value > 0)
                                  .map(d => ({
                                    week: d.week,
                                    score: d.value,
                                  }));
                              })()}
                            >
                              <Line
                                type='monotone'
                                dataKey='score'
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
                                  'Score',
                                ]}
                                labelFormatter={week => `Week ${week}`}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
            <h4 className='font-semibold mb-2'>How to Read the Trends</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground'>
              <div>
                <p>
                  <strong>Colors:</strong> Green = top performance, Red = bottom performance
                  (percentile-based)
                </p>
              </div>
              <div>
                <p>
                  <strong>Trends:</strong> 📈 Improving (rank up 3+), ➡️ Stable (±2), 📉 Declining
                  (rank down 3+)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positional Trend Heatmaps */}
      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
        <Card key={position}>
          <CardHeader>
            <CardTitle>{position} Weekly Performance Trends</CardTitle>
            <CardDescription>
              Track each team&apos;s {position} performance week by week. Green = top {position}{' '}
              groups, Red = bottom {position} groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-auto rounded-md border'>
              <table className='w-full text-xs'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]'>
                      Team
                    </th>
                    {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(week => (
                      <th
                        key={week}
                        className='px-3 py-3 text-center font-semibold min-w-[50px]'
                        style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                      >
                        W{week}
                      </th>
                    ))}
                    <th
                      className='px-3 py-3 text-center font-semibold min-w-[60px]'
                      style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                    >
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Build weekly positional ranking data
                    const positionRankings = new Map<
                      string,
                      {
                        teamInfo: TeamInfo;
                        weeklyRanks: number[];
                        weeklyScores: number[];
                        trend: string;
                      }
                    >();

                    // For each completed week, calculate positional ranks
                    for (let week = 1; week <= dataset.currentWeek - 1; week++) {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);

                      const weekTeams = allTeamEntries
                        .map(([key, t]) => {
                          const teamPosData = posTeamsMap.get(key);
                          const weekScore =
                            teamPosData?.scores.find(d => d.week === week)?.value || 0;
                          return { key, teamInfo: t.teamInfo, weekScore };
                        })
                        .filter(t => t.weekScore !== 0) // Include negative defense scores
                        .sort((a, b) => b.weekScore - a.weekScore);

                      // Debug missing defense scores (commented out for production)
                      // if (position === 'DEF' && week === 1) {
                      //   console.log(`[DEBUG] ${position} Week ${week}:`, {
                      //     posDataExists: !!posData,
                      //     teamsCount: posTeamsMap.size,
                      //     totalTeamsInLeague: allTeamEntries.length,
                      //     weekTeamsWithScores: weekTeams.length,
                      //     teamsWithoutScores: allTeamEntries.length - weekTeams.length,
                      //     sampleScores: weekTeams
                      //       .slice(0, 3)
                      //       .map(t => ({ team: t.teamInfo.teamName, score: t.weekScore })),
                      //     missingTeams: allTeamEntries
                      //       .filter(([key]) => !weekTeams.find(wt => wt.key === key))
                      //       .slice(0, 5)
                      //       .map(([key, t]) => ({
                      //         team: t.teamInfo.teamName,
                      //         hasPositionData: posTeamsMap.has(key),
                      //         weekScore:
                      //           posTeamsMap.get(key)?.scores.find(d => d.week === week)?.value ||
                      //           'NO_DATA',
                      //       })),
                      //   });
                      // }

                      // Calculate ranks for all teams this week
                      const weekScores = weekTeams.map(t => t.weekScore);
                      const weekRanks = rank(weekScores);

                      // Assign ranks and scores to each team
                      weekTeams.forEach((team, index) => {
                        if (!positionRankings.has(team.key)) {
                          positionRankings.set(team.key, {
                            teamInfo: team.teamInfo,
                            weeklyRanks: [],
                            weeklyScores: [],
                            trend: '',
                          });
                        }
                        positionRankings.get(team.key)!.weeklyRanks.push(weekRanks[index]);
                        positionRankings.get(team.key)!.weeklyScores.push(team.weekScore);
                      });
                    }

                    // Calculate trends for each team
                    positionRankings.forEach((data, _teamKey) => {
                      const ranks = data.weeklyRanks;
                      if (ranks.length >= 2) {
                        const recent = ranks.slice(-2);
                        const change = recent[0] - recent[1]; // negative = improved rank (better)
                        if (change < -2)
                          data.trend = '📈'; // improving
                        else if (change > 2)
                          data.trend = '📉'; // declining
                        else data.trend = '➡️'; // stable
                      } else {
                        data.trend = '➡️';
                      }
                    });

                    // Add teams with no positional data (show them at bottom)
                    for (const [teamKey, team] of allTeamEntries) {
                      if (!positionRankings.has(teamKey)) {
                        positionRankings.set(teamKey, {
                          teamInfo: team.teamInfo,
                          weeklyRanks: [],
                          weeklyScores: [],
                          trend: '➡️',
                        });
                      }
                    }

                    // Sort teams by season total for this position (highest first)
                    const sortedPosTeams = Array.from(positionRankings.entries()).sort((a, b) => {
                      const aSeasonTotal = a[1].weeklyScores.reduce((sum, score) => sum + score, 0);
                      const bSeasonTotal = b[1].weeklyScores.reduce((sum, score) => sum + score, 0);
                      return bSeasonTotal - aSeasonTotal; // Highest first
                    });

                    return sortedPosTeams.map(([teamKey, data]) => (
                      <tr key={teamKey} className='border-t hover:bg-muted/10'>
                        <td className='sticky left-0 z-10 bg-background border-r px-3 py-2'>
                          <div className='font-medium'>{data.teamInfo.teamName}</div>
                          <div className='text-xs text-muted-foreground'>
                            {data.teamInfo.leagueName}
                          </div>
                        </td>
                        {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i).map(
                          weekIndex => {
                            const weekRank = data.weeklyRanks[weekIndex];
                            const weekScore = data.weeklyScores[weekIndex];
                            return (
                              <td key={weekIndex} className='px-1 py-2 text-center border-r'>
                                {weekRank ? (
                                  <div
                                    className='rounded-md p-2 transition-colors'
                                    style={{
                                      backgroundColor: getRankColor(weekRank, 24),
                                    }}
                                  >
                                    <div
                                      className='font-mono font-bold text-xs'
                                      style={{
                                        color: getTextColor(getRankColor(weekRank, 24)),
                                      }}
                                    >
                                      #{weekRank}
                                    </div>
                                    <div
                                      className='font-mono text-xs mt-1'
                                      style={{
                                        color: getTextColor(getRankColor(weekRank, 24)),
                                      }}
                                    >
                                      {weekScore?.toFixed(1)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className='text-xs text-muted-foreground'>—</div>
                                )}
                              </td>
                            );
                          }
                        )}
                        <td className='px-3 py-2 text-center'>
                          <div className='w-16 h-8'>
                            <ResponsiveContainer width='100%' height='100%'>
                              <LineChart
                                data={data.weeklyScores.map((score, index) => ({
                                  week: index + 1,
                                  score: score,
                                }))}
                              >
                                <Line
                                  type='monotone'
                                  dataKey='score'
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
                                    `${Number(value).toFixed(1)}`,
                                    'Score',
                                  ]}
                                  labelFormatter={week => `Week ${week}`}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>How to Read {position} Trends</h4>
              <div className='text-muted-foreground'>
                <p>
                  <strong>Colors:</strong> Green = top {position} performance, Red = bottom{' '}
                  {position} performance
                </p>
                <p>
                  <strong>Trends:</strong> 📈 Improving, ➡️ Stable, 📉 Declining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Team Consistency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Team Consistency Analysis</CardTitle>
          <CardDescription>
            Consistency scores showing scoring reliability vs volatility. Higher bars = more
            predictable teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-96'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={(() => {
                  // Calculate consistency metrics for each team
                  const consistencyData = allTeamEntries
                    .map(([teamKey, team]) => {
                      const weeklyScores = team.teamScores
                        .filter(d => d.value > 0)
                        .map(d => d.value)
                        .sort((a, b) => a - b);

                      if (weeklyScores.length === 0) return null;

                      // Calculate statistics
                      const medianValue = median(weeklyScores);
                      const meanValue = mean(weeklyScores);
                      const min = weeklyScores[0];
                      const max = weeklyScores[weeklyScores.length - 1];
                      const range = max - min;
                      const stdDev = Math.sqrt(
                        weeklyScores.reduce(
                          (sum, score) => sum + Math.pow(score - meanValue, 2),
                          0
                        ) / weeklyScores.length
                      );

                      return {
                        teamKey,
                        teamName: team.teamInfo.teamName,
                        leagueName: team.teamInfo.leagueName,
                        median: medianValue,
                        mean: meanValue,
                        min,
                        max,
                        range,
                        stdDev,
                        gamesPlayed: weeklyScores.length,
                        scores: weeklyScores,
                        // Consistency metrics for bar height
                        consistency: 100 - Math.min(stdDev * 3, 100), // Higher = more consistent
                      };
                    })
                    .filter(Boolean)
                    .sort((a, b) => (b?.consistency || 0) - (a?.consistency || 0)); // Sort by consistency

                  return consistencyData;
                })()}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <XAxis
                  dataKey='teamName'
                  angle={-45}
                  textAnchor='end'
                  height={80}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: 'Consistency Score', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                  tickFormatter={value => Number(value).toFixed(0)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className='p-4 rounded-lg shadow-xl border min-w-[320px]'
                          style={{
                            backgroundColor: colors.core.charcoalSteel,
                            borderColor: colors.core.regalGold,
                            color: 'white',
                          }}
                        >
                          <div
                            className='font-bold text-lg mb-1'
                            style={{ color: colors.core.regalGold }}
                          >
                            {data.teamName}
                          </div>
                          <div className='text-xs text-gray-300 mb-3'>{data.leagueName}</div>

                          <div className='space-y-3 text-sm'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <div className='font-semibold'>Consistency Score</div>
                                <div className='text-lg font-bold'>
                                  {data.consistency.toFixed(1)}/100
                                </div>
                                <div className='text-xs text-gray-400'>
                                  {data.stdDev < 15
                                    ? '🎯 Very Steady'
                                    : data.stdDev < 25
                                      ? '📊 Somewhat Predictable'
                                      : '🎲 Highly Volatile'}
                                </div>
                              </div>
                              <div>
                                <div className='font-semibold'>Score Range</div>
                                <div className='text-lg font-bold'>{data.range.toFixed(1)}</div>
                                <div className='text-xs text-gray-400'>
                                  {data.min.toFixed(1)} - {data.max.toFixed(1)}
                                </div>
                              </div>
                            </div>

                            <div className='border-t border-gray-600 pt-2'>
                              <div className='grid grid-cols-2 gap-3 text-xs'>
                                <div>
                                  Median:{' '}
                                  <span className='font-semibold'>{data.median.toFixed(1)}</span>
                                </div>
                                <div>
                                  Mean:{' '}
                                  <span className='font-semibold'>{data.mean.toFixed(1)}</span>
                                </div>
                                <div>
                                  Std Dev:{' '}
                                  <span className='font-semibold'>{data.stdDev.toFixed(1)}</span>
                                </div>
                                <div>
                                  Games: <span className='font-semibold'>{data.gamesPlayed}</span>
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

                <Bar dataKey='consistency'>
                  {(() => {
                    const data = allTeamEntries
                      .map(([teamKey, team]) => {
                        const weeklyScores = team.teamScores
                          .filter(d => d.value > 0)
                          .map(d => d.value);
                        if (weeklyScores.length === 0) return null;
                        const meanValue = mean(weeklyScores);
                        const stdDev = Math.sqrt(
                          weeklyScores.reduce(
                            (sum, score) => sum + Math.pow(score - meanValue, 2),
                            0
                          ) / weeklyScores.length
                        );
                        return { teamKey, consistency: 100 - Math.min(stdDev * 3, 100) };
                      })
                      .filter(Boolean);

                    return data.map((team, index) => {
                      if (!team) return null;

                      return <Cell key={`cell-${index}`} fill={colors.core.regalGold} />;
                    });
                  })()}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
            <h4 className='font-semibold mb-2'>How to Read Consistency</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
              <div>
                <span className='font-semibold'>🎯 Steady Teams:</span> Low standard deviation
                (&lt;15), narrow score ranges. Reliable for playoffs.
              </div>
              <div>
                <span className='font-semibold'>📊 Average Teams:</span> Medium volatility (15-25
                std dev). Some variance but predictable.
              </div>
              <div>
                <span className='font-semibold'>🎲 Volatile Teams:</span> High volatility (&gt;25
                std dev). Boom-or-bust potential.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positional Consistency Analysis */}
      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
        <Card key={position}>
          <CardHeader>
            <CardTitle>{position} Consistency Analysis</CardTitle>
            <CardDescription>
              {position} scoring consistency across all teams. Green = reliable {position}{' '}
              production, Red = volatile {position} performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={(() => {
                    const posData = positionsMap.get(position);
                    const posTeamsMap = new Map(posData?.teams || []);

                    // Calculate positional consistency for each team
                    const posConsistencyData = allTeamEntries
                      .map(([teamKey, team]) => {
                        const teamPosData = posTeamsMap.get(teamKey);
                        const weeklyPosScores =
                          teamPosData?.scores.filter(d => d.value !== 0).map(d => d.value) || [];

                        if (weeklyPosScores.length === 0) return null;

                        // Calculate statistics
                        const meanValue = mean(weeklyPosScores);
                        const medianValue = median(weeklyPosScores);
                        const min = Math.min(...weeklyPosScores);
                        const max = Math.max(...weeklyPosScores);
                        const range = max - min;
                        const stdDev = Math.sqrt(
                          weeklyPosScores.reduce(
                            (sum, score) => sum + Math.pow(score - meanValue, 2),
                            0
                          ) / weeklyPosScores.length
                        );

                        return {
                          teamKey,
                          teamName: team.teamInfo.teamName,
                          leagueName: team.teamInfo.leagueName,
                          median: medianValue,
                          mean: meanValue,
                          min,
                          max,
                          range,
                          stdDev,
                          gamesPlayed: weeklyPosScores.length,
                          scores: weeklyPosScores,
                          // Consistency score for this position
                          consistency: 100 - Math.min(stdDev * 4, 100), // Position scores are smaller, so adjust multiplier
                        };
                      })
                      .filter((item): item is NonNullable<typeof item> => Boolean(item))
                      .sort((a, b) => b.consistency - a.consistency); // Sort by consistency

                    return posConsistencyData;
                  })()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <XAxis
                    dataKey='teamName'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    label={{
                      value: `${position} Consistency`,
                      angle: -90,
                      position: 'insideLeft',
                    }}
                    tick={{ fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={value => Number(value).toFixed(0)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className='p-4 rounded-lg shadow-xl border min-w-[320px]'
                            style={{
                              backgroundColor: colors.core.charcoalSteel,
                              borderColor: colors.core.regalGold,
                              color: 'white',
                            }}
                          >
                            <div
                              className='font-bold text-lg mb-1'
                              style={{ color: colors.core.regalGold }}
                            >
                              {data.teamName}
                            </div>
                            <div className='text-xs text-gray-300 mb-3'>{data.leagueName}</div>

                            <div className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div>
                                  <div className='font-semibold'>{position} Consistency</div>
                                  <div className='text-lg font-bold'>
                                    {data.consistency.toFixed(1)}/100
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    {data.stdDev < 8
                                      ? '🎯 Very Steady'
                                      : data.stdDev < 15
                                        ? '📊 Somewhat Predictable'
                                        : '🎲 Highly Volatile'}
                                  </div>
                                </div>
                                <div>
                                  <div className='font-semibold'>{position} Range</div>
                                  <div className='text-lg font-bold'>{data.range.toFixed(1)}</div>
                                  <div className='text-xs text-gray-400'>
                                    {data.min.toFixed(1)} - {data.max.toFixed(1)}
                                  </div>
                                </div>
                              </div>

                              <div className='border-t border-gray-600 pt-2'>
                                <div className='grid grid-cols-2 gap-3 text-xs'>
                                  <div>
                                    Median:{' '}
                                    <span className='font-semibold'>{data.median.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    Mean:{' '}
                                    <span className='font-semibold'>{data.mean.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    Std Dev:{' '}
                                    <span className='font-semibold'>{data.stdDev.toFixed(1)}</span>
                                  </div>
                                  <div>
                                    Games: <span className='font-semibold'>{data.gamesPlayed}</span>
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

                  <Bar dataKey='consistency'>
                    {(() => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);

                      const data = allTeamEntries
                        .map(([teamKey, _team]) => {
                          const teamPosData = posTeamsMap.get(teamKey);
                          const weeklyPosScores =
                            teamPosData?.scores.filter(d => d.value !== 0).map(d => d.value) || [];
                          if (weeklyPosScores.length === 0) return null;
                          const meanValue = mean(weeklyPosScores);
                          const stdDev = Math.sqrt(
                            weeklyPosScores.reduce(
                              (sum, score) => sum + Math.pow(score - meanValue, 2),
                              0
                            ) / weeklyPosScores.length
                          );
                          return { teamKey, consistency: 100 - Math.min(stdDev * 4, 100) };
                        })
                        .filter((item): item is NonNullable<typeof item> => Boolean(item));

                      // const consistencyValues = data.map(d => d.consistency);
                      // const minConsistency = Math.min(...consistencyValues);
                      // const maxConsistency = Math.max(...consistencyValues);

                      return data.map((team, index) => {
                        // Normalize consistency score to 0-1 for color mapping (unused for now)
                        // const normalized =
                        //   maxConsistency === minConsistency
                        //     ? 0.5
                        //     : (team.consistency - minConsistency) /
                        //       (maxConsistency - minConsistency);

                        return <Cell key={`cell-${index}`} fill={colors.core.regalGold} />;
                      });
                    })().filter(Boolean)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>{position} Consistency Guide</h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
                <div>
                  <span className='font-semibold'>🎯 Steady {position}:</span> Low week-to-week
                  variance. Reliable production.
                </div>
                <div>
                  <span className='font-semibold'>📊 Average {position}:</span> Some volatility but
                  generally predictable.
                </div>
                <div>
                  <span className='font-semibold'>🎲 Volatile {position}:</span> High variance.
                  Boom-or-bust potential.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Team Scoring Distribution (Ridge Plots) */}
      <Card>
        <CardHeader>
          <CardTitle>Team Scoring Distribution Analysis</CardTitle>
          <CardDescription>
            Ridge plots showing each team&apos;s scoring distribution shape. Narrow ridges =
            consistent, Wide ridges = volatile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[800px]'>
            {(() => {
              // 1) Build chartData BEFORE the JSX:
              const helpers = {
                median(arr: number[]) {
                  if (!arr.length) return NaN;
                  const m = Math.floor(arr.length / 2);
                  return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
                },
                linspace(a: number, b: number, n: number) {
                  return Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));
                },
                kde(samples: number[], xs: number[]) {
                  if (!samples.length) return xs.map(x => [x, 0] as [number, number]);
                  const n = samples.length;
                  const mean = samples.reduce((s, v) => s + v, 0) / n;
                  const std =
                    Math.sqrt(
                      samples.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1)
                    ) || 1e-6;
                  const h = Math.max(1e-6, 1.06 * std * Math.pow(n, -1 / 5));
                  const inv = 1 / (Math.sqrt(2 * Math.PI) * h);
                  const twoH2 = 2 * h * h;
                  return xs.map(x => {
                    const s = samples.reduce(
                      (acc, v) => acc + Math.exp(-((x - v) ** 2) / twoH2),
                      0
                    );
                    return [x, (inv * s) / n] as [number, number];
                  });
                },
              };

              // Build ridgeData + chartData once
              const ridgeData = allTeamEntries
                .map(([teamKey, team]) => {
                  const weekly = team.teamScores
                    .filter(d => d.value > 0)
                    .map(d => d.value)
                    .sort((a, b) => a - b);
                  if (!weekly.length) return null;

                  const min = weekly[0];
                  const max = weekly[weekly.length - 1];
                  const med = helpers.median(weekly);
                  const pad = Math.max(2, (max - min) * 0.05); // Small padding for domain calculation

                  const xs = helpers.linspace(min, max, Math.min(80, 20 + 3 * weekly.length));
                  const densityPairs = helpers.kde(weekly, xs);
                  const maxDensity = Math.max(...densityPairs.map(([, y]) => y)) || 1;

                  return {
                    teamName: team.teamInfo.teamName,
                    leagueName: team.teamInfo.leagueName,
                    teamKey,
                    min,
                    max,
                    pad, // Add pad back for domain calculation
                    median: med,
                    range: max - min,
                    scores: weekly,
                    gamesPlayed: weekly.length,
                    xs,
                    densityPairs,
                    maxDensity,
                  };
                })
                .filter(Boolean)
                .sort((a, b) => b!.median - a!.median) as RidgeTeamData[];

              const chartData = ridgeData.map((t, i) => ({
                x: t.median,
                y: (ridgeData.length - i) * 3, // for tooltip/Y domain only
                type: 'ridge',
                ...t,
              }));

              // 👉 domain must use min/max across ALL ridges (with pad), not medians
              let xDomain: [number, number] = [80, 180]; // Default fallback for fantasy scores

              if (ridgeData && ridgeData.length > 0) {
                const validData = ridgeData.filter(
                  t =>
                    typeof t.min === 'number' &&
                    !isNaN(t.min) &&
                    typeof t.max === 'number' &&
                    !isNaN(t.max) &&
                    typeof t.pad === 'number' &&
                    !isNaN(t.pad)
                );

                if (validData.length > 0) {
                  // Calculate domain from all teams' ranges
                  const allMins = validData.map(t => t.min - t.pad);
                  const allMaxs = validData.map(t => t.max + t.pad);

                  const calculatedMin = Math.min(...allMins);
                  const calculatedMax = Math.max(...allMaxs);

                  xDomain = [calculatedMin, calculatedMax];

                  // Check for valid domain
                  if (!isFinite(xDomain[0]) || !isFinite(xDomain[1])) {
                    // console.warn('Invalid xDomain calculated, using fallback', xDomain);
                    xDomain = [80, 180]; // More reasonable fallback for fantasy scores
                  } else {
                    // Add 5% buffer to prevent bleeding over axis range
                    const domainRange = xDomain[1] - xDomain[0];
                    const buffer = domainRange * 0.05;
                    xDomain[0] -= buffer;
                    xDomain[1] += buffer;
                  }
                } else {
                  // console.warn('No valid ridge data for team chart');
                }
              } else {
                // console.warn('Empty ridge data for team chart');
              }

              return (
                <RidgePlot data={chartData} domain={xDomain} height={800} title='Weekly Scores' />
              );
            })()}
          </div>

          <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
            <h4 className='font-semibold mb-2'>Ridge Plot Guide</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
              <div>
                <span className='font-semibold'>🎯 Narrow Ridge:</span> Tall, thin curve =
                consistent scoring week-to-week.
              </div>
              <div>
                <span className='font-semibold'>🌊 Wide Ridge:</span> Flat, spread curve = volatile
                performance with high variance.
              </div>
              <div>
                <span className='font-semibold'>📍 Median Line:</span> Dashed line shows typical
                weekly performance.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positional Scoring Distribution (Ridge Plots) */}
      {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => (
        <Card key={position}>
          <CardHeader>
            <CardTitle>{position} Scoring Distribution Analysis</CardTitle>
            <CardDescription>
              {position} scoring distribution by team. Ridge plots show {position} consistency vs.
              volatility patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[700px]'>
              {(() => {
                const posData = positionsMap.get(position);
                const posTeamsMap = new Map(posData?.teams || []);

                // Reuse the same KDE helpers
                const helpers = {
                  median(arr: number[]) {
                    if (!arr.length) return NaN;
                    const m = Math.floor(arr.length / 2);
                    return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
                  },
                  linspace(a: number, b: number, n: number) {
                    return Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));
                  },
                  kde(samples: number[], xs: number[]) {
                    if (!samples.length) return xs.map(x => [x, 0] as [number, number]);
                    const n = samples.length;
                    const mean = samples.reduce((s, v) => s + v, 0) / n;
                    const std =
                      Math.sqrt(
                        samples.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1)
                      ) || 1e-6;
                    const h = Math.max(1e-6, 1.06 * std * Math.pow(n, -1 / 5));
                    const inv = 1 / (Math.sqrt(2 * Math.PI) * h);
                    const twoH2 = 2 * h * h;
                    return xs.map(x => {
                      const s = samples.reduce(
                        (acc, v) => acc + Math.exp(-((x - v) ** 2) / twoH2),
                        0
                      );
                      return [x, (inv * s) / n] as [number, number];
                    });
                  },
                };

                // Build positional ridgeData + chartData
                const posRidgeData = allTeamEntries
                  .map(([teamKey, team]) => {
                    const teamPosData = posTeamsMap.get(teamKey);
                    const weekly =
                      teamPosData?.scores
                        .filter(d => d.value !== 0)
                        .map(d => d.value)
                        .sort((a, b) => a - b) || [];
                    if (!weekly.length) return null;

                    const min = weekly[0];
                    const max = weekly[weekly.length - 1];
                    const med = helpers.median(weekly);
                    const pad = Math.max(1, (max - min) * 0.05); // Small padding for domain calculation
                    const xs = helpers.linspace(min, max, Math.min(60, 15 + 2 * weekly.length));
                    const densityPairs = helpers.kde(weekly, xs);
                    const maxDensity = Math.max(...densityPairs.map(([, y]) => y)) || 1;

                    return {
                      teamName: team.teamInfo.teamName,
                      leagueName: team.teamInfo.leagueName,
                      teamKey,
                      min,
                      max,
                      pad, // Add pad back for domain calculation
                      median: med,
                      range: max - min,
                      scores: weekly,
                      gamesPlayed: weekly.length,
                      xs,
                      densityPairs,
                      maxDensity,
                    };
                  })
                  .filter(Boolean)
                  .sort((a, b) => b!.median - a!.median) as RidgeTeamData[];

                const posChartData = posRidgeData.map((t, i) => ({
                  x: t.median,
                  y: (posRidgeData.length - i) * 2.5, // for tooltip/Y domain only
                  type: 'ridge',
                  ...t,
                }));

                // Domain must use min/max across ALL ridges (with pad), not medians
                let posXDomain: [number, number] = [0, 50]; // Default fallback for positional scores

                if (posRidgeData && posRidgeData.length > 0) {
                  const validPosData = posRidgeData.filter(
                    t =>
                      typeof t.min === 'number' &&
                      !isNaN(t.min) &&
                      typeof t.max === 'number' &&
                      !isNaN(t.max) &&
                      typeof t.pad === 'number' &&
                      !isNaN(t.pad)
                  );

                  if (validPosData.length > 0) {
                    // Calculate domain from all teams' ranges
                    const allPosMins = validPosData.map(t => t.min - t.pad);
                    const allPosMaxs = validPosData.map(t => t.max + t.pad);

                    const posCalculatedMin = Math.min(...allPosMins);
                    const posCalculatedMax = Math.max(...allPosMaxs);

                    posXDomain = [posCalculatedMin, posCalculatedMax];

                    // Check for valid domain
                    if (!isFinite(posXDomain[0]) || !isFinite(posXDomain[1])) {
                      // console.warn('Invalid posXDomain calculated, using fallback');
                      posXDomain = [0, 50];
                    } else {
                      // Add 5% buffer to prevent bleeding over axis range
                      const posDomainRange = posXDomain[1] - posXDomain[0];
                      const posBuffer = posDomainRange * 0.05;
                      posXDomain[0] -= posBuffer;
                      posXDomain[1] += posBuffer;
                    }
                  } else {
                    // console.warn('No valid ridge data for positional chart:', position);
                  }
                } else {
                  // console.warn('Empty ridge data for positional chart:', position);
                }

                return (
                  <RidgePlot
                    data={posChartData}
                    domain={posXDomain}
                    height={600}
                    title={`${position} Weekly Scores`}
                  />
                );
              })()}
            </div>

            <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
              <h4 className='font-semibold mb-2'>{position} Ridge Plot Guide</h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground'>
                <div>
                  <span className='font-semibold'>🎯 Narrow Ridge:</span> Tall, thin curve =
                  consistent {position} scoring.
                </div>
                <div>
                  <span className='font-semibold'>🌊 Wide Ridge:</span> Flat, spread curve =
                  volatile {position} performance.
                </div>
                <div>
                  <span className='font-semibold'>📍 Median Line:</span> Dashed line shows typical{' '}
                  {position} performance.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
