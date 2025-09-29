import { Facts, playoffWeight } from '@/lib/transactions-facts';
import { TeamInfo } from '../types';
import { GradeTxn } from '../types';
import { RawTxn } from '../types';

export async function computeTransactionGradesForStatsHub(
  transactions: RawTxn[],
  facts: Facts,
  leagueId: string,
  leagueName: string,
  teamsMap: Map<string, TeamInfo>,
  currentNflWeek: number = 3
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

  // Week-specific replacement levels (calculated earlier)
  const REPLACEMENT_LEVELS = {
    1: { QB: 20.1, RB: 7.4, WR: 9.1, TE: 9.1, DEF: 9.8 },
    2: { QB: 19.9, RB: 8.6, WR: 11.4, TE: 7.3, DEF: 10.6 },
    3: { QB: 14.6, RB: 7.5, WR: 10.7, TE: 8.1, DEF: 13.3 },
  } as const;

  // FAAB Cost Configuration (Based on sensitivity analysis)
  const FAAB_COST_COEFFICIENT = 0.25; // Optimal: 4% of budget = 1 VORP penalty (Moderate weighting)
  const LEAGUE_FAAB_BUDGET = 200; // Standard FAAB budget for this league

  const replacementLevels = new Map<string, number>();
  [1, 2, 3].forEach(week => {
    const levels = REPLACEMENT_LEVELS[week as keyof typeof REPLACEMENT_LEVELS];
    Object.entries(levels).forEach(([position, level]) => {
      replacementLevels.set(`${week}:${position}`, level);
      if (position === 'DEF') {
        replacementLevels.set(`${week}:DST`, level); // Handle DST alias
      }
    });
    // Add FLEX as average of RB+WR
    const flexLevel = (levels.RB + levels.WR) / 2;
    replacementLevels.set(`${week}:FLEX`, flexLevel);
  });

  // Date to NFL week mapping (2025 season)
  const getTransactionWeek = (iso: string): number => {
    const date = new Date(iso);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // For 2025 season (current season)
    // Precise NFL week boundaries for accurate transaction timing
    if (year === 2025) {
      if (month <= 8) return 0; // Preseason (Jan-Aug 2025)

      if (month === 9) {
        // September 2025 - be precise about week boundaries
        if (date.getDate() <= 5) return 0; // Before Week 1 (preseason)
        if (date.getDate() <= 9) return 1; // Week 1 (Sept 5-9)
        if (date.getDate() <= 16) return 2; // Week 2 (Sept 12-16)
        if (date.getDate() <= 23) return 3; // Week 3 (Sept 19-23)
        return 4; // Week 4 (Sept 26-30)
      }

      if (month === 10) return 6; // October 2025 = Week 5-8
      if (month === 11) return 10; // November 2025 = Week 9-13
      if (month === 12) return 15; // December 2025 = Week 14-18
      return 1; // Default to early season
    }

    // For 2024 (preseason transactions)
    if (year === 2024) {
      return 0; // All 2024 dates are preseason for 2025 season
    }

    // Default fallback
    return 0;
  };

  // Helper to calculate VORP for a player in a specific week
  const calculateVORP = (playerId: string, week: number): number => {
    const playerInfo = idToPlayer.get(playerId);
    const position = playerInfo?.position?.toUpperCase() || 'FLEX';
    const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
    const replacementLevel = replacementLevels.get(`${week}:${position}`) || 0;
    return points - replacementLevel;
  };

  // Only count completed weeks (1-3 currently)
  const completedWeeks = [1, 2, 3].filter(w => w <= currentNflWeek);

  // Helper function to process each roster's perspective in a trade
  async function processTransactionForRoster(
    t: RawTxn,
    rosterId: number,
    createdAt: string,
    startWeek: number,
    leagueId: string,
    leagueName: string,
    teamsMap: Map<string, TeamInfo>,
    faabCost: number = 0
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
      `[Trade Split] Roster ${rosterId}: +${addPairs.length} adds, -${dropPairs.length} drops`
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
        started: boolean;
        weight: number;
      }> = [];

      for (const week of completedWeeks) {
        if (week < startWeek) continue;

        const starters = f.weekRosterStarters.get(`${week}:${rId}`);
        const points = f.playerWeekPoints.get(`${week}:${playerId}`) || 0;
        const started = starters?.has(playerId) || false;

        console.log(
          `[Add Debug] ${playerInfo?.name} W${week}: ${points}pts, started=${started} by roster ${rId}`
        );

        if (started) {
          const vorp = calculateVORP(playerId, week);
          playerVORP += playoffWeight(week) * vorp;
          starts++;
          totalPoints += points;
        }

        weeklyPoints.push({
          week,
          points,
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
        started: boolean;
        weight: number;
      }> = [];

      for (const week of completedWeeks) {
        if (week < startWeek) {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: SKIPPED (before transaction week ${startWeek})`
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

        if (started) {
          const vorp = calculateVORP(playerId, week);
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: ${points}pts, VORP=${vorp.toFixed(1)}, started by roster ${starterRosterId}, transaction week was ${startWeek}`
          );
          playerVORP += playoffWeight(week) * vorp;
        } else {
          console.log(
            `[Drop Debug] ${playerInfo?.name} W${week}: ${points}pts, NOT STARTED (transaction week was ${startWeek})`
          );
        }

        weeklyPoints.push({
          week,
          points,
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
      `[FAAB Cost Debug] Transaction ${t.id}-${rosterId}: $${faabCost} (${faabPercentage.toFixed(1)}%) | Raw: ${rawScore.toFixed(1)} → Adj: ${score.toFixed(1)} | Penalty: ${costPenalty.toFixed(1)}`
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

  for (const t of validTransactions) {
    // Parse transaction date - API now returns proper Sleeper dates
    const createdAt =
      typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString();
    const transactionWeek = getTransactionWeek(createdAt);

    // Extract FAAB cost from transaction settings
    const faabCost = t.settings?.waiver_bid || 0; // Default to 0 for free agents/trades

    console.log(`[Date Debug] Transaction ${t.id}: ${createdAt} (Week ${transactionWeek})`);
    console.log(`[FAAB Debug] Transaction ${t.id}: FAAB cost = $${faabCost}, Type = ${t.type}`);

    // Start counting from Week 1 for preseason transactions, otherwise from transaction week
    const startWeek = Math.max(transactionWeek, 1);

    console.log(
      `[Transaction Debug] ID ${t.id}: Date ${createdAt}, Week ${transactionWeek}, Start Week ${startWeek}`
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
          faabCost // Pass FAAB cost (0 for trades)
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
        faabCost // Pass FAAB cost for waiver/free agent transactions
      );
      graded.push(gradedTransaction);
    }
  }

  return graded;
}
