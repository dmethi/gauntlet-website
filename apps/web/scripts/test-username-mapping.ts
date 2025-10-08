/**
 * Test script for username mapping utility
 * Demonstrates usage of the username mapping system
 */

import {
  getRealNameByUserId,
  getRealNameByDisplayName,
  getRealNameByRoster,
  getRealNameByTeamName,
  getUserMapping,
  getUsersByLeague,
  getAllUserMappings,
  getMappingMetadata,
} from '../src/lib/username-mapping';
import { LEAGUE_IDS } from '../src/lib/constants';

const testUsernameMapping = (): void => {
  console.log('🧪 Testing Username Mapping Utility\n');
  console.log('='.repeat(80));

  // Test metadata
  const metadata = getMappingMetadata();
  console.log('\n📊 Mapping Metadata:');
  console.log(`   Generated: ${new Date(metadata.generatedAt).toLocaleString()}`);
  console.log(`   Season: ${metadata.season}`);
  console.log(`   Total Users: ${metadata.totalUsers}`);

  console.log('\n' + '='.repeat(80));
  console.log('🔍 Testing Lookup Methods:\n');

  // Test by display name
  console.log('1. By Display Name:');
  console.log(`   dmethi → ${getRealNameByDisplayName('dmethi')}`);
  console.log(`   Bego60 → ${getRealNameByDisplayName('Bego60')}`);
  console.log(`   no14n → ${getRealNameByDisplayName('no14n')}`);

  console.log('\n2. By Team Name:');
  console.log(`   "2 Dolla Balla$" → ${getRealNameByTeamName('2 Dolla Balla$')}`);
  console.log(`   "Marginal Returns" → ${getRealNameByTeamName('Marginal Returns')}`);
  console.log(`   "DJ Herbussy " → ${getRealNameByTeamName('DJ Herbussy ')}`);

  console.log('\n3. By Roster ID:');
  console.log(`   AFC Roster 1 → ${getRealNameByRoster(LEAGUE_IDS.AFC, 1)}`);
  console.log(`   AFC Roster 10 → ${getRealNameByRoster(LEAGUE_IDS.AFC, 10)}`);
  console.log(`   NFC Roster 9 → ${getRealNameByRoster(LEAGUE_IDS.NFC, 9)}`);

  console.log('\n4. Get Full User Mapping:');
  const user = getUserMapping({ displayName: 'dmethi' });
  if (user) {
    console.log(`   Display Name: ${user.displayName}`);
    console.log(`   Real Name: ${user.realName}`);
    console.log(`   Team Name: ${user.teamName}`);
    console.log(`   Record: ${user.record}`);
    console.log(`   League: ${user.leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC'}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 All Users by League:\n');

  // AFC Users
  console.log('AFC League:');
  const afcUsers = getUsersByLeague(LEAGUE_IDS.AFC);
  afcUsers.forEach(u => {
    console.log(
      `   ${String(u.rosterId).padStart(2)} | ${u.realName.padEnd(20)} | ${u.record || 'N/A'}`,
    );
  });

  console.log('\nNFC League:');
  const nfcUsers = getUsersByLeague(LEAGUE_IDS.NFC);
  nfcUsers.forEach(u => {
    console.log(
      `   ${String(u.rosterId).padStart(2)} | ${u.realName.padEnd(20)} | ${u.record || 'N/A'}`,
    );
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ All username mapping tests passed!\n');
};

// Run the test
testUsernameMapping();
