export type GradeTxn = {
  id: string;
  type: string;
  createdAt: string;
  rosterIds: number[];
  leagueId: string;
  leagueName: string;
  teamName?: string;
  faabCost: number; // FAAB spent on this transaction (0 for free agents/trades)
  rawScore: number; // Original VORP score before cost adjustment
  costPenalty: number; // FAAB cost penalty applied
  players: Array<{
    playerId: string;
    name: string;
    position: string;
    role: 'add' | 'drop';
    pre: { ppg: number; pps: number; total: number };
    post: { poPts: number };
    forYou?: {
      starts: number;
      points: number;
      weightedPoints: number;
    };
    afterDrop?: {
      selfHarm: number;
      oppHarm: number;
      selfHarmWeighted: number;
      oppHarmWeighted: number;
    };
    weeklyPoints: Array<{
      week: number;
      points: number;
      started: boolean;
      weight: number;
    }>;
  }>;
  score: number; // Final cost-adjusted score
  grade: string;
};

export type RawTxn = {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  rosterIds: number[];
  adds?: Array<{
    rosterId: number;
    players?: Array<{ id: string; fullName: string; position: string }>;
  }>;
  drops?: Array<{
    rosterId: number;
    players?: Array<{ id: string; fullName: string; position: string }>;
  }>;
  settings?: {
    waiver_bid?: number; // FAAB cost for waiver transactions
  };
};

export type TeamInfo = {
  rosterId: number;
  teamName: string;
  ownerName: string;
  leagueId: string;
  leagueName: string;
};
