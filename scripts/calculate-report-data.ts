#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

// Predefined division assignments by team name
const DIVISION_ASSIGNMENTS = {
  '1263744209295245312': {
    // AFC
    North: ['The Golden Age', 'lol jerry jones', 'vchak', 'NielGetsCarried'],
    South: ['2 Dolla Balla$', 'Quonspiracy Theorists', 'scboom5', 'Dr Patel Parikh MD MBA'],
    West: ['Nacua Matata', 'benweinfeld', 'To Infinity and Bijan', 'achak7'],
  },
  '1263740549504962561': {
    // NFC
    North: ['ziyanp22', 'Mach 10', 'vayyala', 'DJ Herbussy '],
    South: ['Dont go Chasing Saquon', 'RithikP', 'Jaxson Dart-Njigba', 'C&G^2'],
    West: ['Marginal Returns', 'Saint Brown Does Mahomes', 'lukebowsh', 'cescott25'],
  },
};

const SEASON = '2025';
// CURRENT_WEEK is now passed as command line argument

interface Player {
  player_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
}

interface TeamRecord {
  rosterId: number;
  wins: number;
  losses: number;
  ties: number;
  totalPoints: number;
  weeklyScores: number[];
  teamName: string;
  ownerName: string;
  leagueId: string;
}

interface HallOfFameEntry {
  category: string;
  description: string;
  player: string;
  team: string;
  value: string;
  weekNumber: number;
  isNewThisWeek: boolean;
}

interface PowerRanking {
  leagueId: string;
  rosterId: string;
  name: string;
  rank: number;
  normalized: number;
  wins: number;
  losses: number;
  avgPoints: number;
  expectedWins: number;
  rolling3Avg: number;
  delta?: number; // Change from previous week ranking (+3 = moved up 3 spots, -2 = moved down 2 spots)
  deltaLabel?: string; // "NEW", "+3", "-2", "—" (no change)
}

class ReportDataCalculator {
  private playersData: Map<string, Player> = new Map();
  private teamRecords: Map<string, TeamRecord> = new Map();
  private weeklyMatchups: Map<string, any[]> = new Map();

  async calculateReportData(week: number) {
    console.log(`🚀 Calculating report data for Week ${week}...`);

    // Step 1: Fetch all necessary data
    await this.fetchPlayersData();
    await this.fetchAllMatchupsData(week);
    await this.calculateTeamRecords(week);

    // Step 2: Calculate all metrics
    const powerRankings = await this.calculatePowerRankings(week);
    const standings = await this.calculateStandings();
    const hallOfFame = await this.calculateHallOfFame(week);
    const upcomingMatchups = await this.getUpcomingMatchups(week + 1);

    // Step 3: Structure the final data
    const reportData = {
      season: SEASON,
      week: week,
      lastUpdated: new Date().toISOString(),
      dataSource: 'sleeper-api-calculated',
      leagues: await this.getLeagueData(week),
      powerRankings,
      standings,
      hallOfFame,
      upcoming: upcomingMatchups,
    };

    // Step 4: Save to static file
    const outputPath = path.join(process.cwd(), `apps/web/data/report-week${week}.json`);
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, JSON.stringify(reportData, null, 2));

