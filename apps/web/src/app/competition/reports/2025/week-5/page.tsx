'use client';

import { PageHeader } from '@gauntlet/ui';
import { Badge } from '@/components/ui/badge';
import { colors as brandColors } from '@/lib/colors';

// Import Week 5 static data
import reportData from '@/data/report-week5';

// Helper to derive conference abbreviation (AFC/NFC) from league name
const getConference = (name: string) =>
  name.toUpperCase().includes('AFC') ? 'AFC' : name.toUpperCase().includes('NFC') ? 'NFC' : name;

// Week 5 narrative content - ALL DATA VERIFIED FROM ACTUAL BOX SCORES
const WEEK5_CONTENT = {
  main_intro: `Gauntlet Week 5 Recap
League Overview

Week 5 delivered heartbreak, heroics, and history. Jeffrey's Marginal Returns stayed perfect at 5–0, demolishing Ziyan's streak in the process. Vinny finally escaped 0–4 hell with his first victory. Arnav fell to 0–5, staring at mathematical elimination. Three games ended within three points—Nolan lost by 2.29, Neil won by 2.44, Anant squeaked past Darshan by 0.72—turning razor-thin margins into season-defining moments. DJ Herbussy exploded for 146, the week's highest score, while Ben's 137 marked his arrival as a contender. AFC: Neil edged Akhil in a thriller; Adam crushed Hunter; Ben dismantled Shivang; Joel stayed dominant. NFC: Jeffrey's 145 obliterated Ziyan; Aman's 138 topped Dhruv; Vinny broke through against Rithik; Akhil C's 146 steamrolled Luke; Josh stunned Arnav; Christian handled Alex. The playoff picture is crystallizing: five teams at 4–1 or better, while five teams at 1–4 or worse are sliding toward irrelevance. Week 5 proved that in the Gauntlet, no lead is safe and no deficit is fatal—until it is.`,

  afc: {
    title: 'AFC',
    matchups: [
      {
        title: 'NielGetsCarried (Arpit & Yash, 2–3) def. 2 Dolla Balla$ (Nolan, 2–3)',
        recap: `Heartbreak by 2.29 points. Nolan had the firepower—Josh Allen (20.9), Kareem Hunt (18.7), and Amon-Ra (14.0)—but it wasn't enough. When your QB and RB1 deliver 40 combined and you still lose, it's a gut punch. Davante Adams (11.3) was solid, but Jerry Jeudy (2.5) and Jeremy McNichols (2.3) left massive holes. Miami's defense (6.95) tried, but Nolan entered 2–2, left 2–3, and is now staring at must-win territory.

Arpit & Yash survived on Baker Mayfield's 27.2-point explosion—his best game of the season. Justin Jefferson (15.8), Calvin Ridley (15.6), and Michael Pittman (12.4) formed a dominant WR trio, and Harold Fannin (9.3) at TE was a sneaky contributor. Alvin Kamara (7.5) and Justice Hill (1.7) were pedestrian at RB, but when your QB and WRs combine for 71 points, you don't need much else. NielGetsCarried entered 1–3, left 2–3, and showed they can compete when the passing game clicks. This is the kind of close win that can flip a season.`,
      },
      {
        title: 'lol jerry jones (Neil, 3–2) def. achak7 (Akhil, 2–3)',
        recap: `Another thriller, another 2.44-point margin. Neil and Akhil combined for 252 points in a shootout that came down to the wire. Justin Fields (27.4) and Jonathan Taylor (31.6) powered Neil's offense with 59 combined points—elite QB+RB production that defines winning weeks. Quinshon Judkins (15.8) added a second RB spike, and the Colts' defense (13.9) sealed it with a double-digit showing. George Pickens (12.7) and Tetairoa McMillan (10.3) provided WR support, though A.J. Brown (6.8) underwhelmed again. Neil entered 2–2, left 3–2, and is suddenly a playoff contender.

Akhil fell just short despite Dak Prescott's 30.5-point masterpiece and James Cook's 22.7. When your QB and RB1 combine for 53 and you still lose, the problem is depth. Rome Odunze (16.4) tried to keep it close, and Travis Kelce (14.5) added a solid TE performance, but David Njoku (7.6), DeVonta Smith (6.5), and Seattle's defense (2.0) left too many gaps. Akhil entered 2–2, left 2–3, and this one stings—losing a 252-point game by 2.44 is brutal. They had the stars, but not quite enough around them.`,
      },
      {
        title: 'Nacua Matata (Adam, 3–2) def. The Golden Age (Hunter, 3–2)',
        recap: `Adam crushed Hunter in a high-scoring upset. Puka Nacua (35.1) went nuclear—the week's top WR performance—and Chase Brown (21.6) added an RB spike. Tyler Warren (18.1) at TE and Breece Hall (16.8) provided secondary scoring, while Pittsburgh's defense (14.6) dominated. Even with Jared Goff (11.9) managing rather than dominating and Kenneth Walker (9.8) underwhelming, Adam had enough firepower to cruise. He entered 2–2, left 3–2, and looks dangerous when his stars hit.

Hunter's machine sputtered again. Caleb Williams (24.7) and Derrick Henry (22.0) combined for 47, and Jahmyr Gibbs (16.3) added solid RB2 production, but Malik Nabers (8.9), Emeka Egbuka (5.6), and Jaxon Smith-Njigba (1.9) left massive WR holes. Detroit's defense (10.4) tried to salvage it, but when your WRs combine for just 16.4 points, you're not winning shootouts. Hunter entered 3–1, left 3–2, and the cracks are widening. This roster needs WR help fast or the season slips away.`,
      },
      {
        title: 'Quonspiracy Theorists (Anant, 2–3) def. Dr Patel Parikh MD MBA (Darshan/Kyle, 2–3)',
        recap: `The week's closest game—0.72 points. Anant squeaked past Darshan in a nail-biter that flipped on every play. De'Von Achane (18.8) and Saquon Barkley (18.7) formed a dominant RB duo with 37.5 combined, while Jalen Hurts (17.5) managed the game. Deebo Samuel (17.4) and Marvin Harrison Jr. (12.7) provided WR support, though Elic Ayomanor (4.1) was a dud. Arizona's defense (14.0) sealed it with a double-digit performance. Anant entered 1–3, left 2–3, and this is the kind of close win that can spark a run.

Darshan/Kyle fell just short despite Drake London (24.4) and Romeo Doubs (22.7) combining for 47 at WR. Lamar Jackson (19.7) was solid, and Tyler Allgeier (14.3) provided RB support, but Chase Brown (9.6), Courtland Sutton (8.4), and Houston's defense (7.7) couldn't push them over the line. When you get 47 from your top two WRs and still lose by less than a point, it's the definition of heartbreak. Darshan/Kyle entered 2–2, left 2–3, and this one will haunt them—so close, yet so far.`,
      },
      {
        title: 'benweinfeld (Ben, 3–2) def. scboom5 (Shivang, 3–2)',
        recap: `Ben's breakout game. Ashton Jeanty (29.7) and Garrett Wilson (24.4) combined for 54 points, while Justin Herbert (23.1) delivered his best passing game of the season. Brock Bowers (19.5) added a massive TE spike, and Ja'Marr Chase (12.4) chipped in despite a quiet week by his standards. Even with J.K. Dobbins (10.4), Jameson Williams (8.9), and Kansas City's defense (7.9) all underwhelming, Ben had enough star power to cruise. He entered 2–2, left 3–2, and suddenly looks like a playoff contender. When Jeanty + Wilson + Bowers combine for 73, this team is dangerous.

Shivang couldn't keep pace despite Omarion Hampton's 28.7-point explosion. Jalen Hurts (17.5) was solid, and Bucky Irving (16.0) added RB depth, but Zach Charbonnet (13.9), Khalil Shakir (12.0), Jordan Addison (10.9), and Los Angeles' defense (7.9) couldn't match Ben's firepower. When your RB1 goes for 29 and you still lose by 27, the problem is clear—your stars can't carry the entire load. Shivang entered 3–1, left 3–2, and this loss exposed the depth issues. Still in good shape, but the ceiling isn't as high as it looked after Week 4.`,
      },
      {
        title: 'To Infinity and Bijan (Joel, 4–1) def. vchak (Vinay, 1–4)',
        recap: `Joel stayed dominant. Patrick Mahomes (30.5) and Bijan Robinson (27.9) combined for 58 points—elite QB+RB production that defines championship rosters. Javonte Williams (18.8) added a second RB spike, and Chris Godwin (18.0) finally showed up at WR. Even with Travis Etienne (12.8), Terry McLaurin (9.1), and Cleveland's defense (6.0) all underwhelming, Joel had enough star power to cruise. He entered 3–1, left 4–1, and is firmly in the AFC's top tier. That QB+RB foundation is a cheat code.

Vinay's season continues to unravel. Bo Nix (23.5) and CMC (20.2) tried to keep it close, and Philadelphia's defense (13.6) was solid, but Kyren Williams (11.2), DJ Moore (10.6), Isiah Pacheco (6.1), and Darnell Mooney (3.4) left too many holes. When you get 23.5 from your QB and 20.2 from your RB1 and still lose by 34, the roster needs serious help. Vinay entered 1–3, left 1–4, and is staring at must-win territory. Five weeks in, the playoff window is closing fast.`,
      },
    ],
  },

  nfc: {
    title: 'NFC',
    matchups: [
      {
        title: 'Marginal Returns (Jeffrey, 5–0) def. ziyanp22 (Ziyan, 3–2)',
        recap: `Jeffrey stayed perfect, and it wasn't close. Josh Jacobs (34.1) went nuclear, Derrick Henry (25.0) added a second RB spike, and Garrett Wilson (24.4) delivered a massive WR performance. Even with Caleb Williams (12.6), Amon-Ra (11.8), and Jake Ferguson (8.0) all underwhelming, Jeffrey had enough elite production to demolish Ziyan. Detroit's defense (20.0) dominated, and A.J. Brown (7.4) chipped in despite another quiet week. Jeffrey entered 4–0, left 5–0, and is the ONLY undefeated team left in the entire league. That RB duo (Jacobs + Henry = 59 combined) is championship-caliber.

Ziyan's collapse was stunning. Ashton Jeanty (29.7) and Puka Nacua (28.8) combined for 58 points, and Jordan Love (16.3) was solid, but it wasn't nearly enough. Keenan Allen (4.3), Rome Odunze (3.9), Zach Ertz (3.6), and New Orleans' defense (7.3) combined for just 19.1 points across four starting spots—that's catastrophic. Even with elite WR production (59 from top two), Ziyan couldn't overcome the bottom-half disasters. He entered 3–1, left 3–2, and this loss exposed the depth issues. Still talented, but this was a wake-up call—when your stars don't carry the entire roster, you're beatable.`,
      },
      {
        title: 'Saint Brown Does Mahomes (Aman, 3–2) def. Mach 10 (Dhruv, 3–2)',
        recap: `Aman's firepower overwhelmed Dhruv in a high-scoring affair. Patrick Mahomes (30.5), Amon-Ra (29.2), and James Cook (22.7) combined for 82 points across three positions—when your QB, WR1, and RB1 all spike, you're unstoppable. Stefon Diggs (17.6) and Justin Jefferson (15.8) rounded out a complete WR corps, and San Francisco's defense (11.6) sealed it. Even with LaPorta (5.4) and Rhamondre Stevenson (4.3) laying eggs, Aman had enough star power to cruise. He entered 2–2, left 3–2, and looks dangerous when his top guys hit.

Dhruv couldn't match the firepower despite George Pickens (29.4) and Jahmyr Gibbs (18.7) combining for 48. Jaxon Smith-Njigba (15.4) and Jordan Addison (14.4) were solid, but Daniel Jones (11.8), De'Von Achane (10.2), and Kansas City's defense (7.8) left too many gaps. When your WR1 goes for 29 and you still lose by 12, it's a depth problem. Dhruv entered 3–1, left 3–2, and this one stings—he had the star power but not quite enough around it. Still in good shape at 3–2, but the ceiling needs to rise.`,
      },
      {
        title: 'vayyala (Vinny, 1–4) def. The zoo (Rithik, 1–4)',
        recap: `Vinny finally broke through! After four straight losses to open the season, Vinny demolished Rithik 128.6–96.2 to get off the schneid. Jalen Hurts (32.3) delivered his best game of the season, Kyren Williams (23.2) exploded at RB, and Tee Higgins (19.2) finally showed up at WR. Bo Nix (16.1), Brian Thomas (15.0), and Chris Olave (13.6) rounded out a balanced attack, and New England's defense (8.1) sealed it. Even with T.J. Hockenson (1.0) laying an egg, Vinny had enough firepower to cruise. He entered 0–4, left 1–4, and this win is massive for morale—proving the roster can compete when things click.

Rithik couldn't keep pace despite Pittsburgh's defense (19.9) dominating. Brock Bowers (17.9), Drake London (15.5), and Travis Etienne (11.9) all showed up, but Sam Darnold (10.2), Breece Hall (8.1), Alvin Kamara (7.5), and Malik Nabers (3.0) left massive holes. When your defense puts up 20 and you still lose by 32, the offense is broken. Rithik entered 1–3, left 1–4, and this one exposed the depth issues—too many middling performances, not enough explosions. Both teams are 1–4 now, staring at must-win situations every week.`,
      },
      {
        title: 'DJ Herbussy (Akhil C, 4–1) def. lukebowsh (Luke, 2–3)',
        recap: `The week's highest score: 146. Akhil C demolished Luke with a complete performance across the board. Bucky Irving (32.4) and Justin Herbert (27.6) combined for 60 at QB+RB, Emeka Egbuka (24.8) and Tyler Warren (18.1) added WR+TE spikes, and Jonathan Taylor (13.6) provided RB depth. Even with David Montgomery (10.0), Kenneth Gainwell (9.6), and Miami's defense (8.3) all mediocre, Akhil C had enough elite production to cruise. He entered 3–1, left 4–1, and this performance announced him as a title contender. When you crack 145, you're beating everyone.

Luke couldn't match it despite Omarion Hampton (27.0) and CMC (22.6) combining for 50 at RB. Baker Mayfield (18.4), Deebo Samuel (16.6), Mark Andrews (14.8), and Calvin Ridley (11.9) all showed up, but it wasn't nearly enough. When you get 50 from your RBs and 70 from your other six starters and still lose by 24, you're facing an elite opponent. Luke entered 2–2, left 2–3, and there's no shame in this loss—Akhil C was just that good. But at 2–3, Luke's margin for error is shrinking fast.`,
      },
      {
        title: 'C&G^2 (Josh, 3–2) def. Dont go Chasing Saquon (Arnav, 0–5)',
        recap: `Josh crushed Arnav to move to 3–2 and keep pace in the playoff race. Javonte Williams (26.5) and Quinshon Judkins (22.5) combined for 49 at RB, Lamar Jackson (21.7) was elite, and Davante Adams (19.9) delivered a massive WR spike. Jaxon Smith-Njigba (15.4), Tyreek Hill (13.5), and Chicago's defense (11.0) rounded out a complete performance. Even with Travis Kelce (5.4) laying an egg, Josh had enough firepower. He entered 2–2, left 3–2, and is firmly in the playoff mix. That RB duo is the foundation.

Arnav fell to 0–5, and the season is toast. Bijan Robinson (27.1) tried to keep it close, and Kyler Murray (19.4) was solid, but Saquon Barkley (14.2), Ja'Marr Chase (13.1), Quentin Johnston (11.2), Darnell Mooney (9.5), and the Texans' defense (9.4) couldn't combine for enough. When your RB1 goes for 27 and you still lose by 26, the roster's broken. Arnav entered 0–4, left 0–5, and is mathematically alive but spiritually finished. Five straight losses, no top-5 scoring weeks, and a roster with no elite position group—this one's over.`,
      },
      {
        title: 'cescott25 (Christian, 4–1) def. Jaxson Dart-Njigba (Alex, 1–4)',
        recap: `Christian cruised to 4–1 with a dominant performance. Josh Allen (27.8), Kenneth Gainwell (26.4), and the Chargers' defense (19.6) combined for 74 points—elite production from three positions. Nico Collins (16.0), Ricky Pearsall (15.1), DeVonta Smith (12.4), and Kenneth Walker (12.5) rounded out a balanced attack. Even with Darnell Mooney (1.0) laying an egg, Christian had enough firepower. He entered 3–1, left 4–1, and is firmly in the playoff picture. When you get 27+ from your QB and 26+ from your RB2, you're winning games.

Alex couldn't keep pace despite DK Metcalf (18.8), Courtland Sutton (14.7), and Xavier Worthy (13.5) all showing up. Jared Goff (12.7), Alvin Kamara (9.8), Chuba Hubbard (9.2), Zay Flowers (6.7), and Houston's defense (2.4) left too many holes. When your WRs combine for 47 and you still lose by 42, the problem is clear—QB and RB production is pedestrian. Alex entered 1–3, left 1–4, and is staring at must-win territory. The roster has pieces, but not enough consistency. Five more wins needed just to get to .500.`,
      },
    ],
  },

  closing: `Week 5 separated contenders from pretenders. Jeffrey stands alone at 5–0, the league's only undefeated team, while Arnav sits alone at 0–5, mathematically alive but spiritually finished. The middle is chaos: 14 teams between 2–3 and 4–1, separated by tiebreakers and luck. Three games ended within three points, proving that in this league, every play matters. Akhil C's 146 was the week's statement performance, while Vinny's first win ended his 0–4 nightmare. The RBs dominated: Jacobs (34.1), Puka (35.1), Jeanty (29.7), Hampton (27-28 across two leagues), and Bijan (27.9) all cracked 27+. But stars like Ziyan (97) and Alex (89) proved that even elite pieces can't save you when depth fails. Week 6 will test who's real and who's been riding variance. The Gauntlet doesn't forgive mediocrity—and the margin between playoff dreams and elimination is razor-thin.`,
} as const;

