'use client';

import { PageHeader } from '@gauntlet/ui';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DerbyBadge } from '@/components/MatchupTags';
import { Callout } from '@/components/Callout';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from '@/shared/utils/colors';
import { colors as brandColors } from '@/lib/colors';

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

// Hardcoded Week 1 narrative overlay
const WEEK1_NARRATIVE = {
  assistant_intro:
    'Welcome to the Week 1 recap. Think of this as a joint venture: Dhruv supplies the raw notes, numbers, and observations; I take those, lace them with context, sprinkle in some banter, and sometimes talk back like a smug editor who knows you’ll cut half my jokes. Together, we’ve built a “cat-and-mouse” style recap — equal parts analysis and heckling. If you don’t like a line, blame me. If you do, Dhruv will probably claim it was his.',
  nfc: {
    league_overview:
      'Scoring in the NFC felt uneven. A full seven teams cleared 110, but most lineups under-shot projections, and touchdowns came in bunches instead of balance. No take-backs after Week 1—but let’s not crown or bury anyone yet. Also, some rosters still don’t have team names. Rename your teams or I’ll do it for you.',
    matchups: [
      {
        matchup: 'vayyala (94.9) vs lurski (134.7) — lurski wins',
        recap:
          'Thursday dangled a little hope for Vinny when Jalen Hurts opened strong, but the rest of the roster crumpled as the weekend went on. By Sunday, the Broncos defense had climbed all the way up to being his second-highest scorer — a depressing sentence to write in Week 1. Lurski, meanwhile, methodically stacked points across the lineup, building the NFC’s top score without needing a single miracle. The gulf was obvious early and only widened with every slate of games. By Monday night this wasn’t a contest, it was an exhibition.',
        odds_and_ends: [
          'Lurski’s 134.7 was the highest score in the NFC for Week 1 — no one else cleared that bar.',
          'Vinny’s Broncos D/ST finishing as his #2 scorer is both rare and damning; across the NFC only one other manager had a defense in their top three.',
        ],
      },
      {
        matchup: 'joshrubatFD (82.4) vs Bego60 (111.4) — Bego60 wins',
        recap:
          'Marginal Returns opened Thursday with a faceplant — A.J. Brown, Ferguson, and Dak all duds — and dug a deep hole. The rescue came on the ground: Bijan + Derrick Henry combined for 50 and effectively erased a 30-piece from Lamar on joshrub’s side. Once the backs stabilized the floor, it turned into clock control and a composed finish — a comeback win built on running-back muscle, not fireworks.',
        odds_and_ends: [],
      },
      {
        matchup: 'RithikP (100.2) vs cescott25 (111.4) — cescott25 wins',
        recap:
          'Varun’s squad looked balanced and kept it tight for most of the weekend, but Burrow’s implosion under center was a sinkhole that no amount of steady contributions could cover. Christian, meanwhile, got his salvation on Sunday night when Josh Allen erupted, single-handedly flipping the matchup. The absurd part? Christian’s WRs combined for only 34 receiving yards — but when your QB drops a nuclear line, the sins of the wideouts get washed away.',
        odds_and_ends: [
          'Varun’s WR room drew plenty of looks but barely moved the chains. It was the worst efficiency showing of the week, and it sunk a balanced roster.',
          'Etienne and Breece combined for the highest rushing yardage of any duo in the NFC (~250), and it still wasn’t enough to overcome the QB crater.',
        ],
      },
      {
        matchup: 'DJ Herbussy (104.9) vs YouSmellLikeDaal (101.7) — Herbussy wins',
        recap:
          'This was the NFC’s crown jewel matchup. Friday night gave us a vintage QB duel — Mahomes vs Herbert trading blows like heavyweight boxers. Sunday brought Aman’s gamble: starting Ollie Gordon over safer WR options. It didn’t work. Monday night finished the drama with Jefferson trying to chase down DJ Moore and Swift, but falling just short. Herbussy held on by a thread, all while leaving Coleman and Egbuka (both 20+ points) rotting on the bench like unused cheat codes.',
        odds_and_ends: [
          'Herbussy’s four-man backfield workload was massive — nearly 60 carries across his RBs, the heaviest rushing load in the NFC.',
          'Aman’s Ollie Gordon gamble backfired hard. Both of his benched WRs cleared 20, and that decision is going to sting for a while.',
        ],
      },
      {
        matchup: 'ziyanp22 (111.7) vs arnavmehta (101.8) — ziyanp22 wins',
        recap:
          'For three quarters of the weekend this was neck-and-neck. Then Monday night arrived and the Minnesota defense plus Rome Odunze slammed the door. The subplot was the WR duel everyone circled: Ja’Marr Chase vs Puka Nacua. Instead of a heavyweight battle it was a one-sided schooling — Puka ran circles around Chase, and that alone was enough to tilt the tone of the matchup.',
        odds_and_ends: [
          'Both teams leaned on their RBs, combining for about 80 carries but only ~200 yards. That’s 2.5 yards a pop — pure inefficiency wrapped in volume.',
          'Ziyan’s backfield in particular was brutal: 40 carries for 81 yards. That’s not grinding, that’s quicksand.',
        ],
      },
      {
        matchup: 'dmethi (73.1) vs lukebowsh (113.2) — lukebowsh wins',
        recap:
          'This one was over before it started. Pickens gave Dhruv nothing, Worthy got hurt, and the rest of the roster stumbled under projections. By Sunday night it was clear there was no saving it. Luke’s team, on the other hand, was the picture of steady competence: Baker, CMC, Lamb, and Deebo all chipped in, and the margin ballooned into a laugher. Comfortable, routine, and a reminder that sometimes the biggest blowouts don’t need fireworks.',
        odds_and_ends: [
          'Dhruv’s lineup was one of only two in the NFC where not a single starter cleared their projection.',
          'Only three players on his roster hit double digits. That’s how you get blown out in Week 1.',
        ],
      },
    ],
  },
  afc: {
    league_overview:
      'The AFC didn’t exactly light it up either — lots of teams finished well below projection. The difference? More chaos. We had bench explosions, QB craters, and a cousin showdown that flipped back and forth like a bad soap opera. In other words: the AFC is already messy, which feels about right.',
    matchups: [
      {
        matchup: 'Nacua Matata (102.3) vs To Infinity and Bijan (120.4) — Infinity wins',
        recap:
          'Workplace derby: engineering manager Joel vs staff engineer Adam. Joel (Infinity) came out swinging Friday with a Mahomes/Kelce/Ladd trio that dropped haymakers. By Sunday, Bijan’s long touchdown turned the win-probability graph into a flatline. Adam’s side (Nacua) had flashes — Jayden Daniels moving the chains, Puka flashing again — but it was always shadow-chasing. Joel even benched his defense Monday as if to say, “yeah, I’m done here.” Bookmark this moment in case those points matter in December.',
        odds_and_ends: [
          'Both sides wasted firepower: Joel stranded two 20+ scorers while Adam left Zay Flowers idle. Only four AFC teams benched a 20+ at all, and this matchup tied for the most wasted ammo.',
          'Bijan’s long TD was the inflection point. Before it, win-prob still twitched. After it, Infinity never dipped below 80% to win.',
        ],
      },
      {
        matchup: 'benweinfeld (85.2) vs Dr Patel Parikh MD MBA (119.5) — Dr Patel wins',
        recap:
          'This one was businesslike. Dr Patel’s roster ticked along with Lamar providing the fireworks, while Ben’s lineup felt like pulling teeth. His rookie WR gave him a glimmer of hope, but there was no path back once Lamar put the game out of reach. The benches told the story too: Ben’s had the most points in the AFC, but they stayed parked while his starters gasped.',
        odds_and_ends: [
          'Ben’s bench total led the AFC, but it wouldn’t have flipped the game — just made the margin look less ugly.',
          'The QB gap here was one of the widest of the week, and Lamar’s eruption made it feel even wider.',
        ],
      },
      {
        matchup: 'The Golden Age (115.8) vs vchak (67.3) — Golden Age wins',
        recap:
          'Sometimes the word is just beatdown. Golden Age didn’t even need Gibbs or Ja’Marr to show up — both had quiet weeks — because Caleb was sharp and Derrick Henry ran downhill like a runaway truck. Vchak’s roster, by contrast, barely stumbled into double digits outside of CMC and rookie Ricky Pearsall. This was a non-contest by halftime on Sunday. Vchak has little room for optimism — his bench offered next to nothing.',
        odds_and_ends: [
          'Golden Age only needed three starters to clear vchak’s entire team total. That’s the lowest fewest-players metric of the week.',
          'Vchak led the AFC in sub-5 point starters. Half your lineup ghosting is how you get 40-pointed.',
        ],
      },
      {
        matchup: 'lol jerry jones (91.3) vs NielGetsCarried (89.5) — lol jerry wins',
        recap:
          'The Cousins Derby gave us real drama. Thursday left Neil for dead with AJB and Pickens flopping. By Sunday night, Fields and the Packers defense had dragged him back into contention. Monday set the stage: Swift and Jefferson needed 24 to steal it. They came up two points short. The win-prob chart looked like a seismograph all weekend before crashing in lol jerry’s favor right at the buzzer. Pain for one cousin, relief for the other.',
        odds_and_ends: [
          'The Packers/Lions defensive swing was the second-largest D/ST differential in the AFC this week, and it almost flipped the game.',
          'This matchup had 12 lead changes, second-most in the AFC — chaos until the final snap.',
        ],
      },
      {
        matchup: 'Quonspiracy Theorists (98.3) vs scboom5 (105.0) — scboom wins',
        recap:
          'This rivalry matchup lived up to the billing. Hurts and Lamb lit the fuse for QT early, Burrow cratered it with a dud, Saquon and Deebo clawed it back, and then Khalil Shakir delivered the dagger. The win-prob graph was whiplash — 14 flips in total, the most in the AFC. It was the kind of game where every red zone snap felt like destiny, and in the end scboom walked away with the spoils.',
        odds_and_ends: [
          'With 14 flips, this was the most volatile matchup in the AFC. One play swung it from coin-flip to near-certainty.',
          'Burrow’s implosion gave scboom the second-largest QB advantage of the slate, and it proved decisive.',
        ],
      },
      {
        matchup: '2 Dolla Balla$ (115.8) vs achak7 (103.4) — 2 Dolla wins',
        recap:
          'Sometimes a game is defined by one slot. Josh Allen detonated, Dak offered nothing, and that was it. Achak actually had the largest defensive edge of the week with his Broncos, but it was paper against dynamite. Monday’s subplot of Odunze vs Aaron Jones fizzled when Jones outpaced Odunze comfortably. The QB slot decided everything.',
        odds_and_ends: [
          'This was the largest QB gap of the week — Allen vs Dak wasn’t a contest.',
          'Achak owned the largest D/ST edge of the AFC slate, and still lost. That’s how completely QB play tilted the field.',
        ],
      },
    ],
  },
  closing_note:
    'So that’s Week 1. The NFC had seven teams over 110 but still looked shaky, the AFC gave us soap-opera chaos, and a few owners left enough points on the bench to field a second playoff team. Adjust your lineups, rename your teams, and for the love of projections — don’t overreact to Week 1. (Okay, maybe overreact a little. It’s more fun that way.)',
} as const;

