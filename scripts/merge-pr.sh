#!/usr/bin/env bash
# Squash-merge a PR only when its exact head passed scripts/ci-local.sh.
# The gate is the newest `local-ci` commit status on the head SHA. The merge pins
# that SHA, so a push after the check cannot slip in.
#
# Usage: scripts/merge-pr.sh <pr number>
set -euo pipefail

pr="${1:?usage: scripts/merge-pr.sh <pr number>}"
repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

read -r state draft head branch <<<"$(gh pr view "$pr" -R "$repo" --json state,isDraft,headRefOid,headRefName \
  -q '[.state, .isDraft, .headRefOid, .headRefName] | @tsv')"
[ "$state" = OPEN ] || { echo "PR #$pr is $state." >&2; exit 1; }
[ "$draft" = false ] || { echo "PR #$pr is a draft." >&2; exit 1; }

ci="$(gh api "repos/$repo/commits/$head/statuses" \
  -q '[.[] | select(.context == "local-ci")][0].state // "missing"')"
if [ "$ci" != success ]; then
  echo "local-ci on ${head:0:12} is $ci. Run: scripts/ci-local.sh --pr $pr --post-status" >&2
  exit 1
fi

gh pr merge "$pr" -R "$repo" --squash --match-head-commit "$head"
gh api --method DELETE "repos/$repo/git/refs/heads/$branch" >/dev/null 2>&1 || true
echo "Merged PR #$pr at ${head:0:12}."
