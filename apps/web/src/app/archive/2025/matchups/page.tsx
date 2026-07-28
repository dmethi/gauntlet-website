import { MatchupsView } from '@/app/matchups/matchups-view';
import { getLeaguesForSeason } from '@/config/leagues';

const ARCHIVE_2025_LEAGUES = getLeaguesForSeason('2025');

export default function MatchupsPage(): JSX.Element {
  return <MatchupsView leagues={ARCHIVE_2025_LEAGUES} />;
}
