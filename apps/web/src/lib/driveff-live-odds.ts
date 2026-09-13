const DEFAULT_DRIVEFF_API_BASE_URL = 'https://driveff.com';

export interface DriveFFLiveOddsSample {
  timestamp: string;
  gameProgress: number;
  winProbA: number;
  winProbB: number;
  projectedFinalA: number;
  projectedFinalB: number;
  currentScoreA: number;
  currentScoreB: number;
  spread: number;
  total: number;
  rosterAId: string;
  rosterBId: string;
}

export interface DriveFFPlayerDistribution {
  rosterId: string;
  playerId: string;
  position: string;
  currentScore: number;
  providerProjection: number;
  remainingProjection: number;
  gameProgress: number;
  mean: number;
  standardDeviation: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface DriveFFLiveOddsFeed {
  schemaVersion: 1;
  provider: 'sleeper';
  leagueId: string;
  week: number;
  matchupId: string;
  samples: DriveFFLiveOddsSample[];
  latest: null | {
    timestamp: string;
    matchup: DriveFFLiveOddsSample;
    engineVersion: string;
    iterations: number;
    playerDistributions: DriveFFPlayerDistribution[];
  };
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const validateFeed = (value: unknown): value is DriveFFLiveOddsFeed => {
  if (!value || typeof value !== 'object') return false;
  const feed = value as Partial<DriveFFLiveOddsFeed>;
  if (feed.schemaVersion !== 1 || feed.provider !== 'sleeper' || !Array.isArray(feed.samples)) {
    return false;
  }

  return feed.samples.every(
    sample =>
      typeof sample?.timestamp === 'string' &&
      typeof sample?.rosterAId === 'string' &&
      typeof sample?.rosterBId === 'string' &&
      isFiniteNumber(sample?.winProbA) &&
      isFiniteNumber(sample?.winProbB),
  );
};

export const getDriveFFLiveOdds = async (
  leagueId: string,
  week: number,
  matchupId: number,
): Promise<DriveFFLiveOddsFeed> => {
  const baseUrl = (process.env.DRIVEFF_API_BASE_URL || DEFAULT_DRIVEFF_API_BASE_URL).replace(
    /\/$/,
    '',
  );
  const url = `${baseUrl}/api/v1/live-odds/${encodeURIComponent(leagueId)}/${week}/${matchupId}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`driveFF live-odds API returned ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!validateFeed(payload)) {
      throw new Error('driveFF live-odds API returned an invalid payload');
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

export const toAmericanMoneyline = (probability: number): number => {
  const boundedProbability = Math.min(0.9999, Math.max(0.0001, probability));
  return boundedProbability > 0.5
    ? -Math.round((boundedProbability / (1 - boundedProbability)) * 100)
    : Math.round(((1 - boundedProbability) / boundedProbability) * 100);
};

export const getTeamScoreDistribution = (
  projectedFinal: number,
  players: DriveFFPlayerDistribution[],
) => {
  const standardDeviation = Math.sqrt(
    players.reduce((sum, player) => sum + player.standardDeviation ** 2, 0),
  );
  const p10Offset = 1.2815515655446004 * standardDeviation;

  return {
    mean: projectedFinal,
    median: projectedFinal,
    p10: Math.max(0, projectedFinal - p10Offset),
    p90: projectedFinal + p10Offset,
  };
};
