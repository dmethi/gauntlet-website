import type { WeeklyRecap } from './types';

const THRONE = '1387520086092312576';
const KEEP = '1387520168866885632';
const FORGE = '1387520236663615488';

export const WEEK_THREE_RECAP = {
  season: 2026,
  week: 3,
  publishedAt: '2026-10-01T12:00:00-04:00',
  headline: 'The Average Came Back. The Middle Did Not.',
  subheadline:
    'Four teams cleared 140 while 15 stayed below 100, favorites reclaimed the board, and the standings separated into five unbeaten teams and four still searching for a first win.',
  lede: [
    'Week 3 returned 112.84 points to the league-wide total and somehow made the typical lineup worse. The average rose to 109.85; the median fell more than seven points to 104.00.',
    'The explanation lived at the edges. Aditya, Nikhil, Daal and Aman, and Harry all cleared 140. Fifteen other teams remained below 100. The middle did not recover so much as the upper tail detached from it.',
    'The market found its footing too. Opening favorites finished 12–6 after going 7–11 a week ago. Three weeks in, five teams are 3–0 and four are 0–3. September has stopped feeling introductory.',
  ],
  openingOddsSource: 'the first recorded Week 3 driveFF sample',
  leagues: [
    {
      leagueId: THRONE,
      name: 'Legion I: The Throne',
      shortName: 'Throne',
      matchups: [
        {
          key: `${THRONE}:3:1`,
          leagueId: THRONE,
          matchupId: 1,
          teams: [
            { rosterId: 2, fallbackLabel: 'Coker Laced Flowers', score: 86.12 },
            { rosterId: 8, fallbackLabel: 'ziyanp22', score: 98.58 },
          ],
          winnerRosterId: 8,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.6471,
          headline: 'Minnesota’s Defense Stole an Entire Offense’s Job',
          deck: 'Ziyan opened at 35.3 percent, fell near ten, and won without reaching 100.',
          recap:
            'Minnesota’s defense scored 26.50, more than Ziyan’s next two starters combined, and turned a thin lineup into a 98.58–86.12 upset. Anant received 21.10 from Christian McCaffrey and 18.00 from Tee Higgins, but four starters stayed below five. The probability feed changed hands 13 times before the correction desk added two final points to Anant’s Sleeper total.',
          decisiveLabel: 'Minnesota D/ST: 26.50 · Winner low: 10.1%',
          probabilityQuality: 'directional',
          probabilityNote:
            'The recorded tail finished two points below Sleeper’s corrected final for Coker Laced Flowers.',
        },
        {
          key: `${THRONE}:3:2`,
          leagueId: THRONE,
          matchupId: 2,
          teams: [
            { rosterId: 5, fallbackLabel: 'Nothing is going Wright', score: 92.58 },
            { rosterId: 9, fallbackLabel: 'cescott25', score: 108.46 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 9,
          openingWinProbability: 0.7496,
          headline: 'Christian Won; Hunter’s Tight End Choice Did Not',
          deck: 'A 15.88-point result flips with one legal swap at tight end.',
          recap:
            'Brock Bowers, Derrick Henry, and Josh Allen supplied 62.46 of Christian’s 108.46 points. Hunter finished at 92.58 after Oronde Gadsden scored zero. Kenyon Sadiq’s 20.00 waited on the bench; moving him into the same slot produces a 112.58–108.46 reversal.',
          decisiveLabel: 'Kenyon Sadiq over Oronde Gadsden: +20.00',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:3:3`,
          leagueId: THRONE,
          matchupId: 3,
          teams: [
            { rosterId: 1, fallbackLabel: 'Crown and Pound', score: 81.73 },
            { rosterId: 3, fallbackLabel: 'Love Warrents Dak Pics', score: 149.49 },
          ],
          winnerRosterId: 3,
          openingFavoriteRosterId: 3,
          openingWinProbability: 0.6756,
          headline: 'Daal and Aman Removed the Competitive Portion Early',
          deck: 'Four starters combined for 98.94 in a 67.76-point demolition.',
          recap:
            'Bijan Robinson scored 38.80, Jaylen Warren 21.60, Dak Prescott 19.44, and Christian Watson 19.10. That quartet beat Crown and Pound by itself. Daal and Aman finished at 149.49, the week’s third-highest score, while Dhruv fell from the opening-week scoring lead to 81.73.',
          decisiveLabel: 'No. 10 margin in registered history',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${THRONE}:3:4`,
          leagueId: THRONE,
          matchupId: 4,
          teams: [
            { rosterId: 7, fallbackLabel: 'Something’s Gotta Gibbs', score: 112.04 },
            { rosterId: 12, fallbackLabel: 'Marginal Returns', score: 109.64 },
          ],
          winnerRosterId: 7,
          openingFavoriteRosterId: 7,
          openingWinProbability: 0.5616,
          headline: 'Gibbs Won the Week’s Best Argument',
          deck: 'Twenty-six modeled lead changes ended with Kanze ahead by 2.40.',
          recap:
            'Jahmyr Gibbs scored 40.40 and carried Kanze through a game whose probability line crossed midfield 26 times. Bego and Jeffrey answered with 23.20 from George Kittle and 22.90 from James Cook, but finished short at 109.64. Keaton Mitchell over Dalton Schultz adds 8.20 and changes the verdict.',
          decisiveLabel: 'Jahmyr Gibbs: 40.40 · Winner low: 10.6%',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${THRONE}:3:5`,
          leagueId: THRONE,
          matchupId: 5,
          teams: [
            { rosterId: 6, fallbackLabel: 'scboom5', score: 133.59 },
            { rosterId: 11, fallbackLabel: 'benweinfeld', score: 114.09 },
          ],
          winnerRosterId: 6,
          openingFavoriteRosterId: 6,
          openingWinProbability: 0.5232,
          headline: 'Shivang Is the Throne’s Last Perfect Team',
          deck: 'The narrowest opening favorite in the Legion left with a 19.50-point win.',
          recap:
            'Jaxon Smith-Njigba scored 30.36, Joe Burrow 23.08, and Javonte Williams and Juwan Johnson 19.30 each. Ben reached 114.09 and still spent most of the finish chasing. Shivang’s 133.59 moved him to 3–0 with 395.73 points, the highest total in the Throne.',
          decisiveLabel: '3–0 · 395.73 points for',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:3:6`,
          leagueId: THRONE,
          matchupId: 6,
          teams: [
            { rosterId: 4, fallbackLabel: 'Two Williams, One Cup', score: 101.6 },
            { rosterId: 10, fallbackLabel: 'Injured Excellence', score: 97.33 },
          ],
          winnerRosterId: 4,
          openingFavoriteRosterId: 4,
          openingWinProbability: 0.5477,
          headline: 'Akhil Found the Four Points Neil Left on the Bench',
          deck: 'The final margin was 4.27; one running-back swap was worth 10.70.',
          recap:
            'Matthew Stafford and Kyren Williams combined for 42.70 and pulled Akhil to 101.60. Neil received 31.78 from Brock Purdy and 17.20 from Davante Adams, then started Jadarian Price for 1.70 while Mike Washington scored 12.40 on the bench. That one exchange produces a 108.03-point win.',
          decisiveLabel: 'Mike Washington over Jadarian Price: +10.70',
          probabilityQuality: 'directional',
          probabilityNote:
            'The recorded tail finished 0.30 points below Sleeper’s corrected final for Injured Excellence.',
        },
      ],
    },
    {
      leagueId: KEEP,
      name: 'Legion II: The Keep',
      shortName: 'Keep',
      matchups: [
        {
          key: `${KEEP}:3:1`,
          leagueId: KEEP,
          matchupId: 1,
          teams: [
            { rosterId: 3, fallbackLabel: 'Checkout & Gameplay', score: 90.84 },
            { rosterId: 11, fallbackLabel: 'vchak', score: 88.99 },
          ],
          winnerRosterId: 3,
          openingFavoriteRosterId: 3,
          openingWinProbability: 0.6007,
          headline: 'Checkout Reached 3–0 at Ninety Points per Week',
          deck: 'The league’s lowest-scoring unbeaten team survived another one-score finish.',
          recap:
            'Checkout won 90.84–88.99 and moved to 3–0 despite averaging only 100.23 points. vchak can identify the missing points immediately: Denver’s defense scored 18.10 on the bench while Green Bay scored negative 0.95 in the lineup. The swap creates a 108.04-point win.',
          decisiveLabel: 'No. 6 fewest points in a win · Still 3–0',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${KEEP}:3:2`,
          leagueId: KEEP,
          matchupId: 2,
          teams: [
            { rosterId: 2, fallbackLabel: 'Jonathon Taylor Mayde', score: 75.44 },
            { rosterId: 9, fallbackLabel: 'lukebowsh', score: 137.15 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 9,
          openingWinProbability: 0.5567,
          headline: 'Luke’s Four Best Starters Beat Nolan by Themselves',
          deck: 'Gibbs, Kittle, Love, and Houston combined for 96.95.',
          recap:
            'Jahmyr Gibbs scored 40.40, George Kittle 23.20, Jeremiyah Love 20.90, and Houston’s defense 12.45. Their 96.95-point subtotal cleared Nolan’s entire 75.44 lineup. Luke finished at 137.15 and moved to 2–1; Nolan fell to 0–3.',
          decisiveLabel: 'Four-player subtotal: 96.95',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:3:3`,
          leagueId: KEEP,
          matchupId: 3,
          teams: [
            { rosterId: 1, fallbackLabel: 'Ja’Marrican Psycho', score: 106.39 },
            { rosterId: 5, fallbackLabel: 'HarrytheHitman9', score: 145.75 },
          ],
          winnerRosterId: 5,
          openingFavoriteRosterId: 5,
          openingWinProbability: 0.5888,
          headline: 'Harry Turned Four Twenty-Point Days Into 146',
          deck: 'Smith-Njigba led another complete top half in Sean’s third loss.',
          recap:
            'Jaxon Smith-Njigba scored 30.36, Lamar Jackson 21.94, Michael Wilson 20.40, and Javonte Williams 19.30. Harry reached 145.75 even with no defensive eruption. Sean’s 106.39 was respectable; a 0–3 record backed by 333.00 points for and 406.54 against is mostly a schedule filing.',
          decisiveLabel: 'Harry’s top four: 92.00',
          probabilityQuality: 'directional',
          probabilityNote:
            'The recorded tail finished two points below Sleeper’s corrected final for HarrytheHitman9.',
        },
        {
          key: `${KEEP}:3:4`,
          leagueId: KEEP,
          matchupId: 4,
          teams: [
            { rosterId: 10, fallbackLabel: 'King Henry’s Court', score: 111.96 },
            { rosterId: 12, fallbackLabel: 'vayyala', score: 99.88 },
          ],
          winnerRosterId: 10,
          openingFavoriteRosterId: 10,
          openingWinProbability: 0.6931,
          headline: 'Rithik Followed 166 With the Boring Kind of Win',
          deck: 'The Keep’s scoring leader no longer needed a historic number.',
          recap:
            'Derrick Henry scored 22.40, Jaylen Warren 21.60, and Josh Allen 17.46 as Rithik beat Vinay 111.96–99.88. A week after posting the fourth-highest score in registered history, King Henry’s Court won without drama and moved to 3–0 with a Gauntlet-best 420.34 points.',
          decisiveLabel: '3–0 · Gauntlet-best 420.34 points',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:3:5`,
          leagueId: KEEP,
          matchupId: 5,
          teams: [
            { rosterId: 4, fallbackLabel: 'Team Lil Bros', score: 96.06 },
            { rosterId: 6, fallbackLabel: 'JimothyGreene', score: 134.21 },
          ],
          winnerRosterId: 6,
          openingFavoriteRosterId: 6,
          openingWinProbability: 0.7157,
          headline: 'Jimothy’s Rebound Arrived With Bijan Attached',
          deck: 'A 72-point Week 2 became 134.21 and a first win.',
          recap:
            'Bijan Robinson’s 38.80 led Jimothy’s 134.21-point recovery. Jared Goff, Matthew Golden, and Chuba Hubbard added 51.96. Dhruv Modi received 28.16 from Sam Darnold but could not overcome a lineup with only three other double-digit starters.',
          decisiveLabel: 'Week-over-week change: +61.88',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:3:6`,
          leagueId: KEEP,
          matchupId: 6,
          teams: [
            { rosterId: 7, fallbackLabel: 'akmadurai', score: 90.07 },
            { rosterId: 8, fallbackLabel: 'the beggar king', score: 124.1 },
          ],
          winnerRosterId: 8,
          openingFavoriteRosterId: 7,
          openingWinProbability: 0.6448,
          headline: 'Alex Turned Seven Percent Into Thirty-Four Points',
          deck: 'The week’s longest underdog rallied behind four 20-point starters.',
          recap:
            'Alex opened at 35.5 percent and fell near seven before Minnesota’s defense, Tyler Shough, James Cook, and Garrett Wilson combined for 95.40. Akhil M received 21.10 from Christian McCaffrey and 17.20 from Davante Adams but lost 124.10–90.07.',
          decisiveLabel: 'Winner low: 7.1% · Final margin: 34.03',
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
          key: `${FORGE}:3:1`,
          leagueId: FORGE,
          matchupId: 1,
          teams: [
            { rosterId: 2, fallbackLabel: 'krishnik', score: 151.78 },
            { rosterId: 12, fallbackLabel: 'Sahilmodi8', score: 93.88 },
          ],
          winnerRosterId: 2,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.6763,
          headline: 'Nikhil Built the Week’s Cleanest Lineup',
          deck: 'Every starter scored at least 9.50; six cleared 15.',
          recap:
            'Nikhil’s 151.78 came without a 30-point player. Minnesota’s defense led at 26.50, and eight more starters landed between 9.50 and 20.90. Sahil received 31.78 from Brock Purdy and 20.30 from Ja’Marr Chase, but four starters stayed below five.',
          decisiveLabel: 'No. 15 score · Nine starters at 9.50+',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:3:2`,
          leagueId: FORGE,
          matchupId: 2,
          teams: [
            { rosterId: 3, fallbackLabel: 'aaryanshetty', score: 88.73 },
            { rosterId: 8, fallbackLabel: 'aditya22', score: 165.39 },
          ],
          winnerRosterId: 8,
          openingFavoriteRosterId: 8,
          openingWinProbability: 0.692,
          headline: 'Aditya Occupied Both Ends of the Record Book',
          deck: 'The week’s high score and largest margin arrived in the same file.',
          recap:
            'Aditya scored 165.39 behind Jaxon Smith-Njigba’s 30.36 and seven more starters at 12.90 or better. Aaryan finished at 88.73. The resulting 76.66-point margin ranks sixth in registered history, while Aditya’s total ranks fifth—1.13 behind Rithik’s Week 2 mark.',
          decisiveLabel: 'No. 5 score · No. 6 margin all-time',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${FORGE}:3:3`,
          leagueId: FORGE,
          matchupId: 3,
          teams: [
            { rosterId: 5, fallbackLabel: 'gibuttersnaps', score: 118.99 },
            { rosterId: 7, fallbackLabel: 'Mexican Cartel', score: 100.56 },
          ],
          winnerRosterId: 5,
          openingFavoriteRosterId: 7,
          openingWinProbability: 0.5205,
          headline: 'Gibuttersnaps Won Pretty and Stayed Perfect',
          deck: 'Last week’s 81-point survivor returned with an 119-point upset.',
          recap:
            'Bo Nix, Drake London, and Juwan Johnson combined for 67.84 as Gibuttersnaps beat Rafa 118.99–100.56. The opening line made Rafa a slight favorite, but Sid took control and moved to 3–0 one week after posting the third-lowest winning score in registered history.',
          decisiveLabel: '3–0 · Opening chance: 47.9%',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:3:4`,
          leagueId: FORGE,
          matchupId: 4,
          teams: [
            { rosterId: 1, fallbackLabel: 'ashwindandapani1', score: 128.14 },
            { rosterId: 11, fallbackLabel: 'Loveland Island', score: 111.42 },
          ],
          winnerRosterId: 1,
          openingFavoriteRosterId: 11,
          openingWinProbability: 0.6071,
          headline: 'Ashwin Came Back From Three Percent This Time',
          deck: 'A week after the 0.66-point escape, Gibbs removed the need for one.',
          recap:
            'Ashwin opened at 39.3 percent and fell to 2.7 before Jahmyr Gibbs scored 40.40. Christian McCaffrey and CeeDee Lamb added 37.80, completing a 128.14–111.42 comeback. Siddharth received 38.80 from Bijan Robinson but only 29.00 from his bottom five starters.',
          decisiveLabel: 'Winner low: 2.7% · Final margin: 16.72',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:3:5`,
          leagueId: FORGE,
          matchupId: 5,
          teams: [
            { rosterId: 6, fallbackLabel: 'Can you tuten my face', score: 126.09 },
            { rosterId: 10, fallbackLabel: 'brendenclerget', score: 100.24 },
          ],
          winnerRosterId: 6,
          openingFavoriteRosterId: 10,
          openingWinProbability: 0.5374,
          headline: 'Caleb’s Underdog Core Won Every Position Group',
          deck: 'Seven offensive starters scored at least 9.70 in a 25.85-point reversal.',
          recap:
            'Brock Bowers, Derrick Henry, Javonte Williams, and Bhayshul Tuten combined for 82.30, and seven offensive starters reached 9.70. Caleb opened at 46.3 percent, dipped near 15, and beat Brenden 126.09–100.24. Brenden fell to 0–3 despite clearing 100 for the second straight week.',
          decisiveLabel: 'Seven offensive starters at 9.70+',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:3:6`,
          leagueId: FORGE,
          matchupId: 6,
          teams: [
            { rosterId: 4, fallbackLabel: 'Socialized L-Care', score: 88.86 },
            { rosterId: 9, fallbackLabel: 'Lisan Al-Caleb', score: 94.39 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 4,
          openingWinProbability: 0.6007,
          headline: 'Lisan Al-Caleb Reached 3–0 Through the Side Door',
          deck: 'The Forge’s other perfect team won with 94.39—and needed the bench to cooperate.',
          recap:
            'Lisan Al-Caleb opened at 39.9 percent, fell near ten, and won 94.39–88.86 behind Garrett Wilson and Chris Olave. Socialized L-Care can reverse the 5.53-point loss by replacing Terrance Ferguson’s 1.40 with Malik Washington’s 8.60 in a flex spot.',
          decisiveLabel: '3–0 · Malik Washington held the reversal',
          probabilityQuality: 'directional',
          probabilityNote:
            'The recorded tail finished two points below Sleeper’s corrected final for Lisan Al-Caleb.',
        },
      ],
    },
  ],
  flowSections: [
    {
      id: 'upper-tail',
      title: 'The Upper Tail Broke Away',
      deck: 'Six teams reached 134; four cleared 140 while the median score kept falling.',
      matchupKeys: [
        `${FORGE}:3:2`,
        `${FORGE}:3:1`,
        `${THRONE}:3:3`,
        `${KEEP}:3:3`,
        `${KEEP}:3:2`,
        `${KEEP}:3:5`,
      ],
    },
    {
      id: 'perfect-five',
      title: 'The Perfect Five',
      deck: 'Five teams reached 3–0 by taking five very different routes.',
      matchupKeys: [`${THRONE}:3:5`, `${KEEP}:3:1`, `${KEEP}:3:4`, `${FORGE}:3:3`, `${FORGE}:3:6`],
    },
    {
      id: 'upset-office',
      title: 'The Upset Office',
      deck: 'Only six underdogs won; four of the cleanest reversals live here.',
      matchupKeys: [`${THRONE}:3:1`, `${KEEP}:3:6`, `${FORGE}:3:4`, `${FORGE}:3:5`],
    },
    {
      id: 'counterfactual-desk',
      title: 'The Counterfactual Desk',
      deck: 'Three more losses that turn into wins with one legal move.',
      matchupKeys: [`${THRONE}:3:2`, `${THRONE}:3:4`, `${THRONE}:3:6`],
    },
  ],
  records: [
    {
      title: 'Aditya’s Double Entry',
      classification: 'Hall of Fame',
      rank: 5,
      rankLabel: 'No. 5 · Highest team score',
      summary:
        'Aditya scored 165.39, only 1.13 behind Rithik’s Week 2 mark. The same game produced the sixth-largest registered margin.',
    },
    {
      title: 'The Other 150',
      classification: 'Hall of Fame',
      rank: 15,
      rankLabel: 'No. 15 · Highest team score',
      summary:
        'Nikhil reached 151.78 without a 30-point starter. Every slot contributed at least 9.50.',
    },
    {
      title: 'Ninety Points and Perfect',
      classification: 'Statistical oddity',
      rank: 6,
      rankLabel: 'No. 6 · Fewest points in a win',
      summary:
        'Checkout won with 90.84 and moved to 3–0. Its 300.70 points are the fewest among the five unbeaten teams.',
    },
    {
      title: 'The September Split',
      classification: 'Statistical oddity',
      rank: null,
      rankLabel: 'Five unbeaten · Four winless',
      summary:
        'One quarter of the league exited Week 3 without a mixed record. The perfect teams reached the mark with scoring totals from 300.70 to 420.34.',
    },
  ],
  autopsies: [
    {
      teamKey: `${THRONE}:5`,
      label: 'Nothing is going Wright',
      actualScore: 92.58,
      opponentScore: 108.46,
      revisedScore: 112.58,
      swap: 'Kenyon Sadiq over Oronde Gadsden',
    },
    {
      teamKey: `${THRONE}:12`,
      label: 'Marginal Returns',
      actualScore: 109.64,
      opponentScore: 112.04,
      revisedScore: 117.84,
      swap: 'Keaton Mitchell over Dalton Schultz',
    },
    {
      teamKey: `${THRONE}:10`,
      label: 'Injured Excellence',
      actualScore: 97.33,
      opponentScore: 101.6,
      revisedScore: 108.03,
      swap: 'Mike Washington over Jadarian Price',
    },
    {
      teamKey: `${KEEP}:11`,
      label: 'vchak',
      actualScore: 88.99,
      opponentScore: 90.84,
      revisedScore: 108.04,
      swap: 'Denver D/ST over Green Bay D/ST',
    },
    {
      teamKey: `${FORGE}:4`,
      label: 'Socialized L-Care',
      actualScore: 88.86,
      opponentScore: 94.39,
      revisedScore: 96.06,
      swap: 'Malik Washington over Terrance Ferguson',
    },
  ],
  statsDeepDive: {
    title: 'Three Weeks, Eight Lenses',
    deck: 'The standings say who won. The Stats Hub says how sustainable it looks—and where the points, luck, and decisions actually came from.',
    note: 'Completed Weeks 1–3 across 36 teams. Schedule luck uses counterfactual schedules; positional figures are starter averages. Transaction activity excludes Week 4, and VORP grades are intentionally omitted pending a 2026 date-boundary correction.',
    items: [
      {
        view: 'Team analysis',
        metric: '+27.93',
        title: 'Rithik Has No Positional Debt',
        summary:
          'King Henry’s Court leads the Gauntlet with 420.34 points and owns the largest combined edge across QB, RB, WR, TE, and defense: 27.93 points per week above the cross-league medians.',
        href: '/stats?view=team&team=1387520168866885632-10',
        linkLabel: 'Open Rithik’s team analysis',
      },
      {
        view: 'League view',
        metric: '+23.88',
        title: 'Daal and Aman Own the Running-Back Economy',
        summary:
          'Love Warrents Dak Pics has received 64.20 running-back points per week, 23.88 above the 36-team median. No team holds a larger advantage at any tracked position.',
        href: '/stats?view=league',
        linkLabel: 'Compare every positional edge',
      },
      {
        view: 'Schedule',
        metric: '+1.42',
        title: 'Checkout’s 3–0 Is Running on Credit',
        summary:
          'Checkout & Gameplay owns the easiest schedule and the largest gap between actual and modeled wins. Its 300.70 points would average only 0.86 wins across the other 35 schedules.',
        href: '/stats?view=schedule',
        linkLabel: 'Inspect the luck tables',
      },
      {
        view: 'Trends',
        metric: '34→5→1',
        title: 'Aditya Is the Season’s Sharpest Ascent',
        summary:
          'The weekly line climbed from 87.56 to 129.38 to 165.39, a 77.83-point rise and a scoring-rank jump from 34th to fifth to first. The direction is unmistakable; three-week volatility is still the warning label.',
        href: '/stats?view=trends',
        linkLabel: 'Follow the weekly trajectories',
      },
      {
        view: 'Scatter',
        metric: '+35.73',
        title: 'Lisan Al-Caleb Is Winning the Receiver Split',
        summary:
          'Its receivers score 50.90 per week while opposing receivers manage 15.17, the largest WR scoring gap in the field. Early positional splits describe three matchups, not a permanent defense.',
        href: '/stats?view=scatter',
        linkLabel: 'Explore the position plots',
      },
      {
        view: 'Transactions',
        metric: '189',
        title: 'The Market Has Moved Without a Trade',
        summary:
          'Weeks 1–3 produced 123 free-agent moves and 66 successful waivers, but no trades. Nothing is going Wright and Socialized L-Care made 16 moves each while spending $34 and $8, respectively.',
        href: '/stats?view=transactions',
        linkLabel: 'Browse the transaction tape',
      },
      {
        view: 'Waiver',
        metric: '16 bids',
        title: 'Ollie Gordon Started a Three-Legion Auction',
        summary:
          'Sixteen Week 3 claims produced $356 in winning FAAB across the three leagues. Checkout & Gameplay’s full-budget $200 bid was the largest, beating the next Keep offer by $90.',
        href: '/stats?view=waiver-analysis',
        linkLabel: 'See the bidding ledger',
      },
      {
        view: 'Start / sit',
        metric: '66.7%',
        title: 'Injured Excellence Leads the Decision Table',
        summary:
          'Neil leads all 36 managers with a 66.67% weighted score and +23.47 points of impact across 11 qualifying decisions. The model covers threshold-qualified QB, TE, flex, and defense choices—not every lineup slot.',
        href: '/stats?view=start-sit',
        linkLabel: 'Review the decision model',
      },
    ],
  },
  receipts: [
    {
      title: 'Jahmyr Gibbs owns the production board',
      summary:
        'All three copies have scored 98.80 through three starts. Position-specific VORP ranges from +89.25 to +91.50 by Legion.',
    },
    {
      title: 'Smith-Njigba keeps closing the gap',
      summary:
        'Three copies, three starts, 90.56 points, and roughly +79 VORP in every Legion. His Week 3 score was 30.36.',
    },
    {
      title: 'The one-dollar Minnesota position',
      summary:
        'Minnesota’s defense has scored 42.05 across two starts in each Legion. Two Week 3 copies helped produce wins; the third sat behind Denver’s 18.10.',
    },
    {
      title: 'Josh Allen remains the blue-chip bargain',
      summary:
        'The two $32 copies have produced 94.94 points and roughly +54 to +56 VORP. The $34 Forge copy has the same raw production.',
    },
    {
      title: 'Colston Loveland remains underwater',
      summary:
        'The $16, $20, and $22 copies have produced 0.80, 5.90, and 5.90 points across two or three starts. All three remain below replacement value.',
    },
  ],
} as const satisfies WeeklyRecap;

export const getWeekThreeMatchups = () =>
  (WEEK_THREE_RECAP as WeeklyRecap).leagues.flatMap(league => league.matchups);
