import fs from 'fs';
import path from 'path';

const WEEK = parseInt(process.argv[2]?.replace('--week=', '')) || 4;

// ============================================================================
// Generate SLIM narrative-focused JSON (not 54K lines!)
// ============================================================================

function generateNarrativeSummary() {
  console.log(`\n📖 Reading enriched context for Week ${WEEK}...`);

  const inputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-context-enriched.json`);
  const fullContext = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log('✂️  Trimming to narrative essentials...');

  // ============================================================================
  // PART 1: Team Summaries (24 teams, but ONLY significant patterns)
  // ============================================================================

  const teamSummaries = fullContext.narrativePatterns.map((team: any) => {
    // Only include positions with significant advantages/streaks
    const significantPositions: any = {};

    for (const [pos, data] of Object.entries(team.positionalAnalysis || {})) {
      const posData = data as any;

      // Only include if has significant advantage OR significant streak/consistency
      if (
        posData.isSignificantAdvantage ||
        posData.consistency?.hasSignificantStreak ||
        posData.consistency?.hasSignificantConsistency
      ) {
        significantPositions[pos] = {
          ppw: posData.ppw,
          advantageVsLeague: posData.advantageVsLeague,
          percentageEdge: posData.percentageEdge,
          avgRank: posData.avgRank,
          recentWeekRank: posData.recentTrend?.weekRank,
          recentWeekPoints: posData.recentTrend?.weekPoints,
          isBestOfSeason: posData.recentTrend?.isBestOfSeason,
          // Only include if significant
          neverOutsideTop3:
            posData.consistency?.hasSignificantConsistency && posData.consistency?.neverOutsideTop3,
          neverOutsideTop5:
            posData.consistency?.hasSignificantConsistency && posData.consistency?.neverOutsideTop5,
          currentFirstPlaceStreak: posData.consistency?.hasSignificantStreak
            ? posData.consistency?.currentFirstPlaceStreak
            : 0,
          currentBottom2Streak: posData.consistency?.hasSignificantStreak
            ? posData.consistency?.currentBottom2Streak
            : 0,
        };
      }
    }

    return {
      teamName: team.teamName,
      leagueName: team.leagueName,
      record: team.winLossPattern.record,

      // Win/Loss Pattern (always include)
      winLossPattern: {
        scoringRanks: team.winLossPattern.scoringRanks,
        outcomes: team.winLossPattern.outcomes,
        topScoringWeeks: team.winLossPattern.topScoringWeeks,
        winsInTopScoring: team.winLossPattern.winsInTopScoring,
      },

      // Trajectory (only if significant)
      trajectory: team.trajectory?.isSignificant
        ? {
            weeklyScores: team.trajectory.weeklyScores,
            slopePPW: team.trajectory.slopePPW,
            trend: team.trajectory.trend,
            strength: team.trajectory.strength,
          }
        : null,

      // Clutch Factor (only if significant)
      clutchFactor: team.clutchFactor?.isSignificant
        ? {
            closeGameRecord: team.clutchFactor.closeGameRecord,
            tightGameRecord: team.clutchFactor.tightGameRecord,
            blowoutRecord: team.clutchFactor.blowoutRecord,
            clutchRating: team.clutchFactor.clutchRating,
            interpretation: team.clutchFactor.interpretation,
          }
        : null,

      // Timing Luck (only if significant)
      timingLuck: team.scheduleTimingLuck?.isSignificant
        ? {
            avgOppTimingResidual: team.scheduleTimingLuck.avgOppTimingResidual,
            interpretation: team.scheduleTimingLuck.interpretation,
            strength: team.scheduleTimingLuck.strength,
            weeklyResiduals: team.scheduleTimingLuck.weeklyResiduals,
          }
        : null,

      // Counterfactual (only if games would flip)
      counterfactual:
        team.counterfactualGames?.gamesFlippedByTiming > 0
          ? {
              gamesFlippedByTiming: team.counterfactualGames.gamesFlippedByTiming,
              lossesFlippedToWins: team.counterfactualGames.lossesFlippedToWins,
            }
          : null,

      // Positions (ONLY significant ones)
      significantPositions,

      // Top 2 strengths/weaknesses
      topStrength: team.positionalBalance.strengths[0] || null,
      topWeakness: team.positionalBalance.weaknesses[0] || null,
      netAdvantage: team.positionalBalance.netAdvantage,
    };
  });

  // ============================================================================
  // PART 2: League-Wide Rankings (for comparisons)
  // ============================================================================

  // Sort teams by various metrics for easy comparison
  const rankings = {
    byScoring: [...teamSummaries]
      .sort((a, b) => {
        const avgA =
          a.trajectory?.weeklyScores?.reduce((sum: number, v: number) => sum + v, 0) /
          (a.trajectory?.weeklyScores?.length || 1);
        const avgB =
          b.trajectory?.weeklyScores?.reduce((sum: number, v: number) => sum + v, 0) /
          (b.trajectory?.weeklyScores?.length || 1);
        return avgB - avgA;
      })
      .map((t, i) => ({
        rank: i + 1,
        teamName: t.teamName,
        avgPPG: t.trajectory?.weeklyScores
          ? Math.round(
              (t.trajectory.weeklyScores.reduce((sum: number, v: number) => sum + v, 0) /
                t.trajectory.weeklyScores.length) *
                10
            ) / 10
          : 0,
      })),

    byTrajectory: [...teamSummaries]
      .filter(t => t.trajectory?.isSignificant)
      .sort((a, b) => (b.trajectory?.slopePPW || 0) - (a.trajectory?.slopePPW || 0))
      .map((t, i) => ({
        rank: i + 1,
        teamName: t.teamName,
        slopePPW: t.trajectory?.slopePPW,
        trend: t.trajectory?.trend,
      })),

    strongestPositions: teamSummaries
      .map((t: any) => ({
        teamName: t.teamName,
        position: t.topStrength?.position,
        advantage: t.topStrength?.data?.advantageVsLeague || 0,
      }))
      .filter((t: any) => t.advantage > 5)
      .sort((a: any, b: any) => b.advantage - a.advantage)
      .slice(0, 10), // Top 10 only

    weakestPositions: teamSummaries
      .map((t: any) => ({
        teamName: t.teamName,
        position: t.topWeakness?.position,
        disadvantage: t.topWeakness?.data?.advantageVsLeague || 0,
      }))
      .filter((t: any) => t.disadvantage < -5)
      .sort((a: any, b: any) => a.disadvantage - b.disadvantage)
      .slice(0, 10), // Bottom 10 only
  };

  // ============================================================================
  // PART 3: Spotlight Recommendations (Auto-select top 6)
  // ============================================================================

  const spotlightCandidates = teamSummaries.map((team: any) => {
    let interestScore = 0;
    const reasons = [];

    // Extreme records
    if (team.record.wins === 4 && team.record.losses === 0) {
      interestScore += 10;
      reasons.push('Undefeated');
    }
    if (team.record.wins === 0 && team.record.losses >= 4) {
      interestScore += 10;
      reasons.push('Winless');
    }

    // Strong trajectory
    if (team.trajectory?.strength === 'strong') {
      interestScore += 8;
      reasons.push(`${team.trajectory.trend === 'strongly_improving' ? 'Surging' : 'Collapsing'}`);
    }

    // Clutch factor
    if (team.clutchFactor?.isSignificant) {
      interestScore += 7;
      reasons.push(`Clutch: ${team.clutchFactor.interpretation}`);
    }

    // Extreme positional imbalance
    const topAdvantage = team.topStrength?.data?.advantageVsLeague || 0;
    const topDisadvantage = team.topWeakness?.data?.advantageVsLeague || 0;
    if (topAdvantage > 15) {
      interestScore += 8;
      reasons.push(`Elite ${team.topStrength?.position}`);
    }
    if (topDisadvantage < -10) {
      interestScore += 6;
      reasons.push(`Weak ${team.topWeakness?.position}`);
    }

    // Boom/bust pattern
    if (
      team.winLossPattern.topScoringWeeks >= 2 &&
      team.winLossPattern.winsInTopScoring === team.record.wins
    ) {
      interestScore += 7;
      reasons.push('Boom/Bust');
    }

    // Timing luck (extreme)
    if (team.timingLuck?.strength === 'strong') {
      interestScore += 6;
      reasons.push(`Timing: ${team.timingLuck.interpretation}`);
    }

    return {
      teamName: team.teamName,
      record: `${team.record.wins}-${team.record.losses}`,
      interestScore,
      reasons: reasons.join(', '),
    };
  });

  const topSpotlights = spotlightCandidates
    .sort((a: any, b: any) => b.interestScore - a.interestScore)
    .slice(0, 8); // Top 8 candidates (pick 6 for actual narratives)

  // ============================================================================
  // OUTPUT: Slim narrative-focused JSON
  // ============================================================================

  const narrativeSummary = {
    week: WEEK,
    generatedAt: new Date().toISOString(),

    // Full team data (but slimmed down)
    teams: teamSummaries,

    // League-wide rankings
    rankings,

    // Recommended spotlights
    spotlightRecommendations: topSpotlights,

    // Quick stats for context
    leagueAverages: {
      avgPPG:
        Math.round(
          (teamSummaries.reduce((sum: number, t: any) => {
            const avg = t.trajectory?.weeklyScores
              ? t.trajectory.weeklyScores.reduce((s: number, v: number) => s + v, 0) /
                t.trajectory.weeklyScores.length
              : 0;
            return sum + avg;
          }, 0) /
            teamSummaries.length) *
            10
        ) / 10,
      totalTeams: teamSummaries.length,
    },

    // Note about what was trimmed
    _meta: {
      note: 'This is a narrative-focused summary. Full raw data removed to reduce file size from 54K to ~2K lines.',
      trimmed: [
        'fullData',
        'rawStats',
        'detailed weeklyScores per position',
        'insignificant patterns',
      ],
    },
  };

  // Write slim JSON
  const outputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-narrative-summary.json`);
  fs.writeFileSync(outputPath, JSON.stringify(narrativeSummary, null, 2));

  console.log(`\n✅ Narrative summary generated!`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📊 File size comparison:`);

  const oldSize = fs.statSync(inputPath).size;
  const newSize = fs.statSync(outputPath).size;
  console.log(`   • Old (enriched): ${(oldSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   • New (summary):  ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   • Reduction:      ${Math.round((1 - newSize / oldSize) * 100)}%\n`);

  console.log(`📝 Recommended Spotlights (Top 6):`);
  topSpotlights.slice(0, 6).forEach((s: any, i: number) => {
    console.log(`   ${i + 1}. ${s.teamName} (${s.record}) - ${s.reasons}`);
  });
  console.log('');
}

generateNarrativeSummary();
