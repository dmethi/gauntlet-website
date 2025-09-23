'use client';

import { PageHeader } from '@gauntlet/ui';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Callout } from '@/components/Callout';

interface PlayerInfo {
  id: string;
  name: string;
  team: string;
}

interface TeamSlateInfo {
  players: PlayerInfo[];
  projectedPoints: number;
}

interface TeamInfo {
  rosterId: number;
  teamName: string;
  ownerName: string;
  starters: string[];
  projectedPoints: number;
  record: { wins: number; losses: number };
  powerRanking: { rank: number; score: number } | null;
  winProbability?: number;
  impliedOdds?: string;
}

interface FantasyMatchup {
  matchupId: number;
  leagueId: string;
  leagueName: string;
  teamA: TeamInfo;
  teamB: TeamInfo;
  playersAtStake: {
    thursday: PlayerInfo[];
    sundayEarly: PlayerInfo[];
    sundayLate: PlayerInfo[];
    sundayNight: PlayerInfo[];
    mondayNight: PlayerInfo[];
  };
  slateBreakdown: {
    thursday: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    sundayEarly: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    sundayLate: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    sundayNight: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
    mondayNight: { teamA: TeamSlateInfo; teamB: TeamSlateInfo };
  };
  bettingOdds?: {
    favorite: 'teamA' | 'teamB';
    spread: number;
    moneylineA: string;
    moneylineB: string;
  };
}

interface GameInfo {
  eventId: string;
  startTime: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbrev: string;
  awayAbbrev: string;
}

interface GameWindow {
  name: string;
  games: GameInfo[];
}

interface ApiResponse {
  ok: boolean;
  data?: {
    season: string;
    week: number;
    lastUpdated: string;
    gameWindows: GameWindow[];
    matchups: FantasyMatchup[];
    contextualReports?: {
      week1: any;
      week2: any;
    };
    powerRankings?: any[];
  };
}

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

