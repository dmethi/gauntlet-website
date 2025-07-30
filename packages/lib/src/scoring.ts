import { ScoringSystem, Player } from '@gauntlet/types';
import { STANDARD_SCORING } from './constants';

/**
 * Calculate fantasy points for a player based on their stats and scoring system
 */
export function calculateFantasyPoints(
  playerStats: Record<string, number>,
  scoringSystem: ScoringSystem = STANDARD_SCORING,
  position: string
): number {
  let points = 0;

  // Passing points (QB)
  if (position === 'QB') {
    points += (playerStats.passingYards || 0) * scoringSystem.passing.passingYards;
    points += (playerStats.passingTDs || 0) * scoringSystem.passing.passingTDs;
    points += (playerStats.passingINTs || 0) * scoringSystem.passing.passingINTs;
    points += (playerStats.passing2PT || 0) * scoringSystem.passing.passing2PT;
  }

  // Rushing points (RB, QB, WR, TE)
  if (['RB', 'QB', 'WR', 'TE'].includes(position)) {
    points += (playerStats.rushingYards || 0) * scoringSystem.rushing.rushingYards;
    points += (playerStats.rushingTDs || 0) * scoringSystem.rushing.rushingTDs;
    points += (playerStats.rushing2PT || 0) * scoringSystem.rushing.rushing2PT;
  }

  // Receiving points (WR, TE, RB)
  if (['WR', 'TE', 'RB'].includes(position)) {
    points += (playerStats.receivingYards || 0) * scoringSystem.receiving.receivingYards;
    points += (playerStats.receivingTDs || 0) * scoringSystem.receiving.receivingTDs;
    points += (playerStats.receptions || 0) * scoringSystem.receiving.receptions;
    points += (playerStats.receiving2PT || 0) * scoringSystem.receiving.receiving2PT;
  }

  // Kicking points (K)
  if (position === 'K') {
    points += (playerStats.extraPoints || 0) * scoringSystem.kicking.extraPoints;
    points += (playerStats.fieldGoals0to39 || 0) * scoringSystem.kicking.fieldGoals0to39;
    points += (playerStats.fieldGoals40to49 || 0) * scoringSystem.kicking.fieldGoals40to49;
    points += (playerStats.fieldGoals50plus || 0) * scoringSystem.kicking.fieldGoals50plus;
    points += (playerStats.missedExtraPoints || 0) * scoringSystem.kicking.missedExtraPoints;
    points += (playerStats.missedFieldGoals || 0) * scoringSystem.kicking.missedFieldGoals;
  }

  // Defense points (DEF)
  if (position === 'DEF') {
    points += (playerStats.sacks || 0) * scoringSystem.defense.sacks;
    points += (playerStats.interceptions || 0) * scoringSystem.defense.interceptions;
    points += (playerStats.fumbleRecoveries || 0) * scoringSystem.defense.fumbleRecoveries;
    points += (playerStats.safeties || 0) * scoringSystem.defense.safeties;
    points += (playerStats.defensiveTDs || 0) * scoringSystem.defense.defensiveTDs;

    // Points allowed scoring
    const pointsAllowed = playerStats.pointsAllowed || 0;
    if (pointsAllowed === 0) points += scoringSystem.defense.pointsAllowed0;
    else if (pointsAllowed <= 6) points += scoringSystem.defense.pointsAllowed1To6;
    else if (pointsAllowed <= 13) points += scoringSystem.defense.pointsAllowed7To13;
    else if (pointsAllowed <= 20) points += scoringSystem.defense.pointsAllowed14To20;
    else if (pointsAllowed <= 27) points += scoringSystem.defense.pointsAllowed21To27;
    else if (pointsAllowed <= 34) points += scoringSystem.defense.pointsAllowed28To34;
    else points += scoringSystem.defense.pointsAllowed35Plus;
  }

  return Math.round(points * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate total team score from roster
 */
export function calculateTeamScore(
  roster: Player[],
  scoringSystem: ScoringSystem = STANDARD_SCORING
): number {
  return roster.reduce((total, player) => total + player.fantasyPoints, 0);
}

/**
 * Compare two scoring systems for differences
 */
export function compareScoringSystems(
  system1: ScoringSystem,
  system2: ScoringSystem
): Array<{ category: string; setting: string; system1Value: number; system2Value: number }> {
  const differences: Array<{
    category: string;
    setting: string;
    system1Value: number;
    system2Value: number;
  }> = [];

  // Compare passing scoring
  Object.entries(system1.passing).forEach(([key, value]) => {
    if (value !== system2.passing[key as keyof typeof system2.passing]) {
      differences.push({
        category: 'passing',
        setting: key,
        system1Value: value,
        system2Value: system2.passing[key as keyof typeof system2.passing],
      });
    }
  });

  // Compare other categories similarly...
  // (Implementation would continue for rushing, receiving, kicking, defense)

  return differences;
}
