/**
 * Narrative Generation Functions
 * 
 * Converts raw stats into contextual stories for weekly recaps
 */

import { 
  POSITIONAL_THRESHOLDS, 
  LUCK_THRESHOLDS, 
  SCATTER_THRESHOLDS,
  TRANSACTION_THRESHOLDS,
  START_SIT_THRESHOLDS,
  type NarrativeSeverity 
} from '../config/narrative-thresholds.js';

// ============================================================================
// TYPES
// ============================================================================

export interface PositionalTrendData {
  teamName: string;
  leagueName: string;
  position: string;
  currentWeek: {
    points: number;
    rank: number;
    leagueMedian: number;
  };
  previousWeeks: {
    avgPoints: number;
    avgRank: number;
    weekByWeek: Array<{ week: number; points: number; rank: number }>;
  };
}

export interface LuckData {
  teamName: string;
  leagueName: string;
  record: {
    wins: number;
    losses: number;
    expectedWins: number;
  };
  schedule: {
    strength: number;
    difficultyRank: number;
  };
  counterfactual: {
    teamsWithSameRecord: number;
    teamsWithBetter: number;
    teamsWithWorse: number;
  };
}

export interface ScatterOutlierData {
  teamName: string;
  leagueName: string;
  chartType: string;
  xValue: number;
  yValue: number;
  zX: number;
  zY: number;
  quadrant: 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right';
}

export interface TransactionData {
  type: string;
  teamName: string;
  leagueName: string;
  grade: string;
  score: number;
  faabCost: number;
  players: Array<{
    role: 'add' | 'drop';
    name: string;
    position: string;
    forYou?: {
      starts: number;
      points: number;
      weightedPoints: number;
    };
    afterDrop?: {
      oppHarm: number;
      oppHarmWeighted: number;
    };
  }>;
}

export interface StartSitData {
  teamName: string;
  leagueName: string;
  decision: 'start' | 'bench';
  playerName: string;
  position: string;
  playerPoints: number;
  alternativePoints: number;
  alternativeName: string;
  pointDifferential: number;
  weightedScore: number;
}

