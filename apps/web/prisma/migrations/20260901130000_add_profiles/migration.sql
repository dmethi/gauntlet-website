-- Member profiles are application-owned; Clerk remains the source of truth for authentication.
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "sleeperUserId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "rosterId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "city" TEXT,
    "favoriteNflTeam" TEXT,
    "favoritePlayer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Profile_clerkUserId_key" ON "Profile"("clerkUserId");
CREATE UNIQUE INDEX "Profile_sleeperUserId_key" ON "Profile"("sleeperUserId");
CREATE INDEX "Profile_leagueId_rosterId_idx" ON "Profile"("leagueId", "rosterId");
