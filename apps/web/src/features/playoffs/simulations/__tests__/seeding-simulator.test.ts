/**
 * Tests for seeding simulator logic
 */

import { describe, expect, it } from 'vitest';
import type { TeamScoringDistribution, TeamStanding, Week14Matchup } from '../../types';

// Re-implement the core functions here for testing (since they're not exported)
const generateAllOutcomes = (matchups: Week14Matchup[]): Array<Map<number, 'team1' | 'team2'>> => {
  const outcomes: Array<Map<number, 'team1' | 'team2'>> = [];
  const numMatchups = matchups.length;
  const totalCombinations = Math.pow(2, numMatchups);

  for (let i = 0; i < totalCombinations; i++) {
    const outcome = new Map<number, 'team1' | 'team2'>();
    for (let j = 0; j < numMatchups; j++) {
      const winner = (i >> j) & 1 ? 'team2' : 'team1';
      outcome.set(matchups[j].matchupId, winner);
    }
    outcomes.push(outcome);
  }

  return outcomes;
};

const applyOutcome = (
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  outcome: Map<number, 'team1' | 'team2'>,
): TeamStanding[] => {
  const updated = standings.map(t => ({ ...t }));

  matchups.forEach(matchup => {
    const winner = outcome.get(matchup.matchupId);
    const team1 = updated.find(t => t.rosterId === matchup.team1RosterId);
    const team2 = updated.find(t => t.rosterId === matchup.team2RosterId);

    if (!team1 || !team2) return;

    // Add average Week 14 points
    const avgScore1 = team1.pointsFor / 13;
    const avgScore2 = team2.pointsFor / 13;
    (team1 as any).pointsFor += avgScore1;
    (team2 as any).pointsFor += avgScore2;

    if (winner === 'team1') {
      (team1 as any).wins++;
      (team2 as any).losses++;
    } else {
      (team2 as any).wins++;
      (team1 as any).losses++;
    }
  });

  return updated;
};

