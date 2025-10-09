import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { loadRecapReport } from '@/lib/reports/recap/utils/report-loader';

const GAUNTLET_LEAGUES = [
  { id: '1263744209295245312', name: 'Gauntlet AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC' },
];

// Calculate power rankings using the official formula:
// Power Rank = 0.5 * z(AvgPtsToDate) + 0.3 * z(ExpectedWinsCum) + 0.2 * z(RollingAvg3)
const calculatePowerRankings = async (week: number) => {
  const allRankings: any[] = [];

  for (const league of GAUNTLET_LEAGUES) {
    try {
      // Fetch league data
      const [rosters, users, matchups] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/matchups/${week}`).then(r =>
          r.json(),
        ), // Use dynamic week
      ]);

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const metrics: {
        rosterId: number;
        avgPts: number;
        expCum: number;
        roll3: number;
        teamName: string;
      }[] = [];

      // Calculate metrics for each team
      for (const roster of rosters) {
        const matchup = matchups.find((m: any) => m.roster_id === roster.roster_id);
        const points = matchup?.points || 0;

        // For Week 1: avgPts = points, expCum = expectedWins, roll3 = points
        // Expected wins calculation: compare points against all other teams
        const expectedWins =
          matchups.filter((m: any) => m.roster_id !== roster.roster_id && points > (m.points || 0))
            .length /
          (matchups.length - 1);

        const owner: any = usersMap.get(roster.owner_id);
        const teamName =
          owner?.metadata?.team_name ||
          owner?.display_name ||
          owner?.username ||
          `Team ${roster.roster_id}`;

        metrics.push({
          rosterId: roster.roster_id,
          avgPts: points, // Week 1 average = Week 1 points
          expCum: expectedWins, // Cumulative expected wins (just Week 1)
          roll3: points, // 3-week rolling average = Week 1 points for now
          teamName,
        });
      }

      // Calculate z-scores
      const zscore = (arr: number[]) => {
        const mu = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
        const sd = Math.sqrt(
          arr.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / Math.max(1, arr.length - 1) || 0,
        );
        return arr.map(v => (sd === 0 ? 0 : (v - mu) / sd));
      };

      const zA = zscore(metrics.map(m => m.avgPts));
      const zE = zscore(metrics.map(m => m.expCum));
      const zR = zscore(metrics.map(m => m.roll3));

      // Apply power ranking formula and add to results
      for (let i = 0; i < metrics.length; i++) {
        const power = 0.5 * zA[i] + 0.3 * zE[i] + 0.2 * zR[i];
        allRankings.push({
          leagueId: league.id,
          rosterId: String(metrics[i].rosterId),
          name: metrics[i].teamName,
          rank: 0, // Will be set after sorting
          normalized: power,
          wins: 0, // Will be calculated from matchup results
          losses: 0,
        });
      }
    } catch (error) {
      console.error(`Failed to calculate power rankings for ${league.id}:`, error);
    }
  }

  // Sort by power ranking and assign ranks
  allRankings.sort((a, b) => b.normalized - a.normalized);
  allRankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });

  // Normalize scores to have mean of 100 and reasonable spread
  if (allRankings.length > 0) {
    const scores = allRankings.map(r => r.normalized);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length);

    // Normalize to mean=0, std=1, then scale to mean=100, std=10 for better visual range
    return allRankings.map(ranking => ({
      ...ranking,
      normalized:
        stdDev === 0
          ? 100
          : Math.round((100 + ((ranking.normalized - mean) / stdDev) * 10) * 100) / 100,
    }));
  }

  return allRankings;
};

// Calculate standings with real Sleeper data
const calculateStandings = async (_week: number) => {
  const standings: any[] = [];

  for (const league of GAUNTLET_LEAGUES) {
    try {
      // Fetch league data
      const [rosters, users, matchups] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/matchups/1`).then(r => r.json()), // Week 1 only
      ]);

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const divisions: Record<string, any[]> = {};

      // Calculate standings for each team
      for (const roster of rosters) {
        const matchup = matchups.find((m: any) => m.roster_id === roster.roster_id);
        const points = matchup?.points || 0;

        // Calculate wins/losses for Week 1
        const opponentMatchup = matchups.find(
          (m: any) => m.matchup_id === matchup?.matchup_id && m.roster_id !== roster.roster_id,
        );
        const opponentPoints = opponentMatchup?.points || 0;

        let wins = 0,
          losses = 0,
          ties = 0;
        if (points > opponentPoints) wins = 1;
        else if (points < opponentPoints) losses = 1;
        else ties = 1;

        const owner: any = usersMap.get(roster.owner_id);
        const teamName =
          owner?.metadata?.team_name ||
          owner?.display_name ||
          owner?.username ||
          `Team ${roster.roster_id}`;

        // Use division from roster settings, default to division 1
        const division = roster.settings?.division || 1;

        if (!divisions[division]) divisions[division] = [];

        divisions[division].push({
          teamId: `${league.id}-${roster.roster_id}`,
          teamName,
          owner: owner?.display_name || owner?.username || 'Unknown',
          wins,
          losses,
          ties,
          points: Math.round(points * 100) / 100, // Round to 2 decimal places
          rosterId: String(roster.roster_id),
          division,
        });
      }

      // Sort each division by wins, then by points and add division names
      const divisionNames = ['North', 'South', 'East', 'West'];
      Object.keys(divisions).forEach(divisionKey => {
        divisions[divisionKey].sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points - a.points;
        });
      });

      // Convert numeric keys to division names
      const namedDivisions: Record<string, any[]> = {};
      Object.keys(divisions).forEach(divisionKey => {
        const divisionIndex = parseInt(divisionKey) - 1;
        const divisionName = divisionNames[divisionIndex] || `Division ${divisionKey}`;
        namedDivisions[divisionName] = divisions[divisionKey];
      });

      standings.push({
        leagueId: league.id,
        leagueName: league.name,
        divisions: namedDivisions,
      });
    } catch (error) {
      console.error(`Failed to calculate standings for ${league.id}:`, error);
      // Return empty divisions on error
      standings.push({
        leagueId: league.id,
        leagueName: league.name,
        divisions: {},
      });
    }
  }

  return standings;
};

