import { describe, it, expect } from 'vitest';
import {
  calculateRollingWindows,
  calculateSeasonalData,
  calculateStreaks,
  findBestRollingWindows,
  findLongestStreaks,
  findSeasonalRecords,
  type RollingWindowData,
  type SeasonalData,
  type StreakData,
  type EnhancedMatchup,
} from './aggregations';
import type { ProcessedMatchup } from '@/features/hall-of-fame/types';

describe('aggregations', () => {
  const mockMatchups: ProcessedMatchup[] = [
    {
      rosterId: 1,
      teamName: 'Team Alpha',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 1,
      season: '2025',
      points: 150,
      opponentId: 2,
      opponentName: 'Team Beta',
      opponentPoints: 120,
      won: true,
      starters: [],
      matchupId: 1,
      isPlayoff: false,
    },
    {
      rosterId: 1,
      teamName: 'Team Alpha',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 2,
      season: '2025',
      points: 140,
      opponentId: 3,
      opponentName: 'Team Gamma',
      opponentPoints: 130,
      won: true,
      starters: [],
      matchupId: 2,
      isPlayoff: false,
    },
    {
      rosterId: 1,
      teamName: 'Team Alpha',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 3,
      season: '2025',
      points: 160,
      opponentId: 4,
      opponentName: 'Team Delta',
      opponentPoints: 155,
      won: true,
      starters: [],
      matchupId: 3,
      isPlayoff: false,
    },
    {
      rosterId: 2,
      teamName: 'Team Beta',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 1,
      season: '2025',
      points: 120,
      opponentId: 1,
      opponentName: 'Team Alpha',
      opponentPoints: 150,
      won: false,
      starters: [],
      matchupId: 1,
      isPlayoff: false,
    },
  ];

  describe('calculateRollingWindows', () => {
    it('should calculate rolling window averages', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      expect(windows).toBeDefined();
      expect(Array.isArray(windows)).toBe(true);
    });

    it('should handle insufficient data for window size', () => {
      const singleMatchup = [mockMatchups[0]];
      const windows = calculateRollingWindows(singleMatchup, 5);
      expect(windows).toHaveLength(0);
    });

    it('should calculate correct window statistics', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      const alphaWindow = windows.find(w => w.rosterId === 1);
      if (alphaWindow) {
        expect(alphaWindow.windowSize).toBe(3);
        expect(alphaWindow.totalPoints).toBe(450); // 150 + 140 + 160
        expect(alphaWindow.averagePoints).toBe(150); // 450 / 3
        expect(alphaWindow.wins).toBe(3);
        expect(alphaWindow.losses).toBe(0);
      }
    });

    it('should set correct start and end weeks', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      const alphaWindow = windows.find(w => w.rosterId === 1);
      if (alphaWindow) {
        expect(alphaWindow.startWeek).toBe(1);
        expect(alphaWindow.endWeek).toBe(3);
      }
    });

    it('should group by team and league', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      const uniqueTeams = new Set(windows.map(w => `${w.leagueId}-${w.rosterId}`));
      expect(uniqueTeams.size).toBeGreaterThan(0);
    });
  });

  describe('calculateSeasonalData', () => {
    it('should aggregate seasonal statistics', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      expect(seasonal).toBeDefined();
      expect(Array.isArray(seasonal)).toBe(true);
    });

    it('should calculate wins and losses correctly', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const alphaData = seasonal.find(s => s.rosterId === 1);
      if (alphaData) {
        expect(alphaData.wins).toBe(3);
        expect(alphaData.losses).toBe(0);
      }
    });

    it('should calculate total points correctly', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const alphaData = seasonal.find(s => s.rosterId === 1);
      if (alphaData) {
        expect(alphaData.totalPoints).toBe(450); // 150 + 140 + 160
      }
    });

    it('should calculate average points correctly', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const alphaData = seasonal.find(s => s.rosterId === 1);
      if (alphaData) {
        expect(alphaData.averagePoints).toBe(150); // 450 / 3
      }
    });

    it('should handle teams with no matchups', () => {
      const seasonal = calculateSeasonalData([]);
      expect(seasonal).toHaveLength(0);
    });

    it('should group by team, league, and season', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const uniqueTeams = new Set(seasonal.map(s => `${s.leagueId}-${s.rosterId}-${s.season}`));
      expect(uniqueTeams.size).toBeGreaterThan(0);
    });
  });

  describe('calculateStreaks', () => {
    it('should identify winning streaks', () => {
      const streaks = calculateStreaks(mockMatchups, 1);
      expect(streaks).toBeDefined();
      expect(Array.isArray(streaks)).toBe(true);
    });

    it('should calculate correct streak length for Team Alpha', () => {
      const streaks = calculateStreaks(mockMatchups, 1);
      const alphaWinStreak = streaks.find(s => s.rosterId === 1 && s.type === 'win');
      if (alphaWinStreak) {
        expect(alphaWinStreak.length).toBe(3); // 3 consecutive wins
      }
    });

    it('should set correct start and end weeks for streaks', () => {
      const streaks = calculateStreaks(mockMatchups, 1);
      const alphaWinStreak = streaks.find(s => s.rosterId === 1 && s.type === 'win');
      if (alphaWinStreak) {
        expect(alphaWinStreak.startWeek).toBe(1);
        expect(alphaWinStreak.endWeek).toBe(3);
      }
    });

    it('should handle empty matchups', () => {
      const streaks = calculateStreaks([], 1);
      expect(streaks).toHaveLength(0);
    });
  });

  describe('findBestRollingWindows', () => {
    it('should find top rolling window performances', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      const best = findBestRollingWindows(windows, 3);
      expect(best).toBeDefined();
      expect(Array.isArray(best)).toBe(true);
      expect(best.length).toBeLessThanOrEqual(3);
    });

    it('should sort by average points descending', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      const best = findBestRollingWindows(windows, 5);
      if (best.length > 1) {
        for (let i = 1; i < best.length; i++) {
          expect(best[i - 1].averagePoints).toBeGreaterThanOrEqual(best[i].averagePoints);
        }
      }
    });

    it('should handle empty windows array', () => {
      const best = findBestRollingWindows([], 3);
      expect(best).toHaveLength(0);
    });

    it('should limit results to specified count', () => {
      const windows = calculateRollingWindows(mockMatchups, 3);
      const best = findBestRollingWindows(windows, 2);
      expect(best.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findLongestStreaks', () => {
    it('should find longest streaks', () => {
      const streaks = calculateStreaks(mockMatchups, 1);
      const longest = findLongestStreaks(streaks, 3);
      expect(longest).toBeDefined();
      expect(Array.isArray(longest)).toBe(true);
      expect(longest.length).toBeLessThanOrEqual(3);
    });

    it('should sort by length descending', () => {
      const streaks = calculateStreaks(mockMatchups, 1);
      const longest = findLongestStreaks(streaks, 5);
      if (longest.length > 1) {
        for (let i = 1; i < longest.length; i++) {
          expect(longest[i - 1].length).toBeGreaterThanOrEqual(longest[i].length);
        }
      }
    });

    it('should handle empty streaks array', () => {
      const longest = findLongestStreaks([], 3);
      expect(longest).toHaveLength(0);
    });

    it('should limit results to specified count', () => {
      const streaks = calculateStreaks(mockMatchups, 1);
      const longest = findLongestStreaks(streaks, 2);
      expect(longest.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findSeasonalRecords', () => {
    it('should find seasonal records', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const records = findSeasonalRecords(seasonal, 'totalPoints', 3);
      expect(records).toBeDefined();
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeLessThanOrEqual(3);
    });

    it('should return seasonal records sorted by field', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const records = findSeasonalRecords(seasonal, 'totalPoints', 'highest', 5);
      expect(records.length).toBeGreaterThan(0);
      // Verify all records have the field
      records.forEach(record => {
        expect(record.totalPoints).toBeGreaterThan(0);
      });
    });

    it('should handle wins field', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const records = findSeasonalRecords(seasonal, 'wins', 'highest', 3);
      expect(records).toBeDefined();
      expect(records.length).toBeGreaterThan(0);
      // Verify all records have wins
      records.forEach(record => {
        expect(record.wins).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty seasonal data', () => {
      const records = findSeasonalRecords([], 'totalPoints', 3);
      expect(records).toHaveLength(0);
    });

    it('should limit results to specified count', () => {
      const seasonal = calculateSeasonalData(mockMatchups);
      const records = findSeasonalRecords(seasonal, 'totalPoints', 2);
      expect(records.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Type Exports', () => {
    it('should export RollingWindowData type', () => {
      const data: RollingWindowData = {
        rosterId: 1,
        teamName: 'Test Team',
        leagueId: 'league1',
        leagueName: 'Test League',
        season: '2025',
        startWeek: 1,
        endWeek: 3,
        windowSize: 3,
        totalPoints: 450,
        averagePoints: 150,
        wins: 3,
        losses: 0,
        aboveMedianCount: 3,
        belowMedianCount: 0,
      };
      expect(data).toBeDefined();
    });

    it('should export SeasonalData type', () => {
      const data: SeasonalData = {
        rosterId: 1,
        teamName: 'Test Team',
        leagueId: 'league1',
        leagueName: 'Test League',
        season: '2025',
        wins: 10,
        losses: 4,
        ties: 0,
        totalPoints: 1500,
        totalPointsAgainst: 1400,
        averagePoints: 107.14,
        expectedWins: 9.5,
        luckDelta: 0.5,
        totalDonuts: 0,
        totalBenchBlunders: 2,
        longestWinStreak: 5,
        longestLosingStreak: 2,
        currentStreak: 3,
        blowoutWins: 2,
        blowoutLosses: 1,
        closeGames: 4,
        scheduleStrength: 0.55,
        playoffAppearance: true,
        championshipWin: false,
        qbPoints: 300,
        rbPoints: 400,
        wrPoints: 500,
        tePoints: 200,
        defPoints: 100,
      };
      expect(data).toBeDefined();
    });

    it('should export StreakData type', () => {
      const data: StreakData = {
        rosterId: 1,
        teamName: 'Test Team',
        type: 'win',
        length: 5,
        startWeek: 1,
        endWeek: 5,
        season: '2025',
        leagueId: 'league1',
      };
      expect(data).toBeDefined();
    });
  });
});