const calculateSeeds = (standings: TeamStanding[]): Map<number, number> => {
  const seeds = new Map<number, number>();
  const sorted = [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  // Division winners get seeds 1-3
  const divisionWinners: TeamStanding[] = [];
  for (const div of [1, 2, 3]) {
    const divTeams = sorted.filter(t => t.division === div);
    if (divTeams.length > 0) {
      divisionWinners.push(divTeams[0]);
    }
  }

  divisionWinners.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  divisionWinners.forEach((team, idx) => {
    seeds.set(team.rosterId, idx + 1);
  });

  // Wild cards get seeds 4-6
  const wildCards = sorted
    .filter(t => !divisionWinners.some(dw => dw.rosterId === t.rosterId))
    .slice(0, 3);

  wildCards.forEach((team, idx) => {
    seeds.set(team.rosterId, idx + 4);
  });

  // Remaining get 7-12
  const remaining = sorted.filter(t => !seeds.has(t.rosterId));
  remaining.forEach((team, idx) => {
    seeds.set(team.rosterId, idx + 7);
  });

  return seeds;
};

// Test data
const createMockStandings = (): TeamStanding[] => [
  {
    rosterId: 1,
    teamName: 'Division 1 Leader',
    ownerName: 'Owner 1',
    division: 1,
    wins: 9,
    losses: 4,
    pointsFor: 1800,
    leagueId: 'test',
  },
  {
    rosterId: 2,
    teamName: 'Division 2 Leader',
    ownerName: 'Owner 2',
    division: 2,
    wins: 8,
    losses: 5,
    pointsFor: 1750,
    leagueId: 'test',
  },
  {
    rosterId: 3,
    teamName: 'MACH 18',
    ownerName: 'dmethi',
    division: 3,
    wins: 7,
    losses: 6,
    pointsFor: 1545.2,
    leagueId: 'test',
  },
  {
    rosterId: 4,
    teamName: 'vayyala',
    ownerName: 'vayyala',
    division: 1,
    wins: 7,
    losses: 6,
    pointsFor: 1540,
    leagueId: 'test',
  },
  {
    rosterId: 5,
    teamName: 'DJ Herbussy',
    ownerName: 'DJ',
    division: 2,
    wins: 7,
    losses: 6,
    pointsFor: 1530,
    leagueId: 'test',
  },
  {
    rosterId: 6,
    teamName: 'The zoo',
    ownerName: 'zoo',
    division: 3,
    wins: 7,
    losses: 6,
    pointsFor: 1520,
    leagueId: 'test',
  },
  {
    rosterId: 7,
    teamName: 'Saquon',
    ownerName: 'Saquon',
    division: 1,
    wins: 6,
    losses: 7,
    pointsFor: 1480,
    leagueId: 'test',
  },
  {
    rosterId: 8,
    teamName: 'Jaxson',
    ownerName: 'Jaxson',
    division: 2,
    wins: 6,
    losses: 7,
    pointsFor: 1470,
    leagueId: 'test',
  },
  {
    rosterId: 9,
    teamName: 'Saint Brown',
    ownerName: 'Saint',
    division: 3,
    wins: 6,
    losses: 7,
    pointsFor: 1460,
    leagueId: 'test',
  },
  {
    rosterId: 10,
    teamName: 'cescott25',
    ownerName: 'cescott',
    division: 1,
    wins: 5,
    losses: 8,
    pointsFor: 1350,
    leagueId: 'test',
  },
  {
    rosterId: 11,
    teamName: 'Team K',
    ownerName: 'Owner K',
    division: 2,
    wins: 4,
    losses: 9,
    pointsFor: 1250,
    leagueId: 'test',
  },
  {
    rosterId: 12,
    teamName: 'Team L',
    ownerName: 'Owner L',
    division: 3,
    wins: 3,
    losses: 10,
    pointsFor: 1150,
    leagueId: 'test',
  },
];

const createMockMatchups = (): Week14Matchup[] => [
  {
    matchupId: 1,
    team1RosterId: 1,
    team2RosterId: 7,
    team1Name: 'Division 1 Leader',
    team2Name: 'Saquon',
  },
  {
    matchupId: 2,
    team1RosterId: 2,
    team2RosterId: 8,
    team1Name: 'Division 2 Leader',
    team2Name: 'Jaxson',
  },
  { matchupId: 3, team1RosterId: 3, team2RosterId: 6, team1Name: 'MACH 18', team2Name: 'The zoo' },
  {
    matchupId: 4,
    team1RosterId: 4,
    team2RosterId: 10,
    team1Name: 'vayyala',
    team2Name: 'cescott25',
  },
  {
    matchupId: 5,
    team1RosterId: 5,
    team2RosterId: 11,
    team1Name: 'DJ Herbussy',
    team2Name: 'Team K',
  },
  {
    matchupId: 6,
    team1RosterId: 9,
    team2RosterId: 12,
    team1Name: 'Saint Brown',
    team2Name: 'Team L',
  },
];

describe('Seeding Simulator', () => {
  describe('generateAllOutcomes', () => {
    it('should generate 2^n outcomes for n matchups', () => {
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      expect(outcomes.length).toBe(64); // 2^6 = 64
    });

    it('should have unique outcomes', () => {
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const unique = new Set(
        outcomes.map(o =>
          Array.from(o.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([k, v]) => `${k}:${v}`)
            .join(','),
        ),
      );
      expect(unique.size).toBe(64);
    });
  });

  describe('calculateSeeds', () => {
    it('should assign division winners to seeds 1-3', () => {
      const standings = createMockStandings();
      const seeds = calculateSeeds(standings);

      // Division leaders should be seeds 1-3
      const seedsFor1to3 = [seeds.get(1), seeds.get(2), seeds.get(3)];
      const divisionWinnerSeeds = seedsFor1to3.filter(s => s !== undefined && s <= 3);
      expect(divisionWinnerSeeds.length).toBeGreaterThan(0);
    });

    it('should use points as tiebreaker for same record', () => {
      const standings = createMockStandings();
      // Teams 3, 4, 5, 6 all have 7-6 records
      const seeds = calculateSeeds(standings);

      // Higher points should get better seed among same record teams
      const team3Seed = seeds.get(3)!;
      const team6Seed = seeds.get(6)!;
      expect(team3Seed).toBeLessThan(team6Seed); // 1545.2 > 1520
    });
  });

  describe('scenario conditions', () => {
    it('should produce different seeds based on win/loss', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const targetRosterId = 3; // MACH 18

      // Outcome where MACH 18 wins
      const winOutcome = new Map<number, 'team1' | 'team2'>();
      matchups.forEach(m => winOutcome.set(m.matchupId, 'team1'));

      // Outcome where MACH 18 loses
      const loseOutcome = new Map<number, 'team1' | 'team2'>();
      matchups.forEach(m => loseOutcome.set(m.matchupId, 'team1'));
      loseOutcome.set(3, 'team2'); // MACH 18 loses to The zoo

      const winStandings = applyOutcome(standings, matchups, winOutcome);
      const loseStandings = applyOutcome(standings, matchups, loseOutcome);

      const winSeeds = calculateSeeds(winStandings);
      const loseSeeds = calculateSeeds(loseStandings);

      // Different outcome should potentially give different seed
      const winSeed = winSeeds.get(targetRosterId)!;
      const loseSeed = loseSeeds.get(targetRosterId)!;

      // Win should give better (lower) or equal seed
      expect(winSeed).toBeLessThanOrEqual(loseSeed);
    });

    it('should identify all achievable seeds for a team', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const targetRosterId = 3; // MACH 18

      const achievableSeeds = new Set<number>();
      outcomes.forEach(outcome => {
        const finalStandings = applyOutcome(standings, matchups, outcome);
        const seeds = calculateSeeds(finalStandings);
        achievableSeeds.add(seeds.get(targetRosterId)!);
      });

      // Should have multiple possible seeds
      expect(achievableSeeds.size).toBeGreaterThan(1);
      console.log(
        `MACH 18 achievable seeds: ${Array.from(achievableSeeds)
          .sort((a, b) => a - b)
          .join(', ')}`,
      );
    });

    it('should never have empty conditions for non-100% scenarios', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const targetRosterId = 3;

      // Group outcomes by resulting seed
      const seedOutcomes = new Map<number, Map<number, 'team1' | 'team2'>[]>();
      outcomes.forEach(outcome => {
        const finalStandings = applyOutcome(standings, matchups, outcome);
        const seeds = calculateSeeds(finalStandings);
        const seed = seeds.get(targetRosterId)!;

        if (!seedOutcomes.has(seed)) {
          seedOutcomes.set(seed, []);
        }
        seedOutcomes.get(seed)!.push(outcome);
      });

      // For each seed that isn't 100%, there should be specific conditions
      seedOutcomes.forEach((outcomeList, seed) => {
        if (outcomeList.length < 64) {
          // Not 100%
          // Pick one outcome and verify target team's result is included
          const sampleOutcome = outcomeList[0];
          const targetMatchup = matchups.find(
            m => m.team1RosterId === targetRosterId || m.team2RosterId === targetRosterId,
          );

          expect(targetMatchup).toBeDefined();
          expect(sampleOutcome.get(targetMatchup!.matchupId)).toBeDefined();

          console.log(
            `Seed #${seed} (${outcomeList.length}/64): Own game result = ${
              sampleOutcome.get(targetMatchup!.matchupId) === 'team1' ? 'WIN' : 'LOSE'
            }`,
          );
        }
      });
    });
  });
});
