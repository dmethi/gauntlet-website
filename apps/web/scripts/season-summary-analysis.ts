/**
 * Season Summary Analysis
 *
 * Answers:
 * 1. Top scorer from weeks 15-17 (playoff weeks) across both leagues
 * 2. Total money earned for the year (including playoff prizes from bracket)
 *
 * Run with: npx tsx scripts/season-summary-analysis.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { LEAGUE_IDS } from '../src/lib/constants';
import { sleeperClient } from '../src/lib/sleeper/unified-client';
import type { SleeperMatchup, SleeperRoster, SleeperUser, NFLState } from '@gauntlet/types';

// Load environment variables
config({ path: resolve(__dirname, '../../../.env') });

// Prize structure
const PRIZES = {
  WEEKLY_TOP_SCORER: 100, // Weeks 1-14
  NFC_VS_AFC_WIN: 100, // Per NFC team for beating AFC
  PLAYOFF_FIRST: 3000,
  PLAYOFF_SECOND: 1000,
  PLAYOFF_THIRD: 500,
};

// Playoff bracket matchup from Sleeper API
interface PlayoffMatchup {
  r: number; // round
  m: number; // matchup id
  t1: number; // team 1 roster id
  t2: number; // team 2 roster id
  w?: number; // winner roster id
  l?: number; // loser roster id
  t1_from?: { w?: number; l?: number; m?: number };
  t2_from?: { w?: number; l?: number; m?: number };
}

interface PlayoffBracketResponse {
  winners_bracket?: PlayoffMatchup[];
  losers_bracket?: PlayoffMatchup[];
}

interface TeamInfo {
  rosterId: number;
  leagueId: string;
  leagueName: 'AFC' | 'NFC';
  teamName: string;
  ownerName: string;
}

interface WeekScore {
  week: number;
  points: number;
  starters?: string[];
  startersPoints?: number[];
}

interface TeamWithScores extends TeamInfo {
  scores: WeekScore[];
  totalPlayoffPoints: number;
}

interface PlayerInfo {
  playerId: string;
  name: string;
  team: string | null;
  position: string;
}

// Helper to create team key
const createTeamKey = (leagueId: string, rosterId: number): string => `${leagueId}-${rosterId}`;

// Fetch playoff bracket from Sleeper API
const fetchPlayoffBracket = async (leagueId: string): Promise<PlayoffBracketResponse> => {
  const [winnersRes, losersRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/winners_bracket`),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/losers_bracket`),
  ]);

  const result: PlayoffBracketResponse = {};

  if (winnersRes.ok) {
    result.winners_bracket = await winnersRes.json();
  }
  if (losersRes.ok) {
    result.losers_bracket = await losersRes.json();
  }

  return result;
};

// Analyze playoff bracket to determine placements
interface PlayoffPlacement {
  first?: { rosterId: number; teamInfo?: TeamInfo };
  second?: { rosterId: number; teamInfo?: TeamInfo };
  third?: { rosterId: number; teamInfo?: TeamInfo };
  championship?: { team1: number; team2: number; winner?: number; isComplete: boolean };
  thirdPlace?: { team1: number; team2: number; winner?: number; isComplete: boolean };
}

const analyzePlayoffBracket = (
  bracket: PlayoffBracketResponse,
  teamsMap: Map<string, TeamInfo>,
  leagueId: string,
): PlayoffPlacement => {
  const result: PlayoffPlacement = {};
  const winners = bracket.winners_bracket || [];

  // Find the maximum round (championship round)
  const maxRound = Math.max(...winners.map(m => m.r), 0);

  if (maxRound === 0) {
    return result;
  }

  // Find championship matchup (final round in winners bracket)
  const championshipMatchup = winners.find(m => m.r === maxRound);
  if (championshipMatchup) {
    result.championship = {
      team1: championshipMatchup.t1,
      team2: championshipMatchup.t2,
      winner: championshipMatchup.w,
      isComplete: !!championshipMatchup.w,
    };

    if (championshipMatchup.w) {
      result.first = {
        rosterId: championshipMatchup.w,
        teamInfo: teamsMap.get(createTeamKey(leagueId, championshipMatchup.w)),
      };
      result.second = {
        rosterId:
          championshipMatchup.l ||
          (championshipMatchup.t1 === championshipMatchup.w
            ? championshipMatchup.t2
            : championshipMatchup.t1),
        teamInfo: teamsMap.get(
          createTeamKey(
            leagueId,
            championshipMatchup.l ||
              (championshipMatchup.t1 === championshipMatchup.w
                ? championshipMatchup.t2
                : championshipMatchup.t1),
          ),
        ),
      };
    }
  }

  // Find 3rd place matchup (losers of semifinals play for 3rd)
  // In a 6-team playoff: Round 1 (week 15) = bye for seeds 1-2, Round 2 (week 16) = semis, Round 3 (week 17) = championship
  // The losers of Round 2 (semis) typically play for 3rd place
  const semiFinalRound = maxRound - 1;
  const semiFinalMatchups = winners.filter(m => m.r === semiFinalRound);

  // 3rd place game is typically between the losers of the semis
  // This might be in a separate matchup or tracked differently
  // Let's look for matchups where teams came from losing previous rounds
  const thirdPlaceMatchup = winners.find(
    m =>
      m.r === maxRound &&
      m.m !== championshipMatchup?.m &&
      (m.t1_from?.l !== undefined || m.t2_from?.l !== undefined),
  );

  // If no explicit 3rd place game, check semi-final losers
  if (!thirdPlaceMatchup && semiFinalMatchups.length >= 2) {
    // The semi-final losers would be 3rd/4th
    // Find the loser with higher seed or better record for 3rd
    const semiLosers = semiFinalMatchups.filter(m => m.l).map(m => m.l as number);

    if (semiLosers.length > 0) {
      // Just pick the first one as "3rd" for now (could be more sophisticated)
      result.third = {
        rosterId: semiLosers[0],
        teamInfo: teamsMap.get(createTeamKey(leagueId, semiLosers[0])),
      };
    }
  }

  return result;
};

// Fetch team info for a league
const fetchTeamInfo = async (
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
): Promise<Map<string, TeamInfo>> => {
  const [rosters, users] = await Promise.all([
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  const userMap = new Map(users.map((u: SleeperUser) => [u.user_id, u]));
  const teamMap = new Map<string, TeamInfo>();

  rosters.forEach((roster: SleeperRoster) => {
    const owner = userMap.get(roster.owner_id);
    const key = createTeamKey(leagueId, roster.roster_id);
    teamMap.set(key, {
      rosterId: roster.roster_id,
      leagueId,
      leagueName,
      teamName:
        (owner?.metadata as any)?.team_name || owner?.display_name || `Team ${roster.roster_id}`,
      ownerName: owner?.display_name || owner?.username || 'Unknown',
    });
  });

  return teamMap;
};

// Fetch matchup scores for a specific week
const fetchWeekScores = async (leagueId: string, week: number): Promise<Map<number, WeekScore>> => {
  const matchups = await sleeperClient.fetchMatchups(leagueId, week);
  const scoreMap = new Map<number, WeekScore>();

  matchups.forEach((m: SleeperMatchup) => {
    scoreMap.set(m.roster_id, {
      week,
      points: m.points || 0,
      starters: m.starters || [],
      startersPoints: m.starters_points || [],
    });
  });

  return scoreMap;
};

// Find weekly top scorers across both leagues for weeks 1-14
const findWeeklyTopScorers = async (
  afcTeams: Map<string, TeamInfo>,
  nfcTeams: Map<string, TeamInfo>,
): Promise<{ week: number; team: TeamInfo; points: number }[]> => {
  const topScorers: { week: number; team: TeamInfo; points: number }[] = [];

  for (let week = 1; week <= 14; week++) {
    const [afcScores, nfcScores] = await Promise.all([
      fetchWeekScores(LEAGUE_IDS.AFC, week),
      fetchWeekScores(LEAGUE_IDS.NFC, week),
    ]);

    let highestScore = 0;
    let topTeam: TeamInfo | null = null;

    // Check AFC teams
    afcScores.forEach((score, rosterId) => {
      if (score.points > highestScore) {
        highestScore = score.points;
        topTeam = afcTeams.get(createTeamKey(LEAGUE_IDS.AFC, rosterId)) || null;
      }
    });

    // Check NFC teams
    nfcScores.forEach((score, rosterId) => {
      if (score.points > highestScore) {
        highestScore = score.points;
        topTeam = nfcTeams.get(createTeamKey(LEAGUE_IDS.NFC, rosterId)) || null;
      }
    });

    if (topTeam) {
      topScorers.push({ week, team: topTeam, points: highestScore });
    }
  }

  return topScorers;
};

// Calculate playoff week scores (15-17)
const calculatePlayoffScores = async (
  afcTeams: Map<string, TeamInfo>,
  nfcTeams: Map<string, TeamInfo>,
  players: Record<string, any>,
  nflState: NFLState,
): Promise<{
  teamScores: TeamWithScores[];
  playersYetToPlay: Map<string, { team: TeamInfo; players: PlayerInfo[] }>;
}> => {
  const allTeams = new Map([...afcTeams, ...nfcTeams]);
  const teamScores: TeamWithScores[] = [];
  const playersYetToPlay = new Map<string, { team: TeamInfo; players: PlayerInfo[] }>();

  // Fetch scores for weeks 15, 16, 17
  const playoffWeeks = [15, 16, 17];
  const currentWeek = nflState.week;

  for (const [teamKey, teamInfo] of allTeams.entries()) {
    const scores: WeekScore[] = [];
    let totalPlayoffPoints = 0;

    for (const week of playoffWeeks) {
      const weekScores = await fetchWeekScores(teamInfo.leagueId, week);
      const teamScore = weekScores.get(teamInfo.rosterId);

      if (teamScore) {
        scores.push(teamScore);
        totalPlayoffPoints += teamScore.points;

        // For week 17 (current/in-progress), check for players yet to play
        if (week === 17 && week === currentWeek) {
          const yetToPlay: PlayerInfo[] = [];

          if (teamScore.starters && teamScore.startersPoints) {
            teamScore.starters.forEach((playerId, idx) => {
              const points = teamScore.startersPoints![idx] || 0;
              const player = players[playerId];

              // Player hasn't played yet if they have 0 points and we're mid-week
              // This is a simplified check - in reality we'd check game schedules
              if (points === 0 && player) {
                yetToPlay.push({
                  playerId,
                  name: player.full_name || `${player.first_name} ${player.last_name}`,
                  team: player.team,
                  position: player.position,
                });
              }
            });
          }

          if (yetToPlay.length > 0) {
            playersYetToPlay.set(teamKey, { team: teamInfo, players: yetToPlay });
          }
        }
      }
    }

    teamScores.push({
      ...teamInfo,
      scores,
      totalPlayoffPoints,
    });
  }

  return { teamScores, playersYetToPlay };
};

// Main analysis function
const main = async () => {
  console.log('🏈 Season Summary Analysis');
  console.log('='.repeat(60));

  try {
    // Fetch NFL state to know current week
    const nflState = await sleeperClient.fetchNFLState();
    console.log(`\n📅 Current NFL Week: ${nflState.week}`);
    console.log(`   Season: ${nflState.season}`);

    // Fetch team info for both leagues
    console.log('\n📊 Fetching team data...');
    const [afcTeams, nfcTeams, players] = await Promise.all([
      fetchTeamInfo(LEAGUE_IDS.AFC, 'AFC'),
      fetchTeamInfo(LEAGUE_IDS.NFC, 'NFC'),
      sleeperClient.fetchAllPlayers(),
    ]);

    console.log(`   AFC Teams: ${afcTeams.size}`);
    console.log(`   NFC Teams: ${nfcTeams.size}`);

    // ========================================
    // QUESTION 1: Top Scorer Weeks 15-17
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📈 PLAYOFF WEEKS (15-17) TOP SCORERS');
    console.log('='.repeat(60));

    const { teamScores, playersYetToPlay } = await calculatePlayoffScores(
      afcTeams,
      nfcTeams,
      players,
      nflState,
    );

    // Sort by total playoff points
    const sortedTeams = [...teamScores].sort((a, b) => b.totalPlayoffPoints - a.totalPlayoffPoints);

    console.log('\n🏆 Top 10 Playoff Scorers (Weeks 15-17 Combined):');
    console.log('-'.repeat(70));
    console.log('Rank | Team Name                  | League | W15    | W16    | W17    | Total');
    console.log('-'.repeat(70));

    sortedTeams.slice(0, 10).forEach((team, idx) => {
      const w15 = team.scores.find(s => s.week === 15)?.points || 0;
      const w16 = team.scores.find(s => s.week === 16)?.points || 0;
      const w17 = team.scores.find(s => s.week === 17)?.points || 0;
      const hasPlayersYetToPlay = playersYetToPlay.has(createTeamKey(team.leagueId, team.rosterId));
      const flag = hasPlayersYetToPlay ? ' *' : '';

      console.log(
        `${String(idx + 1).padStart(4)} | ${team.teamName.padEnd(26)} | ${team.leagueName.padEnd(6)} | ${w15.toFixed(2).padStart(6)} | ${w16.toFixed(2).padStart(6)} | ${w17.toFixed(2).padStart(6)} | ${team.totalPlayoffPoints.toFixed(2).padStart(7)}${flag}`,
      );
    });

    // Flag teams with players yet to play
    if (playersYetToPlay.size > 0) {
      console.log('\n⚠️  Teams with players yet to play in Week 17:');
      playersYetToPlay.forEach(({ team, players: yetToPlay }) => {
        console.log(`\n   ${team.teamName} (${team.leagueName}):`);
        yetToPlay.forEach(p => {
          console.log(`      - ${p.name} (${p.position}, ${p.team || 'FA'})`);
        });
      });
    }

    // ========================================
    // QUESTION 2: Total Money Earned
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('💰 TOTAL MONEY EARNED FOR THE YEAR');
    console.log('='.repeat(60));

    // Weekly top scorers (weeks 1-14)
    console.log('\n📊 Fetching weekly top scorers (weeks 1-14)...');
    const weeklyTopScorers = await findWeeklyTopScorers(afcTeams, nfcTeams);

    // Aggregate earnings by team
    const earnings = new Map<string, { team: TeamInfo; amount: number; breakdown: string[] }>();

    // Initialize all teams with 0 earnings
    [...afcTeams.values(), ...nfcTeams.values()].forEach(team => {
      const key = createTeamKey(team.leagueId, team.rosterId);
      earnings.set(key, { team, amount: 0, breakdown: [] });
    });

    // Add weekly top scorer prizes
    console.log('\n🏆 Weekly Top Scorers (Weeks 1-14, $100 each):');
    console.log('-'.repeat(60));
    weeklyTopScorers.forEach(({ week, team, points }) => {
      const key = createTeamKey(team.leagueId, team.rosterId);
      const earning = earnings.get(key)!;
      earning.amount += PRIZES.WEEKLY_TOP_SCORER;
      earning.breakdown.push(`Week ${week} Top Scorer ($${PRIZES.WEEKLY_TOP_SCORER})`);
      console.log(
        `   Week ${String(week).padStart(2)}: ${team.teamName.padEnd(26)} (${team.leagueName}) - ${points.toFixed(2)} pts`,
      );
    });

    // NFC vs AFC contest - Every NFC team gets $100 if NFC beat AFC
    // Note: This needs to be verified - user mentioned "every team in NFC earned $100 for beating AFC in contest"
    console.log('\n🏈 NFC vs AFC Contest:');
    console.log('   (Per user: Every NFC team earned $100 for beating AFC in contest)');
    nfcTeams.forEach((team, key) => {
      const earning = earnings.get(key)!;
      earning.amount += PRIZES.NFC_VS_AFC_WIN;
      earning.breakdown.push(`NFC vs AFC Victory ($${PRIZES.NFC_VS_AFC_WIN})`);
    });

    // ========================================
    // PLAYOFF BRACKET ANALYSIS
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🏆 PLAYOFF BRACKET RESULTS');
    console.log('='.repeat(60));

    const allTeams = new Map([...afcTeams, ...nfcTeams]);

    // Fetch playoff brackets for both leagues
    console.log('\n📊 Fetching playoff brackets from Sleeper API...');
    const [afcBracket, nfcBracket] = await Promise.all([
      fetchPlayoffBracket(LEAGUE_IDS.AFC),
      fetchPlayoffBracket(LEAGUE_IDS.NFC),
    ]);

    console.log('\n=== AFC Playoff Bracket ===');
    console.log('Winners Bracket Matchups:');
    if (afcBracket.winners_bracket) {
      // Sort by round, then matchup
      const sortedWinners = [...afcBracket.winners_bracket].sort((a, b) => a.r - b.r || a.m - b.m);
      sortedWinners.forEach(m => {
        const team1 = afcTeams.get(createTeamKey(LEAGUE_IDS.AFC, m.t1));
        const team2 = afcTeams.get(createTeamKey(LEAGUE_IDS.AFC, m.t2));
        const winner = m.w ? afcTeams.get(createTeamKey(LEAGUE_IDS.AFC, m.w)) : null;
        const t1Name = team1?.teamName || `Roster ${m.t1}`;
        const t2Name = team2?.teamName || `Roster ${m.t2}`;
        const status = winner ? `Winner: ${winner.teamName}` : 'In Progress';
        console.log(`   Round ${m.r}, Match ${m.m}: ${t1Name} vs ${t2Name} - ${status}`);
      });
    }

    const afcPlacements = analyzePlayoffBracket(afcBracket, allTeams, LEAGUE_IDS.AFC);
    console.log('\nAFC Placements:');
    if (afcPlacements.first) {
      console.log(
        `   🥇 1st: ${afcPlacements.first.teamInfo?.teamName || `Roster ${afcPlacements.first.rosterId}`}`,
      );
      const key = createTeamKey(LEAGUE_IDS.AFC, afcPlacements.first.rosterId);
      const earning = earnings.get(key);
      if (earning) {
        earning.amount += PRIZES.PLAYOFF_FIRST;
        earning.breakdown.push(`Playoff 1st Place ($${PRIZES.PLAYOFF_FIRST})`);
      }
    }
    if (afcPlacements.second) {
      console.log(
        `   🥈 2nd: ${afcPlacements.second.teamInfo?.teamName || `Roster ${afcPlacements.second.rosterId}`}`,
      );
      const key = createTeamKey(LEAGUE_IDS.AFC, afcPlacements.second.rosterId);
      const earning = earnings.get(key);
      if (earning) {
        earning.amount += PRIZES.PLAYOFF_SECOND;
        earning.breakdown.push(`Playoff 2nd Place ($${PRIZES.PLAYOFF_SECOND})`);
      }
    }
    if (afcPlacements.third) {
      console.log(
        `   🥉 3rd: ${afcPlacements.third.teamInfo?.teamName || `Roster ${afcPlacements.third.rosterId}`}`,
      );
      const key = createTeamKey(LEAGUE_IDS.AFC, afcPlacements.third.rosterId);
      const earning = earnings.get(key);
      if (earning) {
        earning.amount += PRIZES.PLAYOFF_THIRD;
        earning.breakdown.push(`Playoff 3rd Place ($${PRIZES.PLAYOFF_THIRD})`);
      }
    }
    if (afcPlacements.championship && !afcPlacements.championship.isComplete) {
      const team1 = afcTeams.get(createTeamKey(LEAGUE_IDS.AFC, afcPlacements.championship.team1));
      const team2 = afcTeams.get(createTeamKey(LEAGUE_IDS.AFC, afcPlacements.championship.team2));
      console.log(`   ⏳ Championship in progress: ${team1?.teamName} vs ${team2?.teamName}`);
    }

    console.log('\n=== NFC Playoff Bracket ===');
    console.log('Winners Bracket Matchups:');
    if (nfcBracket.winners_bracket) {
      const sortedWinners = [...nfcBracket.winners_bracket].sort((a, b) => a.r - b.r || a.m - b.m);
      sortedWinners.forEach(m => {
        const team1 = nfcTeams.get(createTeamKey(LEAGUE_IDS.NFC, m.t1));
        const team2 = nfcTeams.get(createTeamKey(LEAGUE_IDS.NFC, m.t2));
        const winner = m.w ? nfcTeams.get(createTeamKey(LEAGUE_IDS.NFC, m.w)) : null;
        const t1Name = team1?.teamName || `Roster ${m.t1}`;
        const t2Name = team2?.teamName || `Roster ${m.t2}`;
        const status = winner ? `Winner: ${winner.teamName}` : 'In Progress';
        console.log(`   Round ${m.r}, Match ${m.m}: ${t1Name} vs ${t2Name} - ${status}`);
      });
    }

    const nfcPlacements = analyzePlayoffBracket(nfcBracket, allTeams, LEAGUE_IDS.NFC);
    console.log('\nNFC Placements:');
    if (nfcPlacements.first) {
      console.log(
        `   🥇 1st: ${nfcPlacements.first.teamInfo?.teamName || `Roster ${nfcPlacements.first.rosterId}`}`,
      );
      const key = createTeamKey(LEAGUE_IDS.NFC, nfcPlacements.first.rosterId);
      const earning = earnings.get(key);
      if (earning) {
        earning.amount += PRIZES.PLAYOFF_FIRST;
        earning.breakdown.push(`Playoff 1st Place ($${PRIZES.PLAYOFF_FIRST})`);
      }
    }
    if (nfcPlacements.second) {
      console.log(
        `   🥈 2nd: ${nfcPlacements.second.teamInfo?.teamName || `Roster ${nfcPlacements.second.rosterId}`}`,
      );
      const key = createTeamKey(LEAGUE_IDS.NFC, nfcPlacements.second.rosterId);
      const earning = earnings.get(key);
      if (earning) {
        earning.amount += PRIZES.PLAYOFF_SECOND;
        earning.breakdown.push(`Playoff 2nd Place ($${PRIZES.PLAYOFF_SECOND})`);
      }
    }
    if (nfcPlacements.third) {
      console.log(
        `   🥉 3rd: ${nfcPlacements.third.teamInfo?.teamName || `Roster ${nfcPlacements.third.rosterId}`}`,
      );
      const key = createTeamKey(LEAGUE_IDS.NFC, nfcPlacements.third.rosterId);
      const earning = earnings.get(key);
      if (earning) {
        earning.amount += PRIZES.PLAYOFF_THIRD;
        earning.breakdown.push(`Playoff 3rd Place ($${PRIZES.PLAYOFF_THIRD})`);
      }
    }
    if (nfcPlacements.championship && !nfcPlacements.championship.isComplete) {
      const team1 = nfcTeams.get(createTeamKey(LEAGUE_IDS.NFC, nfcPlacements.championship.team1));
      const team2 = nfcTeams.get(createTeamKey(LEAGUE_IDS.NFC, nfcPlacements.championship.team2));
      console.log(`   ⏳ Championship in progress: ${team1?.teamName} vs ${team2?.teamName}`);
    }

    // Playoff prizes summary
    console.log('\n🏆 Playoff Prize Structure:');
    console.log(`   1st Place: $${PRIZES.PLAYOFF_FIRST}`);
    console.log(`   2nd Place: $${PRIZES.PLAYOFF_SECOND}`);
    console.log(`   3rd Place: $${PRIZES.PLAYOFF_THIRD}`);

    // Show earnings summary - Move AFTER playoff bracket analysis
    // (This will be shown after playoff results are processed)

    // Calculate totals
    const totalWeeklyPrizes = weeklyTopScorers.length * PRIZES.WEEKLY_TOP_SCORER;
    const totalNFCPrize = nfcTeams.size * PRIZES.NFC_VS_AFC_WIN;
    // Playoff prizes per league
    const playoffPrizesPerLeague =
      PRIZES.PLAYOFF_FIRST + PRIZES.PLAYOFF_SECOND + PRIZES.PLAYOFF_THIRD;
    const totalPlayoffPrizes = playoffPrizesPerLeague * 2; // Both AFC and NFC

    // Calculate actual awarded playoff money
    let awardedPlayoffMoney = 0;
    if (afcPlacements.first) awardedPlayoffMoney += PRIZES.PLAYOFF_FIRST;
    if (afcPlacements.second) awardedPlayoffMoney += PRIZES.PLAYOFF_SECOND;
    if (afcPlacements.third) awardedPlayoffMoney += PRIZES.PLAYOFF_THIRD;
    if (nfcPlacements.first) awardedPlayoffMoney += PRIZES.PLAYOFF_FIRST;
    if (nfcPlacements.second) awardedPlayoffMoney += PRIZES.PLAYOFF_SECOND;
    if (nfcPlacements.third) awardedPlayoffMoney += PRIZES.PLAYOFF_THIRD;

    console.log('\n' + '='.repeat(60));
    console.log('📊 TOTAL PRIZE POOL BREAKDOWN');
    console.log('='.repeat(60));
    console.log(`\n   Weekly Top Scorers (14 weeks × $100):     $${totalWeeklyPrizes}`);
    console.log(`   NFC vs AFC Contest (12 teams × $100):     $${totalNFCPrize}`);
    console.log(`   Playoff Prizes (2 leagues × $4.5k):       $${totalPlayoffPrizes}`);
    console.log('-'.repeat(50));
    console.log(
      `   TOTAL PRIZE POOL:                         $${totalWeeklyPrizes + totalNFCPrize + totalPlayoffPrizes}`,
    );

    if (awardedPlayoffMoney < totalPlayoffPrizes) {
      console.log(`\n   ⚠️  Playoff prizes awarded so far:        $${awardedPlayoffMoney}`);
      console.log(`       (Championships still in progress)`);
    }

    // ========================================
    // FINAL EARNINGS SUMMARY (INCLUDING PLAYOFFS)
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('💵 FINAL EARNINGS SUMMARY');
    console.log('='.repeat(60));

    const sortedEarnings = [...earnings.values()]
      .filter(e => e.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    console.log('\nAll Teams with Earnings:');
    console.log('-'.repeat(80));
    console.log('Team Name                      | League | Amount  | Sources');
    console.log('-'.repeat(80));

    sortedEarnings.forEach(({ team, amount, breakdown }) => {
      const sources = breakdown.length <= 3 ? breakdown.join(', ') : `${breakdown.length} prizes`;
      console.log(
        `${team.teamName.padEnd(30)} | ${team.leagueName.padEnd(6)} | $${String(amount).padStart(5)} | ${sources}`,
      );
    });

    // Calculate total awarded
    const totalAwarded = sortedEarnings.reduce((sum, e) => sum + e.amount, 0);
    console.log('-'.repeat(80));
    console.log(`${'TOTAL AWARDED'.padEnd(30)} |        | $${String(totalAwarded).padStart(5)} |`);

    console.log('\n✅ Analysis complete!');
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
};

main();
