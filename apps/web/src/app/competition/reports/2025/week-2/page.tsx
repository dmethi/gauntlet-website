'use client';

import { PageHeader } from '@gauntlet/ui';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Callout } from '@/components/Callout';
import { colors as brandColors } from '@/lib/colors';
import reportData from '@/data/report-week2';

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

// Placeholder for Week 2 narrative overlay - to be populated by user
const WEEK2_NARRATIVE = {
  assistant_intro:
    "Week 2 brought decisive clarification across both conferences. The early season's chaos is starting to settle into distinct tiers, with some teams cementing their status as legitimate contenders while others are already staring down the barrel of a long rebuild.",
  scribe_note:
    "Quick note from your scribe: You'll notice there are no fancy win probability over time charts this week. Dhruv managed to break the GitHub Actions pipeline while 'improving' things (shocking, I know). Until he gets better IT help or stops messing with deployment configs, we're sticking to the good old-fashioned written word. At least the box scores still work!",
  nfc: {
    league_overview:
      'NFC Week 2 delivered on its early promise of volatility. Big performances, bigger collapses, and the kind of week that makes you question everything you thought you knew about your roster.',
    matchups: [
      {
        teams: ['Mach 10', 'Dont go Chasing Saquon'],
        recap:
          'Finally, Mach 10 lived up to the name. Daniels, Gibbs, and Achane all cracked 20, and four more chipped in 15 each (Pickens, Waddle, Dobbins, you name it). It was a full-team effort, the kind of "all hands on deck" week that erases the stink of Week 1. Across the field, Arnav had Ja\'Marr doing superhuman things while the rest of his lineup watched from the sidelines. Chase nearly doubled the combined totals of Wilson, Henry, Mooney, and Benson. That\'s not supporting cast, that\'s a tragic one-man show. Mach 10 steadies the ship at 1–1. Arnav? 0–2 and already staring down the barrel of "did I blow my budget on elites while my depth rotted?"',
      },
      {
        teams: ['ziyanp22', 'lukebowsh'],
        recap:
          "Ziyan is the early sledgehammer of the NFC. He stormed to 2–0 with Odunze and Jameson Williams leading a big bounce-back from the North. Luke? He looked human again, and when you're not gifted an opponent laying an egg, you actually have to elevate. Solid-but-unspectacular showings weren't enough against Ziyan's firepower. This wasn't a collapse, but it was a clear mismatch. Luke slips, Ziyan surges.",
      },
      {
        teams: ['Marginal Returns', 'vayyala'],
        recap:
          "Monday night miracle: Quentin Johnston's 60-yard TD before halftime saved Jeffrey. That bomb covered for Derrick Henry's clunker and tipped a tight matchup his way. Vinny, who got a head start Thursday thanks to Tucker Kraft's eruption, squandered the lead and fell to 0–2. Worse, he's failed to crack 110 two weeks running. Jeffrey, meanwhile, somehow lands at 2–0 despite barely changing his score from Week 1 (within 0.2 points!) and holding just 1.27 expected wins. That's the definition of skating on thin ice while chugging champagne.",
      },
      {
        teams: ['DJ Herbussy ', 'cescott25'],
        recap:
          "This was a curb stomp. Akhil vaults to 2–0 behind Drake Maye, Jonathan Taylor, and the Ravens defense, who nearly outscored Christian's entire lineup. Christian's \"best\" starter managed 13, and his second-highest was his defense. That's not just a bad week; that's a recipe for a lost season if it continues. Akhil is humming, Christian is praying.",
      },
      {
        teams: ['Saint Brown Does Mahomes', 'RithikP'],
        recap:
          "Amon-Ra delivered the hammer for Aman, who gets his first win and drops Rithik/Varun to 0–2. Malik Nabers went nuclear for Varun, but he had no backup singers — only Etienne cleared 10. Aman's roster, by contrast, had depth: Mahomes, Cook, Rhamondre all stacked up. To make matters worse, Varun's QB room is cursed: Burrow and McCarthy both out. Injuries, underperformance, and a zero in the win column… that's a brutal cocktail.",
      },
      {
        teams: ['C&G^2', 'Jaxson Dart-Njigba'],
        recap:
          'Josh needed a bounce back after Week 1 humiliation, and boy did he get it. Lamar, Davante, and Javonte led a blitzkrieg where only one starter dipped below 8. It was the definition of a total team win. Alex, last week\'s king of the hill, plummeted back to earth. No miracle saves, no "best score of the week" safety net. Just a straight-up blowout. Call it a market correction.',
      },
    ],
  },
  afc: {
    league_overview:
      "AFC Week 2 was all about separation. The top tier flexed, the middle scrambled for positioning, and the bottom... well, they're learning that fantasy football can be unforgiving.",
    matchups: [
      {
        teams: ['2 Dolla Balla$', 'Quonspiracy Theorists'],
        recap:
          "Heartbreak. Nolan needed just four points from Aaron Jones on Sunday night. Instead, he got five touches, 23 yards, and a hamstring wrapped in sadness courtesy of the Vikings offense. Anant, who's been living on the knife's edge all season, dodged the bullet and escaped 1–1. Nolan wasted a vintage Amon-Ra performance, but the real indictment is at tight end: Mason Taylor, started in 2% of Sleeper leagues, got him 1 point. There are 23 waiver-wire TEs who would've closed the gap. That's malpractice. Meanwhile, Anant's patched-together roster (Achane, Saquon, Warren) did just enough despite the Worthy injury, the Burrow debacle, and Brian Thomas face-planting. Sometimes survival is enough.",
      },
      {
        teams: ['The Golden Age', 'lol jerry jones'],
        recap:
          "Henry gave Hunter nothing (2 points). Didn't matter. Ja'Marr Chase exploded, Drake Maye (yep, that pickup) was sharp, and Hunter coasted to 2–0. Everything's working for him except the Jets. Neil, though… his roster looks allergic to scoring. Jonathan Taylor is doing his part, but the rest of the lineup is a black hole. Two weeks, two duds. If his rookies don't grow up fast, Neil's season will be buried before October.",
      },
      {
        teams: ['NielGetsCarried', 'vchak'],
        recap:
          "Another wasted week for Arpit and Yash. The Jets anchors chained them down again, and the managerial decisions didn't help — starting the Bears defense against the Lions' home opener? That's galaxy-brain tanking. There were five better waiver options that all would've flipped the outcome. Instead, they're 0–2 and staring at the abyss. Vchak? Bo Nix and CMC got him over the line. It wasn't inspiring, but it was enough. Still, this game probably didn't change either team's trajectory: bleak and bleaker.",
      },
      {
        teams: ['Nacua Matata', 'Dr Patel Parikh MD MBA'],
        recap:
          "Adam needed a bounce back and got one in emphatic fashion. Puka, Ken Walker, Jayden Daniels — all went off, and Adam ran up the score. Darshan/Kyle wasted a vintage Lamar day because nobody else showed up. When your defense is your second-highest scorer, you've already lost. This was a beatdown that raises a question: aberration, or exposure?",
      },
      {
        teams: ['To Infinity and Bijan', 'benweinfeld'],
        recap:
          "Joel is building a cathedral out of rushing yards. Bijan, Javonte, Etienne — all stellar, and Joel now has nearly 700 yards through two weeks, more than entire divisions. That's absurd. He's got cushion to figure out his WR mess while cruising at 2–0. Ben, on the other hand, is in free fall. Still waiting on his rookies and Rashee Rice to show, still leaving three 17-point scorers on the bench, still 0–2. Maybe he's playing the long game, maybe he's just playing himself. Either way, eyebrows are raised.",
      },
      {
        teams: ['achak7', 'scboom5'],
        recap:
          "Game of the week for scoring, but only because Akhil detonated. James Cook, Nabers, Odunze, Ravens D, and Dak combined for the single highest total in the league so far. A thunderous bounce back after Week 1. Shivang actually had a nice head start thanks to Tucker Kraft, but Charbonnet epitomized the pain with 15 carries for 10 yards. There wasn't a manager in the league who could've kept up with Akhil this week. Sometimes the only move is to eat the gut punch and move on.",
      },
    ],
  },
  closing_note:
    "Week 3 approaches with clear battle lines drawn. The contenders have announced themselves, the pretenders have been exposed, and the rebuilders... they've got some soul-searching to do.",
} as const;

