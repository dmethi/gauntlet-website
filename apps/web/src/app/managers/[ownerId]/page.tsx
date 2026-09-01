import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import type { ManagerProfileDetails } from '@gauntlet/types';
import { PageHeaderHero } from '@gauntlet/ui';
import { ManagerPersonalDetails } from '@/features/profiles/components/manager-personal-details';
import { getManagerProfilesBySleeperId } from '@/features/profiles/manager-profiles';
import { getManagerHistory, type ManagerLeagueSeasonHistory } from '@/lib/leagues/manager-history';
import { deltaTextClass, leagueBadgeClass } from '@/lib/stat-colors';
import { ManagerHallOfFameBadges } from './manager-hall-of-fame-badges';

interface PageProps {
  params: Promise<{ ownerId: string } | Promise<{ ownerId: string }>>;
}

export const dynamic = 'force-dynamic';

const formatPct = (pct: number) => `${(pct * 100).toFixed(1)}%`;

const winPct = (s: Pick<ManagerLeagueSeasonHistory, 'wins' | 'losses' | 'ties'>): number => {
  const games = s.wins + s.losses + s.ties;
  return games > 0 ? (s.wins + s.ties * 0.5) / games : 0;
};

const pointDiff = (s: Pick<ManagerLeagueSeasonHistory, 'pointsFor' | 'pointsAgainst'>): number =>
  s.pointsFor - s.pointsAgainst;

const seasonKey = (s: Pick<ManagerLeagueSeasonHistory, 'season' | 'leagueId'>): string =>
  `${s.season}-${s.leagueId}`;

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase();
};

