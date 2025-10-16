'use client';

import { memo, type ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { colors } from '@/lib/colors';
import type { TeamLuckDistribution } from './utils';

interface TeamOption {
  readonly key: string;
  readonly label: string;
}

interface LuckDistributionSectionProps {
  readonly selectedTeamKey: string;
  readonly teamOptions: TeamOption[];
  readonly onTeamChange: (value: string) => void;
  readonly detail: TeamLuckDistribution | null;
}

export const LuckDistributionSection = memo<LuckDistributionSectionProps>(
  ({ selectedTeamKey, teamOptions, onTeamChange, detail }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.core.crimsonRed }}>
              Team Distribution Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Compare how a team performs with different schedules and how other teams would fare
              with theirs.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="luck-team-select">
              Select Team
            </label>
            <Select value={selectedTeamKey} onValueChange={onTeamChange}>
              <SelectTrigger id="luck-team-select" className="w-72">
                <SelectValue placeholder="Choose team" />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map(option => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {detail ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard title="Overall Strength" description="vs all teams">
                {(detail.overallWinPct * 100).toFixed(1)}%
              </InfoCard>
              <InfoCard title="Current Performance" description="with actual schedule">
                {(detail.actualWinPct * 100).toFixed(1)}%
              </InfoCard>
              <InfoCard title="Schedule Difficulty" description="others with this schedule">
                {(detail.othersWithMyScheduleAvg * 100).toFixed(1)}%
              </InfoCard>
              <InfoCard title="Luck Rating" description="Actual vs Expected">
                <span
                  className="text-2xl font-bold"
                  style={{
                    color:
                      detail.luckRating > 0.05
                        ? colors.rdylgn[8]
                        : detail.luckRating < -0.05
                          ? colors.rdylgn[2]
                          : colors.rdylgn[5],
                  }}
                >
                  {detail.luckRating > 0 ? '+' : ''}
                  {(detail.luckRating * 100).toFixed(1)}%
                </span>
              </InfoCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DistributionChart
                title={`${detail.team.teamInfo.teamName} with Different Schedules`}
                data={detail.myDistChart}
                highlight={detail.actualWins}
                barColor={colors.core.regalGold}
                highlightColor={colors.core.crimsonRed}
                xLabel="Wins"
                tooltipLabel="# of Schedules"
              />
              <DistributionChart
                title={`Other Teams with ${detail.team.teamInfo.teamName}'s Schedule`}
                data={detail.othersDistChart}
                highlight={detail.actualWins}
                barColor={colors.rdylgn[6]}
                highlightColor={colors.core.crimsonRed}
                xLabel="Wins"
                tooltipLabel="# of Teams"
              />
            </div>
          </div>
        ) : null}

        <div className="text-xs text-muted-foreground bg-muted/20 rounded-md p-4">
          <h4 className="font-semibold mb-2">How to interpret</h4>
          <p>
            Positive luck rating means a team won more games than expected based on scoring;
            negative values indicate underperformance. Distribution charts show how schedules impact
            win totals.
          </p>
        </div>
      </div>
    );
  },
);

LuckDistributionSection.displayName = 'LuckDistributionSection';

const InfoCard = memo<{ title: string; description: string; children: ReactNode }>(
  ({ title, description, children }) => (
    <Card>
      <CardContent className="p-4 space-y-2">
        <h4 className="font-semibold text-sm">{title}</h4>
        <div className="text-2xl font-bold" style={{ color: colors.core.regalGold }}>
          {children}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  ),
);

InfoCard.displayName = 'LuckInfoCard';

interface DistributionChartProps {
  readonly title: string;
  readonly data: Array<{ wins: number; count: number; isActual: boolean }>;
  readonly highlight: number;
  readonly barColor: string;
  readonly highlightColor: string;
  readonly xLabel: string;
  readonly tooltipLabel: string;
}

const DistributionChart = memo<DistributionChartProps>(
  ({ title, data, highlight, barColor, highlightColor, xLabel, tooltipLabel }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="wins"
                label={{ value: xLabel, position: 'insideBottom', offset: -4 }}
              />
              <YAxis label={{ value: tooltipLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={value => [`${value}`, tooltipLabel]}
                labelFormatter={label => `${label} Wins`}
              />
              <ReferenceLine x={highlight} stroke={colors.core.crimsonRed} strokeWidth={2} />
              <Bar dataKey="count">
                {data.map((entry, index) => (
                  <Cell key={`dist-${index}`} fill={entry.isActual ? highlightColor : barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  ),
);

DistributionChart.displayName = 'DistributionChart';
