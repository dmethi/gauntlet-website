/**
 * Generate League-Level Playoff Summaries
 * 
 * Creates a high-level summary for each league covering:
 * - Playoff seedings on the line
 * - Teams on the bubble (making/missing playoffs)
 * - Toilet bowl seedings (bottom 2 get byes)
 * 
 * Run with: npx tsx scripts/generate-league-summaries.ts
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { LEAGUE_IDS } from '../src/lib/constants';
import { sleeperClient } from '../src/lib/sleeper/unified-client';

// Load environment variables
config({ path: resolve(__dirname, '../../../.env') });

const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.3,
  maxOutputTokens: 4096,
};

interface TeamStanding {
  rosterId: number;
  teamName: string;
  ownerName: string;
  division: number;
  wins: number;
  losses: number;
  pointsFor: number;
}

interface Week14Matchup {
  matchupId: number;
  team1RosterId: number;
  team2RosterId: number;
  team1Name: string;
  team2Name: string;
}

interface TeamPathData {
  teamName: string;
  rosterId: number;
  record: string;
  points: number;
  division: number;
  bestSeed: number;
  worstSeed: number;
  seedProbabilities: Record<number, number>; // seed -> probability %
  playoffOdds: number;
  opponent: string;
}

interface LeagueSummary {
  leagueName: string;
  generatedAt: string;
  overallSummary: string;
  playoffRace: string;
  seedingBattles: string;
  toiletBowl: string;
  keyMatchups: string[];
}

const createClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_CONFIG.model,
    temperature: GEMINI_CONFIG.temperature,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
  });
};

const fetchStandings = async (leagueId: string, throughWeek: number): Promise<TeamStanding[]> => {
  const [rosters, users] = await Promise.all([
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  const userMap = new Map(users.map(u => [u.user_id, u]));
  
  const matchupPromises = Array.from({ length: throughWeek }, (_, i) =>
    sleeperClient.fetchMatchups(leagueId, i + 1)
  );
  const allMatchups = await Promise.all(matchupPromises);

  return rosters.map(roster => {
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;

    allMatchups.forEach(weekMatchups => {
      const teamMatchup = weekMatchups.find(m => m.roster_id === roster.roster_id);
      if (!teamMatchup) return;

      const points = teamMatchup.points || 0;
      pointsFor += points;

      const opponent = weekMatchups.find(
        m => m.matchup_id === teamMatchup.matchup_id && m.roster_id !== roster.roster_id
      );
      if (!opponent) return;

      if (points > (opponent.points || 0)) wins++;
      else if (points < (opponent.points || 0)) losses++;
    });

    const owner = userMap.get(roster.owner_id);
    const rosterSettings = roster.settings as any;

    return {
      rosterId: roster.roster_id,
      teamName: owner?.metadata?.team_name || owner?.display_name || `Team ${roster.roster_id}`,
      ownerName: owner?.display_name || owner?.username || 'Unknown',
      division: rosterSettings?.division || 1,
      wins,
      losses,
      pointsFor: Math.round(pointsFor * 100) / 100,
    };
  });
};

const fetchMatchups = async (leagueId: string): Promise<Week14Matchup[]> => {
  const [matchups, rosters, users] = await Promise.all([
    sleeperClient.fetchMatchups(leagueId, 14),
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  const userMap = new Map(users.map(u => [u.user_id, u]));
  const matchupGroups = new Map<number, typeof matchups>();
  
  matchups.forEach(m => {
    if (!matchupGroups.has(m.matchup_id)) {
      matchupGroups.set(m.matchup_id, []);
    }
    matchupGroups.get(m.matchup_id)!.push(m);
  });

  const week14Matchups: Week14Matchup[] = [];
  
  matchupGroups.forEach((teams, matchupId) => {
    if (teams.length !== 2) return;
    const [team1, team2] = teams;
    const roster1 = rosters.find(r => r.roster_id === team1.roster_id);
    const roster2 = rosters.find(r => r.roster_id === team2.roster_id);
    const owner1 = roster1 ? userMap.get(roster1.owner_id) : null;
    const owner2 = roster2 ? userMap.get(roster2.owner_id) : null;

    week14Matchups.push({
      matchupId,
      team1RosterId: team1.roster_id,
      team2RosterId: team2.roster_id,
      team1Name: owner1?.metadata?.team_name || owner1?.display_name || `Team ${team1.roster_id}`,
      team2Name: owner2?.metadata?.team_name || owner2?.display_name || `Team ${team2.roster_id}`,
    });
  });

  return week14Matchups;
};

/**
 * Generate all 64 outcomes and calculate seed ranges for each team
 */
