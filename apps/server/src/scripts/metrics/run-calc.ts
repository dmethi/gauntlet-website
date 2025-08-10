import { calculateVarianceMetrics } from '../calculate-metrics.js';

async function main() {
  const season = process.argv[2];
  const weekArg = process.argv[3];
  if (!season) {
    console.error('Usage: tsx src/scripts/metrics/run-calc.ts <season> [week]');
    process.exit(1);
  }
  const week = weekArg ? parseInt(weekArg, 10) : undefined;
  await calculateVarianceMetrics({ season, week });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
