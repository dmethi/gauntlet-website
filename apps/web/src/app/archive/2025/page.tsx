import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, ClipboardList, Home, Star, Swords } from 'lucide-react';
import { Container, PageHeader } from '@gauntlet/ui';
import { getLeaguesForSeason } from '@/config/leagues';

export const metadata = {
  title: '2025 Season Archive — The Gauntlet',
  description: "The Gauntlet's inaugural 2025 season, preserved.",
};

const ArchiveLink = ({
  Icon,
  title,
  description,
  href,
}: {
  Icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}) => (
  <Link
    href={href}
    className="flex items-start gap-4 rounded-md border border-border bg-card p-5 hover:border-gauntlet-crimson/50 transition-colors"
  >
    <Icon className="h-6 w-6 flex-shrink-0 text-gauntlet-crimson" />
    <div>
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  </Link>
);

const Archive2025Page = () => {
  const leagues = getLeaguesForSeason('2025');
  const leagueNames = leagues.map(l => l.name).join(' & ');

  return (
    <Container className="py-8">
      <PageHeader
        title="2025 Season Archive"
        subtitle={
          leagueNames
            ? `The Gauntlet's first season — ${leagueNames}. Preserved and still browsable.`
            : "The Gauntlet's first season, preserved and still browsable."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ArchiveLink
          Icon={Home}
          title="Competition"
          description="Final standings, playoff results, and season recaps."
          href="/archive/2025/competition"
        />
        <ArchiveLink
          Icon={BarChart3}
          title="Stats Hub"
          description="Team and player stats for the full 2025 season."
          href="/archive/2025/stats"
        />
        <ArchiveLink
          Icon={Swords}
          title="Matchups"
          description="Every week's matchups across both leagues."
          href="/archive/2025/matchups"
        />
        <ArchiveLink
          Icon={Star}
          title="Hall of Fame"
          description="The best (and worst) performances of the season."
          href="/archive/2025/hall-of-fame"
        />
        <ArchiveLink
          Icon={ClipboardList}
          title="Draft Analysis"
          description="How the 2025 drafts played out, grades and all."
          href="/archive/2025/draft-analysis"
        />
      </div>
    </Container>
  );
};

export default Archive2025Page;
