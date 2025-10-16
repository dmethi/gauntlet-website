import { memo } from 'react';
import type { SummaryMetrics } from './utils';

interface EfficiencySummaryCardProps {
  summary: SummaryMetrics;
}

const MetricCard = ({
  title,
  value,
  subtitle,
  colorClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  colorClass: string;
}) => (
  <div className="rounded-lg bg-muted p-4 text-center">
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="text-sm font-medium text-foreground">{title}</div>
    <div className="text-xs text-muted-foreground">{subtitle}</div>
  </div>
);

export const EfficiencySummaryCard = memo(({ summary }: EfficiencySummaryCardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Avg Weighted Score"
        subtitle="Skill-adjusted decision rate"
        value={`${(summary.averageWeightedScore * 100).toFixed(1)}%`}
        colorClass="text-blue-600"
      />
      <MetricCard
        title="Avg Points Impact"
        subtitle="Points vs league median"
        value={summary.averagePointsImpact.toFixed(1)}
        colorClass="text-green-600"
      />
      <MetricCard
        title="Total Decisions"
        subtitle={`${summary.managerCount} managers evaluated`}
        value={summary.totalDecisions.toString()}
        colorClass="text-purple-600"
      />
    </div>
  );
});

EfficiencySummaryCard.displayName = 'EfficiencySummaryCard';
