import type { WeeklyRecap, WeeklyRecapMatchup } from './types';
import source from './week-seven-source.json';

type Story = Pick<WeeklyRecapMatchup, 'headline' | 'deck' | 'recap' | 'decisiveLabel' | 'featured'>;

const stories: Record<string, Story> = {
  '1387520086092312576:7:1': {
    headline: 'Anant Pulled the Chair Out From Under First Place',
    deck: 'A 4.35-point upset turned a one-team Throne lead into a four-team crowd.',
    recap:
      'Coker Laced Flowers beat Love Warrents Dak Pics 124.98–120.63 behind almost identical 23-point games from Tee Higgins and Zay Flowers. Christian McCaffrey and D’Andre Swift added 38.00. Daal and Aman had six starters in double figures but Sam LaPorta managed only 2.30; Cam Skattebo’s 20.60 on the bench could have changed the result. Anant’s recorded win chance bottomed at 16.9%. The loss leaves the former sole leaders level with Shivang, Christian, and Neil at 5–2.',
    decisiveLabel: 'Throne leaders: four at 5–2 · Winning margin: 4.35',
    featured: true,
  },
  '1387520086092312576:7:2': {
    headline: 'Eighty-Two Percent Became a Ninety-Three-Point Escape',
    deck: 'Christian won the Throne’s lowest-scoring game after falling to a recorded 5.9% chance.',
    recap:
      'Bo Nix and Trey McBride supplied 48.38 of Christian’s 93.83, enough to outlast Marginal Returns at 83.97. Aaron Jones and Derrick Henry combined for 8.50, but the other side had its own missing offense: Bryce Young scored 5.42, Roschon Johnson 1.30, and Ted Hurst zero. Jameson Williams’ 23.60 could not rescue Bego and Jeffrey. Christian survived eight probability lead changes and joined the four-way tie for the Throne’s best record. Marginal Returns fell 57.97 points from last week’s 141.94.',
    decisiveLabel: 'Christian: 5–2 · Nix + McBride: 48.38',
  },
  '1387520086092312576:7:3': {
    headline: 'Shivang Could Spare His Biggest Score',
    deck: 'A 44.17-point win made the Throne’s strongest favorite look sensible.',
    recap:
      'Joe Burrow’s 29.38, Jaxon Smith-Njigba’s 27.30, and Javonte Williams’ 25.00 gave scboom5 81.68 before the other six starters were counted. The final was 129.83–85.66 over Saquon Hussein. Remove Burrow entirely and the remaining eight still win by 14.79. Hunter got 16.96 from Jordan Love and 16.20 from Makai Lemon but nobody above 17. Shivang reached 5–2; Hunter fell to 1–6. The recorded favorite never dipped below 75%, though the chart tail misses 1.30 of Hunter’s final score.',
    decisiveLabel: 'Top three starters: 81.68 · Winning margin: 44.17',
  },
  '1387520086092312576:7:4': {
    headline: 'Akhil Jumped From 83.73 to the Payout Line',
    deck: 'The week’s second-highest score was a 63.62-point improvement on Week 6.',
    recap:
      'Two Williams, One Cup followed an 83.73-point win with a 147.35-point one. Tony Pollard led at 36.50, Quinshon Judkins added 25.40, and KC Concepcion supplied 19.70. The three running backs, including Kyren Williams, totaled 81.00. Ziyan’s 118.47 would have beaten five of his other ten possible Throne opponents, but Bucky Irving’s 26.50 could not offset the onslaught. Akhil moved above .500 at 4–3, claimed second across all 36 teams, and edged Aditya for that position by just 0.57.',
    decisiveLabel: 'Weekly scoring rank: 2nd · Gap to third: 0.57',
    featured: true,
  },
  '1387520086092312576:7:5': {
    headline: 'Neil’s Running Backs Did the Heavy Lifting',
    deck: 'Three backfield starters supplied 55.20 in a 106.57–86.64 win.',
    recap:
      'Josh Jacobs, Emanuel Wilson, and Ashton Jeanty scored 19.10, 18.50, and 17.60. That base let Injured Excellence absorb Baltimore’s 1.55 on defense and still win by 19.93. Crown and Pound had 27.94 from Drake Maye and 19.50 from Jonathan Taylor, but Nico Collins, Xavier Worthy, and Jordan Addison combined for 7.50. Neil won as a 40.6% opening underdog and reached 5–2 despite averaging 101.31 over the last three weeks. Kanze is 2–5.',
    decisiveLabel: 'Neil: 5–2 · Three RBs: 55.20',
  },
  '1387520086092312576:7:6': {
    headline: 'Twenty-Six Changes of Mind, One Three-Point Verdict',
    deck: 'Something’s Gotta Gibbs survived the week’s tightest finish from a 3.1% low.',
    recap:
      'A near-perfect opening coin flip became the week’s most restless probability chart: 26 lead changes before Something’s Gotta Gibbs beat Ben 127.88–124.45. Geno Smith, CeeDee Lamb, and Ollie Gordon contributed 65.68 to the winning side. Ben answered with five starters at 16.10 or better, but Isaiah Likely and Travis Kelce combined for 8.60. No legal one-player bench replacement would have flipped this result. Ben still leads the Throne in season points at 877.20, yet sits 4–3 behind four teams with fewer points and more wins.',
    decisiveLabel: 'Closest finish: 3.43 · Probability lead changes: 26',
    featured: true,
  },
  '1387520168866885632:7:1': {
    headline: 'Checkout Took First. Harry Took the Wrong Opponent.',
    deck: 'The Gauntlet’s highest score beat its fourth-highest, 161.33–143.95.',
    recap:
      'Checkout & Gameplay had seven starters at 14.60 or better and five at 19.80 or better. Bo Nix led with 26.28, followed by Quinshon Judkins, Zay Flowers, Trey McBride, and Ollie Gordon. Harry’s 143.95 was second in the Keep and fourth across the Gauntlet; Jaxon Smith-Njigba, Javonte Williams, and Tee Higgins alone gave him 76.10. It still lost by 17.38. Checkout reached 5–2 and the weekly scoring crown. Harry fell to 3–4 with 883.67 season points and a Keep-high 922.31 against.',
    decisiveLabel: 'Combined score: 305.28 · Harry’s Keep all-play: 10–1',
    featured: true,
  },
  '1387520168866885632:7:2': {
    headline: 'Luke Rebounded by Fifty and Won by Fifty-Three',
    deck: 'An 87.05-point Week 6 became 137.97 and the week’s largest margin.',
    recap:
      'Luke beat vayyala 137.97–84.62 as Jameson Williams, Luther Burden, and Rhamondre Stevenson combined for 65.80. Jahmyr Gibbs, C.J. Stroud, and Makai Lemon each added at least 16.20. Varun had 18.90 from Braelon Allen but only 1.60 from Nico Collins and 3.00 from Pat Freiermuth. Luke opened at a 38.5% chance and finished with a 53.35-point win, moving to 5–2. The final Sleeper total includes 1.30 not present in Luke’s chart tail.',
    decisiveLabel: 'Largest margin: 53.35 · Week-on-week gain: 50.92',
  },
  '1387520168866885632:7:3': {
    headline: 'Pollard and Burrow Bought Jimothy Some Air',
    deck: 'The duo’s 65.88 points carried a 134.98–119.09 win.',
    recap:
      'Tony Pollard’s 36.50 and Joe Burrow’s 29.38 built the foundation; Puka Nacua and Bijan Robinson added 35.00. Jonathon Taylor Mayde got 27.94 from Drake Maye and 19.70 from KC Concepcion, but Mark Andrews’ 3.80 and the Saints’ 3.65 left too much ground. The 119.09 is the best score among the Gauntlet’s three 1–6 teams this week. Jimothy reached 4–3; his 84.1% opening probability never fell below 64%.',
    decisiveLabel: 'Jimothy: 4–3 · Pollard + Burrow: 65.88',
  },
  '1387520168866885632:7:4': {
    headline: 'The Thirtieth-Best Score Won Anyway',
    deck: 'Akhil M reached 5–2 with 86.46; vchak had the answers on the bench.',
    recap:
      'Christian McCaffrey’s 19.50 and Jordan Love’s 16.96 were enough for akmadurai to beat vchak 86.46–77.87. Neither lineup had a 20-point starter. The losing bench held Omar Cooper at 20.00 and Tre Tucker at 18.80; either over Jalen Coker’s 1.40 would have won. Akhil M now has five wins despite being outscored 734.07–733.92 over seven weeks. This was the only sub-90 win, and it came from a 27.4% opening underdog.',
    decisiveLabel: 'Actual record: 5–2 · Season point differential: −0.15',
  },
  '1387520168866885632:7:5': {
    headline: 'Sean Found a Hundred. Alex Lost Fifty-Six.',
    deck: 'Ja’Marrican Psycho doubled last week’s output and won by 38.90.',
    recap:
      'Sean followed the season-low 52.48 with 106.73 against the beggar king’s 67.83. Geno Smith, Amon-Ra St. Brown, and Kyren Williams combined for 62.78. Alex’s only double-digit starters were Emanuel Wilson, Aaron Rodgers, and Minnesota’s defense; five slots finished below five points. The 55.93-point drop from Week 6 was the second-largest team decline this week, behind Marginal Returns. Sean moved to 2–5 and would still have won this matchup without Geno’s 23.98.',
    decisiveLabel: 'Sean’s rebound: +54.25 · Alex’s decline: −55.93',
  },
  '1387520168866885632:7:6': {
    headline: 'A Five-Percent Ticket Cashed Against the King',
    deck: 'Team Lil Bros won 106.62–90.25 after opening at just 5.4%.',
    recap:
      'Caleb Williams and CeeDee Lamb provided 44.52, with Ashton Jeanty and Colston Loveland adding 34.00. Rithik had 26.50 from Bucky Irving but only 5.50 from Patrick Mahomes, 5.90 from Derrick Henry, and 2.30 from Sam LaPorta. Team Lil Bros bottomed at a recorded 2.8% chance before the upset. Both teams are now 4–3. King Henry’s Court still ranks second across the Gauntlet in season points, but the last two weeks total only 182.60 after Week 5’s 171.30.',
    decisiveLabel: 'Largest opening upset: 5.4% · Both teams: 4–3',
    featured: true,
  },
  '1387520236663615488:7:1': {
    headline: 'Nikhil Reopened the Forge’s Front Door',
    deck: 'The 5–1 leader fell 116.21–97.67 and lost sole possession of first.',
    recap:
      'Tee Higgins and Zay Flowers supplied 47.50 for krishnik; Jonathan Taylor added 19.50. Nikhil could even absorb a zero from DeVonta Smith. Gibuttersnaps had no starter above Ashton Jeanty’s 17.60 and no winning one-player bench replacement. The loss dropped him to 5–2, level with Aditya on record but 235.84 points behind. Nikhil reached 4–3. The opening 72% favorite never fell below 63.6%.',
    decisiveLabel: 'Forge leaders: two at 5–2 · Season points gap: 235.84',
  },
  '1387520236663615488:7:2': {
    headline: 'Ashwin’s Four-Man Floor Held',
    deck: 'Lamb, Gordon, McCaffrey, and Gibbs supplied 79.50 of 112.48.',
    recap:
      'Ashwin beat Aaryan 112.48–99.43 with four skill players between 18.30 and 21.90. The remaining five starters needed only 32.98. Aaryan got 23.98 from Geno Smith and 20.50 from Rhamondre Stevenson, but Nico Collins’ 1.60 was part of a lineup with five single-digit scores. The winner never fell below a recorded 59.4% chance. Ashwin moved to 4–3; Aaryan’s 2–5 now comes with 859.46 points against, the Forge’s highest total.',
    decisiveLabel: 'Ashwin: 4–3 · Four skill players: 79.50',
  },
  '1387520236663615488:7:3': {
    headline: 'Aditya Won the Game and Missed the Podium Money by 0.57',
    deck: 'A 146.78-point win put the season scoring leader level at the top of the Forge.',
    recap:
      'Tony Pollard, Joe Burrow, and Jaxon Smith-Njigba supplied 93.18—63.5% of Aditya’s total—in a 146.78–134.09 win over Can you tuten my face. The loser had five starters at 18.80 or better, but Jalen Coker and Derrick Henry combined for 7.30. Blake Corum’s 19.10 over Coker would have produced 151.79. Aditya’s recorded chance fell to 13.3% before he won. He now has 952.62 season points, 63.26 clear of anyone else, and shares the Forge’s best record at 5–2.',
    decisiveLabel: 'Season scoring leader: 952.62 · Weekly scoring rank: 3rd',
    featured: true,
  },
  '1387520236663615488:7:4': {
    headline: 'Sahil Won With Balance, Not a Twenty-Point Star',
    deck: 'Seven double-digit starters erased an opening 32% chance.',
    recap:
      'Sahil beat Socialized L-Care 116.12–102.32 without a single starter reaching 20. Amon-Ra St. Brown led at 19.70; Emanuel Wilson added 18.50, while Ja’Marr Chase, Brock Purdy, Dameon Pierce, Tucker Kraft, and Kyle Pitts all reached double figures. Socialized L-Care had 25.40 from Quinshon Judkins but 2.30 from Sam LaPorta and zero from Christian Kirk. Sahil’s recorded chance reached a 5.2% low and crossed the 50% line repeatedly before the win. He joins the Forge’s five-team group at 4–3. The chart is directional because the loser’s final total is 1.30 higher than its tail.',
    decisiveLabel: 'Seven double-digit starters · Sahil: 4–3',
  },
  '1387520236663615488:7:5': {
    headline: 'Mexican Cartel Needed Only the First Three Quarters of Its Lineup',
    deck: 'The 106.13–79.67 win survived even a hypothetical zero from Dak Prescott.',
    recap:
      'Dak Prescott scored 23.78, Braelon Allen 18.90, and Saquon Barkley 15.10. The other six gave Mexican Cartel enough to finish 26.46 ahead of Lisan Al-Caleb. Caleb Williams and D’Andre Swift provided 41.12 on the losing side, but seven remaining starters totaled just 38.55. Mexican Cartel won as a slight opening underdog and reached 3–4. Its last-three-week average is 129.54, up 31.52 from Weeks 1–4; the record has been slower to respond than the scoring.',
    decisiveLabel: 'Last-three average: 129.54 · Winning margin: 26.46',
  },
  '1387520236663615488:7:6': {
    headline: 'Loveland Island Had Enough Without a Quarterback Rescue',
    deck: 'Irving and Jameson Williams supplied 50.10 in a 114.37–92.40 win.',
    recap:
      'Bucky Irving’s 26.50 and Jameson Williams’ 23.60 carried Loveland Island past a 5.42-point game from Bryce Young and a negative 49ers defense. Bijan Robinson, Colston Loveland, and RJ Harvey added 46.60. Brenden had 22.10 from Trey McBride and 38.20 from Kyren Williams plus Josh Jacobs, but Lamar Jackson’s zero left too much missing. Loveland Island reached 4–3; Brenden fell to 2–5. The favorite stayed above 57% throughout the recorded feed.',
    decisiveLabel: 'Irving + Williams: 50.10 · Loveland Island: 4–3',
  },
};

