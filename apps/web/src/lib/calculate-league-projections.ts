/**
 * Calculate league-specific projections from Sleeper's granular projection data
 * Uses the league's scoring settings to compute points from individual stat categories
 */

export interface ScoringSettings {
  // Passing
  pass_yd?: number; // Points per passing yard
  pass_td?: number; // Points per passing TD
  pass_int?: number; // Points per interception (usually negative)
  pass_2pt?: number; // Points per 2-point conversion
  pass_cmp?: number; // Points per completion
  pass_inc?: number; // Points per incompletion
  pass_cmp_40p?: number; // Points per 40+ yard completion
  pass_fd?: number; // Points per first down

  // Rushing
  rush_yd?: number; // Points per rushing yard
  rush_td?: number; // Points per rushing TD
  rush_2pt?: number; // Points per 2-point conversion
  rush_40p?: number; // Points per 40+ yard rush
  rush_fd?: number; // Points per first down

  // Receiving
  rec_yd?: number; // Points per receiving yard
  rec_td?: number; // Points per receiving TD
  rec?: number; // Points per reception (PPR)
  rec_2pt?: number; // Points per 2-point conversion
  rec_40p?: number; // Points per 40+ yard reception
  rec_fd?: number; // Points per first down

  // Fumbles
  fum?: number; // Points per fumble (usually negative)
  fum_lost?: number; // Points per fumble lost (usually negative)
  fum_rec?: number; // Points per fumble recovery
  fum_rec_td?: number; // Points per fumble recovery TD

  // Kicking
  xpm?: number; // Points per extra point made
  xpmiss?: number; // Points per extra point missed
  fgm_0_19?: number; // Points per FG 0-19 yards
  fgm_20_29?: number; // Points per FG 20-29 yards
  fgm_30_39?: number; // Points per FG 30-39 yards
  fgm_40_49?: number; // Points per FG 40-49 yards
  fgm_50_59?: number; // Points per FG 50-59 yards
  fgm_60p?: number; // Points per FG 60+ yards
  fgmiss?: number; // Points per FG missed

  // Defense/Special Teams
  pts_allow_0?: number; // Points for allowing 0 points
  pts_allow_1_6?: number; // Points for allowing 1-6 points
  pts_allow_7_13?: number; // Points for allowing 7-13 points
  pts_allow_14_20?: number; // Points for allowing 14-20 points
  pts_allow_21_27?: number; // Points for allowing 21-27 points
  pts_allow_28_34?: number; // Points for allowing 28-34 points
  pts_allow_35p?: number; // Points for allowing 35+ points
  pts_allow?: number; // General points allowed

  yds_allow_0_100?: number; // Points for allowing 0-100 yards
  yds_allow_100_199?: number; // Points for allowing 100-199 yards
  yds_allow_200_299?: number; // Points for allowing 200-299 yards
  yds_allow_300_349?: number; // Points for allowing 300-349 yards
  yds_allow_350_399?: number; // Points for allowing 350-399 yards
  yds_allow_400_449?: number; // Points for allowing 400-449 yards
  yds_allow_450_499?: number; // Points for allowing 450-499 yards
  yds_allow_500_549?: number; // Points for allowing 500-549 yards
  yds_allow_550p?: number; // Points for allowing 550+ yards
  yds_allow?: number; // General yards allowed

  // Defense stats (Sleeper keys)
  int?: number; // Points per interception
  sack?: number; // Points per sack
  def_st_fum_rec?: number; // Points per fumble recovery
  def_st_ff?: number; // Points per forced fumble
  def_td?: number; // Points per defensive TD
  def_st_td?: number; // Points per def/special teams TD
  blk_kick?: number; // Points per blocked kick
  def_block_kick?: number; // Points per blocked kick (legacy)
  def_2pt?: number; // Points per 2-point conversion
  def_3_and_out?: number; // Points per 3 and out
  def_4_and_stop?: number; // Points per 4th down stop
  def_fum_td?: number; // Points per fumble TD
  pass_int_td?: number; // Points per pick-six
  tkl_loss?: number; // Points per tackle for loss
  ff?: number; // Points per forced fumble

