// Draft Analytics Engine - Mock data structure matching specification
// This will be replaced with precomputed DB values after real drafts

/* eslint-disable @typescript-eslint/no-unused-vars, no-console */

import { MockDraft } from './draft-generator';

export interface PositionInflation {
  pos: string;
  avg_raw_A: number;
  avg_raw_B: number;
  share_A: number;
  share_B: number;
  delta_share: number;
  delta_avg_raw: number;
  z_score_A: number;
  z_score_B: number;
}

export interface PositionQuartile {
  label: string;
  range: string;
  avgPrice: number;
  count: number;
  minPrice: number;
  maxPrice: number;
}

export interface PositionQuartileBreakdown {
  position: string;
  league_A: PositionQuartile[];
  league_B: PositionQuartile[];
}

export interface MarketShapePoint {
  rank: number;
  cost: number;
  cumulative_share: number;
}

export interface MarketShape {
  league: string;
  data: MarketShapePoint[];
  gini_prices: number;
  top1_share: number;
  top3_share: number;
  top10_share: number;
}

export interface ReplacementCost {
  thresholds: {
    RB: number;
    WR: number;
    TE: number;
    FLEX: number;
  };
  prices: {
    [position: string]: {
      locked: number;
      effective: number;
    };
  };
}

export interface TierAssignment {
  player_id: string;
  tier: number;
}

export interface TierMethod {
  type: 'quantile' | 'kmeans';
  breaks?: number[];
  centroids?: number[];
  k?: number;
}

export interface TierShiftCount {
  from_tier: number;
  to_tier: number;
  count: number;
  players: string[];
}

export interface NominationEffect {
  method: string;
  beta_per_10_picks: number;
  r_naive: number;
  beta_naive_per_10: number;
  correlation: number;
}

export interface PlayerComparison {
  player_id: string;
  name: string;
  position: string;
  price_A: number;
  price_B: number;
  price_diff: number;
  abs_price_diff: number;
}

export interface NominationOrderAnalysis {
  overall_correlation: {
    league_A: number; // correlation coefficient between nomination order and price
    league_B: number;
    combined: number; // overall correlation across both leagues
  };
  position_effects: {
    position: string;
    league_A_correlation: number;
    league_B_correlation: number;
    avg_early_price: number; // avg price for picks 1-60
    avg_late_price: number; // avg price for picks 61+
    effect_strength: 'Strong' | 'Moderate' | 'Weak' | 'None';
  }[];
  notable_differences: {
    player_name: string;
    position: string;
    league_A_order: number;
    league_B_order: number;
    order_diff: number; // absolute difference
    league_A_price: number;
    league_B_price: number;
    price_diff: number;
    consistent_with_early_premium: boolean; // earlier nomination = higher price?
  }[];
}

export interface DraftAnalytics {
  league_A_name: string;
  league_B_name: string;

  // Position inflation/deflation
  position_inflation: PositionInflation[];

  // Position quartile breakdowns
  position_quartile_breakdowns: PositionQuartileBreakdown[];

  // Market shape and concentration
  market_shape: {
    league_A: MarketShape;
    league_B: MarketShape;
  };

  // Replacement costs
  replacement_costs: {
    league_A: ReplacementCost;
    league_B: ReplacementCost;
  };

  // Tier analysis
  tiers: {
    league_A: {
      assignments: TierAssignment[];
      method: TierMethod;
    };
    league_B: {
      assignments: TierAssignment[];
      method: TierMethod;
    };
    shifts: TierShiftCount[];
  };

  // Nomination effects
  nomination_effects: {
    league_A: NominationEffect;
    league_B: NominationEffect;
  };

  // Nomination order analysis
  nomination_order_analysis: NominationOrderAnalysis;

  // Consensus vs divergence
  consensus_players: PlayerComparison[]; // Top 10 same-price
  divergent_players: PlayerComparison[]; // Top 10 split-price

  // Cross-league correlation
  spearman_rank_correlation: number;
}