const ManagerProfilePage = async (props: PageProps) => {
  const params = await props.params;
  const resolvedParams = params instanceof Promise ? await params : params;
  const { ownerId } = resolvedParams;

  const { userId } = await auth();
  const profilesPromise = userId
    ? getManagerProfilesBySleeperId()
    : Promise.resolve(new Map<string, ManagerProfileDetails>());
  const [history, profilesBySleeperId] = await Promise.all([
    getManagerHistory(ownerId),
    profilesPromise,
  ]);

  if (!history) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeaderHero
          title="Manager not found"
          subtitle="This owner doesn't appear in any registered season."
          crestSrc="/gauntlet_logo.svg"
        />
        <div className="px-6 py-8">
          <Link href="/archive/2025" className="text-sm text-primary hover:underline">
            &larr; Back to the 2025 archive
          </Link>
        </div>
      </div>
    );
  }

  const { career } = history;
  const profile = profilesBySleeperId.get(ownerId);
  const displayName = profile?.fullName ?? history.displayName ?? 'Unknown manager';
  const avatarUrl = profile?.profileImageUrl ?? history.avatarUrl;

  // Seasons come back newest-first from getManagerHistory; keep that order for the timeline.
  const seasonYears = [...history.seasons.map(s => s.season)].sort();
  const tenureLabel =
    seasonYears.length > 1
      ? `${seasonYears[0]}–${seasonYears[seasonYears.length - 1]}`
      : seasonYears[0];

  // Best/worst season only means something among seasons with actual games played —
  // an in-progress season sitting at 0-0 isn't a "toughest season," it's just unplayed.
  const playedSeasons = history.seasons.filter(s => s.wins + s.losses + s.ties > 0);
  const rankedSeasons =
    playedSeasons.length > 1
      ? [...playedSeasons].sort((a, b) => winPct(b) - winPct(a) || pointDiff(b) - pointDiff(a))
      : [];
  const bestSeason = rankedSeasons[0] ?? null;
  const worstSeason = rankedSeasons.length > 1 ? rankedSeasons[rankedSeasons.length - 1] : null;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeaderHero
        title={displayName}
        subtitle={`${history.seasons.length} season${history.seasons.length === 1 ? '' : 's'} · ${tenureLabel}`}
        crestSrc="/gauntlet_logo.svg"
        avatar={
          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-base font-semibold flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                className="h-full w-full aspect-square object-cover rounded-full"
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>
        }
      />
      <div className="px-6 py-8">
        {profile && (
          <section className="mb-10 border-y border-border py-6">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.2em] text-secondary">
                  Beyond fantasy
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sleeper: {profile.sleeperDisplayName} · {profile.teamName}
                </p>
              </div>
              <ManagerPersonalDetails profile={profile} />
            </div>
          </section>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Career Record</h3>
            <p className="text-3xl font-bold">
              {career.wins}-{career.losses}
              {career.ties > 0 ? `-${career.ties}` : ''}
            </p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Win %</h3>
            <p className="text-3xl font-bold">{formatPct(career.winPct)}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Points For</h3>
            <p className="text-3xl font-bold">{career.pointsFor.toFixed(1)}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Points Against</h3>
            <p className="text-3xl font-bold">{career.pointsAgainst.toFixed(1)}</p>
          </div>
        </div>

        {(bestSeason || worstSeason) && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
            {bestSeason && (
              <div className="rounded-md border border-success/30 bg-success/5 p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Best Season</h3>
                <p className="text-2xl font-bold">{bestSeason.season}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bestSeason.leagueLabel} · {bestSeason.wins}-{bestSeason.losses}
                  {bestSeason.ties > 0 ? `-${bestSeason.ties}` : ''} ·{' '}
                  {formatPct(winPct(bestSeason))}
                </p>
              </div>
            )}
            {worstSeason && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Toughest Season</h3>
                <p className="text-2xl font-bold">{worstSeason.season}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {worstSeason.leagueLabel} · {worstSeason.wins}-{worstSeason.losses}
                  {worstSeason.ties > 0 ? `-${worstSeason.ties}` : ''} ·{' '}
                  {formatPct(winPct(worstSeason))}
                </p>
              </div>
            )}
          </div>
        )}

        <ManagerHallOfFameBadges
          rosterKeys={history.seasons.map(s => ({ leagueId: s.leagueId, rosterId: s.rosterId }))}
        />

        <h2 className="text-xl font-semibold text-card-foreground mb-4">Season by season</h2>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
          <div className="space-y-4">
            {history.seasons.map(season => {
              const key = seasonKey(season);
              const isBest = bestSeason !== null && key === seasonKey(bestSeason);
              const isWorst = worstSeason !== null && key === seasonKey(worstSeason);
              const diff = pointDiff(season);

              return (
                <div key={key} className="relative">
                  <div
                    className={`absolute -left-6 top-2 h-3 w-3 rounded-full border-2 border-background ${
                      isBest ? 'bg-success' : isWorst ? 'bg-destructive' : 'bg-primary'
                    }`}
                    aria-hidden="true"
                  />
                  <div
                    className={`rounded-md border p-4 ${
                      isBest
                        ? 'border-success/40 bg-success/5'
                        : isWorst
                          ? 'border-destructive/40 bg-destructive/5'
                          : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {season.season === '2025' ? (
                          <Link
                            href="/archive/2025"
                            className="text-lg font-bold text-primary hover:underline"
                          >
                            {season.season}
                          </Link>
                        ) : (
                          <span className="text-lg font-bold">{season.season}</span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${leagueBadgeClass(season.leagueLabel)}`}
                        >
                          {season.leagueLabel}
                        </span>
                        {isBest && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                            Best season
                          </span>
                        )}
                        {isWorst && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                            Toughest season
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold">
                        {season.wins}-{season.losses}
                        {season.ties > 0 ? `-${season.ties}` : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      {season.teamName && (
                        <span className="text-card-foreground">{season.teamName}</span>
                      )}
                      <span>PF {season.pointsFor.toFixed(1)}</span>
                      <span>PA {season.pointsAgainst.toFixed(1)}</span>
                      <span className={deltaTextClass(diff)}>
                        {diff >= 0 ? '+' : ''}
                        {diff.toFixed(1)} diff
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfilePage;
