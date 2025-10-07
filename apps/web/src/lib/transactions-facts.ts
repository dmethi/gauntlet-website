/* eslint-disable no-console */

export type Facts = {
  weeks: number[];
  weekRosterPlayers: Map<string, Set<string>>; // key: `${week}:${rosterId}`
  weekRosterStarters: Map<string, Set<string>>; // key: `${week}:${rosterId}`
  weekOpponent: Map<string, number>; // key: `${week}:${rosterId}` -> opponentRosterId
  playerWeekPoints: Map<string, number>; // key: `${week}:${playerId}`
  replacementByWeekPos: Map<string, number>; // key: `${week}:${pos}`
  rosterPlayerWeeks: Map<string, Set<number>>; // key: `${rosterId}:${playerId}` -> set of weeks
};

type ApiMatchup = {
  matchupId: number;
  teams: Array<{
    rosterId: number;
    starters: string[];
    players: string[];
    playersPoints: Record<string, number>;
    starterActualPoints?: Record<string, number>;
  }>;
};

export async function buildFacts(leagueId: string, seasonWeeks: number[]): Promise<Facts> {
  const weekRosterPlayers = new Map<string, Set<string>>();
  const weekRosterStarters = new Map<string, Set<string>>();
  const weekOpponent = new Map<string, number>();
  const playerWeekPoints = new Map<string, number>();
  const replacementByWeekPos = new Map<string, number>();
  const rosterPlayerWeeks = new Map<string, Set<number>>();

  for (const week of seasonWeeks) {
    try {
      const res = await fetch(`/api/matchups/${leagueId}/${week}`);
      if (!res.ok) {
        if (week <= 4) console.log(`[buildFacts] Week ${week} failed: ${res.status}`);
        continue;
      }
      const json = (await res.json()) as { matchups: ApiMatchup[] };

      if (week <= 4) {
        console.log(`[buildFacts] Week ${week} success:`, {
          matchupsCount: json.matchups?.length || 0,
          hasMatchups: !!json.matchups,
          structure: json.matchups?.[0] ? Object.keys(json.matchups[0]) : 'no matchups',
        });
      }

      const startersPtsByPos: Record<string, number[]> = {};

      for (const m of json.matchups) {
        if (m.teams.length === 2) {
          const a = m.teams[0];
          const b = m.teams[1];
          weekOpponent.set(`${week}:${a.rosterId}`, b.rosterId);
          weekOpponent.set(`${week}:${b.rosterId}`, a.rosterId);
        }
        for (const t of m.teams) {
          weekRosterPlayers.set(`${week}:${t.rosterId}`, new Set(t.players.map(String)));
          weekRosterStarters.set(`${week}:${t.rosterId}`, new Set(t.starters.map(String)));

          // FIX: Use starterActualPoints instead of playersPoints
          const playerPoints = t.starterActualPoints || t.playersPoints || {};

          // Debug logging for Drake Maye specifically
          if (t.starters.includes('11564')) {
            console.log(
              `[buildFacts] Week ${week}: Drake Maye (11564) started by roster ${t.rosterId}`,
            );
            console.log(`[buildFacts] Drake Maye points: ${playerPoints['11564'] || 'N/A'}`);
          }

          for (const pid of t.players) {
            const points = Number(playerPoints[String(pid)] || 0);
            playerWeekPoints.set(`${week}:${String(pid)}`, points);
            const k = `${t.rosterId}:${String(pid)}`;
            if (!rosterPlayerWeeks.has(k)) rosterPlayerWeeks.set(k, new Set<number>());
            rosterPlayerWeeks.get(k)!.add(week);

            // Debug Drake Maye specifically
            if (String(pid) === '11564' && points > 0) {
              console.log(
                `[buildFacts] Week ${week}: Drake Maye (${pid}) points set to ${points} for roster ${t.rosterId}`,
              );
            }
          }
          // Store all starter points for position-specific replacement calculation
          for (const pid of t.starters) {
            const pts = Number(playerPoints[String(pid)] || 0);
            const rkey = `${week}:ALL_STARTERS`;
            if (!startersPtsByPos[rkey]) startersPtsByPos[rkey] = [];
            startersPtsByPos[rkey].push(pts);
          }
        }
      }

      for (const [k, arr] of Object.entries(startersPtsByPos)) {
        replacementByWeekPos.set(k, median(arr));
      }
    } catch {
      // console.error('Failed to build facts:', e);
      continue;
    }
  }

  return {
    weeks: seasonWeeks,
    weekRosterPlayers,
    weekRosterStarters,
    weekOpponent,
    playerWeekPoints,
    replacementByWeekPos,
    rosterPlayerWeeks,
  };
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 === 0 ? (a[mid - 1] + a[mid]) / 2 : a[mid];
}

export function firstOwnedWeek(facts: Facts, rosterId: number, playerId: string): number | null {
  const set = facts.rosterPlayerWeeks.get(`${rosterId}:${playerId}`);
  if (!set || set.size === 0) return null;
  return Math.min(...Array.from(set.values()));
}

export function lastOwnedWeek(facts: Facts, rosterId: number, playerId: string): number | null {
  const set = facts.rosterPlayerWeeks.get(`${rosterId}:${playerId}`);
  if (!set || set.size === 0) return null;
  return Math.max(...Array.from(set.values()));
}

export const playoffWeight = (w: number) =>
  w === 15 ? 1.3 : w === 16 ? 1.6 : w === 17 ? 2.0 : 1.0;
