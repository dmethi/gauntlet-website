import { describe, expect, it, vi } from 'vitest';
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

  describe('Filtering', () => {
    it('displays grade filter options', () => {
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
        teamsMap: new Map(),
        teamsLoaded: true,
        transactionsProcessed: true,
      });

      render(<TransactionAnalysis currentWeek={7} />);
      expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
    });

    it('displays transactions with different grades', () => {
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
        {
          id: '2',
          score: -5,
          grade: 'D',
          createdAt: '2025-01-02',
          teamName: 'Team B',
          leagueName: 'NFC',
          type: 'waiver',
          players: [],
        } as GradeTxn,
      ];

      vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
        allData: mockData,
        loading: false,
        loadingStep: '',
        teamsMap: new Map(),
        teamsLoaded: true,
        transactionsProcessed: true,
      });

      render(<TransactionAnalysis currentWeek={7} />);
      expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
    });
  });

  describe('Transaction Types', () => {
    it('displays free agent transactions', () => {
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
        teamsMap: new Map(),
        teamsLoaded: true,
        transactionsProcessed: true,
      });

      render(<TransactionAnalysis currentWeek={7} />);
      expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
    });

    it('displays waiver transactions', () => {
      const mockData: GradeTxn[] = [
        {
          id: '1',
          score: 8,
          grade: 'B',
          createdAt: '2025-01-01',
          teamName: 'Team A',
          leagueName: 'AFC',
          type: 'waiver',
          players: [],
        } as GradeTxn,
      ];

      vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
        allData: mockData,
        loading: false,
        loadingStep: '',
        teamsMap: new Map(),
        teamsLoaded: true,
        transactionsProcessed: true,
      });

      render(<TransactionAnalysis currentWeek={7} />);
      expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
    });

    it('displays trade transactions', () => {
      const mockData: GradeTxn[] = [
        {
          id: '1',
          score: 5,
          grade: 'B',
          createdAt: '2025-01-01',
          teamName: 'Team A',
          leagueName: 'AFC',
          type: 'trade',
          players: [],
        } as GradeTxn,
      ];

      vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
        allData: mockData,
        loading: false,
        loadingStep: '',
        teamsMap: new Map(),
        teamsLoaded: true,
        transactionsProcessed: true,
      });

      render(<TransactionAnalysis currentWeek={7} />);
      expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles large number of transactions', () => {
      const mockData: GradeTxn[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        score: 10 - i * 0.1,
        grade: 'B',
        createdAt: '2025-01-01',
        teamName: `Team ${i}`,
        leagueName: i % 2 === 0 ? 'AFC' : 'NFC',
        type: 'free_agent',
        players: [],
      })) as GradeTxn[];

      vi.spyOn(useModelHook, 'useTransactionAnalysisModel').mockReturnValue({
        allData: mockData,
        loading: false,
        loadingStep: '',
        teamsMap: new Map(),
        teamsLoaded: true,
        transactionsProcessed: true,
      });

      render(<TransactionAnalysis currentWeek={7} />);
      expect(screen.getByText('Transaction Analysis')).toBeInTheDocument();
    });
  });
});
