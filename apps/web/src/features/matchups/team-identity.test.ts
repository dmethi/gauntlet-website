import { describe, expect, it } from 'vitest';
import { resolveMatchupTeamIdentity } from './team-identity';

describe('resolveMatchupTeamIdentity', () => {
  it('prefers a Sleeper team name while retaining the manager identity', () => {
    expect(
      resolveMatchupTeamIdentity(
        3,
        [{ roster_id: 3, owner_id: 'owner-1' }],
        [
          {
            user_id: 'owner-1',
            display_name: 'Dhruv',
            username: 'dhruv',
            avatar: 'avatar-hash',
            metadata: { team_name: 'The Crown' },
          },
        ],
      ),
    ).toEqual({ teamName: 'The Crown', ownerName: 'Dhruv', avatar: 'avatar-hash' });
  });
});
