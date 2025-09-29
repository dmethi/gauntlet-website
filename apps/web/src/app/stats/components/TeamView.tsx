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
import { rank } from '@/lib/stats/ranks';
import { getRankColor } from '../utils/getRankColor';
import { getTextColor } from '../utils/getTextColor';
import { getTeamPositionalSummary } from '@/lib/stats/positional-advantages';
import { PlayerBreakdownRow } from '@/components/stats/PlayerBreakdown';
import type { PlainStatsDataset } from '@/lib/stats/compose';
import { mean, median } from '@/lib/stats/medians';

// Define proper types
interface TeamInfo {
  teamName: string;
  leagueName: string;
  leagueId: string;
  rosterId: number;
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

interface PlayerScore {
  week: number;
  value: number;
}

interface PositionTeamData {
  teamInfo: TeamInfo;
  scores: PlayerScore[];
}

interface PositionData {
  teams: [string, PositionTeamData][];
  // Add other properties as needed
}

interface TeamViewProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  dataset: PlainStatsDataset;
  fromWeek: number;
  toWeek: number;
  availableWeeks: number[];
}

// Helper function to get performance color
const getPerformanceColor = (value: number, isPositive: boolean) => {
  if (value === 0) return colors.rdylgn[5];
  return isPositive ? colors.rdylgn[8] : colors.rdylgn[2];
};

