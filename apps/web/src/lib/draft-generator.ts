// Draft Generation System for Mock Draft Analysis

import {
  Player,
  DraftPick,
  TeamRoster,
  MockDraft,
  mockPlayerData,
  ROSTER_CONSTRAINTS,
  TEAM_NAMES,
  generateRandomPrice,
  shuffleArray,
  canAddPlayerToRoster,
} from './mock-draft-data';

// Re-export types for other modules
export type { Player, DraftPick, TeamRoster, MockDraft } from './mock-draft-data';

interface DraftContext {
  availablePlayers: Player[];
  teams: TeamRoster[];
  currentPick: number;
  round: number;
  pickInRound: number;
  draftOrder: number[];
}

export class DraftGenerator {
  private generateDraftOrder(): number[] {
    // Standard snake draft: 1-12, 12-1, 1-12, etc.
    const order: number[] = [];
    const numTeams = TEAM_NAMES.length;
    const numRounds = ROSTER_CONSTRAINTS.TOTAL_ROSTER;

    for (let round = 1; round <= numRounds; round++) {
      if (round % 2 === 1) {
        // Odd rounds: 1-12
        for (let team = 1; team <= numTeams; team++) {
          order.push(team);
        }
      } else {
        // Even rounds: 12-1
        for (let team = numTeams; team >= 1; team--) {
          order.push(team);
        }
      }
    }

    return order;
  }

  private initializeTeams(): TeamRoster[] {
    return TEAM_NAMES.map((name, index) => ({
      teamId: index + 1,
      teamName: name,
      totalSpent: 0,
      budget: ROSTER_CONSTRAINTS.BUDGET,
      remaining: ROSTER_CONSTRAINTS.BUDGET,
      picks: [],
      qb: [],
      rb: [],
      wr: [],
      te: [],
      flex: [],
      bench: [],
      def: [],
    }));
  }

  private getNextBestPick(
    context: DraftContext,
    teamId: number,
    strategy: 'value' | 'need' | 'balanced' = 'balanced'
  ): Player | null {
    const team = context.teams[teamId - 1];
    const availableWithinBudget = context.availablePlayers.filter(player => {
      const estimatedPrice = generateRandomPrice(player.aav);
      return estimatedPrice <= team.remaining && canAddPlayerToRoster(team.picks, player);
    });

    if (availableWithinBudget.length === 0) {
      // Emergency: take cheapest available player that fits roster
      const emergency = context.availablePlayers
        .filter(player => canAddPlayerToRoster(team.picks, player))
        .sort((a, b) => a.aav - b.aav)[0];
      return emergency || null;
    }

    // Strategy-based selection
    switch (strategy) {
      case 'value':
        // Pick highest AAV player
        return availableWithinBudget.sort((a, b) => b.aav - a.aav)[0];

      case 'need':
        return this.pickByNeed(team, availableWithinBudget);

      case 'balanced':
      default:
        // Mix of value and need
        if (context.currentPick <= 60) {
          // Early picks: prioritize value with some need consideration
          return this.pickByNeed(
            team,
            availableWithinBudget.sort((a, b) => b.aav - a.aav).slice(0, 10)
          );
        } else {
          // Later picks: prioritize need
          return this.pickByNeed(team, availableWithinBudget);
        }
    }
  }

  private pickByNeed(team: TeamRoster, availablePlayers: Player[]): Player {
    const positionCounts = {
      QB: team.picks.filter(p => p.player.position === 'QB').length,
      RB: team.picks.filter(p => p.player.position === 'RB').length,
      WR: team.picks.filter(p => p.player.position === 'WR').length,
      TE: team.picks.filter(p => p.player.position === 'TE').length,
      DEF: team.picks.filter(p => p.player.position === 'DEF').length,
    };

    // Priority order based on roster needs
    const needsPriority: ('QB' | 'RB' | 'WR' | 'TE' | 'DEF')[] = [];

    // Must-have positions first
    if (positionCounts.QB === 0) needsPriority.push('QB');
    if (positionCounts.DEF === 0 && team.picks.length >= 12) needsPriority.push('DEF'); // DEF late

    // Core positions
    if (positionCounts.RB < ROSTER_CONSTRAINTS.RB) needsPriority.push('RB');
    if (positionCounts.WR < ROSTER_CONSTRAINTS.WR) needsPriority.push('WR');
    if (positionCounts.TE === 0) needsPriority.push('TE');

    // Flex and depth
    if (positionCounts.RB < 4) needsPriority.push('RB'); // RB depth important
    if (positionCounts.WR < 5) needsPriority.push('WR'); // WR depth important
    if (positionCounts.TE < 2) needsPriority.push('TE'); // TE depth
    if (positionCounts.QB < 2) needsPriority.push('QB'); // QB depth

    // Find best player for highest priority need
    for (const position of needsPriority) {
      const positionPlayers = availablePlayers
        .filter(p => p.position === position)
        .sort((a, b) => b.aav - a.aav);

      if (positionPlayers.length > 0) {
        return positionPlayers[0];
      }
    }

    // Fallback: best available
    return availablePlayers.sort((a, b) => b.aav - a.aav)[0];
  }

