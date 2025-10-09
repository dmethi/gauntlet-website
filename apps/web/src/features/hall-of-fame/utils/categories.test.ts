import { describe, expect, it } from 'vitest';
import {
  ALL_HALL_OF_FAME_CATEGORIES,
  getCategoriesGrouped,
  WEEKLY_MATCHUP_CATEGORIES,
  WEEKLY_TEAM_CATEGORIES,
} from './categories';

describe('categories', () => {
  describe('ALL_HALL_OF_FAME_CATEGORIES', () => {
    it('should contain valid categories', () => {
      expect(ALL_HALL_OF_FAME_CATEGORIES).toBeDefined();
      expect(Array.isArray(ALL_HALL_OF_FAME_CATEGORIES)).toBe(true);
      expect(ALL_HALL_OF_FAME_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have required properties on each category', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('group');
        expect(category).toHaveProperty('type');
        expect(category).toHaveProperty('calculateValue');
        expect(category).toHaveProperty('formatValue');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.description).toBe('string');
      });
    });

    it('should have calculateValue as a function', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(typeof category.calculateValue).toBe('function');
      });
    });

    it('should have formatValue as a function', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(typeof category.formatValue).toBe('function');
      });
    });

    it('should have unique IDs', () => {
      const ids = ALL_HALL_OF_FAME_CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid type values', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('type');
        expect(['highest', 'lowest', 'both']).toContain(category.type);
      });
    });

    it('should have group property', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('group');
        expect(typeof category.group).toBe('string');
      });
    });
  });

  describe('WEEKLY_TEAM_CATEGORIES', () => {
    it('should contain team-specific categories', () => {
      expect(WEEKLY_TEAM_CATEGORIES).toBeDefined();
      expect(Array.isArray(WEEKLY_TEAM_CATEGORIES)).toBe(true);
      expect(WEEKLY_TEAM_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have weekly_team group', () => {
      WEEKLY_TEAM_CATEGORIES.forEach(category => {
        expect(category.group).toBe('weekly_team');
      });
    });

    it('should include highest_team_points category', () => {
      const hasCategory = WEEKLY_TEAM_CATEGORIES.some(c => c.id === 'highest_team_points');
      expect(hasCategory).toBe(true);
    });

    it('should include lowest_team_points category', () => {
      const hasCategory = WEEKLY_TEAM_CATEGORIES.some(c => c.id === 'lowest_team_points');
      expect(hasCategory).toBe(true);
    });
  });

  describe('WEEKLY_MATCHUP_CATEGORIES', () => {
    it('should contain matchup-specific categories', () => {
      expect(WEEKLY_MATCHUP_CATEGORIES).toBeDefined();
      expect(Array.isArray(WEEKLY_MATCHUP_CATEGORIES)).toBe(true);
      expect(WEEKLY_MATCHUP_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have weekly_matchup group', () => {
      WEEKLY_MATCHUP_CATEGORIES.forEach(category => {
        expect(category.group).toBe('weekly_matchup');
      });
    });

    it('should include biggest_blowout category', () => {
      const hasBlowout = WEEKLY_MATCHUP_CATEGORIES.some(c => c.id === 'biggest_blowout');
      expect(hasBlowout).toBe(true);
    });

    it('should include closest_game category', () => {
      const hasClosest = WEEKLY_MATCHUP_CATEGORIES.some(c => c.id === 'closest_game');
      expect(hasClosest).toBe(true);
    });
  });

  describe('getCategoriesGrouped', () => {
    it('should return a Map of grouped categories', () => {
      const grouped = getCategoriesGrouped();
      expect(grouped).toBeDefined();
      expect(grouped instanceof Map).toBe(true);
    });

    it('should have multiple category groups', () => {
      const grouped = getCategoriesGrouped();
      expect(grouped.size).toBeGreaterThan(0);
      expect(grouped.has('Score & Margin')).toBe(true);
      expect(grouped.has('Matchup Records')).toBe(true);
    });

    it('should have arrays of categories in each group', () => {
      const grouped = getCategoriesGrouped();
      const scoreMargin = grouped.get('Score & Margin');
      const matchupRecords = grouped.get('Matchup Records');
      expect(Array.isArray(scoreMargin)).toBe(true);
      expect(Array.isArray(matchupRecords)).toBe(true);
    });

    it('should have categories with required properties in each group', () => {
      const grouped = getCategoriesGrouped();
      grouped.forEach((categories, groupName) => {
        expect(Array.isArray(categories)).toBe(true);
        categories.forEach(category => {
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('name');
          expect(category).toHaveProperty('description');
          expect(category).toHaveProperty('formatValue');
        });
      });
    });

    it('should group categories into meaningful groups', () => {
      const grouped = getCategoriesGrouped();
      let totalGrouped = 0;
      grouped.forEach(categories => {
        totalGrouped += categories.length;
      });
      // getCategoriesGrouped organizes categories semantically
      // so it should have a meaningful number of categories
      expect(totalGrouped).toBeGreaterThan(0);
      expect(totalGrouped).toBeLessThanOrEqual(
        WEEKLY_TEAM_CATEGORIES.length + WEEKLY_MATCHUP_CATEGORIES.length,
      );
    });

    it('should not have duplicate categories across groups', () => {
      const grouped = getCategoriesGrouped();
      const allIds = new Set<string>();
      let hasDuplicates = false;
      grouped.forEach(categories => {
        categories.forEach(category => {
          if (allIds.has(category.id)) {
            hasDuplicates = true;
          }
          allIds.add(category.id);
        });
      });
      expect(hasDuplicates).toBe(false);
    });
  });

  describe('Category Consistency', () => {
    it('should have consistent category structures', () => {
      const allCategories = [...WEEKLY_TEAM_CATEGORIES, ...WEEKLY_MATCHUP_CATEGORIES];
      allCategories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('group');
        expect(category).toHaveProperty('type');
        expect(category).toHaveProperty('calculateValue');
        expect(category).toHaveProperty('formatValue');
      });
    });

    it('should have non-empty names and descriptions', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
      });
    });

    it('should have valid formatValue functions that return strings', () => {
      ALL_HALL_OF_FAME_CATEGORIES.forEach(category => {
        const formatted = category.formatValue(100);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });
});
