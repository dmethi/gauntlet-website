export const RULES_2026_PATH = '/year-in-review/2026-rules';

export const rules2026Meta = {
  seasonLabel: '2026 Season',
  title: 'League Overview & Foundational Contract',
  subtitle:
    'The operating format for Year Two: four leagues, 48 managers, promotion and relegation, and a $24,000 prize pool.',
  banner:
    'Fees, schedule dates, and draft date are subject to change. Rule change proposal deadline: July 16, 2026.',
  highlights: [
    { value: '48', label: 'Teams' },
    { value: '4', label: 'Leagues' },
    { value: '$24K', label: 'Prize Pool' },
    { value: '$500', label: 'Buy-In' },
  ],
};

export const rules2026Structure = [
  'League 1 (Top Tier): 12 teams',
  'League 2 (Second Tier): 12 teams',
  'League 3 (Third Tier, Group A): 12 teams',
  'League 4 (Third Tier, Group B): 12 teams',
  'Teams are randomly assigned to leagues before the season, no later than one week before the draft.',
  'Future expansions are added beneath the current lowest tier so upward movement always happens one tier at a time.',
];

export const rules2026PromotionRows = [
  {
    league: 'League 1',
    promoted: 'Already top tier',
    relegated: 'Bottom 6 move to League 2',
  },
  {
    league: 'League 2',
    promoted: 'Top 6 move to League 1',
    relegated: 'Bottom 6 move to League 3 or 4',
  },
  {
    league: 'League 3',
    promoted: 'Top 3 move to League 2',
    relegated: 'Already bottom tier',
  },
  {
    league: 'League 4',
    promoted: 'Top 3 move to League 2',
    relegated: 'Already bottom tier',
  },
];

export const rules2026PromotionNotes = [
  'Thresholds are determined by end-of-season playoff rankings, 1 through 12, within each league.',
  'Teams outside the playoffs are ranked 7 through 12 using toilet bowl results.',
  'League 2 teams relegated downward are assigned into League 3 or League 4 at random by the commissioner.',
  'If a higher-tier manager drops out, the highest-finishing eligible team from the tier below fills the spot. Total regular-season points break ties.',
];

export const rules2026Roster = [
  '1 QB',
  '2 RB',
  '2 WR',
  '1 TE',
  '2 FLEX (WR/RB/TE)',
  '1 DEF',
  '6 Bench',
  '2 IR',
];

export const rules2026ScoringGroups = [
  {
    title: 'Passing',
    rows: [
      '1 point per 25 yards',
      '4 points per passing TD',
      '2 points per passing 2-point conversion',
      '-2 points per interception',
    ],
  },
  {
    title: 'Receiving',
    rows: [
      '1 point per 10 yards',
      '6 points per receiving TD',
      '2 points per receiving 2-point conversion',
      '0.5 points per reception',
    ],
  },
  {
    title: 'Rushing',
    rows: [
      '1 point per 10 yards',
      '6 points per rushing TD',
      '2 points per rushing 2-point conversion',
      '0.5 points per rushing first down',
    ],
  },
  {
    title: 'Defense & Misc.',
    rows: [
      '-1 point per fumble',
      '-1 point per fumble lost',
      '6 points per special teams TD',
      '1 point per sack',
      '1 point per fumble forced',
      '1 point per fumble recovered',
      '2 points per interception',
      '2 points per safety',
      '6 points per defensive or special teams TD',
      '2 points per blocked kick',
      '1 point per 4th down stop',
      '0.75 points per 3-and-out',
      '0.5 points per tackle for loss',
      '0.3 points per QB hit',
      '-0.1 points per point allowed',
      '-0.005 points per yard allowed',
    ],
  },
];

export const rules2026LeagueOps = [
  {
    title: 'Draft',
    body: 'Auction format with a $200 draft budget per team.',
  },
  {
    title: 'Trades',
    body: 'Trades lock at the start of the first NFL game in Week 14. Trades go through unless collusion is suspected.',
  },
  {
    title: 'Waivers',
    body: 'FAAB waivers with a $200 seasonal budget. Identical bids break by rolling waiver priority.',
  },
  {
    title: 'Tiebreakers',
    body: 'Regular-season ties count as 0.5 wins each. In the playoffs, the higher seed advances from exact ties.',
  },
];

export const rules2026Schedule = [
  'Teams are randomly assigned into leagues and divisions no later than one week before the draft.',
  'Weeks 1 to 3 are divisional matchups, one against each division opponent.',
  'Weeks 4 to 11 are non-divisional games within the league.',
  'Weeks 12 to 14 return to divisional matchups for the second round-robin.',
  'Matchup order inside each block is randomized at season start.',
];

export const rules2026PlayoffNotes = [
  'Six teams per league make the playoffs. The remaining six go to the toilet bowl.',
  'Seeds 1 through 3 are division winners ranked by wins, then total points.',
  'Seeds 4 through 6 are the next three best records, again using total points as tiebreaker.',
  'Top two playoff seeds receive first-round byes.',
  'Toilet bowl bottom two seeds receive byes, with losing teams advancing.',
  'Every playoff round is reseeded so the highest remaining seed plays the lowest remaining seed.',
  'Final league rankings 1 through 12 also establish waitlist priority when replacing dropouts in higher tiers.',
];

export const rules2026PayoutRows = [
  { category: 'Per-league 1st place', amount: '$12,000', note: '$3,000 across 4 leagues' },
  { category: 'Per-league 2nd place', amount: '$4,000', note: '$1,000 across 4 leagues' },
  { category: 'Per-league 3rd place', amount: '$2,000', note: '$500 across 4 leagues' },
  { category: 'Weekly cross-league prizes', amount: '$4,200', note: '14 weeks x $300' },
  { category: 'Season-long scoring title', amount: '$1,000', note: 'Regular season only' },
  { category: 'Playoff top scorer', amount: '$800', note: 'Weeks 15 to 17, all 48 teams' },
];

export const rules2026WeeklyPrizeNotes = [
  'Top weekly scorer: $150',
  'Second-highest weekly scorer: $75',
  'Biggest weekly blowout: $75',
  'Weekly prize categories can be adjusted by the commissioner as long as the total weekly pool stays at $300 and top scorer remains $150.',
  'Ties split the relevant prize evenly.',
];

export const rules2026Governance = [
  'Buy-in is $500 per team, with a tentative payment deadline of August 18.',
  'Unpaid teams may lose their spot to the waitlist at the commissioner’s discretion.',
  'Managers can submit rule change proposals throughout the year and offseason.',
  'A proposal needs two-thirds support from active managers to pass.',
  'The commissioner can make offseason rule changes without a vote if they are announced by June 1.',
  'League structure for the following year must be finalized no later than Week 4 of the current season.',
  'Expansion is capped at 24 additional teams per cycle, added to the bottom tier.',
];

export const rules2026CommissionerPowers = [
  'Random league and division assignment',
  'Trade collusion review and adjudication',
  'Announcing offseason rule changes by June 1',
  'Finalizing promotion and relegation structure by Week 4',
  'Managing the waitlist for expansion and dropout replacement',
  'Administering weekly prize categories within the Section 7 payout parameters',
  'Resolving contract ambiguities in good faith with league input when appropriate',
];
