// FantasyPros ADP Data Integration
// Parse and integrate real ADP rankings for draft analysis

export interface FantasyProADPEntry {
  rank: number;
  player: string;
  team: string;
  bye: number;
  position: string;
  yahoo: number;
  sleeper: number;
  rtSports: number;
  avg: number;
  realTime: string;
}

// Map to store ADP data by player name for quick lookup
const adpDataMap = new Map<string, FantasyProADPEntry>();

// Read ADP data from CSV file at build time
// This will be replaced with actual file reading in production
const FANTASYPROS_ADP_CSV = `"Rank","Player","Team","Bye","POS","Yahoo","Sleeper","RTSports","AVG","Real-Time (?)"
"1","Ja'Marr Chase","CIN","10","WR1","1","1","1","1.0","1"
"2","Bijan Robinson","ATL","5","RB1","2","3","2","2.3","2"
"3","Saquon Barkley","PHI","9","RB2","3","2","4","3.0","3"
"4","Jahmyr Gibbs","DET","8","RB3","4","4","3","3.7","4"
"5","Justin Jefferson","MIN","6","WR2","5","5","6","5.3","5"
"6","CeeDee Lamb","DAL","10","WR3","6","7","5","6.0","6"
"7","Christian McCaffrey","SF","14","RB4","7","9","7","7.7","7"
"8","Derrick Henry","BAL","7","RB5","8","6","12","8.7","8"
"9","Amon-Ra St. Brown","DET","8","WR4","10","8","10","9.3","10  -1"
"10","Ashton Jeanty","LV","8","RB6","11","10","8","9.7","12  -2"
"11","Malik Nabers","NYG","14","WR5","12","11","9","10.7","11"
"12","Nico Collins","HOU","6","WR6","9","13","11","11.0","9  +3"
"13","Puka Nacua","LAR","8","WR7","13","12","17","14.0","14  -1"
"14","Josh Jacobs","GB","5","RB7","15","14","15","14.7","15  -1"
"15","Brian Thomas Jr.","JAC","8","WR8","14","20","13","15.7","13  +2"
"16","De'Von Achane","MIA","12","RB8","16","15","18","16.3","17  -1"
"17","Drake London","ATL","5","WR9","18","16","19","17.7","16  +1"
"18","Jonathan Taylor","IND","11","RB9","17","17","20","18.0","18"
"19","Bucky Irving","TB","9","RB10","19","24","16","19.7","19"
"20","Brock Bowers","LV","8","TE1","20","21","21","20.7","21  -1"
"21","Chase Brown","CIN","10","RB11","24","26","14","21.3","20  +1"
"22","Josh Allen","BUF","7","QB1","21","19","24","21.3","23  -1"
"23","A.J. Brown","PHI","9","WR10","23","18","25","22.0","22  +1"
"24","Lamar Jackson","BAL","7","QB2","22","22","22","22.0","24"
"25","Kyren Williams","LAR","8","RB12","26","23","23","24.0","26  -1"
"26","Ladd McConkey","LAC","12","WR11","25","25","30","26.7","25  +1"
"27","Trey McBride","ARI","8","TE2","27","29","27","27.7","27"
"28","James Cook","BUF","7","RB13","31","28","28","29.0","31  -3"
"29","Jayden Daniels","WAS","12","QB3","28","35","29","30.7","29"
"30","Omarion Hampton","LAC","12","RB14","36","31","26","31.0","32  -2"
"31","Tyreek Hill","MIA","12","WR12","35","27","31","31.0","39  -8"
"32","Tee Higgins","CIN","10","WR13","29","30","36","31.7","30  +2"
"33","Jaxon Smith-Njigba","SEA","8","WR14","32","32","34","32.7","34  -1"
"34","George Kittle","SF","14","TE3","30","37","40","35.7","28  +6"
"35","Jalen Hurts","PHI","9","QB4","33","34","42","36.3","33  +2"
"36","Joe Burrow","CIN","10","QB5","40","42","32","38.0","42  -6"
"37","Breece Hall","NYJ","9","RB15","44","33","37","38.0","45  -8"
"38","Alvin Kamara","NO","11","RB16","43","39","33","38.3","38"
"39","Mike Evans","TB","9","WR15","34","38","46","39.3","35  +4"
"40","Marvin Harrison Jr.","ARI","8","WR16","38","36","45","39.7","37  +3"
"41","Kenneth Walker III","SEA","8","RB17","39","41","39","39.7","36  +5"
"42","Garrett Wilson","NYJ","9","WR17","37","40","44","40.3","43  -1"
"43","Terry McLaurin","WAS","12","WR18","42","43","38","41.0","40  +3"
"44","Chuba Hubbard","CAR","14","RB18","41","45","41","42.3","41  +3"
"45","Davante Adams","LAR","8","WR19","45","44","43","44.0","47  -2"
"46","James Conner","ARI","8","RB19","46","47","47","46.7","44  +2"
"47","TreVeyon Henderson","NE","14","RB20","58","48","35","47.0","46  +1"
"48","DK Metcalf","PIT","5","WR20","49","46","53","49.3","48"
"49","DJ Moore","CHI","5","WR21","56","49","51","52.0","58  -9"
"50","Patrick Mahomes II","KC","10","QB6","48","53","56","52.3","54  -4"
"51","RJ Harvey","DEN","12","RB21","52","55","50","52.3","52  -1"
"52","Courtland Sutton","DEN","12","WR22","60","51","49","53.3","55  -3"
"53","Sam LaPorta","DET","8","TE4","47","50","67","54.7","50  +3"
"54","David Montgomery","DET","8","RB22","50","52","62","54.7","59  -5"
"55","DeVonta Smith","PHI","9","WR23","51","56","61","56.0","53  +2"
"56","Xavier Worthy","KC","10","WR24","57","58","58","57.7","56"
"57","Tony Pollard","TEN","10","RB23","54","67","54","58.3","49  +8"
"58","Isiah Pacheco","KC","10","RB24","63","57","55","58.3","60  -2"
"59","D'Andre Swift","CHI","5","RB25","67","65","48","60.0","62  -3"
"60","George Pickens","DAL","10","WR25","55","63","63","60.3","51  +9"
"61","Tetairoa McMillan","CAR","14","WR26","71","59","52","60.7","57  +4"
"62","Jameson Williams","DET","8","WR27","65","61","60","62.0","63  -1"
"63","Travis Kelce","KC","10","TE5","59","64","64","62.3","66  -3"
"64","Zay Flowers","BAL","7","WR28","61","60","70","63.7","65  -1"
"65","T.J. Hockenson","MIN","6","TE6","53","62","78","64.3","64  +1"
"66","Aaron Jones Sr.","MIN","6","RB26","73","66","59","66.0","70  -4"
"67","Rashee Rice","KC","10","WR29","72","54","74","66.7","83  -16"
"68","Calvin Ridley","TEN","10","WR30","75","71","57","67.7","69  -1"
"69","Baker Mayfield","TB","9","QB7","68","69","68","68.3","77  -8"
"70","Jaylen Waddle","MIA","12","WR31","64","70","76","70.0","61  +9"
"71","Bo Nix","DEN","12","QB8","66","77","72","71.7","67  +4"
"72","Travis Hunter","JAC","8","WR32","74","68","73","71.7","71  +1"
"73","Kaleb Johnson","PIT","5","RB27","69","74","77","73.3","72  +1"
"74","Mark Andrews","BAL","7","TE7","62","72","93","75.7","68  +6"
"75","Tyrone Tracy Jr.","NYG","14","RB28","81","80","66","75.7","73  +2"
"76","Jerry Jeudy","CLE","9","WR33","90","76","65","77.0","85  -9"
"77","Chris Olave","NO","11","WR34","76","75","80","77.0","78  -1"
"78","Rome Odunze","CHI","5","WR35","79","79","81","79.7","76  +2"
"79","Jaylen Warren","PIT","5","RB29","86","87","75","82.7","81  -2"
"80","Ricky Pearsall","SF","14","WR36","94","86","69","83.0","74  +6"
"81","Joe Mixon","HOU","6","RB30","78","73","102","84.3","111  -30"
"82","Evan Engram","DEN","12","TE8","80","83","90","84.3","87  -5"
"83","Emeka Egbuka","TB","9","WR37","93","95","71","86.3","75  +8"
"84","Deebo Samuel Sr.","WAS","12","WR38","98","81","85","88.0","91  -7"
"85","Jordan Mason","MIN","6","RB31","89","99","79","89.0","80  +5"
"86","David Njoku","CLE","9","TE9","77","93","101","90.3","86"
"87","Stefon Diggs","NE","14","WR39","97","90","86","91.0","88  -1"
"88","Jakobi Meyers","LV","8","WR40","95","84","96","91.7","89  -1"
"89","Travis Etienne Jr.","JAC","8","RB32","107","85","87","93.0","96  -7"
"90","Jordan Addison","MIN","6","WR41","96","88","97","93.7","98  -8"
"91","Kyler Murray","ARI","8","QB9","92","94","95","93.7","92  -1"
"92","Dak Prescott","DAL","10","QB10","83","111","91","95.0","84  +8"`;

