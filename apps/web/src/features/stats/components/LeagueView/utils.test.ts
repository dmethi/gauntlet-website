import { describe, expect, it } from 'vitest';
import type { TrackedPosition } from '@/shared/utils/stats';
import {
  calculateLeagueRankings,
  calculatePositionRankings,
  getPositionSparklineColor,
  getPositionSparklineData,
  getSparklineData,
} from './utils';
import type { PositionData, TeamData } from './utils';

describe('LeagueView utilities', () => {
  const mockTeamData: TeamData = {
    teamInfo: { teamName: 'Team 1', leagueName: 'AFC' },
    teamScores: [
      { week: 1, value: 100 },
      { week: 2, value: 110 },
      { week: 3, value: 0 },
    ],
  };

  const mockTeamEntries: [string, TeamData][] = [
    [
      'team1',
      {
        teamInfo: { teamName: 'Team 1', leagueName: 'AFC' },
        teamScores: [
          { week: 1, value: 100 },
          { week: 2, value: 110 },
        ],
      },
    ],
    [
      'team2',
      {
        teamInfo: { teamName: 'Team 2', leagueName: 'NFC' },
        teamScores: [
          { week: 1, value: 90 },
          { week: 2, value: 105 },
        ],
      },
    ],
    [
      'team3',
      {
        teamInfo: { teamName: 'Team 3', leagueName: 'AFC' },
        teamScores: [
          { week: 1, value: 85 },
          { week: 2, value: 95 },
        ],
      },
    ],
  ];

  const mockPositionsMap = new Map<TrackedPosition, PositionData>([
    [
      'QB',
      {
        teams: [
          [
            'team1',
            {
              scores: [
                { week: 1, value: 25 },
                { week: 2, value: 30 },
              ],
            },
          ],
          [
            'team2',
            {
              scores: [
                { week: 1, value: 20 },
                { week: 2, value: 22 },
              ],
            },
          ],
          [
            'team3',
            {
              scores: [
                { week: 1, value: 18 },
                { week: 2, value: 19 },
              ],
            },
          ],
        ],
      },
    ],
    [
      'RB',
      {
        teams: [
          [
            'team1',
            {
              scores: [
                { week: 1, value: 30 },
                { week: 2, value: 35 },
              ],
            },
          ],
          [
            'team2',
            {
              scores: [
                { week: 1, value: 28 },
                { week: 2, value: 32 },
              ],
            },
          ],
          [
            'team3',
            {
              scores: [
                { week: 1, value: 25 },
                { week: 2, value: 30 },
              ],
            },
          ],
        ],
      },
    ],
    [
      'WR',
      {
        teams: [
          [
            'team1',
            {
              scores: [
                { week: 1, value: 35 },
                { week: 2, value: 38 },
              ],
            },
          ],
          [
            'team2',
            {
              scores: [
                { week: 1, value: 32 },
                { week: 2, value: 35 },
              ],
            },
          ],
          [
            'team3',
            {
              scores: [
                { week: 1, value: 30 },
                { week: 2, value: 33 },
              ],
            },
          ],
        ],
      },
    ],
    [
      'TE',
      {
        teams: [
          [
            'team1',
            {
              scores: [
                { week: 1, value: 8 },
                { week: 2, value: 9 },
              ],
            },
          ],
          [
            'team2',
            {
              scores: [
                { week: 1, value: 7 },
                { week: 2, value: 8 },
              ],
            },
          ],
          [
            'team3',
            {
              scores: [
                { week: 1, value: 10 },
                { week: 2, value: 11 },
              ],
            },
          ],
        ],
      },
    ],
    [
      'DEF',
      {
        teams: [
          [
            'team1',
            {
              scores: [
                { week: 1, value: 2 },
                { week: 2, value: -2 },
              ],
            },
          ],
          [
            'team2',
            {
              scores: [
                { week: 1, value: 3 },
                { week: 2, value: 8 },
              ],
            },
          ],
          [
            'team3',
            {
              scores: [
                { week: 1, value: 2 },
                { week: 2, value: 2 },
              ],
            },
          ],
        ],
      },
    ],
  ]);

  describe('calculateLeagueRankings', () => {
    it('should calculate weekly rankings correctly', () => {
      const rankings = calculateLeagueRankings(mockTeamEntries, mockPositionsMap, 1, false);

      expect(rankings).toHaveLength(3);
      expect(rankings[0].key).toBe('team1'); // 100 points
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].teamTotal).toBe(100);
      expect(rankings[1].key).toBe('team2'); // 90 points
      expect(rankings[1].rank).toBe(2);
      expect(rankings[2].key).toBe('team3'); // 85 points
      expect(rankings[2].rank).toBe(3);
    });

    it('should calculate season rankings correctly', () => {
      const rankings = calculateLeagueRankings(mockTeamEntries, mockPositionsMap, null, true);

      expect(rankings).toHaveLength(3);
      expect(rankings[0].key).toBe('team1'); // 210 points total
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].teamTotal).toBe(210);
    });

    it('should include positional breakdowns', () => {
      const rankings = calculateLeagueRankings(mockTeamEntries, mockPositionsMap, 1, false);

      expect(rankings[0].positions).toMatchObject({
        QB: 25,
        RB: 30,
        WR: 35,
        TE: 8,
        DEF: 2,
      });
    });

    it('should calculate position ranks', () => {
      const rankings = calculateLeagueRankings(mockTeamEntries, mockPositionsMap, 1, false);

      expect(rankings[0].positionRanks.QB).toBe(1); // Team 1 has best QB
      expect(rankings[0].positionRanks.RB).toBe(1); // Team 1 has best RB
      expect(rankings[0].positionRanks.WR).toBe(1); // Team 1 has best WR
    });

    it('should filter out teams with zero scores', () => {
      const entriesWithZero: [string, TeamData][] = [
        ...mockTeamEntries,
        [
          'team4',
          {
            teamInfo: { teamName: 'Team 4', leagueName: 'NFC' },
            teamScores: [{ week: 1, value: 0 }],
          },
        ],
      ];

      const rankings = calculateLeagueRankings(entriesWithZero, mockPositionsMap, 1, false);

      expect(rankings).toHaveLength(3); // Should not include team4
      expect(rankings.every(r => r.key !== 'team4')).toBe(true);
    });

    it('should handle empty position data gracefully', () => {
      const emptyPositionsMap = new Map<TrackedPosition, PositionData>();

      const rankings = calculateLeagueRankings(mockTeamEntries, emptyPositionsMap, 1, false);

      expect(rankings).toHaveLength(3);
      expect(rankings[0].positions.QB).toBe(0);
      expect(rankings[0].positions.RB).toBe(0);
    });
  });

  describe('calculatePositionRankings', () => {
    it('should calculate QB rankings correctly', () => {
      const rankings = calculatePositionRankings(mockTeamEntries, mockPositionsMap, 'QB', 1, false);

      expect(rankings).toHaveLength(3);
      expect(rankings[0].key).toBe('team1'); // 25 points
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].posScore).toBe(25);
    });

    it('should calculate season position rankings', () => {
      const rankings = calculatePositionRankings(
        mockTeamEntries,
        mockPositionsMap,
        'QB',
        null,
        true,
      );

      expect(rankings).toHaveLength(3);
      expect(rankings[0].key).toBe('team1'); // 55 points total
      expect(rankings[0].posScore).toBe(55);
    });

    it('should filter out teams without position data', () => {
      const limitedPositionsMap = new Map<TrackedPosition, PositionData>([
        [
          'QB',
          {
            teams: [
              [
                'team1',
                {
                  scores: [{ week: 1, value: 25 }],
                },
              ],
            ],
          },
        ],
      ]);

      const rankings = calculatePositionRankings(
        mockTeamEntries,
        limitedPositionsMap,
        'QB',
        1,
        false,
      );

      expect(rankings).toHaveLength(1); // Only team1 has QB data
      expect(rankings[0].key).toBe('team1');
    });

    it('should handle all tracked positions', () => {
      const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

      for (const position of positions) {
        const rankings = calculatePositionRankings(
          mockTeamEntries,
          mockPositionsMap,
          position,
          1,
          false,
        );
        expect(rankings.length).toBeGreaterThan(0);
        expect(rankings[0].posScore).toBeGreaterThan(0);
      }
    });

    it('should filter out zero scores', () => {
      const positionsWithZero = new Map<TrackedPosition, PositionData>([
        [
          'QB',
          {
            teams: [
              [
                'team1',
                {
                  scores: [{ week: 1, value: 25 }],
                },
              ],
              [
                'team2',
                {
                  scores: [{ week: 1, value: 0 }],
                },
              ],
            ],
          },
        ],
      ]);

      const rankings = calculatePositionRankings(
        mockTeamEntries,
        positionsWithZero,
        'QB',
        1,
        false,
      );

      expect(rankings).toHaveLength(1); // team2 has zero score
      expect(rankings[0].key).toBe('team1');
    });
  });

  describe('getSparklineData', () => {
    it('should extract weekly scores', () => {
      const data = getSparklineData(mockTeamData);

      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({ week: 1, score: 100 });
      expect(data[1]).toEqual({ week: 2, score: 110 });
    });

    it('should filter out zero scores', () => {
      const data = getSparklineData(mockTeamData);

      expect(data.every(d => d.score > 0)).toBe(true);
      expect(data.find(d => d.week === 3)).toBeUndefined(); // Week 3 has 0 score
    });

    it('should handle undefined team data', () => {
      const data = getSparklineData(undefined);

      expect(data).toEqual([]);
    });

    it('should handle empty team scores', () => {
      const emptyTeamData: TeamData = {
        teamInfo: { teamName: 'Empty', leagueName: 'AFC' },
        teamScores: [],
      };

      const data = getSparklineData(emptyTeamData);

      expect(data).toEqual([]);
    });
  });

  describe('getPositionSparklineData', () => {
    it('should extract position weekly scores', () => {
      const data = getPositionSparklineData(mockPositionsMap, 'QB', 'team1');

      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({ week: 1, score: 25 });
      expect(data[1]).toEqual({ week: 2, score: 30 });
    });

    it('should handle missing team data', () => {
      const data = getPositionSparklineData(mockPositionsMap, 'QB', 'nonexistent');

      expect(data).toEqual([]);
    });

    it('should handle missing position', () => {
      const emptyMap = new Map<TrackedPosition, PositionData>();
      const data = getPositionSparklineData(emptyMap, 'QB', 'team1');

      expect(data).toEqual([]);
    });

    it('should filter out zero scores', () => {
      const data = getPositionSparklineData(mockPositionsMap, 'DEF', 'team1');

      // DEF has week 2 with -2, which should be included (not zero)
      expect(data.every(d => d.score !== 0)).toBe(true);
    });
  });

  describe('getPositionSparklineColor', () => {
    const mockColors = {
      rdylgn: {
        2: '#d73027', // red
        5: '#ffffbf', // yellow
        8: '#1a9850', // green
      },
    };

    it('should return green for elite ranks (1-6)', () => {
      expect(getPositionSparklineColor(1, mockColors)).toBe(mockColors.rdylgn[8]);
      expect(getPositionSparklineColor(6, mockColors)).toBe(mockColors.rdylgn[8]);
    });

    it('should return yellow for average ranks (7-12)', () => {
      expect(getPositionSparklineColor(7, mockColors)).toBe(mockColors.rdylgn[5]);
      expect(getPositionSparklineColor(12, mockColors)).toBe(mockColors.rdylgn[5]);
    });

    it('should return red for below average ranks (13+)', () => {
      expect(getPositionSparklineColor(13, mockColors)).toBe(mockColors.rdylgn[2]);
      expect(getPositionSparklineColor(24, mockColors)).toBe(mockColors.rdylgn[2]);
    });
  });
});
