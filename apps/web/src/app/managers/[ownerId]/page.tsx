import Link from 'next/link';
import { Container, PageHeader } from '@gauntlet/ui';
import { getManagerHistory } from '@/lib/leagues/manager-history';

interface PageProps {
  params: { ownerId: string } | Promise<{ ownerId: string }>;
}

export const dynamic = 'force-dynamic';

const formatPct = (pct: number) => `${(pct * 100).toFixed(1)}%`;

const ManagerProfilePage = async ({ params }: PageProps) => {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { ownerId } = resolvedParams;

  const history = await getManagerHistory(ownerId);

  if (!history) {
    return (
      <Container className="py-8">
        <PageHeader
          title="Manager not found"
          subtitle="This owner doesn't appear in any registered season."
        />
        <Link href="/archive/2025" className="text-sm text-gauntlet-crimson hover:underline">
          &larr; Back to the 2025 archive
        </Link>
      </Container>
    );
  }

  const { career } = history;

  return (
    <Container className="py-8">
      <PageHeader
        title={history.displayName ?? 'Unknown manager'}
        subtitle={`Career record across ${history.seasons.length} season${history.seasons.length === 1 ? '' : 's'}`}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Career Record</h3>
          <p className="text-3xl font-bold">
            {career.wins}-{career.losses}
            {career.ties > 0 ? `-${career.ties}` : ''}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Win %</h3>
          <p className="text-3xl font-bold">{formatPct(career.winPct)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Points For</h3>
          <p className="text-3xl font-bold">{career.pointsFor.toFixed(1)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Points Against</h3>
          <p className="text-3xl font-bold">{career.pointsAgainst.toFixed(1)}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-card-foreground mb-4">Season by season</h2>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Season</th>
              <th className="text-left p-3 font-medium text-muted-foreground">League</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Team</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Record</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Points For</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Points Against</th>
            </tr>
          </thead>
          <tbody>
            {history.seasons.map(season => (
              <tr key={`${season.season}-${season.leagueId}`} className="border-t border-border">
                <td className="p-3">
                  {season.season === '2025' ? (
                    <Link href="/archive/2025" className="text-gauntlet-crimson hover:underline">
                      {season.season}
                    </Link>
                  ) : (
                    season.season
                  )}
                </td>
                <td className="p-3">{season.leagueLabel}</td>
                <td className="p-3">{season.teamName ?? '—'}</td>
                <td className="p-3">
                  {season.wins}-{season.losses}
                  {season.ties > 0 ? `-${season.ties}` : ''}
                </td>
                <td className="p-3">{season.pointsFor.toFixed(1)}</td>
                <td className="p-3">{season.pointsAgainst.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default ManagerProfilePage;
