'use client';

import { PageHeader } from '@gauntlet/ui';
import { Badge } from '@/components/ui/badge';
import { colors as brandColors } from '@/lib/colors';

// Import Week 3 static data
import reportData from '@/data/report-week3';

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

// Week 3 narrative content
const WEEK3_CONTENT = {
  main_intro: `Gauntlet Week 3 Recap
League Overview

Three weeks in, tiers are forming. AFC: Hunter's Golden Age is the pace car at 3–0; Darshan/Kyle (Dr. Patel) just banked a signature win; Joel's Infinity finally cracked; Neil flashed ceiling with the week's lone 140+; Ben is alive. On the other end, Nolan's battling attrition (Kittle, Aaron Jones, Tracy), and Arpit/Yash haven't found a 90 yet despite Justin Jefferson. NFC: Jeffrey sits 3–0 by grinding, Akhil's unbeaten despite some lineup sins, Ziyan stumbled, Dhruv stabilized, and Vinny's the hard-luck 0–3 who keeps clearing 110.`,

  afc: {
    title: 'AFC',
    matchups: [
      {
        title:
          'Dr. Patel Parikh MD MBA (Darshan & Kyle, 2–1) def. To Infinity and Bijan (Joel, 2–1)',
        recap: `Infinity finally bled. The RB core showed teeth — David Montgomery detonated for ~30 and Bijan did his job — but outside of that duo, support evaporated (only one other starter even sniffed 15). That roster shape (loaded at RB, thin elsewhere) got exposed here.

Darshan/Kyle rode Lamar (high-20s, vintage control) and 20+ pops from Jordan Mason and Courtland Sutton. That trio gave them enough cushion to eat quiet days from Bowers, Chase Brown, and London. At 2–1, they look like a team that can stack wins; Joel needs his WR room to start carrying weight or the AFC's top tier will drift away.`,
      },
      {
        title: 'scboom5 (Shivang, 2–1) def. 2 Dolla Balla$ (Nolan, 1–2)',
        recap: `Nolan's Week-2 hangover lingered. Only three starters hit double digits, and injuries keep shaving his margin — Tracy joins Kittle and Aaron Jones on ice. That's not survivable without bench firepower.

Shivang survived a CeeDee donut thanks to a clean three-pack: Jalen Hurts (31), JSN (high-teens), and Omarion Hampton (22+). When one pillar blanks and three others post 18–31, you cruise. scboom to 2–1; Nolan needs bodies and a week without bad luck.

Notables: QB gap ~9 against Nolan; RB gap ~+13 to Shivang; D/ST gap ~+9 to Shivang.`,
      },
      {
        title: 'lol jerry jones (Neil, 2–1) def. vchak (Vinay, 1–2)',
        recap: `Ceiling game. Neil posted 146.9 — the AFC's only 140+ this season — and bagged weekly cash. The engine was the ground game: Jonathan Taylor and Quinshon Judkins rumbled for ~51 combined, and Marcus Mariota added 20+ from the QB spot (mostly with his legs). Taylor + Judkins alone beat Vinay's entire RB room by ~24, and A.J. Brown/Trey McBride kept the floor sturdy.

Vinay wasn't a corpse — CMC, Nico Collins, Ricky Pearsall all landed — but Higgins and DJ Moore ghosted, Pacheco stumbled, and there was no alternate script hiding on the pine. Neil climbs; losing Mike Evans muddies sustainability. Vinay's still searching for a second star to ride shotgun with CMC.`,
      },
      {
        title: 'The Golden Age (Hunter, 3–0) def. NielGetsCarried (Arpit & Yash, 0–3)',
        recap: `Metronomic. Caleb Williams (29) and Jahmyr Gibbs (26) were plenty even with Henry/Chase quiet, and Hunter sailed past 110 again. Through three, he's the AFC's most stable profile.

For Arpit/Yash, the headline is grim: three straight weeks under 90. Justin Jefferson finally flickered and Trey Benson looks viable, but the rest of the lineup isn't giving them a platform. 0–3 with low totals is a deep pit.

Notables: QB gap ~+11 to Hunter; WR gap ~+8 to Hunter.`,
      },
      {
        title: 'achak7 (Akhil, 2–1) def. Quonspiracy Theorists (Anant, 1–2) by 0.3',
        recap: `Anant's season is a coin flip. He won a razor last week; this time the bounce went the other way. When your D/ST is your top scorer, you're usually drawing thin, and quieter days from Saquon, Achane, BTJ left him a hair short.

Akhil nearly fumbled it himself — sub-100 total, started Ravens D into the Lions, left Skattebo's points unused — but Kyren and James Cook steadied him just enough. It wasn't pretty; it was a W. Akhil to 2–1 with questions; Anant to 1–2 with drama every Sunday night.

Notables: D/ST gap +21 Akhil; TE gap +9 Anant; WR gap –28 vs. Akhil.`,
      },
      {
        title: 'benweinfeld (Ben, 1–2) def. Nacua Matata (Adam, 1–2)',
        recap: `Breakthrough for Ben: Vikings D/ST (36.45) + Hunter Henry (25) was a 60-point sledgehammer that finally lit up his scoreboard. Losing James Conner stings going forward, but at least the roster flashed range.

Adam is stuck in the paradox — 100+ all three weeks with a 1–2 record to show for it. Breece and Puka did their jobs; the margins elsewhere didn't. At some point the steady totals have to convert or he's the league's hard-luck outsider.

Notables: D/ST gap –18 to Adam (Ben's +18 edge); TE gap –20 to Adam (Ben's Henry nuke).`,
      },
    ],
  },

  nfc: {
    title: 'NFC',
    matchups: [
      {
        title: 'Mach 10 (Dhruv, 1–2) def. ziyanp22 (2–1)',
        recap: `Set up as Monday night theater, ended as a formality. Jameson Williams vanished after the opening drive, Gibbs logged two early scores, and Dhruv/Krish's backfield plus defense carried it home despite Vikings D/ST (36.45) on Ziyan's side.

The builds are mirror-inverted: Ziyan's WRs (Puka, Keenan, Odunze/Jameson) look title-ready; his RBs feel fragile. Dhruv's RBs carry; his WRs are replacement-level. Both remain playoff material, but Ziyan's aura took its first dent.

Notables: RB gap –44 vs. Mach (Gibbs + SEA D push); WR gap +22 Ziyan; D/ST gap +16 Ziyan.`,
      },
      {
        title: 'Marginal Returns (Jeffrey, 3–0) def. Jaxon Dart-Njigba (Alex, 1–2)',
        recap: `Jeffrey stays perfect by leaning on stars and surviving variance. Caleb Williams (29.1) and A.J. Brown did the heavy lifting; Zay Flowers chipped in enough to offset a late Derrick Henry scare. It wasn't clean, but 3–0 rarely is.

Alex had the pieces to steal it: TB D/ST (21.3), Cam Skattebo (22.6), Courtland Sutton (20.8) all hit. Monday betrayed him — Goff + Flowers combined for just 15 while Detroit hoarded rushing TDs. The roster is competitive, but its ceiling is star-dependent.

Notables: QB gap –17 vs. Jeffrey (Caleb edge); D/ST gap +19 Alex; TE gap –15 Alex.`,
      },
      {
        title: 'C&G² (Josh, 2–1) def. vayyala (Vinay, 0–3)',
        recap: `This was the NFC's shootout, and Josh won with balance. Lamar (27) set tempo, but the real story was a lineup with no soft spots — every starter but one cleared 11. That profile wins fireworks weekends.

Vinay is the league's hard-luck case. Hurts (31) and Kyren (21.7) combined for nearly 60 and he still fell. It's the second time in three weeks he's cleared 110 and left empty-handed. The team is better than 0–3; the record won't care.

Notables: WR gap –21 vs. Josh; QB gap +4 Vinay; D/ST gap +11 Vinay.`,
      },
      {
        title: 'DJ Herbussy (Akhil, 3–0) def. RithikP (0–3)',
        recap: `College-rival energy, efficient execution. Herbussy didn't need fireworks — Jonathan Taylor (32.8) did the front-running and the rest stacked doubles. It's the third straight week the roster looked coherent, and 3–0 reflects it.

Rithik/Varun needed anyone besides the RB spot to show; only Jordan Mason (26.1) answered. With Burrow struggling and McCarthy dinged, the QB room is wobbling. 0–3 with middling totals is a bad combo; urgency is warranted.

Notables: QB gap ~+3 Herbussy; TE gap –24 vs. Herbussy; RB gap roughly even.`,
      },
      {
        title: 'cescott25 (Christian, 2–1) def. Saint Brown Does Mahomes (Aman, 1–2)',
        recap: `Christian keeps winning the unsexy way. All but two starters hit double digits, smoothing over another quiet WR day. It's a patchwork RB corps, but it keeps delivering points and pacing.

Aman fell to 1–2 despite Mahomes, Amon-Ra, and James Cook (21.8) doing their jobs. The rest of the lineup isn't helping — too many single-digits, not enough WR2/FLEX pop. On paper: contender. In practice: shallow.

Notables: WR gap –20 vs. Christian; QB gap –11 vs. Christian; RB gap +10 Aman.`,
      },
      {
        title: "lukebowsh (Luke, 2–1) def. Don't Go Chasing Saquon (Arnav, 0–3)",
        recap: `Luke absorbed a brutal injury double (Evans, CeeDee) and still won going away because Mark Andrews, Omarion Hampton, and CMC piled up 60+ by themselves. That's depth doing its job; it also underscores how thin he is until his WRs return.

Arnav's 0–3 is crisis-level. Saquon, Chase, Jacobs all underwhelmed again, and the supporting cast is below water. Starting Trautman and Josh Palmer isn't a long-term plan in this league. Without multiple stars spiking, he's drawing dead most weeks.

Notables: WR gap –20 vs. Luke; RB gap –16 vs. Luke; TE gap –12 vs. Luke.`,
      },
    ],
  },

  closing: `Week 3 hardened the tiers. Hunter's steady; Darshan/Kyle are ascending; Joel's build needs WR oxygen; Neil has real ceiling. In the NFC, Jeffrey/Akhil keep stacking, Ziyan bent, Dhruv steadied, Vinny's record belies performance, and Arnav/Varun-Rithik need more than good intentions. The gauntlet is doing what it does: separating signal from noise, one cruel Sunday at a time.`,
} as const;

