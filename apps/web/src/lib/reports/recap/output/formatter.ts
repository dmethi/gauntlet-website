/**
 * JSON Report Output Formatter
 *
 * Transforms LangGraph state into final WeeklyRecapReport JSON format.
 * Handles partial failures gracefully and ensures proper metadata tracking.
 */

import type { WeeklyRecapReport } from '../types';
import type { RecapReportState } from '../state';
import { getMatchupWinProbTimeSeries } from '@gauntlet/server';

/**
 * Format the orchestration state into final WeeklyRecapReport structure.
 * Matches the existing report-week5.json format exactly.
 */
export const formatRecapReport = async (state: RecapReportState): Promise<WeeklyRecapReport> => {
  const startTime = state.sectionMetadata?.leagueOverview?.startTime || Date.now();
  const endTime = Date.now();
  const generationTime = endTime - startTime;

  // Calculate total tokens used across all sections
  const tokensUsed = calculateTotalTokens(state);

  // Determine report status based on section completions
  const status = determineReportStatus(state);

  // Collect all errors from sections
  const errors = collectErrors(state);

  // Build the report structure (formatMatchupNarratives is now async)
  const matchupNarratives = await formatMatchupNarratives(state);

  const report: WeeklyRecapReport = {
    metadata: {
      week: state.week,
      season: state.season,
      generatedAt: state.generatedAt || new Date().toISOString(),
      generationTime,
      tokensUsed,
      version: '1.0.0',
      status,
      errors: errors.length > 0 ? errors : undefined,
    },
    sections: {
      leagueOverview: formatLeagueOverviewSection(state),
      matchupNarratives,
      hallOfFame: formatHallOfFameSection(state),
      hallOfShame: formatHallOfShameSection(state),
      powerRankings: formatPowerRankingsSection(state),
      standings: formatStandingsSection(state),
      upcoming: formatUpcomingSection(state),
      closing: formatClosingSection(state),
    },
    // Add top-level standingsData for UI (Week 5 format: array [afc, nfc])
    standingsData: state.standingsData
      ? [state.standingsData.afc, state.standingsData.nfc]
      : undefined,
  };

  return report;
};

/**
 * Calculate total tokens used across all sections.
 */
const calculateTotalTokens = (state: RecapReportState): number => {
  const metadata = state.sectionMetadata || {};
  let total = 0;

  Object.values(metadata).forEach(sectionMeta => {
    if (sectionMeta?.tokensUsed) {
      total += sectionMeta.tokensUsed;
    }
  });

  // Fallback to state-level token tracking if available
  if (total === 0 && state.tokensUsed) {
    total = state.tokensUsed;
  }

  return total;
};

/**
 * Determine overall report status based on section completion.
 */
const determineReportStatus = (state: RecapReportState): 'success' | 'partial' | 'failed' => {
  const metadata = state.sectionMetadata || {};
  const sections = Object.values(metadata);

  if (sections.length === 0) {
    return 'failed';
  }

  const completed = sections.filter(s => s.status === 'completed').length;
  const failed = sections.filter(s => s.status === 'failed').length;

  if (failed === sections.length) {
    return 'failed';
  }

  if (completed === sections.length) {
    return 'success';
  }

  return 'partial';
};

/**
 * Collect all error messages from failed sections.
 */
const collectErrors = (state: RecapReportState): string[] => {
  const errors: string[] = [];
  const metadata = state.sectionMetadata || {};

  Object.entries(metadata).forEach(([sectionName, sectionMeta]) => {
    if (sectionMeta?.status === 'failed' && sectionMeta.error) {
      errors.push(`[${sectionName}] ${sectionMeta.error}`);
    }
  });

  // Include any state-level errors
  if (state.errors && state.errors.length > 0) {
    errors.push(...state.errors);
  }

  return errors;
};

/**
 * Format League Overview section.
 */
const formatLeagueOverviewSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['leagueOverview'] => {
  const narrative = state.leagueOverview || 'League overview not available.';
  const metadata = state.sectionMetadata?.leagueOverview;

  return {
    narrative,
    stats: {
      totalGames: state.leagueOverviewData?.totalMatchups || 12, // Default to 12 (24 teams, 12 matchups)
      totalPoints: state.leagueOverviewData?.totalPoints || 0,
      averageScore: state.leagueOverviewData?.averageScore || 0,
      highestScore: state.leagueOverviewData?.highestScore || 0,
      lowestScore: state.leagueOverviewData?.lowestScore || 0,
      blowouts: state.leagueOverviewData?.blowouts || 0,
      closeGames: state.leagueOverviewData?.closeGames || 0,
    },
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Format Matchup Narratives sections.
 * Uses fetched data from matchup.data to populate boxScore and other fields.
 */
const formatMatchupNarratives = async (
  state: RecapReportState,
): Promise<WeeklyRecapReport['sections']['matchupNarratives']> => {
  if (!state.matchupNarratives || state.matchupNarratives.length === 0) {
    return [];
  }

  // Process all matchups in parallel
  return Promise.all(
    state.matchupNarratives.map(async matchup => {
      const data = matchup.data;

      // Format team records
      const formatRecord = (record: any) => {
        if (!record) return '';
        return `${record.wins}-${record.losses}${record.ties > 0 ? `-${record.ties}` : ''}`;
      };

      // Build boxScore from fetched data
      const boxScore = data
        ? {
            team1: {
              teamName: data.rosters?.team1?.teamName || '',
              rosterId: data.boxScore?.team1?.rosterId || 0,
              leagueId: matchup.leagueId,
              score: data.boxScore?.team1?.score || 0,
              record: formatRecord(data.records?.team1),
              topPerformers: (data.scoringBreakdown?.team1 || []).map((p: any) => ({
                playerId: p.playerId,
                playerName: p.playerName,
                position: p.position,
                points: p.points,
              })),
            },
            team2: {
              teamName: data.rosters?.team2?.teamName || '',
              rosterId: data.boxScore?.team2?.rosterId || 0,
              leagueId: matchup.leagueId,
              score: data.boxScore?.team2?.score || 0,
              record: formatRecord(data.records?.team2),
              topPerformers: (data.scoringBreakdown?.team2 || []).map((p: any) => ({
                playerId: p.playerId,
                playerName: p.playerName,
                position: p.position,
                points: p.points,
              })),
            },
            finalScore: {
              team1: data.boxScore?.team1?.score || 0,
              team2: data.boxScore?.team2?.score || 0,
            },
            winner: data.boxScore?.winner || 'team1',
            margin: data.boxScore?.margin || 0,
          }
        : {
            // Fallback empty structure if no data
            team1: {
              teamName: '',
              rosterId: 0,
              leagueId: matchup.leagueId,
              score: 0,
              record: '',
              topPerformers: [],
            },
            team2: {
              teamName: '',
              rosterId: 0,
              leagueId: matchup.leagueId,
              score: 0,
              record: '',
              topPerformers: [],
            },
            finalScore: {
              team1: 0,
              team2: 0,
            },
            winner: 'team1' as const,
            margin: 0,
          };

      return {
        matchupId: `${matchup.leagueId}-${state.week}-${matchup.matchupId}`,
        narrative: matchup.narrative,
        boxScore,
        // Add game flow data if available for charts
        gameFlow: data?.gameFlow
          ? {
              leadChanges: data.gameFlow.excitement?.leadChanges || 0,
              biggestLead: data.gameFlow.excitement?.maxComeback || 0,
              excitementScore:
                matchup.metadata.excitementLevel === 'high'
                  ? 75
                  : matchup.metadata.excitementLevel === 'medium'
                    ? 50
                    : 25,
            }
          : undefined,
        // Fetch FULL time series from database for charts (not compressed keyMoments)
        timeSeries: await (async () => {
          try {
            const rawTimeSeries = await getMatchupWinProbTimeSeries(
              matchup.leagueId,
              state.week,
              matchup.matchupId,
            );

            // Transform to chart format
            return rawTimeSeries.map(sample => ({
              timestamp: sample.timestamp.toISOString(),
              team1Score: sample.currentScoreA,
              team2Score: sample.currentScoreB,
              team1WinProbability: sample.winProbA,
              gameProgress: sample.gameProgress,
            }));
          } catch (error) {
            console.warn(
              `Failed to fetch timeSeries for ${matchup.leagueId}-${matchup.matchupId}:`,
              error,
            );
            return [];
          }
        })(),
        generatedAt: matchup.metadata?.error ? new Date().toISOString() : new Date().toISOString(),
      };
    }),
  );
};

/**
 * Format Hall of Fame section.
 */
const formatHallOfFameSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['hallOfFame'] => {
  const narrative = state.hallOfFame || 'Hall of Fame not available.';
  const metadata = state.sectionMetadata?.hallOfFame;

  // Transform topPerformers from enhanced tool format to section format
  const topPerformers: any = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    K: [],
    DEF: [],
  };

  if (state.hallOfFameData?.topPerformers) {
    Object.keys(topPerformers).forEach(position => {
      const performers = state.hallOfFameData?.topPerformers[position] || [];
      topPerformers[position] = performers.map((p: any) => ({
        playerName: p.playerName,
        playerId: p.playerId,
        position: p.position || position,
        team: '', // NFL team not tracked
        points: p.points,
        ownedBy: p.ownership?.map((o: any) => `${o.league}: ${o.teamName}`).join(', '),
      }));
    });
  }

  return {
    narrative,
    records: state.hallOfFameData?.recordBreakdowns || [], // Add structured records
    topPerformersByPosition: state.hallOfFameData?.topPerformers || {}, // Add raw top performers
    highlights: {
      topTeamScore: {
        teamName: '',
        score: 0,
        leagueId: '',
        rosterId: 0,
      },
      biggestBlowout: {
        winner: '',
        loser: '',
        margin: 0,
        matchupId: '',
      },
      topPerformers,
    },
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  } as any; // Cast to any since we're adding extra fields
};

/**
 * Format Hall of Shame section.
 */
const formatHallOfShameSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['hallOfShame'] => {
  const narrative = state.hallOfShame || 'Hall of Shame not available.';
  const metadata = state.sectionMetadata?.hallOfShame;

  // Transform biggestBusts from tool format to section format
  const biggestBusts = (state.hallOfShameData?.biggestBusts || []).map((bust: any) => ({
    playerName: bust.playerName,
    playerId: bust.playerId,
    position: bust.position,
    team: '', // NFL team not tracked
    points: bust.actual,
    projection: bust.projected,
    ownedBy: bust.ownedBy?.map((o: any) => `${o.league}: ${o.teamName}`).join(', '),
  }));

  // Find lowest team score from worstTeams
  const lowestTeam = state.hallOfShameData?.worstTeams?.[0];

  return {
    narrative,
    lowlights: {
      lowestTeamScore: lowestTeam
        ? {
            teamName: lowestTeam.teamName,
            score: lowestTeam.totalScore,
            leagueId: lowestTeam.league === 'AFC' ? 'AFC_LEAGUE_ID' : 'NFC_LEAGUE_ID',
            rosterId: 0,
          }
        : {
            teamName: '',
            score: 0,
            leagueId: '',
            rosterId: 0,
          },
      biggestBusts,
      badBeatLosses: [],
    },
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Format Power Rankings section.
 */
const formatPowerRankingsSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['powerRankings'] => {
  const narrative = state.powerRankings || 'Power rankings not available.';
  const metadata = state.sectionMetadata?.powerRankings;

  // Transform rankings data into the format expected by the UI
  const rankings =
    state.powerRankingsData?.rankings?.map((team: any) => ({
      rank: team.rank,
      previousRank: team.previousRank,
      teamName: team.teamName,
      leagueId: team.leagueId,
      rosterId: team.rosterId,
      record: team.record,
      points: team.pointsFor,
      tier: team.tier,
      powerScore: team.powerScore,
      movement:
        team.movement > 0
          ? ('up' as const)
          : team.movement < 0
            ? ('down' as const)
            : ('same' as const),
      movementAmount: Math.abs(team.movement),
    })) || [];

  return {
    narrative,
    rankings,
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Format Standings section.
 */
const formatStandingsSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['standings'] => {
  const narrative = state.standings || 'Standings not available.';
  const metadata = state.sectionMetadata?.standings;

  // Convert structured standings data to expected format
  const formatTeamStanding = (team: any): any => ({
    rank: team.playoffSeed || 0,
    teamName: team.teamName,
    record: `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
    pointsFor: team.points,
    pointsAgainst: 0, // Not tracked in current structure
    streak: '', // Not tracked in current structure
  });

  const afcTeams: any[] = state.standingsData?.afc
    ? Object.values(state.standingsData.afc.divisions).flat().map(formatTeamStanding)
    : [];

  const nfcTeams: any[] = state.standingsData?.nfc
    ? Object.values(state.standingsData.nfc.divisions).flat().map(formatTeamStanding)
    : [];

  return {
    narrative,
    standings: {
      afc: afcTeams,
      nfc: nfcTeams,
    },
    playoffPicture: {
      clinched: [],
      inHunt: [],
      eliminated: [],
    },
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Format Upcoming Matchups section.
 */
const formatUpcomingSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['upcoming'] => {
  const narrative = state.upcoming || 'Upcoming matchups not available.';
  const metadata = state.sectionMetadata?.upcoming;

  return {
    narrative,
    matchups: [],
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Format Closing Commentary section.
 */
const formatClosingSection = (
  state: RecapReportState,
): WeeklyRecapReport['sections']['closing'] => {
  const narrative = state.closing || 'Closing commentary not available.';
  const metadata = state.sectionMetadata?.closing;

  return {
    narrative,
    generatedAt: metadata?.endTime
      ? new Date(metadata.endTime).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * Helper: Convert report to JSON string with pretty formatting.
 */
export const serializeReport = (report: WeeklyRecapReport): string => {
  return JSON.stringify(report, null, 2);
};

/**
 * Helper: Parse JSON string back to report object.
 */
export const deserializeReport = (json: string): WeeklyRecapReport => {
  return JSON.parse(json) as WeeklyRecapReport;
};
