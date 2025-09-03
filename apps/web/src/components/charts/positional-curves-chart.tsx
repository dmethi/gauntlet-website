'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DraftAnalytics } from '@/lib/draft-analytics';
import { colors, semanticColors } from '../../../../../brand/colors';
import { MockDraft } from '@/lib/draft-generator';

interface PositionalCurvesChartProps {
  draft1: MockDraft;
  draft2: MockDraft;
  analytics: DraftAnalytics;
  height?: number;
}

// Generate positional ranking data
const generatePositionalData = (draft1: MockDraft, draft2: MockDraft) => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionData: { [position: string]: any[] } = {};

  positions.forEach(position => {
    // Get all players of this position from both leagues, sorted by price
    const league1Players = draft1.teams
      .flatMap(t => t.picks)
      .filter(p => p.player.position === position)
      .sort((a, b) => b.actualPrice - a.actualPrice);

    const league2Players = draft2.teams
      .flatMap(t => t.picks)
      .filter(p => p.player.position === position)
      .sort((a, b) => b.actualPrice - a.actualPrice);

    // Set max length based on position - RB/WR get more players, DEF gets fewer
    const isSkillPosition = position === 'RB' || position === 'WR';
    const isLimitedPosition = position === 'QB' || position === 'TE' || position === 'DEF';
    const baseLength = Math.max(league1Players.length, league2Players.length);
    const maxLength = isSkillPosition
      ? Math.max(baseLength, 35)
      : Math.max(baseLength, isLimitedPosition ? 12 : 15);
    const dataPoints = [];

    for (let rank = 1; rank <= maxLength; rank++) {
      const league1Player = league1Players[rank - 1];
      const league2Player = league2Players[rank - 1];

      dataPoints.push({
        rank,
        [`${position}_AFC`]: league1Player?.actualPrice || null,
        [`${position}_NFC`]: league2Player?.actualPrice || null,
        [`${position}_AFC_Name`]: league1Player?.player.name || null,
        [`${position}_NFC_Name`]: league2Player?.player.name || null,
      });
    }

    positionData[position] = dataPoints;
  });

  return positionData;
};

