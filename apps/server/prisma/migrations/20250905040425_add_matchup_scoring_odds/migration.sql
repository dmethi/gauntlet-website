-- AlterTable
ALTER TABLE "LeagueOddsHistory" ADD COLUMN     "highestScoringMatchup" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "lowestScoringMatchup" JSONB NOT NULL DEFAULT '[]';
