import fs from 'fs';
import path from 'path';

const WEEK = parseInt(process.argv[2]?.replace('--week=', '')) || 4;

// ============================================================================
// MINIMUM SAMPLE SIZE THRESHOLDS (for statistical significance)
// ============================================================================

const THRESHOLDS = {
  // Pattern detection minimums
  MIN_GAMES_FOR_CLUTCH: 2, // Need 2+ close games to call someone clutch/choker
  MIN_WEEKS_FOR_STREAK: 2, // Need 2+ consecutive weeks for a streak
  MIN_WEEKS_FOR_CONSISTENCY: 3, // Need 3+ weeks to claim "never outside top X"
  MIN_WEEKS_FOR_TRAJECTORY: 3, // Need 3+ weeks for meaningful trend
  MIN_TIMING_IMPACT: 5, // Opponent timing must be ±5pts to be notable
  MIN_ADVANTAGE_POS: 3, // Position advantage must be ±3pts to matter

  // Narrative thresholds
  STRONG_TRAJECTORY: 5, // ±5 pts/week = "strong" improvement/decline
  MODERATE_TRAJECTORY: 2, // ±2 pts/week = "moderate" improvement/decline
  STRONG_TIMING: 10, // ±10pts = opponents consistently hot/cold
  MODERATE_TIMING: 5, // ±5pts = noticeable timing effect
};

// ============================================================================
// PROCESS NARRATIVE PATTERNS FROM EXISTING CONTEXT
// ============================================================================

