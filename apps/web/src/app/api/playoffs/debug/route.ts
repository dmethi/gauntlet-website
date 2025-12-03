/**
 * Debug endpoint for playoff seeding scenarios
 */

import { NextResponse } from 'next/server';
import { runSeedingSimulation } from '@/features/playoffs/simulations';
import { LEAGUE_IDS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use MORE iterations to get better scenario coverage
    const results = await runSeedingSimulation(LEAGUE_IDS.AFC, 'AFC', 13, {
      iterations: 5000,
    });

    // Find achak7 or similar contested team
    const contestedTeams = results.teams.filter(
      (t) => t.playoffProbability > 0.5 && t.playoffProbability < 1
    );

    // Show ALL scenarios for contested teams
    const teamsWithScenarios = contestedTeams.map((team) => {
      return {
        teamName: team.teamName,
        record: team.currentRecord,
        playoffProbability: team.playoffProbability,
        bestSeed: team.bestPossibleSeed,
        worstSeed: team.worstPossibleSeed,
        allScenarios: team.scenarios.map((s) => ({
          seed: s.seed,
          probability: s.probability,
          conditionCount: s.conditions.length,
          conditions: s.conditions.map((c) => ({
            type: c.type,
            teamName: c.teamName,
            marginRequired: c.marginRequired,
          })),
          conditionString: s.conditions.map((c) => {
            if (c.type === 'win') return 'WIN';
            if (c.type === 'lose') return 'LOSE';
            if (c.type === 'points_margin') return `outscore ${c.teamName} by ${c.marginRequired}+ pts`;
            return `${c.teamName} wins`;
          }).join(' + ') || 'Any outcome',
        })),
      };
    });

    return NextResponse.json({
      success: true,
      contestedTeams: teamsWithScenarios,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

