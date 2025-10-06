import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveSnapshotIfChanged,
  hasSignificantChange,
  type CompleteSnapshot,
  type PreviousSnapshot,
} from '@/lib';
import * as historicalData from '@/lib/historical-data';

// Mock the historical data module
vi.mock('@/lib/historical-data', () => ({
  saveLiveWinProbSample: vi.fn(),
  getLastWinProbSample: vi.fn(),
}));

describe('snapshot-validator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hasSignificantChange', () => {
    const basePrevious: PreviousSnapshot = {
      currentScoreA: 100.0,
      currentScoreB: 95.0,
      projectedFinalA: 125.5,
      projectedFinalB: 120.2,
      spread: -3.5,
      total: 245.7,
    };

    const baseCurrent: CompleteSnapshot = {
      week: 5,
      leagueId: '1263744209295245312',
      matchupId: 1,
      team1: {
        rosterId: 1,
        rawProjectionTotal: 120.0,
        simulatedMean: 125.5,
        currentScore: 100.0,
        winProbability: 0.65,
      },
      team2: {
        rosterId: 2,
        rawProjectionTotal: 115.0,
        simulatedMean: 120.2,
        currentScore: 95.0,
        winProbability: 0.35,
      },
      spread: -3.5,
      total: 245.7,
      moneyLineA: -180,
      moneyLineB: 160,
      capturedAt: new Date().toISOString(),
    };

    it('should return false when nothing has changed', () => {
      const result = hasSignificantChange(basePrevious, baseCurrent);
      expect(result).toBe(false);
    });

    it('should return true when current score changes', () => {
      const current = {
        ...baseCurrent,
        team1: { ...baseCurrent.team1, currentScore: 105.0 },
      };
      const result = hasSignificantChange(basePrevious, current);
      expect(result).toBe(true);
    });

    it('should return true when projected final changes', () => {
      const current = {
        ...baseCurrent,
        team1: { ...baseCurrent.team1, simulatedMean: 130.0 },
      };
      const result = hasSignificantChange(basePrevious, current);
      expect(result).toBe(true);
    });

    it('should return true when spread changes', () => {
      const current = { ...baseCurrent, spread: -5.0 };
      const result = hasSignificantChange(basePrevious, current);
      expect(result).toBe(true);
    });

    it('should return true when total changes', () => {
      const current = { ...baseCurrent, total: 250.0 };
      const result = hasSignificantChange(basePrevious, current);
      expect(result).toBe(true);
    });

    it('should ignore changes below threshold (0.01)', () => {
      const current = {
        ...baseCurrent,
        team1: { ...baseCurrent.team1, currentScore: 100.005 },
      };
      const result = hasSignificantChange(basePrevious, current);
      expect(result).toBe(false);
    });

    it('should respect custom threshold', () => {
      const current = {
        ...baseCurrent,
        team1: { ...baseCurrent.team1, currentScore: 100.5 },
      };

      // With default threshold (0.01), this should be significant
      expect(hasSignificantChange(basePrevious, current, 0.01)).toBe(true);

      // With higher threshold (1.0), this should not be significant
      expect(hasSignificantChange(basePrevious, current, 1.0)).toBe(false);
    });

    it('should detect multiple simultaneous changes', () => {
      const current = {
        ...baseCurrent,
        team1: { ...baseCurrent.team1, currentScore: 105.0, simulatedMean: 130.0 },
        spread: -5.0,
      };
      const result = hasSignificantChange(basePrevious, current);
      expect(result).toBe(true);
    });
  });

  describe('saveSnapshotIfChanged', () => {
    const mockSnapshot: CompleteSnapshot = {
      week: 5,
      leagueId: '1263744209295245312',
      matchupId: 1,
      team1: {
        rosterId: 1,
        rawProjectionTotal: 120.0,
        simulatedMean: 125.5,
        currentScore: 100.0,
        winProbability: 0.65,
      },
      team2: {
        rosterId: 2,
        rawProjectionTotal: 115.0,
        simulatedMean: 120.2,
        currentScore: 95.0,
        winProbability: 0.35,
      },
      spread: -3.5,
      total: 245.7,
      moneyLineA: -180,
      moneyLineB: 160,
      capturedAt: new Date().toISOString(),
      team1Name: 'Team Alpha',
      team2Name: 'Team Beta',
    };

    it('should save snapshot when no previous exists', async () => {
      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(null);
      vi.mocked(historicalData.saveLiveWinProbSample).mockResolvedValueOnce({} as any);

      const result = await saveSnapshotIfChanged(mockSnapshot);

      expect(result.saved).toBe(true);
      expect(result.reason).toBe('saved');
      expect(historicalData.saveLiveWinProbSample).toHaveBeenCalledOnce();
      expect(historicalData.saveLiveWinProbSample).toHaveBeenCalledWith({
        leagueId: mockSnapshot.leagueId,
        week: mockSnapshot.week,
        matchupId: mockSnapshot.matchupId,
        rosterAId: mockSnapshot.team1.rosterId,
        rosterBId: mockSnapshot.team2.rosterId,
        gameProgress: 0,
        winProbA: mockSnapshot.team1.winProbability,
        winProbB: mockSnapshot.team2.winProbability,
        projectedFinalA: mockSnapshot.team1.simulatedMean,
        projectedFinalB: mockSnapshot.team2.simulatedMean,
        currentScoreA: mockSnapshot.team1.currentScore,
        currentScoreB: mockSnapshot.team2.currentScore,
        spread: mockSnapshot.spread,
        total: mockSnapshot.total,
      });
    });

    it('should skip saving when data has not changed', async () => {
      const previousSnapshot: PreviousSnapshot = {
        currentScoreA: 100.0,
        currentScoreB: 95.0,
        projectedFinalA: 125.5,
        projectedFinalB: 120.2,
        spread: -3.5,
        total: 245.7,
      };

      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(previousSnapshot);

      const result = await saveSnapshotIfChanged(mockSnapshot);

      expect(result.saved).toBe(false);
      expect(result.reason).toBe('unchanged');
      expect(historicalData.saveLiveWinProbSample).not.toHaveBeenCalled();
    });

    it('should save when scores have changed significantly', async () => {
      const previousSnapshot: PreviousSnapshot = {
        currentScoreA: 90.0, // Changed from 100.0
        currentScoreB: 85.0, // Changed from 95.0
        projectedFinalA: 125.5,
        projectedFinalB: 120.2,
        spread: -3.5,
        total: 245.7,
      };

      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(previousSnapshot);
      vi.mocked(historicalData.saveLiveWinProbSample).mockResolvedValueOnce({} as any);

      const result = await saveSnapshotIfChanged(mockSnapshot);

      expect(result.saved).toBe(true);
      expect(result.reason).toBe('saved');
      expect(historicalData.saveLiveWinProbSample).toHaveBeenCalledOnce();
    });

    it('should save when projections have changed significantly', async () => {
      const previousSnapshot: PreviousSnapshot = {
        currentScoreA: 100.0,
        currentScoreB: 95.0,
        projectedFinalA: 115.0, // Changed from 125.5
        projectedFinalB: 110.0, // Changed from 120.2
        spread: -3.5,
        total: 245.7,
      };

      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(previousSnapshot);
      vi.mocked(historicalData.saveLiveWinProbSample).mockResolvedValueOnce({} as any);

      const result = await saveSnapshotIfChanged(mockSnapshot);

      expect(result.saved).toBe(true);
      expect(result.reason).toBe('saved');
      expect(historicalData.saveLiveWinProbSample).toHaveBeenCalledOnce();
    });

    it('should save when odds have changed significantly', async () => {
      const previousSnapshot: PreviousSnapshot = {
        currentScoreA: 100.0,
        currentScoreB: 95.0,
        projectedFinalA: 125.5,
        projectedFinalB: 120.2,
        spread: -7.0, // Changed from -3.5
        total: 250.0, // Changed from 245.7
      };

      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(previousSnapshot);
      vi.mocked(historicalData.saveLiveWinProbSample).mockResolvedValueOnce({} as any);

      const result = await saveSnapshotIfChanged(mockSnapshot);

      expect(result.saved).toBe(true);
      expect(result.reason).toBe('saved');
      expect(historicalData.saveLiveWinProbSample).toHaveBeenCalledOnce();
    });

    it('should handle player data in snapshot', async () => {
      const snapshotWithPlayers: CompleteSnapshot = {
        ...mockSnapshot,
        team1Players: [
          {
            name: 'Player A',
            position: 'QB',
            nflTeam: 'KC',
            currentScore: 25.5,
            remainingProjection: 5.0,
            fullProjection: 30.5,
            gameState: {
              state: 'in',
              desc: 'Q3 - 8:45',
              minutesRemaining: 38,
            },
          },
        ],
        team2Players: [
          {
            name: 'Player B',
            position: 'RB',
            nflTeam: 'SF',
            currentScore: 15.2,
            remainingProjection: 8.5,
            fullProjection: 23.7,
            gameState: {
              state: 'in',
              desc: 'Q3 - 8:45',
              minutesRemaining: 38,
            },
          },
        ],
      };

      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(null);
      vi.mocked(historicalData.saveLiveWinProbSample).mockResolvedValueOnce({} as any);

      const result = await saveSnapshotIfChanged(snapshotWithPlayers);

      expect(result.saved).toBe(true);
      expect(historicalData.saveLiveWinProbSample).toHaveBeenCalledOnce();
    });

    it('should return error result when database save fails', async () => {
      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(null);
      vi.mocked(historicalData.saveLiveWinProbSample).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const result = await saveSnapshotIfChanged(mockSnapshot);

      expect(result.saved).toBe(false);
      expect(result.reason).toBe('error');
    });

    it('should handle missing team names gracefully', async () => {
      const snapshotWithoutNames = {
        ...mockSnapshot,
        team1Name: undefined,
        team2Name: undefined,
      };

      vi.mocked(historicalData.getLastWinProbSample).mockResolvedValueOnce(null);
      vi.mocked(historicalData.saveLiveWinProbSample).mockResolvedValueOnce({} as any);

      const result = await saveSnapshotIfChanged(snapshotWithoutNames);

      expect(result.saved).toBe(true);
      expect(result.reason).toBe('saved');
    });
  });
});
