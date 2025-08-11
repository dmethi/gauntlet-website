'use client';

import { useMemo, useState } from 'react';
import {
  TeamExpectedPerformanceChart,
  TeamPerformanceChart,
  TeamPositionalBarChart,
  TeamPositionalRadarChart,
} from '@/components/team-charts';
import {
  LeagueTransactionsResponse,
  useLeagueData,
  useLeagueTransactions,
  useRosterDetails,
  useSeasonalAggregates,
  useTeamData,
} from '@/lib/hooks';
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

const TeamPageLoader = () => (
  <ContentLoader
    speed={2}
    width={1200}
    height={1000}
    viewBox='0 0 1200 1000'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
  >
    {/* Title and Subtitle */}
    <rect x='16' y='32' rx='3' ry='3' width='400' height='36' />
    <rect x='16' y='72' rx='3' ry='3' width='200' height='20' />

    {/* Stat Cards */}
    <rect x='16' y='128' rx='8' ry='8' width='280' height='100' />
    <rect x='312' y='128' rx='8' ry='8' width='280' height='100' />
    <rect x='608' y='128' rx='8' ry='8' width='280' height='100' />
    <rect x='904' y='128' rx='8' ry='8' width='280' height='100' />

    {/* Weekly Performance Chart */}
    <rect x='16' y='260' rx='3' ry='3' width='300' height='28' />
    <rect x='16' y='300' rx='8' ry='8' width='1168' height='200' />

    {/* Expected vs Actual Chart */}
    <rect x='16' y='540' rx='3' ry='3' width='400' height='28' />
    <rect x='16' y='580' rx='8' ry='8' width='1168' height='200' />

    {/* Matchups Table */}
    <rect x='16' y='820' rx='3' ry='3' width='250' height='28' />
    <rect x='16' y='860' rx='8' ry='8' width='1168' height='120' />
  </ContentLoader>
);

