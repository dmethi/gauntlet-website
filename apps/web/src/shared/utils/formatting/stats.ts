/**
 * Format stat keys to readable labels
 */
export const formatStatKey = (key: string): string => {
  const statLabels: Record<string, string> = {
    pass_yd: 'Pass Yds',
    pass_td: 'Pass TD',
    pass_int: 'INT',
    rush_yd: 'Rush Yds',
    rush_td: 'Rush TD',
    rec: 'Rec',
    rec_yd: 'Rec Yds',
    rec_td: 'Rec TD',
    fum_lost: 'Fum',
    pts_allow: 'PA',
    sack: 'Sacks',
    int: 'INT',
    fum_rec: 'FR',
    def_td: 'TD',
    safe: 'Sfty',
  };
  return statLabels[key] || key;
};

/**
 * Format stat value with appropriate precision
 */
export const formatStatValue = (value: number, statKey: string): string => {
  // Whole numbers for counting stats
  if (['rec', 'pass_td', 'rush_td', 'rec_td', 'int', 'sack'].includes(statKey)) {
    return value.toFixed(0);
  }
  // One decimal for yards and points
  return value.toFixed(1);
};
