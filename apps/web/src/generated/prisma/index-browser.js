Object.defineProperty(exports, '__esModule', { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip,
} = require('./runtime/index-browser.js');

const Prisma = {};

exports.Prisma = Prisma;
exports.$Enums = {};

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: '5.22.0',
  engine: '605197351a3c8bdd595af2d2a9bc3025bca48ea2',
};

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable',
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  displayName: 'displayName',
  avatar: 'avatar',
  metadata: 'metadata',
  isBot: 'isBot',
};

exports.Prisma.LeagueScalarFieldEnum = {
  id: 'id',
  name: 'name',
  season: 'season',
  seasonType: 'seasonType',
  status: 'status',
  sport: 'sport',
  totalRosters: 'totalRosters',
  settings: 'settings',
  scoringSettings: 'scoringSettings',
  rosterPositions: 'rosterPositions',
  metadata: 'metadata',
  previousLeagueId: 'previousLeagueId',
  draftId: 'draftId',
  playoffMatchups: 'playoffMatchups',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.RosterScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  ownerId: 'ownerId',
  coOwners: 'coOwners',
  players: 'players',
  starters: 'starters',
  reserve: 'reserve',
  settings: 'settings',
  metadata: 'metadata',
  waiverBudget: 'waiverBudget',
  waiverPosition: 'waiverPosition',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.MatchupScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  week: 'week',
  rosterId: 'rosterId',
  matchupId: 'matchupId',
  points: 'points',
  customPoints: 'customPoints',
  starters: 'starters',
  startersPoints: 'startersPoints',
  players: 'players',
  playersPoints: 'playersPoints',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  type: 'type',
  status: 'status',
  creatorId: 'creatorId',
  rosterIds: 'rosterIds',
  adds: 'adds',
  drops: 'drops',
  draftPicks: 'draftPicks',
  waiver: 'waiver',
  settings: 'settings',
  leg: 'leg',
  consenterIds: 'consenterIds',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.TradedPickScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  season: 'season',
  round: 'round',
  rosterId: 'rosterId',
  previousOwnerId: 'previousOwnerId',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.DraftScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  status: 'status',
  type: 'type',
  season: 'season',
  settings: 'settings',
  metadata: 'metadata',
  slotToRosterId: 'slotToRosterId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.DraftPickScalarFieldEnum = {
  id: 'id',
  draftId: 'draftId',
  pickNo: 'pickNo',
  round: 'round',
  rosterId: 'rosterId',
  playerId: 'playerId',
  pickedBy: 'pickedBy',
  metadata: 'metadata',
  isKeeper: 'isKeeper',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.PlayerScalarFieldEnum = {
  id: 'id',
  hashtag: 'hashtag',
  firstName: 'firstName',
  lastName: 'lastName',
  fullName: 'fullName',
  team: 'team',
  position: 'position',
  depthChartOrder: 'depthChartOrder',
  status: 'status',
  injuryStatus: 'injuryStatus',
  weight: 'weight',
  height: 'height',
  number: 'number',
  age: 'age',
  yearsExp: 'yearsExp',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.PlayerStatsScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  week: 'week',
  season: 'season',
  statsType: 'statsType',
  stats: 'stats',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.WeeklyMetricsScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  rosterId: 'rosterId',
  week: 'week',
  totalPoints: 'totalPoints',
  expectedWins: 'expectedWins',
  luckRating: 'luckRating',
  opponentPoints: 'opponentPoints',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.PositionVarianceScalarFieldEnum = {
  id: 'id',
  position: 'position',
  season: 'season',
  sampleSize: 'sampleSize',
  meanError: 'meanError',
  stdDev: 'stdDev',
  lastUpdated: 'lastUpdated',
  createdAt: 'createdAt',
};

exports.Prisma.PlayerVarianceScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  season: 'season',
  sampleSize: 'sampleSize',
  meanError: 'meanError',
  stdDev: 'stdDev',
  lastUpdated: 'lastUpdated',
  createdAt: 'createdAt',
};

exports.Prisma.ProjectionErrorScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  week: 'week',
  season: 'season',
  projectedPoints: 'projectedPoints',
  actualPoints: 'actualPoints',
  normalizedError: 'normalizedError',
  createdAt: 'createdAt',
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc',
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive',
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull,
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last',
};

exports.Prisma.ModelName = {
  User: 'User',
  League: 'League',
  Roster: 'Roster',
  Matchup: 'Matchup',
  Transaction: 'Transaction',
  TradedPick: 'TradedPick',
  Draft: 'Draft',
  DraftPick: 'DraftPick',
  Player: 'Player',
  PlayerStats: 'PlayerStats',
  WeeklyMetrics: 'WeeklyMetrics',
  PositionVariance: 'PositionVariance',
  PlayerVariance: 'PlayerVariance',
  ProjectionError: 'ProjectionError',
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message;
        const runtime = getRuntime();
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message =
            'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' +
            runtime.prettyName +
            '`).';
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;

        throw new Error(message);
      },
    });
  }
}

exports.PrismaClient = PrismaClient;

Object.assign(exports, Prisma);