const calculatePathData = (
  standings: TeamStanding[],
  matchups: Week14Matchup[]
): TeamPathData[] => {
  const numMatchups = matchups.length;
  const totalOutcomes = Math.pow(2, numMatchups);
  
  // Initialize path data for each team
  const pathData = new Map<number, {
    bestSeed: number;
    worstSeed: number;
    seedCounts: Map<number, number>;
    playoffCount: number;
  }>();
  
  standings.forEach(team => {
    pathData.set(team.rosterId, {
      bestSeed: 12,
      worstSeed: 1,
      seedCounts: new Map(),
      playoffCount: 0,
    });
  });
  
  // Simulate all 64 outcomes
  for (let i = 0; i < totalOutcomes; i++) {
    // Apply this outcome
    const updatedStandings = standings.map(t => ({ ...t }));
    
    for (let j = 0; j < numMatchups; j++) {
      const matchup = matchups[j];
      const team1Wins = ((i >> j) & 1) === 0;
      
      const team1 = updatedStandings.find(t => t.rosterId === matchup.team1RosterId);
      const team2 = updatedStandings.find(t => t.rosterId === matchup.team2RosterId);
      
      if (team1 && team2) {
        if (team1Wins) {
          team1.wins += 1;
          team2.losses += 1;
        } else {
          team2.wins += 1;
          team1.losses += 1;
        }
      }
    }
    
    // Calculate seeds for this outcome
    const seeds = calculateSeeds(updatedStandings);
    
    // Update path data
    seeds.forEach((seed, rosterId) => {
      const data = pathData.get(rosterId)!;
      data.bestSeed = Math.min(data.bestSeed, seed);
      data.worstSeed = Math.max(data.worstSeed, seed);
      data.seedCounts.set(seed, (data.seedCounts.get(seed) || 0) + 1);
      if (seed <= 6) {
        data.playoffCount += 1;
      }
    });
  }
  
  // Convert to TeamPathData
  return standings.map(team => {
    const data = pathData.get(team.rosterId)!;
    const matchup = matchups.find(
      m => m.team1RosterId === team.rosterId || m.team2RosterId === team.rosterId
    );
    const opponent = matchup
      ? (team.rosterId === matchup.team1RosterId ? matchup.team2Name : matchup.team1Name)
      : 'BYE';
    
    const seedProbabilities: Record<number, number> = {};
    data.seedCounts.forEach((count, seed) => {
      seedProbabilities[seed] = Math.round((count / totalOutcomes) * 100);
    });
    
    return {
      teamName: team.teamName,
      rosterId: team.rosterId,
      record: `${team.wins}-${team.losses}`,
      points: team.pointsFor,
      division: team.division,
      bestSeed: data.bestSeed,
      worstSeed: data.worstSeed,
      seedProbabilities,
      playoffOdds: Math.round((data.playoffCount / totalOutcomes) * 100),
      opponent,
    };
  });
};

/**
 * Calculate playoff seeds based on standings
 * Seeds 1-3: Division winners, Seeds 4-6: Wild cards
 */
