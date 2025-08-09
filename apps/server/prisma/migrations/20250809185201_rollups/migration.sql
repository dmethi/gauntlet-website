/*
  Warnings:

  - The primary key for the `_LeagueOwners` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_LeagueOwners` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MatchupSummary" DROP CONSTRAINT "MatchupSummary_winnerRosterId_fkey";

-- AlterTable
ALTER TABLE "_LeagueOwners" DROP CONSTRAINT "_LeagueOwners_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_LeagueOwners_AB_unique" ON "_LeagueOwners"("A", "B");