export default function TeamPage({ params }: { params: { id: string } }) {
  const { team, loading, error } = useTeamData(params.id);
  const { weeklyAverages, league } = useLeagueData();
  const leagueIdForHooks = team?.league?.id ? String(team.league.id) : undefined;
  const seasonForHooks = team?.league?.season ? String(team.league.season) : undefined;
  const rosterIdForHooks = team?.id != null ? Number(team.id) : undefined;
  const { data: seasonal } = useSeasonalAggregates(leagueIdForHooks, seasonForHooks);
  const { data: rosterDetails } = useRosterDetails(leagueIdForHooks, rosterIdForHooks);
  const { data: tx } = useLeagueTransactions(leagueIdForHooks);
  const allowedPositions = useMemo(() => ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'], []);
  const [compareTeamId, setCompareTeamId] = useState<number | undefined>(undefined);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <TeamPageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Container className='py-8'>
        <PageHeader title='Team not found' subtitle='Failed to load team data' />
      </Container>
    );
  }

  if (!team) {
    return (
      <Container className='py-8'>
        <PageHeader title='Team not found' subtitle='No team data available' />
      </Container>
    );
  }

  const playoffStart = Number((team.league as any)?.playoff_week_start) || 15;

  const weeklyData = team.weeklyMetrics
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

  const totalPoints = team.matchups.reduce((sum, matchup) => sum + matchup.points, 0);
  const averagePoints = totalPoints / (team.matchups.length || 1);
  // Compute regular-season record using dynamic playoff start if available
  const regularSeasonWeeks = team.weeklyMetrics.filter(
    wm => wm.week >= 1 && wm.week < playoffStart
  );
  const totalExpectedWins = regularSeasonWeeks.reduce(
    (sum, metric) => sum + metric.expectedWins,
    0
  );
  const totalLuckRating = regularSeasonWeeks.reduce((sum, metric) => sum + metric.luckRating, 0);
  const wins = regularSeasonWeeks.reduce(
    (count, wm) => count + (wm.totalPoints > wm.opponentPoints ? 1 : 0),
    0
  );
  const losses = regularSeasonWeeks.reduce(
    (count, wm) => count + (wm.totalPoints <= wm.opponentPoints ? 1 : 0),
    0
  );

  const getTeamName = () =>
    team.owner?.metadata?.team_name ||
    team.owner?.displayName ||
    team.owner?.username ||
    `Team ${team.id}`;

  const getAvatarUrl = (avatar?: string | null) => {
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

  const name = getTeamName();
  const ownerName = team.owner?.displayName || team.owner?.username || 'Unknown';
  const avatarUrl = getAvatarUrl(team.owner?.avatar);
  const initials = getInitials(name);

  return (
    <Container className='py-8'>
      <div className='flex items-start justify-between gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <div className='h-14 w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-base font-semibold'>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${name} avatar`}
                className='h-full w-full aspect-square object-cover rounded-full'
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <PageHeader
              title={name}
              subtitle={`League: ${team.league?.name} • Owner: ${ownerName}`}
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-md border border-border bg-card p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>Total Points</h3>
          <p className='text-3xl font-bold'>{totalPoints.toFixed(2)}</p>
          <p className='text-xs text-muted-foreground'>Avg: {averagePoints.toFixed(2)}</p>
        </div>
        <div className='rounded-md border border-border bg-card p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>Expected Wins</h3>
          <p className='text-3xl font-bold'>{totalExpectedWins.toFixed(1)}</p>
        </div>
        <div className='rounded-md border border-border bg-card p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>Luck Rating</h3>
          <p className='text-3xl font-bold'>{totalLuckRating.toFixed(2)}</p>
        </div>
        <div className='rounded-md border border-border bg-card p-4'>
          <h3 className='text-sm font-medium text-muted-foreground'>Record</h3>
          <p className='text-3xl font-bold'>
            {wins}-{losses}
          </p>
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Weekly Performance</h2>
        <TeamPerformanceChart weeklyData={weeklyData} />
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Expected vs Actual Performance</h2>
        <TeamExpectedPerformanceChart weeklyData={weeklyData} />
      </div>

      {/* Positional Scoring (Regular Season) */}
      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Positional Scoring</h2>
        {seasonal?.ok ? (
          (() => {
            const rows = seasonal.data.rosterWeekAggregates
              .filter(
                r => r.rosterId === Number(team.id) && r.week >= 1 && r.week < Number(playoffStart)
              )
              .reduce<Record<string, { team: number; opponent: number }>>((acc, r) => {
                const pos = (r.positionalPoints as any) || {};
                const opp = (r.opponentPositionalPoints as any) || {};
                for (const p of Object.keys(pos)) {
                  // Filter out unknown positions like 'UNK'
                  if (!['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p)) continue;
                  if (!acc[p]) acc[p] = { team: 0, opponent: 0 };
                  acc[p].team += Number(pos[p] ?? 0);
                }
                for (const p of Object.keys(opp)) {
                  if (!['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p)) continue;
                  if (!acc[p]) acc[p] = { team: 0, opponent: 0 };
                  acc[p].opponent += Number(opp[p] ?? 0);
                }
                return acc;
              }, {});

            // League averages per position (average per roster across regular season)
            const rosterIds = Array.from(
              new Set<number>(seasonal.data.rosterWeekAggregates.map(r => r.rosterId)).values()
            );
            const perRosterTotals: Record<number, Record<string, number>> = {};
            for (const rid of rosterIds) perRosterTotals[rid] = {};
            seasonal.data.rosterWeekAggregates
              .filter(r => r.week >= 1 && r.week < Number(playoffStart))
              .forEach(r => {
                const pos = (r.positionalPoints as any) || {};
                for (const p of Object.keys(pos)) {
                  if (!['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p)) continue;
                  perRosterTotals[r.rosterId][p] =
                    (perRosterTotals[r.rosterId][p] ?? 0) + Number(pos[p] ?? 0);
                }
              });
            const leagueAverages: Record<string, number> = {};
            const allPositions = Array.from(
              new Set<string>(
                rosterIds.flatMap(rid => Object.keys(perRosterTotals[rid] || {}))
              ).values()
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

            const positionalRows = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => ({
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
                  r => r.rosterId === compareTeamId && r.week >= 1 && r.week < Number(playoffStart)
                )
                .forEach(r => {
                  const pos = (r.positionalPoints as any) || {};
                  for (const p of Object.keys(pos)) {
                    if (!allowedPositions.includes(p)) continue;
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
              comparisons = [{ name: String(compName), color: '#8884d8', data: compData }];
            }

            return (
              <>
                <div className='flex items-center justify-between mb-2'>
                  {league ? (
                    <label className='text-sm text-muted-foreground'>
                      Compare:&nbsp;
                      <select
                        className='border border-border rounded px-2 py-1 bg-background'
                        value={compareTeamId ?? ''}
                        onChange={e =>
                          setCompareTeamId(e.target.value ? Number(e.target.value) : undefined)
                        }
                      >
                        <option value=''>None</option>
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
                <TeamPositionalBarChart data={positionalRows} />
                <div className='mt-8'>
                  <h3 className='mb-4 text-xl font-semibold'>Normalized Positional Strength</h3>
                  <TeamPositionalRadarChart
                    data={radarData}
                    teamName={name}
                    comparisons={comparisons}
                  />
                </div>
              </>
            );
          })()
        ) : (
          <div className='rounded-md border border-border bg-card p-4 text-sm text-muted-foreground'>
            Loading positional aggregates…
          </div>
        )}
      </div>

      {/* Roster: starters and bench */}
      <div className='mt-8'>
        <h2 className='mb-4 text-2xl font-bold'>Roster</h2>
        {rosterDetails ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-md border border-border bg-card p-4'>
              <h3 className='text-lg font-semibold mb-2'>Starters</h3>
              <ul className='space-y-2 text-sm'>
                {rosterDetails.starters.map(pid => {
                  const p = rosterDetails.players.find(pl => pl.id === pid);
                  if (!p) return null;
                  return (
                    <li key={pid} className='flex items-center justify-between'>
                      <span className='font-medium'>{p.fullName}</span>
                      <span className='text-muted-foreground'>
                        {p.position}
                        {p.team ? ` • ${p.team}` : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className='rounded-md border border-border bg-card p-4'>
              <h3 className='text-lg font-semibold mb-2'>Bench</h3>
              <ul className='space-y-2 text-sm'>
                {rosterDetails.players
                  .filter(pl => !rosterDetails.starters.includes(pl.id))
                  .map(p => (
                    <li key={p.id} className='flex items-center justify-between'>
                      <span className='font-medium'>{p.fullName}</span>
                      <span className='text-muted-foreground'>
                        {p.position}
                        {p.team ? ` • ${p.team}` : ''}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className='rounded-md border border-border bg-card p-4 text-sm text-muted-foreground'>
            Loading roster…
          </div>
        )}
      </div>

      <div className='mt-8'>
        <h2 className='mb-2 text-2xl font-bold'>Weekly Matchups</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          TODO: link each row to matchup page when route and data are wired.
        </p>
        <div className='overflow-x-auto rounded-md border border-border bg-card'>
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
              {team.matchups
                .filter(m => m.week >= 1 && m.week <= 14)
                .map(matchup => {
                  const weekData = weeklyData.find(w => w.week === matchup.week);
                  const leagueAvgForWeek = weeklyAverages.find(
                    w => w.week === matchup.week
                  )?.averagePoints;
                  const leagueAvgCell =
                    typeof leagueAvgForWeek === 'number' ? leagueAvgForWeek.toFixed(2) : '—';
                  return (
                    <TableRow key={`reg-${matchup.week}`}>
                      <TableCell>Week {matchup.week}</TableCell>
                      <TableCell>{matchup.points.toFixed(2)}</TableCell>
                      <TableCell>{weekData ? weekData.opponentPoints.toFixed(2) : '—'}</TableCell>
                      <TableCell>{leagueAvgCell}</TableCell>
                      <TableCell>
                        {matchup.points > (weekData?.opponentPoints || 0) ? 'Win' : 'Loss'}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {team.matchups.some(m => m.week >= playoffStart && m.week <= playoffStart + 2) && (
                <TableRow>
                  <TableCell colSpan={5} className='bg-muted/40 text-xs uppercase tracking-wider'>
                    Playoffs (Weeks {playoffStart}–{playoffStart + 2})
                  </TableCell>
                </TableRow>
              )}

              {team.matchups
                .filter(m => m.week >= playoffStart && m.week <= playoffStart + 2)
                .map(matchup => {
                  // Use authoritative weekly metrics for playoff weeks (weeklyData is regular-season-only)
                  const playoffWeek = team.weeklyMetrics.find(wm => wm.week === matchup.week);
                  const weekData = playoffWeek
                    ? { opponentPoints: playoffWeek.opponentPoints }
                    : undefined;
                  const leagueAvgForWeek = weeklyAverages.find(
                    w => w.week === matchup.week
                  )?.averagePoints;
                  const leagueAvgCell =
                    typeof leagueAvgForWeek === 'number' ? leagueAvgForWeek.toFixed(2) : '—';
                  return (
                    <TableRow key={`po-${matchup.week}`}>
                      <TableCell>Week {matchup.week}</TableCell>
                      <TableCell>{matchup.points.toFixed(2)}</TableCell>
                      <TableCell>{weekData ? weekData.opponentPoints.toFixed(2) : '—'}</TableCell>
                      <TableCell>{leagueAvgCell}</TableCell>
                      <TableCell>
                        {matchup.points > (weekData?.opponentPoints || 0) ? 'Win' : 'Loss'}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-2 text-2xl font-bold'>Transactions</h2>
        <div className='rounded-md border border-border bg-card p-4'>
          {tx?.ok ? (
            tx.data
              .filter(
                (t: LeagueTransactionsResponse['data'][number]) =>
                  Array.isArray(t.rosterIds) && t.rosterIds.includes(Number(team.id))
              )
              .slice(0, 20)
              .map((t: LeagueTransactionsResponse['data'][number]) => (
                <div
                  key={t.id}
                  className='flex items-center justify-between py-2 border-b last:border-b-0 border-border/50'
                >
                  <div className='text-sm'>
                    <span className='font-medium'>{t.type}</span>
                    {t.adds?.length ? (
                      <>
                        <span className='text-muted-foreground'> — Adds: </span>
                        <span className='text-muted-foreground'>
                          {t.adds
                            .flatMap((a: { players: { fullName: string }[] }) =>
                              a.players.map((p: { fullName: string }) => p.fullName)
                            )
                            .join(', ')}
                        </span>
                      </>
                    ) : null}
                    {t.drops?.length ? (
                      <>
                        <span className='text-muted-foreground'> — Drops: </span>
                        <span className='text-muted-foreground'>
                          {t.drops
                            .flatMap((a: { players: { fullName: string }[] }) =>
                              a.players.map((p: { fullName: string }) => p.fullName)
                            )
                            .join(', ')}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
          ) : (
            <div className='text-sm text-muted-foreground'>No transactions found.</div>
          )}
        </div>
      </div>
    </Container>
  );
}
