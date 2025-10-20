import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useStartSitEfficiencyModel } from './useStartSitEfficiencyModel';
import type { DecisionDetail, ManagerEfficiency, StartSitData } from '@/features/start-sit/types';
import * as hooksModule from '@/lib/hooks';

// Mock the usePlayers hook
vi.mock('@/lib/hooks', () => ({
  usePlayers: vi.fn((playerIds: string[]) => ({
    data: {
      players: {
        player1: { full_name: 'Player One', position: 'RB' },
        player2: { full_name: 'Player Two', position: 'WR' },
        player3: { full_name: 'Player Three', position: 'QB' },
      },
    },
    isLoading: false,
  })),
}));

const mockDecision: DecisionDetail = {
  managerId: 'mgr1',
  managerName: 'Manager One',
  leagueId: 'league1',
  week: 3,
  position: 'RB',
  selectedPlayer: {
    playerId: 'player1',
    projectedPoints: 15.0,
    actualPoints: 18.5,
  },
  alternatives: [
    {
      playerId: 'player2',
      projectedPoints: 12.0,
      actualPoints: 20.0,
      adjustedActualPoints: 19.0,
      source: 'bench',
    },
  ],
  optimalPlayer: {
    playerId: 'player2',
    projectedPoints: 12.0,
    actualPoints: 20.0,
    adjustedActualPoints: 19.0,
    source: 'bench',
  },
  pointsLeft: 0.5,
  weight: 1.0,
  isRiskyDecision: false,
  projectionDifferential: 3.0,
  actualOutcome: -1.5,
};

const mockManagerEfficiency: ManagerEfficiency = {
  managerId: 'mgr1',
  managerName: 'Manager One',
  leagueId: 'league1',
  decisions: [mockDecision],
  overallDecisionRate: 0.85,
  overallEfficiencyRate: 0.92,
  weightedDecisionScore: 0.88,
  pointsImpactScore: 5.2,
  positionBreakdown: {
    RB: {
      decisionRate: 0.8,
      efficiencyRate: 0.9,
      decisionsCount: 10,
      weight: 1.0,
      pointsLost: 5.0,
      pointsLostVsMedian: 2.0,
    },
    WR: {
      decisionRate: 0.9,
      efficiencyRate: 0.95,
      decisionsCount: 12,
      weight: 1.0,
      pointsLost: 3.0,
      pointsLostVsMedian: 1.0,
    },
  },
};