// Calculate upcoming matchups for next week
const calculateUpcomingMatchups = async (nextWeek: number) => {
  const upcomingMatchups: Record<string, any[]> = {};

  for (const league of GAUNTLET_LEAGUES) {
    try {
      // Fetch next week's matchups and league data
      const [rosters, users, matchups] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${league.id}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/users`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${league.id}/matchups/${nextWeek}`).then(r =>
          r.json(),
        ),
      ]);

      const usersMap = new Map(users.map((u: any) => [u.user_id, u]));
      const rostersMap = new Map(rosters.map((r: any) => [r.roster_id, r]));

      // Group matchups by matchup_id
      const matchupGroups: Record<number, any[]> = {};
      matchups.forEach((matchup: any) => {
        if (!matchupGroups[matchup.matchup_id]) {
          matchupGroups[matchup.matchup_id] = [];
        }
        matchupGroups[matchup.matchup_id].push(matchup);
      });

      const leagueMatchups: any[] = [];

      // Process each matchup pair
      Object.values(matchupGroups).forEach((matchupPair: any[]) => {
        if (matchupPair.length === 2) {
          const [teamA, teamB] = matchupPair;

          const rosterA: any = rostersMap.get(teamA.roster_id);
          const rosterB: any = rostersMap.get(teamB.roster_id);
          const ownerA: any = usersMap.get(rosterA?.owner_id);
          const ownerB: any = usersMap.get(rosterB?.owner_id);

          const teamAName =
            ownerA?.metadata?.team_name ||
            ownerA?.display_name ||
            ownerA?.username ||
            `Team ${teamA.roster_id}`;
          const teamBName =
            ownerB?.metadata?.team_name ||
            ownerB?.display_name ||
            ownerB?.username ||
            `Team ${teamB.roster_id}`;

          leagueMatchups.push({
            matchupId: teamA.matchup_id,
            teamA: {
              rosterId: teamA.roster_id,
              name: teamAName,
              owner: ownerA?.display_name || ownerA?.username || 'Unknown',
            },
            teamB: {
              rosterId: teamB.roster_id,
              name: teamBName,
              owner: ownerB?.display_name || ownerB?.username || 'Unknown',
            },
          });
        }
      });

      upcomingMatchups[league.id] = leagueMatchups;
    } catch (error) {
      console.error(`Failed to fetch upcoming matchups for ${league.id}:`, error);
      upcomingMatchups[league.id] = [];
    }
  }

  return upcomingMatchups;
};

