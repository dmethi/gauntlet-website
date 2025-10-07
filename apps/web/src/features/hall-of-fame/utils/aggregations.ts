/**
 * Aggregation functions for rolling windows and seasonal Hall of Fame calculations
 */

import type { ProcessedMatchup } from '@/features/hall-of-fame/types';

// Import EnhancedMatchup type from data service hook
export interface EnhancedMatchup extends ProcessedMatchup {
  playerStats?: Map<string, any>;
  playerProjections?: Map<string, any>;
  winProbSamples?: any[];
  maxWinProbSwing?: number;
  excitementScore?: number;
  topPerformer?: { playerId: string; points: number; position: string };
  worstPerformer?: { playerId: string; points: number; position: string };
  boomPlayers?: string[];
  bustPlayers?: string[];
}

export interface RollingWindowData {
  rosterId: number;
  teamName: string;
  leagueId: string;
  leagueName: string;
  season: string;
  startWeek: number;
  endWeek: number;
  windowSize: number;
  totalPoints: number;
  averagePoints: number;
  wins: number;
  losses: number;
  aboveMedianCount: number;
  belowMedianCount: number;
}

export interface SeasonalData {
  rosterId: number;
  teamName: string;
  leagueId: string;
  leagueName: string;
  season: string;
  wins: number;
  losses: number;
  ties: number;
  totalPoints: number;
  totalPointsAgainst: number;
  averagePoints: number;
  expectedWins: number;
  luckDelta: number;
  totalDonuts: number;
  totalBenchBlunders: number;
  longestWinStreak: number;
  longestLosingStreak: number;
  currentStreak: number;
  blowoutWins: number; // Wins by 30+ points
  blowoutLosses: number;
  closeGames: number; // Games decided by < 5 points
  scheduleStrength: number;
  playoffAppearance: boolean;
  championshipWin: boolean;
  // Positional totals
  qbPoints: number;
  rbPoints: number;
  wrPoints: number;
  tePoints: number;
  defPoints: number;
}

export interface StreakData {
  rosterId: number;
  teamName: string;
  type: 'win' | 'loss' | 'above_median' | 'below_median';
  length: number;
  startWeek: number;
  endWeek: number;
  season: string;
  leagueId: string;
}

/**
 * Calculate rolling window statistics
 */
export const calculateRollingWindows = (
  matchups: ProcessedMatchup[],
  windowSize: 3 | 5 = 3,
): RollingWindowData[] => {
  const results: RollingWindowData[] = [];

  // Group matchups by team and league
  const teamMatchups = new Map<string, ProcessedMatchup[]>();

  matchups.forEach(matchup => {
    const key = `${matchup.leagueId}-${matchup.rosterId}-${matchup.season}`;
    if (!teamMatchups.has(key)) {
      teamMatchups.set(key, []);
    }
    teamMatchups.get(key)!.push(matchup);
  });

  // Calculate rolling windows for each team
  teamMatchups.forEach((teamGames, key) => {
    // Sort by week
    teamGames.sort((a, b) => a.week - b.week);

    // Calculate league median for each week
    const weeklyMedians = new Map<number, number>();
    const allMatchupsByWeek = new Map<number, number[]>();

    matchups.forEach(m => {
      if (m.leagueId === teamGames[0].leagueId && m.season === teamGames[0].season) {
        if (!allMatchupsByWeek.has(m.week)) {
          allMatchupsByWeek.set(m.week, []);
        }
        allMatchupsByWeek.get(m.week)!.push(m.points);
      }
    });

    allMatchupsByWeek.forEach((scores, week) => {
      scores.sort((a, b) => a - b);
      const median =
        scores.length % 2 === 0
          ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
          : scores[Math.floor(scores.length / 2)];
      weeklyMedians.set(week, median);
    });

    // Calculate rolling windows
    for (let i = 0; i <= teamGames.length - windowSize; i++) {
      const window = teamGames.slice(i, i + windowSize);
      const totalPoints = window.reduce((sum, m) => sum + m.points, 0);
      const wins = window.filter(m => m.won).length;
      const losses = window.filter(m => m.won === false).length;

      const aboveMedian = window.filter(m => m.points > (weeklyMedians.get(m.week) || 0)).length;

      const belowMedian = window.filter(m => m.points < (weeklyMedians.get(m.week) || 0)).length;

      results.push({
        rosterId: teamGames[0].rosterId,
        teamName: teamGames[0].teamName,
        leagueId: teamGames[0].leagueId,
        leagueName: teamGames[0].leagueName,
        season: teamGames[0].season,
        startWeek: window[0].week,
        endWeek: window[window.length - 1].week,
        windowSize,
        totalPoints,
        averagePoints: totalPoints / windowSize,
        wins,
        losses,
        aboveMedianCount: aboveMedian,
        belowMedianCount: belowMedian,
      });
    }
  });

  return results;
};