    console.log(`✅ Report data saved to ${outputPath}`);
    return reportData;
  }

  private async fetchPlayersData() {
    console.log('📥 Fetching players data...');
    try {
      const response = await fetch('https://api.sleeper.app/v1/players/nfl');
      const playersObj = await response.json();

      // Convert object to Map for faster lookups
      Object.entries(playersObj).forEach(([playerId, player]: [string, any]) => {
        this.playersData.set(playerId, {
          player_id: playerId,
          full_name:
            player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          first_name: player.first_name || '',
          last_name: player.last_name || '',
          position: player.position || 'N/A',
          team: player.team || 'FA',
        });
      });

      console.log(`✅ Loaded ${this.playersData.size} players`);
    } catch (error) {
      console.error('❌ Failed to fetch players data:', error);
    }
  }

  private async fetchAllMatchupsData(upToWeek: number) {
    console.log(`📥 Fetching matchups data for weeks 1-${upToWeek}...`);

    for (const league of GAUNTLET_LEAGUES) {
      for (let week = 1; week <= upToWeek; week++) {
        try {
          const response = await fetch(
            `https://api.sleeper.app/v1/league/${league.id}/matchups/${week}`
          );
          const matchups = await response.json();
          const key = `${league.id}-${week}`;
          this.weeklyMatchups.set(key, matchups || []);

          console.log(`✅ Week ${week} ${league.name}: ${matchups?.length || 0} team entries`);
        } catch (error) {
          console.error(`❌ Failed to fetch ${league.name} Week ${week} matchups:`, error);
        }
      }
    }
  }

  private async calculateTeamRecords(upToWeek: number) {
    console.log('📊 Calculating team records...');

    for (const league of GAUNTLET_LEAGUES) {
      // Get roster and user info
      const [rostersResponse, usersResponse] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`),
      ]);

      const rosters = await rostersResponse.json();
      const users = await usersResponse.json();
      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));

      // Initialize team records
      rosters.forEach((roster: any) => {
        const owner = usersMap.get(roster.owner_id);
        const teamKey = `${league.id}-${roster.roster_id}`;

        this.teamRecords.set(teamKey, {
          rosterId: roster.roster_id,
          wins: 0,
          losses: 0,
          ties: 0,
          totalPoints: 0,
          weeklyScores: [],
          teamName:
            owner?.metadata?.team_name ||
            owner?.display_name ||
            owner?.username ||
            `Team ${roster.roster_id}`,
          ownerName: owner?.display_name || owner?.username || 'Unknown',
          leagueId: league.id,
        });
      });

      // Calculate records from each week's matchups
      for (let week = 1; week <= upToWeek; week++) {
        const key = `${league.id}-${week}`;
        const weekMatchups = this.weeklyMatchups.get(key) || [];

        // Group matchups by matchup_id
        const matchupGroups = new Map<number, any[]>();
        weekMatchups.forEach((matchup: any) => {
          if (matchup.matchup_id) {
            const group = matchupGroups.get(matchup.matchup_id) || [];
            group.push(matchup);
            matchupGroups.set(matchup.matchup_id, group);
          }
        });

        // Process each matchup
        matchupGroups.forEach(group => {
          if (group.length === 2) {
            const [teamA, teamB] = group;
            const teamAKey = `${league.id}-${teamA.roster_id}`;
            const teamBKey = `${league.id}-${teamB.roster_id}`;

            const recordA = this.teamRecords.get(teamAKey);
            const recordB = this.teamRecords.get(teamBKey);

            if (recordA && recordB) {
              const pointsA = teamA.points || 0;
              const pointsB = teamB.points || 0;

              recordA.totalPoints += pointsA;
              recordB.totalPoints += pointsB;
              recordA.weeklyScores.push(pointsA);
              recordB.weeklyScores.push(pointsB);

              if (pointsA > pointsB) {
                recordA.wins++;
                recordB.losses++;
              } else if (pointsB > pointsA) {
                recordB.wins++;
                recordA.losses++;
              } else {
                recordA.ties++;
                recordB.ties++;
              }
            }
          }
        });
      }
    }

    console.log(`✅ Calculated records for ${this.teamRecords.size} teams`);
  }

  private async calculatePowerRankings(week: number): Promise<PowerRanking[]> {
    console.log('📈 Calculating power rankings...');

    // Calculate current week rankings
    const currentRankings = this.calculatePowerRankingsForWeek(week);

    // Calculate previous week rankings for delta comparison (if Week 2 or later)
    let previousRankings: PowerRanking[] = [];
    if (week > 1) {
      try {
        // Temporarily adjust team records to previous week state
        const originalRecords = new Map(this.teamRecords);
        this.adjustTeamRecordsToWeek(week - 1);
        previousRankings = this.calculatePowerRankingsForWeek(week - 1);
        // Restore original records
        this.teamRecords = originalRecords;
      } catch (error) {
        console.warn(`⚠️ Could not calculate Week ${week - 1} rankings for delta:`, error);
      }
    }

    // Add delta calculations
    currentRankings.forEach(current => {
      const previous = previousRankings.find(
        p => p.leagueId === current.leagueId && p.rosterId === current.rosterId
      );

      if (!previous) {
        // New team or first week
        current.delta = 0;
        current.deltaLabel = week === 1 ? '—' : 'NEW';
      } else {
        // Calculate rank change (positive = moved up, negative = moved down)
        current.delta = previous.rank - current.rank;
        if (current.delta === 0) {
          current.deltaLabel = '—';
        } else if (current.delta > 0) {
          current.deltaLabel = `+${current.delta}`;
        } else {
          current.deltaLabel = `${current.delta}`;
        }
      }
    });

    console.log(`✅ Calculated power rankings for ${currentRankings.length} teams`);
    return currentRankings;
  }

  private calculatePowerRankingsForWeek(week: number): PowerRanking[] {
    const allRankings: PowerRanking[] = [];

    Array.from(this.teamRecords.values()).forEach(record => {
      const avgPoints = record.totalPoints / Math.max(1, record.weeklyScores.length);

      // Calculate expected wins (how many teams this team would beat on average)
      const allOtherTeams = Array.from(this.teamRecords.values()).filter(
        other => other.leagueId === record.leagueId && other.rosterId !== record.rosterId
      );

      const expectedWins =
        allOtherTeams.reduce((sum, other) => {
          const otherAvg = other.totalPoints / Math.max(1, other.weeklyScores.length);
          return sum + (avgPoints > otherAvg ? 1 : avgPoints === otherAvg ? 0.5 : 0);
        }, 0) / Math.max(1, allOtherTeams.length);

      // 3-week rolling average (or however many weeks we have)
      const recentScores = record.weeklyScores.slice(-3);
      const rolling3Avg =
        recentScores.reduce((a, b) => a + b, 0) / Math.max(1, recentScores.length);

      allRankings.push({
        leagueId: record.leagueId,
        rosterId: String(record.rosterId),
        name: record.teamName,
        rank: 0, // Will be set after sorting
        normalized: 0, // Will be calculated
        wins: record.wins,
        losses: record.losses,
        avgPoints,
        expectedWins,
        rolling3Avg,
      });
    });

    // Calculate z-scores for each component
    const avgPointsValues = allRankings.map(r => r.avgPoints);
    const expectedWinsValues = allRankings.map(r => r.expectedWins);
    const rolling3Values = allRankings.map(r => r.rolling3Avg);

    const calculateZScore = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, values.length - 1)
      );
      return values.map(v => (stdDev === 0 ? 0 : (v - mean) / stdDev));
    };

    const zAvgPoints = calculateZScore(avgPointsValues);
    const zExpectedWins = calculateZScore(expectedWinsValues);
    const zRolling3 = calculateZScore(rolling3Values);

    // Apply official power ranking formula
    allRankings.forEach((ranking, index) => {
      const powerScore =
        0.5 * zAvgPoints[index] + 0.3 * zExpectedWins[index] + 0.2 * zRolling3[index];
      ranking.normalized = Math.round((100 + powerScore * 15) * 100) / 100; // Scale to ~70-130 range
    });

    // Sort and assign ranks
    allRankings.sort((a, b) => b.normalized - a.normalized);
    allRankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return allRankings;
  }

  private adjustTeamRecordsToWeek(targetWeek: number) {
    // Adjust team records to only include data up to targetWeek
    this.teamRecords.forEach((record, key) => {
      const weeklyScores = record.weeklyScores.slice(0, targetWeek);
      const totalPoints = weeklyScores.reduce((sum, points) => sum + points, 0);

      // Calculate wins/losses up to target week
      let wins = 0;
      let losses = 0;
      let ties = 0;

      for (let w = 1; w <= targetWeek; w++) {
        const weekKey = `${record.leagueId}-${w}`;
        const weekMatchups = this.weeklyMatchups.get(weekKey) || [];

        const teamMatchup = weekMatchups.find(m => m.roster_id === record.rosterId);

        if (teamMatchup) {
          // Find opponent in same matchup
          const opponent = weekMatchups.find(
            o => o.matchup_id === teamMatchup.matchup_id && o.roster_id !== record.rosterId
          );

          if (opponent) {
            const teamScore = teamMatchup.points || 0;
            const oppScore = opponent.points || 0;

            if (teamScore > oppScore) wins++;
            else if (teamScore < oppScore) losses++;
            else ties++;
          }
        }
      }

      // Update the record
      this.teamRecords.set(key, {
        ...record,
        weeklyScores,
        totalPoints,
        wins,
        losses,
        ties,
      });
    });
  }

  private async calculateStandings() {
    console.log('🏆 Calculating divisional standings...');

    const standings = [];

    for (const league of GAUNTLET_LEAGUES) {
      const leagueTeams = Array.from(this.teamRecords.values()).filter(
        record => record.leagueId === league.id
      );

      // Get division assignments for this league
      const divisionAssignments =
        DIVISION_ASSIGNMENTS[league.id as keyof typeof DIVISION_ASSIGNMENTS];

      if (!divisionAssignments) {
        console.warn(`No division assignments found for league ${league.id}`);
        continue;
      }

      // Create divisions based on predefined assignments
      const divisions: Record<string, any[]> = {};

      Object.entries(divisionAssignments).forEach(([divisionName, teamNames]) => {
        divisions[divisionName] = teamNames
          .map((teamName: string) => {
            const team = leagueTeams.find(t => t.teamName === teamName);
            if (!team) {
              console.warn(`Team "${teamName}" not found in league ${league.id}`);
              return null;
            }
            return {
              ...team,
              points: team.totalPoints, // Map totalPoints to points for frontend compatibility
            };
          })
          .filter(Boolean) // Remove null entries
          .sort((a: any, b: any) => {
            // Sort within division by wins, then by total points
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.points - a.points;
          });
      });

      standings.push({
        leagueId: league.id,
        leagueName: league.name,
        divisions,
      });
    }

    console.log(`✅ Calculated standings for ${GAUNTLET_LEAGUES.length} leagues`);
    return standings;
  }

  private async calculateHallOfFame(week: number): Promise<HallOfFameEntry[]> {
    console.log('🏆 Skipping Hall of Fame calculation (too much noise for reports)');
    return [];
  }

  private getTeamName(leagueId: string, rosterId: number): string {
    const teamKey = `${leagueId}-${rosterId}`;
    const record = this.teamRecords.get(teamKey);
    return record?.teamName || `Team ${rosterId}`;
  }

  private async getUpcomingMatchups(week: number) {
    console.log(`📅 Fetching upcoming matchups for Week ${week}...`);

    const upcoming: Record<string, any[]> = {};

    for (const league of GAUNTLET_LEAGUES) {
      try {
        const response = await fetch(
          `https://api.sleeper.app/v1/league/${league.id}/matchups/${week}`
        );
        const matchups = response.ok ? await response.json() : [];

        const matchupGroups = new Map<number, any[]>();
        matchups.forEach((matchup: any) => {
          if (matchup.matchup_id) {
            const group = matchupGroups.get(matchup.matchup_id) || [];
            group.push(matchup);
            matchupGroups.set(matchup.matchup_id, group);
          }
        });

        upcoming[league.id] = Array.from(matchupGroups.values())
          .filter(group => group.length === 2)
          .map(([teamA, teamB]) => ({
            matchupId: teamA.matchup_id,
            teamAName: this.getTeamName(league.id, teamA.roster_id),
            teamBName: this.getTeamName(league.id, teamB.roster_id),
            rosterAId: teamA.roster_id,
            rosterBId: teamB.roster_id,
          }));

        console.log(`✅ ${league.name} Week ${week}: ${upcoming[league.id].length} matchups`);
      } catch (error) {
        console.error(`❌ Failed to fetch upcoming matchups for ${league.name}:`, error);
        upcoming[league.id] = [];
      }
    }

    return upcoming;
  }

  private async getLeagueData(week: number) {
    console.log('🏈 Preparing league matchup data...');

    const leagues = [];

    for (const league of GAUNTLET_LEAGUES) {
      const key = `${league.id}-${week}`;
      const weekMatchups = this.weeklyMatchups.get(key) || [];

      // Group by matchup_id
      const matchupGroups = new Map<number, any[]>();
      weekMatchups.forEach((matchup: any) => {
        if (matchup.matchup_id) {
          const group = matchupGroups.get(matchup.matchup_id) || [];
          group.push(matchup);
          matchupGroups.set(matchup.matchup_id, group);
        }
      });

      const matchups = Array.from(matchupGroups.values())
        .filter(group => group.length === 2)
        .map(([teamA, teamB]) => {
          const teamAName = this.getTeamName(league.id, teamA.roster_id);
          const teamBName = this.getTeamName(league.id, teamB.roster_id);
          const pointsA = teamA.points || 0;
          const pointsB = teamB.points || 0;

          return {
            leagueId: league.id,
            matchupId: teamA.matchup_id,
            rosterAId: teamA.roster_id,
            rosterBId: teamB.roster_id,
            teamAName,
            teamBName,
            pointsA,
            pointsB,
            margin: Math.abs(pointsA - pointsB),
            combinedPoints: pointsA + pointsB,
            // Enhanced boxscore with real player names
            boxscoreA: (teamA.starters || []).map((playerId: string, index: number) => ({
              playerId,
              name: this.getPlayerName(playerId),
              position:
                this.getPlayerPosition(playerId) ||
                ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'][index] ||
                'FLEX',
              points: teamA.starters_points?.[index.toString()] || 0,
            })),
            boxscoreB: (teamB.starters || []).map((playerId: string, index: number) => ({
              playerId,
              name: this.getPlayerName(playerId),
              position:
                this.getPlayerPosition(playerId) ||
                ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'][index] ||
                'FLEX',
              points: teamB.starters_points?.[index.toString()] || 0,
            })),
            // Add realistic win probability progression
            series: this.generateWinProbSeries(pointsA, pointsB, teamAName, teamBName, week),
            excitementMetrics: {
              leadChanges: Math.floor(Math.random() * 6), // Placeholder for now
              avgDeltaPct: Math.min(50, Math.abs(pointsA - pointsB) * 2), // Rough estimate
            },
          };
        });

      leagues.push({
        leagueId: league.id,
        leagueName: league.name,
        matchups,
      });
    }

    console.log(`✅ Prepared data for ${leagues.length} leagues`);
    return leagues;
  }

  private getPlayerName(playerId: string): string {
    if (playerId === 'DEF' || /^[A-Z]{2,3}$/.test(playerId)) {
      return `${playerId} D/ST`;
    }
    const player = this.playersData.get(playerId);
    return player?.full_name || player?.last_name || playerId;
  }

  private getPlayerPosition(playerId: string): string | null {
    if (playerId === 'DEF' || /^[A-Z]{2,3}$/.test(playerId)) {
      return 'DEF';
    }
    const player = this.playersData.get(playerId);
    return player?.position || null;
  }

  private generateWinProbSeries(
    pointsA: number,
    pointsB: number,
    teamAName: string,
    teamBName: string,
    week: number = 2
  ) {
    // Week 1: 2025-09-08, Week 2: 2025-09-15, etc.
    const week1Date = new Date('2025-09-08T13:00:00Z');
    const baseTime = new Date(week1Date.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const times = [
      { offset: 0, label: 'Thursday' },
      { offset: 3 * 24 * 60 * 60 * 1000, label: 'Sunday Early' },
      { offset: 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000, label: 'Sunday Late' },
      { offset: 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000, label: 'Sunday Night' },
      { offset: 4 * 24 * 60 * 60 * 1000, label: 'Monday' },
    ];

    return times.map((time, index) => {
      const progress = index / (times.length - 1);
      const timestamp = new Date(baseTime.getTime() + time.offset).toISOString();

      let winProbA: number;
      if (index === 0) {
        winProbA = 0.5; // Start even
      } else if (index === times.length - 1) {
        winProbA = pointsA > pointsB ? 1.0 : 0.0; // Final result
      } else {
        // Gradual progression with some variance
        const finalWinnerIsA = pointsA > pointsB;
        const baseProb = finalWinnerIsA ? 0.5 + progress * 0.4 : 0.5 - progress * 0.4;
        const variance = 0.05 * Math.sin(progress * Math.PI * 3);
        winProbA = Math.max(0.05, Math.min(0.95, baseProb + variance));
      }

      return {
        timestamp,
        winProbA,
        winProbB: 1 - winProbA,
        gameProgress: progress * 100,
        team1Score: index === times.length - 1 ? pointsA : pointsA * progress,
        team2Score: index === times.length - 1 ? pointsB : pointsB * progress,
      };
    });
  }
}

// Main execution
async function main() {
  try {
    // Get week from command line argument, default to 2
    const week = parseInt(process.argv[2]) || 2;

    const calculator = new ReportDataCalculator();
    await calculator.calculateReportData(week);
    console.log('🎉 Report data calculation complete!');
  } catch (error) {
    console.error('💥 Error calculating report data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { ReportDataCalculator };
