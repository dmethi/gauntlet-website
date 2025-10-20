import { describe, expect, it } from 'vitest';
import {
  assignLetterGrades,
  calculateLetterGrade,
  calculatePercentile,
  calculateScoreBreakdown,
  calculateScoreRange,
  calculateTransactionStats,
  compareTransactions,
  filterTransactions,
  getUniqueValues,
  GRADE_ORDER,
  type LetterGrade,
  sortTransactions,
} from './utils';
import type { GradeTxn } from '@/features/transactions/types';

describe('calculateLetterGrade', () => {
  it('returns A+ for high percentiles', () => {
    expect(calculateLetterGrade(90)).toBe('A+');
    expect(calculateLetterGrade(88)).toBe('A+');
  });

  it('returns A for 82-88 percentile', () => {
    expect(calculateLetterGrade(85)).toBe('A');
    expect(calculateLetterGrade(82)).toBe('A');
  });

  it('returns B for 70-82 percentile', () => {
    expect(calculateLetterGrade(75)).toBe('B');
    expect(calculateLetterGrade(70)).toBe('B');
  });

  it('returns C for 55-70 percentile', () => {
    expect(calculateLetterGrade(60)).toBe('C');
    expect(calculateLetterGrade(55)).toBe('C');
  });

  it('returns D for 40-55 percentile', () => {
    expect(calculateLetterGrade(45)).toBe('D');
    expect(calculateLetterGrade(40)).toBe('D');
  });

  it('returns F for low percentiles', () => {
    expect(calculateLetterGrade(30)).toBe('F');
    expect(calculateLetterGrade(0)).toBe('F');
  });
});

describe('calculatePercentile', () => {
  it('returns 50 for mean value', () => {
    const result = calculatePercentile(10, 10, 5);
    expect(result).toBeCloseTo(50, 0);
  });

  it('returns higher percentile for above-mean values', () => {
    const result = calculatePercentile(15, 10, 5);
    expect(result).toBeGreaterThan(50);
  });

  it('returns lower percentile for below-mean values', () => {
    const result = calculatePercentile(5, 10, 5);
    expect(result).toBeLessThan(50);
  });

  it('handles zero standard deviation', () => {
    const result = calculatePercentile(10, 10, 0);
    expect(result).toBe(50);
  });
});

describe('assignLetterGrades', () => {
  const createMockTransaction = (score: number): GradeTxn =>
    ({
      id: `txn-${score}`,
      score,
      createdAt: '2025-01-01',
      teamName: 'Team A',
      leagueName: 'League 1',
      type: 'free_agent',
      players: [],
      grade: 'C',
    }) as GradeTxn;

  it('assigns grades based on score distribution', () => {
    const transactions = [10, 20, 30, 40, 50].map(createMockTransaction);
    const graded = assignLetterGrades(transactions);

    expect(graded[0].grade).toBeTruthy();
    expect(graded[4].grade).toBeTruthy();
  });

  it('handles empty array', () => {
    const result = assignLetterGrades([]);
    expect(result).toEqual([]);
  });

  it('assigns grades with proper distribution', () => {
    // Create transactions with extreme values to ensure full grade range
    const transactions = [
      ...Array.from({ length: 10 }, (_, i) => createMockTransaction(i - 50)), // Very low scores (-50 to -41)
      ...Array.from({ length: 80 }, (_, i) => createMockTransaction(i)), // Normal scores (0 to 79)
      ...Array.from({ length: 10 }, (_, i) => createMockTransaction(100 + i)), // Very high scores (100 to 109)
    ];
    const graded = assignLetterGrades(transactions);

    const grades = graded.map(t => t.grade);
    // With extreme values, we should see the full range of grades
    expect(grades.includes('A+') || grades.includes('A')).toBe(true); // High grades present
    expect(grades.includes('F') || grades.includes('D')).toBe(true); // Low grades present
  });
});

