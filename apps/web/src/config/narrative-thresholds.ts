/**
 * Narrative Generation Configuration
 *
 * Controls thresholds and behavior for auto-generated narratives in weekly recaps
 */

export const POSITIONAL_THRESHOLDS = {
  breakout: {
    minRankJump: 10, // How many spots = "massive breakout"?
    minPointsPct: 0.5, // 50% increase required
  },
  improvement: {
    minRankJump: 5,
    minPointsPct: 0.25, // 25% increase
  },
  collapse: {
    minRankDrop: 10,
    maxPointsPct: -0.3, // 30% decrease
  },
  dominance: {
    topRankThreshold: 3, // Top X teams
    minConsecutiveWeeks: 2, // Must be top 3 for at least 2 weeks
  },
  struggle: {
    bottomRankThreshold: 22, // Bottom X teams (out of 24)
    minConsecutiveWeeks: 2,
  },
  volatility: {
    minRankVariance: 25, // Variance threshold for "inconsistent"
  },
};

export const LUCK_THRESHOLDS = {
  veryLucky: 1.0, // Wins - expected wins > 1.0
  lucky: 0.5,
  neutral: [-0.5, 0.5] as [number, number],
  unlucky: -0.5,
  veryUnlucky: -1.0,

  scheduleEasy: 20, // Difficulty rank >= 20 (bottom 5)
  scheduleAverage: [8, 16] as [number, number],
  scheduleHard: 5, // Difficulty rank <= 5 (top 5)

  counterfactualThresholds: {
    dominantPercentile: 80, // Better than 80% = dominant
    averagePercentile: [40, 60] as [number, number],
    strugglingPercentile: 20,
  },
};

export const SCATTER_THRESHOLDS = {
  outlierZScore: 1.5, // |z| > 1.5 = outlier
  extremeOutlierZScore: 2.0, // |z| > 2.0 = extreme outlier

  quadrantLabels: {
    'upper-left': 'Dominant',
    'upper-right': 'High Variance',
    'lower-left': 'Low Variance',
    'lower-right': 'Struggling',
  },

  severityRules: {
    critical: (zX: number, zY: number) => Math.abs(zX) > 2.0 || Math.abs(zY) > 2.0,
    moderate: (zX: number, zY: number) => Math.abs(zX) > 1.5 || Math.abs(zY) > 1.5,
    minor: (zX: number, zY: number) => Math.abs(zX) > 1.0 || Math.abs(zY) > 1.0,
  },
};

export const TRANSACTION_THRESHOLDS = {
  grades: {
    'A+': { minScore: 15, narrative: 'elite' },
    A: { minScore: 10, narrative: 'excellent' },
    B: { minScore: 5, narrative: 'good' },
    C: { minScore: -5, maxScore: 5, narrative: 'average' },
    D: { maxScore: -5, narrative: 'poor' },
    F: { maxScore: -10, narrative: 'disastrous' },
  },

  notable: {
    minScoreForHighlight: 10, // Only show transactions with |score| > 10
    minOpponentHarm: 25, // Dropped player thriving = 25+ pts
    highFaabThreshold: 50, // $50+ = significant investment
    bargainFaabThreshold: 10, // <$10 = bargain
  },
};

export const START_SIT_THRESHOLDS = {
  badStart: {
    catastrophic: 20, // Left 20+ pts on bench
    significant: 15,
    minor: 10,
  },

  goodStart: {
    excellent: 15, // Started player 15+ pts better than alternatives
    good: 10,
  },

  badBench: {
    catastrophic: 20, // Benched player 20+ pts better than starter
    significant: 15,
    minor: 10,
  },

  positionWeights: {
    QB: 1.5, // QB mistakes matter most
    RB: 1.2,
    WR: 1.2,
    TE: 1.0,
    FLEX: 1.1,
    K: 0.5, // K mistakes matter least
    DEF: 0.8,
  },
};

export type NarrativeSeverity = 'minor' | 'moderate' | 'critical';

export const NARRATIVE_CONFIG = {
  // Which insights to highlight (you control verbosity)
  enabled: {
    positionalTrends: true,
    luckAnalysis: true,
    scatterOutliers: true,
    transactions: true,
    startSit: true,
  },

  // Minimum severity to include in report
  minSeverity: 'moderate' as NarrativeSeverity,

  // Maximum narratives per section (prevent report bloat)
  maxNarrativesPerSection: {
    positionalTrends: 10,
    luckAnalysis: 5,
    scatterOutliers: 8,
    transactions: 10,
    startSit: 8,
  },

  // Tone preferences
  tone: {
    harsh: true, // Allow harsh narratives for bad decisions?
    celebratory: true, // Allow celebratory narratives for great moves?
    sarcastic: false, // Enable sarcastic commentary?
  },
};