  private assignToRosterSpot(pick: DraftPick, team: TeamRoster): void {
    const { position } = pick.player;

    switch (position) {
      case 'QB':
        if (team.qb.length < ROSTER_CONSTRAINTS.QB) {
          team.qb.push(pick);
        } else {
          team.bench.push(pick);
        }
        break;

      case 'RB':
        if (team.rb.length < ROSTER_CONSTRAINTS.RB) {
          team.rb.push(pick);
        } else if (team.flex.length < ROSTER_CONSTRAINTS.FLEX) {
          team.flex.push(pick);
        } else {
          team.bench.push(pick);
        }
        break;

      case 'WR':
        if (team.wr.length < ROSTER_CONSTRAINTS.WR) {
          team.wr.push(pick);
        } else if (team.flex.length < ROSTER_CONSTRAINTS.FLEX) {
          team.flex.push(pick);
        } else {
          team.bench.push(pick);
        }
        break;

      case 'TE':
        if (team.te.length < ROSTER_CONSTRAINTS.TE) {
          team.te.push(pick);
        } else if (team.flex.length < ROSTER_CONSTRAINTS.FLEX) {
          team.flex.push(pick);
        } else {
          team.bench.push(pick);
        }
        break;

      case 'DEF':
        if (team.def.length < ROSTER_CONSTRAINTS.DEF) {
          team.def.push(pick);
        } else {
          team.bench.push(pick);
        }
        break;
    }
  }

  public generateMockDraft(
    draftId: string,
    draftName: string,
    variancePercent: number = 10
  ): MockDraft {
    const context: DraftContext = {
      availablePlayers: [...mockPlayerData].sort((a, b) => a.rank - b.rank),
      teams: this.initializeTeams(),
      currentPick: 1,
      round: 1,
      pickInRound: 1,
      draftOrder: this.generateDraftOrder(),
    };

    const totalPicks = TEAM_NAMES.length * ROSTER_CONSTRAINTS.TOTAL_ROSTER;

    // Assign different strategies to teams for realism
    const teamStrategies: ('value' | 'need' | 'balanced')[] = shuffleArray([
      'value',
      'value',
      'need',
      'need',
      'balanced',
      'balanced',
      'value',
      'need',
      'balanced',
      'value',
      'need',
      'balanced',
    ]);

    for (let pickNum = 1; pickNum <= totalPicks; pickNum++) {
      const teamId = context.draftOrder[pickNum - 1];
      const team = context.teams[teamId - 1];
      const strategy = teamStrategies[teamId - 1];

      const selectedPlayer = this.getNextBestPick(context, teamId, strategy);

      if (!selectedPlayer) {
        console.warn(`No available player for team ${teamId} at pick ${pickNum}`);
        continue;
      }

      // Generate actual draft price with budget management
      let actualPrice = generateRandomPrice(selectedPlayer.aav, variancePercent);

      // Smart budget management: if we're close to end of draft and have remaining budget, spend it
      const remainingPicks = totalPicks - pickNum;
      const averagePriceNeeded =
        team.remaining / Math.max(1, ROSTER_CONSTRAINTS.TOTAL_ROSTER - team.picks.length);

      if (remainingPicks <= 3 && team.remaining > actualPrice) {
        // On last few picks, try to spend remaining budget more evenly
        actualPrice = Math.min(
          team.remaining,
          actualPrice + Math.floor(team.remaining / Math.max(1, remainingPicks))
        );
      } else if (team.remaining < actualPrice) {
        // Can't exceed budget
        actualPrice = Math.max(1, team.remaining);
      }

      const adjustedPrice = actualPrice;

      // Create the pick
      const pick: DraftPick = {
        playerId: selectedPlayer.id,
        player: selectedPlayer,
        teamId,
        teamName: team.teamName,
        pickNumber: pickNum,
        round: context.round,
        pickInRound: context.pickInRound,
        actualPrice: adjustedPrice,
        aavAtTime: selectedPlayer.aav,
        valueOverAAV: adjustedPrice - selectedPlayer.aav,
        percentageOfAAV: (actualPrice / selectedPlayer.aav) * 100,
      };

      // Add pick to team
      team.picks.push(pick);
      team.totalSpent += adjustedPrice;
      team.remaining = team.budget - team.totalSpent;

      // Assign to roster spot
      this.assignToRosterSpot(pick, team);

      // Remove player from available pool
      context.availablePlayers = context.availablePlayers.filter(p => p.id !== selectedPlayer.id);

      // Update context for next pick
      context.currentPick = pickNum + 1;
      context.pickInRound++;

      if (context.pickInRound > TEAM_NAMES.length) {
        context.round++;
        context.pickInRound = 1;
      }
    }

    // Final budget adjustment - ensure each team spends exactly $200
    context.teams.forEach(team => {
      if (team.totalSpent !== team.budget) {
        const difference = team.budget - team.totalSpent;

        if (team.picks.length > 0 && difference > 0) {
          // Only adjust upward to spend remaining budget
          // Find the best pick to adjust (highest AAV pick that can absorb the difference)
          const sortedPicks = team.picks
            .filter(pick => pick.player.aav >= 5) // Only adjust higher value players
            .sort((a, b) => b.player.aav - a.player.aav);

          if (sortedPicks.length > 0) {
            const pickToAdjust = sortedPicks[0];
            const maxAdjustment = Math.min(difference, pickToAdjust.player.aav); // Don't exceed AAV as adjustment

            pickToAdjust.actualPrice += maxAdjustment;
            pickToAdjust.valueOverAAV = pickToAdjust.actualPrice - pickToAdjust.aavAtTime;
            pickToAdjust.percentageOfAAV =
              (pickToAdjust.actualPrice / pickToAdjust.aavAtTime) * 100;

            team.totalSpent += maxAdjustment;
            team.remaining = team.budget - team.totalSpent;
          }
        } else if (difference < 0) {
          // If we're over budget, find picks to adjust downward
          let amountToReduce = Math.abs(difference);
          const adjustablePicks = team.picks
            .filter(pick => pick.actualPrice > 1) // Can't go below $1
            .sort((a, b) => b.actualPrice - a.actualPrice); // Start with highest priced

          for (const pick of adjustablePicks) {
            if (amountToReduce <= 0) break;

            const maxReduction = Math.min(pick.actualPrice - 1, amountToReduce);
            pick.actualPrice -= maxReduction;
            pick.valueOverAAV = pick.actualPrice - pick.aavAtTime;
            pick.percentageOfAAV = (pick.actualPrice / pick.aavAtTime) * 100;

            team.totalSpent -= maxReduction;
            amountToReduce -= maxReduction;
          }

          team.remaining = team.budget - team.totalSpent;
        }
      }
    });

    return {
      id: draftId,
      name: draftName,
      teams: context.teams,
      totalPicks,
      completedPicks: totalPicks,
    };
  }

