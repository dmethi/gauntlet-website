#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
result_file="$(mktemp)"
safe_result_file="$(mktemp)"
trap 'rm -f "$result_file" "$safe_result_file"' EXIT

cd "$repo_root"
semgrep_python="$(head -n 1 "$(command -v semgrep)")"
semgrep_python="${semgrep_python#\#!}"
"$semgrep_python" ci/semgrep/validate-config.py .semgrep.yml
if "$semgrep_python" ci/semgrep/validate-config.py ci/semgrep/fixtures/invalid-config.yml \
  >/dev/null 2>&1; then
  printf 'Semgrep schema regression fixture was unexpectedly accepted\n' >&2
  exit 1
fi
semgrep scan --strict --config .semgrep.yml --json --metrics=off --disable-version-check \
  ci/semgrep/fixtures >"$result_file"
semgrep scan --strict --config .semgrep.yml --json --metrics=off --disable-version-check \
  ci/semgrep/fixtures/safe.ts >"$safe_result_file"

python3 - "$result_file" <<'PY'
import json
import sys

expected = {
    "gauntlet.no-direct-cron-secret-comparison",
    "gauntlet.require-gemini-output-bound",
    "gauntlet.require-gemini-output-bound-variable",
    "gauntlet.no-secret-default",
    "gauntlet.no-secret-default-through-env-alias",
    "gauntlet.no-indirect-cron-secret-comparison",
    "gauntlet.no-expected-header-cron-secret-comparison",
}
with open(sys.argv[1], encoding="utf-8") as result:
    found = {item["check_id"] for item in json.load(result)["results"]}
missing = expected - found
if missing:
    raise SystemExit(f"Semgrep regression fixtures missed rules: {sorted(missing)}")
print(f"Semgrep rule fixtures passed ({len(expected)} rules).")
PY

python3 - "$safe_result_file" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as result:
    findings = json.load(result)["results"]
if findings:
    raise SystemExit(
        "Semgrep safe regression fixture produced findings: "
        f"{sorted(item['check_id'] for item in findings)}"
    )
print("Semgrep safe regression fixture passed (0 findings).")
PY
