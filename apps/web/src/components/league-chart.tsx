'use client';

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

interface WeeklyAverage {
  week: number;
  averagePoints: number;
  matchupCount?: number;
  totalPoints?: number;
}

interface LeagueChartProps {
  data: WeeklyAverage[];
}

export function LeagueChart({ data }: LeagueChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className='h-96 w-full'>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='week'
            type='number'
            domain={['dataMin', 'dataMax']}
            tickCount={data.length}
          />
          <YAxis domain={[0, 'auto']} tickCount={10} />
          <Tooltip />
          <Legend />
          <Line
            type='monotone'
            dataKey='averagePoints'
            stroke='#8884d8'
            name='League Average'
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
