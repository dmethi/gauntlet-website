'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlainStatsDataset } from '@/lib/stats/compose';
import type { TrackedPosition } from '@/lib/stats/positions';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import { mean, median } from '@/lib/stats/medians';
import { rank } from '@/lib/stats/ranks';
import { colors } from '../../../../../brand/colors';
import * as d3 from 'd3';
import {
  Bar,
  BarChart,
  Cell,
  Customized,
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

interface StatsContentProps {
  dataset: PlainStatsDataset;
  searchParams: {
    team?: string;
    view?: 'team' | 'league' | 'schedule';
    week?: string;
  };
  leagues: Array<{ id: string; name: string; season: number }>;
}

// Helper functions for RdYlGn color mapping

function getPerformanceColor(value: number, isPositive: boolean): string {
  if (value === 0) return colors.rdylgn[5]; // neutral
  return isPositive ? colors.rdylgn[8] : colors.rdylgn[2]; // green or red
}

function getRankColor(rank: number, total: number): string {
  const percentile = (total - rank + 1) / total;
  if (percentile >= 0.9) return colors.rdylgn[9]; // top 10% - dark green
  if (percentile >= 0.75) return colors.rdylgn[8]; // top 25% - green
  if (percentile >= 0.5) return colors.rdylgn[7]; // top 50% - light green
  if (percentile >= 0.25) return colors.rdylgn[5]; // middle 50% - yellow
  if (percentile >= 0.1) return colors.rdylgn[3]; // bottom 25% - orange
  return colors.rdylgn[1]; // bottom 10% - red
}

function getTextColor(backgroundColor: string): string {
  // Determine if text should be white or black based on background brightness
  // For yellow/orange colors, use black text. For green/red, use white text.
  const lightColors = [colors.rdylgn[3], colors.rdylgn[4], colors.rdylgn[5], colors.rdylgn[6]]; // orange and yellow range
  return lightColors.includes(backgroundColor) ? '#000000' : '#ffffff';
}

// D3-based Ridge Plot Component
interface RidgePlotProps {
  data: any[];
  domain: [number, number];
  height: number;
  title?: string;
}

function D3RidgePlot({ data, domain, height, title }: RidgePlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTeam, setHoveredTeam] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(800);

  // Monitor container width for responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Chart dimensions - responsive width
    const margin = { top: 20, right: 30, bottom: 60, left: 150 };
    const width = containerWidth - margin.left - margin.right;

    // Calculate height based on number of ridges to prevent bleeding
    const ridgeHeight = 25;
    const ridgeGap = 28;

    // For positional charts, use smaller dimensions and tighter spacing
    const isPositional =
      title?.includes('QB') ||
      title?.includes('RB') ||
      title?.includes('WR') ||
      title?.includes('TE') ||
      title?.includes('DEF');
    const adjustedRidgeGap = isPositional ? 24 : ridgeGap;

    // Calculate exact chart height needed
    const contentHeight = 45 + data.length * adjustedRidgeGap + 20; // start + ridges + bottom padding
    const chartHeight = contentHeight;

    // Create scales
    const xScale = d3.scaleLinear().domain(domain).range([0, width]);

    // Create container group
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add X-axis at the bottom of content area
    const axisY = contentHeight;
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d.toString());

    g.append('g')
      .attr('transform', `translate(0, ${axisY})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', axisY + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(title || 'Weekly Scores');

    // Render ridges
    data.forEach((team, idx) => {
      // Adjust baseY to prevent bleeding below axis for positional charts
      const isPositional =
        title?.includes('QB') ||
        title?.includes('RB') ||
        title?.includes('WR') ||
        title?.includes('TE') ||
        title?.includes('DEF');
      const adjustedRidgeHeight = isPositional ? 20 : ridgeHeight;
      const adjustedRidgeGap = isPositional ? 24 : ridgeGap;

      const baseY = 45 + idx * adjustedRidgeGap;
      const pairs = team.densityPairs as [number, number][];

      if (!pairs?.length) return;

      // Create ridge path
      const points = pairs.map(([x, y]: [number, number]) => [
        xScale(x),
        baseY - (y / team.maxDensity) * adjustedRidgeHeight,
      ]);

      // Build path string
      let pathData = `M ${points[0][0]} ${baseY}`;
      pathData += ` L ${points[0][0]} ${points[0][1]}`;

      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i][0]} ${points[i][1]}`;
      }

      pathData += ` L ${points[points.length - 1][0]} ${baseY} Z`;

      // Add ridge path
      const ridgeGroup = g.append('g');

      ridgeGroup
        .append('path')
        .attr('d', pathData)
        .attr('fill', colors.core.regalGold)
        .attr('fill-opacity', 0.35)
        .attr('stroke', colors.core.regalGold)
        .attr('stroke-width', 1);

      // Add median line
      const medianX = xScale(team.median);
      ridgeGroup
        .append('line')
        .attr('x1', medianX)
        .attr('y1', baseY)
        .attr('x2', medianX)
        .attr('y2', baseY - adjustedRidgeHeight)
        .attr('stroke', colors.core.charcoalSteel)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 2');

      // Add team name
      g.append('text')
        .attr('x', -10)
        .attr('y', baseY - adjustedRidgeHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', colors.core.regalGold)
        .text(team.teamName);

      // Add invisible hover area
      ridgeGroup
        .append('rect')
        .attr('x', xScale(team.min) - 5)
        .attr('y', baseY - adjustedRidgeHeight - 5)
        .attr('width', xScale(team.max) - xScale(team.min) + 10)
        .attr('height', adjustedRidgeHeight + 10)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', event => {
          setHoveredTeam(team);
          setMousePos({ x: event.pageX, y: event.pageY });
        })
        .on('mousemove', event => {
          setMousePos({ x: event.pageX, y: event.pageY });
        })
        .on('mouseleave', () => {
          setHoveredTeam(null);
        });
    });
  }, [data, domain, height, title, containerWidth]);

  // Calculate total SVG height based on content - more precise
  const isPositional =
    title?.includes('QB') ||
    title?.includes('RB') ||
    title?.includes('WR') ||
    title?.includes('TE') ||
    title?.includes('DEF');
  const gapSize = isPositional ? 24 : 28;

  // Precise height: margins + content + axis space
  const contentHeight = 45 + data.length * gapSize + 20; // ridge content
  const totalSvgHeight = 20 + contentHeight + 55; // top margin + content + axis space

  return (
    <div ref={containerRef} className='relative w-full'>
      <svg ref={svgRef} width='100%' height={totalSvgHeight}></svg>

      {/* Custom Tooltip */}
      {hoveredTeam && (
        <div
          className='absolute pointer-events-none z-10 rounded-lg border bg-background p-3 shadow-lg'
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className='mb-2'>
            <div className='font-semibold text-sm'>{hoveredTeam.teamName}</div>
            <div className='text-xs text-muted-foreground'>{hoveredTeam.leagueName}</div>
          </div>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div>
              <div className='font-semibold'>Median Score</div>
              <div className='text-lg font-bold'>{hoveredTeam.median.toFixed(1)}</div>
              <div className='text-xs text-gray-400'>50th percentile</div>
            </div>
            <div>
              <div className='font-semibold'>Score Range</div>
              <div className='text-sm'>
                {hoveredTeam.min.toFixed(1)} - {hoveredTeam.max.toFixed(1)}
              </div>
              <div className='text-xs text-gray-400'>Range: {hoveredTeam.range.toFixed(1)}</div>
            </div>
            <div>
              <div className='font-semibold'>Games Played</div>
              <div className='text-lg font-bold'>{hoveredTeam.gamesPlayed}</div>
            </div>
            <div>
              <div className='font-semibold'>Consistency</div>
              <div className='text-sm'>
                <span className='font-semibold'>
                  {hoveredTeam.range < 20
                    ? '🎯 Narrow'
                    : hoveredTeam.range < 40
                      ? '📊 Medium'
                      : '🌊 Wide'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
    'team' | 'league' | 'schedule' | 'trends' | 'scatter'
  >((searchParams.view as 'team' | 'league' | 'schedule' | 'trends' | 'scatter') || 'team');

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

  // League View Component
  function LeagueView() {
    const isSeasonView = selectedWeek === 'season';
    const weekNum = isSeasonView ? null : parseInt(selectedWeek, 10);

    // Track expanded player breakdown rows in League View
    const [expandedLeagueRows, setExpandedLeagueRows] = useState<Set<string>>(new Set());

    // Build league rankings data
    const leagueData = useMemo(() => {
      const teams = allTeamEntries
        .map(([key, t]) => {
          const teamTotal = isSeasonView
            ? t.teamScores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0)
            : t.teamScores.find(d => d.week === weekNum)?.value || 0;

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
                ? teamPosData.scores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0)
                : teamPosData.scores.find(d => d.week === weekNum)?.value || 0;
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
    }, [allTeamEntries, positionsMap, selectedWeek, weekNum, isSeasonView]);

    return (
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
          <div className='mb-4 flex items-center gap-3'>
            <label className='text-sm font-medium'>View</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Select week' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='season'>Season Overview</SelectItem>
                {availableWeeks.map(week => (
                  <SelectItem key={week} value={String(week)}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='rounded-md border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-3 py-2 text-center'>Rank</th>
                  <th className='px-3 py-2 text-left'>Team</th>
                  <th className='px-3 py-2 text-right'>Total</th>
                  {isSeasonView && (
                    <th className='px-3 py-2 text-center min-w-[120px]'>Weekly Trend</th>
                  )}
                  <th className='px-3 py-2 text-center'>QB</th>
                  <th className='px-3 py-2 text-center'>RB</th>
                  <th className='px-3 py-2 text-center'>WR</th>
                  <th className='px-3 py-2 text-center'>TE</th>
                  <th className='px-3 py-2 text-center'>DEF</th>
                </tr>
              </thead>
              <tbody>
                {leagueData.map((team, index) => (
                  <tr key={team.key} className='border-t hover:bg-muted/20'>
                    <td className='px-3 py-2 text-center'>
                      <span
                        className='rounded-full px-2 py-1 text-xs font-medium'
                        style={{
                          backgroundColor: getRankColor(team.rank, 24),
                          color: getTextColor(getRankColor(team.rank, 24)),
                        }}
                      >
                        {team.rank}
                      </span>
                    </td>
                    <td className='px-3 py-2'>
                      <div className='font-medium'>{team.teamInfo.teamName}</div>
                      <div className='text-xs text-muted-foreground'>
                        {team.teamInfo.leagueName}
                      </div>
                    </td>
                    <td
                      className='px-3 py-2 text-right font-mono font-bold'
                      style={{ color: colors.core.regalGold }}
                    >
                      {team.teamTotal.toFixed(1)}
                    </td>
                    {isSeasonView && (
                      <td className='px-2 py-2'>
                        <div className='w-28 h-8'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                              data={(() => {
                                // Get weekly scores for sparkline
                                const teamData = allTeamEntries.find(([k]) => k === team.key);
                                if (!teamData) return [];

                                return teamData[1].teamScores
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
                      <td key={position} className='px-2 py-2 text-center'>
                        <div className='space-y-2'>
                          {/* Position heatmap cell */}
                          <div
                            className='rounded-lg p-2 transition-colors min-w-[70px]'
                            style={{
                              backgroundColor: getRankColor(team.positionRanks[position], 24),
                            }}
                          >
                            <div
                              className='font-mono font-bold text-xs'
                              style={{
                                color: getTextColor(getRankColor(team.positionRanks[position], 24)),
                              }}
                            >
                              #{team.positionRanks[position]}
                            </div>
                            <div
                              className='font-mono text-xs'
                              style={{
                                color: getTextColor(getRankColor(team.positionRanks[position], 24)),
                              }}
                            >
                              {team.positions[position].toFixed(1)}
                            </div>
                          </div>

                          {/* Position sparkline (season view only) */}
                          {isSeasonView && (
                            <div className='w-16 h-6'>
                              <ResponsiveContainer width='100%' height='100%'>
                                <LineChart
                                  data={(() => {
                                    // Get weekly positional scores
                                    const posData = positionsMap.get(position);
                                    const posTeamsMap = new Map(posData?.teams || []);
                                    const teamPosData = posTeamsMap.get(team.key);

                                    if (!teamPosData) return [];

                                    return teamPosData.scores
                                      .filter(d => d.value !== 0)
                                      .map(d => ({
                                        week: d.week,
                                        score: d.value,
                                      }));
                                  })()}
                                >
                                  <Line
                                    type='monotone'
                                    dataKey='score'
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
                                    formatter={(value, name) => [
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
          <div className='mt-4 p-3 bg-muted/20 rounded-md text-xs'>
            <h4 className='font-semibold mb-2'>Position Color Guide</h4>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-muted-foreground'>
              <div className='flex items-center'>
                <span
                  className='inline-block w-4 h-4 rounded mr-2'
                  style={{ backgroundColor: colors.rdylgn[9] }}
                ></span>
                <strong>Top 10%</strong>
              </div>
              <div className='flex items-center'>
                <span
                  className='inline-block w-4 h-4 rounded mr-2'
                  style={{ backgroundColor: colors.rdylgn[8] }}
                ></span>
                <strong>Top 25%</strong>
              </div>
              <div className='flex items-center'>
                <span
                  className='inline-block w-4 h-4 rounded mr-2'
                  style={{ backgroundColor: colors.rdylgn[7] }}
                ></span>
                <strong>Top 50%</strong>
              </div>
              <div className='flex items-center'>
                <span
                  className='inline-block w-4 h-4 rounded mr-2'
                  style={{ backgroundColor: colors.rdylgn[5] }}
                ></span>
                <strong>Middle</strong>
              </div>
              <div className='flex items-center'>
                <span
                  className='inline-block w-4 h-4 rounded mr-2'
                  style={{ backgroundColor: colors.rdylgn[3] }}
                ></span>
                <strong>Bottom 25%</strong>
              </div>
              <div className='flex items-center'>
                <span
                  className='inline-block w-4 h-4 rounded mr-2'
                  style={{ backgroundColor: colors.rdylgn[1] }}
                ></span>
                <strong>Bottom 10%</strong>
              </div>
            </div>
          </div>

          {/* Position Tables */}
          <div className='mt-8 space-y-6'>
            <h3 className='text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Position Rankings
            </h3>

            {(['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]).map(position => {
              // Build position-specific data
              const positionData = useMemo(() => {
                const teams = allTeamEntries
                  .map(([key, t]) => {
                    const posData = positionsMap.get(position);
                    const posTeamsMap = new Map(posData?.teams || []);
                    const teamPosData = posTeamsMap.get(key);

                    if (!teamPosData) return null;

                    const posScore = isSeasonView
                      ? teamPosData.scores.filter(d => d.value > 0).reduce((a, d) => a + d.value, 0)
                      : teamPosData.scores.find(d => d.week === weekNum)?.value || 0;

                    return {
                      key,
                      teamInfo: t.teamInfo,
                      posScore,
                    };
                  })
                  .filter(Boolean)
                  .filter(team => team!.posScore > 0) as Array<{
                  key: string;
                  teamInfo: any;
                  posScore: number;
                }>;

                // Calculate ranks
                const posScores = teams.map(t => t.posScore);
                const posRanks = rank(posScores);

                return teams
                  .map((team, index) => ({
                    ...team,
                    rank: posRanks[index],
                  }))
                  .sort((a, b) => a.rank - b.rank);
              }, [allTeamEntries, positionsMap, position, selectedWeek, weekNum, isSeasonView]);

              return (
                <div key={position} className='rounded-md border'>
                  <div className='px-4 py-2' style={{ backgroundColor: colors.core.charcoalSteel }}>
                    <h4 className='font-semibold text-white'>
                      {position} Rankings
                      {!isSeasonView && (
                        <span className='ml-2 text-xs text-gray-300'>
                          (Click rows to see players)
                        </span>
                      )}
                    </h4>
                  </div>

                  <div className='p-4'>
                    <div className='rounded-md border'>
                      <table className='w-full text-sm'>
                        <thead className='bg-muted/20'>
                          <tr>
                            <th className='px-3 py-2 text-center'>Rank</th>
                            <th className='px-3 py-2 text-left'>Team</th>
                            <th className='px-3 py-2 text-right'>Points</th>
                            {!isSeasonView && <th className='px-3 py-2 text-center'>Players</th>}
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
                                <td className='px-3 py-2 text-center'>
                                  <span
                                    className='rounded-full px-2 py-1 text-xs font-medium'
                                    style={{
                                      backgroundColor: getRankColor(team.rank, positionData.length),
                                      color: getTextColor(
                                        getRankColor(team.rank, positionData.length)
                                      ),
                                    }}
                                  >
                                    {team.rank}
                                  </span>
                                </td>
                                <td className='px-3 py-2'>
                                  <div className='flex items-center gap-1'>
                                    <div>
                                      <div className='font-medium'>{team.teamInfo.teamName}</div>
                                      <div className='text-xs text-muted-foreground'>
                                        {team.teamInfo.leagueName}
                                      </div>
                                    </div>
                                    {!isSeasonView && (
                                      <span className='text-xs text-muted-foreground ml-auto'>
                                        {isExpanded ? '▼' : '▶'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td
                                  className='px-3 py-2 text-right font-mono font-bold'
                                  style={{ color: colors.core.regalGold }}
                                >
                                  {team.posScore.toFixed(1)}
                                </td>
                                {!isSeasonView && (
                                  <td className='px-3 py-2 text-center text-xs text-muted-foreground'>
                                    Click to expand
                                  </td>
                                )}
                              </tr>
                            );

                            // Player breakdown row (if expanded and weekly view)
                            if (isExpanded && !isSeasonView && weekNum) {
                              const weekPlayerData = dataset.weeklyPlayerData[weekNum]?.[team.key];
                              const playersForPosition = weekPlayerData?.positions[position] || [];

                              rows.push(
                                <tr key={`${team.key}-breakdown`} className='bg-muted/5'>
                                  <td colSpan={4} className='p-0'>
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
        </CardContent>
      </Card>
    );
  }

  // Schedule Analysis Component
  function ScheduleAnalysis() {
    // Build head-to-head record matrix
    const scheduleMatrix = useMemo(() => {
      const matrix = new Map<
        string,
        Map<string, { wins: number; losses: number; totalGames: number }>
      >();

      // Initialize matrix for all teams
      for (const [teamKey] of allTeamEntries) {
        matrix.set(teamKey, new Map());
        for (const [opponentKey] of allTeamEntries) {
          if (teamKey !== opponentKey) {
            matrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
          }
        }
      }

      // For each team pair, calculate hypothetical record
      for (const [teamAKey, teamA] of allTeamEntries) {
        for (const [teamBKey, teamB] of allTeamEntries) {
          if (teamAKey === teamBKey) continue;

          const record = matrix.get(teamAKey)?.get(teamBKey);
          if (!record) continue;

          // Compare Team A's scores against Team B's opponent scores
          for (let week = 1; week <= dataset.currentWeek - 1; week++) {
            const teamAScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
            const teamBOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;

            // Only count weeks where both teams have data
            if (teamAScore > 0 && teamBOppScore > 0) {
              if (teamAScore > teamBOppScore) {
                record.wins++;
              } else if (teamAScore < teamBOppScore) {
                record.losses++;
              }
              // Note: Ties are not counted as wins or losses, but still count as games
              record.totalGames++;
            }
          }

          // Debug output for first few comparisons
          if (teamAKey.includes('-1') && teamBKey.includes('-2')) {
            console.log(
              `[DEBUG] Schedule matrix ${teamA.teamInfo.teamName} vs ${teamB.teamInfo.teamName} schedule:`,
              {
                totalGames: record.totalGames,
                wins: record.wins,
                losses: record.losses,
                teamAScores: teamA.teamScores
                  .filter(d => d.value > 0)
                  .map(d => ({ week: d.week, value: d.value })),
                teamBOppScores: teamB.opponentScores
                  .filter(d => d.value > 0)
                  .map(d => ({ week: d.week, value: d.value })),
                weeklyComparisons: Array.from(
                  { length: dataset.currentWeek - 1 },
                  (_, i) => i + 1
                ).map(week => {
                  const aScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
                  const bOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;
                  return { week, aScore, bOppScore, counted: aScore > 0 && bOppScore > 0 };
                }),
              }
            );
          }
        }
      }

      return matrix;
    }, [allTeamEntries, dataset.currentWeek]);

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
      const stats = allTeamEntries
        .map(([teamKey, team]) => {
          let totalWins = 0;
          let totalLosses = 0;
          let totalGames = 0;

          const teamRecord = scheduleMatrix.get(teamKey);
          if (teamRecord) {
            for (const record of teamRecord.values()) {
              totalWins += record.wins;
              totalLosses += record.losses;
              totalGames += record.totalGames;
            }
          }

          return {
            teamKey,
            teamInfo: team.teamInfo,
            totalWins,
            totalLosses,
            totalGames,
            winPct: totalGames > 0 ? totalWins / totalGames : 0,
          };
        })
        .sort((a, b) => b.winPct - a.winPct);

      return stats;
    }, [allTeamEntries, scheduleMatrix]);

    // Calculate schedule difficulty (which schedules are hardest)
    const scheduleDifficulty = useMemo(() => {
      const scheduleStats = allTeamEntries
        .map(([scheduleOwnerKey, scheduleOwner]) => {
          let totalWins = 0;
          let totalGames = 0;

          // For each other team, see how they would do with this schedule
          for (const [teamKey] of allTeamEntries) {
            if (teamKey === scheduleOwnerKey) continue;

            const record = scheduleMatrix.get(teamKey)?.get(scheduleOwnerKey);
            if (record) {
              totalWins += record.wins;
              totalGames += record.totalGames;
            }
          }

          return {
            scheduleOwnerKey,
            scheduleOwnerInfo: scheduleOwner.teamInfo,
            avgWinPct: totalGames > 0 ? totalWins / totalGames : 0,
            totalGames,
          };
        })
        .sort((a, b) => a.avgWinPct - b.avgWinPct); // Lowest win% = hardest schedule

      return scheduleStats;
    }, [allTeamEntries, scheduleMatrix]);

    // Build league-specific matrices and teams
    const afcTeams = allTeamEntries.filter(([, t]) => t.teamInfo.leagueName.includes('AFC'));
    const nfcTeams = allTeamEntries.filter(([, t]) => t.teamInfo.leagueName.includes('NFC'));
    const afcSummary = summaryStats.filter(s => s.teamInfo.leagueName.includes('AFC'));
    const nfcSummary = summaryStats.filter(s => s.teamInfo.leagueName.includes('NFC'));

    // Build AFC-only matrix
    const afcMatrix = useMemo(() => {
      const matrix = new Map<
        string,
        Map<string, { wins: number; losses: number; totalGames: number }>
      >();

      for (const [teamKey] of afcTeams) {
        matrix.set(teamKey, new Map());
        for (const [opponentKey] of afcTeams) {
          if (teamKey !== opponentKey) {
            matrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
          }
        }
      }

      // Calculate hypothetical records within AFC only
      for (const [teamAKey, teamA] of afcTeams) {
        for (const [teamBKey, teamB] of afcTeams) {
          if (teamAKey === teamBKey) continue;

          const record = matrix.get(teamAKey)?.get(teamBKey);
          if (!record) continue;

          for (let week = 1; week <= dataset.currentWeek - 1; week++) {
            const teamAScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
            const teamBOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;

            if (teamAScore > 0 && teamBOppScore > 0) {
              if (teamAScore > teamBOppScore) {
                record.wins++;
              } else if (teamAScore < teamBOppScore) {
                record.losses++;
              }
              record.totalGames++;
            }
          }
        }
      }

      return matrix;
    }, [afcTeams, dataset.currentWeek]);

    // Build NFC-only matrix
    const nfcMatrix = useMemo(() => {
      const matrix = new Map<
        string,
        Map<string, { wins: number; losses: number; totalGames: number }>
      >();

      for (const [teamKey] of nfcTeams) {
        matrix.set(teamKey, new Map());
        for (const [opponentKey] of nfcTeams) {
          if (teamKey !== opponentKey) {
            matrix.get(teamKey)!.set(opponentKey, { wins: 0, losses: 0, totalGames: 0 });
          }
        }
      }

      // Calculate hypothetical records within NFC only
      for (const [teamAKey, teamA] of nfcTeams) {
        for (const [teamBKey, teamB] of nfcTeams) {
          if (teamAKey === teamBKey) continue;

          const record = matrix.get(teamAKey)?.get(teamBKey);
          if (!record) continue;

          for (let week = 1; week <= dataset.currentWeek - 1; week++) {
            const teamAScore = teamA.teamScores.find(d => d.week === week)?.value || 0;
            const teamBOppScore = teamB.opponentScores.find(d => d.week === week)?.value || 0;

            if (teamAScore > 0 && teamBOppScore > 0) {
              if (teamAScore > teamBOppScore) {
                record.wins++;
              } else if (teamAScore < teamBOppScore) {
                record.losses++;
              }
              record.totalGames++;
            }
          }
        }
      }

      return matrix;
    }, [nfcTeams, dataset.currentWeek]);

    // Advanced luck analysis for selected team
    const selectedTeamLuckAnalysis = useMemo(() => {
      const selectedTeamData = allTeamEntries.find(([k]) => k === selectedTeamKey);
      if (!selectedTeamData) return null;

      const [, team] = selectedTeamData;
      const teamRecord = scheduleMatrix.get(selectedTeamKey);

      // Calculate actual record
      const actualWins = team.teamScores.filter((score, idx) => {
        const oppScore = team.opponentScores[idx];
        return score.value > 0 && oppScore && score.value > oppScore.value;
      }).length;

      const actualGames = team.teamScores.filter(d => d.value > 0).length;
      const actualWinPct = actualGames > 0 ? actualWins / actualGames : 0;

      // Find team in summary stats
      const teamSummary = summaryStats.find(s => s.teamKey === selectedTeamKey);
      const overallWinPct = teamSummary?.winPct || 0;

      // Win % of other teams with this team's schedule
      const othersWithMyScheduleWinPcts: number[] = [];
      for (const [otherKey] of allTeamEntries) {
        if (otherKey === selectedTeamKey) continue;
        const otherRecord = scheduleMatrix.get(otherKey)?.get(selectedTeamKey);
        if (otherRecord && otherRecord.totalGames > 0) {
          othersWithMyScheduleWinPcts.push(otherRecord.wins / otherRecord.totalGames);
        }
      }
      const othersWithMyScheduleAvg =
        othersWithMyScheduleWinPcts.length > 0 ? mean(othersWithMyScheduleWinPcts) : 0;

      // This team's win % with other schedules
      const myWithOthersWinPcts: number[] = [];
      if (teamRecord) {
        for (const record of teamRecord.values()) {
          if (record.totalGames > 0) {
            myWithOthersWinPcts.push(record.wins / record.totalGames);
          }
        }
      }
      const myWithOthersAvg = myWithOthersWinPcts.length > 0 ? mean(myWithOthersWinPcts) : 0;

      // Simple, meaningful luck calculation: Actual vs Expected based on point differential
      const teamPoints = team.teamScores
        .filter(d => d.value > 0)
        .reduce((sum, d) => sum + d.value, 0);
      const oppPoints = team.opponentScores
        .filter(d => d.value > 0)
        .reduce((sum, d) => sum + d.value, 0);
      const pointDiff = teamPoints - oppPoints;

      // Expected win% based on point differential (Pythagorean expectation)
      const expectedWinPct =
        actualGames > 0
          ? Math.max(0, Math.min(1, 0.5 + (pointDiff / (teamPoints + oppPoints)) * 1.5))
          : 0;

      const luckRating = actualWinPct - expectedWinPct; // Positive = luckier than point diff suggests
      const scheduleLuck = actualWinPct - othersWithMyScheduleAvg; // How much easier/harder was actual schedule
      const performanceLuck = actualWinPct - myWithOthersAvg; // How much better/worse than expected with schedules

      // Build distributions
      const myDistribution = new Map<number, number>();
      const othersDistribution = new Map<number, number>();

      for (let wins = 0; wins <= actualGames; wins++) {
        myDistribution.set(wins, 0);
        othersDistribution.set(wins, 0);
      }

      // Team with different schedules
      if (teamRecord) {
        for (const record of teamRecord.values()) {
          if (record.totalGames > 0) {
            const wins = Math.round((record.wins / record.totalGames) * actualGames);
            myDistribution.set(wins, (myDistribution.get(wins) || 0) + 1);
          }
        }
      }

      // Other teams with this schedule
      for (const [otherKey] of allTeamEntries) {
        if (otherKey === selectedTeamKey) continue;
        const otherRecord = scheduleMatrix.get(otherKey)?.get(selectedTeamKey);
        if (otherRecord && otherRecord.totalGames > 0) {
          const wins = Math.round((otherRecord.wins / otherRecord.totalGames) * actualGames);
          othersDistribution.set(wins, (othersDistribution.get(wins) || 0) + 1);
        }
      }

      const myDistChart = Array.from(myDistribution.entries()).map(([wins, count]) => ({
        wins,
        count,
        isActual: wins === actualWins,
      }));

      const othersDistChart = Array.from(othersDistribution.entries()).map(([wins, count]) => ({
        wins,
        count,
        isActual: wins === actualWins,
      }));

      return {
        team,
        actualWins,
        actualGames,
        actualWinPct,
        overallWinPct,
        expectedWinPct,
        pointDiff,
        othersWithMyScheduleAvg,
        myWithOthersAvg,
        scheduleLuck,
        performanceLuck,
        luckRating,
        myDistChart,
        othersDistChart,
      };
    }, [selectedTeamKey, allTeamEntries, scheduleMatrix, summaryStats]);

    // Comprehensive luck analysis for all teams
    const allTeamsLuckAnalysis = useMemo(() => {
      return allTeamEntries
        .map(([teamKey, team]) => {
          // Calculate actual record
          const actualWins = team.teamScores.filter((score, idx) => {
            const oppScore = team.opponentScores[idx];
            return score.value > 0 && oppScore && score.value > oppScore.value;
          }).length;

          const actualGames = team.teamScores.filter(d => d.value > 0).length;
          const actualWinPct = actualGames > 0 ? actualWins / actualGames : 0;

          // Find team in summary stats
          const teamSummary = summaryStats.find(s => s.teamKey === teamKey);
          const overallWinPct = teamSummary?.winPct || 0;

          // Schedule difficulty (how others do with this schedule)
          const othersWithMyScheduleWinPcts: number[] = [];
          for (const [otherKey] of allTeamEntries) {
            if (otherKey === teamKey) continue;
            const otherRecord = scheduleMatrix.get(otherKey)?.get(teamKey);
            if (otherRecord && otherRecord.totalGames > 0) {
              othersWithMyScheduleWinPcts.push(otherRecord.wins / otherRecord.totalGames);
            }
          }
          const scheduleEase =
            othersWithMyScheduleWinPcts.length > 0 ? mean(othersWithMyScheduleWinPcts) : 0;

          // Simple, meaningful luck calculation: Actual vs Expected based on point differential
          const teamPoints = team.teamScores
            .filter(d => d.value > 0)
            .reduce((sum, d) => sum + d.value, 0);
          const oppPoints = team.opponentScores
            .filter(d => d.value > 0)
            .reduce((sum, d) => sum + d.value, 0);
          const pointDiff = teamPoints - oppPoints;

          // Expected win% based on point differential (Pythagorean expectation)
          const expectedWinPct =
            actualGames > 0
              ? Math.max(0, Math.min(1, 0.5 + (pointDiff / (teamPoints + oppPoints)) * 1.5))
              : 0;

          const luckRating = actualWinPct - expectedWinPct; // Positive = luckier than point diff suggests

          return {
            teamKey,
            teamInfo: team.teamInfo,
            actualWins,
            actualGames,
            actualWinPct,
            overallWinPct,
            scheduleEase,
            expectedWinPct,
            luckRating,
            pointDiff,
          };
        })
        .sort((a, b) => b.luckRating - a.luckRating); // Sort by luck (most lucky first)
    }, [allTeamEntries, scheduleMatrix, summaryStats]);

    const teamsList = allTeamEntries.map(([key, t]) => ({ key, info: t.teamInfo }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Analysis</CardTitle>
          <CardDescription>
            Hypothetical records - &quot;What would each team&apos;s record be with everyone
            else&apos;s schedule?&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-auto'>
            <table className='w-full text-xs border-collapse'>
              <thead>
                <tr>
                  <th className='sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r'>
                    vs Opponent →
                  </th>
                  {teamsList.map(team => (
                    <th
                      key={team.key}
                      className='px-1 py-1 text-center border-r min-w-[60px]'
                      title={team.info.teamName}
                    >
                      <div className='transform -rotate-45 origin-center whitespace-nowrap text-xs'>
                        {team.info.teamName.slice(0, 12)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamsList.map(team => {
                  const teamRecord = scheduleMatrix.get(team.key);

                  return (
                    <tr key={team.key} className='border-b'>
                      <td className='sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{team.info.teamName}</span>
                          <span className='text-xs text-muted-foreground'>
                            {team.info.leagueName}
                          </span>
                        </div>
                      </td>
                      {teamsList.map(opponent => {
                        if (team.key === opponent.key) {
                          return (
                            <td
                              key={opponent.key}
                              className='px-1 py-1 text-center border-r bg-muted/50'
                            >
                              —
                            </td>
                          );
                        }

                        const record = teamRecord?.get(opponent.key);
                        const wins = record?.wins || 0;
                        const losses = record?.losses || 0;
                        const total = record?.totalGames || 0;

                        if (total === 0) {
                          return (
                            <td
                              key={opponent.key}
                              className='px-1 py-1 text-center border-r bg-gray-50'
                            >
                              <span className='text-muted-foreground'>—</span>
                            </td>
                          );
                        }

                        const winPct = total > 0 ? wins / total : 0;
                        const recordColor =
                          winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                        return (
                          <td
                            key={opponent.key}
                            className='px-1 py-1 text-center border-r'
                            style={{ backgroundColor: `${recordColor}20` }}
                          >
                            <div
                              className='font-mono text-xs font-medium'
                              style={{ color: recordColor }}
                            >
                              {wins}-{losses}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div className='rounded-md border p-3'>
              <h4 className='font-semibold mb-2'>Legend</h4>
              <div className='space-y-1 text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded' style={{ backgroundColor: '#16a34a20' }}></div>
                  <span>Winning record</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded' style={{ backgroundColor: '#ca8a0420' }}></div>
                  <span>Even record</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded' style={{ backgroundColor: '#dc262620' }}></div>
                  <span>Losing record</span>
                </div>
              </div>
            </div>

            <div className='rounded-md border p-3'>
              <h4 className='font-semibold mb-2'>Analysis</h4>
              <p className='text-xs text-muted-foreground'>
                Reveals schedule strength by showing how each team would perform with different
                opponents.
              </p>
            </div>

            <div className='rounded-md border p-3'>
              <h4 className='font-semibold mb-2'>Usage</h4>
              <p className='text-xs text-muted-foreground'>
                Row team vs Column team schedule. &quot;5-2&quot; means Row team would be 5-2 if
                they faced Column team&apos;s opponents.
              </p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Hypothetical Records Summary
            </h3>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-center'>Rank</th>
                    <th className='px-4 py-3 text-left'>Team</th>
                    <th className='px-4 py-3 text-center'>Record</th>
                    <th className='px-4 py-3 text-center'>Win %</th>
                    <th className='px-4 py-3 text-center'>Total Games</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryStats.map((stat, index) => (
                    <tr key={stat.teamKey} className='border-t hover:bg-muted/20'>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(index + 1, 24),
                            color: getTextColor(getRankColor(index + 1, 24)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{stat.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {stat.teamInfo.leagueName}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center font-mono font-bold'>
                        {stat.totalWins}-{stat.totalLosses}
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        {(stat.winPct * 100).toFixed(1)}%
                      </td>
                      <td className='px-4 py-3 text-center font-mono text-muted-foreground'>
                        {stat.totalGames}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* League-by-League Breakdown */}
          <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* AFC League */}
            <div>
              <h4
                className='mb-3 text-base font-semibold'
                style={{ color: colors.core.crimsonRed }}
              >
                AFC League Analysis
              </h4>
              <div className='rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/30'>
                    <tr>
                      <th className='px-3 py-2 text-center'>Rank</th>
                      <th className='px-3 py-2 text-left'>Team</th>
                      <th className='px-3 py-2 text-center'>Record</th>
                      <th className='px-3 py-2 text-center'>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {afcSummary.map((stat, index) => (
                      <tr key={stat.teamKey} className='border-t hover:bg-muted/20'>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className='rounded-full px-2 py-1 text-xs font-medium'
                            style={{
                              backgroundColor: getRankColor(index + 1, afcSummary.length),
                              color: getTextColor(getRankColor(index + 1, afcSummary.length)),
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className='px-3 py-2 font-medium'>{stat.teamInfo.teamName}</td>
                        <td className='px-3 py-2 text-center font-mono font-bold'>
                          {stat.totalWins}-{stat.totalLosses}
                        </td>
                        <td className='px-3 py-2 text-center font-mono'>
                          {(stat.winPct * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NFC League */}
            <div>
              <h4
                className='mb-3 text-base font-semibold'
                style={{ color: colors.core.crimsonRed }}
              >
                NFC League Analysis
              </h4>
              <div className='rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/30'>
                    <tr>
                      <th className='px-3 py-2 text-center'>Rank</th>
                      <th className='px-3 py-2 text-left'>Team</th>
                      <th className='px-3 py-2 text-center'>Record</th>
                      <th className='px-3 py-2 text-center'>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfcSummary.map((stat, index) => (
                      <tr key={stat.teamKey} className='border-t hover:bg-muted/20'>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className='rounded-full px-2 py-1 text-xs font-medium'
                            style={{
                              backgroundColor: getRankColor(index + 1, nfcSummary.length),
                              color: getTextColor(getRankColor(index + 1, nfcSummary.length)),
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className='px-3 py-2 font-medium'>{stat.teamInfo.teamName}</td>
                        <td className='px-3 py-2 text-center font-mono font-bold'>
                          {stat.totalWins}-{stat.totalLosses}
                        </td>
                        <td className='px-3 py-2 text-center font-mono'>
                          {(stat.winPct * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Schedule Difficulty Analysis */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Schedule Difficulty Rankings
            </h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Which schedules are hardest? Teams with lowest average win% had the toughest
              opponents.
            </p>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-center'>Difficulty Rank</th>
                    <th className='px-4 py-3 text-left'>Schedule Owner</th>
                    <th className='px-4 py-3 text-center'>Avg Win % vs This Schedule</th>
                    <th className='px-4 py-3 text-center'>Games</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleDifficulty.map((sched, index) => (
                    <tr key={sched.scheduleOwnerKey} className='border-t hover:bg-muted/20'>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(index + 1, 24),
                            color: getTextColor(getRankColor(index + 1, 24)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{sched.scheduleOwnerInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {sched.scheduleOwnerInfo.leagueName}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        <span
                          style={{
                            color:
                              sched.avgWinPct < 0.4
                                ? colors.rdylgn[1]
                                : sched.avgWinPct < 0.6
                                  ? colors.rdylgn[5]
                                  : colors.rdylgn[9],
                          }}
                        >
                          {(sched.avgWinPct * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center font-mono text-muted-foreground'>
                        {sched.totalGames}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* League-by-League Matrices */}
          <div className='mt-8 space-y-8'>
            <h3 className='text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              League-by-League Schedule Analysis
            </h3>

            {/* AFC Matrix */}
            <div>
              <h4 className='mb-3 text-base font-semibold'>AFC League (12×12 Matrix)</h4>
              <div className='overflow-auto rounded-md border'>
                <table className='w-full text-xs border-collapse'>
                  <thead>
                    <tr>
                      <th className='sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r'>
                        AFC Team →
                      </th>
                      {afcTeams.map(([key, t]) => (
                        <th
                          key={key}
                          className='px-1 py-1 text-center border-r min-w-[50px]'
                          title={t.teamInfo.teamName}
                        >
                          <div className='transform -rotate-45 origin-center whitespace-nowrap text-xs'>
                            {t.teamInfo.teamName.slice(0, 10)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {afcTeams.map(([teamKey, team]) => {
                      const teamRecord = afcMatrix.get(teamKey);

                      return (
                        <tr key={teamKey} className='border-b'>
                          <td className='sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r text-xs'>
                            {team.teamInfo.teamName}
                          </td>
                          {afcTeams.map(([opponentKey, _opponent]) => {
                            if (teamKey === opponentKey) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-muted/50'
                                >
                                  —
                                </td>
                              );
                            }

                            const record = teamRecord?.get(opponentKey);
                            const wins = record?.wins || 0;
                            const losses = record?.losses || 0;
                            const total = record?.totalGames || 0;

                            if (total === 0) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-gray-50'
                                >
                                  <span className='text-muted-foreground'>—</span>
                                </td>
                              );
                            }

                            const winPct = total > 0 ? wins / total : 0;
                            const recordColor =
                              winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                            return (
                              <td
                                key={opponentKey}
                                className='px-1 py-1 text-center border-r'
                                style={{ backgroundColor: `${recordColor}20` }}
                              >
                                <div
                                  className='font-mono text-xs font-medium'
                                  style={{ color: recordColor }}
                                >
                                  {wins}-{losses}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NFC Matrix */}
            <div>
              <h4 className='mb-3 text-base font-semibold'>NFC League (12×12 Matrix)</h4>
              <div className='overflow-auto rounded-md border'>
                <table className='w-full text-xs border-collapse'>
                  <thead>
                    <tr>
                      <th className='sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r'>
                        NFC Team →
                      </th>
                      {nfcTeams.map(([key, t]) => (
                        <th
                          key={key}
                          className='px-1 py-1 text-center border-r min-w-[50px]'
                          title={t.teamInfo.teamName}
                        >
                          <div className='transform -rotate-45 origin-center whitespace-nowrap text-xs'>
                            {t.teamInfo.teamName.slice(0, 10)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nfcTeams.map(([teamKey, team]) => {
                      const teamRecord = nfcMatrix.get(teamKey);

                      return (
                        <tr key={teamKey} className='border-b'>
                          <td className='sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r text-xs'>
                            {team.teamInfo.teamName}
                          </td>
                          {nfcTeams.map(([opponentKey, _opponent]) => {
                            if (teamKey === opponentKey) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-muted/50'
                                >
                                  —
                                </td>
                              );
                            }

                            const record = teamRecord?.get(opponentKey);
                            const wins = record?.wins || 0;
                            const losses = record?.losses || 0;
                            const total = record?.totalGames || 0;

                            if (total === 0) {
                              return (
                                <td
                                  key={opponentKey}
                                  className='px-1 py-1 text-center border-r bg-gray-50'
                                >
                                  <span className='text-muted-foreground'>—</span>
                                </td>
                              );
                            }

                            const winPct = total > 0 ? wins / total : 0;
                            const recordColor =
                              winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                            return (
                              <td
                                key={opponentKey}
                                className='px-1 py-1 text-center border-r'
                                style={{ backgroundColor: `${recordColor}20` }}
                              >
                                <div
                                  className='font-mono text-xs font-medium'
                                  style={{ color: recordColor }}
                                >
                                  {wins}-{losses}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Comprehensive Luck Rankings */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              League-Wide Luck Rankings
            </h3>

            <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-center'>Luck Rank</th>
                    <th className='px-4 py-3 text-left'>Team</th>
                    <th className='px-4 py-3 text-center'>Actual Record</th>
                    <th className='px-4 py-3 text-center'>Expected Win%</th>
                    <th className='px-4 py-3 text-center'>Point Diff</th>
                    <th className='px-4 py-3 text-center'>Luck Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeamsLuckAnalysis.map((analysis, index) => (
                    <tr key={analysis.teamKey} className='border-t hover:bg-muted/20'>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='rounded-full px-2 py-1 text-xs font-medium'
                          style={{
                            backgroundColor: getRankColor(index + 1, 24),
                            color: getTextColor(getRankColor(index + 1, 24)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{analysis.teamInfo.teamName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {analysis.teamInfo.leagueName}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-center font-mono font-bold'>
                        {analysis.actualWins}-{analysis.actualGames - analysis.actualWins}
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        {(analysis.expectedWinPct * 100).toFixed(1)}%
                      </td>
                      <td className='px-4 py-3 text-center font-mono'>
                        <span
                          style={{
                            color:
                              analysis.pointDiff > 0
                                ? colors.rdylgn[8]
                                : analysis.pointDiff < 0
                                  ? colors.rdylgn[2]
                                  : colors.rdylgn[5],
                          }}
                        >
                          {analysis.pointDiff > 0 ? '+' : ''}
                          {analysis.pointDiff.toFixed(1)}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className='font-mono font-bold'
                          style={{
                            color:
                              analysis.luckRating > 0.05
                                ? colors.rdylgn[8]
                                : analysis.luckRating < -0.05
                                  ? colors.rdylgn[2]
                                  : colors.rdylgn[5],
                          }}
                        >
                          {analysis.luckRating > 0 ? '+' : ''}
                          {(analysis.luckRating * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team-Specific Distribution Analysis */}
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
              Team Distribution Analysis
            </h3>

            <div className='mb-6'>
              <label className='text-sm font-medium mb-2 block'>
                Select Team for Distribution Analysis
              </label>
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

            {selectedTeamLuckAnalysis && (
              <div className='space-y-6'>
                {/* Four-Metric Summary */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Overall Strength</h4>
                    <div className='text-2xl font-bold' style={{ color: colors.core.regalGold }}>
                      {(selectedTeamLuckAnalysis.overallWinPct * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>vs all teams</div>
                  </div>

                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Current Performance</h4>
                    <div className='text-2xl font-bold' style={{ color: colors.core.regalGold }}>
                      {(selectedTeamLuckAnalysis.actualWinPct * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>with actual schedule</div>
                  </div>

                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Schedule Difficulty</h4>
                    <div className='text-2xl font-bold' style={{ color: colors.core.regalGold }}>
                      {(selectedTeamLuckAnalysis.othersWithMyScheduleAvg * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>others with this schedule</div>
                  </div>

                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold text-sm mb-2'>Luck Rating</h4>
                    <div
                      className='text-2xl font-bold'
                      style={{
                        color:
                          selectedTeamLuckAnalysis.luckRating > 0.05
                            ? colors.rdylgn[8]
                            : selectedTeamLuckAnalysis.luckRating < -0.05
                              ? colors.rdylgn[2]
                              : colors.rdylgn[5],
                      }}
                    >
                      {selectedTeamLuckAnalysis.luckRating > 0 ? '+' : ''}
                      {(selectedTeamLuckAnalysis.luckRating * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {selectedTeamLuckAnalysis.luckRating > 0.05
                        ? 'Lucky'
                        : selectedTeamLuckAnalysis.luckRating < -0.05
                          ? 'Unlucky'
                          : 'Neutral'}
                    </div>
                  </div>
                </div>

                {/* Distribution Charts */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Team with different schedules */}
                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold mb-3'>
                      {selectedTeamLuckAnalysis.team.teamInfo.teamName} with Different Schedules
                    </h4>
                    <div className='h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={selectedTeamLuckAnalysis.myDistChart}>
                          <XAxis
                            dataKey='wins'
                            label={{ value: 'Wins', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            label={{ value: '# of Schedules', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={value => [value, '# of Schedules']}
                            labelFormatter={wins => `${wins} Wins`}
                          />
                          <ReferenceLine
                            x={selectedTeamLuckAnalysis.actualWins}
                            stroke={colors.core.crimsonRed}
                            strokeWidth={2}
                            label={{ value: 'Actual', position: 'top' }}
                          />
                          <Bar dataKey='count'>
                            {selectedTeamLuckAnalysis.myDistChart.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.isActual ? colors.core.crimsonRed : colors.core.regalGold
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className='text-xs text-muted-foreground mt-2'>
                      Shows how many schedules would result in each win count for this team
                    </p>
                  </div>

                  {/* Other teams with this schedule */}
                  <div className='rounded-md border p-4'>
                    <h4 className='font-semibold mb-3'>
                      Other Teams with {selectedTeamLuckAnalysis.team.teamInfo.teamName}&apos;s
                      Schedule
                    </h4>
                    <div className='h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={selectedTeamLuckAnalysis.othersDistChart}>
                          <XAxis
                            dataKey='wins'
                            label={{ value: 'Wins', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            label={{ value: '# of Teams', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={value => [value, '# of Teams']}
                            labelFormatter={wins => `${wins} Wins`}
                          />
                          <ReferenceLine
                            x={selectedTeamLuckAnalysis.actualWins}
                            stroke={colors.core.crimsonRed}
                            strokeWidth={2}
                            label={{ value: 'Actual', position: 'top' }}
                          />
                          <Bar dataKey='count'>
                            {selectedTeamLuckAnalysis.othersDistChart.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.isActual ? colors.core.crimsonRed : colors.rdylgn[6]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className='text-xs text-muted-foreground mt-2'>
                      Shows how many teams would achieve each win count with this team&apos;s
                      schedule
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='mt-6 text-sm bg-muted/20 rounded-md p-4'>
            <h4 className='font-semibold mb-2'>How to Read This Analysis</h4>
            <div className='space-y-2 text-muted-foreground'>
              <p>
                <strong>Hypothetical Records:</strong> Shows what each team's record would be by
                comparing their weekly scores against every other team's actual opponents.
              </p>
              <p>
                <strong>Luck Rating:</strong> Actual Win% - Expected Win% (based on point
                differential). Positive = team won more games than their scoring suggests they
                should have (lucky). Negative = team lost games despite outscoring expectations
                (unlucky).
              </p>
              <p>
                <strong>Distribution Charts:</strong> Show the range of possible outcomes with
                different schedules, with the red line indicating actual performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                      value: 'Average Points For',
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
                    label={{
                      value: 'Average Points Against',
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
                    shape={props => {
                      const { cx, cy, payload } = props;
                      if (!payload || !cx || !cy) return null;

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
                          .map(word => word[0])
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
                        value: `${position} Points For (Avg)`,
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
                      label={{
                        value: `${position} Points Against (Avg)`,
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
                      shape={props => {
                        const { cx, cy, payload } = props;
                        if (!payload || !cx || !cy) return null;

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
                            .map(word => word[0])
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
                        .filter(Boolean)
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
                          .filter(Boolean);

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
                  <D3RidgePlot
                    data={chartData}
                    domain={xDomain}
                    height={800}
                    title='Weekly Scores'
                  />
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
                    <D3RidgePlot
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
          setCurrentView(v as 'team' | 'league' | 'schedule' | 'trends' | 'scatter')
        }
      >
        <TabsList>
          <TabsTrigger value='team'>Team Analysis</TabsTrigger>
          <TabsTrigger value='league'>League View</TabsTrigger>
          <TabsTrigger value='schedule'>Schedule Analysis</TabsTrigger>
          <TabsTrigger value='trends'>Performance Trends</TabsTrigger>
          <TabsTrigger value='scatter'>Scatter Analysis</TabsTrigger>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='league'>
          <LeagueView />
        </TabsContent>

        <TabsContent value='schedule'>
          <ScheduleAnalysis />
        </TabsContent>

        <TabsContent value='trends'>
          <TrendsView />
        </TabsContent>

        <TabsContent value='scatter'>
          <ScatterAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
