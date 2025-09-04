/**
 * Calculate league-specific projections by multiplying raw stats with league scoring settings
 */
export interface LeagueProjection {
  playerId: string;
  points: number;
  breakdown: Record<string, number>; // For debugging: stat -> points
}

export interface ScoringSettings {
  // Passing
  pass_yd?: number; // Points per passing yard (usually 0.04 = 1pt per 25yds)
  pass_td?: number; // Points per passing TD
  pass_int?: number; // Points per interception (usually negative)
  pass_2pt?: number; // Points per 2-point conversion

  // Rushing
  rush_yd?: number; // Points per rushing yard (usually 0.1 = 1pt per 10yds)
  rush_td?: number; // Points per rushing TD
  rush_2pt?: number; // Points per rushing 2-point conversion
  rush_fd?: number; // Points per rushing first down

  // Receiving
  rec_yd?: number; // Points per receiving yard (usually 0.1 = 1pt per 10yds)
  rec_td?: number; // Points per receiving TD
  rec?: number; // Points per reception (PPR)
  rec_2pt?: number; // Points per receiving 2-point conversion

  // Fumbles
  fum?: number; // Points per fumble (usually negative)
  fum_lost?: number; // Points per fumble lost (usually negative)

  // Kicking
  xpm?: number; // Points per XP made
  xpmiss?: number; // Points per XP missed (usually negative)
  fgm_0_19?: number; // Points per FG made 0-19 yards
  fgm_20_29?: number; // Points per FG made 20-29 yards
  fgm_30_39?: number; // Points per FG made 30-39 yards
  fgm_40_49?: number; // Points per FG made 40-49 yards
  fgm_50_59?: number; // Points per FG made 50-59 yards
  fgm_60p?: number; // Points per FG made 60+ yards
  fgmiss?: number; // Points per FG missed (usually negative)

  // Defense
  sack?: number; // Points per sack
  int?: number; // Points per interception
  fum_rec?: number; // Points per fumble recovery
  safe?: number; // Points per safety
  def_td?: number; // Points per defensive TD
  blk_kick?: number; // Points per blocked kick
  def_2pt?: number; // Points per defensive 2-point conversion
  pts_allow?: number; // Points per point allowed (usually negative)

  // IDP (Individual Defensive Player) - if used
  tkl_loss?: number; // Points per tackle for loss
  qb_hit?: number; // Points per QB hit
  def_3_and_out?: number; // Points per 3 and out forced
  def_4_and_stop?: number; // Points per 4th down stop

  // Special Teams
  st_td?: number; // Points per special teams TD
  st_ff?: number; // Points per special teams forced fumble
}

export function calculateLeagueProjection(
  rawProjection: any,
  scoringSettings: ScoringSettings
): LeagueProjection {
  const breakdown: Record<string, number> = {};
  let totalPoints = 0;

  // Helper function to add points from a stat
  const addStat = (statKey: string, settingKey: keyof ScoringSettings, statValue?: number) => {
    const settingValue = scoringSettings[settingKey];
    if (settingValue !== undefined && statValue !== undefined && statValue > 0) {
      const points = statValue * settingValue;
      breakdown[statKey] = points;
      totalPoints += points;
    }
  };

  // Passing stats
  addStat('pass_yd', 'pass_yd', rawProjection.pass_yd);
  addStat('pass_td', 'pass_td', rawProjection.pass_td);
  addStat('pass_int', 'pass_int', rawProjection.pass_int);
  addStat('pass_2pt', 'pass_2pt', rawProjection.pass_2pt);

  // Rushing stats
  addStat('rush_yd', 'rush_yd', rawProjection.rush_yd);
  addStat('rush_td', 'rush_td', rawProjection.rush_td);
  addStat('rush_2pt', 'rush_2pt', rawProjection.rush_2pt);
  addStat('rush_fd', 'rush_fd', rawProjection.rush_fd);

  // Receiving stats
  addStat('rec_yd', 'rec_yd', rawProjection.rec_yd);
  addStat('rec_td', 'rec_td', rawProjection.rec_td);
  addStat('rec', 'rec', rawProjection.rec);
  addStat('rec_2pt', 'rec_2pt', rawProjection.rec_2pt);

  // Fumbles
  addStat('fum', 'fum', rawProjection.fum);
  addStat('fum_lost', 'fum_lost', rawProjection.fum_lost);

  // Kicking stats
  addStat('xpm', 'xpm', rawProjection.xpm);
  addStat('xpmiss', 'xpmiss', rawProjection.xpmiss);
  addStat('fgm_0_19', 'fgm_0_19', rawProjection.fgm_0_19);
  addStat('fgm_20_29', 'fgm_20_29', rawProjection.fgm_20_29);
  addStat('fgm_30_39', 'fgm_30_39', rawProjection.fgm_30_39);
  addStat('fgm_40_49', 'fgm_40_49', rawProjection.fgm_40_49);
  addStat('fgm_50_59', 'fgm_50_59', rawProjection.fgm_50_59);
  addStat('fgm_60p', 'fgm_60p', rawProjection.fgm_60p);
  addStat('fgmiss', 'fgmiss', rawProjection.fgmiss);

  // Defense stats
  addStat('sack', 'sack', rawProjection.sack);
  addStat('int', 'int', rawProjection.int);
  addStat('fum_rec', 'fum_rec', rawProjection.fum_rec);
  addStat('safe', 'safe', rawProjection.safe);
  addStat('def_td', 'def_td', rawProjection.def_td);
  addStat('blk_kick', 'blk_kick', rawProjection.blk_kick);
  addStat('def_2pt', 'def_2pt', rawProjection.def_2pt);
  addStat('pts_allow', 'pts_allow', rawProjection.pts_allow);

  // IDP stats
  addStat('tkl_loss', 'tkl_loss', rawProjection.tkl_loss);
  addStat('qb_hit', 'qb_hit', rawProjection.qb_hit);
  addStat('def_3_and_out', 'def_3_and_out', rawProjection.def_3_and_out);
  addStat('def_4_and_stop', 'def_4_and_stop', rawProjection.def_4_and_stop);

  // Special Teams
  addStat('st_td', 'st_td', rawProjection.st_td);
  addStat('st_ff', 'st_ff', rawProjection.st_ff);

  return {
    playerId: rawProjection.player_id,
    points: Math.round(totalPoints * 100) / 100, // Round to 2 decimal places
    breakdown,
  };
}

export function calculateLeagueProjections(
  rawProjections: any[],
  scoringSettings: ScoringSettings
): Record<string, LeagueProjection> {
  const projections: Record<string, LeagueProjection> = {};

  rawProjections.forEach(rawProjection => {
    if (rawProjection.player_id && rawProjection.stats) {
      const projection = calculateLeagueProjection(rawProjection.stats, scoringSettings);
      projections[rawProjection.player_id] = projection;
    }
  });

  return projections;
}