const WEEK3_NARRATIVES = {
  overview: `Week 3 is where vibes harden into trajectories. We've got heavyweights squaring off (Ziyan vs. Mach in the NFC, Patel vs. Infinity in the AFC), 2–0s trying to prove they're real (Herbussy, Golden Age), and winless squads scrambling to avoid the dreaded 0–3 hole (Vinny, Rithik, Ben, Arpit/Yash). The sims say we'll see shootouts (2 Dolla vs. Shivang, Ziyan vs. Mach) and duds (sorry Vinny), but the gauntlet's only guarantee is pain.`,

  matchups: {
    // NFC Matchups
    ziyanp22: {
      narrative: `Ziyan has cruised behind balance and depth, while Mach patched a leaky Week 1 with a bounce-back win. The books call this Mach's game to lose (74% favorite, -13.5 spread), but no one trusts Mach to cover spreads. Thursday night starts with his Miami double-stack — if Achane + Waddle boom, Ziyan's chasing all weekend. Ziyan's cavalry comes Sunday with Puka, Jeanty, and Love, then Keenan + Odunze later. Monday wraps it with Lions-on-Lions: Gibbs vs. Jameson. Expect mood swings every window.`,
    },
    'DJ Herbussy ': {
      narrative: `Herbussy's been quietly efficient, riding Maye and JT while keeping Coleman + Egbuka in the chamber. Rithik's endured Burrow meltdowns and depth implosions, landing him at the NFC basement. Spread is 5.5 to Herbussy, and it feels generous. Sunday pits Maye/JT/Bucky vs. Rodgers/Breece/London, and Gibbs on Monday is Rithik's only hope for theatrics. Unless the Bengals remember how to function, this smells like 3–0 vs. 0–3.`,
    },
    'Saint Brown Does Mahomes': {
      narrative: `Aman righted the ship last week with Amon-Ra + Mahomes leading the way, while Christian continues to live and die by Josh Allen's variance. Vegas doesn't buy Christian's stock: Aman is an 80% favorite (-15.5). With Tyreek + Mahomes locked in, Aman has the ceiling to run away with this early. Christian needs another Allen bailout or he's in blowout territory before SNF.`,
    },
    'Jaxson Dart-Njigba': {
      narrative: `Jeffrey's Derrick Henry carry-job has him at 2–0 despite middling expected wins. Alex's squad is middle-pack but capable of spiking. The odds shade Jeffrey's way (60%, -5), but it's tight. Sunday noon sees Lamar, Flowers, and Henry vs. Burrow, Etienne, and Nabers. There's little Monday insurance, so this should be settled by Sunday night. If Burrow sputters again, Alex could get dusted.`,
    },
    vayyala: {
      narrative: `Vinny has yet to clear 110 points this season — his offense is stuck in preseason mode. Josh scraped one win but sits near the middle of the PR pack. Market gives Josh the edge (59%, -4.5). Vinny needs Hurts, Kyren, and Higgins to finally hit Sunday noon; otherwise Javonte + JSN later plus Lamar Monday should close it for Josh. If Vinny drops to 0–3, rename watch is the least of his problems.`,
    },
    'Dont go Chasing Saquon': {
      narrative: `Arnav's 0–2 hole feels cruel: close losses, lineup second-guessing, and Saquon unable to save him. Luke cashed a freebie Week 1 then fell flat last week. Vegas has it basically even (57/43, spread 3.5). Sunday is the bloodbath: Saquon/Jefferson/Swift vs. Allen/CMC/Deebo. If Arnav's stars don't carry early, Luke likely closes late. Loser faces a Week 3 headline no one wants: "fraud watch" for Luke or "panic button" for Arnav.`,
    },

    // AFC Matchups
    '2 Dolla Balla$': {
      narrative: `Both squads are 1–1, but Nolan's been steadier while Shivang has lived on chaos. The books hammer Shivang (81%, -18 spread) thanks to Hurts and Texans D giving him Sunday noon firepower. Nolan counters Thursday with Josh Allen — if he doesn't open big, Shivang's depth (Saquon, Deebo, Kyren) might bury him before SNF. This one projects highest-scoring in the AFC slate.`,
    },
    'lol jerry jones': {
      narrative: `Neil's been streaky, stealing one early then falling off, while Vinay's been flatlined. Market leans Neil (57%, -3.5 spread), but neither inspires confidence. Sunday noon is Neil's heavy push (Geno, Taylor, AJB), while Vinay waits on CMC and Bo Nix in the afternoon. If CMC doesn't carry him, Vinay may be staring down 0–3 with no light in sight.`,
    },
    NielGetsCarried: {
      narrative: `Arpit/Yash are desperate at 0–2, while Hunter's machine has steamrolled even with Gibbs and Ja'Marr quiet. Strangely, betting likes the underdogs (67% for NielGetsCarried, -8.5), but Monday looms brutal: Gibbs + Henry could erase any cushion. If JJettas and Jacobs don't post early fireworks, Hunter probably cruises to 3–0.`,
    },
    'Quonspiracy Theorists': {
      narrative: `Akhil rocketed to #1 PR after detonating Week 2; Anant sits at 1–1 with Burrow dragging him down. Market tilts Akhil's way (79%, -16.5). Sunday is QB theater: Dak/Nabers/Ravens D vs. Jones/Saquon/Ferguson. SNF adds spice with rookie duel: Worthy vs. Nabers in primetime. On paper, Akhil should stomp, but Anant's brand is chaos.`,
    },
    'Nacua Matata': {
      narrative: `Adam's balanced squad looks top-half; Ben's been lost in the basement with 0–2 and three 17-point scorers stranded on the bench last week. The line is ugly: Adam 77%, -16 spread. Sunday noon is Adam's punch (Puka, Breece, Chubb) vs. Ben's Wilson/Egbuka. Herbert + Conner in the late slate give Ben a shot, but unless Herbert erupts, Adam should coast.`,
    },
    'Dr Patel Parikh MD MBA': {
      narrative: `Infinity's run game has chewed through opponents; Bijan/Etienne look unstoppable. Darshan/Kyle cling to Lamar and pray the rest holds up. Vegas calls it close (59% Infinity, -5.5). Bills D vs. Keon Coleman kicks off Thursday, but the hammer is Mahomes + Kelce on SNF — a stack that could bury this matchup before Lamar even gets his Monday shot. If Patel's squad pulls the upset, it's season-redefining; if not, Infinity struts to 3–0.`,
    },
  },
};