// Import Week 4 Preview Data
import previewWeek4 from '@/data/preview-week4-2025.json';

// Type the imported data
interface PreviewPlayer {
  name: string;
  position: string;
  team: string;
  projection: number;
  timeWindow: string;
}

interface PreviewMatchup {
  teamA: {
    name: string;
    record: string;
    projection: number;
    players: PreviewPlayer[];
  };
  teamB: {
    name: string;
    record: string;
    projection: number;
    players: PreviewPlayer[];
  };
  bettingOdds: {
    favorite: 'teamA' | 'teamB';
    spread: number;
    moneylineA: number;
    moneylineB: number;
    total: number;
    over: string;
    under: string;
  };
  timeWindows: {
    thursdayNight: { teamA: number; teamB: number };
    early: { teamA: number; teamB: number };
    late: { teamA: number; teamB: number };
    sundayNight: { teamA: number; teamB: number };
    mondayNight: { teamA: number; teamB: number };
    other: { teamA: number; teamB: number };
  };
  narrative: string;
}

interface PreviewData {
  week: number;
  season: string;
  overview: string;
  afc: PreviewMatchup[];
  nfc: PreviewMatchup[];
  leagueOdds: any;
  generatedAt: string;
}

const WEEK4_PREVIEW = previewWeek4 as PreviewData;

