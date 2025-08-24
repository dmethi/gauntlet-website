-- CreateTable
CREATE TABLE "HallOfFameCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "groupName" TEXT NOT NULL,
    "statType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HallOfFameCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallOfFameRecord" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recordType" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "contextData" JSONB,
    "isAllTime" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HallOfFameRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFameCategory_name_key" ON "HallOfFameCategory"("name");

-- CreateIndex
CREATE INDEX "HallOfFameCategory_groupName_idx" ON "HallOfFameCategory"("groupName");

-- CreateIndex
CREATE INDEX "HallOfFameCategory_statType_idx" ON "HallOfFameCategory"("statType");

-- CreateIndex
CREATE INDEX "HallOfFameRecord_leagueId_season_idx" ON "HallOfFameRecord"("leagueId", "season");

-- CreateIndex
CREATE INDEX "HallOfFameRecord_categoryId_recordType_rank_idx" ON "HallOfFameRecord"("categoryId", "recordType", "rank");

-- CreateIndex
CREATE INDEX "HallOfFameRecord_rosterId_idx" ON "HallOfFameRecord"("rosterId");

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFameRecord_categoryId_leagueId_recordType_rank_key" ON "HallOfFameRecord"("categoryId", "leagueId", "recordType", "rank");

-- AddForeignKey
ALTER TABLE "HallOfFameRecord" ADD CONSTRAINT "HallOfFameRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HallOfFameCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallOfFameRecord" ADD CONSTRAINT "HallOfFameRecord_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallOfFameRecord" ADD CONSTRAINT "HallOfFameRecord_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
