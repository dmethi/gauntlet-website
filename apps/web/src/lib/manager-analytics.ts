// Manager Behavior Analytics Engine
// Comprehensive team-by-team breakdown analysis

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, prefer-const, no-console */

import { MockDraft } from './draft-generator';
import type {
  ManagerSpendShares,
  ManagerConcentration,
  ManagerPacing,
  ManagerTwin,
  PlayerOverlap,
  PlayerOverlapAnalytics,
  PlayerAnalysis,
  DraftPickRow,
  PlayerLevelAnalytics,
  ManagerCluster,
  ManagerOutlierFlags,
  ManagerProfile,
  ManagerAnalytics,
} from '@/features/draft-analysis/types';
import {
  inferStarters,
  calculateGini,
  cosineSimilarity,
  kMeansCluster,
  calculatePlayerOverlap,
  calculatePlayerLevelAnalytics,
} from '@/features/draft-analysis/utils';

// Re-export types for backwards compatibility
export type {
  ManagerSpendShares,
  ManagerConcentration,
  ManagerPacing,
  ManagerTwin,
  PlayerOverlap,
  PlayerOverlapAnalytics,
  PlayerAnalysis,
  DraftPickRow,
  PlayerLevelAnalytics,
  ManagerCluster,
  ManagerOutlierFlags,
  ManagerProfile,
  ManagerAnalytics,
};

// Re-export utility functions for backwards compatibility
export { inferStarters, calculateGini, cosineSimilarity, kMeansCluster };

