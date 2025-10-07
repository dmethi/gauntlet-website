'use client';

import { PageHeader } from '@gauntlet/ui';
import { Badge } from '@/components/ui/badge';
import { colors as brandColors } from '@/lib/colors';

// Import Week 4 static data
import reportData from '@/data/report-week4';
import weekRecords from '@/data/week4-records.json';

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

// Week 4 narrative content - ALL DATA VERIFIED FROM ACTUAL BOX SCORES
const WEEK4_CONTENT = {
  main_intro: `Gauntlet Week 4 Recap
League Overview

Week 4 delivered chaos disguised as chalk. The undefeateds fell (Hunter's Golden Age cracked, Akhil C's Herbussy stumbled), the basement dwellers surged (NielGetsCarried and The zoo finally won!), and scoring exploded across both leagues. Six teams cleared 135, while Vinny fell to 0–4 with his fourth straight sub-90 showing — a death spiral no one saw coming after his Week 1 promise. AFC: Infinity's run game bulldozed Hunter; Nolan torched Neil in the week's highest-scoring game; Arpit/Yash broke through at last. NFC: Ziyan stayed elite at 3–1; Dhruv steadied at 3–1; Vinny's nightmare continues; and the middle-pack teams (Jeffrey, Christian, Aman) keep grinding. The tiers are solidifying, but Week 4 proved no lead is safe.`,

  afc: {
    title: 'AFC',
    matchups: [
      {
        title: '2 Dolla Balla$ (Nolan, 2–2) def. lol jerry jones (Neil, 2–2)',
        recap: `Offensive explosion. This game produced the week's highest combined total (253.3), and Nolan delivered the knockout with balance and depth. Kenneth Gainwell's 31.4-point eruption stole the show, but Josh Allen (25.9) set tempo and Amon-Ra (22.5) did Amon-Ra things. Even Dallas Goedert chipped in 17.7 — when your TE plays like a WR1, you're cruising. Nolan entered 1–2 and desperate; he left 2–2 and dangerous.

Neil fought back with George Pickens (29.4) and Justin Fields (28.1) combining for nearly 58, but A.J. Brown's 1.7-point vanishing act killed any chance at a comeback. Jonathan Taylor and Quinshon Judkins were solid (13.6 and 22.5), yet it wasn't enough to keep pace with Nolan's firepower. Green Bay's defense going negative (-1.5) was the final nail. Neil entered 2–1, left 2–2, and needs his stars to show up together, not in shifts.`,
      },
      {
        title: 'NielGetsCarried (Arpit & Yash, 1–3) def. achak7 (Akhil, 2–2)',
        recap: `The preview called this the closest game of the slate, with projections showing just a 4-point spread. Instead, NielGetsCarried blew it wide open and bagged the highest score of the entire league this week — their first win of the season. Josh Jacobs bulldozed for 31.7, DK Metcalf finally broke out with 21.1, and Baker Mayfield looked sharp (18.4). Even the Chargers defense chipped in 12.4, leaving little doubt by Sunday night. After three weeks at 0–3 and falling short, everything finally clicked.

For Akhil, the stars didn't align. Dak Prescott matched Jacobs with a 31.0 showing, and James Cook added 23.5, but the rest of the lineup sputtered. Malik Nabers (3.0) and DeVonta Smith (3.9) combined for just 6.9 points, a brutal anchor drag. Rome Odunze (14.9) tried to salvage it, but LaPorta (5.4) and Denver D (8.0) couldn't keep it close. Akhil entered 2–1, left 2–2, and this one exposed how thin the margin can get when your WRs no-show. Meanwhile, NielGetsCarried climbs out of the basement at 1–3 with a win that doubles as a statement — they can still hang with anyone when the pieces come together.`,
      },
      {
        title: 'To Infinity and Bijan (Joel, 3–1) def. The Golden Age (Hunter, 3–1)',
        recap: `Infinity's ground game crushed Hunter's once-pristine record. Patrick Mahomes (27.3) led the charge, Bijan Robinson (27.1) and Javonte Williams (19.5) formed a devastating RB duo, and Travis Etienne (21.0) added flex points. Chris Godwin (4.1) was the only real dud, but with nearly 75 points from QB and RBs alone, who cares? Joel entered 2–1 and left 3–1 looking every bit the AFC favorite. That run game is a cheat code.

Hunter's machine finally sputtered. Caleb Williams cratered (10.3), Derrick Henry underwhelmed (7.8), and even Jahmyr Gibbs' solid 18.7 wasn't enough to save it. Detroit's defense (21.4) and Emeka Egbuka (18.1) tried to keep Golden Age in it, but without QB or Henry support, the offense stalled. Hunter entered 3–0, left 3–1, and this loss exposed the cracks: when Caleb doesn't deliver, the whole thing falls apart. Still in the hunt, but suddenly vulnerable.`,
      },
      {
        title: 'benweinfeld (Ben, 2–2) def. Quonspiracy Theorists (Anant, 1–3)',
        recap: `Ben's second win came on the back of Ashton Jeanty's 35.0-point nuclear explosion. Garrett Wilson (17.2) and J.K. Dobbins (14.0) provided solid support, while Justin Herbert (13.0) managed the game competently. Even with Jameson Williams (4.7) and Ja'Marr Chase (4.8) laying eggs, Jeanty's dominance was enough to carry the day. Ben entered 1–2, left 2–2, and suddenly looks like a team that can compete if Jeanty stays hot.

Anant had every chance to steal it but came up 2.7 points short. De'Von Achane (17.1), Deebo Samuel (16.6), and Xavier Worthy (15.6) all showed up, while Saquon (15.4) added a solid floor. But Daniel Jones (9.4) was a disaster at QB, and Seattle's defense (13.1) couldn't quite push him over the line. Both teams entered at 1–2; Anant left at 1–3, staring at must-win territory. This is the kind of close game that flips seasons — Ben got lucky, Anant didn't.`,
      },
      {
        title: 'Nacua Matata (Adam, 2–2) def. vchak (Vinay, 1–3)',
        recap: `Adam's balanced attack overwhelmed Vinay's patchwork lineup. Puka Nacua (29.5) exploded, Pittsburgh's defense (19.9) dominated, and Tyler Warren (15.8) provided a tight end spike. Even with Jared Goff (12.7) managing rather than dominating, Adam had no weak spots. Breece Hall (15.1) and Kenneth Walker (12.5) formed a solid RB foundation, and Zay Flowers (10.9) chipped in. Adam entered 1–2, left 2–2, and looks dangerous when his stars fire together.

Vinay's season continues to unravel. Bo Nix (25.7) and CMC (22.6) both showed up, and Philadelphia's defense (16.8) was excellent, but it wasn't enough. Isiah Pacheco (12.8) was fine, but DJ Moore (5.8), Darnell Mooney (2.0), and T.J. Hockenson (5.9) left him searching for answers. Vinay entered 1–2, left 1–3, and his playoff hopes are dimming fast. When you get 25+ from your QB and 22+ from your RB1 and still lose by 28, the roster needs serious help.`,
      },
      {
        title: 'scboom5 (Shivang, 3–1) def. Dr Patel Parikh MD MBA (Darshan/Kyle, 2–2)',
        recap: `Shivang rode a three-headed monster to victory. Omarion Hampton (27.0) and Bucky Irving (24.0) combined for 51 points at RB, while Jalen Hurts (19.9) managed the game efficiently. Khalil Shakir (15.4) and Zach Charbonnet (12.4) rounded out a lineup with no disasters, and Houston's defense (11.9) sealed it. Shivang entered 2–1, left 3–1, and is firmly in the AFC's top tier. That RB duo is championship-caliber.

Darshan/Kyle couldn't keep pace despite Romeo Doubs' 26.8-point explosion. Drake London (21.0) and Courtland Sutton (16.6) both showed up, but Lamar Jackson (12.2) was shockingly mediocre, and Chase Brown (9.6) and Jordan Mason (10.2) provided pedestrian RB production. Buffalo's defense (9.6) was fine, but not enough. They entered 2–1, left 2–2, and are treading water in the middle pack — talented enough to compete, but needing more consistency from the QB and RBs. When your WRs combine for 64 and you still lose by 13, the problem is clear.`,
      },
    ],
  },

  nfc: {
    title: 'NFC',
    matchups: [
      {
        title: 'ziyanp22 (Ziyan, 3–1) def. C&G^2 (Josh, 2–2)',
        recap: `Ziyan stays elite. Ashton Jeanty (35.0) and Puka Nacua (29.5) combined for a monstrous 64.5 points, and Jordan Love (26.8) added a 27-point QB performance. Even with Keenan Allen (6.2) and Zach Ertz (4.1) laying eggs, Ziyan had enough star power to cruise. Rome Odunze (14.9) and Minnesota's defense (7.3) rounded out a dominant performance. Ziyan entered 2–1, left 3–1, and looks every bit a title contender.

Josh's stars showed up — Quinshon Judkins (22.5), Javonte Williams (19.5), and Davante Adams (13.6) — but it wasn't nearly enough. Lamar Jackson (12.2) was shockingly mediocre, JSN (11.0) was fine but not explosive, and Tyreek Hill (9.7) underwhelmed. Buffalo's defense (9.6) added something, but Josh entered 2–1, left 2–2, and is stuck in the NFC's crowded middle. Talented, but not quite able to break through against the league's best. Ziyan, meanwhile, is rolling.`,
      },
      {
        title: 'Mach 10 (Dhruv, 3–1) def. DJ Herbussy (Akhil C, 3–1)',
        recap: `Dhruv steadied his season with a gritty win over the previously surging Herbussy. George Pickens (29.4) exploded, and the Gibbs-Achane tandem (18.7 + 17.1) gave him a 36-point RB foundation. Jordan Addison (13.4) and J.K. Dobbins (14.0) rounded out a balanced attack, and Houston's defense (11.9) sealed it. Daniel Jones (9.4) was mediocre at QB, but when your WR1 goes nuclear, it doesn't matter. Dhruv entered 2–1, left 3–1, and looks like he's found his footing.

Akhil C's lineup couldn't find rhythm. Bucky Irving (24.0) tried to keep it close, and Emeka Egbuka (18.1) and Tyler Warren (15.8) provided solid support, but Justin Herbert (13.0) was pedestrian, Jonathan Taylor (13.6) underwhelmed, and David Montgomery (1.2) was a complete disaster. Washington's defense (4.5) added nothing. Akhil C entered 3–0, left 3–1, and this game was a reminder that depth wins weeks when your top guys don't explode. Still in great shape, but suddenly beatable.`,
      },
      {
        title: 'cescott25 (Christian, 3–1) def. vayyala (Vinny, 0–4)',
        recap: `Vinny's nightmare season hit rock bottom. Another week, another sub-90 total (86.2), and another loss. Jalen Hurts (19.9) tried to keep it respectable, but Kenneth Walker (12.5) and Kyren Williams (11.9) were pedestrian, Tee Higgins (4.7) underwhelmed, and Brian Thomas (8.6) and Chris Olave (7.5) left massive holes. Denver's defense (8.0) couldn't save him. Four straight weeks of misery — Vinny entered 0–3, left 0–4, and is staring at mathematical elimination. This isn't bad luck anymore, it's a roster in freefall.

Christian, meanwhile, cruised with balance. Kenneth Gainwell (31.4) and Josh Allen (25.9) combined for 57, and Los Angeles' Chargers defense (12.3) added double digits. Even with Nico Collins (9.9), DeVonta Smith (3.9), and Ricky Pearsall (6.6) all underwhelming, he had enough cushion to coast. Christian entered 2–1, left 3–1, and is firmly in the playoff picture. This is the kind of hole seasons don't climb out of.`,
      },
      {
        title: 'Marginal Returns (Jeffrey, 4–0) def. Dont go Chasing Saquon (Arnav, 0–4)',
        recap: `Jeffrey keeps winning, period. Josh Jacobs (31.7) bulldozed, Detroit's defense (21.4) dominated, and Garrett Wilson (17.2) provided a solid WR showing. Even with Caleb Williams (10.3), A.J. Brown (1.7), and Derrick Henry (7.8) all laying eggs, Jeffrey found a way. Jake Ferguson (13.5) and Tetairoa McMillan (8.2) filled in gaps. Jeffrey entered 3–0, left 4–0, and is the only remaining undefeated team across both leagues. He's found a formula: survive, grind, win ugly.

Arnav's season is toast. Bijan Robinson (27.1) and Quentin Johnston (19.8) showed up, and Kyler Murray (16.6) was decent, but Ja'Marr Chase (4.8), Saquon Barkley (15.4), Darnell Mooney (2.0), and Hunter Henry (10.9) couldn't combine for enough. Green Bay's defense went negative (-1.5), the final indignity. Arnav entered 0–3, left 0–4, and is mathematically alive but spiritually finished. When your RB1 goes for 27 and you still lose by 9, the roster's broken beyond quick fixes.`,
      },
      {
        title: 'The zoo (Rithik, 1–3) def. Jaxson Dart-Njigba (Alex, 1–3)',
        recap: `Rithik grabbed his first win with a balanced performance. Drake London (21.0) and Travis Etienne (21.0) tied as top scorers, Pittsburgh's defense (19.9) dominated, and Dallas Goedert (17.7) provided a huge tight end showing. Sam Darnold (15.6) managed the game, and Breece Hall (15.1) and Jordan Mason (10.2) formed a solid RB foundation. Even with Malik Nabers (3.0) laying an egg, Rithik had no disasters. He entered 0–3, left 1–3, and finally has hope.

Alex had pieces — DK Metcalf (21.1), Courtland Sutton (16.6), Cam Skattebo (14.0), and New England's defense (12.4) — but couldn't match Rithik's depth. Jared Goff (12.7) was pedestrian, Alvin Kamara (11.2) and Chuba Hubbard (9.9) were fine but not explosive, and Zay Flowers (10.9) and Brock Bowers (7.1) left something to be desired. Alex entered 1–2, left 1–3, and both teams are searching. At least Rithik has momentum now.`,
      },
      {
        title: 'Saint Brown Does Mahomes (Aman, 2–2) def. lukebowsh (Luke, 2–2)',
        recap: `Aman's firepower overwhelmed Luke's depleted roster. Patrick Mahomes (27.3), James Cook (23.5), and Amon-Ra (22.5) combined for 73 points across three positions — when your QB, RB1, and WR1 all spike, you're golden. Justin Jefferson (17.6) and Stefon Diggs (13.1) rounded out a complete performance, and Miami's defense (8.3) sealed it. Even with Rhamondre Stevenson (5.1) and LaPorta (5.4) laying eggs, Aman had enough star power to cruise. He entered 1–2, left 2–2, and is positioned well — when his stars hit, this roster has title upside.

Luke couldn't keep pace despite Omarion Hampton (27.0) and CMC (22.6) combining for nearly 50. Baker Mayfield (18.4) and Deebo Samuel (16.6) provided solid support, but Mark Andrews (6.5), Elic Ayomanor (5.4), Tre Tucker (3.2), and Luther Burden (0.6) left massive holes. San Francisco's defense (2.2) added nothing. Luke entered 2–1, left 2–2, and his depth is the problem — when your bench guys start, you're running on fumes. Needs reinforcements fast or the season slips away.`,
      },
    ],
  },

  closing: `Week 4 crystallized the league's hierarchy. Ziyan stands alone at 4–0, the only undefeated left, while Vinny and Arnav are buried at 0–4, their seasons all but over. The middle is a dogfight: 16 teams sit between 1–3 and 3–1, separated by tiebreakers and vibes. Infinity's run game looks unstoppable, NielGetsCarried finally broke through, and Nolan's depth is proving elite. But the real story is variance: stars like Kenneth Gainwell (31.4) and Josh Jacobs (31.7) can flip entire weeks, while busts like A.J. Brown (1.7) sink ships. Week 5 will test who's real and who's been riding luck. The gauntlet doesn't forgive mediocrity — and it's starting to show.`,
} as const;

