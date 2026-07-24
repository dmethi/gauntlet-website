'use client';

import { useMemo, useState } from 'react';
import {
  TeamExpectedPerformanceChart,
  TeamPerformanceChart,
  TeamPositionalBarChart,
  TeamPositionalRadarChart,
} from '@/components/team-charts';
import {
  useLeagueData,
  useLeagueTransactions,
  useRosterDetails,
  useSeasonalAggregates,
  useTeamData,
} from '@/lib/hooks';
import type { LeagueData, LeagueTransactionsResponse, Roster } from '@/shared/types';
import { TeamTransactionsList } from '@/components/transactions';
import ContentLoader from 'react-content-loader';
import { Container, PageHeader } from '@gauntlet/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MatchupLink } from '@/components/matchup-link';
import { VALID_POSITIONS } from '@/lib/constants';
import Link from 'next/link';

const TeamPageLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={1000}
    viewBox="0 0 1200 1000"
    backgroundColor="hsl(var(--muted))"
    foregroundColor="hsl(var(--muted-foreground))"
  >
    {/* Title and Subtitle */}
    <rect x="16" y="32" rx="3" ry="3" width="400" height="36" />
    <rect x="16" y="72" rx="3" ry="3" width="200" height="20" />

    {/* Stat Cards */}
    <rect x="16" y="128" rx="8" ry="8" width="280" height="100" />
    <rect x="312" y="128" rx="8" ry="8" width="280" height="100" />
    <rect x="608" y="128" rx="8" ry="8" width="280" height="100" />
    <rect x="904" y="128" rx="8" ry="8" width="280" height="100" />

    {/* Weekly Performance Chart */}
    <rect x="16" y="260" rx="3" ry="3" width="300" height="28" />
    <rect x="16" y="300" rx="8" ry="8" width="1168" height="200" />

    {/* Expected vs Actual Chart */}
    <rect x="16" y="540" rx="3" ry="3" width="400" height="28" />
    <rect x="16" y="580" rx="8" ry="8" width="1168" height="200" />

    {/* Matchups Table */}
    <rect x="16" y="820" rx="3" ry="3" width="250" height="28" />
    <rect x="16" y="860" rx="8" ry="8" width="1168" height="120" />
  </ContentLoader>
);

