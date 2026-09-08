-- Keep legacy 2025 snapshots addressable while allowing each new season's
-- league-wide race history to be queried independently.
ALTER TABLE "LeagueOddsHistory"
ADD COLUMN "season" INTEGER NOT NULL DEFAULT 2025;

DROP INDEX IF EXISTS "LeagueOddsHistory_week_idx";

CREATE INDEX "LeagueOddsHistory_season_week_idx"
ON "LeagueOddsHistory"("season", "week");
