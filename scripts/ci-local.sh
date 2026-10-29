#!/usr/bin/env bash
# Local CI for the Gauntlet website. GitHub-hosted Actions no longer run (founder,
# 2026-10-29); this script on the Studio is the gate. It runs the jobs the old
# workflows ran (ci.yml, quality-gates.yml, semgrep.yml) against the committed HEAD.
#
# Usage:
#   scripts/ci-local.sh                 run every job on HEAD
#   scripts/ci-local.sh --pr N --post-status
#                                       also post a `local-ci` commit status on HEAD,
#                                       which scripts/merge-pr.sh requires
#
# The tracked tree must be clean: the status claims a commit, so the run must test it.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

pr=""
post_status=false
while [ $# -gt 0 ]; do
  case "$1" in
    --pr) pr="$2"; shift 2 ;;
    --post-status) post_status=true; shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done
if $post_status && [ -z "$pr" ]; then
  echo "--post-status needs --pr N" >&2
  exit 2
fi
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Tracked changes are not committed. Commit them, then rerun." >&2
  exit 2
fi

sha="$(git rev-parse HEAD)"
repo="dmethi/gauntlet-website"
log_dir="$(mktemp -d "${TMPDIR:-/tmp}/gauntlet-ci.XXXXXX")"
failed=()
passed=()

post() { # state description
  $post_status || return 0
  gh api --method POST "repos/$repo/statuses/$sha" \
    -f state="$1" -f context=local-ci -f description="$2" >/dev/null
}

job() { # name command...
  local name="$1"; shift
  local log="$log_dir/$name.log"
  local start=$SECONDS
  if "$@" >"$log" 2>&1; then
    passed+=("$name")
    printf '  ok    %-22s %3ss\n' "$name" $((SECONDS - start))
  else
    failed+=("$name")
    printf '  FAIL  %-22s %3ss  (log: %s)\n' "$name" $((SECONDS - start)) "$log"
    tail -20 "$log" | sed 's/^/        /'
  fi
}

# Coverage thresholds per package (quality-gates.yml), each after its workspace deps build.
coverage() { # package
  pnpm --filter "$1^..." build && pnpm --filter "$1" test:coverage
}

semgrep_rules() {
  ci/semgrep/validate-rules.sh &&
    semgrep scan --strict --config .semgrep.yml --error --metrics=off \
      --disable-version-check --exclude ci/semgrep/fixtures
}

echo "local-ci on ${sha:0:12}${pr:+ (PR #$pr)}"
post pending "running on the Studio"

job install pnpm install --frozen-lockfile
if [ ${#failed[@]} -eq 0 ]; then
  job web-deps pnpm --filter "@gauntlet/web^..." build
  job type-check pnpm type-check
  job build pnpm build
  job coverage-web coverage @gauntlet/web
  job coverage-server coverage @gauntlet/server
  job coverage-sim-engine coverage @gauntlet/sim-engine
  job semgrep semgrep_rules
fi

if [ ${#failed[@]} -eq 0 ]; then
  echo "local-ci passed: ${#passed[@]} jobs."
  post success "${#passed[@]} jobs passed on the Studio"
  rm -rf "$log_dir"
else
  echo "local-ci failed: ${failed[*]}"
  post failure "failed: ${failed[*]}"
  exit 1
fi
