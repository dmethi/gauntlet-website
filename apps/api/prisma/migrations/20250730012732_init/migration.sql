-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "metadata" JSONB,
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "seasonType" TEXT NOT NULL DEFAULT 'regular',
    "status" TEXT NOT NULL DEFAULT 'pre_draft',
    "sport" TEXT NOT NULL DEFAULT 'nfl',
    "totalRosters" INTEGER NOT NULL,
    "settings" JSONB NOT NULL,
    "scoringSettings" JSONB NOT NULL,
    "rosterPositions" TEXT[],
    "metadata" JSONB,
    "previousLeagueId" TEXT,
    "draftId" TEXT,
    "playoffMatchups" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Roster" (
    "id" INTEGER NOT NULL,
    "leagueId" TEXT NOT NULL,
    "ownerId" TEXT,
    "coOwners" TEXT[],
    "players" TEXT[],
    "starters" TEXT[],
    "reserve" TEXT[],
    "settings" JSONB NOT NULL,
    "metadata" JSONB,
    "waiverBudget" INTEGER NOT NULL DEFAULT 100,
    "waiverPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Matchup" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customPoints" DOUBLE PRECISION,
    "starters" TEXT[],
    "startersPoints" JSONB,
    "players" TEXT[],
    "playersPoints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "creatorId" TEXT NOT NULL,
    "rosterIds" INTEGER[],
    "adds" JSONB,
    "drops" JSONB,
    "draftPicks" JSONB,
    "waiver" JSONB,
    "settings" JSONB,
    "leg" INTEGER NOT NULL DEFAULT 1,
    "consenterIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TradedPick" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "previousOwnerId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradedPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Draft" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pre_draft',
    "type" TEXT NOT NULL DEFAULT 'snake',
    "season" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "metadata" JSONB,
    "slotToRosterId" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DraftPick" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "pickNo" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    "pickedBy" TEXT,
    "metadata" JSONB,
    "isKeeper" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Player" (
    "id" TEXT NOT NULL,
    "hashtag" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "team" TEXT,
    "position" TEXT NOT NULL,
    "depthChartOrder" INTEGER,
    "status" TEXT,
    "injuryStatus" TEXT,
    "weight" TEXT,
    "height" TEXT,
    "number" INTEGER,
    "age" INTEGER,
    "yearsExp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerStats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "statsType" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_LeagueOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LeagueOwners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "League_season_idx" ON "public"."League"("season");

-- CreateIndex
CREATE INDEX "Roster_leagueId_idx" ON "public"."Roster"("leagueId");

-- CreateIndex
CREATE INDEX "Roster_ownerId_idx" ON "public"."Roster"("ownerId");

-- CreateIndex
CREATE INDEX "Matchup_leagueId_week_idx" ON "public"."Matchup"("leagueId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "Matchup_leagueId_week_rosterId_key" ON "public"."Matchup"("leagueId", "week", "rosterId");

-- CreateIndex
CREATE INDEX "Transaction_leagueId_idx" ON "public"."Transaction"("leagueId");

-- CreateIndex
CREATE INDEX "Transaction_creatorId_idx" ON "public"."Transaction"("creatorId");

-- CreateIndex
CREATE INDEX "TradedPick_leagueId_season_idx" ON "public"."TradedPick"("leagueId", "season");

-- CreateIndex
CREATE INDEX "TradedPick_ownerId_idx" ON "public"."TradedPick"("ownerId");

-- CreateIndex
CREATE INDEX "Draft_leagueId_idx" ON "public"."Draft"("leagueId");

-- CreateIndex
CREATE INDEX "DraftPick_draftId_idx" ON "public"."DraftPick"("draftId");

-- CreateIndex
CREATE INDEX "DraftPick_rosterId_idx" ON "public"."DraftPick"("rosterId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_draftId_pickNo_key" ON "public"."DraftPick"("draftId", "pickNo");

-- CreateIndex
CREATE INDEX "Player_position_idx" ON "public"."Player"("position");

-- CreateIndex
CREATE INDEX "Player_team_idx" ON "public"."Player"("team");

-- CreateIndex
CREATE INDEX "PlayerStats_playerId_idx" ON "public"."PlayerStats"("playerId");

-- CreateIndex
CREATE INDEX "PlayerStats_week_season_idx" ON "public"."PlayerStats"("week", "season");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_playerId_week_season_statsType_key" ON "public"."PlayerStats"("playerId", "week", "season", "statsType");

-- CreateIndex
CREATE INDEX "_LeagueOwners_B_index" ON "public"."_LeagueOwners"("B");

-- AddForeignKey
ALTER TABLE "public"."Roster" ADD CONSTRAINT "Roster_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Roster" ADD CONSTRAINT "Roster_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Matchup" ADD CONSTRAINT "Matchup_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Matchup" ADD CONSTRAINT "Matchup_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "public"."Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TradedPick" ADD CONSTRAINT "TradedPick_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TradedPick" ADD CONSTRAINT "TradedPick_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Draft" ADD CONSTRAINT "Draft_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DraftPick" ADD CONSTRAINT "DraftPick_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LeagueOwners" ADD CONSTRAINT "_LeagueOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LeagueOwners" ADD CONSTRAINT "_LeagueOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
