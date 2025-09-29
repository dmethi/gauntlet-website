'use client';

import { useMemo, useState } from 'react';
import type { PlainStatsDataset } from '@/lib/stats/compose';
import type { TrackedPosition } from '@/lib/stats/positions';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import { mean, median } from '@/lib/stats/medians';
import { rank } from '@/lib/stats/ranks';
import {
  getPositionSummaries,
  getTeamPositionalSummary,
  getTopPositionalAdvantages,
} from '@/lib/stats/positional-advantages';
import { colors } from '../../../../../brand/colors';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RidgePlot } from './components/RidgePlot';
import StartSitEfficiencyTab from '@/components/stats/StartSitEfficiencyTab';
import { TransactionAnalysis } from './components/TransactionAnalysis';
import { getRankColor } from './utils/getRankColor';
import { getPerformanceColor } from './utils/getPerformanceColor';
import { getTextColor } from './utils/getTextColor';
import { LeagueView } from './components/LeagueView';
import { ScheduleAnalysis } from './components/ScheduleAnalysis';

interface StatsContentProps {
  dataset: PlainStatsDataset;
  searchParams: {
    team?: string;
    view?: 'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit';
    week?: string;
  };
  leagues: Array<{ id: string; name: string; season: number }>;
}

export function StatsContent({ dataset, searchParams }: StatsContentProps) {
  console.log('[DEBUG] StatsContent: received dataset', {
    currentWeek: dataset.currentWeek,
    leagues: dataset.leagues?.length,
    teamsCount: dataset.teams?.length,
    weekRange: dataset.weekRange,
  });

  const teamsMap = useMemo(() => new Map(dataset.teams), [dataset.teams]);
  const allTeamEntries = useMemo(() => Array.from(teamsMap.entries()), [teamsMap]);

  console.log('[DEBUG] StatsContent: processed teams', {
    teamsMapSize: teamsMap.size,
    allTeamEntriesLength: allTeamEntries.length,
    firstTeam: allTeamEntries[0]?.[1]?.teamInfo?.teamName,
  });

  // Build team options for selector
  const teamOptions = useMemo(
    () =>
      allTeamEntries.map(([key, t]) => ({
        key,
        label: `${t.teamInfo.teamName} (${t.teamInfo.leagueName})`,
        team: t,
      })),
    [allTeamEntries]
  );

  console.log('[DEBUG] StatsContent: team options built', {
    optionsCount: teamOptions.length,
    firstOption: teamOptions[0]?.label,
    firstOptionKey: teamOptions[0]?.key,
  });

  const [selectedTeamKey, setSelectedTeamKey] = useState<string>(
    searchParams.team || teamOptions[0]?.key || ''
  );

  const [currentView, setCurrentView] = useState<
    'team' | 'league' | 'schedule' | 'trends' | 'scatter' | 'transactions' | 'start-sit'
  >(
    (searchParams.view as
      | 'team'
      | 'league'
      | 'schedule'
      | 'trends'
      | 'scatter'
      | 'transactions'
      | 'start-sit') || 'team'
  );

  const [selectedWeek, setSelectedWeek] = useState<string>(searchParams.week || 'season');

  // Track expanded player breakdown rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Available weeks for dropdown
  const availableWeeks = Array.from({ length: dataset.currentWeek }, (_, i) => i + 1).filter(
    week => {
      // Only include weeks that have some non-zero scores
      return allTeamEntries.some(([, t]) => t.teamScores.find(d => d.week === week && d.value > 0));
    }
  );

  console.log('[DEBUG] StatsContent: team selection', {
    selectedTeamKey,
    searchParamsTeam: searchParams.team,
    firstOptionKey: teamOptions[0]?.key,
  });

  const selectedTeam = teamOptions.find(opt => opt.key === selectedTeamKey);
  console.log('[DEBUG] StatsContent: selected team', {
    found: !!selectedTeam,
    teamName: selectedTeam?.team?.teamInfo?.teamName,
  });

  if (!selectedTeam) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='py-8'>
            <div className='text-center text-muted-foreground'>
              No teams available or selected team not found.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const t = selectedTeam.team;

  // Use weeks with actual data (non-zero scores)
  const validWeeks = t.teamScores.filter(d => d.value > 0).map(d => d.week);
  const fromWeek = Math.min(...validWeeks, dataset.weekRange.from);
  const toWeek = Math.max(...validWeeks, Math.min(dataset.weekRange.to, dataset.currentWeek - 1)); // Exclude current week if it's incomplete
  const weeks = Array.from({ length: toWeek - fromWeek + 1 }, (_, i) => fromWeek + i);
  const gamesPlayed = validWeeks.length;

  // Get positional data for this team
  const positionsMap = useMemo(() => new Map(dataset.positions), [dataset.positions]);
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

  // Season window totals
  const teamTotal = t.teamScores
    .filter(d => d.week >= fromWeek && d.week <= toWeek)
    .reduce((a, d) => a + d.value, 0);
  const oppTotal = t.opponentScores
    .filter(d => d.week >= fromWeek && d.week <= toWeek)
    .reduce((a, d) => a + d.value, 0);

  // Calculate league averages and ranks
  const leagueTotals = allTeamEntries.map(([, tt]) =>
    tt.teamScores
      .filter(d => d.week >= fromWeek && d.week <= toWeek)
      .reduce((a, d) => a + d.value, 0)
  );
  const seasonRanks24 = rank(leagueTotals);
  const teamIndex24 = allTeamEntries.findIndex(([k]) => k === selectedTeamKey);
  const seasonRank24 = seasonRanks24[teamIndex24] || 0;

  const leagueId = t.teamInfo.leagueId;
  const leagueTeamEntries = allTeamEntries.filter(([, tt]) => tt.teamInfo.leagueId === leagueId);
  const leagueSubset = leagueTeamEntries.map(([, tt]) =>
    tt.teamScores
      .filter(d => d.week >= fromWeek && d.week <= toWeek)
      .reduce((a, d) => a + d.value, 0)
  );
  const seasonRanksLeague = rank(leagueSubset);
  const teamIndexLeague = leagueTeamEntries.findIndex(([k]) => k === selectedTeamKey);
  const seasonRankLeague = seasonRanksLeague[teamIndexLeague] || 0;

  console.log('[DEBUG] Rankings for', t.teamInfo.teamName, {
    teamTotal,
    leagueTotalsLength: leagueTotals.length,
    leagueSubsetLength: leagueSubset.length,
    teamIndex24,
    teamIndexLeague,
    seasonRank24,
    seasonRankLeague,
    leagueTotalsSample: leagueTotals.slice(0, 5),
    leagueSubsetSample: leagueSubset.slice(0, 5),
  });

  const leagueAvgByWeek = weeks.map(week => {
    const vals = allTeamEntries.map(
      ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
    );
    return mean(vals);
  });
  const leagueMedByWeek = weeks.map(week => {
    const vals = allTeamEntries.map(
      ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
    );
    return median(vals);
  });

  // Calculate average opponent rank (strength of schedule)
  const oppRanks24ByWeek = weeks.map(week => {
    const oppVals = allTeamEntries.map(
      ([, tt]) => tt.opponentScores.find(d => d.week === week)?.value || 0
    );
    const oppRanks = rank(oppVals);
    const teamIdx = allTeamEntries.findIndex(([k]) => k === selectedTeamKey);
    return oppRanks[teamIdx] || 0;
  });
  const avgOppRank = mean(oppRanks24ByWeek.filter(r => r > 0));

  // Scatter Analysis Component
  function ScatterAnalysis() {
    return (
      <div className='space-y-8'>
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
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
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
                    type='number'
                    dataKey='pointsFor'
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
                    type='number'
                    dataKey='pointsAgainst'
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
                        .filter(x => x > 0)
                    )}
                    stroke='rgba(156, 163, 175, 0.8)'
                    strokeDasharray='5 5'
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
                        .filter(x => x > 0)
                    )}
                    stroke='rgba(156, 163, 175, 0.8)'
                    strokeDasharray='5 5'
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className='p-4 rounded-lg shadow-xl border min-w-[240px]'
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

                            <div className='space-y-3'>
                              <div>
                                <div className='flex items-center gap-2 mb-1'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{ backgroundColor: colors.rdylgn[8] }}
                                  ></div>
                                  <span className='font-medium'>Points Scored</span>
                                </div>
                                <div className='ml-5'>
                                  <div className='font-bold text-lg'>
                                    {data.pointsFor.toFixed(1)}/game
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    {data.totalFor.toFixed(1)} season total
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className='flex items-center gap-2 mb-1'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{ backgroundColor: colors.rdylgn[2] }}
                                  ></div>
                                  <span className='font-medium'>Points Allowed</span>
                                </div>
                                <div className='ml-5'>
                                  <div className='font-bold text-lg'>
                                    {data.pointsAgainst.toFixed(1)}/game
                                  </div>
                                  <div className='text-xs text-gray-400'>
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
                    dataKey='pointsFor'
                    shape={(props: any) => {
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
                              fill='white'
                              stroke={colors.core.regalGold}
                              strokeWidth={3}
                            />
                            <image
                              x={cx - 12}
                              y={cy - 12}
                              width={24}
                              height={24}
                              href={avatarUrl}
                              clipPath='circle(12px at 12px 12px)'
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
                              stroke='rgba(0,0,0,0.3)'
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy + 1}
                              textAnchor='middle'
                              fontSize='9'
                              fontWeight='bold'
                              fill='white'
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
                {position} Points For vs Points Against. Shows which teams excel at {position}{' '}
                offense vs defense.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
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
                                d => d.week === scoreData.week
                              );

                              if (opponentScore && opponentScore.value > 0) {
                                // Find the opponent team by looking for matching opponent score
                                for (const [oppKey, oppTeam] of allTeamEntries) {
                                  if (oppKey === teamKey) continue;
                                  const oppTeamScore = oppTeam.teamScores.find(
                                    d => d.week === scoreData.week
                                  );
                                  if (
                                    oppTeamScore &&
                                    Math.abs(oppTeamScore.value - opponentScore.value) < 0.01
                                  ) {
                                    // Found the opponent - get their position score that week
                                    const oppPosData = posTeamsMap.get(oppKey);
                                    const oppPosScore =
                                      oppPosData?.scores.find(d => d.week === scoreData.week)
                                        ?.value || 0;
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
                      type='number'
                      dataKey='pointsFor'
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
                      type='number'
                      dataKey='pointsAgainst'
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
                      stroke='#6b7280'
                      strokeDasharray='8 4'
                      strokeWidth={2}
                    />
                    <ReferenceLine
                      y={(() => {
                        const posData = positionsMap.get(position);
                        const posTeamsMap = new Map(posData?.teams || []);

                        // Use same calculation as chart data
                        const chartData = allTeamEntries
                          .map(([teamKey, team]) => {
                            const teamPosData = posTeamsMap.get(teamKey);

                            let posPointsAgainst = 0;
                            if (teamPosData) {
                              for (const scoreData of teamPosData.scores) {
                                if (scoreData.value === 0) continue;

                                const teamData = allTeamEntries.find(([k]) => k === teamKey)?.[1];
                                const opponentScore = teamData?.opponentScores.find(
                                  d => d.week === scoreData.week
                                );

                                if (opponentScore && opponentScore.value > 0) {
                                  for (const [oppKey, oppTeam] of allTeamEntries) {
                                    if (oppKey === teamKey) continue;
                                    const oppTeamScore = oppTeam.teamScores.find(
                                      d => d.week === scoreData.week
                                    );
                                    if (
                                      oppTeamScore &&
                                      Math.abs(oppTeamScore.value - opponentScore.value) < 0.01
                                    ) {
                                      const oppPosData = posTeamsMap.get(oppKey);
                                      const oppPosScore =
                                        oppPosData?.scores.find(d => d.week === scoreData.week)
                                          ?.value || 0;
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
                      stroke='#6b7280'
                      strokeDasharray='8 4'
                      strokeWidth={2}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className='p-4 rounded-lg shadow-xl border min-w-[280px]'
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

                              <div className='space-y-3'>
                                <div>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{ backgroundColor: colors.rdylgn[8] }}
                                    ></div>
                                    <span className='font-medium'>{position} Scored</span>
                                  </div>
                                  <div className='ml-5'>
                                    <div className='font-bold text-lg'>
                                      {data.pointsFor.toFixed(1)}/game
                                    </div>
                                    <div className='text-xs text-gray-400'>
                                      {data.totalFor.toFixed(1)} season total
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{ backgroundColor: colors.rdylgn[2] }}
                                    ></div>
                                    <span className='font-medium'>{position} Allowed</span>
                                  </div>
                                  <div className='ml-5'>
                                    <div className='font-bold text-lg'>
                                      {data.pointsAgainst.toFixed(1)}/game
                                    </div>
                                    <div className='text-xs text-gray-400'>
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
                      dataKey='pointsFor'
                      shape={(props: any) => {
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
                                fill='white'
                                stroke={colors.core.regalGold}
                                strokeWidth={2}
                              />
                              <image
                                x={cx - 10}
                                y={cy - 10}
                                width={20}
                                height={20}
                                href={avatarUrl}
                                clipPath='circle(10px at 10px 10px)'
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
                                stroke='rgba(0,0,0,0.3)'
                                strokeWidth={2}
                              />
                              <text
                                x={cx}
                                y={cy + 1}
                                textAnchor='middle'
                                fontSize='8'
                                fontWeight='bold'
                                fill='white'
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
  }

  // Performance Trends Component
  function TrendsView() {
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
                        teamInfo: any;
                        weeklyScores: number[];
                        weeklyRanks: number[];
                        trend: string;
                      }
                    >();

                    // Helper function to calculate z-scores
                    const calculateZScore = (values: number[]): number[] => {
                      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                      const stdDev = Math.sqrt(
                        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
                          values.length
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
                            weeklyScores.reduce((sum, score) => sum + score, 0) /
                            weeklyScores.length;

                          // Expected wins - how many wins this avg score would get vs all opponents
                          let expectedWins = 0;
                          for (let checkWeek = 1; checkWeek <= week; checkWeek++) {
                            const myScore =
                              t.teamScores.find(d => d.week === checkWeek)?.value || 0;
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
                            recentScores.reduce((sum, score) => sum + score, 0) /
                            recentScores.length;

                          return {
                            key,
                            teamInfo: t.teamInfo,
                            avgPoints,
                            expectedWins,
                            rolling3Avg,
                            weeklyScores: weeklyScores.length,
                          };
                        })
                        .filter(Boolean) as any[];

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
                                  formatter={(value, name) => [
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
              Track each team&apos;s ranking progression week by week. Green = top performance, Red
              = bottom performance.
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
                        teamInfo: any;
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
                    weeklyRankings.forEach((data, teamKey) => {
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
                                  formatter={(value, name) => [
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
                      {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(
                        week => (
                          <th
                            key={week}
                            className='px-3 py-3 text-center font-semibold min-w-[50px]'
                            style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                          >
                            W{week}
                          </th>
                        )
                      )}
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
                          teamInfo: any;
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

                        // Debug missing defense scores
                        if (position === 'DEF' && week === 1) {
                          console.log(`[DEBUG] ${position} Week ${week}:`, {
                            posDataExists: !!posData,
                            teamsCount: posTeamsMap.size,
                            totalTeamsInLeague: allTeamEntries.length,
                            weekTeamsWithScores: weekTeams.length,
                            teamsWithoutScores: allTeamEntries.length - weekTeams.length,
                            sampleScores: weekTeams
                              .slice(0, 3)
                              .map(t => ({ team: t.teamInfo.teamName, score: t.weekScore })),
                            missingTeams: allTeamEntries
                              .filter(([key]) => !weekTeams.find(wt => wt.key === key))
                              .slice(0, 5)
                              .map(([key, t]) => ({
                                team: t.teamInfo.teamName,
                                hasPositionData: posTeamsMap.has(key),
                                weekScore:
                                  posTeamsMap.get(key)?.scores.find(d => d.week === week)?.value ||
                                  'NO_DATA',
                              })),
                          });
                        }

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
                      positionRankings.forEach((data, teamKey) => {
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
                        const aSeasonTotal = a[1].weeklyScores.reduce(
                          (sum, score) => sum + score,
                          0
                        );
                        const bSeasonTotal = b[1].weeklyScores.reduce(
                          (sum, score) => sum + score,
                          0
                        );
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
                                    formatter={(value, name) => [
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
                                      <span className='font-semibold'>
                                        {data.median.toFixed(1)}
                                      </span>
                                    </div>
                                    <div>
                                      Mean:{' '}
                                      <span className='font-semibold'>{data.mean.toFixed(1)}</span>
                                    </div>
                                    <div>
                                      Std Dev:{' '}
                                      <span className='font-semibold'>
                                        {data.stdDev.toFixed(1)}
                                      </span>
                                    </div>
                                    <div>
                                      Games:{' '}
                                      <span className='font-semibold'>{data.gamesPlayed}</span>
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
                          .map(([teamKey, team]) => {
                            const teamPosData = posTeamsMap.get(teamKey);
                            const weeklyPosScores =
                              teamPosData?.scores.filter(d => d.value !== 0).map(d => d.value) ||
                              [];
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

                        const consistencyValues = data.map(d => d.consistency);
                        const minConsistency = Math.min(...consistencyValues);
                        const maxConsistency = Math.max(...consistencyValues);

                        return data.map((team, index) => {
                          // Normalize consistency score to 0-1 for color mapping
                          const normalized =
                            maxConsistency === minConsistency
                              ? 0.5
                              : (team.consistency - minConsistency) /
                                (maxConsistency - minConsistency);

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
                    <span className='font-semibold'>📊 Average {position}:</span> Some volatility
                    but generally predictable.
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
                  .sort((a, b) => b!.median - a!.median) as any[];

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
                      console.warn('Invalid xDomain calculated, using fallback', xDomain);
                      xDomain = [80, 180]; // More reasonable fallback for fantasy scores
                    } else {
                      // Add 5% buffer to prevent bleeding over axis range
                      const domainRange = xDomain[1] - xDomain[0];
                      const buffer = domainRange * 0.05;
                      xDomain[0] -= buffer;
                      xDomain[1] += buffer;
                    }
                  } else {
                    console.warn('No valid ridge data for team chart');
                  }
                } else {
                  console.warn('Empty ridge data for team chart');
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
                  <span className='font-semibold'>🌊 Wide Ridge:</span> Flat, spread curve =
                  volatile performance with high variance.
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
                    .sort((a, b) => b!.median - a!.median) as any[];

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
                        console.warn('Invalid posXDomain calculated, using fallback');
                        posXDomain = [0, 50];
                      } else {
                        // Add 5% buffer to prevent bleeding over axis range
                        const posDomainRange = posXDomain[1] - posXDomain[0];
                        const posBuffer = posDomainRange * 0.05;
                        posXDomain[0] -= posBuffer;
                        posXDomain[1] += posBuffer;
                      }
                    } else {
                      console.warn('No valid ridge data for positional chart:', position);
                    }
                  } else {
                    console.warn('Empty ridge data for positional chart:', position);
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

  return (
    <div className='space-y-6'>
      <Tabs
        value={currentView}
        onValueChange={v =>
          setCurrentView(
            v as
              | 'team'
              | 'league'
              | 'schedule'
              | 'trends'
              | 'scatter'
              | 'transactions'
              | 'start-sit'
          )
        }
      >
        <TabsList>
          <TabsTrigger value='team'>Team Analysis</TabsTrigger>
          <TabsTrigger value='league'>League View</TabsTrigger>
          <TabsTrigger value='schedule'>Schedule Analysis</TabsTrigger>
          <TabsTrigger value='trends'>Performance Trends</TabsTrigger>
          <TabsTrigger value='scatter'>Scatter Analysis</TabsTrigger>
          <TabsTrigger value='transactions'>Transaction Analysis</TabsTrigger>
          <TabsTrigger value='start-sit'>Start/Sit Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value='team'>
          <Card>
            <CardHeader>
              <CardTitle>Team Analysis</CardTitle>
              <CardDescription>
                Season totals and weekly breakdown for individual teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-6 flex items-center gap-3'>
                <label className='text-sm font-medium'>Select Team</label>
                <Select value={selectedTeamKey} onValueChange={setSelectedTeamKey}>
                  <SelectTrigger className='w-80'>
                    <SelectValue placeholder='Select team' />
                  </SelectTrigger>
                  <SelectContent>
                    {teamOptions.map(opt => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-6'>
                {/* Season Summary */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Season Summary (Weeks {fromWeek}-{toWeek})
                  </h3>
                  <div className='rounded-md border'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/50'>
                        <tr>
                          <th className='px-4 py-3 text-left'>Metric</th>
                          <th className='px-4 py-3 text-right'>Team</th>
                          <th className='px-4 py-3 text-right'>Opponent</th>
                          <th className='px-4 py-3 text-right'>League Avg</th>
                          <th className='px-4 py-3 text-right'>League Median</th>
                          <th className='px-4 py-3 text-center'>Rank (24)</th>
                          <th className='px-4 py-3 text-center'>Rank (League)</th>
                          <th className='px-4 py-3 text-center'>Avg Opp Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='px-4 py-3 font-medium'>Total Points</td>
                          <td
                            className='px-4 py-3 text-right font-mono font-bold'
                            style={{ color: colors.core.regalGold }}
                          >
                            {teamTotal.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>{oppTotal.toFixed(1)}</td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {mean(leagueTotals).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {median(leagueTotals).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRank24, 24),
                                color: getTextColor(getRankColor(seasonRank24, 24)),
                              }}
                            >
                              {seasonRank24}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRankLeague, 12),
                                color: getTextColor(getRankColor(seasonRankLeague, 12)),
                              }}
                            >
                              {seasonRankLeague}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(Math.round(avgOppRank), 24),
                                color: getTextColor(getRankColor(Math.round(avgOppRank), 24)),
                              }}
                              title={`Average opponent rank: ${avgOppRank.toFixed(1)} (lower = tougher schedule)`}
                            >
                              {avgOppRank.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                        <tr className='border-t'>
                          <td className='px-4 py-3 font-medium'>Point Differential</td>
                          <td
                            className='px-4 py-3 text-right font-mono font-bold'
                            style={{
                              color: getPerformanceColor(
                                teamTotal - oppTotal,
                                teamTotal - oppTotal > 0
                              ),
                            }}
                          >
                            {teamTotal - oppTotal > 0 ? '+' : ''}
                            {(teamTotal - oppTotal).toFixed(1)}
                          </td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                          <td className='px-4 py-3'></td>
                        </tr>
                        <tr className='border-t bg-muted/20'>
                          <td className='px-4 py-3 font-medium'>Weekly Average</td>
                          <td
                            className='px-4 py-3 text-right font-mono font-bold'
                            style={{ color: colors.core.regalGold }}
                          >
                            {gamesPlayed > 0 ? (teamTotal / gamesPlayed).toFixed(1) : '0.0'}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {gamesPlayed > 0 ? (oppTotal / gamesPlayed).toFixed(1) : '0.0'}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {mean(leagueAvgByWeek).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-right font-mono'>
                            {mean(leagueMedByWeek).toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRank24, 24),
                                color: getTextColor(getRankColor(seasonRank24, 24)),
                              }}
                            >
                              {seasonRank24}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(seasonRankLeague, 12),
                                color: getTextColor(getRankColor(seasonRankLeague, 12)),
                              }}
                            >
                              {seasonRankLeague}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span
                              className='rounded-full px-2 py-1 text-xs font-medium'
                              style={{
                                backgroundColor: getRankColor(Math.round(avgOppRank), 24),
                                color: getTextColor(getRankColor(Math.round(avgOppRank), 24)),
                              }}
                              title={`Average opponent rank: ${avgOppRank.toFixed(1)} (lower = tougher schedule)`}
                            >
                              {avgOppRank.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Weekly Breakdown */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Weekly Breakdown
                  </h3>
                  <div className='rounded-md border'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/50'>
                        <tr>
                          <th className='px-4 py-3 text-left'>Week</th>
                          <th className='px-4 py-3 text-right'>Team</th>
                          <th className='px-4 py-3 text-center'>Rank (24)</th>
                          <th className='px-4 py-3 text-center'>Rank (League)</th>
                          <th className='px-4 py-3 text-right'>Opponent</th>
                          <th className='px-4 py-3 text-center'>Opp Rank (24)</th>
                          <th className='px-4 py-3 text-center'>Opp Rank (League)</th>
                          <th className='px-4 py-3 text-right'>vs League Avg</th>
                          <th className='px-4 py-3 text-right'>vs League Median</th>
                          <th className='px-4 py-3 text-center'>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeks.map(week => {
                          const myTeam = t.teamScores.find(d => d.week === week)?.value || 0;
                          const myOpp = t.opponentScores.find(d => d.week === week)?.value || 0;
                          const vals = allTeamEntries.map(
                            ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
                          );
                          const ranks24 = rank(vals);
                          const teamIndex24Weekly = allTeamEntries.findIndex(
                            ([k]) => k === selectedTeamKey
                          );
                          const rank24 = ranks24[teamIndex24Weekly] || 0;

                          const leagueEntriesWeek = allTeamEntries.filter(
                            ([, tt]) => tt.teamInfo.leagueId === leagueId
                          );
                          const valsLeague = leagueEntriesWeek.map(
                            ([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0
                          );
                          const ranksLeague = rank(valsLeague);
                          const teamIndexLeagueWeekly = leagueEntriesWeek.findIndex(
                            ([k]) => k === selectedTeamKey
                          );
                          const rankLeague = ranksLeague[teamIndexLeagueWeekly] || 0;

                          // Calculate opponent ranks
                          const oppVals = allTeamEntries.map(
                            ([, tt]) => tt.opponentScores.find(d => d.week === week)?.value || 0
                          );
                          const oppRanks24 = rank(oppVals);
                          const oppRank24 = oppRanks24[teamIndex24Weekly] || 0;

                          const oppValsLeague = leagueEntriesWeek.map(
                            ([, tt]) => tt.opponentScores.find(d => d.week === week)?.value || 0
                          );
                          const oppRanksLeague = rank(oppValsLeague);
                          const oppRankLeague = oppRanksLeague[teamIndexLeagueWeekly] || 0;

                          // Debug weekly ranking for first week only
                          if (week === fromWeek) {
                            console.log(
                              `[DEBUG] Week ${week} rankings for ${t.teamInfo.teamName}`,
                              {
                                myTeam,
                                myOpp,
                                valsLength: vals.length,
                                valsLeagueLength: valsLeague.length,
                                teamIndex24Weekly,
                                teamIndexLeagueWeekly,
                                rank24,
                                rankLeague,
                                oppRank24,
                                oppRankLeague,
                                valsSample: vals.slice(0, 5),
                                valsLeagueSample: valsLeague.slice(0, 5),
                              }
                            );
                          }
                          const won = myTeam > myOpp;
                          const weekIdx = week - fromWeek;
                          const vsAvg = myTeam - (leagueAvgByWeek[weekIdx] || 0);
                          const vsMedian = myTeam - (leagueMedByWeek[weekIdx] || 0);

                          if (myTeam === 0) return null; // Skip weeks with no data

                          return (
                            <tr key={week} className='border-t hover:bg-muted/20'>
                              <td className='px-4 py-3 font-medium'>Week {week}</td>
                              <td
                                className='px-4 py-3 text-right font-mono font-bold'
                                style={{ color: colors.core.regalGold }}
                              >
                                {myTeam.toFixed(1)}
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(rank24, 24),
                                    color: getTextColor(getRankColor(rank24, 24)),
                                  }}
                                >
                                  {rank24}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(rankLeague, 12),
                                    color: getTextColor(getRankColor(rankLeague, 12)),
                                  }}
                                >
                                  {rankLeague}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-right font-mono'>{myOpp.toFixed(1)}</td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(oppRank24, 24),
                                    color: getTextColor(getRankColor(oppRank24, 24)),
                                  }}
                                  title={`Opponent ranked ${oppRank24} of 24 teams`}
                                >
                                  {oppRank24}
                                </span>
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className='rounded-full px-2 py-1 text-xs font-medium'
                                  style={{
                                    backgroundColor: getRankColor(oppRankLeague, 12),
                                    color: getTextColor(getRankColor(oppRankLeague, 12)),
                                  }}
                                  title={`Opponent ranked ${oppRankLeague} of 12 in league`}
                                >
                                  {oppRankLeague}
                                </span>
                              </td>
                              <td
                                className='px-4 py-3 text-right font-mono text-xs'
                                style={{ color: getPerformanceColor(vsAvg, vsAvg > 0) }}
                              >
                                {vsAvg > 0 ? '+' : ''}
                                {vsAvg.toFixed(1)}
                              </td>
                              <td
                                className='px-4 py-3 text-right font-mono text-xs'
                                style={{ color: getPerformanceColor(vsMedian, vsMedian > 0) }}
                              >
                                {vsMedian > 0 ? '+' : ''}
                                {vsMedian.toFixed(1)}
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-bold text-white ${
                                    won ? 'bg-green-600' : 'bg-red-600'
                                  }`}
                                >
                                  {won ? 'W' : 'L'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Position Breakdowns */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Position Breakdowns
                  </h3>
                  <div className='space-y-4'>
                    {positions.map(position => {
                      const posData = positionsMap.get(position);
                      const posTeamsMap = new Map(posData?.teams || []);
                      const teamPosData = posTeamsMap.get(selectedTeamKey);

                      if (!teamPosData) {
                        return (
                          <div key={position} className='rounded-md border p-4'>
                            <h4 className='mb-2 font-semibold'>{position}</h4>
                            <div className='text-sm text-muted-foreground'>No data available</div>
                          </div>
                        );
                      }

                      // Calculate season totals for this position
                      const posSeasonTotal = teamPosData.scores
                        .filter(d => d.week >= fromWeek && d.week <= toWeek)
                        .reduce((a, d) => a + d.value, 0);
                      const posValidWeeks = teamPosData.scores.filter(
                        d => d.week >= fromWeek && d.week <= toWeek && d.value > 0
                      );
                      const posGamesPlayed = posValidWeeks.length;

                      // Calculate league averages and ranks for this position
                      const allPosTeams = Array.from(posTeamsMap.values());
                      const allPosTotals = allPosTeams.map(pt =>
                        pt.scores
                          .filter(d => d.week >= fromWeek && d.week <= toWeek)
                          .reduce((a, d) => a + d.value, 0)
                      );
                      const posRanks24 = rank(allPosTotals);
                      const posRank24 =
                        posRanks24[
                          allPosTeams.findIndex(
                            pt =>
                              pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                              pt.teamInfo.rosterId === t.teamInfo.rosterId
                          )
                        ] || 0;

                      const leaguePosTeams = allPosTeams.filter(
                        pt => pt.teamInfo.leagueId === leagueId
                      );
                      const leagePosTotals = leaguePosTeams.map(pt =>
                        pt.scores
                          .filter(d => d.week >= fromWeek && d.week <= toWeek)
                          .reduce((a, d) => a + d.value, 0)
                      );
                      const posRanksLeague = rank(leagePosTotals);
                      const posRankLeague =
                        posRanksLeague[
                          leaguePosTeams.findIndex(
                            pt =>
                              pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                              pt.teamInfo.rosterId === t.teamInfo.rosterId
                          )
                        ] || 0;

                      const posLeagueAvg = mean(allPosTotals);
                      const posLeagueMedian = median(allPosTotals);

                      // Calculate opponent positional data by finding opponents from team weekly data
                      const myWeeklyOpponentData = weeks.map(week => {
                        const weeklyTeamEntry = allTeamEntries.find(([k]) => k === selectedTeamKey);
                        const myOppData = weeklyTeamEntry?.[1].opponentScores.find(
                          d => d.week === week
                        );

                        // Find opponent by matching scores in reverse (my opponent = who scored my opponent points)
                        const opponentEntry = allTeamEntries.find(([k, tt]) => {
                          const theirScore = tt.teamScores.find(d => d.week === week)?.value;
                          return (
                            k !== selectedTeamKey &&
                            Math.abs((theirScore || 0) - (myOppData?.value || 0)) < 0.01
                          );
                        });

                        const opponentPosData = opponentEntry
                          ? posTeamsMap.get(opponentEntry[0])
                          : null;
                        const oppPosScore =
                          opponentPosData?.scores.find(d => d.week === week)?.value || 0;

                        return { week, oppPosScore, opponentKey: opponentEntry?.[0] };
                      });

                      const oppPosSeasonTotal = myWeeklyOpponentData.reduce(
                        (a, d) => a + d.oppPosScore,
                        0
                      );

                      // Calculate opponent positional ranks
                      const oppPosRank24 = myWeeklyOpponentData[0]?.opponentKey
                        ? posRanks24[
                            allPosTeams.findIndex(pt => {
                              const oppKey = myWeeklyOpponentData[0].opponentKey;
                              return (
                                oppKey &&
                                pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                pt.teamInfo.rosterId === parseInt(oppKey.split('-')[1])
                              );
                            })
                          ] || 0
                        : 0;

                      const oppPosRankLeague = myWeeklyOpponentData[0]?.opponentKey
                        ? posRanksLeague[
                            leaguePosTeams.findIndex(pt => {
                              const oppKey = myWeeklyOpponentData[0].opponentKey;
                              return (
                                oppKey &&
                                pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                pt.teamInfo.rosterId === parseInt(oppKey.split('-')[1])
                              );
                            })
                          ] || 0
                        : 0;

                      return (
                        <div key={position} className='rounded-md border'>
                          <div
                            className='px-4 py-2'
                            style={{ backgroundColor: colors.core.charcoalSteel }}
                          >
                            <h4 className='font-semibold text-white'>{position}</h4>
                          </div>

                          {/* Position Season Summary */}
                          <div className='p-4'>
                            <div className='mb-4 rounded-md border'>
                              <table className='w-full text-sm'>
                                <thead className='bg-muted/20'>
                                  <tr>
                                    <th className='px-3 py-2 text-left'>Season Total</th>
                                    <th className='px-3 py-2 text-right'>Team</th>
                                    <th className='px-3 py-2 text-center'>Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Rank (League)</th>
                                    <th className='px-3 py-2 text-right'>Opponent</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (League)</th>
                                    <th className='px-3 py-2 text-right'>League Avg</th>
                                    <th className='px-3 py-2 text-right'>League Median</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className='px-3 py-2 font-medium'>
                                      Weeks {fromWeek}-{toWeek}
                                    </td>
                                    <td
                                      className='px-3 py-2 text-right font-mono font-bold'
                                      style={{ color: colors.core.regalGold }}
                                    >
                                      {posSeasonTotal.toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRank24, 24),
                                          color: getTextColor(getRankColor(posRank24, 24)),
                                        }}
                                      >
                                        {posRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRankLeague, 12),
                                          color: getTextColor(getRankColor(posRankLeague, 12)),
                                        }}
                                      >
                                        {posRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {oppPosSeasonTotal.toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRank24, 24),
                                          color: getTextColor(getRankColor(oppPosRank24, 24)),
                                        }}
                                      >
                                        {oppPosRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRankLeague, 12),
                                          color: getTextColor(getRankColor(oppPosRankLeague, 12)),
                                        }}
                                      >
                                        {oppPosRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {posLeagueAvg.toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {posLeagueMedian.toFixed(1)}
                                    </td>
                                  </tr>
                                  <tr className='border-t bg-muted/20'>
                                    <td className='px-3 py-2 font-medium'>Weekly Average</td>
                                    <td
                                      className='px-3 py-2 text-right font-mono font-bold'
                                      style={{ color: colors.core.regalGold }}
                                    >
                                      {posGamesPlayed > 0
                                        ? (posSeasonTotal / posGamesPlayed).toFixed(1)
                                        : '0.0'}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRank24, 24),
                                          color: getTextColor(getRankColor(posRank24, 24)),
                                        }}
                                      >
                                        {posRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(posRankLeague, 12),
                                          color: getTextColor(getRankColor(posRankLeague, 12)),
                                        }}
                                      >
                                        {posRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {posGamesPlayed > 0
                                        ? (oppPosSeasonTotal / posGamesPlayed).toFixed(1)
                                        : '0.0'}
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRank24, 24),
                                          color: getTextColor(getRankColor(oppPosRank24, 24)),
                                        }}
                                      >
                                        {oppPosRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(oppPosRankLeague, 12),
                                          color: getTextColor(getRankColor(oppPosRankLeague, 12)),
                                        }}
                                      >
                                        {oppPosRankLeague}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {(posLeagueAvg / weeks.length).toFixed(1)}
                                    </td>
                                    <td className='px-3 py-2 text-right font-mono'>
                                      {(posLeagueMedian / weeks.length).toFixed(1)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Position Weekly Breakdown */}
                            <div className='max-h-48 overflow-auto rounded-md border'>
                              <table className='w-full text-sm'>
                                <thead className='bg-muted/20 sticky top-0'>
                                  <tr>
                                    <th className='px-3 py-2 text-left'>Week</th>
                                    <th className='px-3 py-2 text-right'>Team</th>
                                    <th className='px-3 py-2 text-center'>Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Rank (Lg)</th>
                                    <th className='px-3 py-2 text-right'>Opponent</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (24)</th>
                                    <th className='px-3 py-2 text-center'>Opp Rank (Lg)</th>
                                    <th className='px-3 py-2 text-right'>vs Avg</th>
                                    <th className='px-3 py-2 text-right'>vs Median</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {weeks.flatMap(week => {
                                    const myPosPoints =
                                      teamPosData.scores.find(d => d.week === week)?.value || 0;

                                    if (myPosPoints === 0) return [];

                                    const rowKey = `${position}-${week}`;
                                    const isExpanded = expandedRows.has(rowKey);

                                    // Get opponent positional data for this week
                                    const oppWeekData = myWeeklyOpponentData.find(
                                      d => d.week === week
                                    );
                                    const oppPosPoints = oppWeekData?.oppPosScore || 0;

                                    // Calculate weekly ranks for this position
                                    const allWeeklyPosVals = allPosTeams.map(
                                      pt => pt.scores.find(d => d.week === week)?.value || 0
                                    );
                                    const weeklyPosRanks24 = rank(allWeeklyPosVals);
                                    const weeklyPosRank24 =
                                      weeklyPosRanks24[
                                        allPosTeams.findIndex(
                                          pt =>
                                            pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                                            pt.teamInfo.rosterId === t.teamInfo.rosterId
                                        )
                                      ] || 0;

                                    const leagueWeeklyPosVals = leaguePosTeams.map(
                                      pt => pt.scores.find(d => d.week === week)?.value || 0
                                    );
                                    const weeklyPosRanksLeague = rank(leagueWeeklyPosVals);
                                    const weeklyPosRankLeague =
                                      weeklyPosRanksLeague[
                                        leaguePosTeams.findIndex(
                                          pt =>
                                            pt.teamInfo.leagueId === t.teamInfo.leagueId &&
                                            pt.teamInfo.rosterId === t.teamInfo.rosterId
                                        )
                                      ] || 0;

                                    // Calculate opponent weekly ranks
                                    const oppWeeklyPosRank24 = oppWeekData?.opponentKey
                                      ? weeklyPosRanks24[
                                          allPosTeams.findIndex(pt => {
                                            const oppKey = oppWeekData.opponentKey;
                                            return (
                                              oppKey &&
                                              pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                              pt.teamInfo.rosterId ===
                                                parseInt(oppKey.split('-')[1])
                                            );
                                          })
                                        ] || 0
                                      : 0;

                                    const oppWeeklyPosRankLeague = oppWeekData?.opponentKey
                                      ? weeklyPosRanksLeague[
                                          leaguePosTeams.findIndex(pt => {
                                            const oppKey = oppWeekData.opponentKey;
                                            return (
                                              oppKey &&
                                              pt.teamInfo.leagueId === oppKey.split('-')[0] &&
                                              pt.teamInfo.rosterId ===
                                                parseInt(oppKey.split('-')[1])
                                            );
                                          })
                                        ] || 0
                                      : 0;

                                    const weeklyPosAvg = mean(allWeeklyPosVals);
                                    const weeklyPosMedian = median(allWeeklyPosVals);
                                    const vsAvg = myPosPoints - weeklyPosAvg;
                                    const vsMedian = myPosPoints - weeklyPosMedian;

                                    const rows = [];

                                    // Main data row
                                    rows.push(
                                      <tr
                                        key={week}
                                        className='border-t hover:bg-muted/10 cursor-pointer'
                                        onClick={() => {
                                          const newExpanded = new Set(expandedRows);
                                          if (isExpanded) {
                                            newExpanded.delete(rowKey);
                                          } else {
                                            newExpanded.add(rowKey);
                                          }
                                          setExpandedRows(newExpanded);
                                        }}
                                      >
                                        <td className='px-3 py-2 font-medium'>
                                          <div className='flex items-center gap-1'>
                                            Week {week}
                                            <span className='text-xs text-muted-foreground'>
                                              {isExpanded ? '▼' : '▶'}
                                            </span>
                                          </div>
                                        </td>
                                        <td
                                          className='px-3 py-2 text-right font-mono font-bold'
                                          style={{ color: colors.core.regalGold }}
                                        >
                                          {myPosPoints.toFixed(1)}
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(weeklyPosRank24, 24),
                                              color: getTextColor(
                                                getRankColor(weeklyPosRank24, 24)
                                              ),
                                            }}
                                          >
                                            {weeklyPosRank24}
                                          </span>
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(
                                                weeklyPosRankLeague,
                                                12
                                              ),
                                              color: getTextColor(
                                                getRankColor(weeklyPosRankLeague, 12)
                                              ),
                                            }}
                                          >
                                            {weeklyPosRankLeague}
                                          </span>
                                        </td>
                                        <td className='px-3 py-2 text-right font-mono'>
                                          {oppPosPoints.toFixed(1)}
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(oppWeeklyPosRank24, 24),
                                              color: getTextColor(
                                                getRankColor(oppWeeklyPosRank24, 24)
                                              ),
                                            }}
                                            title={`Opponent ${position} ranked ${oppWeeklyPosRank24} of 24 teams`}
                                          >
                                            {oppWeeklyPosRank24}
                                          </span>
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                          <span
                                            className='rounded-full px-2 py-1 text-xs font-medium'
                                            style={{
                                              backgroundColor: getRankColor(
                                                oppWeeklyPosRankLeague,
                                                12
                                              ),
                                              color: getTextColor(
                                                getRankColor(oppWeeklyPosRankLeague, 12)
                                              ),
                                            }}
                                            title={`Opponent ${position} ranked ${oppWeeklyPosRankLeague} of 12 in league`}
                                          >
                                            {oppWeeklyPosRankLeague}
                                          </span>
                                        </td>
                                        <td
                                          className='px-3 py-2 text-right font-mono text-xs'
                                          style={{ color: getPerformanceColor(vsAvg, vsAvg > 0) }}
                                        >
                                          {vsAvg > 0 ? '+' : ''}
                                          {vsAvg.toFixed(1)}
                                        </td>
                                        <td
                                          className='px-3 py-2 text-right font-mono text-xs'
                                          style={{
                                            color: getPerformanceColor(vsMedian, vsMedian > 0),
                                          }}
                                        >
                                          {vsMedian > 0 ? '+' : ''}
                                          {vsMedian.toFixed(1)}
                                        </td>
                                      </tr>
                                    );

                                    // Player breakdown row (if expanded)
                                    if (isExpanded) {
                                      const weekPlayerData =
                                        dataset.weeklyPlayerData[week]?.[selectedTeamKey];
                                      const playersForPosition =
                                        weekPlayerData?.positions[position] || [];

                                      rows.push(
                                        <tr key={`${week}-breakdown`} className='bg-muted/5'>
                                          <td colSpan={9} className='p-0'>
                                            <PlayerBreakdownRow
                                              players={playersForPosition}
                                              position={position}
                                            />
                                          </td>
                                        </tr>
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
                </div>

                {/* Team Positional Advantages */}
                <div>
                  <h3
                    className='mb-3 text-lg font-semibold'
                    style={{ color: colors.core.crimsonRed }}
                  >
                    Positional Advantages vs League Median
                  </h3>
                  {(() => {
                    const teamSummary = getTeamPositionalSummary(dataset, selectedTeamKey, {
                      from: fromWeek,
                      to: toWeek,
                    });

                    if (!teamSummary) {
                      return (
                        <div className='rounded-md border p-4'>
                          <div className='text-sm text-muted-foreground'>
                            No positional data available
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className='rounded-md border'>
                        <table className='w-full text-sm'>
                          <thead className='bg-muted/50'>
                            <tr>
                              <th className='px-4 py-3 text-left'>Position</th>
                              <th className='px-4 py-3 text-right'>Weekly Avg</th>
                              <th className='px-4 py-3 text-right'>League Median</th>
                              <th className='px-4 py-3 text-right'>Advantage/Disadvantage</th>
                              <th className='px-4 py-3 text-right'>% Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(
                              Object.entries(teamSummary.positions) as Array<[TrackedPosition, any]>
                            ).map(([position, posData]) => {
                              const isAdvantage = posData.advantage > 0;
                              const advantageColor =
                                posData.advantage === 0
                                  ? colors.rdylgn[5]
                                  : isAdvantage
                                    ? colors.rdylgn[8]
                                    : colors.rdylgn[2];

                              return (
                                <tr key={position} className='border-t'>
                                  <td className='px-4 py-3 font-medium'>{position}</td>
                                  <td
                                    className='px-4 py-3 text-right font-mono font-bold'
                                    style={{ color: colors.core.regalGold }}
                                  >
                                    {posData.weeklyAverage.toFixed(1)}
                                  </td>
                                  <td className='px-4 py-3 text-right font-mono'>
                                    {posData.leagueMedian.toFixed(1)}
                                  </td>
                                  <td
                                    className='px-4 py-3 text-right font-mono font-bold'
                                    style={{ color: advantageColor }}
                                  >
                                    {posData.advantage > 0 ? '+' : ''}
                                    {posData.advantage.toFixed(1)}
                                  </td>
                                  <td
                                    className='px-4 py-3 text-right font-mono font-bold'
                                    style={{ color: advantageColor }}
                                  >
                                    {posData.percentageAdvantage > 0 ? '+' : ''}
                                    {posData.percentageAdvantage.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className='border-t-2 bg-muted/20'>
                              <td className='px-4 py-3 font-bold'>Total Advantage</td>
                              <td className='px-4 py-3'></td>
                              <td className='px-4 py-3'></td>
                              <td
                                className='px-4 py-3 text-right font-mono font-bold'
                                style={{
                                  color:
                                    teamSummary.totalAdvantage > 0
                                      ? colors.rdylgn[8]
                                      : teamSummary.totalAdvantage < 0
                                        ? colors.rdylgn[2]
                                        : colors.rdylgn[5],
                                }}
                              >
                                {teamSummary.totalAdvantage > 0 ? '+' : ''}
                                {teamSummary.totalAdvantage.toFixed(1)}
                              </td>
                              <td
                                className='px-4 py-3 text-right font-mono font-bold'
                                style={{
                                  color:
                                    teamSummary.averageAdvantage > 0
                                      ? colors.rdylgn[8]
                                      : teamSummary.averageAdvantage < 0
                                        ? colors.rdylgn[2]
                                        : colors.rdylgn[5],
                                }}
                              >
                                Avg: {teamSummary.averageAdvantage > 0 ? '+' : ''}
                                {teamSummary.averageAdvantage.toFixed(1)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='league'>
          <LeagueView
            selectedWeek={selectedWeek}
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            setSelectedWeek={setSelectedWeek}
            availableWeeks={availableWeeks}
            dataset={dataset}
            fromWeek={fromWeek}
            toWeek={toWeek}
          />
        </TabsContent>

        <TabsContent value='schedule'>
          <ScheduleAnalysis allTeamEntries={allTeamEntries} dataset={dataset} />
        </TabsContent>

        <TabsContent value='trends'>
          <TrendsView />
        </TabsContent>

        <TabsContent value='scatter'>
          <ScatterAnalysis />
        </TabsContent>

        <TabsContent value='transactions'>
          <TransactionAnalysis key='transaction-analysis' />
        </TabsContent>

        <TabsContent value='start-sit'>
          <StartSitEfficiencyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
