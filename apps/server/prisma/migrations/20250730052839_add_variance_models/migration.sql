-- CreateTable
CREATE TABLE "public"."PositionVariance" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "meanError" DOUBLE PRECISION NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PositionVariance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerVariance" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "meanError" DOUBLE PRECISION NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerVariance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectionError" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "projectedPoints" DOUBLE PRECISION NOT NULL,
    "actualPoints" DOUBLE PRECISION NOT NULL,
    "normalizedError" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectionError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PositionVariance_position_idx" ON "public"."PositionVariance"("position");

-- CreateIndex
CREATE UNIQUE INDEX "PositionVariance_position_season_key" ON "public"."PositionVariance"("position", "season");

-- CreateIndex
CREATE INDEX "PlayerVariance_playerId_idx" ON "public"."PlayerVariance"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerVariance_playerId_season_key" ON "public"."PlayerVariance"("playerId", "season");

-- CreateIndex
CREATE INDEX "ProjectionError_playerId_idx" ON "public"."ProjectionError"("playerId");

-- CreateIndex
CREATE INDEX "ProjectionError_season_week_idx" ON "public"."ProjectionError"("season", "week");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectionError_playerId_week_season_key" ON "public"."ProjectionError"("playerId", "week", "season");
