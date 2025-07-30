import { NextResponse } from 'next/server';

const SLEEPER_API = 'https://api.sleeper.app/v1';

export async function GET() {
  try {
    const currentWeek = getCurrentWeek();
    const season = new Date().getFullYear();

    // Get current NFL state from Sleeper
    const stateResponse = await fetch(`${SLEEPER_API}/state/nfl`);
    const state = stateResponse.json();

    // Check if we're in an active game window
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay(); // 0=Sunday, 1=Monday, etc.

    let hasActiveGames = false;

    // Basic time-based check (you can make this smarter)
    if (currentDay === 0) {
      // Sunday
      // Early games: 17-20 UTC (1-4 PM ET)
      // Late games: 20-23 UTC (4-7 PM ET)
      // Night game: 0-3 UTC next day (8-11 PM Sunday ET)
      hasActiveGames = currentHour >= 17 && currentHour <= 23;
    } else if (currentDay === 1 && currentHour <= 3) {
      // Monday early morning
      // Sunday night game spillover
      hasActiveGames = true;
    } else if (currentDay === 2) {
      // Tuesday early morning
      // Monday night game spillover
      hasActiveGames = currentHour <= 3;
    } else if (currentDay === 5) {
      // Friday early morning
      // Thursday night game spillover
      hasActiveGames = currentHour <= 3;
    }

    // TODO: Make this smarter by checking actual game status from NFL API
    // or Sleeper's game data

    return NextResponse.json({
      hasActiveGames,
      currentWeek,
      season,
      currentTime: now.toISOString(),
      reason: hasActiveGames ? 'In game window' : 'Outside game window',
    });
  } catch (error) {
    console.error('Error checking active games:', error);
    // Default to false to avoid unnecessary runs
    return NextResponse.json({
      hasActiveGames: false,
      error: 'Failed to check game status',
    });
  }
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}
