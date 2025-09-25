'use client';

import { useMemo, useState } from 'react';
import type { PlainStatsDataset } from '@/lib/stats/compose';
import type { TrackedPosition } from '@/lib/stats/positions';
import { mean, median } from '@/lib/stats/medians';
import { rank } from '@/lib/stats/ranks';
import { colors } from '../../../../../brand/colors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  };
  leagues: Array<{ id: string; name: string; season: number }>;
}

// Helper functions for RdYlGn color mapping
function getRdYlGnColor(value: number, min: number, max: number, invert = false): string {
  if (max === min) return colors.rdylgn[5]; // neutral yellow if no range

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const adjustedValue = invert ? 1 - normalized : normalized;
  const colorIndex = Math.floor(adjustedValue * (colors.rdylgn.length - 1));
  return colors.rdylgn[colorIndex];
}

function getPerformanceColor(value: number, isPositive: boolean): string {
  if (value === 0) return colors.rdylgn[5]; // neutral
  return isPositive ? colors.rdylgn[8] : colors.rdylgn[2]; // green or red
}

function getRankColor(rank: number, total: number): string {
  const percentile = (total - rank + 1) / total;
  if (percentile >= 0.8) return colors.rdylgn[9]; // top 20% - dark green
  if (percentile >= 0.6) return colors.rdylgn[7]; // top 40% - light green
  if (percentile >= 0.4) return colors.rdylgn[5]; // middle 20% - yellow
  if (percentile >= 0.2) return colors.rdylgn[3]; // bottom 40% - orange
  return colors.rdylgn[1]; // bottom 20% - red
}

function getTextColor(backgroundColor: string): string {
  // Determine if text should be white or black based on background brightness
  // For yellow/orange colors, use black text. For green/red, use white text.
  const lightColors = [colors.rdylgn[3], colors.rdylgn[4], colors.rdylgn[5], colors.rdylgn[6]]; // orange and yellow range
  return lightColors.includes(backgroundColor) ? '#000000' : '#ffffff';
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

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Team Analysis</CardTitle>
          <CardDescription>Season totals and weekly breakdown for individual teams</CardDescription>
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
              <h3 className='mb-3 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
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
              <h3 className='mb-3 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
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
                        console.log(`[DEBUG] Week ${week} rankings for ${t.teamInfo.teamName}`, {
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
                        });
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
              <h3 className='mb-3 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
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
                              {weeks.map(week => {
                                const myPosPoints =
                                  teamPosData.scores.find(d => d.week === week)?.value || 0;

                                if (myPosPoints === 0) return null;

                                // Get opponent positional data for this week
                                const oppWeekData = myWeeklyOpponentData.find(d => d.week === week);
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
                                          pt.teamInfo.rosterId === parseInt(oppKey.split('-')[1])
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
                                          pt.teamInfo.rosterId === parseInt(oppKey.split('-')[1])
                                        );
                                      })
                                    ] || 0
                                  : 0;

                                const weeklyPosAvg = mean(allWeeklyPosVals);
                                const weeklyPosMedian = median(allWeeklyPosVals);
                                const vsAvg = myPosPoints - weeklyPosAvg;
                                const vsMedian = myPosPoints - weeklyPosMedian;

                                return (
                                  <tr key={week} className='border-t hover:bg-muted/10'>
                                    <td className='px-3 py-2 font-medium'>Week {week}</td>
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
                                          color: getTextColor(getRankColor(weeklyPosRank24, 24)),
                                        }}
                                      >
                                        {weeklyPosRank24}
                                      </span>
                                    </td>
                                    <td className='px-3 py-2 text-center'>
                                      <span
                                        className='rounded-full px-2 py-1 text-xs font-medium'
                                        style={{
                                          backgroundColor: getRankColor(weeklyPosRankLeague, 12),
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
                                          color: getTextColor(getRankColor(oppWeeklyPosRank24, 24)),
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
                                          backgroundColor: getRankColor(oppWeeklyPosRankLeague, 12),
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
                                      style={{ color: getPerformanceColor(vsMedian, vsMedian > 0) }}
                                    >
                                      {vsMedian > 0 ? '+' : ''}
                                      {vsMedian.toFixed(1)}
                                    </td>
                                  </tr>
                                );
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
    </div>
  );
}
