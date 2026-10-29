# Gauntlet Deployment Guide

The current runbook is
[`docs/runbooks/deployment.md`](docs/runbooks/deployment.md). This page is a
short summary.

## How It Runs

```
Merge to main (scripts/merge-pr.sh) → Vercel Git integration → gauntletff.com
driveFF scheduler                   → live-odds feed read by API routes
cron-job.org                        → POST /api/cron/recap-report
Manual scripts                      → variance data, backup odds snapshots
```

- **Deploys**: Vercel builds every pushed branch as a preview and deploys `main`
  to production. No GitHub Actions run.
- **CI**: `scripts/ci-local.sh --pr <N> --post-status` on the Mac Studio, then
  `scripts/merge-pr.sh <N>`. See "CI runs locally" in `docs/AGENTS.md`.
- **Variance models**: run `scripts/update-variance-models.sh` weekly after
  Monday Night Football. It needs no secrets and doesn't commit. Review the diff
  and open a PR.
- **Live odds backup**: run `DATABASE_URL=... scripts/live-odds-snapshot.sh`
  only for manual recovery. It writes `LiveWinProbSample` rows to the historical
  database.

## Storage

PostgreSQL (Prisma)

- Core domain models (League, Roster, Matchup, Player, PlayerStats)
- Variance models (PositionVariance, PlayerVariance)
- Live win-prob snapshots (LiveWinProbSample)
