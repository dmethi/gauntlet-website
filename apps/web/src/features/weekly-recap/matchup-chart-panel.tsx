'use client';

import { ScoreChart, WinProbChart } from '@/components/matchup-charts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMatchupTimeSeries } from '@/features/matchups/hooks/useMatchupTimeSeries';
import type { ProbabilityQuality } from './types';
import styles from './week-one-recap.module.css';

interface MatchupChartPanelProps {
  leagueId: string;
  matchupId: number;
  teamOne: { rosterId: number; label: string };
  teamTwo: { rosterId: number; label: string };
  quality: ProbabilityQuality;
  note?: string;
}

export const MatchupChartPanel = ({
  leagueId,
  matchupId,
  teamOne,
  teamTwo,
  quality,
  note,
}: MatchupChartPanelProps) => {
  const { data, isLoading, error } = useMatchupTimeSeries(leagueId, 1, matchupId, {
    historical: true,
  });

  if (isLoading) {
    return <div className={styles.chartLoading}>Loading the game tape…</div>;
  }

  if (error || !data?.series.length) {
    return (
      <div className={styles.chartUnavailable}>
        Game-flow chart unavailable. The frozen final score remains authoritative.
      </div>
    );
  }

  const { rosterAId, rosterBId } = data.metadata;
  const teamA = rosterAId === teamTwo.rosterId ? teamTwo : teamOne;
  const teamB = rosterBId === teamOne.rosterId ? teamOne : teamTwo;
  const defaultTab = quality === 'unreliable' ? 'score' : 'probability';

  return (
    <div className={styles.chartPanel}>
      <Tabs defaultValue={defaultTab}>
        <div className={styles.chartToolbar}>
          <TabsList className={styles.chartTabs} aria-label="Choose matchup chart">
            <TabsTrigger value="probability">Win probability</TabsTrigger>
            <TabsTrigger value="score">Score over time</TabsTrigger>
          </TabsList>
          <span className={styles[`quality_${quality}`]}>{quality}</span>
        </div>
        <TabsContent value="probability" className={styles.chartContent}>
          <WinProbChart series={data.series} teamAName={teamA.label} teamBName={teamB.label} />
        </TabsContent>
        <TabsContent value="score" className={styles.chartContent}>
          <ScoreChart series={data.series} teamAName={teamA.label} teamBName={teamB.label} />
        </TabsContent>
      </Tabs>
      {(note || quality !== 'reliable') && (
        <p className={styles.chartNote}>
          {note ?? 'The probability feed is useful for direction, not exact turning points.'}
        </p>
      )}
    </div>
  );
};
