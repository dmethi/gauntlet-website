import { Position } from '@gauntlet/types';

export const NFL_POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

export const NFL_TEAMS = {
  ARI: { name: 'Arizona Cardinals', conference: 'NFC', division: 'West' },
  ATL: { name: 'Atlanta Falcons', conference: 'NFC', division: 'South' },
  BAL: { name: 'Baltimore Ravens', conference: 'AFC', division: 'North' },
  BUF: { name: 'Buffalo Bills', conference: 'AFC', division: 'East' },
  CAR: { name: 'Carolina Panthers', conference: 'NFC', division: 'South' },
  CHI: { name: 'Chicago Bears', conference: 'NFC', division: 'North' },
  CIN: { name: 'Cincinnati Bengals', conference: 'AFC', division: 'North' },
  CLE: { name: 'Cleveland Browns', conference: 'AFC', division: 'North' },
  DAL: { name: 'Dallas Cowboys', conference: 'NFC', division: 'East' },
  DEN: { name: 'Denver Broncos', conference: 'AFC', division: 'West' },
  DET: { name: 'Detroit Lions', conference: 'NFC', division: 'North' },
  GB: { name: 'Green Bay Packers', conference: 'NFC', division: 'North' },
  HOU: { name: 'Houston Texans', conference: 'AFC', division: 'South' },
  IND: { name: 'Indianapolis Colts', conference: 'AFC', division: 'South' },
  JAX: { name: 'Jacksonville Jaguars', conference: 'AFC', division: 'South' },
  KC: { name: 'Kansas City Chiefs', conference: 'AFC', division: 'West' },
  LV: { name: 'Las Vegas Raiders', conference: 'AFC', division: 'West' },
  LAC: { name: 'Los Angeles Chargers', conference: 'AFC', division: 'West' },
  LAR: { name: 'Los Angeles Rams', conference: 'NFC', division: 'West' },
  MIA: { name: 'Miami Dolphins', conference: 'AFC', division: 'East' },
  MIN: { name: 'Minnesota Vikings', conference: 'NFC', division: 'North' },
  NE: { name: 'New England Patriots', conference: 'AFC', division: 'East' },
  NO: { name: 'New Orleans Saints', conference: 'NFC', division: 'South' },
  NYG: { name: 'New York Giants', conference: 'NFC', division: 'East' },
  NYJ: { name: 'New York Jets', conference: 'AFC', division: 'East' },
  PHI: { name: 'Philadelphia Eagles', conference: 'NFC', division: 'East' },
  PIT: { name: 'Pittsburgh Steelers', conference: 'AFC', division: 'North' },
  SF: { name: 'San Francisco 49ers', conference: 'NFC', division: 'West' },
  SEA: { name: 'Seattle Seahawks', conference: 'NFC', division: 'West' },
  TB: { name: 'Tampa Bay Buccaneers', conference: 'NFC', division: 'South' },
  TEN: { name: 'Tennessee Titans', conference: 'AFC', division: 'South' },
  WAS: { name: 'Washington Commanders', conference: 'NFC', division: 'East' }
} as const;

export const DEFAULT_LINEUP_SETTINGS = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1,
  K: 1,
  DEF: 1,
  BENCH: 6
};

export const STANDARD_SCORING = {
  passing: {
    passingYards: 0.04, // 1 point per 25 yards
    passingTDs: 4,
    passingINTs: -2,
    passing2PT: 2
  },
  rushing: {
    rushingYards: 0.1, // 1 point per 10 yards
    rushingTDs: 6,
    rushing2PT: 2
  },
  receiving: {
    receivingYards: 0.1, // 1 point per 10 yards
    receivingTDs: 6,
    receptions: 0, // Standard scoring (no PPR)
    receiving2PT: 2
  },
  kicking: {
    extraPoints: 1,
    fieldGoals0to39: 3,
    fieldGoals40to49: 4,
    fieldGoals50plus: 5,
    missedExtraPoints: -1,
    missedFieldGoals: -1
  },
  defense: {
    sacks: 1,
    interceptions: 2,
    fumbleRecoveries: 2,
    safeties: 2,
    defensiveTDs: 6,
    pointsAllowed0: 10,
    pointsAllowed1To6: 7,
    pointsAllowed7To13: 4,
    pointsAllowed14To20: 1,
    pointsAllowed21To27: 0,
    pointsAllowed28To34: -1,
    pointsAllowed35Plus: -4
  }
};

export const PPR_SCORING = {
  ...STANDARD_SCORING,
  receiving: {
    ...STANDARD_SCORING.receiving,
    receptions: 1 // 1 point per reception
  }
};

export const HALF_PPR_SCORING = {
  ...STANDARD_SCORING,
  receiving: {
    ...STANDARD_SCORING.receiving,
    receptions: 0.5 // 0.5 points per reception
  }
};

export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
}; 