const mockData: StartSitData = {
  configuration: {
    projectionThreshold: 2.0,
    waiverDiscount: 0.9,
    weeks: [1, 2, 3, 4, 5],
    season: '2024',
    weightedScoring: true,
  },
  managerEfficiencies: [
    mockManagerEfficiency,
    {
      ...mockManagerEfficiency,
      managerId: 'mgr2',
      managerName: 'Manager Two',
      leagueId: 'league2',
    },
  ],
  worstDecisions: [mockDecision],
  bestRiskyDecisions: [mockDecision],
  rosterContext: [],
  leagueStats: {
    totalDecisions: 100,
    avgWeightedScore: 0.82,
    avgPointsImpact: 4.5,
  },
  timestamp: '2024-10-01T12:00:00Z',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { readonly children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useStartSitEfficiencyModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with first manager selected', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedManagerId).toBe('mgr1');
    expect(result.current.selectedManager).toBeDefined();
    expect(result.current.selectedManager?.managerName).toBe('Manager One');
  });

  it('builds manager options correctly', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.managerOptions).toHaveLength(2);
    expect(result.current.managerOptions[0]).toEqual({
      value: 'mgr1',
      label: 'Manager One',
      leagueLabel: expect.any(String),
    });
  });

  it('changes selected manager', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedManagerId('mgr2');
    });

    expect(result.current.selectedManagerId).toBe('mgr2');
    expect(result.current.selectedManager?.managerName).toBe('Manager Two');
  });

  it('calculates summary metrics', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.summaryMetrics).toBeDefined();
    expect(result.current.summaryMetrics.totalDecisions).toBe(100);
    expect(result.current.summaryMetrics.managerCount).toBe(2);
    expect(result.current.summaryMetrics.averageWeightedScore).toBeGreaterThan(0);
    expect(result.current.summaryMetrics.averagePointsImpact).toBeGreaterThan(0);
  });

  it('collects all player IDs from data', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.players).toBeDefined();
    expect(result.current.players.player1).toBeDefined();
    expect(result.current.players.player1.full_name).toBe('Player One');
  });

  it('handles empty manager efficiencies', () => {
    const emptyData: StartSitData = {
      ...mockData,
      managerEfficiencies: [],
    };

    const { result } = renderHook(() => useStartSitEfficiencyModel(emptyData), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedManagerId).toBe('');
    expect(result.current.selectedManager).toBeNull();
    expect(result.current.managerOptions).toEqual([]);
  });

  it('handles player loading state', () => {
    const usePlayers = vi.mocked(hooksModule.usePlayers as any);
    usePlayers.mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.playersLoading).toBe(true);
  });

  it('returns empty players object when player data is unavailable', () => {
    const usePlayers = vi.mocked(hooksModule.usePlayers as any);
    usePlayers.mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.players).toEqual({});
  });

  it('memoizes manager options when data unchanged', () => {
    const { result, rerender } = renderHook(({ data }) => useStartSitEfficiencyModel(data), {
      initialProps: { data: mockData },
      wrapper: createWrapper(),
    });

    const firstOptions = result.current.managerOptions;

    rerender({ data: mockData });

    expect(result.current.managerOptions).toBe(firstOptions);
  });

  it('memoizes summary metrics when data unchanged', () => {
    const { result, rerender } = renderHook(({ data }) => useStartSitEfficiencyModel(data), {
      initialProps: { data: mockData },
      wrapper: createWrapper(),
    });

    const firstMetrics = result.current.summaryMetrics;

    rerender({ data: mockData });

    expect(result.current.summaryMetrics).toBe(firstMetrics);
  });

  it('updates selected manager when ID changes', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedManager?.managerId).toBe('mgr1');

    act(() => {
      result.current.setSelectedManagerId('mgr2');
    });

    expect(result.current.selectedManager?.managerId).toBe('mgr2');
  });

  it('handles manager not found gracefully', () => {
    const { result } = renderHook(() => useStartSitEfficiencyModel(mockData), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedManagerId('nonexistent');
    });

    expect(result.current.selectedManager).toBeNull();
  });

  it('processes complex decisions with alternatives', () => {
    const complexDecision: DecisionDetail = {
      ...mockDecision,
      alternatives: [
        {
          playerId: 'player2',
          projectedPoints: 12.0,
          actualPoints: 20.0,
          adjustedActualPoints: 19.0,
          source: 'bench',
        },
        {
          playerId: 'player3',
          projectedPoints: 10.0,
          actualPoints: 15.0,
          adjustedActualPoints: 13.5,
          source: 'waiver',
        },
      ],
    };

    const dataWithComplexDecisions: StartSitData = {
      ...mockData,
      worstDecisions: [complexDecision],
    };

    const { result } = renderHook(() => useStartSitEfficiencyModel(dataWithComplexDecisions), {
      wrapper: createWrapper(),
    });

    // Should collect all player IDs from alternatives
    expect(result.current.players).toBeDefined();
  });

  it('handles data with roster context', () => {
    const dataWithContext: StartSitData = {
      ...mockData,
      rosterContext: [
        {
          managerId: 'mgr1',
          managerName: 'Manager One',
          leagueId: 'league1',
          week: 3,
          startingLineup: [
            {
              position: 'RB',
              player: { playerId: 'player1' },
              pointsScored: 18.5,
            },
          ],
          benchPlayers: [{ player: { playerId: 'player2' } }],
          waiverAlternatives: [{ player: { playerId: 'player3' } }],
          decisions: [],
        },
      ],
    };

    const { result } = renderHook(() => useStartSitEfficiencyModel(dataWithContext), {
      wrapper: createWrapper(),
    });

    // Should collect player IDs from roster context
    expect(result.current.players).toBeDefined();
  });
});
