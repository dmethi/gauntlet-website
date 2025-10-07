/**
 * Draft Data Fetcher using Unified Sleeper Client
 *
 * Fetches real draft data from Sleeper API and transforms it into
 * the MockDraft format expected by the analytics system.
 *
 * Ported from the original sleeper-draft-fetcher.ts with full transformation logic.
 */

/* eslint-disable no-console */

import { createDraftClient } from './sleeper/unified-client';
import type {
  SleeperLeague,
  SleeperRoster,
  SleeperUser,
  SleeperPlayer,
  SleeperDraft,
  SleeperDraftPick,
} from '@gauntlet/types';
import type { DraftPick, MockDraft, Player, TeamRoster } from './mock-draft-data';

class DraftDataFetcher {
  private transformPlayer(sleeperPlayer: SleeperPlayer, rank: number, aav: number = 0): Player {
    return {
      id: sleeperPlayer.player_id,
      name: sleeperPlayer.full_name || `${sleeperPlayer.first_name} ${sleeperPlayer.last_name}`,
      position: (sleeperPlayer.fantasy_positions?.[0] || sleeperPlayer.position || 'DEF') as
        | 'QB'
        | 'RB'
        | 'WR'
        | 'TE'
        | 'DEF',
      team: sleeperPlayer.team || 'FA',
      aav: aav, // Will be calculated based on draft position or auction price
      rank: rank,
    };
  }

