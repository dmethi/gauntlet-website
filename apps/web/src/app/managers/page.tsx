import Link from 'next/link';
import { PageHeaderHero } from '@gauntlet/ui';
import { listManagers } from '@/lib/leagues/manager-history';

export const dynamic = 'force-dynamic';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase();
};

const ManagersIndexPage = async () => {
  const managers = await listManagers();

  return (
    <div className="max-w-7xl mx-auto">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {managers.map(manager => {
              const name = manager.displayName ?? 'Unknown manager';
              const tenure =
                manager.firstSeason === manager.lastSeason
                  ? manager.firstSeason
                  : `${manager.firstSeason}–${manager.lastSeason}`;

              return (
                <Link
                  key={manager.ownerId}
                  href={`/managers/${manager.ownerId}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {manager.avatarUrl ? (
                      <img
                        src={manager.avatarUrl}
                        alt={`${name} avatar`}
                        className="h-full w-full aspect-square object-cover rounded-full"
                      />
                    ) : (
                      <span>{getInitials(name)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {manager.seasonsPlayed} season{manager.seasonsPlayed === 1 ? '' : 's'} ·{' '}
                      {tenure}
                    </p>
                  </div>
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