// Load static report data if available - Vercel-friendly approach
const loadStaticReportData = (season: string, week: number) => {
  try {
    // Try multiple path strategies for Vercel compatibility
    const possiblePaths = [
      // Local development path (current working approach)
      path.join(process.cwd(), 'src/data', `week${week}-${season}-report-data.json`),
      // Public folder path (Vercel-friendly)
      path.join(process.cwd(), 'public', `week${week}-${season}-report-data.json`),
      // Alternative local path
      path.join(process.cwd(), 'apps/web/src/data', `week${week}-${season}-report-data.json`),
      // Alternative public path
      path.join(process.cwd(), 'apps/web/public', `week${week}-${season}-report-data.json`),
    ];

    for (const dataPath of possiblePaths) {
      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);
        // Static data loaded successfully
        return data;
      }
    }

    console.log(`❌ Static data file not found in any of the attempted paths`);
  } catch (error) {
    console.error(`❌ Error loading static report data:`, error);
  }
  return null;
};

// Handle static report data
const handleStaticReportData = async (staticData: any, season: string, week: number) => {
  // Use default narratives for now (can be enhanced later)
  const parsed = getDefaultNarratives();

  // Enhanced leagues with static data
  const perLeague = GAUNTLET_LEAGUES.map(l => {
    const enhancedMatchups = Object.values(staticData.enhancedMatchups || {})
      .filter((m: any) => m.leagueId === l.id)
      .map((m: any) => ({
        ...m,
        // Add player names to boxscores
        boxscoreA:
          m.boxscoreA?.map((player: any) => {
            // Ensure position is valid for sim-engine validation
            // Valid positions: QB, RB, WR, TE, K, DEF, DST
            let position = staticData.playerNames?.[player.playerId]?.position;
            if (!position || !['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST'].includes(position)) {
              position = 'RB';
            }

            return {
              playerId: player.playerId,
              name:
                staticData.playerNames?.[player.playerId]?.full_name ||
                staticData.playerNames?.[player.playerId]?.first_name +
                  ' ' +
                  staticData.playerNames?.[player.playerId]?.last_name ||
                `Player ${player.playerId}`,
              position,
              points: player.points || 0,
            };
          }) || [],
        boxscoreB:
          m.boxscoreB?.map((player: any) => {
            // Ensure position is valid for sim-engine validation
            // Valid positions: QB, RB, WR, TE, K, DEF, DST
            let position = staticData.playerNames?.[player.playerId]?.position;
            if (!position || !['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST'].includes(position)) {
              position = 'RB';
            }

            return {
              playerId: player.playerId,
              name:
                staticData.playerNames?.[player.playerId]?.full_name ||
                staticData.playerNames?.[player.playerId]?.first_name +
                  ' ' +
                  staticData.playerNames?.[player.playerId]?.last_name ||
                `Player ${player.playerId}`,
              position,
              points: player.points || 0,
            };
          }) || [],
        // Add enhanced data
        combinedPoints: m.pointsA + m.pointsB,
        margin: Math.abs(m.pointsA - m.pointsB),
        excitementMetrics: {
          leadChanges: Math.floor(Math.random() * 5),
          avgDeltaPct: 15,
          closenessRating: Math.abs(m.pointsA - m.pointsB) < 10 ? 'high' : 'medium',
        },
        series: (m.timeSeries || []).map((point: any) => ({
          timestamp: new Date(Date.now() + point.time * 60000).toISOString(), // Convert time to timestamp
          winProbA: point.teamAWinProb,
          winProbB: point.teamBWinProb,
          team1Score: point.teamAScore,
          team2Score: point.teamBScore,
        })),
        recap: null, // Could be enhanced with narrative matching
      }));

    const teams = Object.values(staticData.standings?.[l.id] || {})
      .flat()
      .map((team: any) => ({
        rosterId: team.rosterId,
        teamName: team.teamName,
        ownerName: team.owner,
      }));

    return {
      leagueId: l.id,
      leagueName: l.name,
      overview: l.id === '1263740549504962561' ? parsed.nfcOverview : parsed.afcOverview,
      matchups: enhancedMatchups,
      detectors: {},
      teams,
      standingsByDivision: staticData.standings?.[l.id] || {},
    };
  });

  return NextResponse.json({
    ok: true,
    data: {
      season,
      week,
      scribeIntro: parsed.scribeIntro,
      myIntro: parsed.myIntro || undefined,
      leagues: perLeague,
      standings: await calculateStandings(week),
      powerRankings: await calculatePowerRankings(week),
      upcoming: await calculateUpcomingMatchups(week + 1),
      closingNote: parsed.closingNote || undefined,
      callouts: parsed.callouts || {},
      dbQueries: 0,
      dataSource: 'static-enhanced',
      message: 'Enhanced with time series, player names, and standings',
    },
  });
};

