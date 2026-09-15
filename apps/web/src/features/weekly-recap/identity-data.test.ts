import { describe, expect, it } from 'vitest';
import type { SleeperRoster, SleeperUser } from '@gauntlet/types';
import { buildRecapTeamLabels } from './identity-data';

const roster = (rosterId: number, ownerId: string): SleeperRoster => ({
  roster_id: rosterId,
  owner_id: ownerId,
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
});

describe('buildRecapTeamLabels', () => {
  it('uses team name before an authenticated profile name', () => {
    const labels = buildRecapTeamLabels(
      'league',
      [roster(2, 'owner')],
      [
        {
          user_id: 'owner',
          username: 'sleeper_user',
          display_name: 'Sleeper Display',
          metadata: { team_name: 'The Team Name' },
        },
      ],
      new Map([['owner', 'Nikhil Krishnan']]),
    );

    expect(labels['league:2']).toBe('The Team Name');
  });

  it('uses a profile name before Sleeper display name', () => {
    const user: SleeperUser = {
      user_id: 'owner',
      username: 'krishnik',
      display_name: 'Nikhil K',
    };

    const labels = buildRecapTeamLabels(
      'league',
      [roster(2, 'owner')],
      [user],
      new Map([['owner', 'Nikhil Krishnan']]),
    );

    expect(labels['league:2']).toBe('Nikhil Krishnan');
  });

  it('does not expose a profile name when none is supplied', () => {
    const labels = buildRecapTeamLabels(
      'league',
      [roster(2, 'owner')],
      [{ user_id: 'owner', username: 'krishnik', display_name: 'Nikhil K' }],
      new Map(),
    );

    expect(labels['league:2']).toBe('Nikhil K');
  });
});
