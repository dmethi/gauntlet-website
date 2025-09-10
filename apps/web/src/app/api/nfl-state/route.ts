import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🏈 [NFL STATE API] Fetching current NFL state from Sleeper...');
    
    const response = await fetch('https://api.sleeper.app/v1/state/nfl', {
      headers: {
        'User-Agent': 'Gauntlet-Website/1.0.0',
      },
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NFL state: ${response.status}`);
    }

    const nflState = await response.json();
    console.log('✅ [NFL STATE API] Successfully fetched NFL state:', nflState);
    
    return NextResponse.json(nflState, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('❌ [NFL STATE API] Error fetching NFL state:', error);
    
    // Fallback NFL state
    const now = new Date();
    const seasonStart = new Date('2025-09-04'); // 2025 season start
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const calculatedWeek = Math.max(1, Math.min(18, Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1));
    
    const fallbackState = {
      week: calculatedWeek,
      leg: 0,
      season: '2025',
      season_type: 'regular' as const,
      league_season: '2025',
      previous_season: '2024',
      season_start_date: '2025-09-04',
      display_week: calculatedWeek,
      league_create_season: '2025',
      season_has_scores: true,
    };
    
    console.log('🔄 [NFL STATE API] Using fallback state:', fallbackState);
    
    return NextResponse.json(fallbackState, {
      headers: {
        'Cache-Control': 'public, max-age=60', // Shorter cache for fallback
      },
    });
  }
}