/**
 * Calculate streaks (win/loss and above/below median)
 */
export const calculateStreaks = (matchups: ProcessedMatchup[]): StreakData[] => {
  const streaks: StreakData[] = [];

  // Group by team
  const teamMatchups = new Map<string, ProcessedMatchup[]>();
  matchups.forEach(matchup => {
    const key = `${matchup.leagueId}-${matchup.rosterId}-${matchup.season}`;
    if (!teamMatchups.has(key)) {
      teamMatchups.set(key, []);
    }
    teamMatchups.get(key)!.push(matchup);
  });

  // Calculate median for each week
  const weeklyMedians = new Map<string, number>();
  matchups.forEach(m => {
    const weekKey = `${m.leagueId}-${m.season}-${m.week}`;
    if (!weeklyMedians.has(weekKey)) {
      const weekScores = matchups
        .filter(
          match =>
            match.leagueId === m.leagueId && match.season === m.season && match.week === m.week,
        )
        .map(match => match.points);

      weekScores.sort((a, b) => a - b);
      const median =
        weekScores.length % 2 === 0
          ? (weekScores[weekScores.length / 2 - 1] + weekScores[weekScores.length / 2]) / 2
          : weekScores[Math.floor(weekScores.length / 2)];

      weeklyMedians.set(weekKey, median);
    }
  });

  // Process each team's streaks
  teamMatchups.forEach(teamGames => {
    teamGames.sort((a, b) => a.week - b.week);

    // Win/loss streaks
    let currentWinStreak: StreakData | null = null;
    let currentLossStreak: StreakData | null = null;

    // Above/below median streaks
    let currentAboveStreak: StreakData | null = null;
    let currentBelowStreak: StreakData | null = null;

    teamGames.forEach((game, index) => {
      const weekMedian = weeklyMedians.get(`${game.leagueId}-${game.season}-${game.week}`) || 0;

      // Handle win/loss streaks
      if (game.won) {
        // End loss streak if exists
        if (currentLossStreak) {
          streaks.push(currentLossStreak);
          currentLossStreak = null;
        }

        // Continue or start win streak
        if (currentWinStreak) {
          currentWinStreak.length++;
          currentWinStreak.endWeek = game.week;
        } else {
          currentWinStreak = {
            rosterId: game.rosterId,
            teamName: game.teamName,
            type: 'win',
            length: 1,
            startWeek: game.week,
            endWeek: game.week,
            season: game.season,
            leagueId: game.leagueId,
          };
        }
      } else if (game.won === false) {
        // End win streak if exists
        if (currentWinStreak) {
          streaks.push(currentWinStreak);
          currentWinStreak = null;
        }

        // Continue or start loss streak
        if (currentLossStreak) {
          currentLossStreak.length++;
          currentLossStreak.endWeek = game.week;
        } else {
          currentLossStreak = {
            rosterId: game.rosterId,
            teamName: game.teamName,
            type: 'loss',
            length: 1,
            startWeek: game.week,
            endWeek: game.week,
            season: game.season,
            leagueId: game.leagueId,
          };
        }
      }

      // Handle above/below median streaks
      if (game.points > weekMedian) {
        // End below median streak
        if (currentBelowStreak) {
          streaks.push(currentBelowStreak);
          currentBelowStreak = null;
        }

        // Continue or start above median streak
        if (currentAboveStreak) {
          currentAboveStreak.length++;
          currentAboveStreak.endWeek = game.week;
        } else {
          currentAboveStreak = {
            rosterId: game.rosterId,
            teamName: game.teamName,
            type: 'above_median',
            length: 1,
            startWeek: game.week,
            endWeek: game.week,
            season: game.season,
            leagueId: game.leagueId,
          };
        }
      } else {
        // End above median streak
        if (currentAboveStreak) {
          streaks.push(currentAboveStreak);
          currentAboveStreak = null;
        }

        // Continue or start below median streak
        if (currentBelowStreak) {
          currentBelowStreak.length++;
          currentBelowStreak.endWeek = game.week;
        } else {
          currentBelowStreak = {
            rosterId: game.rosterId,
            teamName: game.teamName,
            type: 'below_median',
            length: 1,
            startWeek: game.week,
            endWeek: game.week,
            season: game.season,
            leagueId: game.leagueId,
          };
        }
      }

      // Save any ongoing streaks at the end
      if (index === teamGames.length - 1) {
        if (currentWinStreak) streaks.push(currentWinStreak);
        if (currentLossStreak) streaks.push(currentLossStreak);
        if (currentAboveStreak) streaks.push(currentAboveStreak);
        if (currentBelowStreak) streaks.push(currentBelowStreak);
      }
    });
  });

  return streaks;
};

