import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { colors } from '../../../../../../../brand/colors';
import type { TeamAdvantagesResult } from './utils';
import { deltaTextClass } from '@/lib/stat-colors';

interface PositionAdvantageChartProps {
  data: TeamAdvantagesResult | null;
}

export const PositionAdvantageChart = memo(({ data }: PositionAdvantageChartProps) => {
  if (!data) {
    return (
      <section>
        <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
          Positional Advantages vs League Median
        </h3>
        <p className="text-sm text-muted-foreground">
          No positional advantage data available for this team.
        </p>
      </section>
    );
  }

  const positions = Object.entries(data.positions);

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
          Positional Advantages vs League Median
        </h3>
        <p className="text-sm text-muted-foreground">
          Positive values indicate the team is outperforming league medians at that position.
        </p>
      </div>
      <div className="space-y-2 sm:hidden" data-mobile-ledger="position-advantages">
        {positions.map(([position, info]) => (
          <details
            key={position}
            className="group border-y border-border/70 bg-muted/20"
            aria-label={`${position} complete positional advantage`}
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
              <span>
                <span className="block text-sm font-semibold">{position}</span>
                <span className="text-xs text-muted-foreground">
                  {info.weeklyAverage.toFixed(1)} avg ·{' '}
                  <span className={deltaTextClass(info.advantage)}>
                    {info.advantage > 0 ? '+' : ''}
                    {info.advantage.toFixed(1)} advantage
                  </span>
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>
            <dl className="grid grid-cols-2 gap-3 border-t border-border/70 px-3 py-3 text-xs">
              <div>
                <dt className="text-muted-foreground">League median</dt>
                <dd className="font-mono font-semibold">{info.leagueMedian.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Difference</dt>
                <dd className={`font-mono font-semibold ${deltaTextClass(info.advantage)}`}>
                  {info.percentageAdvantage > 0 ? '+' : ''}
                  {info.percentageAdvantage.toFixed(1)}%
                </dd>
              </div>
            </dl>
          </details>
        ))}
        <div className="flex items-center justify-between border-y border-border/70 px-3 py-3 text-sm font-semibold">
          <span>Total advantage</span>
          <span className={`font-mono ${deltaTextClass(data.totalAdvantage)}`}>
            {data.totalAdvantage > 0 ? '+' : ''}
            {data.totalAdvantage.toFixed(1)} · Avg {data.averageAdvantage > 0 ? '+' : ''}
            {data.averageAdvantage.toFixed(1)}
          </span>
        </div>
      </div>

      <div
        className="hidden overflow-x-auto border-y border-border/70 sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        role="region"
        aria-label="Positional advantages comparison table"
        tabIndex={0}
      >
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-right">Weekly Avg</th>
              <th className="px-4 py-3 text-right">League Median</th>
              <th className="px-4 py-3 text-right">Advantage</th>
              <th className="px-4 py-3 text-right">% Difference</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(([position, info]) => {
              const advantageColor =
                info.advantage === 0
                  ? colors.rdylgn[5]
                  : info.advantage > 0
                    ? colors.rdylgn[8]
                    : colors.rdylgn[2];

              return (
                <tr key={position} className="border-t">
                  <td className="px-4 py-3 font-medium">{position}</td>
                  <td
                    className="px-4 py-3 text-right font-mono font-bold"
                    style={{ color: colors.core.regalGold }}
                  >
                    {info.weeklyAverage.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{info.leagueMedian.toFixed(1)}</td>
                  <td
                    className="px-4 py-3 text-right font-mono font-bold"
                    style={{ color: advantageColor }}
                  >
                    {info.advantage > 0 ? '+' : ''}
                    {info.advantage.toFixed(1)}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-mono font-bold"
                    style={{ color: advantageColor }}
                  >
                    {info.percentageAdvantage > 0 ? '+' : ''}
                    {info.percentageAdvantage.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 bg-muted/20 font-semibold">
              <td className="px-4 py-3">Total Advantage</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
              <td
                className="px-4 py-3 text-right font-mono"
                style={{
                  color:
                    data.totalAdvantage === 0
                      ? colors.rdylgn[5]
                      : data.totalAdvantage > 0
                        ? colors.rdylgn[8]
                        : colors.rdylgn[2],
                }}
              >
                {data.totalAdvantage > 0 ? '+' : ''}
                {data.totalAdvantage.toFixed(1)}
              </td>
              <td
                className="px-4 py-3 text-right font-mono"
                style={{
                  color:
                    data.averageAdvantage === 0
                      ? colors.rdylgn[5]
                      : data.averageAdvantage > 0
                        ? colors.rdylgn[8]
                        : colors.rdylgn[2],
                }}
              >
                Avg {data.averageAdvantage > 0 ? '+' : ''}
                {data.averageAdvantage.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
});

PositionAdvantageChart.displayName = 'PositionAdvantageChart';
