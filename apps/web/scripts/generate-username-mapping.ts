/**
 * Generate Username to Real Name Mapping
 *
 * This script fetches all users from both AFC and NFC leagues
 * and creates a reference mapping for use in automated reports.
 */

import { sleeperClient } from '../src/lib/sleeper/unified-client';
import { LEAGUE_IDS } from '../src/lib/constants';
import type { SleeperUser, SleeperRoster } from '@gauntlet/types';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface UserMapping {
  userId: string;
  username: string;
  displayName: string;
  realName: string;
  teamName?: string;
  leagueId: string;
  rosterId: number;
  record?: string;
}

interface UsernameReference {
  generatedAt: string;
  season: string;
  users: UserMapping[];
}

// Initial mapping based on Week 5 report context
// Maps displayName OR teamName to real name
// This will be validated and can be corrected
const KNOWN_NAME_MAPPINGS: Record<string, string> = {
  // AFC League - by displayName
  no14n: 'Nolan',
  NielGetsCarried: 'Arpit & Yash',
  nkjchamp: 'Neil',
  achak7: 'Akhil',
  lazy9669: 'Adam',
  hunterzogg: 'Hunter',
  anantjindani: 'Anant',
  dparikh3: 'Darshan/Kyle',
  benweinfeld: 'Ben',
  scboom5: 'Shivang',
  kanzelm3: 'Joel',
  vchak: 'Vinay',

  // NFC League - by displayName
  Bego60: 'Jeffrey',
  ziyanp22: 'Ziyan',
  YouSmellLikeDaal: 'Aman',
  dmethi: 'Dhruv',
  vayyala: 'Vinny',
  RithikP: 'Rithik',
  Akill13: 'Akhil C',
  lukebowsh: 'Luke',
  jr212121: 'Josh',
  arnavmehta: 'Arnav',
  cescott25: 'Christian',
  lurski: 'Alex',
};

const generateUsernameMapping = async (): Promise<void> => {
  console.log('🔍 Fetching league data from Sleeper API...\n');
  console.log('='.repeat(80));

  try {
    // Fetch rosters with owners from both leagues
    const [afcData, nfcData] = await Promise.all([
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.AFC),
      sleeperClient.fetchRostersWithOwners(LEAGUE_IDS.NFC),
    ]);

    console.log(`✅ AFC: ${afcData.length} teams found`);
    console.log(`✅ NFC: ${nfcData.length} teams found`);
    console.log('='.repeat(80));
    console.log('\n📊 User Mapping Results:\n');

    const allUsers: UserMapping[] = [];

    // Process AFC league
    for (const roster of afcData) {
      const user = roster.owner as SleeperUser | undefined;
      if (!user) continue;

      const teamName = user.metadata?.team_name || 'Unknown Team';
      const realName =
        KNOWN_NAME_MAPPINGS[user.display_name] ||
        KNOWN_NAME_MAPPINGS[teamName] ||
        user.display_name;

      const settings = (roster as any).settings;
      const record = settings ? `${settings.wins}-${settings.losses}` : undefined;

      allUsers.push({
        userId: user.user_id,
        username: user.username,
        displayName: user.display_name,
        realName,
        teamName,
        leagueId: LEAGUE_IDS.AFC,
        rosterId: roster.roster_id,
        record,
      });

      console.log(
        `AFC | ${(teamName || 'Unknown').padEnd(35)} | ${(user.display_name || 'N/A').padEnd(20)} | ${realName}`,
      );
    }

    console.log('\n' + '-'.repeat(80) + '\n');

    // Process NFC league
    for (const roster of nfcData) {
      const user = roster.owner as SleeperUser | undefined;
      if (!user) continue;

      const teamName = user.metadata?.team_name || 'Unknown Team';
      const realName =
        KNOWN_NAME_MAPPINGS[user.display_name] ||
        KNOWN_NAME_MAPPINGS[teamName] ||
        user.display_name;

      const settings = (roster as any).settings;
      const record = settings ? `${settings.wins}-${settings.losses}` : undefined;

      allUsers.push({
        userId: user.user_id,
        username: user.username,
        displayName: user.display_name,
        realName,
        teamName,
        leagueId: LEAGUE_IDS.NFC,
        rosterId: roster.roster_id,
        record,
      });

      console.log(
        `NFC | ${(teamName || 'Unknown').padEnd(35)} | ${(user.display_name || 'N/A').padEnd(20)} | ${realName}`,
      );
    }

    // Create reference object
    const reference: UsernameReference = {
      generatedAt: new Date().toISOString(),
      season: '2025',
      users: allUsers.sort((a, b) => {
        // Sort by league first, then by roster ID
        if (a.leagueId !== b.leagueId) {
          return a.leagueId === LEAGUE_IDS.AFC ? -1 : 1;
        }
        return a.rosterId - b.rosterId;
      }),
    };

    // Write to file
    const outputPath = join(process.cwd(), 'data', 'username-mapping.json');
    writeFileSync(outputPath, JSON.stringify(reference, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Username mapping saved to: data/username-mapping.json`);
    console.log(`📊 Total users: ${allUsers.length}`);
    console.log('='.repeat(80));
    console.log('\n📝 Next Steps:');
    console.log('   1. Review the mapping in data/username-mapping.json');
    console.log('   2. Correct any incorrect real names');
    console.log('   3. Update KNOWN_NAME_MAPPINGS in this script if needed');
    console.log('   4. Re-run script to regenerate with corrections\n');
  } catch (error) {
    console.error('\n❌ Error generating username mapping:', error);
    process.exit(1);
  }
};

// Run the script
generateUsernameMapping();
