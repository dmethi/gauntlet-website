/**
 * Final Payout Summary
 *
 * Creates a complete ranking of all 24 teams with final payouts.
 * Rankings based on playoff finish, with regular season points as tiebreaker.
 *
 * Run with: npx tsx scripts/final-payout-summary.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { LEAGUE_IDS } from '../src/lib/constants';
import { sleeperClient } from '../src/lib/sleeper/unified-client';
import type { SleeperMatchup, SleeperRoster, SleeperUser } from '@gauntlet/types';

// Load environment variables
config({ path: resolve(__dirname, '../../../.env') });

// Prize structure - Total pot is $12,000
const PRIZES = {
  WEEKLY_TOP_SCORER: 100, // Weeks 1-14 (14 × $100 = $1,400)
  NFC_VS_AFC_WIN: 100, // Per NFC team (12 × $100 = $1,200)
  PLAYOFF_FIRST: 3000, // Per league
  PLAYOFF_SECOND: 1000, // Per league
  PLAYOFF_THIRD: 500, // Per league
  TOP_SCORER_PLAYOFFS: 400, // Highest scorer weeks 15-17
};

// Playoff matchup from Sleeper API
interface PlayoffMatchup {
  r: number; // round
  m: number; // matchup id
  t1: number; // team 1 roster id
  t2: number; // team 2 roster id
  w?: number | null; // winner roster id
  l?: number | null; // loser roster id
  p?: number; // placement (1, 3, 5, etc.)
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
  regularSeasonPoints: number;
  playoffPoints: number; // weeks 15-17
  playoffPlacement: number; // 1-12 within league
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

// Fetch Week 17 scores to determine winners manually if bracket not updated
const fetchWeek17Scores = async (leagueId: string): Promise<Map<number, number>> => {
  const matchups = await sleeperClient.fetchMatchups(leagueId, 17);
  const scores = new Map<number, number>();
  matchups.forEach((m: SleeperMatchup) => {
    scores.set(m.roster_id, m.points || 0);
  });
  return scores;
};

// Fetch team info with regular season points
const fetchTeamInfo = async (
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
): Promise<Map<string, TeamInfo>> => {
  const [rosters, users] = await Promise.all([
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  // Fetch regular season matchups (weeks 1-14)
  const regularSeasonWeeks = Array.from({ length: 14 }, (_, i) => i + 1);
  const regularSeasonMatchups = await Promise.all(
    regularSeasonWeeks.map(week => sleeperClient.fetchMatchups(leagueId, week)),
  );

  // Fetch playoff matchups (weeks 15-17)
  const playoffWeeks = [15, 16, 17];
  const playoffMatchups = await Promise.all(
    playoffWeeks.map(week => sleeperClient.fetchMatchups(leagueId, week)),
  );

  // Calculate regular season points for each roster
  const regularSeasonPointsMap = new Map<number, number>();
  regularSeasonMatchups.forEach(weekMatchups => {
    weekMatchups.forEach((m: SleeperMatchup) => {
      const current = regularSeasonPointsMap.get(m.roster_id) || 0;
      regularSeasonPointsMap.set(m.roster_id, current + (m.points || 0));
    });
  });

  // Calculate playoff points for each roster
  const playoffPointsMap = new Map<number, number>();
  playoffMatchups.forEach(weekMatchups => {
    weekMatchups.forEach((m: SleeperMatchup) => {
      const current = playoffPointsMap.get(m.roster_id) || 0;
      playoffPointsMap.set(m.roster_id, current + (m.points || 0));
    });
  });

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
      regularSeasonPoints:
        Math.round((regularSeasonPointsMap.get(roster.roster_id) || 0) * 100) / 100,
      playoffPoints: Math.round((playoffPointsMap.get(roster.roster_id) || 0) * 100) / 100,
      playoffPlacement: 0, // Will be set based on bracket analysis
    });
  });

  return teamMap;
};

// Determine winner from bracket matchup, using week 17 scores if needed
const getWinner = (
  matchup: PlayoffMatchup,
  week17Scores: Map<number, number>,
): { winner: number; loser: number } | null => {
  // If bracket has winner, use it
  if (matchup.w) {
    const loser = matchup.l || (matchup.t1 === matchup.w ? matchup.t2 : matchup.t1);
    return { winner: matchup.w, loser };
  }

  // Otherwise calculate from week 17 scores
  const t1Score = week17Scores.get(matchup.t1) || 0;
  const t2Score = week17Scores.get(matchup.t2) || 0;

  if (t1Score === 0 && t2Score === 0) return null;

  if (t1Score > t2Score) {
    return { winner: matchup.t1, loser: matchup.t2 };
  } else {
    return { winner: matchup.t2, loser: matchup.t1 };
  }
};

// Analyze bracket to determine final placement (1-12) for each team
const determinePlayoffPlacements = (
  bracket: PlayoffBracketResponse,
  week17Scores: Map<number, number>,
  teamsMap: Map<string, TeamInfo>,
  leagueId: string,
  leagueName: string,
): void => {
  const winners = bracket.winners_bracket || [];
  const losers = bracket.losers_bracket || [];

  console.log(`\n=== ${leagueName} Bracket Analysis ===`);

  // Process winners bracket
  // Matchups with p (placement) field indicate final placement games
  // p=1 is championship, p=3 is 3rd place, p=5 is 5th place

  // Find championship (p=1)
  const championship = winners.find(m => m.p === 1);
  if (championship) {
    const result = getWinner(championship, week17Scores);
    if (result) {
      const winner = teamsMap.get(createTeamKey(leagueId, result.winner));
      const loser = teamsMap.get(createTeamKey(leagueId, result.loser));
      if (winner) winner.playoffPlacement = 1;
      if (loser) loser.playoffPlacement = 2;
      console.log(`   Championship: ${winner?.teamName} (1st) def. ${loser?.teamName} (2nd)`);
    }
  }

  // Find 3rd place game (p=3)
  const thirdPlace = winners.find(m => m.p === 3);
  if (thirdPlace) {
    const result = getWinner(thirdPlace, week17Scores);
    if (result) {
      const winner = teamsMap.get(createTeamKey(leagueId, result.winner));
      const loser = teamsMap.get(createTeamKey(leagueId, result.loser));
      if (winner) winner.playoffPlacement = 3;
      if (loser) loser.playoffPlacement = 4;
      console.log(`   3rd Place: ${winner?.teamName} (3rd) def. ${loser?.teamName} (4th)`);
    }
  }

  // Find 5th place game (p=5) - in round 2
  const fifthPlace = winners.find(m => m.p === 5);
  if (fifthPlace) {
    const result = getWinner(fifthPlace, week17Scores);
    if (result) {
      const winner = teamsMap.get(createTeamKey(leagueId, result.winner));
      const loser = teamsMap.get(createTeamKey(leagueId, result.loser));
      if (winner) winner.playoffPlacement = 5;
      if (loser) loser.playoffPlacement = 6;
      console.log(`   5th Place: ${winner?.teamName} (5th) def. ${loser?.teamName} (6th)`);
    }
  }

  // Process losers bracket (toilet bowl)
  // p=1 in losers is sacko championship (11th vs 12th)
  // p=3 is 9th vs 10th
  // p=5 is 7th vs 8th

  const sacko = losers.find(m => m.p === 1);
  if (sacko) {
    const result = getWinner(sacko, week17Scores);
    if (result) {
      // In toilet bowl, winner is BETTER (avoids last)
      const winner = teamsMap.get(createTeamKey(leagueId, result.winner));
      const loser = teamsMap.get(createTeamKey(leagueId, result.loser));
      if (winner) winner.playoffPlacement = 11;
      if (loser) loser.playoffPlacement = 12;
      console.log(`   Sacko: ${winner?.teamName} (11th) def. ${loser?.teamName} (12th - LAST)`);
    }
  }

  const ninthPlace = losers.find(m => m.p === 3);
  if (ninthPlace) {
    const result = getWinner(ninthPlace, week17Scores);
    if (result) {
      const winner = teamsMap.get(createTeamKey(leagueId, result.winner));
      const loser = teamsMap.get(createTeamKey(leagueId, result.loser));
      if (winner) winner.playoffPlacement = 9;
      if (loser) loser.playoffPlacement = 10;
      console.log(`   9th Place: ${winner?.teamName} (9th) def. ${loser?.teamName} (10th)`);
    }
  }

  const seventhPlace = losers.find(m => m.p === 5);
  if (seventhPlace) {
    const result = getWinner(seventhPlace, week17Scores);
    if (result) {
      const winner = teamsMap.get(createTeamKey(leagueId, result.winner));
      const loser = teamsMap.get(createTeamKey(leagueId, result.loser));
      if (winner) winner.playoffPlacement = 7;
      if (loser) loser.playoffPlacement = 8;
      console.log(`   7th Place: ${winner?.teamName} (7th) def. ${loser?.teamName} (8th)`);
    }
  }
};

// Find weekly top scorers (weeks 1-14)
const findWeeklyTopScorers = async (
  afcTeams: Map<string, TeamInfo>,
  nfcTeams: Map<string, TeamInfo>,
): Promise<{ week: number; teamKey: string; points: number }[]> => {
  const topScorers: { week: number; teamKey: string; points: number }[] = [];

  for (let week = 1; week <= 14; week++) {
    const [afcMatchups, nfcMatchups] = await Promise.all([
      sleeperClient.fetchMatchups(LEAGUE_IDS.AFC, week),
      sleeperClient.fetchMatchups(LEAGUE_IDS.NFC, week),
    ]);

    let highestScore = 0;
    let topTeamKey: string | null = null;

    afcMatchups.forEach((m: SleeperMatchup) => {
      if ((m.points || 0) > highestScore) {
        highestScore = m.points || 0;
        topTeamKey = createTeamKey(LEAGUE_IDS.AFC, m.roster_id);
      }
    });

    nfcMatchups.forEach((m: SleeperMatchup) => {
      if ((m.points || 0) > highestScore) {
        highestScore = m.points || 0;
        topTeamKey = createTeamKey(LEAGUE_IDS.NFC, m.roster_id);
      }
    });

    if (topTeamKey) {
      topScorers.push({ week, teamKey: topTeamKey, points: highestScore });
    }
  }

  return topScorers;
};

// Main function
const main = async () => {
  console.log('🏈 Final Payout Summary');
  console.log('='.repeat(80));

  try {
    // Fetch team info for both leagues
    console.log('\n📊 Fetching team data and calculating points...');
    const [afcTeams, nfcTeams] = await Promise.all([
      fetchTeamInfo(LEAGUE_IDS.AFC, 'AFC'),
      fetchTeamInfo(LEAGUE_IDS.NFC, 'NFC'),
    ]);

    const allTeams = new Map([...afcTeams, ...nfcTeams]);

    // Fetch playoff brackets and week 17 scores
    console.log('\n📊 Fetching playoff brackets and week 17 scores...');
    const [afcBracket, nfcBracket, afcWeek17, nfcWeek17] = await Promise.all([
      fetchPlayoffBracket(LEAGUE_IDS.AFC),
      fetchPlayoffBracket(LEAGUE_IDS.NFC),
      fetchWeek17Scores(LEAGUE_IDS.AFC),
      fetchWeek17Scores(LEAGUE_IDS.NFC),
    ]);

    // Determine placements for each league
    determinePlayoffPlacements(afcBracket, afcWeek17, allTeams, LEAGUE_IDS.AFC, 'AFC');
    determinePlayoffPlacements(nfcBracket, nfcWeek17, allTeams, LEAGUE_IDS.NFC, 'NFC');

    // Find weekly top scorers
    console.log('\n📊 Calculating weekly top scorers (weeks 1-14)...');
    const weeklyTopScorers = await findWeeklyTopScorers(afcTeams, nfcTeams);

    // Initialize payouts
    const payouts = new Map<string, { team: TeamInfo; amount: number; breakdown: string[] }>();
    allTeams.forEach((team, key) => {
      payouts.set(key, { team, amount: 0, breakdown: [] });
    });

    // Add weekly top scorer prizes
    weeklyTopScorers.forEach(({ week, teamKey }) => {
      const payout = payouts.get(teamKey);
      if (payout) {
        payout.amount += PRIZES.WEEKLY_TOP_SCORER;
        payout.breakdown.push(`W${week}`);
      }
    });

    // Add NFC vs AFC victory ($100 per NFC team)
    nfcTeams.forEach((_, key) => {
      const payout = payouts.get(key);
      if (payout) {
        payout.amount += PRIZES.NFC_VS_AFC_WIN;
        payout.breakdown.push('NFC');
      }
    });

    // Add playoff prizes based on placement
    allTeams.forEach((team, key) => {
      const payout = payouts.get(key);
      if (!payout) return;

      if (team.playoffPlacement === 1) {
        payout.amount += PRIZES.PLAYOFF_FIRST;
        payout.breakdown.push('1st');
      } else if (team.playoffPlacement === 2) {
        payout.amount += PRIZES.PLAYOFF_SECOND;
        payout.breakdown.push('2nd');
      } else if (team.playoffPlacement === 3) {
        payout.amount += PRIZES.PLAYOFF_THIRD;
        payout.breakdown.push('3rd');
      }
    });

    // Find top scorer for weeks 15-17 and add $400
    const allTeamsArray = [...allTeams.values()];
    const topPlayoffScorer = allTeamsArray.reduce((best, team) =>
      team.playoffPoints > best.playoffPoints ? team : best,
    );
    const topPlayoffScorerKey = createTeamKey(topPlayoffScorer.leagueId, topPlayoffScorer.rosterId);
    const topPlayoffPayout = payouts.get(topPlayoffScorerKey);
    if (topPlayoffPayout) {
      topPlayoffPayout.amount += PRIZES.TOP_SCORER_PLAYOFFS;
      topPlayoffPayout.breakdown.push('P15-17');
    }

    // Create combined ranking (1-24)
    // Group by playoff placement, then sort by regular season points within each group
    const rankedTeams: { rank: number; team: TeamInfo; payout: number; breakdown: string[] }[] = [];

    for (let placement = 1; placement <= 12; placement++) {
      const teamsAtPlacement = allTeamsArray.filter(t => t.playoffPlacement === placement);
      // Sort by regular season points (tiebreaker)
      teamsAtPlacement.sort((a, b) => b.regularSeasonPoints - a.regularSeasonPoints);

      teamsAtPlacement.forEach((team, idx) => {
        const key = createTeamKey(team.leagueId, team.rosterId);
        const payout = payouts.get(key)!;
        rankedTeams.push({
          rank: (placement - 1) * 2 + idx + 1,
          team,
          payout: payout.amount,
          breakdown: payout.breakdown,
        });
      });
    }

    // Print top playoff scorer
    console.log('\n' + '='.repeat(80));
    console.log('🏆 TOP SCORER WEEKS 15-17 (Playoff Weeks)');
    console.log('='.repeat(80));
    console.log(`\n   Winner: ${topPlayoffScorer.teamName} (${topPlayoffScorer.leagueName})`);
    console.log(`   Total Points: ${topPlayoffScorer.playoffPoints.toFixed(2)}`);
    console.log(`   Prize: $${PRIZES.TOP_SCORER_PLAYOFFS}`);

    // Print final rankings table
    console.log('\n' + '='.repeat(80));
    console.log('🏆 FINAL STANDINGS & PAYOUTS (All 24 Teams)');
    console.log('='.repeat(80));
    console.log(
      '\nRank | Team Name                    | League | Finish | Reg Pts  | Playoff | Payout  | Sources',
    );
    console.log('-'.repeat(105));

    rankedTeams.forEach(({ rank, team, payout, breakdown }) => {
      const sources = breakdown.length > 0 ? breakdown.join(', ') : '-';
      const finishLabel =
        team.playoffPlacement <= 6
          ? `#${team.playoffPlacement}`
          : team.playoffPlacement === 12
            ? 'LAST'
            : `#${team.playoffPlacement}`;
      console.log(
        `${String(rank).padStart(4)} | ${team.teamName.padEnd(28)} | ${team.leagueName.padEnd(6)} | ${finishLabel.padStart(6)} | ${team.regularSeasonPoints.toFixed(2).padStart(8)} | ${team.playoffPoints.toFixed(2).padStart(7)} | $${String(payout).padStart(5)} | ${sources}`,
      );
    });

    // Calculate totals
    const totalPayout = rankedTeams.reduce((sum, r) => sum + r.payout, 0);
    console.log('-'.repeat(105));
    console.log(
      `${'TOTAL'.padStart(4)} | ${' '.padEnd(28)} | ${' '.padEnd(6)} | ${' '.padStart(6)} | ${' '.padStart(8)} | ${' '.padStart(7)} | $${String(totalPayout).padStart(5)} |`,
    );

    // Verify prize pool
    console.log('\n' + '='.repeat(80));
    console.log('📊 PRIZE POOL VERIFICATION');
    console.log('='.repeat(80));
    console.log(`\n   Weekly Top Scorers (14 × $100):     $1,400`);
    console.log(`   NFC vs AFC Contest (12 × $100):     $1,200`);
    console.log(`   Playoff 1st Place (2 × $3,000):     $6,000`);
    console.log(`   Playoff 2nd Place (2 × $1,000):     $2,000`);
    console.log(`   Playoff 3rd Place (2 × $500):       $1,000`);
    console.log(`   Top Scorer Weeks 15-17:             $  400`);
    console.log(`   ${'─'.repeat(40)}`);
    console.log(`   EXPECTED TOTAL:                     $12,000`);
    console.log(`   ACTUAL DISTRIBUTED:                 $${totalPayout.toLocaleString()}`);

    if (totalPayout !== 12000) {
      console.log(`\n   ⚠️  Discrepancy of $${Math.abs(12000 - totalPayout)}`);
    } else {
      console.log(`\n   ✅ Prize pool fully distributed!`);
    }

    console.log('\n✅ Analysis complete!');
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
};

main();
