import { Facts, playoffWeight } from '@/features/transactions/utils';
import { TeamInfo } from '../types';
import { GradeTxn } from '../types';
import { RawTxn } from '../types';

export async function computeTransactionGradesForStatsHub(
  transactions: RawTxn[],
  facts: Facts,
  leagueId: string,
  leagueName: string,
  teamsMap: Map<string, TeamInfo>,
  currentNflWeek: number = 3,
): Promise<GradeTxn[]> {
  if (transactions.length === 0) {
    return [];
  }

  const f = facts;
  const graded: GradeTxn[] = [];

  // Build player info lookup
  const idToPlayer = new Map<string, { name: string; position: string }>();
  transactions.forEach(t => {
    [t.adds, t.drops].forEach(group => {
      if (group && Array.isArray(group)) {
        group.forEach(item => {
          item.players?.forEach(p => {
            idToPlayer.set(p.id, { name: p.fullName || p.id, position: p.position || 'UNK' });
          });
        });
      }
    });
  });

  // FAAB Cost Configuration (Based on sensitivity analysis)
  const FAAB_COST_COEFFICIENT = 0.25; // Optimal: 4% of budget = 1 VORP penalty (Moderate weighting)
  const LEAGUE_FAAB_BUDGET = 200; // Standard FAAB budget for this league

  // Use dynamic weeks from facts instead of hardcoding
  const completedWeeks = facts.weeks.filter(w => w <= currentNflWeek);
  console.log(
    `[Transaction Grading] Processing weeks: ${completedWeeks.join(', ')} (current NFL week: ${currentNflWeek})`,
  );

  // Calculate dynamic replacement levels from facts data
  // We use median of ALL starters as a universal replacement level (not position-specific)
  const replacementLevels = new Map<string, number>();

  if (facts.replacementByWeekPos && facts.replacementByWeekPos.size > 0) {
    // Copy replacement levels from facts (stored as ${week}:ALL_STARTERS)
    for (const [key, value] of facts.replacementByWeekPos.entries()) {
      replacementLevels.set(key, value);
      console.log(
        `[Replacement Levels] Week ${key.split(':')[0]}: ${value.toFixed(2)} pts (median of all starters)`,
      );
    }
  }

  console.log(
    `[Replacement Levels] Loaded ${replacementLevels.size} week-level replacement values`,
  );

  // Date to NFL week mapping (2025 season)
  // Returns the FIRST WEEK where an added player can contribute points
  // Rule: Transactions ON/AFTER Tuesday exclude that week (games already finished Monday)
  const getTransactionWeek = (iso: string): number => {
    const transactionDate = new Date(iso);

    // 2025 NFL Season: Week 1 starts Thursday Sept 5, 2025
    // Tuesday boundaries: When previous week's games are complete
    const SEASON_START = new Date('2025-09-05T00:00:00-04:00');
    const TUESDAY_SEPT_9 = new Date('2025-09-09T00:00:00-04:00'); // Week 2 starts

    if (transactionDate < SEASON_START) {
      return 0; // Preseason
    }

    if (transactionDate < TUESDAY_SEPT_9) {
      return 1; // Before Sept 9 Tuesday → include Week 1
    }

    // Calculate weeks from first Tuesday boundary
    // Each week period = 7 days (Tuesday to Tuesday)
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
    const msSinceFirstTuesday = transactionDate.getTime() - TUESDAY_SEPT_9.getTime();
    const weeksSinceFirstBoundary = Math.floor(msSinceFirstTuesday / MS_PER_WEEK);

    // Transaction on/after Tuesday → start counting from NEXT week
    // Sept 9-15: Week 2 (skip Week 1, which ended Sept 8)
    // Sept 16-22: Week 3 (skip Week 2, which ended Sept 15)
    // Sept 23-29: Week 4 (skip Week 3, which ended Sept 22)
    const week = 2 + weeksSinceFirstBoundary;

    // Cap at 18 (regular season end)
    return Math.min(18, week);
  };

  // Helper to calculate VORP for a player in a specific week
  const calculateVORP = (playerId: string, week: number): number => {
    const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
    // Use the ALL_STARTERS median as replacement level (same for all positions)
    const replacementLevel = replacementLevels.get(`${week}:ALL_STARTERS`) || 0;
    const vorp = points - replacementLevel;
    return vorp;
  };

  // Helper function to process each roster's perspective in a trade
  async function processTransactionForRoster(
    t: RawTxn,
    rosterId: number,
    createdAt: string,
    startWeek: number,
    leagueId: string,
    leagueName: string,
    teamsMap: Map<string, TeamInfo>,
    faabCost: number = 0,
  ): Promise<GradeTxn> {
    const playersOut: GradeTxn['players'] = [];
    let totalAddedVORP = 0;
    let totalDroppedVORP = 0;

    // For THIS roster, get their specific adds (what they received in the trade)
    const addPairs: Array<{ rosterId: number; playerId: string }> = [];
    if (t.adds && Array.isArray(t.adds)) {
      t.adds
        .filter(a => a.rosterId === rosterId) // Only adds for this specific roster
        .forEach(a => a.players?.forEach(p => addPairs.push({ rosterId, playerId: p.id })));
    }

    // For THIS roster, get their specific drops (what they gave up in the trade)
    const dropPairs: Array<{ rosterId: number; playerId: string }> = [];
    if (t.drops && Array.isArray(t.drops)) {
      t.drops
        .filter(d => d.rosterId === rosterId) // Only drops for this specific roster
        .forEach(d => d.players?.forEach(p => dropPairs.push({ rosterId, playerId: p.id })));
    }

    console.log(
      `[Trade Split] Roster ${rosterId}: +${addPairs.length} adds, -${dropPairs.length} drops`,
    );

    // Process added players (same logic as before)
    for (const { rosterId: rId, playerId } of addPairs) {
      const playerInfo = idToPlayer.get(playerId);
      let playerVORP = 0;
      let starts = 0;
      let totalPoints = 0;

      const weeklyPoints: Array<{
        week: number;
        points: number;
        replacementLevel?: number;
        vorp?: number;
        started: boolean;
        weight: number;
      }> = [];

      for (const week of completedWeeks) {
        if (week < startWeek) continue;

        const starters = f.weekRosterStarters.get(`${week}:${rId}`);
        const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
        const started = starters?.has(playerId) || false;

        console.log(
          `[Add Debug] ${playerInfo?.name} W${week}: ${points}pts, started=${started} by roster ${rId}`,
        );

        const vorp = calculateVORP(playerId, week);
        const replacementLevel = replacementLevels.get(`${week}:ALL_STARTERS`) || 0;

        if (started) {
          playerVORP += playoffWeight(week) * vorp;
          starts++;
          totalPoints += points;
        }

        weeklyPoints.push({
          week,
          points,
          replacementLevel,
          vorp,
          started,
          weight: playoffWeight(week),
        });
      }

      totalAddedVORP += playerVORP;

      playersOut.push({
        playerId,
        name: playerInfo?.name || playerId,
        position: playerInfo?.position || 'UNK',
        role: 'add' as const,
        pre: { ppg: 0, pps: 0, total: 0 },
        post: { poPts: 0 },
        forYou: {
          starts,
          points: totalPoints,
          weightedPoints: playerVORP,
        },
        weeklyPoints,
      });
    }

    // Process dropped players (same logic as before)
    for (const { playerId } of dropPairs) {
      const playerInfo = idToPlayer.get(playerId);
      let playerVORP = 0;

      const weeklyPoints: Array<{
        week: number;
        points: number;
        replacementLevel?: number;
        vorp?: number;
        started: boolean;
        weight: number;
      }> = [];

      for (const week of completedWeeks) {
        if (week < startWeek) {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: SKIPPED (before transaction week ${startWeek})`,
          );
          continue;
        }

        const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
        let started = false;
        let starterRosterId = null;

        for (const [rosterKey, starters] of f.weekRosterStarters.entries()) {
          const [weekStr, rosterIdStr] = rosterKey.split(':');
          if (Number(weekStr) === week && starters.has(playerId)) {
            started = true;
            starterRosterId = Number(rosterIdStr);
            break;
          }
        }

        const vorp = calculateVORP(playerId, week);
        const replacementLevel = replacementLevels.get(`${week}:ALL_STARTERS`) || 0;

        if (started) {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: ${points}pts, VORP=${vorp.toFixed(1)}, started by roster ${starterRosterId}, transaction week was ${startWeek}`,
          );
          playerVORP += playoffWeight(week) * vorp;
        } else {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: ${points}pts, NOT STARTED (transaction week was ${startWeek})`,
          );
        }

        weeklyPoints.push({
          week,
          points,
          replacementLevel,
          vorp,
          started,
          weight: playoffWeight(week),
        });
      }

      totalDroppedVORP += playerVORP;

      playersOut.push({
        playerId,
        name: playerInfo?.name || playerId,
        position: playerInfo?.position || 'UNK',
        role: 'drop' as const,
        pre: { ppg: 0, pps: 0, total: 0 },
        post: { poPts: 0 },
        afterDrop: {
          selfHarm: 0,
          oppHarm: playerVORP,
          selfHarmWeighted: 0,
          oppHarmWeighted: playerVORP,
        },
        weeklyPoints,
      });
    }

    // Calculate raw VORP score (before cost adjustment)
    const rawScore = totalAddedVORP - totalDroppedVORP;

    // Calculate FAAB cost penalty using optimal weighting from sensitivity analysis
    const faabPercentage = (faabCost / LEAGUE_FAAB_BUDGET) * 100;
    const costPenalty = faabPercentage * FAAB_COST_COEFFICIENT;

    // Final cost-adjusted score
    const score = rawScore - costPenalty;

    console.log(
      `[FAAB Cost Debug] Transaction ${t.id}-${rosterId}: $${faabCost} (${faabPercentage.toFixed(1)}%) | Raw: ${rawScore.toFixed(1)} → Adj: ${score.toFixed(1)} | Penalty: ${costPenalty.toFixed(1)}`,
    );

    const teamKey = `${leagueId}-${rosterId}`;
    const teamInfo = teamsMap.get(teamKey);

    return {
      id: `${t.id}-${rosterId}`, // Make unique ID for each roster's perspective
      type: t.type,
      createdAt,
      rosterIds: [rosterId], // Only this roster
      leagueId,
      leagueName,
      teamName: teamInfo?.teamName,
      faabCost, // FAAB spent on this transaction
      rawScore, // Original VORP before cost adjustment
      costPenalty, // FAAB penalty applied
      players: playersOut,
      score, // Final cost-adjusted score
      grade: 'N/A', // Will be calculated later
    };
  }

  // Process each completed transaction
  const validTransactions = transactions.filter(t => t.status === 'complete');

  console.log(
    `[Transaction Processing] Starting to process ${validTransactions.length} completed transactions`,
  );
  console.log(
    `[Transaction Processing] League: ${leagueName}, Weeks available: ${completedWeeks.join(', ')}`,
  );

  for (const t of validTransactions) {
    // Parse transaction date - API now returns proper Sleeper dates
    const createdAt =
      typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString();
    const transactionWeek = getTransactionWeek(createdAt);

    // Extract FAAB cost from transaction settings
    const faabCost = t.settings?.waiver_bid || 0; // Default to 0 for free agents/trades

    // Debug transaction details
    const addPlayers = t.adds?.flatMap(a => a.players?.map(p => p.fullName || p.id) || []) || [];
    const dropPlayers = t.drops?.flatMap(d => d.players?.map(p => p.fullName || p.id) || []) || [];
    const rosterIds = t.rosterIds || [];

    console.log(
      `[Transaction ${t.id}] Type: ${t.type}, Week: ${transactionWeek}, Date: ${createdAt}`,
    );
    console.log(
      `  └─ Rosters: ${rosterIds.join(', ')}, Adds: ${addPlayers.length}, Drops: ${dropPlayers.length}`,
    );
    if (addPlayers.length > 0) console.log(`  └─ Added: ${addPlayers.join(', ')}`);
    if (dropPlayers.length > 0) console.log(`  └─ Dropped: ${dropPlayers.join(', ')}`);
    console.log(`  └─ FAAB: $${faabCost}`);

    // Start counting from Week 1 for preseason transactions, otherwise from transaction week
    const startWeek = Math.max(transactionWeek, 1);

    console.log(
      `[Transaction Debug] ID ${t.id}: Date ${createdAt}, Week ${transactionWeek}, Start Week ${startWeek}`,
    );

    // 🔄 TRADE PROCESSING: Create separate transactions for each owner in a trade
    if (t.type === 'trade') {
      // Identify all unique roster IDs involved in this trade
      const uniqueRosterIds = new Set([
        ...(t.adds?.map(a => a.rosterId) || []),
        ...(t.drops?.map(d => d.rosterId) || []),
      ]);

      console.log(`[Trade Split] Transaction ${t.id}: ${uniqueRosterIds.size} owners involved`);
      console.log(`[Trade Split] Unique roster IDs:`, Array.from(uniqueRosterIds));

      // Create separate transaction for each owner
      for (const rosterId of uniqueRosterIds) {
        const gradedTransaction = await processTransactionForRoster(
          t,
          rosterId,
          createdAt,
          startWeek,
          leagueId,
          leagueName,
          teamsMap,
          faabCost, // Pass FAAB cost (0 for trades)
        );
        graded.push(gradedTransaction);
      }

      // Skip the regular processing for trades - we've handled it above
      continue;
    }

    // Regular (non-trade) transaction processing - use the same helper for consistency
    const rosterId = t.rosterIds?.[0];
    if (rosterId) {
      const gradedTransaction = await processTransactionForRoster(
        t,
        rosterId,
        createdAt,
        startWeek,
        leagueId,
        leagueName,
        teamsMap,
        faabCost, // Pass FAAB cost for waiver/free agent transactions
      );
      graded.push(gradedTransaction);
    }
  }

  return graded;
}
