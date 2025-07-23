// Simple API functions - no more cron jobs
import dotenv from 'dotenv';
import { updateLeagueData } from './sleeper/league-updater';
import { updatePlayerStats } from './sleeper/stats-updater';
import { runSimulations } from './simulations/runner';

dotenv.config();

console.log('🏈 Gauntlet data functions loaded');

// Hardcoded league IDs for your specific leagues
const LEAGUE_IDS = [
  '1049321550490456064', // Your league 1
  '1049321550490456065'  // Your league 2 (example)
];

export async function handleLeagueUpdate(leagueId?: string) {
  const leagues = leagueId ? [leagueId] : LEAGUE_IDS;
  
  for (const id of leagues) {
    try {
      await updateLeagueData(id);
      console.log(`Updated league ${id}`);
    } catch (error) {
      console.error(`Failed to update league ${id}:`, error);
    }
  }
}

export async function handleStatsUpdate() {
  try {
    await updatePlayerStats();
    console.log('Stats updated successfully');
  } catch (error) {
    console.error('Stats update failed:', error);
  }
}

export async function handleSimulationRun() {
  try {
    for (const leagueId of LEAGUE_IDS) {
      await runSimulations(leagueId);
    }
    console.log('Simulations completed');
  } catch (error) {
    console.error('Simulation failed:', error);
  }
} 