const WEEK1_COMBINED_OVERVIEW =
  'Big picture: In the NFC, scoring felt uneven — seven teams cleared 110 but most lineups under-shot projections, with touchdowns arriving in bunches instead of balance. Meanwhile, the AFC was messier — bench explosions, QB craters, and a back-and-forth cousin showdown, with many teams finishing below projection. Don’t crown or bury anyone yet — and if your team still doesn’t have a name, I’m picking one for you.';

// Editor commentary (hardcoded for Week 1)
const EDITOR_INTRO = `Football is back! Fuck you to the half of you that recorded a week 1 dub, unlike me. The NFL wasted no time reminding me why this stupid game aggravates me like nothing else by knocking out my WR1 Xavier Worthy just seconds into the second game of the season. Yeah, I’m having a blast.

Which leads me to this. The weekly report, arguably the only thing about this game that gives me consistent joy. I love writing and I love diving into the numbers and presenting new ways to create storylines and anchors for flagrant levels of shit talk, and several years ago, I decided to turn my maniacal obsession into something that would make the game more fun for everyone.

This year, I’ve decided to add a new wrinkle; I’ve created a Gauntlet Scribe persona, a buddy that turns my notes and observations from the weekly slate into recaps, shit talk, and some statistical analysis. Much of the report will be this dude yapping, and I’ll add my own interjections and commentary from time to time. I’m really curious what you all think and I’m excited to try this out. I initially thought that it would save me some time, but it hasn’t really done that. These agents are dumb as fuck. But regardless, this has been a fun experiment to start. Maybe this’ll be an electric format. Maybe it’ll fall flat. Maybe it’ll just consume a shit ton of cost and compute for no reason. But maybe it’ll be really cool and fun. We’ll see!

Currently, this edition of the weekly report features:
- Box scores
- Weekly recap
- Win probability over time (there were some bugs calculating this over the weekend so I wouldn’t look ~too~ closely at the numbers, but it directionally does capture the trends of the matchup!)
- Power rankings featuring my proprietary algorithm that puts my team at 1st every time (jk it’s a combination of last 3 weeks moving average, expected wins, and total points)

There is much more that I want to eventually add to this. The only limitations are my time and my Cursor budget.

Regardless, I hope you all enjoy! Let me know if there is anything else you all would like to see in this. That being said, time for me to hand off to this fucker that won’t stop roasting my team.`;

