import { describe, expect, it } from 'vitest';
import { resolveRecapTeamLabel } from './identity';

describe('resolveRecapTeamLabel', () => {
  const identity = {
    rosterId: 4,
    sleeperTeamName: 'Crown and Pound',
    profileName: 'Dhruv Methi',
    sleeperDisplayName: 'dmethi',
    sleeperUsername: 'dhruv',
  };

  it('prefers a nonempty Sleeper team name', () => {
    expect(resolveRecapTeamLabel(identity)).toBe('Crown and Pound');
  });

  it('prefers a linked profile name over Sleeper names when the team name is missing', () => {
    expect(resolveRecapTeamLabel({ ...identity, sleeperTeamName: '   ' })).toBe('Dhruv Methi');
  });

  it('falls back through Sleeper display name and username', () => {
    expect(
      resolveRecapTeamLabel({
        ...identity,
        sleeperTeamName: undefined,
        profileName: undefined,
      }),
    ).toBe('dmethi');

    expect(
      resolveRecapTeamLabel({
        ...identity,
        sleeperTeamName: undefined,
        profileName: undefined,
        sleeperDisplayName: ' ',
      }),
    ).toBe('dhruv');
  });

  it('uses a stable roster fallback when no names are available', () => {
    expect(
      resolveRecapTeamLabel({
        rosterId: 4,
        sleeperTeamName: null,
        profileName: null,
        sleeperDisplayName: null,
        sleeperUsername: null,
      }),
    ).toBe('Team 4');
  });
});