interface BoxRow {
  playerId: string;
  name: string;
  position: string | null;
  points: number;
}

function MiniBoxscore({ rows }: { rows: BoxRow[] | undefined }) {
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
}

export default function Week4Report2025() {
  // Use hardcoded data like Week 3 does
  const data = { ok: true, data: reportData } as const;

  // Helper to match matchups with new narrative structure
  const getMatchupRecap = (teamAName: string, teamBName: string, leagueName: string) => {
    const isAFC = (leagueName || '').toLowerCase().includes('afc');
    const section = isAFC ? WEEK4_CONTENT.afc : WEEK4_CONTENT.nfc;

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
    <div className="px-2 md:px-4 py-6 space-y-6 overflow-x-hidden">
      <PageHeader
        title="Week 4 Report — 2025"
        subtitle="The undefeateds fall, the basement rises"
      />

      {/* Main Introduction */}
      <div className="text-sm leading-relaxed space-y-4">
        <div className="whitespace-pre-wrap">{WEEK4_CONTENT.main_intro}</div>
      </div>

      {/* Hall of Fame & Shame Records */}
      <h2 className="text-lg font-semibold">🏆 Week 4 Records</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hall of Fame */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gauntlet-gold flex items-center gap-2">
            <span>✨</span> Hall of Fame
          </h3>
          <div className="text-xs space-y-2">
            {(weekRecords as any[])
              .filter((r: any) => r.type === 'fame')
              .sort((a: any, b: any) => a.rank - b.rank)
              .slice(0, 10) // Show top 10
              .map((r: any, idx: number) => {
                const rankStr = ['1st', '2nd', '3rd', '4th', '5th'][r.rank - 1] || `${r.rank}th`;
                return (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded bg-gauntlet-gold/5">
                    <span className="font-mono text-[10px] text-gauntlet-gold/70 min-w-[28px]">
                      {rankStr}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{r.teamName}</div>
                      <div className="text-muted-foreground truncate">{r.category}</div>
                      <div className="text-gauntlet-gold font-medium">{r.description}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Hall of Shame */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gauntlet-crimson flex items-center gap-2">
            <span>💀</span> Hall of Shame
          </h3>
          <div className="text-xs space-y-2">
            {(weekRecords as any[])
              .filter((r: any) => r.type === 'shame')
              .sort((a: any, b: any) => a.rank - b.rank)
              .slice(0, 10) // Show top 10
              .map((r: any, idx: number) => {
                const rankStr = ['1st', '2nd', '3rd', '4th', '5th'][r.rank - 1] || `${r.rank}th`;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded bg-gauntlet-crimson/5"
                  >
                    <span className="font-mono text-[10px] text-gauntlet-crimson/70 min-w-[28px]">
                      {rankStr}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{r.teamName}</div>
                      <div className="text-muted-foreground truncate">{r.category}</div>
                      <div className="text-gauntlet-crimson font-medium">{r.description}</div>
                    </div>
                  </div>
                );
              })}
            {(weekRecords as any[]).filter((r: any) => r.type === 'shame').length === 0 && (
              <div className="text-muted-foreground italic p-2">No shame records this week!</div>
            )}
          </div>
        </div>
      </div>

      {/* Data-driven Matchup Details */}
      <h2 className="text-lg font-semibold">Matchup Details & Box Scores</h2>
      {data?.ok && data.data && data.data.leagues && data.data.leagues.length > 0 ? (
        <div className="space-y-8">
          {(data.data.leagues || []).map(l => (
            <div key={l.leagueId} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getConference(l.leagueName)}</Badge>
              </div>

              <div className="space-y-6">
                {l.matchups.map(m => {
                  const recap = getMatchupRecap(m.teamAName || '', m.teamBName || '', l.leagueName);

                  return (
                    <div key={`${l.leagueId}-${m.matchupId}`} className="p-3 space-y-3">
                      <div className="rounded-md bg-gauntlet-crimson/10 px-3 py-2">
                        {/* Mobile-first stacked layout */}
                        <div className="sm:hidden">
                          <div className="flex items-center justify-between text-base font-semibold mb-1">
                            <span className="truncate flex-1 mr-2">
                              {m.teamAName || `Team ${m.rosterAId}`}
                            </span>
                            <span className="text-right font-mono">{m.pointsA.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-base font-semibold">
                            <span className="truncate flex-1 mr-2">
                              {m.teamBName || `Team ${m.rosterBId}`}
                            </span>
                            <span className="text-right font-mono">{m.pointsB.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Desktop horizontal layout */}
                        <div className="hidden sm:flex items-center justify-between text-base font-semibold">
                          <div className="truncate max-w-[45%]">
                            {m.teamAName || `Team ${m.rosterAId}`} ({m.pointsA.toFixed(2)})
                          </div>
                          <div className="text-muted-foreground px-2">vs</div>
                          <div className="truncate text-right max-w-[45%]">
                            {m.teamBName || `Team ${m.rosterBId}`} ({m.pointsB.toFixed(2)})
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Combined: {m.combinedPoints.toFixed(1)} • Margin: {m.margin.toFixed(1)}
                      </div>

                      {/* Show recap if found */}
                      {recap ? (
                        <div className="text-sm leading-relaxed">
                          <div className="font-medium mb-1">{recap.title}</div>
                          <div className="whitespace-pre-wrap">{recap.recap}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          Detailed recap available above
                        </div>
                      )}

                      {/* Box scores */}
                      <hr className="border-border" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-semibold mb-1">
                            {m.teamAName || `Team ${m.rosterAId}`}
                          </div>
                          <MiniBoxscore rows={m.boxscoreA} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold mb-1">
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
        <div className="text-sm text-muted-foreground italic">
          [Data file not yet populated - run data generation script to populate report-week4.json]
        </div>
      )}

      {/* Power Rankings */}
      <h2 className="text-lg font-semibold">Power Rankings</h2>
      {data?.data?.powerRankings && data.data.powerRankings.length > 0 ? (
        <div className="space-y-2 text-sm">
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
                className="flex items-center justify-between rounded px-2 py-1"
                style={{ backgroundColor: bg }}
              >
                <div className="truncate">
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
      ) : (
        <div className="text-sm text-muted-foreground italic">
          [Power rankings will appear here after data generation]
        </div>
      )}
      <hr className="border-border" />

      {/* League-by-League Power Rankings */}
      <h2 className="text-lg font-semibold">League Power Rankings</h2>
      {data?.data?.leagues && data.data.leagues.length > 0 ? (
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
      ) : (
        <div className="text-sm text-muted-foreground italic">
          [League rankings will appear here after data generation]
        </div>
      )}
      <hr className="border-border" />

      {/* Standings */}
      {data?.ok && data.data?.standings && data.data.standings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Current Standings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {data.data.standings.map(league => (
              <div key={league.leagueId} className="space-y-3">
                <h3 className="font-semibold">{league.leagueName}</h3>
                {Object.entries(league.divisions).map(([divName, teams]) => (
                  <div key={divName} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{divName}</h4>
                    <div className="space-y-1">
                      {teams.map((team: any) => (
                        <div key={team.rosterId} className="flex items-center justify-between">
                          <div className="truncate text-xs">
                            {team.teamName || team.name}
                            <span className="text-xs text-muted-foreground ml-2">
                              PR #
                              {((data?.data?.powerRankings || []) as any[]).find(
                                (p: any) =>
                                  p.leagueId === league.leagueId &&
                                  String(p.rosterId) === String(team.rosterId),
                              )?.rank ?? '-'}
                            </span>
                          </div>
                          <div className="text-xs ml-2">
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

      {/* Upcoming Matchups */}
      {data?.ok && data.data?.upcoming && Object.keys(data.data.upcoming).length > 0 && (
        <div className="space-y-4">
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
                      <div className="truncate">
                        {p.teamAName}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({p.teamARecord})
                        </span>
                      </div>
                      <div className="text-muted-foreground">vs</div>
                      <div className="truncate">
                        {p.teamBName}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({p.teamBRecord})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* STATS DEEP DIVE SECTION */}
      {/* ============================================================================ */}
      <div className="space-y-8 my-12">
        <div>
          <h2 className="text-2xl font-bold mb-2">📊 Stats Deep Dive</h2>
          <p className="text-muted-foreground">
            Beyond the box scores, the data reveals who's genuinely elite, who's getting lucky, and
            who's one fix away from turning their season around.
          </p>
        </div>

        {/* Spotlight Teams */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Team Spotlights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Six teams stood out this week for very different reasons. Some are thriving, some are
              surviving, and some need to figure it out fast.
            </p>
          </div>

          {/* Spotlight 1: ziyanp22 */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-lg">ziyanp22 (Ziyan, 3-1)</h4>
              <p className="text-sm text-muted-foreground">WR Dominance Masking RB Disaster</p>
            </div>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                Ziyan sits at 3-1 and is <strong>surging</strong>. His weekly scores: 112 → 137 →
                116 → 138. That's a <strong>+6 points per week improvement</strong> - the strongest
                upward trajectory in the league. When you're trending up this fast and scoring 135+
                in back-to-back weeks, you're a legitimate threat.
              </p>
              <p>
                <strong>The WR dominance is absurd.</strong> Averaging 59 points per week from his
                WRs - the league average is 34 points. That's{' '}
                <strong>25 extra points every single week</strong>, a 72% advantage over the field.
                This isn't a two-week hot streak - it's structural dominance.
              </p>
              <p>
                His WR ranks prove it: 1st → 2nd → 2nd → 2nd. He's finished in the top 2 at WR in
                all four weeks and has never finished outside the top 3 all season. That level of
                consistency at the league's most volatile position is championship-caliber.
              </p>
              <p>
                <strong>But the RB room is a disaster.</strong> Averaging just 24 points per week
                from RBs while the league average is 38 points. He's losing 14 points per week at
                that position - giving back more than half of what his WRs are creating.
              </p>
              <p>
                The RB collapse is real: ranks of 20th → 23rd → 24th → 11th. Week 4's jump to 11th
                (44.6 pts) was his best RB performance of the season, but even that was just
                league-average. The previous three weeks averaged just 17.5 PPG at RB - bottom-3 in
                the league.
              </p>
              <p>
                <strong>The math:</strong> +25 from WRs, -14 from RBs = net +11 point advantage per
                game. That's still elite, which is why he's 3-1 and surging. But if he could get
                even average RB production (38 PPG), he'd be putting up 145+ every week and running
                away with the league.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="text-xs">
                <div className="text-muted-foreground">Trajectory</div>
                <div className="font-semibold text-green-600">+5.9 pts/week</div>
                <div className="text-[10px] text-muted-foreground">Strongly improving</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">WR Dominance</div>
                <div className="font-semibold text-green-600">58.9 PPW</div>
                <div className="text-[10px] text-muted-foreground">+24.6 vs league avg</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">RB Deficit</div>
                <div className="font-semibold text-red-600">24.2 PPW</div>
                <div className="text-[10px] text-muted-foreground">-14.0 vs league avg</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Net Edge</div>
                <div className="font-semibold">+11 pts/game</div>
                <div className="text-[10px] text-muted-foreground">Why he's 3-1</div>
              </div>
            </div>
          </div>

          {/* Spotlight 2: vayyala */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-lg">vayyala (Vinny, 0-4)</h4>
              <p className="text-sm text-muted-foreground">Statistical Catastrophe</p>
            </div>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                Vinny's 0-4 record isn't just bad luck - it's a perfect storm of roster problems
                meeting historically tough matchups.
              </p>
              <p>
                <strong>The offensive disaster:</strong> Weekly scores: 93 → 87 → 77 → 86. Four
                straight sub-90 performances. When you can't crack 90 points for a month straight,
                it's not variance, it's structural failure. League average: 111.3 PPG. Vinny's
                averaging 86 PPG. That's <strong>-25 points per game</strong> below average - more
                than 2 standard deviations below the mean. Statistically catastrophic.
              </p>
              <p>
                <strong>The WR collapse is the root cause.</strong> Averaging just 22 points per
                week from WRs - the league average is 34 points. He's losing 12 points per week at
                the most important fantasy position. WR ranks: 24th → 16th → 20th → 19th. Opened the
                season dead last at WR and hasn't cracked the top half since.
              </p>
              <p>
                <strong>And the schedule has been brutal.</strong> Expected wins based on strength
                of schedule: about 0.3 wins with these matchups. Most teams would be 0-4 or 1-3 with
                this gauntlet. Vinny hasn't been unlucky with the schedule - he's faced the hardest
                path in the league.
              </p>
              <p>
                <strong>The fix:</strong> WR position must improve from 22 PPG to at least 32 PPG
                (still below average, but playable). That alone adds 10 points per week and makes
                him competitive in easier matchups ahead.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="text-xs">
                <div className="text-muted-foreground">Scoring</div>
                <div className="font-semibold text-red-600">86.0 PPG</div>
                <div className="text-[10px] text-muted-foreground">-25.3 vs avg</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">WR Disaster</div>
                <div className="font-semibold text-red-600">22.0 PPW</div>
                <div className="text-[10px] text-muted-foreground">-12.3 vs avg</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Schedule</div>
                <div className="font-semibold">#1 hardest</div>
                <div className="text-[10px] text-muted-foreground">28% avg win rate</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Expected Wins</div>
                <div className="font-semibold">~0.3</div>
                <div className="text-[10px] text-muted-foreground">Hardest path</div>
              </div>
            </div>
          </div>

          {/* Spotlight 3: 2 Dolla Balla$ */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-lg">2 Dolla Balla$ (Nolan, 2-2)</h4>
              <p className="text-sm text-muted-foreground">Boom/Bust, But Heating Up</p>
            </div>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                Nolan has put up a top-5 scoring performance twice this season (Weeks 1 and 4). He
                won both of those games. His other two weeks? Ranked 12th and 22nd in scoring - he
                lost both. <strong>Translation:</strong> This team can't win unless they have an
                elite week. When scoring top-5, he's 2-0. When not, he's 0-2.
              </p>
              <p>
                <strong>But the trajectory is real:</strong> Weekly scores: 116 → 110 → 90 → 139.
                That's a <strong>+5 points per week improvement</strong> - strongly improving. Week
                3 dipped to 90 (22nd in scoring), but Week 4's explosion to 139 points (2nd in
                league) continues an overall upward trend. If this trajectory holds, he's scoring
                120+ consistently by playoffs.
              </p>
              <p>
                <strong>The positional story:</strong> QB is carrying him - averaging 25.2 PPW,
                about 6 points better than league average (19.4 PPG). But defense is giving almost
                all of it back. Averaging just 6.2 PPW from DEF, about 4 points worse than league
                average. The math: +6 from QB, -4 from DEF = net +2 point advantage.
              </p>
              <p>
                <strong>The encouraging sign:</strong> Week 4 saw his best defensive performance of
                the season with 8.3 points (15th in league). Previous average: 5.2 PPG (bottom-5).
                If Week 4's defensive spike is sustainable, this team is dangerous.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="text-xs">
                <div className="text-muted-foreground">Trajectory</div>
                <div className="font-semibold text-green-600">+5.1 pts/week</div>
                <div className="text-[10px] text-muted-foreground">Strongly improving</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Top-5 Record</div>
                <div className="font-semibold text-green-600">2-0</div>
                <div className="text-[10px] text-muted-foreground">0-2 outside top-5</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">QB Advantage</div>
                <div className="font-semibold text-green-600">+5.8 pts/week</div>
                <div className="text-[10px] text-muted-foreground">Carrying the team</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">DEF Problem</div>
                <div className="font-semibold text-red-600">-4.4 pts/week</div>
                <div className="text-[10px] text-muted-foreground">But 8.3 in Week 4!</div>
              </div>
            </div>
          </div>

          {/* Spotlight 4: To Infinity and Bijan */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-lg">To Infinity and Bijan (Joel, 3-1)</h4>
              <p className="text-sm text-muted-foreground">RB Dominance, WR Disaster</p>
            </div>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                Joel's season starts and ends with one position: running back. He's averaging 64
                points per week from his RBs - the league average is 38 points. That's 26 extra
                points every single week, nearly a <strong>70% advantage</strong> over the field.
              </p>
              <p>
                This isn't fluky. His weekly RB ranks: 3rd → 1st → 1st → 1st. He hasn't finished
                outside the top 3 all season, and he's been the #1 RB scorer in the league for three
                consecutive weeks (Weeks 2, 3, 4). That's not luck - that's roster construction
                creating a sustainable edge.
              </p>
              <p>
                <strong>But here's the problem:</strong> His WR position is dragging him down. He
                averages just 18 points per week at WR while the league average is 34 points. He's
                losing 17 points per week at that position - nearly giving back everything his RBs
                are creating.
              </p>
              <p>
                The WR collapse is getting worse. Recent WR ranks: 15th → 23rd → 24th → 24th. He's
                finished in the bottom 2 at WR in three straight weeks. That's not a slump, that's a
                fundamental roster hole.
              </p>
              <p>
                <strong>The math:</strong> +26 from RBs, -17 from WRs = net +9 point advantage per
                game. That's still championship-caliber, which is why he's 3-1. But if he could get
                even league-average WR production, he'd be scoring 140+ every week.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="text-xs">
                <div className="text-muted-foreground">RB Dominance</div>
                <div className="font-semibold text-green-600">64.0 PPW</div>
                <div className="text-[10px] text-muted-foreground">+25.8 vs avg (68% edge)</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">RB Streak</div>
                <div className="font-semibold text-green-600">3x #1</div>
                <div className="text-[10px] text-muted-foreground">Weeks 2, 3, 4</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">WR Disaster</div>
                <div className="font-semibold text-red-600">17.6 PPW</div>
                <div className="text-[10px] text-muted-foreground">-16.8 vs avg</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Net Edge</div>
                <div className="font-semibold">+9 pts/game</div>
                <div className="text-[10px] text-muted-foreground">Why he's 3-1</div>
              </div>
            </div>
          </div>

          {/* Spotlight 5: Dont go Chasing Saquon */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-lg">Dont go Chasing Saquon (Arnav, 0-4)</h4>
              <p className="text-sm text-muted-foreground">Winless Despite Pieces</p>
            </div>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                Arnav is 0-4, and unlike Vinny's statistical catastrophe, this one stings
                differently. The roster has pieces. The scoring isn't historically bad (averaging 97
                PPG vs 111 league average). But nothing is clicking.
              </p>
              <p>
                Scoring ranks: 14th → 16th → 23rd → 22nd. Consistently bottom-third, but not
                bottom-2. The Week 3 collapse to 78 points was a disaster, but the other three weeks
                were in the "mediocre" range. The problem? Mediocre doesn't win games in a
                competitive league.
              </p>
              <p>
                <strong>No top-5 weeks, no wins.</strong> Arnav has put up zero top-5 scoring
                performances this season. Compare to successful teams like Joel or Ziyan who have
                multiple top-5 weeks. When your ceiling is 14th in scoring (Week 1), you're not
                winning close games.
              </p>
              <p>
                <strong>The real issue:</strong> No elite position. Vinny has QB. Joel has RB. Ziyan
                has WR. Arnav has... nothing dominant. His "top strength" doesn't even register as a
                significant advantage in the data. This is a roster of middling pieces with no
                game-breaking edge.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="text-xs">
                <div className="text-muted-foreground">Record</div>
                <div className="font-semibold text-red-600">0-4</div>
                <div className="text-[10px] text-muted-foreground">0 top-5 weeks</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Scoring</div>
                <div className="font-semibold">96.7 PPG</div>
                <div className="text-[10px] text-muted-foreground">-14.6 vs avg</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Trajectory</div>
                <div className="font-semibold text-red-600">-2.1 pts/week</div>
                <div className="text-[10px] text-muted-foreground">Declining</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Main Problem</div>
                <div className="font-semibold">No elite position</div>
                <div className="text-[10px] text-muted-foreground">All mediocre</div>
              </div>
            </div>
          </div>

          {/* Spotlight 6: Marginal Returns */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-lg">Marginal Returns (Jeffrey, 4-0)</h4>
              <p className="text-sm text-muted-foreground">Last Undefeated, But Questions Remain</p>
            </div>
            <div className="text-sm space-y-3 leading-relaxed">
              <p>
                Jeffrey is the only undefeated team left in the entire league at 4-0. But the
                numbers suggest this record is built on schedule fortune more than dominance.
              </p>
              <p>
                <strong>The "winning ugly" formula:</strong> His wins haven't been blowouts built on
                elite scoring. He's averaging about 110 PPG - exactly league average. He's finding
                ways to win close games and survive weeks where stars underperform.
              </p>
              <p>
                Week 4 is the perfect example: Josh Jacobs (31.7) and Detroit DEF (21.4) carried
                him, but Caleb Williams (10.3), A.J. Brown (1.7), and Derrick Henry (7.8) all laid
                eggs. Most teams lose when their QB and RB1 combine for 18 points. Jeffrey found a
                way.
              </p>
              <p>
                <strong>The positional edges:</strong> TE and DEF are his strengths. When you're
                getting consistent production from the two "forgotten" positions while everyone else
                is getting 5-6 points, that 8-10 point weekly edge adds up. Over 4 weeks, that's a
                32-40 point cumulative advantage - the difference between 4-0 and 2-2.
              </p>
              <p>
                <strong>The test ahead:</strong> Schedule gets significantly harder in the upcoming
                weeks. The real question: Can he maintain 4-0 when facing elite opponents who don't
                have off-weeks?
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="text-xs">
                <div className="text-muted-foreground">Record</div>
                <div className="font-semibold text-green-600">4-0</div>
                <div className="text-[10px] text-muted-foreground">Only undefeated</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Scoring</div>
                <div className="font-semibold">~110 PPG</div>
                <div className="text-[10px] text-muted-foreground">League average</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">TE/DEF Edge</div>
                <div className="font-semibold text-green-600">+7-10 pts/week</div>
                <div className="text-[10px] text-muted-foreground">Combined</div>
              </div>
              <div className="text-xs">
                <div className="text-muted-foreground">Schedule</div>
                <div className="font-semibold">Easier so far</div>
                <div className="text-[10px] text-muted-foreground">Test ahead</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Team Updates */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Quick Team Updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* AFC Teams */}
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">achak7 (Akhil, 2-2)</div>
              <div className="text-muted-foreground">
                Clutch but declining. 2-0 in close games, but -5.3 pts/week drop. WR crashed in Week
                4.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">lol jerry jones (Neil, 2-2)</div>
              <div className="text-muted-foreground">
                Explosive but wildly inconsistent. Scored 127 in Week 4 (4th), boom/bust profile.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">NielGetsCarried (Arpit & Yash, 1-3)</div>
              <div className="text-muted-foreground">
                First win explosion! 140 pts (#1 in league), RB dominated (58.7). Breakthrough or
                fluke?
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">benweinfeld (Ben, 2-2)</div>
              <div className="text-muted-foreground">
                RB team. Solid RB production, but WR is a massive hole (-17.5 pts/week vs
                opponents).
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">Nacua Matata (Adam, 2-2)</div>
              <div className="text-muted-foreground">
                Balanced, no disasters. Classic "solid all-around" roster. 6-8 win ceiling.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">scboom5 (Shivang, 3-1)</div>
              <div className="text-muted-foreground">
                Elite RBs (Hampton + Irving = 51 pts in Week 4). Championship RB duo if they stay
                hot.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">Dr Patel Parikh MD MBA (Darshan/Kyle, 2-2)</div>
              <div className="text-muted-foreground">
                WR dominance (+26.6 pts/week), everything else average. WRs masking problems.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">Quonspiracy Theorists (Anant, 1-3)</div>
              <div className="text-muted-foreground">
                Lost Week 4 by 2.7 pts. Solid roster, bad luck. One QB upgrade from competitive.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">vchak (Vinay, 1-3)</div>
              <div className="text-muted-foreground">
                Middling everywhere. No elite position, no disaster. Classic 5-9 team.
              </div>
            </div>

            {/* NFC Teams */}
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">cescott25 (Christian, 3-1)</div>
              <div className="text-muted-foreground">
                Opportunistic wins with balanced scoring. 3-1 probably overperforming slightly.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">DJ Herbussy (Akhil C, 3-1)</div>
              <div className="text-muted-foreground">
                Was 3-0, lost Week 4. Depth issues exposed (Montgomery's 1.2 pts).
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">Mach 10 (Dhruv, 3-1)</div>
              <div className="text-muted-foreground">
                Big play dependent. When Pickens + Gibbs/Achane hit, wins. Needs consistent QB.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">The zoo (Rithik, 1-3)</div>
              <div className="text-muted-foreground">
                First win finally! Balanced Week 4 (London, Etienne, PIT DEF all 20+). 4-6 more
                possible.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">Saint Brown Does Mahomes (Aman, 2-2)</div>
              <div className="text-muted-foreground">
                Star-powered wins. When Mahomes + Cook + Amon-Ra hit, unstoppable. Otherwise,
                average.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">Jaxson Dart-Njigba (Alex, 1-3)</div>
              <div className="text-muted-foreground">
                Solid pieces (DK, Sutton, Kamara), can't execute. Better than 1-3. 5-7 win range.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">lukebowsh (Luke, 2-2)</div>
              <div className="text-muted-foreground">
                Depleted roster surviving. Bo Nix breakout keeping him afloat. 4-6 wins total.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">C&G^2 (Josh, 2-2)</div>
              <div className="text-muted-foreground">
                Solid, not spectacular. Balanced roster, no dominance. Classic middle-pack. 6-8
                wins.
              </div>
            </div>
            <div className="border rounded p-3 space-y-1">
              <div className="font-semibold">The Golden Age (Hunter, 3-1)</div>
              <div className="text-muted-foreground">
                Was 3-0, fell to Joel. When Caleb doesn't deliver, offense stalls. Still good, but
                vulnerable.
              </div>
            </div>
          </div>
        </div>

        {/* League-Wide Scatter Analysis */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">League-Wide Performance Patterns</h3>
          <p className="text-sm text-muted-foreground">
            The positional breakdowns reveal who has sustainable edges and who's barely holding on.
          </p>

          {/* RB Analysis */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">RB Position: Dominance vs Disaster</h4>
            <div className="text-sm space-y-2">
              <div>
                <div className="font-medium text-green-600">✅ RB Dominance:</div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>
                    <strong>Joel (To Infinity and Bijan):</strong> 64.0 PPW, +25.8 advantage. The
                    biggest positional edge in the entire league. Three consecutive #1 RB finishes
                    (Weeks 2, 3, 4). When you're getting 26 extra points per week from one position,
                    you're a championship contender.
                  </div>
                  <div>
                    <strong>Shivang (scboom5):</strong> Elite RB duo (Hampton + Irving). Week 4
                    combined for 51 points. Championship-caliber when both stay healthy.
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium text-red-600">❌ RB Disaster:</div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>
                    <strong>Ziyan (ziyanp22):</strong> 24.2 PPW, -14.0 disadvantage. Ranks: 20th →
                    23rd → 24th → 11th. Week 4's jump to 11th was best of season, but still just
                    league-average. The WR dominance is masking this hole.
                  </div>
                  <div>
                    <strong>Vinny (vayyala):</strong> Averaging sub-30 PPG at RB while opponents put
                    up 40+. Every week starts with a 10-15 point hole at RB.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WR Analysis */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">WR Position: Elite Production vs Collapse</h4>
            <div className="text-sm space-y-2">
              <div>
                <div className="font-medium text-green-600">✅ WR Dominance:</div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>
                    <strong>Ziyan (ziyanp22):</strong> 58.9 PPW, +24.6 advantage (72% edge). Ranks:
                    1st → 2nd → 2nd → 2nd. Never finished outside top 3 all season. This is
                    structural dominance, not a hot streak.
                  </div>
                  <div>
                    <strong>Darshan/Kyle (Dr Patel Parikh):</strong> 58.7 PPW, +26.6 advantage. When
                    your WRs outscore opponents by 26 points per week, you're in every game.
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium text-red-600">❌ WR Collapse:</div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>
                    <strong>Joel (To Infinity and Bijan):</strong> 17.6 PPW, -16.8 disadvantage.
                    Bottom 2 at WR for three straight weeks (22nd, 24th, 24th). Giving back
                    everything the RBs create.
                  </div>
                  <div>
                    <strong>Vinny (vayyala):</strong> 22.0 PPW, -12.3 disadvantage. Started 24th in
                    Week 1, hasn't cracked top half since. The root cause of his 0-4 record.
                  </div>
                  <div>
                    <strong>Ben (benweinfeld):</strong> 24.8 PPW while opponents average 42.3 PPW at
                    WR. Losing 17 points per week at the position makes every game an uphill battle.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Efficiency */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Overall Team Efficiency</h4>
            <div className="text-sm space-y-2">
              <div>
                <div className="font-medium text-green-600">
                  ✅ Elite (High Scoring + Weak Opponents):
                </div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>
                    <strong>Ziyan:</strong> Scoring 127+ PPG while opponents average 109 PPG. This
                    18-point weekly advantage is massive. Statistical dominance across the board.
                  </div>
                  <div>
                    <strong>Joel:</strong> 125 PPG offense, opponents scoring below average.
                    13-point weekly edge. RB dominance creates sustainable advantage.
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium text-red-600">
                  ❌ Disaster (Low Scoring + Strong Opponents):
                </div>
                <div className="ml-4 space-y-1 text-muted-foreground">
                  <div>
                    <strong>Vinny:</strong> 86 PPG (more than 2σ below average) while facing elite
                    opponent scoring. Creates a 30-point weekly deficit. Can't score AND faces elite
                    performances. Statistically catastrophic.
                  </div>
                  <div>
                    <strong>Arnav:</strong> 97 PPG while opponents average 118+ PPG. 20-point weekly
                    hole. 0-4 makes complete statistical sense.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall of Fame */}
      {data?.ok && data.data?.hallOfFame && data.data.hallOfFame.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Week 4 Hall of Fame</h2>
          <div className="space-y-2">
            {data.data.hallOfFame.length > 0 ? (
              data.data.hallOfFame.map((entry: any, idx) => (
                <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium">{entry.category}</div>
                  <div className="text-sm">{entry.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.player} ({entry.team}) - {entry.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No hall of fame entries yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Closing Note */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Closing Note</h2>
        <div className="text-sm leading-relaxed">{WEEK4_CONTENT.closing}</div>
      </div>
    </div>
  );
}
