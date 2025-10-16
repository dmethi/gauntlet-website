'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrackedPosition } from '@/shared/utils/stats';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { PositionData, TeamData } from './utils';
import { calculateLeagueRankings } from './utils';
import { LeagueRankingsTable } from './LeagueRankingsTable';
import { PositionRankingsSection } from './PositionRankingsSection';
import { PositionalAdvantagesCard } from './PositionalAdvantagesCard';
import { ColorLegend } from './ColorLegend';

interface LeagueViewProps {
  readonly selectedWeek: string;
  readonly allTeamEntries: [string, TeamData][];
  readonly positionsMap: Map<TrackedPosition, PositionData>;
  readonly setSelectedWeek: (week: string) => void;
  readonly availableWeeks: number[];
  readonly dataset: PlainStatsDataset;
  readonly fromWeek: number;
  readonly toWeek: number;
}

export const LeagueView = memo<LeagueViewProps>(props => {
  const {
    selectedWeek,
    allTeamEntries,
    positionsMap,
    setSelectedWeek,
    availableWeeks,
    dataset,
    fromWeek,
    toWeek,
  } = props;

  const isSeasonView = selectedWeek === 'season';
  const weekNum = isSeasonView ? null : parseInt(selectedWeek, 10);

  // Build league rankings data
  const leagueData = useMemo(
    () => calculateLeagueRankings(allTeamEntries, positionsMap, weekNum, isSeasonView),
    [allTeamEntries, positionsMap, weekNum, isSeasonView],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>League Rankings</CardTitle>
          <CardDescription>
            {isSeasonView
              ? 'Season totals - All 24 teams ranked by performance. Color-coded positions show strengths (green) and weaknesses (red).'
              : `Week ${weekNum} - All 24 teams ranked by performance. Color-coded positions show strengths (green) and weaknesses (red). Click position tables to see players.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-medium">View</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="season">Season Overview</SelectItem>
                {availableWeeks.map(week => (
                  <SelectItem key={week} value={String(week)}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LeagueRankingsTable
            leagueData={leagueData}
            isSeasonView={isSeasonView}
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
          />

          <ColorLegend />

          <PositionRankingsSection
            allTeamEntries={allTeamEntries}
            positionsMap={positionsMap}
            weekNum={weekNum}
            isSeasonView={isSeasonView}
            dataset={dataset}
          />
        </CardContent>
      </Card>

      {/* Positional Advantages Overview - Only show for season view */}
      {isSeasonView && (
        <PositionalAdvantagesCard dataset={dataset} fromWeek={fromWeek} toWeek={toWeek} />
      )}
    </div>
  );
});

LeagueView.displayName = 'LeagueView';