  // Legacy defense keys (for backward compatibility)
  def_int?: number; // Points per interception
  def_fum_rec?: number; // Points per fumble recovery
  def_safety?: number; // Points per safety
  def_sack?: number; // Points per sack
  def_int_td?: number; // Points per pick-six
  def_fum_rec_td?: number; // Points per fumble recovery TD
  def_kr_td?: number; // Points per kick return TD
  def_pr_td?: number; // Points per punt return TD

  // Individual defensive stats
  idp_solo?: number; // Points per solo tackle
  idp_asst?: number; // Points per assisted tackle
  idp_sack?: number; // Points per sack
  idp_int?: number; // Points per interception
  idp_fum_rec?: number; // Points per fumble recovery
  idp_pd?: number; // Points per pass defended
  idp_td?: number; // Points per defensive TD
  idp_safety?: number; // Points per safety
  idp_block_kick?: number; // Points per blocked kick

  // Special teams individual
  st_td?: number; // Points per special teams TD
  st_ff?: number; // Points per special teams forced fumble
  st_fum_rec?: number; // Points per special teams fumble recovery
  st_tkl_solo?: number; // Points per special teams solo tackle
}

export interface LeagueProjection {
  playerId: string;
  points: number;
  breakdown: Record<string, number>;
}

/**
 * Calculate fantasy points for a single player using league scoring settings
 */