/**
 * Calculate expected wins for a full season
 */
const calculateExpectedWinsForSeason = (
  matchups: ProcessedMatchup[],
  rosterId: number,
  leagueId: string,
  season: string,
): number => {
  let expectedWins = 0;

  // Get all matchups for this team
  const teamMatchups = matchups.filter(
    m => m.rosterId === rosterId && m.leagueId === leagueId && m.season === season && !m.isPlayoff, // Regular season only
  );

  // For each week, calculate expected wins
  teamMatchups.forEach(teamMatchup => {
    // Get all scores for this week
    const weekScores = matchups
      .filter(m => m.leagueId === leagueId && m.season === season && m.week === teamMatchup.week)
      .map(m => m.points);

    // Calculate how many teams we would beat
    const beatenTeams = weekScores.filter(score => teamMatchup.points > score).length;
    const totalOpponents = weekScores.length - 1; // Exclude ourselves

    if (totalOpponents > 0) {
      expectedWins += beatenTeams / totalOpponents;
    }
  });

  return expectedWins;
};

/**
 * Calculate seasonal aggregations
 */
export const calculateSeasonalData = (matchups: EnhancedMatchup[]): SeasonalData[] => {
  const seasonalData: Map<string, SeasonalData> = new Map();

  // Group by team/season
  matchups.forEach(matchup => {
    const key = `${matchup.leagueId}-${matchup.rosterId}-${matchup.season}`;

    if (!seasonalData.has(key)) {
      seasonalData.set(key, {
        rosterId: matchup.rosterId,
        teamName: matchup.teamName,
        leagueId: matchup.leagueId,
        leagueName: matchup.leagueName,
        season: matchup.season,
        wins: 0,
        losses: 0,
        ties: 0,
        totalPoints: 0,
        totalPointsAgainst: 0,
        averagePoints: 0,
        expectedWins: 0,
        luckDelta: 0,
        totalDonuts: 0,
        totalBenchBlunders: 0,
        longestWinStreak: 0,
        longestLosingStreak: 0,
        currentStreak: 0,
        blowoutWins: 0,
        blowoutLosses: 0,
        closeGames: 0,
        scheduleStrength: 0,
        playoffAppearance: false,
        championshipWin: false,
        qbPoints: 0,
        rbPoints: 0,
        wrPoints: 0,
        tePoints: 0,
        defPoints: 0,
      });
    }

    const data = seasonalData.get(key)!;

    // Update basic stats
    data.totalPoints += matchup.points;
    data.totalPointsAgainst += matchup.opponentPoints || 0;

    if (matchup.won === true) {
      data.wins++;
    } else if (matchup.won === false) {
      data.losses++;
    } else if (matchup.opponentPoints === matchup.points) {
      data.ties++;
    }

    // Count donuts (players with 0 points)
    if (matchup.starters_points) {
      data.totalDonuts += matchup.starters_points.filter(pts => pts === 0).length;
    }

    // Calculate bench blunder (if we have optimal lineup data)
    if (matchup.custom_points) {
      data.totalBenchBlunders += matchup.custom_points - matchup.points;
    }

    // Track blowouts and close games
    const margin = Math.abs(matchup.points - (matchup.opponentPoints || 0));
    if (margin >= 30) {
      if (matchup.won) data.blowoutWins++;
      else data.blowoutLosses++;
    }
    if (margin <= 5) {
      data.closeGames++;
    }

    // Update playoff status
    if (matchup.isPlayoff) {
      data.playoffAppearance = true;
      // Championship is usually week 17
      if (matchup.week === 17 && matchup.won) {
        data.championshipWin = true;
      }
    }

    // Calculate positional points (if we have player data)
    if (matchup.starters && matchup.playerData) {
      matchup.starters.forEach((playerId, idx) => {
        const player = matchup.playerData?.get(playerId);
        const points = matchup.starters_points?.[idx] || 0;

        if (player) {
          switch (player.position) {
            case 'QB':
              data.qbPoints += points;
              break;
            case 'RB':
              data.rbPoints += points;
              break;
            case 'WR':
              data.wrPoints += points;
              break;
            case 'TE':
              data.tePoints += points;
              break;
            case 'DEF':
              data.defPoints += points;
              break;
          }
        }
      });
    }
  });

  // Calculate streaks separately
  const streaks = calculateStreaks(matchups);

  // Update seasonal data with streak information
  streaks.forEach(streak => {
    const key = `${streak.leagueId}-${streak.rosterId}-${streak.season}`;
    const data = seasonalData.get(key);

    if (data) {
      if (streak.type === 'win') {
        data.longestWinStreak = Math.max(data.longestWinStreak, streak.length);
      } else if (streak.type === 'loss') {
        data.longestLosingStreak = Math.max(data.longestLosingStreak, streak.length);
      }
    }
  });

  // Calculate averages and luck
  seasonalData.forEach(data => {
    const gamesPlayed = data.wins + data.losses + data.ties;
    if (gamesPlayed > 0) {
      data.averagePoints = data.totalPoints / gamesPlayed;

      // Calculate expected wins (would need all matchup data for proper calculation)
      // For now, using a simplified version based on points
      // In reality, this should compare against all possible opponents each week
      data.expectedWins = calculateExpectedWinsForSeason(
        matchups,
        data.rosterId,
        data.leagueId,
        data.season,
      );
      data.luckDelta = data.wins - data.expectedWins;

      // Calculate schedule strength (average opponent points)
      data.scheduleStrength = data.totalPointsAgainst / gamesPlayed;
    }
  });

  return Array.from(seasonalData.values());
};

