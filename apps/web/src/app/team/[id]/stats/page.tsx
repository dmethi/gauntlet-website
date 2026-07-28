'use client';

import Link from 'next/link';
import { TeamExpectedPerformanceChart, TeamPerformanceChart } from '@/components/team-charts';
import { useTeamData } from '@/lib/hooks';
import type { Roster } from '@/shared/types';
import { PageHeaderHero, WarRoomLoader } from '@gauntlet/ui';
import { Button } from '@/components/ui/button';
import { GauntletLogo } from '@/components/gauntlet-logo';

export default function TeamStatsPage({ params }: { params: { id: string } }) {
  const { team, loading, error } = useTeamData(params.id);

  if (loading) {
    return <WarRoomLoader show logo={<GauntletLogo size="lg" />} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeaderHero
          title="Team not found"
          subtitle="Failed to load team data"
          crestSrc="/gauntlet_logo.svg"
        />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeaderHero
          title="Team not found"
          subtitle="No team data available"
          crestSrc="/gauntlet_logo.svg"
        />
      </div>
    );
  }

  const weeklyData = team.weeklyMetrics
    // Regular season only (Weeks 1–14). TODO: compute playoff start dynamically from league settings
    .filter(metric => metric.week >= 1 && metric.week <= 14)
    .map(metric => ({
      week: metric.week,
      points: metric.totalPoints,
      expectedWins: metric.expectedWins,
      luckRating: metric.luckRating,
      opponentPoints: metric.opponentPoints,
    }));

  const totalPoints = team.matchups.reduce((sum, matchup) => sum + matchup.points, 0);
  const averagePoints = totalPoints / team.matchups.length || 0;
  const regularSeasonWeeks = team.weeklyMetrics.filter(wm => wm.week >= 1 && wm.week <= 14);
  const totalExpectedWins = regularSeasonWeeks.reduce(
    (sum, metric) => sum + metric.expectedWins,
    0,
  );
  const totalLuckRating = regularSeasonWeeks.reduce((sum, metric) => sum + metric.luckRating, 0);

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
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero
        title={`${name} • Stats`}
        subtitle={`League: ${team.league?.name} • ${ownersText}`}
        crestSrc="/gauntlet_logo.svg"
        avatar={
          <div className="h-14 w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-base font-semibold flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${name} avatar`} className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        }
        actions={
          <Link href={`/team/${team.id}`}>
            <Button variant="secondary" size="sm">
              Back to Team
            </Button>
          </Link>
        }
      />

      <div className="px-6 py-8">
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
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Weekly Performance</h2>
          <TeamPerformanceChart weeklyData={weeklyData} />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Expected vs Actual Performance</h2>
          <TeamExpectedPerformanceChart weeklyData={weeklyData} />
        </div>
      </div>
    </div>
  );
}