const getDefaultNarratives = () => {
  return {
    scribeIntro:
      "I am the Gauntlet Scribe — Dhruv brings the raw takes, I weaponize them. Expect receipts, rivalry, and the occasional fine. If you love a line, he'll say it was his. If you hate one, that was me.",
    nfcOverview: '',
    afcOverview: '',
    itemsNFC: [],
    itemsAFC: [],
    closingNote: '',
    myIntro: '',
    callouts: {},
  };
};

export const GET = async (
  _req: NextRequest,
  { params }: { params: { season: string; week: string } },
) => {
  const week = parseInt(params.week, 10);
  const season = parseInt(params.season, 10);

  if (!Number.isFinite(week) || week < 1 || week > 18) {
    return NextResponse.json({ ok: false, error: 'Invalid week' }, { status: 400 });
  }

  try {
    // First, try to load the report using the report-loader (handles both new format and legacy)
    const weeklyReport = await loadRecapReport(season, week);

    if (weeklyReport) {
      // Return the new narrative format
      return NextResponse.json({
        ok: true,
        report: weeklyReport,
        dataSource: 'weekly-recap-report',
      });
    }

    // Try to load static report data as fallback
    const staticData = loadStaticReportData(params.season, week);

    if (staticData) {
      return handleStaticReportData(staticData, params.season, week);
    }
    // --- Load and parse week1 report template for narratives ---
    const templatePath = path.join(process.cwd(), 'week1_report_template.md');
    const template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

    // Optional JSON override for Week 1 narratives
    const jsonOverridePath = path.join(process.cwd(), 'apps/web/data/report-week1.json');
    const jsonOverrideExists = fs.existsSync(jsonOverridePath);

    const parseTemplate = (md: string) => {
      const lines = md.split(/\r?\n/);
      let scribeIntro = '';
      let nfcOverview = '';
      let afcOverview = '';
      type TItem = { a: string; b: string; recap: string; odds: string[] };
      const itemsNFC: TItem[] = [];
      const itemsAFC: TItem[] = [];

      let i = 0;
      const readPara = () => {
        const out: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
          out.push(lines[i]);
          i++;
        }
        while (i < lines.length && lines[i].trim() === '') i++;
        return out.join('\n').trim();
      };
      const readBullets = () => {
        const out: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          out.push(lines[i].replace(/^-\s*/, '').trim());
          i++;
        }
        while (i < lines.length && lines[i].trim() === '') i++;
        return out;
      };

      // Scribe Intro
      for (; i < lines.length; i++)
        if (/Assistant's Intro/i.test(lines[i])) {
          i += 1;
          break;
        }
      scribeIntro = readPara();

      // NFC Overview
      for (; i < lines.length; i++)
        if (/Gauntlet NFC/i.test(lines[i])) {
          break;
        }
      for (; i < lines.length; i++)
        if (/League Overview/i.test(lines[i])) {
          i += 1;
          break;
        }
      nfcOverview = readPara();

      // NFC matchups
      const parseMatchupsInto = (collector: TItem[]) => {
        while (i < lines.length) {
          const header = lines[i] || '';
          if (/^Gauntlet\s+AFC/i.test(header)) break;
          if (/^\s*$/.test(header)) {
            i++;
            continue;
          }
          const mh = header.match(/^(.*?)\s*\(.*?\)\s*vs\s*(.*?)\s*\(.*?\)/i);
          if (!mh) {
            i++;
            continue;
          }
          const a = (mh[1] || '').trim();
          const b = (mh[2] || '').trim();
          i++;
          const recap = readPara();
          let odds: string[] = [];
          if (/^Odds\s*&\s*Ends/i.test(lines[i] || '')) {
            i++;
            odds = readBullets();
          }
          collector.push({ a, b, recap, odds });
        }
      };
      parseMatchupsInto(itemsNFC);

      // AFC Overview
      for (; i < lines.length; i++)
        if (/League Overview/i.test(lines[i])) {
          i += 1;
          break;
        }
      afcOverview = readPara();

      // AFC matchups
      parseMatchupsInto(itemsAFC);

      return { scribeIntro, nfcOverview, afcOverview, itemsNFC, itemsAFC };
    };

    type JsonMatchup = { matchup: string; recap: string; odds_and_ends?: string[] };
    type JsonNarratives = {
      assistant_intro?: string;
      nfc?: { league_overview?: string; matchups?: JsonMatchup[] };
      afc?: { league_overview?: string; matchups?: JsonMatchup[] };
      closing_note?: string;
      my_intro?: string;
      callouts?: Record<string, string>;
    };

    const parseJsonOverride = (obj: JsonNarratives) => {
      const extractTeams = (line: string) => {
        const vsIdx = line.toLowerCase().indexOf(' vs ');
        if (vsIdx === -1) return { a: line.trim(), b: '' };
        const left = line.slice(0, vsIdx).trim();
        const rightRaw = line.slice(vsIdx + 4).trim();
        const right = rightRaw.split('—')[0].split(' - ')[0].trim();
        const clean = (s: string) => s.replace(/\(.*?\)/g, '').trim();
        return { a: clean(left), b: clean(right) };
      };
      const toItems = (arr: JsonMatchup[] | undefined) =>
        (arr || []).map(m => {
          const { a, b } = extractTeams(m.matchup || '');
          return { a, b, recap: m.recap || '', odds: (m.odds_and_ends || []) as string[] };
        });

      return {
        scribeIntro:
          (obj.assistant_intro || '').trim() ||
          "I am the Gauntlet Scribe — Dhruv brings the raw takes, I weaponize them. Expect receipts, rivalry, and the occasional fine. If you love a line, he'll say it was his. If you hate one, that was me.",
        nfcOverview: (obj.nfc?.league_overview || '').trim(),
        afcOverview: (obj.afc?.league_overview || '').trim(),
        itemsNFC: toItems(obj.nfc?.matchups),
        itemsAFC: toItems(obj.afc?.matchups),
        closingNote: (obj.closing_note || '').trim(),
        myIntro: (obj.my_intro || '').trim(),
        callouts: obj.callouts || {},
      } as any;
    };

    const parsed = jsonOverrideExists
      ? parseJsonOverride(JSON.parse(fs.readFileSync(jsonOverridePath, 'utf8')) as JsonNarratives)
      : template
        ? parseTemplate(template)
        : ({
            scribeIntro:
              "I am the Gauntlet Scribe — Dhruv brings the raw takes, I weaponize them. Expect receipts, rivalry, and the occasional fine. If you love a line, he'll say it was his. If you hate one, that was me.",
            nfcOverview: '',
            afcOverview: '',
            itemsNFC: [],
            itemsAFC: [],
            closingNote: '',
          } as any);

    // Fetch actual matchup data from Sleeper API
    const perLeague = await Promise.all(
      GAUNTLET_LEAGUES.map(async l => {
        try {
          // Fetch matchups for the specified week
          const matchupsResponse = await fetch(
            `https://api.sleeper.app/v1/league/${l.id}/matchups/${week}`,
          );
          const matchupsData = matchupsResponse.ok ? await matchupsResponse.json() : [];

          // Fetch rosters and users for team names
          const [rostersResponse, usersResponse] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${l.id}/rosters`),
            fetch(`https://api.sleeper.app/v1/league/${l.id}/users`),
          ]);

          const rosters = rostersResponse.ok ? await rostersResponse.json() : [];
          const users = usersResponse.ok ? await usersResponse.json() : [];

          // Create lookup maps
          const usersById = new Map(users.map((u: any) => [u.user_id, u]));
          const rostersByRosterId = new Map(rosters.map((r: any) => [r.roster_id, r]));

          // Group matchups by matchup_id
          const matchupGroups = new Map<number, any[]>();
          matchupsData.forEach((m: any) => {
            if (m.matchup_id) {
              const group = matchupGroups.get(m.matchup_id) || [];
              group.push(m);
              matchupGroups.set(m.matchup_id, group);
            }
          });

          // Build matchup data
          const matchups = Array.from(matchupGroups.values())
            .filter(group => group.length === 2)
            .map(([teamA, teamB]) => {
              const getTeamName = (roster_id: number) => {
                const roster: any = rostersByRosterId.get(roster_id);
                const user: any = roster ? usersById.get(roster.owner_id) : null;
                return (
                  user?.metadata?.team_name ||
                  user?.display_name ||
                  user?.username ||
                  `Team ${roster_id}`
                );
              };

              const pointsA = teamA.points || 0;
              const pointsB = teamB.points || 0;

              return {
                matchupId: teamA.matchup_id,
                rosterAId: teamA.roster_id,
                rosterBId: teamB.roster_id,
                teamAName: getTeamName(teamA.roster_id),
                teamBName: getTeamName(teamB.roster_id),
                pointsA, // Use pointsA/pointsB as expected by frontend
                pointsB,
                teamAPoints: pointsA, // Keep both for compatibility
                teamBPoints: pointsB,
                combinedPoints: Math.round((pointsA + pointsB) * 100) / 100, // Total points in matchup
                margin: Math.round(Math.abs(pointsA - pointsB) * 100) / 100, // Point margin
                startersA: teamA.starters || [],
                startersB: teamB.starters || [],
                // Add enhanced boxscore data with player names and positions
                boxscoreA: (teamA.starters || []).map((playerId: string, index: number) => ({
                  playerId,
                  name: playerId, // Placeholder - in real implementation, would fetch from players API
                  position:
                    ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'][index] || 'FLEX', // Typical lineup positions
                  points: teamA.starters_points?.[index.toString()] || 0,
                })),
                boxscoreB: (teamB.starters || []).map((playerId: string, index: number) => ({
                  playerId,
                  name: playerId, // Placeholder - in real implementation, would fetch from players API
                  position:
                    ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'][index] || 'FLEX', // Typical lineup positions
                  points: teamB.starters_points?.[index.toString()] || 0,
                })),
                // Add placeholder excitement metrics (could be enhanced later)
                excitementMetrics: {
                  leadChanges: Math.floor(Math.random() * 5), // Placeholder
                  avgDeltaPct: 15, // Placeholder - percentage format (15 = 15%)
                  closenessRating: Math.abs(pointsA - pointsB) < 10 ? 'high' : 'medium',
                },
                // Add enhanced series data for win probability charts
                series: (() => {
                  const baseTime = new Date('2025-09-08T13:00:00Z'); // Sunday 1PM ET
                  const seriesPoints: Array<{
                    timestamp: string;
                    winProbA: number;
                    winProbB: number;
                    gameProgress: number;
                    team1Score: number;
                    team2Score: number;
                  }> = [];

                  // Create realistic win probability progression over the week
                  const times = [
                    { offset: 0, label: 'Thursday Start' },
                    { offset: 3 * 24 * 60 * 60 * 1000, label: 'Sunday Early' },
                    {
                      offset: 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
                      label: 'Sunday Afternoon',
                    },
                    { offset: 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000, label: 'Sunday Night' },
                    { offset: 4 * 24 * 60 * 60 * 1000, label: 'Monday Final' },
                  ];

                  times.forEach((time, index) => {
                    const timestamp = new Date(baseTime.getTime() + time.offset).toISOString();
                    const progress = index / (times.length - 1);

                    let winProbA, winProbB;
                    if (index === 0) {
                      // Start at 50/50
                      winProbA = 0.5;
                      winProbB = 0.5;
                    } else if (index === times.length - 1) {
                      // Final result
                      winProbA = pointsA > pointsB ? 1.0 : 0.0;
                      winProbB = pointsA > pointsB ? 0.0 : 1.0;
                    } else {
                      // Gradual progression based on final result
                      const finalWinnerIsA = pointsA > pointsB;
                      const baseProb = finalWinnerIsA ? 0.5 + progress * 0.4 : 0.5 - progress * 0.4;
                      const variance = 0.1 * Math.sin(progress * Math.PI * 2); // Add some ups and downs

                      winProbA = Math.max(0.1, Math.min(0.9, baseProb + variance));
                      winProbB = 1 - winProbA;
                    }

                    seriesPoints.push({
                      timestamp,
                      winProbA,
                      winProbB,
                      gameProgress: progress * 100,
                      team1Score: index === times.length - 1 ? pointsA : pointsA * progress,
                      team2Score: index === times.length - 1 ? pointsB : pointsB * progress,
                    });
                  });

                  return seriesPoints;
                })(),
                // Add placeholder recap (could be populated from narrative data)
                recap: null, // Will be populated from narrative data if available
              };
            });

          return {
            leagueId: l.id,
            leagueName: l.name,
            overview: l.id === '1263740549504962561' ? parsed.nfcOverview : parsed.afcOverview,
            matchups,
            detectors: {},
            teams: rosters.map((r: any) => {
              const user: any = usersById.get(r.owner_id);
              return {
                rosterId: r.roster_id,
                teamName:
                  user?.metadata?.team_name ||
                  user?.display_name ||
                  user?.username ||
                  `Team ${r.roster_id}`,
                ownerName: user?.display_name || user?.username || 'Unknown',
              };
            }),
            standingsByDivision: {},
          };
        } catch (error) {
          console.error(`Error fetching data for league ${l.id}:`, error);
          return {
            leagueId: l.id,
            leagueName: l.name,
            overview: l.id === '1263740549504962561' ? parsed.nfcOverview : parsed.afcOverview,
            matchups: [],
            detectors: {},
            teams: [],
            standingsByDivision: {},
          };
        }
      }),
    );

    // Calculate power rankings for this week
    const powerRankings = await calculatePowerRankings(week);

    // Generate upcoming matchups for next week
    const upcomingMatchups: Record<string, any[]> = {};

    for (const league of GAUNTLET_LEAGUES) {
      try {
        const nextWeek = week + 1;
        if (nextWeek <= 18) {
          const nextMatchupsResponse = await fetch(
            `https://api.sleeper.app/v1/league/${league.id}/matchups/${nextWeek}`,
          );
          const nextMatchupsData = nextMatchupsResponse.ok ? await nextMatchupsResponse.json() : [];

          // Get team names
          const leagueData = perLeague.find(l => l.leagueId === league.id);
          const teamMap = new Map(
            leagueData?.teams.map((t: any) => [t.rosterId, t.teamName]) || [],
          );

          // Group by matchup_id and create pairs
          const matchupGroups = new Map<number, any[]>();
          nextMatchupsData.forEach((m: any) => {
            if (m.matchup_id) {
              const group = matchupGroups.get(m.matchup_id) || [];
              group.push(m);
              matchupGroups.set(m.matchup_id, group);
            }
          });

          upcomingMatchups[league.id] = Array.from(matchupGroups.values())
            .filter(group => group.length === 2)
            .map(([teamA, teamB]) => ({
              matchupId: teamA.matchup_id,
              teamAName: teamMap.get(teamA.roster_id) || `Team ${teamA.roster_id}`,
              teamBName: teamMap.get(teamB.roster_id) || `Team ${teamB.roster_id}`,
              rosterAId: teamA.roster_id,
              rosterBId: teamB.roster_id,
            }));
        }
      } catch (error) {
        console.error(`Error fetching upcoming matchups for ${league.id}:`, error);
        upcomingMatchups[league.id] = [];
      }
    }

    // Generate standings data with proper win/loss records
    const standings = await Promise.all(
      perLeague.map(async l => {
        const teams = await Promise.all(
          l.teams.map(async (team: any) => {
            let wins = 0;
            let losses = 0;
            let totalPoints = 0;

            // Fetch matchup history for all weeks up to current week
            for (let weekNum = 1; weekNum <= week; weekNum++) {
              try {
                const weekMatchupsResponse = await fetch(
                  `https://api.sleeper.app/v1/league/${l.leagueId}/matchups/${weekNum}`,
                );
                const weekMatchupsData = weekMatchupsResponse.ok
                  ? await weekMatchupsResponse.json()
                  : [];

                // Find this team's matchup for this week
                const teamMatchupData = weekMatchupsData.find(
                  (m: any) => m.roster_id === team.rosterId,
                );
                if (teamMatchupData && teamMatchupData.matchup_id) {
                  const opponentData = weekMatchupsData.find(
                    (m: any) =>
                      m.matchup_id === teamMatchupData.matchup_id && m.roster_id !== team.rosterId,
                  );

                  if (opponentData) {
                    const teamPoints = teamMatchupData.points || 0;
                    const opponentPoints = opponentData.points || 0;

                    totalPoints += teamPoints;

                    if (teamPoints > opponentPoints) {
                      wins++;
                    } else {
                      losses++;
                    }
                  }
                }
              } catch (error) {
                console.warn(
                  `Error fetching week ${weekNum} data for team ${team.rosterId}:`,
                  error,
                );
              }
            }

            return {
              ...team,
              wins,
              losses,
              points: Math.round(totalPoints * 100) / 100,
            };
          }),
        );

        // Sort teams by wins, then by total points
        const sortedTeams = teams.sort((a: any, b: any) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points - a.points;
        });

        // Create 3 divisions per league (4 teams each for 12-team leagues)
        const teamsPerDivision = Math.ceil(sortedTeams.length / 3);
        const divisions = {
          East: sortedTeams.slice(0, teamsPerDivision),
          Central: sortedTeams.slice(teamsPerDivision, teamsPerDivision * 2),
          West: sortedTeams.slice(teamsPerDivision * 2),
        };

        return {
          leagueId: l.leagueId,
          leagueName: l.leagueName,
          divisions,
        };
      }),
    );

    // Calculate real hall of fame stats from this week's data
    const hallOfFame = [];
    const allTeamScores: Array<{ score: number; teamName: string; leagueName: string }> = [];
    const allMatchupMargins: Array<{
      margin: number;
      winner: string;
      loser: string;
      leagueName: string;
    }> = [];

    // Collect all team scores and matchup data from both leagues
    perLeague.forEach(league => {
      league.matchups.forEach(matchup => {
        allTeamScores.push({
          score: matchup.pointsA,
          teamName: matchup.teamAName || `Team ${matchup.rosterAId}`,
          leagueName: league.leagueName,
        });
        allTeamScores.push({
          score: matchup.pointsB,
          teamName: matchup.teamBName || `Team ${matchup.rosterBId}`,
          leagueName: league.leagueName,
        });

        const winner =
          matchup.pointsA > matchup.pointsB
            ? matchup.teamAName || `Team ${matchup.rosterAId}`
            : matchup.teamBName || `Team ${matchup.rosterBId}`;
        const loser =
          matchup.pointsA > matchup.pointsB
            ? matchup.teamBName || `Team ${matchup.rosterBId}`
            : matchup.teamAName || `Team ${matchup.rosterAId}`;

        allMatchupMargins.push({
          margin: matchup.margin,
          winner,
          loser,
          leagueName: league.leagueName,
        });
      });
    });

    // Only add new superlatives for this week (mark all as new since this is week 2 framework)
    if (allTeamScores.length > 0) {
      // Highest score this week
      const highestScore = allTeamScores.reduce((max, current) =>
        current.score > max.score ? current : max,
      );

      if (highestScore.score > 0) {
        hallOfFame.push({
          category: 'Highest Single Game Score (Week ' + week + ')',
          description: `Highest fantasy points scored by a team in Week ${week}`,
          player: highestScore.teamName,
          team: highestScore.leagueName,
          value: `${highestScore.score.toFixed(2)} pts`,
          isNewThisWeek: true,
        });
      }

      // Lowest score this week (only if greater than 0)
      const validScores = allTeamScores.filter(team => team.score > 0);
      if (validScores.length > 0) {
        const lowestScore = validScores.reduce((min, current) =>
          current.score < min.score ? current : min,
        );

        hallOfFame.push({
          category: 'Lowest Single Game Score (Week ' + week + ')',
          description: `Lowest fantasy points scored by a team in Week ${week}`,
          player: lowestScore.teamName,
          team: lowestScore.leagueName,
          value: `${lowestScore.score.toFixed(2)} pts`,
          isNewThisWeek: true,
        });
      }

      // Biggest blowout this week
      if (allMatchupMargins.length > 0) {
        const biggestBlowout = allMatchupMargins.reduce((max, current) =>
          current.margin > max.margin ? current : max,
        );

        if (biggestBlowout.margin > 0) {
          hallOfFame.push({
            category: 'Biggest Blowout (Week ' + week + ')',
            description: `Largest victory margin in Week ${week}`,
            player: biggestBlowout.winner,
            team: biggestBlowout.leagueName,
            value: `Beat ${biggestBlowout.loser} by ${biggestBlowout.margin.toFixed(2)} pts`,
            isNewThisWeek: true,
          });
        }
      }
    }

    // Return comprehensive report data
    return NextResponse.json({
      ok: true,
      data: {
        season,
        week,
        scribeIntro: parsed.scribeIntro,
        myIntro: (parsed as any).myIntro || undefined,
        leagues: perLeague,
        standings,
        powerRankings,
        upcoming: upcomingMatchups,
        closingNote: (parsed as any).closingNote || undefined,
        callouts: (parsed as any).callouts || {},
        hallOfFame,
        dbQueries: 0,
        dataSource: 'sleeper-api',
        message: 'Report data generated from Sleeper API',
      },
    });
  } catch (error: any) {
    console.error('Error building report data:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Server error' },
      { status: 500 },
    );
  }
};
