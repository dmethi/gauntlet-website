/**
 * Position-based stats aggregation utilities
 */

import type { SleeperMatchup, PlayerIndex } from '@/lib/sleeper/types';

export const TRACKED_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DEF'] as const;
export type TrackedPosition = (typeof TRACKED_POSITIONS)[number];

export interface PositionPoints {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  DEF: number;
}

/**
 * Calculate position points for each roster in each week
 * Returns a map of week -> rosterId -> position points
 */
export function getStarterPositionPoints({
  matchups,
  playersIndex,
}: {
  matchups: Map<number, Map<string, SleeperMatchup[]>>; // week -> leagueId -> matchups
  playersIndex: PlayerIndex;
}): Map<number, Map<string, PositionPoints>> {
  const weeklyPositionPoints = new Map<number, Map<string, PositionPoints>>();

  for (const [week, weekLeagueMatchups] of matchups.entries()) {
    const rosterPositionPoints = new Map<string, PositionPoints>();

    // Process each league's matchups
    for (const [leagueId, leagueMatchups] of weekLeagueMatchups.entries()) {
      for (const matchup of leagueMatchups) {
        const positionPoints: PositionPoints = {
          QB: 0,
          RB: 0,
          WR: 0,
          TE: 0,
          DEF: 0,
        };

        // Sum points for each starter by position
        for (const playerId of matchup.starters) {
          const points = matchup.players_points[playerId] || 0;
          const player = playersIndex[playerId];

          if (player?.position && player.position in positionPoints) {
            positionPoints[player.position as TrackedPosition] += points;
          }
        }

        // Use composite key to avoid roster ID conflicts
        const teamKey = `${leagueId}-${matchup.roster_id}`;
        rosterPositionPoints.set(teamKey, positionPoints);
      }
    }

    weeklyPositionPoints.set(week, rosterPositionPoints);
  }

  return weeklyPositionPoints;
}

/**
 * Get total position points across a week range
 */
export function aggregatePositionPoints(
  weeklyPoints: Map<number, Map<string, PositionPoints>>, // Changed to use teamKey (leagueId-rosterId)
  weekRange: { from: number; to: number }
): Map<string, PositionPoints> {
  const totals = new Map<string, PositionPoints>();

  for (let week = weekRange.from; week <= weekRange.to; week++) {
    const weekData = weeklyPoints.get(week);
    if (!weekData) continue;

    for (const [teamKey, points] of weekData.entries()) {
      const existing = totals.get(teamKey) || {
        QB: 0,
        RB: 0,
        WR: 0,
        TE: 0,
        DEF: 0,
      };

      totals.set(teamKey, {
        QB: existing.QB + points.QB,
        RB: existing.RB + points.RB,
        WR: existing.WR + points.WR,
        TE: existing.TE + points.TE,
        DEF: existing.DEF + points.DEF,
      });
    }
  }

  return totals;
}
