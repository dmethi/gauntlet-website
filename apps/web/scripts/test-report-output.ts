#!/usr/bin/env tsx
/**
 * Test script for Report Output Formatter and Validator
 *
 * Usage:
 *   npx tsx scripts/test-report-output.ts
 */

import {
  formatRecapReport,
  validateReport,
  summarizeValidation,
  isProductionReady,
} from '../src/lib/reports/recap/output';
import type { RecapReportState } from '../src/lib/reports/recap/state';

/**
 * Create a mock state for testing
 */
const createMockState = (): RecapReportState => {
  const startTime = Date.now() - 120000; // 2 minutes ago

  return {
    week: 5,
    season: 2025,
    generatedAt: new Date().toISOString(),
    tokensUsed: 45231,
    leagueOverview:
      'Week 5 brought explosive scoring across both leagues with several teams surpassing 130 points. The AFC saw close battles while the NFC featured bigger blowouts.',
    hallOfFame:
      'Rico Dowdle dominated Week 5 with a league-leading 33.9 points. Baker Mayfield and C.J. Stroud both surpassed 27 points at quarterback.',
    hallOfShame:
      'Several teams struggled to reach 90 points this week. The biggest busts came from highly-projected players who failed to deliver.',
    powerRankings:
      'Marginal Returns remains undefeated at 5-0. DJ Herbussy and Nacua Matata continue to dominate their respective leagues with strong performances.',
    standings:
      'AFC playoff race tightens with multiple teams at 3-2. NFC sees Marginal Returns pulling away at 5-0 while several teams fight for wild card spots.',
    upcoming:
      'Week 6 features several key matchups that could shake up the playoff picture. Top teams face tough tests against motivated underdogs.',
    closing:
      'Week 5 showcased the unpredictable nature of fantasy football. As we head into Week 6, the playoff picture is starting to take shape with key matchups ahead.',
    matchupNarratives: [
      {
        matchupId: 1,
        leagueId: '1263744209295245312',
        narrative:
          'In a thrilling AFC showdown, Team A defeated Team B by a narrow margin. Key performances from star players sealed the victory.',
        metadata: {
          finalScore: '125.29 - 91.08',
          winner: 'Team A',
          excitementLevel: 'high',
          keyPlayers: ['Patrick Mahomes', 'Javonte Williams'],
          wordCount: 150,
        },
      },
    ],
    errors: [],
    sectionMetadata: {
      leagueOverview: {
        startTime,
        endTime: startTime + 15000,
        duration: 15000,
        tokensUsed: 5000,
        status: 'completed',
      },
      hallOfFame: {
        startTime: startTime + 15000,
        endTime: startTime + 30000,
        duration: 15000,
        tokensUsed: 6000,
        status: 'completed',
      },
      hallOfShame: {
        startTime: startTime + 30000,
        endTime: startTime + 45000,
        duration: 15000,
        tokensUsed: 5500,
        status: 'completed',
      },
      powerRankings: {
        startTime: startTime + 45000,
        endTime: startTime + 60000,
        duration: 15000,
        tokensUsed: 7000,
        status: 'completed',
      },
      standings: {
        startTime: startTime + 60000,
        endTime: startTime + 75000,
        duration: 15000,
        tokensUsed: 6500,
        status: 'completed',
      },
      matchupNarratives: {
        startTime: startTime + 75000,
        endTime: startTime + 105000,
        duration: 30000,
        tokensUsed: 12000,
        status: 'completed',
      },
      upcoming: {
        startTime: startTime + 105000,
        endTime: startTime + 115000,
        duration: 10000,
        tokensUsed: 4000,
        status: 'completed',
      },
      closing: {
        startTime: startTime + 115000,
        endTime: startTime + 120000,
        duration: 5000,
        tokensUsed: 3231,
        status: 'completed',
      },
    },
  };
};

/**
 * Test formatter
 */
const testFormatter = () => {
  console.log('\n📝 Testing Report Formatter\n');
  console.log('='.repeat(60));

  const state = createMockState();
  const report = formatRecapReport(state);

  console.log(`\n✅ Report formatted successfully`);
  console.log(`\n📊 Report Metadata:`);
  console.log(`   Week: ${report.metadata.week}`);
  console.log(`   Season: ${report.metadata.season}`);
  console.log(`   Status: ${report.metadata.status}`);
  console.log(`   Generation Time: ${report.metadata.generationTime}ms`);
  console.log(`   Tokens Used: ${report.metadata.tokensUsed}`);
  console.log(`   Version: ${report.metadata.version}`);

  console.log(`\n📄 Sections Generated:`);
  console.log(`   League Overview: ${report.sections.leagueOverview.narrative.length} chars`);
  console.log(`   Hall of Fame: ${report.sections.hallOfFame.narrative.length} chars`);
  console.log(`   Hall of Shame: ${report.sections.hallOfShame.narrative.length} chars`);
  console.log(`   Power Rankings: ${report.sections.powerRankings.narrative.length} chars`);
  console.log(`   Standings: ${report.sections.standings.narrative.length} chars`);
  console.log(`   Matchup Narratives: ${report.sections.matchupNarratives.length} matchups`);
  console.log(`   Upcoming: ${report.sections.upcoming.narrative.length} chars`);
  console.log(`   Closing: ${report.sections.closing.narrative.length} chars`);

  return report;
};

