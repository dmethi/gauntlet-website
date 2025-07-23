import axios from 'axios';

const SLEEPER_API = 'https://api.sleeper.app/v1';

export async function updateLeagueData(leagueId: string) {
  console.log(`Updating data for league ${leagueId}...`);
  
  try {
    // Get league info
    const leagueResponse = await axios.get(`${SLEEPER_API}/league/${leagueId}`);
    const league = leagueResponse.data;
    
    // Get users in league
    const usersResponse = await axios.get(`${SLEEPER_API}/league/${leagueId}/users`);
    const users = usersResponse.data;
    
    // Get rosters
    const rostersResponse = await axios.get(`${SLEEPER_API}/league/${leagueId}/rosters`);
    const rosters = rostersResponse.data;
    
    // Get current week matchups
    const currentWeek = getCurrentWeek();
    const matchupsResponse = await axios.get(`${SLEEPER_API}/league/${leagueId}/matchups/${currentWeek}`);
    const matchups = matchupsResponse.data;
    
    // Store data (you'll implement storage later)
    console.log(`League: ${league.name}, Users: ${users.length}, Week: ${currentWeek}`);
    
    return {
      league,
      users,
      rosters,
      matchups,
      week: currentWeek
    };
    
  } catch (error) {
    console.error(`Error updating league ${leagueId}:`, error);
    throw error;
  }
}

function getCurrentWeek(): number {
  // Simple week calculation - you might want to get this from Sleeper's state endpoint
  const seasonStart = new Date('2024-09-05'); // Adjust for current season
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
} 