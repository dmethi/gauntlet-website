'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
}

interface TeamChartsProps {
  weeklyData: WeeklyData[];
}

export function TeamPerformanceChart({ weeklyData }: TeamChartsProps) {
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
          <Line type='monotone' dataKey='points' stroke='#8884d8' name='Team Points' dot={true} />
          <Line
            type='monotone'
            dataKey='opponentPoints'
            stroke='#82ca9d'
            name='Opponent Points'
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TeamExpectedPerformanceChart({ weeklyData }: TeamChartsProps) {
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
            stroke='#8884d8'
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
