import { NextRequest, NextResponse } from 'next/server';

// Your hardcoded league IDs
const LEAGUE_IDS = [
  '1049321550490456064', // Replace with your actual league ID
  // '1049321550490456065'  // Add second league if needed
];

const SLEEPER_API = 'https://api.sleeper.app/v1';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];
    
    for (const leagueId of LEAGUE_IDS) {
      try {
        const [leagueRes, usersRes, rostersRes] = await Promise.all([
          fetch(`${SLEEPER_API}/league/${leagueId}`),
          fetch(`${SLEEPER_API}/league/${leagueId}/users`),
          fetch(`${SLEEPER_API}/league/${leagueId}/rosters`)
        ]);

        const [league, users, rosters] = await Promise.all([
          leagueRes.json(),
          usersRes.json(), 
          rostersRes.json()
        ]);

        // Store in Vercel KV or your chosen storage
        // await kv.set(`league:${leagueId}`, { league, users, rosters, updatedAt: new Date() });
        
        results.push({
          leagueId,
          leagueName: league.name,
          userCount: users.length,
          rosterCount: rosters.length
        });
      } catch (error) {
        console.error(`Failed to update league ${leagueId}:`, error);
        results.push({ leagueId, error: 'Update failed' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('League update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 