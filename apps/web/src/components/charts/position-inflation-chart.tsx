'use client';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PositionInflation } from '@/features/draft-analysis/utils';
import { colors, semanticColors } from '../../../../../brand/colors';

interface PositionInflationChartProps {
  data: PositionInflation[];
  width?: number;
  height?: number;
  leagueAName: string;
  leagueBName: string;
}

// Transform data for Recharts
const transformDataForRecharts = (data: PositionInflation[]) => {
  return data.map(d => ({
    position: d.pos,
    [d.pos + '_A']: d.avg_raw_A,
    [d.pos + '_B']: d.avg_raw_B,
    [`${d.pos}_delta`]: d.delta_avg_raw,
    [`${d.pos}_share_A`]: d.share_A,
    [`${d.pos}_share_B`]: d.share_B,
  }));
};

const CustomTooltip = ({ active, payload, label, leagueAName, leagueBName }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const position = label;
    const delta = data[`${position}_delta`];
    const shareA = data[`${position}_share_A`];
    const shareB = data[`${position}_share_B`];

    const deltaText = delta >= 0 ? `+$${delta}` : `-$${Math.abs(delta)}`;
    // const deltaColor = delta >= 0 ? colors.diverging.positive : colors.diverging.negative;

    return (
      <div className="p-3 rounded-lg border bg-surface border-border text-offWhite">
        <p className="font-semibold mb-2">{position} Position</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-sm">
              {entry.dataKey.includes('_A') ? leagueAName : leagueBName}:
              <strong className="ml-1">${entry.value}</strong>
            </span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-sm">
            Market Share: <strong>{leagueAName}</strong> {(shareA * 100).toFixed(1)}% |
            <strong className="ml-1">{leagueBName}</strong> {(shareB * 100).toFixed(1)}%
          </p>
          <p className="text-sm">
            Price Difference:{' '}
            <strong className={delta >= 0 ? 'text-green-600' : 'text-red-600'}>{deltaText}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const PositionInflationChart: React.FC<PositionInflationChartProps> = ({
  data,
  height = 400,
  leagueAName,
  leagueBName,
}) => {
  const chartData = transformDataForRecharts(data);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={semanticColors.border} opacity={0.3} />
          <XAxis
            dataKey="position"
            axisLine={{ stroke: semanticColors.border }}
            tickLine={{ stroke: semanticColors.border }}
            tick={{ fill: colors.core.offWhite, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={value => `$${value}`}
            axisLine={{ stroke: semanticColors.border }}
            tickLine={{ stroke: semanticColors.border }}
            tick={{ fill: colors.core.offWhite, fontSize: 12 }}
          />
          <Tooltip
            content={props => (
              <CustomTooltip {...props} leagueAName={leagueAName} leagueBName={leagueBName} />
            )}
            cursor={{ fill: semanticColors.surfaceHover, opacity: 0.3 }}
          />
          <Legend wrapperStyle={{ color: colors.core.offWhite, paddingTop: '20px' }} />

          {/* Bars for each position */}
          {data.map(posData => (
            <React.Fragment key={posData.pos}>
              <Bar
                dataKey={`${posData.pos}_A`}
                name={leagueAName}
                fill={colors.core.crimsonRed}
                radius={[2, 2, 0, 0]}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Bar
                dataKey={`${posData.pos}_B`}
                name={leagueBName}
                fill={colors.core.regalGold}
                radius={[2, 2, 0, 0]}
                animationBegin={400}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </React.Fragment>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
