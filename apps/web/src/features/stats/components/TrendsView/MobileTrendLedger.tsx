import { ChevronDown, Minus, TrendingDown, TrendingUp } from 'lucide-react';

export type TrendDirection = 'improving' | 'steady' | 'declining';

interface TrendHistoryPoint {
  week: number;
  rank?: number;
  score?: number;
}

interface MobileTrendRow {
  key: string;
  teamName: string;
  leagueName: string;
  trend: TrendDirection;
  history: TrendHistoryPoint[];
  context?: string;
}

interface MobileTrendLedgerProps {
  kind: string;
  rows: MobileTrendRow[];
  scoreDigits: number;
}

const trendLabel = (trend: TrendDirection) => {
  if (trend === 'improving') return 'Improving';
  if (trend === 'declining') return 'Declining';
  return 'Stable';
};

export const TrendSignal = ({
  teamName,
  trend,
  scores,
}: {
  teamName: string;
  trend: TrendDirection;
  scores: number[];
}) => {
  const Icon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores, 0);
  const range = Math.max(maxScore - minScore, 1);
  const points = scores
    .map((score, index) => {
      const x = scores.length > 1 ? (index / (scores.length - 1)) * 54 + 1 : 28;
      const y = 20 - ((score - minScore) / range) * 18 + 1;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <span
      role="img"
      aria-label={`${teamName} ${trendLabel(trend).toLowerCase()} trend`}
      className="flex items-center gap-2 text-primary"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <svg aria-hidden="true" viewBox="0 0 56 22" className="h-6 w-14" focusable="false">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{trendLabel(trend)}</span>
    </span>
  );
};

export const MobileTrendLedger = ({ kind, rows, scoreDigits }: MobileTrendLedgerProps) => (
  <div className="space-y-2 sm:hidden" data-mobile-ledger={kind}>
    {rows.map(row => {
      const latest = row.history[row.history.length - 1];
      const scores = row.history.flatMap(point =>
        typeof point.score === 'number' ? [point.score] : [],
      );

      return (
        <details
          key={row.key}
          className="group border-y border-border/70 bg-muted/20"
          aria-label={`${row.teamName} complete weekly history`}
        >
          <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{row.teamName}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {row.leagueName}
                {row.context ? ` · ${row.context}` : ''}
              </span>
              <span className="mt-1 flex items-baseline gap-2 text-xs">
                <span className="font-mono font-bold text-foreground">
                  Current {latest?.rank ? `#${latest.rank}` : '—'}
                </span>
                <span className="font-mono text-muted-foreground">
                  {typeof latest?.score === 'number'
                    ? latest.score.toFixed(scoreDigits)
                    : 'No score'}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <TrendSignal teamName={row.teamName} trend={row.trend} scores={scores} />
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </span>
          </summary>
          <dl className="divide-y divide-border/70 border-t border-border/70 px-3 text-xs">
            {row.history.map(point => (
              <div key={point.week} className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-muted-foreground">Week {point.week}</dt>
                <dd className="flex items-center gap-4 font-mono">
                  <span>{point.rank ? `#${point.rank}` : '—'}</span>
                  <span>
                    {typeof point.score === 'number' ? point.score.toFixed(scoreDigits) : '—'}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      );
    })}
  </div>
);
