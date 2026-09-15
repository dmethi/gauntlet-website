export interface RecapTeamIdentity {
  rosterId: number;
  sleeperTeamName?: string | null;
  profileName?: string | null;
  sleeperDisplayName?: string | null;
  sleeperUsername?: string | null;
}

const nonempty = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const resolveRecapTeamLabel = (identity: RecapTeamIdentity): string =>
  nonempty(identity.sleeperTeamName) ??
  nonempty(identity.profileName) ??
  nonempty(identity.sleeperDisplayName) ??
  nonempty(identity.sleeperUsername) ??
  `Team ${identity.rosterId}`;
