import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveLiveWinProbSample,
  getLastWinProbSample,
  getMatchupWinProbTimeSeries,
  getWeekWinProbSamples,
  disconnect,
} from '@/lib';

// Mock the Prisma client
vi.mock('../../generated/prisma-historical', () => {
  const mockPrismaClient = {
    liveWinProbSample: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    matchupOddsHistory: {
      create: vi.fn(),
    },
    leagueOddsHistory: {
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
  };

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  };
});

// Import after mocking to get mocked instance
import { PrismaClient } from '../../generated/prisma-historical';

describe('historical-data', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveLiveWinProbSample', () => {
    it('should save a live win probability sample with all fields', async () => {
      const sampleData = {
        leagueId: '1263744209295245312',
        week: 5,
        matchupId: 1,
        rosterAId: 1,
        rosterBId: 2,
        gameProgress: 0.5,
        winProbA: 0.65,
        winProbB: 0.35,
        projectedFinalA: 125.5,
        projectedFinalB: 110.2,
        currentScoreA: 85.0,
        currentScoreB: 72.5,
        spread: -3.5,
        total: 235.7,
      };

      const mockCreatedRecord = { id: 1, ...sampleData };
      mockPrisma.liveWinProbSample.create.mockResolvedValueOnce(mockCreatedRecord);

      const result = await saveLiveWinProbSample(sampleData);

      expect(result).toEqual(mockCreatedRecord);
      expect(mockPrisma.liveWinProbSample.create).toHaveBeenCalledOnce();
      expect(mockPrisma.liveWinProbSample.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          leagueId: sampleData.leagueId,
          week: sampleData.week,
          matchupId: sampleData.matchupId,
          rosterAId: sampleData.rosterAId,
          rosterBId: sampleData.rosterBId,
          gameProgress: sampleData.gameProgress,
          winProbA: sampleData.winProbA,
          winProbB: sampleData.winProbB,
          projectedFinalA: sampleData.projectedFinalA,
          projectedFinalB: sampleData.projectedFinalB,
          currentScoreA: sampleData.currentScoreA,
          currentScoreB: sampleData.currentScoreB,
          spread: sampleData.spread,
          total: sampleData.total,
          timestamp: expect.any(Date),
        }),
      });
    });

    it('should use custom timestamp if provided', async () => {
      const customTimestamp = new Date('2025-10-06T12:00:00Z');
      const sampleData = {
        leagueId: '1263744209295245312',
        week: 5,
        matchupId: 1,
        rosterAId: 1,
        rosterBId: 2,
        timestamp: customTimestamp,
        gameProgress: 0.5,
        winProbA: 0.65,
        winProbB: 0.35,
        projectedFinalA: 125.5,
        projectedFinalB: 110.2,
        currentScoreA: 85.0,
        currentScoreB: 72.5,
        spread: -3.5,
        total: 235.7,
      };

      mockPrisma.liveWinProbSample.create.mockResolvedValueOnce({ id: 1 });

      await saveLiveWinProbSample(sampleData);

      const createCall = mockPrisma.liveWinProbSample.create.mock.calls[0][0];
      expect(createCall.data.timestamp).toBe(customTimestamp);
    });

    it('should generate timestamp if not provided', async () => {
      const sampleData = {
        leagueId: '1263744209295245312',
        week: 5,
        matchupId: 1,
        rosterAId: 1,
        rosterBId: 2,
        gameProgress: 0.5,
        winProbA: 0.65,
        winProbB: 0.35,
        projectedFinalA: 125.5,
        projectedFinalB: 110.2,
        currentScoreA: 85.0,
        currentScoreB: 72.5,
        spread: -3.5,
        total: 235.7,
      };

      mockPrisma.liveWinProbSample.create.mockResolvedValueOnce({ id: 1 });

      await saveLiveWinProbSample(sampleData);

      const createCall = mockPrisma.liveWinProbSample.create.mock.calls[0][0];
      expect(createCall.data.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getLastWinProbSample', () => {
    it('should retrieve the most recent sample for a matchup', async () => {
      const mockSample = {
        currentScoreA: 100.0,
        currentScoreB: 95.0,
        projectedFinalA: 125.5,
        projectedFinalB: 120.2,
        winProbA: 0.65,
        winProbB: 0.35,
        spread: -3.5,
        total: 245.7,
      };

      mockPrisma.liveWinProbSample.findFirst.mockResolvedValueOnce(mockSample);

      const result = await getLastWinProbSample('1263744209295245312', 5, 1);

      expect(result).toEqual(mockSample);
      expect(mockPrisma.liveWinProbSample.findFirst).toHaveBeenCalledOnce();
      expect(mockPrisma.liveWinProbSample.findFirst).toHaveBeenCalledWith({
        where: {
          leagueId: '1263744209295245312',
          week: 5,
          matchupId: 1,
        },
        orderBy: { timestamp: 'desc' },
        select: {
          currentScoreA: true,
          currentScoreB: true,
          projectedFinalA: true,
          projectedFinalB: true,
          winProbA: true,
          winProbB: true,
          spread: true,
          total: true,
        },
      });
    });

    it('should return null when no samples exist', async () => {
      mockPrisma.liveWinProbSample.findFirst.mockResolvedValueOnce(null);

      const result = await getLastWinProbSample('1263744209295245312', 5, 1);

      expect(result).toBeNull();
    });

    it('should query with correct composite key (leagueId, week, matchupId)', async () => {
      mockPrisma.liveWinProbSample.findFirst.mockResolvedValueOnce(null);

      await getLastWinProbSample('1263740549504962561', 4, 3);

      const findFirstCall = mockPrisma.liveWinProbSample.findFirst.mock.calls[0][0];
      expect(findFirstCall.where).toEqual({
        leagueId: '1263740549504962561',
        week: 4,
        matchupId: 3,
      });
    });
  });

  describe('getMatchupWinProbTimeSeries', () => {
    it('should retrieve time-series data for a matchup', async () => {
      const mockTimeSeries = [
        {
          timestamp: new Date('2025-10-06T13:00:00Z'),
          winProbA: 0.5,
          winProbB: 0.5,
          currentScoreA: 0.0,
          currentScoreB: 0.0,
          projectedFinalA: 120.0,
          projectedFinalB: 118.0,
          spread: -2.0,
          gameProgress: 0.0,
        },
        {
          timestamp: new Date('2025-10-06T13:10:00Z'),
          winProbA: 0.55,
          winProbB: 0.45,
          currentScoreA: 15.2,
          currentScoreB: 12.5,
          projectedFinalA: 122.0,
          projectedFinalB: 117.0,
          spread: -5.0,
          gameProgress: 0.15,
        },
        {
          timestamp: new Date('2025-10-06T13:20:00Z'),
          winProbA: 0.65,
          winProbB: 0.35,
          currentScoreA: 35.5,
          currentScoreB: 28.0,
          projectedFinalA: 125.5,
          projectedFinalB: 115.0,
          spread: -10.5,
          gameProgress: 0.3,
        },
      ];

      mockPrisma.liveWinProbSample.findMany.mockResolvedValueOnce(mockTimeSeries);

      const result = await getMatchupWinProbTimeSeries('1263744209295245312', 5, 1);

      expect(result).toEqual(mockTimeSeries);
      expect(result).toHaveLength(3);
      expect(mockPrisma.liveWinProbSample.findMany).toHaveBeenCalledOnce();
      expect(mockPrisma.liveWinProbSample.findMany).toHaveBeenCalledWith({
        where: {
          leagueId: '1263744209295245312',
          week: 5,
          matchupId: 1,
        },
        orderBy: { timestamp: 'asc' },
        select: {
          timestamp: true,
          winProbA: true,
          winProbB: true,
          currentScoreA: true,
          currentScoreB: true,
          projectedFinalA: true,
          projectedFinalB: true,
          spread: true,
          gameProgress: true,
        },
      });
    });

    it('should return empty array when no data exists', async () => {
      mockPrisma.liveWinProbSample.findMany.mockResolvedValueOnce([]);

      const result = await getMatchupWinProbTimeSeries('1263744209295245312', 5, 1);

      expect(result).toEqual([]);
    });

    it('should order results by timestamp ascending', async () => {
      const mockTimeSeries = [
        { timestamp: new Date('2025-10-06T13:00:00Z'), winProbA: 0.5 },
        { timestamp: new Date('2025-10-06T13:10:00Z'), winProbA: 0.55 },
        { timestamp: new Date('2025-10-06T13:20:00Z'), winProbA: 0.65 },
      ];

      mockPrisma.liveWinProbSample.findMany.mockResolvedValueOnce(mockTimeSeries);

      await getMatchupWinProbTimeSeries('1263744209295245312', 5, 1);

      const findManyCall = mockPrisma.liveWinProbSample.findMany.mock.calls[0][0];
      expect(findManyCall.orderBy).toEqual({ timestamp: 'asc' });
    });
  });

  describe('getWeekWinProbSamples', () => {
    it('should retrieve all samples for a week in a specific league', async () => {
      const mockSamples = [
        {
          matchupId: 1,
          timestamp: new Date('2025-10-06T13:00:00Z'),
          winProbA: 0.65,
          winProbB: 0.35,
        },
        {
          matchupId: 2,
          timestamp: new Date('2025-10-06T13:00:00Z'),
          winProbA: 0.45,
          winProbB: 0.55,
        },
        {
          matchupId: 3,
          timestamp: new Date('2025-10-06T13:00:00Z'),
          winProbA: 0.72,
          winProbB: 0.28,
        },
      ];

      mockPrisma.liveWinProbSample.findMany.mockResolvedValueOnce(mockSamples);

      const result = await getWeekWinProbSamples('1263744209295245312', 5);

      expect(result).toEqual(mockSamples);
      expect(mockPrisma.liveWinProbSample.findMany).toHaveBeenCalledOnce();
      expect(mockPrisma.liveWinProbSample.findMany).toHaveBeenCalledWith({
        where: {
          leagueId: '1263744209295245312',
          week: 5,
        },
        orderBy: [{ matchupId: 'asc' }, { timestamp: 'asc' }],
      });
    });

    it('should return empty array when no data exists for week', async () => {
      mockPrisma.liveWinProbSample.findMany.mockResolvedValueOnce([]);

      const result = await getWeekWinProbSamples('1263744209295245312', 5);

      expect(result).toEqual([]);
    });
  });

  describe('disconnect', () => {
    it('should disconnect the Prisma client', async () => {
      mockPrisma.$disconnect.mockResolvedValueOnce(undefined);

      await disconnect();

      expect(mockPrisma.$disconnect).toHaveBeenCalledOnce();
    });

    it('should propagate disconnect errors (no error handling in implementation)', async () => {
      mockPrisma.$disconnect.mockRejectedValueOnce(new Error('Disconnect failed'));

      // Implementation doesn't catch errors, so they propagate
      await expect(disconnect()).rejects.toThrow('Disconnect failed');
    });
  });
});
