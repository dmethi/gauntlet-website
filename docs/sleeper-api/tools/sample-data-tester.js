#!/usr/bin/env node

/**
 * Sample Data Tester for Sleeper API
 *
 * Tests endpoints that don't require specific IDs to generate sample data
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  baseUrl: 'https://api.sleeper.app/v1',
  rateLimitMs: 200, // Be conservative
  outputDir: '../testing',
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function apiRequest(url, description) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);

    const response = await fetch(url);

    const result = {
      url,
      description,
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString(),
      success: response.ok,
    };

    if (response.ok) {
      const data = await response.json();
      result.dataType = Array.isArray(data) ? 'array' : typeof data;
      result.dataSize = JSON.stringify(data).length;

      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          result.arrayLength = data.length;
          result.sampleData = data.slice(0, 3); // First 3 items
        } else {
          result.objectKeys = Object.keys(data).length;
          // For objects, take first 3 entries
          result.sampleData = Object.fromEntries(Object.entries(data).slice(0, 3));
        }
      }

      result.fullData = data; // Store full data for analysis
    } else {
      result.error = await response.text();
    }

    return result;
  } catch (error) {
    return {
      url,
      description,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

async function testPublicEndpoints() {
  const results = [];

  console.log('=== Testing Public Endpoints (No Auth Required) ===\n');

  // Test NFL State
  let result = await apiRequest(
    `${CONFIG.baseUrl}/state/nfl`,
    'NFL State - Current season/week info'
  );
  results.push(result);
  await delay(CONFIG.rateLimitMs);

  // Test Trending Players
  result = await apiRequest(
    `${CONFIG.baseUrl}/players/nfl/trending/add?limit=5`,
    'Trending Players (Add) - Top 5'
  );
  results.push(result);
  await delay(CONFIG.rateLimitMs);

  result = await apiRequest(
    `${CONFIG.baseUrl}/players/nfl/trending/drop?limit=5`,
    'Trending Players (Drop) - Top 5'
  );
  results.push(result);
  await delay(CONFIG.rateLimitMs);

  return results;
}

async function testUndocumentedEndpoints() {
  const results = [];

  console.log('\n=== Testing Undocumented Stats/Projections Endpoints ===\n');

  // Test current season stats for a few recent weeks
  const currentSeason = 2024;
  const testWeeks = [6, 7, 8]; // Test recent weeks

  for (const week of testWeeks) {
    // Test weekly stats
    let result = await apiRequest(
      `${CONFIG.baseUrl}/stats/nfl/regular/${currentSeason}/${week}`,
      `Weekly Stats - ${currentSeason} Week ${week}`
    );
    results.push(result);
    await delay(CONFIG.rateLimitMs);

    // Test weekly projections
    result = await apiRequest(
      `${CONFIG.baseUrl}/projections/nfl/regular/${currentSeason}/${week}`,
      `Weekly Projections - ${currentSeason} Week ${week}`
    );
    results.push(result);
    await delay(CONFIG.rateLimitMs);
  }

  return results;
}

async function testPlayerDatabase() {
  const results = [];

  console.log('\n=== Testing Player Database Endpoint ===\n');

  // This is a large endpoint, so we'll be careful
  const result = await apiRequest(
    `${CONFIG.baseUrl}/players/nfl`,
    'All NFL Players - Complete Database (Warning: Large response)'
  );

  // Don't store the full player database in our results (too big)
  if (result.success && result.fullData) {
    const playerIds = Object.keys(result.fullData);
    const samplePlayer = result.fullData[playerIds[0]];

    result.analysis = {
      totalPlayers: playerIds.length,
      samplePlayerId: playerIds[0],
      samplePlayerData: samplePlayer,
      playerDataKeys: Object.keys(samplePlayer || {}),
      responseSize: `${(result.dataSize / 1024 / 1024).toFixed(2)} MB`,
    };

    // Don't save the massive full dataset
    delete result.fullData;
  }

  results.push(result);

  return results;
}

async function analyzeStatsData(statsResults) {
  console.log('\n=== Analyzing Stats Data ===\n');

  const analysis = {
    weeklyStats: {},
    projections: {},
    statCategories: new Set(),
    projectionCategories: new Set(),
    samplePlayers: {},
  };

  for (const result of statsResults) {
    if (!result.success || !result.fullData) continue;

    const data = result.fullData;
    const isProjection = result.url.includes('projections');

    if (isProjection) {
      analysis.projections[result.description] = {
        playerCount: Object.keys(data).length,
        sampleEntries: Object.entries(data)
          .slice(0, 2)
          .map(([id, stats]) => ({ id, stats })),
      };

      // Collect all projection categories
      Object.values(data).forEach(player => {
        if (typeof player === 'object' && player !== null) {
          Object.keys(player).forEach(key => analysis.projectionCategories.add(key));
        }
      });
    } else {
      analysis.weeklyStats[result.description] = {
        playerCount: Object.keys(data).length,
        sampleEntries: Object.entries(data)
          .slice(0, 2)
          .map(([id, stats]) => ({ id, stats })),
      };

      // Collect all stat categories
      Object.values(data).forEach(player => {
        if (typeof player === 'object' && player !== null) {
          Object.keys(player).forEach(key => analysis.statCategories.add(key));
        }
      });
    }
  }

  // Find players with the most complete data
  const firstStatsResult = statsResults.find(r => r.success && !r.url.includes('projections'));
  if (firstStatsResult && firstStatsResult.fullData) {
    const players = Object.entries(firstStatsResult.fullData)
      .map(([id, stats]) => ({ id, statCount: Object.keys(stats || {}).length, stats }))
      .sort((a, b) => b.statCount - a.statCount)
      .slice(0, 5);

    analysis.mostCompleteStatPlayers = players;
  }

  analysis.summary = {
    totalStatCategories: analysis.statCategories.size,
    totalProjectionCategories: analysis.projectionCategories.size,
    statCategoriesList: Array.from(analysis.statCategories).sort(),
    projectionCategoriesList: Array.from(analysis.projectionCategories).sort(),
  };

  return analysis;
}

async function saveResults(allResults, analysis) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, CONFIG.outputDir);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    // Save full results
    await fs.writeFile(
      path.join(outputDir, `sample-data-${timestamp}.json`),
      JSON.stringify(allResults, null, 2)
    );

    // Save analysis
    await fs.writeFile(
      path.join(outputDir, `analysis-${timestamp}.json`),
      JSON.stringify(analysis, null, 2)
    );

    // Create a summary report
    const summary = {
      testRun: {
        timestamp,
        totalEndpoints: allResults.length,
        successful: allResults.filter(r => r.success).length,
        failed: allResults.filter(r => !r.success).length,
      },
      endpointTypes: {
        publicEndpoints: allResults.filter(
          r => r.description.includes('NFL State') || r.description.includes('Trending')
        ).length,
        statsEndpoints: allResults.filter(r => r.description.includes('Stats')).length,
        projectionEndpoints: allResults.filter(r => r.description.includes('Projections')).length,
        playerDatabase: allResults.filter(r => r.description.includes('Players')).length,
      },
      dataDiscoveries: {
        statCategories: analysis.summary?.totalStatCategories || 0,
        projectionCategories: analysis.summary?.totalProjectionCategories || 0,
        sampleStatCategories: analysis.summary?.statCategoriesList?.slice(0, 10) || [],
        sampleProjectionCategories: analysis.summary?.projectionCategoriesList?.slice(0, 10) || [],
      },
    };

    await fs.writeFile(
      path.join(outputDir, `summary-${timestamp}.json`),
      JSON.stringify(summary, null, 2)
    );

    console.log(`\n=== Results Saved ===`);
    console.log(`Output directory: ${outputDir}`);
    console.log(`Files created:`);
    console.log(`- sample-data-${timestamp}.json (full results)`);
    console.log(`- analysis-${timestamp}.json (data analysis)`);
    console.log(`- summary-${timestamp}.json (summary report)`);

    return { timestamp, outputDir, summary };
  } catch (error) {
    console.error('Error saving results:', error);
    throw error;
  }
}

async function main() {
  console.log('Sleeper API Sample Data Collection');
  console.log('===================================');
  console.log(`Rate limit: ${CONFIG.rateLimitMs}ms between requests`);
  console.log(`Base URL: ${CONFIG.baseUrl}\n`);

  const allResults = [];

  // Test public endpoints
  const publicResults = await testPublicEndpoints();
  allResults.push(...publicResults);

  // Test undocumented endpoints
  const statsResults = await testUndocumentedEndpoints();
  allResults.push(...statsResults);

  // Test player database (careful with this one)
  const playerResults = await testPlayerDatabase();
  allResults.push(...playerResults);

  // Analyze the data
  const analysis = await analyzeStatsData(statsResults);

  // Save results
  const saveInfo = await saveResults(allResults, analysis);

  // Print quick summary
  console.log(`\n=== Quick Summary ===`);
  console.log(`Total endpoints tested: ${allResults.length}`);
  console.log(`Successful: ${allResults.filter(r => r.success).length}`);
  console.log(`Failed: ${allResults.filter(r => !r.success).length}`);

  if (analysis.summary) {
    console.log(`Stat categories found: ${analysis.summary.totalStatCategories}`);
    console.log(`Projection categories found: ${analysis.summary.totalProjectionCategories}`);
  }

  console.log('\nTest complete! Check the saved files for detailed results.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPublicEndpoints, testUndocumentedEndpoints, apiRequest };
