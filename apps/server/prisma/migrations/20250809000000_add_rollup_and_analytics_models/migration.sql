-- CreateTable: MatchupSummary
CREATE TABLE "public"."MatchupSummary" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "rosterAId" INTEGER NOT NULL,
    "rosterBId" INTEGER NOT NULL,
    "pointsA" DOUBLE PRECISION NOT NULL,
    "pointsB" DOUBLE PRECISION NOT NULL,
    "winnerRosterId" INTEGER,
    "margin" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchupSummary_pkey" PRIMARY KEY ("id")
);

-- Indexes for MatchupSummary
CREATE UNIQUE INDEX "MatchupSummary_leagueId_week_matchupId_key" ON "public"."MatchupSummary"("leagueId", "week", "matchupId");
CREATE INDEX "MatchupSummary_leagueId_week_idx" ON "public"."MatchupSummary"("leagueId", "week");

-- Foreign Keys for MatchupSummary
ALTER TABLE "public"."MatchupSummary" ADD CONSTRAINT "MatchupSummary_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."MatchupSummary" ADD CONSTRAINT "MatchupSummary_rosterAId_fkey" FOREIGN KEY ("rosterAId") REFERENCES "public"."Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."MatchupSummary" ADD CONSTRAINT "MatchupSummary_rosterBId_fkey" FOREIGN KEY ("rosterBId") REFERENCES "public"."Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."MatchupSummary" ADD CONSTRAINT "MatchupSummary_winnerRosterId_fkey" FOREIGN KEY ("winnerRosterId") REFERENCES "public"."Roster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: RosterWeekAggregate
CREATE TABLE "public"."RosterWeekAggregate" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectedPoints" DOUBLE PRECISION,
    "optimalPoints" DOUBLE PRECISION,
    "managerDelta" DOUBLE PRECISION,
    "managerScore" DOUBLE PRECISION,
    "opponentRosterId" INTEGER,
    "opponentPoints" DOUBLE PRECISION,
    "won" BOOLEAN,
    "streak" INTEGER,
    "rollingAvg3" DOUBLE PRECISION,
    "expectedWins" DOUBLE PRECISION,
    "luck" DOUBLE PRECISION,
    "positionalPoints" JSONB,
    "opponentPositionalPoints" JSONB,
    "mvpPlayerId" TEXT,
    "mvpValue" DOUBLE PRECISION,
    "transactionScore" DOUBLE PRECISION,
    "injuryPoints" DOUBLE PRECISION,
    "powerRank" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterWeekAggregate_pkey" PRIMARY KEY ("id")
);

-- Indexes for RosterWeekAggregate
CREATE UNIQUE INDEX "RosterWeekAggregate_leagueId_rosterId_week_key" ON "public"."RosterWeekAggregate"("leagueId", "rosterId", "week");
CREATE INDEX "RosterWeekAggregate_leagueId_week_idx" ON "public"."RosterWeekAggregate"("leagueId", "week");
CREATE INDEX "RosterWeekAggregate_rosterId_week_idx" ON "public"."RosterWeekAggregate"("rosterId", "week");

-- Foreign Keys for RosterWeekAggregate
ALTER TABLE "public"."RosterWeekAggregate" ADD CONSTRAINT "RosterWeekAggregate_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."RosterWeekAggregate" ADD CONSTRAINT "RosterWeekAggregate_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "public"."Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."RosterWeekAggregate" ADD CONSTRAINT "RosterWeekAggregate_opponentRosterId_fkey" FOREIGN KEY ("opponentRosterId") REFERENCES "public"."Roster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: LeagueWeekSummary
CREATE TABLE "public"."LeagueWeekSummary" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "medianPoints" DOUBLE PRECISION NOT NULL,
    "averagePoints" DOUBLE PRECISION NOT NULL,
    "maxPoints" DOUBLE PRECISION NOT NULL,
    "minPoints" DOUBLE PRECISION NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueWeekSummary_pkey" PRIMARY KEY ("id")
);

-- Indexes for LeagueWeekSummary
CREATE UNIQUE INDEX "LeagueWeekSummary_leagueId_week_key" ON "public"."LeagueWeekSummary"("leagueId", "week");
CREATE INDEX "LeagueWeekSummary_leagueId_week_idx" ON "public"."LeagueWeekSummary"("leagueId", "week");

-- Foreign Keys for LeagueWeekSummary
ALTER TABLE "public"."LeagueWeekSummary" ADD CONSTRAINT "LeagueWeekSummary_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: PlayerStatusHistory
CREATE TABLE "public"."PlayerStatusHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "status" TEXT,
    "injuryStatus" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStatusHistory_pkey" PRIMARY KEY ("id")
);

-- Indexes for PlayerStatusHistory
CREATE UNIQUE INDEX "PlayerStatusHistory_playerId_season_week_key" ON "public"."PlayerStatusHistory"("playerId", "season", "week");
CREATE INDEX "PlayerStatusHistory_season_week_idx" ON "public"."PlayerStatusHistory"("season", "week");

-- Foreign Keys for PlayerStatusHistory
ALTER TABLE "public"."PlayerStatusHistory" ADD CONSTRAINT "PlayerStatusHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: SeasonSuperlatives
CREATE TABLE "public"."SeasonSuperlatives" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "week" INTEGER,
    "rosterId" INTEGER,
    "playerId" TEXT,
    "matchupId" INTEGER,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonSuperlatives_pkey" PRIMARY KEY ("id")
);

-- Indexes for SeasonSuperlatives
CREATE INDEX "SeasonSuperlatives_leagueId_season_idx" ON "public"."SeasonSuperlatives"("leagueId", "season");
CREATE INDEX "SeasonSuperlatives_category_idx" ON "public"."SeasonSuperlatives"("category");

-- Foreign Keys for SeasonSuperlatives
ALTER TABLE "public"."SeasonSuperlatives" ADD CONSTRAINT "SeasonSuperlatives_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."SeasonSuperlatives" ADD CONSTRAINT "SeasonSuperlatives_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "public"."Roster"("id") ON DELETE SET NULL ON UPDATE CASCADE;


