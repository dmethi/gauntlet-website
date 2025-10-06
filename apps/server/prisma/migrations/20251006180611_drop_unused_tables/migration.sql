/*
  Warnings:

  - You are about to drop the `Draft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DraftPick` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HallOfFameCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HallOfFameRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `League` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeagueWeekSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Matchup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchupSimulation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchupSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayerSimulation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayerStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayerStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayerVariance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PositionVariance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectionError` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RosterWeekAggregate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeasonSuperlatives` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradedPick` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeeklyMetrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LeagueOwners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Draft" DROP CONSTRAINT "Draft_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "DraftPick" DROP CONSTRAINT "DraftPick_draftId_fkey";

-- DropForeignKey
ALTER TABLE "HallOfFameRecord" DROP CONSTRAINT "HallOfFameRecord_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "HallOfFameRecord" DROP CONSTRAINT "HallOfFameRecord_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "HallOfFameRecord" DROP CONSTRAINT "HallOfFameRecord_rosterId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueWeekSummary" DROP CONSTRAINT "LeagueWeekSummary_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "Matchup" DROP CONSTRAINT "Matchup_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "Matchup" DROP CONSTRAINT "Matchup_rosterId_fkey";

-- DropForeignKey
ALTER TABLE "MatchupOddsHistory" DROP CONSTRAINT "MatchupOddsHistory_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "MatchupSimulation" DROP CONSTRAINT "MatchupSimulation_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "MatchupSummary" DROP CONSTRAINT "MatchupSummary_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "MatchupSummary" DROP CONSTRAINT "MatchupSummary_rosterAId_fkey";

-- DropForeignKey
ALTER TABLE "MatchupSummary" DROP CONSTRAINT "MatchupSummary_rosterBId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerSimulation" DROP CONSTRAINT "PlayerSimulation_matchupSimulationId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerStatusHistory" DROP CONSTRAINT "PlayerStatusHistory_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Roster" DROP CONSTRAINT "Roster_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "Roster" DROP CONSTRAINT "Roster_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "RosterWeekAggregate" DROP CONSTRAINT "RosterWeekAggregate_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "RosterWeekAggregate" DROP CONSTRAINT "RosterWeekAggregate_opponentRosterId_fkey";

-- DropForeignKey
ALTER TABLE "RosterWeekAggregate" DROP CONSTRAINT "RosterWeekAggregate_rosterId_fkey";

-- DropForeignKey
ALTER TABLE "SeasonSuperlatives" DROP CONSTRAINT "SeasonSuperlatives_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "SeasonSuperlatives" DROP CONSTRAINT "SeasonSuperlatives_rosterId_fkey";

-- DropForeignKey
ALTER TABLE "TradedPick" DROP CONSTRAINT "TradedPick_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "TradedPick" DROP CONSTRAINT "TradedPick_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyMetrics" DROP CONSTRAINT "WeeklyMetrics_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyMetrics" DROP CONSTRAINT "WeeklyMetrics_rosterId_fkey";

-- DropForeignKey
ALTER TABLE "_LeagueOwners" DROP CONSTRAINT "_LeagueOwners_A_fkey";

-- DropForeignKey
ALTER TABLE "_LeagueOwners" DROP CONSTRAINT "_LeagueOwners_B_fkey";

-- DropTable
DROP TABLE "Draft";

-- DropTable
DROP TABLE "DraftPick";

-- DropTable
DROP TABLE "HallOfFameCategory";

-- DropTable
DROP TABLE "HallOfFameRecord";

-- DropTable
DROP TABLE "League";

-- DropTable
DROP TABLE "LeagueWeekSummary";

-- DropTable
DROP TABLE "Matchup";

-- DropTable
DROP TABLE "MatchupSimulation";

-- DropTable
DROP TABLE "MatchupSummary";

-- DropTable
DROP TABLE "Player";

-- DropTable
DROP TABLE "PlayerSimulation";

-- DropTable
DROP TABLE "PlayerStats";

-- DropTable
DROP TABLE "PlayerStatusHistory";

-- DropTable
DROP TABLE "PlayerVariance";

-- DropTable
DROP TABLE "PositionVariance";

-- DropTable
DROP TABLE "ProjectionError";

-- DropTable
DROP TABLE "Roster";

-- DropTable
DROP TABLE "RosterWeekAggregate";

-- DropTable
DROP TABLE "SeasonSuperlatives";

-- DropTable
DROP TABLE "TradedPick";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "WeeklyMetrics";

-- DropTable
DROP TABLE "_LeagueOwners";
