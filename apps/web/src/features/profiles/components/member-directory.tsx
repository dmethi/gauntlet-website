import type { MemberDirectoryEntry } from '@gauntlet/types';
import { Briefcase, MapPin, Shield, Star } from 'lucide-react';
import { getNflTeamName } from '../constants';

const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase();

const Detail = ({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-sm text-muted-foreground">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
    <span>{children}</span>
  </div>
);

export const MemberDirectory = ({ members }: { members: MemberDirectoryEntry[] }) => {
  if (members.length === 0) {
    return (
      <div className="border-y border-border py-12 text-center">
        <h2 className="text-xl font-bold">The directory is waiting for its first profile.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create yours to help other managers recognize the people behind the rosters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
      {members.map(member => {
        const favoriteTeam = getNflTeamName(member.favoriteNflTeam);

        return (
          <article key={member.id} className="group border-t border-border pt-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-display text-lg">
                {member.profileImageUrl ? (
                  <img
                    src={member.profileImageUrl}
                    alt={`${member.fullName} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials(member.fullName)}</span>
                )}
              </div>
              <div className="min-w-0 pt-1">
                <h2 className="truncate text-xl font-bold tracking-tight">{member.fullName}</h2>
                <p className="truncate text-sm text-primary">{member.sleeperDisplayName}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {member.leagueName} · {member.teamName}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {member.jobTitle && <Detail icon={Briefcase}>{member.jobTitle}</Detail>}
              {member.city && <Detail icon={MapPin}>{member.city}</Detail>}
              {favoriteTeam && <Detail icon={Shield}>{favoriteTeam}</Detail>}
              {member.favoritePlayer && <Detail icon={Star}>{member.favoritePlayer}</Detail>}
            </div>
          </article>
        );
      })}
    </div>
  );
};
