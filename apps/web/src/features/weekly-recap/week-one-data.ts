import type { WeekOneRecap } from './types';

const THRONE = '1387520086092312576';
const KEEP = '1387520168866885632';
const FORGE = '1387520236663615488';

export const WEEK_ONE_RECAP = {
  season: 2026,
  week: 1,
  publishedAt: '2026-09-15T12:00:00-04:00',
  headline: 'The Scoreboard Was Lying',
  subheadline:
    'Week 1 delivered front-loaded mirages, scheduled avalanches, six sizable underdog wins, and one Jaylen Waddle performance that turned a routine Monday ask into an upset.',
  lede: [
    'Fantasy football presents the live score as if it were the truth. It is not. It is a partial invoice with no accounting for who has already played, who is still waiting, and which manager is about to spend Monday night begging for eight points from Jaylen Waddle.',
    'The market was not much wiser. Favorites went 9–9, six underdogs priced at +160 or longer won, and the lower draft-rated roster won 11 of 17 matchups with unequal grades. The three legions still combined for 4,218.19 points, only 0.49 percent below the preview projection.',
    'The numbers were loud. The order in which they arrived was the story.',
  ],
  leagues: [
    {
      leagueId: THRONE,
      name: 'Legion I: The Throne',
      shortName: 'Throne',
      matchups: [
        {
          key: `${THRONE}:1:1`,
          leagueId: THRONE,
          matchupId: 1,
          teams: [
            { rosterId: 2, fallbackLabel: 'Coker Laced Flowers', score: 141.52 },
            { rosterId: 9, fallbackLabel: 'cescott25', score: 128.46 },
          ],
          winnerRosterId: 2,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.7415,
          headline: 'Down Ten, Up Ninety-Two',
          deck: 'Christian led the live score, but Anant still owned the matchup.',
          recap:
            'Christian led 97.76–87.50 at 4:24 p.m. Sunday, but Anant remained a 92 percent favorite. Christian’s early group was effectively finished while Anant’s score was still settling and four later starters waited. The true window-boundary deficit was only 1.46. Anant’s late group won 45.22–30.70 and closed a 141.52–128.46 control win.',
          decisiveLabel: 'Late group: 45.22–30.70',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:1:2`,
          leagueId: THRONE,
          matchupId: 2,
          teams: [
            { rosterId: 5, fallbackLabel: 'His Real Name’s Terrance', score: 99.5 },
            { rosterId: 8, fallbackLabel: 'ziyanp22', score: 92.51 },
          ],
          winnerRosterId: 5,
          openingFavoriteRosterId: 8,
          openingWinProbability: 0.6701,
          headline: 'Dart Put Hunter Ahead. Waddle Made Him a Winner.',
          deck: 'Sunday night changed the score. Monday night changed the verdict.',
          recap:
            'Jaxson Dart erased a 19.91-point deficit Sunday night, but Ziyan remained roughly a nine-in-10 favorite with Jaylen Waddle left and only 7.70 needed. Waddle produced 0.70. Brenton Strange over Colston Loveland or Alec Pierce over Waddle would have saved Ziyan, but Hunter escaped 99.50–92.51.',
          decisiveLabel: 'Waddle: 0.70 points',
          probabilityQuality: 'directional',
          probabilityNote: 'The capture stopped before Monday night ended.',
          featured: true,
        },
        {
          key: `${THRONE}:1:3`,
          leagueId: THRONE,
          matchupId: 3,
          teams: [
            { rosterId: 1, fallbackLabel: 'Crown and Pound', score: 157.8 },
            { rosterId: 7, fallbackLabel: 'Something’s Gotta Gibbs', score: 114.46 },
          ],
          winnerRosterId: 1,
          openingFavoriteRosterId: 1,
          openingWinProbability: 0.5841,
          headline: 'Sunday Became a Landslide',
          deck: 'A 16-point head start lasted roughly 12 sampled minutes.',
          recap:
            'Crown and Pound entered Sunday down 16–0 but was already the live favorite. By 2 p.m. it led 67.82–50.14; an hour later the margin had become 115.56–69.46. Seven starters reached double figures in the 157.80–114.46 rout. Jahmyr Gibbs supplied 37.10 for Something’s Gotta Gibbs, but one heroic box score could not stop the avalanche.',
          decisiveLabel: 'Seven starters in double figures',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${THRONE}:1:4`,
          leagueId: THRONE,
          matchupId: 4,
          teams: [
            { rosterId: 3, fallbackLabel: 'Love Warrents Dak Pics', score: 130.47 },
            { rosterId: 12, fallbackLabel: 'Marginal Returns', score: 63.75 },
          ],
          winnerRosterId: 3,
          openingFavoriteRosterId: 3,
          openingWinProbability: 0.7673,
          headline: 'The Result Was Filed Early',
          deck: 'Marginal Returns spent Sunday chasing a game the model had already closed.',
          recap:
            'Love Warrents Dak Pics entered Sunday ahead 27.65–6.30, reached a 99.1 percent chance before 2 p.m., and won every scoring window. Bijan Robinson and Christian Watson combined for 58.50 in a 130.47–63.75 final despite a negative quarterback score. The remaining hours were technically fantasy football, though mostly for tax purposes.',
          decisiveLabel: 'Largest pre-Sunday control win',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:1:5`,
          leagueId: THRONE,
          matchupId: 5,
          teams: [
            { rosterId: 10, fallbackLabel: 'Injured Excellence', score: 139.35 },
            { rosterId: 11, fallbackLabel: 'benweinfeld', score: 103.9 },
          ],
          winnerRosterId: 10,
          openingFavoriteRosterId: 11,
          openingWinProbability: 0.6178,
          headline: 'The Final Margin Existed Before Four',
          deck: 'Both teams scored exactly 64.80 after the early slate.',
          recap:
            'The settled early-window score was 74.55–39.10 for Injured Excellence—a 35.45-point advantage. Both teams then scored exactly 64.80 the rest of the way, preserving that precise margin in a 139.35–103.90 win. Even Ben’s optimal legal lineup would have fallen 4.59 short.',
          decisiveLabel: 'Early-window margin: 35.45',
          probabilityQuality: 'reliable',
        },
        {
          key: `${THRONE}:1:6`,
          leagueId: THRONE,
          matchupId: 6,
          teams: [
            { rosterId: 6, fallbackLabel: 'scboom5', score: 123.71 },
            { rosterId: 4, fallbackLabel: 'Two Williams, One Cup', score: 90.86 },
          ],
          winnerRosterId: 6,
          openingFavoriteRosterId: 4,
          openingWinProbability: 0.5247,
          headline: 'The Closest Score Came After It Was Over',
          deck: 'Akhil cut the gap to 6.55 with no players left.',
          recap:
            'Two Williams, One Cup narrowed the visible margin to 97.41–90.86 Sunday evening, but the comeback was cosmetic: its lineup was finished while scboom5 still had Javonte Williams and J.K. Dobbins. Their 26.30 unanswered points completed a 123.71–90.86 win. Caleb Williams over Justin Herbert still would not have changed the winner.',
          decisiveLabel: 'Unopposed late points: 26.30',
          probabilityQuality: 'reliable',
        },
      ],
    },
    {
      leagueId: KEEP,
      name: 'Legion II: The Keep',
      shortName: 'Keep',
      matchups: [
        {
          key: `${KEEP}:1:1`,
          leagueId: KEEP,
          matchupId: 1,
          teams: [
            { rosterId: 3, fallbackLabel: 'Checkout & Gameplay', score: 118.6 },
            { rosterId: 9, fallbackLabel: 'lukebowsh', score: 112.21 },
          ],
          winnerRosterId: 3,
          openingFavoriteRosterId: 9,
          openingWinProbability: 0.6165,
          headline: 'Kansas City Rang Up Checkout',
          deck: 'A defense completed a two-night chase on Monday.',
          recap:
            'Luke led Checkout & Gameplay 112.21–105.10 entering Monday. Kansas City’s defense gradually closed the gap, reached 112.05 at 9:42 p.m., and finished with 13.50 to deliver a 118.60–112.21 win. The late probability feed projected phantom Luke points, so the scoring curve tells this story more reliably than the percentage.',
          decisiveLabel: 'Kansas City D/ST: 13.50',
          probabilityQuality: 'unreliable',
          probabilityNote: 'The late feed projected points for a completed lineup.',
        },
        {
          key: `${KEEP}:1:2`,
          leagueId: KEEP,
          matchupId: 2,
          teams: [
            { rosterId: 11, fallbackLabel: 'vchak', score: 136.46 },
            { rosterId: 2, fallbackLabel: 'Jonathon Taylor Mayde', score: 107.37 },
          ],
          winnerRosterId: 11,
          openingFavoriteRosterId: 11,
          openingWinProbability: 0.5546,
          headline: 'Walker Turned a Lean Into a Rout',
          deck: 'A three-point Monday deficit became a 29-point win.',
          recap:
            'Jonathon Taylor Mayde carried a 103.27–100.36 lead into Monday, but vchak held the remaining-player advantage with Kenneth Walker opposing J.K. Dobbins. Walker’s 36.10 against Dobbins’s 4.10 turned that small deficit into a 136.46–107.37 rout.',
          decisiveLabel: 'Monday RB edge: 32.00',
          probabilityQuality: 'directional',
        },
        {
          key: `${KEEP}:1:3`,
          leagueId: KEEP,
          matchupId: 3,
          teams: [
            { rosterId: 10, fallbackLabel: 'King Henry’s Court', score: 141.86 },
            { rosterId: 1, fallbackLabel: 'Ja’Marrican Psycho', score: 111.65 },
          ],
          winnerRosterId: 10,
          openingFavoriteRosterId: 10,
          openingWinProbability: 0.5864,
          headline: 'Six Minutes Buried Ja’Marrican Psycho',
          deck: 'A 16-point lead became a seven-point deficit during one snack run.',
          recap:
            'Ja’Marrican Psycho still led 58.99–42.58 at 2:20 p.m. with a 62.8 percent chance. Six minutes later, King Henry’s Court led 67.42–60.39 with an 86.2 percent chance. Josh Allen and Derrick Henry supplied 71.46 combined points and finished the 141.86–111.65 avalanche.',
          decisiveLabel: 'Allen and Henry: 71.46',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:1:4`,
          leagueId: KEEP,
          matchupId: 4,
          teams: [
            { rosterId: 5, fallbackLabel: 'HarrytheHitman9', score: 153.36 },
            { rosterId: 12, fallbackLabel: 'vayyala', score: 122.7 },
          ],
          winnerRosterId: 5,
          openingFavoriteRosterId: 5,
          openingWinProbability: 0.6829,
          headline: 'The Shootout Ended Before Monday',
          deck: 'The week’s highest combined score was a track meet, not a close race.',
          recap:
            'Harry finished Sunday at 153.36. Vinay entered Monday at 109.20 with Rashee Rice, Jaylen Waddle, and Denver’s defense needing 44.17. The trio produced 13.50, settling the final at 153.36–122.70. The 276.06 combined points led Week 1, but Harry never fell below a 59.4 percent chance.',
          decisiveLabel: 'Week-high total: 276.06',
          probabilityQuality: 'directional',
          probabilityNote: 'The stored final trails Sleeper by one point for Vinay.',
          featured: true,
        },
        {
          key: `${KEEP}:1:5`,
          leagueId: KEEP,
          matchupId: 5,
          teams: [
            { rosterId: 4, fallbackLabel: 'Team Lil Bros', score: 131.41 },
            { rosterId: 8, fallbackLabel: 'the beggar king', score: 105.9 },
          ],
          winnerRosterId: 4,
          openingFavoriteRosterId: 8,
          openingWinProbability: 0.6203,
          headline: 'Tied on Screen, Decided in the Schedule',
          deck: 'The team that looked tied was already more than 90 percent to win.',
          recap:
            'Team Lil Bros led by less than a point just before the late kickoffs, yet already held more than a 90 percent chance behind a six-player late contingent. Caleb Williams’s 38.26 and Ashton Jeanty’s 33.20 turned the schedule advantage into a 131.41–105.90 win before the beggar king’s Sunday-night pairing could cosmetically close the gap.',
          decisiveLabel: 'Caleb and Jeanty: 71.46',
          probabilityQuality: 'reliable',
        },
        {
          key: `${KEEP}:1:6`,
          leagueId: KEEP,
          matchupId: 6,
          teams: [
            { rosterId: 7, fallbackLabel: 'akmadurai', score: 125.72 },
            { rosterId: 6, fallbackLabel: 'JimothyGreene', score: 112.21 },
          ],
          winnerRosterId: 7,
          openingFavoriteRosterId: 7,
          openingWinProbability: 0.5205,
          headline: 'The Fifty-Two-Point Mirage',
          deck: 'Jimothy led 108.41–56.80, and the model called it almost even.',
          recap:
            'Jimothy was nearly finished while akmadurai still had Jalen Hurts, Justin Jefferson, Aaron Jones, and George Pickens. Their scheduled avalanche produced a 125.72–112.21 win. The winning lineup finished only 0.10 below optimal; Dallas Goedert over Marvin Harrison would have flipped the result back to Jimothy.',
          decisiveLabel: 'Late trio: 63.92',
          probabilityQuality: 'reliable',
          featured: true,
        },
      ],
    },
    {
      leagueId: FORGE,
      name: 'Legion III: The Forge',
      shortName: 'Forge',
      matchups: [
        {
          key: `${FORGE}:1:1`,
          leagueId: FORGE,
          matchupId: 1,
          teams: [
            { rosterId: 3, fallbackLabel: 'aaryanshetty', score: 118.85 },
            { rosterId: 2, fallbackLabel: 'Nikhil Krishnan', score: 116.21 },
          ],
          winnerRosterId: 3,
          openingFavoriteRosterId: 2,
          openingWinProbability: 0.729,
          headline: 'A Two-Point Finish and a Broken Meter',
          deck: 'Aaryan won the game. The late probability feed favored the loser.',
          recap:
            'Aaryan entered as a 27.1 percent underdog and won 118.85–116.21. The late probability feed inverted without a corresponding score change and ultimately favored Nikhil, so it cannot narrate the finish. The cleaner postscript sits on Nikhil’s bench, where Deebo Samuel’s 15.50 held more than enough points to save him.',
          decisiveLabel: 'Final margin: 2.64',
          probabilityQuality: 'unreliable',
          probabilityNote: 'The probability feed inverted without a score change.',
        },
        {
          key: `${FORGE}:1:2`,
          leagueId: FORGE,
          matchupId: 2,
          teams: [
            { rosterId: 12, fallbackLabel: 'Sahilmodi8', score: 131.74 },
            { rosterId: 8, fallbackLabel: 'aditya22', score: 87.26 },
          ],
          winnerRosterId: 12,
          openingFavoriteRosterId: 8,
          openingWinProbability: 0.598,
          headline: 'Sahil Broke the Dam at Four',
          deck: 'A favorite’s early lead became a 44-point loss.',
          recap:
            'Aditya led 34.30–14.89 at 1:50 p.m. with a 68.2 percent chance. By 4 p.m., Sahil had reversed the score to 80.64–57.68 with a 96.5 percent chance. David Montgomery, Justin Jefferson, Amon-Ra St. Brown, and Pittsburgh’s defense combined for 99.50 in a 131.74–87.26 demolition.',
          decisiveLabel: 'Four-player core: 99.50',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:1:3`,
          leagueId: FORGE,
          matchupId: 3,
          teams: [
            { rosterId: 11, fallbackLabel: 'siddharthseth', score: 145.27 },
            { rosterId: 7, fallbackLabel: 'Mexican Cartel', score: 70.16 },
          ],
          winnerRosterId: 11,
          openingFavoriteRosterId: 11,
          openingWinProbability: 0.7564,
          headline: 'Favorite Status Was an Understatement',
          deck: 'Rafa briefly led the score and never led the matchup.',
          recap:
            'Mexican Cartel’s live chances never rose above 6.5 percent. Jalen Hurts, Bijan Robinson, and Christian Watson combined for 84.22—more than the Cartel’s entire team—in a 145.27–70.16 demolition. The opening line called Sid a strong favorite. It was being polite.',
          decisiveLabel: 'Week-high margin: 75.11',
          probabilityQuality: 'reliable',
          featured: true,
        },
        {
          key: `${FORGE}:1:4`,
          leagueId: FORGE,
          matchupId: 4,
          teams: [
            { rosterId: 5, fallbackLabel: 'gibuttersnaps', score: 115.89 },
            { rosterId: 1, fallbackLabel: 'ashwindandapani1', score: 105.96 },
          ],
          winnerRosterId: 5,
          openingFavoriteRosterId: 5,
          openingWinProbability: 0.6134,
          headline: 'Thirty-Three Ahead, Barely a Coin Flip',
          deck: 'Ashwin’s live lead concealed the heavier late schedule across the field.',
          recap:
            'Ashwin led 58.90–26.05 at 3:04 p.m. Sunday and had only a 50.2 percent chance. Gibuttersnaps still owned the heavier late schedule, led by Ashton Jeanty, and converted it into a 115.89–105.96 win. Denzel Boston over Romeo Doubs would have reversed the result.',
          decisiveLabel: 'Late-window overtake',
          probabilityQuality: 'directional',
          probabilityNote: 'The stored final is 0.10 above Sleeper for gibuttersnaps.',
        },
        {
          key: `${FORGE}:1:5`,
          leagueId: FORGE,
          matchupId: 5,
          teams: [
            { rosterId: 9, fallbackLabel: 'Lisan Al-Caleb', score: 126.91 },
            { rosterId: 10, fallbackLabel: 'brendenclerget', score: 115.46 },
          ],
          winnerRosterId: 9,
          openingFavoriteRosterId: 10,
          openingWinProbability: 0.5306,
          headline: 'Caleb Built a Blowout. Brenden Edited the Margin.',
          deck: 'The 11.45-point final disguised a game settled Sunday afternoon.',
          recap:
            'By 4 p.m., Lisan Al-Caleb led 93.31–49.06 with a 99.5 percent chance. Caleb Williams, D’Andre Swift, and Chris Olave supplied 94.36 points. Brenden’s late scoring polished the final to 126.91–115.46 but did not restore suspense. The winner also left a week-high 43.20 possible points unused.',
          decisiveLabel: 'Potential score: 170.11',
          probabilityQuality: 'reliable',
        },
        {
          key: `${FORGE}:1:6`,
          leagueId: FORGE,
          matchupId: 6,
          teams: [
            { rosterId: 6, fallbackLabel: 'Can you tuten my face', score: 120.22 },
            { rosterId: 4, fallbackLabel: 'Socialized L-Care', score: 98.52 },
          ],
          winnerRosterId: 6,
          openingFavoriteRosterId: 4,
          openingWinProbability: 0.6361,
          headline: 'Monday’s Cushion Became Camouflage',
          deck: 'A 48.90-point closing run never threatened the winner.',
          recap:
            'Socialized L-Care reached an 80.1 percent chance early Sunday. By 4 p.m., Can you tuten my face led 89.22–48.60 and Socialized had fallen to 7 percent. A 48.90-point Monday recovery produced a respectable 120.22–98.52 final, but even Socialized’s optimal 119.64 would have lost by 0.58.',
          decisiveLabel: 'Optimal lineup still loses',
          probabilityQuality: 'directional',
          probabilityNote: 'The stored final precedes a one-point stat correction.',
        },
      ],
    },
  ],
  flowSections: [
    {
      id: 'prime-time',
      title: 'Prime-Time Verdicts',
      deck: 'Four matchups carried unfinished business into Sunday night or Monday.',
      matchupKeys: [`${THRONE}:1:2`, `${KEEP}:1:1`, `${KEEP}:1:2`, `${FORGE}:1:1`],
    },
    {
      id: 'scoreboard-lied',
      title: 'The Scoreboard Was Lying',
      deck: 'Live scores omitted the most important column: who still got to play.',
      matchupKeys: [`${THRONE}:1:1`, `${KEEP}:1:5`, `${FORGE}:1:4`, `${KEEP}:1:6`],
    },
    {
      id: 'sunday-avalanches',
      title: 'Sunday Avalanches',
      deck: 'Four matchups disappeared during a single scoring window.',
      matchupKeys: [`${THRONE}:1:3`, `${THRONE}:1:5`, `${KEEP}:1:3`, `${FORGE}:1:2`],
    },
    {
      id: 'never-in-doubt',
      title: 'Never in Doubt',
      deck: 'Some probability curves stopped pretending before the scoreboard did.',
      matchupKeys: [`${THRONE}:1:4`, `${FORGE}:1:3`, `${THRONE}:1:6`],
    },
    {
      id: 'final-score-lied',
      title: 'The Final Score Lied Too',
      deck: 'Respectable losing totals concealed games that had already ended.',
      matchupKeys: [`${KEEP}:1:4`, `${FORGE}:1:5`, `${FORGE}:1:6`],
    },
  ],
  records: [
    {
      title: 'The Two-Man Cartel',
      classification: 'Hall of Shame',
      rank: 1,
      rankLabel: 'New No. 1 · Star concentration',
      summary:
        'Josh Allen and Saquon Barkley supplied 62.94 percent of Mexican Cartel’s total, the highest top-two concentration in registered history.',
    },
    {
      title: 'Two Donuts, Still Dinner',
      classification: 'Statistical oddity',
      rank: 1,
      rankLabel: 'Tied No. 1 · Starter donuts',
      summary:
        'Team Lil Bros started zeroes from Colston Loveland and Jordan Addison, tied the all-time weekly record, and still won by 25.51.',
    },
    {
      title: 'The $43.20 Bench Tab',
      classification: 'Hall of Shame',
      rank: 4,
      rankLabel: 'No. 4 · Points left unused',
      summary:
        'Lisan Al-Caleb scored 126.91 from a possible 170.11. Winning does not expunge the evidence.',
    },
    {
      title: 'The Forge Discovers the Running Back',
      classification: 'Hall of Fame',
      rank: 4,
      rankLabel: 'Nos. 4 and 5 · Starting RB points',
      summary:
        'Gibuttersnaps received 77.80 from four starting backs; Can you tuten my face followed with 76.70.',
    },
    {
      title: 'Ashwin’s Bottom Fell Out',
      classification: 'Hall of Shame',
      rank: 3,
      rankLabel: 'Tied No. 3 · Bottom three starters',
      summary:
        'Ashwin’s three lowest starters totaled 2.30, while Denzel Boston’s 12.90 sat on the bench and would have flipped the result.',
    },
  ],
  autopsies: [
    {
      teamKey: `${THRONE}:8`,
      label: 'ziyanp22',
      actualScore: 92.51,
      opponentScore: 99.5,
      revisedScore: 101.81,
      swap: 'Brenton Strange over Colston Loveland',
    },
    {
      teamKey: `${KEEP}:9`,
      label: 'lukebowsh',
      actualScore: 112.21,
      opponentScore: 118.6,
      revisedScore: 119.61,
      swap: 'Roschon Monangai over Jordan Love',
    },
    {
      teamKey: `${FORGE}:2`,
      label: 'Nikhil Krishnan',
      actualScore: 116.21,
      opponentScore: 118.85,
      revisedScore: 128.31,
      swap: 'Deebo Samuel over DeVonta Smith',
    },
    {
      teamKey: `${FORGE}:1`,
      label: 'ashwindandapani1',
      actualScore: 105.96,
      opponentScore: 115.89,
      revisedScore: 118.86,
      swap: 'Denzel Boston over Romeo Doubs',
    },
    {
      teamKey: `${KEEP}:6`,
      label: 'JimothyGreene',
      actualScore: 112.21,
      opponentScore: 125.72,
      revisedScore: 130.11,
      swap: 'Dallas Goedert over Marvin Harrison',
    },
  ],
  receipts: [
    {
      title: 'The NFC bracket turned upside down',
      summary:
        'The four 2025 NFC semifinalists opened 2026 a combined 0–4. Its two first-round exits went 2–0 while scoring 157.80 and 130.47.',
    },
    {
      title: 'A 95.72-point revenge swing',
      summary: 'Bego beat Daal by 29 points in Week 9 last season. Daal won this opener by 66.72.',
      before: -29,
      after: 66.72,
      beforeLabel: '2025 margin',
      afterLabel: '2026 margin',
    },
    {
      title: 'Same beating, new calendar',
      summary:
        'vchak beat Nolan by 28.68 last season and 29.09 this week, a difference of only 0.41.',
      before: 28.68,
      after: 29.09,
      beforeLabel: '2025 margin',
      afterLabel: '2026 margin',
    },
    {
      title: 'From 73 to the top of the paper',
      summary:
        'Crown and Pound jumped from 73.12 in the 2025 opener to a Week 1-leading 157.80 this year.',
      before: 73.12,
      after: 157.8,
      beforeLabel: '2025 Week 1',
      afterLabel: '2026 Week 1',
    },
    {
      title: 'Opening day got louder',
      summary:
        'The opening average rose from 102.35 across 24 teams to 117.17 across 36. The same 18 returning primary owners rose from 103.15 to 117.38.',
      before: 102.35,
      after: 117.17,
      beforeLabel: '2025 average',
      afterLabel: '2026 average',
    },
  ],
} as const satisfies WeekOneRecap;

export const getWeekOneMatchups = () =>
  (WEEK_ONE_RECAP as WeekOneRecap).leagues.flatMap(league => league.matchups);
