#!/usr/bin/env node

/**
 * Historical Data Tester for Sleeper API
 *
 * Tests how far back the Sleeper stats/projections API goes
 * and collects sample data to derive variance constants
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  baseUrl: 'https://api.sleeper.app/v1',
  rateLimitMs: 300, // Be extra conservative for historical data
  outputDir: '../historical-testing',
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testHistoricalAvailability() {
  console.log('🕰️  Testing Historical Data Availability');
  console.log('=====================================\n');

  const results = [];

  // Test seasons from 2015 to 2024
  const seasonsToTest = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const weeksToTest = [1, 8, 17]; // Early, mid, late season

  for (const season of seasonsToTest) {
    console.log(`Testing season ${season}...`);

    const seasonResult = {
      season,
      statsAvailable: [],
      projectionsAvailable: [],
      totalPlayersStats: {},
      totalPlayersProjections: {},
      sampleWeeks: weeksToTest,
    };

    for (const week of weeksToTest) {
      console.log(`  Week ${week}...`);

      // Test stats endpoint
      try {
        const statsUrl = `${CONFIG.baseUrl}/stats/nfl/regular/${season}/${week}`;
        const statsResponse = await fetch(statsUrl);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const playerCount = Object.keys(statsData).length;

          seasonResult.statsAvailable.push(week);
          seasonResult.totalPlayersStats[week] = playerCount;

          console.log(`    ✅ Stats: ${playerCount} players`);
        } else {
          console.log(`    ❌ Stats: ${statsResponse.status}`);
        }

        await delay(CONFIG.rateLimitMs);

        // Test projections endpoint
        const projectionsUrl = `${CONFIG.baseUrl}/projections/nfl/regular/${season}/${week}`;
        const projectionsResponse = await fetch(projectionsUrl);

        if (projectionsResponse.ok) {
          const projectionsData = await projectionsResponse.json();
          const playerCount = Object.keys(projectionsData).length;

          seasonResult.projectionsAvailable.push(week);
          seasonResult.totalPlayersProjections[week] = playerCount;

          console.log(`    ✅ Projections: ${playerCount} players`);
        } else {
          console.log(`    ❌ Projections: ${projectionsResponse.status}`);
        }

        await delay(CONFIG.rateLimitMs);
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
      }
    }

    results.push(seasonResult);
    console.log('');
  }

  return results;
}

async function collectSampleHistoricalData(availabilityResults) {
  console.log('📊 Collecting Sample Historical Data');
  console.log('===================================\n');

  const sampleData = {
    collectionDate: new Date().toISOString(),
    purpose: 'Variance analysis for lightweight simulation engine',
    seasons: {},
  };

  // Find the earliest season with good data coverage
  const viableSeasons = availabilityResults.filter(
    season => season.statsAvailable.length >= 2 && season.projectionsAvailable.length >= 2
  );

  console.log(`Found ${viableSeasons.length} viable seasons for data collection\n`);

  // Collect detailed data from 2-3 recent viable seasons
  const seasonsToCollect = viableSeasons.slice(-3); // Last 3 viable seasons

  for (const seasonInfo of seasonsToCollect) {
    console.log(`Collecting detailed data for ${seasonInfo.season}...`);

    const seasonData = {
      season: seasonInfo.season,
      weeks: {},
      playerConsistency: {},
      positionVariance: {},
    };

    // Collect data from available weeks
    for (const week of seasonInfo.statsAvailable) {
      console.log(`  Collecting week ${week} data...`);

      try {
        // Get stats data
        const statsUrl = `${CONFIG.baseUrl}/stats/nfl/regular/${seasonInfo.season}/${week}`;
        const statsResponse = await fetch(statsUrl);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();

          // Get projections data
          await delay(CONFIG.rateLimitMs);
          const projectionsUrl = `${CONFIG.baseUrl}/projections/nfl/regular/${seasonInfo.season}/${week}`;
          const projectionsResponse = await fetch(projectionsUrl);

          let projectionsData = {};
          if (projectionsResponse.ok) {
            projectionsData = await projectionsResponse.json();
          }

          // Store week data with analysis
          seasonData.weeks[week] = {
            stats: statsData,
            projections: projectionsData,
            analysis: analyzeWeekData(statsData, projectionsData),
          };

          console.log(`    ✅ Week ${week}: ${Object.keys(statsData).length} players`);
        }

        await delay(CONFIG.rateLimitMs);
      } catch (error) {
        console.log(`    ❌ Week ${week} error: ${error.message}`);
      }
    }

    // Calculate season-level variance metrics
    seasonData.positionVariance = calculatePositionVariance(seasonData.weeks);

    sampleData.seasons[seasonInfo.season] = seasonData;
  }

  return sampleData;
}

function analyzeWeekData(statsData, projectionsData) {
  const analysis = {
    playerCount: Object.keys(statsData).length,
    projectionCount: Object.keys(projectionsData).length,
    positions: {},
    variance: {},
  };

  // Analyze by position
  for (const [playerId, stats] of Object.entries(statsData)) {
    // Try to determine position from stats (crude but workable)
    const position = determinePosition(stats);

    if (!analysis.positions[position]) {
      analysis.positions[position] = {
        count: 0,
        totalPoints: 0,
        scores: [],
      };
    }

    const fantasyPoints = calculateBasicFantasyPoints(stats);
    analysis.positions[position].count++;
    analysis.positions[position].totalPoints += fantasyPoints;
    analysis.positions[position].scores.push(fantasyPoints);
  }

  // Calculate variance by position
  for (const [position, data] of Object.entries(analysis.positions)) {
    const mean = data.totalPoints / data.count;
    const variance =
      data.scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / data.count;
    const stdDev = Math.sqrt(variance);

    analysis.variance[position] = {
      mean,
      stdDev,
      coefficientOfVariation: stdDev / mean,
    };
  }

  return analysis;
}

function determinePosition(stats) {
  // Simple position detection based on stat types
  if (stats.pass_att || stats.pass_yd) return 'QB';
  if (stats.rush_att && stats.rush_att > (stats.rec || 0)) return 'RB';
  if (stats.rec && stats.rec > (stats.rush_att || 0)) return stats.rec > 8 ? 'WR' : 'TE';
  if (stats.fgm || stats.xpm) return 'K';
  if (stats.def_int || stats.def_fum_rec) return 'DEF';

  // Fallback based on receiving vs rushing
  if (stats.rec) return 'WR';
  if (stats.rush_att) return 'RB';

  return 'UNKNOWN';
}

function calculateBasicFantasyPoints(stats) {
  let points = 0;

  // Passing (assuming standard scoring)
  points += (stats.pass_yd || 0) * 0.04;
  points += (stats.pass_td || 0) * 4;
  points += (stats.pass_int || 0) * -2;

  // Rushing
  points += (stats.rush_yd || 0) * 0.1;
  points += (stats.rush_td || 0) * 6;

  // Receiving
  points += (stats.rec_yd || 0) * 0.1;
  points += (stats.rec_td || 0) * 6;

  // Kicking
  points += (stats.fgm || 0) * 3; // Simplified
  points += (stats.xpm || 0) * 1;

  // Defense (simplified)
  points += (stats.def_int || 0) * 2;
  points += (stats.def_fum_rec || 0) * 2;
  points += (stats.def_td || 0) * 6;

  return Math.max(0, points);
}

function calculatePositionVariance(weekData) {
  const positionStats = {};

  // Aggregate all weeks
  for (const [week, data] of Object.entries(weekData)) {
    if (!data.analysis || !data.analysis.positions) continue;

    for (const [position, stats] of Object.entries(data.analysis.positions)) {
      if (!positionStats[position]) {
        positionStats[position] = {
          allScores: [],
          weeklyMeans: [],
        };
      }

      positionStats[position].allScores.push(...stats.scores);
      positionStats[position].weeklyMeans.push(stats.totalPoints / stats.count);
    }
  }

  // Calculate overall variance by position
  const variance = {};
  for (const [position, data] of Object.entries(positionStats)) {
    const allScores = data.allScores;
    const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const variance_calc =
      allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
    const stdDev = Math.sqrt(variance_calc);

    variance[position] = {
      sampleSize: allScores.length,
      mean: mean,
      stdDev: stdDev,
      coefficientOfVariation: stdDev / mean,
      weeklyConsistency: calculateWeeklyConsistency(data.weeklyMeans),
    };
  }

  return variance;
}

function calculateWeeklyConsistency(weeklyMeans) {
  if (weeklyMeans.length < 2) return null;

  const mean = weeklyMeans.reduce((sum, val) => sum + val, 0) / weeklyMeans.length;
  const variance =
    weeklyMeans.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / weeklyMeans.length;

  return {
    weekToWeekVariance: Math.sqrt(variance),
    consistencyScore: mean / Math.sqrt(variance), // Higher = more consistent
  };
}

async function saveResults(availabilityResults, sampleData) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, CONFIG.outputDir);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    // Save availability results
    await fs.writeFile(
      path.join(outputDir, `availability-${timestamp}.json`),
      JSON.stringify(availabilityResults, null, 2)
    );

    // Save sample data (might be large)
    await fs.writeFile(
      path.join(outputDir, `sample-data-${timestamp}.json`),
      JSON.stringify(sampleData, null, 2)
    );

    // Create a summary for constants derivation
    const constants = deriveSimulationConstants(sampleData);
    await fs.writeFile(
      path.join(outputDir, `derived-constants-${timestamp}.json`),
      JSON.stringify(constants, null, 2)
    );

    console.log(`\n📁 Results saved to ${outputDir}`);
    console.log(`Files created:`);
    console.log(`- availability-${timestamp}.json`);
    console.log(`- sample-data-${timestamp}.json`);
    console.log(`- derived-constants-${timestamp}.json`);

    return constants;
  } catch (error) {
    console.error('Error saving results:', error);
    throw error;
  }
}

function deriveSimulationConstants(sampleData) {
  console.log('\n🎯 Deriving Simulation Constants');
  console.log('===============================');

  const constants = {
    derivedFrom: Object.keys(sampleData.seasons),
    positionVariance: {},
    gameDecayFunctions: {},
    confidenceIntervals: {},
    metadata: {
      createdAt: new Date().toISOString(),
      purpose: 'Constants for lightweight fantasy win probability simulation',
    },
  };

  // Aggregate variance across all seasons
  const aggregatedVariance = {};

  for (const [season, seasonData] of Object.entries(sampleData.seasons)) {
    if (!seasonData.positionVariance) continue;

    for (const [position, variance] of Object.entries(seasonData.positionVariance)) {
      if (!aggregatedVariance[position]) {
        aggregatedVariance[position] = {
          coefficients: [],
          means: [],
          stdDevs: [],
          sampleSizes: [],
        };
      }

      aggregatedVariance[position].coefficients.push(variance.coefficientOfVariation);
      aggregatedVariance[position].means.push(variance.mean);
      aggregatedVariance[position].stdDevs.push(variance.stdDev);
      aggregatedVariance[position].sampleSizes.push(variance.sampleSize);
    }
  }

  // Calculate final constants per position
  for (const [position, data] of Object.entries(aggregatedVariance)) {
    const avgCoefficient =
      data.coefficients.reduce((sum, c) => sum + c, 0) / data.coefficients.length;
    const avgMean = data.means.reduce((sum, m) => sum + m, 0) / data.means.length;
    const totalSamples = data.sampleSizes.reduce((sum, s) => sum + s, 0);

    constants.positionVariance[position] = {
      coefficientOfVariation: avgCoefficient,
      averageFantasyPoints: avgMean,
      totalSampleSize: totalSamples,
      recommendedSimulationStdDev: avgCoefficient, // Use CV as std dev multiplier
      confidenceLevel: totalSamples > 100 ? 'High' : totalSamples > 50 ? 'Medium' : 'Low',
    };

    console.log(
      `${position}: CV=${avgCoefficient.toFixed(3)}, Avg=${avgMean.toFixed(1)} pts, n=${totalSamples}`
    );
  }

  // Basic game decay constants (can be refined later)
  constants.gameDecayFunctions = {
    linear: {
      description: 'Simple linear decay: remaining = original * (1 - gameProgress)',
      formula: 'remaining_projection = original_projection * (1 - game_progress)',
    },
    conservative: {
      description: 'Conservative decay: slower reduction early, faster late',
      formula: 'remaining_projection = original_projection * (1 - game_progress^1.5)',
    },
  };

  return constants;
}

async function main() {
  console.log('Sleeper API Historical Data Testing');
  console.log('===================================');
  console.log(`Rate limit: ${CONFIG.rateLimitMs}ms between requests\n`);

  try {
    // Test availability
    const availabilityResults = await testHistoricalAvailability();

    // Collect sample data from viable seasons
    const sampleData = await collectSampleHistoricalData(availabilityResults);

    // Save results and derive constants
    const constants = await saveResults(availabilityResults, sampleData);

    console.log('\n🎉 Historical data collection complete!');
    console.log('\nNext steps:');
    console.log('1. Review derived constants for position variance');
    console.log('2. Use constants in your lightweight simulation engine');
    console.log('3. Implement game decay functions based on findings');
  } catch (error) {
    console.error('❌ Historical data collection failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testHistoricalAvailability,
  collectSampleHistoricalData,
  deriveSimulationConstants,
};