export interface Narrative {
  severity: NarrativeSeverity;
  type: string;
  narrative: string;
  data: any;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

// ============================================================================
// 1. POSITIONAL TRENDS
// ============================================================================

export function generatePositionalTrendNarrative(data: PositionalTrendData): Narrative | null {
  const rankChange = data.previousWeeks.avgRank - data.currentWeek.rank;
  const pointsChange = data.currentWeek.points - data.previousWeeks.avgPoints;
  const pointsChangePct = data.previousWeeks.avgPoints > 0 
    ? pointsChange / data.previousWeeks.avgPoints 
    : 0;
  
  // THRESHOLD 1: Massive Breakout
  if (rankChange >= POSITIONAL_THRESHOLDS.breakout.minRankJump && 
      pointsChangePct >= POSITIONAL_THRESHOLDS.breakout.minPointsPct) {
    return {
      severity: 'critical',
      type: 'breakout',
      narrative: `🔥 MASSIVE BREAKOUT: ${data.teamName} exploded at ${data.position}, jumping from ${data.previousWeeks.avgRank.toFixed(0)}th to ${data.currentWeek.rank}th. Their ${data.position} scoring surged ${(pointsChangePct * 100).toFixed(0)}% (${data.previousWeeks.avgPoints.toFixed(1)} → ${data.currentWeek.points.toFixed(1)} pts). This is a ${rankChange.toFixed(0)}-spot leap - one of the biggest weekly improvements in the league.`,
      data,
    };
  }
  
  // THRESHOLD 2: Notable Improvement
  if (rankChange >= POSITIONAL_THRESHOLDS.improvement.minRankJump && 
      pointsChangePct >= POSITIONAL_THRESHOLDS.improvement.minPointsPct) {
    return {
      severity: 'moderate',
      type: 'improvement',
      narrative: `📈 Strong improvement: ${data.teamName} climbed from ${data.previousWeeks.avgRank.toFixed(0)}th to ${data.currentWeek.rank}th in ${data.position} scoring (+${rankChange.toFixed(0)} spots), averaging ${data.currentWeek.points.toFixed(1)} pts vs their previous ${data.previousWeeks.avgPoints.toFixed(1)}.`,
      data,
    };
  }
  
  // THRESHOLD 3: Collapse
  if (rankChange <= -POSITIONAL_THRESHOLDS.collapse.minRankDrop && 
      pointsChangePct <= POSITIONAL_THRESHOLDS.collapse.maxPointsPct) {
    return {
      severity: 'critical',
      type: 'collapse',
      narrative: `💀 COLLAPSE: ${data.teamName} fell off a cliff at ${data.position}, dropping from ${data.previousWeeks.avgRank.toFixed(0)}th to ${data.currentWeek.rank}th. Their ${data.position} production cratered ${Math.abs(pointsChangePct * 100).toFixed(0)}% (${data.previousWeeks.avgPoints.toFixed(1)} → ${data.currentWeek.points.toFixed(1)} pts). This ${Math.abs(rankChange).toFixed(0)}-spot plunge is alarming.`,
      data,
    };
  }
  
  // THRESHOLD 4: Continued Dominance (Top 3)
  if (data.currentWeek.rank <= POSITIONAL_THRESHOLDS.dominance.topRankThreshold && 
      data.previousWeeks.avgRank <= POSITIONAL_THRESHOLDS.dominance.topRankThreshold) {
    const advantage = data.currentWeek.points - data.currentWeek.leagueMedian;
    return {
      severity: 'moderate',
      type: 'dominance',
      narrative: `👑 Sustained dominance: ${data.teamName} remains elite at ${data.position} (${data.currentWeek.rank}${data.currentWeek.rank === 1 ? 'st' : data.currentWeek.rank === 2 ? 'nd' : 'rd'}), scoring +${advantage.toFixed(1)} pts above league median. They've been top-3 consistently.`,
      data,
    };
  }
  
  // THRESHOLD 5: Continued Struggle (Bottom 3)
  if (data.currentWeek.rank >= POSITIONAL_THRESHOLDS.struggle.bottomRankThreshold && 
      data.previousWeeks.avgRank >= POSITIONAL_THRESHOLDS.struggle.bottomRankThreshold) {
    const deficit = data.currentWeek.leagueMedian - data.currentWeek.points;
    return {
      severity: 'moderate',
      type: 'struggle',
      narrative: `⚠️ Can't break through: ${data.teamName} stuck at the bottom of ${data.position} scoring (${data.currentWeek.rank}th), -${deficit.toFixed(1)} pts below league median. This has been a season-long weakness.`,
      data,
    };
  }
  
  // THRESHOLD 6: Inconsistent
  const rankVariance = calculateVariance(data.previousWeeks.weekByWeek.map(w => w.rank));
  if (rankVariance > POSITIONAL_THRESHOLDS.volatility.minRankVariance) {
    const ranks = data.previousWeeks.weekByWeek.map(w => w.rank).join(', ');
    return {
      severity: 'minor',
      type: 'volatility',
      narrative: `🎢 Volatile: ${data.teamName}'s ${data.position} production is all over the map (recent ranks: ${ranks}). Currently ${data.currentWeek.rank}th, but unpredictable week-to-week.`,
      data,
    };
  }
  
  return null;
}

// ============================================================================
// 2. LUCK ANALYSIS
// ============================================================================

export function generateLuckNarrative(data: LuckData): Narrative | null {
  const luckRating = data.record.wins - data.record.expectedWins;
  const scheduleEase = 25 - data.schedule.difficultyRank; // Higher = easier
  const totalTeams = data.counterfactual.teamsWithSameRecord + 
                     data.counterfactual.teamsWithBetter + 
                     data.counterfactual.teamsWithWorse;
  const percentile = totalTeams > 0 
    ? ((data.counterfactual.teamsWithWorse / totalTeams) * 100).toFixed(0)
    : 50;
  
  // SCENARIO 1: Lucky + Easy Schedule = Inflated Record
  if (luckRating > LUCK_THRESHOLDS.lucky && scheduleEase >= 18) {
    return {
      severity: 'moderate',
      type: 'lucky-easy',
      narrative: `🍀 ${data.teamName} sits at ${data.record.wins}-${data.record.losses}, but the story is more complex. Expected wins: ${data.record.expectedWins.toFixed(1)} (luck: +${luckRating.toFixed(1)}). They've faced the ${data.schedule.difficultyRank}${data.schedule.difficultyRank === 1 ? 'st' : data.schedule.difficultyRank === 2 ? 'nd' : data.schedule.difficultyRank === 3 ? 'rd' : 'th'} toughest schedule - meaning ${24 - data.schedule.difficultyRank} teams had it harder. Reality check: ${data.counterfactual.teamsWithBetter} teams would have a better record with these matchups, ${data.counterfactual.teamsWithWorse} would be worse. They're in the ${percentile}th percentile.`,
      data,
    };
  }
  
  // SCENARIO 2: Unlucky + Hard Schedule = Underrated
  if (luckRating < LUCK_THRESHOLDS.unlucky && scheduleEase <= 6) {
    return {
      severity: 'moderate',
      type: 'unlucky-hard',
      narrative: `😤 ${data.teamName} is better than their ${data.record.wins}-${data.record.losses} record suggests. Expected wins: ${data.record.expectedWins.toFixed(1)} (unlucky by ${Math.abs(luckRating).toFixed(1)} games). They've faced a brutal schedule (${data.schedule.difficultyRank}${data.schedule.difficultyRank === 1 ? 'st' : data.schedule.difficultyRank === 2 ? 'nd' : data.schedule.difficultyRank === 3 ? 'rd' : 'th'} toughest), and ${data.counterfactual.teamsWithWorse} teams would have worse records facing these same opponents.`,
      data,
    };
  }
  
  // SCENARIO 3: Lucky Despite Hard Schedule = Legitimately Good
  if (luckRating > LUCK_THRESHOLDS.lucky && scheduleEase <= 8) {
    return {
      severity: 'moderate',
      type: 'lucky-hard',
      narrative: `💪 ${data.teamName}'s ${data.record.wins}-${data.record.losses} record is legit. Yes, they're outperforming expected wins (${data.record.expectedWins.toFixed(1)}), but they've done it against the ${data.schedule.difficultyRank}${data.schedule.difficultyRank === 1 ? 'st' : data.schedule.difficultyRank === 2 ? 'nd' : data.schedule.difficultyRank === 3 ? 'rd' : 'th'} toughest schedule. Only ${data.counterfactual.teamsWithSameRecord} teams would match this record with these opponents.`,
      data,
    };
  }
  
  // SCENARIO 4: Unlucky + Easy Schedule = Genuinely Bad
  if (luckRating < LUCK_THRESHOLDS.unlucky && scheduleEase >= 18) {
    return {
      severity: 'moderate',
      type: 'unlucky-easy',
      narrative: `⚠️ ${data.teamName} can't blame luck for their ${data.record.wins}-${data.record.losses} record. Expected wins: ${data.record.expectedWins.toFixed(1)}, and they've had one of the easiest schedules (${data.schedule.difficultyRank}${data.schedule.difficultyRank === 1 ? 'st' : data.schedule.difficultyRank === 2 ? 'nd' : data.schedule.difficultyRank === 3 ? 'rd' : 'th'} toughest). ${data.counterfactual.teamsWithWorse} teams would be worse with these matchups. The schedule won't save them.`,
      data,
    };
  }
  
  // Only highlight extreme cases
  return null;
}

// ============================================================================
// 3. SCATTER OUTLIERS
// ============================================================================

export function generateScatterOutlierNarrative(data: ScatterOutlierData): Narrative | null {
  const isOutlier = Math.abs(data.zX) > SCATTER_THRESHOLDS.outlierZScore || 
                    Math.abs(data.zY) > SCATTER_THRESHOLDS.outlierZScore;
  
  if (!isOutlier) return null;
  
  const isCritical = SCATTER_THRESHOLDS.severityRules.critical(data.zX, data.zY);
  const isModerate = SCATTER_THRESHOLDS.severityRules.moderate(data.zX, data.zY);
  
  // UPPER-LEFT: Dominant (high scoring, low opponent scoring)
  if (data.quadrant === 'upper-left') {
    if (isCritical) {
      return {
        severity: 'critical',
        type: 'dominant',
        narrative: `🔥 ${data.teamName} is CRUSHING at ${data.chartType}: ${data.xValue.toFixed(1)} PPG (${data.zX.toFixed(1)}σ above median) while holding opponents to ${data.yValue.toFixed(1)} PPG (${Math.abs(data.zY).toFixed(1)}σ below median). This is statistical dominance.`,
        data,
      };
    } else if (isModerate) {
      return {
        severity: 'moderate',
        type: 'advantage',
        narrative: `💪 ${data.teamName} has a clear ${data.chartType} advantage: scoring ${data.xValue.toFixed(1)} PPG while opponents average ${data.yValue.toFixed(1)}. Above average in both dimensions.`,
        data,
      };
    }
  }
  
  // LOWER-RIGHT: Struggling (low scoring, high opponent scoring)
  if (data.quadrant === 'lower-right') {
    if (isCritical) {
      return {
        severity: 'critical',
        type: 'struggling',
        narrative: `💀 ${data.teamName} is getting destroyed at ${data.chartType}: only ${data.xValue.toFixed(1)} PPG (${Math.abs(data.zX).toFixed(1)}σ below median) while opponents average ${data.yValue.toFixed(1)} PPG (${data.zY.toFixed(1)}σ above median). This is a disaster.`,
        data,
      };
    } else if (isModerate) {
      return {
        severity: 'moderate',
        type: 'disadvantage',
        narrative: `⚠️ ${data.teamName} struggling at ${data.chartType}: scoring ${data.xValue.toFixed(1)} PPG while opponents average ${data.yValue.toFixed(1)}. Below average in both dimensions.`,
        data,
      };
    }
  }
  
  // UPPER-RIGHT: High variance (high scoring, high opponent scoring)
  if (data.quadrant === 'upper-right' && isModerate) {
    return {
      severity: 'minor',
      type: 'high-variance',
      narrative: `🎢 ${data.teamName} lives in shootouts at ${data.chartType}: scoring ${data.xValue.toFixed(1)} PPG but opponents match with ${data.yValue.toFixed(1)} PPG. Both well above median - games are decided elsewhere.`,
      data,
    };
  }
  
  // LOWER-LEFT: Low variance (low scoring, low opponent scoring)
  if (data.quadrant === 'lower-left' && isModerate) {
    return {
      severity: 'minor',
      type: 'low-variance',
      narrative: `😴 ${data.teamName} in low-scoring ${data.chartType} games: ${data.xValue.toFixed(1)} PPG, opponents at ${data.yValue.toFixed(1)} PPG. Both below median - tight, defensive battles.`,
      data,
    };
  }
  
  return null;
}

// ============================================================================
// 4. TRANSACTION ANALYSIS
// ============================================================================

export function generateTransactionNarrative(txn: TransactionData): Narrative | null {
  const addedPlayer = txn.players.find(p => p.role === 'add');
  const droppedPlayer = txn.players.find(p => p.role === 'drop');
  
  if (!addedPlayer) return null;
  
  // Only highlight transactions above threshold
  if (Math.abs(txn.score) < TRANSACTION_THRESHOLDS.notable.minScoreForHighlight) {
    return null;
  }
  
  // TRADE NARRATIVES
  if (txn.type === 'trade') {
    // CATASTROPHIC TRADE (F grade, large negative VORP)
    if (txn.grade === 'F' && txn.score < -15) {
      return {
        severity: 'critical',
        type: 'bad-trade',
        narrative: `💸 TRADE DISASTER: ${txn.teamName} traded ${droppedPlayer?.name || 'player'} for ${addedPlayer.name}. The damage: ${txn.score.toFixed(1)} VORP. ${addedPlayer.name} has been a bust (${addedPlayer.forYou?.points.toFixed(1) || 0} pts in ${addedPlayer.forYou?.starts || 0} starts), while ${droppedPlayer?.name || 'the other player'} is thriving elsewhere. Season-altering mistake.`,
        data: txn,
      };
    }
    
    // EXCELLENT TRADE (A+ grade, large positive VORP)
    if ((txn.grade === 'A+' || txn.grade === 'A') && txn.score > 15) {
      return {
        severity: 'critical',
        type: 'good-trade',
        narrative: `🏆 TRADE MASTERCLASS: ${txn.teamName} acquired ${addedPlayer.name}${droppedPlayer ? ` for ${droppedPlayer.name}` : ''}. The value: +${txn.score.toFixed(1)} VORP. ${addedPlayer.name} has delivered (${addedPlayer.forYou?.points.toFixed(1) || 0} pts in ${addedPlayer.forYou?.starts || 0} starts). ${txn.grade === 'A+' ? 'Highway robbery.' : 'Excellent move.'}`,
        data: txn,
      };
    }
  }
  
  // WAIVER/FREE AGENT NARRATIVES
  if (txn.type === 'waiver' || txn.type === 'free_agent') {
    // GENIUS PICKUP (A+ grade, high VORP)
    if ((txn.grade === 'A+' || txn.grade === 'A') && txn.score > 20) {
      return {
        severity: 'critical',
        type: 'great-pickup',
        narrative: `💎 WAIVER WIRE GOLD: ${txn.teamName} struck gold adding ${addedPlayer.name}. Score: +${txn.score.toFixed(1)} VORP. ${addedPlayer.name} has been a league-winner (${addedPlayer.forYou?.points.toFixed(1) || 0} pts in ${addedPlayer.forYou?.starts || 0} starts). One of the best pickups of the season.`,
        data: txn,
      };
    }
    
    // TERRIBLE DROP (F grade, player thriving elsewhere)
    if (txn.grade === 'F' && droppedPlayer && 
        (droppedPlayer.afterDrop?.oppHarm || 0) > TRANSACTION_THRESHOLDS.notable.minOpponentHarm) {
      return {
        severity: 'critical',
        type: 'bad-drop',
        narrative: `🤦 BAD DROP: ${txn.teamName} dropped ${droppedPlayer.name} to add ${addedPlayer.name}. ${droppedPlayer.name} has thrived elsewhere (${droppedPlayer.afterDrop?.oppHarm.toFixed(1) || 0} pts to opponent), while ${addedPlayer.name} hasn't delivered. Cost: ${txn.score.toFixed(1)} VORP.`,
        data: txn,
      };
    }
    
    // FAAB OVERPAY
    if (txn.faabCost > TRANSACTION_THRESHOLDS.notable.highFaabThreshold && txn.score < 5) {
      return {
        severity: 'moderate',
        type: 'faab-overpay',
        narrative: `💸 FAAB OVERPAY: ${txn.teamName} spent $${txn.faabCost} on ${addedPlayer.name}. Return: ${txn.score.toFixed(1)} VORP (${addedPlayer.forYou?.points.toFixed(1) || 0} pts in ${addedPlayer.forYou?.starts || 0} starts). Expensive for this production level.`,
        data: txn,
      };
    }
    
    // FAAB BARGAIN
    if (txn.faabCost > 0 && txn.faabCost < TRANSACTION_THRESHOLDS.notable.bargainFaabThreshold && txn.score > 15) {
      return {
        severity: 'moderate',
        type: 'faab-bargain',
        narrative: `💰 BARGAIN HUNTER: ${txn.teamName} spent just $${txn.faabCost} on ${addedPlayer.name}. Massive value: +${txn.score.toFixed(1)} VORP (${addedPlayer.forYou?.points.toFixed(1) || 0} pts in ${addedPlayer.forYou?.starts || 0} starts). Smart, low-cost move.`,
        data: txn,
      };
    }
  }
  
  return null;
}

// ============================================================================
// 5. START/SIT EFFICIENCY
// ============================================================================

export function generateStartSitNarrative(decision: StartSitData): Narrative | null {
  const pointsLost = Math.abs(decision.pointDifferential);
  
  // BAD START (started wrong player)
  if (decision.decision === 'start' && decision.pointDifferential < 0) {
    // CATASTROPHIC MISTAKE
    if (pointsLost > START_SIT_THRESHOLDS.badStart.catastrophic) {
      return {
        severity: 'critical',
        type: 'bad-start',
        narrative: `💀 BRUTAL START: ${decision.teamName} started ${decision.playerName} (${decision.playerPoints.toFixed(1)} pts) over ${decision.alternativeName} (${decision.alternativePoints.toFixed(1)} pts). Cost: ${pointsLost.toFixed(1)} pts. This decision likely cost them the week.`,
        data: decision,
      };
    }
    
    // SIGNIFICANT MISTAKE
    else if (pointsLost > START_SIT_THRESHOLDS.badStart.significant) {
      return {
        severity: 'moderate',
        type: 'bad-start',
        narrative: `⚠️ Wrong call: ${decision.teamName} started ${decision.playerName} (${decision.playerPoints.toFixed(1)} pts) when ${decision.alternativeName} was available with ${decision.alternativePoints.toFixed(1)} pts. Left ${pointsLost.toFixed(1)} pts on the table.`,
        data: decision,
      };
    }
  }
  
  // GOOD START (nailed it)
  if (decision.decision === 'start' && decision.pointDifferential > START_SIT_THRESHOLDS.goodStart.good) {
    if (decision.pointDifferential > START_SIT_THRESHOLDS.goodStart.excellent) {
      return {
        severity: 'moderate',
        type: 'good-start',
        narrative: `🎯 PERFECT START: ${decision.teamName} correctly started ${decision.playerName} (${decision.playerPoints.toFixed(1)} pts) over ${decision.alternativeName} (${decision.alternativePoints.toFixed(1)} pts). Gained ${decision.pointDifferential.toFixed(1)} pts from this decision.`,
        data: decision,
      };
    }
  }
  
  return null;
}

