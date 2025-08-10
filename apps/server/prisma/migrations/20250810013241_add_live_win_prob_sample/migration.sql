-- CreateTable
CREATE TABLE "LiveWinProbSample" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "rosterAId" INTEGER NOT NULL,
    "rosterBId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameProgress" DOUBLE PRECISION NOT NULL,
    "winProbA" DOUBLE PRECISION NOT NULL,
    "winProbB" DOUBLE PRECISION NOT NULL,
    "projectedFinalA" DOUBLE PRECISION NOT NULL,
    "projectedFinalB" DOUBLE PRECISION NOT NULL,
    "currentScoreA" DOUBLE PRECISION NOT NULL,
    "currentScoreB" DOUBLE PRECISION NOT NULL,
    "spread" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LiveWinProbSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveWinProbSample_leagueId_week_matchupId_idx" ON "LiveWinProbSample"("leagueId", "week", "matchupId");

-- CreateIndex
CREATE INDEX "LiveWinProbSample_timestamp_idx" ON "LiveWinProbSample"("timestamp");
