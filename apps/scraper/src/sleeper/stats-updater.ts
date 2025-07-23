import axios from 'axios';

const SLEEPER_API = 'https://api.sleeper.app/v1';

export async function updatePlayerStats() {
  console.log('Updating player stats...');
  
  try {
    const currentWeek = getCurrentWeek();
    const season = new Date().getFullYear();
    
    // Get weekly stats (undocumented endpoint from your docs)
    const statsResponse = await axios.get(
      `${SLEEPER_API}/stats/nfl/regular/${season}/${currentWeek}`
    );
    const stats = statsResponse.data;
    
    // Get projections (undocumented endpoint)
    const projectionsResponse = await axios.get(
      `${SLEEPER_API}/projections/nfl/regular/${season}/${currentWeek}`
    );
    const projections = projectionsResponse.data;
    
    console.log(`Updated stats for ${Object.keys(stats).length} players`);
    console.log(`Updated projections for ${Object.keys(projections).length} players`);
    
    // Store data (implement storage layer)
    return {
      stats,
      projections,
      week: currentWeek,
      season
    };
    
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
} 