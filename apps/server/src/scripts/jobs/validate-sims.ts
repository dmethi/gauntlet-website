import prisma from '../../lib/prisma.js';

interface ScoringSettings {
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_2pt?: number;
  rush_yd?: number;
  rush_td?: number;
  rush_2pt?: number;
  rush_fd?: number;
  rec_yd?: number;
  rec_td?: number;
  rec?: number;
  rec_2pt?: number;
  fum?: number;
  fum_lost?: number;
  xpm?: number;
  xpmiss?: number;
  fgm_0_19?: number;
  fgm_20_29?: number;
  fgm_30_39?: number;
  fgm_40_49?: number;
  fgm_50_59?: number;
  fgm_60p?: number;
  fgmiss?: number;
  sack?: number;
  int?: number;
  fum_rec?: number;
  safe?: number;
  def_td?: number;
  blk_kick?: number;
  def_2pt?: number;
  pts_allow?: number;
  tkl_loss?: number;
  qb_hit?: number;
  def_3_and_out?: number;
  def_4_and_stop?: number;
  st_td?: number;
  st_ff?: number;
}

async function fetchRawProjections(season: string, week: number): Promise<any[]> {
  const response = await fetch(
    `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`,
    { headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' }, cache: 'no-store' }
  );
  if (!response.ok) throw new Error(`Sleeper API ${response.status}`);
  return response.json();
}

function calculateLeagueProjections(
  rawProjections: any[],
  scoringSettings: ScoringSettings
): Record<string, { points: number }> {
  const addStat = (
    breakdown: Record<string, number>,
    total: { value: number },
    statKey: string,
    settingKey: keyof ScoringSettings,
    statValue?: number
  ) => {
    const settingValue = scoringSettings[settingKey];
    if (settingValue !== undefined && statValue !== undefined && statValue > 0) {
      const points = statValue * settingValue;
      breakdown[statKey] = points;
      total.value += points;
    }
  };

  const projections: Record<string, { points: number }> = {};
  rawProjections.forEach(rawProjection => {
    if (rawProjection.player_id && rawProjection.stats) {
      const breakdown: Record<string, number> = {};
      const total = { value: 0 };
      const s = rawProjection.stats;

      addStat(breakdown, total, 'pass_yd', 'pass_yd', s.pass_yd);
      addStat(breakdown, total, 'pass_td', 'pass_td', s.pass_td);
      addStat(breakdown, total, 'pass_int', 'pass_int', s.pass_int);
      addStat(breakdown, total, 'pass_2pt', 'pass_2pt', s.pass_2pt);

      addStat(breakdown, total, 'rush_yd', 'rush_yd', s.rush_yd);
      addStat(breakdown, total, 'rush_td', 'rush_td', s.rush_td);
      addStat(breakdown, total, 'rush_2pt', 'rush_2pt', s.rush_2pt);
      addStat(breakdown, total, 'rush_fd', 'rush_fd', s.rush_fd);

      addStat(breakdown, total, 'rec_yd', 'rec_yd', s.rec_yd);
      addStat(breakdown, total, 'rec_td', 'rec_td', s.rec_td);
      addStat(breakdown, total, 'rec', 'rec', s.rec);
      addStat(breakdown, total, 'rec_2pt', 'rec_2pt', s.rec_2pt);

      addStat(breakdown, total, 'fum', 'fum', s.fum);
      addStat(breakdown, total, 'fum_lost', 'fum_lost', s.fum_lost);

      addStat(breakdown, total, 'xpm', 'xpm', s.xpm);
      addStat(breakdown, total, 'xpmiss', 'xpmiss', s.xpmiss);
      addStat(breakdown, total, 'fgm_0_19', 'fgm_0_19', s.fgm_0_19);
      addStat(breakdown, total, 'fgm_20_29', 'fgm_20_29', s.fgm_20_29);
      addStat(breakdown, total, 'fgm_30_39', 'fgm_30_39', s.fgm_30_39);
      addStat(breakdown, total, 'fgm_40_49', 'fgm_40_49', s.fgm_40_49);
      addStat(breakdown, total, 'fgm_50_59', 'fgm_50_59', s.fgm_50_59);
      addStat(breakdown, total, 'fgm_60p', 'fgm_60p', s.fgm_60p);
      addStat(breakdown, total, 'fgmiss', 'fgmiss', s.fgmiss);

      addStat(breakdown, total, 'sack', 'sack', s.sack);
      addStat(breakdown, total, 'int', 'int', s.int);
      addStat(breakdown, total, 'fum_rec', 'fum_rec', s.fum_rec);
      addStat(breakdown, total, 'safe', 'safe', s.safe);
      addStat(breakdown, total, 'def_td', 'def_td', s.def_td);
      addStat(breakdown, total, 'blk_kick', 'blk_kick', s.blk_kick);
      addStat(breakdown, total, 'def_2pt', 'def_2pt', s.def_2pt);
      addStat(breakdown, total, 'pts_allow', 'pts_allow', s.pts_allow);

      addStat(breakdown, total, 'tkl_loss', 'tkl_loss', s.tkl_loss);
      addStat(breakdown, total, 'qb_hit', 'qb_hit', s.qb_hit);
      addStat(breakdown, total, 'def_3_and_out', 'def_3_and_out', s.def_3_and_out);
      addStat(breakdown, total, 'def_4_and_stop', 'def_4_and_stop', s.def_4_and_stop);

      addStat(breakdown, total, 'st_td', 'st_td', s.st_td);
      addStat(breakdown, total, 'st_ff', 'st_ff', s.st_ff);

      projections[rawProjection.player_id] = { points: Math.round(total.value * 100) / 100 };
    }
  });

  return projections;
}

async function main() {
  const args = process.argv.slice(2);
  let week = args[0] ? parseInt(args[0]) : NaN;
  const leagueIdArg = args[1];

  // Pick the most recent simulation if week not provided
  const latestSim = await prisma.matchupSimulation.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { league: { select: { id: true, name: true, season: true, scoringSettings: true } } },
  });
  if (!latestSim) throw new Error('No simulations found to validate');

  const leagueId = leagueIdArg || latestSim.leagueId;
  if (!Number.isFinite(week)) week = latestSim.week;

  console.log(`\n🔎 Validating stored sims for league ${leagueId} week ${week}`);

  // Pull one matchup id to validate
  const oneSim = await prisma.matchupSimulation.findFirst({
    where: { leagueId, week },
    orderBy: { createdAt: 'desc' },
  });
  if (!oneSim) throw new Error(`No sims for league ${leagueId} week ${week}`);

  // Get both teams for this matchup
  const teams = await prisma.matchup.findMany({
    where: { leagueId, week, matchupId: oneSim.matchupId },
    select: { rosterId: true, starters: true },
    orderBy: { rosterId: 'asc' },
  });
  if (teams.length !== 2) throw new Error('Expected exactly 2 teams in matchup');

  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new Error('League not found');

  const season = (league.season as string) || new Date().getFullYear().toString();
  const rawProjections = await fetchRawProjections(season, week);
  const projections = calculateLeagueProjections(
    rawProjections,
    (league.scoringSettings as ScoringSettings) || {}
  );

  const sumProjection = (starters: string[] | null | undefined) =>
    (starters || []).reduce((sum, pid) => sum + (projections[pid]?.points || 0), 0);

  const teamAProject = sumProjection(teams[0].starters);
  const teamBProject = sumProjection(teams[1].starters);

  // Determine which roster is team A/B in stored record by roster order
  const isTeamAFirst = true; // We ordered by rosterId asc; stored sim A/B is by same order in batch

  const storedA = {
    mean: oneSim.teamAMean,
    p10: oneSim.teamAP10,
    p50: oneSim.teamAMedian,
    p90: oneSim.teamAP90,
  };
  const storedB = {
    mean: oneSim.teamBMean,
    p10: oneSim.teamBP10,
    p50: oneSim.teamBMedian,
    p90: oneSim.teamBP90,
  };

  const diffA = storedA.mean - teamAProject;
  const diffB = storedB.mean - teamBProject;

  console.log('\n📊 Stored vs Projected:');
  console.table([
    {
      team: 'A',
      storedMean: storedA.mean.toFixed(2),
      projSum: teamAProject.toFixed(2),
      diff: diffA.toFixed(2),
    },
    {
      team: 'B',
      storedMean: storedB.mean.toFixed(2),
      projSum: teamBProject.toFixed(2),
      diff: diffB.toFixed(2),
    },
  ]);

  console.log('\n🏁 Win % and lines:');
  console.table([
    {
      team: 'A',
      winPct: oneSim.teamAWinPct.toFixed(3),
      moneyLine: oneSim.moneyLineA,
      spread: oneSim.impliedSpread,
    },
    {
      team: 'B',
      winPct: oneSim.teamBWinPct.toFixed(3),
      moneyLine: oneSim.moneyLineB,
      total: oneSim.totalLine,
    },
  ]);

  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('Validation error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
