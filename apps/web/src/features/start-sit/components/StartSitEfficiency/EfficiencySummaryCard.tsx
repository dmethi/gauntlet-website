import { memo } from 'react';
import { deltaTextClass } from '@/lib/stat-colors';
import type { SummaryMetrics } from './utils';

interface EfficiencySummaryCardProps {
  summary: SummaryMetrics;
}

const MetricTile = ({
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
  <div className="flex-1 px-4 py-3 text-center first:pl-0 last:pr-0">
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="text-sm font-medium text-foreground">{title}</div>
    <div className="text-xs text-muted-foreground">{subtitle}</div>
  </div>
);

export const EfficiencySummaryCard = memo(({ summary }: EfficiencySummaryCardProps) => {
  return (
    <div className="flex divide-x divide-border">
      <MetricTile
        title="Avg Weighted Score"
        subtitle="Skill-adjusted decision rate"
        value={`${(summary.averageWeightedScore * 100).toFixed(1)}%`}
        colorClass="text-primary"
      />
      <MetricTile
        title="Avg Points Impact"
        subtitle="Points vs league median"
        value={summary.averagePointsImpact.toFixed(1)}
        colorClass={deltaTextClass(summary.averagePointsImpact)}
      />
      <MetricTile
        title="Total Decisions"
        subtitle={`${summary.managerCount} managers evaluated`}
        value={summary.totalDecisions.toString()}
        colorClass="text-foreground"
      />
    </div>
  );
});

EfficiencySummaryCard.displayName = 'EfficiencySummaryCard';
