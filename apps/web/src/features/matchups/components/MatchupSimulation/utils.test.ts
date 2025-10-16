import { describe, expect, it } from 'vitest';
import {
  calculateWinProbFromSpread,
  formatMargin,
  formatWinProbability,
  getOverUnderDisplay,
  getWinProbColor,
  probToMoneyline,
} from './utils';
import type { SimulationData } from '@/features/matchups/types';

describe('formatWinProbability', () => {
  it('formats probability as percentage with 1 decimal', () => {
    expect(formatWinProbability(0.652)).toBe('65.2%');
    expect(formatWinProbability(0.5)).toBe('50.0%');
    expect(formatWinProbability(0.123)).toBe('12.3%');
  });

  it('handles edge cases', () => {
    expect(formatWinProbability(0)).toBe('0.0%');
    expect(formatWinProbability(1)).toBe('100.0%');
  });
});

describe('calculateWinProbFromSpread', () => {
  const mockSimulationData: SimulationData = {
    team1WinPct: 0.65,
    team2WinPct: 0.35,
    team1Scores: {
      mean: 125.5,
      median: 124.0,
      p10: 100.0,
      p90: 150.0,
    },
    team2Scores: {
      mean: 115.0,
      median: 114.0,
      p10: 90.0,
      p90: 140.0,
    },
    medianMargin: 10.0,
    impliedOdds: {
      spread: 3.5,
      team1MoneyLine: -150,
      team2MoneyLine: 130,
      total: 240.5,
    },
    teams: [
      { teamName: 'Team A', rosterId: 1 },
      { teamName: 'Team B', rosterId: 2 },
    ],
  };

  it('returns base win probabilities at push (0 spread)', () => {
    const result = calculateWinProbFromSpread(0, mockSimulationData);
    expect(result.team1).toBe(0.65);
    expect(result.team2).toBe(0.35);
  });

  it('returns 50/50 when no simulation data', () => {
    const result = calculateWinProbFromSpread(5, null);
    expect(result.team1).toBe(0.5);
    expect(result.team2).toBe(0.5);
  });

  it('adjusts probabilities for positive spread (team1 favored)', () => {
    const result = calculateWinProbFromSpread(5, mockSimulationData);
    // Team1 probability should decrease when requiring larger margin
    expect(result.team1).toBeLessThan(0.65);
    expect(result.team2).toBeGreaterThan(0.35);
  });

  it('adjusts probabilities for negative spread (team2 favored)', () => {
    const result = calculateWinProbFromSpread(-5, mockSimulationData);
    // Team2 probability should decrease when requiring larger margin
    expect(result.team2).toBeLessThan(0.65);
    expect(result.team1).toBeGreaterThan(0.35);
  });

  it('ensures probabilities sum close to 1', () => {
    const result = calculateWinProbFromSpread(7, mockSimulationData);
    const sum = result.team1 + result.team2;
    expect(sum).toBeCloseTo(1, 2);
  });

  it('clamps probabilities between 0.01 and 0.99', () => {
    const result = calculateWinProbFromSpread(20, mockSimulationData);
    expect(result.team1).toBeGreaterThanOrEqual(0.01);
    expect(result.team1).toBeLessThanOrEqual(0.99);
    expect(result.team2).toBeGreaterThanOrEqual(0.01);
    expect(result.team2).toBeLessThanOrEqual(0.99);
  });
});

