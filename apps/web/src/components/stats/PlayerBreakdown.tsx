'use client';

import type { PlayerBreakdown, TrackedPosition } from '@/shared/utils/stats';
import { colors } from '../../../../../brand/colors';

interface PlayerBreakdownProps {
  players: PlayerBreakdown[];
  position: TrackedPosition;
}

export const PlayerBreakdownRow = ({ players, position }: PlayerBreakdownProps) => {
  if (players.length === 0) {
    return <div className="text-xs text-muted-foreground py-2 px-4">No players</div>;
  }

  // Get relevant stats for this position
  const getRelevantStats = (stats: Record<string, number>) => {
    const statKeys: string[] = [];

    switch (position) {
      case 'QB':
        statKeys.push(
          'pass_yd',
          'pass_td',
          'pass_int',
          'pass_cmp',
          'pass_att',
          'rush_yd',
          'rush_td',
        );
        break;
      case 'RB':
        statKeys.push('rush_yd', 'rush_td', 'rush_att', 'rec', 'rec_yd', 'rec_td', 'rec_tgt');
        break;
      case 'WR':
      case 'TE':
        statKeys.push('rec', 'rec_yd', 'rec_td', 'rec_tgt', 'rush_yd', 'rush_td');
        break;
      case 'DEF':
        statKeys.push('sack', 'int', 'fum_rec', 'def_td', 'pts_allow', 'tkl');
        break;
    }

    return statKeys.filter(key => stats[key] != null && stats[key] !== 0);
  };

  const formatStatKey = (key: string): string => {
    const statLabels: Record<string, string> = {
      pass_yd: 'Pass Yd',
      pass_td: 'Pass TD',
      pass_int: 'INT',
      pass_cmp: 'Comp',
      pass_att: 'Att',
      rush_yd: 'Rush Yd',
      rush_td: 'Rush TD',
      rush_att: 'Att',
      rec: 'Rec',
      rec_yd: 'Rec Yd',
      rec_td: 'Rec TD',
      rec_tgt: 'Tgt',
      sack: 'Sack',
      int: 'INT',
      fum_rec: 'FR',
      def_td: 'TD',
      pts_allow: 'PA',
      tkl: 'Tkl',
    };
    return statLabels[key] || key;
  };

  return (
    <div className="space-y-2 py-2 px-4 bg-muted/10 border-t">
      {players.map((player, idx) => {
        const relevantStats = getRelevantStats(player.stats);

        return (
          <div key={player.playerId} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground">({player.team})</span>
              <span className="font-mono font-bold" style={{ color: colors.core.regalGold }}>
                {player.fantasyPoints.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {relevantStats.map(statKey => (
                <span key={statKey} className="font-mono">
                  {formatStatKey(statKey)}: <strong>{player.stats[statKey]}</strong>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
