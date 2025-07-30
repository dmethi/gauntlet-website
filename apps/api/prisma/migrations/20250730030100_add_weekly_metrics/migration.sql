-- AlterTable
ALTER TABLE "public"."League" ALTER COLUMN "settings" DROP NOT NULL,
ALTER COLUMN "scoringSettings" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Roster" ALTER COLUMN "settings" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."WeeklyMetrics" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL,
    "expectedWins" DOUBLE PRECISION NOT NULL,
    "luckRating" DOUBLE PRECISION NOT NULL,
    "opponentPoints" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyMetrics_leagueId_week_idx" ON "public"."WeeklyMetrics"("leagueId", "week");

-- CreateIndex
CREATE INDEX "WeeklyMetrics_rosterId_week_idx" ON "public"."WeeklyMetrics"("rosterId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMetrics_leagueId_rosterId_week_key" ON "public"."WeeklyMetrics"("leagueId", "rosterId", "week");

-- AddForeignKey
ALTER TABLE "public"."WeeklyMetrics" ADD CONSTRAINT "WeeklyMetrics_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyMetrics" ADD CONSTRAINT "WeeklyMetrics_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "public"."Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
