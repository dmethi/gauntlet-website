import { describe, expect, it } from 'vitest';
import {
  combineLeagueSlateSimulations,
  prepareSlatePlayers,
  simulateOpeningSlate,
  type SlateTeam,
} from './slate-simulation';

const teams: SlateTeam[] = [
  {
    teamId: 'l1:1',
    leagueId: 'l1',
    matchupId: 1,
    teamName: 'One',
    players: [{ id: 'a', position: 'QB', projection: 20 }],
  },
  {
    teamId: 'l1:2',
    leagueId: 'l1',
    matchupId: 1,
    teamName: 'Two',
    players: [{ id: 'b', position: 'QB', projection: 18 }],
  },
  {
    teamId: 'l1:3',
    leagueId: 'l1',
    matchupId: 2,
    teamName: 'Three',
    players: [{ id: 'c', position: 'RB', projection: 15 }],
  },
  {
    teamId: 'l1:4',
    leagueId: 'l1',
    matchupId: 2,
    teamName: 'Four',
    players: [{ id: 'd', position: 'RB', projection: 14 }],
  },
];

describe('simulateOpeningSlate', () => {
  it('models open slots, unresolved players, and zero projections without aborting', () => {
    const prepared = prepareSlatePlayers({
      starterIds: ['qb', 'jacobs', 'missing', '0'],
      expectedStarters: 4,
      lookup: playerId => {
        if (playerId === 'qb') return { position: 'QB', projection: 20 };
        if (playerId === 'jacobs') return { position: 'RB', projection: 0 };
        return null;
      },
    });

    expect(prepared.players).toEqual([
      { id: 'qb', position: 'QB', projection: 20 },
      { id: 'jacobs', position: 'RB', projection: 0 },
    ]);
    expect(prepared.modeling).toEqual({
      openStarterSlots: 1,
      unresolvedPlayerIds: ['missing'],
      zeroProjectionPlayerIds: ['jacobs'],
    });

    const result = simulateOpeningSlate({
      teams: [
        { ...teams[0], players: prepared.players },
        { ...teams[1], players: [] },
        teams[2],
        teams[3],
      ],
      iterations: 100,
      seed: 9,
      positionOutcomes: new Map([['QB', [1]]]),
    });

    expect(result.teams.find(team => team.teamId === 'l1:1')?.projection).toBe(20);
    expect(result.teams.find(team => team.teamId === 'l1:2')?.projection).toBe(0);
  });

  it('is reproducible and derives every race from the same seeded worlds', () => {
    const input = {
      teams,
      iterations: 500,
      seed: 20260909,
      positionOutcomes: new Map([
        ['QB', [0.5, 0.8, 1, 1.2, 1.5]],
        ['RB', [0.4, 0.7, 1, 1.3, 1.6]],
      ]),
    };

    const first = simulateOpeningSlate(input);
    const second = simulateOpeningSlate(input);

    expect(first).toEqual(second);
    expect(first.teams).toHaveLength(4);
    expect(first.matchups).toHaveLength(2);
    expect(first.races.highestScore.reduce((sum, item) => sum + item.probability, 0)).toBeCloseTo(
      1,
      8,
    );
    expect(first.races.biggestBlowout.reduce((sum, item) => sum + item.probability, 0)).toBeCloseTo(
      1,
      8,
    );
    expect(
      first.matchups[0].teamA.winProbability + first.matchups[0].teamB.winProbability,
    ).toBeCloseTo(1, 8);
  });

  it('anchors each simulated median to the current Sleeper lineup projection', () => {
    const result = simulateOpeningSlate({
      teams,
      iterations: 501,
      seed: 27,
      positionOutcomes: new Map([
        ['QB', [0.2, 0.4, 2.6]],
        ['RB', [0.1, 0.5, 2.9]],
      ]),
    });

    for (const team of teams) {
      const simulated = result.teams.find(candidate => candidate.teamId === team.teamId);
      const sleeperProjection = team.players.reduce((sum, player) => sum + player.projection, 0);
      expect(simulated?.projection).toBe(sleeperProjection);
      expect(simulated?.p50).toBe(sleeperProjection);
    }
  });

  it('combines independently simulated leagues only after each league is complete', () => {
    const positionOutcomes = new Map([
      ['QB', [0.8, 1, 1.2]],
      ['RB', [0.7, 1, 1.3]],
    ]);
    const leagueOne = simulateOpeningSlate({ teams, iterations: 200, seed: 1, positionOutcomes });
    const leagueTwo = simulateOpeningSlate({
      teams: teams.map(team => ({
        ...team,
        teamId: team.teamId.replace('l1:', 'l2:'),
        leagueId: 'l2',
        teamName: `${team.teamName} II`,
      })),
      iterations: 200,
      seed: 2,
      positionOutcomes,
    });

    const races = combineLeagueSlateSimulations([leagueOne, leagueTwo]);

    expect(races.highestScore).toHaveLength(8);
    expect(races.highestScore.reduce((sum, item) => sum + item.probability, 0)).toBeCloseTo(1, 8);
    expect(races.biggestBlowout.reduce((sum, item) => sum + item.probability, 0)).toBeCloseTo(1, 8);
  });
});
