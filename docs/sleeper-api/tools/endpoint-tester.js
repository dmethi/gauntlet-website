#!/usr/bin/env node

/**
 * Sleeper API Endpoint Tester
 * 
 * Systematically tests all Sleeper API endpoints across multiple seasons
 * to document request formats, response schemas, and data availability.
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://api.sleeper.app/v1',
  rateLimitMs: 100, // 100ms between requests to stay under 1000/min
  seasons: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
  weeks: Array.from({ length: 18 }, (_, i) => i + 1),
  seasonTypes: ['regular', 'pre', 'post'],
  outputDir: '../testing',
  maxSampleSize: 5, // Max entries to save in examples
  testUserId: '1234567890', // Replace with actual test user ID
  testLeagueId: '987654321', // Replace with actual test league ID
  testDraftId: '123456789' // Replace with actual test draft ID
};

// Rate limiting utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTTP client with error handling
async function apiRequest(url, options = {}) {
  try {
    console.log(`Testing: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Gauntlet-API-Tester/1.0',
        ...options.headers
      },
      ...options
    });

    const result = {
      url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      result.success = true;
      result.dataType = Array.isArray(data) ? 'array' : typeof data;
      result.dataSize = JSON.stringify(data).length;
      
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          result.arrayLength = data.length;
          result.sampleData = data.slice(0, CONFIG.maxSampleSize);
        } else {
          result.objectKeys = Object.keys(data).length;
          result.sampleData = Object.fromEntries(
            Object.entries(data).slice(0, CONFIG.maxSampleSize)
          );
        }
      }
      
      result.data = data;
    } else {
      result.success = false;
      result.error = await response.text();
    }

    return result;
  } catch (error) {
    return {
      url,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Official endpoints (documented)
const OFFICIAL_ENDPOINTS = {
  user: {
    getUser: (userId) => `/user/${userId}`,
    getUserLeagues: (userId, sport, season) => `/user/${userId}/leagues/${sport}/${season}`,
    getUserDrafts: (userId, sport, season) => `/user/${userId}/drafts/${sport}/${season}`
  },
  
  leagues: {
    getLeague: (leagueId) => `/league/${leagueId}`,
    getRosters: (leagueId) => `/league/${leagueId}/rosters`,
    getUsers: (leagueId) => `/league/${leagueId}/users`,
    getMatchups: (leagueId, week) => `/league/${leagueId}/matchups/${week}`,
    getWinnersBracket: (leagueId) => `/league/${leagueId}/winners_bracket`,
    getLosersBracket: (leagueId) => `/league/${leagueId}/losers_bracket`,
    getTransactions: (leagueId, week) => `/league/${leagueId}/transactions/${week}`,
    getTradedPicks: (leagueId) => `/league/${leagueId}/traded_picks`
  },
  
  drafts: {
    getDraft: (draftId) => `/draft/${draftId}`,
    getPicks: (draftId) => `/draft/${draftId}/picks`,
    getTradedPicks: (draftId) => `/draft/${draftId}/traded_picks`
  },
  
  players: {
    getAllPlayers: () => '/players/nfl',
    getTrendingPlayers: (type, hours = 24, limit = 25) => 
      `/players/nfl/trending/${type}?lookback_hours=${hours}&limit=${limit}`
  },
  
  state: {
    getNFLState: () => '/state/nfl'
  }
};

// Undocumented endpoints (discovered through wrappers)
const UNDOCUMENTED_ENDPOINTS = {
  stats: {
    getWeeklyStats: (seasonType, season, week) => 
      `/stats/nfl/${seasonType}/${season}/${week}`,
    getSeasonStats: (seasonType, season) => 
      `/stats/nfl/${seasonType}/${season}`
  },
  
  projections: {
    getWeeklyProjections: (seasonType, season, week) => 
      `/projections/nfl/${seasonType}/${season}/${week}`,
    getSeasonProjections: (seasonType, season) => 
      `/projections/nfl/${seasonType}/${season}`
  }
};

// Test official endpoints
async function testOfficialEndpoints() {
  const results = {
    category: 'official',
    endpoints: {},
    summary: {
      tested: 0,
      successful: 0,
      failed: 0
    }
  };

  console.log('\n=== Testing Official Endpoints ===');

  // Test user endpoints
  for (const [name, endpointFn] of Object.entries(OFFICIAL_ENDPOINTS.user)) {
    const endpoint = endpointFn(CONFIG.testUserId, 'nfl', 2024);
    const result = await apiRequest(`${CONFIG.baseUrl}${endpoint}`);
    results.endpoints[name] = result;
    results.summary.tested++;
    result.success ? results.summary.successful++ : results.summary.failed++;
    await delay(CONFIG.rateLimitMs);
  }

  // Test league endpoints
  for (const [name, endpointFn] of Object.entries(OFFICIAL_ENDPOINTS.leagues)) {
    let endpoint;
    if (name === 'getMatchups' || name === 'getTransactions') {
      endpoint = endpointFn(CONFIG.testLeagueId, 8);
    } else {
      endpoint = endpointFn(CONFIG.testLeagueId);
    }
    
    const result = await apiRequest(`${CONFIG.baseUrl}${endpoint}`);
    results.endpoints[name] = result;
    results.summary.tested++;
    result.success ? results.summary.successful++ : results.summary.failed++;
    await delay(CONFIG.rateLimitMs);
  }

  // Test draft endpoints
  for (const [name, endpointFn] of Object.entries(OFFICIAL_ENDPOINTS.drafts)) {
    const endpoint = endpointFn(CONFIG.testDraftId);
    const result = await apiRequest(`${CONFIG.baseUrl}${endpoint}`);
    results.endpoints[name] = result;
    results.summary.tested++;
    result.success ? results.summary.successful++ : results.summary.failed++;
    await delay(CONFIG.rateLimitMs);
  }

  // Test player endpoints
  for (const [name, endpointFn] of Object.entries(OFFICIAL_ENDPOINTS.players)) {
    let endpoint;
    if (name === 'getTrendingPlayers') {
      endpoint = endpointFn('add'); // Test trending adds
    } else {
      endpoint = endpointFn();
    }
    
    const result = await apiRequest(`${CONFIG.baseUrl}${endpoint}`);
    results.endpoints[name] = result;
    results.summary.tested++;
    result.success ? results.summary.successful++ : results.summary.failed++;
    await delay(CONFIG.rateLimitMs);
  }

  // Test state endpoint
  for (const [name, endpointFn] of Object.entries(OFFICIAL_ENDPOINTS.state)) {
    const endpoint = endpointFn();
    const result = await apiRequest(`${CONFIG.baseUrl}${endpoint}`);
    results.endpoints[name] = result;
    results.summary.tested++;
    result.success ? results.summary.successful++ : results.summary.failed++;
    await delay(CONFIG.rateLimitMs);
  }

  return results;
}

// Test undocumented endpoints across seasons
async function testUndocumentedEndpoints() {
  const results = {
    category: 'undocumented',
    endpoints: {},
    seasonAnalysis: {},
    summary: {
      tested: 0,
      successful: 0,
      failed: 0
    }
  };

  console.log('\n=== Testing Undocumented Endpoints ===');

  // Test stats endpoints
  for (const season of CONFIG.seasons) {
    console.log(`\nTesting ${season} season...`);
    
    for (const seasonType of CONFIG.seasonTypes) {
      // Test weekly stats for first few weeks
      const testWeeks = CONFIG.weeks.slice(0, 3); // Test first 3 weeks
      
      for (const week of testWeeks) {
        const statsEndpoint = UNDOCUMENTED_ENDPOINTS.stats.getWeeklyStats(
          seasonType, season, week
        );
        
        const statsResult = await apiRequest(`${CONFIG.baseUrl}${statsEndpoint}`);
        const key = `stats_${seasonType}_${season}_${week}`;
        results.endpoints[key] = statsResult;
        results.summary.tested++;
        statsResult.success ? results.summary.successful++ : results.summary.failed++;
        
        await delay(CONFIG.rateLimitMs);

        // Test projections for same week
        const projEndpoint = UNDOCUMENTED_ENDPOINTS.projections.getWeeklyProjections(
          seasonType, season, week
        );
        
        const projResult = await apiRequest(`${CONFIG.baseUrl}${projEndpoint}`);
        const projKey = `projections_${seasonType}_${season}_${week}`;
        results.endpoints[projKey] = projResult;
        results.summary.tested++;
        projResult.success ? results.summary.successful++ : results.summary.failed++;
        
        await delay(CONFIG.rateLimitMs);
      }

      // Test season-level endpoints
      const seasonStatsEndpoint = UNDOCUMENTED_ENDPOINTS.stats.getSeasonStats(
        seasonType, season
      );
      
      const seasonStatsResult = await apiRequest(`${CONFIG.baseUrl}${seasonStatsEndpoint}`);
      const seasonKey = `stats_${seasonType}_${season}`;
      results.endpoints[seasonKey] = seasonStatsResult;
      results.summary.tested++;
      seasonStatsResult.success ? results.summary.successful++ : results.summary.failed++;
      
      await delay(CONFIG.rateLimitMs);

      const seasonProjEndpoint = UNDOCUMENTED_ENDPOINTS.projections.getSeasonProjections(
        seasonType, season
      );
      
      const seasonProjResult = await apiRequest(`${CONFIG.baseUrl}${seasonProjEndpoint}`);
      const seasonProjKey = `projections_${seasonType}_${season}`;
      results.endpoints[seasonProjKey] = seasonProjResult;
      results.summary.tested++;
      seasonProjResult.success ? results.summary.successful++ : results.summary.failed++;
      
      await delay(CONFIG.rateLimitMs);
    }

    // Analyze season data availability
    const seasonResults = Object.entries(results.endpoints)
      .filter(([key]) => key.includes(season.toString()))
      .map(([key, result]) => ({ key, success: result.success }));
    
    results.seasonAnalysis[season] = {
      total: seasonResults.length,
      successful: seasonResults.filter(r => r.success).length,
      failed: seasonResults.filter(r => !r.success).length,
      successRate: seasonResults.filter(r => r.success).length / seasonResults.length
    };
  }

  return results;
}

// Generate schemas from successful responses
function generateSchemas(results) {
  const schemas = {};

  for (const [endpointName, result] of Object.entries(results.endpoints)) {
    if (result.success && result.data) {
      schemas[endpointName] = {
        endpoint: result.url,
        responseType: result.dataType,
        schema: generateSchema(result.data),
        example: result.sampleData
      };
    }
  }

  return schemas;
}

// Simple schema generator
function generateSchema(data, depth = 0) {
  if (depth > 3) return 'object'; // Prevent infinite recursion

  if (Array.isArray(data)) {
    if (data.length === 0) return { type: 'array', items: 'unknown' };
    return {
      type: 'array',
      items: generateSchema(data[0], depth + 1)
    };
  }

  if (data === null) return { type: 'null' };
  
  if (typeof data !== 'object') {
    return { type: typeof data };
  }

  const schema = { type: 'object', properties: {} };
  
  for (const [key, value] of Object.entries(data)) {
    schema.properties[key] = generateSchema(value, depth + 1);
  }

  return schema;
}

// Save results to files
async function saveResults(results, schemas) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testDir = path.join(__dirname, CONFIG.outputDir, `test-run-${timestamp}`);
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Save raw results
    await fs.writeFile(
      path.join(testDir, 'results.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Save schemas
    await fs.writeFile(
      path.join(testDir, 'schemas.json'),
      JSON.stringify(schemas, null, 2)
    );
    
    // Generate summary report
    const summary = {
      testRun: {
        timestamp,
        totalEndpoints: results.summary.tested,
        successful: results.summary.successful,
        failed: results.summary.failed,
        successRate: results.summary.successful / results.summary.tested
      },
      seasonAnalysis: results.seasonAnalysis || {},
      discoveries: {
        newEndpoints: Object.keys(schemas).filter(name => 
          name.includes('stats') || name.includes('projections')
        ).length,
        schemasGenerated: Object.keys(schemas).length
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`\nResults saved to: ${testDir}`);
    console.log(`Generated ${Object.keys(schemas).length} schemas`);
    console.log(`Success rate: ${(summary.testRun.successRate * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('Error saving results:', error);
  }
}

// Main execution
async function main() {
  console.log('Starting Sleeper API Endpoint Testing...');
  console.log(`Rate limit: ${CONFIG.rateLimitMs}ms between requests`);
  console.log(`Testing seasons: ${CONFIG.seasons.join(', ')}`);
  
  let allResults = {
    summary: { tested: 0, successful: 0, failed: 0 },
    endpoints: {},
    seasonAnalysis: {}
  };

  // Test official endpoints
  const officialResults = await testOfficialEndpoints();
  allResults.summary.tested += officialResults.summary.tested;
  allResults.summary.successful += officialResults.summary.successful;
  allResults.summary.failed += officialResults.summary.failed;
  Object.assign(allResults.endpoints, officialResults.endpoints);

  // Test undocumented endpoints
  const undocumentedResults = await testUndocumentedEndpoints();
  allResults.summary.tested += undocumentedResults.summary.tested;
  allResults.summary.successful += undocumentedResults.summary.successful;
  allResults.summary.failed += undocumentedResults.summary.failed;
  Object.assign(allResults.endpoints, undocumentedResults.endpoints);
  allResults.seasonAnalysis = undocumentedResults.seasonAnalysis;

  // Generate schemas
  const schemas = generateSchemas(allResults);

  // Save results
  await saveResults(allResults, schemas);

  console.log('\nTesting complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  apiRequest,
  testOfficialEndpoints,
  testUndocumentedEndpoints,
  generateSchemas,
  CONFIG
}; 