'use client';

import { colors } from '@/lib/colors';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface WeeklyData {
  week: number;
  points: number;
  expectedWins: number;
  luckRating: number;
  opponentPoints: number;
  leagueAverage?: number;
}

interface TeamChartsProps {
  weeklyData: WeeklyData[];
}

export function TeamPerformanceChart({
  weeklyData,
  teamColor = colors.core.regalGold,
}: TeamChartsProps & { teamColor?: string }) {
  if (!weeklyData || weeklyData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='week'
            type='number'
            domain={['dataMin', 'dataMax']}
            tickCount={weeklyData.length}
          />
          <YAxis domain={[0, 'auto']} tickCount={10} />
          <Tooltip />
          <Legend />
          <Line type='monotone' dataKey='points' stroke={teamColor} name='Team Points' dot={true} />
          <Line
            type='monotone'
            dataKey='opponentPoints'
            stroke='#000000'
            name='Opponent Points'
            dot={true}
          />
          {/* Optional league average overlay */}
          <Line
            type='monotone'
            dataKey='leagueAverage'
            stroke='#A1A8B3'
            name='League Average'
            dot={false}
            strokeDasharray='5 5'
            hide={!weeklyData.some(d => typeof d.leagueAverage === 'number')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TeamExpectedPerformanceChart({
  weeklyData,
  teamColor = colors.core.regalGold,
}: TeamChartsProps & { teamColor?: string }) {
  if (!weeklyData || weeklyData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='week'
            type='number'
            domain={['dataMin', 'dataMax']}
            tickCount={weeklyData.length}
          />
          <YAxis domain={[-1, 1]} tickCount={3} />
          <Tooltip />
          <Legend />
          <Line
            type='monotone'
            dataKey='expectedWins'
            stroke={teamColor}
            name='Expected Wins'
            dot={true}
          />
          <Line
            type='monotone'
            dataKey='luckRating'
            stroke='#82ca9d'
            name='Luck Rating'
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Positional scoring bar chart (Team vs Opponent vs League Avg)
export interface PositionalScoringRow {
  position: string;
  team: number;
  opponent: number;
  leagueAverage: number;
}

export function TeamPositionalBarChart({
  data,
  teamColor = colors.core.regalGold,
}: {
  data: PositionalScoringRow[];
  teamColor?: string;
}) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='position' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey='team' name='Team' fill={teamColor} />
          <Bar dataKey='opponent' name='Opponent' fill={'#111111'} />
          <Bar dataKey='leagueAverage' name='League Average' fill={'#A1A8B3'} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Normalized radar (0..1) per position for the selected team
export interface PositionalNormalizedRow {
  position: string;
  value: number; // 0..1
}

export function TeamPositionalRadarChart({
  data,
  teamName = 'Team',
  teamColor = colors.core.regalGold,
  comparisons,
}: {
  data: PositionalNormalizedRow[];
  teamName?: string;
  teamColor?: string;
  comparisons?: Array<{ name: string; color: string; data: PositionalNormalizedRow[] }>;
}) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius='70%'>
          <PolarGrid />
          <PolarAngleAxis dataKey='position' />
          <PolarRadiusAxis domain={[0, 1]} tickCount={6} />
          <Tooltip />
          <Radar
            name={teamName}
            dataKey='value'
            stroke={teamColor}
            fill={teamColor}
            fillOpacity={0.3}
          />
          {/* For multiple series, Recharts expects same data array; merge by key */}
          {comparisons?.map(series => {
            const merged = data.map(d => {
              const found = series.data.find(s => s.position === d.position)?.value ?? 0;
              return { ...d, [series.name]: found } as any;
            });
            return (
              <Radar
                key={series.name}
                name={series.name}
                dataKey={series.name as any}
                stroke={series.color}
                fill={series.color}
                fillOpacity={0.15}
                // @ts-expect-error recharts accepts data prop on Radar when nested in RadarChart
                data={merged}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
