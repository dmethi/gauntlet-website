import { describe, expect, it } from 'vitest';
import type { SleeperRoster, SleeperUser } from '@gauntlet/types';
import { buildLeagueProfileTeamOptions } from './team-options';

const league = {
  id: 'league-1',
  name: 'Legion I',
  season: 2026,
  previousLeagueId: null,
};

const users: SleeperUser[] = [
  { user_id: 'owner-1', username: 'owner', display_name: 'Owner One', avatar: 'avatar-1' },
  { user_id: 'co-owner-1', username: 'co-owner', display_name: 'Co Owner' },
];

const roster = (overrides: Partial<SleeperRoster> = {}): SleeperRoster => ({
  roster_id: 7,
  owner_id: 'owner-1',
  co_owners: ['co-owner-1'],
  players: [],
  starters: [],
  settings: {
    wins: 0,
    losses: 0,
    ties: 0,
    waiver_position: 1,
    waiver_budget_used: 0,
    total_moves: 0,
  },
  metadata: { team_name: 'The Keepers' },
  ...overrides,
});

describe('buildLeagueProfileTeamOptions', () => {
  it('creates separate manager identities for a co-managed roster', () => {
    const options = buildLeagueProfileTeamOptions(league, [roster()], users);

    expect(options).toHaveLength(2);
    expect(options.map(option => option.sleeperUserId)).toEqual(['owner-1', 'co-owner-1']);
    expect(options.every(option => option.rosterId === 7)).toBe(true);
    expect(options.every(option => option.teamName === 'The Keepers')).toBe(true);
  });

  it('does not expose unassigned rosters as claimable identities', () => {
    const options = buildLeagueProfileTeamOptions(
      league,
      [roster({ roster_id: 8, owner_id: '', co_owners: [] })],
      users,
    );

    expect(options).toEqual([]);
  });
});