// Parse CSV data and populate the map
const parseADPData = () => {
  const lines = FANTASYPROS_ADP_CSV.trim().split('\n');
  lines.slice(1).forEach(line => {
    // Skip header
    const values = line.split(',').map(val => val.replace(/"/g, ''));

    const entry: FantasyProADPEntry = {
      rank: parseInt(values[0]),
      player: values[1],
      team: values[2],
      bye: parseInt(values[3]),
      position: values[4],
      yahoo: parseInt(values[5]),
      sleeper: parseInt(values[6]),
      rtSports: parseInt(values[7]),
      avg: parseFloat(values[8]),
      realTime: values[9] || values[0], // Fallback to rank if real-time not available
    };

    adpDataMap.set(entry.player, entry);
  });
};

// Initialize the data
parseADPData();

// Helper functions for ADP lookups
export const getADPRank = (playerName: string): number | null => {
  const entry = adpDataMap.get(playerName);
  return entry ? entry.rank : null;
};

export const getADPEntry = (playerName: string): FantasyProADPEntry | null => {
  return adpDataMap.get(playerName) || null;
};

// Fuzzy matching for player names that might not match exactly
export const findADPByFuzzyMatch = (playerName: string): FantasyProADPEntry | null => {
  // First try exact match
  let entry = adpDataMap.get(playerName);
  if (entry) return entry;

  // Try removing common variations
  const variations = [
    playerName.replace(/'/g, "'"), // Smart quote to regular quote
    playerName.replace(/'/g, ''), // Remove apostrophe entirely
    playerName.replace(/\./g, ''), // Remove periods
    playerName.replace(/Jr\.?/g, 'Jr.'), // Standardize Jr
    playerName.replace(/Jr\.?/g, ''), // Remove Jr entirely
  ];

  for (const variation of variations) {
    entry = adpDataMap.get(variation);
    if (entry) return entry;
  }

  // Try partial matching (last resort)
  for (const [name, data] of adpDataMap.entries()) {
    if (name.includes(playerName) || playerName.includes(name)) {
      return data;
    }
  }

  return null;
};

// Get all ADP entries for reference
export const getAllADPData = (): FantasyProADPEntry[] => {
  return Array.from(adpDataMap.values()).sort((a, b) => a.rank - b.rank);
};
