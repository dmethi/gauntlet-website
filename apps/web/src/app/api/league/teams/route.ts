import { NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/league/teams`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