describe('getOverUnderDisplay', () => {
  const mockSimulationData: SimulationData = {
    team1WinPct: 0.65,
    team2WinPct: 0.35,
    team1Scores: {
      mean: 125.5,
      median: 124.0,
      p10: 100.0,
      p90: 150.0,
    },
    team2Scores: {
      mean: 115.0,
      median: 114.0,
      p10: 90.0,
      p90: 140.0,
    },
    medianMargin: 10.0,
    impliedOdds: {
      spread: 3.5,
      team1MoneyLine: -150,
      team2MoneyLine: 130,
      total: 240.5,
    },
    teams: [
      { teamName: 'Team A', rosterId: 1 },
      { teamName: 'Team B', rosterId: 2 },
    ],
  };

  it('returns default values when no simulation data', () => {
    const result = getOverUnderDisplay(null);
    expect(result.over).toBe(0.5);
    expect(result.under).toBe(0.5);
    expect(result.total).toBe(250);
  });

  it('calculates over/under based on projected total', () => {
    const result = getOverUnderDisplay(mockSimulationData);
    expect(result.total).toBe(240.5);
    expect(result.over + result.under).toBeCloseTo(1, 5);
  });

  it('favors over when projected total exceeds line', () => {
    const result = getOverUnderDisplay(mockSimulationData);
    // Projected: 125.5 + 115.0 = 240.5, Line: 240.5 (push)
    expect(result.over).toBeCloseTo(0.5, 1);
  });

  it('clamps probabilities between 0.05 and 0.95', () => {
    const highTotal = {
      ...mockSimulationData,
      team1Scores: { ...mockSimulationData.team1Scores, mean: 200 },
      team2Scores: { ...mockSimulationData.team2Scores, mean: 200 },
    };
    const result = getOverUnderDisplay(highTotal);
    expect(result.over).toBeLessThanOrEqual(0.95);
    expect(result.over).toBeGreaterThanOrEqual(0.05);
  });
});

describe('getWinProbColor', () => {
  it('returns green for high probabilities (>65%)', () => {
    expect(getWinProbColor(0.75)).toBe('text-green-600 dark:text-green-400');
    expect(getWinProbColor(0.66)).toBe('text-green-600 dark:text-green-400');
  });

  it('returns yellow for medium-high probabilities (55-65%)', () => {
    expect(getWinProbColor(0.6)).toBe('text-yellow-600 dark:text-yellow-400');
    expect(getWinProbColor(0.56)).toBe('text-yellow-600 dark:text-yellow-400');
  });

  it('returns yellow for medium probabilities (45-55%)', () => {
    expect(getWinProbColor(0.5)).toBe('text-yellow-500 dark:text-yellow-500');
    expect(getWinProbColor(0.46)).toBe('text-yellow-500 dark:text-yellow-500');
  });

  it('returns orange for medium-low probabilities (35-45%)', () => {
    expect(getWinProbColor(0.4)).toBe('text-orange-500 dark:text-orange-400');
    expect(getWinProbColor(0.36)).toBe('text-orange-500 dark:text-orange-400');
  });

  it('returns red for low probabilities (≤35%)', () => {
    expect(getWinProbColor(0.3)).toBe('text-red-500 dark:text-red-400');
    expect(getWinProbColor(0.1)).toBe('text-red-500 dark:text-red-400');
  });
});

describe('formatMargin', () => {
  it('formats push as "Win Outright"', () => {
    expect(formatMargin(0, 'Team A', 'Team B')).toBe('Win Outright');
  });

  it('formats positive margin with team1 name', () => {
    expect(formatMargin(3.5, 'Team A', 'Team B')).toBe('Team A by 3.5+');
    expect(formatMargin(7, 'Winners', 'Losers')).toBe('Winners by 7+');
  });

  it('formats negative margin with team2 name', () => {
    expect(formatMargin(-3.5, 'Team A', 'Team B')).toBe('Team B by 3.5+');
    expect(formatMargin(-10, 'Favorites', 'Underdogs')).toBe('Underdogs by 10+');
  });
});

describe('probToMoneyline', () => {
  it('converts favorite probability to negative moneyline', () => {
    expect(probToMoneyline(0.65)).toBe(-186);
    expect(probToMoneyline(0.75)).toBe(-300);
  });

  it('converts underdog probability to positive moneyline', () => {
    expect(probToMoneyline(0.35)).toBe(186);
    expect(probToMoneyline(0.25)).toBe(300);
  });

  it('handles 50/50 probability', () => {
    const result = probToMoneyline(0.5);
    expect(result).toBeCloseTo(100, -1); // Close to even money
  });

  it('handles extreme probabilities', () => {
    const heavyFavorite = probToMoneyline(0.95);
    expect(heavyFavorite).toBeLessThan(-1000);

    const heavyUnderdog = probToMoneyline(0.05);
    expect(heavyUnderdog).toBeGreaterThan(1000);
  });
});
