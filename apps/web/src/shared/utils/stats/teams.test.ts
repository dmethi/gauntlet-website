import { describe, expect, it } from 'vitest';
import { aggregateTeamPoints, getTeamAndOpponentPoints } from './teams';
import type { SleeperMatchup } from '@gauntlet/types';

describe('Team Stats Utilities', () => {
  describe('getTeamAndOpponentPoints', () => {
    it('pairs opponent points correctly for regular matchups', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  matchup_id: 1,
                  points: 120,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
                {
                  roster_id: 2,
                  matchup_id: 1,
                  points: 110,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data).toBeDefined();
      expect(week1Data).toHaveLength(2);

      const team1 = week1Data?.find(d => d.rosterId === 1);
      const team2 = week1Data?.find(d => d.rosterId === 2);

      expect(team1?.teamPoints).toBe(120);
      expect(team1?.opponentPoints).toBe(110);
      expect(team1?.opponentRosterId).toBe(2);

      expect(team2?.teamPoints).toBe(110);
      expect(team2?.opponentPoints).toBe(120);
      expect(team2?.opponentRosterId).toBe(1);
    });

    it('processes multiple leagues separately', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  matchup_id: 1,
                  points: 120,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
                {
                  roster_id: 2,
                  matchup_id: 1,
                  points: 110,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
              ],
            ],
            [
              'nfc',
              [
                {
                  roster_id: 1,
                  matchup_id: 1,
                  points: 150,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
                {
                  roster_id: 2,
                  matchup_id: 1,
                  points: 140,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data).toHaveLength(4); // 2 teams per league, 2 leagues

      // AFC matchup
      const afcTeam1 = week1Data?.find(d => d.leagueId === 'afc' && d.rosterId === 1);
      expect(afcTeam1?.teamPoints).toBe(120);
      expect(afcTeam1?.opponentPoints).toBe(110);

      // NFC matchup
      const nfcTeam1 = week1Data?.find(d => d.leagueId === 'nfc' && d.rosterId === 1);
      expect(nfcTeam1?.teamPoints).toBe(150);
      expect(nfcTeam1?.opponentPoints).toBe(140);
    });

    it('handles bye weeks (single team in matchup)', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                {
                  roster_id: 1,
                  matchup_id: 1,
                  points: 120,
                  players: [],
                  starters: [],
                  players_points: {},
                } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data).toHaveLength(1);
      expect(week1Data?.[0].teamPoints).toBe(120);
      expect(week1Data?.[0].opponentPoints).toBe(0);
      expect(week1Data?.[0].opponentRosterId).toBeUndefined();
    });

    it('handles multiple weeks', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                { roster_id: 1, matchup_id: 1, points: 120 } as SleeperMatchup,
                { roster_id: 2, matchup_id: 1, points: 110 } as SleeperMatchup,
              ],
            ],
          ]),
        ],
        [
          2,
          new Map([
            [
              'afc',
              [
                { roster_id: 1, matchup_id: 1, points: 130 } as SleeperMatchup,
                { roster_id: 2, matchup_id: 1, points: 125 } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });

      expect(result.size).toBe(2);
      expect(result.get(1)).toHaveLength(2);
      expect(result.get(2)).toHaveLength(2);

      const week2Team1 = result.get(2)?.find(d => d.rosterId === 1);
      expect(week2Team1?.teamPoints).toBe(130);
      expect(week2Team1?.opponentPoints).toBe(125);
    });

    it('handles empty matchups', () => {
      const result = getTeamAndOpponentPoints({ matchups: new Map() });
      expect(result.size).toBe(0);
    });

    it('includes leagueId in team data', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'test-league',
              [
                { roster_id: 1, matchup_id: 1, points: 120 } as SleeperMatchup,
                { roster_id: 2, matchup_id: 1, points: 110 } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data?.[0].leagueId).toBe('test-league');
      expect(week1Data?.[1].leagueId).toBe('test-league');
    });

    it('includes matchupId in team data', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                { roster_id: 1, matchup_id: 5, points: 120 } as SleeperMatchup,
                { roster_id: 2, matchup_id: 5, points: 110 } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data?.[0].matchupId).toBe(5);
      expect(week1Data?.[1].matchupId).toBe(5);
    });

    it('handles multiple matchups in same week', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                { roster_id: 1, matchup_id: 1, points: 120 } as SleeperMatchup,
                { roster_id: 2, matchup_id: 1, points: 110 } as SleeperMatchup,
                { roster_id: 3, matchup_id: 2, points: 140 } as SleeperMatchup,
                { roster_id: 4, matchup_id: 2, points: 135 } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data).toHaveLength(4); // 2 matchups, 2 teams each

      const matchup1Teams = week1Data?.filter(d => d.matchupId === 1);
      const matchup2Teams = week1Data?.filter(d => d.matchupId === 2);

      expect(matchup1Teams).toHaveLength(2);
      expect(matchup2Teams).toHaveLength(2);
    });

    it('handles zero scores', () => {
      const matchups: Map<number, Map<string, SleeperMatchup[]>> = new Map([
        [
          1,
          new Map([
            [
              'afc',
              [
                { roster_id: 1, matchup_id: 1, points: 0 } as SleeperMatchup,
                { roster_id: 2, matchup_id: 1, points: 0 } as SleeperMatchup,
              ],
            ],
          ]),
        ],
      ]);

      const result = getTeamAndOpponentPoints({ matchups });
      const week1Data = result.get(1);

      expect(week1Data?.[0].teamPoints).toBe(0);
      expect(week1Data?.[0].opponentPoints).toBe(0);
    });
  });

  describe('aggregateTeamPoints', () => {
    it('sums team points across weeks', () => {
      const weeklyData = new Map([
        [
          1,
          [
            {
              rosterId: 1,
              leagueId: 'afc',
              teamPoints: 120,
              opponentPoints: 110,
              matchupId: 1,
            },
          ],
        ],
        [
          2,
          [
            {
              rosterId: 1,
              leagueId: 'afc',
              teamPoints: 130,
              opponentPoints: 125,
              matchupId: 1,
            },
          ],
        ],
      ]);

      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 2 });
      const team1 = result.get('afc-1');

      expect(team1?.teamTotal).toBe(250); // 120 + 130
      expect(team1?.opponentTotal).toBe(235); // 110 + 125
      expect(team1?.gamesPlayed).toBe(2);
    });

    it('uses composite key to avoid roster ID conflicts', () => {
      const weeklyData = new Map([
        [
          1,
          [
            {
              rosterId: 1,
              leagueId: 'afc',
              teamPoints: 120,
              opponentPoints: 110,
              matchupId: 1,
            },
            {
              rosterId: 1,
              leagueId: 'nfc',
              teamPoints: 150,
              opponentPoints: 140,
              matchupId: 1,
            },
          ],
        ],
      ]);

      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 1 });

      expect(result.has('afc-1')).toBe(true);
      expect(result.has('nfc-1')).toBe(true);
      expect(result.get('afc-1')?.teamTotal).toBe(120);
      expect(result.get('nfc-1')?.teamTotal).toBe(150);
    });

    it('handles partial week range', () => {
      const weeklyData = new Map([
        [1, [{ rosterId: 1, leagueId: 'afc', teamPoints: 120, opponentPoints: 110, matchupId: 1 }]],
        [2, [{ rosterId: 1, leagueId: 'afc', teamPoints: 130, opponentPoints: 125, matchupId: 1 }]],
        [3, [{ rosterId: 1, leagueId: 'afc', teamPoints: 140, opponentPoints: 135, matchupId: 1 }]],
      ]);

      // Only aggregate weeks 1-2
      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 2 });
      const team1 = result.get('afc-1');

      expect(team1?.teamTotal).toBe(250); // 120 + 130 (not including week 3)
      expect(team1?.gamesPlayed).toBe(2);
    });

    it('handles missing weeks in range', () => {
      const weeklyData = new Map([
        [1, [{ rosterId: 1, leagueId: 'afc', teamPoints: 120, opponentPoints: 110, matchupId: 1 }]],
        // Week 2 missing
        [3, [{ rosterId: 1, leagueId: 'afc', teamPoints: 140, opponentPoints: 135, matchupId: 1 }]],
      ]);

      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 3 });
      const team1 = result.get('afc-1');

      expect(team1?.teamTotal).toBe(260); // 120 + 140
      expect(team1?.gamesPlayed).toBe(2); // Only weeks with data
    });

    it('handles multiple teams', () => {
      const weeklyData = new Map([
        [
          1,
          [
            { rosterId: 1, leagueId: 'afc', teamPoints: 120, opponentPoints: 110, matchupId: 1 },
            { rosterId: 2, leagueId: 'afc', teamPoints: 110, opponentPoints: 120, matchupId: 1 },
            { rosterId: 3, leagueId: 'afc', teamPoints: 130, opponentPoints: 125, matchupId: 2 },
          ],
        ],
      ]);

      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 1 });

      expect(result.size).toBe(3);
      expect(result.get('afc-1')?.teamTotal).toBe(120);
      expect(result.get('afc-2')?.teamTotal).toBe(110);
      expect(result.get('afc-3')?.teamTotal).toBe(130);
    });

    it('initializes with zeros for new teams', () => {
      const weeklyData = new Map([
        [1, [{ rosterId: 1, leagueId: 'afc', teamPoints: 120, opponentPoints: 110, matchupId: 1 }]],
      ]);

      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 1 });
      const team1 = result.get('afc-1');

      expect(team1?.teamTotal).toBe(120);
      expect(team1?.opponentTotal).toBe(110);
      expect(team1?.gamesPlayed).toBe(1);
    });

    it('handles empty weekly data', () => {
      const result = aggregateTeamPoints(new Map(), { from: 1, to: 1 });
      expect(result.size).toBe(0);
    });

    it('handles week range with no data', () => {
      const weeklyData = new Map([
        [1, [{ rosterId: 1, leagueId: 'afc', teamPoints: 120, opponentPoints: 110, matchupId: 1 }]],
      ]);

      const result = aggregateTeamPoints(weeklyData, { from: 5, to: 10 });
      expect(result.size).toBe(0);
    });

    it('accumulates across full season', () => {
      const weeklyData = new Map(
        Array.from({ length: 14 }, (_, i) => [
          i + 1,
          [
            {
              rosterId: 1,
              leagueId: 'afc',
              teamPoints: 100 + i * 5,
              opponentPoints: 95 + i * 5,
              matchupId: 1,
            },
          ],
        ]),
      );

      const result = aggregateTeamPoints(weeklyData, { from: 1, to: 14 });
      const team1 = result.get('afc-1');

      expect(team1?.gamesPlayed).toBe(14);
      expect(team1?.teamTotal).toBeGreaterThan(0);
      expect(team1?.opponentTotal).toBeGreaterThan(0);
    });
  });
});
