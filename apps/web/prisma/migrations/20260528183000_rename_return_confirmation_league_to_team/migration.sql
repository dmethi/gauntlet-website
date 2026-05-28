-- Rename old league field to team for returning-manager confirmations.
ALTER TABLE "ReturnConfirmation"
RENAME COLUMN "league" TO "team";
