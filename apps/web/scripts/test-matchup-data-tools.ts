/**
 * Test script for matchup data tools (RECAP-008)
 *
 * Validates all 11 matchup data tools with real Week 5 data.
 * Run with: npm run test:matchup-data
 */

import {
  fetchMatchupBoxScoreTool,
  fetchMatchupRostersTool,
  fetchScoringBreakdownTool,
  fetchPreGameProjectionsTool,
  fetchProjectionVsActualTool,
  fetchTeamRecordsTool,
  fetchH2HHistoryTool,
  fetchPlayoffImplicationsTool,
  fetchPositionBreakdownTool,
  fetchKeyPlayerPerformancesTool,
} from '../src/lib/reports/recap/tools/matchup-data';
import { LEAGUE_IDS } from '../src/lib/constants';

const testMatchupDataTools = async (): Promise<void> => {
  console.log('🧪 Testing Matchup Data Tools (RECAP-008)\n');
  console.log('Note: Game flow tool (Tool 8) is tested separately via test:game-flow');
  console.log('='.repeat(60));

  const testParams = {
    leagueId: LEAGUE_IDS.AFC,
    week: 5,
    matchupId: 1,
  };

  try {
    // Test 1: Box Score
    console.log('\n📊 Test 1: fetch_matchup_box_score');
    console.log('-'.repeat(60));
    const boxScore = await fetchMatchupBoxScoreTool.execute(testParams);
    console.log('✅ Box Score Retrieved');
    console.log(`   League: ${boxScore.leagueId}`);
    console.log(`   Week: ${boxScore.week}`);
    console.log(`   Matchup ID: ${boxScore.matchupId}`);
    console.log(`   Team 1 (Roster ${boxScore.team1.rosterId}): ${boxScore.team1.score} pts`);
    console.log(`   Team 2 (Roster ${boxScore.team2.rosterId}): ${boxScore.team2.score} pts`);
    console.log(`   Winner: ${boxScore.winner}`);
    console.log(`   Margin: ${boxScore.margin} pts`);

    // Test 2: Rosters
    console.log('\n👥 Test 2: fetch_matchup_rosters');
    console.log('-'.repeat(60));
    const rosters = await fetchMatchupRostersTool.execute({
      leagueId: testParams.leagueId,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅ Roster Information Retrieved');
    console.log(`   Team 1: ${rosters.team1.teamName} (${rosters.team1.ownerName})`);
    console.log(`   Team 2: ${rosters.team2.teamName} (${rosters.team2.ownerName})`);

    // Test 3: Scoring Breakdown
    console.log('\n🎯 Test 3: fetch_matchup_scoring_breakdown');
    console.log('-'.repeat(60));
    const scoring = await fetchScoringBreakdownTool.execute(testParams);
    console.log('✅ Scoring Breakdown Retrieved');
    console.log(`   Team 1 Players: ${scoring.team1.length}`);
    console.log(
      `   Team 1 Top Scorer: ${scoring.team1[0]?.playerName} (${scoring.team1[0]?.points} pts)`,
    );
    console.log(`   Team 2 Players: ${scoring.team2.length}`);
    console.log(
      `   Team 2 Top Scorer: ${scoring.team2[0]?.playerName} (${scoring.team2[0]?.points} pts)`,
    );

    // Test 4: Pre-game Projections
    console.log('\n🔮 Test 4: fetch_pre_game_projections');
    console.log('-'.repeat(60));
    const projections = await fetchPreGameProjectionsTool.execute(testParams);
    console.log('✅ Pre-game Projections Retrieved');
    console.log(`   Team 1 Projected: ${projections.team1Projected} pts`);
    console.log(`   Team 2 Projected: ${projections.team2Projected} pts`);
    console.log(`   Projected Margin: ${projections.projectedMargin} pts`);

    // Test 5: Projection vs Actual
    console.log('\n📈 Test 5: fetch_projection_vs_actual');
    console.log('-'.repeat(60));
    const vsActual = await fetchProjectionVsActualTool.execute(testParams);
    console.log('✅ Projection Comparison Retrieved');
    console.log(`   Team 1: ${vsActual.team1.actual} pts (projected ${vsActual.team1.projected})`);
    console.log(
      `   Team 1 Over/Under: ${vsActual.team1.overUnder > 0 ? '+' : ''}${vsActual.team1.overUnder} pts (${vsActual.team1.overUnderPct}%)`,
    );
    console.log(`   Team 2: ${vsActual.team2.actual} pts (projected ${vsActual.team2.projected})`);
    console.log(
      `   Team 2 Over/Under: ${vsActual.team2.overUnder > 0 ? '+' : ''}${vsActual.team2.overUnder} pts (${vsActual.team2.overUnderPct}%)`,
    );

    // Test 6: Team Records
    console.log('\n📋 Test 6: fetch_team_records');
    console.log('-'.repeat(60));
    const records = await fetchTeamRecordsTool.execute({
      leagueId: testParams.leagueId,
      week: testParams.week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅ Team Records Retrieved');
    console.log(
      `   Team 1 Record: ${records.team1.wins}-${records.team1.losses}-${records.team1.ties} (${(records.team1.winPct * 100).toFixed(1)}%)`,
    );
    console.log(
      `   Team 1 Points: ${records.team1.pointsFor} PF, ${records.team1.pointsAgainst} PA`,
    );
    console.log(
      `   Team 2 Record: ${records.team2.wins}-${records.team2.losses}-${records.team2.ties} (${(records.team2.winPct * 100).toFixed(1)}%)`,
    );
    console.log(
      `   Team 2 Points: ${records.team2.pointsFor} PF, ${records.team2.pointsAgainst} PA`,
    );

    // Test 7: H2H History
    console.log('\n🤝 Test 7: fetch_h2h_history');
    console.log('-'.repeat(60));
    const h2h = await fetchH2HHistoryTool.execute({
      leagueId: testParams.leagueId,
      currentWeek: testParams.week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅ H2H History Retrieved');
    console.log(`   Team 1 Wins: ${h2h.team1Wins}`);
    console.log(`   Team 2 Wins: ${h2h.team2Wins}`);
    console.log(`   Ties: ${h2h.ties}`);
    console.log(`   Previous Matchups: ${h2h.previousMatchups.length}`);
    if (h2h.previousMatchups.length > 0) {
      h2h.previousMatchups.forEach(m => {
        console.log(`     Week ${m.week}: ${m.team1Score} - ${m.team2Score} (${m.winner})`);
      });
    }

    // Test 8: Game Flow - SKIPPED (tested separately)
    console.log('\n📊 Test 8: fetch_game_flow_compressed - SKIPPED');
    console.log('-'.repeat(60));
    console.log('⏭️  Game flow tool tested separately (see npm run test:game-flow)');

    // Test 9: Playoff Implications
    console.log('\n🏆 Test 9: fetch_playoff_implications');
    console.log('-'.repeat(60));
    const playoff = await fetchPlayoffImplicationsTool.execute({
      leagueId: testParams.leagueId,
      week: testParams.week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    });
    console.log('✅ Playoff Implications Retrieved');
    console.log(`   Stakes: ${playoff.stakes.toUpperCase()}`);
    console.log(`   Description: ${playoff.description}`);

    // Test 10: Position Breakdown
    console.log('\n📊 Test 10: fetch_position_breakdown');
    console.log('-'.repeat(60));
    const positions = await fetchPositionBreakdownTool.execute(testParams);
    console.log('✅ Position Breakdown Retrieved');
    console.log('   Team 1 Scoring by Position:');
    Object.entries(positions.team1.positions).forEach(([pos, pts]) => {
      console.log(`     ${pos}: ${pts} pts`);
    });
    console.log('   Team 2 Scoring by Position:');
    Object.entries(positions.team2.positions).forEach(([pos, pts]) => {
      console.log(`     ${pos}: ${pts} pts`);
    });

    // Test 11: Key Performers
    console.log('\n⭐ Test 11: fetch_key_player_performances');
    console.log('-'.repeat(60));
    const keyPlayers = await fetchKeyPlayerPerformancesTool.execute(testParams);
    console.log('✅ Key Performers Retrieved');
    console.log('   Team 1 Top Performers:');
    keyPlayers.team1.forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.playerName} (${p.position}): ${p.points} pts`);
    });
    console.log('   Team 2 Top Performers:');
    keyPlayers.team2.forEach((p, i) => {
      console.log(`     ${i + 1}. ${p.playerName} (${p.position}): ${p.points} pts`);
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL 10 MATCHUP DATA TOOLS VALIDATED SUCCESSFULLY!');
    console.log('   (Tool 8 - Game Flow - tested separately)');
    console.log('='.repeat(60));
    console.log('\n📊 Matchup Summary:');
    console.log(`   Game: ${rosters.team1.teamName} vs ${rosters.team2.teamName}`);
    console.log(`   Score: ${boxScore.team1.score} - ${boxScore.team2.score}`);
    console.log(
      `   Records: ${records.team1.wins}-${records.team1.losses} vs ${records.team2.wins}-${records.team2.losses}`,
    );
    console.log(
      `   Winner: ${boxScore.winner === 'team1' ? rosters.team1.teamName : rosters.team2.teamName}`,
    );
    console.log(`   Margin: ${boxScore.margin} points`);
    console.log('\n✅ RECAP-008 Complete!\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('='.repeat(60));
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
};

// Run tests
testMatchupDataTools();
