# Seed Data for Gauntlet Development

This directory contains real Sleeper API data for development and testing purposes.

## Data Overview

- **League**: "Legends 23-24 😈🏈" (14-team dynasty league from 2024 season)
- **User**: dmethi (sample user for testing)
- **Season**: 2024 (completed season)
- **Player Stats**: Week 1 stats and projections for 2,310+ players

## Files

### Core League Data
- `fantasy-league.json` - League configuration, settings, and scoring rules
- `fantasy-league-users.json` - All 14 users in the league
- `fantasy-league-rosters.json` - Team rosters (note: dynasty league with sparse data)

### Player Data  
- `stats-week1.json` - Week 1 player statistics (749KB, 2,310 players)
- `projections-week1.json` - Week 1 player projections (726KB)
- `players-sample.json` - Sample of 50 players with metadata (names, positions, teams)

### NFL Data
- `nfl-state.json` - Current NFL season state
- `user-dmethi.json` - Sample user profile

### Configuration
- `seed-data-config.json` - Documentation of all available data files
- `README.md` - This file

## Usage

### In TypeScript/Next.js

```typescript
import { seedData, SEED_CONSTANTS } from '@/lib/seed-data';

// Get league info
const league = seedData.getSampleLeague();
console.log(league.name); // "Legends 23-24 😈🏈"

// Get users
const users = seedData.getLeagueUsers();
console.log(`${users.length} users`); // 14 users

// Get player stats
const weekStats = seedData.getPlayerStats(1);
const playerScore = weekStats['2307']?.pts_ppr || 0;

// Generate mock matchups (since real matchups are empty)
const mockMatchups = seedData.generateMockMatchups(1);

// Utilities
const user = seedData.findUserByUsername('dmethi');
const playerName = seedData.getPlayerName('2307');
```

### Testing the Data

Run the test script to verify everything works:

```bash
node scripts/test-seed-data.js
```

## Key Constants

```typescript
const LEAGUE_ID = '1124853133466419200';
const USER_ID = '465307317622009856'; 
const USERNAME = 'dmethi';
const SEASON = '2024';
```

## Data Limitations

1. **Matchups**: The real matchup data is empty (typical for inactive dynasty leagues), so use `generateMockMatchups()` for testing
2. **Rosters**: Roster data shows mostly zeros/nulls - this is normal for a dynasty league that wasn't actively managed
3. **Sample Size**: Player sample is limited to 50 players to avoid loading the full 5MB dataset

## Using for Development

This seed data is perfect for:

- ✅ Testing scoring calculations with real player stats
- ✅ Building UI components with realistic league structures  
- ✅ Testing user authentication flows
- ✅ Developing matchup displays (using mock data)
- ✅ League configuration and settings management
- ✅ Player lookup and name resolution

## API Endpoints Verified

The data was fetched from these Sleeper API endpoints:

- `GET /v1/user/{username}` ✅
- `GET /v1/user/{user_id}/leagues/nfl/{season}` ✅  
- `GET /v1/league/{league_id}` ✅
- `GET /v1/league/{league_id}/users` ✅
- `GET /v1/league/{league_id}/rosters` ✅
- `GET /v1/state/nfl` ✅
- `GET /v1/stats/nfl/regular/2024/1` ✅
- `GET /v1/projections/nfl/regular/2024/1` ✅
- `GET /v1/players/nfl` (sampled) ✅

## Next Steps

You can now start building features step by step:

1. **League Display** - Use `seedData.getSampleLeague()` and `seedData.getLeagueUsers()`
2. **Player Stats** - Use `seedData.getPlayerStats()` for scoring calculations
3. **Mock Matchups** - Use `seedData.generateMockMatchups()` for UI development
4. **Win Probability** - Combine stats + projections for probability calculations

The data structure matches the Sleeper API exactly, so your code will work with live data when ready. 