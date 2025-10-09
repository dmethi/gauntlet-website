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
import { colors } from '../../../../../../brand/colors';
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { ScheduleAnalysisProps, TeamData, TeamInfo, TeamScore } from '@/features/stats';

// Utility function for mean calculation
const mean = (values: number[]): number => {
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
};

export const ScheduleAnalysis = ({ allTeamEntries, dataset }: ScheduleAnalysisProps) => {
  // State for selected team analysis
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>(
    allTeamEntries.length > 0 ? allTeamEntries[0][0] : '',
  );

  // Team options for dropdown
  const teamOptions = useMemo(() => {
    return allTeamEntries.map(([key, team]) => ({
      key,
      label: `${team.teamInfo.teamName} (${team.teamInfo.leagueName})`,
    }));
  }, [allTeamEntries]);
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
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r">
                  vs Opponent →
                </th>
                {teamsList.map(team => (
                  <th
                    key={team.key}
                    className="px-1 py-1 text-center border-r min-w-[60px]"
                    title={team.info.teamName}
                  >
                    <div className="transform -rotate-45 origin-center whitespace-nowrap text-xs">
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
                  <tr key={team.key} className="border-b">
                    <td className="sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r">
                      <div className="flex flex-col">
                        <span className="font-medium">{team.info.teamName}</span>
                        <span className="text-xs text-muted-foreground">
                          {team.info.leagueName}
                        </span>
                      </div>
                    </td>
                    {teamsList.map(opponent => {
                      if (team.key === opponent.key) {
                        return (
                          <td
                            key={opponent.key}
                            className="px-1 py-1 text-center border-r bg-muted/50"
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
                            className="px-1 py-1 text-center border-r bg-gray-50"
                          >
                            <span className="text-muted-foreground">—</span>
                          </td>
                        );
                      }

                      const winPct = total > 0 ? wins / total : 0;
                      const recordColor =
                        winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                      return (
                        <td
                          key={opponent.key}
                          className="px-1 py-1 text-center border-r"
                          style={{ backgroundColor: `${recordColor}20` }}
                        >
                          <div
                            className="font-mono text-xs font-medium"
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-md border p-3">
            <h4 className="font-semibold mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16a34a20' }}></div>
                <span>Winning record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ca8a0420' }}></div>
                <span>Even record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc262620' }}></div>
                <span>Losing record</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <h4 className="font-semibold mb-2">Analysis</h4>
            <p className="text-xs text-muted-foreground">
              Reveals schedule strength by showing how each team would perform with different
              opponents.
            </p>
          </div>

          <div className="rounded-md border p-3">
            <h4 className="font-semibold mb-2">Usage</h4>
            <p className="text-xs text-muted-foreground">
              Row team vs Column team schedule. &quot;5-2&quot; means Row team would be 5-2 if they
              faced Column team&apos;s opponents.
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            Hypothetical Records Summary
          </h3>

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-center">Record</th>
                  <th className="px-4 py-3 text-center">Win %</th>
                  <th className="px-4 py-3 text-center">Total Games</th>
                </tr>
              </thead>
              <tbody>
                {summaryStats.map((stat, index) => (
                  <tr key={stat.teamKey} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 text-center">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(index + 1, 24),
                          color: getTextColor(getRankColor(index + 1, 24)),
                        }}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{stat.teamInfo.teamName}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.teamInfo.leagueName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      {stat.totalWins}-{stat.totalLosses}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {(stat.winPct * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                      {stat.totalGames}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* League-by-League Breakdown */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AFC League */}
          <div>
            <h4 className="mb-3 text-base font-semibold" style={{ color: colors.core.crimsonRed }}>
              AFC League Analysis
            </h4>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-center">Rank</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-center">Record</th>
                    <th className="px-3 py-2 text-center">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {afcSummary.map((stat, index) => (
                    <tr key={stat.teamKey} className="border-t hover:bg-muted/20">
                      <td className="px-3 py-2 text-center">
                        <span
                          className="rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: getRankColor(index + 1, afcSummary.length),
                            color: getTextColor(getRankColor(index + 1, afcSummary.length)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{stat.teamInfo.teamName}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold">
                        {stat.totalWins}-{stat.totalLosses}
                      </td>
                      <td className="px-3 py-2 text-center font-mono">
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
            <h4 className="mb-3 text-base font-semibold" style={{ color: colors.core.crimsonRed }}>
              NFC League Analysis
            </h4>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-center">Rank</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-center">Record</th>
                    <th className="px-3 py-2 text-center">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {nfcSummary.map((stat, index) => (
                    <tr key={stat.teamKey} className="border-t hover:bg-muted/20">
                      <td className="px-3 py-2 text-center">
                        <span
                          className="rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: getRankColor(index + 1, nfcSummary.length),
                            color: getTextColor(getRankColor(index + 1, nfcSummary.length)),
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{stat.teamInfo.teamName}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold">
                        {stat.totalWins}-{stat.totalLosses}
                      </td>
                      <td className="px-3 py-2 text-center font-mono">
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
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            Schedule Difficulty Rankings
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Which schedules are hardest? Teams with lowest average win% had the toughest opponents.
          </p>

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-center">Difficulty Rank</th>
                  <th className="px-4 py-3 text-left">Schedule Owner</th>
                  <th className="px-4 py-3 text-center">Avg Win % vs This Schedule</th>
                  <th className="px-4 py-3 text-center">Games</th>
                </tr>
              </thead>
              <tbody>
                {scheduleDifficulty.map((sched, index) => (
                  <tr key={sched.scheduleOwnerKey} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 text-center">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(index + 1, 24),
                          color: getTextColor(getRankColor(index + 1, 24)),
                        }}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{sched.scheduleOwnerInfo.teamName}</div>
                      <div className="text-xs text-muted-foreground">
                        {sched.scheduleOwnerInfo.leagueName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
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
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                      {sched.totalGames}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* League-by-League Matrices */}
        <div className="mt-8 space-y-8">
          <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            League-by-League Schedule Analysis
          </h3>

          {/* AFC Matrix */}
          <div>
            <h4 className="mb-3 text-base font-semibold">AFC League (12×12 Matrix)</h4>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r">
                      AFC Team →
                    </th>
                    {afcTeams.map(([key, t]) => (
                      <th
                        key={key}
                        className="px-1 py-1 text-center border-r min-w-[50px]"
                        title={t.teamInfo.teamName}
                      >
                        <div className="transform -rotate-45 origin-center whitespace-nowrap text-xs">
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
                      <tr key={teamKey} className="border-b">
                        <td className="sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r text-xs">
                          {team.teamInfo.teamName}
                        </td>
                        {afcTeams.map(([opponentKey, _opponent]) => {
                          if (teamKey === opponentKey) {
                            return (
                              <td
                                key={opponentKey}
                                className="px-1 py-1 text-center border-r bg-muted/50"
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
                                className="px-1 py-1 text-center border-r bg-gray-50"
                              >
                                <span className="text-muted-foreground">—</span>
                              </td>
                            );
                          }

                          const winPct = total > 0 ? wins / total : 0;
                          const recordColor =
                            winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                          return (
                            <td
                              key={opponentKey}
                              className="px-1 py-1 text-center border-r"
                              style={{ backgroundColor: `${recordColor}20` }}
                            >
                              <div
                                className="font-mono text-xs font-medium"
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
            <h4 className="mb-3 text-base font-semibold">NFC League (12×12 Matrix)</h4>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-muted px-2 py-1 text-left border-r">
                      NFC Team →
                    </th>
                    {nfcTeams.map(([key, t]) => (
                      <th
                        key={key}
                        className="px-1 py-1 text-center border-r min-w-[50px]"
                        title={t.teamInfo.teamName}
                      >
                        <div className="transform -rotate-45 origin-center whitespace-nowrap text-xs">
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
                      <tr key={teamKey} className="border-b">
                        <td className="sticky left-0 z-10 bg-muted px-2 py-1 font-medium border-r text-xs">
                          {team.teamInfo.teamName}
                        </td>
                        {nfcTeams.map(([opponentKey, _opponent]) => {
                          if (teamKey === opponentKey) {
                            return (
                              <td
                                key={opponentKey}
                                className="px-1 py-1 text-center border-r bg-muted/50"
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
                                className="px-1 py-1 text-center border-r bg-gray-50"
                              >
                                <span className="text-muted-foreground">—</span>
                              </td>
                            );
                          }

                          const winPct = total > 0 ? wins / total : 0;
                          const recordColor =
                            winPct > 0.5 ? '#16a34a' : winPct === 0.5 ? '#ca8a04' : '#dc2626';

                          return (
                            <td
                              key={opponentKey}
                              className="px-1 py-1 text-center border-r"
                              style={{ backgroundColor: `${recordColor}20` }}
                            >
                              <div
                                className="font-mono text-xs font-medium"
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
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            League-Wide Luck Rankings
          </h3>

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-center">Luck Rank</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-center">Actual Record</th>
                  <th className="px-4 py-3 text-center">Expected Win%</th>
                  <th className="px-4 py-3 text-center">Point Diff</th>
                  <th className="px-4 py-3 text-center">Luck Rating</th>
                </tr>
              </thead>
              <tbody>
                {allTeamsLuckAnalysis.map((analysis, index) => (
                  <tr key={analysis.teamKey} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 text-center">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: getRankColor(index + 1, 24),
                          color: getTextColor(getRankColor(index + 1, 24)),
                        }}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{analysis.teamInfo.teamName}</div>
                      <div className="text-xs text-muted-foreground">
                        {analysis.teamInfo.leagueName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      {analysis.actualWins}-{analysis.actualGames - analysis.actualWins}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {(analysis.expectedWinPct * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
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
                    <td className="px-4 py-3 text-center">
                      <span
                        className="font-mono font-bold"
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
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
            Team Distribution Analysis
          </h3>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Select Team for Distribution Analysis
            </label>
            <Select value={selectedTeamKey} onValueChange={setSelectedTeamKey}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select team" />
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
            <div className="space-y-6">
              {/* Four-Metric Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-md border p-4">
                  <h4 className="font-semibold text-sm mb-2">Overall Strength</h4>
                  <div className="text-2xl font-bold" style={{ color: colors.core.regalGold }}>
                    {(selectedTeamLuckAnalysis.overallWinPct * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">vs all teams</div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="font-semibold text-sm mb-2">Current Performance</h4>
                  <div className="text-2xl font-bold" style={{ color: colors.core.regalGold }}>
                    {(selectedTeamLuckAnalysis.actualWinPct * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">with actual schedule</div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="font-semibold text-sm mb-2">Schedule Difficulty</h4>
                  <div className="text-2xl font-bold" style={{ color: colors.core.regalGold }}>
                    {(selectedTeamLuckAnalysis.othersWithMyScheduleAvg * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">others with this schedule</div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="font-semibold text-sm mb-2">Luck Rating</h4>
                  <div
                    className="text-2xl font-bold"
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
                  <div className="text-xs text-muted-foreground">
                    {selectedTeamLuckAnalysis.luckRating > 0.05
                      ? 'Lucky'
                      : selectedTeamLuckAnalysis.luckRating < -0.05
                        ? 'Unlucky'
                        : 'Neutral'}
                  </div>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team with different schedules */}
                <div className="rounded-md border p-4">
                  <h4 className="font-semibold mb-3">
                    {selectedTeamLuckAnalysis.team.teamInfo.teamName} with Different Schedules
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedTeamLuckAnalysis.myDistChart}>
                        <XAxis
                          dataKey="wins"
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
                        <Bar dataKey="count">
                          {selectedTeamLuckAnalysis.myDistChart.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.isActual ? colors.core.crimsonRed : colors.core.regalGold}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Shows how many schedules would result in each win count for this team
                  </p>
                </div>

                {/* Other teams with this schedule */}
                <div className="rounded-md border p-4">
                  <h4 className="font-semibold mb-3">
                    Other Teams with {selectedTeamLuckAnalysis.team.teamInfo.teamName}&apos;s
                    Schedule
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedTeamLuckAnalysis.othersDistChart}>
                        <XAxis
                          dataKey="wins"
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
                        <Bar dataKey="count">
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Shows how many teams would achieve each win count with this team&apos;s schedule
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm bg-muted/20 rounded-md p-4">
          <h4 className="font-semibold mb-2">How to Read This Analysis</h4>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <strong>Hypothetical Records:</strong> Shows what each team&apos;s record would be by
              comparing their weekly scores against every other team&apos;s actual opponents.
            </p>
            <p>
              <strong>Luck Rating:</strong> Actual Win% - Expected Win% (based on point
              differential). Positive = team won more games than their scoring suggests they should
              have (lucky). Negative = team lost games despite outscoring expectations (unlucky).
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
};
