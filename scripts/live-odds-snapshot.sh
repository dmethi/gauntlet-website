#!/usr/bin/env bash
# Live odds snapshot (was .github/workflows/live-odds-updates.yml.disabled, which ran
# every 10 minutes during NFL game windows). Reads league odds from the production
# site and Sleeper, and writes a LiveWinProbSample row to the historical database.
# Needs DATABASE_URL for that database in the environment.
#
# Usage: DATABASE_URL=... scripts/live-odds-snapshot.sh
set -euo pipefail

: "${DATABASE_URL:?set DATABASE_URL to the historical database}"
cd "$(git rev-parse --show-toplevel)"
pnpm install --frozen-lockfile
pnpm --filter @gauntlet/server exec prisma generate --schema=prisma/schema-historical.prisma
pnpm --filter @gauntlet/server live-snapshot
