import { MatchupsView } from '@/app/matchups/matchups-view';
import { getCurrentLeagues } from '@/config/leagues';

export const metadata = {
  title: 'Matchups — The Gauntlet',
};

export default function MatchupsPage(): JSX.Element {
  return <MatchupsView leagues={getCurrentLeagues()} />;
}