export const WEEK_SEVEN_RECAP = {
  season: 2026,
  week: 7,
  publishedAt: '2026-10-27T12:00:00-04:00',
  headline: 'Good Scores. Bad Addresses.',
  subheadline:
    'The fourth-highest score lost. The thirtieth-highest won. Ten opening underdogs cashed, and the Throne’s lead became a four-way tie.',
  lede: [
    'The points came back, but they did not arrive where everyone needed them. Week 7 produced 3,985.63 points, up 314.64 from Week 6, with a 110.71 average. Checkout & Gameplay led all 36 teams at 161.33. Two Williams, One Cup took second at 147.35, just 0.57 ahead of Aditya. Harry’s 143.95, the fourth-best score of the week, ran into Checkout and lost.',
    'At the other end, akmadurai won with 86.46—the thirtieth-highest score in the field—and reached 5–2 despite a negative season point differential. That is this week’s central split: scoring strength and standings position keep telling different stories. Our seven-week reality check below measures that split, tracks recent form, and asks which winners could have survived without their top scorer.',
    'Ten of 18 opening underdogs won, including Team Lil Bros from a 5.4% opening chance. The Throne now has four teams at 5–2; the Keep has three; and the Forge has two. Aditya owns the season scoring lead and has finally drawn level with gibuttersnaps on record. Nobody has more than five wins.',
  ],
  openingOddsSource: 'the first recorded Week 7 driveFF sample, October 22 at 8:16 p.m. ET',
  leagues: source.leagues.map(league => ({
    leagueId: league.leagueId,
    name: league.name,
    shortName: league.shortName as 'Throne' | 'Keep' | 'Forge',
    matchups: league.matchups.map(game => ({
      key: game.key,
      leagueId: league.leagueId,
      matchupId: game.matchupId,
      teams: game.teams.map(team => ({
        rosterId: team.rosterId,
        fallbackLabel: team.label,
        score: team.score,
      })) as [WeeklyRecapMatchup['teams'][0], WeeklyRecapMatchup['teams'][1]],
      winnerRosterId: game.winnerRosterId,
      openingFavoriteRosterId: game.flow.favoriteRosterId,
      openingWinProbability: game.flow.favoriteProbability,
      probabilityQuality: game.flow.finalAligned ? ('reliable' as const) : ('directional' as const),
      probabilityNote: game.flow.finalAligned
        ? undefined
        : 'The final chart sample is 1.30 points below a team’s corrected Sleeper total. Use the curve for direction; the printed final score determines the result.',
      ...stories[game.key],
    })),
  })),
  flowSections: [
    {
      id: 'the-wrong-opponent',
      title: 'The Wrong Opponent',
      deck: 'The weekly scoring crown, the 0.57-point payout boundary, and the high scores that found higher ones.',
      matchupKeys: [
        '1387520168866885632:7:1',
        '1387520086092312576:7:4',
        '1387520236663615488:7:3',
      ],
    },
    {
      id: 'the-escape-artists',
      title: 'The Escape Artists',
      deck: 'A 3.43-point finish, a 4.35-point upset, and a victory with the thirtieth-best score.',
      matchupKeys: [
        '1387520086092312576:7:6',
        '1387520086092312576:7:1',
        '1387520168866885632:7:4',
        '1387520086092312576:7:2',
      ],
    },
    {
      id: 'the-crown-moved',
      title: 'The Crown Moved',
      deck: 'The biggest opening upset, the Forge lead reopening, and a balanced comeback.',
      matchupKeys: [
        '1387520168866885632:7:6',
        '1387520236663615488:7:1',
        '1387520236663615488:7:4',
      ],
    },
    {
      id: 'the-supporting-cast',
      title: 'The Supporting Cast',
      deck: 'Eight more verdicts, from Luke’s 53-point win to the backfields that quietly carried the week.',
      matchupKeys: [
        '1387520168866885632:7:2',
        '1387520086092312576:7:3',
        '1387520168866885632:7:3',
        '1387520086092312576:7:5',
        '1387520168866885632:7:5',
        '1387520236663615488:7:2',
        '1387520236663615488:7:5',
        '1387520236663615488:7:6',
      ],
    },
  ],
  records: [
    {
      title: 'The Wrong Side of 143.95',
      classification: 'Statistical oddity',
      rank: null,
      rankLabel: 'Highest losing score · 4th overall',
      summary:
        'Harry would have beaten ten of the other eleven Keep teams. He drew the only one he could not beat. His 3–4 record trails a same-Legion all-play baseline of 5.00 wins.',
    },
    {
      title: 'Eighty-Six Was Enough',
      classification: 'Statistical oddity',
      rank: null,
      rankLabel: 'Lowest winning score · 30th overall',
      summary:
        'Akhil M’s 86.46 beat vchak by 8.59. Only six of the 36 teams scored less. His opponent had two different winning replacements on the bench.',
    },
    {
      title: 'A Five-Percent Winner',
      classification: 'Hall of Fame',
      rank: null,
      rankLabel: 'Biggest opening upset · 5.4%',
      summary:
        'Team Lil Bros beat King Henry’s Court 106.62–90.25. The recorded chance dipped to 2.8%; the opening favorite had been 94.6%.',
    },
    {
      title: 'Fifty-Three Points of Breathing Room',
      classification: 'Hall of Fame',
      rank: null,
      rankLabel: 'Largest Week 7 margin · 53.35',
      summary:
        'Luke scored 137.97 against Varun’s 84.62. His 50.92-point rebound from Week 6 moved him into the Keep’s three-team tie at 5–2.',
    },
  ],
  autopsies: source.leagues.flatMap(league =>
    league.matchups.flatMap(game =>
      game.teams
        .filter(team => team.winningSwaps.length > 0)
        .map(team => {
          const swap = team.winningSwaps[0];
          return {
            teamKey: `${league.leagueId}:${team.rosterId}`,
            label: team.label,
            actualScore: team.score,
            opponentScore: game.teams.find(other => other.rosterId !== team.rosterId)!.score,
            revisedScore: swap.revisedScore,
            swap: `${swap.in.name} over ${swap.out.name}`,
          };
        }),
    ),
  ),
  receipts: [
    {
      title: 'The scoring weather improved',
      summary:
        'Total scoring rose 314.64. The number of sub-100 teams fell from twenty to thirteen, though this was still below the scoring totals of Weeks 1, 4, and 5.',
      before: 101.97,
      after: 110.71,
      beforeLabel: 'Week 6 avg',
      afterLabel: 'Week 7 avg',
    },
    {
      title: 'One running back, three big afternoons',
      summary:
        'Tony Pollard scored 36.50 in each Legion. His managers finished second, third, and sixth overall this week: Two Williams, One Cup, Aditya, and Jimothy. All three won.',
    },
    {
      title: 'The Throne’s best offense is outside the lead',
      summary:
        'Ben has 877.20 points and a 4–3 record. Each of the four teams at 5–2 has scored less. The gap to Neil is 90.48 points; Ben’s opponents have scored 93.16 more than Neil’s.',
    },
    {
      title: 'Three tails needed a correction',
      summary:
        'Hunter in the Throne, Luke in the Keep, and Socialized L-Care in the Forge each have 1.30 more final Sleeper points than their last recorded chart sample. Those panels are labeled directional. None changes the winner.',
    },
  ],
} satisfies WeeklyRecap;
