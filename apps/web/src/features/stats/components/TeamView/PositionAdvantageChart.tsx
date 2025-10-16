import { memo } from 'react';
import { colors } from '../../../../../../../brand/colors';
import type { TeamAdvantagesResult } from './utils';

interface PositionAdvantageChartProps {
  data: TeamAdvantagesResult | null;
}

export const PositionAdvantageChart = memo(({ data }: PositionAdvantageChartProps) => {
  if (!data) {
    return (
      <section className="rounded-md border p-4">
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
    <section className="rounded-md border">
      <div
        className="border-b px-4 py-3"
        style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
      >
        <h3 className="text-base font-semibold">Positional Advantages vs League Median</h3>
        <p className="text-xs text-white/80">
          Positive values indicate the team is outperforming league medians at that position.
        </p>
      </div>
      <div className="overflow-x-auto">
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
