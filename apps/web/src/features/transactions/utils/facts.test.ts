import { describe, expect, it } from 'vitest';
import { firstOwnedWeek, lastOwnedWeek, playoffWeight } from './facts';
import type { TransactionFacts } from '@/features/transactions/types';

describe('Transaction Utilities', () => {
  describe('playoffWeight', () => {
    it('returns 1.0 for regular season weeks', () => {
      expect(playoffWeight(1)).toBe(1.0);
      expect(playoffWeight(5)).toBe(1.0);
      expect(playoffWeight(10)).toBe(1.0);
      expect(playoffWeight(14)).toBe(1.0);
    });

    it('returns 1.3 for week 15 (wild card)', () => {
      expect(playoffWeight(15)).toBe(1.3);
    });

    it('returns 1.6 for week 16 (semi-finals)', () => {
      expect(playoffWeight(16)).toBe(1.6);
    });

    it('returns 2.0 for week 17 (championship)', () => {
      expect(playoffWeight(17)).toBe(2.0);
    });

    it('handles edge cases', () => {
      expect(playoffWeight(1)).toBeGreaterThan(0);
      expect(playoffWeight(18)).toBe(1.0);
      expect(playoffWeight(0)).toBe(1.0);
    });
  });

  describe('firstOwnedWeek', () => {
    it('returns null when player was never owned', () => {
      const facts: TransactionFacts = {
        weekRosterPlayers: new Map(),
        weekRosterStarters: new Map(),
        weekOpponent: new Map(),
        playerWeekPoints: new Map(),
        replacementByWeekPos: new Map(),
        rosterPlayerWeeks: new Map(),
      };

      expect(firstOwnedWeek(facts, 1, 'player123')).toBeNull();
    });

    it('returns first week when player was owned', () => {
      const facts: TransactionFacts = {
        weekRosterPlayers: new Map(),
        weekRosterStarters: new Map(),
        weekOpponent: new Map(),
        playerWeekPoints: new Map(),
        replacementByWeekPos: new Map(),
        rosterPlayerWeeks: new Map([['1:player123', new Set([3, 5, 7])]]),
      };

      expect(firstOwnedWeek(facts, 1, 'player123')).toBe(3);
    });
  });

  describe('lastOwnedWeek', () => {
    it('returns null when player was never owned', () => {
      const facts: TransactionFacts = {
        weekRosterPlayers: new Map(),
        weekRosterStarters: new Map(),
        weekOpponent: new Map(),
        playerWeekPoints: new Map(),
        replacementByWeekPos: new Map(),
        rosterPlayerWeeks: new Map(),
      };

      expect(lastOwnedWeek(facts, 1, 'player123')).toBeNull();
    });

    it('returns last week when player was owned', () => {
      const facts: TransactionFacts = {
        weekRosterPlayers: new Map(),
        weekRosterStarters: new Map(),
        weekOpponent: new Map(),
        playerWeekPoints: new Map(),
        replacementByWeekPos: new Map(),
        rosterPlayerWeeks: new Map([['1:player123', new Set([3, 5, 7])]]),
      };

      expect(lastOwnedWeek(facts, 1, 'player123')).toBe(7);
    });
  });
});
