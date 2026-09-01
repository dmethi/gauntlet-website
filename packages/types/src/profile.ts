export interface GauntletProfile {
  id: string;
  clerkUserId: string;
  sleeperUserId: string;
  leagueId: string;
  rosterId: number;
  fullName: string;
  jobTitle: string | null;
  city: string | null;
  favoriteNflTeam: string | null;
  favoritePlayer: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileTeamOption {
  key: string;
  leagueId: string;
  leagueName: string;
  rosterId: number;
  teamName: string;
  sleeperUserId: string;
  sleeperDisplayName: string;
  sleeperAvatarUrl: string | null;
}

export interface ManagerProfileDetails {
  fullName: string;
  jobTitle: string | null;
  city: string | null;
  favoriteNflTeam: string | null;
  favoritePlayer: string | null;
  teamName: string;
  sleeperDisplayName: string;
  profileImageUrl: string | null;
}
