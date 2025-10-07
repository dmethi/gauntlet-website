/**
 * Start/Sit efficiency analysis types
 * Types for lineup decision quality and efficiency metrics
 */

/**
 * Position-level breakdown of start/sit decisions
 */
export interface PositionBreakdown {
  decisionRate: number;
  efficiencyRate: number;
  decisionsCount: number;
  weight: number;
  pointsLost: number;
  pointsLostVsMedian: number;
}

/**
 * Context about a manager's roster for a specific week
 */
export interface RosterContext {
  managerId: string;
  managerName: string;
  leagueId: string;
  week: number;
  startingLineup: Array<{
    position: string;
    player: any; // TODO: Replace with proper Player type from @gauntlet/types
    pointsScored: number;
  }>;
  benchPlayers: any[]; // TODO: Replace with proper Player type
  waiverAlternatives: any[]; // TODO: Replace with proper Player type
  decisions: any[];
}

/**
 * Aggregated efficiency metrics for a manager
 */
export interface ManagerEfficiency {
  managerId: string;
  managerName: string;
  leagueId: string;
  decisions: any[];
  overallDecisionRate: number;
  overallEfficiencyRate: number;
  weightedDecisionScore: number;
  pointsImpactScore: number;
  positionBreakdown: Record<string, PositionBreakdown>;
}

/**
 * Detailed decision information for a specific lineup choice
 */
export interface DecisionDetail {
  managerId: string;
  managerName: string;
  leagueId: string;
  week: number;
  position: string;
  selectedPlayer: {
    playerId: string;
    projectedPoints: number;
    actualPoints: number;
  };
  alternatives: Array<{
    playerId: string;
    projectedPoints: number;
    actualPoints: number;
    adjustedActualPoints: number;
    source: 'bench' | 'waiver';
  }>;
  optimalPlayer: any;
  pointsLeft: number;
  weight: number;
  // For risky decisions
  isRiskyDecision?: boolean;
  projectionDifferential?: number;
  actualOutcome?: number;
}

/**
 * Complete start/sit analysis data
 */
export interface StartSitData {
  configuration?: {
    projectionThreshold: number;
    waiverDiscount: number;
    weeks: number[];
    season: string;
    weightedScoring: boolean;
  };
  managerEfficiencies: ManagerEfficiency[];
  worstDecisions: DecisionDetail[];
  bestRiskyDecisions: DecisionDetail[];
  rosterContext?: RosterContext[];
  leagueStats: {
    totalDecisions: number;
    avgWeightedScore: number;
    avgPointsImpact: number;
  };
  timestamp: string;
}

/**
 * Alternative source type for player alternatives
 */
export type AlternativeSource = 'bench' | 'waiver';

/**
 * Player projection data with actual performance
 */
export interface PlayerProjection {
  playerId: string;
  projectedPoints: number;
  actualPoints: number;
  rawProjection: any;
  rawStats: any;
}

/**
 * Alternative player with adjusted scoring
 */
export interface AlternativePlayer extends PlayerProjection {
  source: AlternativeSource;
  adjustedActualPoints: number;
}

/**
 * Detailed position-level decision analysis
 */
export interface PositionDecision {
  managerId: string;
  managerName: string;
  leagueId: string;
  week: number;
  position: string;
  selectedPlayer: PlayerProjection;
  alternatives: AlternativePlayer[];
  optimalPlayer:
    | AlternativePlayer
    | (PlayerProjection & { source: 'selected'; adjustedActualPoints: number });
  decisionCorrect: boolean;
  pointsLeft: number;
  efficiencyRate: number;
  isRiskyDecision: boolean;
  riskyAlternatives: AlternativePlayer[];
  projectionDifferential: number;
  actualOutcome: number;
}

/**
 * Position-level breakdown metrics (analysis version)
 */
export interface PositionBreakdownMetrics {
  decisionRate: number;
  efficiencyRate: number;
  decisionsCount: number;
  weight: number;
  pointsLost: number;
  pointsLostVsMedian: number;
}

/**
 * Manager efficiency with detailed decision tracking (analysis version)
 */
export interface ManagerEfficiencyDetailed {
  managerId: string;
  managerName: string;
  leagueId: string;
  decisions: PositionDecision[];
  overallDecisionRate: number;
  overallEfficiencyRate: number;
  weightedDecisionScore: number;
  pointsImpactScore: number;
  positionBreakdown: Record<string, PositionBreakdownMetrics>;
}

/**
 * Complete start/sit analysis data with configuration (analysis version)
 */
export interface StartSitDataDetailed {
  configuration: {
    projectionThreshold: number;
    waiverDiscount: number;
    weeks: number[];
    season: string;
    weightedScoring: boolean;
  };
  managerEfficiencies: ManagerEfficiencyDetailed[];
  worstDecisions: Array<PositionDecision & { weight: number }>;
  bestRiskyDecisions: Array<PositionDecision & { weight: number }>;
  rosterContext: any[];
  leagueStats: {
    totalDecisions: number;
    avgWeightedScore: number;
    avgPointsImpact: number;
  };
  timestamp: string;
}
