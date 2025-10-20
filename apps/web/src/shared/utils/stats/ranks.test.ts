import { describe, expect, it } from 'vitest';
import { percentileRank, rank, rankWithinLeagues } from './ranks';

describe('Ranking Utilities', () => {
  describe('rank', () => {
    it('ranks values from highest to lowest', () => {
      const values = [100, 150, 120];
      const ranked = rank(values);

      expect(ranked[0]).toBe(3); // 100 is 3rd
      expect(ranked[1]).toBe(1); // 150 is 1st
      expect(ranked[2]).toBe(2); // 120 is 2nd
    });

    it('handles tied scores with same rank', () => {
      const values = [100, 100, 90];
      const ranked = rank(values);

      expect(ranked[0]).toBe(1); // Tied for 1st
      expect(ranked[1]).toBe(1); // Tied for 1st
      expect(ranked[2]).toBe(3); // 3rd (not 2nd)
    });

    it('handles empty array', () => {
      const ranked = rank([]);
      expect(ranked).toEqual([]);
    });

    it('handles single value', () => {
      const ranked = rank([100]);
      expect(ranked[0]).toBe(1);
    });

    it('handles all same values', () => {
      const ranked = rank([5, 5, 5, 5]);
      expect(ranked).toEqual([1, 1, 1, 1]);
    });

    it('ranks in descending order', () => {
      const values = [10, 20, 30, 40, 50];
      const ranked = rank(values);

      expect(ranked[0]).toBe(5); // 10 is last
      expect(ranked[4]).toBe(1); // 50 is first
    });

    it('handles negative numbers', () => {
      const values = [-10, 5, 0, -5];
      const ranked = rank(values);

      expect(ranked[0]).toBe(4); // -10 is last
      expect(ranked[1]).toBe(1); // 5 is first
      expect(ranked[2]).toBe(2); // 0 is 2nd
      expect(ranked[3]).toBe(3); // -5 is 3rd
    });

    it('handles decimal values', () => {
      const values = [1.5, 2.5, 1.0];
      const ranked = rank(values);

      expect(ranked[0]).toBe(2); // 1.5 is 2nd
      expect(ranked[1]).toBe(1); // 2.5 is 1st
      expect(ranked[2]).toBe(3); // 1.0 is 3rd
    });

    it('handles two values', () => {
      const ranked = rank([10, 20]);
      expect(ranked).toEqual([2, 1]);
    });

    it('maintains order for multiple ties', () => {
      const values = [100, 90, 90, 80, 80, 80];
      const ranked = rank(values);

      expect(ranked[0]).toBe(1); // 100 is 1st
      expect(ranked[1]).toBe(2); // 90 tied for 2nd
      expect(ranked[2]).toBe(2); // 90 tied for 2nd
      expect(ranked[3]).toBe(4); // 80 tied for 4th (not 3rd)
      expect(ranked[4]).toBe(4);
      expect(ranked[5]).toBe(4);
    });

    it('handles large dataset', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      const ranked = rank(values);

      expect(ranked[0]).toBe(100); // 1 is last
      expect(ranked[99]).toBe(1); // 100 is first
    });
  });

  describe('percentileRank', () => {
    it('converts ranks to percentiles where 100 is best', () => {
      const values = [100, 150, 120];
      const percentiles = percentileRank(values);

      expect(percentiles[1]).toBe(100); // 150 is best (100th percentile)
      expect(percentiles[2]).toBeGreaterThan(50); // 120 is above average
      expect(percentiles[0]).toBeGreaterThan(0); // 100 is not last
    });

    it('handles rank 1 as 100th percentile', () => {
      const values = [10, 20, 30];
      const percentiles = percentileRank(values);

      expect(percentiles[2]).toBe(100); // 30 is rank 1, so 100th percentile
    });

    it('handles last place correctly', () => {
      const values = [10, 20, 30];
      const percentiles = percentileRank(values);

      expect(percentiles[0]).toBeCloseTo(33.33, 1); // 10 is last
    });

    it('handles single value as 100th percentile', () => {
      const percentiles = percentileRank([100]);
      expect(percentiles[0]).toBe(100);
    });

    it('handles empty array', () => {
      const percentiles = percentileRank([]);
      expect(percentiles).toEqual([]);
    });

    it('handles tied scores with same percentile', () => {
      const values = [100, 100, 90];
      const percentiles = percentileRank(values);

      expect(percentiles[0]).toBe(100); // Tied for 1st
      expect(percentiles[1]).toBe(100); // Tied for 1st
      expect(percentiles[2]).toBeCloseTo(33.33, 1); // 3rd place
    });

    it('calculates middle ranks correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const percentiles = percentileRank(values);

      // 6th place out of 12 should be around 50-60th percentile
      const sixthPlace = percentiles.find(p => values[percentiles.indexOf(p)] === 6);
      expect(sixthPlace).toBeGreaterThan(40);
      expect(sixthPlace).toBeLessThan(70);
    });

    it('handles all same values', () => {
      const percentiles = percentileRank([5, 5, 5, 5]);
      expect(percentiles).toEqual([100, 100, 100, 100]);
    });

    it('scales appropriately with dataset size', () => {
      const values = Array.from({ length: 24 }, (_, i) => i + 1);
      const percentiles = percentileRank(values);

      // Top scorer should be 100th percentile
      expect(percentiles[23]).toBe(100);
      // Bottom scorer should be low percentile
      expect(percentiles[0]).toBeLessThan(10);
    });
  });

  describe('rankWithinLeagues', () => {
    it('ranks teams within their respective leagues', () => {
      const values = new Map([
        ['afc-1', 150],
        ['afc-2', 120],
        ['nfc-1', 160],
        ['nfc-2', 110],
      ]);

      const leagueMap = new Map([
        ['afc-1', 'afc'],
        ['afc-2', 'afc'],
        ['nfc-1', 'nfc'],
        ['nfc-2', 'nfc'],
      ]);

      const ranks = rankWithinLeagues(values, leagueMap);

      // AFC rankings
      expect(ranks.get('afc-1')).toBe(1); // 150 is best in AFC
      expect(ranks.get('afc-2')).toBe(2); // 120 is 2nd in AFC

      // NFC rankings
      expect(ranks.get('nfc-1')).toBe(1); // 160 is best in NFC
      expect(ranks.get('nfc-2')).toBe(2); // 110 is 2nd in NFC
    });

    it('handles teams not in league map', () => {
      const values = new Map([
        ['team1', 150],
        ['team2', 120],
      ]);

      const leagueMap = new Map([['team1', 'league1']]);
      // team2 is not in leagueMap

      const ranks = rankWithinLeagues(values, leagueMap);

      expect(ranks.get('team1')).toBe(1);
      expect(ranks.has('team2')).toBe(false); // Not ranked because not in league map
    });

    it('handles single team per league', () => {
      const values = new Map([
        ['afc-1', 150],
        ['nfc-1', 160],
      ]);

      const leagueMap = new Map([
        ['afc-1', 'afc'],
        ['nfc-1', 'nfc'],
      ]);

      const ranks = rankWithinLeagues(values, leagueMap);

      expect(ranks.get('afc-1')).toBe(1);
      expect(ranks.get('nfc-1')).toBe(1);
    });

    it('handles ties within league', () => {
      const values = new Map([
        ['afc-1', 150],
        ['afc-2', 150],
        ['afc-3', 120],
      ]);

      const leagueMap = new Map([
        ['afc-1', 'afc'],
        ['afc-2', 'afc'],
        ['afc-3', 'afc'],
      ]);

      const ranks = rankWithinLeagues(values, leagueMap);

      expect(ranks.get('afc-1')).toBe(1); // Tied for 1st
      expect(ranks.get('afc-2')).toBe(1); // Tied for 1st
      expect(ranks.get('afc-3')).toBe(3); // 3rd (not 2nd)
    });

    it('handles empty maps', () => {
      const ranks = rankWithinLeagues(new Map(), new Map());
      expect(ranks.size).toBe(0);
    });

    it('handles 12-team leagues correctly', () => {
      const values = new Map(Array.from({ length: 12 }, (_, i) => [`team-${i + 1}`, 200 - i * 10]));

      const leagueMap = new Map(Array.from({ length: 12 }, (_, i) => [`team-${i + 1}`, 'league1']));

      const ranks = rankWithinLeagues(values, leagueMap);

      expect(ranks.get('team-1')).toBe(1); // Highest score
      expect(ranks.get('team-12')).toBe(12); // Lowest score
    });

    it('processes multiple leagues independently', () => {
      // Setup: 3 teams per league, 2 leagues
      const values = new Map([
        ['afc-1', 200], // Best in AFC
        ['afc-2', 150],
        ['afc-3', 100], // Worst in AFC
        ['nfc-1', 180], // Best in NFC
        ['nfc-2', 140],
        ['nfc-3', 90], // Worst in NFC
      ]);

      const leagueMap = new Map([
        ['afc-1', 'afc'],
        ['afc-2', 'afc'],
        ['afc-3', 'afc'],
        ['nfc-1', 'nfc'],
        ['nfc-2', 'nfc'],
        ['nfc-3', 'nfc'],
      ]);

      const ranks = rankWithinLeagues(values, leagueMap);

      // AFC rankings should be independent of NFC scores
      expect(ranks.get('afc-1')).toBe(1);
      expect(ranks.get('afc-2')).toBe(2);
      expect(ranks.get('afc-3')).toBe(3);

      // NFC rankings
      expect(ranks.get('nfc-1')).toBe(1);
      expect(ranks.get('nfc-2')).toBe(2);
      expect(ranks.get('nfc-3')).toBe(3);
    });

    it('handles composite keys with multiple hyphens', () => {
      const values = new Map([
        ['league-id-roster-1', 150],
        ['league-id-roster-2', 120],
      ]);

      const leagueMap = new Map([
        ['league-id-roster-1', 'league-id'],
        ['league-id-roster-2', 'league-id'],
      ]);

      const ranks = rankWithinLeagues(values, leagueMap);

      expect(ranks.get('league-id-roster-1')).toBe(1);
      expect(ranks.get('league-id-roster-2')).toBe(2);
    });
  });
});
