/**
 * Week 4 Report Data Generation Script
 *
 * This script fetches data from Sleeper API and generates the report-week4.json file
 * Uses the same power ranking formula as the main API route
 *
 * IMPORTANT: This script generates the DATA ONLY. After running:
 * 1. Verify all player stats are accurate
 * 2. Check records (pre-game vs post-game)
 * 3. Write narratives based on ACTUAL box scores in the JSON
 * 4. Don't guess stats - read them from the generated file!
 *
 * To run: npx tsx apps/web/src/scripts/generate-week4-report.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const WEEK = 4;
const SEASON = '2025';
const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

interface BoxRow {
  playerId: string;
  name: string;
  position: string | null;
  points: number;
}

interface Matchup {
  leagueId: string;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  teamAName?: string;
  teamBName?: string;
  pointsA: number;
  pointsB: number;
  margin: number;
  combinedPoints: number;
  boxscoreA?: BoxRow[];
  boxscoreB?: BoxRow[];
  excitementMetrics?: {
    leadChanges: number;
    avgDeltaPct: number;
  };
}

interface League {
  leagueId: string;
  leagueName: string;
  matchups: Matchup[];
}

interface PowerRanking {
  leagueId: string;
  rosterId: string;
  name: string;
  normalized: number;
  rank: number;
  deltaLabel?: string;
  wins?: number;
  losses?: number;
}

interface Standing {
  leagueId: string;
  leagueName: string;
  divisions: Record<string, any[]>;
}

interface HallOfFameEntry {
  category: string;
  description: string;
  player: string;
  team: string;
  value: string;
}

interface ReportData {
  season: string;
  week: number;
  lastUpdated: string;
  dataSource: string;
  leagues: League[];
  powerRankings: PowerRanking[];
  standings: Standing[];
  hallOfFame: HallOfFameEntry[];
  upcoming: Record<string, any[]>;
}

// Fetch all player data from Sleeper
async function fetchPlayerNames(): Promise<Map<string, { name: string; position: string }>> {
  console.log('📥 Fetching player names from Sleeper API...');
  try {
    const response = await fetch('https://api.sleeper.app/v1/players/nfl');
    const players: Record<string, any> = await response.json();

    const playerMap = new Map<string, { name: string; position: string }>();

    for (const [playerId, playerData] of Object.entries(players)) {
      if (playerData.full_name || playerData.first_name) {
        const name =
          playerData.full_name ||
          `${playerData.first_name || ''} ${playerData.last_name || ''}`.trim();
        playerMap.set(playerId, {
          name,
          position: playerData.position || null,
        });
      }
    }

    console.log(`✅ Loaded ${playerMap.size} player names`);
    return playerMap;
  } catch (error) {
    console.error('❌ Failed to fetch player names:', error);
    return new Map();
  }
}

// Calculate power rankings using the official formula:
// Power Rank = 0.5 * z(AvgPtsToDate) + 0.3 * z(ExpectedWinsCum) + 0.2 * z(RollingAvg3)
async function calculatePowerRankings(week: number): Promise<PowerRanking[]> {
  console.log(`📊 Calculating power rankings through Week ${week}...`);
  const allRankings: any[] = [];

  for (const league of GAUNTLET_LEAGUES) {
    try {
      // Fetch data for all weeks up to current week
      const [rosters, users] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
      ]);

      // Fetch all matchups up to current week
      const allMatchups = await Promise.all(
        Array.from({ length: week }, (_, i) =>
          fetch(`https://api.sleeper.app/v1/league/${league.id}/matchups/${i + 1}`).then(r =>
            r.json(),
          ),
        ),
      );

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const metrics: {
        rosterId: number;
        avgPts: number;
        expCum: number;
        roll3: number;
        teamName: string;
        wins: number;
        losses: number;
      }[] = [];

      // Calculate metrics for each team
      for (const roster of rosters) {
        let totalPoints = 0;
        let totalExpectedWins = 0;
        const recentPoints: number[] = [];
        let wins = 0;
        let losses = 0;

        // Go through each week's matchups
        for (let w = 0; w < week; w++) {
          const weekMatchups = allMatchups[w];
          const myMatchup = weekMatchups.find((m: any) => m.roster_id === roster.roster_id);

          if (myMatchup) {
            const points = myMatchup.points || 0;
            totalPoints += points;
            recentPoints.push(points);

            // Calculate expected wins for this week
            const expectedWins =
              weekMatchups.filter(
                (m: any) => m.roster_id !== roster.roster_id && points > (m.points || 0),
              ).length /
              (weekMatchups.length - 1);
            totalExpectedWins += expectedWins;

            // Calculate actual win/loss
            const opponentMatchup = weekMatchups.find(
              (m: any) => m.matchup_id === myMatchup.matchup_id && m.roster_id !== roster.roster_id,
            );
            if (opponentMatchup) {
              if (points > (opponentMatchup.points || 0)) wins++;
              else if (points < (opponentMatchup.points || 0)) losses++;
            }
          }
        }

        const owner: any = usersMap.get(roster.owner_id);
        const teamName =
          owner?.metadata?.team_name ||
          owner?.display_name ||
          owner?.username ||
          `Team ${roster.roster_id}`;

        // Calculate rolling 3-week average (or available weeks if < 3)
        const last3 = recentPoints.slice(-3);
        const roll3 = last3.reduce((a, b) => a + b, 0) / last3.length;

        metrics.push({
          rosterId: roster.roster_id,
          avgPts: totalPoints / week,
          expCum: totalExpectedWins,
          roll3,
          teamName,
          wins,
          losses,
        });
      }

      // Calculate z-scores
      const zscore = (arr: number[]) => {
        const mu = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
        const sd = Math.sqrt(
          arr.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / Math.max(1, arr.length - 1) || 0,
        );
        return arr.map(v => (sd === 0 ? 0 : (v - mu) / sd));
      };

      const zA = zscore(metrics.map(m => m.avgPts));
      const zE = zscore(metrics.map(m => m.expCum));
      const zR = zscore(metrics.map(m => m.roll3));

      // Apply power ranking formula
      for (let i = 0; i < metrics.length; i++) {
        const power = 0.5 * zA[i] + 0.3 * zE[i] + 0.2 * zR[i];
        allRankings.push({
          leagueId: league.id,
          rosterId: String(metrics[i].rosterId),
          name: metrics[i].teamName,
          rank: 0,
          normalized: power,
          wins: metrics[i].wins,
          losses: metrics[i].losses,
        });
      }
    } catch (error) {
      console.error(`❌ Failed to calculate power rankings for ${league.name}:`, error);
    }
  }

  // Sort by power ranking
  allRankings.sort((a, b) => b.normalized - a.normalized);

  // Normalize scores to mean=100, std=10
  if (allRankings.length > 0) {
    const scores = allRankings.map(r => r.normalized);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length);

    allRankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
      ranking.normalized =
        stdDev === 0
          ? 100
          : Math.round((100 + ((ranking.normalized - mean) / stdDev) * 10) * 100) / 100;
    });
  }

  console.log(`✅ Calculated power rankings for ${allRankings.length} teams`);
  return allRankings;
}

// Calculate standings
async function calculateStandings(): Promise<Standing[]> {
  console.log('📊 Calculating standings...');
  const standings: Standing[] = [];

  for (const league of GAUNTLET_LEAGUES) {
    try {
      const [rosters, users] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
      ]);

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const divisions: Record<string, any[]> = {};

      for (const roster of rosters) {
        const owner: any = usersMap.get(roster.owner_id);
        const teamName =
          owner?.metadata?.team_name ||
          owner?.display_name ||
          owner?.username ||
          `Team ${roster.roster_id}`;

        const division = roster.settings?.division || 1;
        if (!divisions[division]) divisions[division] = [];

        divisions[division].push({
          teamId: `${league.id}-${roster.roster_id}`,
          teamName,
          owner: owner?.display_name || owner?.username || 'Unknown',
          wins: roster.settings?.wins || 0,
          losses: roster.settings?.losses || 0,
          ties: roster.settings?.ties || 0,
          points: Math.round((roster.settings?.fpts || 0) * 100) / 100,
          rosterId: String(roster.roster_id),
          division,
        });
      }

      // Sort divisions and convert to named divisions
      const divisionNames = ['North', 'South', 'East', 'West'];
      const namedDivisions: Record<string, any[]> = {};

      Object.keys(divisions).forEach(divisionKey => {
        divisions[divisionKey].sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points - a.points;
        });

        const divisionIndex = parseInt(divisionKey) - 1;
        const divisionName = divisionNames[divisionIndex] || `Division ${divisionKey}`;
        namedDivisions[divisionName] = divisions[divisionKey];
      });

      standings.push({
        leagueId: league.id,
        leagueName: league.name,
        divisions: namedDivisions,
      });
    } catch (error) {
      console.error(`❌ Failed to calculate standings for ${league.name}:`, error);
    }
  }

  console.log(`✅ Calculated standings for ${standings.length} leagues`);
  return standings;
}

// Calculate upcoming matchups for next week
async function calculateUpcomingMatchups(currentWeek: number): Promise<Record<string, any[]>> {
  console.log(`📊 Calculating upcoming matchups for Week ${currentWeek + 1}...`);
  const upcoming: Record<string, any[]> = {};
  const nextWeek = currentWeek + 1;

  for (const league of GAUNTLET_LEAGUES) {
    try {
      const [rosters, users, nextWeekMatchups] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/matchups/${nextWeek}`).then(r =>
          r.json(),
        ),
      ]);

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const rostersMap = new Map(rosters.map((r: any) => [r.roster_id, r]));

      // Group by matchup_id
      const matchupGroups = new Map<number, any[]>();
      for (const m of nextWeekMatchups) {
        if (!matchupGroups.has(m.matchup_id)) {
          matchupGroups.set(m.matchup_id, []);
        }
        matchupGroups.get(m.matchup_id)!.push(m);
      }

      const leagueMatchups: any[] = [];
      for (const [matchupId, group] of matchupGroups) {
        if (group.length !== 2) continue;

        const [m1, m2] = group;
        const roster1 = rostersMap.get(m1.roster_id) as any;
        const roster2 = rostersMap.get(m2.roster_id) as any;

        const owner1 = usersMap.get(roster1?.owner_id) as any;
        const owner2 = usersMap.get(roster2?.owner_id) as any;

        leagueMatchups.push({
          matchupId,
          teamAName: owner1?.metadata?.team_name || owner1?.display_name || `Team ${m1.roster_id}`,
          teamBName: owner2?.metadata?.team_name || owner2?.display_name || `Team ${m2.roster_id}`,
          teamARecord: `${roster1?.settings?.wins || 0}-${roster1?.settings?.losses || 0}`,
          teamBRecord: `${roster2?.settings?.wins || 0}-${roster2?.settings?.losses || 0}`,
        });
      }

      upcoming[league.id] = leagueMatchups;
    } catch (error) {
      console.error(`❌ Failed to calculate upcoming matchups for ${league.name}:`, error);
      upcoming[league.id] = [];
    }
  }

  console.log(`✅ Calculated upcoming matchups`);
  return upcoming;
}

async function generateWeek4Report() {
  console.log(`\n🏈 ============================================`);
  console.log(`📊 Generating Week ${WEEK} Report Data`);
  console.log(`🏈 ============================================\n`);

  // Fetch player names first
  const playerMap = await fetchPlayerNames();

  const leagues: League[] = [];

  for (const league of GAUNTLET_LEAGUES) {
    console.log(`\n🏈 Processing ${league.name}...`);

    try {
      const [rosters, users, matchups] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/matchups/${WEEK}`).then(r =>
          r.json(),
        ),
      ]);

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const rostersMap = new Map(rosters.map((r: any) => [r.roster_id, r]));

      // Group matchups
      const matchupGroups = new Map<number, any[]>();
      for (const m of matchups) {
        if (!matchupGroups.has(m.matchup_id)) {
          matchupGroups.set(m.matchup_id, []);
        }
        matchupGroups.get(m.matchup_id)!.push(m);
      }

      // Process matchups
      const leagueMatchups: Matchup[] = [];
      for (const [matchupId, group] of matchupGroups) {
        if (group.length !== 2) continue;

        const [m1, m2] = group;
        const roster1 = rostersMap.get(m1.roster_id) as any;
        const roster2 = rostersMap.get(m2.roster_id) as any;

        const owner1 = usersMap.get(roster1?.owner_id) as any;
        const owner2 = usersMap.get(roster2?.owner_id) as any;

        // Create box scores with actual player names
        const boxscoreA: BoxRow[] = (m1.starters || []).map((playerId: string, idx: number) => {
          const playerInfo = playerMap.get(playerId);
          return {
            playerId,
            name: playerInfo?.name || 'Unknown Player',
            position: playerInfo?.position || null,
            points: m1.starters_points?.[idx] || 0,
          };
        });

        const boxscoreB: BoxRow[] = (m2.starters || []).map((playerId: string, idx: number) => {
          const playerInfo = playerMap.get(playerId);
          return {
            playerId,
            name: playerInfo?.name || 'Unknown Player',
            position: playerInfo?.position || null,
            points: m2.starters_points?.[idx] || 0,
          };
        });

        leagueMatchups.push({
          leagueId: league.id,
          matchupId,
          rosterAId: m1.roster_id,
          rosterBId: m2.roster_id,
          teamAName: owner1?.metadata?.team_name || owner1?.display_name || `Team ${m1.roster_id}`,
          teamBName: owner2?.metadata?.team_name || owner2?.display_name || `Team ${m2.roster_id}`,
          pointsA: m1.points || 0,
          pointsB: m2.points || 0,
          margin: Math.abs((m1.points || 0) - (m2.points || 0)),
          combinedPoints: (m1.points || 0) + (m2.points || 0),
          boxscoreA,
          boxscoreB,
        });
      }

      leagues.push({
        leagueId: league.id,
        leagueName: league.name,
        matchups: leagueMatchups,
      });

      console.log(`✅ Processed ${leagueMatchups.length} matchups`);
    } catch (error) {
      console.error(`❌ Error processing ${league.name}:`, error);
    }
  }

  // Calculate power rankings, standings, and upcoming
  const [powerRankings, standings, upcoming] = await Promise.all([
    calculatePowerRankings(WEEK),
    calculateStandings(),
    calculateUpcomingMatchups(WEEK),
  ]);

  const reportData: ReportData = {
    season: SEASON,
    week: WEEK,
    lastUpdated: new Date().toISOString(),
    dataSource: 'sleeper-api-calculated',
    leagues,
    powerRankings,
    standings,
    hallOfFame: [],
    upcoming,
  };

  // Write to file
  const outputPath = path.join(process.cwd(), 'apps/web/data/report-week4.json');
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));

  console.log(`\n✅ ============================================`);
  console.log(`📁 Week ${WEEK} report generated successfully!`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`✅ ============================================\n`);
  console.log(`📝 Next steps:`);
  console.log(`   1. Fill in narrative content in page.tsx`);
  console.log(`   2. Add Hall of Fame entries if desired`);
  console.log(`   3. Test at /competition/reports/2025/week-4`);
  console.log(``);
}

generateWeek4Report().catch(console.error);
