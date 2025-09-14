// This file exists to catch any remaining database imports
// All database calls should be replaced with Sleeper API calls

export const prisma = new Proxy({}, {
  get(target, prop) {
    throw new Error(
      `Database access attempted: prisma.${String(prop)}
      
      This website no longer uses a database!
      Please use the replacement functions from '@/lib/api-replacements' instead.
      
      Common replacements:
      - prisma.league.findMany() → getAllLeagues()
      - prisma.roster.findMany() → getRostersByLeague()
      - prisma.matchup.findMany() → getMatchupsByWeek()
      
      See API_FIRST_ARCHITECTURE.md for migration guide.`
    );
  }
});
