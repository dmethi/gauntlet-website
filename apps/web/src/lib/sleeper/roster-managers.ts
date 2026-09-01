import type { SleeperRoster } from '@gauntlet/types';

type RosterManagers = Pick<SleeperRoster, 'owner_id' | 'co_owners'>;

export const getRosterManagerIds = (roster: RosterManagers): string[] =>
  [...new Set([roster.owner_id, ...(roster.co_owners ?? [])])].filter((id): id is string =>
    Boolean(id),
  );
