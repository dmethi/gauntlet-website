import { describe, expect, it } from 'vitest';
import type { SleeperTransaction } from '@gauntlet/types';
import { processWaiverData } from './process-waiver-data';

const transaction = (id: string, rosterId: number, playerId: string): SleeperTransaction =>
  ({
    transaction_id: id,
    type: 'waiver',
    status: 'complete',
    adds: { [playerId]: rosterId },
    drops: {},
    roster_ids: [rosterId],
    settings: { waiver_bid: 5 },
    created: 1,
    metadata: {},
  }) as SleeperTransaction;

describe('processWaiverData', () => {
  it('processes every league supplied by a three-league season', async () => {
    const leagues = ['Legion I', 'Legion II', 'Legion III'].map((leagueName, index) => ({
      leagueId: `league-${index + 1}`,
      leagueName,
      weeklyTransactions: new Map([
        [1, [transaction(`txn-${index + 1}`, index + 1, `player-${index + 1}`)]],
      ]),
    }));
    const teamsMap = new Map(
      leagues.map((league, index) => [
        `${league.leagueId}-${index + 1}`,
        {
          rosterId: index + 1,
          teamName: `Team ${index + 1}`,
          managerName: `Manager ${index + 1}`,
          leagueId: league.leagueId,
          leagueName: league.leagueName,
        },
      ]),
    );

    const result = await processWaiverData(
      leagues,
      teamsMap,
      playerId => ({ playerId, playerName: playerId, position: 'WR' }),
      1,
    );

    expect(result.leagueTrends.map(league => league.leagueName)).toEqual([
      'Legion I',
      'Legion II',
      'Legion III',
    ]);
    expect(new Set(result.allTransactions.map(item => item.leagueId))).toEqual(
      new Set(['league-1', 'league-2', 'league-3']),
    );
  });
});
