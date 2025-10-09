'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';

interface TeamDistribution {
  mean: number;
  p10: number;
  p25?: number; // Optional since simulation doesn't provide it
  median: number;
  p75?: number; // Optional since simulation doesn't provide it
  p90: number;
  stdDev: number;
}

/**
 * Get team color based on team name
 */
const getTeamColor = (teamName: string): string => {
  const name = teamName.toLowerCase();

  // NFL team-based colors
  if (name.includes('bills') || name.includes('buffalo')) return '#00338D';
  if (name.includes('dolphins') || name.includes('miami')) return '#008E97';
  if (name.includes('patriots') || name.includes('new england')) return '#002244';
  if (name.includes('jets') || name.includes('new york')) return '#125740';
  if (name.includes('ravens') || name.includes('baltimore')) return '#241773';
  if (name.includes('bengals') || name.includes('cincinnati')) return '#FB4F14';
  if (name.includes('browns') || name.includes('cleveland')) return '#311D00';
  if (name.includes('steelers') || name.includes('pittsburgh')) return '#FFB612';
  if (name.includes('texans') || name.includes('houston')) return '#03202F';
  if (name.includes('colts') || name.includes('indianapolis')) return '#002C5F';
  if (name.includes('jaguars') || name.includes('jacksonville')) return '#006778';
  if (name.includes('titans') || name.includes('tennessee')) return '#0C2340';
  if (name.includes('broncos') || name.includes('denver')) return '#FB4F14';
  if (name.includes('chiefs') || name.includes('kansas')) return '#E31837';
  if (name.includes('raiders') || name.includes('las vegas')) return '#000000';
  if (name.includes('chargers') || name.includes('angeles')) return '#0080C6';

  // Fantasy theme-based colors
  if (name.includes('fire') || name.includes('flame') || name.includes('burn')) return '#DC2626';
  if (name.includes('ice') || name.includes('frost') || name.includes('snow')) return '#0EA5E9';
  if (name.includes('thunder') || name.includes('storm') || name.includes('lightning'))
    return '#7C3AED';
  if (name.includes('gold') || name.includes('golden')) return '#F59E0B';
  if (name.includes('green') || name.includes('forest') || name.includes('emerald'))
    return '#059669';
  if (name.includes('red') || name.includes('crimson') || name.includes('scarlet'))
    return '#DC2626';
  if (name.includes('blue') || name.includes('navy') || name.includes('royal')) return '#2563EB';
  if (name.includes('purple') || name.includes('violet')) return '#7C3AED';
  if (name.includes('orange') || name.includes('amber')) return '#EA580C';
  if (name.includes('pink') || name.includes('rose')) return '#EC4899';

  // Default colors based on hash of team name
  const colors = [
    '#2563EB', // Blue
    '#DC2626', // Red
    '#059669', // Green
    '#7C3AED', // Purple
    '#EA580C', // Orange
    '#0EA5E9', // Sky
    '#EC4899', // Pink
    '#F59E0B', // Yellow
  ];

  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = ((hash << 5) - hash + teamName.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

interface DistributionData {
  team1: TeamDistribution & { name: string };
  team2: TeamDistribution & { name: string };
  winProbabilities: {
    team1: number;
    team2: number;
  };
}

interface TeamDistributionChartProps {
  leagueId: string;
  week: number;
  matchupId: number;
}

export const TeamDistributionChart = ({
  leagueId,
  week,
  matchupId,
}: TeamDistributionChartProps) => {
  const [data, setData] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistributionData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/matchups/${leagueId}/${week}/${matchupId}/distributions`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch distribution data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load distribution data');
        console.error('Distribution data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributionData();
  }, [leagueId, week, matchupId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-geizer tracking-wide flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Score Distributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-geizer tracking-wide flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Score Distributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {error || 'Unable to load distribution data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get team colors
  const team1Color = getTeamColor(data.team1.name);
  const team2Color = getTeamColor(data.team2.name);

  // Prepare data for Recharts (using range-based approach)
  const chartData = [
    {
      name: data.team1.name,
      // Full range (P10-P90)
      rangeStart: data.team1.p10 || data.team1.mean || 0,
      rangeEnd: data.team1.p90 || data.team1.mean || 0,
      rangeWidth:
        (data.team1.p90 || data.team1.mean || 0) - (data.team1.p10 || data.team1.mean || 0),

      // IQR box (P25-P75)
      boxStart: data.team1.p25 || data.team1.mean || 0,
      boxEnd: data.team1.p75 || data.team1.mean || 0,
      boxWidth: (data.team1.p75 || data.team1.mean || 0) - (data.team1.p25 || data.team1.mean || 0),

      median: data.team1.median || data.team1.mean || 0,
      mean: data.team1.mean || 0,
      color: team1Color,
      winPct: data.winProbabilities.team1,
    },
    {
      name: data.team2.name,
      // Full range (P10-P90)
      rangeStart: data.team2.p10 || data.team2.mean || 0,
      rangeEnd: data.team2.p90 || data.team2.mean || 0,
      rangeWidth:
        (data.team2.p90 || data.team2.mean || 0) - (data.team2.p10 || data.team2.mean || 0),

      // IQR box (P25-P75)
      boxStart: data.team2.p25 || data.team2.mean || 0,
      boxEnd: data.team2.p75 || data.team2.mean || 0,
      boxWidth: (data.team2.p75 || data.team2.mean || 0) - (data.team2.p25 || data.team2.mean || 0),

      median: data.team2.median || data.team2.mean || 0,
      mean: data.team2.mean || 0,
      color: team2Color,
      winPct: data.winProbabilities.team2,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-geizer tracking-wide flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Team Score Distributions
        </CardTitle>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team1Color }}></div>
            <span>
              {data.team1.name} ({(data.winProbabilities.team1 * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team2Color }}></div>
            <span>
              {data.team2.name} ({(data.winProbabilities.team2 * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <div className="relative w-full h-full flex items-center justify-center">
              <svg width="90%" height="90%" className="overflow-visible">
                {(() => {
                  const chartHeight = 200; // Unused variable
                  const chartWidth = 500;

                  return chartData.map((team, index) => {
                    const rowHeight = chartHeight / chartData.length;
                    const yPos = index * rowHeight + rowHeight * 0.5;
                    const boxHeight = 40;
                    const leftMargin = 100;

                    // Calculate positions
                    const xMin = Math.min(...chartData.map(t => t.rangeStart)) - 10;
                    const xMax = Math.max(...chartData.map(t => t.rangeEnd)) + 10;
                    const scale = (chartWidth - leftMargin - 40) / (xMax - xMin);

                    const toX = (value: number) => leftMargin + (value - xMin) * scale;

                    return (
                      <g key={team.name}>
                        {/* Team name */}
                        <text
                          x={leftMargin - 15}
                          y={yPos + 5}
                          textAnchor="end"
                          className="text-sm font-medium"
                          fill={team.color}
                        >
                          {team.name}
                        </text>

                        {/* Whisker line (P10-P90) */}
                        <line
                          x1={toX(team.rangeStart)}
                          y1={yPos}
                          x2={toX(team.rangeEnd)}
                          y2={yPos}
                          stroke={team.color}
                          strokeWidth="3"
                          opacity="0.7"
                        />

                        {/* Left whisker cap (P10) */}
                        <line
                          x1={toX(team.rangeStart)}
                          y1={yPos - boxHeight / 4}
                          x2={toX(team.rangeStart)}
                          y2={yPos + boxHeight / 4}
                          stroke={team.color}
                          strokeWidth="3"
                        />

                        {/* Right whisker cap (P90) */}
                        <line
                          x1={toX(team.rangeEnd)}
                          y1={yPos - boxHeight / 4}
                          x2={toX(team.rangeEnd)}
                          y2={yPos + boxHeight / 4}
                          stroke={team.color}
                          strokeWidth="3"
                        />

                        {/* Box (P25-P75) */}
                        <rect
                          x={toX(team.boxStart)}
                          y={yPos - boxHeight / 2}
                          width={toX(team.boxEnd) - toX(team.boxStart)}
                          height={boxHeight}
                          fill={team.color}
                          fillOpacity="0.25"
                          stroke={team.color}
                          strokeWidth="2"
                          rx="4"
                        />

                        {/* Median line */}
                        <line
                          x1={toX(team.median)}
                          y1={yPos - boxHeight / 2}
                          x2={toX(team.median)}
                          y2={yPos + boxHeight / 2}
                          stroke={team.color}
                          strokeWidth="4"
                        />

                        {/* Mean marker (diamond) */}
                        <polygon
                          points={`${toX(team.mean)},${yPos - 6} ${toX(team.mean) + 6},${yPos} ${toX(team.mean)},${yPos + 6} ${toX(team.mean) - 6},${yPos}`}
                          fill="white"
                          stroke={team.color}
                          strokeWidth="2"
                        />
                      </g>
                    );
                  });
                })()}

                {(() => {
                  const chartWidth = 500;
                  const leftMargin = 100;

                  return (
                    <>
                      {/* X-axis */}
                      <line
                        x1={leftMargin}
                        y1={chartData.length * 150}
                        x2={chartWidth - 40}
                        y2={chartData.length * 150}
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.3"
                      />

                      {/* X-axis labels */}
                      {[
                        Math.min(...chartData.map(t => t.rangeStart)) - 5,
                        Math.max(...chartData.map(t => t.mean)),
                        Math.max(...chartData.map(t => t.rangeEnd)) + 5,
                      ].map((value, i) => {
                        const xMin = Math.min(...chartData.map(t => t.rangeStart)) - 10;
                        const xMax = Math.max(...chartData.map(t => t.rangeEnd)) + 10;
                        const scale = (chartWidth - leftMargin - 40) / (xMax - xMin);
                        const x = leftMargin + (value - xMin) * scale;

                        return (
                          <g key={i}>
                            <line
                              x1={x}
                              y1={chartData.length * 150 - 5}
                              x2={x}
                              y2={chartData.length * 150 + 5}
                              stroke="currentColor"
                              strokeWidth="1"
                              opacity="0.4"
                            />
                            <text
                              x={x}
                              y={chartData.length * 150 + 20}
                              textAnchor="middle"
                              className="text-xs opacity-60"
                              fill="currentColor"
                            >
                              {Math.round(value)} pts
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          {[
            { team: data.team1, color: team1Color, winPct: data.winProbabilities.team1 },
            { team: data.team2, color: team2Color, winPct: data.winProbabilities.team2 },
          ].map(({ team, color, winPct }, _index) => (
            <div key={team.name} className="space-y-2">
              <div className="font-semibold text-base flex items-center gap-2" style={{ color }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                {team.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  Mean: <span className="font-medium">{team.mean?.toFixed(1) || 'N/A'}</span>
                </div>
                <div>
                  Median: <span className="font-medium">{team.median?.toFixed(1) || 'N/A'}</span>
                </div>
                <div>
                  Q1: <span className="font-medium">{team.p25?.toFixed(1) || 'N/A'}</span>
                </div>
                <div>
                  Q3: <span className="font-medium">{team.p75?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
              <div className="text-muted-foreground">
                Range:{' '}
                <span className="font-medium">
                  {team.p10?.toFixed(1) || 'N/A'} - {team.p90?.toFixed(1) || 'N/A'} pts
                </span>
              </div>
              <div className="text-xs" style={{ color }}>
                Win Probability: <span className="font-bold">{(winPct * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
