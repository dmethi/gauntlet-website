import { z } from 'zod';
import type {
  WeeklyRecapReport,
  ReportMetadata,
  LeagueOverviewSection,
  MatchupNarrativeSection,
  HallOfFameSection,
  HallOfShameSection,
  PowerRankingsSection,
  StandingsSection,
  UpcomingMatchupsSection,
  ClosingCommentarySection,
} from './types';

/**
 * Zod schemas for runtime validation of report data.
 *
 * These schemas validate:
 * - AI-generated outputs
 * - Tool results
 * - Final report JSON
 */

// ============================================================================
// METADATA SCHEMA
// ============================================================================

export const reportMetadataSchema = z.object({
  week: z.number().int().min(1).max(18),
  season: z.number().int().min(2020).max(2030),
  generatedAt: z.string().datetime(),
  generationTime: z.number().nonnegative(),
  tokensUsed: z.number().int().nonnegative(),
  version: z.string(),
  status: z.enum(['success', 'partial', 'failed']),
  errors: z.array(z.string()).optional(),
}) satisfies z.ZodType<ReportMetadata>;

// ============================================================================
// SECTION SCHEMAS
// ============================================================================

export const leagueOverviewSchema = z.object({
  narrative: z.string().min(100),
  stats: z.object({
    totalGames: z.number().int().min(0),
    totalPoints: z.number().nonnegative(),
    averageScore: z.number().nonnegative(),
    highestScore: z.number().nonnegative(),
    lowestScore: z.number().nonnegative(),
    blowouts: z.number().int().nonnegative(),
    closeGames: z.number().int().nonnegative(),
  }),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<LeagueOverviewSection>;

export const teamBoxScoreSchema = z.object({
  teamName: z.string(),
  rosterId: z.number().int(),
  leagueId: z.string(),
  score: z.number().nonnegative(),
  record: z.string().regex(/^\d+-\d+$/), // e.g., "4-1"
  topPerformers: z.array(
    z.object({
      playerName: z.string(),
      position: z.string(),
      points: z.number(),
    }),
  ),
});

export const matchupNarrativeSchema = z.object({
  matchupId: z.string(),
  narrative: z.string().min(200),
  boxScore: z.object({
    team1: teamBoxScoreSchema,
    team2: teamBoxScoreSchema,
    finalScore: z.object({
      team1: z.number(),
      team2: z.number(),
    }),
    winner: z.enum(['team1', 'team2']),
    margin: z.number().nonnegative(),
  }),
  gameFlow: z
    .object({
      leadChanges: z.number().int().nonnegative(),
      biggestLead: z.number().nonnegative(),
      excitementScore: z.number().min(0).max(100),
    })
    .optional(),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<MatchupNarrativeSection>;

export const playerPerformanceSchema = z.object({
  playerName: z.string(),
  playerId: z.string(),
  position: z.string(),
  team: z.string(),
  points: z.number(),
  projection: z.number().optional(),
  ownedBy: z.string().optional(),
});

export const hallOfFameSchema = z.object({
  narrative: z.string().min(200),
  highlights: z.object({
    topTeamScore: z.object({
      teamName: z.string(),
      score: z.number(),
      leagueId: z.string(),
      rosterId: z.number(),
    }),
    biggestBlowout: z.object({
      winner: z.string(),
      loser: z.string(),
      margin: z.number(),
      matchupId: z.string(),
    }),
    topPerformers: z.object({
      QB: z.array(playerPerformanceSchema),
      RB: z.array(playerPerformanceSchema),
      WR: z.array(playerPerformanceSchema),
      TE: z.array(playerPerformanceSchema),
      K: z.array(playerPerformanceSchema),
      DEF: z.array(playerPerformanceSchema),
    }),
  }),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<HallOfFameSection>;

export const hallOfShameSchema = z.object({
  narrative: z.string().min(200),
  lowlights: z.object({
    lowestTeamScore: z.object({
      teamName: z.string(),
      score: z.number(),
      leagueId: z.string(),
      rosterId: z.number(),
    }),
    biggestBusts: z.array(playerPerformanceSchema),
    badBeatLosses: z.array(
      z.object({
        loser: z.string(),
        loserScore: z.number(),
        winnerScore: z.number(),
        margin: z.number(),
        context: z.string(),
      }),
    ),
  }),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<HallOfShameSection>;

export const powerRankingsSchema = z.object({
  narrative: z.string().min(100),
  rankings: z.array(
    z.object({
      rank: z.number().int().min(1),
      previousRank: z.number().int().min(1).optional(),
      teamName: z.string(),
      leagueId: z.string(),
      rosterId: z.number().int(),
      record: z.string(),
      points: z.number(),
      tier: z.number().int().optional(),
      powerScore: z.number().optional(),
      movement: z.enum(['up', 'down', 'same']),
      movementAmount: z.number().int().optional(),
    }),
  ),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<PowerRankingsSection>;

export const standingsSchema = z.object({
  narrative: z.string().min(50),
  standings: z.object({
    afc: z.array(
      z.object({
        rank: z.number().int(),
        teamName: z.string(),
        record: z.string(),
        pointsFor: z.number(),
        pointsAgainst: z.number(),
        streak: z.string(),
      }),
    ),
    nfc: z.array(
      z.object({
        rank: z.number().int(),
        teamName: z.string(),
        record: z.string(),
        pointsFor: z.number(),
        pointsAgainst: z.number(),
        streak: z.string(),
      }),
    ),
  }),
  playoffPicture: z.object({
    clinched: z.array(z.string()),
    inHunt: z.array(z.string()),
    eliminated: z.array(z.string()),
  }),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<StandingsSection>;

export const upcomingMatchupsSchema = z.object({
  narrative: z.string().min(50),
  matchups: z.array(
    z.object({
      team1: z.string(),
      team2: z.string(),
      storyline: z.string(),
    }),
  ),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<UpcomingMatchupsSection>;

export const closingCommentarySchema = z.object({
  narrative: z.string().min(100),
  generatedAt: z.string().datetime(),
}) satisfies z.ZodType<ClosingCommentarySection>;

// ============================================================================
// COMPLETE REPORT SCHEMA
// ============================================================================

export const weeklyRecapReportSchema = z.object({
  metadata: reportMetadataSchema,
  sections: z.object({
    leagueOverview: leagueOverviewSchema,
    matchupNarratives: z.array(matchupNarrativeSchema).length(12),
    hallOfFame: hallOfFameSchema,
    hallOfShame: hallOfShameSchema,
    powerRankings: powerRankingsSchema,
    standings: standingsSchema,
    upcoming: upcomingMatchupsSchema,
    closing: closingCommentarySchema,
  }),
}) satisfies z.ZodType<WeeklyRecapReport>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates a complete report and returns detailed errors.
 */
export const validateReport = (
  data: unknown,
): {
  success: boolean;
  data?: WeeklyRecapReport;
  errors?: z.ZodIssue[];
} => {
  const result = weeklyRecapReportSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error.issues };
};

/**
 * Validates a section independently.
 */
export const validateSection = (
  sectionName: string,
  data: unknown,
): {
  success: boolean;
  data?: unknown;
  errors?: z.ZodIssue[];
} => {
  const schemas: Record<string, z.ZodSchema> = {
    leagueOverview: leagueOverviewSchema,
    matchupNarrative: matchupNarrativeSchema,
    hallOfFame: hallOfFameSchema,
    hallOfShame: hallOfShameSchema,
    powerRankings: powerRankingsSchema,
    standings: standingsSchema,
    upcoming: upcomingMatchupsSchema,
    closing: closingCommentarySchema,
  };

  const schema = schemas[sectionName];
  if (!schema) {
    return {
      success: false,
      errors: [{ code: 'custom' as const, message: 'Unknown section', path: [] }],
    };
  }

  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error.issues };
};