// Organize matchups by time window for slate-based display
const organizeByTimeWindows = (matchups: PreviewMatchup[]) => {
  const slates = {
    thursdayNight: [] as PreviewMatchup[],
    early: [] as PreviewMatchup[],
    late: [] as PreviewMatchup[],
    sundayNight: [] as PreviewMatchup[],
    mondayNight: [] as PreviewMatchup[],
  };

  matchups.forEach(matchup => {
    // Find the primary time window for this matchup (most players)
    let primaryWindow = 'early';
    let maxPlayers = 0;

    Object.entries(matchup.timeWindows).forEach(([window, counts]) => {
      const totalPlayers = counts.teamA + counts.teamB;
      if (totalPlayers > maxPlayers) {
        maxPlayers = totalPlayers;
        primaryWindow = window;
      }
    });

    if (slates[primaryWindow as keyof typeof slates]) {
      slates[primaryWindow as keyof typeof slates].push(matchup);
    }
  });

  return slates;
};

const afcSlates = organizeByTimeWindows(WEEK4_PREVIEW.afc);
const nfcSlates = organizeByTimeWindows(WEEK4_PREVIEW.nfc);

const getTimeWindowName = (window: string) => {
  const names: { [key: string]: string } = {
    thursdayNight: 'Thursday Night',
    early: 'Early Sunday',
    late: 'Late Sunday',
    sundayNight: 'Sunday Night',
    mondayNight: 'Monday Night',
  };
  return names[window] || window;
};