describe('compareTransactions', () => {
  const txnA: GradeTxn = {
    id: 'a',
    score: 10,
    grade: 'A',
    createdAt: '2025-01-01',
  } as GradeTxn;

  const txnB: GradeTxn = {
    id: 'b',
    score: 20,
    grade: 'A+',
    createdAt: '2025-01-02',
  } as GradeTxn;

  it('compares by score', () => {
    expect(compareTransactions(txnA, txnB, 'score')).toBeLessThan(0);
    expect(compareTransactions(txnB, txnA, 'score')).toBeGreaterThan(0);
  });

  it('compares by grade', () => {
    expect(compareTransactions(txnA, txnB, 'grade')).toBeLessThan(0);
  });

  it('compares by date', () => {
    expect(compareTransactions(txnA, txnB, 'date')).toBeLessThan(0);
  });
});

describe('sortTransactions', () => {
  const transactions: GradeTxn[] = [
    { id: '1', score: 10, grade: 'B', createdAt: '2025-01-03' } as GradeTxn,
    { id: '2', score: 30, grade: 'A+', createdAt: '2025-01-01' } as GradeTxn,
    { id: '3', score: 20, grade: 'A', createdAt: '2025-01-02' } as GradeTxn,
  ];

  it('sorts by score descending', () => {
    const sorted = sortTransactions(transactions, 'score', 'desc');
    expect(sorted[0].score).toBe(30);
    expect(sorted[2].score).toBe(10);
  });

  it('sorts by score ascending', () => {
    const sorted = sortTransactions(transactions, 'score', 'asc');
    expect(sorted[0].score).toBe(10);
    expect(sorted[2].score).toBe(30);
  });

  it('sorts by grade', () => {
    const sorted = sortTransactions(transactions, 'grade', 'desc');
    expect(sorted[0].grade).toBe('A+');
  });

  it('sorts by date', () => {
    const sorted = sortTransactions(transactions, 'date', 'desc');
    expect(sorted[0].createdAt).toBe('2025-01-03');
  });

  it('does not mutate original array', () => {
    const original = [...transactions];
    sortTransactions(transactions, 'score', 'desc');
    expect(transactions).toEqual(original);
  });
});

