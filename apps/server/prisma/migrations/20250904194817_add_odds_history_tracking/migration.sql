-- CreateTable
CREATE TABLE "MatchupOddsHistory" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "team1WinPct" DOUBLE PRECISION NOT NULL,
    "team2WinPct" DOUBLE PRECISION NOT NULL,
    "spread" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "team1MoneyLine" INTEGER NOT NULL,
    "team2MoneyLine" INTEGER NOT NULL,
    "gameProgress" DOUBLE PRECISION NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "triggeredBy" TEXT NOT NULL,
    "computeTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchupOddsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueOddsHistory" (
    "id" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "highestScorerOdds" JSONB NOT NULL,
    "lowestScorerOdds" JSONB NOT NULL,
    "closestMatchup" JSONB NOT NULL,
    "biggestBlowout" JSONB NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "triggeredBy" TEXT NOT NULL,
    "computeTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueOddsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchupOddsHistory_leagueId_week_matchupId_idx" ON "MatchupOddsHistory"("leagueId", "week", "matchupId");

-- CreateIndex
CREATE INDEX "MatchupOddsHistory_createdAt_idx" ON "MatchupOddsHistory"("createdAt");

-- CreateIndex
CREATE INDEX "MatchupOddsHistory_isLive_idx" ON "MatchupOddsHistory"("isLive");

-- CreateIndex
CREATE INDEX "LeagueOddsHistory_week_idx" ON "LeagueOddsHistory"("week");

-- CreateIndex
CREATE INDEX "LeagueOddsHistory_createdAt_idx" ON "LeagueOddsHistory"("createdAt");

-- CreateIndex
CREATE INDEX "LeagueOddsHistory_isLive_idx" ON "LeagueOddsHistory"("isLive");

-- AddForeignKey
ALTER TABLE "MatchupOddsHistory" ADD CONSTRAINT "MatchupOddsHistory_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