const getTimeWindowDisplay = (window: string): string => {
  const windowMap: Record<string, string> = {
    thursday: 'Thu',
    sundayEarly: 'Sun 1PM',
    sundayLate: 'Sun 4PM',
    sundayNight: 'Sun 8PM',
    mondayNight: 'Mon 8PM',
  };
  return windowMap[window] || window;
};

export default function Week3Preview2025() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/preview/2025/3', { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        console.log('[Week3Preview] API response', json);
        setData(json);
      })
      .catch(err => {
        console.error('[Week3Preview] Error:', err);
        setData({ ok: false } as any);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className='px-2 md:px-4 py-6'>
        <PageHeader title='Week 3 Preview — 2025' subtitle='Loading...' />
        <div className='text-sm text-muted-foreground'>Fetching week 3 preview data...</div>
      </div>
    );
  }

  if (!data?.ok || !data.data) {
    return (
      <div className='px-2 md:px-4 py-6'>
        <PageHeader title='Week 3 Preview — 2025' subtitle='Error' />
        <div className='text-sm text-red-600'>Failed to load week 3 preview data.</div>
      </div>
    );
  }

  // Create league odds snapshot using the 6 categories from LeagueWideOdds
  const getLeagueOddsSnapshot = () => {
    const allMatchups = data.data!.matchups;

    // Get unique teams
    const allTeams = allMatchups
      .flatMap(m => [m.teamA, m.teamB])
      .filter(
        (team, index, arr) =>
          arr.findIndex(t => t.rosterId === team.rosterId && t.leagueId) === index
      );

    // Highest Scorers (by current projected points)
    const highestScorers = allTeams
      .sort((a, b) => b.projectedPoints - a.projectedPoints)
      .slice(0, 5);

    // Lowest Scorers (by current projected points)
    const lowestScorers = allTeams
      .sort((a, b) => a.projectedPoints - b.projectedPoints)
      .slice(0, 5);

    // Closest Matchups (by projected margin)
    const closestMatchups = allMatchups
      .map(m => ({
        team1: m.teamA.teamName,
        team2: m.teamB.teamName,
        margin: Math.abs(m.teamA.projectedPoints - m.teamB.projectedPoints),
        league: getConference(m.leagueName),
      }))
      .sort((a, b) => a.margin - b.margin)
      .slice(0, 5);

    // Biggest Blowouts (by projected margin)
    const biggestBlowouts = allMatchups
      .map(m => ({
        team1: m.teamA.teamName,
        team2: m.teamB.teamName,
        margin: Math.abs(m.teamA.projectedPoints - m.teamB.projectedPoints),
        league: getConference(m.leagueName),
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    // Highest Scoring Matchups (by total points)
    const highestScoringMatchups = allMatchups
      .map(m => ({
        team1: m.teamA.teamName,
        team2: m.teamB.teamName,
        total: m.teamA.projectedPoints + m.teamB.projectedPoints,
        league: getConference(m.leagueName),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Lowest Scoring Matchups (by total points)
    const lowestScoringMatchups = allMatchups
      .map(m => ({
        team1: m.teamA.teamName,
        team2: m.teamB.teamName,
        total: m.teamA.projectedPoints + m.teamB.projectedPoints,
        league: getConference(m.leagueName),
      }))
      .sort((a, b) => a.total - b.total)
      .slice(0, 5);

    return {
      highestScorers,
      lowestScorers,
      closestMatchups,
      biggestBlowouts,
      highestScoringMatchups,
      lowestScoringMatchups,
    };
  };

  const leagueOdds = getLeagueOddsSnapshot();

  return (
    <div className='px-2 md:px-4 py-6 space-y-6'>
      <PageHeader title='Week 3 Preview — 2025' subtitle='Where vibes harden into trajectories' />

      {/* Overview */}
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>The Overview</h2>
        <p className='text-sm leading-relaxed'>{WEEK3_NARRATIVES.overview}</p>
      </div>

      <hr className='border-border' />

      {/* NFC Matchups */}
      <div className='space-y-6'>
        <h2 className='text-lg font-semibold'>NFC Matchups</h2>
        {data.data.matchups
          .filter(m => getConference(m.leagueName) === 'NFC')
          .map(matchup => (
            <div key={`${matchup.leagueId}-${matchup.matchupId}`} className='p-3 space-y-3'>
              {/* Matchup Header */}
              <div className='rounded-md bg-gauntlet-crimson/10 px-3 py-2'>
                <div className='sm:hidden'>
                  <div className='flex items-center justify-between text-base font-semibold mb-1'>
                    <span className='truncate flex-1 mr-2'>{matchup.teamA.teamName}</span>
                    <span className='text-right font-mono'>
                      {matchup.teamA.projectedPoints.toFixed(1)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-base font-semibold'>
                    <span className='truncate flex-1 mr-2'>{matchup.teamB.teamName}</span>
                    <span className='text-right font-mono'>
                      {matchup.teamB.projectedPoints.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className='hidden sm:flex items-center justify-between text-base font-semibold'>
                  <div className='truncate max-w-[45%]'>
                    {matchup.teamA.teamName} ({matchup.teamA.projectedPoints.toFixed(1)})
                  </div>
                  <div className='text-muted-foreground px-2'>vs</div>
                  <div className='truncate text-right max-w-[45%]'>
                    {matchup.teamB.teamName} ({matchup.teamB.projectedPoints.toFixed(1)})
                  </div>
                </div>
              </div>

              {/* Records and Rankings */}
              <div className='flex items-center gap-2 text-xs'>
                <span>
                  Records: {matchup.teamA.record.wins}-{matchup.teamA.record.losses} vs{' '}
                  {matchup.teamB.record.wins}-{matchup.teamB.record.losses}
                </span>
                {matchup.teamA.powerRanking && matchup.teamB.powerRanking && (
                  <span>
                    • PR: #{matchup.teamA.powerRanking.rank} vs #{matchup.teamB.powerRanking.rank}
                  </span>
                )}
              </div>

              {/* Betting Info */}
              {matchup.bettingOdds && (
                <div className='text-xs text-muted-foreground'>
                  Spread:{' '}
                  {matchup.bettingOdds.favorite === 'teamA'
                    ? matchup.teamA.teamName
                    : matchup.teamB.teamName}{' '}
                  {matchup.bettingOdds.spread > 0 ? '+' : ''}
                  {matchup.bettingOdds.spread.toFixed(1)} • {matchup.bettingOdds.moneylineA}/
                  {matchup.bettingOdds.moneylineB}
                </div>
              )}

              {/* Matchup Narrative */}
              <div className='text-sm leading-relaxed'>
                {WEEK3_NARRATIVES.matchups[matchup.teamA.teamName]?.narrative ||
                  WEEK3_NARRATIVES.matchups[matchup.teamB.teamName]?.narrative || (
                    <em>Matchup preview: Analysis of key players and game flow coming soon...</em>
                  )}
              </div>

              <hr className='border-border' />

              {/* Player Boxscores */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-xs font-semibold mb-1'>{matchup.teamA.teamName}</div>
                  <div className='space-y-1'>
                    {matchup.teamA.starters.slice(0, 9).map((playerId, idx) => {
                      // Find which time window this player is in
                      let playerWindow = 'BYE';
                      let playerProj = 0;

                      Object.entries(matchup.slateBreakdown).forEach(([window, slate]) => {
                        const player = slate.teamA.players.find(p => p.id === playerId);
                        if (player) {
                          playerWindow = getTimeWindowDisplay(window);
                          // Use slate projection divided by number of players as rough estimate
                          playerProj =
                            slate.teamA.projectedPoints / Math.max(slate.teamA.players.length, 1);
                        }
                      });

                      return (
                        <div key={idx} className='flex items-center justify-between text-xs'>
                          <div className='truncate flex-1'>
                            <span className='text-muted-foreground mr-1'>POS</span>
                            Player {idx + 1}
                          </div>
                          <div className='text-right flex items-center gap-1'>
                            <span className='font-medium'>{playerProj.toFixed(1)}</span>
                            <span className='text-xs text-muted-foreground'>({playerWindow})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className='text-xs font-semibold mb-1'>{matchup.teamB.teamName}</div>
                  <div className='space-y-1'>
                    {matchup.teamB.starters.slice(0, 9).map((playerId, idx) => {
                      // Find which time window this player is in
                      let playerWindow = 'BYE';
                      let playerProj = 0;

                      Object.entries(matchup.slateBreakdown).forEach(([window, slate]) => {
                        const player = slate.teamB.players.find(p => p.id === playerId);
                        if (player) {
                          playerWindow = getTimeWindowDisplay(window);
                          // Use slate projection divided by number of players as rough estimate
                          playerProj =
                            slate.teamB.projectedPoints / Math.max(slate.teamB.players.length, 1);
                        }
                      });

                      return (
                        <div key={idx} className='flex items-center justify-between text-xs'>
                          <div className='truncate flex-1'>
                            <span className='text-muted-foreground mr-1'>POS</span>
                            Player {idx + 1}
                          </div>
                          <div className='text-right flex items-center gap-1'>
                            <span className='font-medium'>{playerProj.toFixed(1)}</span>
                            <span className='text-xs text-muted-foreground'>({playerWindow})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <hr className='border-border' />
            </div>
          ))}
      </div>

      {/* AFC Matchups */}
      <div className='space-y-6'>
        <h2 className='text-lg font-semibold'>AFC Matchups</h2>
        {data.data.matchups
          .filter(m => getConference(m.leagueName) === 'AFC')
          .map(matchup => (
            <div key={`${matchup.leagueId}-${matchup.matchupId}`} className='p-3 space-y-3'>
              {/* Same structure as NFC */}
              <div className='rounded-md bg-gauntlet-crimson/10 px-3 py-2'>
                <div className='sm:hidden'>
                  <div className='flex items-center justify-between text-base font-semibold mb-1'>
                    <span className='truncate flex-1 mr-2'>{matchup.teamA.teamName}</span>
                    <span className='text-right font-mono'>
                      {matchup.teamA.projectedPoints.toFixed(1)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-base font-semibold'>
                    <span className='truncate flex-1 mr-2'>{matchup.teamB.teamName}</span>
                    <span className='text-right font-mono'>
                      {matchup.teamB.projectedPoints.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className='hidden sm:flex items-center justify-between text-base font-semibold'>
                  <div className='truncate max-w-[45%]'>
                    {matchup.teamA.teamName} ({matchup.teamA.projectedPoints.toFixed(1)})
                  </div>
                  <div className='text-muted-foreground px-2'>vs</div>
                  <div className='truncate text-right max-w-[45%]'>
                    {matchup.teamB.teamName} ({matchup.teamB.projectedPoints.toFixed(1)})
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2 text-xs'>
                <span>
                  Records: {matchup.teamA.record.wins}-{matchup.teamA.record.losses} vs{' '}
                  {matchup.teamB.record.wins}-{matchup.teamB.record.losses}
                </span>
                {matchup.teamA.powerRanking && matchup.teamB.powerRanking && (
                  <span>
                    • PR: #{matchup.teamA.powerRanking.rank} vs #{matchup.teamB.powerRanking.rank}
                  </span>
                )}
              </div>

              {/* Betting Info */}
              {matchup.bettingOdds && (
                <div className='text-xs text-muted-foreground'>
                  Spread:{' '}
                  {matchup.bettingOdds.favorite === 'teamA'
                    ? matchup.teamA.teamName
                    : matchup.teamB.teamName}{' '}
                  {matchup.bettingOdds.spread > 0 ? '+' : ''}
                  {matchup.bettingOdds.spread.toFixed(1)} • {matchup.bettingOdds.moneylineA}/
                  {matchup.bettingOdds.moneylineB}
                </div>
              )}

              <div className='text-sm leading-relaxed'>
                <em>Matchup preview: Analysis of key players and game flow coming soon...</em>
              </div>

              <hr className='border-border' />

              {/* Same boxscore structure */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-xs font-semibold mb-1'>{matchup.teamA.teamName}</div>
                  <div className='space-y-1 text-xs'>
                    <div className='text-muted-foreground'>Starters with time windows...</div>
                  </div>
                </div>
                <div>
                  <div className='text-xs font-semibold mb-1'>{matchup.teamB.teamName}</div>
                  <div className='space-y-1 text-xs'>
                    <div className='text-muted-foreground'>Starters with time windows...</div>
                  </div>
                </div>
              </div>

              <hr className='border-border' />
            </div>
          ))}
      </div>

      {/* League Odds Snapshot */}
      <div className='space-y-6'>
        <h2 className='text-lg font-semibold'>League Odds Snapshot</h2>

        <div className='grid md:grid-cols-3 gap-6'>
          {/* Highest Scorers */}
          <div className='space-y-2'>
            <h3 className='text-md font-semibold'>Highest Scorers</h3>
            <div className='space-y-1 text-sm'>
              {leagueOdds.highestScorers.map((team, idx) => (
                <div key={team.rosterId} className='flex items-center justify-between'>
                  <div className='truncate'>
                    #{idx + 1} {team.teamName}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {team.projectedPoints.toFixed(1)} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lowest Scorers */}
          <div className='space-y-2'>
            <h3 className='text-md font-semibold'>Lowest Scorers</h3>
            <div className='space-y-1 text-sm'>
              {leagueOdds.lowestScorers.map((team, idx) => (
                <div key={team.rosterId} className='flex items-center justify-between'>
                  <div className='truncate'>
                    #{idx + 1} {team.teamName}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {team.projectedPoints.toFixed(1)} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Closest Matchups */}
          <div className='space-y-2'>
            <h3 className='text-md font-semibold'>Closest Matchups</h3>
            <div className='space-y-1 text-sm'>
              {leagueOdds.closestMatchups.map((matchup, idx) => (
                <div key={idx} className='flex items-center justify-between'>
                  <div className='truncate'>
                    #{idx + 1} {matchup.team1} vs {matchup.team2}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {matchup.margin.toFixed(1)} pt margin
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biggest Blowouts */}
          <div className='space-y-2'>
            <h3 className='text-md font-semibold'>Biggest Blowouts</h3>
            <div className='space-y-1 text-sm'>
              {leagueOdds.biggestBlowouts.map((matchup, idx) => (
                <div key={idx} className='flex items-center justify-between'>
                  <div className='truncate'>
                    #{idx + 1} {matchup.team1} vs {matchup.team2}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {matchup.margin.toFixed(1)} pt margin
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Scoring Matchups */}
          <div className='space-y-2'>
            <h3 className='text-md font-semibold'>Highest Scoring</h3>
            <div className='space-y-1 text-sm'>
              {leagueOdds.highestScoringMatchups.map((matchup, idx) => (
                <div key={idx} className='flex items-center justify-between'>
                  <div className='truncate'>
                    #{idx + 1} {matchup.team1} vs {matchup.team2}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {matchup.total.toFixed(1)} pts total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lowest Scoring Matchups */}
          <div className='space-y-2'>
            <h3 className='text-md font-semibold'>Lowest Scoring</h3>
            <div className='space-y-1 text-sm'>
              {leagueOdds.lowestScoringMatchups.map((matchup, idx) => (
                <div key={idx} className='flex items-center justify-between'>
                  <div className='truncate'>
                    #{idx + 1} {matchup.team1} vs {matchup.team2}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {matchup.total.toFixed(1)} pts total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className='border-border' />

      {/* NFL Game Windows Summary */}
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>NFL Game Windows</h2>
        {data.data.gameWindows.map((window, idx) => (
          <div key={idx} className='space-y-2'>
            <h3 className='text-md font-medium'>{window.name}</h3>
            <div className='grid md:grid-cols-2 gap-2 text-sm'>
              {window.games.map((game, gameIdx) => (
                <div key={gameIdx} className='bg-gauntlet-gold/10 px-3 py-2 rounded'>
                  <div className='font-medium'>
                    {game.awayTeam} @ {game.homeTeam}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {game.awayAbbrev} @ {game.homeAbbrev} •{' '}
                    {new Date(game.startTime).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Closing Note */}
      <div className='mt-8 text-sm leading-relaxed'>
        <div className='font-semibold mb-1'>Closing Note</div>
        Week 3 looks like the league's first inflection point. Will undefeateds hold serve? Will any
        0–2s crawl out of the pit? The Scribe will be here, logging receipts, roasting benches, and
        reminding you that Vegas odds mean nothing when Josh Allen decides to either save or ruin
        your life on Thursday night.
      </div>
    </div>
  );
}