/**
 * Test validator
 */
const testValidator = (report: any) => {
  console.log('\n\n🔍 Testing Report Validator\n');
  console.log('='.repeat(60));

  const validation = validateReport(report);

  console.log(`\n${validation.isValid ? '✅' : '❌'} Validation Result:`);
  console.log(`   Valid: ${validation.isValid}`);
  console.log(`   Quality Score: ${validation.score}/100`);
  console.log(`   Production Ready: ${isProductionReady(validation) ? '✅ Yes' : '❌ No'}`);

  if (validation.errors.length > 0) {
    console.log(`\n⚠️  Errors (${validation.errors.length}):`);
    validation.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. [${error.severity.toUpperCase()}] ${error.location}`);
      console.log(`      ${error.message}`);
    });
  } else {
    console.log(`\n✅ No errors found`);
  }

  if (validation.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${validation.warnings.length}):`);
    validation.warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. [${warning.type}] ${warning.location}`);
      console.log(`      ${warning.message}`);
      if (warning.suggestion) {
        console.log(`      💡 ${warning.suggestion}`);
      }
    });
  } else {
    console.log(`\n✅ No warnings found`);
  }

  console.log(`\n📋 Validation Summary:\n`);
  console.log(summarizeValidation(validation));
};

/**
 * Test partial failure scenario
 */
const testPartialFailure = () => {
  console.log('\n\n⚠️  Testing Partial Failure Scenario\n');
  console.log('='.repeat(60));

  const state = createMockState();

  // Simulate some sections failing
  state.hallOfShame = '';
  state.sectionMetadata!.hallOfShame!.status = 'failed';
  state.sectionMetadata!.hallOfShame!.error = 'API timeout';

  state.upcoming = '';
  state.sectionMetadata!.upcoming!.status = 'failed';
  state.sectionMetadata!.upcoming!.error = 'Data not available';

  const report = formatRecapReport(state);

  console.log(`\n📊 Report Status: ${report.metadata.status}`);
  console.log(`\n❌ Errors:`);
  report.metadata.errors?.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });

  const validation = validateReport(report);
  console.log(`\n🔍 Validation Score: ${validation.score}/100`);
  console.log(`   Production Ready: ${isProductionReady(validation) ? '✅ Yes' : '❌ No'}`);
};

/**
 * Test complete failure scenario
 */
const testCompleteFailure = () => {
  console.log('\n\n❌ Testing Complete Failure Scenario\n');
  console.log('='.repeat(60));

  const state: RecapReportState = {
    week: 5,
    season: 2025,
    generatedAt: new Date().toISOString(),
    tokensUsed: 0,
    errors: ['Failed to initialize report generation'],
    sectionMetadata: {
      leagueOverview: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      hallOfFame: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      hallOfShame: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      powerRankings: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      standings: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      matchupNarratives: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      upcoming: {
        status: 'failed',
        error: 'Data fetch failed',
      },
      closing: {
        status: 'failed',
        error: 'Data fetch failed',
      },
    },
  };

  const report = formatRecapReport(state);

  console.log(`\n📊 Report Status: ${report.metadata.status}`);
  console.log(`\n❌ Errors (${report.metadata.errors?.length || 0}):`);
  report.metadata.errors?.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });

  const validation = validateReport(report);
  console.log(`\n🔍 Validation Score: ${validation.score}/100`);
  console.log(`   Production Ready: ${isProductionReady(validation) ? '✅ Yes' : '❌ No'}`);
};

/**
 * Main execution
 */
const main = () => {
  console.log('\n🧪 Report Output System Test Suite');
  console.log('='.repeat(60));

  try {
    // Test 1: Successful report formatting
    const report = testFormatter();

    // Test 2: Report validation
    testValidator(report);

    // Test 3: Partial failure handling
    testPartialFailure();

    // Test 4: Complete failure handling
    testCompleteFailure();

    console.log('\n\n✅ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n\n❌ Test suite failed:', error);
    process.exit(1);
  }
};

main();
