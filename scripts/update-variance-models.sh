#!/usr/bin/env bash
# Weekly variance-model refresh (was .github/workflows/update-variance-models.yml,
# Tuesdays 07:00 UTC). Pulls last week's stats from the public Sleeper API and
# rewrites apps/sim-engine/src/data/variance-data.json. Needs no secrets.
# It does not commit: review the diff, then commit and open a PR as usual.
#
# Usage: scripts/update-variance-models.sh
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
pnpm install --frozen-lockfile
pnpm build --filter @gauntlet/sim-engine --filter @gauntlet/server
NODE_ENV=production pnpm --filter @gauntlet/server run update-variance
git status --short -- apps/sim-engine/src/data/variance-data.json apps/sim-engine/src/data/players-cache.json
