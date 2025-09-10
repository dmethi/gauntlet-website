import 'dotenv/config';
import prisma from '../../lib/prisma.js';

// Sleeper API helpers
async function fetchSleeperMatchups(leagueId: string, week: number) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch matchups: ${response.status}`);
  }
  return response.json();
}

async function fetchSleeperRosters(leagueId: string) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch rosters: ${response.status}`);
  }
  return response.json();
}

async function fetchSleeperUsers(leagueId: string) {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }
  return response.json();
}

async function fetchSleeperPlayers() {
  const response = await fetch('https://api.sleeper.app/v1/players/nfl', {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.status}`);
  }
  return response.json();
}

function getRosterIdOffset(leagueId: string): number {
  // NFC league has roster ID offset of +2000 in database to avoid collision with AFC
  return leagueId === '1263740549504962561' ? 2000 : 0;
}

// Database helpers
async function fetchDbMatchups(leagueId: string, week: number) {
  return await prisma.matchup.findMany({
    where: { leagueId, week },
    include: {
      roster: {
        include: {
          owner: true,
        },
      },
    },
  });
}

async function fetchDbRosters(leagueId: string) {
  return await prisma.roster.findMany({
    where: { leagueId },
    include: {
      owner: true,
    },
  });
}

// Comparison functions
function compareRosterPlayers(sleeperRoster: any, dbRoster: any, players: any) {
  const sleeperPlayers = new Set(sleeperRoster.players || []);
  const dbPlayers = new Set((dbRoster.players as string[]) || []);

  const onlyInSleeper = Array.from(sleeperPlayers).filter(p => !dbPlayers.has(p));
  const onlyInDb = Array.from(dbPlayers).filter(p => !sleeperPlayers.has(p));

  return {
    rosterId: sleeperRoster.roster_id,
    dbRosterId: dbRoster.id,
    ownerName: dbRoster.owner?.displayName || dbRoster.owner?.username || 'Unknown',
    totalSleeper: sleeperPlayers.size,
    totalDb: dbPlayers.size,
    onlyInSleeper: onlyInSleeper.map(id => ({ id, name: players[id]?.full_name || id })),
    onlyInDb: onlyInDb.map(id => ({ id, name: players[id]?.full_name || id })),
    isAligned: onlyInSleeper.length === 0 && onlyInDb.length === 0,
  };
}

function compareStarters(sleeperMatchup: any, dbMatchup: any, players: any) {
  const sleeperStarters = new Set(sleeperMatchup.starters || []);
  const dbStarters = new Set((dbMatchup.starters as string[]) || []);

  const onlyInSleeper = Array.from(sleeperStarters).filter(p => !dbStarters.has(p));
  const onlyInDb = Array.from(dbStarters).filter(p => !sleeperStarters.has(p));

  return {
    rosterId: sleeperMatchup.roster_id,
    matchupId: sleeperMatchup.matchup_id,
    ownerName:
      dbMatchup.roster?.owner?.displayName || dbMatchup.roster?.owner?.username || 'Unknown',
    totalSleeper: sleeperStarters.size,
    totalDb: dbStarters.size,
    onlyInSleeper: onlyInSleeper.map(id => ({ id, name: players[id]?.full_name || id })),
    onlyInDb: onlyInDb.map(id => ({ id, name: players[id]?.full_name || id })),
    isAligned: onlyInSleeper.length === 0 && onlyInDb.length === 0,
  };
}

async function verifyRosterAlignment(leagueId: string, week: number, leagueName: string) {
  console.log(`\n🔍 === VERIFYING ${leagueName} (Week ${week}) ===`);

  try {
    console.log('📡 Fetching data from Sleeper API...');
    const [sleeperMatchups, sleeperRosters, sleeperUsers, sleeperPlayers] = await Promise.all([
      fetchSleeperMatchups(leagueId, week),
      fetchSleeperRosters(leagueId),
      fetchSleeperUsers(leagueId),
      fetchSleeperPlayers(),
    ]);

    console.log('💾 Fetching data from database...');
    const [dbMatchups, dbRosters] = await Promise.all([
      fetchDbMatchups(leagueId, week),
      fetchDbRosters(leagueId),
    ]);

    console.log(
      `✅ Data fetched - Sleeper: ${sleeperMatchups.length} matchups, ${sleeperRosters.length} rosters`
    );
    console.log(
      `✅ Data fetched - Database: ${dbMatchups.length} matchups, ${dbRosters.length} rosters`
    );

    const offset = getRosterIdOffset(leagueId);
    console.log(`📊 Using roster ID offset: +${offset} for ${leagueName}`);

    // Create lookup maps - apply offset to map Sleeper IDs to DB IDs
    const sleeperRosterMap = new Map(sleeperRosters.map(r => [r.roster_id, r]));
    const dbRosterMap = new Map(dbRosters.map(r => [r.id, r]));
    const sleeperMatchupMap = new Map(sleeperMatchups.map(m => [m.roster_id, m]));
    const dbMatchupMap = new Map(dbMatchups.map(m => [m.rosterId, m]));
    const userMap = new Map(sleeperUsers.map(u => [u.user_id, u]));

    // Compare roster players
    console.log('\n🏈 === ROSTER PLAYERS COMPARISON ===');
    const rosterComparisons = [];
    let rosterMismatches = 0;

    for (const [sleeperRosterId, sleeperRoster] of sleeperRosterMap) {
      const dbRosterId = sleeperRosterId + offset;
      const dbRoster = dbRosterMap.get(dbRosterId);
      if (!dbRoster) {
        console.log(
          `❌ Roster ${sleeperRosterId} (DB ID: ${dbRosterId}) exists in Sleeper but not in database`
        );
        rosterMismatches++;
        continue;
      }

      const comparison = compareRosterPlayers(sleeperRoster, dbRoster, sleeperPlayers);
      rosterComparisons.push(comparison);

      if (!comparison.isAligned) {
        rosterMismatches++;
        const user = userMap.get(sleeperRoster.owner_id);
        console.log(
          `\n❌ ROSTER MISMATCH - ${comparison.ownerName} (${user?.display_name || user?.username})`
        );
        console.log(
          `   Sleeper: ${comparison.totalSleeper} players, Database: ${comparison.totalDb} players`
        );

        if (comparison.onlyInSleeper.length > 0) {
          console.log(`   ➕ Only in Sleeper (${comparison.onlyInSleeper.length}):`);
          comparison.onlyInSleeper.forEach(p => console.log(`      • ${p.name} (${p.id})`));
        }

        if (comparison.onlyInDb.length > 0) {
          console.log(`   ➖ Only in Database (${comparison.onlyInDb.length}):`);
          comparison.onlyInDb.forEach(p => console.log(`      • ${p.name} (${p.id})`));
        }
      }
    }

    // Compare starters
    console.log('\n⭐ === STARTER LINEUP COMPARISON ===');
    const starterComparisons = [];
    let starterMismatches = 0;

    for (const [sleeperRosterId, sleeperMatchup] of sleeperMatchupMap) {
      const dbRosterId = sleeperRosterId + offset;
      const dbMatchup = dbMatchupMap.get(dbRosterId);
      if (!dbMatchup) {
        console.log(
          `❌ Matchup for roster ${sleeperRosterId} (DB ID: ${dbRosterId}) exists in Sleeper but not in database`
        );
        starterMismatches++;
        continue;
      }

      const comparison = compareStarters(sleeperMatchup, dbMatchup, sleeperPlayers);
      starterComparisons.push(comparison);

      if (!comparison.isAligned) {
        starterMismatches++;
        console.log(
          `\n❌ STARTER MISMATCH - ${comparison.ownerName} (Matchup ${comparison.matchupId})`
        );
        console.log(
          `   Sleeper: ${comparison.totalSleeper} starters, Database: ${comparison.totalDb} starters`
        );

        if (comparison.onlyInSleeper.length > 0) {
          console.log(`   ➕ Only in Sleeper (${comparison.onlyInSleeper.length}):`);
          comparison.onlyInSleeper.forEach(p => console.log(`      • ${p.name} (${p.id})`));
        }

        if (comparison.onlyInDb.length > 0) {
          console.log(`   ➖ Only in Database (${comparison.onlyInDb.length}):`);
          comparison.onlyInDb.forEach(p => console.log(`      • ${p.name} (${p.id})`));
        }
      }
    }

    // Summary
    console.log(`\n📊 === ALIGNMENT SUMMARY FOR ${leagueName} ===`);
    console.log(
      `🏈 Roster Players: ${rosterComparisons.length - rosterMismatches}/${rosterComparisons.length} aligned`
    );
    console.log(
      `⭐ Starter Lineups: ${starterComparisons.length - starterMismatches}/${starterComparisons.length} aligned`
    );

    if (rosterMismatches === 0 && starterMismatches === 0) {
      console.log(`✅ Perfect alignment! All rosters and starters match Sleeper.`);
    } else {
      console.log(
        `❌ Found ${rosterMismatches} roster mismatches and ${starterMismatches} starter mismatches.`
      );
      console.log(`💡 Consider running: npm run ingest:current`);
    }

    return {
      leagueName,
      rosterMismatches,
      starterMismatches,
      totalRosters: rosterComparisons.length,
      totalMatchups: starterComparisons.length,
    };
  } catch (error) {
    console.error(`❌ Error verifying ${leagueName}:`, error);
    return {
      leagueName,
      error: error.message,
      rosterMismatches: -1,
      starterMismatches: -1,
      totalRosters: 0,
      totalMatchups: 0,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const week = args[0] ? parseInt(args[0]) : 2; // Default to week 2

  console.log('🔍 ROSTER ALIGNMENT VERIFICATION SCRIPT');
  console.log('=====================================');
  console.log(`📅 Verifying Week ${week}`);
  console.log('⏳ This will compare Sleeper API data with database data...\n');

  const leagues = [
    { id: '1263744209295245312', name: 'Gauntlet AFC' },
    { id: '1263740549504962561', name: 'Gauntlet NFC' },
  ];

  const results = [];

  for (const league of leagues) {
    const result = await verifyRosterAlignment(league.id, week, league.name);
    results.push(result);
  }

  // Overall summary
  console.log('\n🎯 === OVERALL SUMMARY ===');
  let totalRosterMismatches = 0;
  let totalStarterMismatches = 0;
  let totalRosters = 0;
  let totalMatchups = 0;

  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.leagueName}: Error - ${result.error}`);
    } else {
      console.log(
        `📊 ${result.leagueName}: ${result.rosterMismatches} roster mismatches, ${result.starterMismatches} starter mismatches`
      );
      totalRosterMismatches += result.rosterMismatches;
      totalStarterMismatches += result.starterMismatches;
      totalRosters += result.totalRosters;
      totalMatchups += result.totalMatchups;
    }
  });

  if (totalRosterMismatches === 0 && totalStarterMismatches === 0) {
    console.log(
      `\n🎉 SUCCESS: All ${totalRosters} rosters and ${totalMatchups} starter lineups are perfectly aligned with Sleeper!`
    );
  } else {
    console.log(`\n⚠️  MISALIGNMENT DETECTED:`);
    console.log(`   • ${totalRosterMismatches} roster mismatches out of ${totalRosters} total`);
    console.log(`   • ${totalStarterMismatches} starter mismatches out of ${totalMatchups} total`);
    console.log(`\n🛠️  RECOMMENDED ACTIONS:`);
    console.log(`   1. Run data ingestion: npm run ingest:current`);
    console.log(
      `   2. Re-run simulations: npx tsx src/scripts/jobs/run-batch-simulations.ts ${week}`
    );
    console.log(
      `   3. Re-run this script to verify: npx tsx src/scripts/debug/verify-roster-alignment.ts ${week}`
    );
  }

  console.log('\n🏁 Verification complete!');
}

// Handle direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

export { verifyRosterAlignment };
