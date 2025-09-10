# 🚀 Gauntlet Scripts Guide

This guide documents the essential scripts for maintaining the Gauntlet website without needing Cursor.

## 📊 Data Ingestion Scripts

### 1. **Ingest Latest Roster/Starter Data**

Updates roster compositions, starters, and current season data from Sleeper API.

```bash
# Navigate to server directory
cd apps/server

# Ingest current season data (rosters, starters, matchups, users)
npm run ingest:current

# Alternative: Manual command
npx tsx src/scripts/ingest-current-season.ts
```

**What it does:**
- ✅ Fetches latest rosters from both Gauntlet leagues
- ✅ Updates player lineups and starter selections  
- ✅ Ingests recent matchup results
- ✅ Updates user profiles and team metadata
- ✅ Syncs transactions from past few weeks

**When to run:** Before simulations, after lineup changes, or weekly updates

---

### 2. **Full Data Ingestion** (Use Carefully)

Complete data refresh - use only when needed.

```bash
cd apps/server

# Full historical data ingestion
npm run ingest:all


# Or with environment variables
INGEST_LEAGUE_ID=1263740549504962561 INGEST_SEASON=2025 INGEST_WEEKS=1-18 npx tsx src/scripts/data-ingestion/index.ts
```

**Environment Variables:**
- `INGEST_LEAGUE_ID`: Specific league ID to ingest
- `INGEST_SEASON`: Season year (default: 2025)  
- `INGEST_WEEKS`: Week range (e.g., "1-18" or "1,2,3")

---

## 🎲 Simulation Scripts  

### 3. **Run Batch Simulations for Updated Odds**

Generates fresh simulation data and betting odds for current week.

```bash
cd apps/server

# Run simulations for current week (auto-detected from Sleeper)
npx tsx src/scripts/jobs/run-batch-simulations.ts

# Run for specific week  
npx tsx src/scripts/jobs/run-batch-simulations.ts 2

# Run for specific week + league
npx tsx src/scripts/jobs/run-batch-simulations.ts 2 1263740549504962561

# Run LIVE simulations (during games)
npx tsx src/scripts/jobs/run-batch-simulations.ts --live --trigger=manual
```

**Parameters:**
- First argument: Week number (defaults to current NFL week)
- Second argument: Specific league ID (optional)
- `--live`: Enable live mode with real-time game data
- `--trigger=manual`: Set trigger type for logging

**What it generates:**
- ✅ Individual matchup simulations with win probabilities
- ✅ Player score distributions and confidence intervals
- ✅ Betting lines (spread, total, moneyline)
- ✅ League-wide odds (highest scorer, lowest scorer)
- ✅ Closest/biggest blowout matchup probabilities

**Duration:** ~2-5 minutes per league (100,000 iterations per matchup)

---

### 4. **Live Simulations** (During Games)

Real-time updates during NFL game days.

```bash
cd apps/server

# Run live simulations with current game states
npm run live-sims

# Alternative 
npx tsx src/scripts/jobs/run-live-sims.ts
```

**When to use:** During NFL games for real-time win probability updates

---

## 🛠 Utility Scripts

### 5. **Database Recovery** (Emergency)

If database gets corrupted or needs full rebuild.

```bash
cd apps/server

# Run full database recovery process
npx tsx src/scripts/recover-database.ts
```

**⚠️ Warning:** This rebuilds entire database - use only in emergencies

---

### 6. **Verify Roster Alignment** (Debug)

Compares Sleeper API data with database data to identify discrepancies.

```bash
cd apps/server

# Verify current week alignment (auto-detects from Sleeper)
npx tsx src/scripts/debug/verify-roster-alignment.ts

# Verify specific week
npx tsx src/scripts/debug/verify-roster-alignment.ts 2

# Check what the script will examine:
# - Roster players: Sleeper vs Database
# - Starter lineups: Sleeper vs Database  
# - Team ownership/names: Sleeper vs Database
```

