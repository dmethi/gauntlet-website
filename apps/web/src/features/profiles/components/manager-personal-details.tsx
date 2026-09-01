import type { ManagerProfileDetails } from '@gauntlet/types';
import { Briefcase, MapPin, Shield, Star } from 'lucide-react';
import { getNflTeamName } from '../constants';

const Detail = ({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-sm text-muted-foreground">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
    <span>{children}</span>
  </div>
);

export const ManagerPersonalDetails = ({ profile }: { profile: ManagerProfileDetails }) => {
  const favoriteTeam = getNflTeamName(profile.favoriteNflTeam);

  return (
    <div className="space-y-2.5">
      {profile.jobTitle && <Detail icon={Briefcase}>{profile.jobTitle}</Detail>}
      {profile.city && <Detail icon={MapPin}>{profile.city}</Detail>}
      {favoriteTeam && <Detail icon={Shield}>{favoriteTeam}</Detail>}
      {profile.favoritePlayer && <Detail icon={Star}>{profile.favoritePlayer}</Detail>}
    </div>
  );
};
