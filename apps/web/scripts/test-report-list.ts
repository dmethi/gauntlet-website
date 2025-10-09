#!/usr/bin/env tsx
/**
 * Test Report List Integration
 *
 * Tests the report list utility and verifies that the integration works correctly.
 * This script demonstrates how reports are discovered from the file system.
 */

import {
  getAvailableReports,
  getLatestReports,
  reportExists,
} from '../src/lib/reports/recap/utils/report-list';

const main = async (): Promise<void> => {
  console.log('🔍 Testing Report List Integration\n');

  try {
    // Test 1: Get all available reports
    console.log('1️⃣  Testing getAvailableReports()...');
    const allReports = await getAvailableReports();
    console.log(`   ✅ Found ${allReports.length} report(s)\n`);

    if (allReports.length > 0) {
      console.log('   Reports discovered:');
      allReports.forEach((report, index) => {
        console.log(`   ${index + 1}. ${report.title}`);
        console.log(`      Week: ${report.week}, Season: ${report.season}`);
        console.log(`      Status: ${report.status}`);
        console.log(`      URL: ${report.href}`);
        console.log(`      Tags: ${report.tags.join(', ')}`);
        if (report.description) {
          console.log(`      Description: ${report.description.substring(0, 80)}...`);
        }
        console.log();
      });
    } else {
      console.log('   ℹ️  No reports found. Reports will appear once generated via RECAP-019.\n');
    }

    // Test 2: Get latest reports
    console.log('2️⃣  Testing getLatestReports(3)...');
    const latestReports = await getLatestReports(3);
    console.log(`   ✅ Retrieved ${latestReports.length} latest report(s)\n`);

    // Test 3: Check if specific report exists
    console.log('3️⃣  Testing reportExists()...');
    const existsWeek5 = await reportExists(2025, 5);
    console.log(`   Week 5, 2025: ${existsWeek5 ? '✅ Exists' : '❌ Does not exist'}`);

    const existsWeek99 = await reportExists(2025, 99);
    console.log(`   Week 99, 2025: ${existsWeek99 ? '✅ Exists' : '❌ Does not exist'}`);
    console.log();

    // Test 4: Verify data structure
    if (allReports.length > 0) {
      console.log('4️⃣  Verifying data structure of first report...');
      const report = allReports[0];
      const requiredFields = ['title', 'href', 'date', 'week', 'season', 'tags', 'status'];
      const missingFields = requiredFields.filter(field => !(field in report));

      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present');
      } else {
        console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
      }

      // Validate date format
      const dateValid = !isNaN(new Date(report.date).getTime());
      console.log(`   ${dateValid ? '✅' : '❌'} Date is valid ISO timestamp`);

      // Validate URL format
      const urlValid = report.href.startsWith('/competition/reports/');
      console.log(`   ${urlValid ? '✅' : '❌'} URL follows expected format`);

      console.log();
    }

    console.log('✨ Test suite completed successfully!\n');

    console.log('📝 Next Steps:');
    console.log('   1. Complete RECAP-019 to save reports to file system');
    console.log('   2. Run this test again to verify reports are discovered');
    console.log('   3. Start dev server and visit /competition to see dynamic listing');
    console.log('   4. Visit /competition/reports to see full report feed\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

main();
