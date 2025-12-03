/**
 * Seeding Simulator
 *
 * Monte Carlo simulation engine for calculating playoff seeding probabilities.
 * Runs simulations to determine probability of each team achieving each seed.
 * Also calculates specific scenario requirements for each achievable seed.
 */

import { LEAGUE_IDS } from '@/lib/constants';
import type {
  TeamSeedingProbabilities,
  LeagueSeedingResults,
  SeedScenario,
  ScenarioCondition,
  Week14Matchup,
  TeamStanding,
  SeedingSimulationConfig,
  TeamScoringDistribution,
} from '../types';
import {
  buildTeamScoringDistributions,
  sampleTeamScore,
} from './team-score-sampler';
import {
  fetchCurrentStandings,
  fetchWeek14Matchups,
  applyWeek14Results,
  calculatePlayoffSeeds,
} from './standings-calculator';

/**
 * Default simulation configuration
 */
const DEFAULT_CONFIG: SeedingSimulationConfig = {
  iterations: 100000,
};

/**
 * Generate all possible Week 14 outcomes (2^6 = 64 scenarios)
 */
const generateAllOutcomes = (
  matchups: Week14Matchup[]
): Array<Map<number, 'team1' | 'team2'>> => {
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

/**
 * Apply a specific outcome to standings (for scenario analysis)
 */
const applyOutcomeToStandings = (
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  outcome: Map<number, 'team1' | 'team2'>,
  distributions: Map<number, TeamScoringDistribution>
): TeamStanding[] => {
  // Create mutable copy
  const updated = standings.map((t) => ({ ...t }));

  matchups.forEach((matchup) => {
    const winner = outcome.get(matchup.matchupId);
    const team1 = updated.find((t) => t.rosterId === matchup.team1RosterId);
    const team2 = updated.find((t) => t.rosterId === matchup.team2RosterId);

    if (!team1 || !team2) return;

    // Use mean scores for scenario analysis
    const dist1 = distributions.get(matchup.team1RosterId);
    const dist2 = distributions.get(matchup.team2RosterId);
    const score1 = dist1?.mean || 100;
    const score2 = dist2?.mean || 100;

    // Update points (add expected scores)
    (team1 as any).pointsFor += score1;
    (team2 as any).pointsFor += score2;

    // Update wins/losses based on outcome
    if (winner === 'team1') {
      (team1 as any).wins += 1;
      (team2 as any).losses += 1;
    } else {
      (team2 as any).wins += 1;
      (team1 as any).losses += 1;
    }
  });

  return updated;
};

/**
 * Describe the conditions required for a specific outcome
 * Now includes analysis of points tiebreakers
 */
const describeConditions = (
  outcome: Map<number, 'team1' | 'team2'>,
  matchups: Week14Matchup[],
  targetRosterId: number,
  standings: TeamStanding[],
  distributions: Map<number, TeamScoringDistribution>,
  targetSeed: number
): ScenarioCondition[] => {
  const conditions: ScenarioCondition[] = [];
  const targetTeam = standings.find((t) => t.rosterId === targetRosterId);
  if (!targetTeam) return conditions;

  // First, add win/loss conditions for all matchups
  matchups.forEach((matchup) => {
    const winner = outcome.get(matchup.matchupId);
    const isTeam1 = matchup.team1RosterId === targetRosterId;
    const isTeam2 = matchup.team2RosterId === targetRosterId;

    if (isTeam1 || isTeam2) {
      // This team's matchup
      const wins = (isTeam1 && winner === 'team1') || (isTeam2 && winner === 'team2');
      conditions.push({
        type: wins ? 'win' : 'lose',
        teamName: isTeam1 ? matchup.team1Name : matchup.team2Name,
        rosterId: targetRosterId,
      });
    } else {
      // Other team's matchup
      const winnerName = winner === 'team1' ? matchup.team1Name : matchup.team2Name;
      const winnerRosterId = winner === 'team1' ? matchup.team1RosterId : matchup.team2RosterId;
      conditions.push({
        type: 'other_team_wins',
        teamName: winnerName,
        rosterId: winnerRosterId,
      });
    }
  });

  // Now analyze if points tiebreaker matters
  // Calculate final standings for this outcome
  const updatedStandings = applyOutcomeToStandings(standings, matchups, outcome, distributions);
  const targetUpdated = updatedStandings.find((t) => t.rosterId === targetRosterId);
  if (!targetUpdated) return conditions;

  // Find teams with same record that could affect seeding
  const sameRecordTeams = updatedStandings.filter(
    (t) => t.rosterId !== targetRosterId && t.wins === targetUpdated.wins
  );

  // Check if any points tiebreaker matters for this seed
  sameRecordTeams.forEach((competitor) => {
    const pointsDiff = targetUpdated.pointsFor - competitor.pointsFor;
    const competitorDist = distributions.get(competitor.rosterId);
    const targetDist = distributions.get(targetRosterId);

    // If the points are close enough that variance could flip the outcome
    if (competitorDist && targetDist) {
      const avgVariance = (competitorDist.stdDev + targetDist.stdDev) / 2;
      // If within 2 standard deviations, points matter
      if (Math.abs(pointsDiff) < avgVariance * 2) {
        // Calculate approximate margin needed
        const marginNeeded = Math.ceil(Math.abs(pointsDiff) + 1);
        if (pointsDiff < 0) {
          // Target needs to outscore competitor
          conditions.push({
            type: 'points_margin',
            teamName: competitor.teamName,
            rosterId: competitor.rosterId,
            marginRequired: marginNeeded,
          });
        }
      }
    }
  });

  return conditions;
};

/**
 * Find which matchups actually affect the target team's seed
 * by comparing outcomes where only that matchup differs
 */
const findRelevantMatchups = (
  allOutcomes: Array<Map<number, 'team1' | 'team2'>>,
  matchups: Week14Matchup[],
  standings: TeamStanding[],
  distributions: Map<number, TeamScoringDistribution>,
  targetRosterId: number
): Set<number> => {
  const relevantMatchupIds = new Set<number>();

  // Find target team's matchup
  const targetMatchup = matchups.find(
    (m) => m.team1RosterId === targetRosterId || m.team2RosterId === targetRosterId
  );

  // Check ALL matchups (including target's) to see if they affect the seed
  matchups.forEach((matchup) => {
    // Sample outcome pairs that differ only in this matchup
    let seedChanged = false;
    
    for (let i = 0; i < Math.min(allOutcomes.length, 32) && !seedChanged; i++) {
      const o1 = allOutcomes[i];
      // Create variant with flipped matchup result
      const o2 = new Map(o1);
      const current = o1.get(matchup.matchupId);
      o2.set(matchup.matchupId, current === 'team1' ? 'team2' : 'team1');

      // Calculate seeds for both
      const s1 = applyOutcomeToStandings(standings, matchups, o1, distributions);
      const s2 = applyOutcomeToStandings(standings, matchups, o2, distributions);
      
      const seeds1 = calculatePlayoffSeeds(s1);
      const seeds2 = calculatePlayoffSeeds(s2);

      if (seeds1.get(targetRosterId) !== seeds2.get(targetRosterId)) {
        relevantMatchupIds.add(matchup.matchupId);
        seedChanged = true;
      }
    }
  });

  return relevantMatchupIds;
};

/**
 * Get a simplified description of conditions (only includes relevant matchups)
 * Note: targetRosterId is included in relevantMatchupIds if it matters
 */
const simplifyConditions = (
  conditions: ScenarioCondition[],
  relevantMatchupIds: Set<number>,
  matchups: Week14Matchup[],
  targetRosterId: number
): ScenarioCondition[] => {
  const simplified: ScenarioCondition[] = [];
  
  // Find target team's matchup
  const targetMatchup = matchups.find(
    (m) => m.team1RosterId === targetRosterId || m.team2RosterId === targetRosterId
  );
  
  // Only include target team's win/loss condition if their matchup is relevant
  // (i.e., if their win/loss affects the seed)
  if (targetMatchup && relevantMatchupIds.has(targetMatchup.matchupId)) {
    const targetCondition = conditions.find(
      (c) => c.rosterId === targetRosterId && (c.type === 'win' || c.type === 'lose')
    );
    if (targetCondition) {
      simplified.push(targetCondition);
    }
  }

  // Only include "other team wins" for matchups that affect the seed
  conditions.forEach((c) => {
    if (c.type === 'other_team_wins') {
      // Find which matchup this condition refers to
      const matchup = matchups.find(
        (m) => m.team1RosterId === c.rosterId || m.team2RosterId === c.rosterId
      );
      if (matchup && relevantMatchupIds.has(matchup.matchupId)) {
        simplified.push(c);
      }
    } else if (c.type === 'points_margin') {
      // Always include points margin conditions
      simplified.push(c);
    }
  });

  return simplified;
};

/**
 * Calculate scenarios for each possible seed for a team
 */
const calculateScenarios = (
  rosterId: number,
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  distributions: Map<number, TeamScoringDistribution>,
  seedCounts: Map<number, number>,
  totalSimulations: number
): SeedScenario[] => {
  const allOutcomes = generateAllOutcomes(matchups);
  
  // Find which matchups actually affect this team's seed
  const relevantMatchupIds = findRelevantMatchups(
    allOutcomes,
    matchups,
    standings,
    distributions,
    rosterId
  );
  
  const scenariosBySeed = new Map<number, Array<{ 
    outcome: Map<number, 'team1' | 'team2'>; 
    conditions: ScenarioCondition[];
    simplified: ScenarioCondition[];
  }>>();

  // For each possible outcome, calculate resulting seed
  allOutcomes.forEach((outcome) => {
    const updatedStandings = applyOutcomeToStandings(standings, matchups, outcome, distributions);
    const seeds = calculatePlayoffSeeds(updatedStandings);
    const seed = seeds.get(rosterId) || 12;

    if (!scenariosBySeed.has(seed)) {
      scenariosBySeed.set(seed, []);
    }

    const conditions = describeConditions(outcome, matchups, rosterId, standings, distributions, seed);
    const simplified = simplifyConditions(conditions, relevantMatchupIds, matchups, rosterId);
    scenariosBySeed.get(seed)!.push({ outcome, conditions, simplified });
  });

  // Find target team's matchup for determining win/lose
  const targetMatchup = matchups.find(
    (m) => m.team1RosterId === rosterId || m.team2RosterId === rosterId
  );
  const isTeam1 = targetMatchup ? targetMatchup.team1RosterId === rosterId : false;

  // Helper to check if outcome is a win for target team
  const isWinOutcome = (outcome: Map<number, 'team1' | 'team2'>): boolean => {
    if (!targetMatchup) return false;
    const winner = outcome.get(targetMatchup.matchupId);
    return (isTeam1 && winner === 'team1') || (!isTeam1 && winner === 'team2');
  };

  // Convert to SeedScenario array - first pass to collect all scenarios
  const rawScenarios: Array<{
    seed: number;
    probability: number;
    conditions: ScenarioCondition[];
    isWin: boolean;
  }> = [];

  seedCounts.forEach((count, seed) => {
    const probability = count / totalSimulations;
    if (probability > 0) {
      const seedScenarios = scenariosBySeed.get(seed) || [];
      
      // Determine primary outcome (WIN or LOSE) for this seed
      let primaryIsWin = false;
      if (seedScenarios.length > 0 && targetMatchup) {
        const winCount = seedScenarios.filter((s) => isWinOutcome(s.outcome)).length;
        primaryIsWin = winCount > seedScenarios.length / 2;
      }

      // Find the best conditions - prefer ones with more context
      let bestConditions: ScenarioCondition[] = [];
      if (seedScenarios.length > 0) {
        // Instead of simplest, find one that has distinguishing info
        // Prefer scenarios with 2-4 conditions (enough context but not overwhelming)
        const candidates = seedScenarios
          .map((s) => s.simplified)
          .filter((c) => c.length >= 1 && c.length <= 5);
        
        if (candidates.length > 0) {
          // Pick the one with moderate complexity (2-3 conditions ideal)
          bestConditions = candidates.reduce((a, b) => {
            const aScore = Math.abs(a.length - 2.5);
            const bScore = Math.abs(b.length - 2.5);
            return aScore <= bScore ? a : b;
          });
        } else {
          // Fall back to simplest
          const simplest = seedScenarios.reduce((a, b) =>
            a.simplified.length <= b.simplified.length ? a : b
          );
          bestConditions = simplest.simplified;
        }
      }

      rawScenarios.push({
        seed,
        probability,
        conditions: bestConditions,
        isWin: primaryIsWin,
      });
    }
  });

  // Second pass: ensure seeds with same primary outcome have distinguishing conditions
  const scenarios: SeedScenario[] = rawScenarios.map((scenario) => {
    let finalConditions = scenario.conditions;

    // If conditions only have WIN or LOSE, find what distinguishes this seed from others
    if (finalConditions.length <= 1 && targetMatchup) {
      // Find other seeds with same primary outcome
      const samePrimaryOutcome = rawScenarios.filter(
        (s) => s.seed !== scenario.seed && s.isWin === scenario.isWin
      );

      if (samePrimaryOutcome.length > 0) {
        // We need to add distinguishing conditions
        const seedScenarios = scenariosBySeed.get(scenario.seed) || [];
        
        // Find a scenario with more conditions that distinguishes this seed
        const withMoreContext = seedScenarios
          .filter((s) => s.simplified.length >= 2)
          .map((s) => s.simplified);

        if (withMoreContext.length > 0) {
          // Pick the one with best balance of info
          finalConditions = withMoreContext.reduce((a, b) => {
            const aScore = Math.abs(a.length - 3);
            const bScore = Math.abs(b.length - 3);
            return aScore <= bScore ? a : b;
          });
        } else if (seedScenarios.length > 0) {
          // Use full conditions from first scenario
          const firstScenario = seedScenarios[0];
          const fullConditions: ScenarioCondition[] = [];
          
          // Add win/lose
          const teamName = isTeam1 ? targetMatchup.team1Name : targetMatchup.team2Name;
          fullConditions.push({
            type: scenario.isWin ? 'win' : 'lose',
            teamName,
            rosterId,
          });

          // Add other team results that matter
          firstScenario.conditions
            .filter((c) => c.type === 'other_team_wins' || c.type === 'points_margin')
            .slice(0, 3) // Limit to top 3 most relevant
            .forEach((c) => fullConditions.push(c));

          finalConditions = fullConditions;
        }
      }
    }

    // Final fallback: find distinguishing conditions even for "any outcome" seeds
    if (finalConditions.length === 0 && targetMatchup) {
      const seedScenarios = scenariosBySeed.get(scenario.seed) || [];
      
      if (seedScenarios.length === 0) {
        // This seed only occurs due to Monte Carlo variance (points tiebreakers)
        // Not in the deterministic 64-outcome analysis
        // We need to figure out WHICH team's points matter for the tiebreaker
        
        const teamName = isTeam1 ? targetMatchup.team1Name : targetMatchup.team2Name;
        const targetStanding = standings.find((s) => s.rosterId === rosterId);
        
        // Find adjacent seed to compare against
        const adjacentSeed = scenario.seed <= 6 
          ? rawScenarios.find((s) => s.seed === scenario.seed + 1)
          : rawScenarios.find((s) => s.seed === scenario.seed - 1);
        
        if (adjacentSeed && targetStanding) {
          // Find teams with similar records who could be the tiebreaker
          // After target's matchup, they'll have wins +/- 1
          const projectedWins = targetStanding.wins + (scenario.isWin ? 1 : 0);
          
          // Look for teams with same projected wins (same record = tiebreaker)
          const tiebreakerCandidates = standings.filter((s) => {
            if (s.rosterId === rosterId) return false;
            // Check if they could end up with same record
            const theirMatchup = matchups.find(
              (m) => m.team1RosterId === s.rosterId || m.team2RosterId === s.rosterId
            );
            if (!theirMatchup) return false;
            // Either winning or losing could give them same record
            const theirWinsIfWin = s.wins + 1;
            const theirWinsIfLose = s.wins;
            return theirWinsIfWin === projectedWins || theirWinsIfLose === projectedWins;
          });
          
          if (tiebreakerCandidates.length > 0) {
            // Sort by current points (closest to target = most likely tiebreaker)
            const sortedCandidates = tiebreakerCandidates.sort((a, b) => {
              const aDiff = Math.abs(a.pointsFor - targetStanding.pointsFor);
              const bDiff = Math.abs(b.pointsFor - targetStanding.pointsFor);
              return aDiff - bDiff;
            });
            
            const tiebreakerTeam = sortedCandidates[0];
            const currentDiff = targetStanding.pointsFor - tiebreakerTeam.pointsFor;
            
            // For better seed (lower number), target needs to have MORE points
            // For worse seed (higher number), target has FEWER points
            const needsMorePoints = scenario.seed < (adjacentSeed.seed);
            
            // Calculate approximate margin needed based on current difference
            // If currently ahead by 50, and this is a better seed, maintain lead
            // If currently behind by 50, and this is worse seed, stay behind or close gap
            const marginNeeded = needsMorePoints
              ? Math.max(1, Math.ceil(-currentDiff + 1)) // Need to be ahead by at least 1
              : undefined; // Any points where you fall behind
            
            finalConditions = [{
              type: scenario.isWin ? 'win' : 'lose',
              teamName,
              rosterId,
            }];
            
            if (needsMorePoints && marginNeeded && marginNeeded > 0) {
              finalConditions.push({
                type: 'points_margin',
                teamName: tiebreakerTeam.teamName,
                rosterId: tiebreakerTeam.rosterId,
                marginRequired: marginNeeded,
              });
            } else if (!needsMorePoints) {
              // Worse seed = be outscored by this team
              finalConditions.push({
                type: 'points_margin',
                teamName: tiebreakerTeam.teamName,
                rosterId: tiebreakerTeam.rosterId,
                marginRequired: currentDiff > 0 ? -Math.ceil(currentDiff + 1) : -1,
              });
            }
          } else {
            finalConditions = [{
              type: scenario.isWin ? 'win' : 'lose',
              teamName,
              rosterId,
            }];
          }
        } else {
          finalConditions = [{
            type: scenario.isWin ? 'win' : 'lose',
            teamName,
            rosterId,
          }];
        }
      } else {
        // Check if both WIN and LOSE lead to this seed
        const winOutcomes = seedScenarios.filter((s) => isWinOutcome(s.outcome));
        const loseOutcomes = seedScenarios.filter((s) => !isWinOutcome(s.outcome));
        
        if (winOutcomes.length > 0 && loseOutcomes.length > 0) {
          // Both WIN and LOSE can lead to this seed
          // Find what conditions are COMMON across all outcomes for this seed
          
          const allConditionSets = seedScenarios.map((s) => s.conditions);
          
          // Find conditions that appear in most/all scenarios
          const conditionCounts = new Map<string, { count: number; condition: ScenarioCondition }>();
          allConditionSets.forEach((conditions) => {
            conditions.forEach((c) => {
              if (c.type === 'other_team_wins' || c.type === 'points_margin') {
                const key = `${c.type}:${c.rosterId}`;
                if (!conditionCounts.has(key)) {
                  conditionCounts.set(key, { count: 0, condition: c });
                }
                conditionCounts.get(key)!.count++;
              }
            });
          });

          // Get conditions that appear in at least 50% of scenarios
          const threshold = seedScenarios.length * 0.5;
          const commonConditions = Array.from(conditionCounts.values())
            .filter((c) => c.count >= threshold)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3) // Top 3 most common
            .map((c) => c.condition);

          if (commonConditions.length > 0) {
            finalConditions = commonConditions;
          }
          // If no common conditions, truly any outcome works - leave empty
        } else if (seedScenarios.length > 0) {
          const teamName = isTeam1 ? targetMatchup.team1Name : targetMatchup.team2Name;
          finalConditions = [{
            type: scenario.isWin ? 'win' : 'lose',
            teamName,
            rosterId,
          }];
        }
      }
    }

    return {
      seed: scenario.seed,
      probability: scenario.probability,
      conditions: finalConditions,
    };
  });

  // Sort by seed number
  scenarios.sort((a, b) => a.seed - b.seed);

  return scenarios;
};

