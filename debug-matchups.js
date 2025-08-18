#!/usr/bin/env node

/**
 * Debug script for matchups API
 * Run with: node debug-matchups.js
 */

const http = require('http');

const LEAGUE_ID = '997670420490801152';
const BASE_URL = 'http://localhost:3001';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`\n🌐 Making request to: ${url}`);

    const req = http.get(url, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`📊 JSON Response:`, JSON.stringify(parsed, null, 2));
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          console.log(`📄 Text Response:`, data.substring(0, 200));
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', e => {
      console.log(`💥 Request failed:`, e.message);
      reject(e);
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ Request timed out`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function debugMatchups() {
  console.log('🔍 Starting matchups debugging...\n');

  try {
    // Test server health
    console.log('='.repeat(50));
    console.log('1. Testing server health...');
    await makeRequest('/');

    // Test league overview
    console.log('\n' + '='.repeat(50));
    console.log('2. Testing league overview...');
    await makeRequest('/api/league/overview');

    // Test matchups for different weeks
    console.log('\n' + '='.repeat(50));
    console.log('3. Testing matchups API...');

    for (let week = 1; week <= 5; week++) {
      console.log(`\n--- Week ${week} ---`);
      try {
        const result = await makeRequest(`/api/matchups/${LEAGUE_ID}/${week}`);
        if (result.status === 200 && result.data && typeof result.data === 'object') {
          if (result.data.matchups && result.data.matchups.length > 0) {
            console.log(`✅ Found ${result.data.matchups.length} matchups for week ${week}`);
            console.log(`📊 Sample matchup:`, result.data.matchups[0].matchupId || 'No matchupId');
            break; // Found data, stop checking more weeks
          } else {
            console.log(`❌ No matchups found for week ${week}`);
            console.log(`📄 Response structure:`, Object.keys(result.data || {}));
          }
        } else {
          console.log(`❌ Invalid response for week ${week}`, result.status);
        }
      } catch (e) {
        console.log(`💥 Error fetching week ${week}:`, e.message);
      }
    }

    // Test a specific matchup
    console.log('\n' + '='.repeat(50));
    console.log('4. Testing specific matchup...');
    await makeRequest(`/api/matchups/${LEAGUE_ID}/1/1`);
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }

  console.log('\n🏁 Debug complete!');
}

// Run the debug
debugMatchups().catch(console.error);