function processNarrativePatterns(fullData: any, currentWeek: number) {
  console.log('📝 Processing narrative patterns from existing data...');

  const teamsMap = new Map(fullData.teams);
  const positionsMap = new Map(fullData.positions);
  const results: any[] = [];

  // Calculate league-wide position averages for each week
  const leagueAvgByPosWeek = new Map<string, number>();

  for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF']) {
    const posData = positionsMap.get(position) as any;
    if (!posData || !posData.teams) continue;

    const posTeamsMap = new Map(posData.teams);

    for (let week = 1; week <= currentWeek; week++) {
      const weekScores = Array.from(posTeamsMap.values())
        .map((teamPosData: any) => {
          const weekScore = teamPosData.scores.find((s: any) => s.week === week);
          return weekScore?.value || 0;
        })
        .filter(score => score > 0);

      const avg =
        weekScores.length > 0 ? weekScores.reduce((sum, s) => sum + s, 0) / weekScores.length : 0;

      leagueAvgByPosWeek.set(`${position}-${week}`, avg);
    }
  }

  // Process each team
  for (const [teamKey, teamData] of teamsMap.entries() as any) {
    const teamScores = teamData.teamScores.filter((s: any) => s.value > 0);
    const opponentScores = teamData.opponentScores.filter((s: any) => s.value > 0);

    if (teamScores.length === 0) continue;

    // PATTERN 1: Win/Loss Correlation with Scoring
    const scoringRanks: number[] = [];
    const outcomes: ('W' | 'L')[] = [];

    for (let week = 1; week <= currentWeek; week++) {
      const weekScore = teamScores.find((s: any) => s.week === week);
      const oppScore = opponentScores.find((s: any) => s.week === week);

      if (weekScore && oppScore) {
        // Calculate rank for this week
        const allWeekScores = Array.from(teamsMap.values())
          .map((t: any) => t.teamScores.find((s: any) => s.week === week)?.value || 0)
          .filter(s => s > 0)
          .sort((a, b) => b - a);

        const rank = allWeekScores.findIndex(s => s === weekScore.value) + 1;
        scoringRanks.push(rank);
        outcomes.push(weekScore.value > oppScore.value ? 'W' : 'L');
      }
    }

    const topScoringWeeks = scoringRanks.filter(r => r <= 5).length;
    const lowScoringWeeks = scoringRanks.filter(r => r > 12).length;
    const winsInTopScoring = outcomes.filter((o, i) => o === 'W' && scoringRanks[i] <= 5).length;
    const lossesInTopScoring = outcomes.filter((o, i) => o === 'L' && scoringRanks[i] <= 5).length;

    // PATTERN 2-14: Position-level analysis
    const positionalAnalysis: any = {};

    for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF']) {
      const posData = positionsMap.get(position) as any;
      if (!posData || !posData.teams) continue;

      const posTeamsMap = new Map(posData.teams);
      const teamPosData = posTeamsMap.get(teamKey) as any;

      if (!teamPosData) continue;

      const validScores = teamPosData.scores.filter(
        (s: any) => s.week >= 1 && s.week <= currentWeek && s.value > 0
      );

      if (validScores.length === 0) continue;

      // Calculate PPW and season rank
      const ppw =
        validScores.reduce((sum: number, s: any) => sum + s.value, 0) / validScores.length;

      // Calculate vs league average
      let advantageVsLeague = 0;
      for (const score of validScores) {
        const leagueAvg = leagueAvgByPosWeek.get(`${position}-${score.week}`) || 0;
        advantageVsLeague += score.value - leagueAvg;
      }
      advantageVsLeague = advantageVsLeague / validScores.length;

      // Calculate weekly ranks and streaks
      const weeklyRanks: number[] = [];
      for (let week = 1; week <= currentWeek; week++) {
        const weekScore = validScores.find((s: any) => s.week === week);
        if (!weekScore) continue;

        const allWeekPosScores = Array.from(posTeamsMap.values())
          .map((tpd: any) => tpd.scores.find((s: any) => s.week === week)?.value || 0)
          .filter(s => s > 0)
          .sort((a, b) => b - a);

        const rank = allWeekPosScores.findIndex(s => s === weekScore.value) + 1;
        weeklyRanks.push(rank);
      }

      // Consistency patterns (require MIN_WEEKS_FOR_CONSISTENCY)
      const hasEnoughWeeksForConsistency =
        weeklyRanks.length >= THRESHOLDS.MIN_WEEKS_FOR_CONSISTENCY;
      const neverOutsideTop3 = hasEnoughWeeksForConsistency && weeklyRanks.every(r => r <= 3);
      const neverOutsideTop5 = hasEnoughWeeksForConsistency && weeklyRanks.every(r => r <= 5);
      const bottom3Count = weeklyRanks.filter(r => r >= 22).length;
      const consecutiveBottom3 = bottom3Count >= 3 && weeklyRanks.slice(-3).every(r => r >= 22);

      // Detect #1 streaks (require MIN_WEEKS_FOR_STREAK)
      let currentFirstPlaceStreak = 0;
      for (let i = weeklyRanks.length - 1; i >= 0; i--) {
        if (weeklyRanks[i] === 1) currentFirstPlaceStreak++;
        else break;
      }

      // Detect bottom 2 streaks (require MIN_WEEKS_FOR_STREAK)
      let currentBottom2Streak = 0;
      for (let i = weeklyRanks.length - 1; i >= 0; i--) {
        if (weeklyRanks[i] >= 23) currentBottom2Streak++;
        else break;
      }

      // Recent trend
      const recentWeekRank = weeklyRanks[weeklyRanks.length - 1] || 0;
      const recentWeekPoints = validScores[validScores.length - 1]?.value || 0;
      const previousAvg =
        validScores.length > 1
          ? validScores.slice(0, -1).reduce((sum: number, s: any) => sum + s.value, 0) /
            (validScores.length - 1)
          : 0;
      const isBestOfSeason = recentWeekPoints === Math.max(...validScores.map((s: any) => s.value));

      positionalAnalysis[position] = {
        ppw: Math.round(ppw * 10) / 10,
        advantageVsLeague: Math.round(advantageVsLeague * 10) / 10,
        percentageEdge:
          advantageVsLeague > 0
            ? Math.round((advantageVsLeague / (ppw - advantageVsLeague)) * 1000) / 10
            : 0,
        weeklyRanks,
        avgRank:
          weeklyRanks.length > 0
            ? Math.round((weeklyRanks.reduce((sum, r) => sum + r, 0) / weeklyRanks.length) * 10) /
              10
            : 0,
        consistency: {
          neverOutsideTop3,
          neverOutsideTop5,
          consecutiveBottom3,
          bottom3Weeks: bottom3Count,
          currentFirstPlaceStreak,
          currentBottom2Streak,
          // Significance flags
          hasSignificantStreak:
            currentFirstPlaceStreak >= THRESHOLDS.MIN_WEEKS_FOR_STREAK ||
            currentBottom2Streak >= THRESHOLDS.MIN_WEEKS_FOR_STREAK,
          hasSignificantConsistency:
            hasEnoughWeeksForConsistency && (neverOutsideTop3 || neverOutsideTop5),
        },
        recentTrend: {
          weekRank: recentWeekRank,
          weekPoints: Math.round(recentWeekPoints * 10) / 10,
          isBestOfSeason,
          improvement: Math.round((recentWeekPoints - previousAvg) * 10) / 10,
        },
        // Position-level significance
        isSignificantAdvantage: Math.abs(advantageVsLeague) >= THRESHOLDS.MIN_ADVANTAGE_POS,
      };
    }

    // Net positional balance
    const strengths = Object.entries(positionalAnalysis)
      .filter(([_, data]: any) => data.advantageVsLeague > 3)
      .sort(([_, a]: any, [__, b]: any) => b.advantageVsLeague - a.advantageVsLeague)
      .map(([pos, data]) => ({ position: pos, data }));

    const weaknesses = Object.entries(positionalAnalysis)
      .filter(([_, data]: any) => data.advantageVsLeague < -3)
      .sort(([_, a]: any, [__, b]: any) => a.advantageVsLeague - b.advantageVsLeague)
      .map(([pos, data]) => ({ position: pos, data }));

    const netAdvantage = Object.values(positionalAnalysis).reduce(
      (sum: number, data: any) => sum + data.advantageVsLeague,
      0
    );

    // ============================================
    // OPPONENT-AWARE PATTERNS (15-22)
    // ============================================

    // Calculate opponent timing residuals
    const opponentTimingResiduals: number[] = [];
    const teamWeeklyScores: Array<{
      week: number;
      myScore: number;
      oppScore: number;
      oppBaseline: number;
    }> = [];

    for (let week = 1; week <= currentWeek; week++) {
      const myWeekScore = teamScores.find((s: any) => s.week === week);
      const oppWeekScore = opponentScores.find((s: any) => s.week === week);

      if (myWeekScore && oppWeekScore) {
        // Calculate opponent's baseline (average of other weeks)
        const oppOtherWeeks = opponentScores
          .filter((s: any) => s.week !== week && s.value > 0)
          .map((s: any) => s.value);
        const oppBaseline =
          oppOtherWeeks.length > 0
            ? oppOtherWeeks.reduce((sum: number, v: number) => sum + v, 0) / oppOtherWeeks.length
            : oppWeekScore.value;

        const oppTimingResidual = oppWeekScore.value - oppBaseline;
        opponentTimingResiduals.push(oppTimingResidual);

        teamWeeklyScores.push({
          week,
          myScore: myWeekScore.value,
          oppScore: oppWeekScore.value,
          oppBaseline,
        });
      }
    }

    const avgOppTimingResidual =
      opponentTimingResiduals.length > 0
        ? opponentTimingResiduals.reduce((sum, r) => sum + r, 0) / opponentTimingResiduals.length
        : 0;

    // Pattern 15: Schedule/Timing Luck (with significance check)
    const absTimingResidual = Math.abs(avgOppTimingResidual);
    const scheduleTimingLuck = {
      avgOppTimingResidual: Math.round(avgOppTimingResidual * 10) / 10,
      interpretation:
        absTimingResidual >= THRESHOLDS.STRONG_TIMING
          ? avgOppTimingResidual > 0
            ? 'opponents_hot'
            : 'opponents_cold'
          : absTimingResidual >= THRESHOLDS.MODERATE_TIMING
            ? avgOppTimingResidual > 0
              ? 'opponents_slightly_hot'
              : 'opponents_slightly_cold'
            : 'neutral',
      isSignificant: absTimingResidual >= THRESHOLDS.MODERATE_TIMING,
      strength:
        absTimingResidual >= THRESHOLDS.STRONG_TIMING
          ? 'strong'
          : absTimingResidual >= THRESHOLDS.MODERATE_TIMING
            ? 'moderate'
            : 'weak',
      weeklyResiduals: opponentTimingResiduals.map(r => Math.round(r * 10) / 10),
      sampleSize: opponentTimingResiduals.length,
    };

    // Pattern 21: Counterfactual Win Odds (simplified without full projections)
    const counterfactualGames = teamWeeklyScores.map(game => {
      const myAdvantageVsAvg =
        game.myScore -
        teamScores.reduce((sum: number, s: any) => sum + s.value, 0) / teamScores.length;
      const oppAdvantageVsBaseline = game.oppScore - game.oppBaseline;

      // If opponent played to baseline instead of actual
      const counterfactualOppScore = game.oppBaseline;
      const counterfactualResult = game.myScore > counterfactualOppScore ? 'W' : 'L';
      const actualResult = game.myScore > game.oppScore ? 'W' : 'L';
      const resultFlip = counterfactualResult !== actualResult;

      return {
        week: game.week,
        actualResult,
        counterfactualResult,
        resultFlip,
        timingImpact: Math.round(oppAdvantageVsBaseline * 10) / 10,
        margin: Math.round((game.myScore - game.oppScore) * 10) / 10,
      };
    });

    const gamesFlippedByTiming = counterfactualGames.filter(g => g.resultFlip).length;
    const lossesFlippedToWins = counterfactualGames.filter(
      g => g.actualResult === 'L' && g.resultFlip
    ).length;

    // Pattern 11: Clutch Factor (from margins)
    const margins = teamWeeklyScores.map(g => Math.abs(g.myScore - g.oppScore));
    const closeGames = teamWeeklyScores.filter((_, i) => margins[i] < 10);
    const tightGames = teamWeeklyScores.filter((_, i) => margins[i] < 5);
    const blowouts = teamWeeklyScores.filter((_, i) => margins[i] > 15);

    const closeGameWins = closeGames.filter(g => g.myScore > g.oppScore).length;
    const tightGameWins = tightGames.filter(g => g.myScore > g.oppScore).length;
    const blowoutWins = blowouts.filter(g => g.myScore > g.oppScore).length;

    // Pattern 11: Clutch Factor (with significance check)
    const hasEnoughCloseGames = closeGames.length >= THRESHOLDS.MIN_GAMES_FOR_CLUTCH;
    const clutchFactor = {
      closeGameRecord: { wins: closeGameWins, losses: closeGames.length - closeGameWins },
      tightGameRecord: { wins: tightGameWins, losses: tightGames.length - tightGameWins },
      blowoutRecord: { wins: blowoutWins, losses: blowouts.length - blowoutWins },
      clutchRating:
        closeGames.length > 0 ? Math.round((closeGameWins / closeGames.length) * 1000) / 10 : 0,
      interpretation:
        hasEnoughCloseGames && closeGameWins / closeGames.length >= 0.7
          ? 'clutch'
          : hasEnoughCloseGames && closeGameWins / closeGames.length <= 0.3
            ? 'choker'
            : 'neutral',
      isSignificant: hasEnoughCloseGames, // Flag for narrative filtering
      sampleSize: closeGames.length,
    };

    // Pattern 10: Trajectory (improving/declining)
    const weeklyScoreValues = teamScores.map((s: any) => s.value);
    let trajectorySlope = 0;
    if (weeklyScoreValues.length >= 3) {
      // Simple linear regression
      const n = weeklyScoreValues.length;
      const xMean = (n - 1) / 2;
      const yMean = weeklyScoreValues.reduce((sum: number, v: number) => sum + v, 0) / n;

      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (weeklyScoreValues[i] - yMean);
        denominator += (i - xMean) ** 2;
      }
      trajectorySlope = denominator > 0 ? numerator / denominator : 0;
    }

    // Pattern 10: Trajectory (with significance check)
    const hasEnoughWeeksForTrend = weeklyScoreValues.length >= THRESHOLDS.MIN_WEEKS_FOR_TRAJECTORY;
    const absSlope = Math.abs(trajectorySlope);

    const trajectory = {
      weeklyScores: weeklyScoreValues,
      slopePPW: Math.round(trajectorySlope * 10) / 10,
      trend: !hasEnoughWeeksForTrend
        ? 'insufficient_data'
        : absSlope >= THRESHOLDS.STRONG_TRAJECTORY
          ? trajectorySlope > 0
            ? 'strongly_improving'
            : 'strongly_declining'
          : absSlope >= THRESHOLDS.MODERATE_TRAJECTORY
            ? trajectorySlope > 0
              ? 'improving'
              : 'declining'
            : 'stable',
      isSignificant: hasEnoughWeeksForTrend && absSlope >= THRESHOLDS.MODERATE_TRAJECTORY,
      strength:
        absSlope >= THRESHOLDS.STRONG_TRAJECTORY
          ? 'strong'
          : absSlope >= THRESHOLDS.MODERATE_TRAJECTORY
            ? 'moderate'
            : 'weak',
      sampleSize: weeklyScoreValues.length,
    };

    results.push({
      teamKey,
      teamName: teamData.teamInfo.teamName,
      leagueName: teamData.teamInfo.leagueName,

      // Pattern 1: Win/Loss correlation
      winLossPattern: {
        scoringRanks,
        outcomes,
        topScoringWeeks,
        lowScoringWeeks,
        winsInTopScoring,
        lossesInTopScoring,
        record: {
          wins: outcomes.filter(o => o === 'W').length,
          losses: outcomes.filter(o => o === 'L').length,
        },
      },

      // Pattern 2-14: Position analysis
      positionalAnalysis,

      // Pattern 3 & 7: Trade-offs
      positionalBalance: {
        strengths: strengths.slice(0, 2), // Top 2
        weaknesses: weaknesses.slice(0, 2), // Bottom 2
        netAdvantage: Math.round(netAdvantage * 10) / 10,
      },

      // Pattern 10: Trajectory
      trajectory,

      // Pattern 11: Clutch Factor
      clutchFactor,

      // Pattern 15: Schedule/Timing Luck
      scheduleTimingLuck,

      // Pattern 21: Counterfactual Games
      counterfactualGames: {
        games: counterfactualGames,
        gamesFlippedByTiming,
        lossesFlippedToWins,
      },
    });
  }

  console.log(`✅ Processed narrative patterns for ${results.length} teams`);
  return results;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function processContext() {
  try {
    const inputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-context.json`);

    console.log(`\n📖 Reading existing context from: ${inputPath}`);
    const existingContext = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    if (!existingContext.fullData) {
      console.error('❌ No fullData found in context file');
      process.exit(1);
    }

    // Process narrative patterns
    const narrativePatterns = processNarrativePatterns(existingContext.fullData, WEEK);

    // Update context with narrative patterns
    const updatedContext = {
      ...existingContext,
      narrativePatterns,
      processedAt: new Date().toISOString(),
    };

    // Write updated context
    const outputPath = path.join(process.cwd(), `apps/web/data/week${WEEK}-context-enriched.json`);
    fs.writeFileSync(outputPath, JSON.stringify(updatedContext, null, 2));

    console.log(`\n✅ Enriched context generated!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Summary:`);
    console.log(`   • Narrative patterns: ${narrativePatterns.length} teams`);
    console.log(`   • Patterns detected per team: 22 types (including opponent-aware)\n`);

    // Show a sample team with new patterns
    if (narrativePatterns.length > 0) {
      const sample = narrativePatterns[0];
      console.log(`\n📋 Sample Team: ${sample.teamName}`);
      console.log(
        `   • Record: ${sample.winLossPattern.record.wins}-${sample.winLossPattern.record.losses}`
      );
      console.log(`   • Top scoring weeks: ${sample.winLossPattern.topScoringWeeks}`);
      console.log(`   • Wins in top scoring: ${sample.winLossPattern.winsInTopScoring}`);

      // Show position strengths/weaknesses
      if (sample.positionalBalance.strengths.length > 0) {
        const topStrength = sample.positionalBalance.strengths[0];
        console.log(
          `   • Top strength: ${topStrength.position} (+${topStrength.data.advantageVsLeague}pts vs league avg)`
        );
      }
      if (sample.positionalBalance.weaknesses.length > 0) {
        const topWeakness = sample.positionalBalance.weaknesses[0];
        console.log(
          `   • Top weakness: ${topWeakness.position} (${topWeakness.data.advantageVsLeague}pts vs league avg)`
        );
      }

      // Show new opponent-aware patterns
      console.log(`\n   🆕 Opponent-Aware Patterns:`);
      console.log(
        `   • Opponent timing: ${sample.scheduleTimingLuck.avgOppTimingResidual > 0 ? '+' : ''}${sample.scheduleTimingLuck.avgOppTimingResidual}pts (${sample.scheduleTimingLuck.interpretation})`
      );
      console.log(
        `   • Games flipped by timing: ${sample.counterfactualGames.gamesFlippedByTiming}`
      );
      console.log(
        `   • Losses → Wins if neutral timing: ${sample.counterfactualGames.lossesFlippedToWins}`
      );
      console.log(
        `   • Clutch rating: ${sample.clutchFactor.clutchRating}% in close games (${sample.clutchFactor.interpretation})`
      );
      console.log(
        `   • Trajectory: ${sample.trajectory.trend} (${sample.trajectory.slopePPW > 0 ? '+' : ''}${sample.trajectory.slopePPW}pts/week)`
      );
      console.log('');
    }
  } catch (error) {
    console.error('\n❌ Failed to process context:', error);
    process.exit(1);
  }
}

processContext();
