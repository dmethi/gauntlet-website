'use client';

import { PageHeader } from '@gauntlet/ui';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Callout } from '@/components/Callout';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartColors } from '@/lib/chart-colors';
import { colors as brandColors } from '@/lib/colors';

// Import Week 3 static data
import reportData from '@/data/report-week3';

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

// Week 3 narrative overlay
const WEEK3_NARRATIVE = {
  assistant_intro:
    "Week 3 delivered the season's first true statement games. The pretenders got exposed, the contenders flexed their depth, and a few surprising challengers emerged from the pack. With three weeks in the books, the early playoff picture is starting to crystallize.",
  nfc: {
    league_overview:
      'The NFC saw seismic shifts this week. Some juggernauts lived up to their billing while others came crashing back to earth. The division races are heating up with legitimate contenders separating from the pack.',
    matchups: [
      {
        teams: ['Marginal Returns', 'Jaxson Dart-Njigba'],
        recap:
          "Marginal Returns stayed perfect at 3-0 behind a masterful performance from Caleb Williams and the dynamic duo of Bijan and Derrick Henry. The ground game alone nearly outscored Alex's entire lineup. For Alex, the Trevor Lawrence experiment continues to underwhelm, and when your best scorer only hits 22, you're fighting an uphill battle. Jeffrey's depth is showing - this wasn't just star power, it was a complete roster firing on all cylinders.",
      },
      {
        teams: ['vayyala', 'C&G^2'],
        recap:
          "Vinny finally put it together! After two frustrating weeks, his team clicked with Jalen Hurts leading the charge and solid contributions across the board. The win moves him to 1-2 and provides much-needed momentum. Josh's squad, meanwhile, continues to be maddeningly inconsistent. They can explode one week and vanish the next. That kind of volatility makes for stressful Sundays.",
      },
      {
        teams: ['DJ Herbussy', 'RithikP'],
        recap:
          "Akhil's perfect season rolls on. The Drake Maye-Jonathan Taylor connection is becoming must-watch fantasy football, and when you add the Baltimore defense clicking, this team looks like a legitimate championship threat. Poor Varun drops to 0-3, and the Joe Burrow injury couldn't have come at a worse time. Three losses through three weeks isn't insurmountable, but the margin for error is evaporating fast.",
      },
      {
        teams: ['Saint Brown Does Mahomes', 'cescott25'],
        recap:
          "Statement game of the week. Aman absolutely obliterated Christian with the season's highest individual score so far - 159.73. Mahomes, Cook, and both St. Brown brothers combined for pure fantasy dominance. This wasn't just a win, it was a declaration. Christian, meanwhile, continues to struggle mightily. At 1-2 with back-to-back duds, the season is slipping away fast.",
      },
      {
        teams: ['ziyanp22', 'Mach 10'],
        recap:
          "Dhruv's revenge! After a surprising Week 2 loss, Mach 10 bounced back in emphatic fashion. Jayden Daniels put on an absolute clinic, and the depth pieces all contributed. Ziyan's high-powered offense finally met its match, dropping to 2-1. Still a strong record, but this loss serves notice that nobody's invincible in this league.",
      },
      {
        teams: ['Dont go Chasing Saquon', 'lukebowsh'],
        recap:
          'Nail-biter of the week! Saquon Barkley carried Arnav to a crucial 5-point victory that keeps playoff hopes alive. Luke fought hard with a balanced attack led by CeeDee Lamb, but fell just short. Sometimes fantasy comes down to the narrowest margins, and this was one of those weeks. Both teams played well, but Arnav gets the W and some breathing room.',
      },
    ],
  },
  afc: {
    league_overview:
      'AFC Week 3 was all about the established powers asserting their dominance while the bottom tier struggled to keep pace. The Golden Age continues to look unstoppable while several teams are already in must-win territory.',
    matchups: [
      {
        teams: ['Dr Patel Parikh MD MBA', 'To Infinity and Bijan'],
        recap:
          "What a turnaround for Darshan/Kyle! After getting demolished in Week 2, they came roaring back with Lamar Jackson leading the charge. Chase Brown and Brock Bowers provided the supporting cast in a dominant performance that announced their return to relevance. Joel's squad, meanwhile, had their perfect season snapped. Still a strong 2-1 record, but this loss serves as a reminder that even the best rosters have off weeks.",
      },
      {
        teams: ['benweinfeld', 'Nacua Matata'],
        recap:
          "Ben finally got his breakthrough! After two frustrating losses, everything clicked in Week 3. Herbert, Jeanty, and McLaurin led a balanced attack that overwhelmed Adam's usually reliable squad. The win moves Ben to 1-2 and provides crucial momentum. For Adam, this was an uncharacteristic stumble - Puka and the passing game couldn't overcome a sluggish ground game.",
      },
      {
        teams: ['The Golden Age', 'NielGetsCarried'],
        recap:
          "The Golden Age made it look easy. Drake Maye's ascension continues to be the story of the season - 34.72 points from a 'rookie' QB is video game stuff. Add in Jahmyr Gibbs going off and Ja'Marr Chase being Ja'Marr Chase, and this was never in doubt. Hunter cruises to 3-0 while Arpit continues to search for answers at 0-3. Time is running out for the early season strugglers.",
      },
      {
        teams: ['lol jerry jones', 'vchak'],
        recap:
          "Neil bounces back! After struggling early, his team found its rhythm with Justin Fields providing stability under center. The supporting cast finally showed up, and the win moves him to 2-1 and right back in the playoff conversation. Yash played it close but couldn't quite get over the finish line. Still, an improved showing gives hope for the weeks ahead.",
      },
      {
        teams: ['achak7', 'Quonspiracy Theorists'],
        recap:
          "Another big week for Akhil! Dak Prescott and the aerial attack carved up Anant's defense, with Malik Nabers and Rome Odunze providing the fireworks. This team is starting to look like a juggernaut - 2-1 with explosive upside. For Anant, the season continues to disappoint. Joe Burrow's struggles have been costly, and at 1-2, every game is becoming crucial.",
      },
      {
        teams: ['2 Dolla Balla$', 'scboom5'],
        recap:
          "Nolan's squad bounced back in style! Josh Allen reminded everyone why he's an elite fantasy quarterback, and Amon-Ra St. Brown continues to be matchup-proof. The supporting cast chipped in just enough for a convincing victory. Shivang tried to keep pace with Jalen Hurts having a solid game, but it wasn't enough. Both teams are now 2-1, but Nolan's trending up while Shivang's treading water.",
      },
    ],
  },
} as const;