const WEEK2_COMBINED_OVERVIEW =
  'The early storylines are crystallizing: some teams have the depth and management to weather storms, others are learning that star power without supporting cast leads to tragic one-man shows.';

// Editor commentary placeholder - to be filled by user
const EDITOR_INTRO = `Much more exciting week than week 1, as we finally got some more scoring (well, for some of us at least). 16 teams outscored their total from week 1, highlighted by:
• Akhil going from 104 to 161, taking top scorer honor in the process
• Yours truly, doubling my total from 73 to 140 (thank fucking god)
• Josh, going from 82 to 133

We also got some notable drops:
• Darshan dropping from 120 to 70 
• Alex dropping from 134 to 91 (that top scorer week is probably a distant memory by now)

With all the action settled from the week, we end up with a much clearer picture on the state of the full league. Not shockingly, it's sweaty as fuck, with not much differentiation between the best and worst teams. There are 14 teams at 1-1 (5 teams each at 2-0 and 0-2). It is absolutely still anyone's game. Some interesting trends to point out though:
• AFC has a much wider range of team performance. 4 of the 5 worst teams are in the AFC, but the AFC also has the top 2 teams. Darshan/Kyle, Arpit/Yash, Ben, and Vinay have a mountain to climb, while Akhil, Hunter, and Joel are probably enjoying their view from the summit. Meanwhile, the NFC range is much more compressed.
• Hunter has won the luck of the draw with the worst division — the other 3 teams are averaging 90 points per week (the other 20 teams are currently averaging 109 points per week)
• Meanwhile the AFC West looks like the NFL NFC North, with Ben playing the role of the Bears (getting eaten alive by the other 3 teams currently averaging 123 points per week)

Also wanted to highlight some fun superlatives from the hall of fame and shame:
• Akhil and Ziyan both got 75+ points (and 450+ yards) from their receivers this week, easily the highest so far this season (by far). Meanwhile, Darshan/Kyle only got 5.5 points from their receivers. Sounds made up, but I promise it isn't! 
• This is two weeks in a row that Christian has failed to clear 15 points from his running backs (he has the 3rd and 4th worst total of the season so far). Clearly his 8 running backs aren't getting it done.
• Luke now has 2.4 points from his TE position after the first 2 weeks. 
• Akhil is pulling all the right levers at the defense position. Both weeks, his defense has cleared 19 points. 
• Joel's running backs have already amassed almost 700 rushing yards on the season. Christian's backs have amassed 168.

Obviously there's a lot more game to be played. I'm sure everyone is ready for the final week of the early-season divisional action! Should be a ton of fun as always.`;

