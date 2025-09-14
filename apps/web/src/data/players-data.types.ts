// Auto-generated players data interfaces
export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  status: string;
  height: string;
  weight: string;
  age: number;
  years_exp: number;
  college: string;
  birth_date: string;
  birth_city: string;
  birth_state: string;
  birth_country: string;
  high_school: string;
  // ... and many more fields
  [key: string]: any;
}

export interface PlayersData {
  exportedAt: string;
  players: Record<string, SleeperPlayer>;
}
