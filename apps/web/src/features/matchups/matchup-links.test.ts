import { describe, expect, it } from 'vitest';
import { buildGauntletMatchupPath, buildSleeperMatchupUrl } from './matchup-links';

describe('matchup links', () => {
  it('builds matching Gauntlet and Sleeper destinations for a matchup', () => {
    expect(buildGauntletMatchupPath('league-123', 1, 6)).toBe('/matchups/league-123/1/6');
    expect(buildSleeperMatchupUrl('league-123', 6)).toBe(
      'https://sleeper.com/leagues/league-123/matchup?matchupId=6',
    );
  });
});
