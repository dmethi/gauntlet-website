import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Types based on Sleeper API responses
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: any;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: string;
  season: string;
  season_type: string;
  settings: Record<string, any>;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  total_rosters: number;
  draft_id?: string;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[] | null;
  starters: string[];
  reserve: string[] | null;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal?: number;
    fpts_against: number;
    fpts_against_decimal?: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
  };
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  starters: string[];
  players: string[];
  starters_points?: number[];
  players_points?: Record<string, number>;
}

export interface PlayerStats {
  [playerId: string]: {
    pts_ppr?: number;
    pts_std?: number;
    pts_half_ppr?: number;
    [stat: string]: any;
  };
}

export interface NFLState {
  week: number;
  season: string;
  season_type: 'pre' | 'regular' | 'post';
  display_week: number;
}

class SeedDataLoader {
  private cache: Map<string, any> = new Map();

  private loadJSON<T>(filename: string): T {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Seed data file not found: ${filename}`);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    this.cache.set(filename, data);
    return data;
  }

  // User data
  getSampleUser(): SleeperUser {
    return this.loadJSON<SleeperUser>('user-dmethi.json');
  }

  // League data
  getSampleLeague(): SleeperLeague {
    return this.loadJSON<SleeperLeague>('fantasy-league.json');
  }

  getLeagueUsers(): SleeperUser[] {
    return this.loadJSON<SleeperUser[]>('fantasy-league-users.json');
  }

  getLeagueRosters(): SleeperRoster[] {
    return this.loadJSON<SleeperRoster[]>('fantasy-league-rosters.json');
  }

  // NFL State
  getNFLState(): NFLState {
    return this.loadJSON<NFLState>('nfl-state.json');
  }

  // Player data
  getPlayerStats(week: number = 1): PlayerStats {
    return this.loadJSON<PlayerStats>(`stats-week${week}.json`);
  }

  getPlayerProjections(week: number = 1): PlayerStats {
    return this.loadJSON<PlayerStats>(`projections-week${week}.json`);
  }

  getPlayerSample(): Record<string, any> {
    return this.loadJSON<Record<string, any>>('players-sample.json');
  }

  // Generate mock matchup data since the real data is empty
  generateMockMatchups(week: number = 1): SleeperMatchup[] {
    const rosters = this.getLeagueRosters();
    const playerStats = this.getPlayerStats(week);

    // Group rosters into matchups (pairs)
    const matchups: SleeperMatchup[] = [];
    let matchupId = 1;

    for (let i = 0; i < rosters.length; i += 2) {
      if (i + 1 < rosters.length) {
        // Create matchup pair
        [rosters[i], rosters[i + 1]].forEach(roster => {
          // Generate mock starters (using actual roster positions from league config)
          const league = this.getSampleLeague();
          const mockStarters = league.roster_positions
            .filter(pos => pos !== 'BN') // Exclude bench
            .map(() => this.getRandomPlayerId());

          const mockPoints = this.calculateMockPoints(mockStarters, playerStats);

          matchups.push({
            roster_id: roster.roster_id,
            matchup_id: matchupId,
            points: mockPoints,
            starters: mockStarters,
            players: [
              ...mockStarters,
              ...Array(6)
                .fill(null)
                .map(() => this.getRandomPlayerId()),
            ],
            starters_points: mockStarters.map(() => Math.random() * 20),
          });
        });
        matchupId++;
      }
    }

    return matchups;
  }

  private getRandomPlayerId(): string {
    const players = this.getPlayerSample();
    const playerIds = Object.keys(players);
    return playerIds[Math.floor(Math.random() * playerIds.length)] || '0';
  }

  private calculateMockPoints(playerIds: string[], stats: PlayerStats): number {
    return playerIds.reduce((total, playerId) => {
      const playerStats = stats[playerId];
      return total + (playerStats?.pts_ppr || Math.random() * 15);
    }, 0);
  }

  // Utility methods
  findUserByUsername(username: string): SleeperUser | undefined {
    const users = this.getLeagueUsers();
    return users.find(user => user.username === username);
  }

  findRosterByUserId(userId: string): SleeperRoster | undefined {
    const rosters = this.getLeagueRosters();
    return rosters.find(roster => roster.owner_id === userId);
  }

  getPlayerName(playerId: string): string {
    const players = this.getPlayerSample();
    const player = players[playerId];
    return player ? `${player.first_name} ${player.last_name}` : `Player ${playerId}`;
  }
}

// Export singleton instance
export const seedData = new SeedDataLoader();

// Export constants for easy access
export const SEED_CONSTANTS = {
  LEAGUE_ID: '1124853133466419200',
  USER_ID: '465307317622009856',
  USERNAME: 'dmethi',
  SEASON: '2024',
} as const;
