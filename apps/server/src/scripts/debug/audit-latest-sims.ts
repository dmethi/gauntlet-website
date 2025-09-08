import prisma from '../../lib/prisma.js';

/**
 * Audit the latest stored matchup simulations and compare to current matchup points
 * Usage: tsx src/scripts/debug/audit-latest-sims.ts <week> [leagueId] [matchupId]
 */
async function main() {
  const [weekArg, leagueIdArg, matchupIdArg] = process.argv.slice(2);
  const week = weekArg ? Number(weekArg) : 1;
  const leagueIds = leagueIdArg ? [leagueIdArg] : ['1263744209295245312', '1263740549504962561']; // AFC, NFC
  const targetMatchupId = matchupIdArg ? Number(matchupIdArg) : undefined;

  console.log(`\n🔎 Auditing latest simulations for week ${week}`);

  for (const leagueId of leagueIds) {
    console.log(`\n===== League ${leagueId} =====`);

    // Find target matchup ids for the league/week
    const matchupRows = await prisma.matchup.findMany({
      where: { leagueId, week, ...(targetMatchupId ? { matchupId: targetMatchupId } : {}) },
      select: { matchupId: true },
      orderBy: { matchupId: 'asc' },
    });
    const matchupIds = [
      ...new Set(matchupRows.map(r => r.matchupId).filter((m): m is number => m != null)),
    ];

    if (matchupIds.length === 0) {
      console.log('No matchups found.');
      continue;
    }

    for (const matchupId of matchupIds) {
      console.log(`\n→ Matchup ${matchupId}`);

      // Get latest stored sims
      const sims = await (prisma as any).matchupSimulation.findMany({
        where: { leagueId, week, matchupId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (sims.length === 0) {
        console.log('  ⚠️ No stored simulations found.');
        continue;
      }

      // Get current matchup points and per-team playersPoints
      const teams = await prisma.matchup.findMany({
        where: { leagueId, week, matchupId },
        orderBy: { rosterId: 'asc' },
      });

      if (teams.length !== 2) {
        console.log(`  ⚠️ Expected 2 teams, found ${teams.length}. Skipping.`);
        continue;
      }

      const teamLiveTotals = teams.map(t => Number(t.points || 0));
      const teamPlayersSum = teams.map(t => {
        const pp = (t.playersPoints as Record<string, number>) || {};
        return Object.values(pp).reduce((s, v) => s + (Number(v) || 0), 0);
      });

      console.log(
        `  📊 Current DB scores: Team1=${teamLiveTotals[0].toFixed(2)}, Team2=${teamLiveTotals[1].toFixed(2)} (players sum: ${teamPlayersSum[0].toFixed(2)} | ${teamPlayersSum[1].toFixed(2)})`
      );

      // Print the latest 5 sims summary
      sims.forEach((sim: any, idx: number) => {
        const stamp = new Date(sim.createdAt).toISOString();
        const a = Number(sim.teamAMean || 0);
        const b = Number(sim.teamBMean || 0);
        const aDiff = a - teamLiveTotals[0];
        const bDiff = b - teamLiveTotals[1];
        console.log(
          `  ${idx + 1}. ${stamp}  mean A=${a.toFixed(2)} (Δ${aDiff.toFixed(2)}), B=${b.toFixed(2)} (Δ${bDiff.toFixed(2)})  win% A=${(sim.teamAWinPct * 100).toFixed(1)} B=${(sim.teamBWinPct * 100).toFixed(1)}`
        );
      });

      // Flag if latest row appears inflated vs exact scores (simple heuristic)
      const latest = sims[0];
      const inflatedA = Math.abs(Number(latest.teamAMean) - teamLiveTotals[0]) > 0.9;
      const inflatedB = Math.abs(Number(latest.teamBMean) - teamLiveTotals[1]) > 0.9;
      if (inflatedA || inflatedB) {
        console.log(
          `  ❗ Potential inflation detected in latest row: AΔ=${(Number(latest.teamAMean) - teamLiveTotals[0]).toFixed(2)} BΔ=${(Number(latest.teamBMean) - teamLiveTotals[1]).toFixed(2)}`
        );
      } else {
        console.log(
          '  ✅ Latest row aligns closely with current scores (no inflation heuristic flagged).'
        );
      }
    }
  }
}

main()
  .catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });
