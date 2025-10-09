/**
 * Test Script for Dynamic Report Pages
 *
 * Tests the dynamic report loading system without running a dev server.
 * Validates:
 * - Report loader utility
 * - File system access
 * - Report structure
 * - Static params generation
 */

import {
  loadRecapReport,
  getAvailableReports,
  getStaticReportParams,
} from '../src/lib/reports/recap/utils/report-loader';

const testDynamicReports = async () => {
  console.log('🧪 Testing Dynamic Report Pages\n');

  // Test 1: Get all available reports
  console.log('Test 1: Scanning for available reports...');
  try {
    const reports = await getAvailableReports();
    console.log(`✅ Found ${reports.length} reports`);

    if (reports.length > 0) {
      console.log('\nAvailable reports:');
      reports.forEach(r => {
        console.log(`  - ${r.title} (${r.status})`);
        console.log(`    URL: ${r.href}`);
        console.log(`    Generated: ${new Date(r.date).toLocaleString()}`);
      });
    } else {
      console.log('⚠️  No reports found in data/reports/recap/');
      console.log('   Generate a report first with: npm run generate-recap -- --week 5');
    }
  } catch (error) {
    console.error('❌ Failed to scan reports:', error);
  }

  // Test 2: Generate static params
  console.log('\n\nTest 2: Generating static params...');
  try {
    const params = await getStaticReportParams();
    console.log(`✅ Generated ${params.length} static param combinations`);

    if (params.length > 0) {
      console.log('\nStatic params:');
      params.forEach(p => {
        console.log(`  - { season: "${p.season}", week: "${p.week}" }`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to generate static params:', error);
  }

  // Test 3: Load a specific report (if any exist)
  console.log('\n\nTest 3: Loading a specific report...');
  try {
    const reports = await getAvailableReports();

    if (reports.length > 0) {
      const firstReport = reports[0];
      console.log(`Attempting to load: ${firstReport.season}/week-${firstReport.week}`);

      const report = await loadRecapReport(
        firstReport.season.toString(),
        firstReport.week.toString(),
      );

      if (report) {
        console.log('✅ Report loaded successfully');
        console.log('\nReport metadata:');
        console.log(`  Week: ${report.metadata.week}`);
        console.log(`  Season: ${report.metadata.season}`);
        console.log(`  Status: ${report.metadata.status}`);
        console.log(`  Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}`);
        console.log(`  Generation time: ${(report.metadata.generationTime / 1000).toFixed(1)}s`);
        console.log(`  Tokens used: ${report.metadata.tokensUsed.toLocaleString()}`);

        console.log('\nSections:');
        console.log(`  League Overview: ${report.sections.leagueOverview ? '✅' : '❌'}`);
        console.log(`  Hall of Fame: ${report.sections.hallOfFame ? '✅' : '❌'}`);
        console.log(`  Hall of Shame: ${report.sections.hallOfShame ? '✅' : '❌'}`);
        console.log(`  Power Rankings: ${report.sections.powerRankings ? '✅' : '❌'}`);
        console.log(`  Standings: ${report.sections.standings ? '✅' : '❌'}`);
        console.log(
          `  Matchup Narratives: ${report.sections.matchupNarratives?.length || 0} matchups`,
        );
        console.log(`  Upcoming: ${report.sections.upcoming ? '✅' : '❌'}`);
        console.log(`  Closing: ${report.sections.closing ? '✅' : '❌'}`);

        if (report.metadata.errors && report.metadata.errors.length > 0) {
          console.log('\n⚠️  Errors:');
          report.metadata.errors.forEach(error => console.log(`  - ${error}`));
        }
      } else {
        console.error('❌ Report returned null');
      }
    } else {
      console.log('⏭️  Skipped - no reports available to test');
    }
  } catch (error) {
    console.error('❌ Failed to load report:', error);
  }

  // Test 4: Test non-existent report (should return null)
  console.log('\n\nTest 4: Testing non-existent report...');
  try {
    const report = await loadRecapReport('2099', '99');
    if (report === null) {
      console.log('✅ Correctly returned null for non-existent report');
    } else {
      console.error('❌ Expected null but got a report');
    }
  } catch (error) {
    console.error('❌ Failed with error (should return null):', error);
  }

  console.log('\n\n✨ Testing complete!\n');
  console.log('Next steps:');
  console.log('1. Generate a report: npm run generate-recap -- --week 5');
  console.log('2. Start dev server: npm run dev');
  console.log('3. Visit: http://localhost:3000/competition/reports/2025/week-5');
  console.log('4. Check: http://localhost:3000/competition/reports (reports feed)');
};

testDynamicReports().catch(console.error);