const calculateSeeds = (standings: TeamStanding[]): Map<number, number> => {
  const seeds = new Map<number, number>();
  
  // Find division winners
  const divisionWinners: TeamStanding[] = [];
  for (let div = 1; div <= 3; div++) {
    const divTeams = standings.filter(t => t.division === div);
    divTeams.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.pointsFor - a.pointsFor;
    });
    if (divTeams[0]) {
      divisionWinners.push(divTeams[0]);
    }
  }
  
  // Sort division winners by record then points
  divisionWinners.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
  
  // Assign seeds 1-3 to division winners
  divisionWinners.forEach((team, idx) => {
    seeds.set(team.rosterId, idx + 1);
  });
  
  // Find wild card teams (non-division winners)
  const nonWinners = standings.filter(
    t => !divisionWinners.some(dw => dw.rosterId === t.rosterId)
  );
  nonWinners.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
  
  // Assign seeds 4-12 to remaining teams
  nonWinners.forEach((team, idx) => {
    seeds.set(team.rosterId, idx + 4);
  });
  
  return seeds;
};

const buildLeaguePrompt = (
  leagueName: string,
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  pathData: TeamPathData[]
): string => {
  // Sort by current standing
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
  
  const standingsStr = sortedStandings
    .map((s, idx) => {
      const pd = pathData.find(p => p.rosterId === s.rosterId)!;
      return `${idx + 1}. ${s.teamName} (${s.wins}-${s.losses}, ${s.pointsFor.toFixed(1)} pts, Div ${s.division}) - Best: #${pd.bestSeed}, Worst: #${pd.worstSeed}, Playoff: ${pd.playoffOdds}%`;
    })
    .join('\n');
  
  const matchupsStr = matchups
    .map(m => {
      const t1 = pathData.find(p => p.rosterId === m.team1RosterId)!;
      const t2 = pathData.find(p => p.rosterId === m.team2RosterId)!;
      return `${m.team1Name} (${t1.playoffOdds}% playoff) vs ${m.team2Name} (${t2.playoffOdds}% playoff)`;
    })
    .join('\n');
  
  // Identify bubble teams (playoff odds between 10-90%)
  const bubbleTeams = pathData
    .filter(p => p.playoffOdds > 10 && p.playoffOdds < 90)
    .sort((a, b) => b.playoffOdds - a.playoffOdds)
    .map(p => `${p.teamName} (${p.playoffOdds}%)`)
    .join(', ');
  
  // Identify seeding battles (multiple teams can get same seed)
  const seedingBattles: string[] = [];
  for (let seed = 1; seed <= 6; seed++) {
    const contenders = pathData.filter(p => p.seedProbabilities[seed] && p.seedProbabilities[seed] > 5);
    if (contenders.length > 1) {
      const names = contenders
        .sort((a, b) => (b.seedProbabilities[seed] || 0) - (a.seedProbabilities[seed] || 0))
        .map(p => `${p.teamName} (${p.seedProbabilities[seed]}%)`)
        .join(' vs ');
      seedingBattles.push(`#${seed} seed: ${names}`);
    }
  }
  
  // Toilet bowl - teams that could be seeds 11-12
  const toiletTeams = pathData
    .filter(p => p.worstSeed >= 11)
    .map(p => `${p.teamName} (worst: #${p.worstSeed})`)
    .join(', ');

  return `You are a fantasy football analyst writing the Week 14 preview for the ${leagueName} league. This is the FINAL regular season week.

CURRENT STANDINGS (with path analysis):
${standingsStr}

WEEK 14 MATCHUPS:
${matchupsStr}

LEAGUE FORMAT:
- 12 teams, 3 divisions
- Top 6 make PLAYOFFS (seeds 1-3: division winners, 4-6: wild cards)
- Bottom 6 play in TOILET BOWL (seeds 11-12 get first-round BYE)
- Tiebreaker: TOTAL SEASON POINTS

BUBBLE TEAMS (10-90% playoff odds): ${bubbleTeams || 'None'}

SEEDING BATTLES:
${seedingBattles.join('\n') || 'None identified'}

TOILET BOWL CONTENDERS: ${toiletTeams || 'None'}

Write a compelling Week 14 preview covering:
1. Overall situation - what's at stake this week
2. Playoff race - who's fighting to get in, who's locked
3. Seeding battles - key matchups that affect seeding
4. Toilet bowl - who's fighting for/against the bye

Be specific with team names and percentages. Make it engaging and dramatic.

JSON format:
{
  "overallSummary": "2-3 sentences capturing the drama of Week 14",
  "playoffRace": "Who's in, who's out, who's on the bubble",
  "seedingBattles": "Key seeding battles and what's at stake",
  "toiletBowl": "Bottom of standings - who gets the bye",
  "keyMatchups": ["Matchup 1 description", "Matchup 2 description", "Matchup 3 description"]
}`;
};

