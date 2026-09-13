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
import type { PreviewTeam } from './weekly-preview';

export const MatchupScoreCurve = ({ teamA, teamB }: { teamA: PreviewTeam; teamB: PreviewTeam }) => {
  const teamAByWindow = new Map(teamA.scoringCurve.map(point => [point.windowId, point]));
  const teamBByWindow = new Map(teamB.scoringCurve.map(point => [point.windowId, point]));
  const windowIds = [
    ...teamA.scoringCurve.map(point => point.windowId),
    ...teamB.scoringCurve
      .map(point => point.windowId)
      .filter(windowId => !teamAByWindow.has(windowId)),
  ];
  const data = windowIds.map(windowId => ({
    window: teamAByWindow.get(windowId)?.label ?? teamBByWindow.get(windowId)?.label ?? windowId,
    teamA: teamAByWindow.get(windowId)?.projectedPoints ?? teamA.projection,
    teamB: teamBByWindow.get(windowId)?.projectedPoints ?? teamB.projection,
  }));

  return (
    <div
      className="h-56 w-full"
      aria-label={`Projected scoring curve for ${teamA.teamName} and ${teamB.teamName}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, left: -16, bottom: 8 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="window"
            interval="preserveStartEnd"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <YAxis
            width={42}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickFormatter={value => `${value}`}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 8,
            }}
            formatter={value => [`${Number(value).toFixed(1)} pts`, 'Projected']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="teamA"
            name={teamA.teamName}
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            dot={{ r: 2.5 }}
          />
          <Line
            type="monotone"
            dataKey="teamB"
            name={teamB.teamName}
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            dot={{ r: 2.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
