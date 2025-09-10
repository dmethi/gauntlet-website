import 'dotenv/config';
import prisma from '../lib/prisma.js';

// Default league IDs for Gauntlet
const GAUNTLET_LEAGUES = [
  '1263740549504962561', // Gauntlet NFC
  '1263744209295245312', // Gauntlet AFC  
];

interface SleeperMatchup {
  roster_id: number;
  matchup_id?: number;
  points: number;
  custom_points?: number | null;
  starters: string[];
  starters_points: number[];
  players: string[];
  players_points: Record<string, number>;
}

async function fetchSleeperMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`, {
    headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch matchups for league ${leagueId} week ${week}: ${response.status}`);
  }
  
  return response.json();
}

function getRosterIdOffset(leagueId: string): number {
  // NFC league has roster ID offset of +2000 in database to avoid collision with AFC
  return leagueId === '1263740549504962561' ? 2000 : 0;
}

async function ingestMatchups(leagueId: string, week: number) {
  console.log(`📡 Fetching matchups for league ${leagueId}, week ${week}...`);
  const matchups = await fetchSleeperMatchups(leagueId, week);
  
  if (!matchups || matchups.length === 0) {
    console.log(`⚠️  No matchups found for week ${week}`);
    return;
  }
  
  const offset = getRosterIdOffset(leagueId);
  const leagueName = leagueId === '1263740549504962561' ? 'NFC' : 'AFC';
  console.log(`✅ Found ${matchups.length} matchups for ${leagueName}, applying roster ID offset: +${offset}`);
  
  // Upsert each matchup individually for better error handling
  const results = await Promise.allSettled(
    matchups.map(matchup => {
      const dbRosterId = matchup.roster_id + offset;
      return prisma.matchup.upsert({
        where: {
          leagueId_week_rosterId: {
            leagueId,
            week,
            rosterId: dbRosterId,
          },
        },
        update: {
          matchupId: matchup.matchup_id || null,
          points: matchup.points,
          customPoints: matchup.custom_points || null,
          starters: matchup.starters,
          startersPoints: matchup.starters_points,
          players: matchup.players,
          playersPoints: matchup.players_points,
        },
        create: {
          id: `${leagueId}-${week}-${dbRosterId}`,
          leagueId,
          week,
          rosterId: dbRosterId,
          matchupId: matchup.matchup_id || null,
          points: matchup.points,
          customPoints: matchup.custom_points || null,
          starters: matchup.starters,
          startersPoints: matchup.starters_points,
          players: matchup.players,
          playersPoints: matchup.players_points,
        },
      });
    })
  );
  
  const successes = results.filter(r => r.status === 'fulfilled').length;
  const failures = results.filter(r => r.status === 'rejected');
  
  console.log(`✅ Successfully upserted ${successes}/${matchups.length} matchups`);
  
  if (failures.length > 0) {
    console.log(`❌ Failed to upsert ${failures.length} matchups:`);
    failures.forEach((failure, idx) => {
      if (failure.status === 'rejected') {
        console.log(`   [${idx}] ${failure.reason}`);
      }
    });
  }
}

async function getCurrentWeek(): Promise<number> {
  try {
    // Use Sleeper API as source of truth for current NFL week
    const response = await fetch('https://api.sleeper.app/v1/state/nfl', {
      headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
    });
    if (response.ok) {
      const nflState = await response.json();
      return nflState.display_week || nflState.week || 2;
    }
  } catch (error) {
    console.warn('⚠️  Failed to fetch NFL state from Sleeper, using fallback');
  }

  // Fallback to date calculation
  const now = new Date();
  const seasonStart = new Date('2025-09-04'); // 2025 season start
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.max(
    1,
    Math.min(18, Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1)
  );
}

async function main() {
  const args = process.argv.slice(2);
  let week: number;
  
  if (args[0] && !isNaN(parseInt(args[0]))) {
    week = parseInt(args[0]);
    console.log(`🎯 Using specified week: ${week}`);
  } else {
    week = await getCurrentWeek();
    console.log(`📅 Using current NFL week: ${week}`);
  }
  
  console.log('🏈 CURRENT MATCHUP INGESTION SCRIPT');
  console.log('==================================');
  console.log(`📅 Ingesting Week ${week} matchup data...`);
  console.log(`🏟️  Leagues: ${GAUNTLET_LEAGUES.length} total\n`);
  
  try {
    for (const leagueId of GAUNTLET_LEAGUES) {
      const leagueNames = {
        '1263740549504962561': 'Gauntlet NFC',
        '1263744209295245312': 'Gauntlet AFC',
      };
      
      console.log(`🏆 Processing ${leagueNames[leagueId as keyof typeof leagueNames]}...`);
      await ingestMatchups(leagueId, week);
      console.log('');
    }
    
    console.log('🎉 Current matchup ingestion completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log(`   1. Verify alignment: npx tsx src/scripts/debug/verify-roster-alignment.ts ${week}`);
    console.log(`   2. Re-run simulations: npx tsx src/scripts/jobs/run-batch-simulations.ts ${week}`);
    
  } catch (error) {
    console.error('❌ Error during matchup ingestion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Handle direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ingestMatchups };