/**
 * Find the highest/lowest rolling window totals
 */
export const findBestRollingWindows = (
  windows: RollingWindowData[],
  type: 'highest' | 'lowest' = 'highest',
  limit: number = 5,
): RollingWindowData[] => {
  const sorted = [...windows].sort((a, b) =>
    type === 'highest' ? b.totalPoints - a.totalPoints : a.totalPoints - b.totalPoints,
  );

  return sorted.slice(0, limit);
};

/**
 * Find the longest streaks
 */
export const findLongestStreaks = (
  streaks: StreakData[],
  type: 'win' | 'loss' | 'above_median' | 'below_median',
  limit: number = 5,
): StreakData[] => {
  return streaks
    .filter(s => s.type === type)
    .sort((a, b) => b.length - a.length)
    .slice(0, limit);
};

/**
 * Find seasonal records
 */
export const findSeasonalRecords = (
  seasonalData: SeasonalData[],
  category: keyof SeasonalData,
  type: 'highest' | 'lowest' = 'highest',
  limit: number = 5,
): SeasonalData[] => {
  const sorted = [...seasonalData].sort((a, b) => {
    const aVal = a[category] as number;
    const bVal = b[category] as number;
    return type === 'highest' ? bVal - aVal : aVal - bVal;
  });

  return sorted.slice(0, limit);
};