export default function TeamPage({ params }: { params: { id: string } }) {
  const { team, loading, error } = useTeamData(params.id);
  const leagueIdForHooks = team?.league?.id ? String(team.league.id) : undefined;
  const { weeklyAverages, league } = useLeagueData(leagueIdForHooks);
  const seasonForHooks = team?.league?.season ? String(team.league.season) : undefined;
  const rosterIdForHooks = team?.id != null ? Number(team.id) : undefined;
  const { data: seasonal } = useSeasonalAggregates(leagueIdForHooks, seasonForHooks);
  const { data: rosterDetails } = useRosterDetails(leagueIdForHooks, rosterIdForHooks);
  const { data: tx } = useLeagueTransactions(leagueIdForHooks);
  const allowedPositions = useMemo(() => VALID_POSITIONS, []);
  const [compareTeamId, setCompareTeamId] = useState<number | undefined>(undefined);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TeamPageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <PageHeader title="Team not found" subtitle="Failed to load team data" />
      </Container>
    );
  }

  if (!team) {
    return (
      <Container className="py-8">
        <PageHeader title="Team not found" subtitle="No team data available" />
      </Container>
    );
  }

  const playoffStart = Number((team.league as LeagueData).playoff_week_start) || 15;

  const weeklyData = (team.weeklyMetrics ?? [])
    // Regular season only (Weeks 1–(playoffStart-1))
    .filter(metric => metric.week >= 1 && metric.week < playoffStart)
    .map(metric => ({
      week: metric.week,
      points: metric.totalPoints,
      expectedWins: metric.expectedWins,
      luckRating: metric.luckRating,
      opponentPoints: metric.opponentPoints,
      leagueAverage: weeklyAverages.find(w => w.week === metric.week)?.averagePoints,
    }));

  const totalPoints = (team.matchups ?? []).reduce((sum, matchup) => sum + matchup.points, 0);
  const averagePoints = totalPoints / ((team.matchups ?? []).length || 1);
  // Compute regular-season record using dynamic playoff start if available
  const regularSeasonWeeks = (team.weeklyMetrics ?? []).filter(
    wm => wm.week >= 1 && wm.week < playoffStart,
  );
  const totalExpectedWins = regularSeasonWeeks.reduce(
    (sum, metric) => sum + metric.expectedWins,
    0,
  );
  const totalLuckRating = regularSeasonWeeks.reduce((sum, metric) => sum + metric.luckRating, 0);
  const wins = regularSeasonWeeks.reduce(
    (count, wm) => count + (wm.totalPoints > wm.opponentPoints ? 1 : 0),
    0,
  );
  const losses = regularSeasonWeeks.reduce(
    (count, wm) => count + (wm.totalPoints <= wm.opponentPoints ? 1 : 0),
    0,
  );

  const getTeamName = () =>
    team.owner?.metadata?.team_name ||
    team.owner?.displayName ||
    team.owner?.username ||
    `Team ${team.id}`;

  const getAvatarUrl = () => {
    // Prioritize team avatar from metadata over user avatar
    const metadata = team.owner?.metadata as Record<string, unknown> | undefined;
    const teamAvatar = metadata?.avatar as string | undefined;
    const userAvatar = team.owner?.avatar;

    const avatar = teamAvatar || userAvatar;
    if (!avatar) return undefined;
    if (avatar.startsWith('http')) return avatar;
    return `https://sleepercdn.com/avatars/${avatar}`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase();
  };

  // formatTransactionType moved to shared component

  // Get all owners for this team (primary + co-owners)
  const getAllOwners = (team: Roster) => {
    const owners: string[] = [];

    // Add primary owner
    if (team.owner) {
      const primaryOwner = team.owner.displayName || team.owner.username || 'Unknown';
      owners.push(primaryOwner);
    }

    // Add co-owners
    if (team.coOwnerDetails && team.coOwnerDetails.length > 0) {
      team.coOwnerDetails.forEach(coOwner => {
        const coOwnerName = coOwner.displayName || coOwner.username || 'Unknown Co-owner';
        owners.push(coOwnerName);
      });
    }

    return owners;
  };

  // Format owners for display
  const formatOwners = (owners: string[]) => {
    if (owners.length === 0) return 'Unknown';
    if (owners.length === 1) return `Owner: ${owners[0]}`;
    if (owners.length === 2) return `Owners: ${owners[0]} & ${owners[1]}`;
    return `Owners: ${owners.slice(0, -1).join(', ')} & ${owners[owners.length - 1]}`;
  };

  const name = getTeamName();
  const allOwners = getAllOwners(team);
  const ownersText = formatOwners(allOwners);
  const avatarUrl = getAvatarUrl();
  const initials = getInitials(name);

  return (
    <Container className="py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-base font-semibold flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${name} avatar`}
                className="h-full w-full aspect-square object-cover rounded-full"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <PageHeader title={name} subtitle={`League: ${team.league?.name} • ${ownersText}`} />
            {team.ownerId && (
              <Link
                href={`/managers/${team.ownerId}`}
                className="text-sm text-gauntlet-crimson hover:underline"
              >
                View manager's career history &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Points</h3>
          <p className="text-3xl font-bold">{totalPoints.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Avg: {averagePoints.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Expected Wins</h3>
          <p className="text-3xl font-bold">{totalExpectedWins.toFixed(1)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Luck Rating</h3>
          <p className="text-3xl font-bold">{totalLuckRating.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Record</h3>
          <p className="text-3xl font-bold">
            {wins}-{losses}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Weekly Performance</h2>
        <TeamPerformanceChart weeklyData={weeklyData} teamId={team.id} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Expected vs Actual Performance</h2>
        <TeamExpectedPerformanceChart weeklyData={weeklyData} teamId={team.id} />
      </div>

      {/* Positional Scoring (Regular Season) */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Positional Scoring</h2>
        {seasonal?.ok ? (
          (() => {
            const rows = seasonal.data.rosterWeekAggregates
              .filter(
                r => r.rosterId === Number(team.id) && r.week >= 1 && r.week < Number(playoffStart),
              )
              .reduce<Record<string, { team: number; opponent: number }>>((acc, r) => {
                const pos = (r.positionalPoints as Record<string, number>) || {};
                const opp = (r.opponentPositionalPoints as Record<string, number>) || {};
                for (const p of Object.keys(pos)) {
                  // Filter out unknown positions like 'UNK'
                  if (!VALID_POSITIONS.includes(p as (typeof VALID_POSITIONS)[number])) continue;
                  if (!acc[p]) acc[p] = { team: 0, opponent: 0 };
                  acc[p].team += Number(pos[p] ?? 0);
                }
                for (const p of Object.keys(opp)) {
                  if (!VALID_POSITIONS.includes(p as (typeof VALID_POSITIONS)[number])) continue;
                  if (!acc[p]) acc[p] = { team: 0, opponent: 0 };
                  acc[p].opponent += Number(opp[p] ?? 0);
                }
                return acc;
              }, {});

            // League averages per position (average per roster across regular season)
            const rosterIds = Array.from(
              new Set<number>(seasonal.data.rosterWeekAggregates.map(r => r.rosterId)).values(),
            );
            const perRosterTotals: Record<number, Record<string, number>> = {};
            for (const rid of rosterIds) perRosterTotals[rid] = {};
            seasonal.data.rosterWeekAggregates
              .filter(r => r.week >= 1 && r.week < Number(playoffStart))
              .forEach(r => {
                const pos = (r.positionalPoints as Record<string, number>) || {};
                for (const p of Object.keys(pos)) {
                  if (!VALID_POSITIONS.includes(p as (typeof VALID_POSITIONS)[number])) continue;
                  perRosterTotals[r.rosterId][p] =
                    (perRosterTotals[r.rosterId][p] ?? 0) + Number(pos[p] ?? 0);
                }
              });
            const leagueAverages: Record<string, number> = {};
            const allPositions = Array.from(
              new Set<string>(
                rosterIds.flatMap(rid => Object.keys(perRosterTotals[rid] || {})),
              ).values(),
            );
            for (const p of allPositions) {
              let sum = 0;
              let count = 0;
              for (const rid of rosterIds) {
                if (perRosterTotals[rid][p] != null) {
                  sum += perRosterTotals[rid][p];
                  count += 1;
                }
              }
              leagueAverages[p] = count > 0 ? sum / count : 0;
            }

            const positionalRows = VALID_POSITIONS.map(position => ({
              position,
              team: Number(rows[position]?.team ?? 0),
              opponent: Number(rows[position]?.opponent ?? 0),
              leagueAverage: Number(leagueAverages[position] ?? 0),
            }));

            // Normalized radar values 0..1 across league for the same positions
            const perPositionTotalsForAll: Record<string, number[]> = {};
            for (const p of Object.keys(leagueAverages)) perPositionTotalsForAll[p] = [];
            for (const rid of rosterIds) {
              for (const p of Object.keys(leagueAverages)) {
                perPositionTotalsForAll[p].push(perRosterTotals[rid][p] ?? 0);
              }
            }
            const radarData = positionalRows.map(row => {
              const arr = perPositionTotalsForAll[row.position] ?? [0];
              const min = Math.min(...arr);
              const max = Math.max(...arr);
              const value = max > min ? (row.team - min) / (max - min) : 0;
              return { position: row.position, value };
            });

            // Optional comparison team overlay
            let comparisons:
              | { name: string; color: string; data: { position: string; value: number }[] }[]
              | undefined;
            if (compareTeamId && rosterIds.includes(compareTeamId)) {
              const compareTotals: Record<string, number> = {};
              seasonal.data.rosterWeekAggregates
                .filter(
                  r => r.rosterId === compareTeamId && r.week >= 1 && r.week < Number(playoffStart),
                )
                .forEach(r => {
                  const pos = (r.positionalPoints as Record<string, number>) || {};
                  for (const p of Object.keys(pos)) {
                    if (!allowedPositions.includes(p as (typeof VALID_POSITIONS)[number])) continue;
                    compareTotals[p] = (compareTotals[p] ?? 0) + Number(pos[p] ?? 0);
                  }
                });
              const compData = positionalRows.map(row => {
                const arr = perPositionTotalsForAll[row.position] ?? [0];
                const min = Math.min(...arr);
                const max = Math.max(...arr);
                const raw = compareTotals[row.position] ?? 0;
                const value = max > min ? (raw - min) / (max - min) : 0;
                return { position: row.position, value };
              });
              const compRoster = league?.rosters.find(r => Number(r.id) === Number(compareTeamId));
              const compName =
                compRoster?.owner?.metadata?.team_name ||
                compRoster?.owner?.displayName ||
                compRoster?.owner?.username ||
                `Team ${compareTeamId}`;
              comparisons = [
                { name: String(compName), color: 'hsl(var(--chart-2))', data: compData },
              ];
            }

            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  {league ? (
                    <label className="text-sm text-muted-foreground">
                      Compare:&nbsp;
                      <select
                        className="border border-border rounded px-2 py-1 bg-background"
                        value={compareTeamId ?? ''}
                        onChange={e =>
                          setCompareTeamId(e.target.value ? Number(e.target.value) : undefined)
                        }
                      >
                        <option value="">None</option>
                        {league.rosters
                          .filter(r => r.id !== team.id)
                          .map(r => {
                            const nm =
                              r.owner?.metadata?.team_name ||
                              r.owner?.displayName ||
                              r.owner?.username ||
                              `Team ${r.id}`;
                            return (
                              <option key={r.id} value={r.id}>
                                {nm}
                              </option>
                            );
                          })}
                      </select>
                    </label>
                  ) : null}
                </div>
                <TeamPositionalBarChart data={positionalRows} teamId={team.id} />
                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-semibold">Normalized Positional Strength</h3>
                  <TeamPositionalRadarChart
                    data={radarData}
                    teamName={name}
                    teamId={team.id}
                    comparisons={comparisons}
                  />
                </div>
              </>
            );
          })()
        ) : (
          <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading positional aggregates…
          </div>
        )}
      </div>

      {/* Roster: starters and bench */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Roster</h2>
        {rosterDetails ? (
          <div className="space-y-6">
            {/* Starters */}
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border bg-muted/30 px-4 py-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Starting Lineup ({rosterDetails.starters.length})
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rosterDetails.starters.map(pid => {
                    const p = rosterDetails.players.find(pl => pl.id === pid);
                    if (!p) return null;

                    const getPositionColor = (position: string) => {
                      const colors = {
                        QB: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                        RB: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                        WR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                        TE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
                        K: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                        DEF: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                      };
                      return colors[position as keyof typeof colors] || colors.DEF;
                    };

                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${getPositionColor(p.position)}`}
                        >
                          {p.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{p.fullName}</div>
                          {p.team && <div className="text-xs text-muted-foreground">{p.team}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bench */}
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border bg-muted/30 px-4 py-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  Bench (
                  {
                    rosterDetails.players.filter(pl => !rosterDetails.starters.includes(pl.id))
                      .length
                  }
                  )
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rosterDetails.players
                    .filter(pl => !rosterDetails.starters.includes(pl.id))
                    .map(p => {
                      const getPositionColor = (position: string) => {
                        const colors = {
                          QB: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                          RB: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                          WR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                          TE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
                          K: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                          DEF: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                        };
                        return colors[position as keyof typeof colors] || colors.DEF;
                      };

                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors opacity-75"
                        >
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${getPositionColor(p.position)}`}
                          >
                            {p.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{p.fullName}</div>
                            {p.team && (
                              <div className="text-xs text-muted-foreground">{p.team}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Roster Summary */}
            <div className="rounded-md border border-border bg-card p-4">
              <h3 className="text-lg font-semibold mb-3">Roster Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => {
                  const positionPlayers = rosterDetails.players.filter(
                    p => p.position === position,
                  );
                  const starters = positionPlayers.filter(p =>
                    rosterDetails.starters.includes(p.id),
                  ).length;
                  const bench = positionPlayers.length - starters;

                  return (
                    <div key={position} className="p-3 rounded-lg bg-muted/30">
                      <div className="text-sm font-medium text-muted-foreground">{position}</div>
                      <div className="text-lg font-bold">{positionPlayers.length}</div>
                      <div className="text-xs text-muted-foreground">
                        {starters}S / {bench}B
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading roster…
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-2xl font-bold">Weekly Matchups</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click on a week to view the full matchup breakdown with player details and analytics.
        </p>
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Opp. Points</TableHead>
                <TableHead>League Avg</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(team.matchups ?? [])
                .filter(m => m.week >= 1 && m.week <= 14)
                .map(matchup => {
                  const weekData = weeklyData.find(w => w.week === matchup.week);
                  const leagueAvgForWeek = weeklyAverages.find(
                    w => w.week === matchup.week,
                  )?.averagePoints;
                  const leagueAvgCell =
                    typeof leagueAvgForWeek === 'number' ? leagueAvgForWeek.toFixed(2) : '—';
                  return (
                    <TableRow key={`reg-${matchup.week}`} className="hover:bg-muted/50">
                      <TableCell>
                        <MatchupLink
                          matchupId={matchup.matchupId || matchup.week} // Use actual matchupId from data
                          week={matchup.week}
                          variant="compact"
                          className="font-medium"
                        />
                      </TableCell>
                      <TableCell>{matchup.points.toFixed(2)}</TableCell>
                      <TableCell>{weekData ? weekData.opponentPoints.toFixed(2) : '—'}</TableCell>
                      <TableCell>{leagueAvgCell}</TableCell>
                      <TableCell>
                        {!weekData ||
                        weekData.opponentPoints === 0 ||
                        weekData.opponentPoints == null
                          ? 'Bye'
                          : matchup.points > weekData.opponentPoints
                            ? 'Win'
                            : 'Loss'}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {(team.matchups ?? []).some(
                m => m.week >= playoffStart && m.week <= playoffStart + 2,
              ) && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted/40 text-xs uppercase tracking-wider">
                    Playoffs (Weeks {playoffStart}–{playoffStart + 2})
                  </TableCell>
                </TableRow>
              )}

              {(team.matchups ?? [])
                .filter(m => m.week >= playoffStart && m.week <= playoffStart + 2)
                .map(matchup => {
                  // Use authoritative weekly metrics for playoff weeks (weeklyData is regular-season-only)
                  const playoffWeek = (team.weeklyMetrics ?? []).find(
                    wm => wm.week === matchup.week,
                  );
                  const weekData = playoffWeek
                    ? { opponentPoints: playoffWeek.opponentPoints }
                    : undefined;
                  const leagueAvgForWeek = weeklyAverages.find(
                    w => w.week === matchup.week,
                  )?.averagePoints;
                  const leagueAvgCell =
                    typeof leagueAvgForWeek === 'number' ? leagueAvgForWeek.toFixed(2) : '—';
                  return (
                    <TableRow key={`po-${matchup.week}`} className="hover:bg-muted/50">
                      <TableCell>
                        <MatchupLink
                          matchupId={matchup.matchupId || matchup.week} // Use actual matchupId from data
                          week={matchup.week}
                          variant="compact"
                          className="font-medium"
                        />
                      </TableCell>
                      <TableCell>{matchup.points.toFixed(2)}</TableCell>
                      <TableCell>{weekData ? weekData.opponentPoints.toFixed(2) : '—'}</TableCell>
                      <TableCell>{leagueAvgCell}</TableCell>
                      <TableCell>
                        {!weekData ||
                        weekData.opponentPoints === 0 ||
                        weekData.opponentPoints == null
                          ? 'Bye'
                          : matchup.points > weekData.opponentPoints
                            ? 'Win'
                            : 'Loss'}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-2xl font-bold">Transactions</h2>
        <div className="rounded-md border border-border bg-card px-4 py-1">
          {tx?.ok ? (
            (() => {
              const teamId = Number(team.id);
              let originalId: number;
              if (teamId >= 2000) {
                originalId = teamId - 2000; // NFC: 2001 -> 1, 2012 -> 12
              } else if (teamId >= 1000) {
                originalId = teamId - 1000; // AFC: 1001 -> 1, 1012 -> 12
              } else {
                originalId = teamId; // Fallback
              }

              const filteredTransactions = tx.data
                .filter((t: LeagueTransactionsResponse['data'][number]) => {
                  // Handle both unique roster IDs and original Sleeper IDs (1-12)
                  if (!Array.isArray(t.rosterIds)) return false;

                  // Check if transaction includes this team's unique ID or original Sleeper ID
                  return t.rosterIds.includes(teamId) || t.rosterIds.includes(originalId);
                })
                .slice(0, 20) as unknown as Parameters<
                typeof TeamTransactionsList
              >[0]['transactions'];

              return (
                <TeamTransactionsList
                  transactions={filteredTransactions}
                  league={team.league as Parameters<typeof TeamTransactionsList>[0]['league']}
                />
              );
            })()
          ) : (
            <div className="text-sm text-muted-foreground">
              {tx ? 'No transactions found.' : 'Loading transactions...'}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
