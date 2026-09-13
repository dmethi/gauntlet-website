export interface CompetitionLink {
  href: string;
  label: string;
  description: string;
}

export interface ReportHubSection {
  id: 'previews' | 'recaps' | 'live';
  title: string;
  description: string;
  links: CompetitionLink[];
}

export const REPORT_HUB_SECTIONS: ReportHubSection[] = [
  {
    id: 'previews',
    title: 'Previews',
    description: 'What to watch before each week kicks off.',
    links: [
      {
        href: '/competition/preview/2026/week-1',
        label: 'Week 1 Preview',
        description: 'Opening odds, score races, and matchup curves across all three Legions',
      },
    ],
  },
  {
    id: 'recaps',
    title: 'Recaps',
    description: 'Draft analysis and weekly stories after the results are in.',
    links: [
      {
        href: '/draft/analysis',
        label: '2026 Draft Recap',
        description: 'Draft grades, superlatives, shared rosters, and price fault lines',
      },
    ],
  },
  {
    id: 'live',
    title: 'Live Coverage',
    description: 'Follow every matchup and the latest simulated odds.',
    links: [
      {
        href: '/matchups',
        label: 'Live Scores & Odds',
        description: 'Latest simulations and every head-to-head matchup across all three Legions',
      },
    ],
  },
];

export const REPORT_HUB_LINKS = REPORT_HUB_SECTIONS.flatMap(section => section.links);

export const REPORT_ARCHIVE_LINK: CompetitionLink = {
  href: '/competition/reports/archive/2025',
  label: '2025 Archive',
  description: 'Browse every weekly report from the 2025 Gauntlet season',
};

export const COMPETITION_EXPLORE_LINKS: CompetitionLink[] = [
  {
    href: '/competition/reports',
    label: 'Weekly Reports',
    description: 'Previews, live scoreboards, draft coverage, recaps, and weekly analysis',
  },
  {
    href: '/competition/playoff-scenarios',
    label: 'Playoff Scenarios',
    description: 'Seeding odds and the path to the Gauntlet championship',
  },
  {
    href: '/league/transactions',
    label: 'Transactions',
    description: 'Every add, drop, and trade across all three Legions',
  },
];
