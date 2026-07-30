import { StatsSeasonView } from '@/app/stats/stats-season-view';

interface StatsPageProps {
  searchParams: Promise<{
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
  }>;
}

export default async function StatsPage(props: StatsPageProps) {
  const searchParams = await props.searchParams;
  return <StatsSeasonView season="2025" searchParams={searchParams} />;
}
