import axios from 'axios';

interface EspnEventCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score: string;
  team: { id: string; displayName: string; abbreviation: string };
}

interface EspnEvent {
  id: string;
  date: string; // ISO
  status: {
    type: {
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitions: Array<{
    id: string;
    status: {
      type: {
        state: string;
        description: string;
        detail: string;
        shortDetail: string;
        clock?: number;
        period?: number;
      };
    };
    competitors: EspnEventCompetitor[];
  }>;
}

interface EspnScoreboard {
  events: EspnEvent[];
}

export async function fetchEspnScoreboard(): Promise<EspnScoreboard> {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
  const { data } = await axios.get(url, { timeout: 10000 });
  return data as EspnScoreboard;
}

export async function getLiveGameProgress(now: Date = new Date()): Promise<
  Array<{
    eventId: string;
    startTime: string;
    state: string; // pre, in, post
    period?: number;
    clock?: number;
  }>
> {
  const sb = await fetchEspnScoreboard();
  return (sb.events || []).map(ev => {
    const comp = ev.competitions?.[0];
    const st = comp?.status?.type || ev.status?.type;
    const status = comp?.status || ev.status;
    return {
      eventId: ev.id,
      startTime: ev.date,
      state: st?.state || 'pre',
      period: status?.period,
      clock: status?.clock,
    };
  });
}

// Only run if this file is executed directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  getLiveGameProgress()
    .then(games => {
      console.log(JSON.stringify(games, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
