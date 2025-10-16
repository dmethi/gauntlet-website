/**
 * Transaction Analysis Utilities
 *
 * Pure functions for transaction grading, scoring, filtering, and sorting.
 */

import type { GradeTxn } from '@/features/transactions/types';

/**
 * Grade mapping for sorting transactions by grade
 */
export const GRADE_ORDER = { 'A+': 6, A: 5, B: 4, C: 3, D: 2, F: 1 } as const;

/**
 * Letter grade type
 */
export type LetterGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Calculate letter grade from normalized score percentile
 *
 * @param percentile - Score percentile (0-100)
 * @returns Letter grade
 *
 * @example
 * calculateLetterGrade(90) // 'A+'
 * calculateLetterGrade(75) // 'B'
 */
export const calculateLetterGrade = (percentile: number): LetterGrade => {
  if (percentile >= 88) return 'A+';
  if (percentile >= 82) return 'A';
  if (percentile >= 70) return 'B';
  if (percentile >= 55) return 'C';
  if (percentile >= 40) return 'D';
  return 'F';
};

/**
 * Calculate z-score and percentile for a value
 *
 * @param value - Value to normalize
 * @param mean - Mean of distribution
 * @param std - Standard deviation
 * @returns Percentile (0-100)
 *
 * @example
 * calculatePercentile(15, 10, 5) // ~70
 */
export const calculatePercentile = (value: number, mean: number, std: number): number => {
  const z = std > 0 ? (value - mean) / std : 0;
  return 50 + 40 * Math.tanh(z);
};

/**
 * Assign letter grades to all transactions based on score distribution
 *
 * @param transactions - Array of transactions to grade
 * @returns Transactions with assigned letter grades
 *
 * @example
 * assignLetterGrades(transactions)
 */
export const assignLetterGrades = (transactions: GradeTxn[]): GradeTxn[] => {
  if (transactions.length === 0) return transactions;

  const vals = transactions.map(g => g.score);
  const n = vals.length;
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1);
  const std = Math.sqrt(variance);

  return transactions.map(txn => ({
    ...txn,
    grade: calculateLetterGrade(calculatePercentile(txn.score, mean, std)),
  }));
};

/**
 * Sort type for transaction table
 */
export type SortBy = 'score' | 'grade' | 'date';
export type SortOrder = 'asc' | 'desc';

/**
 * Compare two transactions for sorting
 *
 * @param a - First transaction
 * @param b - Second transaction
 * @param sortBy - Sort field
 * @returns Comparison result
 */
export const compareTransactions = (a: GradeTxn, b: GradeTxn, sortBy: SortBy): number => {
  if (sortBy === 'score') {
    return a.score - b.score;
  }

  if (sortBy === 'grade') {
    return (GRADE_ORDER[a.grade as LetterGrade] || 0) - (GRADE_ORDER[b.grade as LetterGrade] || 0);
  }

  if (sortBy === 'date') {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }

  return 0;
};

/**
 * Sort transactions by specified field and order
 *
 * @param transactions - Transactions to sort
 * @param sortBy - Sort field
 * @param sortOrder - Sort direction
 * @returns Sorted transactions
 *
 * @example
 * sortTransactions(txns, 'score', 'desc')
 */
export const sortTransactions = (
  transactions: GradeTxn[],
  sortBy: SortBy,
  sortOrder: SortOrder,
): GradeTxn[] => {
  return [...transactions].sort((a, b) => {
    const comparison = compareTransactions(a, b, sortBy);
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

/**
 * Filter transactions by team, league, grade, and search term
 *
 * @param transactions - Transactions to filter
 * @param filters - Filter criteria
 * @returns Filtered transactions
 *
 * @example
 * filterTransactions(txns, { teamFilter: 'Team A', gradeFilter: 'A+' })
 */
export const filterTransactions = (
  transactions: GradeTxn[],
  filters: {
    teamFilter?: string;
    leagueFilter?: string;
    gradeFilter?: string;
    searchTerm?: string;
  },
): GradeTxn[] => {
  const {
    teamFilter = 'all',
    leagueFilter = 'all',
    gradeFilter = 'all',
    searchTerm = '',
  } = filters;

  return transactions.filter(txn => {
    // Team filter
    if (teamFilter !== 'all' && txn.teamName !== teamFilter) return false;

    // League filter
    if (leagueFilter !== 'all' && txn.leagueName !== leagueFilter) return false;

    // Grade filter
    if (gradeFilter !== 'all' && txn.grade !== gradeFilter) return false;

    // Search filter
    if (
      searchTerm &&
      !txn.players.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
      return false;

    return true;
  });
};

/**
 * Get unique values from transactions for filter options
 *
 * @param transactions - Transactions to analyze
 * @param field - Field to extract unique values from
 * @returns Sorted array of unique values
 *
 * @example
 * getUniqueValues(txns, 'teamName') // ['Team A', 'Team B']
 */
export const getUniqueValues = (
  transactions: GradeTxn[],
  field: 'teamName' | 'leagueName',
): string[] => {
  return Array.from(
    new Set(transactions.map(txn => txn[field]).filter((value): value is string => Boolean(value))),
  ).sort();
};

/**
 * Calculate transaction statistics
 *
 * @param transactions - Transactions to analyze
 * @returns Transaction statistics
 *
 * @example
 * calculateStats(txns) // { positive: 10, negative: 5, neutral: 2, total: 17 }
 */
export const calculateTransactionStats = (
  transactions: GradeTxn[],
): {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
} => {
  return {
    positive: transactions.filter(t => t.score > 0).length,
    negative: transactions.filter(t => t.score < 0).length,
    neutral: transactions.filter(t => t.score === 0).length,
    total: transactions.length,
  };
};

/**
 * Calculate score range for coloring
 *
 * @param transactions - Transactions to analyze
 * @returns Maximum absolute score value
 *
 * @example
 * calculateScoreRange(txns) // 25.5
 */
export const calculateScoreRange = (transactions: GradeTxn[]): number => {
  return Math.max(...transactions.map(t => Math.abs(t.score)), 1);
};

/**
 * Calculate score breakdown for a transaction
 *
 * @param transaction - Transaction to analyze
 * @returns Score breakdown components
 *
 * @example
 * calculateScoreBreakdown(txn)
 */
export const calculateScoreBreakdown = (
  transaction: GradeTxn,
): {
  contribution: number;
  selfHarm: number;
  oppHarm: number;
  totalPenalties: number;
} => {
  const contribution = transaction.players
    .filter(p => p.role === 'add' && p.forYou)
    .reduce((s, p) => s + (p.forYou?.weightedPoints || 0), 0);

  const selfHarm = transaction.players
    .filter(p => p.role === 'drop' && p.afterDrop)
    .reduce((s, p) => s + (p.afterDrop?.selfHarmWeighted || 0), 0);

  const oppHarm = transaction.players
    .filter(p => p.role === 'drop' && p.afterDrop)
    .reduce((s, p) => s + (p.afterDrop?.oppHarmWeighted || 0), 0);

  return {
    contribution,
    selfHarm,
    oppHarm,
    totalPenalties: selfHarm + oppHarm,
  };
};