// Generate comprehensive manager analytics
export function generateManagerAnalytics(draft1: MockDraft, draft2: MockDraft): ManagerAnalytics {
  const profiles: ManagerProfile[] = [];

  // Process both leagues
  [draft1, draft2].forEach((draft, leagueIndex) => {
    const leagueName = leagueIndex === 0 ? draft.name : draft.name;

    draft.teams.forEach((team, teamIndex) => {
      const teamPicks = team.picks.map((pick, pickIndex) => ({
        ...pick,
        nomination_index: pickIndex + 1,
      }));

      const teamTotal = team.totalSpent;
      const { starters, bench } = inferStarters(teamPicks);

      // Calculate spend shares
      const positionSpend = { QB: 0, RB: 0, WR: 0, TE: 0, DEF: 0 };
      teamPicks.forEach(pick => {
        positionSpend[pick.player.position] += pick.actualPrice;
      });

      const starterSpend = starters.reduce((sum, pick) => sum + pick.actualPrice, 0);
      const benchSpend = bench.reduce((sum, pick) => sum + pick.actualPrice, 0);

      const spend_shares: ManagerSpendShares = {
        pctQB: positionSpend.QB / teamTotal,
        pctRB: positionSpend.RB / teamTotal,
        pctWR: positionSpend.WR / teamTotal,
        pctTE: positionSpend.TE / teamTotal,
        pctDEF: positionSpend.DEF / teamTotal,
        pctStarters: starterSpend / teamTotal,
        pctBench: benchSpend / teamTotal,
      };

      // Calculate concentration
      const prices = teamPicks.map(pick => pick.actualPrice).sort((a, b) => b - a);
      const top1_share = prices[0] / teamTotal;
      const top2_share = prices.slice(0, 2).reduce((sum, price) => sum + price, 0) / teamTotal;
      const top3_share = prices.slice(0, 3).reduce((sum, price) => sum + price, 0) / teamTotal;
      const top4_share = prices.slice(0, 4).reduce((sum, price) => sum + price, 0) / teamTotal;
      const top5_share = prices.slice(0, 5).reduce((sum, price) => sum + price, 0) / teamTotal;
      const giniSpend = calculateGini(prices);

      const concentration: ManagerConcentration = {
        top1_share,
        top2_share,
        top3_share,
        top4_share,
        top5_share,
        giniSpend,
      };

      // Calculate pacing/patience
      const totalPicks = teamPicks.length;
      const quartileSize = Math.ceil(totalPicks / 4);

      let patienceQ = [0, 0, 0, 0];
      teamPicks.forEach((pick, index) => {
        const quartile = Math.floor(index / quartileSize);
        if (quartile < 4) {
          patienceQ[quartile] += pick.actualPrice / teamTotal;
        }
      });

      const patience_score = 1 - (patienceQ[0] + patienceQ[1]);
      const time_to_first_30 = teamPicks.findIndex(pick => pick.actualPrice >= 30) + 1 || null;
      const last_starter_index = Math.max(
        ...starters.map(pick => teamPicks.findIndex(p => p === pick) + 1),
      );

      const avg_starter_nom_index =
        starters.reduce((sum, starter) => sum + (teamPicks.findIndex(p => p === starter) + 1), 0) /
        starters.length;
      const avg_bench_nom_index =
        bench.length > 0
          ? bench.reduce(
              (sum, benchPlayer) => sum + (teamPicks.findIndex(p => p === benchPlayer) + 1),
              0,
            ) / bench.length
          : 0;

      const pacing: ManagerPacing = {
        patienceQ1: patienceQ[0],
        patienceQ2: patienceQ[1],
        patienceQ3: patienceQ[2],
        patienceQ4: patienceQ[3],
        patience_score,
        time_to_first_30,
        last_starter_index,
        avg_starter_nom_index,
        avg_bench_nom_index,
      };

      // Within-position concentration features (distinguish 60/20 vs 40/40 builds)
      const posShares = (pos: 'RB' | 'WR') => {
        const posPicks = teamPicks.filter(p => p.player.position === pos);
        const total = posPicks.reduce((s, p) => s + (p.actualPrice || 0), 0);
        if (total <= 0) return { top1Share: 0, anchorRatio: 0 };
        const sorted = posPicks.map(p => p.actualPrice || 0).sort((a, b) => b - a);
        const top1 = sorted[0] || 0;
        const top2 = sorted[1] || 0;
        const anchorRatio = top1 && top1 + top2 ? top1 / (top1 + top2) : top1 > 0 ? 1 : 0;
        return { top1Share: top1 / total, anchorRatio };
      };

      const rbConc = posShares('RB');
      const wrConc = posShares('WR');

      // Create feature vector for clustering (blend stars/scrubs + positional allocation)
      const feature_vector = [
        // Positional allocation
        spend_shares.pctQB,
        spend_shares.pctRB,
        spend_shares.pctWR,
        spend_shares.pctTE,
        spend_shares.pctDEF,
        // Stars & Scrubs
        concentration.giniSpend,
        concentration.top1_share,
        concentration.top2_share,
        concentration.top3_share,
        // Within-position concentration (RB/WR)
        rbConc.top1Share,
        rbConc.anchorRatio,
        wrConc.top1Share,
        wrConc.anchorRatio,
      ];

      // Ensure manager name is always populated; fallback to team.teamName
      const teamNames = team as unknown as { name?: string; teamName?: string };
      const managerDisplay = teamNames.name ?? teamNames.teamName ?? 'Unknown Manager';
      profiles.push({
        manager: managerDisplay,
        league: leagueName,
        team_total: teamTotal,
        spend_shares,
        concentration,
        pacing,
        feature_vector,
        cluster: { cluster_label: '', cluster_id: 0, description: '' }, // Will be filled later
        twins: [], // Will be filled later
        outlier_flags: {
          extreme_top1: false,
          ultra_patient: false,
          speed_drafter: false,
          bench_heavy: false,
          position_hero: null,
        },
      });
    });
  });

  // Standardize feature vectors
  const featureMatrix = profiles.map(p => p.feature_vector);
  const means = featureMatrix[0].map(
    (_, colIndex) =>
      featureMatrix.reduce((sum, row) => sum + row[colIndex], 0) / featureMatrix.length,
  );
  const stds = featureMatrix[0].map((_, colIndex) => {
    const mean = means[colIndex];
    const variance =
      featureMatrix.reduce((sum, row) => sum + Math.pow(row[colIndex] - mean, 2), 0) /
      featureMatrix.length;
    return Math.sqrt(variance);
  });

  profiles.forEach(profile => {
    profile.feature_vector = profile.feature_vector.map((val, index) =>
      stds[index] > 0 ? (val - means[index]) / stds[index] : 0,
    );
  });

  // Perform clustering
  const standardizedFeatures = profiles.map(p => p.feature_vector);
  const { clusters } = kMeansCluster(standardizedFeatures, 4);

  // Assign clusters with improved interpretive labels
  const clusterProfiles = new Map<number, ManagerProfile[]>();
  profiles.forEach((profile, index) => {
    const clusterId = clusters[index];
    if (!clusterProfiles.has(clusterId)) {
      clusterProfiles.set(clusterId, []);
    }
    clusterProfiles.get(clusterId)!.push(profile);
  });

  // Analyze cluster characteristics for better labeling
  profiles.forEach((profile, index) => {
    const clusterId = clusters[index];
    const clusterMembers = clusterProfiles.get(clusterId) || [];

    // Calculate cluster averages for comparison
    const avgGini =
      clusterMembers.reduce((sum, p) => sum + p.concentration.giniSpend, 0) / clusterMembers.length;
    const avgTop1 =
      clusterMembers.reduce((sum, p) => sum + p.concentration.top1_share, 0) /
      clusterMembers.length;
    const avgPatienceQ4 =
      clusterMembers.reduce((sum, p) => sum + p.pacing.patienceQ4, 0) / clusterMembers.length;
    const avgRBPct =
      clusterMembers.reduce((sum, p) => sum + p.spend_shares.pctRB, 0) / clusterMembers.length;
    const avgWRPct =
      clusterMembers.reduce((sum, p) => sum + p.spend_shares.pctWR, 0) / clusterMembers.length;
    const avgQBPct =
      clusterMembers.reduce((sum, p) => sum + p.spend_shares.pctQB, 0) / clusterMembers.length;

    // More nuanced labeling based on individual + cluster characteristics
    let label = '';
    let description = '';

    // Stars & Scrubs - high concentration
    if (profile.concentration.top1_share > 0.3 && profile.concentration.giniSpend > 0.35) {
      label = 'Stars & Scrubs';
      description = 'High concentration on elite players with bargain depth';
    }
    // Balanced - low concentration
    else if (profile.concentration.giniSpend < 0.25 && profile.concentration.top1_share < 0.25) {
      label = 'Balanced Build';
      description = 'Even distribution of spending across all roster positions';
    }
    // Patience Snipers - late draft heavy spending
    else if (profile.pacing.patienceQ4 > 0.12 && profile.pacing.patienceQ1 < 0.45) {
      label = 'Patience Sniper';
      description = 'Waited for value opportunities late in the draft';
    }
    // QB Heavy - unusual QB investment
    else if (profile.spend_shares.pctQB > 0.08 && avgQBPct > 0.06) {
      label = 'Premium QB';
      description = 'Invested heavily in quarterback position';
    }
    // Hero RB - but be more specific about cluster context
    else if (profile.spend_shares.pctRB > 0.32 && avgRBPct > 0.3) {
      if (clusterMembers.length > 5) {
        label = 'Ground & Pound';
        description = 'Running back heavy strategy with depth';
      } else {
        label = 'Hero RB';
        description = 'Elite running back as foundation of roster';
      }
    }
    // WR Heavy
    else if (profile.spend_shares.pctWR > 0.4 && avgWRPct > 0.38) {
      if (profile.concentration.giniSpend > 0.35) {
        label = 'WR Elite';
        description = 'Star wide receiver with supporting cast';
      } else {
        label = 'Receiver Corps';
        description = 'Deep investment across wide receiver position';
      }
    }
    // TE Heavy - rare but possible
    else if (profile.spend_shares.pctTE > 0.15) {
      label = 'TE Premium';
      description = 'Significant investment in tight end position';
    }
    // Early Birds - front-loaded spending
    else if (profile.pacing.patienceQ1 > 0.5) {
      label = 'Early Bird';
      description = 'Aggressive early draft spending strategy';
    }
    // Bench Heavy
    else if (profile.spend_shares.pctBench > 0.25) {
      label = 'Depth Builder';
      description = 'Significant investment in bench depth';
    }
    // Default for mixed strategies
    else {
      // Use cluster ID to create more unique labels
      const clusterLabels = [
        'Strategic Mix',
        'Value Hunter',
        'Tactical Build',
        'Flexible Draft',
        'Opportunistic',
      ];
      label = clusterLabels[clusterId % clusterLabels.length] || 'Tactical Build';
      description = 'Balanced approach with mixed strategic tendencies';
    }

    // Explanatory tags for UI badges
    const tags: string[] = [];
    if (label === 'Stars & Scrubs')
      tags.push('High top-1 spend', `Gini ${profile.concentration.giniSpend.toFixed(2)}`);
    if (label === 'Ground & Pound') tags.push('RB-heavy', 'Dual anchors');
    if (label === 'Hero RB') tags.push('RB anchor', 'Top1 >> Top2');
    if (label === 'WR Elite') tags.push('WR-heavy');
    if (label === 'Premium QB') tags.push('QB spend 10%+');
    if (label === 'Balanced Build') tags.push('Even spend distribution');
    if (label === 'Patience Sniper') tags.push('Late spend');

    profile.cluster = {
      cluster_id: clusterId,
      cluster_label: label,
      description,
      tags,
    };
  });

  // Calculate cross-league twins
  const leagueAProfiles = profiles.filter(p => p.league === draft1.name);
  const leagueBProfiles = profiles.filter(p => p.league === draft2.name);

  leagueAProfiles.forEach(profileA => {
    const similarities = leagueBProfiles.map(profileB => ({
      manager: profileB.manager,
      league: profileB.league,
      similarity: cosineSimilarity(profileA.feature_vector, profileB.feature_vector),
    }));

    profileA.twins = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  });

  leagueBProfiles.forEach(profileB => {
    const similarities = leagueAProfiles.map(profileA => ({
      manager: profileA.manager,
      league: profileA.league,
      similarity: cosineSimilarity(profileB.feature_vector, profileA.feature_vector),
    }));

    profileB.twins = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  });

  // Calculate league averages
  const calculateLeagueAvg = (leagueProfiles: ManagerProfile[]) => {
    const count = leagueProfiles.length;
    if (count === 0) return {} as any;

    return {
      pctQB: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctQB, 0) / count,
      pctRB: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctRB, 0) / count,
      pctWR: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctWR, 0) / count,
      pctTE: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctTE, 0) / count,
      pctDEF: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctDEF, 0) / count,
      pctStarters: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctStarters, 0) / count,
      pctBench: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctBench, 0) / count,
      top1_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top1_share, 0) / count,
      top2_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top2_share, 0) / count,
      top3_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top3_share, 0) / count,
      top4_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top4_share, 0) / count,
      top5_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top5_share, 0) / count,
      giniSpend: leagueProfiles.reduce((sum, p) => sum + p.concentration.giniSpend, 0) / count,
    };
  };

  const league_averages = {
    league_A: calculateLeagueAvg(leagueAProfiles),
    league_B: calculateLeagueAvg(leagueBProfiles),
  };

  // Generate cluster summary
  const clusterCounts = new Map<string, number>();
  profiles.forEach(p => {
    const key = `${p.cluster.cluster_id}-${p.cluster.cluster_label}`;
    clusterCounts.set(key, (clusterCounts.get(key) || 0) + 1);
  });

  const cluster_summary = Array.from(clusterCounts.entries()).map(([key, count]) => {
    const [clusterId, clusterLabel] = key.split('-', 2);
    const clusterProfiles = profiles.filter(p => p.cluster.cluster_id === parseInt(clusterId));

    return {
      cluster_id: parseInt(clusterId),
      cluster_label: clusterLabel,
      description: clusterProfiles[0]?.cluster.description || '',
      tags: clusterProfiles[0]?.cluster.tags || [],
      count,
      avg_features: calculateLeagueAvg(clusterProfiles),
    };
  });

  // Debug logging to understand clustering and duplicate labels
  try {
    // Assignment per profile
    console.groupCollapsed('🔎 Cluster Debug');
    console.log('Total profiles:', profiles.length);
    console.log('Cluster assignments (manager, league, id → label):');
    console.table(
      profiles.map(p => ({
        manager: p.manager,
        league: p.league,
        cluster_id: p.cluster.cluster_id,
        cluster_label: p.cluster.cluster_label,
        gini: Number(p.concentration.giniSpend.toFixed(3)),
        top1: Number(p.concentration.top1_share.toFixed(3)),
        pctQB: Number(p.spend_shares.pctQB.toFixed(3)),
        pctRB: Number(p.spend_shares.pctRB.toFixed(3)),
        pctWR: Number(p.spend_shares.pctWR.toFixed(3)),
      })),
    );

    // Aggregates by cluster id
    const aggregates = new Map<number, any>();
    profiles.forEach(p => {
      const cid = p.cluster.cluster_id;
      if (!aggregates.has(cid)) {
        aggregates.set(cid, {
          label: p.cluster.cluster_label,
          count: 0,
          gini: 0,
          top1: 0,
          pctQB: 0,
          pctRB: 0,
          pctWR: 0,
          samples: [] as string[],
        });
      }
      const a = aggregates.get(cid);
      a.count += 1;
      a.gini += p.concentration.giniSpend;
      a.top1 += p.concentration.top1_share;
      a.pctQB += p.spend_shares.pctQB;
      a.pctRB += p.spend_shares.pctRB;
      a.pctWR += p.spend_shares.pctWR;
      if (a.samples.length < 3) a.samples.push(`${p.manager} (${p.league})`);
    });
    const aggregateRows = Array.from(aggregates.entries()).map(([cid, a]) => ({
      cluster_id: cid,
      label: a.label,
      count: a.count,
      avg_gini: Number((a.gini / a.count).toFixed(3)),
      avg_top1: Number((a.top1 / a.count).toFixed(3)),
      avg_pctRB: Number((a.pctRB / a.count).toFixed(3)),
      avg_pctWR: Number((a.pctWR / a.count).toFixed(3)),
      samples: a.samples.join(', '),
    }));
    console.log('Cluster aggregates by id:');
    console.table(aggregateRows);

    // Aggregates by label to detect duplicates
    const byLabel = new Map<string, number>();
    cluster_summary.forEach(c => {
      byLabel.set(c.cluster_label, (byLabel.get(c.cluster_label) || 0) + c.count);
    });
    console.log(
      'Label totals across all clusters (duplicates expected if label heuristics overlap):',
    );
    console.table(Array.from(byLabel.entries()).map(([label, total]) => ({ label, total })));
    console.groupEnd();
  } catch (e) {
    console.warn('Cluster debug logging failed:', e);
  }

  // Generate twins summary
  const allSimilarities = profiles.flatMap(p => p.twins.map(t => t.similarity));
  const highSimilarityPairs = allSimilarities.filter(s => s > 0.8).length / 2; // Divide by 2 to avoid double counting
  const avgSimilarity = allSimilarities.reduce((sum, s) => sum + s, 0) / allSimilarities.length;

  let mostSimilarPair = { manager_A: '', manager_B: '', similarity: 0 };
  profiles.forEach(profileA => {
    if (profileA.league === draft1.name && profileA.twins.length > 0) {
      const bestTwin = profileA.twins[0];
      if (bestTwin.similarity > mostSimilarPair.similarity) {
        mostSimilarPair = {
          manager_A: profileA.manager,
          manager_B: bestTwin.manager,
          similarity: bestTwin.similarity,
        };
      }
    }
  });

  const twins_summary = {
    high_similarity_pairs: Math.round(highSimilarityPairs),
    avg_similarity: Math.round(avgSimilarity * 1000) / 1000,
    most_similar_pair: mostSimilarPair,
  };

  // Calculate player overlap analytics
  const player_overlap_analytics = calculatePlayerOverlap(draft1, draft2);

  // Calculate player-level analytics
  const player_level_analytics = calculatePlayerLevelAnalytics(draft1, draft2);

  return {
    league_A_name: draft1.name,
    league_B_name: draft2.name,
    profiles,
    league_averages,
    cluster_summary,
    twins_summary,
    player_overlap_analytics,
    player_level_analytics,
  };
}
