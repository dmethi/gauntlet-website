-- CreateTable
CREATE TABLE "MatchupSimulation" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "teamAMean" DOUBLE PRECISION NOT NULL,
    "teamAP10" DOUBLE PRECISION NOT NULL,
    "teamAP25" DOUBLE PRECISION,
    "teamAMedian" DOUBLE PRECISION NOT NULL,
    "teamAP75" DOUBLE PRECISION,
    "teamAP90" DOUBLE PRECISION NOT NULL,
    "teamAStdDev" DOUBLE PRECISION NOT NULL,
    "teamBMean" DOUBLE PRECISION NOT NULL,
    "teamBP10" DOUBLE PRECISION NOT NULL,
    "teamBP25" DOUBLE PRECISION,
    "teamBMedian" DOUBLE PRECISION NOT NULL,
    "teamBP75" DOUBLE PRECISION,
    "teamBP90" DOUBLE PRECISION NOT NULL,
    "teamBStdDev" DOUBLE PRECISION NOT NULL,
    "teamAWinPct" DOUBLE PRECISION NOT NULL,
    "teamBWinPct" DOUBLE PRECISION NOT NULL,
    "impliedSpread" DOUBLE PRECISION NOT NULL,
    "moneyLineA" INTEGER NOT NULL,
    "moneyLineB" INTEGER NOT NULL,
    "totalLine" DOUBLE PRECISION NOT NULL,
    "overPct" DOUBLE PRECISION NOT NULL,
    "underPct" DOUBLE PRECISION NOT NULL,
    "iterations" INTEGER NOT NULL DEFAULT 100000,
    "simulationSeed" INTEGER,
    "computeTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchupSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSimulation" (
    "id" TEXT NOT NULL,
    "matchupSimulationId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "teamRosterId" INTEGER NOT NULL,
    "isStarter" BOOLEAN NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "p10" DOUBLE PRECISION NOT NULL,
    "p25" DOUBLE PRECISION,
    "median" DOUBLE PRECISION NOT NULL,
    "p75" DOUBLE PRECISION,
    "p90" DOUBLE PRECISION NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "projection" DOUBLE PRECISION NOT NULL,
    "dataSource" TEXT NOT NULL,
    "sampleSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchupSimulation_leagueId_week_idx" ON "MatchupSimulation"("leagueId", "week");

-- CreateIndex
CREATE INDEX "MatchupSimulation_createdAt_idx" ON "MatchupSimulation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchupSimulation_leagueId_week_matchupId_key" ON "MatchupSimulation"("leagueId", "week", "matchupId");

-- CreateIndex
CREATE INDEX "PlayerSimulation_playerId_idx" ON "PlayerSimulation"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSimulation_matchupSimulationId_playerId_key" ON "PlayerSimulation"("matchupSimulationId", "playerId");

-- AddForeignKey
ALTER TABLE "MatchupSimulation" ADD CONSTRAINT "MatchupSimulation_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSimulation" ADD CONSTRAINT "PlayerSimulation_matchupSimulationId_fkey" FOREIGN KEY ("matchupSimulationId") REFERENCES "MatchupSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