describe('filterTransactions', () => {
  const transactions: GradeTxn[] = [
    {
      id: '1',
      score: 10,
      grade: 'A',
      teamName: 'Team A',
      leagueName: 'AFC',
      players: [{ name: 'Player 1', playerId: 'p1', position: 'RB', role: 'add' }],
    } as GradeTxn,
    {
      id: '2',
      score: 20,
      grade: 'A+',
      teamName: 'Team B',
      leagueName: 'NFC',
      players: [{ name: 'Player 2', playerId: 'p2', position: 'WR', role: 'add' }],
    } as GradeTxn,
  ];

  it('filters by team', () => {
    const filtered = filterTransactions(transactions, { teamFilter: 'Team A' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].teamName).toBe('Team A');
  });

  it('filters by league', () => {
    const filtered = filterTransactions(transactions, { leagueFilter: 'NFC' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].leagueName).toBe('NFC');
  });

  it('filters by grade', () => {
    const filtered = filterTransactions(transactions, { gradeFilter: 'A+' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].grade).toBe('A+');
  });

  it('filters by search term', () => {
    const filtered = filterTransactions(transactions, { searchTerm: 'player 1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].players[0].name).toBe('Player 1');
  });

  it('applies multiple filters', () => {
    const filtered = filterTransactions(transactions, {
      teamFilter: 'Team B',
      gradeFilter: 'A+',
    });
    expect(filtered).toHaveLength(1);
  });

  it('returns all when filter is "all"', () => {
    const filtered = filterTransactions(transactions, {
      teamFilter: 'all',
      leagueFilter: 'all',
      gradeFilter: 'all',
    });
    expect(filtered).toHaveLength(2);
  });

  it('handles case-insensitive search', () => {
    const filtered = filterTransactions(transactions, { searchTerm: 'PLAYER 2' });
    expect(filtered).toHaveLength(1);
  });
});

describe('getUniqueValues', () => {
  const transactions: GradeTxn[] = [
    { teamName: 'Team B', leagueName: 'AFC' } as GradeTxn,
    { teamName: 'Team A', leagueName: 'NFC' } as GradeTxn,
    { teamName: 'Team A', leagueName: 'AFC' } as GradeTxn,
  ];

  it('returns unique team names sorted', () => {
    const teams = getUniqueValues(transactions, 'teamName');
    expect(teams).toEqual(['Team A', 'Team B']);
  });

  it('returns unique league names sorted', () => {
    const leagues = getUniqueValues(transactions, 'leagueName');
    expect(leagues).toEqual(['AFC', 'NFC']);
  });

  it('filters out undefined values', () => {
    const txns = [{ teamName: undefined } as any, { teamName: 'Team A' } as GradeTxn];
    const teams = getUniqueValues(txns, 'teamName');
    expect(teams).toEqual(['Team A']);
  });
});

describe('calculateTransactionStats', () => {
  const transactions: GradeTxn[] = [
    { score: 10 } as GradeTxn,
    { score: -5 } as GradeTxn,
    { score: 0 } as GradeTxn,
    { score: 15 } as GradeTxn,
    { score: -2 } as GradeTxn,
  ];

  it('counts positive, negative, and neutral transactions', () => {
    const stats = calculateTransactionStats(transactions);
    expect(stats.positive).toBe(2);
    expect(stats.negative).toBe(2);
    expect(stats.neutral).toBe(1);
    expect(stats.total).toBe(5);
  });

  it('handles empty array', () => {
    const stats = calculateTransactionStats([]);
    expect(stats).toEqual({ positive: 0, negative: 0, neutral: 0, total: 0 });
  });
});

describe('calculateScoreRange', () => {
  it('returns maximum absolute score', () => {
    const transactions = [{ score: 10 }, { score: -25 }, { score: 15 }] as GradeTxn[];
    expect(calculateScoreRange(transactions)).toBe(25);
  });

  it('returns 1 for empty array', () => {
    expect(calculateScoreRange([])).toBe(1);
  });

  it('handles all positive scores', () => {
    const transactions = [{ score: 5 }, { score: 10 }, { score: 3 }] as GradeTxn[];
    expect(calculateScoreRange(transactions)).toBe(10);
  });
});

describe('calculateScoreBreakdown', () => {
  const transaction: GradeTxn = {
    players: [
      {
        role: 'add',
        forYou: { weightedPoints: 15 },
      },
      {
        role: 'drop',
        afterDrop: { selfHarmWeighted: 5, oppHarmWeighted: 3 },
      },
    ],
  } as any;

  it('calculates contribution from adds', () => {
    const breakdown = calculateScoreBreakdown(transaction);
    expect(breakdown.contribution).toBe(15);
  });

  it('calculates self-harm from drops', () => {
    const breakdown = calculateScoreBreakdown(transaction);
    expect(breakdown.selfHarm).toBe(5);
  });

  it('calculates opponent-harm from drops', () => {
    const breakdown = calculateScoreBreakdown(transaction);
    expect(breakdown.oppHarm).toBe(3);
  });

  it('calculates total penalties', () => {
    const breakdown = calculateScoreBreakdown(transaction);
    expect(breakdown.totalPenalties).toBe(8);
  });

  it('handles transactions with no players', () => {
    const emptyTxn: GradeTxn = { players: [] } as any;
    const breakdown = calculateScoreBreakdown(emptyTxn);
    expect(breakdown.contribution).toBe(0);
    expect(breakdown.selfHarm).toBe(0);
    expect(breakdown.oppHarm).toBe(0);
  });
});

describe('GRADE_ORDER', () => {
  it('defines proper grade hierarchy', () => {
    expect(GRADE_ORDER['A+']).toBeGreaterThan(GRADE_ORDER.A);
    expect(GRADE_ORDER.A).toBeGreaterThan(GRADE_ORDER.B);
    expect(GRADE_ORDER.B).toBeGreaterThan(GRADE_ORDER.C);
    expect(GRADE_ORDER.C).toBeGreaterThan(GRADE_ORDER.D);
    expect(GRADE_ORDER.D).toBeGreaterThan(GRADE_ORDER.F);
  });
});