**What it shows:**
- ✅ **Perfect alignment**: All data matches Sleeper
- ❌ **Mismatches found**: Shows exactly what's different
- 🛠️ **Recommended fixes**: Suggests specific commands to run

**When to use:**
- After ingestion if data looks wrong
- Before simulations to ensure accuracy  
- When projections don't match expectations
- Debugging roster/lineup issues

**⚠️ Example output when misaligned:**
```
❌ STARTER MISMATCH - dmethi (Matchup 6)
   Sleeper: 9 starters, Database: 8 starters
   ➕ Only in Sleeper (1):
      • Jayden Daniels (11566)
   ➖ Only in Database (0):
      (none)
```

---

### 7. **Ingest Current Matchups** (Starter Fix)

Updates just the current week's matchup data including fresh starter lineups.

```bash
cd apps/server

# Ingest current week matchups (auto-detects from Sleeper)  
npx tsx src/scripts/ingest-current-matchups.ts

# Ingest specific week matchups
npx tsx src/scripts/ingest-current-matchups.ts 2
```

**What it does:**
- ✅ Fetches current week matchup data from Sleeper
- ✅ Updates starter lineups for all teams
- ✅ Syncs player points and scoring data
- ✅ Fixes starter misalignments without full data rebuild

**When to use:**
- After lineup changes during the week
- When starters don't match Sleeper app
- Quick fix for projection discrepancies
- Before simulations when lineup verification fails

---

### 8. **Compute Weekly Rollups**

Generates summary statistics and metrics.

```bash
cd apps/server

# Compute weekly rollups and metrics
npm run rollups:compute

# Environment variables
ROLLUP_LEAGUE_ID=1263740549504962561 ROLLUP_SEASON=2025 npm run rollups:compute
```

---

## 📋 Typical Weekly Workflow

### **Before Week Starts:**
1. Update roster data: `npm run ingest:current`
2. Run simulations: `npx tsx src/scripts/jobs/run-batch-simulations.ts`

### **During Games (Sunday):**
1. Run live sims: `npm run live-sims`  
2. Re-run batch sims: `npx tsx src/scripts/jobs/run-batch-simulations.ts --live`

### **After Week Ends:**
1. Final data sync: `npm run ingest:current`
2. Compute rollups: `npm run rollups:compute`

---

## 🚨 Troubleshooting

### **Simulations returning 404s:**
- Run `npm run ingest:current` first
- Then `npx tsx src/scripts/jobs/run-batch-simulations.ts [WEEK]`

### **Stale odds/probabilities:**  
- Clear browser cache (Cmd+Shift+R)
- Re-run simulations for current week

### **Wrong players showing in lineups:**
- Run roster alignment check: `npx tsx src/scripts/debug/verify-roster-alignment.ts`
- If misaligned, run: `npm run ingest:current`
- Re-run simulations: `npx tsx src/scripts/jobs/run-batch-simulations.ts [WEEK]`

### **Projections don't match Sleeper:**
- Verify data alignment: `npx tsx src/scripts/debug/verify-roster-alignment.ts`
- Check for roster/starter differences
- Re-ingest if needed: `npm run ingest:current`

### **Database connection issues:**
- Check `.env` file in `apps/server/`
- Ensure PostgreSQL is running
- Try `npx prisma studio` to test connection

### **Missing player data:**
- Run full ingestion: `npm run ingest:all`  
- Wait 5-10 minutes for complete data sync

---

## 📁 Script Locations

All scripts located in: `apps/server/src/scripts/`

- **Data Ingestion:** `ingest-current-season.ts`, `ingest-current-matchups.ts`, `data-ingestion/index.ts`
- **Simulations:** `jobs/run-batch-simulations.ts`, `jobs/run-live-sims.ts`  
- **Analysis:** `analysis/compute-weekly-rollups.ts`
- **Debug:** `debug/verify-roster-alignment.ts`
- **Utilities:** `recover-database.ts`, `hydrate-weekly-metrics.ts`

---

**💡 Pro Tip:** Always run `npm run ingest:current` before simulations to ensure you have the latest roster/lineup data!
