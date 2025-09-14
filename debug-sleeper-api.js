#!/usr/bin/env node

/**
 * Debug script to test Sleeper API data access
 */

async function testSleeperAPI() {
  const leagueId = '1263744209295245312'; // Gauntlet AFC
  const week = 1; // Current week we're testing
  
  console.log('🧪 Testing Sleeper API endpoints...\n');
  
  try {
    // Test each endpoint individually
    console.log('1. Testing league endpoint...');
    const leagueResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
    console.log(`   Status: ${leagueResponse.status} ${leagueResponse.statusText}`);
    const league = await leagueResponse.json();
    console.log(`   Result: League "${league?.name}" - Season ${league?.season}\n`);
    
    console.log('2. Testing rosters endpoint...');
    const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    console.log(`   Status: ${rostersResponse.status} ${rostersResponse.statusText}`);
    const rosters = await rostersResponse.json();
    console.log(`   Result: ${Array.isArray(rosters) ? rosters.length : 'NOT ARRAY'} rosters\n`);
    
    console.log(`3. Testing matchups endpoint for week ${week}...`);
    const matchupsResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
    console.log(`   Status: ${matchupsResponse.status} ${matchupsResponse.statusText}`);
    const matchupsText = await matchupsResponse.text();
    console.log(`   Raw response: ${matchupsText.substring(0, 200)}...`);
    
    let matchups;
    try {
      matchups = JSON.parse(matchupsText);
    } catch (e) {
      console.log(`   JSON Parse Error: ${e.message}`);
      return;
    }
    
    console.log(`   Result: ${matchups === null ? 'NULL' : Array.isArray(matchups) ? matchups.length + ' matchups' : typeof matchups}\n`);
    
    // If null, test other weeks
    if (matchups === null) {
      console.log('4. Testing other weeks to find available matchup data...');
      for (let testWeek = 1; testWeek <= 5; testWeek++) {
        const testResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${testWeek}`);
        const testMatchups = await testResponse.json();
        console.log(`   Week ${testWeek}: ${testMatchups === null ? 'NULL' : Array.isArray(testMatchups) ? testMatchups.length + ' matchups' : typeof testMatchups}`);
      }
      console.log('');
    }
    
    console.log('5. Testing projections endpoint...');
    const projResponse = await fetch(`https://api.sleeper.com/projections/nfl/2025/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF`);
    console.log(`   Status: ${projResponse.status} ${projResponse.statusText}`);
    const projections = await projResponse.json();
    console.log(`   Result: ${projections ? Object.keys(projections).length + ' players' : 'NULL'}\n`);
    
    // Check NFL state
    console.log('6. Testing NFL state...');
    const nflStateResponse = await fetch('https://api.sleeper.app/v1/state/nfl');
    const nflState = await nflStateResponse.json();
    console.log(`   Current NFL State:`, {
      week: nflState.week,
      season: nflState.season,
      season_type: nflState.season_type,
      display_week: nflState.display_week
    });
    
  } catch (error) {
    console.error('❌ Error testing Sleeper API:', error);
  }
}

testSleeperAPI();
