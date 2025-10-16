import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionAnalysis } from './TransactionAnalysis';
import * as useModelHook from './useTransactionAnalysisModel';
import type { GradeTxn, TeamInfo } from '@/features/transactions/types';

// Mock the hook
vi.mock('./useTransactionAnalysisModel');

describe('TransactionAnalysis', () => {
  it('renders loading state when data is loading', () => {
    vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
      allData: [],
      loading: true,
      loadingStep: 'Loading...',
      teamsMap: new Map(),
      teamsLoaded: false,
      transactionsProcessed: false,
    });

    render(<TransactionAnalysis currentWeek={7} />);
    expect(screen.getByText('Loading Transaction Analysis')).toBeInTheDocument();
  });

  it('renders transaction table when data is loaded', () => {
    const mockData: GradeTxn[] = [
      {
        id: '1',
        score: 10,
        grade: 'A',
        createdAt: '2025-01-01',
        teamName: 'Team A',
        leagueName: 'AFC',
        type: 'free_agent',
        players: [],
      } as GradeTxn,
    ];

    vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
      allData: mockData,
      loading: false,
      loadingStep: '',
      teamsMap: new Map<string, TeamInfo>(),
      teamsLoaded: true,
      transactionsProcessed: true,
    });

    render(<TransactionAnalysis currentWeek={7} />);
    expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
  });

  it('displays empty state when no transactions match filters', () => {
    vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
      allData: [],
      loading: false,
      loadingStep: '',
      teamsMap: new Map(),
      teamsLoaded: true,
      transactionsProcessed: true,
    });

    render(<TransactionAnalysis currentWeek={7} />);
    expect(screen.getByText('Loading transaction efficiency rankings...')).toBeInTheDocument();
  });
});
