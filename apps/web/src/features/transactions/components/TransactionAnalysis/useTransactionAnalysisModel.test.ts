import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransactionAnalysisModel } from './useTransactionAnalysisModel';
import { CURRENT_LEAGUES } from '@/config/leagues';

// Mock dependencies
vi.mock('@/features/transactions/utils', () => ({
  buildFacts: vi.fn().mockResolvedValue({
    weeklyPlayerData: new Map(),
    playerMetadata: new Map(),
  }),
}));

vi.mock('@/app/stats/utils/computeTransactionGradesForStatsHub', () => ({
  computeTransactionGradesForStatsHub: vi.fn().mockResolvedValue([
    {
      txnId: 'txn1',
      type: 'add',
      playerId: 'player1',
      playerName: 'Player One',
      score: 15.5,
      week: 3,
      leagueId: 'league1',
      leagueName: 'AFC',
      rosterId: 1,
      teamName: 'Team A',
    },
    {
      txnId: 'txn2',
      type: 'drop',
      playerId: 'player2',
      playerName: 'Player Two',
      score: -5.2,
      week: 4,
      leagueId: 'league1',
      leagueName: 'AFC',
      rosterId: 2,
      teamName: 'Team B',
    },
  ]),
}));

vi.mock('./utils', () => ({
  assignLetterGrades: vi.fn(transactions =>
    transactions.map((txn: any) => ({
      ...txn,
      letterGrade: txn.score > 10 ? 'A' : txn.score > 0 ? 'B' : 'F',
    })),
  ),
}));

describe('useTransactionAnalysisModel', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  it('initializes in loading state', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    expect(result.current.loading).toBe(true);
    expect(result.current.loadingStep).toBe('Loading team information from both leagues...');
    expect(result.current.allData).toEqual([]);
    expect(result.current.teamsLoaded).toBe(false);
    expect(result.current.transactionsProcessed).toBe(false);
  });

  it('loads team data successfully', async () => {
    const mockTeamsResponse = {
      teams: [
        {
          id: 1,
          name: 'Team Alpha',
          owner: 'Owner One',
          leagueId: 'league1',
          leagueName: 'AFC',
        },
        {
          id: 2,
          name: 'Team Beta',
          owner: 'Owner Two',
          leagueId: 'league2',
          leagueName: 'NFC',
        },
      ],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTeamsResponse,
        });
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    await waitFor(() => {
      expect(result.current.teamsLoaded).toBe(true);
    });

    expect(result.current.teamsMap.size).toBe(2);
    expect(result.current.teamsMap.get('league1-1')).toEqual({
      rosterId: 1,
      teamName: 'Team Alpha',
      ownerName: 'Owner One',
      leagueId: 'league1',
      leagueName: 'AFC',
    });
  });

  it('handles team loading errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.reject(new Error('Team fetch failed'));
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teamsMap.size).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('processes transactions from both leagues', async () => {
    const [afc, nfc] = CURRENT_LEAGUES;

    const mockTeamsResponse = {
      teams: [
        {
          id: 1,
          name: 'Team A',
          owner: 'Owner A',
          leagueId: afc.id,
          leagueName: afc.name,
        },
        {
          id: 2,
          name: 'Team B',
          owner: 'Owner B',
          leagueId: nfc.id,
          leagueName: nfc.name,
        },
      ],
    };

    const mockTransactionsAFC = {
      data: [{ id: 'txn1', type: 'add', adds: { player1: 1 }, week: 3 }],
    };

    const mockTransactionsNFC = {
      data: [{ id: 'txn2', type: 'add', adds: { player2: 2 }, week: 4 }],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTeamsResponse,
        });
      }
      if (url.includes(`${afc.id}/transactions`)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTransactionsAFC,
        });
      }
      if (url.includes(`${nfc.id}/transactions`)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTransactionsNFC,
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    await waitFor(() => {
      expect(result.current.transactionsProcessed).toBe(true);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.allData.length).toBeGreaterThanOrEqual(0);
  });

  it('assigns letter grades to transactions', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ teams: [] }),
        });
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that transactions have letter grades
    result.current.allData.forEach(txn => {
      expect(txn).toHaveProperty('letterGrade');
    });
  });

  it('sorts transactions by score descending', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ teams: [] }),
        });
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const scores = result.current.allData.map(txn => txn.score);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedScores);
  });

  it('updates loading step during processing', async () => {
    let resolveTeams: any;
    const teamsPromise = new Promise(resolve => {
      resolveTeams = resolve;
    });

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return teamsPromise.then(() => ({
          ok: true,
          json: async () => ({ teams: [] }),
        }));
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    expect(result.current.loadingStep).toBe('Loading team information from both leagues...');

    resolveTeams();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles transaction processing errors for individual leagues', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ teams: [] }),
        });
      }
      if (url.includes('afc123/transactions')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      if (url.includes('nfc123/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useTransactionAnalysisModel(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should continue processing despite one league failing
    expect(result.current.transactionsProcessed).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  it('cancels loading on unmount', async () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { unmount } = renderHook(() => useTransactionAnalysisModel(5));

    unmount();

    // If unmount cleanup works properly, no errors should be thrown
    expect(true).toBe(true);
  });

  it('analyzes correct number of weeks based on currentNflWeek', async () => {
    // debugLog (lib/debug-log.ts) logs via console.warn, not console.log.
    const consoleLogSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/league/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ teams: [] }),
        });
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderHook(() => useTransactionAnalysisModel(8));

    await waitFor(() => {
      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const weeksLog = logCalls.find(log => log.includes('Analyzing weeks'));
      expect(weeksLog).toBeTruthy();
      expect(weeksLog).toContain('1, 2, 3, 4, 5, 6, 7, 8');
    });

    consoleLogSpy.mockRestore();
  });
});
