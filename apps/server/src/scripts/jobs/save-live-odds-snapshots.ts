#!/usr/bin/env node
/**
 * Live Odds Snapshot Script
 * Simply captures snapshots of the WORKING matchups page APIs for historical tracking
 * No custom logic - just save what's already working perfectly
 */

import prisma from '../../lib/prisma.js';
import axios from 'axios';

interface SimulationSnapshot {
  leagueId: string;
  week: number;
  matchupId: number;
  team1: {
    rosterId: number;
    projectedTotal: number;
    currentScore: number;
    winProbability: number;
  };
  team2: {
    rosterId: number;
    projectedTotal: number;
    currentScore: number;
    winProbability: number;
  };
  spread: number;
  total: number;
  capturedAt: string;
}

async function getCurrentWeek(): Promise<number> {
  try {
    const response = await axios.get('https://api.sleeper.app/v1/state/nfl');
    return response.data?.week || 4;
  } catch {
    return 4; // fallback
  }
}

async function snapshotMatchup(
  leagueId: string,
  week: number,
  matchupId: number,
  baseUrl: string = 'http://localhost:3000'
): Promise<SimulationSnapshot | null> {
  try {
    // Hit the EXACT same API endpoint the working matchups page uses
    const response = await axios.get(
      `${baseUrl}/api/matchups/${leagueId}/${week}/${matchupId}/simulate`,
      { timeout: 30000 }
    );

    if (!response.data.success) {
      console.warn(`⚠️ Matchup ${matchupId} simulation failed`);
      return null;
    }

    const sim = response.data.simulation;

    // Extract the data exactly as the working page provides it
    const team1ProjectedTotal = sim.teams[0].players.reduce(
      (sum: number, p: any) => sum + p.projection,
      0
    );
    const team2ProjectedTotal = sim.teams[1].players.reduce(
      (sum: number, p: any) => sum + p.projection,
      0
    );

    const team1CurrentScore = sim.teams[0].players.reduce(
      (sum: number, p: any) => sum + (p.currentScore || 0),
      0
    );
    const team2CurrentScore = sim.teams[1].players.reduce(
      (sum: number, p: any) => sum + (p.currentScore || 0),
      0
    );

    return {
      leagueId,
      week,
      matchupId,
      team1: {
        rosterId: sim.teams[0].rosterId,
        projectedTotal: team1ProjectedTotal,
        currentScore: team1CurrentScore,
        winProbability: sim.team1WinPct,
      },
      team2: {
        rosterId: sim.teams[1].rosterId,
        projectedTotal: team2ProjectedTotal,
        currentScore: team2CurrentScore,
        winProbability: sim.team2WinPct,
      },
      spread: sim.impliedOdds.spread,
      total: sim.impliedOdds.total,
      capturedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ Failed to snapshot matchup ${matchupId}:`, error.message);
    return null;
  }
}

async function saveSnapshotToDatabase(snapshot: SimulationSnapshot): Promise<void> {
  try {
    await (prisma as any).liveWinProbSample.create({
      data: {
        leagueId: snapshot.leagueId,
        week: snapshot.week,
        matchupId: snapshot.matchupId,
        rosterAId: snapshot.team1.rosterId,
        rosterBId: snapshot.team2.rosterId,
        gameProgress: 0, // Not needed since we're using working page data
        winProbA: snapshot.team1.winProbability,
        winProbB: snapshot.team2.winProbability,
        projectedFinalA: snapshot.team1.projectedTotal,
        projectedFinalB: snapshot.team2.projectedTotal,
        currentScoreA: snapshot.team1.currentScore,
        currentScoreB: snapshot.team2.currentScore,
        spread: snapshot.spread,
        total: snapshot.total,
      },
    });

    console.log(
      `✅ Saved snapshot: M${snapshot.matchupId} | ${snapshot.team1.winProbability.toFixed(3)} vs ${snapshot.team2.winProbability.toFixed(3)} | Proj: ${snapshot.team1.projectedTotal.toFixed(1)} vs ${snapshot.team2.projectedTotal.toFixed(1)}`
    );
  } catch (error) {
    console.error(`❌ Failed to save snapshot for matchup ${snapshot.matchupId}:`, error.message);
  }
}

async function main() {
  const leagueIds = ['1263744209295245312', '1263740549504962561'];
  const week = await getCurrentWeek();

  console.log(`🚀 Capturing live odds snapshots for week ${week}`);
  console.log(`📸 Using WORKING matchups page APIs - no custom logic\n`);

  for (const leagueId of leagueIds) {
    const leagueName = leagueId.includes('3245') ? 'AFC' : 'NFC';
    console.log(`🏆 Snapshotting ${leagueName} league (${leagueId})`);

    // Snapshot each matchup (1-6 for 12-team leagues)
    for (let matchupId = 1; matchupId <= 6; matchupId++) {
      const snapshot = await snapshotMatchup(leagueId, week, matchupId);

      if (snapshot) {
        await saveSnapshotToDatabase(snapshot);
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n✅ Live odds snapshots complete!');
  console.log('📊 Data ready for score-over-time and win-probability-over-time charts');
}

main()
  .catch(e => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
