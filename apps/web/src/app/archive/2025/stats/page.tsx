import { StatsSeasonView } from '@/app/stats/stats-season-view';

interface StatsPageProps {
  searchParams: {
    team?: string;
    view?:
      | 'team'
      | 'league'
      | 'schedule'
      | 'trends'
      | 'scatter'
      | 'transactions'
      | 'start-sit'
      | 'waiver-analysis';
    week?: string;
  };
}

export default function StatsPage({ searchParams }: StatsPageProps) {
  return <StatsSeasonView season="2025" searchParams={searchParams} />;
}