export function calculateLeagueProjection(
  rawProjection: any,
  scoringSettings: ScoringSettings,
): LeagueProjection {
  const breakdown: Record<string, number> = {};
  let totalPoints = 0;

  // Use league-specific calculation instead of generic pts_half_ppr

  // Helper function to add points from a stat
  const addStat = (statKey: string, settingKey: keyof ScoringSettings, statValue?: number) => {
    const settingValue = scoringSettings[settingKey];
    if (settingValue !== undefined && statValue !== undefined && statValue !== 0) {
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
  addStat('pass_cmp', 'pass_cmp', rawProjection.pass_cmp);
  addStat('pass_inc', 'pass_inc', rawProjection.pass_inc);
  addStat('pass_cmp_40p', 'pass_cmp_40p', rawProjection.pass_cmp_40p);
  addStat('pass_fd', 'pass_fd', rawProjection.pass_fd);

  // Rushing stats
  addStat('rush_yd', 'rush_yd', rawProjection.rush_yd);
  addStat('rush_td', 'rush_td', rawProjection.rush_td);
  addStat('rush_2pt', 'rush_2pt', rawProjection.rush_2pt);
  addStat('rush_40p', 'rush_40p', rawProjection.rush_40p);
  addStat('rush_fd', 'rush_fd', rawProjection.rush_fd);

  // Receiving stats
  addStat('rec_yd', 'rec_yd', rawProjection.rec_yd);
  addStat('rec_td', 'rec_td', rawProjection.rec_td);
  addStat('rec', 'rec', rawProjection.rec);
  addStat('rec_2pt', 'rec_2pt', rawProjection.rec_2pt);
  addStat('rec_40p', 'rec_40p', rawProjection.rec_40p);
  addStat('rec_fd', 'rec_fd', rawProjection.rec_fd);

  // Fumbles
  addStat('fum', 'fum', rawProjection.fum);
  addStat('fum_lost', 'fum_lost', rawProjection.fum_lost);
  addStat('fum_rec', 'fum_rec', rawProjection.fum_rec);
  addStat('fum_rec_td', 'fum_rec_td', rawProjection.fum_rec_td);

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

  // Defense stats - using Sleeper's actual keys
  addStat('pts_allow_0', 'pts_allow_0', rawProjection.pts_allow_0);
  addStat('pts_allow_1_6', 'pts_allow_1_6', rawProjection.pts_allow_1_6);
  addStat('pts_allow_7_13', 'pts_allow_7_13', rawProjection.pts_allow_7_13);
  addStat('pts_allow_14_20', 'pts_allow_14_20', rawProjection.pts_allow_14_20);
  addStat('pts_allow_21_27', 'pts_allow_21_27', rawProjection.pts_allow_21_27);
  addStat('pts_allow_28_34', 'pts_allow_28_34', rawProjection.pts_allow_28_34);
  addStat('pts_allow_35p', 'pts_allow_35p', rawProjection.pts_allow_35p);
  addStat('pts_allow', 'pts_allow', rawProjection.pts_allow); // General points allowed

  addStat('yds_allow_0_100', 'yds_allow_0_100', rawProjection.yds_allow_0_100);
  addStat('yds_allow_100_199', 'yds_allow_100_199', rawProjection.yds_allow_100_199);
  addStat('yds_allow_200_299', 'yds_allow_200_299', rawProjection.yds_allow_200_299);
  addStat('yds_allow_300_349', 'yds_allow_300_349', rawProjection.yds_allow_300_349);
  addStat('yds_allow_350_399', 'yds_allow_350_399', rawProjection.yds_allow_350_399);
  addStat('yds_allow_400_449', 'yds_allow_400_449', rawProjection.yds_allow_400_449);
  addStat('yds_allow_450_499', 'yds_allow_450_499', rawProjection.yds_allow_450_499);
  addStat('yds_allow_500_549', 'yds_allow_500_549', rawProjection.yds_allow_500_549);
  addStat('yds_allow_550p', 'yds_allow_550p', rawProjection.yds_allow_550p);
  addStat('yds_allow', 'yds_allow', rawProjection.yds_allow); // General yards allowed

  // Sleeper uses these keys (not def_ prefixed)
  addStat('int', 'int', rawProjection.int); // Interceptions
  addStat('sack', 'sack', rawProjection.sack); // Sacks
  addStat('fum_rec', 'def_st_fum_rec', rawProjection.fum_rec); // Fumble recoveries
  addStat('ff', 'def_st_ff', rawProjection.ff); // Forced fumbles
  addStat('def_td', 'def_td', rawProjection.def_td); // Defensive TDs
  addStat('def_st_td', 'def_st_td', rawProjection.def_st_td); // Def/ST TDs
  addStat('blk_kick', 'blk_kick', rawProjection.blk_kick); // Blocked kicks
  addStat('def_2pt', 'def_2pt', rawProjection.def_2pt); // 2-point conversions
  addStat('def_3_and_out', 'def_3_and_out', rawProjection.def_3_and_out); // 3 and outs
  addStat('def_4_and_stop', 'def_4_and_stop', rawProjection.def_4_and_stop); // 4th down stops

  // Additional defense TDs and stats (avoid double-counting)
  addStat('def_fum_td', 'fum_rec_td', rawProjection.def_fum_td); // Fumble recovery TD
  addStat('pass_int_td', 'pass_int_td', rawProjection.pass_int_td); // Pick-six
  addStat('tkl_loss', 'tkl_loss', rawProjection.tkl_loss); // Tackles for loss

  // Individual defensive stats
  addStat('idp_solo', 'idp_solo', rawProjection.idp_solo);
  addStat('idp_asst', 'idp_asst', rawProjection.idp_asst);
  addStat('idp_sack', 'idp_sack', rawProjection.idp_sack);
  addStat('idp_int', 'idp_int', rawProjection.idp_int);
  addStat('idp_fum_rec', 'idp_fum_rec', rawProjection.idp_fum_rec);
  addStat('idp_pd', 'idp_pd', rawProjection.idp_pd);
  addStat('idp_td', 'idp_td', rawProjection.idp_td);
  addStat('idp_safety', 'idp_safety', rawProjection.idp_safety);
  addStat('idp_block_kick', 'idp_block_kick', rawProjection.idp_block_kick);

  // Special teams individual
  addStat('st_td', 'st_td', rawProjection.st_td);
  addStat('st_ff', 'st_ff', rawProjection.st_ff);
  addStat('st_fum_rec', 'st_fum_rec', rawProjection.st_fum_rec);
  addStat('st_tkl_solo', 'st_tkl_solo', rawProjection.st_tkl_solo);

  return {
    playerId: rawProjection.player_id || '',
    points: totalPoints,
    breakdown,
  };
}

/**
 * Calculate projections for multiple players
 */
export function calculateLeagueProjections(
  rawProjections: any[],
  scoringSettings: ScoringSettings,
): Record<string, LeagueProjection> {
  const result: Record<string, LeagueProjection> = {};

  for (const rawProjection of rawProjections) {
    const playerId = rawProjection.player_id;
    if (playerId) {
      result[playerId] = calculateLeagueProjection(rawProjection, scoringSettings);
    }
  }

  return result;
}