interface BoxRow {
  playerId: string;
  name: string;
  position: string | null;
  points: number;
}

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

export default function Week3Report2025() {
  // Use hardcoded data like Week 2 does
  const data = { ok: true, data: reportData } as const;

  // Helper to match matchups with new narrative structure
  const getMatchupRecap = (teamAName: string, teamBName: string, leagueName: string) => {
    const isAFC = (leagueName || '').toLowerCase().includes('afc');
    const section = isAFC ? WEEK3_CONTENT.afc : WEEK3_CONTENT.nfc;

    // Find matching matchup by searching titles for team names
    const matchup = section.matchups.find(m => {
      const title = m.title.toLowerCase();
      const teamA = teamAName.toLowerCase();
      const teamB = teamBName.toLowerCase();
      return (
        title.includes(teamA) ||
        title.includes(teamB) ||
        (teamA.includes('dr') && title.includes('dr. patel')) ||
        (teamB.includes('dr') && title.includes('dr. patel')) ||
        (teamA.includes('infinity') && title.includes('infinity')) ||
        (teamB.includes('infinity') && title.includes('infinity')) ||
        (teamA.includes('golden') && title.includes('golden age')) ||
        (teamB.includes('golden') && title.includes('golden age')) ||
        (teamA.includes('nielgetscarried') && title.includes('nielgetscarried')) ||
        (teamB.includes('nielgetscarried') && title.includes('nielgetscarried'))
      );
    });

    return matchup ? { title: matchup.title, recap: matchup.recap } : null;
  };

  return (
    <div className='px-2 md:px-4 py-6 space-y-6 overflow-x-hidden'>
      <PageHeader title='Week 3 Report — 2025' subtitle='Championship contenders emerge' />

      {/* Main Introduction */}
      <div className='text-sm leading-relaxed space-y-4'>
        <div className='whitespace-pre-wrap'>{WEEK3_CONTENT.main_intro}</div>
      </div>

      {/* Data-driven Matchup Details */}
      <h2 className='text-lg font-semibold'>Matchup Details & Box Scores</h2>
      {data?.ok && data.data ? (
        <div className='space-y-8'>
          {(data.data.leagues || []).map(l => (
            <div key={l.leagueId} className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>{getConference(l.leagueName)}</Badge>
              </div>

              <div className='space-y-6'>
                {l.matchups.map(m => {
                  const recap = getMatchupRecap(m.teamAName || '', m.teamBName || '', l.leagueName);

                  return (
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

                      {/* Show recap if found */}
                      {recap ? (
                        <div className='text-sm leading-relaxed'>
                          <div className='font-medium mb-1'>{recap.title}</div>
                          <div className='whitespace-pre-wrap'>{recap.recap}</div>
                        </div>
                      ) : (
                        <div className='text-sm text-muted-foreground italic'>
                          Detailed recap available above
                        </div>
                      )}

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
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No data available</div>
      )}

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

      {/* Standings */}
      {data?.ok && data.data?.standings && data.data.standings.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>Current Standings</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            {data.data.standings.map(league => (
              <div key={league.leagueId} className='space-y-3'>
                <h3 className='font-semibold'>{league.leagueName}</h3>
                {Object.entries(league.divisions).map(([divName, teams]) => (
                  <div key={divName} className='space-y-2'>
                    <h4 className='text-sm font-medium text-muted-foreground'>{divName}</h4>
                    <div className='space-y-1'>
                      {teams.map((team: any) => (
                        <div key={team.rosterId} className='flex items-center justify-between'>
                          <div className='truncate'>
                            {team.teamName || team.name}
                            <span className='text-xs text-muted-foreground ml-2'>
                              PR #
                              {((data?.data?.powerRankings || []) as any[]).find(
                                (p: any) =>
                                  p.leagueId === league.leagueId &&
                                  String(p.rosterId) === String(team.rosterId)
                              )?.rank ?? '-'}
                            </span>
                          </div>
                          <div className='ml-2'>
                            {team.wins}-{team.losses} • {team.points.toFixed(1)} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hall of Fame */}
      {data?.ok && data.data?.hallOfFame && data.data.hallOfFame.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>Week 3 Hall of Fame</h2>
          <div className='space-y-2'>
            {data.data.hallOfFame.length > 0 ? (
              data.data.hallOfFame.map((entry: any, idx) => (
                <div key={idx} className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
                  <div className='font-medium'>{entry.category}</div>
                  <div className='text-sm'>{entry.description}</div>
                  <div className='text-xs text-muted-foreground'>
                    {entry.player} ({entry.team}) - {entry.value}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-sm text-muted-foreground'>No hall of fame entries yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Closing Note */}
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Closing Note</h2>
        <div className='text-sm leading-relaxed'>{WEEK3_CONTENT.closing}</div>
      </div>

      {/* Week 4 Preview */}
      <div className='space-y-6'>
        <h2 className='text-lg font-semibold'>Week 4 Preview</h2>

        {/* Overview */}
        <div className='text-sm leading-relaxed'>{WEEK4_PREVIEW.overview}</div>

        {/* Slate-based Matchup Display */}
        {(['AFC', 'NFC'] as const).map(conference => {
          const slates = conference === 'AFC' ? afcSlates : nfcSlates;

          return (
            <div key={conference} className='space-y-4'>
              <h3
                className={`text-base font-semibold ${conference === 'AFC' ? 'text-gauntlet-crimson' : 'text-blue-600'}`}
              >
                {conference}
              </h3>

              {Object.entries(slates).map(([timeWindow, windowMatchups]) => {
                if (windowMatchups.length === 0) return null;

                return (
                  <div key={timeWindow} className='space-y-3'>
                    {windowMatchups.map((matchup, index) => (
                      <div key={index} className='p-3 space-y-4'>
                        {/* Matchup Header */}
                        <div className='rounded-md bg-gauntlet-crimson/10 px-3 py-2'>
                          <div className='flex items-center justify-between text-base font-semibold'>
                            <div className='flex items-center gap-2'>
                              <span>{matchup.teamA.name}</span>
                              <span className='text-muted-foreground text-sm'>
                                ({matchup.teamA.record})
                              </span>
                              <span className='text-muted-foreground'>vs</span>
                              <span>{matchup.teamB.name}</span>
                              <span className='text-muted-foreground text-sm'>
                                ({matchup.teamB.record})
                              </span>
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {matchup.teamA.projection.toFixed(1)} vs{' '}
                              {matchup.teamB.projection.toFixed(1)}
                            </div>
                          </div>
                        </div>

                        {/* Betting Lines */}
                        <div className='text-xs text-muted-foreground space-y-1'>
                          <div>
                            <span className='font-medium'>Spread:</span>{' '}
                            {matchup.bettingOdds.favorite === 'teamA'
                              ? matchup.teamA.name
                              : matchup.teamB.name}{' '}
                            -{matchup.bettingOdds.spread} • ML:{' '}
                            {matchup.bettingOdds.moneylineA > 0 ? '+' : ''}
                            {matchup.bettingOdds.moneylineA} /{' '}
                            {matchup.bettingOdds.moneylineB > 0 ? '+' : ''}
                            {matchup.bettingOdds.moneylineB}
                          </div>
                          <div>
                            <span className='font-medium'>Total:</span> {matchup.bettingOdds.total}{' '}
                            • O/U: {matchup.bettingOdds.over}/{matchup.bettingOdds.under}
                          </div>
                        </div>

                        {/* Time Window Distribution Table */}
                        <div className='space-y-2'>
                          <h5 className='text-sm font-medium'>
                            Player Distribution by Game Window
                          </h5>
                          {(() => {
                            // Check if we need to show "Other" column
                            const hasOther =
                              (matchup.timeWindows.other?.teamA || 0) +
                                (matchup.timeWindows.other?.teamB || 0) >
                              0;

                            return (
                              <div className='overflow-x-auto'>
                                <table className='w-full text-xs'>
                                  <thead>
                                    <tr>
                                      <th className='text-left font-medium text-muted-foreground'></th>
                                      <th className='text-center font-medium text-muted-foreground'>
                                        Thu
                                      </th>
                                      <th className='text-center font-medium text-muted-foreground'>
                                        Early
                                      </th>
                                      <th className='text-center font-medium text-muted-foreground'>
                                        Late
                                      </th>
                                      <th className='text-center font-medium text-muted-foreground'>
                                        SNF
                                      </th>
                                      <th className='text-center font-medium text-muted-foreground'>
                                        MNF
                                      </th>
                                      {hasOther && (
                                        <th className='text-center font-medium text-muted-foreground'>
                                          Other
                                        </th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className='font-medium'>{matchup.teamA.name}</td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.thursdayNight?.teamA || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.early?.teamA || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.late?.teamA || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.sundayNight?.teamA || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.mondayNight?.teamA || 0}
                                      </td>
                                      {hasOther && (
                                        <td className='text-center'>
                                          {matchup.timeWindows.other?.teamA || 0}
                                        </td>
                                      )}
                                    </tr>
                                    <tr>
                                      <td className='font-medium'>{matchup.teamB.name}</td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.thursdayNight?.teamB || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.early?.teamB || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.late?.teamB || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.sundayNight?.teamB || 0}
                                      </td>
                                      <td className='text-center'>
                                        {matchup.timeWindows.mondayNight?.teamB || 0}
                                      </td>
                                      {hasOther && (
                                        <td className='text-center'>
                                          {matchup.timeWindows.other?.teamB || 0}
                                        </td>
                                      )}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Projected Starter Totals */}
                        <div className='space-y-2'>
                          <h5 className='text-sm font-medium'>Current Starter Projections</h5>
                          <div className='grid grid-cols-2 gap-4'>
                            {/* Team A Starters */}
                            <div>
                              <div className='text-xs font-semibold mb-2'>{matchup.teamA.name}</div>
                              <div className='space-y-1'>
                                {matchup.teamA.players.slice(0, 9).map((player, playerIndex) => (
                                  <div
                                    key={playerIndex}
                                    className='flex items-center justify-between text-xs'
                                  >
                                    <div className='truncate flex-1'>
                                      <span className='text-muted-foreground mr-1'>
                                        {player.position}
                                      </span>
                                      {player.name}
                                      {player.team && player.team !== 'FA' && (
                                        <span className='ml-1 text-muted-foreground'>
                                          ({player.team})
                                        </span>
                                      )}
                                    </div>
                                    <div className='font-medium'>
                                      {player.projection.toFixed(1)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <hr className='border-border my-2' />
                              <div className='flex items-center justify-between text-xs font-semibold'>
                                <span>Total</span>
                                <span>{matchup.teamA.projection.toFixed(1)}</span>
                              </div>
                            </div>

                            {/* Team B Starters */}
                            <div>
                              <div className='text-xs font-semibold mb-2'>{matchup.teamB.name}</div>
                              <div className='space-y-1'>
                                {matchup.teamB.players.slice(0, 9).map((player, playerIndex) => (
                                  <div
                                    key={playerIndex}
                                    className='flex items-center justify-between text-xs'
                                  >
                                    <div className='truncate flex-1'>
                                      <span className='text-muted-foreground mr-1'>
                                        {player.position}
                                      </span>
                                      {player.name}
                                      {player.team && player.team !== 'FA' && (
                                        <span className='ml-1 text-muted-foreground'>
                                          ({player.team})
                                        </span>
                                      )}
                                    </div>
                                    <div className='font-medium'>
                                      {player.projection.toFixed(1)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <hr className='border-border my-2' />
                              <div className='flex items-center justify-between text-xs font-semibold'>
                                <span>Total</span>
                                <span>{matchup.teamB.projection.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Matchup Narrative */}
                        {matchup.narrative && (
                          <div className='mt-3 pt-3 border-t border-gray-200'>
                            <div className='text-sm leading-relaxed text-muted-foreground'>
                              {matchup.narrative}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* League Odds Snapshot */}
        <div className='space-y-4'>
          <h3 className='text-base font-semibold'>Week 4 League Odds</h3>
          <div className='grid md:grid-cols-2 gap-6'>
            {/* Highest Scorers */}
            <div>
              <h4 className='text-sm font-semibold mb-2 text-green-600'>Highest Scorer</h4>
              <div className='space-y-1'>
                {WEEK4_PREVIEW.leagueOdds.highestScorer
                  .slice(0, 6)
                  .map((team: any, index: number) => (
                    <div key={index} className='flex items-center justify-between text-xs'>
                      <div>
                        <span className='font-medium'>{team.team}</span>
                        <Badge variant='outline' className='ml-1 text-xs'>
                          {team.leagueId}
                        </Badge>
                      </div>
                      <div>
                        <span>{(team.probability * 100).toFixed(1)}%</span>
                        <span className='ml-1 text-muted-foreground'>({team.odds})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Lowest Scorers */}
            <div>
              <h4 className='text-sm font-semibold mb-2 text-red-600'>Lowest Scorer</h4>
              <div className='space-y-1'>
                {WEEK4_PREVIEW.leagueOdds.lowestScorer
                  .slice(0, 6)
                  .map((team: any, index: number) => (
                    <div key={index} className='flex items-center justify-between text-xs'>
                      <div>
                        <span className='font-medium'>{team.team}</span>
                        <Badge variant='outline' className='ml-1 text-xs'>
                          {team.leagueId}
                        </Badge>
                      </div>
                      <div>
                        <span>{(team.probability * 100).toFixed(1)}%</span>
                        <span className='ml-1 text-muted-foreground'>({team.odds})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Closest Matchups */}
            <div>
              <h4 className='text-sm font-semibold mb-2 text-yellow-600'>Closest Matchup</h4>
              <div className='space-y-1'>
                {WEEK4_PREVIEW.leagueOdds.closestMatchup
                  .slice(0, 6)
                  .map((matchup: any, index: number) => (
                    <div key={index} className='flex items-center justify-between text-xs'>
                      <div>
                        <span className='font-medium'>
                          {matchup.teams[0]} vs {matchup.teams[1]}
                        </span>
                        <Badge variant='outline' className='ml-1 text-xs'>
                          {matchup.leagueId}
                        </Badge>
                      </div>
                      <div>
                        <span>{(matchup.probability * 100).toFixed(1)}%</span>
                        <span className='ml-1 text-muted-foreground'>({matchup.odds})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Biggest Blowouts */}
            <div>
              <h4 className='text-sm font-semibold mb-2 text-purple-600'>Biggest Blowout</h4>
              <div className='space-y-1'>
                {WEEK4_PREVIEW.leagueOdds.biggestBlowout
                  .slice(0, 6)
                  .map((matchup: any, index: number) => (
                    <div key={index} className='flex items-center justify-between text-xs'>
                      <div>
                        <span className='font-medium'>
                          {matchup.teams[0]} vs {matchup.teams[1]}
                        </span>
                        <Badge variant='outline' className='ml-1 text-xs'>
                          {matchup.leagueId}
                        </Badge>
                      </div>
                      <div>
                        <span>{(matchup.probability * 100).toFixed(1)}%</span>
                        <span className='ml-1 text-muted-foreground'>({matchup.odds})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Highest Scoring Matchups */}
            <div>
              <h4 className='text-sm font-semibold mb-2 text-blue-600'>Highest Scoring</h4>
              <div className='space-y-1'>
                {WEEK4_PREVIEW.leagueOdds.highestScoringMatchup
                  .slice(0, 6)
                  .map((matchup: any, index: number) => (
                    <div key={index} className='flex items-center justify-between text-xs'>
                      <div>
                        <span className='font-medium'>
                          {matchup.teams[0]} vs {matchup.teams[1]}
                        </span>
                        <Badge variant='outline' className='ml-1 text-xs'>
                          {matchup.leagueId}
                        </Badge>
                      </div>
                      <div>
                        <span>{(matchup.probability * 100).toFixed(1)}%</span>
                        <span className='ml-1 text-muted-foreground'>({matchup.odds})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Lowest Scoring Matchups */}
            <div>
              <h4 className='text-sm font-semibold mb-2 text-gray-600'>Lowest Scoring</h4>
              <div className='space-y-1'>
                {WEEK4_PREVIEW.leagueOdds.lowestScoringMatchup
                  .slice(0, 6)
                  .map((matchup: any, index: number) => (
                    <div key={index} className='flex items-center justify-between text-xs'>
                      <div>
                        <span className='font-medium'>
                          {matchup.teams[0]} vs {matchup.teams[1]}
                        </span>
                        <Badge variant='outline' className='ml-1 text-xs'>
                          {matchup.leagueId}
                        </Badge>
                      </div>
                      <div>
                        <span>{(matchup.probability * 100).toFixed(1)}%</span>
                        <span className='ml-1 text-muted-foreground'>({matchup.odds})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
