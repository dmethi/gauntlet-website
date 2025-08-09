import prisma from '../../lib/prisma.js';

async function main() {
  const season = process.argv[2] || new Date().getFullYear().toString();

  const [peCount, pvCount, posvCount] = await Promise.all([
    prisma.projectionError.count({ where: { season } }),
    prisma.playerVariance.count({ where: { season } }),
    prisma.positionVariance.count({ where: { season } }),
  ]);

  console.log(`Season ${season}`);
  console.log(`ProjectionError rows: ${peCount}`);
  console.log(`PlayerVariance rows: ${pvCount}`);
  console.log(`PositionVariance rows: ${posvCount}`);

  const positions = ['QB', 'RB', 'WR', 'TE'];
  for (const pos of positions) {
    const posv = await prisma.positionVariance.findUnique({
      where: { position_season: { position: pos, season } },
    });
    const sample = posv?.sampleSize || 0;
    console.log(`Position ${pos}: sampleSize=${sample}, stdDev=${posv?.stdDev ?? 'n/a'}`);
  }

  const withPlayerVar = await prisma.playerVariance.count({ where: { season } });
  console.log(`Players with variance entries: ${withPlayerVar}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