// Editor callouts for specific matchups
const EDITOR_CALLOUTS: Record<string, string> = {
  'lol jerry jones vs The Golden Age':
    'Jonathan Taylor probably feels right at home, going crazy while the rest of the roster eats shit. Meanwhile Hunter gets some comedic relief from the Jets ineptitude. Fantasy win > real life win?',
  'NielGetsCarried vs vchak':
    'Lol GPT misread my notes about Justin Jefferson and interpreted as Jets. But yes Justin Jefferson was chained down. Fuck.',
  'Nacua Matata vs Dr Patel Parikh MD MBA':
    "I think what this dumbass GPT was trying to say is that it's an open question of whether Week 1 or Week 2 is the reality for Darshan/Kyle. Only time will tell!",
  'Mach 10 vs Dont go Chasing Saquon': 'WE BACK BABY',
  'RithikP vs Saint Brown Does Mahomes':
    'Can confirm that that indeed is a brutal cocktail. Actively advised not to mix those ingredients in bartending school. Would not recommend.',
};

interface SeriesPoint {
  timestamp: string;
  winProbA: number;
  winProbB: number;
  gameProgress: number;
  team1Score?: number | null;
  team2Score?: number | null;
}

interface BoxRow {
  playerId: string;
  name: string;
  position: string | null;
  points: number;
}

interface MatchupView {
  leagueId: string;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  teamAName?: string;
  teamBName?: string;
  pointsA: number;
  pointsB: number;
  margin: number;
  combinedPoints: number;
  excitement: number;
  startersA?: string[];
  startersB?: string[];
  startersPointsA?: Record<string, number>;
  startersPointsB?: Record<string, number>;
  series?: SeriesPoint[];
  boxscoreA?: BoxRow[];
  boxscoreB?: BoxRow[];
  excitementMetrics?: { leadChanges: number; avgDeltaPct: number };
  recap?: string;
  odds?: string[];
  narrativeRecap?: string;
}

interface ApiLeague {
  leagueId: string;
  leagueName: string;
  overview?: string;
  matchups: MatchupView[];
}

interface HallOfFameEntry {
  category: string;
  description: string;
  player: string;
  team: string;
  value: string;
  isNewThisWeek: boolean;
}

