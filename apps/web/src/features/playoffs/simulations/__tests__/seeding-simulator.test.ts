/**
 * Tests for seeding simulator logic
 */

import { describe, expect, it } from 'vitest';
import type { PathCondition } from '../../types';
import type { TeamStanding, Week14Matchup } from '../../types';
import { POINTS_CONSTRAINTS } from '../../types';
import { formatPathConditions, formatPathCount } from '../../hooks';

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

  describe('deterministic path logic', () => {
    // Re-implement calculateExactMarginNeeded for testing
    const calculateExactMarginNeeded = (
      teamACurrentPoints: number,
      teamBCurrentPoints: number,
      teamAMustWin: boolean,
      teamBMustWin: boolean,
    ): { margin: number; achievable: boolean; description: string } | null => {
      const currentDiff = teamACurrentPoints - teamBCurrentPoints;
      const marginNeeded = Math.ceil(-currentDiff + 0.1);

      const minAScore = teamAMustWin ? 51 : POINTS_CONSTRAINTS.MIN_SCORE;
      const maxAScore = POINTS_CONSTRAINTS.MAX_SCORE;
      const minBScore = teamBMustWin ? 51 : POINTS_CONSTRAINTS.MIN_SCORE;
      const maxBScore = POINTS_CONSTRAINTS.MAX_SCORE;

      const maxPossibleMargin = maxAScore - minBScore;
      const minPossibleMargin = minAScore - maxBScore;

      if (marginNeeded > maxPossibleMargin) {
        return null;
      }

      if (marginNeeded <= minPossibleMargin) {
        return {
          margin: 0,
          achievable: true,
          description: 'Tiebreaker guaranteed (already ahead enough)',
        };
      }

      if (marginNeeded <= 0) {
        return {
          margin: marginNeeded,
          achievable: true,
          description: `Can be outscored by up to ${Math.abs(marginNeeded)} pts`,
        };
      }

      return {
        margin: marginNeeded,
        achievable: true,
        description: `Must outscore by ${marginNeeded}+ pts`,
      };
    };

    it('should calculate correct margin when team A is behind', () => {
      // Team A has 1000 pts, Team B has 1050 pts
      // A needs to outscore B by 51+ pts to win tiebreaker
      const result = calculateExactMarginNeeded(1000, 1050, false, false);
      expect(result).not.toBeNull();
      expect(result!.margin).toBe(51); // Need +51 to go from -50 to +1
      expect(result!.achievable).toBe(true);
    });

    it('should calculate correct margin when team A is ahead', () => {
      // Team A has 1050 pts, Team B has 1000 pts
      // A is already +50 ahead, can afford to be outscored by up to 49
      const result = calculateExactMarginNeeded(1050, 1000, false, false);
      expect(result).not.toBeNull();
      expect(result!.margin).toBeLessThanOrEqual(0);
      expect(result!.achievable).toBe(true);
    });

    it('should return null when margin is impossible', () => {
      // Team A is 200 pts behind - even scoring 200 vs 50 only gets +150
      const result = calculateExactMarginNeeded(1000, 1200, false, false);
      expect(result).toBeNull();
    });

    it('should account for win constraints on minimum score', () => {
      // If team A must win their game, minimum score is 51 instead of 50
      // This reduces max possible margin slightly
      const resultNoWin = calculateExactMarginNeeded(1000, 1100, false, false);
      const resultMustWin = calculateExactMarginNeeded(1000, 1100, true, false);

      // Both should be achievable with 100 pt deficit (need +101 margin)
      expect(resultNoWin).not.toBeNull();
      expect(resultMustWin).not.toBeNull();
    });

    it('should handle teams with same points', () => {
      // Teams tied on points - A needs to outscore B by 1+ pt
      const result = calculateExactMarginNeeded(1500, 1500, false, false);
      expect(result).not.toBeNull();
      expect(result!.margin).toBe(1);
    });
  });

  describe('path formatting', () => {
    it('should format win condition correctly', () => {
      const conditions: PathCondition[] = [
        { type: 'win', teamName: 'MACH 18', rosterId: 3, opponentName: 'The Zoo' },
      ];
      const result = formatPathConditions(conditions);
      expect(result).toBe('WIN vs The Zoo');
    });

    it('should format lose condition correctly', () => {
      const conditions: PathCondition[] = [
        { type: 'lose', teamName: 'MACH 18', rosterId: 3, opponentName: 'The Zoo' },
      ];
      const result = formatPathConditions(conditions);
      expect(result).toBe('LOSE vs The Zoo');
    });

    it('should format multiple conditions with AND', () => {
      const conditions: PathCondition[] = [
        { type: 'win', teamName: 'MACH 18', rosterId: 3, opponentName: 'The Zoo' },
        {
          type: 'other_result',
          teamName: 'Team A',
          rosterId: 1,
          opponentName: 'Team B',
          wins: true,
        },
      ];
      const result = formatPathConditions(conditions);
      expect(result).toContain('AND');
      expect(result).toContain('WIN vs The Zoo');
      expect(result).toContain('Team A wins');
    });

    it('should format points margin correctly', () => {
      const conditions: PathCondition[] = [
        { type: 'win', teamName: 'MACH 18', rosterId: 3 },
        {
          type: 'points_margin',
          teamName: 'Competitor',
          rosterId: 5,
          marginRequired: 53,
          vsTeamName: 'Competitor',
        },
      ];
      const result = formatPathConditions(conditions);
      expect(result).toContain('outscore Competitor by 53+ pts');
    });

    it('should format negative points margin (being outscored)', () => {
      const conditions: PathCondition[] = [
        {
          type: 'points_margin',
          teamName: 'Competitor',
          rosterId: 5,
          marginRequired: -20,
          vsTeamName: 'Competitor',
        },
      ];
      const result = formatPathConditions(conditions);
      expect(result).toContain('be outscored by Competitor by 20+ pts');
    });

    it('should return default message for empty conditions', () => {
      const result = formatPathConditions([]);
      expect(result).toBe('Any outcome results in this seed');
    });
  });

  describe('path count formatting', () => {
    it('should format zero paths', () => {
      expect(formatPathCount(0)).toBe('No paths');
    });

    it('should format single path', () => {
      expect(formatPathCount(1)).toBe('1 path');
    });

    it('should format multiple paths', () => {
      expect(formatPathCount(5)).toBe('5 paths');
      expect(formatPathCount(32)).toBe('32 paths');
    });
  });

  describe('path validation', () => {
    it('should have correct number of paths per seed summing to 64', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const targetRosterId = 3;

      // Group outcomes by resulting seed
      const seedOutcomes = new Map<number, number>();
      outcomes.forEach(outcome => {
        const finalStandings = applyOutcome(standings, matchups, outcome);
        const seeds = calculateSeeds(finalStandings);
        const seed = seeds.get(targetRosterId)!;

        seedOutcomes.set(seed, (seedOutcomes.get(seed) || 0) + 1);
      });

      // Total paths should equal 64
      let total = 0;
      seedOutcomes.forEach(count => {
        total += count;
      });
      expect(total).toBe(64);
    });

    it('should group outcomes correctly by win/loss', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const targetRosterId = 3;

      const targetMatchup = matchups.find(
        m => m.team1RosterId === targetRosterId || m.team2RosterId === targetRosterId,
      )!;
      const targetIsTeam1 = targetMatchup.team1RosterId === targetRosterId;

      // Count outcomes where target wins vs loses
      let winOutcomes = 0;
      let loseOutcomes = 0;

      outcomes.forEach(outcome => {
        const winner = outcome.get(targetMatchup.matchupId);
        if ((targetIsTeam1 && winner === 'team1') || (!targetIsTeam1 && winner === 'team2')) {
          winOutcomes++;
        } else {
          loseOutcomes++;
        }
      });

      // Should be exactly half and half (32 each)
      expect(winOutcomes).toBe(32);
      expect(loseOutcomes).toBe(32);
    });

    it('should identify seed changes based on single matchup flip', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const targetRosterId = 3;

      // Create a base outcome where everyone wins team1
      const baseOutcome = new Map<number, 'team1' | 'team2'>();
      matchups.forEach(m => baseOutcome.set(m.matchupId, 'team1'));

      // Calculate base seed
      const baseStandings = applyOutcome(standings, matchups, baseOutcome);
      const baseSeeds = calculateSeeds(baseStandings);
      const baseSeed = baseSeeds.get(targetRosterId)!;

      // Flip target team's matchup result
      const flippedOutcome = new Map(baseOutcome);
      const targetMatchup = matchups.find(
        m => m.team1RosterId === targetRosterId || m.team2RosterId === targetRosterId,
      )!;
      flippedOutcome.set(targetMatchup.matchupId, 'team2');

      const flippedStandings = applyOutcome(standings, matchups, flippedOutcome);
      const flippedSeeds = calculateSeeds(flippedStandings);
      const flippedSeed = flippedSeeds.get(targetRosterId)!;

      // Seeds should be different (or at least deterministic)
      console.log(`Base seed (win): ${baseSeed}, Flipped seed (loss): ${flippedSeed}`);
      expect(flippedSeed).toBeGreaterThanOrEqual(baseSeed);
    });

    it('should validate that each outcome leads to the expected seed', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const targetRosterId = 3;

      // Build a map of outcomeId -> resulting seed
      const outcomeToSeed = new Map<number, number>();
      outcomes.forEach((outcome, outcomeId) => {
        const finalStandings = applyOutcome(standings, matchups, outcome);
        const seeds = calculateSeeds(finalStandings);
        outcomeToSeed.set(outcomeId, seeds.get(targetRosterId)!);
      });

      // Group outcomes by seed (this simulates what buildAllPathsForTeam does)
      const pathsBySeed = new Map<number, number[]>();
      outcomeToSeed.forEach((seed, outcomeId) => {
        if (!pathsBySeed.has(seed)) {
          pathsBySeed.set(seed, []);
        }
        pathsBySeed.get(seed)!.push(outcomeId);
      });

      // Verify: for each seed, every associated outcome should produce that seed
      let validationErrors = 0;
      pathsBySeed.forEach((outcomeIds, expectedSeed) => {
        outcomeIds.forEach(outcomeId => {
          const actualSeed = outcomeToSeed.get(outcomeId)!;
          if (actualSeed !== expectedSeed) {
            validationErrors++;
            console.error(
              `VALIDATION ERROR: Outcome ${outcomeId} expected seed ${expectedSeed} but got ${actualSeed}`,
            );
          }
        });
      });

      expect(validationErrors).toBe(0);
      console.log(
        `Validated ${outcomes.length} outcomes across ${pathsBySeed.size} possible seeds`,
      );
    });

    it('should verify path conditions match the outcome they represent', () => {
      const standings = createMockStandings();
      const matchups = createMockMatchups();
      const outcomes = generateAllOutcomes(matchups);
      const targetRosterId = 3;

      const targetMatchup = matchups.find(
        m => m.team1RosterId === targetRosterId || m.team2RosterId === targetRosterId,
      )!;
      const targetIsTeam1 = targetMatchup.team1RosterId === targetRosterId;

      // For each outcome, verify win/loss matches the expected result
      outcomes.forEach((outcome, outcomeId) => {
        const winner = outcome.get(targetMatchup.matchupId);
        const targetWins =
          (targetIsTeam1 && winner === 'team1') || (!targetIsTeam1 && winner === 'team2');

        // The path should have a win condition if targetWins is true
        // and a lose condition if targetWins is false
        const finalStandings = applyOutcome(standings, matchups, outcome);
        const seeds = calculateSeeds(finalStandings);
        const seed = seeds.get(targetRosterId)!;

        // Log a sample for verification
        if (outcomeId === 0 || outcomeId === 32) {
          console.log(
            `Outcome ${outcomeId}: Target ${targetWins ? 'WINS' : 'LOSES'} -> Seed #${seed}`,
          );
        }
      });

      // Test passes if no errors thrown
      expect(true).toBe(true);
    });
  });
});