const WEEK3_COMBINED_OVERVIEW =
  'Week 3 brought clarity to the championship picture: some teams have the stars and depth to sustain excellence, while others are learning that consistency is the hardest thing to achieve in fantasy football.';

// Editor commentary
const EDITOR_INTRO = `Week 3 delivered some absolute fireworks! We saw statement games, crucial bounce-back performances, and several teams cement their status as championship contenders.

Highlights include:
• **Drake Maye Era**: The rookie QB continues his fantasy ascension with another dominant performance
• **Lamar's Revenge**: Jackson bounced back from a rough Week 2 with a vintage showing
• **Saquon Magic**: Barkley carried his team to a nail-biting victory
• **Perfect Seasons**: The Golden Age, DJ Herbussy, and Marginal Returns all stay undefeated

The playoff races are heating up with several teams already in must-win territory. Week 4 can't come soon enough!`;

// Editor callouts for specific matchups
const EDITOR_CALLOUTS: Record<string, string> = {
  'Saint Brown Does Mahomes vs cescott25':
    "Statement game of the season so far. When both Amon-Ra AND Justin Jefferson go off for you, you know it's your week. Meanwhile Christian is learning that 159 points against you makes for a very long Sunday.",
  '2 Dolla Balla$ vs scboom5':
    'Josh Allen reminder game. Sometimes the elite QBs just flex on everyone else and remind you why you drafted them early. Nolan gets the W and some much-needed momentum.',
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
  series?: SeriesPoint[];
  boxscoreA?: BoxRow[];
  boxscoreB?: BoxRow[];
  excitementMetrics?: { leadChanges: number; avgDeltaPct: number };
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

// Win Probability Chart
function WinProbChart({
  series,
  teamAName,
  teamBName,
}: {
  series: SeriesPoint[] | undefined;
  teamAName: string;
  teamBName: string;
}) {
  const chartColors = useChartColors();

  if (!series || series.length === 0) {
    return (
      <div className='h-48 flex items-center justify-center bg-gray-50 rounded border'>
        <p className='text-sm text-muted-foreground'>No win probability data available</p>
      </div>
    );
  }

  const data = series.map((point, idx) => ({
    idx,
    t: new Date(point.timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
    }),
    A: (point.winProbA * 100).toFixed(1),
    B: (point.winProbB * 100).toFixed(1),
  }));

  return (
    <div className='h-48 w-full min-w-0 select-none'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke={chartColors.grid} />
          <XAxis dataKey='idx' stroke={chartColors.axis} tick={false} />
          <YAxis domain={[0, 100]} stroke={chartColors.axis} width={28} />
          <Tooltip
            contentStyle={{
              background: chartColors.tooltip.background,
              color: chartColors.tooltip.text,
              border: `1px solid ${chartColors.brandPrimary}`,
            }}
            labelFormatter={(label: any) => data[label]?.t || ''}
            formatter={(value: any, name: string) => [
              `${value}%`,
              name === 'A' ? teamAName : teamBName,
            ]}
          />
          <Line
            type='monotone'
            dataKey='A'
            name={teamAName}
            stroke={chartColors.primary}
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
          />
          <Line
            type='monotone'
            dataKey='B'
            name={teamBName}
            stroke={chartColors.secondary}
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Score Over Time Chart
function ScoreChart({
  series,
  teamAName,
  teamBName,
}: {
  series: SeriesPoint[] | undefined;
  teamAName: string;
  teamBName: string;
}) {
  const chartColors = useChartColors();

  if (!series || series.length === 0) {
    return (
      <div className='h-48 flex items-center justify-center bg-gray-50 rounded border'>
        <p className='text-sm text-muted-foreground'>No score data available</p>
      </div>
    );
  }

  const data = series.map((point, idx) => ({
    idx,
    t: new Date(point.timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
    }),
    A: point.team1Score?.toFixed(1) || '0',
    B: point.team2Score?.toFixed(1) || '0',
  }));

  return (
    <div className='h-48 w-full min-w-0 select-none'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke={chartColors.grid} />
          <XAxis dataKey='idx' stroke={chartColors.axis} tick={false} />
          <YAxis domain={[0, 'auto']} stroke={chartColors.axis} width={28} />
          <Tooltip
            contentStyle={{
              background: chartColors.tooltip.background,
              color: chartColors.tooltip.text,
              border: `1px solid ${chartColors.brandPrimary}`,
            }}
            labelFormatter={(label: any) => data[label]?.t || ''}
            formatter={(value: any, name: string) => [
              `${value} pts`,
              name === 'A' ? teamAName : teamBName,
            ]}
          />
          <Line
            type='monotone'
            dataKey='A'
            name={teamAName}
            stroke={chartColors.primary}
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
          />
          <Line
            type='monotone'
            dataKey='B'
            name={teamBName}
            stroke={chartColors.secondary}
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
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

  // Overlay helpers for narrative matching (simplified for week 3 framework)
  const augmentedLeagues = useMemo(() => {
    return (data.data.leagues || []).map(l => {
      const isAFC = (l.leagueName || '').toLowerCase().includes('afc');
      const section = isAFC ? WEEK3_NARRATIVE.afc : WEEK3_NARRATIVE.nfc;

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

      return { ...l, overview: section.league_overview, matchups };
    });
  }, []);

  return (
    <div className='px-2 md:px-4 py-6 space-y-6 overflow-x-hidden'>
      <PageHeader title='Week 3 Report — 2025' subtitle='Championship contenders emerge' />

      {/* User's Intro Section */}
      <div className='text-sm leading-relaxed space-y-3'>
        <h2 className='text-lg font-semibold'>Commissioner Introduction</h2>
        <div className='whitespace-pre-wrap'>{EDITOR_INTRO}</div>
      </div>

      {/* Scribe Introduction */}
      <div className='text-sm leading-relaxed'>
        <div className='font-semibold mb-1'>Scribe Overview</div>
        <div>{WEEK3_NARRATIVE.assistant_intro}</div>
        <div className='mt-2'>{WEEK3_COMBINED_OVERVIEW}</div>
      </div>

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

                    {/* Win Probability Chart */}
                    {m.series && m.series.length > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-semibold'>Win Probability Over Time</h4>
                        <WinProbChart
                          series={m.series}
                          teamAName={m.teamAName || `Team ${m.rosterAId}`}
                          teamBName={m.teamBName || `Team ${m.rosterBId}`}
                        />
                      </div>
                    )}

                    {/* Score Over Time Chart */}
                    {m.series && m.series.length > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-semibold'>Score Over Time</h4>
                        <ScoreChart
                          series={m.series}
                          teamAName={m.teamAName || `Team ${m.rosterAId}`}
                          teamBName={m.teamBName || `Team ${m.rosterBId}`}
                        />
                      </div>
                    )}

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
                  </div>
                ))}
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

      {/* Upcoming Matchups */}
      {data?.ok && data.data?.upcoming && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>Week 4 Preview</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            {Object.entries(data.data.upcoming).map(([leagueId, matchups]) => {
              const league = data.data.leagues.find(l => l.leagueId === leagueId);

              return (
                <div key={leagueId} className='space-y-3'>
                  <h3 className='font-semibold'>{league?.leagueName}</h3>
                  {matchups.map((matchup: any) => (
                    <div key={matchup.matchupId} className='p-2 bg-muted/20 rounded'>
                      <div className='text-sm'>
                        {matchup.teamAName} vs {matchup.teamBName}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
