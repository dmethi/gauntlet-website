import type { WeeklyRecap } from './types';

const THRONE = '1387520086092312576';
const KEEP = '1387520168866885632';
const FORGE = '1387520236663615488';

export const WEEK_TWO_RECAP = {
  season: 2026,
  week: 2,
  publishedAt: '2026-09-22T12:00:00-04:00',
  headline: 'The Margin for Error Disappeared',
  subheadline:
    'Scoring fell by more than ten points per team, six games landed within five, and every manager on the wrong side of those finishes had a winning lineup sitting somewhere on the bench.',
  lede: [
    'Week 1 offered points in bulk. Week 2 put them behind glass. The average team score fell from a corrected 117.20 to 106.71, and 15 of 36 teams failed to reach 100 after only seven did so in the opener.',
    'Everywhere else, the available oxygen went into the endings. Six games were decided by five points or fewer, four by fewer than two, and opening favorites finished 7–11.',
    'There is no clean way to comfort the losers. Every one of the six close games flips with a legal lineup decision. Week 1 was loud enough to hide mistakes. Week 2 made each one audible.',
  ],
  leagues: [
    {
      leagueId: THRONE,
      name: 'Legion I: The Throne',
      shortName: 'Throne',
      matchups: [
        {
          key: `${THRONE}:2:1`,
          leagueId: THRONE,
          matchupId: 1,
          teams: [
            { rosterId: 2, fallbackLabel: 'Coker Laced Flowers', score: 128.21 },
            { rosterId: 5, fallbackLabel: 'Jaxson my Johnston', score: 69.1 },
          ],
          winnerRosterId: 2,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.7651,
          headline: 'Hunter’s Miracle Expired in Seven Days',
          deck: 'The Week 1 escape artist returned with three starters below three points.',
          recap:
            'Jaxson Dart scored 0.80, Saquon Barkley 2.50, and Quentin Johnston 1.90 in Hunter’s 69.10-point collapse. Anant never fell below roughly 71 percent and won 128.21–69.10 behind DeVonta Smith, Christian McCaffrey, and Dalton Kincaid. Hunter’s optimal legal lineup reaches 110.00. This was not stolen; it was condemned.',
          decisiveLabel: 'Bottom three starters: 5.20',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:2:2`,
          leagueId: THRONE,
          matchupId: 2,
          teams: [
            { rosterId: 8, fallbackLabel: 'ziyanp22', score: 91.29 },
            { rosterId: 9, fallbackLabel: 'cescott25', score: 127.62 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 8,
          openingWinProbability: 0.66415,
          headline: 'Josh Allen Rewrote the Opening Line',
          deck: 'Christian entered at 33.6 percent and left with a 36-point win.',
          recap:
            'Josh Allen’s 42.82 turned a clear opening disadvantage into Christian’s 127.62–91.29 rout. Derrick Henry and Trey McBride added 32.30. Ziyan left Tre Tucker’s 20.40 and Minnesota’s 15.95 on the bench, but even the optimal lineup still falls 9.33 short.',
          decisiveLabel: 'Josh Allen: 42.82',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:2:3`,
          leagueId: THRONE,
          matchupId: 3,
          teams: [
            { rosterId: 1, fallbackLabel: 'Crown and Pound', score: 92.16 },
            { rosterId: 12, fallbackLabel: 'Marginal Returns', score: 109.38 },
          ],
          winnerRosterId: 12,
          openingFavoriteRosterId: 1,
          openingWinProbability: 0.7359,
          headline: 'The Week 1 Leader Met Week 2',
          deck: 'A 157.80-point opener turned into 92.16 and an upset loss.',
          recap:
            'Jonathan Taylor supplied 29.20, but Crown and Pound’s bottom three starters combined for only 14.00. Bego and Jeffrey countered with 62.40 from James Cook, Dalton Schultz, and Omarion Hampton, winning 109.38–92.16 after opening at only 26.4 percent.',
          decisiveLabel: 'Bego’s top three: 62.40',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:2:4`,
          leagueId: THRONE,
          matchupId: 4,
          teams: [
            { rosterId: 3, fallbackLabel: 'Love Warrents Dak Pics', score: 113.86 },
            { rosterId: 7, fallbackLabel: 'Something’s Gotta Gibbs', score: 123.15 },
          ],
          winnerRosterId: 7,
          openingFavoriteRosterId: 3,
          openingWinProbability: 0.56815,
          headline: 'Kanze Came Back From 3.7 Percent',
          deck: 'A nine-point final concealed one of the week’s deepest live holes.',
          recap:
            'Kanze fell to 3.7 percent Sunday afternoon before CeeDee Lamb, New England’s defense, and Jahmyr Gibbs combined for 75.15. Dak Prescott’s 30.76 kept Daal and Aman close, but the late wave completed a 123.15–113.86 reversal.',
          decisiveLabel: 'Lamb, Patriots D/ST, Gibbs: 75.15',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${THRONE}:2:5`,
          leagueId: THRONE,
          matchupId: 5,
          teams: [
            { rosterId: 4, fallbackLabel: 'Two Williams, One Cup', score: 76.82 },
            { rosterId: 11, fallbackLabel: 'benweinfeld', score: 126.88 },
          ],
          winnerRosterId: 11,
          openingFavoriteRosterId: 4,
          openingWinProbability: 0.61545,
          headline: 'Ben’s Bargain Bin Became a Steamroller',
          deck: 'Mahomes and Kelce cost two auction dollars and supplied 50 points.',
          recap:
            'Patrick Mahomes scored 29.48, Kenneth Walker 24.30, and $1 Travis Kelce 20.60 in Ben’s 126.88–76.82 demolition. Akhil’s highest scorer managed 16.20, and no legal lineup reaches 84. The favorite lost by 50.06 because the underdog’s value picks stopped behaving like bargains.',
          decisiveLabel: 'Mahomes, Walker, Kelce: 74.38',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:2:6`,
          leagueId: THRONE,
          matchupId: 6,
          teams: [
            { rosterId: 6, fallbackLabel: 'scboom5', score: 138.73 },
            { rosterId: 10, fallbackLabel: 'Injured Excellence', score: 107.33 },
          ],
          winnerRosterId: 6,
          openingFavoriteRosterId: 6,
          openingWinProbability: 0.6346,
          headline: 'Three Players Nearly Beat Neil by Themselves',
          deck: 'Smith-Njigba, St. Brown, and Goff combined for 96.48.',
          recap:
            'Jaxon Smith-Njigba scored 38.00, Amon-Ra St. Brown 30.70, and Jared Goff 27.78. That trio came within 10.85 of Neil’s entire lineup. Shivang finished at 138.73, the week’s second-highest score, and moved to 2–0 with a 31.40-point win.',
          decisiveLabel: 'Three-player core: 96.48',
          probabilityQuality: 'reliable',
          featured: true,
        },
      ],
    },
    {
      leagueId: KEEP,
      name: 'Legion II: The Keep',
      shortName: 'Keep',
      matchups: [
        {
          key: `${KEEP}:2:1`,
          leagueId: KEEP,
          matchupId: 1,
          teams: [
            { rosterId: 2, fallbackLabel: 'Jonathon Taylor Mayde', score: 89.42 },
            { rosterId: 3, fallbackLabel: 'Checkout & Gameplay', score: 91.26 },
          ],
          winnerRosterId: 3,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.5257,
          headline: 'Checkout Won the Ninety-One-Point Knife Fight',
          deck: 'Nolan’s last two receivers combined for 0.80 in a 1.84-point loss.',
          recap:
            'Checkout survived Malik Nabers’s 0.60 and Kansas City’s 1.70 to win 91.26–89.42. Nolan received 29.20 from Jonathan Taylor and 19.00 from Dalton Kincaid, then started Jayden Reed and DJ Moore for 0.80 combined. Brian Thomas over Reed alone changes the winner.',
          decisiveLabel: 'One-swap correction: +4.60',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:2:2`,
          leagueId: KEEP,
          matchupId: 2,
          teams: [
            { rosterId: 9, fallbackLabel: 'lukebowsh', score: 93.09 },
            { rosterId: 11, fallbackLabel: 'vchak', score: 91.38 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 9,
          openingWinProbability: 0.9947,
          headline: 'The 99.5 Percent Favorite Barely Survived',
          deck: 'A missing projection created a fake mismatch; the final margin was 1.71.',
          recap:
            'Kenneth Walker’s 24.30 and Stefon Diggs’s 19.20 dragged vchak to 91.38, but Luke held on at 93.09 behind Jahmyr Gibbs and George Kittle. Woody Marks over Carnell Tate adds 2.30 and turns vchak’s loss into a 0.59-point win.',
          decisiveLabel: 'Woody Marks waited with the winner',
          probabilityQuality: 'directional',
          probabilityNote: 'The opening model included a missing player projection.',
        },
        {
          key: `${KEEP}:2:3`,
          leagueId: KEEP,
          matchupId: 3,
          teams: [
            { rosterId: 1, fallbackLabel: 'Ja’Marrican Psycho', score: 114.96 },
            { rosterId: 12, fallbackLabel: 'vayyala', score: 118.93 },
          ],
          winnerRosterId: 12,
          openingFavoriteRosterId: 12,
          openingWinProbability: 0.59985,
          headline: 'Sean Chose the Wrong Quarterback by Twenty-Two',
          deck: 'Patrick Mahomes matched Brock Purdy point for point—from Sean’s bench.',
          recap:
            'Vinay won 118.93–114.96 after Brock Purdy scored 29.48. Sean answered with Trevor Lawrence’s 6.66 while Patrick Mahomes’s matching 29.48 sat unused. The quarterback decision was worth 22.82 points in a 3.97-point loss. Amon-Ra St. Brown and Ja’Marr Chase deserved cleaner paperwork.',
          decisiveLabel: 'QB decision: -22.82',
          probabilityQuality: 'directional',
          probabilityNote: 'The curve reached zero before Vinay’s comeback was complete.',
        },
        {
          key: `${KEEP}:2:4`,
          leagueId: KEEP,
          matchupId: 4,
          teams: [
            { rosterId: 5, fallbackLabel: 'HarrytheHitman9', score: 95.2 },
            { rosterId: 10, fallbackLabel: 'King Henry’s Court', score: 166.52 },
          ],
          winnerRosterId: 10,
          openingFavoriteRosterId: 5,
          openingWinProbability: 0.5314,
          headline: 'Rithik Put Up 166 in a Week Built for 96',
          deck: 'Every starter cleared 9.20; six cleared 14.',
          recap:
            'Josh Allen led with 42.82, but this was not a one-star rescue. Derrick Henry, Chris Olave, DeVonta Smith, Sam LaPorta, and Denzel Boston all cleared 14. Rithik’s 166.52 ranks fourth all-time. Harry received 38.00 from Jaxon Smith-Njigba and still lost by 71.32.',
          decisiveLabel: 'No. 4 score · No. 8 margin all-time',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${KEEP}:2:5`,
          leagueId: KEEP,
          matchupId: 5,
          teams: [
            { rosterId: 4, fallbackLabel: 'Team Lil Bros', score: 113.32 },
            { rosterId: 7, fallbackLabel: 'akmadurai', score: 114.56 },
          ],
          winnerRosterId: 7,
          openingFavoriteRosterId: 7,
          openingWinProbability: 0.8242,
          headline: 'One Wicks Swap Saves Team Lil Bros',
          deck: 'A 1.24-point finish turned on Jordan Addison’s lineup spot.',
          recap:
            'Dhruv Modi lost 114.56–113.32 despite 31.30 from CeeDee Lamb and 20.60 from Travis Kelce. Jordan Addison scored 3.10 and Colston Loveland 0.80. Dontayvion Wicks’s 9.90 over Addison changes the winner without asking the optimizer to get clever.',
          decisiveLabel: 'One-swap correction: +6.80',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:2:6`,
          leagueId: KEEP,
          matchupId: 6,
          teams: [
            { rosterId: 6, fallbackLabel: 'JimothyGreene', score: 72.33 },
            { rosterId: 8, fallbackLabel: 'the beggar king', score: 92.1 },
          ],
          winnerRosterId: 8,
          openingFavoriteRosterId: 6,
          openingWinProbability: 0.5204,
          headline: 'The Donut Rule Reasserted Itself',
          deck: 'Week 1 produced a two-zero winner. Jimothy restored the usual consequences.',
          recap:
            'Jimothy started zeroes from Puka Nacua and Marvin Harrison and left Jared Goff’s 27.78 on the bench. Alex needed only 92.10 to win by 19.77. Jimothy’s optimal legal lineup reaches 103.03, enough to reverse the result.',
          decisiveLabel: 'Two zeroes · Winning bench available',
          probabilityQuality: 'reliable',
        },
      ],
    },
    {
      leagueId: FORGE,
      name: 'Legion III: The Forge',
      shortName: 'Forge',
      matchups: [
        {
          key: `${FORGE}:2:1`,
          leagueId: FORGE,
          matchupId: 1,
          teams: [
            { rosterId: 2, fallbackLabel: 'Nikhil Krishnan', score: 113.29 },
            { rosterId: 8, fallbackLabel: 'aditya22', score: 129.38 },
          ],
          winnerRosterId: 8,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.70125,
          headline: 'Aditya Climbed Out of Seven Percent',
          deck: 'The underdog won behind another 38-point Smith-Njigba performance.',
          recap:
            'Aditya opened at 29.9 percent and fell to 7.3 before Jaxon Smith-Njigba’s 38.00, James Cook’s 23.40, and Travis Kelce’s 20.60 took over. Nikhil received 29.20 from Jonathan Taylor but could not keep pace in the 129.38–113.29 reversal.',
          decisiveLabel: 'Aditya’s top three: 82.00',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:2:2`,
          leagueId: FORGE,
          matchupId: 2,
          teams: [
            { rosterId: 3, fallbackLabel: 'aaryanshetty', score: 66.96 },
            { rosterId: 12, fallbackLabel: 'Sahilmodi8', score: 118.93 },
          ],
          winnerRosterId: 12,
          openingFavoriteRosterId: 12,
          openingWinProbability: 0.75865,
          headline: 'Sahil Let Four Players Handle It',
          deck: 'The winning core outscored Aaryan’s entire lineup by 29.52.',
          recap:
            'Amon-Ra St. Brown, Brock Purdy, Ja’Marr Chase, and Rachaad White combined for 96.48—more than Aaryan’s 66.96 total. Sahil won by 51.97. Aaryan’s optimal lineup still finishes below 79, leaving the autopsy with no actionable cause.',
          decisiveLabel: 'Four-player core: 96.48',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:2:3`,
          leagueId: FORGE,
          matchupId: 3,
          teams: [
            { rosterId: 1, fallbackLabel: 'ashwindandapani1', score: 131.08 },
            { rosterId: 7, fallbackLabel: 'Mexican Cartel', score: 130.42 },
          ],
          winnerRosterId: 1,
          openingFavoriteRosterId: 1,
          openingWinProbability: 0.60875,
          headline: 'Ashwin Survived the Last Two Minutes',
          deck: 'His chance traveled from 100 percent to 3.5—and back—in eight minutes.',
          recap:
            'Ashwin led 131.08–112.87 and briefly reached certainty before Rafa’s late Green Bay points arrived in waves. At 11:02 p.m., Mexican Cartel had closed to 130.42 and the model projected one more point, dropping Ashwin to 3.5 percent. It never came. Dontayvion Wicks over Quentin Johnston would have saved Rafa comfortably.',
          decisiveLabel: 'Final margin: 0.66 · Rafa’s bench: +8.00',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${FORGE}:2:4`,
          leagueId: FORGE,
          matchupId: 4,
          teams: [
            { rosterId: 5, fallbackLabel: 'gibuttersnaps', score: 81.72 },
            { rosterId: 11, fallbackLabel: 'Loveland Island', score: 77.56 },
          ],
          winnerRosterId: 5,
          openingFavoriteRosterId: 11,
          openingWinProbability: 0.7519,
          headline: 'Sid Lost the Cheapest Game of the Week',
          deck: 'The winner scored 81.72. Dalton Schultz scored 20 on Sid’s bench.',
          recap:
            'Gibuttersnaps won 81.72–77.56 in the third-lowest combined score in registered history. The winning score is also the third-lowest ever. Sid started Colston Loveland’s 0.80 while Dalton Schultz’s 20.00 sat unused; that one substitution turns a four-point loss into a 15-point win.',
          decisiveLabel: 'One-swap correction: +19.20',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:2:5`,
          leagueId: FORGE,
          matchupId: 5,
          teams: [
            { rosterId: 4, fallbackLabel: 'Socialized L-Care', score: 121.13 },
            { rosterId: 10, fallbackLabel: 'brendenclerget', score: 82.5 },
          ],
          winnerRosterId: 4,
          openingFavoriteRosterId: 10,
          openingWinProbability: 0.59865,
          headline: 'The Underdog Had the Better Quarterback—and Everything Else',
          deck: 'Socialized L-Care erased the line by nearly 39 points.',
          recap:
            'Jared Goff scored 27.78, Kenneth Walker 24.30, and Cincinnati’s defense 14.75 in Socialized L-Care’s 121.13–82.50 win. Brenden’s optimal lineup reaches 127.93 and would flip the game, but it requires four changes—the difference between a mistake and a full administrative review.',
          decisiveLabel: 'Opening chance: 40.1 percent',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:2:6`,
          leagueId: FORGE,
          matchupId: 6,
          teams: [
            { rosterId: 6, fallbackLabel: 'Can you tuten my face', score: 105.68 },
            { rosterId: 9, fallbackLabel: 'Lisan Al-Caleb', score: 125.47 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 6,
          openingWinProbability: 0.77865,
          headline: 'Four Lead Changes, One 4.6 Percent Escape',
          deck: 'Lisan Al-Caleb turned the week’s longest underdog price into a 20-point win.',
          recap:
            'Lisan Al-Caleb opened at 22.1 percent, fell to 4.6, and still won 125.47–105.68 after four lead changes. Eight starters reached double figures, led by Stefon Diggs, Omarion Hampton, Chris Olave, and Jaylen Waddle. Lineeth’s Patrick Mahomes and Derrick Henry could not hold the line.',
          decisiveLabel: 'Eight starters in double figures',
          probabilityQuality: 'directional',
          probabilityNote:
            'The recorded tail still projected unfinished points after the final score.',
          featured: true,
        },
      ],
    },
  ],
  flowSections: [
    {
      id: 'heartbreak-desk',
      title: 'The Heartbreak Desk',
      deck: 'Six games inside five points. Six losing managers with a winning lineup available.',
      matchupKeys: [
        `${FORGE}:2:3`,
        `${KEEP}:2:5`,
        `${KEEP}:2:2`,
        `${KEEP}:2:1`,
        `${KEEP}:2:3`,
        `${FORGE}:2:4`,
      ],
    },
    {
      id: 'one-offense',
      title: 'One Offense Missed the Memo',
      deck: 'Rithik and Shivang found abundance in a week organized around scarcity.',
      matchupKeys: [`${KEEP}:2:4`, `${THRONE}:2:6`],
    },
    {
      id: 'underdog-ledger',
      title: 'The Underdog Ledger',
      deck: 'The opening market finished 7–11 and several reversals were not remotely close.',
      matchupKeys: [
        `${THRONE}:2:2`,
        `${THRONE}:2:3`,
        `${THRONE}:2:4`,
        `${FORGE}:2:1`,
        `${FORGE}:2:5`,
        `${FORGE}:2:6`,
      ],
    },
    {
      id: 'scoring-winter',
      title: 'The Scoring Winter',
      deck: 'Four games where the points disappeared before the excuses did.',
      matchupKeys: [`${THRONE}:2:1`, `${THRONE}:2:5`, `${KEEP}:2:6`, `${FORGE}:2:2`],
    },
  ],
  records: [
    {
      title: 'Rithik’s One-Week Counteroffensive',
      classification: 'Hall of Fame',
      rank: 4,
      rankLabel: 'No. 4 · Highest team score',
      summary:
        'King Henry’s Court scored 166.52 in a week where the other 35 teams averaged 105.01.',
    },
    {
      title: 'The 0.66-Point Receipt',
      classification: 'Statistical oddity',
      rank: 5,
      rankLabel: 'No. 5 · Narrowest victory',
      summary:
        'Ashwin and Rafa produced the fifth-closest registered finish. Rafa’s 130.42 is also the fourth-highest losing score.',
    },
    {
      title: 'Winning Ugly, Historically',
      classification: 'Hall of Shame',
      rank: 3,
      rankLabel: 'No. 3 · Fewest points in a win',
      summary:
        'Gibuttersnaps won with 81.72. The 159.28 combined score is also the third-lowest matchup total.',
    },
    {
      title: 'The Close-Game Census',
      classification: 'Statistical oddity',
      rank: 1,
      rankLabel: 'New weekly high · Six within five',
      summary:
        'No registered week had produced more than three games within five points. Week 2 produced six, including four within two.',
    },
    {
      title: 'The Donut Rule Reasserts Itself',
      classification: 'Hall of Shame',
      rank: 1,
      rankLabel: 'Tied No. 1 · Starter donuts',
      summary:
        'Jimothy matched Week 1’s two-zero lineup, but this time the bench held enough points to reverse the loss.',
    },
  ],
  autopsies: [
    {
      teamKey: `${KEEP}:2`,
      label: 'Jonathon Taylor Mayde',
      actualScore: 89.42,
      opponentScore: 91.26,
      revisedScore: 94.02,
      swap: 'Brian Thomas over Jayden Reed',
    },
    {
      teamKey: `${KEEP}:11`,
      label: 'vchak',
      actualScore: 91.38,
      opponentScore: 93.09,
      revisedScore: 93.68,
      swap: 'Woody Marks over Carnell Tate',
    },
    {
      teamKey: `${KEEP}:1`,
      label: 'Ja’Marrican Psycho',
      actualScore: 114.96,
      opponentScore: 118.93,
      revisedScore: 137.78,
      swap: 'Patrick Mahomes over Trevor Lawrence',
    },
    {
      teamKey: `${KEEP}:4`,
      label: 'Team Lil Bros',
      actualScore: 113.32,
      opponentScore: 114.56,
      revisedScore: 120.12,
      swap: 'Dontayvion Wicks over Jordan Addison',
    },
    {
      teamKey: `${FORGE}:7`,
      label: 'Mexican Cartel',
      actualScore: 130.42,
      opponentScore: 131.08,
      revisedScore: 138.42,
      swap: 'Dontayvion Wicks over Quentin Johnston',
    },
    {
      teamKey: `${FORGE}:11`,
      label: 'Loveland Island',
      actualScore: 77.56,
      opponentScore: 81.72,
      revisedScore: 96.76,
      swap: 'Dalton Schultz over Colston Loveland',
    },
  ],
  receipts: [
    {
      title: 'Kenneth Walker owns the production board',
      summary:
        'His three copies have each produced 60.40 starter points and roughly 53–55 VORP. Socialized L-Care’s $44 copy leads at +55.45.',
    },
    {
      title: 'The $1 Kelce position',
      summary:
        'Ben paid one dollar for Travis Kelce and has received 29.20 points and +19.60 VORP through two starts.',
    },
    {
      title: 'Josh Allen is the blue-chip bargain',
      summary:
        'Both $32 copies sit near +50 VORP—roughly the output of running backs who cost more than twice as much.',
    },
    {
      title: 'Two-dollar quarterbacks are paying rent',
      summary:
        'Vinay’s $2 Brock Purdy has returned +26.54 VORP. Sean’s $1 Patrick Mahomes would have flipped this week from the bench.',
    },
    {
      title: 'Colston Loveland is underwater everywhere',
      summary:
        'His $16, $20, and $22 copies have each produced 0.80 total points in two starts. One directly appears in a 1.24-point loss.',
    },
  ],
} as const satisfies WeeklyRecap;

export const getWeekTwoMatchups = () =>
  (WEEK_TWO_RECAP as WeeklyRecap).leagues.flatMap(league => league.matchups);