const generateLeagueSummary = async (
  client: ChatGoogleGenerativeAI,
  leagueName: string,
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  pathData: TeamPathData[],
  retries: number = 3
): Promise<LeagueSummary> => {
  const prompt = buildLeaguePrompt(leagueName, standings, matchups, pathData);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.invoke(prompt);
      let content = response.content.toString().trim();
      
      if (content.startsWith('```json')) content = content.slice(7);
      if (content.startsWith('```')) content = content.slice(3);
      if (content.endsWith('```')) content = content.slice(0, -3);
      
      const parsed = JSON.parse(content.trim());
      
      return {
        leagueName,
        generatedAt: new Date().toISOString(),
        overallSummary: parsed.overallSummary || '',
        playoffRace: parsed.playoffRace || '',
        seedingBattles: parsed.seedingBattles || '',
        toiletBowl: parsed.toiletBowl || '',
        keyMatchups: parsed.keyMatchups || [],
      };
    } catch (error) {
      if (attempt < retries) {
        console.log(`  Retry ${attempt}/${retries}...`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error(`  Failed after ${retries} attempts:`, error);
        return {
          leagueName,
          generatedAt: new Date().toISOString(),
          overallSummary: 'Unable to generate summary',
          playoffRace: '',
          seedingBattles: '',
          toiletBowl: '',
          keyMatchups: [],
        };
      }
    }
  }
  
  return {
    leagueName,
    generatedAt: new Date().toISOString(),
    overallSummary: 'Unable to generate summary',
    playoffRace: '',
    seedingBattles: '',
    toiletBowl: '',
    keyMatchups: [],
  };
};

const processLeague = async (
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
  throughWeek: number
): Promise<{ summary: LeagueSummary; pathData: TeamPathData[] }> => {
  console.log(`\n📊 Processing ${leagueName} league...`);
  
  const [standings, matchups] = await Promise.all([
    fetchStandings(leagueId, throughWeek),
    fetchMatchups(leagueId),
  ]);
  
  console.log(`  Calculating path data for ${standings.length} teams...`);
  const pathData = calculatePathData(standings, matchups);
  
  console.log(`  Generating league summary...`);
  const client = createClient();
  const summary = await generateLeagueSummary(client, leagueName, standings, matchups, pathData);
  
  return { summary, pathData };
};

const main = async () => {
  console.log('🚀 Generating League Summaries');
  console.log('This will take a minute...\n');
  
  const throughWeek = 13;
  
  try {
    const [afcResult, nfcResult] = await Promise.all([
      processLeague(LEAGUE_IDS.AFC, 'AFC', throughWeek),
      processLeague(LEAGUE_IDS.NFC, 'NFC', throughWeek),
    ]);
    
    const output = {
      generatedAt: new Date().toISOString(),
      throughWeek,
      afc: {
        summary: afcResult.summary,
        teams: afcResult.pathData.reduce((acc, team) => {
          acc[team.rosterId] = team;
          return acc;
        }, {} as Record<number, TeamPathData>),
      },
      nfc: {
        summary: nfcResult.summary,
        teams: nfcResult.pathData.reduce((acc, team) => {
          acc[team.rosterId] = team;
          return acc;
        }, {} as Record<number, TeamPathData>),
      },
    };
    
    const outputPath = resolve(__dirname, '../src/data/league-summaries.json');
    writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`\n✅ Summaries saved to: ${outputPath}`);
    console.log('\n=== AFC Summary ===');
    console.log(afcResult.summary.overallSummary);
    console.log('\n=== NFC Summary ===');
    console.log(nfcResult.summary.overallSummary);
    
  } catch (error) {
    console.error('Failed to generate summaries:', error);
    process.exit(1);
  }
};

main();