// Position colors for the lines
const POSITION_COLORS = {
  QB: colors.core.crimsonRed,
  RB: '#8B5CF6', // violet - better contrast with button states
  WR: colors.core.burntOrange,
  TE: '#10B981', // emerald
  DEF: '#6B7280', // gray
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='p-3 rounded-lg border bg-background text-foreground border-border'>
        <p className='font-semibold mb-2'>Rank #{label}</p>
        {payload.map((entry: any, index: number) => {
          const position = entry.dataKey.split('_')[0];
          const league = entry.dataKey.includes('AFC') ? 'AFC' : 'NFC';
          const playerNameKey = entry.dataKey.replace('AFC', 'AFC_Name').replace('NFC', 'NFC_Name');
          const playerName = entry.payload[playerNameKey];

          if (entry.value === null) return null;

          return (
            <div key={index} className='flex items-center gap-2 mb-1'>
              <div className='w-3 h-3 rounded-sm' style={{ backgroundColor: entry.color }} />
              <span className='text-sm'>
                {position} {league}: <strong className='ml-1'>${entry.value}</strong>
                {playerName && <div className='text-xs text-foreground/60'>{playerName}</div>}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const PositionalCurvesChart: React.FC<PositionalCurvesChartProps> = ({
  draft1,
  draft2,
  analytics,
  height = 500,
}) => {
  const [visiblePositions, setVisiblePositions] = useState<Set<string>>(
    new Set(['QB', 'RB', 'WR', 'TE', 'DEF'])
  );
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const positionData = generatePositionalData(draft1, draft2);

  // Create combined data for the chart
  const maxRankForChart = selectedPosition
    ? selectedPosition === 'RB' || selectedPosition === 'WR'
      ? 35
      : selectedPosition === 'DEF'
        ? 12
        : 15
    : 35; // Show more data points when multiple positions are visible

  const chartData = selectedPosition
    ? positionData[selectedPosition] || []
    : Array.from({ length: maxRankForChart }, (_, i) => {
        const rank = i + 1;
        const dataPoint: any = { rank };

        Array.from(visiblePositions).forEach(position => {
          if (positionData[position] && positionData[position][i]) {
            dataPoint[`${position}_AFC`] = positionData[position][i][`${position}_AFC`];
            dataPoint[`${position}_NFC`] = positionData[position][i][`${position}_NFC`];
            dataPoint[`${position}_AFC_Name`] = positionData[position][i][`${position}_AFC_Name`];
            dataPoint[`${position}_NFC_Name`] = positionData[position][i][`${position}_NFC_Name`];
          }
        });

        return dataPoint;
      });

  const togglePosition = (position: string) => {
    if (selectedPosition === position) {
      setSelectedPosition(null);
    } else {
      setSelectedPosition(position);
    }
  };

  const toggleVisibility = (position: string) => {
    const newVisible = new Set(visiblePositions);
    if (newVisible.has(position)) {
      newVisible.delete(position);
    } else {
      newVisible.add(position);
    }
    setVisiblePositions(newVisible);
  };

  return (
    <div className='space-y-4'>
      {/* Position Controls */}
      <div className='flex flex-wrap gap-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-muted-foreground'>Show positions:</span>
          {['QB', 'RB', 'WR', 'TE', 'DEF'].map(position => (
            <Button
              key={position}
              variant={
                selectedPosition === position
                  ? 'default'
                  : visiblePositions.has(position)
                    ? 'secondary'
                    : 'outline'
              }
              size='sm'
              onClick={() =>
                selectedPosition ? togglePosition(position) : toggleVisibility(position)
              }
              className='text-xs flex items-center gap-1.5'
            >
              <div
                className='w-3 h-3 rounded-full'
                style={{
                  backgroundColor: POSITION_COLORS[position as keyof typeof POSITION_COLORS],
                }}
              />
              {position}
            </Button>
          ))}
        </div>
        {selectedPosition && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setSelectedPosition(null)}
            className='text-xs'
          >
            Show All
          </Button>
        )}
      </div>

      {/* Static Legend for Line Styles */}
      <div className='flex items-center justify-center gap-6 py-2 text-sm text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-0.5 bg-muted-foreground'></div>
          <span>AFC (Solid)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            className='w-8 h-0.5'
            style={{
              background: `repeating-linear-gradient(
                to right,
                transparent,
                transparent 2px,
                currentColor 2px,
                currentColor 4px
              )`,
            }}
          ></div>
          <span>NFC (Dashed)</span>
        </div>
      </div>

      {/* Chart */}
      <div className='w-full' style={{ height }}>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#6b7280' opacity={0.4} />
            <XAxis
              dataKey='rank'
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{
                value: 'Positional Rank',
                position: 'insideBottom',
                offset: -10,
                style: { fill: '#9ca3af', fontSize: 12 },
              }}
            />
            <YAxis
              tickFormatter={value => `$${value}`}
              axisLine={{ stroke: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{
                value: 'Price ($)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: 12 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Generate lines for each visible position and league */}
            {(selectedPosition ? [selectedPosition] : Array.from(visiblePositions)).map(
              position => (
                <React.Fragment key={position}>
                  <Line
                    type='monotone'
                    dataKey={`${position}_AFC`}
                    stroke={POSITION_COLORS[position as keyof typeof POSITION_COLORS]}
                    strokeWidth={selectedPosition === position ? 3 : 2}
                    dot={{
                      fill: POSITION_COLORS[position as keyof typeof POSITION_COLORS],
                      strokeWidth: 2,
                      r: 4,
                    }}
                    connectNulls={false}
                    name={`${position} AFC`}
                    strokeDasharray='0'
                  />
                  <Line
                    type='monotone'
                    dataKey={`${position}_NFC`}
                    stroke={POSITION_COLORS[position as keyof typeof POSITION_COLORS]}
                    strokeWidth={selectedPosition === position ? 3 : 2}
                    dot={{
                      fill: POSITION_COLORS[position as keyof typeof POSITION_COLORS],
                      strokeWidth: 2,
                      r: 4,
                    }}
                    connectNulls={false}
                    name={`${position} NFC`}
                    strokeDasharray='5 5'
                    opacity={0.8}
                  />
                </React.Fragment>
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className='text-xs text-muted-foreground'>
        <p>
          <strong>How to read:</strong> Each line shows how much was spent on players at each
          positional rank (1st QB, 2nd QB, etc.). Steeper drops indicate more "stars and scrubs"
          strategy within that position.
        </p>
      </div>
    </div>
  );
};