export function TeamView({
  allTeamEntries,
  positionsMap,
  dataset,
  fromWeek,
  toWeek,
  availableWeeks,
}: TeamViewProps) {
  // State management
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>(
    allTeamEntries.length > 0 ? allTeamEntries[0][0] : ''
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Build team options
  const teamOptions = useMemo(() => {
    return allTeamEntries.map(([key, teamData]) => ({
      key,
      label: `${teamData.teamInfo.teamName} (${teamData.teamInfo.leagueName})`,
    }));
  }, [allTeamEntries]);

  // Find selected team data
  const selectedTeamData = useMemo(() => {
    return allTeamEntries.find(([key]) => key === selectedTeamKey)?.[1];
  }, [allTeamEntries, selectedTeamKey]);

  // Build processed data
  const processedData = useMemo(() => {
    if (!selectedTeamData) return null;

    const t = selectedTeamData;
    const leagueId = t.teamInfo.leagueId;
    const weeks = availableWeeks.filter(w => w >= fromWeek && w <= toWeek);

    // Calculate team totals
    const teamTotal = t.teamScores
      .filter(d => d.week >= fromWeek && d.week <= toWeek && d.value > 0)
      .reduce((a, d) => a + d.value, 0);
    const oppTotal = t.opponentScores
      .filter(d => d.week >= fromWeek && d.week <= toWeek && d.value > 0)
      .reduce((a, d) => a + d.value, 0);

    const gamesPlayed = t.teamScores.filter(
      d => d.week >= fromWeek && d.week <= toWeek && d.value > 0
    ).length;

    // Calculate league stats
    const leagueTotals = allTeamEntries.map(([, tt]) =>
      tt.teamScores
        .filter(d => d.week >= fromWeek && d.week <= toWeek && d.value > 0)
        .reduce((a, d) => a + d.value, 0)
    );

    const leagueAvgByWeek = weeks.map(week => {
      const weeklyScores = allTeamEntries
        .map(([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0)
        .filter(score => score > 0);
      return mean(weeklyScores);
    });

    const leagueMedByWeek = weeks.map(week => {
      const weeklyScores = allTeamEntries
        .map(([, tt]) => tt.teamScores.find(d => d.week === week)?.value || 0)
        .filter(score => score > 0);
      return median(weeklyScores);
    });

    // Calculate rankings
    const ranks24 = rank(leagueTotals);
    const seasonRank24 = ranks24[allTeamEntries.findIndex(([k]) => k === selectedTeamKey)] || 0;

    const leagueTeams = allTeamEntries.filter(([, tt]) => tt.teamInfo.leagueId === leagueId);
    const leagueTotalsOnly = leagueTeams.map(([, tt]) =>
      tt.teamScores
        .filter(d => d.week >= fromWeek && d.week <= toWeek && d.value > 0)
        .reduce((a, d) => a + d.value, 0)
    );
    const ranksLeague = rank(leagueTotalsOnly);
    const seasonRankLeague =
      ranksLeague[leagueTeams.findIndex(([k]) => k === selectedTeamKey)] || 0;

    // Calculate average opponent rank
    const avgOppRank =
      weeks.reduce((sum, week) => {
        const myOppScore = t.opponentScores.find(d => d.week === week)?.value || 0;
        if (myOppScore === 0) return sum;

        // Find opponent by matching their score to my opponent score
        const weeklyScores = allTeamEntries.map(([key, tt]) => ({
          key,
          score: tt.teamScores.find(d => d.week === week)?.value || 0,
        }));
        const weeklyRanks = rank(weeklyScores.map(s => s.score));

        const oppData = weeklyScores.find(
          s => s.key !== selectedTeamKey && Math.abs(s.score - myOppScore) < 0.01
        );
        if (oppData) {
          const oppIndex = weeklyScores.findIndex(s => s.key === oppData.key);
          return sum + (weeklyRanks[oppIndex] || 0);
        }
        return sum;
      }, 0) / gamesPlayed;

    return {
      t,
      leagueId,
      weeks,
      teamTotal,
      oppTotal,
      gamesPlayed,
      leagueTotals,
      leagueAvgByWeek,
      leagueMedByWeek,
      seasonRank24,
      seasonRankLeague,
      avgOppRank,
    };
  }, [selectedTeamData, allTeamEntries, selectedTeamKey, fromWeek, toWeek, availableWeeks]);

  if (!processedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Analysis</CardTitle>
          <CardDescription>Season totals and weekly breakdown for individual teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground'>No team data available</div>
        </CardContent>
      </Card>
    );
  }

  const {
    t,
    leagueId,
    weeks,
    teamTotal,
    oppTotal,
    gamesPlayed,
    leagueTotals,
    leagueAvgByWeek,
    leagueMedByWeek,
    seasonRank24,
    seasonRankLeague,
    avgOppRank,
  } = processedData;

  // Get positions for rendering
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[];
  return (
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
                        color: getPerformanceColor(teamTotal - oppTotal, teamTotal - oppTotal > 0),
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

                    // Rankings calculated for weekly breakdown
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
                  .filter((d: PlayerScore) => d.week >= fromWeek && d.week <= toWeek)
                  .reduce((a: number, d: PlayerScore) => a + d.value, 0);
                const posValidWeeks = teamPosData.scores.filter(
                  (d: PlayerScore) => d.week >= fromWeek && d.week <= toWeek && d.value > 0
                );
                const posGamesPlayed = posValidWeeks.length;

                // Calculate league averages and ranks for this position
                const allPosTeams = Array.from(posTeamsMap.values());
                const allPosTotals = allPosTeams.map((pt: PositionTeamData) =>
                  pt.scores
                    .filter((d: PlayerScore) => d.week >= fromWeek && d.week <= toWeek)
                    .reduce((a: number, d: PlayerScore) => a + d.value, 0)
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

                const leaguePosTeams = allPosTeams.filter(pt => pt.teamInfo.leagueId === leagueId);
                const leaguePosTotals = leaguePosTeams.map((pt: PositionTeamData) =>
                  pt.scores
                    .filter((d: PlayerScore) => d.week >= fromWeek && d.week <= toWeek)
                    .reduce((a: number, d: PlayerScore) => a + d.value, 0)
                );
                const posRanksLeague = rank(leaguePosTotals);
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
                  const myOppData = weeklyTeamEntry?.[1].opponentScores.find(d => d.week === week);

                  // Find opponent by matching scores in reverse (my opponent = who scored my opponent points)
                  const opponentEntry = allTeamEntries.find(([k, tt]) => {
                    const theirScore = tt.teamScores.find(d => d.week === week)?.value;
                    return (
                      k !== selectedTeamKey &&
                      Math.abs((theirScore || 0) - (myOppData?.value || 0)) < 0.01
                    );
                  });

                  const opponentPosData = opponentEntry ? posTeamsMap.get(opponentEntry[0]) : null;
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
                                teamPosData.scores.find((d: PlayerScore) => d.week === week)
                                  ?.value || 0;

                              if (myPosPoints === 0) return [];

                              const rowKey = `${position}-${week}`;
                              const isExpanded = expandedRows.has(rowKey);

                              // Get opponent positional data for this week
                              const oppWeekData = myWeeklyOpponentData.find(d => d.week === week);
                              const oppPosPoints = oppWeekData?.oppPosScore || 0;

                              // Calculate weekly ranks for this position
                              const allWeeklyPosVals = allPosTeams.map(
                                (pt: PositionTeamData) =>
                                  pt.scores.find((d: PlayerScore) => d.week === week)?.value || 0
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
                                (pt: PositionTeamData) =>
                                  pt.scores.find((d: PlayerScore) => d.week === week)?.value || 0
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
                                        color: getTextColor(getRankColor(weeklyPosRankLeague, 12)),
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
            <h3 className='mb-3 text-lg font-semibold' style={{ color: colors.core.crimsonRed }}>
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
                        Object.entries(teamSummary.positions) as Array<
                          [
                            TrackedPosition,
                            {
                              weeklyAverage: number;
                              leagueMedian: number;
                              advantage: number;
                              percentageAdvantage: number;
                              rank: number;
                            },
                          ]
                        >
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
  );
}
