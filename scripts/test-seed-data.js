#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple seed data loader for testing
const DATA_DIR = path.join(__dirname, '..', 'apps', 'web', 'data');

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

console.log('🏈 Testing Gauntlet Seed Data\n');

try {
  // Test user data
  const user = loadJSON('user-dmethi.json');
  console.log('✅ User Data:');
  console.log(`   Username: ${user.username}`);
  console.log(`   User ID: ${user.user_id}`);
  console.log(`   Display Name: ${user.display_name}\n`);

  // Test league data
  const league = loadJSON('fantasy-league.json');
  console.log('✅ League Data:');
  console.log(`   Name: ${league.name}`);
  console.log(`   Status: ${league.status}`);
  console.log(`   Teams: ${league.settings.num_teams}`);
  console.log(`   Season: ${league.season}\n`);

  // Test roster positions
  console.log('✅ Roster Positions:');
  league.roster_positions.forEach((pos, i) => {
    console.log(`   ${i + 1}. ${pos}`);
  });
  console.log();

  // Test users in league
  const users = loadJSON('fantasy-league-users.json');
  console.log('✅ League Users:');
  console.log(`   Total users: ${users.length}`);
  users.slice(0, 3).forEach(user => {
    console.log(`   - ${user.display_name} (${user.user_id})`);
  });
  console.log(`   ... and ${users.length - 3} more\n`);

  // Test player stats
  const stats = loadJSON('stats-week1.json');
  const playerIds = Object.keys(stats).slice(0, 5);
  console.log('✅ Player Stats (Week 1):');
  console.log(`   Total players with stats: ${Object.keys(stats).length}`);
  console.log('   Sample stats:');
  playerIds.forEach(playerId => {
    const playerStats = stats[playerId];
    console.log(`   - Player ${playerId}: ${playerStats.pts_ppr || 0} PPR pts`);
  });
  console.log();

  // Test player sample
  const players = loadJSON('players-sample.json');
  console.log('✅ Player Sample:');
  console.log(`   Sample size: ${Object.keys(players).length} players`);
  const samplePlayerIds = Object.keys(players).slice(0, 3);
  samplePlayerIds.forEach(playerId => {
    const player = players[playerId];
    console.log(`   - ${player.first_name} ${player.last_name} (${player.position}, ${player.team})`);
  });
  console.log();

  // Test NFL state
  const nflState = loadJSON('nfl-state.json');
  console.log('✅ NFL State:');
  console.log(`   Current Season: ${nflState.season}`);
  console.log(`   Season Type: ${nflState.season_type}`);
  console.log(`   Week: ${nflState.week}`);
  console.log(`   Display Week: ${nflState.display_week}\n`);

  console.log('🎉 All seed data loaded successfully!');
  console.log('\n📊 Data Summary:');
  console.log(`   - User profile: ✅`);
  console.log(`   - League config: ✅`);
  console.log(`   - ${users.length} league users: ✅`);
  console.log(`   - ${Object.keys(stats).length} player stats: ✅`);
  console.log(`   - ${Object.keys(players).length} player profiles: ✅`);
  console.log(`   - NFL state: ✅`);

} catch (error) {
  console.error('❌ Error testing seed data:', error.message);
  process.exit(1);
} 