const EDITOR_CALLOUTS: Record<string, string> = {
  'lol jerry jones':
    'Breaks my heart to see that Jettas couldn’t get the job done. Last time you hear that this year.',
  vchak: 'Hahahaha ghosting. Homie cooked.',
  scboom5:
    'Vintage matchup between the long time rivals, Shivang’s fantasy defense once again comes through (he was already in Anant’s head coming into the week). The injury to Worthy looms large, likely costing him the win and some near-term upside. Poor Anant had to follow up the Worthy injury with watching Lawrence overshoot BTJ over and over again on Sunday, rubbing salt into the open wound. This win was there for the taking. Gotta sting. Hahahaha sucks to suck.',
  'mach 10': 'Bro chill.',
  vayyala:
    'Lmao scribe cannot get over the defense as the #2 scorer. But fr that defensive performance is the only thing separating Vinny’s team from shitting the bed as badly as mine.',
  Herbussy:
    'No but seriously Aman why in the world did you start Ollie Gordon? I thought that was a bug when I first saw.',
  RithikP:
    'Joins Anant as another fellow comrade getting fucked by Joe Burrow and the Bengals starting off their campaign with a shitshow. Tough.',
  'Marginal Returns':
    'Very few sights sicken me as much as seeing Jeffrey victory lapping what is clearly a good decision in retrospect (which in this case was drafting Henry for ~$50). Luckily he’s got plentyyyyy of downside risk on his roster, and Daddy Derrick can’t come rescue him every week his QB and WR1 combine for under 10. That final fumble was a bad omen Jeffrey. Count your days.',
};

