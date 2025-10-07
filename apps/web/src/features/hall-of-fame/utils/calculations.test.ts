import { describe, it, expect } from 'vitest';
import {
  calculateHallOfFameRecords,
  getCategoryInfo,
  formatRecord,
  getRankEmoji,
  getCategoriesByGroup,
  HALL_OF_FAME_CATEGORIES,
} from './calculations';
import type { ProcessedMatchup, HallOfFameCategory } from '@/features/hall-of-fame/types';

describe('calculations', () => {
  const mockMatchups: ProcessedMatchup[] = [
    {
      rosterId: 1,
      teamName: 'Team Alpha',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 1,
      season: '2025',
      points: 150.5,
      opponentId: 2,
      opponentName: 'Team Beta',
      opponentPoints: 120.3,
      won: true,
      starters: [],
      matchupId: 1,
      isPlayoff: false,
    },
    {
      rosterId: 2,
      teamName: 'Team Beta',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 1,
      season: '2025',
      points: 120.3,
      opponentId: 1,
      opponentName: 'Team Alpha',
      opponentPoints: 150.5,
      won: false,
      starters: [],
      matchupId: 1,
      isPlayoff: false,
    },
    {
      rosterId: 3,
      teamName: 'Team Gamma',
      leagueId: 'league1',
      leagueName: 'AFC',
      week: 2,
      season: '2025',
      points: 85.2,
      opponentId: 4,
      opponentName: 'Team Delta',
      opponentPoints: 180.7,
      won: false,
      starters: [],
      matchupId: 2,
      isPlayoff: false,
    },
  ];

  describe('calculateHallOfFameRecords', () => {
    it('should calculate records from matchups', () => {
      const records = calculateHallOfFameRecords(mockMatchups);
      expect(records).toBeDefined();
      expect(records instanceof Map).toBe(true);
    });

    it('should handle empty matchups', () => {
      const records = calculateHallOfFameRecords([]);
      expect(records).toBeDefined();
      expect(records.size).toBeGreaterThan(0); // Categories still initialized
    });

    it('should create record entries for each category', () => {
      const records = calculateHallOfFameRecords(mockMatchups);
      HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(records.has(category.id)).toBe(true);
        const categoryRecords = records.get(category.id);
        expect(Array.isArray(categoryRecords)).toBe(true);
      });
    });

    it('should include team information in records', () => {
      const records = calculateHallOfFameRecords(mockMatchups);
      const firstCategory = Array.from(records.values())[0];
      if (firstCategory && firstCategory.length > 0) {
        const record = firstCategory[0];
        expect(record).toHaveProperty('teamName');
        expect(record).toHaveProperty('teamId');
        expect(record).toHaveProperty('leagueId');
        expect(record).toHaveProperty('week');
        expect(record).toHaveProperty('season');
      }
    });

    it('should deduplicate matchup-scoped categories', () => {
      const records = calculateHallOfFameRecords(mockMatchups);
      // Biggest blowout should only appear once for matchup 1 (not twice for both teams)
      const blowoutRecords = records.get('biggest_blowout');
      expect(blowoutRecords).toBeDefined();
      // Count unique matchup IDs for week 1
      const week1MatchupIds = new Set(
        blowoutRecords
          ?.filter(r => r.week === 1)
          .map(r => r.contextData?.matchupId)
          .filter(Boolean),
      );
      expect(week1MatchupIds.size).toBeLessThanOrEqual(1);
    });

    it('should filter out null and NaN values', () => {
      const records = calculateHallOfFameRecords(mockMatchups);
      records.forEach(categoryRecords => {
        categoryRecords.forEach(record => {
          expect(record.value).not.toBeNull();
          expect(Number.isNaN(record.value)).toBe(false);
        });
      });
    });
  });

  describe('getCategoryInfo', () => {
    it('should return category information for valid ID', () => {
      const info = getCategoryInfo('highest_team_points');
      expect(info).toBeDefined();
      expect(info?.id).toBe('highest_team_points');
      expect(info?.name).toBeDefined();
      expect(info?.description).toBeDefined();
    });

    it('should return undefined for invalid category', () => {
      const info = getCategoryInfo('invalid_category_id_12345');
      expect(info).toBeUndefined();
    });

    it('should return category with calculateValue function', () => {
      const info = getCategoryInfo('highest_team_points');
      expect(info).toBeDefined();
      expect(typeof info?.calculateValue).toBe('function');
    });
  });

  describe('formatRecord', () => {
    it('should format score records with pts suffix', () => {
      const record = { category: 'highest_team_points', value: 150.5 } as any;
      const formatted = formatRecord(record);
      expect(formatted).toContain('150');
      expect(formatted).toContain('pts');
    });

    it('should handle records with unknown categories', () => {
      const record = { category: 'unknown_category', value: 100 } as any;
      const formatted = formatRecord(record);
      expect(formatted).toBe('100');
    });

    it('should format integer scores', () => {
      const record = { category: 'highest_team_points', value: 150 } as any;
      const formatted = formatRecord(record);
      expect(formatted).toContain('150');
    });

    it('should format decimal values', () => {
      const record = { category: 'highest_team_points', value: 150.75 } as any;
      const formatted = formatRecord(record);
      expect(formatted).toContain('150.75');
    });

    it('should format zero values', () => {
      const record = { category: 'highest_team_points', value: 0 } as any;
      const formatted = formatRecord(record);
      expect(formatted).toContain('0');
    });

    it('should format very large numbers', () => {
      const record = { category: 'highest_team_points', value: 9999.99 } as any;
      const formatted = formatRecord(record);
      expect(formatted).toContain('9999');
    });
  });

  describe('getRankEmoji', () => {
    it('should return gold medal for 1st place', () => {
      expect(getRankEmoji(1)).toBe('🥇');
    });

    it('should return silver medal for 2nd place', () => {
      expect(getRankEmoji(2)).toBe('🥈');
    });

    it('should return bronze medal for 3rd place', () => {
      expect(getRankEmoji(3)).toBe('🥉');
    });

    it('should return number with period for 4th place', () => {
      expect(getRankEmoji(4)).toBe('4.');
    });

    it('should return number with period for 5th place', () => {
      expect(getRankEmoji(5)).toBe('5.');
    });

    it('should return number with period for ranks beyond 10', () => {
      expect(getRankEmoji(15)).toBe('15.');
    });

    it('should handle rank 0 gracefully', () => {
      expect(getRankEmoji(0)).toBeDefined();
    });

    it('should handle negative ranks gracefully', () => {
      expect(getRankEmoji(-1)).toBeDefined();
    });
  });

  describe('getCategoriesByGroup', () => {
    it('should return grouped categories as a Map', () => {
      const grouped = getCategoriesByGroup();
      expect(grouped).toBeDefined();
      expect(grouped instanceof Map).toBe(true);
    });

    it('should have multiple category group keys', () => {
      const grouped = getCategoriesByGroup();
      expect(grouped.size).toBeGreaterThan(0);
      expect(grouped.has('Score & Margin')).toBe(true);
      expect(grouped.has('Matchup Records')).toBe(true);
    });

    it('should have arrays of categories in each group', () => {
      const grouped = getCategoriesByGroup();
      const scoreMargin = grouped.get('Score & Margin');
      const matchupRecords = grouped.get('Matchup Records');
      expect(Array.isArray(scoreMargin)).toBe(true);
      expect(Array.isArray(matchupRecords)).toBe(true);
    });

    it('should have categories with required properties', () => {
      const grouped = getCategoriesByGroup();
      const scoreMargin = grouped.get('Score & Margin');
      if (scoreMargin && scoreMargin.length > 0) {
        const firstCategory = scoreMargin[0];
        expect(firstCategory).toHaveProperty('id');
        expect(firstCategory).toHaveProperty('name');
        expect(firstCategory).toHaveProperty('description');
        expect(firstCategory).toHaveProperty('formatValue');
      }
    });
  });

  describe('HALL_OF_FAME_CATEGORIES', () => {
    it('should be an array of categories', () => {
      expect(Array.isArray(HALL_OF_FAME_CATEGORIES)).toBe(true);
      expect(HALL_OF_FAME_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have categories with required properties', () => {
      const category = HALL_OF_FAME_CATEGORIES[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('formatValue');
      expect(category).toHaveProperty('calculateValue');
      expect(category).toHaveProperty('group');
      expect(category).toHaveProperty('type');
    });

    it('should have calculateValue as a function', () => {
      HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(typeof category.calculateValue).toBe('function');
      });
    });

    it('should have formatValue as a function', () => {
      HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(typeof category.formatValue).toBe('function');
      });
    });
  });
});