interface ApiResponse {
  ok: boolean;
  data?: {
    season: string;
    week: number;
    myIntro?: string;
    scribeIntro?: string;
    leagues: ApiLeague[];
    standings?: {
      leagueId: string;
      leagueName: string;
      divisions: Record<string, any[]>;
    }[];
    powerRankings?: {
      leagueId: string;
      rosterId: string;
      name: string;
      score: number;
    }[];
    upcoming?: Record<string, any[]>;
    callouts?: Record<string, string>;
    hallOfFame?: HallOfFameEntry[];
  };
}

// Note: Win probability chart and score chart components removed as requested

function MiniBoxscore({ rows }: { rows: BoxRow[] | undefined }) {
  const items = (rows || []).slice(0, 9);
  if (!items.length) return <div className='text-xs text-muted-foreground'>No starters</div>;
  return (
    <div className='space-y-1'>
      {items.map(p => (
        <div key={p.playerId} className='flex items-center justify-between text-xs'>
          <div className='truncate'>
            <span className='text-muted-foreground mr-1'>{p.position}</span>
            {p.name}
          </div>
          <div className='font-medium'>{p.points.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Week2Report2025() {
  // Use hardcoded data instead of API fetch
  const data = { ok: true, data: reportData } as const;

  // Overlay helpers for narrative matching (simplified for week 2 framework)

  const augmentedLeagues = useMemo(() => {
    return (data.data.leagues || []).map(l => {
      const isAFC = (l.leagueName || '').toLowerCase().includes('afc');
      const section = isAFC ? WEEK2_NARRATIVE.afc : WEEK2_NARRATIVE.nfc;

      // Augment matchups with narrative recaps
      const matchups = l.matchups.map(m => {
        // Find matching narrative recap by team names
        const narrativeMatchup = section.matchups.find(nm => {
          const narrativeTeams = nm.teams.map(t => t.toLowerCase().trim());
          const teamAName = (m.teamAName || '').toLowerCase().trim();
          const teamBName = (m.teamBName || '').toLowerCase().trim();

          return (
            (narrativeTeams.includes(teamAName) && narrativeTeams.includes(teamBName)) ||
            narrativeTeams.includes(teamAName) ||
            narrativeTeams.includes(teamBName)
          );
        });

        return {
          ...m,
          narrativeRecap: narrativeMatchup?.recap,
        };
      });

      return { ...l, overview: section.league_overview || l.overview, matchups };
    });
  }, []);

  return (
    <div className='px-2 md:px-4 py-6 space-y-6 overflow-x-hidden'>
      <PageHeader title='Week 2 Report — 2025' subtitle='AFC + NFC' />

      {/* User's Intro Section */}
      <div className='text-sm leading-relaxed space-y-3'>
        <h2 className='text-lg font-semibold'>Commissioner Introduction</h2>
        <div className='whitespace-pre-wrap'>{EDITOR_INTRO}</div>
      </div>

      {/* Scribe Introduction */}
      <div className='text-sm leading-relaxed'>
        <div className='font-semibold mb-1'>Scribe Overview</div>
        <div>{WEEK2_NARRATIVE.assistant_intro}</div>
        <div className='mt-2'>{WEEK2_COMBINED_OVERVIEW}</div>
      </div>

      {/* Scribe Note about missing charts */}
      <Callout by='Scribe' tone='info' title='Technical Difficulties'>
        {WEEK2_NARRATIVE.scribe_note}
      </Callout>

      {/* Matchup Recaps */}
      <h2 className='text-lg font-semibold'>Matchup Recaps</h2>
      {data?.ok && data.data ? (
        <div className='space-y-8'>
          {augmentedLeagues.map(l => (
            <div key={l.leagueId} className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>{getConference(l.leagueName)}</Badge>
              </div>

              <div className='space-y-6'>
                {l.matchups.map(m => (
                  <div key={`${l.leagueId}-${m.matchupId}`} className='p-3 space-y-3'>
                    <div className='rounded-md bg-gauntlet-crimson/10 px-3 py-2'>
                      {/* Mobile-first stacked layout */}
                      <div className='sm:hidden'>
                        <div className='flex items-center justify-between text-base font-semibold mb-1'>
                          <span className='truncate flex-1 mr-2'>
                            {m.teamAName || `Team ${m.rosterAId}`}
                          </span>
                          <span className='text-right font-mono'>{m.pointsA.toFixed(2)}</span>
                        </div>
                        <div className='flex items-center justify-between text-base font-semibold'>
                          <span className='truncate flex-1 mr-2'>
                            {m.teamBName || `Team ${m.rosterBId}`}
                          </span>
                          <span className='text-right font-mono'>{m.pointsB.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Desktop horizontal layout */}
                      <div className='hidden sm:flex items-center justify-between text-base font-semibold'>
                        <div className='truncate max-w-[45%]'>
                          {m.teamAName || `Team ${m.rosterAId}`} ({m.pointsA.toFixed(2)})
                        </div>
                        <div className='text-muted-foreground px-2'>vs</div>
                        <div className='truncate text-right max-w-[45%]'>
                          {m.teamBName || `Team ${m.rosterBId}`} ({m.pointsB.toFixed(2)})
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-xxs'>
                      {/* Derby badges can be added here as needed */}
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      Combined: {m.combinedPoints.toFixed(1)} • Margin: {m.margin.toFixed(1)}
                      {m.excitementMetrics ? (
                        <>
                          {' '}
                          • Lead changes: {m.excitementMetrics.leadChanges} • Avg Δ WP:{' '}
                          {m.excitementMetrics.avgDeltaPct.toFixed(1)}%
                        </>
                      ) : null}
                    </div>

                    {/* Win Probability Chart removed due to bad data */}

                    {/* Matchup recap text */}
                    {m.narrativeRecap ? (
                      <div className='text-sm leading-relaxed'>{m.narrativeRecap}</div>
                    ) : (
                      <div className='text-sm text-muted-foreground italic'>
                        Matchup recap not found - check team name matching
                      </div>
                    )}

                    {/* Commissioner callouts */}
                    {(() => {
                      const callouts = EDITOR_CALLOUTS;
                      const keys = Object.keys(callouts);
                      if (!keys.length) return null;
                      const teamA = (m.teamAName || '').toLowerCase().trim();
                      const teamB = (m.teamBName || '').toLowerCase().trim();

                      // Find a callout key that contains both team names
                      const hit = keys.find(key => {
                        const keyLower = key.toLowerCase();
                        return (
                          (keyLower.includes(teamA) && keyLower.includes(teamB)) ||
                          (keyLower.includes(teamB) && keyLower.includes(teamA))
                        );
                      });

                      return hit ? (
                        <Callout by='Commissioner' tone='spice' title='Commissioner Note'>
                          {callouts[hit]}
                        </Callout>
                      ) : null;
                    })()}

                    {/* Box scores */}
                    <hr className='border-border' />
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <div className='text-xs font-semibold mb-1'>
                          {m.teamAName || `Team ${m.rosterAId}`}
                        </div>
                        <MiniBoxscore rows={m.boxscoreA} />
                      </div>
                      <div>
                        <div className='text-xs font-semibold mb-1'>
                          {m.teamBName || `Team ${m.rosterBId}`}
                        </div>
                        <MiniBoxscore rows={m.boxscoreB} />
                      </div>
                    </div>
                    <hr className='border-border' />
                  </div>
                ))}
              </div>
              <hr className='border-border' />
            </div>
          ))}

          {/* Power Rankings */}
          <h2 className='text-lg font-semibold'>Power Rankings</h2>
          <div className='space-y-2 text-sm'>
            {((data.data.powerRankings || []) as any[]).map((p: any) => {
              const val = p.normalized as number;
              const min = 80;
              const max = 120;
              const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
              const rdylgn = brandColors.rdylgn;
              const pos = t * (rdylgn.length - 1);
              const i0 = Math.floor(pos);
              const i1 = Math.min(rdylgn.length - 1, i0 + 1);
              const f = pos - i0;
              const hexToRgb = (hex: string | undefined) => {
                if (!hex) return { r: 128, g: 128, b: 128 };
                const m = hex.replace('#', '');
                const r = parseInt(m.slice(0, 2), 16);
                const g = parseInt(m.slice(2, 4), 16);
                const b = parseInt(m.slice(4, 6), 16);
                return { r, g, b };
              };
              const c0 = hexToRgb(rdylgn[i0] || rdylgn[0]);
              const c1 = hexToRgb(rdylgn[i1] || rdylgn[rdylgn.length - 1]);
              const r = Math.round(c0.r + (c1.r - c0.r) * f);
              const g = Math.round(c0.g + (c1.g - c0.g) * f);
              const b = Math.round(c0.b + (c1.b - c0.b) * f);
              const bg = `rgba(${r}, ${g}, ${b}, 0.24)`;

              return (
                <div
                  key={`${p.leagueId}-${p.rosterId}`}
                  className='flex items-center justify-between rounded px-2 py-1'
                  style={{ backgroundColor: bg }}
                >
                  <div className='truncate'>
                    #{p.rank} {p.name}
                    {p.deltaLabel && (
                      <span
                        className={`ml-1 text-xs font-medium ${
                          p.deltaLabel.startsWith('+')
                            ? 'text-green-600'
                            : p.deltaLabel.startsWith('-')
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        }`}
                      >
                        ({p.deltaLabel})
                      </span>
                    )}
                    <Badge variant='outline' className='ml-2 text-xs'>
                      {data?.data?.leagues?.find(l => l.leagueId === p.leagueId)?.leagueName}
                    </Badge>
                    {Number.isFinite(p.wins) && Number.isFinite(p.losses) ? (
                      <span className='text-muted-foreground ml-2 text-xs'>
                        ({p.wins}-{p.losses})
                      </span>
                    ) : null}
                  </div>
                  <div className='ml-2 text-xs text-muted-foreground'>{val}</div>
                </div>
              );
            })}
          </div>
          <hr className='border-border' />

          {/* League-by-League Power Rankings */}
          <h2 className='text-lg font-semibold'>League Power Rankings</h2>
          <div className='space-y-4'>
            {data?.data?.leagues?.map(l => {
              const leagueRanks = ((data?.data?.powerRankings || []) as any[]).filter(
                (p: any) => p.leagueId === l.leagueId
              );
              return (
                <div key={l.leagueId} className='mb-4'>
                  <h3 className='text-md font-semibold'>{getConference(l.leagueName)}</h3>
                  <div className='space-y-1 text-sm'>
                    {leagueRanks.map(p => (
                      <div
                        key={p.rosterId}
                        className='flex items-center justify-between rounded px-2 py-1'
                      >
                        <div className='truncate'>
                          #{p.rank} {p.name}
                        </div>
                        <div className='ml-2 text-xs text-muted-foreground'>{p.normalized}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <hr className='border-border' />

          {/* Divisional Standings */}
          <h2 className='text-lg font-semibold'>Divisional Standings</h2>
          <div className='space-y-6'>
            {data?.data?.standings?.map(s => (
              <div key={s.leagueId} className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>{getConference(s.leagueName)}</Badge>
                </div>
                <div className='grid md:grid-cols-3 gap-4'>
                  {Object.entries(s.divisions || {}).map(([divName, teams]: any) => (
                    <div key={divName} className='space-y-2'>
                      <div className='text-sm font-semibold'>{divName}</div>
                      <div className='space-y-1 text-xs'>
                        {(teams as any[]).map(t => (
                          <div key={t.rosterId} className='flex items-center justify-between'>
                            <div className='truncate'>
                              {t.teamName || t.name}
                              <span className='text-xs text-muted-foreground ml-2'>
                                PR #
                                {((data?.data?.powerRankings || []) as any[]).find(
                                  (p: any) =>
                                    p.leagueId === s.leagueId &&
                                    String(p.rosterId) === String(t.rosterId)
                                )?.rank ?? '-'}
                              </span>
                            </div>
                            <div className='ml-2'>
                              {t.wins}-{t.losses} • {t.points.toFixed(1)} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <hr className='border-border' />
              </div>
            ))}
          </div>

          {/* Upcoming Matchups */}
          <h2 className='text-lg font-semibold'>
            Upcoming Matchups (Week {Number((data.data as any).week) + 1})
          </h2>
          <div className='space-y-4'>
            {Object.entries((data.data as any).upcoming || {}).map(([leagueId, pairs]: any) => (
              <div key={leagueId} className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>
                    {getConference(
                      (data.data?.leagues || []).find(l => l.leagueId === leagueId)?.leagueName ||
                        leagueId
                    )}
                  </Badge>
                </div>
                <div className='grid md:grid-cols-2 gap-2 text-sm'>
                  {(pairs as any[]).map(p => (
                    <div
                      key={`${leagueId}-${p.matchupId}`}
                      className='flex items-center justify-start gap-2'
                    >
                      <div className='truncate'>{p.teamAName}</div>
                      <div className='text-muted-foreground'>vs</div>
                      <div className='truncate'>{p.teamBName}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Superlatives Section removed due to too much noise */}

          {/* Closing Note */}
          {WEEK2_NARRATIVE.closing_note ? (
            <div className='mt-8 text-sm leading-relaxed'>
              <div className='font-semibold mb-1'>Closing Note</div>
              {WEEK2_NARRATIVE.closing_note}
            </div>
          ) : null}
        </div>
      ) : (
        <div className='text-sm text-muted-foreground'>No data available</div>
      )}
    </div>
  );
}
