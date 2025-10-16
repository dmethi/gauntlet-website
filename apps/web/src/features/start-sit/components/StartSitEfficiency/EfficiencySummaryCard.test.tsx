import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EfficiencySummaryCard } from './EfficiencySummaryCard';

describe('EfficiencySummaryCard', () => {
  it('displays aggregated metrics', () => {
    render(
      <EfficiencySummaryCard
        summary={{
          averageWeightedScore: 0.72,
          averagePointsImpact: 6.4,
          totalDecisions: 28,
          managerCount: 4,
        }}
      />,
    );

    expect(screen.getByText(/72.0%/)).toBeInTheDocument();
    expect(screen.getByText(/6.4/)).toBeInTheDocument();
    expect(screen.getByText(/28/)).toBeInTheDocument();
  });
});