  /**
   * Calculate price based on draft type
   */
  private calculatePrice(draftType: string, pick: SleeperDraftPick, _teamSize: number): number {
    if (draftType === 'auction') {
      // For auction drafts, try to extract price from metadata
      const raw =
        (pick.metadata as any)?.amount ??
        (pick.metadata as any)?.price ??
        (pick.metadata as any)?.cost;
      const parsed = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.floor(parsed);
      }

      // If no price in metadata, default to $1 (do NOT fabricate synthetic prices)
      // Real drafts must sum to each manager's auction budget (typically $200)
      console.warn(
        `ℹ️ Missing/invalid auction price for pick_no=${pick.pick_no} roster_id=${pick.roster_id}. metadata=`,
        pick.metadata,
      );
      return 1;
    } else {
      // For snake drafts, create synthetic auction values based on draft position
      // Early picks get higher values, later picks get lower values
      // Keep conservative values to avoid inflated totals when a league isn't auction
      const baseValue = Math.max(1, 40 - (pick.pick_no - 1) * 0.5);
      return Math.round(baseValue);
    }
  }

  /**
   * Transform single draft data
   */
  private async transformDraftData(
    draftInfo: SleeperDraft,
    picks: SleeperDraftPick[],
    league: SleeperLeague,
    rosters: SleeperRoster[],
    users: SleeperUser[],
    allPlayers: Record<string, SleeperPlayer>,
    draftName: string,
  ): Promise<MockDraft> {
    console.log(`🔄 Transforming ${draftName} (${draftInfo.type} format)`);

    console.log(
      `📥 ${draftName} data summary → users: ${users.length}, rosters: ${rosters.length}, picks: ${picks.length}`,
    );
    const sampleUsers = users
      .slice(0, 5)
      .map(u => ({ id: u.user_id, name: u.display_name || u.username }));
    console.log(`👥 Sample users (${draftName}):`, sampleUsers);

    // Create user map for team names
    const userMap = new Map(users.map(u => [u.user_id, u]));
    const rosterMap = new Map(rosters.map(r => [r.roster_id, r]));

    // Sort picks by pick number
    const sortedPicks = picks.sort((a, b) => a.pick_no - b.pick_no);

    // Group picks by roster_id to create teams
    const teamPicksMap = new Map<number, SleeperDraftPick[]>();
    sortedPicks.forEach(pick => {
      if (!teamPicksMap.has(pick.roster_id)) {
        teamPicksMap.set(pick.roster_id, []);
      }
      teamPicksMap.get(pick.roster_id)!.push(pick);
    });

    // Transform to our format
    const teams: TeamRoster[] = [];

    for (const [rosterId, teamPicks] of teamPicksMap.entries()) {
      const roster = rosterMap.get(rosterId);
      const user = roster ? userMap.get(roster.owner_id) : null;

      const teamName = user?.display_name || user?.username || `Team ${rosterId}`;
      if (!user) {
        console.warn(
          `⚠️ Missing user for roster_id=${rosterId} in ${draftName}. Using fallback team name.`,
        );
      }

      // Transform picks
      const transformedPicks: DraftPick[] = teamPicks.map((pick, _index) => {
        const sleeperPlayer = allPlayers[pick.player_id];

        if (!sleeperPlayer) {
          console.warn(`⚠️ Player not found: ${pick.player_id}`);
          const actualPrice = this.calculatePrice(draftInfo.type, pick, teamPicks.length);
          return {
            playerId: pick.player_id,
            player: {
              id: pick.player_id,
              name: 'Unknown Player',
              position: 'DEF' as 'QB' | 'RB' | 'WR' | 'TE' | 'DEF',
              team: 'FA',
              aav: 1,
              rank: 999,
            },
            teamId: rosterId,
            teamName: teamName,
            actualPrice: actualPrice,
            pickNumber: pick.pick_no,
            round: pick.round,
            pickInRound: pick.pick_no % 12 || 12, // Calculate pick in round
            aavAtTime: 1,
            valueOverAAV: actualPrice - 1,
            percentageOfAAV: (actualPrice / 1) * 100,
          };
        }

        const player = this.transformPlayer(
          sleeperPlayer,
          pick.pick_no, // Use pick number as rank for now
          0, // AAV will be calculated
        );

        const actualPrice = this.calculatePrice(draftInfo.type, pick, teamPicks.length);
        player.aav = actualPrice; // Set AAV to calculated price

        return {
          playerId: pick.player_id,
          player: player,
          teamId: rosterId,
          teamName: teamName,
          actualPrice: actualPrice,
          pickNumber: pick.pick_no,
          round: pick.round,
          pickInRound: pick.pick_no % 12 || 12, // Calculate pick in round
          aavAtTime: player.aav,
          valueOverAAV: actualPrice - player.aav,
          percentageOfAAV: (actualPrice / Math.max(player.aav, 1)) * 100,
        };
      });

      // Calculate total spent and warn if outside expected budget
      const totalSpent = transformedPicks.reduce((sum, pick) => sum + pick.actualPrice, 0);
      const expectedBudget =
        (draftInfo.settings as any)?.auction_budget ||
        (league.settings as any)?.auction_budget ||
        200;
      if (totalSpent > expectedBudget * 1.2) {
        console.warn(
          `⚠️ Team ${teamName} spent $${totalSpent} in ${draftName}, expected around $${expectedBudget}. Check price parsing.`,
        );
      }

      teams.push({
        teamId: rosterId,
        teamName: teamName,
        picks: transformedPicks,
        totalSpent: totalSpent,
        budget: 200, // Standard auction budget
        remaining: 200 - totalSpent,
        qb: transformedPicks.filter(p => p.player.position === 'QB'),
        rb: transformedPicks.filter(p => p.player.position === 'RB'),
        wr: transformedPicks.filter(p => p.player.position === 'WR'),
        te: transformedPicks.filter(p => p.player.position === 'TE'),
        flex: [], // Will be populated by inferStarters
        bench: [], // Will be populated by inferStarters
        def: transformedPicks.filter(p => p.player.position === 'DEF'),
      });
    }

    return {
      id: draftInfo.draft_id,
      name: `${league.name} (${draftName})`,
      teams: teams,
      totalPicks: picks.length,
      completedPicks: picks.length,
    };
  }

  /**
   * Fetch real drafts using unified Sleeper client
   */
  async fetchRealDrafts(
    draftId1: string,
    draftId2: string,
  ): Promise<{ draft1: MockDraft; draft2: MockDraft }> {
    console.log('🏈 Fetching real draft data from Sleeper API...');

    const draftClient = createDraftClient();

    // Fetch both drafts in parallel
    const [draft1Info, draft1Picks, draft2Info, draft2Picks, allPlayers] = await Promise.all([
      draftClient.fetchDraft(draftId1),
      draftClient.fetchDraftPicks(draftId1),
      draftClient.fetchDraft(draftId2),
      draftClient.fetchDraftPicks(draftId2),
      draftClient.fetchAllPlayers(),
    ]);

    // Fetch league info for both drafts
    const [league1, league2, rosters1, rosters2, users1, users2] = await Promise.all([
      draftClient.fetchLeague(draft1Info.league_id),
      draftClient.fetchLeague(draft2Info.league_id),
      draftClient.fetchRosters(draft1Info.league_id),
      draftClient.fetchRosters(draft2Info.league_id),
      draftClient.fetchUsers(draft1Info.league_id),
      draftClient.fetchUsers(draft2Info.league_id),
    ]);

    // Transform both drafts
    const draft1 = await this.transformDraftData(
      draft1Info,
      draft1Picks,
      league1,
      rosters1,
      users1,
      allPlayers,
      'Draft 1',
    );

    const draft2 = await this.transformDraftData(
      draft2Info,
      draft2Picks,
      league2,
      rosters2,
      users2,
      allPlayers,
      'Draft 2',
    );

    console.log('✅ Successfully fetched and transformed real draft data');
    console.log(`📊 Draft 1: ${draft1.teams.length} teams, ${draft1.totalPicks} picks`);
    console.log(`📊 Draft 2: ${draft2.teams.length} teams, ${draft2.totalPicks} picks`);

    return { draft1, draft2 };
  }
}

// Export singleton instance
const draftFetcher = new DraftDataFetcher();

/**
 * Get real drafts using unified Sleeper client
 */
export async function getRealDrafts(): Promise<{ draft1: MockDraft; draft2: MockDraft }> {
  const DRAFT_ID_1 = '1263744210637422592'; // AFC
  const DRAFT_ID_2 = '1263740550494822400'; // NFC

  return draftFetcher.fetchRealDrafts(DRAFT_ID_1, DRAFT_ID_2);
}
