// Auto-generated variance data interfaces
export interface PositionVarianceRecord {
  id: string;
  position: string;
  season: string;
  sampleSize: number;
  meanError: number;
  stdDev: number;
  lastUpdated: string;
  createdAt: string;
}

export interface PlayerVarianceRecord {
  id: string;
  playerId: string;
  season: string;
  sampleSize: number;
  meanError: number;
  stdDev: number;
  lastUpdated: string;
  createdAt: string;
}

export interface ProjectionErrorRecord {
  id: string;
  playerId: string;
  week: number;
  season: string;
  projectedPoints: number;
  actualPoints: number;
  normalizedError: number;
  createdAt: string;
}

export interface VarianceData {
  exportedAt: string;
  positionVariance: PositionVarianceRecord[];
  playerVariance: PlayerVarianceRecord[];
  projectionErrors: ProjectionErrorRecord[];
}
