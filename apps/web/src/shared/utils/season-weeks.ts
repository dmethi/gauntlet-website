import { REGULAR_SEASON_WEEKS } from '@/lib/constants';
import type { NFLState, SleeperLeague } from '@gauntlet/types';

/**
 * Number of regular-season weeks to include for a league, as of "now".
 *
 * For an in-progress league in the current NFL season, this tracks the live
 * NFL week. For a league that's finished (status 'complete') or from a past
 * season, live NFL state is irrelevant — during the off-season Sleeper resets
 * nflState.week to a low number, which would otherwise collapse every
 * finished league's stats down to week 1.
 *
 * @param includeCurrentWeek - when true, includes the in-progress week (for
 * "as of now" displays like weekly averages); when false, excludes it since
 * it isn't final yet (for computed stats like win/loss and expected wins).
 */
export const resolveCompletedWeeks = (
  league: SleeperLeague,
  nflState: NFLState,
  { includeCurrentWeek = false }: { includeCurrentWeek?: boolean } = {},
): number => {
  const regularSeasonWeeks = Math.min(
    (league.settings?.playoff_week_start ?? REGULAR_SEASON_WEEKS + 1) - 1,
    REGULAR_SEASON_WEEKS,
  );

  const isCurrentSeason = league.season === (nflState.league_season ?? nflState.season);
  if (league.status === 'complete' || !isCurrentSeason) {
    return regularSeasonWeeks;
  }

  const week = includeCurrentWeek ? nflState.week : nflState.week - 1;
  return Math.min(Math.max(week, 1), regularSeasonWeeks);
};