/**
 * Run seeding simulation for a single league
 */
export const runSeedingSimulation = async (
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
  throughWeek: number = 13,
  config: SeedingSimulationConfig = DEFAULT_CONFIG
): Promise<LeagueSeedingResults> => {
  // Fetch current data
  const [standings, matchups, distributions] = await Promise.all([
    fetchCurrentStandings(leagueId, throughWeek),
    fetchWeek14Matchups(leagueId),
    buildTeamScoringDistributions(leagueId, throughWeek),
  ]);

  // Initialize counters for each team
  const teamSeedCounts = new Map<number, Map<number, number>>();
  standings.forEach((team) => {
    const seedCounts = new Map<number, number>();
    for (let seed = 1; seed <= 12; seed++) {
      seedCounts.set(seed, 0);
    }
    teamSeedCounts.set(team.rosterId, seedCounts);
  });

  // Run Monte Carlo simulations
  for (let i = 0; i < config.iterations; i++) {
    // Sample scores for all teams
    const simulatedScores = new Map<number, number>();
    distributions.forEach((dist, rosterId) => {
      // Check if outcome is locked
      const matchup = matchups.find(
        (m) => m.team1RosterId === rosterId || m.team2RosterId === rosterId
      );
      if (matchup && config.lockedOutcomes?.[matchup.matchupId]) {
        // For locked outcomes, use mean score (winner determined by lock, not score)
        simulatedScores.set(rosterId, dist.mean);
      } else {
        simulatedScores.set(rosterId, sampleTeamScore(dist));
      }
    });

    // Apply locked outcomes if any
    if (config.lockedOutcomes) {
      matchups.forEach((matchup) => {
        const lockedWinner = config.lockedOutcomes![matchup.matchupId];
        if (lockedWinner) {
          // Adjust scores to ensure locked winner wins
          const score1 = simulatedScores.get(matchup.team1RosterId) || 100;
          const score2 = simulatedScores.get(matchup.team2RosterId) || 100;
          if (lockedWinner === 'team1' && score1 <= score2) {
            simulatedScores.set(matchup.team1RosterId, score2 + 1);
          } else if (lockedWinner === 'team2' && score2 <= score1) {
            simulatedScores.set(matchup.team2RosterId, score1 + 1);
          }
        }
      });
    }

    // Apply results and calculate seeds
    const updatedStandings = applyWeek14Results(standings, matchups, simulatedScores);
    const seeds = calculatePlayoffSeeds(updatedStandings);

    // Count seeds
    seeds.forEach((seed, rosterId) => {
      const counts = teamSeedCounts.get(rosterId);
      if (counts) {
        counts.set(seed, (counts.get(seed) || 0) + 1);
      }
    });
  }

  // Build results
  const teamResults: TeamSeedingProbabilities[] = standings.map((team) => {
    const seedCounts = teamSeedCounts.get(team.rosterId)!;
    const seedProbabilities: Record<number, number> = {};
    let playoffProbability = 0;
    let bestSeed = 12;
    let worstSeed = 1;

    seedCounts.forEach((count, seed) => {
      const prob = count / config.iterations;
      seedProbabilities[seed] = prob;
      if (prob > 0) {
        if (seed <= 6) playoffProbability += prob;
        if (seed < bestSeed) bestSeed = seed;
        if (seed > worstSeed) worstSeed = seed;
      }
    });

    // Calculate scenarios (only for seeds with probability > 0)
    const scenarios = calculateScenarios(
      team.rosterId,
      standings,
      matchups,
      distributions,
      seedCounts,
      config.iterations
    );

    return {
      rosterId: team.rosterId,
      teamName: team.teamName,
      ownerName: team.ownerName,
      currentRecord: `${team.wins}-${team.losses}`,
      currentPoints: team.pointsFor,
      division: team.division,
      seedProbabilities,
      playoffProbability,
      bestPossibleSeed: bestSeed,
      worstPossibleSeed: worstSeed,
      scenarios,
    };
  });

  // Sort by current playoff probability (descending)
  teamResults.sort((a, b) => b.playoffProbability - a.playoffProbability);

  return {
    leagueId,
    leagueName,
    teams: teamResults,
    week14Matchups: matchups,
    simulationCount: config.iterations,
    generatedAt: new Date().toISOString(),
  };
};

/**
 * Run seeding simulation for both leagues
 */
export const runBothLeagueSimulations = async (
  throughWeek: number = 13,
  config: SeedingSimulationConfig = DEFAULT_CONFIG
): Promise<{
  afc: LeagueSeedingResults;
  nfc: LeagueSeedingResults;
}> => {
  const [afcResults, nfcResults] = await Promise.all([
    runSeedingSimulation(LEAGUE_IDS.AFC, 'AFC', throughWeek, config),
    runSeedingSimulation(LEAGUE_IDS.NFC, 'NFC', throughWeek, config),
  ]);

  return {
    afc: afcResults,
    nfc: nfcResults,
  };
};

