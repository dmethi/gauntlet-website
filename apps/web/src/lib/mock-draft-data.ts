// Mock Draft Data for Draft Analysis Comparison
// Based on player screenshots provided

export interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'DEF';
  team: string;
  aav: number; // Average Auction Value
  rank: number;
}

export interface DraftPick {
  playerId: string;
  player: Player;
  teamId: number;
  teamName: string;
  pickNumber: number;
  round: number;
  pickInRound: number;
  actualPrice: number;
  aavAtTime: number;
  valueOverAAV: number; // actualPrice - aav
  percentageOfAAV: number; // actualPrice / aav * 100
}

export interface TeamRoster {
  teamId: number;
  teamName: string;
  totalSpent: number;
  budget: number;
  remaining: number;
  picks: DraftPick[];
  // Roster composition
  qb: DraftPick[];
  rb: DraftPick[];
  wr: DraftPick[];
  te: DraftPick[];
  flex: DraftPick[];
  bench: DraftPick[];
  def: DraftPick[];
}

export interface MockDraft {
  id: string;
  name: string;
  teams: TeamRoster[];
  totalPicks: number;
  completedPicks: number;
}

// Player data extracted from screenshots - Complete list of ~220 players
export const mockPlayerData: Player[] = [
  // Rank 1-50 (Top tier)
  { id: 'jamarr-chase', name: "Ja'Marr Chase", position: 'WR', team: 'CIN', aav: 71, rank: 1 },
  { id: 'saquon-barkley', name: 'Saquon Barkley', position: 'RB', team: 'PHI', aav: 70, rank: 2 },
  { id: 'bijan-robinson', name: 'Bijan Robinson', position: 'RB', team: 'ATL', aav: 68, rank: 3 },
  { id: 'jahmyr-gibbs', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', aav: 63, rank: 4 },
  {
    id: 'justin-jefferson',
    name: 'Justin Jefferson',
    position: 'WR',
    team: 'MIN',
    aav: 61,
    rank: 5,
  },
  { id: 'derrick-henry', name: 'Derrick Henry', position: 'RB', team: 'BAL', aav: 55, rank: 6 },
  { id: 'ceedee-lamb', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', aav: 55, rank: 7 },
  {
    id: 'amon-ra-st-brown',
    name: 'Amon-Ra St. Brown',
    position: 'WR',
    team: 'DET',
    aav: 53,
    rank: 8,
  },
  {
    id: 'christian-mccaffrey',
    name: 'Christian McCaffrey',
    position: 'RB',
    team: 'SF',
    aav: 51,
    rank: 9,
  },
  { id: 'ashton-jeanty', name: 'Ashton Jeanty', position: 'RB', team: 'LV', aav: 51, rank: 10 },
  { id: 'malik-nabers', name: 'Malik Nabers', position: 'WR', team: 'NYG', aav: 48, rank: 11 },
  { id: 'puka-nacua', name: 'Puka Nacua', position: 'WR', team: 'LAR', aav: 47, rank: 12 },
  { id: 'nico-collins', name: 'Nico Collins', position: 'WR', team: 'HOU', aav: 47, rank: 13 },
  { id: 'josh-jacobs', name: 'Josh Jacobs', position: 'RB', team: 'GB', aav: 44, rank: 14 },
  { id: 'devon-achane', name: "De'Von Achane", position: 'RB', team: 'MIA', aav: 41, rank: 15 },
  { id: 'drake-london', name: 'Drake London', position: 'WR', team: 'ATL', aav: 40, rank: 16 },
  {
    id: 'jonathan-taylor',
    name: 'Jonathan Taylor',
    position: 'RB',
    team: 'IND',
    aav: 39,
    rank: 17,
  },
  { id: 'aj-brown', name: 'A.J. Brown', position: 'WR', team: 'PHI', aav: 39, rank: 18 },
  { id: 'josh-allen', name: 'Josh Allen', position: 'QB', team: 'BUF', aav: 37, rank: 19 },
  { id: 'brian-thomas', name: 'Brian Thomas Jr.', position: 'WR', team: 'JAX', aav: 36, rank: 20 },
  { id: 'brock-bowers', name: 'Brock Bowers', position: 'TE', team: 'LV', aav: 36, rank: 21 },
  { id: 'lamar-jackson', name: 'Lamar Jackson', position: 'QB', team: 'BAL', aav: 35, rank: 22 },
  { id: 'kyren-williams', name: 'Kyren Williams', position: 'RB', team: 'LAR', aav: 35, rank: 23 },
  { id: 'bucky-irving', name: 'Bucky Irving', position: 'RB', team: 'TB', aav: 33, rank: 24 },
  { id: 'ladd-mcconkey', name: 'Ladd McConkey', position: 'WR', team: 'LAC', aav: 33, rank: 25 },
  { id: 'chase-brown', name: 'Chase Brown', position: 'RB', team: 'CIN', aav: 33, rank: 26 },
  { id: 'james-cook', name: 'James Cook', position: 'RB', team: 'BUF', aav: 32, rank: 27 },
  { id: 'tyreek-hill', name: 'Tyreek Hill', position: 'WR', team: 'MIA', aav: 32, rank: 28 },
  { id: 'trey-mcbride', name: 'Trey McBride', position: 'TE', team: 'ARI', aav: 31, rank: 29 },
  { id: 'tee-higgins', name: 'Tee Higgins', position: 'WR', team: 'CIN', aav: 30, rank: 30 },
  {
    id: 'omarion-hampton',
    name: 'Omarion Hampton',
    position: 'RB',
    team: 'LAC',
    aav: 29,
    rank: 31,
  },
  {
    id: 'jaxon-smith-njigba',
    name: 'Jaxon Smith-Njigba',
    position: 'WR',
    team: 'SEA',
    aav: 29,
    rank: 32,
  },
  { id: 'breece-hall', name: 'Breece Hall', position: 'RB', team: 'NYJ', aav: 28, rank: 33 },
  { id: 'jalen-hurts', name: 'Jalen Hurts', position: 'QB', team: 'PHI', aav: 28, rank: 34 },
  { id: 'jayden-daniels', name: 'Jayden Daniels', position: 'QB', team: 'WAS', aav: 28, rank: 35 },
  {
    id: 'marvin-harrison',
    name: 'Marvin Harrison Jr.',
    position: 'WR',
    team: 'ARI',
    aav: 27,
    rank: 36,
  },
  { id: 'george-kittle', name: 'George Kittle', position: 'TE', team: 'SF', aav: 26, rank: 37 },
  { id: 'mike-evans', name: 'Mike Evans', position: 'WR', team: 'TB', aav: 26, rank: 38 },
  { id: 'alvin-kamara', name: 'Alvin Kamara', position: 'RB', team: 'NO', aav: 25, rank: 39 },
  { id: 'garrett-wilson', name: 'Garrett Wilson', position: 'WR', team: 'NYJ', aav: 25, rank: 40 },
  {
    id: 'kenneth-walker',
    name: 'Kenneth Walker III',
    position: 'RB',
    team: 'SEA',
    aav: 24,
    rank: 41,
  },
  { id: 'joe-burrow', name: 'Joe Burrow', position: 'QB', team: 'CIN', aav: 23, rank: 42 },
  { id: 'terry-mclaurin', name: 'Terry McLaurin', position: 'WR', team: 'WAS', aav: 23, rank: 43 },
  { id: 'davante-adams', name: 'Davante Adams', position: 'WR', team: 'LAR', aav: 21, rank: 44 },
  { id: 'chuba-hubbard', name: 'Chuba Hubbard', position: 'RB', team: 'CAR', aav: 21, rank: 45 },
  { id: 'dk-metcalf', name: 'DK Metcalf', position: 'WR', team: 'PIT', aav: 21, rank: 46 },
  { id: 'james-conner', name: 'James Conner', position: 'RB', team: 'ARI', aav: 21, rank: 47 },
  {
    id: 'treveyon-henderson',
    name: 'TreVeyon Henderson',
    position: 'RB',
    team: 'NE',
    aav: 20,
    rank: 48,
  },
  { id: 'dj-moore', name: 'DJ Moore', position: 'WR', team: 'CHI', aav: 20, rank: 49 },
  { id: 'sam-laporta', name: 'Sam LaPorta', position: 'TE', team: 'DET', aav: 19, rank: 50 },

  // Rank 51-100
  {
    id: 'courtland-sutton',
    name: 'Courtland Sutton',
    position: 'WR',
    team: 'DEN',
    aav: 19,
    rank: 51,
  },
  {
    id: 'david-montgomery',
    name: 'David Montgomery',
    position: 'RB',
    team: 'DET',
    aav: 19,
    rank: 52,
  },
  { id: 'patrick-mahomes', name: 'Patrick Mahomes', position: 'QB', team: 'KC', aav: 19, rank: 53 },
  { id: 'rashee-rice', name: 'Rashee Rice', position: 'WR', team: 'KC', aav: 19, rank: 54 },
  { id: 'rj-harvey', name: 'RJ Harvey', position: 'RB', team: 'DEN', aav: 18, rank: 55 },
  { id: 'devonta-smith', name: 'DeVonta Smith', position: 'WR', team: 'PHI', aav: 18, rank: 56 },
  { id: 'isiah-pacheco', name: 'Isiah Pacheco', position: 'RB', team: 'KC', aav: 17, rank: 57 },
  { id: 'xavier-worthy', name: 'Xavier Worthy', position: 'WR', team: 'KC', aav: 16, rank: 58 },
  {
    id: 'tetairoa-mcmillan',
    name: 'Tetairoa McMillan',
    position: 'WR',
    team: 'CAR',
    aav: 16,
    rank: 59,
  },
  { id: 'zay-flowers', name: 'Zay Flowers', position: 'WR', team: 'BAL', aav: 15, rank: 60 },
  {
    id: 'jameson-williams',
    name: 'Jameson Williams',
    position: 'WR',
    team: 'DET',
    aav: 14,
    rank: 61,
  },
  { id: 'tj-hockenson', name: 'T.J. Hockenson', position: 'TE', team: 'MIN', aav: 14, rank: 62 },
  { id: 'george-pickens', name: 'George Pickens', position: 'WR', team: 'DAL', aav: 14, rank: 63 },
  { id: 'travis-kelce', name: 'Travis Kelce', position: 'TE', team: 'KC', aav: 13, rank: 64 },
  { id: 'dandre-swift', name: "D'Andre Swift", position: 'RB', team: 'CHI', aav: 13, rank: 65 },
  { id: 'aaron-jones', name: 'Aaron Jones', position: 'RB', team: 'MIN', aav: 13, rank: 66 },
  { id: 'tony-pollard', name: 'Tony Pollard', position: 'RB', team: 'TB', aav: 13, rank: 67 },
  { id: 'travis-hunter', name: 'Travis Hunter', position: 'WR', team: 'JAX', aav: 12, rank: 68 },
  { id: 'baker-mayfield', name: 'Baker Mayfield', position: 'QB', team: 'TB', aav: 12, rank: 69 },
  { id: 'jaylen-waddle', name: 'Jaylen Waddle', position: 'WR', team: 'MIA', aav: 11, rank: 70 },
  { id: 'calvin-ridley', name: 'Calvin Ridley', position: 'WR', team: 'TEN', aav: 11, rank: 71 },
  { id: 'mark-andrews', name: 'Mark Andrews', position: 'TE', team: 'BAL', aav: 11, rank: 72 },
  { id: 'joe-mixon', name: 'Joe Mixon', position: 'RB', team: 'HOU', aav: 11, rank: 73 },
  { id: 'kaleb-johnson', name: 'Kaleb Johnson', position: 'RB', team: 'PIT', aav: 11, rank: 74 },
  { id: 'chris-olave', name: 'Chris Olave', position: 'WR', team: 'NO', aav: 11, rank: 75 },
  { id: 'jerry-jeudy', name: 'Jerry Jeudy', position: 'WR', team: 'CLE', aav: 10, rank: 76 },
  { id: 'bo-nix', name: 'Bo Nix', position: 'QB', team: 'DEN', aav: 10, rank: 77 },
  {
    id: 'quinshon-judkins',
    name: 'Quinshon Judkins',
    position: 'RB',
    team: 'CLE',
    aav: 10,
    rank: 78,
  },
  { id: 'rome-odunze', name: 'Rome Odunze', position: 'WR', team: 'CHI', aav: 10, rank: 79 },
  { id: 'tyrone-tracy', name: 'Tyrone Tracy Jr.', position: 'RB', team: 'NYG', aav: 9, rank: 80 },
  { id: 'deebo-samuel', name: 'Deebo Samuel', position: 'WR', team: 'WAS', aav: 9, rank: 81 },
  {
    id: 'brian-robinson',
    name: 'Brian Robinson Jr.',
    position: 'RB',
    team: 'SF',
    aav: 8,
    rank: 82,
  },
  { id: 'evan-engram', name: 'Evan Engram', position: 'TE', team: 'JAX', aav: 8, rank: 83 },
  { id: 'jakobi-meyers', name: 'Jakobi Meyers', position: 'WR', team: 'LV', aav: 7, rank: 84 },
  {
    id: 'travis-etienne',
    name: 'Travis Etienne Jr.',
    position: 'RB',
    team: 'JAX',
    aav: 7,
    rank: 85,
  },
  { id: 'ricky-pearsall', name: 'Ricky Pearsall', position: 'WR', team: 'SF', aav: 6, rank: 86 },
  { id: 'jaylen-warren', name: 'Jaylen Warren', position: 'RB', team: 'PIT', aav: 6, rank: 87 },
  { id: 'jordan-addison', name: 'Jordan Addison', position: 'WR', team: 'MIN', aav: 6, rank: 88 },
  { id: 'cooper-kupp', name: 'Cooper Kupp', position: 'WR', team: 'SEA', aav: 6, rank: 89 },
  { id: 'stefon-diggs', name: 'Stefon Diggs', position: 'WR', team: 'NE', aav: 5, rank: 90 },
  { id: 'matthew-golden', name: 'Matthew Golden', position: 'WR', team: 'GB', aav: 5, rank: 91 },
  { id: 'tyler-warren', name: 'Tyler Warren', position: 'TE', team: 'IND', aav: 5, rank: 92 },
  { id: 'david-njoku', name: 'David Njoku', position: 'TE', team: 'CLE', aav: 5, rank: 93 },
  { id: 'kyler-murray', name: 'Kyler Murray', position: 'QB', team: 'ARI', aav: 4, rank: 94 },
  { id: 'emeka-egbuka', name: 'Emeka Egbuka', position: 'WR', team: 'TB', aav: 4, rank: 95 },
  { id: 'khalil-shakir', name: 'Khalil Shakir', position: 'WR', team: 'BUF', aav: 4, rank: 96 },
  { id: 'jared-goff', name: 'Jared Goff', position: 'QB', team: 'DET', aav: 4, rank: 97 },
  { id: 'cam-skattebo', name: 'Cam Skattebo', position: 'RB', team: 'NYG', aav: 3, rank: 98 },
  { id: 'jordan-mason', name: 'Jordan Mason', position: 'RB', team: 'SF', aav: 3, rank: 99 },
  {
    id: 'zach-charbonnet',
    name: 'Zach Charbonnet',
    position: 'RB',
    team: 'SEA',
    aav: 3,
    rank: 100,
  },

  // Rank 101-150
  {
    id: 'javonte-williams',
    name: 'Javonte Williams',
    position: 'RB',
    team: 'DAL',
    aav: 3,
    rank: 101,
  },
  { id: 'chris-godwin', name: 'Chris Godwin', position: 'WR', team: 'TB', aav: 3, rank: 102 },
  { id: 'jk-dobbins', name: 'J.K. Dobbins', position: 'RB', team: 'DEN', aav: 3, rank: 103 },
  { id: 'tucker-kraft', name: 'Tucker Kraft', position: 'TE', team: 'TB', aav: 3, rank: 104 },
  { id: 'jayden-reed', name: 'Jayden Reed', position: 'WR', team: 'GB', aav: 3, rank: 105 },
  { id: 'jauan-jennings', name: 'Jauan Jennings', position: 'WR', team: 'SF', aav: 3, rank: 106 },
  { id: 'justin-herbert', name: 'Justin Herbert', position: 'QB', team: 'LAC', aav: 3, rank: 107 },
  {
    id: 'colston-loveland',
    name: 'Colston Loveland',
    position: 'TE',
    team: 'CHI',
    aav: 3,
    rank: 108,
  },
  { id: 'brock-purdy', name: 'Brock Purdy', position: 'QB', team: 'SF', aav: 2, rank: 109 },
  {
    id: 'michael-pittman',
    name: 'Michael Pittman Jr.',
    position: 'WR',
    team: 'IND',
    aav: 2,
    rank: 110,
  },
  { id: 'dak-prescott', name: 'Dak Prescott', position: 'QB', team: 'DAL', aav: 2, rank: 111 },
  { id: 'keon-coleman', name: 'Keon Coleman', position: 'WR', team: 'BUF', aav: 2, rank: 112 },
  { id: 'josh-downs', name: 'Josh Downs', position: 'WR', team: 'IND', aav: 2, rank: 113 },
  {
    id: 'rhamondre-stevenson',
    name: 'Rhamondre Stevenson',
    position: 'RB',
    team: 'NE',
    aav: 2,
    rank: 114,
  },
  { id: 'austin-ekeler', name: 'Austin Ekeler', position: 'RB', team: 'WAS', aav: 1, rank: 115 },
  { id: 'jayden-higgins', name: 'Jayden Higgins', position: 'WR', team: 'HOU', aav: 1, rank: 116 },
  { id: 'tank-bigsby', name: 'Tank Bigsby', position: 'RB', team: 'JAX', aav: 1, rank: 117 },
  { id: 'kyle-pitts', name: 'Kyle Pitts', position: 'TE', team: 'ATL', aav: 1, rank: 118 },
  { id: 'dalton-kincaid', name: 'Dalton Kincaid', position: 'TE', team: 'BUF', aav: 1, rank: 119 },
  { id: 'najee-harris', name: 'Najee Harris', position: 'RB', team: 'LAC', aav: 1, rank: 120 },
  { id: 'nick-chubb', name: 'Nick Chubb', position: 'RB', team: 'HOU', aav: 1, rank: 121 },
  { id: 'rashid-shaheed', name: 'Rashid Shaheed', position: 'WR', team: 'NO', aav: 1, rank: 122 },
  { id: 'cj-stroud', name: 'C.J. Stroud', position: 'QB', team: 'HOU', aav: 1, rank: 123 },
  { id: 'brandon-aiyuk', name: 'Brandon Aiyuk', position: 'WR', team: 'BUF', aav: 1, rank: 124 },
  { id: 'jaydon-blue', name: 'Jaydon Blue', position: 'RB', team: 'DAL', aav: 1, rank: 125 },
  { id: 'drake-maye', name: 'Drake Maye', position: 'QB', team: 'NE', aav: 1, rank: 126 },
  { id: 'darnell-mooney', name: 'Darnell Mooney', position: 'WR', team: 'ATL', aav: 1, rank: 127 },
  {
    id: 'jacory-croskey-merritt',
    name: 'Jacory Croskey-Merritt',
    position: 'RB',
    team: 'WAS',
    aav: 1,
    rank: 128,
  },
  { id: 'braelon-allen', name: 'Braelon Allen', position: 'RB', team: 'NYJ', aav: 1, rank: 129 },
  { id: 'caleb-williams', name: 'Caleb Williams', position: 'QB', team: 'CHI', aav: 1, rank: 130 },
  { id: 'keenan-allen', name: 'Keenan Allen', position: 'WR', team: 'LAC', aav: 1, rank: 131 },
  { id: 'jake-ferguson', name: 'Jake Ferguson', position: 'TE', team: 'DAL', aav: 1, rank: 132 },
  { id: 'trey-benson', name: 'Trey Benson', position: 'RB', team: 'ARI', aav: 1, rank: 133 },
  { id: 'jonnu-smith', name: 'Jonnu Smith', position: 'TE', team: 'PIT', aav: 1, rank: 134 },
  { id: 'marvin-mims', name: 'Marvin Mims Jr.', position: 'WR', team: 'DEN', aav: 1, rank: 135 },
  { id: 'justin-fields', name: 'Justin Fields', position: 'QB', team: 'NYJ', aav: 1, rank: 136 },
  { id: 'tyjae-spears', name: 'Tyjae Spears', position: 'RB', team: 'TEN', aav: 1, rank: 137 },
  {
    id: 'philadelphia-eagles-def',
    name: 'Philadelphia Eagles',
    position: 'DEF',
    team: 'PHI',
    aav: 1,
    rank: 138,
  },
  { id: 'rachaad-white', name: 'Rachaad White', position: 'RB', team: 'TB', aav: 1, rank: 139 },
  {
    id: 'denver-broncos-def',
    name: 'Denver Broncos',
    position: 'DEF',
    team: 'DEN',
    aav: 1,
    rank: 140,
  },
  {
    id: 'luther-burden',
    name: 'Luther Burden III',
    position: 'WR',
    team: 'CHI',
    aav: 1,
    rank: 141,
  },
  { id: 'dallas-goedert', name: 'Dallas Goedert', position: 'TE', team: 'PHI', aav: 1, rank: 142 },
  {
    id: 'washington-commanders-def',
    name: 'Washington Commanders',
    position: 'DEF',
    team: 'WAS',
    aav: 1,
    rank: 143,
  },
  { id: 'jordan-love', name: 'Jordan Love', position: 'QB', team: 'GB', aav: 1, rank: 144 },
  { id: 'christian-kirk', name: 'Christian Kirk', position: 'WR', team: 'HOU', aav: 1, rank: 145 },
  {
    id: 'pittsburgh-steelers-def',
    name: 'Pittsburgh Steelers',
    position: 'DEF',
    team: 'PIT',
    aav: 1,
    rank: 146,
  },
  { id: 'jj-mccarthy', name: 'J.J. McCarthy', position: 'QB', team: 'MIN', aav: 1, rank: 147 },
  { id: 'ray-davis', name: 'Ray Davis', position: 'RB', team: 'BUF', aav: 1, rank: 148 },
  { id: 'rashod-bateman', name: 'Rashod Bateman', position: 'WR', team: 'BAL', aav: 1, rank: 149 },
  {
    id: 'san-francisco-49ers-def',
    name: 'San Francisco 49ers',
    position: 'DEF',
    team: 'SF',
    aav: 1,
    rank: 150,
  },

  // Rank 151-200
  { id: 'tre-harris', name: "Tre' Harris", position: 'WR', team: 'LAC', aav: 1, rank: 151 },
  { id: 'ollie-gordon', name: 'Ollie Gordon II', position: 'RB', team: 'MIA', aav: 1, rank: 152 },
  {
    id: 'minnesota-vikings-def',
    name: 'Minnesota Vikings',
    position: 'DEF',
    team: 'MIN',
    aav: 1,
    rank: 153,
  },
  { id: 'jerome-ford', name: 'Jerome Ford', position: 'RB', team: 'CLE', aav: 1, rank: 154 },
  { id: 'dylan-sampson', name: 'Dylan Sampson', position: 'RB', team: 'CLE', aav: 1, rank: 155 },
  { id: 'bhayshul-tuten', name: 'Bhayshul Tuten', position: 'RB', team: 'JAX', aav: 1, rank: 156 },
  { id: 'tyler-allgeier', name: 'Tyler Allgeier', position: 'RB', team: 'ATL', aav: 1, rank: 157 },
  { id: 'joshua-palmer', name: 'Joshua Palmer', position: 'WR', team: 'BUF', aav: 1, rank: 158 },
  { id: 'adam-thielen', name: 'Adam Thielen', position: 'WR', team: 'MIN', aav: 1, rank: 159 },
  { id: 'zach-ertz', name: 'Zach Ertz', position: 'TE', team: 'WAS', aav: 1, rank: 160 },
  {
    id: 'trevor-lawrence',
    name: 'Trevor Lawrence',
    position: 'QB',
    team: 'JAX',
    aav: 1,
    rank: 161,
  },
  { id: 'cam-ward', name: 'Cam Ward', position: 'QB', team: 'TEN', aav: 1, rank: 162 },
  { id: 'kyle-williams', name: 'Kyle Williams', position: 'WR', team: 'NE', aav: 1, rank: 163 },
  { id: 'rico-dowdle', name: 'Rico Dowdle', position: 'RB', team: 'CAR', aav: 1, rank: 164 },
  { id: 'isaac-guerendo', name: 'Isaac Guerendo', position: 'RB', team: 'SF', aav: 1, rank: 165 },
  {
    id: 'donte-thornton',
    name: "Donte' Thornton Jr.",
    position: 'WR',
    team: 'LV',
    aav: 1,
    rank: 166,
  },
  {
    id: 'baltimore-ravens-def',
    name: 'Baltimore Ravens',
    position: 'DEF',
    team: 'BAL',
    aav: 1,
    rank: 167,
  },
  { id: 'kareem-hunt', name: 'Kareem Hunt', position: 'RB', team: 'KC', aav: 1, rank: 168 },
  {
    id: 'seattle-seahawks-def',
    name: 'Seattle Seahawks',
    position: 'DEF',
    team: 'SEA',
    aav: 1,
    rank: 169,
  },
  {
    id: 'tampa-bay-buccaneers-def',
    name: 'Tampa Bay Buccaneers',
    position: 'DEF',
    team: 'TB',
    aav: 1,
    rank: 170,
  },
  { id: 'hunter-henry', name: 'Hunter Henry', position: 'TE', team: 'NE', aav: 1, rank: 171 },
  { id: 'cedric-tillman', name: 'Cedric Tillman', position: 'WR', team: 'CLE', aav: 1, rank: 172 },
  { id: 'woody-marks', name: 'Woody Marks', position: 'RB', team: 'HOU', aav: 1, rank: 173 },
  {
    id: 'detroit-lions-def',
    name: 'Detroit Lions',
    position: 'DEF',
    team: 'DET',
    aav: 1,
    rank: 174,
  },
  {
    id: 'michael-penix',
    name: 'Michael Penix Jr.',
    position: 'QB',
    team: 'ATL',
    aav: 1,
    rank: 175,
  },
  {
    id: 'houston-texans-def',
    name: 'Houston Texans',
    position: 'DEF',
    team: 'HOU',
    aav: 1,
    rank: 176,
  },
  { id: 'will-shipley', name: 'Will Shipley', position: 'RB', team: 'PHI', aav: 1, rank: 177 },
  {
    id: 'kansas-city-chiefs-def',
    name: 'Kansas City Chiefs',
    position: 'DEF',
    team: 'KC',
    aav: 1,
    rank: 178,
  },
  { id: 'chig-okonkwo', name: 'Chig Okonkwo', position: 'TE', team: 'TEN', aav: 1, rank: 179 },
  { id: 'isaiah-likely', name: 'Isaiah Likely', position: 'TE', team: 'BAL', aav: 1, rank: 180 },
  { id: 'hollywood-brown', name: 'Hollywood Brown', position: 'WR', team: 'KC', aav: 1, rank: 181 },
  { id: 'xavier-legette', name: 'Xavier Legette', position: 'WR', team: 'CAR', aav: 1, rank: 182 },
  { id: 'demario-douglas', name: 'Demario Douglas', position: 'WR', team: 'NE', aav: 1, rank: 183 },
  {
    id: 'brenton-strange',
    name: 'Brenton Strange',
    position: 'TE',
    team: 'JAX',
    aav: 1,
    rank: 184,
  },
  { id: 'blake-corum', name: 'Blake Corum', position: 'RB', team: 'LAR', aav: 1, rank: 185 },
  { id: 'joylen-wright', name: 'Joylen Wright', position: 'RB', team: 'MIA', aav: 1, rank: 186 },
  { id: 'isaac-teslaa', name: 'Isaac TeSlaa', position: 'WR', team: 'DET', aav: 1, rank: 187 },
  { id: 'amari-cooper', name: 'Amari Cooper', position: 'WR', team: 'LV', aav: 1, rank: 188 },
  {
    id: 'keaton-mitchell',
    name: 'Keaton Mitchell',
    position: 'RB',
    team: 'BAL',
    aav: 1,
    rank: 189,
  },
  { id: 'darren-waller', name: 'Darren Waller', position: 'TE', team: 'MIA', aav: 1, rank: 190 },
  { id: 'tua-tagovailoa', name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', aav: 1, rank: 191 },
  { id: 'eric-ayomanor', name: 'Eric Ayomanor', position: 'WR', team: 'TEN', aav: 1, rank: 192 },
  {
    id: 'matthew-stafford',
    name: 'Matthew Stafford',
    position: 'QB',
    team: 'LAR',
    aav: 1,
    rank: 193,
  },
  { id: 'mason-taylor', name: 'Mason Taylor', position: 'TE', team: 'NYJ', aav: 1, rank: 194 },
  { id: 'romeo-doubs', name: 'Romeo Doubs', position: 'WR', team: 'GB', aav: 1, rank: 195 },
  {
    id: 'wandale-robinson',
    name: "Wan'Dale Robinson",
    position: 'WR',
    team: 'NYG',
    aav: 1,
    rank: 196,
  },
  { id: 'jack-bech', name: 'Jack Bech', position: 'WR', team: 'LV', aav: 1, rank: 197 },
  { id: 'bryce-young', name: 'Bryce Young', position: 'QB', team: 'CAR', aav: 1, rank: 198 },
  { id: 'kyle-monangai', name: 'Kyle Monangai', position: 'RB', team: 'CHI', aav: 1, rank: 199 },
  { id: 'dj-giddens', name: 'DJ Giddens', position: 'RB', team: 'IND', aav: 1, rank: 200 },

  // Rank 201-242
  {
    id: 'deandre-hopkins',
    name: 'DeAndre Hopkins',
    position: 'WR',
    team: 'BAL',
    aav: 1,
    rank: 201,
  },
  { id: 'pat-freiermuth', name: 'Pat Freiermuth', position: 'TE', team: 'PIT', aav: 1, rank: 202 },
  { id: 'jalen-mcmillan', name: 'Jalen McMillan', position: 'WR', team: 'TB', aav: 1, rank: 203 },
  {
    id: 'roschon-johnson',
    name: 'Roschon Johnson',
    position: 'RB',
    team: 'CHI',
    aav: 1,
    rank: 204,
  },
  { id: 'tory-horton', name: 'Tory Horton', position: 'WR', team: 'SEA', aav: 1, rank: 205 },
  {
    id: 'shedeur-sanders',
    name: 'Shedeur Sanders',
    position: 'QB',
    team: 'CLE',
    aav: 1,
    rank: 206,
  },
  { id: 'elijah-arroyo', name: 'Elijah Arroyo', position: 'TE', team: 'SEA', aav: 1, rank: 207 },
  { id: 'aaron-rodgers', name: 'Aaron Rodgers', position: 'QB', team: 'PIT', aav: 1, rank: 208 },
  { id: 'jalen-coker', name: 'Jalen Coker', position: 'WR', team: 'CAR', aav: 1, rank: 209 },
  {
    id: 'buffalo-bills-def',
    name: 'Buffalo Bills',
    position: 'DEF',
    team: 'BUF',
    aav: 1,
    rank: 210,
  },
  { id: 'tahj-brooks', name: 'Tahj Brooks', position: 'RB', team: 'DEN', aav: 1, rank: 211 },
  {
    id: 'tennessee-titans-def',
    name: 'Tennessee Titans',
    position: 'DEF',
    team: 'TEN',
    aav: 1,
    rank: 212,
  },
  { id: 'pat-bryant', name: 'Pat Bryant', position: 'WR', team: 'DEN', aav: 1, rank: 213 },
  { id: 'jaxson-dart', name: 'Jaxson Dart', position: 'QB', team: 'NYG', aav: 1, rank: 214 },
  {
    id: 'new-york-jets-def',
    name: 'New York Jets',
    position: 'DEF',
    team: 'NYJ',
    aav: 1,
    rank: 215,
  },
  {
    id: 'new-york-giants-def',
    name: 'New York Giants',
    position: 'DEF',
    team: 'NYG',
    aav: 1,
    rank: 216,
  },
  { id: 'mike-gesicki', name: 'Mike Gesicki', position: 'TE', team: 'CIN', aav: 1, rank: 217 },
  { id: 'sam-darnold', name: 'Sam Darnold', position: 'QB', team: 'SEA', aav: 1, rank: 218 },
  { id: 'justice-hill', name: 'Justice Hill', position: 'RB', team: 'BAL', aav: 1, rank: 219 },
  {
    id: 'new-england-patriots-def',
    name: 'New England Patriots',
    position: 'DEF',
    team: 'NE',
    aav: 1,
    rank: 220,
  },
  { id: 'raheem-mostert', name: 'Raheem Mostert', position: 'RB', team: 'LV', aav: 1, rank: 221 },
  {
    id: 'green-bay-packers-def',
    name: 'Green Bay Packers',
    position: 'DEF',
    team: 'GB',
    aav: 1,
    rank: 222,
  },
  { id: 'kendre-miller', name: 'Kendre Miller', position: 'RB', team: 'NO', aav: 1, rank: 223 },
  {
    id: 'miami-dolphins-def',
    name: 'Miami Dolphins',
    position: 'DEF',
    team: 'MIA',
    aav: 1,
    rank: 224,
  },
  { id: 'tyler-lockett', name: 'Tyler Lockett', position: 'WR', team: 'TEN', aav: 1, rank: 225 },
  {
    id: 'los-angeles-chargers-def',
    name: 'Los Angeles Chargers',
    position: 'DEF',
    team: 'LAC',
    aav: 1,
    rank: 226,
  },
  {
    id: 'los-angeles-rams-def',
    name: 'Los Angeles Rams',
    position: 'DEF',
    team: 'LAR',
    aav: 1,
    rank: 227,
  },
  { id: 'cade-otton', name: 'Cade Otton', position: 'TE', team: 'TB', aav: 1, rank: 228 },
  { id: 'geno-smith', name: 'Geno Smith', position: 'QB', team: 'LV', aav: 1, rank: 229 },
  { id: 'miles-sanders', name: 'Miles Sanders', position: 'RB', team: 'DAL', aav: 1, rank: 230 },
  {
    id: 'quentin-johnston',
    name: 'Quentin Johnston',
    position: 'WR',
    team: 'LAC',
    aav: 1,
    rank: 231,
  },
  { id: 'troy-franklin', name: 'Troy Franklin', position: 'WR', team: 'DEN', aav: 1, rank: 232 },
  { id: 'brashard-smith', name: 'Brashard Smith', position: 'RB', team: 'KC', aav: 1, rank: 233 },
  {
    id: 'anthony-richardson',
    name: 'Anthony Richardson',
    position: 'QB',
    team: 'IND',
    aav: 1,
    rank: 234,
  },
  { id: 'alec-pierce', name: 'Alec Pierce', position: 'WR', team: 'IND', aav: 1, rank: 235 },
  { id: 'dalton-schultz', name: 'Dalton Schultz', position: 'TE', team: 'HOU', aav: 1, rank: 236 },
  { id: 'dyami-brown', name: 'Dyami Brown', position: 'WR', team: 'JAX', aav: 1, rank: 237 },
  { id: 'michael-wilson', name: 'Michael Wilson', position: 'WR', team: 'ARI', aav: 1, rank: 238 },
  { id: 'jalen-royals', name: 'Jalen Royals', position: 'WR', team: 'KC', aav: 1, rank: 239 },
  {
    id: 'adonai-mitchell',
    name: 'Adonai Mitchell',
    position: 'WR',
    team: 'IND',
    aav: 1,
    rank: 240,
  },
  { id: 'marcus-marshall', name: 'Marcus Marshall', position: 'RB', team: '', aav: 1, rank: 241 },
  { id: 'dalton-sturm', name: 'Dalton Sturm', position: 'QB', team: '', aav: 1, rank: 242 },
];

// Draft constraints for roster composition
export const ROSTER_CONSTRAINTS = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 2, // RB/WR/TE
  BENCH: 6,
  DEF: 1,
  TOTAL_STARTERS: 9, // QB + RB + WR + TE + FLEX + DEF
  TOTAL_ROSTER: 16, // Starters + Bench
  BUDGET: 200,
};

// Team names for 12-team league
export const TEAM_NAMES = [
  'Team Alpha',
  'Team Bravo',
  'Team Charlie',
  'Team Delta',
  'Team Echo',
  'Team Foxtrot',
  'Team Golf',
  'Team Hotel',
  'Team India',
  'Team Juliet',
  'Team Kilo',
  'Team Lima',
];

// Utility function to generate random price within X% of AAV
export function generateRandomPrice(aav: number, variancePercent: number = 10): number {
  // Special handling for very low AAV players to prevent unrealistic pricing
  if (aav <= 3) {
    // For $1-3 players, keep them in the $1-5 range
    const min = 1;
    const max = Math.min(5, aav + 2);
    return Math.round(Math.random() * (max - min) + min);
  }

  // For higher value players, use percentage variance but with reasonable bounds
  const variance = Math.min(aav * (variancePercent / 100), aav * 0.5); // Cap variance at 50% of AAV
  const min = Math.max(1, Math.round(aav - variance));
  const max = Math.round(aav + variance);
  return Math.round(Math.random() * (max - min) + min);
}

// Function to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function canAddPlayerToRoster(
  roster: DraftPick[],
  player: Player,
  constraints = ROSTER_CONSTRAINTS
): boolean {
  const positionCounts = {
    QB: roster.filter(p => p.player.position === 'QB').length,
    RB: roster.filter(p => p.player.position === 'RB').length,
    WR: roster.filter(p => p.player.position === 'WR').length,
    TE: roster.filter(p => p.player.position === 'TE').length,
    DEF: roster.filter(p => p.player.position === 'DEF').length,
  };

  // Check if we can add this position
  switch (player.position) {
    case 'QB':
      return positionCounts.QB < constraints.QB;
    case 'RB':
      // Can add if we need RB starters OR flex OR bench
      const rbNeeded = Math.max(0, constraints.RB - positionCounts.RB);
      const flexSpots = constraints.FLEX;
      const benchSpots = constraints.BENCH;
      const totalRBSpots = constraints.RB + flexSpots + benchSpots;
      return positionCounts.RB < totalRBSpots;
    case 'WR':
      // Can add if we need WR starters OR flex OR bench
      const wrNeeded = Math.max(0, constraints.WR - positionCounts.WR);
      const totalWRSpots = constraints.WR + constraints.FLEX + constraints.BENCH;
      return positionCounts.WR < totalWRSpots;
    case 'TE':
      // Can add if we need TE starter OR flex OR bench
      const totalTESpots = constraints.TE + constraints.FLEX + constraints.BENCH;
      return positionCounts.TE < totalTESpots;
    case 'DEF':
      return positionCounts.DEF < constraints.DEF;
    default:
      return false;
  }
}