  public generateTwoMockDrafts(): [MockDraft, MockDraft] {
    const draft1 = this.generateMockDraft('draft-1', 'Mock Draft Alpha', 10);
    const draft2 = this.generateMockDraft('draft-2', 'Mock Draft Beta', 12);

    return [draft1, draft2];
  }
}

// Export pre-generated drafts
export function getPreGeneratedDrafts(): [MockDraft, MockDraft] {
  const generator = new DraftGenerator();
  return generator.generateTwoMockDrafts();
}

// Utility functions for draft analysis
export function calculateDraftEfficiency(draft: MockDraft) {
  const totalValue = draft.teams.reduce((sum, team) => {
    return sum + team.picks.reduce((teamSum, pick) => teamSum + pick.valueOverAAV, 0);
  }, 0);

  const averageValuePerTeam = totalValue / draft.teams.length;

  return {
    totalValue,
    averageValuePerTeam,
    teams: draft.teams.map(team => ({
      teamId: team.teamId,
      teamName: team.teamName,
      totalValue: team.picks.reduce((sum, pick) => sum + pick.valueOverAAV, 0),
      avgValuePerPick:
        team.picks.reduce((sum, pick) => sum + pick.valueOverAAV, 0) / team.picks.length,
      totalSpent: team.totalSpent,
      budgetEfficiency: team.totalSpent / team.budget,
    })),
  };
}

export function comparePlayerAcquisition(draft1: MockDraft, draft2: MockDraft, playerId: string) {
  const pick1 = draft1.teams.flatMap(t => t.picks).find(p => p.playerId === playerId);
  const pick2 = draft2.teams.flatMap(t => t.picks).find(p => p.playerId === playerId);

  return {
    player: pick1?.player || pick2?.player,
    draft1: pick1
      ? {
          team: pick1.teamName,
          round: pick1.round,
          pick: pick1.pickNumber,
          price: pick1.actualPrice,
          value: pick1.valueOverAAV,
        }
      : null,
    draft2: pick2
      ? {
          team: pick2.teamName,
          round: pick2.round,
          pick: pick2.pickNumber,
          price: pick2.actualPrice,
          value: pick2.valueOverAAV,
        }
      : null,
    priceDifference: pick1 && pick2 ? pick2.actualPrice - pick1.actualPrice : null,
    roundDifference: pick1 && pick2 ? pick2.round - pick1.round : null,
  };
}
