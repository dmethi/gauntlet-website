import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import type { ManagerProfileDetails } from '@gauntlet/types';
import { PageHeaderHero } from '@gauntlet/ui';
import { ManagerPersonalDetails } from '@/features/profiles/components/manager-personal-details';
import { getManagerProfilesBySleeperId } from '@/features/profiles/manager-profiles';
import { listManagers } from '@/lib/leagues/manager-history';

export const dynamic = 'force-dynamic';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase();
};

const ManagersIndexPage = async () => {
  const { userId } = await auth();
  const profilesPromise = userId
    ? getManagerProfilesBySleeperId()
    : Promise.resolve(new Map<string, ManagerProfileDetails>());
  const [managers, profilesBySleeperId] = await Promise.all([listManagers(), profilesPromise]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeaderHero
        title="Managers"
        subtitle={`${managers.length} manager${managers.length === 1 ? '' : 's'} across every registered season`}
        crestSrc="/gauntlet_logo.svg"
      />
      <div className="px-6 py-8">
        {managers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No managers found in any registered league.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {managers.map(manager => {
              const profile = profilesBySleeperId.get(manager.ownerId);
              const name = profile?.fullName ?? manager.displayName ?? 'Unknown manager';
              const avatarUrl = profile?.profileImageUrl ?? manager.avatarUrl;
              const tenure =
                manager.firstSeason === manager.lastSeason
                  ? manager.firstSeason
                  : `${manager.firstSeason}–${manager.lastSeason}`;

              return (
                <Link
                  key={manager.ownerId}
                  href={`/managers/${manager.ownerId}`}
                  aria-label={`View ${name} manager profile`}
                  className="group"
                >
                  <article className="h-full border-t border-border pt-5 transition-colors group-hover:border-primary/50">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={`${name} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(name)}</span>
                        )}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                          {name}
                        </p>
                        {profile && (
                          <p className="truncate text-xs text-primary">
                            Sleeper: {profile.sleeperDisplayName}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {manager.seasonsPlayed} season{manager.seasonsPlayed === 1 ? '' : 's'} ·{' '}
                          {tenure}
                        </p>
                      </div>
                    </div>
                    {profile && (
                      <div className="mt-5">
                        <ManagerPersonalDetails profile={profile} />
                      </div>
                    )}
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagersIndexPage;