import type {
  ApiLeague,
  ApiResponse,
  BoxRow,
  MatchupView,
  SeriesPoint,
} from '@/shared/types/reports';

const WinProbChart = ({
  series,
  teamAName,
  teamBName,
}: {
  series: SeriesPoint[] | undefined;
  teamAName: string;
  teamBName: string;
}) => {
  const chartColors = useChartColors();
  const data = useMemo(
    () =>
      (series || []).map((p, idx) => ({
        idx,
        t: new Date(p.timestamp).toLocaleString(),
        A: Math.round((p.winProbA || 0) * 1000) / 10,
        B: Math.round((p.winProbB || 0) * 1000) / 10,
      })),
    [series],
  );
  if (!data.length) return <div className="text-xs text-muted-foreground">No time-series</div>;
  return (
    <div className="h-48 w-full min-w-0 select-none">
      <LineChart width={600} height={192} data={data} className="w-full h-full">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis dataKey="idx" stroke={chartColors.axis} tick={false} />
        <YAxis domain={[0, 100]} stroke={chartColors.axis} width={28} />
        <Tooltip
          contentStyle={{
            background: chartColors.tooltip.background,
            color: chartColors.tooltip.text,
            border: `1px solid ${chartColors.brandPrimary}`,
          }}
          labelFormatter={(label: any) => data[label]?.t || ''}
          formatter={(value: any, name: any) => [`${value}%`, name === 'A' ? teamAName : teamBName]}
        />
        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="A"
          name={teamAName}
          stroke={chartColors.primary}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="B"
          name={teamBName}
          stroke={chartColors.secondary}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
};

const ScoreChart = ({
  series,
  teamAName,
  teamBName,
}: {
  series: SeriesPoint[] | undefined;
  teamAName: string;
  teamBName: string;
}) => {
  const chartColors = useChartColors();
  const data = useMemo(
    () =>
      (series || [])
        .filter(p => p.team1Score != null && p.team2Score != null)
        .map((p, idx) => ({
          idx,
          t: new Date(p.timestamp).toLocaleString(),
          A: Number(p.team1Score),
          B: Number(p.team2Score),
        })),
    [series],
  );
  if (!data.length) return <div className="text-xs text-muted-foreground">No score series</div>;
  return (
    <div className="h-48 w-full min-w-0 select-none">
      <LineChart width={600} height={192} data={data} className="w-full h-full">
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis dataKey="idx" stroke={chartColors.axis} tick={false} />
        <YAxis domain={[0, 'auto']} stroke={chartColors.axis} width={28} />
        <Tooltip
          contentStyle={{
            background: chartColors.tooltip.background,
            color: chartColors.tooltip.text,
            border: `1px solid ${chartColors.brandPrimary}`,
          }}
          labelFormatter={(label: any) => data[label]?.t || ''}
          formatter={(value: any, name: any) => [value, name === 'A' ? teamAName : teamBName]}
        />
        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="A"
          name={teamAName}
          stroke={chartColors.primary}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="B"
          name={teamBName}
          stroke={chartColors.secondary}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
};

const MiniBoxscore = ({ rows }: { rows: BoxRow[] | undefined }) => {
  const items = (rows || []).slice(0, 9);
  if (!items.length) return <div className="text-xs text-muted-foreground">No starters</div>;
  return (
    <div className="space-y-1">
      {items.map(p => (
        <div key={p.playerId} className="flex items-center justify-between text-xs">
          <div className="truncate">
            <span className="text-muted-foreground mr-1">{p.position}</span>
            {p.name}
          </div>
          <div className="font-medium">{p.points.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
};

export default function Week1Report2025() {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch('/api/reports/2025/1', { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        console.log('[Week1Report] API response', json);
        setData(json);
      })
      .catch(() => setData({ ok: false } as any));
  }, []);

  useEffect(() => {
    if (!data?.ok || !data.data) return;
    try {
      console.log(
        '[Week1Report] leagues',
        data.data.leagues.map(l => ({
          id: l.leagueId,
          name: l.leagueName,
          matchups: l.matchups.length,
        })),
      );
      for (const l of data.data.leagues) {
        const sample = l.matchups[0];
        if (sample) {
          console.log('[Week1Report] sample matchup', {
            leagueId: l.leagueId,
            leagueName: l.leagueName,
            matchupId: sample.matchupId,
            rosterAId: sample.rosterAId,
            rosterBId: sample.rosterBId,
            teamAName: sample.teamAName,
            teamBName: sample.teamBName,
            startersA: sample.startersA?.length,
            startersB: sample.startersB?.length,
            boxA: sample.boxscoreA?.length,
            boxB: sample.boxscoreB?.length,
            seriesPoints: sample.series?.length,
          });
        } else {
          console.log('[Week1Report] no matchups for league', l.leagueId);
        }
      }
    } catch (e) {
      console.warn('[Week1Report] logging error', e);
    }
  }, [data]);
  // Overlay helpers for hardcoded Week 1 narrative
  const normalize = (s: string) =>
    (s || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  const extractTeams = (line: string) => {
    const vsIdx = line.toLowerCase().indexOf(' vs ');
    if (vsIdx === -1) return { a: line.trim(), b: '' } as const;
    const left = line.slice(0, vsIdx).trim();
    const rightRaw = line.slice(vsIdx + 4).trim();
    const right = rightRaw.split('—')[0].split(' - ')[0].trim();
    const clean = (s: string) => s.replace(/\(.*?\)/g, '').trim();
    return { a: clean(left), b: clean(right) } as const;
  };
  const extractScores = (line: string) => {
    const m = Array.from(line.matchAll(/\(([-\d.]+)\)/g)).map(x => Number(x[1]));
    if (m.length >= 2) return { a: m[0], b: m[1] } as const;
    return { a: NaN, b: NaN } as const;
  };
  const augmentedLeagues = useMemo(() => {
    if (!data?.ok || !data.data) return [] as ApiLeague[];
    return (data.data.leagues || []).map(l => {
      const isAFC = (l.leagueName || '').toLowerCase().includes('afc');
      const section = isAFC ? WEEK1_NARRATIVE.afc : WEEK1_NARRATIVE.nfc;
      const items = (section.matchups || []).map(m => {
        const { a, b } = extractTeams(m.matchup);
        const { a: sa, b: sb } = extractScores(m.matchup);
        return { a, b, sa, sb, recap: m.recap, odds: m.odds_and_ends || [] } as any;
      });
      const matchups = (l.matchups || []).map(m => {
        const a = normalize(m.teamAName || `Team ${m.rosterAId}`);
        const b = normalize(m.teamBName || `Team ${m.rosterBId}`);
        const within = (x: number, y: number) =>
          Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) < 0.25;
        let hit = items.find((it: any) => {
          const na = normalize(it.a);
          const nb = normalize(it.b);
          return (a.includes(na) && b.includes(nb)) || (a.includes(nb) && b.includes(na));
        });
        if (!hit) {
          hit = items.find(
            (it: any) =>
              (within(m.pointsA, it.sa) && within(m.pointsB, it.sb)) ||
              (within(m.pointsA, it.sb) && within(m.pointsB, it.sa)),
          );
        }
        return hit ? { ...m, recap: hit.recap, odds: hit.odds } : m;
      });
      return { ...l, overview: section.league_overview || l.overview, matchups };
    });
  }, [data]);

  return (
    <div className="px-2 md:px-4 py-6 space-y-6 overflow-x-hidden">
      <PageHeader title="Week 1 Report — 2025" subtitle="AFC + NFC" />

      {EDITOR_INTRO ? (
        <div className="text-sm leading-relaxed space-y-3">
          <p>
            Football is back! Fuck you to the half of you that recorded a week 1 dub, unlike me. The
            NFL wasted no time reminding me why this stupid game aggravates me like nothing else by
            knocking out my WR1 Xavier Worthy just seconds into the second game of the season. Yeah,
            I’m having a blast.
          </p>
          <p>
            Which leads me to this. The weekly report, arguably the only thing about this game that
            gives me consistent joy. I love writing and I love diving into the numbers and
            presenting new ways to create storylines and anchors for flagrant levels of shit talk,
            and several years ago, I decided to turn my maniacal obsession into something that would
            make the game more fun for everyone.
          </p>
          <p>
            This year, I’ve decided to add a new wrinkle; I’ve created a Gauntlet Scribe persona, a
            buddy that turns my notes and observations from the weekly slate into recaps, shit talk,
            and some statistical analysis. Much of the report will be this dude yapping, and I’ll
            add my own interjections and commentary from time to time. I’m really curious what you
            all think and I’m excited to try this out. I initially thought that it would save me
            some time, but it hasn’t really done that. These agents are dumb as fuck. But
            regardless, this has been a fun experiment to start. Maybe this’ll be an electric
            format. Maybe it’ll fall flat. Maybe it’ll just consume a shit ton of cost and compute
            for no reason. But maybe it’ll be really cool and fun. We’ll see!
          </p>
          <div>
            <p>Currently, this edition of the weekly report features:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Box scores</li>
              <li>Weekly recap</li>
              <li>
                Win probability over time (there were some bugs calculating this over the weekend so
                I wouldn’t look ~too~ closely at the numbers, but it directionally does capture the
                trends of the matchup!)
              </li>
              <li>
                Power rankings featuring my proprietary algorithm that puts my team at 1st every
                time (jk it’s a combination of last 3 weeks moving average, expected wins, and total
                points)
              </li>
            </ul>
          </div>
          <p>
            There is much more that I want to eventually add to this. The only limitations are my
            time and my Cursor budget.
          </p>
          <p>
            Regardless, I hope you all enjoy! Let me know if there is anything else you all would
            like to see in this. That being said, time for me to hand off to this fucker that won’t
            stop roasting my team.
          </p>
        </div>
      ) : null}

      {WEEK1_NARRATIVE.assistant_intro || data?.data?.scribeIntro ? (
        <div className="text-sm leading-relaxed">
          <div className="font-semibold mb-1">Scribe Overview</div>
          {WEEK1_NARRATIVE.assistant_intro || data?.data?.scribeIntro}
          <div className="mt-2">{WEEK1_COMBINED_OVERVIEW}</div>
        </div>
      ) : null}

      <h2 className="text-lg font-semibold">Matchups</h2>
      {data?.ok && data.data ? (
        <div className="space-y-8">
          {augmentedLeagues.map(l => (
            <div key={l.leagueId} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getConference(l.leagueName)}</Badge>
              </div>
              {/* League Overview moved into Assistant Overview combined paragraph */}
              <div className="space-y-6">
                {l.matchups.map(m => (
                  <div key={`${l.leagueId}-${m.matchupId}`} className="p-3 space-y-3">
                    <div className="rounded-md bg-gauntlet-crimson/10 px-3 py-2 flex items-center justify-between text-base font-semibold">
                      <div className="truncate max-w-[45%]">
                        {m.teamAName || `Team ${m.rosterAId}`} ({m.pointsA.toFixed(2)})
                      </div>
                      <div className="text-muted-foreground px-2">vs</div>
                      <div className="truncate text-right max-w-[45%]">
                        {m.teamBName || `Team ${m.rosterBId}`} ({m.pointsB.toFixed(2)})
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xxs">
                      {(() => {
                        const a = (m.teamAName || '').toLowerCase();
                        const b = (m.teamBName || '').toLowerCase();
                        const pair = [a, b].sort().join('::');
                        const derbyByPair: Record<string, string> = {
                          // AFC
                          ['lol jerry jones::nielgetscarried']: 'Cousins Derby',
                          ['nacua matata::to infinity and bijan']: 'Work Rivals',
                          ['quonspiracy theorists::scboom5']: 'Longtime Rivals',
                          // NFC
                          ['dj herbussy::saint brown does mahomes']: 'College Rivals',
                        } as any;
                        const text = derbyByPair[pair];
                        return text ? <DerbyBadge text={text} /> : null;
                      })()}
                      {/* Fine/curse are rendered as Scribe callouts below the charts */}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Combined: {m.combinedPoints.toFixed(1)} • Margin: {m.margin.toFixed(1)}
                      {m.excitementMetrics ? (
                        <>
                          {' '}
                          • Lead changes: {m.excitementMetrics.leadChanges} • Avg Δ WP:{' '}
                          {m.excitementMetrics.avgDeltaPct.toFixed(1)}%
                        </>
                      ) : null}
                    </div>
                    <WinProbChart
                      series={m.series}
                      teamAName={m.teamAName || `Team ${m.rosterAId}`}
                      teamBName={m.teamBName || `Team ${m.rosterBId}`}
                    />
                    <ScoreChart
                      series={m.series}
                      teamAName={m.teamAName || `Team ${m.rosterAId}`}
                      teamBName={m.teamBName || `Team ${m.rosterBId}`}
                    />
                    {m.recap ? <div className="text-sm leading-relaxed">{m.recap}</div> : null}
                    {(() => {
                      const callouts = EDITOR_CALLOUTS;
                      const keys = Object.keys(callouts);
                      if (!keys.length) return null;
                      const a = (m.teamAName || '').toLowerCase();
                      const b = (m.teamBName || '').toLowerCase();
                      const hit = keys.find(
                        k => a.includes(k.toLowerCase()) || b.includes(k.toLowerCase()),
                      );
                      return hit ? (
                        <Callout by="Commissioner" tone="spice" title={'Commissioner Note'}>
                          {callouts[hit]}
                        </Callout>
                      ) : null;
                    })()}
                    {(() => {
                      const callouts = (data?.data?.callouts || {}) as Record<string, string>;
                      const keys = Object.keys(callouts);
                      if (!keys.length) return null;
                      const a = (m.teamAName || '').toLowerCase();
                      const b = (m.teamBName || '').toLowerCase();
                      const hit = keys.find(
                        k => a.includes(k.toLowerCase()) || b.includes(k.toLowerCase()),
                      );
                      return hit ? (
                        <Callout by="Commissioner" tone="spice" title={'Commissioner Note'}>
                          {callouts[hit]}
                        </Callout>
                      ) : null;
                    })()}
                    {m.odds && m.odds.length ? (
                      <div className="text-sm">
                        <div className="font-semibold mb-1">Odds & Ends</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {(m.odds || []).map((t: string, idx: number) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {/* fines/curses disabled for now */}
                    <hr className="border-border" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold mb-1">Boxscore</div>
                        <MiniBoxscore rows={m.boxscoreA} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-1">Boxscore</div>
                        <MiniBoxscore rows={m.boxscoreB} />
                      </div>
                    </div>
                    <hr className="border-border" />
                  </div>
                ))}
              </div>
              <hr className="border-border" />
            </div>
          ))}

          <h2 className="text-lg font-semibold">Power Rankings</h2>
          <div className="space-y-2 text-sm">
            {((data.data.powerRankings || []) as any[]).map((p: any) => {
              const val = p.normalized as number;
              // Normalize to 0..1 around 100 baseline, clamp to [-2, +2] z approx → [80,120]
              const min = 80;
              const max = 120;
              const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
              // Interpolate across brand RdYlGn palette (same as Playground)
              const rdylgn = brandColors.rdylgn;
              const pos = t * (rdylgn.length - 1);
              const i0 = Math.floor(pos);
              const i1 = Math.min(rdylgn.length - 1, i0 + 1);
              const f = pos - i0;
              const hexToRgb = (hex: string | undefined) => {
                if (!hex) return { r: 128, g: 128, b: 128 }; // Default gray if undefined
                const m = hex.replace('#', '');
                const r = parseInt(m.slice(0, 2), 16);
                const g = parseInt(m.slice(2, 4), 16);
                const b = parseInt(m.slice(4, 6), 16);
                return { r, g, b };
              };
              const c0 = hexToRgb(rdylgn[i0] || rdylgn[0]); // Fallback to first color
              const c1 = hexToRgb(rdylgn[i1] || rdylgn[rdylgn.length - 1]); // Fallback to last color
              const r = Math.round(c0.r + (c1.r - c0.r) * f);
              const g = Math.round(c0.g + (c1.g - c0.g) * f);
              const b = Math.round(c0.b + (c1.b - c0.b) * f);
              const bg = `rgba(${r}, ${g}, ${b}, 0.24)`;

              return (
                <div
                  key={`${p.leagueId}-${p.rosterId}`}
                  className="flex items-center justify-between rounded px-2 py-1"
                  style={{ backgroundColor: bg }}
                >
                  <div className="truncate">
                    #{p.rank} {p.name}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {data?.data?.leagues?.find(l => l.leagueId === p.leagueId)?.leagueName}
                    </Badge>
                    {Number.isFinite(p.wins) && Number.isFinite(p.losses) ? (
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({p.wins}-{p.losses})
                      </span>
                    ) : null}
                  </div>
                  <div className="ml-2 text-xs text-muted-foreground">{val}</div>
                </div>
              );
            })}
          </div>
          <hr className="border-border" />
          {/* League-by-League Power Rankings */}
          <h2 className="text-lg font-semibold">League Power Rankings</h2>
          <div className="space-y-4">
            {data?.data?.leagues?.map(l => {
              const leagueRanks = ((data?.data?.powerRankings || []) as any[]).filter(
                (p: any) => p.leagueId === l.leagueId,
              );
              return (
                <div key={l.leagueId} className="mb-4">
                  <h3 className="text-md font-semibold">{getConference(l.leagueName)}</h3>
                  <div className="space-y-1 text-sm">
                    {leagueRanks.map(p => (
                      <div
                        key={p.rosterId}
                        className="flex items-center justify-between rounded px-2 py-1"
                      >
                        <div className="truncate">
                          #{p.rank} {p.name}
                        </div>
                        <div className="ml-2 text-xs text-muted-foreground">{p.normalized}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="border-border" />
          {/* Updated Standings Section */}
          <h2 className="text-lg font-semibold">Standings</h2>
          <div className="space-y-6">
            {data?.data?.standings?.map(s => (
              <div key={s.leagueId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getConference(s.leagueName)}</Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(s.divisions || {}).map(([divName, teams]: any) => (
                    <div key={divName} className="space-y-2">
                      <div className="text-sm font-semibold">{divName}</div>
                      <div className="space-y-1 text-xs">
                        {(teams as any[]).map(t => (
                          <div key={t.rosterId} className="flex items-center justify-between">
                            <div className="truncate">
                              {t.teamName || t.name}
                              <span className="text-xs text-muted-foreground ml-2">
                                PR #
                                {((data?.data?.powerRankings || []) as any[]).find(
                                  (p: any) =>
                                    p.leagueId === s.leagueId &&
                                    String(p.rosterId) === String(t.rosterId),
                                )?.rank ?? '-'}
                              </span>
                            </div>
                            <div className="ml-2">
                              {t.wins}-{t.losses} • {t.points.toFixed(1)} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="border-border" />
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold">
            Upcoming Matchups (Week {Number((data.data as any).week) + 1})
          </h2>
          <div className="space-y-4">
            {Object.entries((data.data as any).upcoming || {}).map(([leagueId, pairs]: any) => (
              <div key={leagueId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getConference(
                      (data.data?.leagues || []).find(l => l.leagueId === leagueId)?.leagueName ||
                        leagueId,
                    )}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  {(pairs as any[]).map(p => (
                    <div
                      key={`${leagueId}-${p.matchupId}`}
                      className="flex items-center justify-start gap-2"
                    >
                      <div className="truncate">{p.teamAName}</div>
                      <div className="text-muted-foreground">vs</div>
                      <div className="truncate">{p.teamBName}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Closing note */}
          {WEEK1_NARRATIVE.closing_note || (data.data as any).closingNote ? (
            <div className="mt-8 text-sm leading-relaxed">
              <div className="font-semibold mb-1">Closing Note</div>
              {WEEK1_NARRATIVE.closing_note || (data.data as any).closingNote}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}
    </div>
  );
}