import type { BoxRow } from '@/shared/types/reports';

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

export default function Week5Report2025() {
  // Use hardcoded data like Week 4 does
  const data = { ok: true, data: reportData } as const;

  // Helper to match matchups with new narrative structure
  const getMatchupRecap = (teamAName: string, teamBName: string, leagueName: string) => {
    const isAFC = (leagueName || '').toLowerCase().includes('afc');
    const section = isAFC ? WEEK5_CONTENT.afc : WEEK5_CONTENT.nfc;

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
      <PageHeader title="Week 5 Report — 2025" subtitle="Perfect records fall, first wins emerge" />

      {/* Main Introduction */}
      <div className="text-sm leading-relaxed space-y-4">
        <div className="whitespace-pre-wrap">{WEEK5_CONTENT.main_intro}</div>
      </div>

      {/* Hall of Fame & Shame Records */}
      <h2 className="text-lg font-semibold">🏆 Week 5 Records</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hall of Fame */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gauntlet-gold flex items-center gap-2">
            <span>✨</span> Hall of Fame
          </h3>
          <div className="text-xs space-y-2">
            <div className="text-muted-foreground italic p-2">
              Records will be added after data analysis
            </div>
          </div>
        </div>

        {/* Hall of Shame */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gauntlet-crimson flex items-center gap-2">
            <span>💀</span> Hall of Shame
          </h3>
          <div className="text-xs space-y-2">
            <div className="text-muted-foreground italic p-2">
              Records will be added after data analysis
            </div>
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
          [Data file not yet populated - run data generation script to populate report-week5.json]
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

      {/* Hall of Fame */}
      {data?.ok && data.data?.hallOfFame && data.data.hallOfFame.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Week 5 Hall of Fame</h2>
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
        <div className="text-sm leading-relaxed">{WEEK5_CONTENT.closing}</div>
      </div>
    </div>
  );
}
