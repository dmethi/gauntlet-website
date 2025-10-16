import { describe, expect, it } from 'vitest';
import type { LeagueData, PlayoffBracket } from '@/features/playoffs/types';
import type { TeamStats } from '@/features/playoffs/types';
import {
  buildBracketTeams,
  getAdvancingTeam,
  getMatchupResult,
  parseBracketStructure,
  roundToWeek,
} from './utils';

const buildTeam = (overrides: Partial<TeamStats>): TeamStats => ({
  id: overrides.id ?? '1',
  name: overrides.name ?? 'Team',
  canonicalRank: overrides.canonicalRank ?? 1,
  wins: overrides.wins ?? 10,
  losses: overrides.losses ?? 3,
  pointsFor: overrides.pointsFor ?? 1345.2,
  ...overrides,
});

const leagueWithMatchup = (): LeagueData => ({
  rosters: [
    {
      id: '1',
      matchups: [
        { week: 15, points: 120.5, projected: 0, result: 'W' },
        { week: 16, points: 110.1, projected: 0, result: 'L' },
      ],
    },
    {
      id: '2',
      matchups: [
        { week: 15, points: 118.0, projected: 0, result: 'L' },
        { week: 16, points: 135.9, projected: 0, result: 'W' },
      ],
    },
  ],
});

describe('PlayoffBracket utils', () => {
  it('buildBracketTeams sorts by canonical rank and maps records', () => {
    const teams = buildBracketTeams([
      buildTeam({ id: 'b', canonicalRank: 2, wins: 9, losses: 4 }),
      buildTeam({ id: 'a', canonicalRank: 1, wins: 11, losses: 2 }),
    ]);

    expect(teams).toHaveLength(2);
    expect(teams[0].seed).toBe(1);
    expect(teams[0].id).toBe('a');
    expect(teams[1].seed).toBe(2);
    expect(teams[1].record).toBe('9-4');
  });

  it('roundToWeek maps rounds to playoff weeks', () => {
    expect(roundToWeek(1)).toBe(15);
    expect(roundToWeek(2)).toBe(16);
    expect(roundToWeek(3)).toBe(17);
  });

  it('getMatchupResult returns winner and scores when data exists', () => {
    const league = leagueWithMatchup();
    const result = getMatchupResult(league, '1', '2', 15);
    expect(result).toBeDefined();
    expect(result?.winnerId).toBe('1');
    expect(result?.team1Score).toBeCloseTo(120.5);
  });

  it('getAdvancingTeam resolves winner (or loser for toilet bowl)', () => {
    const league = leagueWithMatchup();
    const bracketTeams = buildBracketTeams([
      buildTeam({ id: '1', canonicalRank: 1 }),
      buildTeam({ id: '2', canonicalRank: 2 }),
    ]);

    const winner = getAdvancingTeam(league, bracketTeams, '1', '2', 15, false);
    expect(winner?.id).toBe('1');

    const toiletAdvance = getAdvancingTeam(league, bracketTeams, '1', '2', 15, true);
    expect(toiletAdvance?.id).toBe('2');
  });

  it('parseBracketStructure groups rounds and placement games', () => {
    const bracket: PlayoffBracket = {
      winners_bracket: [
        { r: 1, m: 1, t1: 1, t2: 2 },
        { r: 2, m: 2, t1: 1, t2: 3, t1_from: { w: 1, m: 1 }, t2_from: { w: 1, m: 2 } },
      ],
      losers_bracket: [
        { r: 1, m: 3, t1: 3, t2: 4, t1_from: { l: 1, m: 1 }, t2_from: { l: 1, m: 2 } },
      ],
    };

    const structure = parseBracketStructure(bracket);
    expect(structure.winners).toHaveLength(2);
    expect(structure.losers).toHaveLength(1);
    expect(structure.placements.length).toBeGreaterThanOrEqual(1);
  });
});