// Mock data generator - matches expected structure
export function generateMockAnalytics(draft1: MockDraft, draft2: MockDraft): DraftAnalytics {
  // Helper function to calculate position stats using quartile averages
  const getPositionStats = (draft: MockDraft, position: string) => {
    const picks = draft.teams.flatMap(t => t.picks).filter(p => p.player.position === position);
    const totalSpent = picks.reduce((sum, pick) => sum + pick.actualPrice, 0);

    // Calculate quartile-based average instead of simple average
    let avgPrice = 0;
    if (picks.length > 0) {
      // Sort picks by price (descending)
      const sortedPicks = [...picks].sort((a, b) => b.actualPrice - a.actualPrice);

      // Calculate quartiles
      const q1Index = Math.floor(sortedPicks.length * 0.25);
      const q2Index = Math.floor(sortedPicks.length * 0.5);
      const q3Index = Math.floor(sortedPicks.length * 0.75);

      const q1Avg =
        sortedPicks.slice(0, q1Index + 1).reduce((sum, pick) => sum + pick.actualPrice, 0) /
        (q1Index + 1);
      const q2Avg =
        sortedPicks
          .slice(q1Index + 1, q2Index + 1)
          .reduce((sum, pick) => sum + pick.actualPrice, 0) /
        (q2Index - q1Index);
      const q3Avg =
        sortedPicks
          .slice(q2Index + 1, q3Index + 1)
          .reduce((sum, pick) => sum + pick.actualPrice, 0) /
        (q3Index - q2Index);
      const q4Avg =
        sortedPicks.slice(q3Index + 1).reduce((sum, pick) => sum + pick.actualPrice, 0) /
        (sortedPicks.length - q3Index - 1);

      // Average the quartile averages (weighted equally)
      const validQuartiles = [q1Avg, q2Avg, q3Avg, q4Avg].filter(q => !isNaN(q) && q > 0);
      avgPrice =
        validQuartiles.length > 0
          ? validQuartiles.reduce((sum, q) => sum + q, 0) / validQuartiles.length
          : 0;

      // Debug logging for quartile calculations
      if (position === 'QB') {
        const simpleAverage = picks.reduce((sum, pick) => sum + pick.actualPrice, 0) / picks.length;
        console.log(`${position} Quartile Debug:`, {
          totalPicks: picks.length,
          q1Avg: Math.round(q1Avg * 100) / 100,
          q2Avg: Math.round(q2Avg * 100) / 100,
          q3Avg: Math.round(q3Avg * 100) / 100,
          q4Avg: Math.round(q4Avg * 100) / 100,
          quartileAverage: Math.round(avgPrice * 100) / 100,
          simpleAverage: Math.round(simpleAverage * 100) / 100,
          difference: Math.round((avgPrice - simpleAverage) * 100) / 100,
        });
      }
    }

    const totalDraftSpent = draft.teams.reduce((sum, team) => sum + team.totalSpent, 0);
    const share = totalSpent / totalDraftSpent;
    return { avgPrice, share, totalSpent, count: picks.length };
  };

  // Calculate position quartile breakdowns
  const getPositionQuartileBreakdown = (draft: MockDraft, position: string) => {
    const picks = draft.teams.flatMap(t => t.picks).filter(p => p.player.position === position);

    if (picks.length === 0) {
      return [];
    }

    // Sort picks by price (descending)
    const sortedPicks = [...picks].sort((a, b) => b.actualPrice - a.actualPrice);

    // Calculate quartile indices
    const q1Index = Math.floor(sortedPicks.length * 0.25);
    const q2Index = Math.floor(sortedPicks.length * 0.5);
    const q3Index = Math.floor(sortedPicks.length * 0.75);

    // Create quartile groups
    const quartiles = [
      {
        label: 'Top 25%',
        picks: sortedPicks.slice(0, q1Index + 1),
        range: '1st Quartile',
      },
      {
        label: '25-50%',
        picks: sortedPicks.slice(q1Index + 1, q2Index + 1),
        range: '2nd Quartile',
      },
      {
        label: '50-75%',
        picks: sortedPicks.slice(q2Index + 1, q3Index + 1),
        range: '3rd Quartile',
      },
      {
        label: 'Bottom 25%',
        picks: sortedPicks.slice(q3Index + 1),
        range: '4th Quartile',
      },
    ];

    // Calculate average price for each quartile
    return quartiles.map(quartile => ({
      label: quartile.label,
      range: quartile.range,
      avgPrice:
        quartile.picks.length > 0
          ? quartile.picks.reduce((sum, pick) => sum + pick.actualPrice, 0) / quartile.picks.length
          : 0,
      count: quartile.picks.length,
      minPrice:
        quartile.picks.length > 0 ? quartile.picks[quartile.picks.length - 1].actualPrice : 0,
      maxPrice: quartile.picks.length > 0 ? quartile.picks[0].actualPrice : 0,
    }));
  };

  // Calculate position inflation
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionInflation: PositionInflation[] = positions.map(pos => {
    const statsA = getPositionStats(draft1, pos);
    const statsB = getPositionStats(draft2, pos);

    return {
      pos,
      avg_raw_A: Math.round(statsA.avgPrice),
      avg_raw_B: Math.round(statsB.avgPrice),
      share_A: Math.round(statsA.share * 1000) / 1000,
      share_B: Math.round(statsB.share * 1000) / 1000,
      delta_share: Math.round((statsA.share - statsB.share) * 1000) / 1000,
      delta_avg_raw: Math.round(statsA.avgPrice - statsB.avgPrice),
      z_score_A: Math.round(((statsA.avgPrice - 15) / 8) * 100) / 100, // Mock z-scores
      z_score_B: Math.round(((statsB.avgPrice - 15) / 8) * 100) / 100,
    };
  });

  // Generate market shape data
  const generateMarketShape = (draft: MockDraft, leagueName: string): MarketShape => {
    const allPicks = draft.teams
      .flatMap(t => t.picks)
      .sort((a, b) => b.actualPrice - a.actualPrice);

    const totalSpent = allPicks.reduce((sum, pick) => sum + pick.actualPrice, 0);
    let cumulativeSpent = 0;

    const data: MarketShapePoint[] = allPicks.map((pick, index) => {
      cumulativeSpent += pick.actualPrice;
      return {
        rank: index + 1,
        cost: pick.actualPrice,
        cumulative_share: Math.round((cumulativeSpent / totalSpent) * 1000) / 1000,
      };
    });

    // Calculate concentration metrics
    const top1_share = allPicks[0]?.actualPrice / totalSpent || 0;
    const top3_share =
      allPicks.slice(0, 3).reduce((sum, pick) => sum + pick.actualPrice, 0) / totalSpent;
    const top10_share =
      allPicks.slice(0, 10).reduce((sum, pick) => sum + pick.actualPrice, 0) / totalSpent;

    // Simple Gini calculation
    const prices = allPicks.map(p => p.actualPrice).sort((a, b) => a - b);
    const n = prices.length;
    const sum = prices.reduce((a, b) => a + b, 0);
    let gini = 0;
    if (sum > 0) {
      gini = 1 - (2 / (n * sum)) * prices.reduce((acc, price, i) => acc + (n - i + 0.5) * price, 0);
    }

    return {
      league: leagueName,
      data,
      gini_prices: Math.round(gini * 1000) / 1000,
      top1_share: Math.round(top1_share * 1000) / 1000,
      top3_share: Math.round(top3_share * 1000) / 1000,
      top10_share: Math.round(top10_share * 1000) / 1000,
    };
  };

  // Generate replacement costs
  const generateReplacementCosts = (draft: MockDraft): ReplacementCost => {
    const getPositionPrices = (pos: string) =>
      draft.teams
        .flatMap(t => t.picks)
        .filter(p => p.player.position === pos)
        .map(p => p.actualPrice)
        .sort((a, b) => b - a);

    const rbPrices = getPositionPrices('RB');
    const wrPrices = getPositionPrices('WR');
    const tePrices = getPositionPrices('TE');

    return {
      thresholds: { RB: 24, WR: 36, TE: 12, FLEX: 12 },
      prices: {
        RB: { locked: rbPrices[23] || 5, effective: rbPrices[23] || 5 },
        WR: { locked: wrPrices[35] || 4, effective: wrPrices[35] || 4 },
        TE: { locked: tePrices[11] || 3, effective: tePrices[11] || 3 },
      },
    };
  };

  // Generate tier assignments (quantile-based)
  const generateTierAssignments = (
    draft: MockDraft
  ): { assignments: TierAssignment[]; method: TierMethod } => {
    const picks = draft.teams.flatMap(t => t.picks).sort((a, b) => b.actualPrice - a.actualPrice);
    const breaks = [0.1, 0.25, 0.55, 0.85, 1.0];

    const assignments: TierAssignment[] = picks.map((pick, index) => {
      const percentile = (index + 1) / picks.length;
      let tier = 5;
      for (let i = 0; i < breaks.length; i++) {
        if (percentile <= breaks[i]) {
          tier = i + 1;
          break;
        }
      }
      return {
        player_id: pick.playerId,
        tier,
      };
    });

    return {
      assignments,
      method: { type: 'quantile', breaks },
    };
  };

  // Generate cross-league player comparisons
  const generatePlayerComparisons = (draft1: MockDraft, draft2: MockDraft) => {
    const picks1 = draft1.teams.flatMap(t => t.picks);
    const picks2 = draft2.teams.flatMap(t => t.picks);

    const comparisons: PlayerComparison[] = [];

    picks1.forEach(pick1 => {
      const pick2 = picks2.find(p => p.playerId === pick1.playerId);
      if (pick2) {
        comparisons.push({
          player_id: pick1.playerId,
          name: pick1.player.name,
          position: pick1.player.position,
          price_A: pick1.actualPrice,
          price_B: pick2.actualPrice,
          price_diff: pick1.actualPrice - pick2.actualPrice,
          abs_price_diff: Math.abs(pick1.actualPrice - pick2.actualPrice),
        });
      }
    });

    return comparisons;
  };

  // Generate nomination order analysis
  const generateNominationOrderAnalysis = (
    draft1: MockDraft,
    draft2: MockDraft
  ): NominationOrderAnalysis => {
    // Helper function to calculate correlation coefficient
    const calculateCorrelation = (x: number[], y: number[]): number => {
      const n = x.length;
      if (n === 0) return 0;

      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

      return denominator === 0 ? 0 : numerator / denominator;
    };

    // Get draft order for each pick (assuming picks are in order)
    const picks1 = draft1.teams
      .flatMap(t => t.picks)
      .map((pick, index) => ({ ...pick, draftOrder: index + 1 }));
    const picks2 = draft2.teams
      .flatMap(t => t.picks)
      .map((pick, index) => ({ ...pick, draftOrder: index + 1 }));

    // Calculate overall correlations
    const orders1 = picks1.map(p => p.draftOrder);
    const prices1 = picks1.map(p => p.actualPrice);
    const orders2 = picks2.map(p => p.draftOrder);
    const prices2 = picks2.map(p => p.actualPrice);

    const leagueACorr = calculateCorrelation(orders1, prices1);
    const leagueBCorr = calculateCorrelation(orders2, prices2);

    // Combined correlation
    const allOrders = [...orders1, ...orders2];
    const allPrices = [...prices1, ...prices2];
    const combinedCorr = calculateCorrelation(allOrders, allPrices);

    // Position-specific analysis
    const positionEffects = positions.map(position => {
      const pos1Picks = picks1.filter(p => p.player.position === position);
      const pos2Picks = picks2.filter(p => p.player.position === position);

      const pos1Orders = pos1Picks.map(p => p.draftOrder);
      const pos1Prices = pos1Picks.map(p => p.actualPrice);
      const pos2Orders = pos2Picks.map(p => p.draftOrder);
      const pos2Prices = pos2Picks.map(p => p.actualPrice);

      const pos1Corr = calculateCorrelation(pos1Orders, pos1Prices);
      const pos2Corr = calculateCorrelation(pos2Orders, pos2Prices);

      // Calculate early vs late average prices (split at pick 60 for 12-team draft)
      const allPosPicks = [...pos1Picks, ...pos2Picks];
      const earlyPicks = allPosPicks.filter(p => p.draftOrder <= 60);
      const latePicks = allPosPicks.filter(p => p.draftOrder > 60);

      const avgEarlyPrice =
        earlyPicks.length > 0
          ? earlyPicks.reduce((sum, p) => sum + p.actualPrice, 0) / earlyPicks.length
          : 0;
      const avgLatePrice =
        latePicks.length > 0
          ? latePicks.reduce((sum, p) => sum + p.actualPrice, 0) / latePicks.length
          : 0;

      // Determine effect strength based on correlation magnitude
      const avgCorr = Math.abs((pos1Corr + pos2Corr) / 2);
      let effectStrength: 'Strong' | 'Moderate' | 'Weak' | 'None';
      if (avgCorr >= 0.5) effectStrength = 'Strong';
      else if (avgCorr >= 0.3) effectStrength = 'Moderate';
      else if (avgCorr >= 0.15) effectStrength = 'Weak';
      else effectStrength = 'None';

      return {
        position,
        league_A_correlation: Math.round(pos1Corr * 1000) / 1000,
        league_B_correlation: Math.round(pos2Corr * 1000) / 1000,
        avg_early_price: Math.round(avgEarlyPrice),
        avg_late_price: Math.round(avgLatePrice),
        effect_strength: effectStrength,
      };
    });

    // Find notable nomination order differences
    const notableDifferences: any[] = [];
    picks1.forEach(pick1 => {
      const pick2 = picks2.find(p => p.playerId === pick1.playerId);
      if (pick2) {
        const orderDiff = Math.abs(pick1.draftOrder - pick2.draftOrder);
        if (orderDiff >= 20) {
          // Only show differences of 20+ picks
          const earlierPick = pick1.draftOrder < pick2.draftOrder ? pick1 : pick2;
          const laterPick = pick1.draftOrder < pick2.draftOrder ? pick2 : pick1;
          const consistentWithPremium = earlierPick.actualPrice > laterPick.actualPrice;

          notableDifferences.push({
            player_name: pick1.player.name,
            position: pick1.player.position,
            league_A_order: pick1.draftOrder,
            league_B_order: pick2.draftOrder,
            order_diff: orderDiff,
            league_A_price: pick1.actualPrice,
            league_B_price: pick2.actualPrice,
            price_diff: pick1.actualPrice - pick2.actualPrice,
            consistent_with_early_premium: consistentWithPremium,
          });
        }
      }
    });

    // Sort by order difference descending
    notableDifferences.sort((a, b) => b.order_diff - a.order_diff);

    return {
      overall_correlation: {
        league_A: Math.round(leagueACorr * 1000) / 1000,
        league_B: Math.round(leagueBCorr * 1000) / 1000,
        combined: Math.round(combinedCorr * 1000) / 1000,
      },
      position_effects: positionEffects,
      notable_differences: notableDifferences.slice(0, 10), // Top 10 most notable
    };
  };

  // Generate position quartile breakdowns
  const positionQuartileBreakdowns = positions.map(pos => ({
    position: pos,
    league_A: getPositionQuartileBreakdown(draft1, pos),
    league_B: getPositionQuartileBreakdown(draft2, pos),
  }));

  // Generate mock data
  const tiersA = generateTierAssignments(draft1);
  const tiersB = generateTierAssignments(draft2);
  const playerComparisons = generatePlayerComparisons(draft1, draft2);
  const nominationOrderAnalysis = generateNominationOrderAnalysis(draft1, draft2);

  // Generate tier shifts
  const tierShifts: TierShiftCount[] = [];
  for (let from = 1; from <= 5; from++) {
    for (let to = 1; to <= 5; to++) {
      if (from !== to) {
        const players = tiersA.assignments
          .filter(a => a.tier === from)
          .filter(a => {
            const tierB = tiersB.assignments.find(b => b.player_id === a.player_id);
            return tierB?.tier === to;
          })
          .map(a => a.player_id);

        if (players.length > 0) {
          tierShifts.push({
            from_tier: from,
            to_tier: to,
            count: players.length,
            players,
          });
        }
      }
    }
  }

  return {
    league_A_name: draft1.name,
    league_B_name: draft2.name,
    position_inflation: positionInflation,
    position_quartile_breakdowns: positionQuartileBreakdowns,
    market_shape: {
      league_A: generateMarketShape(draft1, draft1.name),
      league_B: generateMarketShape(draft2, draft2.name),
    },
    replacement_costs: {
      league_A: generateReplacementCosts(draft1),
      league_B: generateReplacementCosts(draft2),
    },
    tiers: {
      league_A: tiersA,
      league_B: tiersB,
      shifts: tierShifts,
    },
    nomination_effects: {
      league_A: {
        method: 'within_pos_residual_OLS',
        beta_per_10_picks: -2.1,
        r_naive: -0.18,
        beta_naive_per_10: -2.8,
        correlation: -0.18,
      },
      league_B: {
        method: 'within_pos_residual_OLS',
        beta_per_10_picks: -3.2,
        r_naive: -0.24,
        beta_naive_per_10: -3.7,
        correlation: -0.24,
      },
    },
    nomination_order_analysis: nominationOrderAnalysis,
    consensus_players: playerComparisons
      .sort((a, b) => a.abs_price_diff - b.abs_price_diff)
      .slice(0, 10),
    divergent_players: playerComparisons
      .sort((a, b) => b.abs_price_diff - a.abs_price_diff)
      .slice(0, 10),
    spearman_rank_correlation: 0.76,
  };
}
