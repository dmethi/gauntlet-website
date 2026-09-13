interface MatchupIdentityRoster {
  roster_id: number;
  owner_id?: string | null;
}

interface MatchupIdentityUser {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  metadata?: { team_name?: string };
}

export interface MatchupTeamIdentity {
  teamName: string;
  ownerName: string;
  avatar?: string;
}

export const resolveMatchupTeamIdentity = (
  rosterId: number,
  rosters: MatchupIdentityRoster[],
  users: MatchupIdentityUser[],
): MatchupTeamIdentity => {
  const roster = rosters.find(candidate => candidate.roster_id === rosterId);
  const owner = users.find(candidate => candidate.user_id === roster?.owner_id);
  const ownerName = owner?.display_name || owner?.username || `Manager ${rosterId}`;

  return {
    teamName: owner?.metadata?.team_name || ownerName || `Team ${rosterId}`,
    ownerName,
    avatar: owner?.avatar,
  };
};
