/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model League
 *
 */
export type League = $Result.DefaultSelection<Prisma.$LeaguePayload>;
/**
 * Model Roster
 *
 */
export type Roster = $Result.DefaultSelection<Prisma.$RosterPayload>;
/**
 * Model Matchup
 *
 */
export type Matchup = $Result.DefaultSelection<Prisma.$MatchupPayload>;
/**
 * Model Transaction
 *
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>;
/**
 * Model TradedPick
 *
 */
export type TradedPick = $Result.DefaultSelection<Prisma.$TradedPickPayload>;
/**
 * Model Draft
 *
 */
export type Draft = $Result.DefaultSelection<Prisma.$DraftPayload>;
/**
 * Model DraftPick
 *
 */
export type DraftPick = $Result.DefaultSelection<Prisma.$DraftPickPayload>;
/**
 * Model Player
 *
 */
export type Player = $Result.DefaultSelection<Prisma.$PlayerPayload>;
/**
 * Model PlayerStats
 *
 */
export type PlayerStats = $Result.DefaultSelection<Prisma.$PlayerStatsPayload>;
/**
 * Model WeeklyMetrics
 *
 */
export type WeeklyMetrics = $Result.DefaultSelection<Prisma.$WeeklyMetricsPayload>;
/**
 * Model PositionVariance
 *
 */
export type PositionVariance = $Result.DefaultSelection<Prisma.$PositionVariancePayload>;
/**
 * Model PlayerVariance
 *
 */
export type PlayerVariance = $Result.DefaultSelection<Prisma.$PlayerVariancePayload>;
/**
 * Model ProjectionError
 *
 */
export type ProjectionError = $Result.DefaultSelection<Prisma.$ProjectionErrorPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void
  ): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.league`: Exposes CRUD operations for the **League** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Leagues
   * const leagues = await prisma.league.findMany()
   * ```
   */
  get league(): Prisma.LeagueDelegate<ExtArgs>;

  /**
   * `prisma.roster`: Exposes CRUD operations for the **Roster** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Rosters
   * const rosters = await prisma.roster.findMany()
   * ```
   */
  get roster(): Prisma.RosterDelegate<ExtArgs>;

  /**
   * `prisma.matchup`: Exposes CRUD operations for the **Matchup** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Matchups
   * const matchups = await prisma.matchup.findMany()
   * ```
   */
  get matchup(): Prisma.MatchupDelegate<ExtArgs>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Transactions
   * const transactions = await prisma.transaction.findMany()
   * ```
   */
  get transaction(): Prisma.TransactionDelegate<ExtArgs>;

  /**
   * `prisma.tradedPick`: Exposes CRUD operations for the **TradedPick** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more TradedPicks
   * const tradedPicks = await prisma.tradedPick.findMany()
   * ```
   */
  get tradedPick(): Prisma.TradedPickDelegate<ExtArgs>;

  /**
   * `prisma.draft`: Exposes CRUD operations for the **Draft** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Drafts
   * const drafts = await prisma.draft.findMany()
   * ```
   */
  get draft(): Prisma.DraftDelegate<ExtArgs>;

  /**
   * `prisma.draftPick`: Exposes CRUD operations for the **DraftPick** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more DraftPicks
   * const draftPicks = await prisma.draftPick.findMany()
   * ```
   */
  get draftPick(): Prisma.DraftPickDelegate<ExtArgs>;

  /**
   * `prisma.player`: Exposes CRUD operations for the **Player** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Players
   * const players = await prisma.player.findMany()
   * ```
   */
  get player(): Prisma.PlayerDelegate<ExtArgs>;

  /**
   * `prisma.playerStats`: Exposes CRUD operations for the **PlayerStats** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more PlayerStats
   * const playerStats = await prisma.playerStats.findMany()
   * ```
   */
  get playerStats(): Prisma.PlayerStatsDelegate<ExtArgs>;

  /**
   * `prisma.weeklyMetrics`: Exposes CRUD operations for the **WeeklyMetrics** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more WeeklyMetrics
   * const weeklyMetrics = await prisma.weeklyMetrics.findMany()
   * ```
   */
  get weeklyMetrics(): Prisma.WeeklyMetricsDelegate<ExtArgs>;

  /**
   * `prisma.positionVariance`: Exposes CRUD operations for the **PositionVariance** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more PositionVariances
   * const positionVariances = await prisma.positionVariance.findMany()
   * ```
   */
  get positionVariance(): Prisma.PositionVarianceDelegate<ExtArgs>;

  /**
   * `prisma.playerVariance`: Exposes CRUD operations for the **PlayerVariance** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more PlayerVariances
   * const playerVariances = await prisma.playerVariance.findMany()
   * ```
   */
  get playerVariance(): Prisma.PlayerVarianceDelegate<ExtArgs>;

  /**
   * `prisma.projectionError`: Exposes CRUD operations for the **ProjectionError** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more ProjectionErrors
   * const projectionErrors = await prisma.projectionError.findMany()
   * ```
   */
  get projectionError(): Prisma.ProjectionErrorDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;
  export import NotFoundError = runtime.NotFoundError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<
    ReturnType<T>
  >;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I
  ) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? K : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> =
    IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    User: 'User';
    League: 'League';
    Roster: 'Roster';
    Matchup: 'Matchup';
    Transaction: 'Transaction';
    TradedPick: 'TradedPick';
    Draft: 'Draft';
    DraftPick: 'DraftPick';
    Player: 'Player';
    PlayerStats: 'PlayerStats';
    WeeklyMetrics: 'WeeklyMetrics';
    PositionVariance: 'PositionVariance';
    PlayerVariance: 'PlayerVariance';
    ProjectionError: 'ProjectionError';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb
    extends $Utils.Fn<
      { extArgs: $Extensions.InternalArgs; clientOptions: PrismaClientOptions },
      $Utils.Record<string, any>
    > {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    ClientOptions = {},
  > = {
    meta: {
      modelProps:
        | 'user'
        | 'league'
        | 'roster'
        | 'matchup'
        | 'transaction'
        | 'tradedPick'
        | 'draft'
        | 'draftPick'
        | 'player'
        | 'playerStats'
        | 'weeklyMetrics'
        | 'positionVariance'
        | 'playerVariance'
        | 'projectionError';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      League: {
        payload: Prisma.$LeaguePayload<ExtArgs>;
        fields: Prisma.LeagueFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.LeagueFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.LeagueFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>;
          };
          findFirst: {
            args: Prisma.LeagueFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.LeagueFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>;
          };
          findMany: {
            args: Prisma.LeagueFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>[];
          };
          create: {
            args: Prisma.LeagueCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>;
          };
          createMany: {
            args: Prisma.LeagueCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.LeagueCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>[];
          };
          delete: {
            args: Prisma.LeagueDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>;
          };
          update: {
            args: Prisma.LeagueUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>;
          };
          deleteMany: {
            args: Prisma.LeagueDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.LeagueUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.LeagueUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$LeaguePayload>;
          };
          aggregate: {
            args: Prisma.LeagueAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateLeague>;
          };
          groupBy: {
            args: Prisma.LeagueGroupByArgs<ExtArgs>;
            result: $Utils.Optional<LeagueGroupByOutputType>[];
          };
          count: {
            args: Prisma.LeagueCountArgs<ExtArgs>;
            result: $Utils.Optional<LeagueCountAggregateOutputType> | number;
          };
        };
      };
      Roster: {
        payload: Prisma.$RosterPayload<ExtArgs>;
        fields: Prisma.RosterFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.RosterFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.RosterFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>;
          };
          findFirst: {
            args: Prisma.RosterFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.RosterFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>;
          };
          findMany: {
            args: Prisma.RosterFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>[];
          };
          create: {
            args: Prisma.RosterCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>;
          };
          createMany: {
            args: Prisma.RosterCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.RosterCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>[];
          };
          delete: {
            args: Prisma.RosterDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>;
          };
          update: {
            args: Prisma.RosterUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>;
          };
          deleteMany: {
            args: Prisma.RosterDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.RosterUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.RosterUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RosterPayload>;
          };
          aggregate: {
            args: Prisma.RosterAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateRoster>;
          };
          groupBy: {
            args: Prisma.RosterGroupByArgs<ExtArgs>;
            result: $Utils.Optional<RosterGroupByOutputType>[];
          };
          count: {
            args: Prisma.RosterCountArgs<ExtArgs>;
            result: $Utils.Optional<RosterCountAggregateOutputType> | number;
          };
        };
      };
      Matchup: {
        payload: Prisma.$MatchupPayload<ExtArgs>;
        fields: Prisma.MatchupFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.MatchupFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.MatchupFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>;
          };
          findFirst: {
            args: Prisma.MatchupFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.MatchupFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>;
          };
          findMany: {
            args: Prisma.MatchupFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>[];
          };
          create: {
            args: Prisma.MatchupCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>;
          };
          createMany: {
            args: Prisma.MatchupCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.MatchupCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>[];
          };
          delete: {
            args: Prisma.MatchupDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>;
          };
          update: {
            args: Prisma.MatchupUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>;
          };
          deleteMany: {
            args: Prisma.MatchupDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.MatchupUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.MatchupUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MatchupPayload>;
          };
          aggregate: {
            args: Prisma.MatchupAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateMatchup>;
          };
          groupBy: {
            args: Prisma.MatchupGroupByArgs<ExtArgs>;
            result: $Utils.Optional<MatchupGroupByOutputType>[];
          };
          count: {
            args: Prisma.MatchupCountArgs<ExtArgs>;
            result: $Utils.Optional<MatchupCountAggregateOutputType> | number;
          };
        };
      };
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>;
        fields: Prisma.TransactionFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateTransaction>;
          };
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>;
            result: $Utils.Optional<TransactionGroupByOutputType>[];
          };
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>;
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number;
          };
        };
      };
      TradedPick: {
        payload: Prisma.$TradedPickPayload<ExtArgs>;
        fields: Prisma.TradedPickFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TradedPickFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TradedPickFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>;
          };
          findFirst: {
            args: Prisma.TradedPickFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TradedPickFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>;
          };
          findMany: {
            args: Prisma.TradedPickFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>[];
          };
          create: {
            args: Prisma.TradedPickCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>;
          };
          createMany: {
            args: Prisma.TradedPickCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TradedPickCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>[];
          };
          delete: {
            args: Prisma.TradedPickDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>;
          };
          update: {
            args: Prisma.TradedPickUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>;
          };
          deleteMany: {
            args: Prisma.TradedPickDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TradedPickUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.TradedPickUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TradedPickPayload>;
          };
          aggregate: {
            args: Prisma.TradedPickAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateTradedPick>;
          };
          groupBy: {
            args: Prisma.TradedPickGroupByArgs<ExtArgs>;
            result: $Utils.Optional<TradedPickGroupByOutputType>[];
          };
          count: {
            args: Prisma.TradedPickCountArgs<ExtArgs>;
            result: $Utils.Optional<TradedPickCountAggregateOutputType> | number;
          };
        };
      };
      Draft: {
        payload: Prisma.$DraftPayload<ExtArgs>;
        fields: Prisma.DraftFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DraftFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DraftFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>;
          };
          findFirst: {
            args: Prisma.DraftFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DraftFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>;
          };
          findMany: {
            args: Prisma.DraftFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>[];
          };
          create: {
            args: Prisma.DraftCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>;
          };
          createMany: {
            args: Prisma.DraftCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DraftCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>[];
          };
          delete: {
            args: Prisma.DraftDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>;
          };
          update: {
            args: Prisma.DraftUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>;
          };
          deleteMany: {
            args: Prisma.DraftDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DraftUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.DraftUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPayload>;
          };
          aggregate: {
            args: Prisma.DraftAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDraft>;
          };
          groupBy: {
            args: Prisma.DraftGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DraftGroupByOutputType>[];
          };
          count: {
            args: Prisma.DraftCountArgs<ExtArgs>;
            result: $Utils.Optional<DraftCountAggregateOutputType> | number;
          };
        };
      };
      DraftPick: {
        payload: Prisma.$DraftPickPayload<ExtArgs>;
        fields: Prisma.DraftPickFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DraftPickFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DraftPickFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>;
          };
          findFirst: {
            args: Prisma.DraftPickFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DraftPickFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>;
          };
          findMany: {
            args: Prisma.DraftPickFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>[];
          };
          create: {
            args: Prisma.DraftPickCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>;
          };
          createMany: {
            args: Prisma.DraftPickCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DraftPickCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>[];
          };
          delete: {
            args: Prisma.DraftPickDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>;
          };
          update: {
            args: Prisma.DraftPickUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>;
          };
          deleteMany: {
            args: Prisma.DraftPickDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DraftPickUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.DraftPickUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DraftPickPayload>;
          };
          aggregate: {
            args: Prisma.DraftPickAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDraftPick>;
          };
          groupBy: {
            args: Prisma.DraftPickGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DraftPickGroupByOutputType>[];
          };
          count: {
            args: Prisma.DraftPickCountArgs<ExtArgs>;
            result: $Utils.Optional<DraftPickCountAggregateOutputType> | number;
          };
        };
      };
      Player: {
        payload: Prisma.$PlayerPayload<ExtArgs>;
        fields: Prisma.PlayerFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PlayerFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PlayerFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>;
          };
          findFirst: {
            args: Prisma.PlayerFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PlayerFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>;
          };
          findMany: {
            args: Prisma.PlayerFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>[];
          };
          create: {
            args: Prisma.PlayerCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>;
          };
          createMany: {
            args: Prisma.PlayerCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PlayerCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>[];
          };
          delete: {
            args: Prisma.PlayerDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>;
          };
          update: {
            args: Prisma.PlayerUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>;
          };
          deleteMany: {
            args: Prisma.PlayerDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PlayerUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.PlayerUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>;
          };
          aggregate: {
            args: Prisma.PlayerAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePlayer>;
          };
          groupBy: {
            args: Prisma.PlayerGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PlayerGroupByOutputType>[];
          };
          count: {
            args: Prisma.PlayerCountArgs<ExtArgs>;
            result: $Utils.Optional<PlayerCountAggregateOutputType> | number;
          };
        };
      };
      PlayerStats: {
        payload: Prisma.$PlayerStatsPayload<ExtArgs>;
        fields: Prisma.PlayerStatsFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PlayerStatsFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PlayerStatsFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>;
          };
          findFirst: {
            args: Prisma.PlayerStatsFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PlayerStatsFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>;
          };
          findMany: {
            args: Prisma.PlayerStatsFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>[];
          };
          create: {
            args: Prisma.PlayerStatsCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>;
          };
          createMany: {
            args: Prisma.PlayerStatsCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PlayerStatsCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>[];
          };
          delete: {
            args: Prisma.PlayerStatsDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>;
          };
          update: {
            args: Prisma.PlayerStatsUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>;
          };
          deleteMany: {
            args: Prisma.PlayerStatsDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PlayerStatsUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.PlayerStatsUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerStatsPayload>;
          };
          aggregate: {
            args: Prisma.PlayerStatsAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePlayerStats>;
          };
          groupBy: {
            args: Prisma.PlayerStatsGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PlayerStatsGroupByOutputType>[];
          };
          count: {
            args: Prisma.PlayerStatsCountArgs<ExtArgs>;
            result: $Utils.Optional<PlayerStatsCountAggregateOutputType> | number;
          };
        };
      };
      WeeklyMetrics: {
        payload: Prisma.$WeeklyMetricsPayload<ExtArgs>;
        fields: Prisma.WeeklyMetricsFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.WeeklyMetricsFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.WeeklyMetricsFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>;
          };
          findFirst: {
            args: Prisma.WeeklyMetricsFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.WeeklyMetricsFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>;
          };
          findMany: {
            args: Prisma.WeeklyMetricsFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>[];
          };
          create: {
            args: Prisma.WeeklyMetricsCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>;
          };
          createMany: {
            args: Prisma.WeeklyMetricsCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.WeeklyMetricsCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>[];
          };
          delete: {
            args: Prisma.WeeklyMetricsDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>;
          };
          update: {
            args: Prisma.WeeklyMetricsUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>;
          };
          deleteMany: {
            args: Prisma.WeeklyMetricsDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.WeeklyMetricsUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.WeeklyMetricsUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WeeklyMetricsPayload>;
          };
          aggregate: {
            args: Prisma.WeeklyMetricsAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateWeeklyMetrics>;
          };
          groupBy: {
            args: Prisma.WeeklyMetricsGroupByArgs<ExtArgs>;
            result: $Utils.Optional<WeeklyMetricsGroupByOutputType>[];
          };
          count: {
            args: Prisma.WeeklyMetricsCountArgs<ExtArgs>;
            result: $Utils.Optional<WeeklyMetricsCountAggregateOutputType> | number;
          };
        };
      };
      PositionVariance: {
        payload: Prisma.$PositionVariancePayload<ExtArgs>;
        fields: Prisma.PositionVarianceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PositionVarianceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PositionVarianceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>;
          };
          findFirst: {
            args: Prisma.PositionVarianceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PositionVarianceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>;
          };
          findMany: {
            args: Prisma.PositionVarianceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>[];
          };
          create: {
            args: Prisma.PositionVarianceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>;
          };
          createMany: {
            args: Prisma.PositionVarianceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PositionVarianceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>[];
          };
          delete: {
            args: Prisma.PositionVarianceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>;
          };
          update: {
            args: Prisma.PositionVarianceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>;
          };
          deleteMany: {
            args: Prisma.PositionVarianceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PositionVarianceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.PositionVarianceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PositionVariancePayload>;
          };
          aggregate: {
            args: Prisma.PositionVarianceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePositionVariance>;
          };
          groupBy: {
            args: Prisma.PositionVarianceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PositionVarianceGroupByOutputType>[];
          };
          count: {
            args: Prisma.PositionVarianceCountArgs<ExtArgs>;
            result: $Utils.Optional<PositionVarianceCountAggregateOutputType> | number;
          };
        };
      };
      PlayerVariance: {
        payload: Prisma.$PlayerVariancePayload<ExtArgs>;
        fields: Prisma.PlayerVarianceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PlayerVarianceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PlayerVarianceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>;
          };
          findFirst: {
            args: Prisma.PlayerVarianceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PlayerVarianceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>;
          };
          findMany: {
            args: Prisma.PlayerVarianceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>[];
          };
          create: {
            args: Prisma.PlayerVarianceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>;
          };
          createMany: {
            args: Prisma.PlayerVarianceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PlayerVarianceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>[];
          };
          delete: {
            args: Prisma.PlayerVarianceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>;
          };
          update: {
            args: Prisma.PlayerVarianceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>;
          };
          deleteMany: {
            args: Prisma.PlayerVarianceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PlayerVarianceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.PlayerVarianceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PlayerVariancePayload>;
          };
          aggregate: {
            args: Prisma.PlayerVarianceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePlayerVariance>;
          };
          groupBy: {
            args: Prisma.PlayerVarianceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PlayerVarianceGroupByOutputType>[];
          };
          count: {
            args: Prisma.PlayerVarianceCountArgs<ExtArgs>;
            result: $Utils.Optional<PlayerVarianceCountAggregateOutputType> | number;
          };
        };
      };
      ProjectionError: {
        payload: Prisma.$ProjectionErrorPayload<ExtArgs>;
        fields: Prisma.ProjectionErrorFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ProjectionErrorFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ProjectionErrorFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>;
          };
          findFirst: {
            args: Prisma.ProjectionErrorFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ProjectionErrorFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>;
          };
          findMany: {
            args: Prisma.ProjectionErrorFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>[];
          };
          create: {
            args: Prisma.ProjectionErrorCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>;
          };
          createMany: {
            args: Prisma.ProjectionErrorCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ProjectionErrorCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>[];
          };
          delete: {
            args: Prisma.ProjectionErrorDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>;
          };
          update: {
            args: Prisma.ProjectionErrorUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>;
          };
          deleteMany: {
            args: Prisma.ProjectionErrorDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ProjectionErrorUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          upsert: {
            args: Prisma.ProjectionErrorUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProjectionErrorPayload>;
          };
          aggregate: {
            args: Prisma.ProjectionErrorAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateProjectionError>;
          };
          groupBy: {
            args: Prisma.ProjectionErrorGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ProjectionErrorGroupByOutputType>[];
          };
          count: {
            args: Prisma.ProjectionErrorCountArgs<ExtArgs>;
            result: $Utils.Optional<ProjectionErrorCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition
    ? T['emit'] extends 'event'
      ? T['level']
      : never
    : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ? GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    leagues: number;
    rosters: number;
    transactions: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    leagues?: boolean | UserCountOutputTypeCountLeaguesArgs;
    rosters?: boolean | UserCountOutputTypeCountRostersArgs;
    transactions?: boolean | UserCountOutputTypeCountTransactionsArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLeaguesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: LeagueWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRostersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: RosterWhereInput;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * Count Type LeagueCountOutputType
   */

  export type LeagueCountOutputType = {
    users: number;
    rosters: number;
    matchups: number;
    transactions: number;
    tradedPicks: number;
    drafts: number;
    weeklyMetrics: number;
  };

  export type LeagueCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    users?: boolean | LeagueCountOutputTypeCountUsersArgs;
    rosters?: boolean | LeagueCountOutputTypeCountRostersArgs;
    matchups?: boolean | LeagueCountOutputTypeCountMatchupsArgs;
    transactions?: boolean | LeagueCountOutputTypeCountTransactionsArgs;
    tradedPicks?: boolean | LeagueCountOutputTypeCountTradedPicksArgs;
    drafts?: boolean | LeagueCountOutputTypeCountDraftsArgs;
    weeklyMetrics?: boolean | LeagueCountOutputTypeCountWeeklyMetricsArgs;
  };

  // Custom InputTypes
  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the LeagueCountOutputType
     */
    select?: LeagueCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountUsersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: UserWhereInput;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountRostersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: RosterWhereInput;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountMatchupsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: MatchupWhereInput;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountTradedPicksArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TradedPickWhereInput;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountDraftsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DraftWhereInput;
  };

  /**
   * LeagueCountOutputType without action
   */
  export type LeagueCountOutputTypeCountWeeklyMetricsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WeeklyMetricsWhereInput;
  };

  /**
   * Count Type RosterCountOutputType
   */

  export type RosterCountOutputType = {
    matchups: number;
    tradedPicks: number;
    weeklyMetrics: number;
  };

  export type RosterCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    matchups?: boolean | RosterCountOutputTypeCountMatchupsArgs;
    tradedPicks?: boolean | RosterCountOutputTypeCountTradedPicksArgs;
    weeklyMetrics?: boolean | RosterCountOutputTypeCountWeeklyMetricsArgs;
  };

  // Custom InputTypes
  /**
   * RosterCountOutputType without action
   */
  export type RosterCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RosterCountOutputType
     */
    select?: RosterCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * RosterCountOutputType without action
   */
  export type RosterCountOutputTypeCountMatchupsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: MatchupWhereInput;
  };

  /**
   * RosterCountOutputType without action
   */
  export type RosterCountOutputTypeCountTradedPicksArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TradedPickWhereInput;
  };

  /**
   * RosterCountOutputType without action
   */
  export type RosterCountOutputTypeCountWeeklyMetricsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WeeklyMetricsWhereInput;
  };

  /**
   * Count Type DraftCountOutputType
   */

  export type DraftCountOutputType = {
    picks: number;
  };

  export type DraftCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    picks?: boolean | DraftCountOutputTypeCountPicksArgs;
  };

  // Custom InputTypes
  /**
   * DraftCountOutputType without action
   */
  export type DraftCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftCountOutputType
     */
    select?: DraftCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * DraftCountOutputType without action
   */
  export type DraftCountOutputTypeCountPicksArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DraftPickWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserMinAggregateOutputType = {
    id: string | null;
    username: string | null;
    displayName: string | null;
    avatar: string | null;
    isBot: boolean | null;
  };

  export type UserMaxAggregateOutputType = {
    id: string | null;
    username: string | null;
    displayName: string | null;
    avatar: string | null;
    isBot: boolean | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    username: number;
    displayName: number;
    avatar: number;
    metadata: number;
    isBot: number;
    _all: number;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    username?: true;
    displayName?: true;
    avatar?: true;
    isBot?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    username?: true;
    displayName?: true;
    avatar?: true;
    isBot?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    username?: true;
    displayName?: true;
    avatar?: true;
    metadata?: true;
    isBot?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: UserWhereInput;
      orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[];
      by: UserScalarFieldEnum[] | UserScalarFieldEnum;
      having?: UserScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: UserCountAggregateInputType | true;
      _min?: UserMinAggregateInputType;
      _max?: UserMaxAggregateInputType;
    };

  export type UserGroupByOutputType = {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    metadata: JsonValue | null;
    isBot: boolean;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        username?: boolean;
        displayName?: boolean;
        avatar?: boolean;
        metadata?: boolean;
        isBot?: boolean;
        leagues?: boolean | User$leaguesArgs<ExtArgs>;
        rosters?: boolean | User$rostersArgs<ExtArgs>;
        transactions?: boolean | User$transactionsArgs<ExtArgs>;
        _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['user']
    >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      username?: boolean;
      displayName?: boolean;
      avatar?: boolean;
      metadata?: boolean;
      isBot?: boolean;
    },
    ExtArgs['result']['user']
  >;

  export type UserSelectScalar = {
    id?: boolean;
    username?: boolean;
    displayName?: boolean;
    avatar?: boolean;
    metadata?: boolean;
    isBot?: boolean;
  };

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    leagues?: boolean | User$leaguesArgs<ExtArgs>;
    rosters?: boolean | User$rostersArgs<ExtArgs>;
    transactions?: boolean | User$transactionsArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'User';
    objects: {
      leagues: Prisma.$LeaguePayload<ExtArgs>[];
      rosters: Prisma.$RosterPayload<ExtArgs>[];
      transactions: Prisma.$TransactionPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        username: string;
        displayName: string;
        avatar: string | null;
        metadata: Prisma.JsonValue | null;
        isBot: boolean;
      },
      ExtArgs['result']['user']
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<
    Prisma.$UserPayload,
    S
  >;

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    UserFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User']; meta: { name: 'User' } };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    leagues<T extends User$leaguesArgs<ExtArgs> = {}>(
      args?: Subset<T, User$leaguesArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findMany'> | Null
    >;
    rosters<T extends User$rostersArgs<ExtArgs> = {}>(
      args?: Subset<T, User$rostersArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    transactions<T extends User$transactionsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$transactionsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<'User', 'String'>;
    readonly username: FieldRef<'User', 'String'>;
    readonly displayName: FieldRef<'User', 'String'>;
    readonly avatar: FieldRef<'User', 'String'>;
    readonly metadata: FieldRef<'User', 'Json'>;
    readonly isBot: FieldRef<'User', 'Boolean'>;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      /**
       * Filter, which Users to fetch.
       */
      where?: UserWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of Users to fetch.
       */
      orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for listing Users.
       */
      cursor?: UserWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` Users from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` Users.
       */
      skip?: number;
      distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
  };

  /**
   * User.leagues
   */
  export type User$leaguesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the League
       */
      select?: LeagueSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: LeagueInclude<ExtArgs> | null;
      where?: LeagueWhereInput;
      orderBy?: LeagueOrderByWithRelationInput | LeagueOrderByWithRelationInput[];
      cursor?: LeagueWhereUniqueInput;
      take?: number;
      skip?: number;
      distinct?: LeagueScalarFieldEnum | LeagueScalarFieldEnum[];
    };

  /**
   * User.rosters
   */
  export type User$rostersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Roster
       */
      select?: RosterSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: RosterInclude<ExtArgs> | null;
      where?: RosterWhereInput;
      orderBy?: RosterOrderByWithRelationInput | RosterOrderByWithRelationInput[];
      cursor?: RosterWhereUniqueInput;
      take?: number;
      skip?: number;
      distinct?: RosterScalarFieldEnum | RosterScalarFieldEnum[];
    };

  /**
   * User.transactions
   */
  export type User$transactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
    };

  /**
   * Model League
   */

  export type AggregateLeague = {
    _count: LeagueCountAggregateOutputType | null;
    _avg: LeagueAvgAggregateOutputType | null;
    _sum: LeagueSumAggregateOutputType | null;
    _min: LeagueMinAggregateOutputType | null;
    _max: LeagueMaxAggregateOutputType | null;
  };

  export type LeagueAvgAggregateOutputType = {
    totalRosters: number | null;
  };

  export type LeagueSumAggregateOutputType = {
    totalRosters: number | null;
  };

  export type LeagueMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    season: string | null;
    seasonType: string | null;
    status: string | null;
    sport: string | null;
    totalRosters: number | null;
    previousLeagueId: string | null;
    draftId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type LeagueMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    season: string | null;
    seasonType: string | null;
    status: string | null;
    sport: string | null;
    totalRosters: number | null;
    previousLeagueId: string | null;
    draftId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type LeagueCountAggregateOutputType = {
    id: number;
    name: number;
    season: number;
    seasonType: number;
    status: number;
    sport: number;
    totalRosters: number;
    settings: number;
    scoringSettings: number;
    rosterPositions: number;
    metadata: number;
    previousLeagueId: number;
    draftId: number;
    playoffMatchups: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type LeagueAvgAggregateInputType = {
    totalRosters?: true;
  };

  export type LeagueSumAggregateInputType = {
    totalRosters?: true;
  };

  export type LeagueMinAggregateInputType = {
    id?: true;
    name?: true;
    season?: true;
    seasonType?: true;
    status?: true;
    sport?: true;
    totalRosters?: true;
    previousLeagueId?: true;
    draftId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type LeagueMaxAggregateInputType = {
    id?: true;
    name?: true;
    season?: true;
    seasonType?: true;
    status?: true;
    sport?: true;
    totalRosters?: true;
    previousLeagueId?: true;
    draftId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type LeagueCountAggregateInputType = {
    id?: true;
    name?: true;
    season?: true;
    seasonType?: true;
    status?: true;
    sport?: true;
    totalRosters?: true;
    settings?: true;
    scoringSettings?: true;
    rosterPositions?: true;
    metadata?: true;
    previousLeagueId?: true;
    draftId?: true;
    playoffMatchups?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type LeagueAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which League to aggregate.
     */
    where?: LeagueWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Leagues to fetch.
     */
    orderBy?: LeagueOrderByWithRelationInput | LeagueOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: LeagueWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Leagues from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Leagues.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Leagues
     **/
    _count?: true | LeagueCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: LeagueAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: LeagueSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: LeagueMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: LeagueMaxAggregateInputType;
  };

  export type GetLeagueAggregateType<T extends LeagueAggregateArgs> = {
    [P in keyof T & keyof AggregateLeague]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeague[P]>
      : GetScalarType<T[P], AggregateLeague[P]>;
  };

  export type LeagueGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: LeagueWhereInput;
    orderBy?: LeagueOrderByWithAggregationInput | LeagueOrderByWithAggregationInput[];
    by: LeagueScalarFieldEnum[] | LeagueScalarFieldEnum;
    having?: LeagueScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: LeagueCountAggregateInputType | true;
    _avg?: LeagueAvgAggregateInputType;
    _sum?: LeagueSumAggregateInputType;
    _min?: LeagueMinAggregateInputType;
    _max?: LeagueMaxAggregateInputType;
  };

  export type LeagueGroupByOutputType = {
    id: string;
    name: string;
    season: string;
    seasonType: string;
    status: string;
    sport: string;
    totalRosters: number;
    settings: JsonValue | null;
    scoringSettings: JsonValue | null;
    rosterPositions: string[];
    metadata: JsonValue | null;
    previousLeagueId: string | null;
    draftId: string | null;
    playoffMatchups: JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    _count: LeagueCountAggregateOutputType | null;
    _avg: LeagueAvgAggregateOutputType | null;
    _sum: LeagueSumAggregateOutputType | null;
    _min: LeagueMinAggregateOutputType | null;
    _max: LeagueMaxAggregateOutputType | null;
  };

  type GetLeagueGroupByPayload<T extends LeagueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeagueGroupByOutputType, T['by']> & {
        [P in keyof T & keyof LeagueGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], LeagueGroupByOutputType[P]>
          : GetScalarType<T[P], LeagueGroupByOutputType[P]>;
      }
    >
  >;

  export type LeagueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        name?: boolean;
        season?: boolean;
        seasonType?: boolean;
        status?: boolean;
        sport?: boolean;
        totalRosters?: boolean;
        settings?: boolean;
        scoringSettings?: boolean;
        rosterPositions?: boolean;
        metadata?: boolean;
        previousLeagueId?: boolean;
        draftId?: boolean;
        playoffMatchups?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        users?: boolean | League$usersArgs<ExtArgs>;
        rosters?: boolean | League$rostersArgs<ExtArgs>;
        matchups?: boolean | League$matchupsArgs<ExtArgs>;
        transactions?: boolean | League$transactionsArgs<ExtArgs>;
        tradedPicks?: boolean | League$tradedPicksArgs<ExtArgs>;
        drafts?: boolean | League$draftsArgs<ExtArgs>;
        weeklyMetrics?: boolean | League$weeklyMetricsArgs<ExtArgs>;
        _count?: boolean | LeagueCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['league']
    >;

  export type LeagueSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      season?: boolean;
      seasonType?: boolean;
      status?: boolean;
      sport?: boolean;
      totalRosters?: boolean;
      settings?: boolean;
      scoringSettings?: boolean;
      rosterPositions?: boolean;
      metadata?: boolean;
      previousLeagueId?: boolean;
      draftId?: boolean;
      playoffMatchups?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['league']
  >;

  export type LeagueSelectScalar = {
    id?: boolean;
    name?: boolean;
    season?: boolean;
    seasonType?: boolean;
    status?: boolean;
    sport?: boolean;
    totalRosters?: boolean;
    settings?: boolean;
    scoringSettings?: boolean;
    rosterPositions?: boolean;
    metadata?: boolean;
    previousLeagueId?: boolean;
    draftId?: boolean;
    playoffMatchups?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type LeagueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | League$usersArgs<ExtArgs>;
    rosters?: boolean | League$rostersArgs<ExtArgs>;
    matchups?: boolean | League$matchupsArgs<ExtArgs>;
    transactions?: boolean | League$transactionsArgs<ExtArgs>;
    tradedPicks?: boolean | League$tradedPicksArgs<ExtArgs>;
    drafts?: boolean | League$draftsArgs<ExtArgs>;
    weeklyMetrics?: boolean | League$weeklyMetricsArgs<ExtArgs>;
    _count?: boolean | LeagueCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type LeagueIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $LeaguePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'League';
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[];
      rosters: Prisma.$RosterPayload<ExtArgs>[];
      matchups: Prisma.$MatchupPayload<ExtArgs>[];
      transactions: Prisma.$TransactionPayload<ExtArgs>[];
      tradedPicks: Prisma.$TradedPickPayload<ExtArgs>[];
      drafts: Prisma.$DraftPayload<ExtArgs>[];
      weeklyMetrics: Prisma.$WeeklyMetricsPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        season: string;
        seasonType: string;
        status: string;
        sport: string;
        totalRosters: number;
        settings: Prisma.JsonValue | null;
        scoringSettings: Prisma.JsonValue | null;
        rosterPositions: string[];
        metadata: Prisma.JsonValue | null;
        previousLeagueId: string | null;
        draftId: string | null;
        playoffMatchups: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['league']
    >;
    composites: {};
  };

  type LeagueGetPayload<S extends boolean | null | undefined | LeagueDefaultArgs> =
    $Result.GetResult<Prisma.$LeaguePayload, S>;

  type LeagueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    LeagueFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: LeagueCountAggregateInputType | true;
  };

  export interface LeagueDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['League']; meta: { name: 'League' } };
    /**
     * Find zero or one League that matches the filter.
     * @param {LeagueFindUniqueArgs} args - Arguments to find a League
     * @example
     * // Get one League
     * const league = await prisma.league.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeagueFindUniqueArgs>(
      args: SelectSubset<T, LeagueFindUniqueArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one League that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeagueFindUniqueOrThrowArgs} args - Arguments to find a League
     * @example
     * // Get one League
     * const league = await prisma.league.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeagueFindUniqueOrThrowArgs>(
      args: SelectSubset<T, LeagueFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first League that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueFindFirstArgs} args - Arguments to find a League
     * @example
     * // Get one League
     * const league = await prisma.league.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeagueFindFirstArgs>(
      args?: SelectSubset<T, LeagueFindFirstArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first League that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueFindFirstOrThrowArgs} args - Arguments to find a League
     * @example
     * // Get one League
     * const league = await prisma.league.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeagueFindFirstOrThrowArgs>(
      args?: SelectSubset<T, LeagueFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Leagues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leagues
     * const leagues = await prisma.league.findMany()
     *
     * // Get first 10 Leagues
     * const leagues = await prisma.league.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const leagueWithIdOnly = await prisma.league.findMany({ select: { id: true } })
     *
     */
    findMany<T extends LeagueFindManyArgs>(
      args?: SelectSubset<T, LeagueFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a League.
     * @param {LeagueCreateArgs} args - Arguments to create a League.
     * @example
     * // Create one League
     * const League = await prisma.league.create({
     *   data: {
     *     // ... data to create a League
     *   }
     * })
     *
     */
    create<T extends LeagueCreateArgs>(
      args: SelectSubset<T, LeagueCreateArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Leagues.
     * @param {LeagueCreateManyArgs} args - Arguments to create many Leagues.
     * @example
     * // Create many Leagues
     * const league = await prisma.league.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends LeagueCreateManyArgs>(
      args?: SelectSubset<T, LeagueCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Leagues and returns the data saved in the database.
     * @param {LeagueCreateManyAndReturnArgs} args - Arguments to create many Leagues.
     * @example
     * // Create many Leagues
     * const league = await prisma.league.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Leagues and only return the `id`
     * const leagueWithIdOnly = await prisma.league.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends LeagueCreateManyAndReturnArgs>(
      args?: SelectSubset<T, LeagueCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a League.
     * @param {LeagueDeleteArgs} args - Arguments to delete one League.
     * @example
     * // Delete one League
     * const League = await prisma.league.delete({
     *   where: {
     *     // ... filter to delete one League
     *   }
     * })
     *
     */
    delete<T extends LeagueDeleteArgs>(
      args: SelectSubset<T, LeagueDeleteArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one League.
     * @param {LeagueUpdateArgs} args - Arguments to update one League.
     * @example
     * // Update one League
     * const league = await prisma.league.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends LeagueUpdateArgs>(
      args: SelectSubset<T, LeagueUpdateArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Leagues.
     * @param {LeagueDeleteManyArgs} args - Arguments to filter Leagues to delete.
     * @example
     * // Delete a few Leagues
     * const { count } = await prisma.league.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends LeagueDeleteManyArgs>(
      args?: SelectSubset<T, LeagueDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Leagues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leagues
     * const league = await prisma.league.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends LeagueUpdateManyArgs>(
      args: SelectSubset<T, LeagueUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one League.
     * @param {LeagueUpsertArgs} args - Arguments to update or create a League.
     * @example
     * // Update or create a League
     * const league = await prisma.league.upsert({
     *   create: {
     *     // ... data to create a League
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the League we want to update
     *   }
     * })
     */
    upsert<T extends LeagueUpsertArgs>(
      args: SelectSubset<T, LeagueUpsertArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Leagues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueCountArgs} args - Arguments to filter Leagues to count.
     * @example
     * // Count the number of Leagues
     * const count = await prisma.league.count({
     *   where: {
     *     // ... the filter for the Leagues we want to count
     *   }
     * })
     **/
    count<T extends LeagueCountArgs>(
      args?: Subset<T, LeagueCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeagueCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a League.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends LeagueAggregateArgs>(
      args: Subset<T, LeagueAggregateArgs>
    ): Prisma.PrismaPromise<GetLeagueAggregateType<T>>;

    /**
     * Group by League.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends LeagueGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeagueGroupByArgs['orderBy'] }
        : { orderBy?: LeagueGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, LeagueGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetLeagueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the League model
     */
    readonly fields: LeagueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for League.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeagueClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    users<T extends League$usersArgs<ExtArgs> = {}>(
      args?: Subset<T, League$usersArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany'> | Null>;
    rosters<T extends League$rostersArgs<ExtArgs> = {}>(
      args?: Subset<T, League$rostersArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    matchups<T extends League$matchupsArgs<ExtArgs> = {}>(
      args?: Subset<T, League$matchupsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    transactions<T extends League$transactionsArgs<ExtArgs> = {}>(
      args?: Subset<T, League$transactionsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    tradedPicks<T extends League$tradedPicksArgs<ExtArgs> = {}>(
      args?: Subset<T, League$tradedPicksArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    drafts<T extends League$draftsArgs<ExtArgs> = {}>(
      args?: Subset<T, League$draftsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findMany'> | Null>;
    weeklyMetrics<T extends League$weeklyMetricsArgs<ExtArgs> = {}>(
      args?: Subset<T, League$weeklyMetricsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the League model
   */
  interface LeagueFieldRefs {
    readonly id: FieldRef<'League', 'String'>;
    readonly name: FieldRef<'League', 'String'>;
    readonly season: FieldRef<'League', 'String'>;
    readonly seasonType: FieldRef<'League', 'String'>;
    readonly status: FieldRef<'League', 'String'>;
    readonly sport: FieldRef<'League', 'String'>;
    readonly totalRosters: FieldRef<'League', 'Int'>;
    readonly settings: FieldRef<'League', 'Json'>;
    readonly scoringSettings: FieldRef<'League', 'Json'>;
    readonly rosterPositions: FieldRef<'League', 'String[]'>;
    readonly metadata: FieldRef<'League', 'Json'>;
    readonly previousLeagueId: FieldRef<'League', 'String'>;
    readonly draftId: FieldRef<'League', 'String'>;
    readonly playoffMatchups: FieldRef<'League', 'Json'>;
    readonly createdAt: FieldRef<'League', 'DateTime'>;
    readonly updatedAt: FieldRef<'League', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * League findUnique
   */
  export type LeagueFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeagueInclude<ExtArgs> | null;
    /**
     * Filter, which League to fetch.
     */
    where: LeagueWhereUniqueInput;
  };

  /**
   * League findUniqueOrThrow
   */
  export type LeagueFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeagueInclude<ExtArgs> | null;
    /**
     * Filter, which League to fetch.
     */
    where: LeagueWhereUniqueInput;
  };

  /**
   * League findFirst
   */
  export type LeagueFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeagueInclude<ExtArgs> | null;
    /**
     * Filter, which League to fetch.
     */
    where?: LeagueWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Leagues to fetch.
     */
    orderBy?: LeagueOrderByWithRelationInput | LeagueOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Leagues.
     */
    cursor?: LeagueWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Leagues from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Leagues.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Leagues.
     */
    distinct?: LeagueScalarFieldEnum | LeagueScalarFieldEnum[];
  };

  /**
   * League findFirstOrThrow
   */
  export type LeagueFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeagueInclude<ExtArgs> | null;
    /**
     * Filter, which League to fetch.
     */
    where?: LeagueWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Leagues to fetch.
     */
    orderBy?: LeagueOrderByWithRelationInput | LeagueOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Leagues.
     */
    cursor?: LeagueWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Leagues from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Leagues.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Leagues.
     */
    distinct?: LeagueScalarFieldEnum | LeagueScalarFieldEnum[];
  };

  /**
   * League findMany
   */
  export type LeagueFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeagueInclude<ExtArgs> | null;
    /**
     * Filter, which Leagues to fetch.
     */
    where?: LeagueWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Leagues to fetch.
     */
    orderBy?: LeagueOrderByWithRelationInput | LeagueOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Leagues.
     */
    cursor?: LeagueWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Leagues from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Leagues.
     */
    skip?: number;
    distinct?: LeagueScalarFieldEnum | LeagueScalarFieldEnum[];
  };

  /**
   * League create
   */
  export type LeagueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the League
       */
      select?: LeagueSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: LeagueInclude<ExtArgs> | null;
      /**
       * The data needed to create a League.
       */
      data: XOR<LeagueCreateInput, LeagueUncheckedCreateInput>;
    };

  /**
   * League createMany
   */
  export type LeagueCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Leagues.
     */
    data: LeagueCreateManyInput | LeagueCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * League createManyAndReturn
   */
  export type LeagueCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Leagues.
     */
    data: LeagueCreateManyInput | LeagueCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * League update
   */
  export type LeagueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the League
       */
      select?: LeagueSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: LeagueInclude<ExtArgs> | null;
      /**
       * The data needed to update a League.
       */
      data: XOR<LeagueUpdateInput, LeagueUncheckedUpdateInput>;
      /**
       * Choose, which League to update.
       */
      where: LeagueWhereUniqueInput;
    };

  /**
   * League updateMany
   */
  export type LeagueUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Leagues.
     */
    data: XOR<LeagueUpdateManyMutationInput, LeagueUncheckedUpdateManyInput>;
    /**
     * Filter which Leagues to update
     */
    where?: LeagueWhereInput;
  };

  /**
   * League upsert
   */
  export type LeagueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the League
       */
      select?: LeagueSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: LeagueInclude<ExtArgs> | null;
      /**
       * The filter to search for the League to update in case it exists.
       */
      where: LeagueWhereUniqueInput;
      /**
       * In case the League found by the `where` argument doesn't exist, create a new League with this data.
       */
      create: XOR<LeagueCreateInput, LeagueUncheckedCreateInput>;
      /**
       * In case the League was found with the provided `where` argument, update it with this data.
       */
      update: XOR<LeagueUpdateInput, LeagueUncheckedUpdateInput>;
    };

  /**
   * League delete
   */
  export type LeagueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the League
       */
      select?: LeagueSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: LeagueInclude<ExtArgs> | null;
      /**
       * Filter which League to delete.
       */
      where: LeagueWhereUniqueInput;
    };

  /**
   * League deleteMany
   */
  export type LeagueDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Leagues to delete
     */
    where?: LeagueWhereInput;
  };

  /**
   * League.users
   */
  export type League$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      where?: UserWhereInput;
      orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
      cursor?: UserWhereUniqueInput;
      take?: number;
      skip?: number;
      distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

  /**
   * League.rosters
   */
  export type League$rostersArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
    where?: RosterWhereInput;
    orderBy?: RosterOrderByWithRelationInput | RosterOrderByWithRelationInput[];
    cursor?: RosterWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: RosterScalarFieldEnum | RosterScalarFieldEnum[];
  };

  /**
   * League.matchups
   */
  export type League$matchupsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    where?: MatchupWhereInput;
    orderBy?: MatchupOrderByWithRelationInput | MatchupOrderByWithRelationInput[];
    cursor?: MatchupWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: MatchupScalarFieldEnum | MatchupScalarFieldEnum[];
  };

  /**
   * League.transactions
   */
  export type League$transactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * League.tradedPicks
   */
  export type League$tradedPicksArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    where?: TradedPickWhereInput;
    orderBy?: TradedPickOrderByWithRelationInput | TradedPickOrderByWithRelationInput[];
    cursor?: TradedPickWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TradedPickScalarFieldEnum | TradedPickScalarFieldEnum[];
  };

  /**
   * League.drafts
   */
  export type League$draftsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null;
    where?: DraftWhereInput;
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[];
    cursor?: DraftWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[];
  };

  /**
   * League.weeklyMetrics
   */
  export type League$weeklyMetricsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    where?: WeeklyMetricsWhereInput;
    orderBy?: WeeklyMetricsOrderByWithRelationInput | WeeklyMetricsOrderByWithRelationInput[];
    cursor?: WeeklyMetricsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: WeeklyMetricsScalarFieldEnum | WeeklyMetricsScalarFieldEnum[];
  };

  /**
   * League without action
   */
  export type LeagueDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the League
     */
    select?: LeagueSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeagueInclude<ExtArgs> | null;
  };

  /**
   * Model Roster
   */

  export type AggregateRoster = {
    _count: RosterCountAggregateOutputType | null;
    _avg: RosterAvgAggregateOutputType | null;
    _sum: RosterSumAggregateOutputType | null;
    _min: RosterMinAggregateOutputType | null;
    _max: RosterMaxAggregateOutputType | null;
  };

  export type RosterAvgAggregateOutputType = {
    id: number | null;
    waiverBudget: number | null;
    waiverPosition: number | null;
  };

  export type RosterSumAggregateOutputType = {
    id: number | null;
    waiverBudget: number | null;
    waiverPosition: number | null;
  };

  export type RosterMinAggregateOutputType = {
    id: number | null;
    leagueId: string | null;
    ownerId: string | null;
    waiverBudget: number | null;
    waiverPosition: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type RosterMaxAggregateOutputType = {
    id: number | null;
    leagueId: string | null;
    ownerId: string | null;
    waiverBudget: number | null;
    waiverPosition: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type RosterCountAggregateOutputType = {
    id: number;
    leagueId: number;
    ownerId: number;
    coOwners: number;
    players: number;
    starters: number;
    reserve: number;
    settings: number;
    metadata: number;
    waiverBudget: number;
    waiverPosition: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type RosterAvgAggregateInputType = {
    id?: true;
    waiverBudget?: true;
    waiverPosition?: true;
  };

  export type RosterSumAggregateInputType = {
    id?: true;
    waiverBudget?: true;
    waiverPosition?: true;
  };

  export type RosterMinAggregateInputType = {
    id?: true;
    leagueId?: true;
    ownerId?: true;
    waiverBudget?: true;
    waiverPosition?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type RosterMaxAggregateInputType = {
    id?: true;
    leagueId?: true;
    ownerId?: true;
    waiverBudget?: true;
    waiverPosition?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type RosterCountAggregateInputType = {
    id?: true;
    leagueId?: true;
    ownerId?: true;
    coOwners?: true;
    players?: true;
    starters?: true;
    reserve?: true;
    settings?: true;
    metadata?: true;
    waiverBudget?: true;
    waiverPosition?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type RosterAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Roster to aggregate.
     */
    where?: RosterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rosters to fetch.
     */
    orderBy?: RosterOrderByWithRelationInput | RosterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: RosterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rosters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rosters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Rosters
     **/
    _count?: true | RosterCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: RosterAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: RosterSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: RosterMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: RosterMaxAggregateInputType;
  };

  export type GetRosterAggregateType<T extends RosterAggregateArgs> = {
    [P in keyof T & keyof AggregateRoster]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoster[P]>
      : GetScalarType<T[P], AggregateRoster[P]>;
  };

  export type RosterGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: RosterWhereInput;
    orderBy?: RosterOrderByWithAggregationInput | RosterOrderByWithAggregationInput[];
    by: RosterScalarFieldEnum[] | RosterScalarFieldEnum;
    having?: RosterScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RosterCountAggregateInputType | true;
    _avg?: RosterAvgAggregateInputType;
    _sum?: RosterSumAggregateInputType;
    _min?: RosterMinAggregateInputType;
    _max?: RosterMaxAggregateInputType;
  };

  export type RosterGroupByOutputType = {
    id: number;
    leagueId: string;
    ownerId: string | null;
    coOwners: string[];
    players: string[];
    starters: string[];
    reserve: string[];
    settings: JsonValue | null;
    metadata: JsonValue | null;
    waiverBudget: number;
    waiverPosition: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: RosterCountAggregateOutputType | null;
    _avg: RosterAvgAggregateOutputType | null;
    _sum: RosterSumAggregateOutputType | null;
    _min: RosterMinAggregateOutputType | null;
    _max: RosterMaxAggregateOutputType | null;
  };

  type GetRosterGroupByPayload<T extends RosterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RosterGroupByOutputType, T['by']> & {
        [P in keyof T & keyof RosterGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], RosterGroupByOutputType[P]>
          : GetScalarType<T[P], RosterGroupByOutputType[P]>;
      }
    >
  >;

  export type RosterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        leagueId?: boolean;
        ownerId?: boolean;
        coOwners?: boolean;
        players?: boolean;
        starters?: boolean;
        reserve?: boolean;
        settings?: boolean;
        metadata?: boolean;
        waiverBudget?: boolean;
        waiverPosition?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        league?: boolean | LeagueDefaultArgs<ExtArgs>;
        owner?: boolean | Roster$ownerArgs<ExtArgs>;
        matchups?: boolean | Roster$matchupsArgs<ExtArgs>;
        tradedPicks?: boolean | Roster$tradedPicksArgs<ExtArgs>;
        weeklyMetrics?: boolean | Roster$weeklyMetricsArgs<ExtArgs>;
        _count?: boolean | RosterCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['roster']
    >;

  export type RosterSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      ownerId?: boolean;
      coOwners?: boolean;
      players?: boolean;
      starters?: boolean;
      reserve?: boolean;
      settings?: boolean;
      metadata?: boolean;
      waiverBudget?: boolean;
      waiverPosition?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      owner?: boolean | Roster$ownerArgs<ExtArgs>;
    },
    ExtArgs['result']['roster']
  >;

  export type RosterSelectScalar = {
    id?: boolean;
    leagueId?: boolean;
    ownerId?: boolean;
    coOwners?: boolean;
    players?: boolean;
    starters?: boolean;
    reserve?: boolean;
    settings?: boolean;
    metadata?: boolean;
    waiverBudget?: boolean;
    waiverPosition?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type RosterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    owner?: boolean | Roster$ownerArgs<ExtArgs>;
    matchups?: boolean | Roster$matchupsArgs<ExtArgs>;
    tradedPicks?: boolean | Roster$tradedPicksArgs<ExtArgs>;
    weeklyMetrics?: boolean | Roster$weeklyMetricsArgs<ExtArgs>;
    _count?: boolean | RosterCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type RosterIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    owner?: boolean | Roster$ownerArgs<ExtArgs>;
  };

  export type $RosterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'Roster';
    objects: {
      league: Prisma.$LeaguePayload<ExtArgs>;
      owner: Prisma.$UserPayload<ExtArgs> | null;
      matchups: Prisma.$MatchupPayload<ExtArgs>[];
      tradedPicks: Prisma.$TradedPickPayload<ExtArgs>[];
      weeklyMetrics: Prisma.$WeeklyMetricsPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        leagueId: string;
        ownerId: string | null;
        coOwners: string[];
        players: string[];
        starters: string[];
        reserve: string[];
        settings: Prisma.JsonValue | null;
        metadata: Prisma.JsonValue | null;
        waiverBudget: number;
        waiverPosition: number | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['roster']
    >;
    composites: {};
  };

  type RosterGetPayload<S extends boolean | null | undefined | RosterDefaultArgs> =
    $Result.GetResult<Prisma.$RosterPayload, S>;

  type RosterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    RosterFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: RosterCountAggregateInputType | true;
  };

  export interface RosterDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Roster']; meta: { name: 'Roster' } };
    /**
     * Find zero or one Roster that matches the filter.
     * @param {RosterFindUniqueArgs} args - Arguments to find a Roster
     * @example
     * // Get one Roster
     * const roster = await prisma.roster.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RosterFindUniqueArgs>(
      args: SelectSubset<T, RosterFindUniqueArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Roster that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RosterFindUniqueOrThrowArgs} args - Arguments to find a Roster
     * @example
     * // Get one Roster
     * const roster = await prisma.roster.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RosterFindUniqueOrThrowArgs>(
      args: SelectSubset<T, RosterFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Roster that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterFindFirstArgs} args - Arguments to find a Roster
     * @example
     * // Get one Roster
     * const roster = await prisma.roster.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RosterFindFirstArgs>(
      args?: SelectSubset<T, RosterFindFirstArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Roster that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterFindFirstOrThrowArgs} args - Arguments to find a Roster
     * @example
     * // Get one Roster
     * const roster = await prisma.roster.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RosterFindFirstOrThrowArgs>(
      args?: SelectSubset<T, RosterFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Rosters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rosters
     * const rosters = await prisma.roster.findMany()
     *
     * // Get first 10 Rosters
     * const rosters = await prisma.roster.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const rosterWithIdOnly = await prisma.roster.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RosterFindManyArgs>(
      args?: SelectSubset<T, RosterFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Roster.
     * @param {RosterCreateArgs} args - Arguments to create a Roster.
     * @example
     * // Create one Roster
     * const Roster = await prisma.roster.create({
     *   data: {
     *     // ... data to create a Roster
     *   }
     * })
     *
     */
    create<T extends RosterCreateArgs>(
      args: SelectSubset<T, RosterCreateArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Rosters.
     * @param {RosterCreateManyArgs} args - Arguments to create many Rosters.
     * @example
     * // Create many Rosters
     * const roster = await prisma.roster.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RosterCreateManyArgs>(
      args?: SelectSubset<T, RosterCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Rosters and returns the data saved in the database.
     * @param {RosterCreateManyAndReturnArgs} args - Arguments to create many Rosters.
     * @example
     * // Create many Rosters
     * const roster = await prisma.roster.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Rosters and only return the `id`
     * const rosterWithIdOnly = await prisma.roster.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RosterCreateManyAndReturnArgs>(
      args?: SelectSubset<T, RosterCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Roster.
     * @param {RosterDeleteArgs} args - Arguments to delete one Roster.
     * @example
     * // Delete one Roster
     * const Roster = await prisma.roster.delete({
     *   where: {
     *     // ... filter to delete one Roster
     *   }
     * })
     *
     */
    delete<T extends RosterDeleteArgs>(
      args: SelectSubset<T, RosterDeleteArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Roster.
     * @param {RosterUpdateArgs} args - Arguments to update one Roster.
     * @example
     * // Update one Roster
     * const roster = await prisma.roster.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RosterUpdateArgs>(
      args: SelectSubset<T, RosterUpdateArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Rosters.
     * @param {RosterDeleteManyArgs} args - Arguments to filter Rosters to delete.
     * @example
     * // Delete a few Rosters
     * const { count } = await prisma.roster.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RosterDeleteManyArgs>(
      args?: SelectSubset<T, RosterDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Rosters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rosters
     * const roster = await prisma.roster.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RosterUpdateManyArgs>(
      args: SelectSubset<T, RosterUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Roster.
     * @param {RosterUpsertArgs} args - Arguments to update or create a Roster.
     * @example
     * // Update or create a Roster
     * const roster = await prisma.roster.upsert({
     *   create: {
     *     // ... data to create a Roster
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Roster we want to update
     *   }
     * })
     */
    upsert<T extends RosterUpsertArgs>(
      args: SelectSubset<T, RosterUpsertArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Rosters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterCountArgs} args - Arguments to filter Rosters to count.
     * @example
     * // Count the number of Rosters
     * const count = await prisma.roster.count({
     *   where: {
     *     // ... the filter for the Rosters we want to count
     *   }
     * })
     **/
    count<T extends RosterCountArgs>(
      args?: Subset<T, RosterCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RosterCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Roster.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends RosterAggregateArgs>(
      args: Subset<T, RosterAggregateArgs>
    ): Prisma.PrismaPromise<GetRosterAggregateType<T>>;

    /**
     * Group by Roster.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RosterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends RosterGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RosterGroupByArgs['orderBy'] }
        : { orderBy?: RosterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, RosterGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetRosterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Roster model
     */
    readonly fields: RosterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Roster.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RosterClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    league<T extends LeagueDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, LeagueDefaultArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    owner<T extends Roster$ownerArgs<ExtArgs> = {}>(
      args?: Subset<T, Roster$ownerArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow'> | null,
      null,
      ExtArgs
    >;
    matchups<T extends Roster$matchupsArgs<ExtArgs> = {}>(
      args?: Subset<T, Roster$matchupsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    tradedPicks<T extends Roster$tradedPicksArgs<ExtArgs> = {}>(
      args?: Subset<T, Roster$tradedPicksArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    weeklyMetrics<T extends Roster$weeklyMetricsArgs<ExtArgs> = {}>(
      args?: Subset<T, Roster$weeklyMetricsArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Roster model
   */
  interface RosterFieldRefs {
    readonly id: FieldRef<'Roster', 'Int'>;
    readonly leagueId: FieldRef<'Roster', 'String'>;
    readonly ownerId: FieldRef<'Roster', 'String'>;
    readonly coOwners: FieldRef<'Roster', 'String[]'>;
    readonly players: FieldRef<'Roster', 'String[]'>;
    readonly starters: FieldRef<'Roster', 'String[]'>;
    readonly reserve: FieldRef<'Roster', 'String[]'>;
    readonly settings: FieldRef<'Roster', 'Json'>;
    readonly metadata: FieldRef<'Roster', 'Json'>;
    readonly waiverBudget: FieldRef<'Roster', 'Int'>;
    readonly waiverPosition: FieldRef<'Roster', 'Int'>;
    readonly createdAt: FieldRef<'Roster', 'DateTime'>;
    readonly updatedAt: FieldRef<'Roster', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Roster findUnique
   */
  export type RosterFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
    /**
     * Filter, which Roster to fetch.
     */
    where: RosterWhereUniqueInput;
  };

  /**
   * Roster findUniqueOrThrow
   */
  export type RosterFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
    /**
     * Filter, which Roster to fetch.
     */
    where: RosterWhereUniqueInput;
  };

  /**
   * Roster findFirst
   */
  export type RosterFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
    /**
     * Filter, which Roster to fetch.
     */
    where?: RosterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rosters to fetch.
     */
    orderBy?: RosterOrderByWithRelationInput | RosterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Rosters.
     */
    cursor?: RosterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rosters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rosters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Rosters.
     */
    distinct?: RosterScalarFieldEnum | RosterScalarFieldEnum[];
  };

  /**
   * Roster findFirstOrThrow
   */
  export type RosterFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
    /**
     * Filter, which Roster to fetch.
     */
    where?: RosterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rosters to fetch.
     */
    orderBy?: RosterOrderByWithRelationInput | RosterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Rosters.
     */
    cursor?: RosterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rosters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rosters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Rosters.
     */
    distinct?: RosterScalarFieldEnum | RosterScalarFieldEnum[];
  };

  /**
   * Roster findMany
   */
  export type RosterFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
    /**
     * Filter, which Rosters to fetch.
     */
    where?: RosterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Rosters to fetch.
     */
    orderBy?: RosterOrderByWithRelationInput | RosterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Rosters.
     */
    cursor?: RosterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Rosters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Rosters.
     */
    skip?: number;
    distinct?: RosterScalarFieldEnum | RosterScalarFieldEnum[];
  };

  /**
   * Roster create
   */
  export type RosterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Roster
       */
      select?: RosterSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: RosterInclude<ExtArgs> | null;
      /**
       * The data needed to create a Roster.
       */
      data: XOR<RosterCreateInput, RosterUncheckedCreateInput>;
    };

  /**
   * Roster createMany
   */
  export type RosterCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Rosters.
     */
    data: RosterCreateManyInput | RosterCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Roster createManyAndReturn
   */
  export type RosterCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Rosters.
     */
    data: RosterCreateManyInput | RosterCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Roster update
   */
  export type RosterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Roster
       */
      select?: RosterSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: RosterInclude<ExtArgs> | null;
      /**
       * The data needed to update a Roster.
       */
      data: XOR<RosterUpdateInput, RosterUncheckedUpdateInput>;
      /**
       * Choose, which Roster to update.
       */
      where: RosterWhereUniqueInput;
    };

  /**
   * Roster updateMany
   */
  export type RosterUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Rosters.
     */
    data: XOR<RosterUpdateManyMutationInput, RosterUncheckedUpdateManyInput>;
    /**
     * Filter which Rosters to update
     */
    where?: RosterWhereInput;
  };

  /**
   * Roster upsert
   */
  export type RosterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Roster
       */
      select?: RosterSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: RosterInclude<ExtArgs> | null;
      /**
       * The filter to search for the Roster to update in case it exists.
       */
      where: RosterWhereUniqueInput;
      /**
       * In case the Roster found by the `where` argument doesn't exist, create a new Roster with this data.
       */
      create: XOR<RosterCreateInput, RosterUncheckedCreateInput>;
      /**
       * In case the Roster was found with the provided `where` argument, update it with this data.
       */
      update: XOR<RosterUpdateInput, RosterUncheckedUpdateInput>;
    };

  /**
   * Roster delete
   */
  export type RosterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Roster
       */
      select?: RosterSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: RosterInclude<ExtArgs> | null;
      /**
       * Filter which Roster to delete.
       */
      where: RosterWhereUniqueInput;
    };

  /**
   * Roster deleteMany
   */
  export type RosterDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Rosters to delete
     */
    where?: RosterWhereInput;
  };

  /**
   * Roster.owner
   */
  export type Roster$ownerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      where?: UserWhereInput;
    };

  /**
   * Roster.matchups
   */
  export type Roster$matchupsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    where?: MatchupWhereInput;
    orderBy?: MatchupOrderByWithRelationInput | MatchupOrderByWithRelationInput[];
    cursor?: MatchupWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: MatchupScalarFieldEnum | MatchupScalarFieldEnum[];
  };

  /**
   * Roster.tradedPicks
   */
  export type Roster$tradedPicksArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    where?: TradedPickWhereInput;
    orderBy?: TradedPickOrderByWithRelationInput | TradedPickOrderByWithRelationInput[];
    cursor?: TradedPickWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TradedPickScalarFieldEnum | TradedPickScalarFieldEnum[];
  };

  /**
   * Roster.weeklyMetrics
   */
  export type Roster$weeklyMetricsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    where?: WeeklyMetricsWhereInput;
    orderBy?: WeeklyMetricsOrderByWithRelationInput | WeeklyMetricsOrderByWithRelationInput[];
    cursor?: WeeklyMetricsWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: WeeklyMetricsScalarFieldEnum | WeeklyMetricsScalarFieldEnum[];
  };

  /**
   * Roster without action
   */
  export type RosterDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Roster
     */
    select?: RosterSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RosterInclude<ExtArgs> | null;
  };

  /**
   * Model Matchup
   */

  export type AggregateMatchup = {
    _count: MatchupCountAggregateOutputType | null;
    _avg: MatchupAvgAggregateOutputType | null;
    _sum: MatchupSumAggregateOutputType | null;
    _min: MatchupMinAggregateOutputType | null;
    _max: MatchupMaxAggregateOutputType | null;
  };

  export type MatchupAvgAggregateOutputType = {
    week: number | null;
    rosterId: number | null;
    matchupId: number | null;
    points: number | null;
    customPoints: number | null;
  };

  export type MatchupSumAggregateOutputType = {
    week: number | null;
    rosterId: number | null;
    matchupId: number | null;
    points: number | null;
    customPoints: number | null;
  };

  export type MatchupMinAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    week: number | null;
    rosterId: number | null;
    matchupId: number | null;
    points: number | null;
    customPoints: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type MatchupMaxAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    week: number | null;
    rosterId: number | null;
    matchupId: number | null;
    points: number | null;
    customPoints: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type MatchupCountAggregateOutputType = {
    id: number;
    leagueId: number;
    week: number;
    rosterId: number;
    matchupId: number;
    points: number;
    customPoints: number;
    starters: number;
    startersPoints: number;
    players: number;
    playersPoints: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type MatchupAvgAggregateInputType = {
    week?: true;
    rosterId?: true;
    matchupId?: true;
    points?: true;
    customPoints?: true;
  };

  export type MatchupSumAggregateInputType = {
    week?: true;
    rosterId?: true;
    matchupId?: true;
    points?: true;
    customPoints?: true;
  };

  export type MatchupMinAggregateInputType = {
    id?: true;
    leagueId?: true;
    week?: true;
    rosterId?: true;
    matchupId?: true;
    points?: true;
    customPoints?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type MatchupMaxAggregateInputType = {
    id?: true;
    leagueId?: true;
    week?: true;
    rosterId?: true;
    matchupId?: true;
    points?: true;
    customPoints?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type MatchupCountAggregateInputType = {
    id?: true;
    leagueId?: true;
    week?: true;
    rosterId?: true;
    matchupId?: true;
    points?: true;
    customPoints?: true;
    starters?: true;
    startersPoints?: true;
    players?: true;
    playersPoints?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type MatchupAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Matchup to aggregate.
     */
    where?: MatchupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matchups to fetch.
     */
    orderBy?: MatchupOrderByWithRelationInput | MatchupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: MatchupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matchups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matchups.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Matchups
     **/
    _count?: true | MatchupCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: MatchupAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: MatchupSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: MatchupMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: MatchupMaxAggregateInputType;
  };

  export type GetMatchupAggregateType<T extends MatchupAggregateArgs> = {
    [P in keyof T & keyof AggregateMatchup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMatchup[P]>
      : GetScalarType<T[P], AggregateMatchup[P]>;
  };

  export type MatchupGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: MatchupWhereInput;
    orderBy?: MatchupOrderByWithAggregationInput | MatchupOrderByWithAggregationInput[];
    by: MatchupScalarFieldEnum[] | MatchupScalarFieldEnum;
    having?: MatchupScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MatchupCountAggregateInputType | true;
    _avg?: MatchupAvgAggregateInputType;
    _sum?: MatchupSumAggregateInputType;
    _min?: MatchupMinAggregateInputType;
    _max?: MatchupMaxAggregateInputType;
  };

  export type MatchupGroupByOutputType = {
    id: string;
    leagueId: string;
    week: number;
    rosterId: number;
    matchupId: number | null;
    points: number;
    customPoints: number | null;
    starters: string[];
    startersPoints: JsonValue | null;
    players: string[];
    playersPoints: JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MatchupCountAggregateOutputType | null;
    _avg: MatchupAvgAggregateOutputType | null;
    _sum: MatchupSumAggregateOutputType | null;
    _min: MatchupMinAggregateOutputType | null;
    _max: MatchupMaxAggregateOutputType | null;
  };

  type GetMatchupGroupByPayload<T extends MatchupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MatchupGroupByOutputType, T['by']> & {
        [P in keyof T & keyof MatchupGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], MatchupGroupByOutputType[P]>
          : GetScalarType<T[P], MatchupGroupByOutputType[P]>;
      }
    >
  >;

  export type MatchupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        leagueId?: boolean;
        week?: boolean;
        rosterId?: boolean;
        matchupId?: boolean;
        points?: boolean;
        customPoints?: boolean;
        starters?: boolean;
        startersPoints?: boolean;
        players?: boolean;
        playersPoints?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        league?: boolean | LeagueDefaultArgs<ExtArgs>;
        roster?: boolean | RosterDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['matchup']
    >;

  export type MatchupSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      week?: boolean;
      rosterId?: boolean;
      matchupId?: boolean;
      points?: boolean;
      customPoints?: boolean;
      starters?: boolean;
      startersPoints?: boolean;
      players?: boolean;
      playersPoints?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      roster?: boolean | RosterDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['matchup']
  >;

  export type MatchupSelectScalar = {
    id?: boolean;
    leagueId?: boolean;
    week?: boolean;
    rosterId?: boolean;
    matchupId?: boolean;
    points?: boolean;
    customPoints?: boolean;
    starters?: boolean;
    startersPoints?: boolean;
    players?: boolean;
    playersPoints?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type MatchupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    roster?: boolean | RosterDefaultArgs<ExtArgs>;
  };
  export type MatchupIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    roster?: boolean | RosterDefaultArgs<ExtArgs>;
  };

  export type $MatchupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      name: 'Matchup';
      objects: {
        league: Prisma.$LeaguePayload<ExtArgs>;
        roster: Prisma.$RosterPayload<ExtArgs>;
      };
      scalars: $Extensions.GetPayloadResult<
        {
          id: string;
          leagueId: string;
          week: number;
          rosterId: number;
          matchupId: number | null;
          points: number;
          customPoints: number | null;
          starters: string[];
          startersPoints: Prisma.JsonValue | null;
          players: string[];
          playersPoints: Prisma.JsonValue | null;
          createdAt: Date;
          updatedAt: Date;
        },
        ExtArgs['result']['matchup']
      >;
      composites: {};
    };

  type MatchupGetPayload<S extends boolean | null | undefined | MatchupDefaultArgs> =
    $Result.GetResult<Prisma.$MatchupPayload, S>;

  type MatchupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    MatchupFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: MatchupCountAggregateInputType | true;
  };

  export interface MatchupDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Matchup']; meta: { name: 'Matchup' } };
    /**
     * Find zero or one Matchup that matches the filter.
     * @param {MatchupFindUniqueArgs} args - Arguments to find a Matchup
     * @example
     * // Get one Matchup
     * const matchup = await prisma.matchup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatchupFindUniqueArgs>(
      args: SelectSubset<T, MatchupFindUniqueArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Matchup that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MatchupFindUniqueOrThrowArgs} args - Arguments to find a Matchup
     * @example
     * // Get one Matchup
     * const matchup = await prisma.matchup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatchupFindUniqueOrThrowArgs>(
      args: SelectSubset<T, MatchupFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Matchup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupFindFirstArgs} args - Arguments to find a Matchup
     * @example
     * // Get one Matchup
     * const matchup = await prisma.matchup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatchupFindFirstArgs>(
      args?: SelectSubset<T, MatchupFindFirstArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Matchup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupFindFirstOrThrowArgs} args - Arguments to find a Matchup
     * @example
     * // Get one Matchup
     * const matchup = await prisma.matchup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatchupFindFirstOrThrowArgs>(
      args?: SelectSubset<T, MatchupFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Matchups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Matchups
     * const matchups = await prisma.matchup.findMany()
     *
     * // Get first 10 Matchups
     * const matchups = await prisma.matchup.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const matchupWithIdOnly = await prisma.matchup.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MatchupFindManyArgs>(
      args?: SelectSubset<T, MatchupFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Matchup.
     * @param {MatchupCreateArgs} args - Arguments to create a Matchup.
     * @example
     * // Create one Matchup
     * const Matchup = await prisma.matchup.create({
     *   data: {
     *     // ... data to create a Matchup
     *   }
     * })
     *
     */
    create<T extends MatchupCreateArgs>(
      args: SelectSubset<T, MatchupCreateArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Matchups.
     * @param {MatchupCreateManyArgs} args - Arguments to create many Matchups.
     * @example
     * // Create many Matchups
     * const matchup = await prisma.matchup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MatchupCreateManyArgs>(
      args?: SelectSubset<T, MatchupCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Matchups and returns the data saved in the database.
     * @param {MatchupCreateManyAndReturnArgs} args - Arguments to create many Matchups.
     * @example
     * // Create many Matchups
     * const matchup = await prisma.matchup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Matchups and only return the `id`
     * const matchupWithIdOnly = await prisma.matchup.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MatchupCreateManyAndReturnArgs>(
      args?: SelectSubset<T, MatchupCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Matchup.
     * @param {MatchupDeleteArgs} args - Arguments to delete one Matchup.
     * @example
     * // Delete one Matchup
     * const Matchup = await prisma.matchup.delete({
     *   where: {
     *     // ... filter to delete one Matchup
     *   }
     * })
     *
     */
    delete<T extends MatchupDeleteArgs>(
      args: SelectSubset<T, MatchupDeleteArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Matchup.
     * @param {MatchupUpdateArgs} args - Arguments to update one Matchup.
     * @example
     * // Update one Matchup
     * const matchup = await prisma.matchup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MatchupUpdateArgs>(
      args: SelectSubset<T, MatchupUpdateArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Matchups.
     * @param {MatchupDeleteManyArgs} args - Arguments to filter Matchups to delete.
     * @example
     * // Delete a few Matchups
     * const { count } = await prisma.matchup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MatchupDeleteManyArgs>(
      args?: SelectSubset<T, MatchupDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Matchups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Matchups
     * const matchup = await prisma.matchup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MatchupUpdateManyArgs>(
      args: SelectSubset<T, MatchupUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Matchup.
     * @param {MatchupUpsertArgs} args - Arguments to update or create a Matchup.
     * @example
     * // Update or create a Matchup
     * const matchup = await prisma.matchup.upsert({
     *   create: {
     *     // ... data to create a Matchup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Matchup we want to update
     *   }
     * })
     */
    upsert<T extends MatchupUpsertArgs>(
      args: SelectSubset<T, MatchupUpsertArgs<ExtArgs>>
    ): Prisma__MatchupClient<
      $Result.GetResult<Prisma.$MatchupPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Matchups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupCountArgs} args - Arguments to filter Matchups to count.
     * @example
     * // Count the number of Matchups
     * const count = await prisma.matchup.count({
     *   where: {
     *     // ... the filter for the Matchups we want to count
     *   }
     * })
     **/
    count<T extends MatchupCountArgs>(
      args?: Subset<T, MatchupCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MatchupCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Matchup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends MatchupAggregateArgs>(
      args: Subset<T, MatchupAggregateArgs>
    ): Prisma.PrismaPromise<GetMatchupAggregateType<T>>;

    /**
     * Group by Matchup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends MatchupGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MatchupGroupByArgs['orderBy'] }
        : { orderBy?: MatchupGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, MatchupGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetMatchupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Matchup model
     */
    readonly fields: MatchupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Matchup.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MatchupClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    league<T extends LeagueDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, LeagueDefaultArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    roster<T extends RosterDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, RosterDefaultArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Matchup model
   */
  interface MatchupFieldRefs {
    readonly id: FieldRef<'Matchup', 'String'>;
    readonly leagueId: FieldRef<'Matchup', 'String'>;
    readonly week: FieldRef<'Matchup', 'Int'>;
    readonly rosterId: FieldRef<'Matchup', 'Int'>;
    readonly matchupId: FieldRef<'Matchup', 'Int'>;
    readonly points: FieldRef<'Matchup', 'Float'>;
    readonly customPoints: FieldRef<'Matchup', 'Float'>;
    readonly starters: FieldRef<'Matchup', 'String[]'>;
    readonly startersPoints: FieldRef<'Matchup', 'Json'>;
    readonly players: FieldRef<'Matchup', 'String[]'>;
    readonly playersPoints: FieldRef<'Matchup', 'Json'>;
    readonly createdAt: FieldRef<'Matchup', 'DateTime'>;
    readonly updatedAt: FieldRef<'Matchup', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Matchup findUnique
   */
  export type MatchupFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * Filter, which Matchup to fetch.
     */
    where: MatchupWhereUniqueInput;
  };

  /**
   * Matchup findUniqueOrThrow
   */
  export type MatchupFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * Filter, which Matchup to fetch.
     */
    where: MatchupWhereUniqueInput;
  };

  /**
   * Matchup findFirst
   */
  export type MatchupFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * Filter, which Matchup to fetch.
     */
    where?: MatchupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matchups to fetch.
     */
    orderBy?: MatchupOrderByWithRelationInput | MatchupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Matchups.
     */
    cursor?: MatchupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matchups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matchups.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Matchups.
     */
    distinct?: MatchupScalarFieldEnum | MatchupScalarFieldEnum[];
  };

  /**
   * Matchup findFirstOrThrow
   */
  export type MatchupFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * Filter, which Matchup to fetch.
     */
    where?: MatchupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matchups to fetch.
     */
    orderBy?: MatchupOrderByWithRelationInput | MatchupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Matchups.
     */
    cursor?: MatchupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matchups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matchups.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Matchups.
     */
    distinct?: MatchupScalarFieldEnum | MatchupScalarFieldEnum[];
  };

  /**
   * Matchup findMany
   */
  export type MatchupFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * Filter, which Matchups to fetch.
     */
    where?: MatchupWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Matchups to fetch.
     */
    orderBy?: MatchupOrderByWithRelationInput | MatchupOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Matchups.
     */
    cursor?: MatchupWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Matchups from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Matchups.
     */
    skip?: number;
    distinct?: MatchupScalarFieldEnum | MatchupScalarFieldEnum[];
  };

  /**
   * Matchup create
   */
  export type MatchupCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * The data needed to create a Matchup.
     */
    data: XOR<MatchupCreateInput, MatchupUncheckedCreateInput>;
  };

  /**
   * Matchup createMany
   */
  export type MatchupCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Matchups.
     */
    data: MatchupCreateManyInput | MatchupCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Matchup createManyAndReturn
   */
  export type MatchupCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Matchups.
     */
    data: MatchupCreateManyInput | MatchupCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Matchup update
   */
  export type MatchupUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * The data needed to update a Matchup.
     */
    data: XOR<MatchupUpdateInput, MatchupUncheckedUpdateInput>;
    /**
     * Choose, which Matchup to update.
     */
    where: MatchupWhereUniqueInput;
  };

  /**
   * Matchup updateMany
   */
  export type MatchupUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Matchups.
     */
    data: XOR<MatchupUpdateManyMutationInput, MatchupUncheckedUpdateManyInput>;
    /**
     * Filter which Matchups to update
     */
    where?: MatchupWhereInput;
  };

  /**
   * Matchup upsert
   */
  export type MatchupUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * The filter to search for the Matchup to update in case it exists.
     */
    where: MatchupWhereUniqueInput;
    /**
     * In case the Matchup found by the `where` argument doesn't exist, create a new Matchup with this data.
     */
    create: XOR<MatchupCreateInput, MatchupUncheckedCreateInput>;
    /**
     * In case the Matchup was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MatchupUpdateInput, MatchupUncheckedUpdateInput>;
  };

  /**
   * Matchup delete
   */
  export type MatchupDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
    /**
     * Filter which Matchup to delete.
     */
    where: MatchupWhereUniqueInput;
  };

  /**
   * Matchup deleteMany
   */
  export type MatchupDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Matchups to delete
     */
    where?: MatchupWhereInput;
  };

  /**
   * Matchup without action
   */
  export type MatchupDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Matchup
     */
    select?: MatchupSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MatchupInclude<ExtArgs> | null;
  };

  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
  };

  export type TransactionAvgAggregateOutputType = {
    rosterIds: number | null;
    leg: number | null;
  };

  export type TransactionSumAggregateOutputType = {
    rosterIds: number[];
    leg: number | null;
  };

  export type TransactionMinAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    type: string | null;
    status: string | null;
    creatorId: string | null;
    leg: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TransactionMaxAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    type: string | null;
    status: string | null;
    creatorId: string | null;
    leg: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TransactionCountAggregateOutputType = {
    id: number;
    leagueId: number;
    type: number;
    status: number;
    creatorId: number;
    rosterIds: number;
    adds: number;
    drops: number;
    draftPicks: number;
    waiver: number;
    settings: number;
    leg: number;
    consenterIds: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type TransactionAvgAggregateInputType = {
    rosterIds?: true;
    leg?: true;
  };

  export type TransactionSumAggregateInputType = {
    rosterIds?: true;
    leg?: true;
  };

  export type TransactionMinAggregateInputType = {
    id?: true;
    leagueId?: true;
    type?: true;
    status?: true;
    creatorId?: true;
    leg?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TransactionMaxAggregateInputType = {
    id?: true;
    leagueId?: true;
    type?: true;
    status?: true;
    creatorId?: true;
    leg?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TransactionCountAggregateInputType = {
    id?: true;
    leagueId?: true;
    type?: true;
    status?: true;
    creatorId?: true;
    rosterIds?: true;
    adds?: true;
    drops?: true;
    draftPicks?: true;
    waiver?: true;
    settings?: true;
    leg?: true;
    consenterIds?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type TransactionAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Transactions
     **/
    _count?: true | TransactionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: TransactionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: TransactionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TransactionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TransactionMaxAggregateInputType;
  };

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
    [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>;
  };

  export type TransactionGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[];
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum;
    having?: TransactionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TransactionCountAggregateInputType | true;
    _avg?: TransactionAvgAggregateInputType;
    _sum?: TransactionSumAggregateInputType;
    _min?: TransactionMinAggregateInputType;
    _max?: TransactionMaxAggregateInputType;
  };

  export type TransactionGroupByOutputType = {
    id: string;
    leagueId: string;
    type: string;
    status: string;
    creatorId: string;
    rosterIds: number[];
    adds: JsonValue | null;
    drops: JsonValue | null;
    draftPicks: JsonValue | null;
    waiver: JsonValue | null;
    settings: JsonValue | null;
    leg: number;
    consenterIds: string[];
    createdAt: Date;
    updatedAt: Date;
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
  };

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> & {
        [P in keyof T & keyof TransactionGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
          : GetScalarType<T[P], TransactionGroupByOutputType[P]>;
      }
    >
  >;

  export type TransactionSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      type?: boolean;
      status?: boolean;
      creatorId?: boolean;
      rosterIds?: boolean;
      adds?: boolean;
      drops?: boolean;
      draftPicks?: boolean;
      waiver?: boolean;
      settings?: boolean;
      leg?: boolean;
      consenterIds?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      creator?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['transaction']
  >;

  export type TransactionSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      type?: boolean;
      status?: boolean;
      creatorId?: boolean;
      rosterIds?: boolean;
      adds?: boolean;
      drops?: boolean;
      draftPicks?: boolean;
      waiver?: boolean;
      settings?: boolean;
      leg?: boolean;
      consenterIds?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      creator?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['transaction']
  >;

  export type TransactionSelectScalar = {
    id?: boolean;
    leagueId?: boolean;
    type?: boolean;
    status?: boolean;
    creatorId?: boolean;
    rosterIds?: boolean;
    adds?: boolean;
    drops?: boolean;
    draftPicks?: boolean;
    waiver?: boolean;
    settings?: boolean;
    leg?: boolean;
    consenterIds?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type TransactionInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    creator?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type TransactionIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    creator?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $TransactionPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Transaction';
    objects: {
      league: Prisma.$LeaguePayload<ExtArgs>;
      creator: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        leagueId: string;
        type: string;
        status: string;
        creatorId: string;
        rosterIds: number[];
        adds: Prisma.JsonValue | null;
        drops: Prisma.JsonValue | null;
        draftPicks: Prisma.JsonValue | null;
        waiver: Prisma.JsonValue | null;
        settings: Prisma.JsonValue | null;
        leg: number;
        consenterIds: string[];
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['transaction']
    >;
    composites: {};
  };

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> =
    $Result.GetResult<Prisma.$TransactionPayload, S>;

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TransactionCountAggregateInputType | true;
    };

  export interface TransactionDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Transaction'];
      meta: { name: 'Transaction' };
    };
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(
      args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(
      args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     *
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TransactionFindManyArgs>(
      args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     *
     */
    create<T extends TransactionCreateArgs>(
      args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TransactionCreateManyArgs>(
      args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     *
     */
    delete<T extends TransactionDeleteArgs>(
      args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TransactionUpdateArgs>(
      args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TransactionDeleteManyArgs>(
      args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TransactionUpdateManyArgs>(
      args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(
      args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
     **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TransactionAggregateArgs>(
      args: Subset<T, TransactionAggregateArgs>
    ): Prisma.PrismaPromise<GetTransactionAggregateType<T>>;

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Transaction model
     */
    readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    league<T extends LeagueDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, LeagueDefaultArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    creator<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<'Transaction', 'String'>;
    readonly leagueId: FieldRef<'Transaction', 'String'>;
    readonly type: FieldRef<'Transaction', 'String'>;
    readonly status: FieldRef<'Transaction', 'String'>;
    readonly creatorId: FieldRef<'Transaction', 'String'>;
    readonly rosterIds: FieldRef<'Transaction', 'Int[]'>;
    readonly adds: FieldRef<'Transaction', 'Json'>;
    readonly drops: FieldRef<'Transaction', 'Json'>;
    readonly draftPicks: FieldRef<'Transaction', 'Json'>;
    readonly waiver: FieldRef<'Transaction', 'Json'>;
    readonly settings: FieldRef<'Transaction', 'Json'>;
    readonly leg: FieldRef<'Transaction', 'Int'>;
    readonly consenterIds: FieldRef<'Transaction', 'String[]'>;
    readonly createdAt: FieldRef<'Transaction', 'DateTime'>;
    readonly updatedAt: FieldRef<'Transaction', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>;
  };

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>;
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>;
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput;
  };

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput;
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>;
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>;
  };

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput;
  };

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
  };

  /**
   * Model TradedPick
   */

  export type AggregateTradedPick = {
    _count: TradedPickCountAggregateOutputType | null;
    _avg: TradedPickAvgAggregateOutputType | null;
    _sum: TradedPickSumAggregateOutputType | null;
    _min: TradedPickMinAggregateOutputType | null;
    _max: TradedPickMaxAggregateOutputType | null;
  };

  export type TradedPickAvgAggregateOutputType = {
    round: number | null;
    rosterId: number | null;
    previousOwnerId: number | null;
    ownerId: number | null;
  };

  export type TradedPickSumAggregateOutputType = {
    round: number | null;
    rosterId: number | null;
    previousOwnerId: number | null;
    ownerId: number | null;
  };

  export type TradedPickMinAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    season: string | null;
    round: number | null;
    rosterId: number | null;
    previousOwnerId: number | null;
    ownerId: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TradedPickMaxAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    season: string | null;
    round: number | null;
    rosterId: number | null;
    previousOwnerId: number | null;
    ownerId: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TradedPickCountAggregateOutputType = {
    id: number;
    leagueId: number;
    season: number;
    round: number;
    rosterId: number;
    previousOwnerId: number;
    ownerId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type TradedPickAvgAggregateInputType = {
    round?: true;
    rosterId?: true;
    previousOwnerId?: true;
    ownerId?: true;
  };

  export type TradedPickSumAggregateInputType = {
    round?: true;
    rosterId?: true;
    previousOwnerId?: true;
    ownerId?: true;
  };

  export type TradedPickMinAggregateInputType = {
    id?: true;
    leagueId?: true;
    season?: true;
    round?: true;
    rosterId?: true;
    previousOwnerId?: true;
    ownerId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TradedPickMaxAggregateInputType = {
    id?: true;
    leagueId?: true;
    season?: true;
    round?: true;
    rosterId?: true;
    previousOwnerId?: true;
    ownerId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TradedPickCountAggregateInputType = {
    id?: true;
    leagueId?: true;
    season?: true;
    round?: true;
    rosterId?: true;
    previousOwnerId?: true;
    ownerId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type TradedPickAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which TradedPick to aggregate.
     */
    where?: TradedPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TradedPicks to fetch.
     */
    orderBy?: TradedPickOrderByWithRelationInput | TradedPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TradedPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TradedPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TradedPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned TradedPicks
     **/
    _count?: true | TradedPickCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: TradedPickAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: TradedPickSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TradedPickMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TradedPickMaxAggregateInputType;
  };

  export type GetTradedPickAggregateType<T extends TradedPickAggregateArgs> = {
    [P in keyof T & keyof AggregateTradedPick]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTradedPick[P]>
      : GetScalarType<T[P], AggregateTradedPick[P]>;
  };

  export type TradedPickGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TradedPickWhereInput;
    orderBy?: TradedPickOrderByWithAggregationInput | TradedPickOrderByWithAggregationInput[];
    by: TradedPickScalarFieldEnum[] | TradedPickScalarFieldEnum;
    having?: TradedPickScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TradedPickCountAggregateInputType | true;
    _avg?: TradedPickAvgAggregateInputType;
    _sum?: TradedPickSumAggregateInputType;
    _min?: TradedPickMinAggregateInputType;
    _max?: TradedPickMaxAggregateInputType;
  };

  export type TradedPickGroupByOutputType = {
    id: string;
    leagueId: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId: number | null;
    ownerId: number;
    createdAt: Date;
    updatedAt: Date;
    _count: TradedPickCountAggregateOutputType | null;
    _avg: TradedPickAvgAggregateOutputType | null;
    _sum: TradedPickSumAggregateOutputType | null;
    _min: TradedPickMinAggregateOutputType | null;
    _max: TradedPickMaxAggregateOutputType | null;
  };

  type GetTradedPickGroupByPayload<T extends TradedPickGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TradedPickGroupByOutputType, T['by']> & {
        [P in keyof T & keyof TradedPickGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], TradedPickGroupByOutputType[P]>
          : GetScalarType<T[P], TradedPickGroupByOutputType[P]>;
      }
    >
  >;

  export type TradedPickSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        leagueId?: boolean;
        season?: boolean;
        round?: boolean;
        rosterId?: boolean;
        previousOwnerId?: boolean;
        ownerId?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        league?: boolean | LeagueDefaultArgs<ExtArgs>;
        currentOwner?: boolean | RosterDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['tradedPick']
    >;

  export type TradedPickSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      season?: boolean;
      round?: boolean;
      rosterId?: boolean;
      previousOwnerId?: boolean;
      ownerId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      currentOwner?: boolean | RosterDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['tradedPick']
  >;

  export type TradedPickSelectScalar = {
    id?: boolean;
    leagueId?: boolean;
    season?: boolean;
    round?: boolean;
    rosterId?: boolean;
    previousOwnerId?: boolean;
    ownerId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type TradedPickInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    currentOwner?: boolean | RosterDefaultArgs<ExtArgs>;
  };
  export type TradedPickIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    currentOwner?: boolean | RosterDefaultArgs<ExtArgs>;
  };

  export type $TradedPickPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'TradedPick';
    objects: {
      league: Prisma.$LeaguePayload<ExtArgs>;
      currentOwner: Prisma.$RosterPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        leagueId: string;
        season: string;
        round: number;
        rosterId: number;
        previousOwnerId: number | null;
        ownerId: number;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['tradedPick']
    >;
    composites: {};
  };

  type TradedPickGetPayload<S extends boolean | null | undefined | TradedPickDefaultArgs> =
    $Result.GetResult<Prisma.$TradedPickPayload, S>;

  type TradedPickCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TradedPickFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TradedPickCountAggregateInputType | true;
    };

  export interface TradedPickDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['TradedPick'];
      meta: { name: 'TradedPick' };
    };
    /**
     * Find zero or one TradedPick that matches the filter.
     * @param {TradedPickFindUniqueArgs} args - Arguments to find a TradedPick
     * @example
     * // Get one TradedPick
     * const tradedPick = await prisma.tradedPick.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TradedPickFindUniqueArgs>(
      args: SelectSubset<T, TradedPickFindUniqueArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one TradedPick that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TradedPickFindUniqueOrThrowArgs} args - Arguments to find a TradedPick
     * @example
     * // Get one TradedPick
     * const tradedPick = await prisma.tradedPick.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TradedPickFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TradedPickFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first TradedPick that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickFindFirstArgs} args - Arguments to find a TradedPick
     * @example
     * // Get one TradedPick
     * const tradedPick = await prisma.tradedPick.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TradedPickFindFirstArgs>(
      args?: SelectSubset<T, TradedPickFindFirstArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first TradedPick that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickFindFirstOrThrowArgs} args - Arguments to find a TradedPick
     * @example
     * // Get one TradedPick
     * const tradedPick = await prisma.tradedPick.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TradedPickFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TradedPickFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more TradedPicks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TradedPicks
     * const tradedPicks = await prisma.tradedPick.findMany()
     *
     * // Get first 10 TradedPicks
     * const tradedPicks = await prisma.tradedPick.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const tradedPickWithIdOnly = await prisma.tradedPick.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TradedPickFindManyArgs>(
      args?: SelectSubset<T, TradedPickFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a TradedPick.
     * @param {TradedPickCreateArgs} args - Arguments to create a TradedPick.
     * @example
     * // Create one TradedPick
     * const TradedPick = await prisma.tradedPick.create({
     *   data: {
     *     // ... data to create a TradedPick
     *   }
     * })
     *
     */
    create<T extends TradedPickCreateArgs>(
      args: SelectSubset<T, TradedPickCreateArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many TradedPicks.
     * @param {TradedPickCreateManyArgs} args - Arguments to create many TradedPicks.
     * @example
     * // Create many TradedPicks
     * const tradedPick = await prisma.tradedPick.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TradedPickCreateManyArgs>(
      args?: SelectSubset<T, TradedPickCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many TradedPicks and returns the data saved in the database.
     * @param {TradedPickCreateManyAndReturnArgs} args - Arguments to create many TradedPicks.
     * @example
     * // Create many TradedPicks
     * const tradedPick = await prisma.tradedPick.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many TradedPicks and only return the `id`
     * const tradedPickWithIdOnly = await prisma.tradedPick.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TradedPickCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TradedPickCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a TradedPick.
     * @param {TradedPickDeleteArgs} args - Arguments to delete one TradedPick.
     * @example
     * // Delete one TradedPick
     * const TradedPick = await prisma.tradedPick.delete({
     *   where: {
     *     // ... filter to delete one TradedPick
     *   }
     * })
     *
     */
    delete<T extends TradedPickDeleteArgs>(
      args: SelectSubset<T, TradedPickDeleteArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one TradedPick.
     * @param {TradedPickUpdateArgs} args - Arguments to update one TradedPick.
     * @example
     * // Update one TradedPick
     * const tradedPick = await prisma.tradedPick.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TradedPickUpdateArgs>(
      args: SelectSubset<T, TradedPickUpdateArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more TradedPicks.
     * @param {TradedPickDeleteManyArgs} args - Arguments to filter TradedPicks to delete.
     * @example
     * // Delete a few TradedPicks
     * const { count } = await prisma.tradedPick.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TradedPickDeleteManyArgs>(
      args?: SelectSubset<T, TradedPickDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more TradedPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TradedPicks
     * const tradedPick = await prisma.tradedPick.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TradedPickUpdateManyArgs>(
      args: SelectSubset<T, TradedPickUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one TradedPick.
     * @param {TradedPickUpsertArgs} args - Arguments to update or create a TradedPick.
     * @example
     * // Update or create a TradedPick
     * const tradedPick = await prisma.tradedPick.upsert({
     *   create: {
     *     // ... data to create a TradedPick
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TradedPick we want to update
     *   }
     * })
     */
    upsert<T extends TradedPickUpsertArgs>(
      args: SelectSubset<T, TradedPickUpsertArgs<ExtArgs>>
    ): Prisma__TradedPickClient<
      $Result.GetResult<Prisma.$TradedPickPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of TradedPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickCountArgs} args - Arguments to filter TradedPicks to count.
     * @example
     * // Count the number of TradedPicks
     * const count = await prisma.tradedPick.count({
     *   where: {
     *     // ... the filter for the TradedPicks we want to count
     *   }
     * })
     **/
    count<T extends TradedPickCountArgs>(
      args?: Subset<T, TradedPickCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TradedPickCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a TradedPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TradedPickAggregateArgs>(
      args: Subset<T, TradedPickAggregateArgs>
    ): Prisma.PrismaPromise<GetTradedPickAggregateType<T>>;

    /**
     * Group by TradedPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradedPickGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TradedPickGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TradedPickGroupByArgs['orderBy'] }
        : { orderBy?: TradedPickGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, TradedPickGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetTradedPickGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the TradedPick model
     */
    readonly fields: TradedPickFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TradedPick.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TradedPickClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    league<T extends LeagueDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, LeagueDefaultArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    currentOwner<T extends RosterDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, RosterDefaultArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the TradedPick model
   */
  interface TradedPickFieldRefs {
    readonly id: FieldRef<'TradedPick', 'String'>;
    readonly leagueId: FieldRef<'TradedPick', 'String'>;
    readonly season: FieldRef<'TradedPick', 'String'>;
    readonly round: FieldRef<'TradedPick', 'Int'>;
    readonly rosterId: FieldRef<'TradedPick', 'Int'>;
    readonly previousOwnerId: FieldRef<'TradedPick', 'Int'>;
    readonly ownerId: FieldRef<'TradedPick', 'Int'>;
    readonly createdAt: FieldRef<'TradedPick', 'DateTime'>;
    readonly updatedAt: FieldRef<'TradedPick', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * TradedPick findUnique
   */
  export type TradedPickFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * Filter, which TradedPick to fetch.
     */
    where: TradedPickWhereUniqueInput;
  };

  /**
   * TradedPick findUniqueOrThrow
   */
  export type TradedPickFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * Filter, which TradedPick to fetch.
     */
    where: TradedPickWhereUniqueInput;
  };

  /**
   * TradedPick findFirst
   */
  export type TradedPickFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * Filter, which TradedPick to fetch.
     */
    where?: TradedPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TradedPicks to fetch.
     */
    orderBy?: TradedPickOrderByWithRelationInput | TradedPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TradedPicks.
     */
    cursor?: TradedPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TradedPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TradedPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TradedPicks.
     */
    distinct?: TradedPickScalarFieldEnum | TradedPickScalarFieldEnum[];
  };

  /**
   * TradedPick findFirstOrThrow
   */
  export type TradedPickFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * Filter, which TradedPick to fetch.
     */
    where?: TradedPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TradedPicks to fetch.
     */
    orderBy?: TradedPickOrderByWithRelationInput | TradedPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TradedPicks.
     */
    cursor?: TradedPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TradedPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TradedPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TradedPicks.
     */
    distinct?: TradedPickScalarFieldEnum | TradedPickScalarFieldEnum[];
  };

  /**
   * TradedPick findMany
   */
  export type TradedPickFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * Filter, which TradedPicks to fetch.
     */
    where?: TradedPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TradedPicks to fetch.
     */
    orderBy?: TradedPickOrderByWithRelationInput | TradedPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing TradedPicks.
     */
    cursor?: TradedPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TradedPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TradedPicks.
     */
    skip?: number;
    distinct?: TradedPickScalarFieldEnum | TradedPickScalarFieldEnum[];
  };

  /**
   * TradedPick create
   */
  export type TradedPickCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * The data needed to create a TradedPick.
     */
    data: XOR<TradedPickCreateInput, TradedPickUncheckedCreateInput>;
  };

  /**
   * TradedPick createMany
   */
  export type TradedPickCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many TradedPicks.
     */
    data: TradedPickCreateManyInput | TradedPickCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * TradedPick createManyAndReturn
   */
  export type TradedPickCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many TradedPicks.
     */
    data: TradedPickCreateManyInput | TradedPickCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * TradedPick update
   */
  export type TradedPickUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * The data needed to update a TradedPick.
     */
    data: XOR<TradedPickUpdateInput, TradedPickUncheckedUpdateInput>;
    /**
     * Choose, which TradedPick to update.
     */
    where: TradedPickWhereUniqueInput;
  };

  /**
   * TradedPick updateMany
   */
  export type TradedPickUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update TradedPicks.
     */
    data: XOR<TradedPickUpdateManyMutationInput, TradedPickUncheckedUpdateManyInput>;
    /**
     * Filter which TradedPicks to update
     */
    where?: TradedPickWhereInput;
  };

  /**
   * TradedPick upsert
   */
  export type TradedPickUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * The filter to search for the TradedPick to update in case it exists.
     */
    where: TradedPickWhereUniqueInput;
    /**
     * In case the TradedPick found by the `where` argument doesn't exist, create a new TradedPick with this data.
     */
    create: XOR<TradedPickCreateInput, TradedPickUncheckedCreateInput>;
    /**
     * In case the TradedPick was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TradedPickUpdateInput, TradedPickUncheckedUpdateInput>;
  };

  /**
   * TradedPick delete
   */
  export type TradedPickDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
    /**
     * Filter which TradedPick to delete.
     */
    where: TradedPickWhereUniqueInput;
  };

  /**
   * TradedPick deleteMany
   */
  export type TradedPickDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which TradedPicks to delete
     */
    where?: TradedPickWhereInput;
  };

  /**
   * TradedPick without action
   */
  export type TradedPickDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TradedPick
     */
    select?: TradedPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradedPickInclude<ExtArgs> | null;
  };

  /**
   * Model Draft
   */

  export type AggregateDraft = {
    _count: DraftCountAggregateOutputType | null;
    _avg: DraftAvgAggregateOutputType | null;
    _sum: DraftSumAggregateOutputType | null;
    _min: DraftMinAggregateOutputType | null;
    _max: DraftMaxAggregateOutputType | null;
  };

  export type DraftAvgAggregateOutputType = {
    slotToRosterId: number | null;
  };

  export type DraftSumAggregateOutputType = {
    slotToRosterId: number[];
  };

  export type DraftMinAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    status: string | null;
    type: string | null;
    season: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DraftMaxAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    status: string | null;
    type: string | null;
    season: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DraftCountAggregateOutputType = {
    id: number;
    leagueId: number;
    status: number;
    type: number;
    season: number;
    settings: number;
    metadata: number;
    slotToRosterId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type DraftAvgAggregateInputType = {
    slotToRosterId?: true;
  };

  export type DraftSumAggregateInputType = {
    slotToRosterId?: true;
  };

  export type DraftMinAggregateInputType = {
    id?: true;
    leagueId?: true;
    status?: true;
    type?: true;
    season?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DraftMaxAggregateInputType = {
    id?: true;
    leagueId?: true;
    status?: true;
    type?: true;
    season?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DraftCountAggregateInputType = {
    id?: true;
    leagueId?: true;
    status?: true;
    type?: true;
    season?: true;
    settings?: true;
    metadata?: true;
    slotToRosterId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type DraftAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Draft to aggregate.
     */
    where?: DraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Drafts
     **/
    _count?: true | DraftCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: DraftAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: DraftSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DraftMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DraftMaxAggregateInputType;
  };

  export type GetDraftAggregateType<T extends DraftAggregateArgs> = {
    [P in keyof T & keyof AggregateDraft]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDraft[P]>
      : GetScalarType<T[P], AggregateDraft[P]>;
  };

  export type DraftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: DraftWhereInput;
      orderBy?: DraftOrderByWithAggregationInput | DraftOrderByWithAggregationInput[];
      by: DraftScalarFieldEnum[] | DraftScalarFieldEnum;
      having?: DraftScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: DraftCountAggregateInputType | true;
      _avg?: DraftAvgAggregateInputType;
      _sum?: DraftSumAggregateInputType;
      _min?: DraftMinAggregateInputType;
      _max?: DraftMaxAggregateInputType;
    };

  export type DraftGroupByOutputType = {
    id: string;
    leagueId: string;
    status: string;
    type: string;
    season: string;
    settings: JsonValue;
    metadata: JsonValue | null;
    slotToRosterId: number[];
    createdAt: Date;
    updatedAt: Date;
    _count: DraftCountAggregateOutputType | null;
    _avg: DraftAvgAggregateOutputType | null;
    _sum: DraftSumAggregateOutputType | null;
    _min: DraftMinAggregateOutputType | null;
    _max: DraftMaxAggregateOutputType | null;
  };

  type GetDraftGroupByPayload<T extends DraftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DraftGroupByOutputType, T['by']> & {
        [P in keyof T & keyof DraftGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], DraftGroupByOutputType[P]>
          : GetScalarType<T[P], DraftGroupByOutputType[P]>;
      }
    >
  >;

  export type DraftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        leagueId?: boolean;
        status?: boolean;
        type?: boolean;
        season?: boolean;
        settings?: boolean;
        metadata?: boolean;
        slotToRosterId?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        league?: boolean | LeagueDefaultArgs<ExtArgs>;
        picks?: boolean | Draft$picksArgs<ExtArgs>;
        _count?: boolean | DraftCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['draft']
    >;

  export type DraftSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      status?: boolean;
      type?: boolean;
      season?: boolean;
      settings?: boolean;
      metadata?: boolean;
      slotToRosterId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['draft']
  >;

  export type DraftSelectScalar = {
    id?: boolean;
    leagueId?: boolean;
    status?: boolean;
    type?: boolean;
    season?: boolean;
    settings?: boolean;
    metadata?: boolean;
    slotToRosterId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type DraftInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    picks?: boolean | Draft$picksArgs<ExtArgs>;
    _count?: boolean | DraftCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type DraftIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
  };

  export type $DraftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'Draft';
    objects: {
      league: Prisma.$LeaguePayload<ExtArgs>;
      picks: Prisma.$DraftPickPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        leagueId: string;
        status: string;
        type: string;
        season: string;
        settings: Prisma.JsonValue;
        metadata: Prisma.JsonValue | null;
        slotToRosterId: number[];
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['draft']
    >;
    composites: {};
  };

  type DraftGetPayload<S extends boolean | null | undefined | DraftDefaultArgs> = $Result.GetResult<
    Prisma.$DraftPayload,
    S
  >;

  type DraftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    DraftFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: DraftCountAggregateInputType | true;
  };

  export interface DraftDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Draft']; meta: { name: 'Draft' } };
    /**
     * Find zero or one Draft that matches the filter.
     * @param {DraftFindUniqueArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DraftFindUniqueArgs>(
      args: SelectSubset<T, DraftFindUniqueArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Draft that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DraftFindUniqueOrThrowArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DraftFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DraftFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Draft that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftFindFirstArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DraftFindFirstArgs>(
      args?: SelectSubset<T, DraftFindFirstArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Draft that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftFindFirstOrThrowArgs} args - Arguments to find a Draft
     * @example
     * // Get one Draft
     * const draft = await prisma.draft.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DraftFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DraftFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Drafts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drafts
     * const drafts = await prisma.draft.findMany()
     *
     * // Get first 10 Drafts
     * const drafts = await prisma.draft.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const draftWithIdOnly = await prisma.draft.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DraftFindManyArgs>(
      args?: SelectSubset<T, DraftFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Draft.
     * @param {DraftCreateArgs} args - Arguments to create a Draft.
     * @example
     * // Create one Draft
     * const Draft = await prisma.draft.create({
     *   data: {
     *     // ... data to create a Draft
     *   }
     * })
     *
     */
    create<T extends DraftCreateArgs>(
      args: SelectSubset<T, DraftCreateArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Drafts.
     * @param {DraftCreateManyArgs} args - Arguments to create many Drafts.
     * @example
     * // Create many Drafts
     * const draft = await prisma.draft.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DraftCreateManyArgs>(
      args?: SelectSubset<T, DraftCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Drafts and returns the data saved in the database.
     * @param {DraftCreateManyAndReturnArgs} args - Arguments to create many Drafts.
     * @example
     * // Create many Drafts
     * const draft = await prisma.draft.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Drafts and only return the `id`
     * const draftWithIdOnly = await prisma.draft.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DraftCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DraftCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Draft.
     * @param {DraftDeleteArgs} args - Arguments to delete one Draft.
     * @example
     * // Delete one Draft
     * const Draft = await prisma.draft.delete({
     *   where: {
     *     // ... filter to delete one Draft
     *   }
     * })
     *
     */
    delete<T extends DraftDeleteArgs>(
      args: SelectSubset<T, DraftDeleteArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Draft.
     * @param {DraftUpdateArgs} args - Arguments to update one Draft.
     * @example
     * // Update one Draft
     * const draft = await prisma.draft.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DraftUpdateArgs>(
      args: SelectSubset<T, DraftUpdateArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Drafts.
     * @param {DraftDeleteManyArgs} args - Arguments to filter Drafts to delete.
     * @example
     * // Delete a few Drafts
     * const { count } = await prisma.draft.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DraftDeleteManyArgs>(
      args?: SelectSubset<T, DraftDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Drafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drafts
     * const draft = await prisma.draft.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DraftUpdateManyArgs>(
      args: SelectSubset<T, DraftUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Draft.
     * @param {DraftUpsertArgs} args - Arguments to update or create a Draft.
     * @example
     * // Update or create a Draft
     * const draft = await prisma.draft.upsert({
     *   create: {
     *     // ... data to create a Draft
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Draft we want to update
     *   }
     * })
     */
    upsert<T extends DraftUpsertArgs>(
      args: SelectSubset<T, DraftUpsertArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Drafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftCountArgs} args - Arguments to filter Drafts to count.
     * @example
     * // Count the number of Drafts
     * const count = await prisma.draft.count({
     *   where: {
     *     // ... the filter for the Drafts we want to count
     *   }
     * })
     **/
    count<T extends DraftCountArgs>(
      args?: Subset<T, DraftCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DraftCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Draft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DraftAggregateArgs>(
      args: Subset<T, DraftAggregateArgs>
    ): Prisma.PrismaPromise<GetDraftAggregateType<T>>;

    /**
     * Group by Draft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DraftGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DraftGroupByArgs['orderBy'] }
        : { orderBy?: DraftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, DraftGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetDraftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Draft model
     */
    readonly fields: DraftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Draft.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DraftClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    league<T extends LeagueDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, LeagueDefaultArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    picks<T extends Draft$picksArgs<ExtArgs> = {}>(
      args?: Subset<T, Draft$picksArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'findMany'> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Draft model
   */
  interface DraftFieldRefs {
    readonly id: FieldRef<'Draft', 'String'>;
    readonly leagueId: FieldRef<'Draft', 'String'>;
    readonly status: FieldRef<'Draft', 'String'>;
    readonly type: FieldRef<'Draft', 'String'>;
    readonly season: FieldRef<'Draft', 'String'>;
    readonly settings: FieldRef<'Draft', 'Json'>;
    readonly metadata: FieldRef<'Draft', 'Json'>;
    readonly slotToRosterId: FieldRef<'Draft', 'Int[]'>;
    readonly createdAt: FieldRef<'Draft', 'DateTime'>;
    readonly updatedAt: FieldRef<'Draft', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Draft findUnique
   */
  export type DraftFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null;
    /**
     * Filter, which Draft to fetch.
     */
    where: DraftWhereUniqueInput;
  };

  /**
   * Draft findUniqueOrThrow
   */
  export type DraftFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null;
    /**
     * Filter, which Draft to fetch.
     */
    where: DraftWhereUniqueInput;
  };

  /**
   * Draft findFirst
   */
  export type DraftFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null;
    /**
     * Filter, which Draft to fetch.
     */
    where?: DraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Drafts.
     */
    cursor?: DraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Drafts.
     */
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[];
  };

  /**
   * Draft findFirstOrThrow
   */
  export type DraftFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null;
    /**
     * Filter, which Draft to fetch.
     */
    where?: DraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Drafts.
     */
    cursor?: DraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Drafts.
     */
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[];
  };

  /**
   * Draft findMany
   */
  export type DraftFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftInclude<ExtArgs> | null;
    /**
     * Filter, which Drafts to fetch.
     */
    where?: DraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Drafts to fetch.
     */
    orderBy?: DraftOrderByWithRelationInput | DraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Drafts.
     */
    cursor?: DraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Drafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Drafts.
     */
    skip?: number;
    distinct?: DraftScalarFieldEnum | DraftScalarFieldEnum[];
  };

  /**
   * Draft create
   */
  export type DraftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Draft
       */
      select?: DraftSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: DraftInclude<ExtArgs> | null;
      /**
       * The data needed to create a Draft.
       */
      data: XOR<DraftCreateInput, DraftUncheckedCreateInput>;
    };

  /**
   * Draft createMany
   */
  export type DraftCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Drafts.
     */
    data: DraftCreateManyInput | DraftCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Draft createManyAndReturn
   */
  export type DraftCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Draft
     */
    select?: DraftSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Drafts.
     */
    data: DraftCreateManyInput | DraftCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Draft update
   */
  export type DraftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Draft
       */
      select?: DraftSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: DraftInclude<ExtArgs> | null;
      /**
       * The data needed to update a Draft.
       */
      data: XOR<DraftUpdateInput, DraftUncheckedUpdateInput>;
      /**
       * Choose, which Draft to update.
       */
      where: DraftWhereUniqueInput;
    };

  /**
   * Draft updateMany
   */
  export type DraftUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Drafts.
     */
    data: XOR<DraftUpdateManyMutationInput, DraftUncheckedUpdateManyInput>;
    /**
     * Filter which Drafts to update
     */
    where?: DraftWhereInput;
  };

  /**
   * Draft upsert
   */
  export type DraftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Draft
       */
      select?: DraftSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: DraftInclude<ExtArgs> | null;
      /**
       * The filter to search for the Draft to update in case it exists.
       */
      where: DraftWhereUniqueInput;
      /**
       * In case the Draft found by the `where` argument doesn't exist, create a new Draft with this data.
       */
      create: XOR<DraftCreateInput, DraftUncheckedCreateInput>;
      /**
       * In case the Draft was found with the provided `where` argument, update it with this data.
       */
      update: XOR<DraftUpdateInput, DraftUncheckedUpdateInput>;
    };

  /**
   * Draft delete
   */
  export type DraftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Draft
       */
      select?: DraftSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: DraftInclude<ExtArgs> | null;
      /**
       * Filter which Draft to delete.
       */
      where: DraftWhereUniqueInput;
    };

  /**
   * Draft deleteMany
   */
  export type DraftDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Drafts to delete
     */
    where?: DraftWhereInput;
  };

  /**
   * Draft.picks
   */
  export type Draft$picksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the DraftPick
       */
      select?: DraftPickSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: DraftPickInclude<ExtArgs> | null;
      where?: DraftPickWhereInput;
      orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[];
      cursor?: DraftPickWhereUniqueInput;
      take?: number;
      skip?: number;
      distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[];
    };

  /**
   * Draft without action
   */
  export type DraftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Draft
       */
      select?: DraftSelect<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: DraftInclude<ExtArgs> | null;
    };

  /**
   * Model DraftPick
   */

  export type AggregateDraftPick = {
    _count: DraftPickCountAggregateOutputType | null;
    _avg: DraftPickAvgAggregateOutputType | null;
    _sum: DraftPickSumAggregateOutputType | null;
    _min: DraftPickMinAggregateOutputType | null;
    _max: DraftPickMaxAggregateOutputType | null;
  };

  export type DraftPickAvgAggregateOutputType = {
    pickNo: number | null;
    round: number | null;
    rosterId: number | null;
  };

  export type DraftPickSumAggregateOutputType = {
    pickNo: number | null;
    round: number | null;
    rosterId: number | null;
  };

  export type DraftPickMinAggregateOutputType = {
    id: string | null;
    draftId: string | null;
    pickNo: number | null;
    round: number | null;
    rosterId: number | null;
    playerId: string | null;
    pickedBy: string | null;
    isKeeper: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DraftPickMaxAggregateOutputType = {
    id: string | null;
    draftId: string | null;
    pickNo: number | null;
    round: number | null;
    rosterId: number | null;
    playerId: string | null;
    pickedBy: string | null;
    isKeeper: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DraftPickCountAggregateOutputType = {
    id: number;
    draftId: number;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: number;
    pickedBy: number;
    metadata: number;
    isKeeper: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type DraftPickAvgAggregateInputType = {
    pickNo?: true;
    round?: true;
    rosterId?: true;
  };

  export type DraftPickSumAggregateInputType = {
    pickNo?: true;
    round?: true;
    rosterId?: true;
  };

  export type DraftPickMinAggregateInputType = {
    id?: true;
    draftId?: true;
    pickNo?: true;
    round?: true;
    rosterId?: true;
    playerId?: true;
    pickedBy?: true;
    isKeeper?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DraftPickMaxAggregateInputType = {
    id?: true;
    draftId?: true;
    pickNo?: true;
    round?: true;
    rosterId?: true;
    playerId?: true;
    pickedBy?: true;
    isKeeper?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DraftPickCountAggregateInputType = {
    id?: true;
    draftId?: true;
    pickNo?: true;
    round?: true;
    rosterId?: true;
    playerId?: true;
    pickedBy?: true;
    metadata?: true;
    isKeeper?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type DraftPickAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DraftPick to aggregate.
     */
    where?: DraftPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DraftPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DraftPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DraftPicks
     **/
    _count?: true | DraftPickCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: DraftPickAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: DraftPickSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DraftPickMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DraftPickMaxAggregateInputType;
  };

  export type GetDraftPickAggregateType<T extends DraftPickAggregateArgs> = {
    [P in keyof T & keyof AggregateDraftPick]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDraftPick[P]>
      : GetScalarType<T[P], AggregateDraftPick[P]>;
  };

  export type DraftPickGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DraftPickWhereInput;
    orderBy?: DraftPickOrderByWithAggregationInput | DraftPickOrderByWithAggregationInput[];
    by: DraftPickScalarFieldEnum[] | DraftPickScalarFieldEnum;
    having?: DraftPickScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DraftPickCountAggregateInputType | true;
    _avg?: DraftPickAvgAggregateInputType;
    _sum?: DraftPickSumAggregateInputType;
    _min?: DraftPickMinAggregateInputType;
    _max?: DraftPickMaxAggregateInputType;
  };

  export type DraftPickGroupByOutputType = {
    id: string;
    draftId: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy: string | null;
    metadata: JsonValue | null;
    isKeeper: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: DraftPickCountAggregateOutputType | null;
    _avg: DraftPickAvgAggregateOutputType | null;
    _sum: DraftPickSumAggregateOutputType | null;
    _min: DraftPickMinAggregateOutputType | null;
    _max: DraftPickMaxAggregateOutputType | null;
  };

  type GetDraftPickGroupByPayload<T extends DraftPickGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DraftPickGroupByOutputType, T['by']> & {
        [P in keyof T & keyof DraftPickGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], DraftPickGroupByOutputType[P]>
          : GetScalarType<T[P], DraftPickGroupByOutputType[P]>;
      }
    >
  >;

  export type DraftPickSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        draftId?: boolean;
        pickNo?: boolean;
        round?: boolean;
        rosterId?: boolean;
        playerId?: boolean;
        pickedBy?: boolean;
        metadata?: boolean;
        isKeeper?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        draft?: boolean | DraftDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['draftPick']
    >;

  export type DraftPickSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      draftId?: boolean;
      pickNo?: boolean;
      round?: boolean;
      rosterId?: boolean;
      playerId?: boolean;
      pickedBy?: boolean;
      metadata?: boolean;
      isKeeper?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      draft?: boolean | DraftDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['draftPick']
  >;

  export type DraftPickSelectScalar = {
    id?: boolean;
    draftId?: boolean;
    pickNo?: boolean;
    round?: boolean;
    rosterId?: boolean;
    playerId?: boolean;
    pickedBy?: boolean;
    metadata?: boolean;
    isKeeper?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type DraftPickInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      draft?: boolean | DraftDefaultArgs<ExtArgs>;
    };
  export type DraftPickIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    draft?: boolean | DraftDefaultArgs<ExtArgs>;
  };

  export type $DraftPickPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'DraftPick';
    objects: {
      draft: Prisma.$DraftPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        draftId: string;
        pickNo: number;
        round: number;
        rosterId: number;
        playerId: string;
        pickedBy: string | null;
        metadata: Prisma.JsonValue | null;
        isKeeper: boolean;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['draftPick']
    >;
    composites: {};
  };

  type DraftPickGetPayload<S extends boolean | null | undefined | DraftPickDefaultArgs> =
    $Result.GetResult<Prisma.$DraftPickPayload, S>;

  type DraftPickCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DraftPickFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DraftPickCountAggregateInputType | true;
    };

  export interface DraftPickDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['DraftPick'];
      meta: { name: 'DraftPick' };
    };
    /**
     * Find zero or one DraftPick that matches the filter.
     * @param {DraftPickFindUniqueArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DraftPickFindUniqueArgs>(
      args: SelectSubset<T, DraftPickFindUniqueArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one DraftPick that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DraftPickFindUniqueOrThrowArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DraftPickFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DraftPickFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first DraftPick that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickFindFirstArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DraftPickFindFirstArgs>(
      args?: SelectSubset<T, DraftPickFindFirstArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first DraftPick that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickFindFirstOrThrowArgs} args - Arguments to find a DraftPick
     * @example
     * // Get one DraftPick
     * const draftPick = await prisma.draftPick.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DraftPickFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DraftPickFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more DraftPicks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DraftPicks
     * const draftPicks = await prisma.draftPick.findMany()
     *
     * // Get first 10 DraftPicks
     * const draftPicks = await prisma.draftPick.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const draftPickWithIdOnly = await prisma.draftPick.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DraftPickFindManyArgs>(
      args?: SelectSubset<T, DraftPickFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a DraftPick.
     * @param {DraftPickCreateArgs} args - Arguments to create a DraftPick.
     * @example
     * // Create one DraftPick
     * const DraftPick = await prisma.draftPick.create({
     *   data: {
     *     // ... data to create a DraftPick
     *   }
     * })
     *
     */
    create<T extends DraftPickCreateArgs>(
      args: SelectSubset<T, DraftPickCreateArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many DraftPicks.
     * @param {DraftPickCreateManyArgs} args - Arguments to create many DraftPicks.
     * @example
     * // Create many DraftPicks
     * const draftPick = await prisma.draftPick.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DraftPickCreateManyArgs>(
      args?: SelectSubset<T, DraftPickCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many DraftPicks and returns the data saved in the database.
     * @param {DraftPickCreateManyAndReturnArgs} args - Arguments to create many DraftPicks.
     * @example
     * // Create many DraftPicks
     * const draftPick = await prisma.draftPick.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DraftPicks and only return the `id`
     * const draftPickWithIdOnly = await prisma.draftPick.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DraftPickCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DraftPickCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a DraftPick.
     * @param {DraftPickDeleteArgs} args - Arguments to delete one DraftPick.
     * @example
     * // Delete one DraftPick
     * const DraftPick = await prisma.draftPick.delete({
     *   where: {
     *     // ... filter to delete one DraftPick
     *   }
     * })
     *
     */
    delete<T extends DraftPickDeleteArgs>(
      args: SelectSubset<T, DraftPickDeleteArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one DraftPick.
     * @param {DraftPickUpdateArgs} args - Arguments to update one DraftPick.
     * @example
     * // Update one DraftPick
     * const draftPick = await prisma.draftPick.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DraftPickUpdateArgs>(
      args: SelectSubset<T, DraftPickUpdateArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more DraftPicks.
     * @param {DraftPickDeleteManyArgs} args - Arguments to filter DraftPicks to delete.
     * @example
     * // Delete a few DraftPicks
     * const { count } = await prisma.draftPick.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DraftPickDeleteManyArgs>(
      args?: SelectSubset<T, DraftPickDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more DraftPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DraftPicks
     * const draftPick = await prisma.draftPick.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DraftPickUpdateManyArgs>(
      args: SelectSubset<T, DraftPickUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one DraftPick.
     * @param {DraftPickUpsertArgs} args - Arguments to update or create a DraftPick.
     * @example
     * // Update or create a DraftPick
     * const draftPick = await prisma.draftPick.upsert({
     *   create: {
     *     // ... data to create a DraftPick
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DraftPick we want to update
     *   }
     * })
     */
    upsert<T extends DraftPickUpsertArgs>(
      args: SelectSubset<T, DraftPickUpsertArgs<ExtArgs>>
    ): Prisma__DraftPickClient<
      $Result.GetResult<Prisma.$DraftPickPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of DraftPicks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickCountArgs} args - Arguments to filter DraftPicks to count.
     * @example
     * // Count the number of DraftPicks
     * const count = await prisma.draftPick.count({
     *   where: {
     *     // ... the filter for the DraftPicks we want to count
     *   }
     * })
     **/
    count<T extends DraftPickCountArgs>(
      args?: Subset<T, DraftPickCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DraftPickCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a DraftPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DraftPickAggregateArgs>(
      args: Subset<T, DraftPickAggregateArgs>
    ): Prisma.PrismaPromise<GetDraftPickAggregateType<T>>;

    /**
     * Group by DraftPick.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DraftPickGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DraftPickGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DraftPickGroupByArgs['orderBy'] }
        : { orderBy?: DraftPickGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, DraftPickGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetDraftPickGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DraftPick model
     */
    readonly fields: DraftPickFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DraftPick.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DraftPickClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    draft<T extends DraftDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, DraftDefaultArgs<ExtArgs>>
    ): Prisma__DraftClient<
      $Result.GetResult<Prisma.$DraftPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the DraftPick model
   */
  interface DraftPickFieldRefs {
    readonly id: FieldRef<'DraftPick', 'String'>;
    readonly draftId: FieldRef<'DraftPick', 'String'>;
    readonly pickNo: FieldRef<'DraftPick', 'Int'>;
    readonly round: FieldRef<'DraftPick', 'Int'>;
    readonly rosterId: FieldRef<'DraftPick', 'Int'>;
    readonly playerId: FieldRef<'DraftPick', 'String'>;
    readonly pickedBy: FieldRef<'DraftPick', 'String'>;
    readonly metadata: FieldRef<'DraftPick', 'Json'>;
    readonly isKeeper: FieldRef<'DraftPick', 'Boolean'>;
    readonly createdAt: FieldRef<'DraftPick', 'DateTime'>;
    readonly updatedAt: FieldRef<'DraftPick', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * DraftPick findUnique
   */
  export type DraftPickFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * Filter, which DraftPick to fetch.
     */
    where: DraftPickWhereUniqueInput;
  };

  /**
   * DraftPick findUniqueOrThrow
   */
  export type DraftPickFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * Filter, which DraftPick to fetch.
     */
    where: DraftPickWhereUniqueInput;
  };

  /**
   * DraftPick findFirst
   */
  export type DraftPickFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * Filter, which DraftPick to fetch.
     */
    where?: DraftPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DraftPicks.
     */
    cursor?: DraftPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DraftPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DraftPicks.
     */
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[];
  };

  /**
   * DraftPick findFirstOrThrow
   */
  export type DraftPickFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * Filter, which DraftPick to fetch.
     */
    where?: DraftPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DraftPicks.
     */
    cursor?: DraftPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DraftPicks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DraftPicks.
     */
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[];
  };

  /**
   * DraftPick findMany
   */
  export type DraftPickFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * Filter, which DraftPicks to fetch.
     */
    where?: DraftPickWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DraftPicks to fetch.
     */
    orderBy?: DraftPickOrderByWithRelationInput | DraftPickOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DraftPicks.
     */
    cursor?: DraftPickWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DraftPicks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DraftPicks.
     */
    skip?: number;
    distinct?: DraftPickScalarFieldEnum | DraftPickScalarFieldEnum[];
  };

  /**
   * DraftPick create
   */
  export type DraftPickCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * The data needed to create a DraftPick.
     */
    data: XOR<DraftPickCreateInput, DraftPickUncheckedCreateInput>;
  };

  /**
   * DraftPick createMany
   */
  export type DraftPickCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many DraftPicks.
     */
    data: DraftPickCreateManyInput | DraftPickCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * DraftPick createManyAndReturn
   */
  export type DraftPickCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many DraftPicks.
     */
    data: DraftPickCreateManyInput | DraftPickCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * DraftPick update
   */
  export type DraftPickUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * The data needed to update a DraftPick.
     */
    data: XOR<DraftPickUpdateInput, DraftPickUncheckedUpdateInput>;
    /**
     * Choose, which DraftPick to update.
     */
    where: DraftPickWhereUniqueInput;
  };

  /**
   * DraftPick updateMany
   */
  export type DraftPickUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update DraftPicks.
     */
    data: XOR<DraftPickUpdateManyMutationInput, DraftPickUncheckedUpdateManyInput>;
    /**
     * Filter which DraftPicks to update
     */
    where?: DraftPickWhereInput;
  };

  /**
   * DraftPick upsert
   */
  export type DraftPickUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * The filter to search for the DraftPick to update in case it exists.
     */
    where: DraftPickWhereUniqueInput;
    /**
     * In case the DraftPick found by the `where` argument doesn't exist, create a new DraftPick with this data.
     */
    create: XOR<DraftPickCreateInput, DraftPickUncheckedCreateInput>;
    /**
     * In case the DraftPick was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DraftPickUpdateInput, DraftPickUncheckedUpdateInput>;
  };

  /**
   * DraftPick delete
   */
  export type DraftPickDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
    /**
     * Filter which DraftPick to delete.
     */
    where: DraftPickWhereUniqueInput;
  };

  /**
   * DraftPick deleteMany
   */
  export type DraftPickDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DraftPicks to delete
     */
    where?: DraftPickWhereInput;
  };

  /**
   * DraftPick without action
   */
  export type DraftPickDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DraftPick
     */
    select?: DraftPickSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DraftPickInclude<ExtArgs> | null;
  };

  /**
   * Model Player
   */

  export type AggregatePlayer = {
    _count: PlayerCountAggregateOutputType | null;
    _avg: PlayerAvgAggregateOutputType | null;
    _sum: PlayerSumAggregateOutputType | null;
    _min: PlayerMinAggregateOutputType | null;
    _max: PlayerMaxAggregateOutputType | null;
  };

  export type PlayerAvgAggregateOutputType = {
    depthChartOrder: number | null;
    number: number | null;
    age: number | null;
    yearsExp: number | null;
  };

  export type PlayerSumAggregateOutputType = {
    depthChartOrder: number | null;
    number: number | null;
    age: number | null;
    yearsExp: number | null;
  };

  export type PlayerMinAggregateOutputType = {
    id: string | null;
    hashtag: string | null;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    team: string | null;
    position: string | null;
    depthChartOrder: number | null;
    status: string | null;
    injuryStatus: string | null;
    weight: string | null;
    height: string | null;
    number: number | null;
    age: number | null;
    yearsExp: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PlayerMaxAggregateOutputType = {
    id: string | null;
    hashtag: string | null;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    team: string | null;
    position: string | null;
    depthChartOrder: number | null;
    status: string | null;
    injuryStatus: string | null;
    weight: string | null;
    height: string | null;
    number: number | null;
    age: number | null;
    yearsExp: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PlayerCountAggregateOutputType = {
    id: number;
    hashtag: number;
    firstName: number;
    lastName: number;
    fullName: number;
    team: number;
    position: number;
    depthChartOrder: number;
    status: number;
    injuryStatus: number;
    weight: number;
    height: number;
    number: number;
    age: number;
    yearsExp: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type PlayerAvgAggregateInputType = {
    depthChartOrder?: true;
    number?: true;
    age?: true;
    yearsExp?: true;
  };

  export type PlayerSumAggregateInputType = {
    depthChartOrder?: true;
    number?: true;
    age?: true;
    yearsExp?: true;
  };

  export type PlayerMinAggregateInputType = {
    id?: true;
    hashtag?: true;
    firstName?: true;
    lastName?: true;
    fullName?: true;
    team?: true;
    position?: true;
    depthChartOrder?: true;
    status?: true;
    injuryStatus?: true;
    weight?: true;
    height?: true;
    number?: true;
    age?: true;
    yearsExp?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PlayerMaxAggregateInputType = {
    id?: true;
    hashtag?: true;
    firstName?: true;
    lastName?: true;
    fullName?: true;
    team?: true;
    position?: true;
    depthChartOrder?: true;
    status?: true;
    injuryStatus?: true;
    weight?: true;
    height?: true;
    number?: true;
    age?: true;
    yearsExp?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PlayerCountAggregateInputType = {
    id?: true;
    hashtag?: true;
    firstName?: true;
    lastName?: true;
    fullName?: true;
    team?: true;
    position?: true;
    depthChartOrder?: true;
    status?: true;
    injuryStatus?: true;
    weight?: true;
    height?: true;
    number?: true;
    age?: true;
    yearsExp?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type PlayerAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Player to aggregate.
     */
    where?: PlayerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PlayerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Players from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Players.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Players
     **/
    _count?: true | PlayerCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PlayerAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PlayerSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PlayerMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PlayerMaxAggregateInputType;
  };

  export type GetPlayerAggregateType<T extends PlayerAggregateArgs> = {
    [P in keyof T & keyof AggregatePlayer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlayer[P]>
      : GetScalarType<T[P], AggregatePlayer[P]>;
  };

  export type PlayerGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PlayerWhereInput;
    orderBy?: PlayerOrderByWithAggregationInput | PlayerOrderByWithAggregationInput[];
    by: PlayerScalarFieldEnum[] | PlayerScalarFieldEnum;
    having?: PlayerScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlayerCountAggregateInputType | true;
    _avg?: PlayerAvgAggregateInputType;
    _sum?: PlayerSumAggregateInputType;
    _min?: PlayerMinAggregateInputType;
    _max?: PlayerMaxAggregateInputType;
  };

  export type PlayerGroupByOutputType = {
    id: string;
    hashtag: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    team: string | null;
    position: string;
    depthChartOrder: number | null;
    status: string | null;
    injuryStatus: string | null;
    weight: string | null;
    height: string | null;
    number: number | null;
    age: number | null;
    yearsExp: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: PlayerCountAggregateOutputType | null;
    _avg: PlayerAvgAggregateOutputType | null;
    _sum: PlayerSumAggregateOutputType | null;
    _min: PlayerMinAggregateOutputType | null;
    _max: PlayerMaxAggregateOutputType | null;
  };

  type GetPlayerGroupByPayload<T extends PlayerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlayerGroupByOutputType, T['by']> & {
        [P in keyof T & keyof PlayerGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], PlayerGroupByOutputType[P]>
          : GetScalarType<T[P], PlayerGroupByOutputType[P]>;
      }
    >
  >;

  export type PlayerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        hashtag?: boolean;
        firstName?: boolean;
        lastName?: boolean;
        fullName?: boolean;
        team?: boolean;
        position?: boolean;
        depthChartOrder?: boolean;
        status?: boolean;
        injuryStatus?: boolean;
        weight?: boolean;
        height?: boolean;
        number?: boolean;
        age?: boolean;
        yearsExp?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
      },
      ExtArgs['result']['player']
    >;

  export type PlayerSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      hashtag?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      fullName?: boolean;
      team?: boolean;
      position?: boolean;
      depthChartOrder?: boolean;
      status?: boolean;
      injuryStatus?: boolean;
      weight?: boolean;
      height?: boolean;
      number?: boolean;
      age?: boolean;
      yearsExp?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['player']
  >;

  export type PlayerSelectScalar = {
    id?: boolean;
    hashtag?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    fullName?: boolean;
    team?: boolean;
    position?: boolean;
    depthChartOrder?: boolean;
    status?: boolean;
    injuryStatus?: boolean;
    weight?: boolean;
    height?: boolean;
    number?: boolean;
    age?: boolean;
    yearsExp?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type $PlayerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'Player';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        hashtag: string | null;
        firstName: string;
        lastName: string;
        fullName: string;
        team: string | null;
        position: string;
        depthChartOrder: number | null;
        status: string | null;
        injuryStatus: string | null;
        weight: string | null;
        height: string | null;
        number: number | null;
        age: number | null;
        yearsExp: number | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['player']
    >;
    composites: {};
  };

  type PlayerGetPayload<S extends boolean | null | undefined | PlayerDefaultArgs> =
    $Result.GetResult<Prisma.$PlayerPayload, S>;

  type PlayerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    PlayerFindManyArgs,
    'select' | 'include' | 'distinct'
  > & {
    select?: PlayerCountAggregateInputType | true;
  };

  export interface PlayerDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Player']; meta: { name: 'Player' } };
    /**
     * Find zero or one Player that matches the filter.
     * @param {PlayerFindUniqueArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerFindUniqueArgs>(
      args: SelectSubset<T, PlayerFindUniqueArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one Player that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlayerFindUniqueOrThrowArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PlayerFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first Player that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerFindFirstArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerFindFirstArgs>(
      args?: SelectSubset<T, PlayerFindFirstArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first Player that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerFindFirstOrThrowArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PlayerFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more Players that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Players
     * const players = await prisma.player.findMany()
     *
     * // Get first 10 Players
     * const players = await prisma.player.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const playerWithIdOnly = await prisma.player.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PlayerFindManyArgs>(
      args?: SelectSubset<T, PlayerFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a Player.
     * @param {PlayerCreateArgs} args - Arguments to create a Player.
     * @example
     * // Create one Player
     * const Player = await prisma.player.create({
     *   data: {
     *     // ... data to create a Player
     *   }
     * })
     *
     */
    create<T extends PlayerCreateArgs>(
      args: SelectSubset<T, PlayerCreateArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many Players.
     * @param {PlayerCreateManyArgs} args - Arguments to create many Players.
     * @example
     * // Create many Players
     * const player = await prisma.player.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PlayerCreateManyArgs>(
      args?: SelectSubset<T, PlayerCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Players and returns the data saved in the database.
     * @param {PlayerCreateManyAndReturnArgs} args - Arguments to create many Players.
     * @example
     * // Create many Players
     * const player = await prisma.player.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Players and only return the `id`
     * const playerWithIdOnly = await prisma.player.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PlayerCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PlayerCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a Player.
     * @param {PlayerDeleteArgs} args - Arguments to delete one Player.
     * @example
     * // Delete one Player
     * const Player = await prisma.player.delete({
     *   where: {
     *     // ... filter to delete one Player
     *   }
     * })
     *
     */
    delete<T extends PlayerDeleteArgs>(
      args: SelectSubset<T, PlayerDeleteArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one Player.
     * @param {PlayerUpdateArgs} args - Arguments to update one Player.
     * @example
     * // Update one Player
     * const player = await prisma.player.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PlayerUpdateArgs>(
      args: SelectSubset<T, PlayerUpdateArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more Players.
     * @param {PlayerDeleteManyArgs} args - Arguments to filter Players to delete.
     * @example
     * // Delete a few Players
     * const { count } = await prisma.player.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PlayerDeleteManyArgs>(
      args?: SelectSubset<T, PlayerDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Players.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Players
     * const player = await prisma.player.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PlayerUpdateManyArgs>(
      args: SelectSubset<T, PlayerUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one Player.
     * @param {PlayerUpsertArgs} args - Arguments to update or create a Player.
     * @example
     * // Update or create a Player
     * const player = await prisma.player.upsert({
     *   create: {
     *     // ... data to create a Player
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Player we want to update
     *   }
     * })
     */
    upsert<T extends PlayerUpsertArgs>(
      args: SelectSubset<T, PlayerUpsertArgs<ExtArgs>>
    ): Prisma__PlayerClient<
      $Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of Players.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerCountArgs} args - Arguments to filter Players to count.
     * @example
     * // Count the number of Players
     * const count = await prisma.player.count({
     *   where: {
     *     // ... the filter for the Players we want to count
     *   }
     * })
     **/
    count<T extends PlayerCountArgs>(
      args?: Subset<T, PlayerCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlayerCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Player.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PlayerAggregateArgs>(
      args: Subset<T, PlayerAggregateArgs>
    ): Prisma.PrismaPromise<GetPlayerAggregateType<T>>;

    /**
     * Group by Player.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PlayerGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlayerGroupByArgs['orderBy'] }
        : { orderBy?: PlayerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PlayerGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetPlayerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Player model
     */
    readonly fields: PlayerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Player.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlayerClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Player model
   */
  interface PlayerFieldRefs {
    readonly id: FieldRef<'Player', 'String'>;
    readonly hashtag: FieldRef<'Player', 'String'>;
    readonly firstName: FieldRef<'Player', 'String'>;
    readonly lastName: FieldRef<'Player', 'String'>;
    readonly fullName: FieldRef<'Player', 'String'>;
    readonly team: FieldRef<'Player', 'String'>;
    readonly position: FieldRef<'Player', 'String'>;
    readonly depthChartOrder: FieldRef<'Player', 'Int'>;
    readonly status: FieldRef<'Player', 'String'>;
    readonly injuryStatus: FieldRef<'Player', 'String'>;
    readonly weight: FieldRef<'Player', 'String'>;
    readonly height: FieldRef<'Player', 'String'>;
    readonly number: FieldRef<'Player', 'Int'>;
    readonly age: FieldRef<'Player', 'Int'>;
    readonly yearsExp: FieldRef<'Player', 'Int'>;
    readonly createdAt: FieldRef<'Player', 'DateTime'>;
    readonly updatedAt: FieldRef<'Player', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Player findUnique
   */
  export type PlayerFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null;
    /**
     * Filter, which Player to fetch.
     */
    where: PlayerWhereUniqueInput;
  };

  /**
   * Player findUniqueOrThrow
   */
  export type PlayerFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null;
    /**
     * Filter, which Player to fetch.
     */
    where: PlayerWhereUniqueInput;
  };

  /**
   * Player findFirst
   */
  export type PlayerFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null;
    /**
     * Filter, which Player to fetch.
     */
    where?: PlayerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Players.
     */
    cursor?: PlayerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Players from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Players.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Players.
     */
    distinct?: PlayerScalarFieldEnum | PlayerScalarFieldEnum[];
  };

  /**
   * Player findFirstOrThrow
   */
  export type PlayerFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null;
    /**
     * Filter, which Player to fetch.
     */
    where?: PlayerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Players.
     */
    cursor?: PlayerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Players from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Players.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Players.
     */
    distinct?: PlayerScalarFieldEnum | PlayerScalarFieldEnum[];
  };

  /**
   * Player findMany
   */
  export type PlayerFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null;
    /**
     * Filter, which Players to fetch.
     */
    where?: PlayerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Players.
     */
    cursor?: PlayerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Players from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Players.
     */
    skip?: number;
    distinct?: PlayerScalarFieldEnum | PlayerScalarFieldEnum[];
  };

  /**
   * Player create
   */
  export type PlayerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Player
       */
      select?: PlayerSelect<ExtArgs> | null;
      /**
       * The data needed to create a Player.
       */
      data: XOR<PlayerCreateInput, PlayerUncheckedCreateInput>;
    };

  /**
   * Player createMany
   */
  export type PlayerCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Players.
     */
    data: PlayerCreateManyInput | PlayerCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Player createManyAndReturn
   */
  export type PlayerCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many Players.
     */
    data: PlayerCreateManyInput | PlayerCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Player update
   */
  export type PlayerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Player
       */
      select?: PlayerSelect<ExtArgs> | null;
      /**
       * The data needed to update a Player.
       */
      data: XOR<PlayerUpdateInput, PlayerUncheckedUpdateInput>;
      /**
       * Choose, which Player to update.
       */
      where: PlayerWhereUniqueInput;
    };

  /**
   * Player updateMany
   */
  export type PlayerUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Players.
     */
    data: XOR<PlayerUpdateManyMutationInput, PlayerUncheckedUpdateManyInput>;
    /**
     * Filter which Players to update
     */
    where?: PlayerWhereInput;
  };

  /**
   * Player upsert
   */
  export type PlayerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Player
       */
      select?: PlayerSelect<ExtArgs> | null;
      /**
       * The filter to search for the Player to update in case it exists.
       */
      where: PlayerWhereUniqueInput;
      /**
       * In case the Player found by the `where` argument doesn't exist, create a new Player with this data.
       */
      create: XOR<PlayerCreateInput, PlayerUncheckedCreateInput>;
      /**
       * In case the Player was found with the provided `where` argument, update it with this data.
       */
      update: XOR<PlayerUpdateInput, PlayerUncheckedUpdateInput>;
    };

  /**
   * Player delete
   */
  export type PlayerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Player
       */
      select?: PlayerSelect<ExtArgs> | null;
      /**
       * Filter which Player to delete.
       */
      where: PlayerWhereUniqueInput;
    };

  /**
   * Player deleteMany
   */
  export type PlayerDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Players to delete
     */
    where?: PlayerWhereInput;
  };

  /**
   * Player without action
   */
  export type PlayerDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null;
  };

  /**
   * Model PlayerStats
   */

  export type AggregatePlayerStats = {
    _count: PlayerStatsCountAggregateOutputType | null;
    _avg: PlayerStatsAvgAggregateOutputType | null;
    _sum: PlayerStatsSumAggregateOutputType | null;
    _min: PlayerStatsMinAggregateOutputType | null;
    _max: PlayerStatsMaxAggregateOutputType | null;
  };

  export type PlayerStatsAvgAggregateOutputType = {
    week: number | null;
  };

  export type PlayerStatsSumAggregateOutputType = {
    week: number | null;
  };

  export type PlayerStatsMinAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    week: number | null;
    season: string | null;
    statsType: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PlayerStatsMaxAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    week: number | null;
    season: string | null;
    statsType: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PlayerStatsCountAggregateOutputType = {
    id: number;
    playerId: number;
    week: number;
    season: number;
    statsType: number;
    stats: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type PlayerStatsAvgAggregateInputType = {
    week?: true;
  };

  export type PlayerStatsSumAggregateInputType = {
    week?: true;
  };

  export type PlayerStatsMinAggregateInputType = {
    id?: true;
    playerId?: true;
    week?: true;
    season?: true;
    statsType?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PlayerStatsMaxAggregateInputType = {
    id?: true;
    playerId?: true;
    week?: true;
    season?: true;
    statsType?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PlayerStatsCountAggregateInputType = {
    id?: true;
    playerId?: true;
    week?: true;
    season?: true;
    statsType?: true;
    stats?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type PlayerStatsAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which PlayerStats to aggregate.
     */
    where?: PlayerStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerStats to fetch.
     */
    orderBy?: PlayerStatsOrderByWithRelationInput | PlayerStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PlayerStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PlayerStats
     **/
    _count?: true | PlayerStatsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PlayerStatsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PlayerStatsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PlayerStatsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PlayerStatsMaxAggregateInputType;
  };

  export type GetPlayerStatsAggregateType<T extends PlayerStatsAggregateArgs> = {
    [P in keyof T & keyof AggregatePlayerStats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlayerStats[P]>
      : GetScalarType<T[P], AggregatePlayerStats[P]>;
  };

  export type PlayerStatsGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PlayerStatsWhereInput;
    orderBy?: PlayerStatsOrderByWithAggregationInput | PlayerStatsOrderByWithAggregationInput[];
    by: PlayerStatsScalarFieldEnum[] | PlayerStatsScalarFieldEnum;
    having?: PlayerStatsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlayerStatsCountAggregateInputType | true;
    _avg?: PlayerStatsAvgAggregateInputType;
    _sum?: PlayerStatsSumAggregateInputType;
    _min?: PlayerStatsMinAggregateInputType;
    _max?: PlayerStatsMaxAggregateInputType;
  };

  export type PlayerStatsGroupByOutputType = {
    id: string;
    playerId: string;
    week: number;
    season: string;
    statsType: string;
    stats: JsonValue;
    createdAt: Date;
    updatedAt: Date;
    _count: PlayerStatsCountAggregateOutputType | null;
    _avg: PlayerStatsAvgAggregateOutputType | null;
    _sum: PlayerStatsSumAggregateOutputType | null;
    _min: PlayerStatsMinAggregateOutputType | null;
    _max: PlayerStatsMaxAggregateOutputType | null;
  };

  type GetPlayerStatsGroupByPayload<T extends PlayerStatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlayerStatsGroupByOutputType, T['by']> & {
        [P in keyof T & keyof PlayerStatsGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], PlayerStatsGroupByOutputType[P]>
          : GetScalarType<T[P], PlayerStatsGroupByOutputType[P]>;
      }
    >
  >;

  export type PlayerStatsSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      playerId?: boolean;
      week?: boolean;
      season?: boolean;
      statsType?: boolean;
      stats?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['playerStats']
  >;

  export type PlayerStatsSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      playerId?: boolean;
      week?: boolean;
      season?: boolean;
      statsType?: boolean;
      stats?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['playerStats']
  >;

  export type PlayerStatsSelectScalar = {
    id?: boolean;
    playerId?: boolean;
    week?: boolean;
    season?: boolean;
    statsType?: boolean;
    stats?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type $PlayerStatsPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'PlayerStats';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        playerId: string;
        week: number;
        season: string;
        statsType: string;
        stats: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['playerStats']
    >;
    composites: {};
  };

  type PlayerStatsGetPayload<S extends boolean | null | undefined | PlayerStatsDefaultArgs> =
    $Result.GetResult<Prisma.$PlayerStatsPayload, S>;

  type PlayerStatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlayerStatsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlayerStatsCountAggregateInputType | true;
    };

  export interface PlayerStatsDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['PlayerStats'];
      meta: { name: 'PlayerStats' };
    };
    /**
     * Find zero or one PlayerStats that matches the filter.
     * @param {PlayerStatsFindUniqueArgs} args - Arguments to find a PlayerStats
     * @example
     * // Get one PlayerStats
     * const playerStats = await prisma.playerStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerStatsFindUniqueArgs>(
      args: SelectSubset<T, PlayerStatsFindUniqueArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one PlayerStats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlayerStatsFindUniqueOrThrowArgs} args - Arguments to find a PlayerStats
     * @example
     * // Get one PlayerStats
     * const playerStats = await prisma.playerStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerStatsFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PlayerStatsFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first PlayerStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsFindFirstArgs} args - Arguments to find a PlayerStats
     * @example
     * // Get one PlayerStats
     * const playerStats = await prisma.playerStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerStatsFindFirstArgs>(
      args?: SelectSubset<T, PlayerStatsFindFirstArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first PlayerStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsFindFirstOrThrowArgs} args - Arguments to find a PlayerStats
     * @example
     * // Get one PlayerStats
     * const playerStats = await prisma.playerStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerStatsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PlayerStatsFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more PlayerStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlayerStats
     * const playerStats = await prisma.playerStats.findMany()
     *
     * // Get first 10 PlayerStats
     * const playerStats = await prisma.playerStats.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const playerStatsWithIdOnly = await prisma.playerStats.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PlayerStatsFindManyArgs>(
      args?: SelectSubset<T, PlayerStatsFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'findMany'>>;

    /**
     * Create a PlayerStats.
     * @param {PlayerStatsCreateArgs} args - Arguments to create a PlayerStats.
     * @example
     * // Create one PlayerStats
     * const PlayerStats = await prisma.playerStats.create({
     *   data: {
     *     // ... data to create a PlayerStats
     *   }
     * })
     *
     */
    create<T extends PlayerStatsCreateArgs>(
      args: SelectSubset<T, PlayerStatsCreateArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many PlayerStats.
     * @param {PlayerStatsCreateManyArgs} args - Arguments to create many PlayerStats.
     * @example
     * // Create many PlayerStats
     * const playerStats = await prisma.playerStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PlayerStatsCreateManyArgs>(
      args?: SelectSubset<T, PlayerStatsCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many PlayerStats and returns the data saved in the database.
     * @param {PlayerStatsCreateManyAndReturnArgs} args - Arguments to create many PlayerStats.
     * @example
     * // Create many PlayerStats
     * const playerStats = await prisma.playerStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PlayerStats and only return the `id`
     * const playerStatsWithIdOnly = await prisma.playerStats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PlayerStatsCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PlayerStatsCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a PlayerStats.
     * @param {PlayerStatsDeleteArgs} args - Arguments to delete one PlayerStats.
     * @example
     * // Delete one PlayerStats
     * const PlayerStats = await prisma.playerStats.delete({
     *   where: {
     *     // ... filter to delete one PlayerStats
     *   }
     * })
     *
     */
    delete<T extends PlayerStatsDeleteArgs>(
      args: SelectSubset<T, PlayerStatsDeleteArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one PlayerStats.
     * @param {PlayerStatsUpdateArgs} args - Arguments to update one PlayerStats.
     * @example
     * // Update one PlayerStats
     * const playerStats = await prisma.playerStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PlayerStatsUpdateArgs>(
      args: SelectSubset<T, PlayerStatsUpdateArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more PlayerStats.
     * @param {PlayerStatsDeleteManyArgs} args - Arguments to filter PlayerStats to delete.
     * @example
     * // Delete a few PlayerStats
     * const { count } = await prisma.playerStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PlayerStatsDeleteManyArgs>(
      args?: SelectSubset<T, PlayerStatsDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more PlayerStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlayerStats
     * const playerStats = await prisma.playerStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PlayerStatsUpdateManyArgs>(
      args: SelectSubset<T, PlayerStatsUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one PlayerStats.
     * @param {PlayerStatsUpsertArgs} args - Arguments to update or create a PlayerStats.
     * @example
     * // Update or create a PlayerStats
     * const playerStats = await prisma.playerStats.upsert({
     *   create: {
     *     // ... data to create a PlayerStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlayerStats we want to update
     *   }
     * })
     */
    upsert<T extends PlayerStatsUpsertArgs>(
      args: SelectSubset<T, PlayerStatsUpsertArgs<ExtArgs>>
    ): Prisma__PlayerStatsClient<
      $Result.GetResult<Prisma.$PlayerStatsPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of PlayerStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsCountArgs} args - Arguments to filter PlayerStats to count.
     * @example
     * // Count the number of PlayerStats
     * const count = await prisma.playerStats.count({
     *   where: {
     *     // ... the filter for the PlayerStats we want to count
     *   }
     * })
     **/
    count<T extends PlayerStatsCountArgs>(
      args?: Subset<T, PlayerStatsCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlayerStatsCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a PlayerStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PlayerStatsAggregateArgs>(
      args: Subset<T, PlayerStatsAggregateArgs>
    ): Prisma.PrismaPromise<GetPlayerStatsAggregateType<T>>;

    /**
     * Group by PlayerStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerStatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PlayerStatsGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlayerStatsGroupByArgs['orderBy'] }
        : { orderBy?: PlayerStatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PlayerStatsGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors ? GetPlayerStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PlayerStats model
     */
    readonly fields: PlayerStatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlayerStats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlayerStatsClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the PlayerStats model
   */
  interface PlayerStatsFieldRefs {
    readonly id: FieldRef<'PlayerStats', 'String'>;
    readonly playerId: FieldRef<'PlayerStats', 'String'>;
    readonly week: FieldRef<'PlayerStats', 'Int'>;
    readonly season: FieldRef<'PlayerStats', 'String'>;
    readonly statsType: FieldRef<'PlayerStats', 'String'>;
    readonly stats: FieldRef<'PlayerStats', 'Json'>;
    readonly createdAt: FieldRef<'PlayerStats', 'DateTime'>;
    readonly updatedAt: FieldRef<'PlayerStats', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * PlayerStats findUnique
   */
  export type PlayerStatsFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerStats to fetch.
     */
    where: PlayerStatsWhereUniqueInput;
  };

  /**
   * PlayerStats findUniqueOrThrow
   */
  export type PlayerStatsFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerStats to fetch.
     */
    where: PlayerStatsWhereUniqueInput;
  };

  /**
   * PlayerStats findFirst
   */
  export type PlayerStatsFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerStats to fetch.
     */
    where?: PlayerStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerStats to fetch.
     */
    orderBy?: PlayerStatsOrderByWithRelationInput | PlayerStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlayerStats.
     */
    cursor?: PlayerStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerStats.
     */
    distinct?: PlayerStatsScalarFieldEnum | PlayerStatsScalarFieldEnum[];
  };

  /**
   * PlayerStats findFirstOrThrow
   */
  export type PlayerStatsFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerStats to fetch.
     */
    where?: PlayerStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerStats to fetch.
     */
    orderBy?: PlayerStatsOrderByWithRelationInput | PlayerStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlayerStats.
     */
    cursor?: PlayerStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerStats.
     */
    distinct?: PlayerStatsScalarFieldEnum | PlayerStatsScalarFieldEnum[];
  };

  /**
   * PlayerStats findMany
   */
  export type PlayerStatsFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerStats to fetch.
     */
    where?: PlayerStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerStats to fetch.
     */
    orderBy?: PlayerStatsOrderByWithRelationInput | PlayerStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PlayerStats.
     */
    cursor?: PlayerStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerStats.
     */
    skip?: number;
    distinct?: PlayerStatsScalarFieldEnum | PlayerStatsScalarFieldEnum[];
  };

  /**
   * PlayerStats create
   */
  export type PlayerStatsCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * The data needed to create a PlayerStats.
     */
    data: XOR<PlayerStatsCreateInput, PlayerStatsUncheckedCreateInput>;
  };

  /**
   * PlayerStats createMany
   */
  export type PlayerStatsCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many PlayerStats.
     */
    data: PlayerStatsCreateManyInput | PlayerStatsCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * PlayerStats createManyAndReturn
   */
  export type PlayerStatsCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many PlayerStats.
     */
    data: PlayerStatsCreateManyInput | PlayerStatsCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * PlayerStats update
   */
  export type PlayerStatsUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * The data needed to update a PlayerStats.
     */
    data: XOR<PlayerStatsUpdateInput, PlayerStatsUncheckedUpdateInput>;
    /**
     * Choose, which PlayerStats to update.
     */
    where: PlayerStatsWhereUniqueInput;
  };

  /**
   * PlayerStats updateMany
   */
  export type PlayerStatsUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update PlayerStats.
     */
    data: XOR<PlayerStatsUpdateManyMutationInput, PlayerStatsUncheckedUpdateManyInput>;
    /**
     * Filter which PlayerStats to update
     */
    where?: PlayerStatsWhereInput;
  };

  /**
   * PlayerStats upsert
   */
  export type PlayerStatsUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * The filter to search for the PlayerStats to update in case it exists.
     */
    where: PlayerStatsWhereUniqueInput;
    /**
     * In case the PlayerStats found by the `where` argument doesn't exist, create a new PlayerStats with this data.
     */
    create: XOR<PlayerStatsCreateInput, PlayerStatsUncheckedCreateInput>;
    /**
     * In case the PlayerStats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlayerStatsUpdateInput, PlayerStatsUncheckedUpdateInput>;
  };

  /**
   * PlayerStats delete
   */
  export type PlayerStatsDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
    /**
     * Filter which PlayerStats to delete.
     */
    where: PlayerStatsWhereUniqueInput;
  };

  /**
   * PlayerStats deleteMany
   */
  export type PlayerStatsDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which PlayerStats to delete
     */
    where?: PlayerStatsWhereInput;
  };

  /**
   * PlayerStats without action
   */
  export type PlayerStatsDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerStats
     */
    select?: PlayerStatsSelect<ExtArgs> | null;
  };

  /**
   * Model WeeklyMetrics
   */

  export type AggregateWeeklyMetrics = {
    _count: WeeklyMetricsCountAggregateOutputType | null;
    _avg: WeeklyMetricsAvgAggregateOutputType | null;
    _sum: WeeklyMetricsSumAggregateOutputType | null;
    _min: WeeklyMetricsMinAggregateOutputType | null;
    _max: WeeklyMetricsMaxAggregateOutputType | null;
  };

  export type WeeklyMetricsAvgAggregateOutputType = {
    rosterId: number | null;
    week: number | null;
    totalPoints: number | null;
    expectedWins: number | null;
    luckRating: number | null;
    opponentPoints: number | null;
  };

  export type WeeklyMetricsSumAggregateOutputType = {
    rosterId: number | null;
    week: number | null;
    totalPoints: number | null;
    expectedWins: number | null;
    luckRating: number | null;
    opponentPoints: number | null;
  };

  export type WeeklyMetricsMinAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    rosterId: number | null;
    week: number | null;
    totalPoints: number | null;
    expectedWins: number | null;
    luckRating: number | null;
    opponentPoints: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type WeeklyMetricsMaxAggregateOutputType = {
    id: string | null;
    leagueId: string | null;
    rosterId: number | null;
    week: number | null;
    totalPoints: number | null;
    expectedWins: number | null;
    luckRating: number | null;
    opponentPoints: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type WeeklyMetricsCountAggregateOutputType = {
    id: number;
    leagueId: number;
    rosterId: number;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type WeeklyMetricsAvgAggregateInputType = {
    rosterId?: true;
    week?: true;
    totalPoints?: true;
    expectedWins?: true;
    luckRating?: true;
    opponentPoints?: true;
  };

  export type WeeklyMetricsSumAggregateInputType = {
    rosterId?: true;
    week?: true;
    totalPoints?: true;
    expectedWins?: true;
    luckRating?: true;
    opponentPoints?: true;
  };

  export type WeeklyMetricsMinAggregateInputType = {
    id?: true;
    leagueId?: true;
    rosterId?: true;
    week?: true;
    totalPoints?: true;
    expectedWins?: true;
    luckRating?: true;
    opponentPoints?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type WeeklyMetricsMaxAggregateInputType = {
    id?: true;
    leagueId?: true;
    rosterId?: true;
    week?: true;
    totalPoints?: true;
    expectedWins?: true;
    luckRating?: true;
    opponentPoints?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type WeeklyMetricsCountAggregateInputType = {
    id?: true;
    leagueId?: true;
    rosterId?: true;
    week?: true;
    totalPoints?: true;
    expectedWins?: true;
    luckRating?: true;
    opponentPoints?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type WeeklyMetricsAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which WeeklyMetrics to aggregate.
     */
    where?: WeeklyMetricsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyMetrics to fetch.
     */
    orderBy?: WeeklyMetricsOrderByWithRelationInput | WeeklyMetricsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WeeklyMetricsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyMetrics.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned WeeklyMetrics
     **/
    _count?: true | WeeklyMetricsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: WeeklyMetricsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: WeeklyMetricsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: WeeklyMetricsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: WeeklyMetricsMaxAggregateInputType;
  };

  export type GetWeeklyMetricsAggregateType<T extends WeeklyMetricsAggregateArgs> = {
    [P in keyof T & keyof AggregateWeeklyMetrics]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeeklyMetrics[P]>
      : GetScalarType<T[P], AggregateWeeklyMetrics[P]>;
  };

  export type WeeklyMetricsGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WeeklyMetricsWhereInput;
    orderBy?: WeeklyMetricsOrderByWithAggregationInput | WeeklyMetricsOrderByWithAggregationInput[];
    by: WeeklyMetricsScalarFieldEnum[] | WeeklyMetricsScalarFieldEnum;
    having?: WeeklyMetricsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WeeklyMetricsCountAggregateInputType | true;
    _avg?: WeeklyMetricsAvgAggregateInputType;
    _sum?: WeeklyMetricsSumAggregateInputType;
    _min?: WeeklyMetricsMinAggregateInputType;
    _max?: WeeklyMetricsMaxAggregateInputType;
  };

  export type WeeklyMetricsGroupByOutputType = {
    id: string;
    leagueId: string;
    rosterId: number;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt: Date;
    updatedAt: Date;
    _count: WeeklyMetricsCountAggregateOutputType | null;
    _avg: WeeklyMetricsAvgAggregateOutputType | null;
    _sum: WeeklyMetricsSumAggregateOutputType | null;
    _min: WeeklyMetricsMinAggregateOutputType | null;
    _max: WeeklyMetricsMaxAggregateOutputType | null;
  };

  type GetWeeklyMetricsGroupByPayload<T extends WeeklyMetricsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeeklyMetricsGroupByOutputType, T['by']> & {
        [P in keyof T & keyof WeeklyMetricsGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], WeeklyMetricsGroupByOutputType[P]>
          : GetScalarType<T[P], WeeklyMetricsGroupByOutputType[P]>;
      }
    >
  >;

  export type WeeklyMetricsSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      rosterId?: boolean;
      week?: boolean;
      totalPoints?: boolean;
      expectedWins?: boolean;
      luckRating?: boolean;
      opponentPoints?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      roster?: boolean | RosterDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['weeklyMetrics']
  >;

  export type WeeklyMetricsSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      leagueId?: boolean;
      rosterId?: boolean;
      week?: boolean;
      totalPoints?: boolean;
      expectedWins?: boolean;
      luckRating?: boolean;
      opponentPoints?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      league?: boolean | LeagueDefaultArgs<ExtArgs>;
      roster?: boolean | RosterDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['weeklyMetrics']
  >;

  export type WeeklyMetricsSelectScalar = {
    id?: boolean;
    leagueId?: boolean;
    rosterId?: boolean;
    week?: boolean;
    totalPoints?: boolean;
    expectedWins?: boolean;
    luckRating?: boolean;
    opponentPoints?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type WeeklyMetricsInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    roster?: boolean | RosterDefaultArgs<ExtArgs>;
  };
  export type WeeklyMetricsIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    league?: boolean | LeagueDefaultArgs<ExtArgs>;
    roster?: boolean | RosterDefaultArgs<ExtArgs>;
  };

  export type $WeeklyMetricsPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'WeeklyMetrics';
    objects: {
      league: Prisma.$LeaguePayload<ExtArgs>;
      roster: Prisma.$RosterPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        leagueId: string;
        rosterId: number;
        week: number;
        totalPoints: number;
        expectedWins: number;
        luckRating: number;
        opponentPoints: number;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['weeklyMetrics']
    >;
    composites: {};
  };

  type WeeklyMetricsGetPayload<S extends boolean | null | undefined | WeeklyMetricsDefaultArgs> =
    $Result.GetResult<Prisma.$WeeklyMetricsPayload, S>;

  type WeeklyMetricsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeeklyMetricsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WeeklyMetricsCountAggregateInputType | true;
    };

  export interface WeeklyMetricsDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['WeeklyMetrics'];
      meta: { name: 'WeeklyMetrics' };
    };
    /**
     * Find zero or one WeeklyMetrics that matches the filter.
     * @param {WeeklyMetricsFindUniqueArgs} args - Arguments to find a WeeklyMetrics
     * @example
     * // Get one WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeeklyMetricsFindUniqueArgs>(
      args: SelectSubset<T, WeeklyMetricsFindUniqueArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one WeeklyMetrics that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeeklyMetricsFindUniqueOrThrowArgs} args - Arguments to find a WeeklyMetrics
     * @example
     * // Get one WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeeklyMetricsFindUniqueOrThrowArgs>(
      args: SelectSubset<T, WeeklyMetricsFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first WeeklyMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsFindFirstArgs} args - Arguments to find a WeeklyMetrics
     * @example
     * // Get one WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeeklyMetricsFindFirstArgs>(
      args?: SelectSubset<T, WeeklyMetricsFindFirstArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first WeeklyMetrics that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsFindFirstOrThrowArgs} args - Arguments to find a WeeklyMetrics
     * @example
     * // Get one WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeeklyMetricsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, WeeklyMetricsFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more WeeklyMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.findMany()
     *
     * // Get first 10 WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const weeklyMetricsWithIdOnly = await prisma.weeklyMetrics.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WeeklyMetricsFindManyArgs>(
      args?: SelectSubset<T, WeeklyMetricsFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'findMany'>
    >;

    /**
     * Create a WeeklyMetrics.
     * @param {WeeklyMetricsCreateArgs} args - Arguments to create a WeeklyMetrics.
     * @example
     * // Create one WeeklyMetrics
     * const WeeklyMetrics = await prisma.weeklyMetrics.create({
     *   data: {
     *     // ... data to create a WeeklyMetrics
     *   }
     * })
     *
     */
    create<T extends WeeklyMetricsCreateArgs>(
      args: SelectSubset<T, WeeklyMetricsCreateArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many WeeklyMetrics.
     * @param {WeeklyMetricsCreateManyArgs} args - Arguments to create many WeeklyMetrics.
     * @example
     * // Create many WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WeeklyMetricsCreateManyArgs>(
      args?: SelectSubset<T, WeeklyMetricsCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many WeeklyMetrics and returns the data saved in the database.
     * @param {WeeklyMetricsCreateManyAndReturnArgs} args - Arguments to create many WeeklyMetrics.
     * @example
     * // Create many WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many WeeklyMetrics and only return the `id`
     * const weeklyMetricsWithIdOnly = await prisma.weeklyMetrics.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WeeklyMetricsCreateManyAndReturnArgs>(
      args?: SelectSubset<T, WeeklyMetricsCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a WeeklyMetrics.
     * @param {WeeklyMetricsDeleteArgs} args - Arguments to delete one WeeklyMetrics.
     * @example
     * // Delete one WeeklyMetrics
     * const WeeklyMetrics = await prisma.weeklyMetrics.delete({
     *   where: {
     *     // ... filter to delete one WeeklyMetrics
     *   }
     * })
     *
     */
    delete<T extends WeeklyMetricsDeleteArgs>(
      args: SelectSubset<T, WeeklyMetricsDeleteArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one WeeklyMetrics.
     * @param {WeeklyMetricsUpdateArgs} args - Arguments to update one WeeklyMetrics.
     * @example
     * // Update one WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WeeklyMetricsUpdateArgs>(
      args: SelectSubset<T, WeeklyMetricsUpdateArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more WeeklyMetrics.
     * @param {WeeklyMetricsDeleteManyArgs} args - Arguments to filter WeeklyMetrics to delete.
     * @example
     * // Delete a few WeeklyMetrics
     * const { count } = await prisma.weeklyMetrics.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WeeklyMetricsDeleteManyArgs>(
      args?: SelectSubset<T, WeeklyMetricsDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more WeeklyMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WeeklyMetricsUpdateManyArgs>(
      args: SelectSubset<T, WeeklyMetricsUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one WeeklyMetrics.
     * @param {WeeklyMetricsUpsertArgs} args - Arguments to update or create a WeeklyMetrics.
     * @example
     * // Update or create a WeeklyMetrics
     * const weeklyMetrics = await prisma.weeklyMetrics.upsert({
     *   create: {
     *     // ... data to create a WeeklyMetrics
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeeklyMetrics we want to update
     *   }
     * })
     */
    upsert<T extends WeeklyMetricsUpsertArgs>(
      args: SelectSubset<T, WeeklyMetricsUpsertArgs<ExtArgs>>
    ): Prisma__WeeklyMetricsClient<
      $Result.GetResult<Prisma.$WeeklyMetricsPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of WeeklyMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsCountArgs} args - Arguments to filter WeeklyMetrics to count.
     * @example
     * // Count the number of WeeklyMetrics
     * const count = await prisma.weeklyMetrics.count({
     *   where: {
     *     // ... the filter for the WeeklyMetrics we want to count
     *   }
     * })
     **/
    count<T extends WeeklyMetricsCountArgs>(
      args?: Subset<T, WeeklyMetricsCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeeklyMetricsCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a WeeklyMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends WeeklyMetricsAggregateArgs>(
      args: Subset<T, WeeklyMetricsAggregateArgs>
    ): Prisma.PrismaPromise<GetWeeklyMetricsAggregateType<T>>;

    /**
     * Group by WeeklyMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyMetricsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends WeeklyMetricsGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeeklyMetricsGroupByArgs['orderBy'] }
        : { orderBy?: WeeklyMetricsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, WeeklyMetricsGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetWeeklyMetricsGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the WeeklyMetrics model
     */
    readonly fields: WeeklyMetricsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeeklyMetrics.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeeklyMetricsClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    league<T extends LeagueDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, LeagueDefaultArgs<ExtArgs>>
    ): Prisma__LeagueClient<
      $Result.GetResult<Prisma.$LeaguePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    roster<T extends RosterDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, RosterDefaultArgs<ExtArgs>>
    ): Prisma__RosterClient<
      $Result.GetResult<Prisma.$RosterPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null,
      Null,
      ExtArgs
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the WeeklyMetrics model
   */
  interface WeeklyMetricsFieldRefs {
    readonly id: FieldRef<'WeeklyMetrics', 'String'>;
    readonly leagueId: FieldRef<'WeeklyMetrics', 'String'>;
    readonly rosterId: FieldRef<'WeeklyMetrics', 'Int'>;
    readonly week: FieldRef<'WeeklyMetrics', 'Int'>;
    readonly totalPoints: FieldRef<'WeeklyMetrics', 'Float'>;
    readonly expectedWins: FieldRef<'WeeklyMetrics', 'Float'>;
    readonly luckRating: FieldRef<'WeeklyMetrics', 'Float'>;
    readonly opponentPoints: FieldRef<'WeeklyMetrics', 'Float'>;
    readonly createdAt: FieldRef<'WeeklyMetrics', 'DateTime'>;
    readonly updatedAt: FieldRef<'WeeklyMetrics', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * WeeklyMetrics findUnique
   */
  export type WeeklyMetricsFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyMetrics to fetch.
     */
    where: WeeklyMetricsWhereUniqueInput;
  };

  /**
   * WeeklyMetrics findUniqueOrThrow
   */
  export type WeeklyMetricsFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyMetrics to fetch.
     */
    where: WeeklyMetricsWhereUniqueInput;
  };

  /**
   * WeeklyMetrics findFirst
   */
  export type WeeklyMetricsFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyMetrics to fetch.
     */
    where?: WeeklyMetricsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyMetrics to fetch.
     */
    orderBy?: WeeklyMetricsOrderByWithRelationInput | WeeklyMetricsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WeeklyMetrics.
     */
    cursor?: WeeklyMetricsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyMetrics.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WeeklyMetrics.
     */
    distinct?: WeeklyMetricsScalarFieldEnum | WeeklyMetricsScalarFieldEnum[];
  };

  /**
   * WeeklyMetrics findFirstOrThrow
   */
  export type WeeklyMetricsFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyMetrics to fetch.
     */
    where?: WeeklyMetricsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyMetrics to fetch.
     */
    orderBy?: WeeklyMetricsOrderByWithRelationInput | WeeklyMetricsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WeeklyMetrics.
     */
    cursor?: WeeklyMetricsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyMetrics.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WeeklyMetrics.
     */
    distinct?: WeeklyMetricsScalarFieldEnum | WeeklyMetricsScalarFieldEnum[];
  };

  /**
   * WeeklyMetrics findMany
   */
  export type WeeklyMetricsFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyMetrics to fetch.
     */
    where?: WeeklyMetricsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyMetrics to fetch.
     */
    orderBy?: WeeklyMetricsOrderByWithRelationInput | WeeklyMetricsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing WeeklyMetrics.
     */
    cursor?: WeeklyMetricsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyMetrics from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyMetrics.
     */
    skip?: number;
    distinct?: WeeklyMetricsScalarFieldEnum | WeeklyMetricsScalarFieldEnum[];
  };

  /**
   * WeeklyMetrics create
   */
  export type WeeklyMetricsCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * The data needed to create a WeeklyMetrics.
     */
    data: XOR<WeeklyMetricsCreateInput, WeeklyMetricsUncheckedCreateInput>;
  };

  /**
   * WeeklyMetrics createMany
   */
  export type WeeklyMetricsCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many WeeklyMetrics.
     */
    data: WeeklyMetricsCreateManyInput | WeeklyMetricsCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * WeeklyMetrics createManyAndReturn
   */
  export type WeeklyMetricsCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many WeeklyMetrics.
     */
    data: WeeklyMetricsCreateManyInput | WeeklyMetricsCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * WeeklyMetrics update
   */
  export type WeeklyMetricsUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * The data needed to update a WeeklyMetrics.
     */
    data: XOR<WeeklyMetricsUpdateInput, WeeklyMetricsUncheckedUpdateInput>;
    /**
     * Choose, which WeeklyMetrics to update.
     */
    where: WeeklyMetricsWhereUniqueInput;
  };

  /**
   * WeeklyMetrics updateMany
   */
  export type WeeklyMetricsUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update WeeklyMetrics.
     */
    data: XOR<WeeklyMetricsUpdateManyMutationInput, WeeklyMetricsUncheckedUpdateManyInput>;
    /**
     * Filter which WeeklyMetrics to update
     */
    where?: WeeklyMetricsWhereInput;
  };

  /**
   * WeeklyMetrics upsert
   */
  export type WeeklyMetricsUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * The filter to search for the WeeklyMetrics to update in case it exists.
     */
    where: WeeklyMetricsWhereUniqueInput;
    /**
     * In case the WeeklyMetrics found by the `where` argument doesn't exist, create a new WeeklyMetrics with this data.
     */
    create: XOR<WeeklyMetricsCreateInput, WeeklyMetricsUncheckedCreateInput>;
    /**
     * In case the WeeklyMetrics was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeeklyMetricsUpdateInput, WeeklyMetricsUncheckedUpdateInput>;
  };

  /**
   * WeeklyMetrics delete
   */
  export type WeeklyMetricsDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
    /**
     * Filter which WeeklyMetrics to delete.
     */
    where: WeeklyMetricsWhereUniqueInput;
  };

  /**
   * WeeklyMetrics deleteMany
   */
  export type WeeklyMetricsDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which WeeklyMetrics to delete
     */
    where?: WeeklyMetricsWhereInput;
  };

  /**
   * WeeklyMetrics without action
   */
  export type WeeklyMetricsDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WeeklyMetrics
     */
    select?: WeeklyMetricsSelect<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeeklyMetricsInclude<ExtArgs> | null;
  };

  /**
   * Model PositionVariance
   */

  export type AggregatePositionVariance = {
    _count: PositionVarianceCountAggregateOutputType | null;
    _avg: PositionVarianceAvgAggregateOutputType | null;
    _sum: PositionVarianceSumAggregateOutputType | null;
    _min: PositionVarianceMinAggregateOutputType | null;
    _max: PositionVarianceMaxAggregateOutputType | null;
  };

  export type PositionVarianceAvgAggregateOutputType = {
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
  };

  export type PositionVarianceSumAggregateOutputType = {
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
  };

  export type PositionVarianceMinAggregateOutputType = {
    id: string | null;
    position: string | null;
    season: string | null;
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
    lastUpdated: Date | null;
    createdAt: Date | null;
  };

  export type PositionVarianceMaxAggregateOutputType = {
    id: string | null;
    position: string | null;
    season: string | null;
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
    lastUpdated: Date | null;
    createdAt: Date | null;
  };

  export type PositionVarianceCountAggregateOutputType = {
    id: number;
    position: number;
    season: number;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated: number;
    createdAt: number;
    _all: number;
  };

  export type PositionVarianceAvgAggregateInputType = {
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
  };

  export type PositionVarianceSumAggregateInputType = {
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
  };

  export type PositionVarianceMinAggregateInputType = {
    id?: true;
    position?: true;
    season?: true;
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
    lastUpdated?: true;
    createdAt?: true;
  };

  export type PositionVarianceMaxAggregateInputType = {
    id?: true;
    position?: true;
    season?: true;
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
    lastUpdated?: true;
    createdAt?: true;
  };

  export type PositionVarianceCountAggregateInputType = {
    id?: true;
    position?: true;
    season?: true;
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
    lastUpdated?: true;
    createdAt?: true;
    _all?: true;
  };

  export type PositionVarianceAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which PositionVariance to aggregate.
     */
    where?: PositionVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PositionVariances to fetch.
     */
    orderBy?: PositionVarianceOrderByWithRelationInput | PositionVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PositionVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PositionVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PositionVariances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PositionVariances
     **/
    _count?: true | PositionVarianceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PositionVarianceAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PositionVarianceSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PositionVarianceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PositionVarianceMaxAggregateInputType;
  };

  export type GetPositionVarianceAggregateType<T extends PositionVarianceAggregateArgs> = {
    [P in keyof T & keyof AggregatePositionVariance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePositionVariance[P]>
      : GetScalarType<T[P], AggregatePositionVariance[P]>;
  };

  export type PositionVarianceGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PositionVarianceWhereInput;
    orderBy?:
      | PositionVarianceOrderByWithAggregationInput
      | PositionVarianceOrderByWithAggregationInput[];
    by: PositionVarianceScalarFieldEnum[] | PositionVarianceScalarFieldEnum;
    having?: PositionVarianceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PositionVarianceCountAggregateInputType | true;
    _avg?: PositionVarianceAvgAggregateInputType;
    _sum?: PositionVarianceSumAggregateInputType;
    _min?: PositionVarianceMinAggregateInputType;
    _max?: PositionVarianceMaxAggregateInputType;
  };

  export type PositionVarianceGroupByOutputType = {
    id: string;
    position: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated: Date;
    createdAt: Date;
    _count: PositionVarianceCountAggregateOutputType | null;
    _avg: PositionVarianceAvgAggregateOutputType | null;
    _sum: PositionVarianceSumAggregateOutputType | null;
    _min: PositionVarianceMinAggregateOutputType | null;
    _max: PositionVarianceMaxAggregateOutputType | null;
  };

  type GetPositionVarianceGroupByPayload<T extends PositionVarianceGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<PositionVarianceGroupByOutputType, T['by']> & {
          [P in keyof T & keyof PositionVarianceGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PositionVarianceGroupByOutputType[P]>
            : GetScalarType<T[P], PositionVarianceGroupByOutputType[P]>;
        }
      >
    >;

  export type PositionVarianceSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      position?: boolean;
      season?: boolean;
      sampleSize?: boolean;
      meanError?: boolean;
      stdDev?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['positionVariance']
  >;

  export type PositionVarianceSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      position?: boolean;
      season?: boolean;
      sampleSize?: boolean;
      meanError?: boolean;
      stdDev?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['positionVariance']
  >;

  export type PositionVarianceSelectScalar = {
    id?: boolean;
    position?: boolean;
    season?: boolean;
    sampleSize?: boolean;
    meanError?: boolean;
    stdDev?: boolean;
    lastUpdated?: boolean;
    createdAt?: boolean;
  };

  export type $PositionVariancePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'PositionVariance';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        position: string;
        season: string;
        sampleSize: number;
        meanError: number;
        stdDev: number;
        lastUpdated: Date;
        createdAt: Date;
      },
      ExtArgs['result']['positionVariance']
    >;
    composites: {};
  };

  type PositionVarianceGetPayload<
    S extends boolean | null | undefined | PositionVarianceDefaultArgs,
  > = $Result.GetResult<Prisma.$PositionVariancePayload, S>;

  type PositionVarianceCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<PositionVarianceFindManyArgs, 'select' | 'include' | 'distinct'> & {
    select?: PositionVarianceCountAggregateInputType | true;
  };

  export interface PositionVarianceDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['PositionVariance'];
      meta: { name: 'PositionVariance' };
    };
    /**
     * Find zero or one PositionVariance that matches the filter.
     * @param {PositionVarianceFindUniqueArgs} args - Arguments to find a PositionVariance
     * @example
     * // Get one PositionVariance
     * const positionVariance = await prisma.positionVariance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PositionVarianceFindUniqueArgs>(
      args: SelectSubset<T, PositionVarianceFindUniqueArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one PositionVariance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PositionVarianceFindUniqueOrThrowArgs} args - Arguments to find a PositionVariance
     * @example
     * // Get one PositionVariance
     * const positionVariance = await prisma.positionVariance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PositionVarianceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PositionVarianceFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first PositionVariance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceFindFirstArgs} args - Arguments to find a PositionVariance
     * @example
     * // Get one PositionVariance
     * const positionVariance = await prisma.positionVariance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PositionVarianceFindFirstArgs>(
      args?: SelectSubset<T, PositionVarianceFindFirstArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first PositionVariance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceFindFirstOrThrowArgs} args - Arguments to find a PositionVariance
     * @example
     * // Get one PositionVariance
     * const positionVariance = await prisma.positionVariance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PositionVarianceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PositionVarianceFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more PositionVariances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PositionVariances
     * const positionVariances = await prisma.positionVariance.findMany()
     *
     * // Get first 10 PositionVariances
     * const positionVariances = await prisma.positionVariance.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const positionVarianceWithIdOnly = await prisma.positionVariance.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PositionVarianceFindManyArgs>(
      args?: SelectSubset<T, PositionVarianceFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'findMany'>
    >;

    /**
     * Create a PositionVariance.
     * @param {PositionVarianceCreateArgs} args - Arguments to create a PositionVariance.
     * @example
     * // Create one PositionVariance
     * const PositionVariance = await prisma.positionVariance.create({
     *   data: {
     *     // ... data to create a PositionVariance
     *   }
     * })
     *
     */
    create<T extends PositionVarianceCreateArgs>(
      args: SelectSubset<T, PositionVarianceCreateArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many PositionVariances.
     * @param {PositionVarianceCreateManyArgs} args - Arguments to create many PositionVariances.
     * @example
     * // Create many PositionVariances
     * const positionVariance = await prisma.positionVariance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PositionVarianceCreateManyArgs>(
      args?: SelectSubset<T, PositionVarianceCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many PositionVariances and returns the data saved in the database.
     * @param {PositionVarianceCreateManyAndReturnArgs} args - Arguments to create many PositionVariances.
     * @example
     * // Create many PositionVariances
     * const positionVariance = await prisma.positionVariance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PositionVariances and only return the `id`
     * const positionVarianceWithIdOnly = await prisma.positionVariance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PositionVarianceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PositionVarianceCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a PositionVariance.
     * @param {PositionVarianceDeleteArgs} args - Arguments to delete one PositionVariance.
     * @example
     * // Delete one PositionVariance
     * const PositionVariance = await prisma.positionVariance.delete({
     *   where: {
     *     // ... filter to delete one PositionVariance
     *   }
     * })
     *
     */
    delete<T extends PositionVarianceDeleteArgs>(
      args: SelectSubset<T, PositionVarianceDeleteArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one PositionVariance.
     * @param {PositionVarianceUpdateArgs} args - Arguments to update one PositionVariance.
     * @example
     * // Update one PositionVariance
     * const positionVariance = await prisma.positionVariance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PositionVarianceUpdateArgs>(
      args: SelectSubset<T, PositionVarianceUpdateArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more PositionVariances.
     * @param {PositionVarianceDeleteManyArgs} args - Arguments to filter PositionVariances to delete.
     * @example
     * // Delete a few PositionVariances
     * const { count } = await prisma.positionVariance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PositionVarianceDeleteManyArgs>(
      args?: SelectSubset<T, PositionVarianceDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more PositionVariances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PositionVariances
     * const positionVariance = await prisma.positionVariance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PositionVarianceUpdateManyArgs>(
      args: SelectSubset<T, PositionVarianceUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one PositionVariance.
     * @param {PositionVarianceUpsertArgs} args - Arguments to update or create a PositionVariance.
     * @example
     * // Update or create a PositionVariance
     * const positionVariance = await prisma.positionVariance.upsert({
     *   create: {
     *     // ... data to create a PositionVariance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PositionVariance we want to update
     *   }
     * })
     */
    upsert<T extends PositionVarianceUpsertArgs>(
      args: SelectSubset<T, PositionVarianceUpsertArgs<ExtArgs>>
    ): Prisma__PositionVarianceClient<
      $Result.GetResult<Prisma.$PositionVariancePayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of PositionVariances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceCountArgs} args - Arguments to filter PositionVariances to count.
     * @example
     * // Count the number of PositionVariances
     * const count = await prisma.positionVariance.count({
     *   where: {
     *     // ... the filter for the PositionVariances we want to count
     *   }
     * })
     **/
    count<T extends PositionVarianceCountArgs>(
      args?: Subset<T, PositionVarianceCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PositionVarianceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a PositionVariance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PositionVarianceAggregateArgs>(
      args: Subset<T, PositionVarianceAggregateArgs>
    ): Prisma.PrismaPromise<GetPositionVarianceAggregateType<T>>;

    /**
     * Group by PositionVariance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionVarianceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PositionVarianceGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PositionVarianceGroupByArgs['orderBy'] }
        : { orderBy?: PositionVarianceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PositionVarianceGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetPositionVarianceGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PositionVariance model
     */
    readonly fields: PositionVarianceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PositionVariance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PositionVarianceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the PositionVariance model
   */
  interface PositionVarianceFieldRefs {
    readonly id: FieldRef<'PositionVariance', 'String'>;
    readonly position: FieldRef<'PositionVariance', 'String'>;
    readonly season: FieldRef<'PositionVariance', 'String'>;
    readonly sampleSize: FieldRef<'PositionVariance', 'Int'>;
    readonly meanError: FieldRef<'PositionVariance', 'Float'>;
    readonly stdDev: FieldRef<'PositionVariance', 'Float'>;
    readonly lastUpdated: FieldRef<'PositionVariance', 'DateTime'>;
    readonly createdAt: FieldRef<'PositionVariance', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * PositionVariance findUnique
   */
  export type PositionVarianceFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PositionVariance to fetch.
     */
    where: PositionVarianceWhereUniqueInput;
  };

  /**
   * PositionVariance findUniqueOrThrow
   */
  export type PositionVarianceFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PositionVariance to fetch.
     */
    where: PositionVarianceWhereUniqueInput;
  };

  /**
   * PositionVariance findFirst
   */
  export type PositionVarianceFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PositionVariance to fetch.
     */
    where?: PositionVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PositionVariances to fetch.
     */
    orderBy?: PositionVarianceOrderByWithRelationInput | PositionVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PositionVariances.
     */
    cursor?: PositionVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PositionVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PositionVariances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PositionVariances.
     */
    distinct?: PositionVarianceScalarFieldEnum | PositionVarianceScalarFieldEnum[];
  };

  /**
   * PositionVariance findFirstOrThrow
   */
  export type PositionVarianceFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PositionVariance to fetch.
     */
    where?: PositionVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PositionVariances to fetch.
     */
    orderBy?: PositionVarianceOrderByWithRelationInput | PositionVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PositionVariances.
     */
    cursor?: PositionVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PositionVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PositionVariances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PositionVariances.
     */
    distinct?: PositionVarianceScalarFieldEnum | PositionVarianceScalarFieldEnum[];
  };

  /**
   * PositionVariance findMany
   */
  export type PositionVarianceFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PositionVariances to fetch.
     */
    where?: PositionVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PositionVariances to fetch.
     */
    orderBy?: PositionVarianceOrderByWithRelationInput | PositionVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PositionVariances.
     */
    cursor?: PositionVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PositionVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PositionVariances.
     */
    skip?: number;
    distinct?: PositionVarianceScalarFieldEnum | PositionVarianceScalarFieldEnum[];
  };

  /**
   * PositionVariance create
   */
  export type PositionVarianceCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * The data needed to create a PositionVariance.
     */
    data: XOR<PositionVarianceCreateInput, PositionVarianceUncheckedCreateInput>;
  };

  /**
   * PositionVariance createMany
   */
  export type PositionVarianceCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many PositionVariances.
     */
    data: PositionVarianceCreateManyInput | PositionVarianceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * PositionVariance createManyAndReturn
   */
  export type PositionVarianceCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many PositionVariances.
     */
    data: PositionVarianceCreateManyInput | PositionVarianceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * PositionVariance update
   */
  export type PositionVarianceUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * The data needed to update a PositionVariance.
     */
    data: XOR<PositionVarianceUpdateInput, PositionVarianceUncheckedUpdateInput>;
    /**
     * Choose, which PositionVariance to update.
     */
    where: PositionVarianceWhereUniqueInput;
  };

  /**
   * PositionVariance updateMany
   */
  export type PositionVarianceUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update PositionVariances.
     */
    data: XOR<PositionVarianceUpdateManyMutationInput, PositionVarianceUncheckedUpdateManyInput>;
    /**
     * Filter which PositionVariances to update
     */
    where?: PositionVarianceWhereInput;
  };

  /**
   * PositionVariance upsert
   */
  export type PositionVarianceUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * The filter to search for the PositionVariance to update in case it exists.
     */
    where: PositionVarianceWhereUniqueInput;
    /**
     * In case the PositionVariance found by the `where` argument doesn't exist, create a new PositionVariance with this data.
     */
    create: XOR<PositionVarianceCreateInput, PositionVarianceUncheckedCreateInput>;
    /**
     * In case the PositionVariance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PositionVarianceUpdateInput, PositionVarianceUncheckedUpdateInput>;
  };

  /**
   * PositionVariance delete
   */
  export type PositionVarianceDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
    /**
     * Filter which PositionVariance to delete.
     */
    where: PositionVarianceWhereUniqueInput;
  };

  /**
   * PositionVariance deleteMany
   */
  export type PositionVarianceDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which PositionVariances to delete
     */
    where?: PositionVarianceWhereInput;
  };

  /**
   * PositionVariance without action
   */
  export type PositionVarianceDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PositionVariance
     */
    select?: PositionVarianceSelect<ExtArgs> | null;
  };

  /**
   * Model PlayerVariance
   */

  export type AggregatePlayerVariance = {
    _count: PlayerVarianceCountAggregateOutputType | null;
    _avg: PlayerVarianceAvgAggregateOutputType | null;
    _sum: PlayerVarianceSumAggregateOutputType | null;
    _min: PlayerVarianceMinAggregateOutputType | null;
    _max: PlayerVarianceMaxAggregateOutputType | null;
  };

  export type PlayerVarianceAvgAggregateOutputType = {
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
  };

  export type PlayerVarianceSumAggregateOutputType = {
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
  };

  export type PlayerVarianceMinAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    season: string | null;
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
    lastUpdated: Date | null;
    createdAt: Date | null;
  };

  export type PlayerVarianceMaxAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    season: string | null;
    sampleSize: number | null;
    meanError: number | null;
    stdDev: number | null;
    lastUpdated: Date | null;
    createdAt: Date | null;
  };

  export type PlayerVarianceCountAggregateOutputType = {
    id: number;
    playerId: number;
    season: number;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated: number;
    createdAt: number;
    _all: number;
  };

  export type PlayerVarianceAvgAggregateInputType = {
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
  };

  export type PlayerVarianceSumAggregateInputType = {
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
  };

  export type PlayerVarianceMinAggregateInputType = {
    id?: true;
    playerId?: true;
    season?: true;
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
    lastUpdated?: true;
    createdAt?: true;
  };

  export type PlayerVarianceMaxAggregateInputType = {
    id?: true;
    playerId?: true;
    season?: true;
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
    lastUpdated?: true;
    createdAt?: true;
  };

  export type PlayerVarianceCountAggregateInputType = {
    id?: true;
    playerId?: true;
    season?: true;
    sampleSize?: true;
    meanError?: true;
    stdDev?: true;
    lastUpdated?: true;
    createdAt?: true;
    _all?: true;
  };

  export type PlayerVarianceAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which PlayerVariance to aggregate.
     */
    where?: PlayerVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerVariances to fetch.
     */
    orderBy?: PlayerVarianceOrderByWithRelationInput | PlayerVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PlayerVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerVariances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PlayerVariances
     **/
    _count?: true | PlayerVarianceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PlayerVarianceAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PlayerVarianceSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PlayerVarianceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PlayerVarianceMaxAggregateInputType;
  };

  export type GetPlayerVarianceAggregateType<T extends PlayerVarianceAggregateArgs> = {
    [P in keyof T & keyof AggregatePlayerVariance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlayerVariance[P]>
      : GetScalarType<T[P], AggregatePlayerVariance[P]>;
  };

  export type PlayerVarianceGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PlayerVarianceWhereInput;
    orderBy?:
      | PlayerVarianceOrderByWithAggregationInput
      | PlayerVarianceOrderByWithAggregationInput[];
    by: PlayerVarianceScalarFieldEnum[] | PlayerVarianceScalarFieldEnum;
    having?: PlayerVarianceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlayerVarianceCountAggregateInputType | true;
    _avg?: PlayerVarianceAvgAggregateInputType;
    _sum?: PlayerVarianceSumAggregateInputType;
    _min?: PlayerVarianceMinAggregateInputType;
    _max?: PlayerVarianceMaxAggregateInputType;
  };

  export type PlayerVarianceGroupByOutputType = {
    id: string;
    playerId: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated: Date;
    createdAt: Date;
    _count: PlayerVarianceCountAggregateOutputType | null;
    _avg: PlayerVarianceAvgAggregateOutputType | null;
    _sum: PlayerVarianceSumAggregateOutputType | null;
    _min: PlayerVarianceMinAggregateOutputType | null;
    _max: PlayerVarianceMaxAggregateOutputType | null;
  };

  type GetPlayerVarianceGroupByPayload<T extends PlayerVarianceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlayerVarianceGroupByOutputType, T['by']> & {
        [P in keyof T & keyof PlayerVarianceGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], PlayerVarianceGroupByOutputType[P]>
          : GetScalarType<T[P], PlayerVarianceGroupByOutputType[P]>;
      }
    >
  >;

  export type PlayerVarianceSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      playerId?: boolean;
      season?: boolean;
      sampleSize?: boolean;
      meanError?: boolean;
      stdDev?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['playerVariance']
  >;

  export type PlayerVarianceSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      playerId?: boolean;
      season?: boolean;
      sampleSize?: boolean;
      meanError?: boolean;
      stdDev?: boolean;
      lastUpdated?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['playerVariance']
  >;

  export type PlayerVarianceSelectScalar = {
    id?: boolean;
    playerId?: boolean;
    season?: boolean;
    sampleSize?: boolean;
    meanError?: boolean;
    stdDev?: boolean;
    lastUpdated?: boolean;
    createdAt?: boolean;
  };

  export type $PlayerVariancePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'PlayerVariance';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        playerId: string;
        season: string;
        sampleSize: number;
        meanError: number;
        stdDev: number;
        lastUpdated: Date;
        createdAt: Date;
      },
      ExtArgs['result']['playerVariance']
    >;
    composites: {};
  };

  type PlayerVarianceGetPayload<S extends boolean | null | undefined | PlayerVarianceDefaultArgs> =
    $Result.GetResult<Prisma.$PlayerVariancePayload, S>;

  type PlayerVarianceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlayerVarianceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlayerVarianceCountAggregateInputType | true;
    };

  export interface PlayerVarianceDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['PlayerVariance'];
      meta: { name: 'PlayerVariance' };
    };
    /**
     * Find zero or one PlayerVariance that matches the filter.
     * @param {PlayerVarianceFindUniqueArgs} args - Arguments to find a PlayerVariance
     * @example
     * // Get one PlayerVariance
     * const playerVariance = await prisma.playerVariance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerVarianceFindUniqueArgs>(
      args: SelectSubset<T, PlayerVarianceFindUniqueArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one PlayerVariance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlayerVarianceFindUniqueOrThrowArgs} args - Arguments to find a PlayerVariance
     * @example
     * // Get one PlayerVariance
     * const playerVariance = await prisma.playerVariance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerVarianceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PlayerVarianceFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first PlayerVariance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceFindFirstArgs} args - Arguments to find a PlayerVariance
     * @example
     * // Get one PlayerVariance
     * const playerVariance = await prisma.playerVariance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerVarianceFindFirstArgs>(
      args?: SelectSubset<T, PlayerVarianceFindFirstArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first PlayerVariance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceFindFirstOrThrowArgs} args - Arguments to find a PlayerVariance
     * @example
     * // Get one PlayerVariance
     * const playerVariance = await prisma.playerVariance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerVarianceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PlayerVarianceFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more PlayerVariances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlayerVariances
     * const playerVariances = await prisma.playerVariance.findMany()
     *
     * // Get first 10 PlayerVariances
     * const playerVariances = await prisma.playerVariance.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const playerVarianceWithIdOnly = await prisma.playerVariance.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PlayerVarianceFindManyArgs>(
      args?: SelectSubset<T, PlayerVarianceFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'findMany'>
    >;

    /**
     * Create a PlayerVariance.
     * @param {PlayerVarianceCreateArgs} args - Arguments to create a PlayerVariance.
     * @example
     * // Create one PlayerVariance
     * const PlayerVariance = await prisma.playerVariance.create({
     *   data: {
     *     // ... data to create a PlayerVariance
     *   }
     * })
     *
     */
    create<T extends PlayerVarianceCreateArgs>(
      args: SelectSubset<T, PlayerVarianceCreateArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many PlayerVariances.
     * @param {PlayerVarianceCreateManyArgs} args - Arguments to create many PlayerVariances.
     * @example
     * // Create many PlayerVariances
     * const playerVariance = await prisma.playerVariance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PlayerVarianceCreateManyArgs>(
      args?: SelectSubset<T, PlayerVarianceCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many PlayerVariances and returns the data saved in the database.
     * @param {PlayerVarianceCreateManyAndReturnArgs} args - Arguments to create many PlayerVariances.
     * @example
     * // Create many PlayerVariances
     * const playerVariance = await prisma.playerVariance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PlayerVariances and only return the `id`
     * const playerVarianceWithIdOnly = await prisma.playerVariance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PlayerVarianceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PlayerVarianceCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a PlayerVariance.
     * @param {PlayerVarianceDeleteArgs} args - Arguments to delete one PlayerVariance.
     * @example
     * // Delete one PlayerVariance
     * const PlayerVariance = await prisma.playerVariance.delete({
     *   where: {
     *     // ... filter to delete one PlayerVariance
     *   }
     * })
     *
     */
    delete<T extends PlayerVarianceDeleteArgs>(
      args: SelectSubset<T, PlayerVarianceDeleteArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one PlayerVariance.
     * @param {PlayerVarianceUpdateArgs} args - Arguments to update one PlayerVariance.
     * @example
     * // Update one PlayerVariance
     * const playerVariance = await prisma.playerVariance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PlayerVarianceUpdateArgs>(
      args: SelectSubset<T, PlayerVarianceUpdateArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more PlayerVariances.
     * @param {PlayerVarianceDeleteManyArgs} args - Arguments to filter PlayerVariances to delete.
     * @example
     * // Delete a few PlayerVariances
     * const { count } = await prisma.playerVariance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PlayerVarianceDeleteManyArgs>(
      args?: SelectSubset<T, PlayerVarianceDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more PlayerVariances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlayerVariances
     * const playerVariance = await prisma.playerVariance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PlayerVarianceUpdateManyArgs>(
      args: SelectSubset<T, PlayerVarianceUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one PlayerVariance.
     * @param {PlayerVarianceUpsertArgs} args - Arguments to update or create a PlayerVariance.
     * @example
     * // Update or create a PlayerVariance
     * const playerVariance = await prisma.playerVariance.upsert({
     *   create: {
     *     // ... data to create a PlayerVariance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlayerVariance we want to update
     *   }
     * })
     */
    upsert<T extends PlayerVarianceUpsertArgs>(
      args: SelectSubset<T, PlayerVarianceUpsertArgs<ExtArgs>>
    ): Prisma__PlayerVarianceClient<
      $Result.GetResult<Prisma.$PlayerVariancePayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of PlayerVariances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceCountArgs} args - Arguments to filter PlayerVariances to count.
     * @example
     * // Count the number of PlayerVariances
     * const count = await prisma.playerVariance.count({
     *   where: {
     *     // ... the filter for the PlayerVariances we want to count
     *   }
     * })
     **/
    count<T extends PlayerVarianceCountArgs>(
      args?: Subset<T, PlayerVarianceCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlayerVarianceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a PlayerVariance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PlayerVarianceAggregateArgs>(
      args: Subset<T, PlayerVarianceAggregateArgs>
    ): Prisma.PrismaPromise<GetPlayerVarianceAggregateType<T>>;

    /**
     * Group by PlayerVariance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerVarianceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PlayerVarianceGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlayerVarianceGroupByArgs['orderBy'] }
        : { orderBy?: PlayerVarianceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PlayerVarianceGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetPlayerVarianceGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PlayerVariance model
     */
    readonly fields: PlayerVarianceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlayerVariance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlayerVarianceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the PlayerVariance model
   */
  interface PlayerVarianceFieldRefs {
    readonly id: FieldRef<'PlayerVariance', 'String'>;
    readonly playerId: FieldRef<'PlayerVariance', 'String'>;
    readonly season: FieldRef<'PlayerVariance', 'String'>;
    readonly sampleSize: FieldRef<'PlayerVariance', 'Int'>;
    readonly meanError: FieldRef<'PlayerVariance', 'Float'>;
    readonly stdDev: FieldRef<'PlayerVariance', 'Float'>;
    readonly lastUpdated: FieldRef<'PlayerVariance', 'DateTime'>;
    readonly createdAt: FieldRef<'PlayerVariance', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * PlayerVariance findUnique
   */
  export type PlayerVarianceFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerVariance to fetch.
     */
    where: PlayerVarianceWhereUniqueInput;
  };

  /**
   * PlayerVariance findUniqueOrThrow
   */
  export type PlayerVarianceFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerVariance to fetch.
     */
    where: PlayerVarianceWhereUniqueInput;
  };

  /**
   * PlayerVariance findFirst
   */
  export type PlayerVarianceFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerVariance to fetch.
     */
    where?: PlayerVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerVariances to fetch.
     */
    orderBy?: PlayerVarianceOrderByWithRelationInput | PlayerVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlayerVariances.
     */
    cursor?: PlayerVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerVariances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerVariances.
     */
    distinct?: PlayerVarianceScalarFieldEnum | PlayerVarianceScalarFieldEnum[];
  };

  /**
   * PlayerVariance findFirstOrThrow
   */
  export type PlayerVarianceFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerVariance to fetch.
     */
    where?: PlayerVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerVariances to fetch.
     */
    orderBy?: PlayerVarianceOrderByWithRelationInput | PlayerVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlayerVariances.
     */
    cursor?: PlayerVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerVariances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlayerVariances.
     */
    distinct?: PlayerVarianceScalarFieldEnum | PlayerVarianceScalarFieldEnum[];
  };

  /**
   * PlayerVariance findMany
   */
  export type PlayerVarianceFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * Filter, which PlayerVariances to fetch.
     */
    where?: PlayerVarianceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlayerVariances to fetch.
     */
    orderBy?: PlayerVarianceOrderByWithRelationInput | PlayerVarianceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PlayerVariances.
     */
    cursor?: PlayerVarianceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlayerVariances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlayerVariances.
     */
    skip?: number;
    distinct?: PlayerVarianceScalarFieldEnum | PlayerVarianceScalarFieldEnum[];
  };

  /**
   * PlayerVariance create
   */
  export type PlayerVarianceCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * The data needed to create a PlayerVariance.
     */
    data: XOR<PlayerVarianceCreateInput, PlayerVarianceUncheckedCreateInput>;
  };

  /**
   * PlayerVariance createMany
   */
  export type PlayerVarianceCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many PlayerVariances.
     */
    data: PlayerVarianceCreateManyInput | PlayerVarianceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * PlayerVariance createManyAndReturn
   */
  export type PlayerVarianceCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many PlayerVariances.
     */
    data: PlayerVarianceCreateManyInput | PlayerVarianceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * PlayerVariance update
   */
  export type PlayerVarianceUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * The data needed to update a PlayerVariance.
     */
    data: XOR<PlayerVarianceUpdateInput, PlayerVarianceUncheckedUpdateInput>;
    /**
     * Choose, which PlayerVariance to update.
     */
    where: PlayerVarianceWhereUniqueInput;
  };

  /**
   * PlayerVariance updateMany
   */
  export type PlayerVarianceUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update PlayerVariances.
     */
    data: XOR<PlayerVarianceUpdateManyMutationInput, PlayerVarianceUncheckedUpdateManyInput>;
    /**
     * Filter which PlayerVariances to update
     */
    where?: PlayerVarianceWhereInput;
  };

  /**
   * PlayerVariance upsert
   */
  export type PlayerVarianceUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * The filter to search for the PlayerVariance to update in case it exists.
     */
    where: PlayerVarianceWhereUniqueInput;
    /**
     * In case the PlayerVariance found by the `where` argument doesn't exist, create a new PlayerVariance with this data.
     */
    create: XOR<PlayerVarianceCreateInput, PlayerVarianceUncheckedCreateInput>;
    /**
     * In case the PlayerVariance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlayerVarianceUpdateInput, PlayerVarianceUncheckedUpdateInput>;
  };

  /**
   * PlayerVariance delete
   */
  export type PlayerVarianceDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
    /**
     * Filter which PlayerVariance to delete.
     */
    where: PlayerVarianceWhereUniqueInput;
  };

  /**
   * PlayerVariance deleteMany
   */
  export type PlayerVarianceDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which PlayerVariances to delete
     */
    where?: PlayerVarianceWhereInput;
  };

  /**
   * PlayerVariance without action
   */
  export type PlayerVarianceDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PlayerVariance
     */
    select?: PlayerVarianceSelect<ExtArgs> | null;
  };

  /**
   * Model ProjectionError
   */

  export type AggregateProjectionError = {
    _count: ProjectionErrorCountAggregateOutputType | null;
    _avg: ProjectionErrorAvgAggregateOutputType | null;
    _sum: ProjectionErrorSumAggregateOutputType | null;
    _min: ProjectionErrorMinAggregateOutputType | null;
    _max: ProjectionErrorMaxAggregateOutputType | null;
  };

  export type ProjectionErrorAvgAggregateOutputType = {
    week: number | null;
    projectedPoints: number | null;
    actualPoints: number | null;
    normalizedError: number | null;
  };

  export type ProjectionErrorSumAggregateOutputType = {
    week: number | null;
    projectedPoints: number | null;
    actualPoints: number | null;
    normalizedError: number | null;
  };

  export type ProjectionErrorMinAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    week: number | null;
    season: string | null;
    projectedPoints: number | null;
    actualPoints: number | null;
    normalizedError: number | null;
    createdAt: Date | null;
  };

  export type ProjectionErrorMaxAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    week: number | null;
    season: string | null;
    projectedPoints: number | null;
    actualPoints: number | null;
    normalizedError: number | null;
    createdAt: Date | null;
  };

  export type ProjectionErrorCountAggregateOutputType = {
    id: number;
    playerId: number;
    week: number;
    season: number;
    projectedPoints: number;
    actualPoints: number;
    normalizedError: number;
    createdAt: number;
    _all: number;
  };

  export type ProjectionErrorAvgAggregateInputType = {
    week?: true;
    projectedPoints?: true;
    actualPoints?: true;
    normalizedError?: true;
  };

  export type ProjectionErrorSumAggregateInputType = {
    week?: true;
    projectedPoints?: true;
    actualPoints?: true;
    normalizedError?: true;
  };

  export type ProjectionErrorMinAggregateInputType = {
    id?: true;
    playerId?: true;
    week?: true;
    season?: true;
    projectedPoints?: true;
    actualPoints?: true;
    normalizedError?: true;
    createdAt?: true;
  };

  export type ProjectionErrorMaxAggregateInputType = {
    id?: true;
    playerId?: true;
    week?: true;
    season?: true;
    projectedPoints?: true;
    actualPoints?: true;
    normalizedError?: true;
    createdAt?: true;
  };

  export type ProjectionErrorCountAggregateInputType = {
    id?: true;
    playerId?: true;
    week?: true;
    season?: true;
    projectedPoints?: true;
    actualPoints?: true;
    normalizedError?: true;
    createdAt?: true;
    _all?: true;
  };

  export type ProjectionErrorAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ProjectionError to aggregate.
     */
    where?: ProjectionErrorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProjectionErrors to fetch.
     */
    orderBy?: ProjectionErrorOrderByWithRelationInput | ProjectionErrorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ProjectionErrorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProjectionErrors from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProjectionErrors.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ProjectionErrors
     **/
    _count?: true | ProjectionErrorCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: ProjectionErrorAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: ProjectionErrorSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ProjectionErrorMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ProjectionErrorMaxAggregateInputType;
  };

  export type GetProjectionErrorAggregateType<T extends ProjectionErrorAggregateArgs> = {
    [P in keyof T & keyof AggregateProjectionError]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProjectionError[P]>
      : GetScalarType<T[P], AggregateProjectionError[P]>;
  };

  export type ProjectionErrorGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ProjectionErrorWhereInput;
    orderBy?:
      | ProjectionErrorOrderByWithAggregationInput
      | ProjectionErrorOrderByWithAggregationInput[];
    by: ProjectionErrorScalarFieldEnum[] | ProjectionErrorScalarFieldEnum;
    having?: ProjectionErrorScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProjectionErrorCountAggregateInputType | true;
    _avg?: ProjectionErrorAvgAggregateInputType;
    _sum?: ProjectionErrorSumAggregateInputType;
    _min?: ProjectionErrorMinAggregateInputType;
    _max?: ProjectionErrorMaxAggregateInputType;
  };

  export type ProjectionErrorGroupByOutputType = {
    id: string;
    playerId: string;
    week: number;
    season: string;
    projectedPoints: number;
    actualPoints: number;
    normalizedError: number;
    createdAt: Date;
    _count: ProjectionErrorCountAggregateOutputType | null;
    _avg: ProjectionErrorAvgAggregateOutputType | null;
    _sum: ProjectionErrorSumAggregateOutputType | null;
    _min: ProjectionErrorMinAggregateOutputType | null;
    _max: ProjectionErrorMaxAggregateOutputType | null;
  };

  type GetProjectionErrorGroupByPayload<T extends ProjectionErrorGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ProjectionErrorGroupByOutputType, T['by']> & {
          [P in keyof T & keyof ProjectionErrorGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectionErrorGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectionErrorGroupByOutputType[P]>;
        }
      >
    >;

  export type ProjectionErrorSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      playerId?: boolean;
      week?: boolean;
      season?: boolean;
      projectedPoints?: boolean;
      actualPoints?: boolean;
      normalizedError?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['projectionError']
  >;

  export type ProjectionErrorSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      playerId?: boolean;
      week?: boolean;
      season?: boolean;
      projectedPoints?: boolean;
      actualPoints?: boolean;
      normalizedError?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['projectionError']
  >;

  export type ProjectionErrorSelectScalar = {
    id?: boolean;
    playerId?: boolean;
    week?: boolean;
    season?: boolean;
    projectedPoints?: boolean;
    actualPoints?: boolean;
    normalizedError?: boolean;
    createdAt?: boolean;
  };

  export type $ProjectionErrorPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'ProjectionError';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        playerId: string;
        week: number;
        season: string;
        projectedPoints: number;
        actualPoints: number;
        normalizedError: number;
        createdAt: Date;
      },
      ExtArgs['result']['projectionError']
    >;
    composites: {};
  };

  type ProjectionErrorGetPayload<
    S extends boolean | null | undefined | ProjectionErrorDefaultArgs,
  > = $Result.GetResult<Prisma.$ProjectionErrorPayload, S>;

  type ProjectionErrorCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<ProjectionErrorFindManyArgs, 'select' | 'include' | 'distinct'> & {
    select?: ProjectionErrorCountAggregateInputType | true;
  };

  export interface ProjectionErrorDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['ProjectionError'];
      meta: { name: 'ProjectionError' };
    };
    /**
     * Find zero or one ProjectionError that matches the filter.
     * @param {ProjectionErrorFindUniqueArgs} args - Arguments to find a ProjectionError
     * @example
     * // Get one ProjectionError
     * const projectionError = await prisma.projectionError.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectionErrorFindUniqueArgs>(
      args: SelectSubset<T, ProjectionErrorFindUniqueArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'findUnique'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find one ProjectionError that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectionErrorFindUniqueOrThrowArgs} args - Arguments to find a ProjectionError
     * @example
     * // Get one ProjectionError
     * const projectionError = await prisma.projectionError.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectionErrorFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ProjectionErrorFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'findUniqueOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find the first ProjectionError that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorFindFirstArgs} args - Arguments to find a ProjectionError
     * @example
     * // Get one ProjectionError
     * const projectionError = await prisma.projectionError.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectionErrorFindFirstArgs>(
      args?: SelectSubset<T, ProjectionErrorFindFirstArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'findFirst'> | null,
      null,
      ExtArgs
    >;

    /**
     * Find the first ProjectionError that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorFindFirstOrThrowArgs} args - Arguments to find a ProjectionError
     * @example
     * // Get one ProjectionError
     * const projectionError = await prisma.projectionError.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectionErrorFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ProjectionErrorFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'findFirstOrThrow'>,
      never,
      ExtArgs
    >;

    /**
     * Find zero or more ProjectionErrors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProjectionErrors
     * const projectionErrors = await prisma.projectionError.findMany()
     *
     * // Get first 10 ProjectionErrors
     * const projectionErrors = await prisma.projectionError.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const projectionErrorWithIdOnly = await prisma.projectionError.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProjectionErrorFindManyArgs>(
      args?: SelectSubset<T, ProjectionErrorFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'findMany'>
    >;

    /**
     * Create a ProjectionError.
     * @param {ProjectionErrorCreateArgs} args - Arguments to create a ProjectionError.
     * @example
     * // Create one ProjectionError
     * const ProjectionError = await prisma.projectionError.create({
     *   data: {
     *     // ... data to create a ProjectionError
     *   }
     * })
     *
     */
    create<T extends ProjectionErrorCreateArgs>(
      args: SelectSubset<T, ProjectionErrorCreateArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'create'>,
      never,
      ExtArgs
    >;

    /**
     * Create many ProjectionErrors.
     * @param {ProjectionErrorCreateManyArgs} args - Arguments to create many ProjectionErrors.
     * @example
     * // Create many ProjectionErrors
     * const projectionError = await prisma.projectionError.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProjectionErrorCreateManyArgs>(
      args?: SelectSubset<T, ProjectionErrorCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many ProjectionErrors and returns the data saved in the database.
     * @param {ProjectionErrorCreateManyAndReturnArgs} args - Arguments to create many ProjectionErrors.
     * @example
     * // Create many ProjectionErrors
     * const projectionError = await prisma.projectionError.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ProjectionErrors and only return the `id`
     * const projectionErrorWithIdOnly = await prisma.projectionError.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProjectionErrorCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ProjectionErrorCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'createManyAndReturn'>
    >;

    /**
     * Delete a ProjectionError.
     * @param {ProjectionErrorDeleteArgs} args - Arguments to delete one ProjectionError.
     * @example
     * // Delete one ProjectionError
     * const ProjectionError = await prisma.projectionError.delete({
     *   where: {
     *     // ... filter to delete one ProjectionError
     *   }
     * })
     *
     */
    delete<T extends ProjectionErrorDeleteArgs>(
      args: SelectSubset<T, ProjectionErrorDeleteArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'delete'>,
      never,
      ExtArgs
    >;

    /**
     * Update one ProjectionError.
     * @param {ProjectionErrorUpdateArgs} args - Arguments to update one ProjectionError.
     * @example
     * // Update one ProjectionError
     * const projectionError = await prisma.projectionError.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProjectionErrorUpdateArgs>(
      args: SelectSubset<T, ProjectionErrorUpdateArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'update'>,
      never,
      ExtArgs
    >;

    /**
     * Delete zero or more ProjectionErrors.
     * @param {ProjectionErrorDeleteManyArgs} args - Arguments to filter ProjectionErrors to delete.
     * @example
     * // Delete a few ProjectionErrors
     * const { count } = await prisma.projectionError.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProjectionErrorDeleteManyArgs>(
      args?: SelectSubset<T, ProjectionErrorDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more ProjectionErrors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProjectionErrors
     * const projectionError = await prisma.projectionError.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProjectionErrorUpdateManyArgs>(
      args: SelectSubset<T, ProjectionErrorUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create or update one ProjectionError.
     * @param {ProjectionErrorUpsertArgs} args - Arguments to update or create a ProjectionError.
     * @example
     * // Update or create a ProjectionError
     * const projectionError = await prisma.projectionError.upsert({
     *   create: {
     *     // ... data to create a ProjectionError
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProjectionError we want to update
     *   }
     * })
     */
    upsert<T extends ProjectionErrorUpsertArgs>(
      args: SelectSubset<T, ProjectionErrorUpsertArgs<ExtArgs>>
    ): Prisma__ProjectionErrorClient<
      $Result.GetResult<Prisma.$ProjectionErrorPayload<ExtArgs>, T, 'upsert'>,
      never,
      ExtArgs
    >;

    /**
     * Count the number of ProjectionErrors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorCountArgs} args - Arguments to filter ProjectionErrors to count.
     * @example
     * // Count the number of ProjectionErrors
     * const count = await prisma.projectionError.count({
     *   where: {
     *     // ... the filter for the ProjectionErrors we want to count
     *   }
     * })
     **/
    count<T extends ProjectionErrorCountArgs>(
      args?: Subset<T, ProjectionErrorCountArgs>
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectionErrorCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a ProjectionError.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ProjectionErrorAggregateArgs>(
      args: Subset<T, ProjectionErrorAggregateArgs>
    ): Prisma.PrismaPromise<GetProjectionErrorAggregateType<T>>;

    /**
     * Group by ProjectionError.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectionErrorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ProjectionErrorGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectionErrorGroupByArgs['orderBy'] }
        : { orderBy?: ProjectionErrorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ProjectionErrorGroupByArgs, OrderByArg> & InputErrors
    ): {} extends InputErrors
      ? GetProjectionErrorGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ProjectionError model
     */
    readonly fields: ProjectionErrorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProjectionError.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectionErrorClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the ProjectionError model
   */
  interface ProjectionErrorFieldRefs {
    readonly id: FieldRef<'ProjectionError', 'String'>;
    readonly playerId: FieldRef<'ProjectionError', 'String'>;
    readonly week: FieldRef<'ProjectionError', 'Int'>;
    readonly season: FieldRef<'ProjectionError', 'String'>;
    readonly projectedPoints: FieldRef<'ProjectionError', 'Float'>;
    readonly actualPoints: FieldRef<'ProjectionError', 'Float'>;
    readonly normalizedError: FieldRef<'ProjectionError', 'Float'>;
    readonly createdAt: FieldRef<'ProjectionError', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * ProjectionError findUnique
   */
  export type ProjectionErrorFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * Filter, which ProjectionError to fetch.
     */
    where: ProjectionErrorWhereUniqueInput;
  };

  /**
   * ProjectionError findUniqueOrThrow
   */
  export type ProjectionErrorFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * Filter, which ProjectionError to fetch.
     */
    where: ProjectionErrorWhereUniqueInput;
  };

  /**
   * ProjectionError findFirst
   */
  export type ProjectionErrorFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * Filter, which ProjectionError to fetch.
     */
    where?: ProjectionErrorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProjectionErrors to fetch.
     */
    orderBy?: ProjectionErrorOrderByWithRelationInput | ProjectionErrorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ProjectionErrors.
     */
    cursor?: ProjectionErrorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProjectionErrors from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProjectionErrors.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ProjectionErrors.
     */
    distinct?: ProjectionErrorScalarFieldEnum | ProjectionErrorScalarFieldEnum[];
  };

  /**
   * ProjectionError findFirstOrThrow
   */
  export type ProjectionErrorFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * Filter, which ProjectionError to fetch.
     */
    where?: ProjectionErrorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProjectionErrors to fetch.
     */
    orderBy?: ProjectionErrorOrderByWithRelationInput | ProjectionErrorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ProjectionErrors.
     */
    cursor?: ProjectionErrorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProjectionErrors from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProjectionErrors.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ProjectionErrors.
     */
    distinct?: ProjectionErrorScalarFieldEnum | ProjectionErrorScalarFieldEnum[];
  };

  /**
   * ProjectionError findMany
   */
  export type ProjectionErrorFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * Filter, which ProjectionErrors to fetch.
     */
    where?: ProjectionErrorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ProjectionErrors to fetch.
     */
    orderBy?: ProjectionErrorOrderByWithRelationInput | ProjectionErrorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ProjectionErrors.
     */
    cursor?: ProjectionErrorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ProjectionErrors from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ProjectionErrors.
     */
    skip?: number;
    distinct?: ProjectionErrorScalarFieldEnum | ProjectionErrorScalarFieldEnum[];
  };

  /**
   * ProjectionError create
   */
  export type ProjectionErrorCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * The data needed to create a ProjectionError.
     */
    data: XOR<ProjectionErrorCreateInput, ProjectionErrorUncheckedCreateInput>;
  };

  /**
   * ProjectionError createMany
   */
  export type ProjectionErrorCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many ProjectionErrors.
     */
    data: ProjectionErrorCreateManyInput | ProjectionErrorCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ProjectionError createManyAndReturn
   */
  export type ProjectionErrorCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * The data used to create many ProjectionErrors.
     */
    data: ProjectionErrorCreateManyInput | ProjectionErrorCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * ProjectionError update
   */
  export type ProjectionErrorUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * The data needed to update a ProjectionError.
     */
    data: XOR<ProjectionErrorUpdateInput, ProjectionErrorUncheckedUpdateInput>;
    /**
     * Choose, which ProjectionError to update.
     */
    where: ProjectionErrorWhereUniqueInput;
  };

  /**
   * ProjectionError updateMany
   */
  export type ProjectionErrorUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update ProjectionErrors.
     */
    data: XOR<ProjectionErrorUpdateManyMutationInput, ProjectionErrorUncheckedUpdateManyInput>;
    /**
     * Filter which ProjectionErrors to update
     */
    where?: ProjectionErrorWhereInput;
  };

  /**
   * ProjectionError upsert
   */
  export type ProjectionErrorUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * The filter to search for the ProjectionError to update in case it exists.
     */
    where: ProjectionErrorWhereUniqueInput;
    /**
     * In case the ProjectionError found by the `where` argument doesn't exist, create a new ProjectionError with this data.
     */
    create: XOR<ProjectionErrorCreateInput, ProjectionErrorUncheckedCreateInput>;
    /**
     * In case the ProjectionError was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectionErrorUpdateInput, ProjectionErrorUncheckedUpdateInput>;
  };

  /**
   * ProjectionError delete
   */
  export type ProjectionErrorDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
    /**
     * Filter which ProjectionError to delete.
     */
    where: ProjectionErrorWhereUniqueInput;
  };

  /**
   * ProjectionError deleteMany
   */
  export type ProjectionErrorDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which ProjectionErrors to delete
     */
    where?: ProjectionErrorWhereInput;
  };

  /**
   * ProjectionError without action
   */
  export type ProjectionErrorDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProjectionError
     */
    select?: ProjectionErrorSelect<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const UserScalarFieldEnum: {
    id: 'id';
    username: 'username';
    displayName: 'displayName';
    avatar: 'avatar';
    metadata: 'metadata';
    isBot: 'isBot';
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const LeagueScalarFieldEnum: {
    id: 'id';
    name: 'name';
    season: 'season';
    seasonType: 'seasonType';
    status: 'status';
    sport: 'sport';
    totalRosters: 'totalRosters';
    settings: 'settings';
    scoringSettings: 'scoringSettings';
    rosterPositions: 'rosterPositions';
    metadata: 'metadata';
    previousLeagueId: 'previousLeagueId';
    draftId: 'draftId';
    playoffMatchups: 'playoffMatchups';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type LeagueScalarFieldEnum =
    (typeof LeagueScalarFieldEnum)[keyof typeof LeagueScalarFieldEnum];

  export const RosterScalarFieldEnum: {
    id: 'id';
    leagueId: 'leagueId';
    ownerId: 'ownerId';
    coOwners: 'coOwners';
    players: 'players';
    starters: 'starters';
    reserve: 'reserve';
    settings: 'settings';
    metadata: 'metadata';
    waiverBudget: 'waiverBudget';
    waiverPosition: 'waiverPosition';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type RosterScalarFieldEnum =
    (typeof RosterScalarFieldEnum)[keyof typeof RosterScalarFieldEnum];

  export const MatchupScalarFieldEnum: {
    id: 'id';
    leagueId: 'leagueId';
    week: 'week';
    rosterId: 'rosterId';
    matchupId: 'matchupId';
    points: 'points';
    customPoints: 'customPoints';
    starters: 'starters';
    startersPoints: 'startersPoints';
    players: 'players';
    playersPoints: 'playersPoints';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type MatchupScalarFieldEnum =
    (typeof MatchupScalarFieldEnum)[keyof typeof MatchupScalarFieldEnum];

  export const TransactionScalarFieldEnum: {
    id: 'id';
    leagueId: 'leagueId';
    type: 'type';
    status: 'status';
    creatorId: 'creatorId';
    rosterIds: 'rosterIds';
    adds: 'adds';
    drops: 'drops';
    draftPicks: 'draftPicks';
    waiver: 'waiver';
    settings: 'settings';
    leg: 'leg';
    consenterIds: 'consenterIds';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type TransactionScalarFieldEnum =
    (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];

  export const TradedPickScalarFieldEnum: {
    id: 'id';
    leagueId: 'leagueId';
    season: 'season';
    round: 'round';
    rosterId: 'rosterId';
    previousOwnerId: 'previousOwnerId';
    ownerId: 'ownerId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type TradedPickScalarFieldEnum =
    (typeof TradedPickScalarFieldEnum)[keyof typeof TradedPickScalarFieldEnum];

  export const DraftScalarFieldEnum: {
    id: 'id';
    leagueId: 'leagueId';
    status: 'status';
    type: 'type';
    season: 'season';
    settings: 'settings';
    metadata: 'metadata';
    slotToRosterId: 'slotToRosterId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type DraftScalarFieldEnum =
    (typeof DraftScalarFieldEnum)[keyof typeof DraftScalarFieldEnum];

  export const DraftPickScalarFieldEnum: {
    id: 'id';
    draftId: 'draftId';
    pickNo: 'pickNo';
    round: 'round';
    rosterId: 'rosterId';
    playerId: 'playerId';
    pickedBy: 'pickedBy';
    metadata: 'metadata';
    isKeeper: 'isKeeper';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type DraftPickScalarFieldEnum =
    (typeof DraftPickScalarFieldEnum)[keyof typeof DraftPickScalarFieldEnum];

  export const PlayerScalarFieldEnum: {
    id: 'id';
    hashtag: 'hashtag';
    firstName: 'firstName';
    lastName: 'lastName';
    fullName: 'fullName';
    team: 'team';
    position: 'position';
    depthChartOrder: 'depthChartOrder';
    status: 'status';
    injuryStatus: 'injuryStatus';
    weight: 'weight';
    height: 'height';
    number: 'number';
    age: 'age';
    yearsExp: 'yearsExp';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type PlayerScalarFieldEnum =
    (typeof PlayerScalarFieldEnum)[keyof typeof PlayerScalarFieldEnum];

  export const PlayerStatsScalarFieldEnum: {
    id: 'id';
    playerId: 'playerId';
    week: 'week';
    season: 'season';
    statsType: 'statsType';
    stats: 'stats';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type PlayerStatsScalarFieldEnum =
    (typeof PlayerStatsScalarFieldEnum)[keyof typeof PlayerStatsScalarFieldEnum];

  export const WeeklyMetricsScalarFieldEnum: {
    id: 'id';
    leagueId: 'leagueId';
    rosterId: 'rosterId';
    week: 'week';
    totalPoints: 'totalPoints';
    expectedWins: 'expectedWins';
    luckRating: 'luckRating';
    opponentPoints: 'opponentPoints';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type WeeklyMetricsScalarFieldEnum =
    (typeof WeeklyMetricsScalarFieldEnum)[keyof typeof WeeklyMetricsScalarFieldEnum];

  export const PositionVarianceScalarFieldEnum: {
    id: 'id';
    position: 'position';
    season: 'season';
    sampleSize: 'sampleSize';
    meanError: 'meanError';
    stdDev: 'stdDev';
    lastUpdated: 'lastUpdated';
    createdAt: 'createdAt';
  };

  export type PositionVarianceScalarFieldEnum =
    (typeof PositionVarianceScalarFieldEnum)[keyof typeof PositionVarianceScalarFieldEnum];

  export const PlayerVarianceScalarFieldEnum: {
    id: 'id';
    playerId: 'playerId';
    season: 'season';
    sampleSize: 'sampleSize';
    meanError: 'meanError';
    stdDev: 'stdDev';
    lastUpdated: 'lastUpdated';
    createdAt: 'createdAt';
  };

  export type PlayerVarianceScalarFieldEnum =
    (typeof PlayerVarianceScalarFieldEnum)[keyof typeof PlayerVarianceScalarFieldEnum];

  export const ProjectionErrorScalarFieldEnum: {
    id: 'id';
    playerId: 'playerId';
    week: 'week';
    season: 'season';
    projectedPoints: 'projectedPoints';
    actualPoints: 'actualPoints';
    normalizedError: 'normalizedError';
    createdAt: 'createdAt';
  };

  export type ProjectionErrorScalarFieldEnum =
    (typeof ProjectionErrorScalarFieldEnum)[keyof typeof ProjectionErrorScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
  };

  export type NullableJsonNullValueInput =
    (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];

  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull;
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const JsonNullValueFilter: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;

  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;

  /**
   * Deep Input Types
   */

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: StringFilter<'User'> | string;
    username?: StringFilter<'User'> | string;
    displayName?: StringFilter<'User'> | string;
    avatar?: StringNullableFilter<'User'> | string | null;
    metadata?: JsonNullableFilter<'User'>;
    isBot?: BoolFilter<'User'> | boolean;
    leagues?: LeagueListRelationFilter;
    rosters?: RosterListRelationFilter;
    transactions?: TransactionListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    avatar?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    isBot?: SortOrder;
    leagues?: LeagueOrderByRelationAggregateInput;
    rosters?: RosterOrderByRelationAggregateInput;
    transactions?: TransactionOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      username?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      displayName?: StringFilter<'User'> | string;
      avatar?: StringNullableFilter<'User'> | string | null;
      metadata?: JsonNullableFilter<'User'>;
      isBot?: BoolFilter<'User'> | boolean;
      leagues?: LeagueListRelationFilter;
      rosters?: RosterListRelationFilter;
      transactions?: TransactionListRelationFilter;
    },
    'id' | 'username'
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    avatar?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    isBot?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'User'> | string;
    username?: StringWithAggregatesFilter<'User'> | string;
    displayName?: StringWithAggregatesFilter<'User'> | string;
    avatar?: StringNullableWithAggregatesFilter<'User'> | string | null;
    metadata?: JsonNullableWithAggregatesFilter<'User'>;
    isBot?: BoolWithAggregatesFilter<'User'> | boolean;
  };

  export type LeagueWhereInput = {
    AND?: LeagueWhereInput | LeagueWhereInput[];
    OR?: LeagueWhereInput[];
    NOT?: LeagueWhereInput | LeagueWhereInput[];
    id?: StringFilter<'League'> | string;
    name?: StringFilter<'League'> | string;
    season?: StringFilter<'League'> | string;
    seasonType?: StringFilter<'League'> | string;
    status?: StringFilter<'League'> | string;
    sport?: StringFilter<'League'> | string;
    totalRosters?: IntFilter<'League'> | number;
    settings?: JsonNullableFilter<'League'>;
    scoringSettings?: JsonNullableFilter<'League'>;
    rosterPositions?: StringNullableListFilter<'League'>;
    metadata?: JsonNullableFilter<'League'>;
    previousLeagueId?: StringNullableFilter<'League'> | string | null;
    draftId?: StringNullableFilter<'League'> | string | null;
    playoffMatchups?: JsonNullableFilter<'League'>;
    createdAt?: DateTimeFilter<'League'> | Date | string;
    updatedAt?: DateTimeFilter<'League'> | Date | string;
    users?: UserListRelationFilter;
    rosters?: RosterListRelationFilter;
    matchups?: MatchupListRelationFilter;
    transactions?: TransactionListRelationFilter;
    tradedPicks?: TradedPickListRelationFilter;
    drafts?: DraftListRelationFilter;
    weeklyMetrics?: WeeklyMetricsListRelationFilter;
  };

  export type LeagueOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    season?: SortOrder;
    seasonType?: SortOrder;
    status?: SortOrder;
    sport?: SortOrder;
    totalRosters?: SortOrder;
    settings?: SortOrderInput | SortOrder;
    scoringSettings?: SortOrderInput | SortOrder;
    rosterPositions?: SortOrder;
    metadata?: SortOrderInput | SortOrder;
    previousLeagueId?: SortOrderInput | SortOrder;
    draftId?: SortOrderInput | SortOrder;
    playoffMatchups?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    users?: UserOrderByRelationAggregateInput;
    rosters?: RosterOrderByRelationAggregateInput;
    matchups?: MatchupOrderByRelationAggregateInput;
    transactions?: TransactionOrderByRelationAggregateInput;
    tradedPicks?: TradedPickOrderByRelationAggregateInput;
    drafts?: DraftOrderByRelationAggregateInput;
    weeklyMetrics?: WeeklyMetricsOrderByRelationAggregateInput;
  };

  export type LeagueWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: LeagueWhereInput | LeagueWhereInput[];
      OR?: LeagueWhereInput[];
      NOT?: LeagueWhereInput | LeagueWhereInput[];
      name?: StringFilter<'League'> | string;
      season?: StringFilter<'League'> | string;
      seasonType?: StringFilter<'League'> | string;
      status?: StringFilter<'League'> | string;
      sport?: StringFilter<'League'> | string;
      totalRosters?: IntFilter<'League'> | number;
      settings?: JsonNullableFilter<'League'>;
      scoringSettings?: JsonNullableFilter<'League'>;
      rosterPositions?: StringNullableListFilter<'League'>;
      metadata?: JsonNullableFilter<'League'>;
      previousLeagueId?: StringNullableFilter<'League'> | string | null;
      draftId?: StringNullableFilter<'League'> | string | null;
      playoffMatchups?: JsonNullableFilter<'League'>;
      createdAt?: DateTimeFilter<'League'> | Date | string;
      updatedAt?: DateTimeFilter<'League'> | Date | string;
      users?: UserListRelationFilter;
      rosters?: RosterListRelationFilter;
      matchups?: MatchupListRelationFilter;
      transactions?: TransactionListRelationFilter;
      tradedPicks?: TradedPickListRelationFilter;
      drafts?: DraftListRelationFilter;
      weeklyMetrics?: WeeklyMetricsListRelationFilter;
    },
    'id'
  >;

  export type LeagueOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    season?: SortOrder;
    seasonType?: SortOrder;
    status?: SortOrder;
    sport?: SortOrder;
    totalRosters?: SortOrder;
    settings?: SortOrderInput | SortOrder;
    scoringSettings?: SortOrderInput | SortOrder;
    rosterPositions?: SortOrder;
    metadata?: SortOrderInput | SortOrder;
    previousLeagueId?: SortOrderInput | SortOrder;
    draftId?: SortOrderInput | SortOrder;
    playoffMatchups?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: LeagueCountOrderByAggregateInput;
    _avg?: LeagueAvgOrderByAggregateInput;
    _max?: LeagueMaxOrderByAggregateInput;
    _min?: LeagueMinOrderByAggregateInput;
    _sum?: LeagueSumOrderByAggregateInput;
  };

  export type LeagueScalarWhereWithAggregatesInput = {
    AND?: LeagueScalarWhereWithAggregatesInput | LeagueScalarWhereWithAggregatesInput[];
    OR?: LeagueScalarWhereWithAggregatesInput[];
    NOT?: LeagueScalarWhereWithAggregatesInput | LeagueScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'League'> | string;
    name?: StringWithAggregatesFilter<'League'> | string;
    season?: StringWithAggregatesFilter<'League'> | string;
    seasonType?: StringWithAggregatesFilter<'League'> | string;
    status?: StringWithAggregatesFilter<'League'> | string;
    sport?: StringWithAggregatesFilter<'League'> | string;
    totalRosters?: IntWithAggregatesFilter<'League'> | number;
    settings?: JsonNullableWithAggregatesFilter<'League'>;
    scoringSettings?: JsonNullableWithAggregatesFilter<'League'>;
    rosterPositions?: StringNullableListFilter<'League'>;
    metadata?: JsonNullableWithAggregatesFilter<'League'>;
    previousLeagueId?: StringNullableWithAggregatesFilter<'League'> | string | null;
    draftId?: StringNullableWithAggregatesFilter<'League'> | string | null;
    playoffMatchups?: JsonNullableWithAggregatesFilter<'League'>;
    createdAt?: DateTimeWithAggregatesFilter<'League'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'League'> | Date | string;
  };

  export type RosterWhereInput = {
    AND?: RosterWhereInput | RosterWhereInput[];
    OR?: RosterWhereInput[];
    NOT?: RosterWhereInput | RosterWhereInput[];
    id?: IntFilter<'Roster'> | number;
    leagueId?: StringFilter<'Roster'> | string;
    ownerId?: StringNullableFilter<'Roster'> | string | null;
    coOwners?: StringNullableListFilter<'Roster'>;
    players?: StringNullableListFilter<'Roster'>;
    starters?: StringNullableListFilter<'Roster'>;
    reserve?: StringNullableListFilter<'Roster'>;
    settings?: JsonNullableFilter<'Roster'>;
    metadata?: JsonNullableFilter<'Roster'>;
    waiverBudget?: IntFilter<'Roster'> | number;
    waiverPosition?: IntNullableFilter<'Roster'> | number | null;
    createdAt?: DateTimeFilter<'Roster'> | Date | string;
    updatedAt?: DateTimeFilter<'Roster'> | Date | string;
    league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
    owner?: XOR<UserNullableRelationFilter, UserWhereInput> | null;
    matchups?: MatchupListRelationFilter;
    tradedPicks?: TradedPickListRelationFilter;
    weeklyMetrics?: WeeklyMetricsListRelationFilter;
  };

  export type RosterOrderByWithRelationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    ownerId?: SortOrderInput | SortOrder;
    coOwners?: SortOrder;
    players?: SortOrder;
    starters?: SortOrder;
    reserve?: SortOrder;
    settings?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    league?: LeagueOrderByWithRelationInput;
    owner?: UserOrderByWithRelationInput;
    matchups?: MatchupOrderByRelationAggregateInput;
    tradedPicks?: TradedPickOrderByRelationAggregateInput;
    weeklyMetrics?: WeeklyMetricsOrderByRelationAggregateInput;
  };

  export type RosterWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: RosterWhereInput | RosterWhereInput[];
      OR?: RosterWhereInput[];
      NOT?: RosterWhereInput | RosterWhereInput[];
      leagueId?: StringFilter<'Roster'> | string;
      ownerId?: StringNullableFilter<'Roster'> | string | null;
      coOwners?: StringNullableListFilter<'Roster'>;
      players?: StringNullableListFilter<'Roster'>;
      starters?: StringNullableListFilter<'Roster'>;
      reserve?: StringNullableListFilter<'Roster'>;
      settings?: JsonNullableFilter<'Roster'>;
      metadata?: JsonNullableFilter<'Roster'>;
      waiverBudget?: IntFilter<'Roster'> | number;
      waiverPosition?: IntNullableFilter<'Roster'> | number | null;
      createdAt?: DateTimeFilter<'Roster'> | Date | string;
      updatedAt?: DateTimeFilter<'Roster'> | Date | string;
      league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
      owner?: XOR<UserNullableRelationFilter, UserWhereInput> | null;
      matchups?: MatchupListRelationFilter;
      tradedPicks?: TradedPickListRelationFilter;
      weeklyMetrics?: WeeklyMetricsListRelationFilter;
    },
    'id'
  >;

  export type RosterOrderByWithAggregationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    ownerId?: SortOrderInput | SortOrder;
    coOwners?: SortOrder;
    players?: SortOrder;
    starters?: SortOrder;
    reserve?: SortOrder;
    settings?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: RosterCountOrderByAggregateInput;
    _avg?: RosterAvgOrderByAggregateInput;
    _max?: RosterMaxOrderByAggregateInput;
    _min?: RosterMinOrderByAggregateInput;
    _sum?: RosterSumOrderByAggregateInput;
  };

  export type RosterScalarWhereWithAggregatesInput = {
    AND?: RosterScalarWhereWithAggregatesInput | RosterScalarWhereWithAggregatesInput[];
    OR?: RosterScalarWhereWithAggregatesInput[];
    NOT?: RosterScalarWhereWithAggregatesInput | RosterScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'Roster'> | number;
    leagueId?: StringWithAggregatesFilter<'Roster'> | string;
    ownerId?: StringNullableWithAggregatesFilter<'Roster'> | string | null;
    coOwners?: StringNullableListFilter<'Roster'>;
    players?: StringNullableListFilter<'Roster'>;
    starters?: StringNullableListFilter<'Roster'>;
    reserve?: StringNullableListFilter<'Roster'>;
    settings?: JsonNullableWithAggregatesFilter<'Roster'>;
    metadata?: JsonNullableWithAggregatesFilter<'Roster'>;
    waiverBudget?: IntWithAggregatesFilter<'Roster'> | number;
    waiverPosition?: IntNullableWithAggregatesFilter<'Roster'> | number | null;
    createdAt?: DateTimeWithAggregatesFilter<'Roster'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Roster'> | Date | string;
  };

  export type MatchupWhereInput = {
    AND?: MatchupWhereInput | MatchupWhereInput[];
    OR?: MatchupWhereInput[];
    NOT?: MatchupWhereInput | MatchupWhereInput[];
    id?: StringFilter<'Matchup'> | string;
    leagueId?: StringFilter<'Matchup'> | string;
    week?: IntFilter<'Matchup'> | number;
    rosterId?: IntFilter<'Matchup'> | number;
    matchupId?: IntNullableFilter<'Matchup'> | number | null;
    points?: FloatFilter<'Matchup'> | number;
    customPoints?: FloatNullableFilter<'Matchup'> | number | null;
    starters?: StringNullableListFilter<'Matchup'>;
    startersPoints?: JsonNullableFilter<'Matchup'>;
    players?: StringNullableListFilter<'Matchup'>;
    playersPoints?: JsonNullableFilter<'Matchup'>;
    createdAt?: DateTimeFilter<'Matchup'> | Date | string;
    updatedAt?: DateTimeFilter<'Matchup'> | Date | string;
    league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
    roster?: XOR<RosterRelationFilter, RosterWhereInput>;
  };

  export type MatchupOrderByWithRelationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrderInput | SortOrder;
    points?: SortOrder;
    customPoints?: SortOrderInput | SortOrder;
    starters?: SortOrder;
    startersPoints?: SortOrderInput | SortOrder;
    players?: SortOrder;
    playersPoints?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    league?: LeagueOrderByWithRelationInput;
    roster?: RosterOrderByWithRelationInput;
  };

  export type MatchupWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      leagueId_week_rosterId?: MatchupLeagueIdWeekRosterIdCompoundUniqueInput;
      AND?: MatchupWhereInput | MatchupWhereInput[];
      OR?: MatchupWhereInput[];
      NOT?: MatchupWhereInput | MatchupWhereInput[];
      leagueId?: StringFilter<'Matchup'> | string;
      week?: IntFilter<'Matchup'> | number;
      rosterId?: IntFilter<'Matchup'> | number;
      matchupId?: IntNullableFilter<'Matchup'> | number | null;
      points?: FloatFilter<'Matchup'> | number;
      customPoints?: FloatNullableFilter<'Matchup'> | number | null;
      starters?: StringNullableListFilter<'Matchup'>;
      startersPoints?: JsonNullableFilter<'Matchup'>;
      players?: StringNullableListFilter<'Matchup'>;
      playersPoints?: JsonNullableFilter<'Matchup'>;
      createdAt?: DateTimeFilter<'Matchup'> | Date | string;
      updatedAt?: DateTimeFilter<'Matchup'> | Date | string;
      league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
      roster?: XOR<RosterRelationFilter, RosterWhereInput>;
    },
    'id' | 'leagueId_week_rosterId'
  >;

  export type MatchupOrderByWithAggregationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrderInput | SortOrder;
    points?: SortOrder;
    customPoints?: SortOrderInput | SortOrder;
    starters?: SortOrder;
    startersPoints?: SortOrderInput | SortOrder;
    players?: SortOrder;
    playersPoints?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: MatchupCountOrderByAggregateInput;
    _avg?: MatchupAvgOrderByAggregateInput;
    _max?: MatchupMaxOrderByAggregateInput;
    _min?: MatchupMinOrderByAggregateInput;
    _sum?: MatchupSumOrderByAggregateInput;
  };

  export type MatchupScalarWhereWithAggregatesInput = {
    AND?: MatchupScalarWhereWithAggregatesInput | MatchupScalarWhereWithAggregatesInput[];
    OR?: MatchupScalarWhereWithAggregatesInput[];
    NOT?: MatchupScalarWhereWithAggregatesInput | MatchupScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Matchup'> | string;
    leagueId?: StringWithAggregatesFilter<'Matchup'> | string;
    week?: IntWithAggregatesFilter<'Matchup'> | number;
    rosterId?: IntWithAggregatesFilter<'Matchup'> | number;
    matchupId?: IntNullableWithAggregatesFilter<'Matchup'> | number | null;
    points?: FloatWithAggregatesFilter<'Matchup'> | number;
    customPoints?: FloatNullableWithAggregatesFilter<'Matchup'> | number | null;
    starters?: StringNullableListFilter<'Matchup'>;
    startersPoints?: JsonNullableWithAggregatesFilter<'Matchup'>;
    players?: StringNullableListFilter<'Matchup'>;
    playersPoints?: JsonNullableWithAggregatesFilter<'Matchup'>;
    createdAt?: DateTimeWithAggregatesFilter<'Matchup'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Matchup'> | Date | string;
  };

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[];
    OR?: TransactionWhereInput[];
    NOT?: TransactionWhereInput | TransactionWhereInput[];
    id?: StringFilter<'Transaction'> | string;
    leagueId?: StringFilter<'Transaction'> | string;
    type?: StringFilter<'Transaction'> | string;
    status?: StringFilter<'Transaction'> | string;
    creatorId?: StringFilter<'Transaction'> | string;
    rosterIds?: IntNullableListFilter<'Transaction'>;
    adds?: JsonNullableFilter<'Transaction'>;
    drops?: JsonNullableFilter<'Transaction'>;
    draftPicks?: JsonNullableFilter<'Transaction'>;
    waiver?: JsonNullableFilter<'Transaction'>;
    settings?: JsonNullableFilter<'Transaction'>;
    leg?: IntFilter<'Transaction'> | number;
    consenterIds?: StringNullableListFilter<'Transaction'>;
    createdAt?: DateTimeFilter<'Transaction'> | Date | string;
    updatedAt?: DateTimeFilter<'Transaction'> | Date | string;
    league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
    creator?: XOR<UserRelationFilter, UserWhereInput>;
  };

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    type?: SortOrder;
    status?: SortOrder;
    creatorId?: SortOrder;
    rosterIds?: SortOrder;
    adds?: SortOrderInput | SortOrder;
    drops?: SortOrderInput | SortOrder;
    draftPicks?: SortOrderInput | SortOrder;
    waiver?: SortOrderInput | SortOrder;
    settings?: SortOrderInput | SortOrder;
    leg?: SortOrder;
    consenterIds?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    league?: LeagueOrderByWithRelationInput;
    creator?: UserOrderByWithRelationInput;
  };

  export type TransactionWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: TransactionWhereInput | TransactionWhereInput[];
      OR?: TransactionWhereInput[];
      NOT?: TransactionWhereInput | TransactionWhereInput[];
      leagueId?: StringFilter<'Transaction'> | string;
      type?: StringFilter<'Transaction'> | string;
      status?: StringFilter<'Transaction'> | string;
      creatorId?: StringFilter<'Transaction'> | string;
      rosterIds?: IntNullableListFilter<'Transaction'>;
      adds?: JsonNullableFilter<'Transaction'>;
      drops?: JsonNullableFilter<'Transaction'>;
      draftPicks?: JsonNullableFilter<'Transaction'>;
      waiver?: JsonNullableFilter<'Transaction'>;
      settings?: JsonNullableFilter<'Transaction'>;
      leg?: IntFilter<'Transaction'> | number;
      consenterIds?: StringNullableListFilter<'Transaction'>;
      createdAt?: DateTimeFilter<'Transaction'> | Date | string;
      updatedAt?: DateTimeFilter<'Transaction'> | Date | string;
      league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
      creator?: XOR<UserRelationFilter, UserWhereInput>;
    },
    'id'
  >;

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    type?: SortOrder;
    status?: SortOrder;
    creatorId?: SortOrder;
    rosterIds?: SortOrder;
    adds?: SortOrderInput | SortOrder;
    drops?: SortOrderInput | SortOrder;
    draftPicks?: SortOrderInput | SortOrder;
    waiver?: SortOrderInput | SortOrder;
    settings?: SortOrderInput | SortOrder;
    leg?: SortOrder;
    consenterIds?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: TransactionCountOrderByAggregateInput;
    _avg?: TransactionAvgOrderByAggregateInput;
    _max?: TransactionMaxOrderByAggregateInput;
    _min?: TransactionMinOrderByAggregateInput;
    _sum?: TransactionSumOrderByAggregateInput;
  };

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[];
    OR?: TransactionScalarWhereWithAggregatesInput[];
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Transaction'> | string;
    leagueId?: StringWithAggregatesFilter<'Transaction'> | string;
    type?: StringWithAggregatesFilter<'Transaction'> | string;
    status?: StringWithAggregatesFilter<'Transaction'> | string;
    creatorId?: StringWithAggregatesFilter<'Transaction'> | string;
    rosterIds?: IntNullableListFilter<'Transaction'>;
    adds?: JsonNullableWithAggregatesFilter<'Transaction'>;
    drops?: JsonNullableWithAggregatesFilter<'Transaction'>;
    draftPicks?: JsonNullableWithAggregatesFilter<'Transaction'>;
    waiver?: JsonNullableWithAggregatesFilter<'Transaction'>;
    settings?: JsonNullableWithAggregatesFilter<'Transaction'>;
    leg?: IntWithAggregatesFilter<'Transaction'> | number;
    consenterIds?: StringNullableListFilter<'Transaction'>;
    createdAt?: DateTimeWithAggregatesFilter<'Transaction'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Transaction'> | Date | string;
  };

  export type TradedPickWhereInput = {
    AND?: TradedPickWhereInput | TradedPickWhereInput[];
    OR?: TradedPickWhereInput[];
    NOT?: TradedPickWhereInput | TradedPickWhereInput[];
    id?: StringFilter<'TradedPick'> | string;
    leagueId?: StringFilter<'TradedPick'> | string;
    season?: StringFilter<'TradedPick'> | string;
    round?: IntFilter<'TradedPick'> | number;
    rosterId?: IntFilter<'TradedPick'> | number;
    previousOwnerId?: IntNullableFilter<'TradedPick'> | number | null;
    ownerId?: IntFilter<'TradedPick'> | number;
    createdAt?: DateTimeFilter<'TradedPick'> | Date | string;
    updatedAt?: DateTimeFilter<'TradedPick'> | Date | string;
    league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
    currentOwner?: XOR<RosterRelationFilter, RosterWhereInput>;
  };

  export type TradedPickOrderByWithRelationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    season?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrderInput | SortOrder;
    ownerId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    league?: LeagueOrderByWithRelationInput;
    currentOwner?: RosterOrderByWithRelationInput;
  };

  export type TradedPickWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: TradedPickWhereInput | TradedPickWhereInput[];
      OR?: TradedPickWhereInput[];
      NOT?: TradedPickWhereInput | TradedPickWhereInput[];
      leagueId?: StringFilter<'TradedPick'> | string;
      season?: StringFilter<'TradedPick'> | string;
      round?: IntFilter<'TradedPick'> | number;
      rosterId?: IntFilter<'TradedPick'> | number;
      previousOwnerId?: IntNullableFilter<'TradedPick'> | number | null;
      ownerId?: IntFilter<'TradedPick'> | number;
      createdAt?: DateTimeFilter<'TradedPick'> | Date | string;
      updatedAt?: DateTimeFilter<'TradedPick'> | Date | string;
      league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
      currentOwner?: XOR<RosterRelationFilter, RosterWhereInput>;
    },
    'id'
  >;

  export type TradedPickOrderByWithAggregationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    season?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrderInput | SortOrder;
    ownerId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: TradedPickCountOrderByAggregateInput;
    _avg?: TradedPickAvgOrderByAggregateInput;
    _max?: TradedPickMaxOrderByAggregateInput;
    _min?: TradedPickMinOrderByAggregateInput;
    _sum?: TradedPickSumOrderByAggregateInput;
  };

  export type TradedPickScalarWhereWithAggregatesInput = {
    AND?: TradedPickScalarWhereWithAggregatesInput | TradedPickScalarWhereWithAggregatesInput[];
    OR?: TradedPickScalarWhereWithAggregatesInput[];
    NOT?: TradedPickScalarWhereWithAggregatesInput | TradedPickScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'TradedPick'> | string;
    leagueId?: StringWithAggregatesFilter<'TradedPick'> | string;
    season?: StringWithAggregatesFilter<'TradedPick'> | string;
    round?: IntWithAggregatesFilter<'TradedPick'> | number;
    rosterId?: IntWithAggregatesFilter<'TradedPick'> | number;
    previousOwnerId?: IntNullableWithAggregatesFilter<'TradedPick'> | number | null;
    ownerId?: IntWithAggregatesFilter<'TradedPick'> | number;
    createdAt?: DateTimeWithAggregatesFilter<'TradedPick'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'TradedPick'> | Date | string;
  };

  export type DraftWhereInput = {
    AND?: DraftWhereInput | DraftWhereInput[];
    OR?: DraftWhereInput[];
    NOT?: DraftWhereInput | DraftWhereInput[];
    id?: StringFilter<'Draft'> | string;
    leagueId?: StringFilter<'Draft'> | string;
    status?: StringFilter<'Draft'> | string;
    type?: StringFilter<'Draft'> | string;
    season?: StringFilter<'Draft'> | string;
    settings?: JsonFilter<'Draft'>;
    metadata?: JsonNullableFilter<'Draft'>;
    slotToRosterId?: IntNullableListFilter<'Draft'>;
    createdAt?: DateTimeFilter<'Draft'> | Date | string;
    updatedAt?: DateTimeFilter<'Draft'> | Date | string;
    league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
    picks?: DraftPickListRelationFilter;
  };

  export type DraftOrderByWithRelationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    status?: SortOrder;
    type?: SortOrder;
    season?: SortOrder;
    settings?: SortOrder;
    metadata?: SortOrderInput | SortOrder;
    slotToRosterId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    league?: LeagueOrderByWithRelationInput;
    picks?: DraftPickOrderByRelationAggregateInput;
  };

  export type DraftWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: DraftWhereInput | DraftWhereInput[];
      OR?: DraftWhereInput[];
      NOT?: DraftWhereInput | DraftWhereInput[];
      leagueId?: StringFilter<'Draft'> | string;
      status?: StringFilter<'Draft'> | string;
      type?: StringFilter<'Draft'> | string;
      season?: StringFilter<'Draft'> | string;
      settings?: JsonFilter<'Draft'>;
      metadata?: JsonNullableFilter<'Draft'>;
      slotToRosterId?: IntNullableListFilter<'Draft'>;
      createdAt?: DateTimeFilter<'Draft'> | Date | string;
      updatedAt?: DateTimeFilter<'Draft'> | Date | string;
      league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
      picks?: DraftPickListRelationFilter;
    },
    'id'
  >;

  export type DraftOrderByWithAggregationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    status?: SortOrder;
    type?: SortOrder;
    season?: SortOrder;
    settings?: SortOrder;
    metadata?: SortOrderInput | SortOrder;
    slotToRosterId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: DraftCountOrderByAggregateInput;
    _avg?: DraftAvgOrderByAggregateInput;
    _max?: DraftMaxOrderByAggregateInput;
    _min?: DraftMinOrderByAggregateInput;
    _sum?: DraftSumOrderByAggregateInput;
  };

  export type DraftScalarWhereWithAggregatesInput = {
    AND?: DraftScalarWhereWithAggregatesInput | DraftScalarWhereWithAggregatesInput[];
    OR?: DraftScalarWhereWithAggregatesInput[];
    NOT?: DraftScalarWhereWithAggregatesInput | DraftScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Draft'> | string;
    leagueId?: StringWithAggregatesFilter<'Draft'> | string;
    status?: StringWithAggregatesFilter<'Draft'> | string;
    type?: StringWithAggregatesFilter<'Draft'> | string;
    season?: StringWithAggregatesFilter<'Draft'> | string;
    settings?: JsonWithAggregatesFilter<'Draft'>;
    metadata?: JsonNullableWithAggregatesFilter<'Draft'>;
    slotToRosterId?: IntNullableListFilter<'Draft'>;
    createdAt?: DateTimeWithAggregatesFilter<'Draft'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Draft'> | Date | string;
  };

  export type DraftPickWhereInput = {
    AND?: DraftPickWhereInput | DraftPickWhereInput[];
    OR?: DraftPickWhereInput[];
    NOT?: DraftPickWhereInput | DraftPickWhereInput[];
    id?: StringFilter<'DraftPick'> | string;
    draftId?: StringFilter<'DraftPick'> | string;
    pickNo?: IntFilter<'DraftPick'> | number;
    round?: IntFilter<'DraftPick'> | number;
    rosterId?: IntFilter<'DraftPick'> | number;
    playerId?: StringFilter<'DraftPick'> | string;
    pickedBy?: StringNullableFilter<'DraftPick'> | string | null;
    metadata?: JsonNullableFilter<'DraftPick'>;
    isKeeper?: BoolFilter<'DraftPick'> | boolean;
    createdAt?: DateTimeFilter<'DraftPick'> | Date | string;
    updatedAt?: DateTimeFilter<'DraftPick'> | Date | string;
    draft?: XOR<DraftRelationFilter, DraftWhereInput>;
  };

  export type DraftPickOrderByWithRelationInput = {
    id?: SortOrder;
    draftId?: SortOrder;
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    playerId?: SortOrder;
    pickedBy?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    isKeeper?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    draft?: DraftOrderByWithRelationInput;
  };

  export type DraftPickWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      draftId_pickNo?: DraftPickDraftIdPickNoCompoundUniqueInput;
      AND?: DraftPickWhereInput | DraftPickWhereInput[];
      OR?: DraftPickWhereInput[];
      NOT?: DraftPickWhereInput | DraftPickWhereInput[];
      draftId?: StringFilter<'DraftPick'> | string;
      pickNo?: IntFilter<'DraftPick'> | number;
      round?: IntFilter<'DraftPick'> | number;
      rosterId?: IntFilter<'DraftPick'> | number;
      playerId?: StringFilter<'DraftPick'> | string;
      pickedBy?: StringNullableFilter<'DraftPick'> | string | null;
      metadata?: JsonNullableFilter<'DraftPick'>;
      isKeeper?: BoolFilter<'DraftPick'> | boolean;
      createdAt?: DateTimeFilter<'DraftPick'> | Date | string;
      updatedAt?: DateTimeFilter<'DraftPick'> | Date | string;
      draft?: XOR<DraftRelationFilter, DraftWhereInput>;
    },
    'id' | 'draftId_pickNo'
  >;

  export type DraftPickOrderByWithAggregationInput = {
    id?: SortOrder;
    draftId?: SortOrder;
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    playerId?: SortOrder;
    pickedBy?: SortOrderInput | SortOrder;
    metadata?: SortOrderInput | SortOrder;
    isKeeper?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: DraftPickCountOrderByAggregateInput;
    _avg?: DraftPickAvgOrderByAggregateInput;
    _max?: DraftPickMaxOrderByAggregateInput;
    _min?: DraftPickMinOrderByAggregateInput;
    _sum?: DraftPickSumOrderByAggregateInput;
  };

  export type DraftPickScalarWhereWithAggregatesInput = {
    AND?: DraftPickScalarWhereWithAggregatesInput | DraftPickScalarWhereWithAggregatesInput[];
    OR?: DraftPickScalarWhereWithAggregatesInput[];
    NOT?: DraftPickScalarWhereWithAggregatesInput | DraftPickScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'DraftPick'> | string;
    draftId?: StringWithAggregatesFilter<'DraftPick'> | string;
    pickNo?: IntWithAggregatesFilter<'DraftPick'> | number;
    round?: IntWithAggregatesFilter<'DraftPick'> | number;
    rosterId?: IntWithAggregatesFilter<'DraftPick'> | number;
    playerId?: StringWithAggregatesFilter<'DraftPick'> | string;
    pickedBy?: StringNullableWithAggregatesFilter<'DraftPick'> | string | null;
    metadata?: JsonNullableWithAggregatesFilter<'DraftPick'>;
    isKeeper?: BoolWithAggregatesFilter<'DraftPick'> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<'DraftPick'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'DraftPick'> | Date | string;
  };

  export type PlayerWhereInput = {
    AND?: PlayerWhereInput | PlayerWhereInput[];
    OR?: PlayerWhereInput[];
    NOT?: PlayerWhereInput | PlayerWhereInput[];
    id?: StringFilter<'Player'> | string;
    hashtag?: StringNullableFilter<'Player'> | string | null;
    firstName?: StringFilter<'Player'> | string;
    lastName?: StringFilter<'Player'> | string;
    fullName?: StringFilter<'Player'> | string;
    team?: StringNullableFilter<'Player'> | string | null;
    position?: StringFilter<'Player'> | string;
    depthChartOrder?: IntNullableFilter<'Player'> | number | null;
    status?: StringNullableFilter<'Player'> | string | null;
    injuryStatus?: StringNullableFilter<'Player'> | string | null;
    weight?: StringNullableFilter<'Player'> | string | null;
    height?: StringNullableFilter<'Player'> | string | null;
    number?: IntNullableFilter<'Player'> | number | null;
    age?: IntNullableFilter<'Player'> | number | null;
    yearsExp?: IntNullableFilter<'Player'> | number | null;
    createdAt?: DateTimeFilter<'Player'> | Date | string;
    updatedAt?: DateTimeFilter<'Player'> | Date | string;
  };

  export type PlayerOrderByWithRelationInput = {
    id?: SortOrder;
    hashtag?: SortOrderInput | SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    fullName?: SortOrder;
    team?: SortOrderInput | SortOrder;
    position?: SortOrder;
    depthChartOrder?: SortOrderInput | SortOrder;
    status?: SortOrderInput | SortOrder;
    injuryStatus?: SortOrderInput | SortOrder;
    weight?: SortOrderInput | SortOrder;
    height?: SortOrderInput | SortOrder;
    number?: SortOrderInput | SortOrder;
    age?: SortOrderInput | SortOrder;
    yearsExp?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: PlayerWhereInput | PlayerWhereInput[];
      OR?: PlayerWhereInput[];
      NOT?: PlayerWhereInput | PlayerWhereInput[];
      hashtag?: StringNullableFilter<'Player'> | string | null;
      firstName?: StringFilter<'Player'> | string;
      lastName?: StringFilter<'Player'> | string;
      fullName?: StringFilter<'Player'> | string;
      team?: StringNullableFilter<'Player'> | string | null;
      position?: StringFilter<'Player'> | string;
      depthChartOrder?: IntNullableFilter<'Player'> | number | null;
      status?: StringNullableFilter<'Player'> | string | null;
      injuryStatus?: StringNullableFilter<'Player'> | string | null;
      weight?: StringNullableFilter<'Player'> | string | null;
      height?: StringNullableFilter<'Player'> | string | null;
      number?: IntNullableFilter<'Player'> | number | null;
      age?: IntNullableFilter<'Player'> | number | null;
      yearsExp?: IntNullableFilter<'Player'> | number | null;
      createdAt?: DateTimeFilter<'Player'> | Date | string;
      updatedAt?: DateTimeFilter<'Player'> | Date | string;
    },
    'id'
  >;

  export type PlayerOrderByWithAggregationInput = {
    id?: SortOrder;
    hashtag?: SortOrderInput | SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    fullName?: SortOrder;
    team?: SortOrderInput | SortOrder;
    position?: SortOrder;
    depthChartOrder?: SortOrderInput | SortOrder;
    status?: SortOrderInput | SortOrder;
    injuryStatus?: SortOrderInput | SortOrder;
    weight?: SortOrderInput | SortOrder;
    height?: SortOrderInput | SortOrder;
    number?: SortOrderInput | SortOrder;
    age?: SortOrderInput | SortOrder;
    yearsExp?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: PlayerCountOrderByAggregateInput;
    _avg?: PlayerAvgOrderByAggregateInput;
    _max?: PlayerMaxOrderByAggregateInput;
    _min?: PlayerMinOrderByAggregateInput;
    _sum?: PlayerSumOrderByAggregateInput;
  };

  export type PlayerScalarWhereWithAggregatesInput = {
    AND?: PlayerScalarWhereWithAggregatesInput | PlayerScalarWhereWithAggregatesInput[];
    OR?: PlayerScalarWhereWithAggregatesInput[];
    NOT?: PlayerScalarWhereWithAggregatesInput | PlayerScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Player'> | string;
    hashtag?: StringNullableWithAggregatesFilter<'Player'> | string | null;
    firstName?: StringWithAggregatesFilter<'Player'> | string;
    lastName?: StringWithAggregatesFilter<'Player'> | string;
    fullName?: StringWithAggregatesFilter<'Player'> | string;
    team?: StringNullableWithAggregatesFilter<'Player'> | string | null;
    position?: StringWithAggregatesFilter<'Player'> | string;
    depthChartOrder?: IntNullableWithAggregatesFilter<'Player'> | number | null;
    status?: StringNullableWithAggregatesFilter<'Player'> | string | null;
    injuryStatus?: StringNullableWithAggregatesFilter<'Player'> | string | null;
    weight?: StringNullableWithAggregatesFilter<'Player'> | string | null;
    height?: StringNullableWithAggregatesFilter<'Player'> | string | null;
    number?: IntNullableWithAggregatesFilter<'Player'> | number | null;
    age?: IntNullableWithAggregatesFilter<'Player'> | number | null;
    yearsExp?: IntNullableWithAggregatesFilter<'Player'> | number | null;
    createdAt?: DateTimeWithAggregatesFilter<'Player'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Player'> | Date | string;
  };

  export type PlayerStatsWhereInput = {
    AND?: PlayerStatsWhereInput | PlayerStatsWhereInput[];
    OR?: PlayerStatsWhereInput[];
    NOT?: PlayerStatsWhereInput | PlayerStatsWhereInput[];
    id?: StringFilter<'PlayerStats'> | string;
    playerId?: StringFilter<'PlayerStats'> | string;
    week?: IntFilter<'PlayerStats'> | number;
    season?: StringFilter<'PlayerStats'> | string;
    statsType?: StringFilter<'PlayerStats'> | string;
    stats?: JsonFilter<'PlayerStats'>;
    createdAt?: DateTimeFilter<'PlayerStats'> | Date | string;
    updatedAt?: DateTimeFilter<'PlayerStats'> | Date | string;
  };

  export type PlayerStatsOrderByWithRelationInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    statsType?: SortOrder;
    stats?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerStatsWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      playerId_week_season_statsType?: PlayerStatsPlayerIdWeekSeasonStatsTypeCompoundUniqueInput;
      AND?: PlayerStatsWhereInput | PlayerStatsWhereInput[];
      OR?: PlayerStatsWhereInput[];
      NOT?: PlayerStatsWhereInput | PlayerStatsWhereInput[];
      playerId?: StringFilter<'PlayerStats'> | string;
      week?: IntFilter<'PlayerStats'> | number;
      season?: StringFilter<'PlayerStats'> | string;
      statsType?: StringFilter<'PlayerStats'> | string;
      stats?: JsonFilter<'PlayerStats'>;
      createdAt?: DateTimeFilter<'PlayerStats'> | Date | string;
      updatedAt?: DateTimeFilter<'PlayerStats'> | Date | string;
    },
    'id' | 'playerId_week_season_statsType'
  >;

  export type PlayerStatsOrderByWithAggregationInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    statsType?: SortOrder;
    stats?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: PlayerStatsCountOrderByAggregateInput;
    _avg?: PlayerStatsAvgOrderByAggregateInput;
    _max?: PlayerStatsMaxOrderByAggregateInput;
    _min?: PlayerStatsMinOrderByAggregateInput;
    _sum?: PlayerStatsSumOrderByAggregateInput;
  };

  export type PlayerStatsScalarWhereWithAggregatesInput = {
    AND?: PlayerStatsScalarWhereWithAggregatesInput | PlayerStatsScalarWhereWithAggregatesInput[];
    OR?: PlayerStatsScalarWhereWithAggregatesInput[];
    NOT?: PlayerStatsScalarWhereWithAggregatesInput | PlayerStatsScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'PlayerStats'> | string;
    playerId?: StringWithAggregatesFilter<'PlayerStats'> | string;
    week?: IntWithAggregatesFilter<'PlayerStats'> | number;
    season?: StringWithAggregatesFilter<'PlayerStats'> | string;
    statsType?: StringWithAggregatesFilter<'PlayerStats'> | string;
    stats?: JsonWithAggregatesFilter<'PlayerStats'>;
    createdAt?: DateTimeWithAggregatesFilter<'PlayerStats'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'PlayerStats'> | Date | string;
  };

  export type WeeklyMetricsWhereInput = {
    AND?: WeeklyMetricsWhereInput | WeeklyMetricsWhereInput[];
    OR?: WeeklyMetricsWhereInput[];
    NOT?: WeeklyMetricsWhereInput | WeeklyMetricsWhereInput[];
    id?: StringFilter<'WeeklyMetrics'> | string;
    leagueId?: StringFilter<'WeeklyMetrics'> | string;
    rosterId?: IntFilter<'WeeklyMetrics'> | number;
    week?: IntFilter<'WeeklyMetrics'> | number;
    totalPoints?: FloatFilter<'WeeklyMetrics'> | number;
    expectedWins?: FloatFilter<'WeeklyMetrics'> | number;
    luckRating?: FloatFilter<'WeeklyMetrics'> | number;
    opponentPoints?: FloatFilter<'WeeklyMetrics'> | number;
    createdAt?: DateTimeFilter<'WeeklyMetrics'> | Date | string;
    updatedAt?: DateTimeFilter<'WeeklyMetrics'> | Date | string;
    league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
    roster?: XOR<RosterRelationFilter, RosterWhereInput>;
  };

  export type WeeklyMetricsOrderByWithRelationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    league?: LeagueOrderByWithRelationInput;
    roster?: RosterOrderByWithRelationInput;
  };

  export type WeeklyMetricsWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      leagueId_rosterId_week?: WeeklyMetricsLeagueIdRosterIdWeekCompoundUniqueInput;
      AND?: WeeklyMetricsWhereInput | WeeklyMetricsWhereInput[];
      OR?: WeeklyMetricsWhereInput[];
      NOT?: WeeklyMetricsWhereInput | WeeklyMetricsWhereInput[];
      leagueId?: StringFilter<'WeeklyMetrics'> | string;
      rosterId?: IntFilter<'WeeklyMetrics'> | number;
      week?: IntFilter<'WeeklyMetrics'> | number;
      totalPoints?: FloatFilter<'WeeklyMetrics'> | number;
      expectedWins?: FloatFilter<'WeeklyMetrics'> | number;
      luckRating?: FloatFilter<'WeeklyMetrics'> | number;
      opponentPoints?: FloatFilter<'WeeklyMetrics'> | number;
      createdAt?: DateTimeFilter<'WeeklyMetrics'> | Date | string;
      updatedAt?: DateTimeFilter<'WeeklyMetrics'> | Date | string;
      league?: XOR<LeagueRelationFilter, LeagueWhereInput>;
      roster?: XOR<RosterRelationFilter, RosterWhereInput>;
    },
    'id' | 'leagueId_rosterId_week'
  >;

  export type WeeklyMetricsOrderByWithAggregationInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: WeeklyMetricsCountOrderByAggregateInput;
    _avg?: WeeklyMetricsAvgOrderByAggregateInput;
    _max?: WeeklyMetricsMaxOrderByAggregateInput;
    _min?: WeeklyMetricsMinOrderByAggregateInput;
    _sum?: WeeklyMetricsSumOrderByAggregateInput;
  };

  export type WeeklyMetricsScalarWhereWithAggregatesInput = {
    AND?:
      | WeeklyMetricsScalarWhereWithAggregatesInput
      | WeeklyMetricsScalarWhereWithAggregatesInput[];
    OR?: WeeklyMetricsScalarWhereWithAggregatesInput[];
    NOT?:
      | WeeklyMetricsScalarWhereWithAggregatesInput
      | WeeklyMetricsScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'WeeklyMetrics'> | string;
    leagueId?: StringWithAggregatesFilter<'WeeklyMetrics'> | string;
    rosterId?: IntWithAggregatesFilter<'WeeklyMetrics'> | number;
    week?: IntWithAggregatesFilter<'WeeklyMetrics'> | number;
    totalPoints?: FloatWithAggregatesFilter<'WeeklyMetrics'> | number;
    expectedWins?: FloatWithAggregatesFilter<'WeeklyMetrics'> | number;
    luckRating?: FloatWithAggregatesFilter<'WeeklyMetrics'> | number;
    opponentPoints?: FloatWithAggregatesFilter<'WeeklyMetrics'> | number;
    createdAt?: DateTimeWithAggregatesFilter<'WeeklyMetrics'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'WeeklyMetrics'> | Date | string;
  };

  export type PositionVarianceWhereInput = {
    AND?: PositionVarianceWhereInput | PositionVarianceWhereInput[];
    OR?: PositionVarianceWhereInput[];
    NOT?: PositionVarianceWhereInput | PositionVarianceWhereInput[];
    id?: StringFilter<'PositionVariance'> | string;
    position?: StringFilter<'PositionVariance'> | string;
    season?: StringFilter<'PositionVariance'> | string;
    sampleSize?: IntFilter<'PositionVariance'> | number;
    meanError?: FloatFilter<'PositionVariance'> | number;
    stdDev?: FloatFilter<'PositionVariance'> | number;
    lastUpdated?: DateTimeFilter<'PositionVariance'> | Date | string;
    createdAt?: DateTimeFilter<'PositionVariance'> | Date | string;
  };

  export type PositionVarianceOrderByWithRelationInput = {
    id?: SortOrder;
    position?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PositionVarianceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      position_season?: PositionVariancePositionSeasonCompoundUniqueInput;
      AND?: PositionVarianceWhereInput | PositionVarianceWhereInput[];
      OR?: PositionVarianceWhereInput[];
      NOT?: PositionVarianceWhereInput | PositionVarianceWhereInput[];
      position?: StringFilter<'PositionVariance'> | string;
      season?: StringFilter<'PositionVariance'> | string;
      sampleSize?: IntFilter<'PositionVariance'> | number;
      meanError?: FloatFilter<'PositionVariance'> | number;
      stdDev?: FloatFilter<'PositionVariance'> | number;
      lastUpdated?: DateTimeFilter<'PositionVariance'> | Date | string;
      createdAt?: DateTimeFilter<'PositionVariance'> | Date | string;
    },
    'id' | 'position_season'
  >;

  export type PositionVarianceOrderByWithAggregationInput = {
    id?: SortOrder;
    position?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
    _count?: PositionVarianceCountOrderByAggregateInput;
    _avg?: PositionVarianceAvgOrderByAggregateInput;
    _max?: PositionVarianceMaxOrderByAggregateInput;
    _min?: PositionVarianceMinOrderByAggregateInput;
    _sum?: PositionVarianceSumOrderByAggregateInput;
  };

  export type PositionVarianceScalarWhereWithAggregatesInput = {
    AND?:
      | PositionVarianceScalarWhereWithAggregatesInput
      | PositionVarianceScalarWhereWithAggregatesInput[];
    OR?: PositionVarianceScalarWhereWithAggregatesInput[];
    NOT?:
      | PositionVarianceScalarWhereWithAggregatesInput
      | PositionVarianceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'PositionVariance'> | string;
    position?: StringWithAggregatesFilter<'PositionVariance'> | string;
    season?: StringWithAggregatesFilter<'PositionVariance'> | string;
    sampleSize?: IntWithAggregatesFilter<'PositionVariance'> | number;
    meanError?: FloatWithAggregatesFilter<'PositionVariance'> | number;
    stdDev?: FloatWithAggregatesFilter<'PositionVariance'> | number;
    lastUpdated?: DateTimeWithAggregatesFilter<'PositionVariance'> | Date | string;
    createdAt?: DateTimeWithAggregatesFilter<'PositionVariance'> | Date | string;
  };

  export type PlayerVarianceWhereInput = {
    AND?: PlayerVarianceWhereInput | PlayerVarianceWhereInput[];
    OR?: PlayerVarianceWhereInput[];
    NOT?: PlayerVarianceWhereInput | PlayerVarianceWhereInput[];
    id?: StringFilter<'PlayerVariance'> | string;
    playerId?: StringFilter<'PlayerVariance'> | string;
    season?: StringFilter<'PlayerVariance'> | string;
    sampleSize?: IntFilter<'PlayerVariance'> | number;
    meanError?: FloatFilter<'PlayerVariance'> | number;
    stdDev?: FloatFilter<'PlayerVariance'> | number;
    lastUpdated?: DateTimeFilter<'PlayerVariance'> | Date | string;
    createdAt?: DateTimeFilter<'PlayerVariance'> | Date | string;
  };

  export type PlayerVarianceOrderByWithRelationInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PlayerVarianceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      playerId_season?: PlayerVariancePlayerIdSeasonCompoundUniqueInput;
      AND?: PlayerVarianceWhereInput | PlayerVarianceWhereInput[];
      OR?: PlayerVarianceWhereInput[];
      NOT?: PlayerVarianceWhereInput | PlayerVarianceWhereInput[];
      playerId?: StringFilter<'PlayerVariance'> | string;
      season?: StringFilter<'PlayerVariance'> | string;
      sampleSize?: IntFilter<'PlayerVariance'> | number;
      meanError?: FloatFilter<'PlayerVariance'> | number;
      stdDev?: FloatFilter<'PlayerVariance'> | number;
      lastUpdated?: DateTimeFilter<'PlayerVariance'> | Date | string;
      createdAt?: DateTimeFilter<'PlayerVariance'> | Date | string;
    },
    'id' | 'playerId_season'
  >;

  export type PlayerVarianceOrderByWithAggregationInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
    _count?: PlayerVarianceCountOrderByAggregateInput;
    _avg?: PlayerVarianceAvgOrderByAggregateInput;
    _max?: PlayerVarianceMaxOrderByAggregateInput;
    _min?: PlayerVarianceMinOrderByAggregateInput;
    _sum?: PlayerVarianceSumOrderByAggregateInput;
  };

  export type PlayerVarianceScalarWhereWithAggregatesInput = {
    AND?:
      | PlayerVarianceScalarWhereWithAggregatesInput
      | PlayerVarianceScalarWhereWithAggregatesInput[];
    OR?: PlayerVarianceScalarWhereWithAggregatesInput[];
    NOT?:
      | PlayerVarianceScalarWhereWithAggregatesInput
      | PlayerVarianceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'PlayerVariance'> | string;
    playerId?: StringWithAggregatesFilter<'PlayerVariance'> | string;
    season?: StringWithAggregatesFilter<'PlayerVariance'> | string;
    sampleSize?: IntWithAggregatesFilter<'PlayerVariance'> | number;
    meanError?: FloatWithAggregatesFilter<'PlayerVariance'> | number;
    stdDev?: FloatWithAggregatesFilter<'PlayerVariance'> | number;
    lastUpdated?: DateTimeWithAggregatesFilter<'PlayerVariance'> | Date | string;
    createdAt?: DateTimeWithAggregatesFilter<'PlayerVariance'> | Date | string;
  };

  export type ProjectionErrorWhereInput = {
    AND?: ProjectionErrorWhereInput | ProjectionErrorWhereInput[];
    OR?: ProjectionErrorWhereInput[];
    NOT?: ProjectionErrorWhereInput | ProjectionErrorWhereInput[];
    id?: StringFilter<'ProjectionError'> | string;
    playerId?: StringFilter<'ProjectionError'> | string;
    week?: IntFilter<'ProjectionError'> | number;
    season?: StringFilter<'ProjectionError'> | string;
    projectedPoints?: FloatFilter<'ProjectionError'> | number;
    actualPoints?: FloatFilter<'ProjectionError'> | number;
    normalizedError?: FloatFilter<'ProjectionError'> | number;
    createdAt?: DateTimeFilter<'ProjectionError'> | Date | string;
  };

  export type ProjectionErrorOrderByWithRelationInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ProjectionErrorWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      playerId_week_season?: ProjectionErrorPlayerIdWeekSeasonCompoundUniqueInput;
      AND?: ProjectionErrorWhereInput | ProjectionErrorWhereInput[];
      OR?: ProjectionErrorWhereInput[];
      NOT?: ProjectionErrorWhereInput | ProjectionErrorWhereInput[];
      playerId?: StringFilter<'ProjectionError'> | string;
      week?: IntFilter<'ProjectionError'> | number;
      season?: StringFilter<'ProjectionError'> | string;
      projectedPoints?: FloatFilter<'ProjectionError'> | number;
      actualPoints?: FloatFilter<'ProjectionError'> | number;
      normalizedError?: FloatFilter<'ProjectionError'> | number;
      createdAt?: DateTimeFilter<'ProjectionError'> | Date | string;
    },
    'id' | 'playerId_week_season'
  >;

  export type ProjectionErrorOrderByWithAggregationInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
    createdAt?: SortOrder;
    _count?: ProjectionErrorCountOrderByAggregateInput;
    _avg?: ProjectionErrorAvgOrderByAggregateInput;
    _max?: ProjectionErrorMaxOrderByAggregateInput;
    _min?: ProjectionErrorMinOrderByAggregateInput;
    _sum?: ProjectionErrorSumOrderByAggregateInput;
  };

  export type ProjectionErrorScalarWhereWithAggregatesInput = {
    AND?:
      | ProjectionErrorScalarWhereWithAggregatesInput
      | ProjectionErrorScalarWhereWithAggregatesInput[];
    OR?: ProjectionErrorScalarWhereWithAggregatesInput[];
    NOT?:
      | ProjectionErrorScalarWhereWithAggregatesInput
      | ProjectionErrorScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'ProjectionError'> | string;
    playerId?: StringWithAggregatesFilter<'ProjectionError'> | string;
    week?: IntWithAggregatesFilter<'ProjectionError'> | number;
    season?: StringWithAggregatesFilter<'ProjectionError'> | string;
    projectedPoints?: FloatWithAggregatesFilter<'ProjectionError'> | number;
    actualPoints?: FloatWithAggregatesFilter<'ProjectionError'> | number;
    normalizedError?: FloatWithAggregatesFilter<'ProjectionError'> | number;
    createdAt?: DateTimeWithAggregatesFilter<'ProjectionError'> | Date | string;
  };

  export type UserCreateInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    leagues?: LeagueCreateNestedManyWithoutUsersInput;
    rosters?: RosterCreateNestedManyWithoutOwnerInput;
    transactions?: TransactionCreateNestedManyWithoutCreatorInput;
  };

  export type UserUncheckedCreateInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    leagues?: LeagueUncheckedCreateNestedManyWithoutUsersInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutOwnerInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCreatorInput;
  };

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    leagues?: LeagueUpdateManyWithoutUsersNestedInput;
    rosters?: RosterUpdateManyWithoutOwnerNestedInput;
    transactions?: TransactionUpdateManyWithoutCreatorNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    leagues?: LeagueUncheckedUpdateManyWithoutUsersNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutOwnerNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCreatorNestedInput;
  };

  export type UserCreateManyInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
  };

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type LeagueCreateInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueCreateManyInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type LeagueUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type LeagueUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RosterCreateInput = {
    id: number;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutRostersInput;
    owner?: UserCreateNestedOneWithoutRostersInput;
    matchups?: MatchupCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutRosterInput;
  };

  export type RosterUncheckedCreateInput = {
    id: number;
    leagueId: string;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    matchups?: MatchupUncheckedCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutRosterInput;
  };

  export type RosterUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutRostersNestedInput;
    owner?: UserUpdateOneWithoutRostersNestedInput;
    matchups?: MatchupUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    matchups?: MatchupUncheckedUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutRosterNestedInput;
  };

  export type RosterCreateManyInput = {
    id: number;
    leagueId: string;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type RosterUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RosterUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupCreateInput = {
    id?: string;
    week: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutMatchupsInput;
    roster: RosterCreateNestedOneWithoutMatchupsInput;
  };

  export type MatchupUncheckedCreateInput = {
    id?: string;
    leagueId: string;
    week: number;
    rosterId: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MatchupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutMatchupsNestedInput;
    roster?: RosterUpdateOneRequiredWithoutMatchupsNestedInput;
  };

  export type MatchupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupCreateManyInput = {
    id?: string;
    leagueId: string;
    week: number;
    rosterId: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MatchupUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionCreateInput = {
    id: string;
    type: string;
    status?: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutTransactionsInput;
    creator: UserCreateNestedOneWithoutTransactionsInput;
  };

  export type TransactionUncheckedCreateInput = {
    id: string;
    leagueId: string;
    type: string;
    status?: string;
    creatorId: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutTransactionsNestedInput;
    creator?: UserUpdateOneRequiredWithoutTransactionsNestedInput;
  };

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    creatorId?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionCreateManyInput = {
    id: string;
    leagueId: string;
    type: string;
    status?: string;
    creatorId: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    creatorId?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickCreateInput = {
    id?: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutTradedPicksInput;
    currentOwner: RosterCreateNestedOneWithoutTradedPicksInput;
  };

  export type TradedPickUncheckedCreateInput = {
    id?: string;
    leagueId: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    ownerId: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TradedPickUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutTradedPicksNestedInput;
    currentOwner?: RosterUpdateOneRequiredWithoutTradedPicksNestedInput;
  };

  export type TradedPickUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    ownerId?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickCreateManyInput = {
    id?: string;
    leagueId: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    ownerId: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TradedPickUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    ownerId?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftCreateInput = {
    id: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutDraftsInput;
    picks?: DraftPickCreateNestedManyWithoutDraftInput;
  };

  export type DraftUncheckedCreateInput = {
    id: string;
    leagueId: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    picks?: DraftPickUncheckedCreateNestedManyWithoutDraftInput;
  };

  export type DraftUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutDraftsNestedInput;
    picks?: DraftPickUpdateManyWithoutDraftNestedInput;
  };

  export type DraftUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    picks?: DraftPickUncheckedUpdateManyWithoutDraftNestedInput;
  };

  export type DraftCreateManyInput = {
    id: string;
    leagueId: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftPickCreateInput = {
    id?: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    draft: DraftCreateNestedOneWithoutPicksInput;
  };

  export type DraftPickUncheckedCreateInput = {
    id?: string;
    draftId: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftPickUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    draft?: DraftUpdateOneRequiredWithoutPicksNestedInput;
  };

  export type DraftPickUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    draftId?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftPickCreateManyInput = {
    id?: string;
    draftId: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftPickUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftPickUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    draftId?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerCreateInput = {
    id: string;
    hashtag?: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    team?: string | null;
    position: string;
    depthChartOrder?: number | null;
    status?: string | null;
    injuryStatus?: string | null;
    weight?: string | null;
    height?: string | null;
    number?: number | null;
    age?: number | null;
    yearsExp?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PlayerUncheckedCreateInput = {
    id: string;
    hashtag?: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    team?: string | null;
    position: string;
    depthChartOrder?: number | null;
    status?: string | null;
    injuryStatus?: string | null;
    weight?: string | null;
    height?: string | null;
    number?: number | null;
    age?: number | null;
    yearsExp?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PlayerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    hashtag?: NullableStringFieldUpdateOperationsInput | string | null;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    fullName?: StringFieldUpdateOperationsInput | string;
    team?: NullableStringFieldUpdateOperationsInput | string | null;
    position?: StringFieldUpdateOperationsInput | string;
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null;
    weight?: NullableStringFieldUpdateOperationsInput | string | null;
    height?: NullableStringFieldUpdateOperationsInput | string | null;
    number?: NullableIntFieldUpdateOperationsInput | number | null;
    age?: NullableIntFieldUpdateOperationsInput | number | null;
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    hashtag?: NullableStringFieldUpdateOperationsInput | string | null;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    fullName?: StringFieldUpdateOperationsInput | string;
    team?: NullableStringFieldUpdateOperationsInput | string | null;
    position?: StringFieldUpdateOperationsInput | string;
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null;
    weight?: NullableStringFieldUpdateOperationsInput | string | null;
    height?: NullableStringFieldUpdateOperationsInput | string | null;
    number?: NullableIntFieldUpdateOperationsInput | number | null;
    age?: NullableIntFieldUpdateOperationsInput | number | null;
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerCreateManyInput = {
    id: string;
    hashtag?: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    team?: string | null;
    position: string;
    depthChartOrder?: number | null;
    status?: string | null;
    injuryStatus?: string | null;
    weight?: string | null;
    height?: string | null;
    number?: number | null;
    age?: number | null;
    yearsExp?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PlayerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    hashtag?: NullableStringFieldUpdateOperationsInput | string | null;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    fullName?: StringFieldUpdateOperationsInput | string;
    team?: NullableStringFieldUpdateOperationsInput | string | null;
    position?: StringFieldUpdateOperationsInput | string;
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null;
    weight?: NullableStringFieldUpdateOperationsInput | string | null;
    height?: NullableStringFieldUpdateOperationsInput | string | null;
    number?: NullableIntFieldUpdateOperationsInput | number | null;
    age?: NullableIntFieldUpdateOperationsInput | number | null;
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    hashtag?: NullableStringFieldUpdateOperationsInput | string | null;
    firstName?: StringFieldUpdateOperationsInput | string;
    lastName?: StringFieldUpdateOperationsInput | string;
    fullName?: StringFieldUpdateOperationsInput | string;
    team?: NullableStringFieldUpdateOperationsInput | string | null;
    position?: StringFieldUpdateOperationsInput | string;
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null;
    status?: NullableStringFieldUpdateOperationsInput | string | null;
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null;
    weight?: NullableStringFieldUpdateOperationsInput | string | null;
    height?: NullableStringFieldUpdateOperationsInput | string | null;
    number?: NullableIntFieldUpdateOperationsInput | number | null;
    age?: NullableIntFieldUpdateOperationsInput | number | null;
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerStatsCreateInput = {
    id?: string;
    playerId: string;
    week: number;
    season: string;
    statsType: string;
    stats: JsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PlayerStatsUncheckedCreateInput = {
    id?: string;
    playerId: string;
    week: number;
    season: string;
    statsType: string;
    stats: JsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PlayerStatsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    statsType?: StringFieldUpdateOperationsInput | string;
    stats?: JsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerStatsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    statsType?: StringFieldUpdateOperationsInput | string;
    stats?: JsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerStatsCreateManyInput = {
    id?: string;
    playerId: string;
    week: number;
    season: string;
    statsType: string;
    stats: JsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PlayerStatsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    statsType?: StringFieldUpdateOperationsInput | string;
    stats?: JsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerStatsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    statsType?: StringFieldUpdateOperationsInput | string;
    stats?: JsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsCreateInput = {
    id?: string;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutWeeklyMetricsInput;
    roster: RosterCreateNestedOneWithoutWeeklyMetricsInput;
  };

  export type WeeklyMetricsUncheckedCreateInput = {
    id?: string;
    leagueId: string;
    rosterId: number;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WeeklyMetricsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutWeeklyMetricsNestedInput;
    roster?: RosterUpdateOneRequiredWithoutWeeklyMetricsNestedInput;
  };

  export type WeeklyMetricsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    rosterId?: IntFieldUpdateOperationsInput | number;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsCreateManyInput = {
    id?: string;
    leagueId: string;
    rosterId: number;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WeeklyMetricsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    rosterId?: IntFieldUpdateOperationsInput | number;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PositionVarianceCreateInput = {
    id?: string;
    position: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated?: Date | string;
    createdAt?: Date | string;
  };

  export type PositionVarianceUncheckedCreateInput = {
    id?: string;
    position: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated?: Date | string;
    createdAt?: Date | string;
  };

  export type PositionVarianceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    position?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PositionVarianceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    position?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PositionVarianceCreateManyInput = {
    id?: string;
    position: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated?: Date | string;
    createdAt?: Date | string;
  };

  export type PositionVarianceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    position?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PositionVarianceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    position?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerVarianceCreateInput = {
    id?: string;
    playerId: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated?: Date | string;
    createdAt?: Date | string;
  };

  export type PlayerVarianceUncheckedCreateInput = {
    id?: string;
    playerId: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated?: Date | string;
    createdAt?: Date | string;
  };

  export type PlayerVarianceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerVarianceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerVarianceCreateManyInput = {
    id?: string;
    playerId: string;
    season: string;
    sampleSize: number;
    meanError: number;
    stdDev: number;
    lastUpdated?: Date | string;
    createdAt?: Date | string;
  };

  export type PlayerVarianceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PlayerVarianceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    sampleSize?: IntFieldUpdateOperationsInput | number;
    meanError?: FloatFieldUpdateOperationsInput | number;
    stdDev?: FloatFieldUpdateOperationsInput | number;
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ProjectionErrorCreateInput = {
    id?: string;
    playerId: string;
    week: number;
    season: string;
    projectedPoints: number;
    actualPoints: number;
    normalizedError: number;
    createdAt?: Date | string;
  };

  export type ProjectionErrorUncheckedCreateInput = {
    id?: string;
    playerId: string;
    week: number;
    season: string;
    projectedPoints: number;
    actualPoints: number;
    normalizedError: number;
    createdAt?: Date | string;
  };

  export type ProjectionErrorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    projectedPoints?: FloatFieldUpdateOperationsInput | number;
    actualPoints?: FloatFieldUpdateOperationsInput | number;
    normalizedError?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ProjectionErrorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    projectedPoints?: FloatFieldUpdateOperationsInput | number;
    actualPoints?: FloatFieldUpdateOperationsInput | number;
    normalizedError?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ProjectionErrorCreateManyInput = {
    id?: string;
    playerId: string;
    week: number;
    season: string;
    projectedPoints: number;
    actualPoints: number;
    normalizedError: number;
    createdAt?: Date | string;
  };

  export type ProjectionErrorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    projectedPoints?: FloatFieldUpdateOperationsInput | number;
    actualPoints?: FloatFieldUpdateOperationsInput | number;
    normalizedError?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ProjectionErrorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    playerId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    season?: StringFieldUpdateOperationsInput | string;
    projectedPoints?: FloatFieldUpdateOperationsInput | number;
    actualPoints?: FloatFieldUpdateOperationsInput | number;
    normalizedError?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>;

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type LeagueListRelationFilter = {
    every?: LeagueWhereInput;
    some?: LeagueWhereInput;
    none?: LeagueWhereInput;
  };

  export type RosterListRelationFilter = {
    every?: RosterWhereInput;
    some?: RosterWhereInput;
    none?: RosterWhereInput;
  };

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput;
    some?: TransactionWhereInput;
    none?: TransactionWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type LeagueOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type RosterOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    avatar?: SortOrder;
    metadata?: SortOrder;
    isBot?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    avatar?: SortOrder;
    isBot?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    username?: SortOrder;
    displayName?: SortOrder;
    avatar?: SortOrder;
    isBot?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedJsonNullableFilter<$PrismaModel>;
    _max?: NestedJsonNullableFilter<$PrismaModel>;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type UserListRelationFilter = {
    every?: UserWhereInput;
    some?: UserWhereInput;
    none?: UserWhereInput;
  };

  export type MatchupListRelationFilter = {
    every?: MatchupWhereInput;
    some?: MatchupWhereInput;
    none?: MatchupWhereInput;
  };

  export type TradedPickListRelationFilter = {
    every?: TradedPickWhereInput;
    some?: TradedPickWhereInput;
    none?: TradedPickWhereInput;
  };

  export type DraftListRelationFilter = {
    every?: DraftWhereInput;
    some?: DraftWhereInput;
    none?: DraftWhereInput;
  };

  export type WeeklyMetricsListRelationFilter = {
    every?: WeeklyMetricsWhereInput;
    some?: WeeklyMetricsWhereInput;
    none?: WeeklyMetricsWhereInput;
  };

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type MatchupOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type TradedPickOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type DraftOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type WeeklyMetricsOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type LeagueCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    season?: SortOrder;
    seasonType?: SortOrder;
    status?: SortOrder;
    sport?: SortOrder;
    totalRosters?: SortOrder;
    settings?: SortOrder;
    scoringSettings?: SortOrder;
    rosterPositions?: SortOrder;
    metadata?: SortOrder;
    previousLeagueId?: SortOrder;
    draftId?: SortOrder;
    playoffMatchups?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type LeagueAvgOrderByAggregateInput = {
    totalRosters?: SortOrder;
  };

  export type LeagueMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    season?: SortOrder;
    seasonType?: SortOrder;
    status?: SortOrder;
    sport?: SortOrder;
    totalRosters?: SortOrder;
    previousLeagueId?: SortOrder;
    draftId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type LeagueMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    season?: SortOrder;
    seasonType?: SortOrder;
    status?: SortOrder;
    sport?: SortOrder;
    totalRosters?: SortOrder;
    previousLeagueId?: SortOrder;
    draftId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type LeagueSumOrderByAggregateInput = {
    totalRosters?: SortOrder;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type LeagueRelationFilter = {
    is?: LeagueWhereInput;
    isNot?: LeagueWhereInput;
  };

  export type UserNullableRelationFilter = {
    is?: UserWhereInput | null;
    isNot?: UserWhereInput | null;
  };

  export type RosterCountOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    ownerId?: SortOrder;
    coOwners?: SortOrder;
    players?: SortOrder;
    starters?: SortOrder;
    reserve?: SortOrder;
    settings?: SortOrder;
    metadata?: SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type RosterAvgOrderByAggregateInput = {
    id?: SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrder;
  };

  export type RosterMaxOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    ownerId?: SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type RosterMinOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    ownerId?: SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type RosterSumOrderByAggregateInput = {
    id?: SortOrder;
    waiverBudget?: SortOrder;
    waiverPosition?: SortOrder;
  };

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type RosterRelationFilter = {
    is?: RosterWhereInput;
    isNot?: RosterWhereInput;
  };

  export type MatchupLeagueIdWeekRosterIdCompoundUniqueInput = {
    leagueId: string;
    week: number;
    rosterId: number;
  };

  export type MatchupCountOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrder;
    points?: SortOrder;
    customPoints?: SortOrder;
    starters?: SortOrder;
    startersPoints?: SortOrder;
    players?: SortOrder;
    playersPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type MatchupAvgOrderByAggregateInput = {
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrder;
    points?: SortOrder;
    customPoints?: SortOrder;
  };

  export type MatchupMaxOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrder;
    points?: SortOrder;
    customPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type MatchupMinOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrder;
    points?: SortOrder;
    customPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type MatchupSumOrderByAggregateInput = {
    week?: SortOrder;
    rosterId?: SortOrder;
    matchupId?: SortOrder;
    points?: SortOrder;
    customPoints?: SortOrder;
  };

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type IntNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    has?: number | IntFieldRefInput<$PrismaModel> | null;
    hasEvery?: number[] | ListIntFieldRefInput<$PrismaModel>;
    hasSome?: number[] | ListIntFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
  };

  export type UserRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    type?: SortOrder;
    status?: SortOrder;
    creatorId?: SortOrder;
    rosterIds?: SortOrder;
    adds?: SortOrder;
    drops?: SortOrder;
    draftPicks?: SortOrder;
    waiver?: SortOrder;
    settings?: SortOrder;
    leg?: SortOrder;
    consenterIds?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionAvgOrderByAggregateInput = {
    rosterIds?: SortOrder;
    leg?: SortOrder;
  };

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    type?: SortOrder;
    status?: SortOrder;
    creatorId?: SortOrder;
    leg?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    type?: SortOrder;
    status?: SortOrder;
    creatorId?: SortOrder;
    leg?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionSumOrderByAggregateInput = {
    rosterIds?: SortOrder;
    leg?: SortOrder;
  };

  export type TradedPickCountOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    season?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrder;
    ownerId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TradedPickAvgOrderByAggregateInput = {
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrder;
    ownerId?: SortOrder;
  };

  export type TradedPickMaxOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    season?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrder;
    ownerId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TradedPickMinOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    season?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrder;
    ownerId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TradedPickSumOrderByAggregateInput = {
    round?: SortOrder;
    rosterId?: SortOrder;
    previousOwnerId?: SortOrder;
    ownerId?: SortOrder;
  };
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>;

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type DraftPickListRelationFilter = {
    every?: DraftPickWhereInput;
    some?: DraftPickWhereInput;
    none?: DraftPickWhereInput;
  };

  export type DraftPickOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type DraftCountOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    status?: SortOrder;
    type?: SortOrder;
    season?: SortOrder;
    settings?: SortOrder;
    metadata?: SortOrder;
    slotToRosterId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DraftAvgOrderByAggregateInput = {
    slotToRosterId?: SortOrder;
  };

  export type DraftMaxOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    status?: SortOrder;
    type?: SortOrder;
    season?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DraftMinOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    status?: SortOrder;
    type?: SortOrder;
    season?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DraftSumOrderByAggregateInput = {
    slotToRosterId?: SortOrder;
  };
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedJsonFilter<$PrismaModel>;
    _max?: NestedJsonFilter<$PrismaModel>;
  };

  export type DraftRelationFilter = {
    is?: DraftWhereInput;
    isNot?: DraftWhereInput;
  };

  export type DraftPickDraftIdPickNoCompoundUniqueInput = {
    draftId: string;
    pickNo: number;
  };

  export type DraftPickCountOrderByAggregateInput = {
    id?: SortOrder;
    draftId?: SortOrder;
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    playerId?: SortOrder;
    pickedBy?: SortOrder;
    metadata?: SortOrder;
    isKeeper?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DraftPickAvgOrderByAggregateInput = {
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
  };

  export type DraftPickMaxOrderByAggregateInput = {
    id?: SortOrder;
    draftId?: SortOrder;
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    playerId?: SortOrder;
    pickedBy?: SortOrder;
    isKeeper?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DraftPickMinOrderByAggregateInput = {
    id?: SortOrder;
    draftId?: SortOrder;
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
    playerId?: SortOrder;
    pickedBy?: SortOrder;
    isKeeper?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DraftPickSumOrderByAggregateInput = {
    pickNo?: SortOrder;
    round?: SortOrder;
    rosterId?: SortOrder;
  };

  export type PlayerCountOrderByAggregateInput = {
    id?: SortOrder;
    hashtag?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    fullName?: SortOrder;
    team?: SortOrder;
    position?: SortOrder;
    depthChartOrder?: SortOrder;
    status?: SortOrder;
    injuryStatus?: SortOrder;
    weight?: SortOrder;
    height?: SortOrder;
    number?: SortOrder;
    age?: SortOrder;
    yearsExp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerAvgOrderByAggregateInput = {
    depthChartOrder?: SortOrder;
    number?: SortOrder;
    age?: SortOrder;
    yearsExp?: SortOrder;
  };

  export type PlayerMaxOrderByAggregateInput = {
    id?: SortOrder;
    hashtag?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    fullName?: SortOrder;
    team?: SortOrder;
    position?: SortOrder;
    depthChartOrder?: SortOrder;
    status?: SortOrder;
    injuryStatus?: SortOrder;
    weight?: SortOrder;
    height?: SortOrder;
    number?: SortOrder;
    age?: SortOrder;
    yearsExp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerMinOrderByAggregateInput = {
    id?: SortOrder;
    hashtag?: SortOrder;
    firstName?: SortOrder;
    lastName?: SortOrder;
    fullName?: SortOrder;
    team?: SortOrder;
    position?: SortOrder;
    depthChartOrder?: SortOrder;
    status?: SortOrder;
    injuryStatus?: SortOrder;
    weight?: SortOrder;
    height?: SortOrder;
    number?: SortOrder;
    age?: SortOrder;
    yearsExp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerSumOrderByAggregateInput = {
    depthChartOrder?: SortOrder;
    number?: SortOrder;
    age?: SortOrder;
    yearsExp?: SortOrder;
  };

  export type PlayerStatsPlayerIdWeekSeasonStatsTypeCompoundUniqueInput = {
    playerId: string;
    week: number;
    season: string;
    statsType: string;
  };

  export type PlayerStatsCountOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    statsType?: SortOrder;
    stats?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerStatsAvgOrderByAggregateInput = {
    week?: SortOrder;
  };

  export type PlayerStatsMaxOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    statsType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerStatsMinOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    statsType?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PlayerStatsSumOrderByAggregateInput = {
    week?: SortOrder;
  };

  export type WeeklyMetricsLeagueIdRosterIdWeekCompoundUniqueInput = {
    leagueId: string;
    rosterId: number;
    week: number;
  };

  export type WeeklyMetricsCountOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type WeeklyMetricsAvgOrderByAggregateInput = {
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
  };

  export type WeeklyMetricsMaxOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type WeeklyMetricsMinOrderByAggregateInput = {
    id?: SortOrder;
    leagueId?: SortOrder;
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type WeeklyMetricsSumOrderByAggregateInput = {
    rosterId?: SortOrder;
    week?: SortOrder;
    totalPoints?: SortOrder;
    expectedWins?: SortOrder;
    luckRating?: SortOrder;
    opponentPoints?: SortOrder;
  };

  export type PositionVariancePositionSeasonCompoundUniqueInput = {
    position: string;
    season: string;
  };

  export type PositionVarianceCountOrderByAggregateInput = {
    id?: SortOrder;
    position?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PositionVarianceAvgOrderByAggregateInput = {
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
  };

  export type PositionVarianceMaxOrderByAggregateInput = {
    id?: SortOrder;
    position?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PositionVarianceMinOrderByAggregateInput = {
    id?: SortOrder;
    position?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PositionVarianceSumOrderByAggregateInput = {
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
  };

  export type PlayerVariancePlayerIdSeasonCompoundUniqueInput = {
    playerId: string;
    season: string;
  };

  export type PlayerVarianceCountOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PlayerVarianceAvgOrderByAggregateInput = {
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
  };

  export type PlayerVarianceMaxOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PlayerVarianceMinOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    season?: SortOrder;
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
    lastUpdated?: SortOrder;
    createdAt?: SortOrder;
  };

  export type PlayerVarianceSumOrderByAggregateInput = {
    sampleSize?: SortOrder;
    meanError?: SortOrder;
    stdDev?: SortOrder;
  };

  export type ProjectionErrorPlayerIdWeekSeasonCompoundUniqueInput = {
    playerId: string;
    week: number;
    season: string;
  };

  export type ProjectionErrorCountOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ProjectionErrorAvgOrderByAggregateInput = {
    week?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
  };

  export type ProjectionErrorMaxOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ProjectionErrorMinOrderByAggregateInput = {
    id?: SortOrder;
    playerId?: SortOrder;
    week?: SortOrder;
    season?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
    createdAt?: SortOrder;
  };

  export type ProjectionErrorSumOrderByAggregateInput = {
    week?: SortOrder;
    projectedPoints?: SortOrder;
    actualPoints?: SortOrder;
    normalizedError?: SortOrder;
  };

  export type LeagueCreateNestedManyWithoutUsersInput = {
    create?:
      | XOR<LeagueCreateWithoutUsersInput, LeagueUncheckedCreateWithoutUsersInput>
      | LeagueCreateWithoutUsersInput[]
      | LeagueUncheckedCreateWithoutUsersInput[];
    connectOrCreate?:
      | LeagueCreateOrConnectWithoutUsersInput
      | LeagueCreateOrConnectWithoutUsersInput[];
    connect?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
  };

  export type RosterCreateNestedManyWithoutOwnerInput = {
    create?:
      | XOR<RosterCreateWithoutOwnerInput, RosterUncheckedCreateWithoutOwnerInput>
      | RosterCreateWithoutOwnerInput[]
      | RosterUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutOwnerInput
      | RosterCreateOrConnectWithoutOwnerInput[];
    createMany?: RosterCreateManyOwnerInputEnvelope;
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
  };

  export type TransactionCreateNestedManyWithoutCreatorInput = {
    create?:
      | XOR<TransactionCreateWithoutCreatorInput, TransactionUncheckedCreateWithoutCreatorInput>
      | TransactionCreateWithoutCreatorInput[]
      | TransactionUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCreatorInput
      | TransactionCreateOrConnectWithoutCreatorInput[];
    createMany?: TransactionCreateManyCreatorInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type LeagueUncheckedCreateNestedManyWithoutUsersInput = {
    create?:
      | XOR<LeagueCreateWithoutUsersInput, LeagueUncheckedCreateWithoutUsersInput>
      | LeagueCreateWithoutUsersInput[]
      | LeagueUncheckedCreateWithoutUsersInput[];
    connectOrCreate?:
      | LeagueCreateOrConnectWithoutUsersInput
      | LeagueCreateOrConnectWithoutUsersInput[];
    connect?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
  };

  export type RosterUncheckedCreateNestedManyWithoutOwnerInput = {
    create?:
      | XOR<RosterCreateWithoutOwnerInput, RosterUncheckedCreateWithoutOwnerInput>
      | RosterCreateWithoutOwnerInput[]
      | RosterUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutOwnerInput
      | RosterCreateOrConnectWithoutOwnerInput[];
    createMany?: RosterCreateManyOwnerInputEnvelope;
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutCreatorInput = {
    create?:
      | XOR<TransactionCreateWithoutCreatorInput, TransactionUncheckedCreateWithoutCreatorInput>
      | TransactionCreateWithoutCreatorInput[]
      | TransactionUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCreatorInput
      | TransactionCreateOrConnectWithoutCreatorInput[];
    createMany?: TransactionCreateManyCreatorInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type LeagueUpdateManyWithoutUsersNestedInput = {
    create?:
      | XOR<LeagueCreateWithoutUsersInput, LeagueUncheckedCreateWithoutUsersInput>
      | LeagueCreateWithoutUsersInput[]
      | LeagueUncheckedCreateWithoutUsersInput[];
    connectOrCreate?:
      | LeagueCreateOrConnectWithoutUsersInput
      | LeagueCreateOrConnectWithoutUsersInput[];
    upsert?:
      | LeagueUpsertWithWhereUniqueWithoutUsersInput
      | LeagueUpsertWithWhereUniqueWithoutUsersInput[];
    set?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    disconnect?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    delete?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    connect?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    update?:
      | LeagueUpdateWithWhereUniqueWithoutUsersInput
      | LeagueUpdateWithWhereUniqueWithoutUsersInput[];
    updateMany?:
      | LeagueUpdateManyWithWhereWithoutUsersInput
      | LeagueUpdateManyWithWhereWithoutUsersInput[];
    deleteMany?: LeagueScalarWhereInput | LeagueScalarWhereInput[];
  };

  export type RosterUpdateManyWithoutOwnerNestedInput = {
    create?:
      | XOR<RosterCreateWithoutOwnerInput, RosterUncheckedCreateWithoutOwnerInput>
      | RosterCreateWithoutOwnerInput[]
      | RosterUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutOwnerInput
      | RosterCreateOrConnectWithoutOwnerInput[];
    upsert?:
      | RosterUpsertWithWhereUniqueWithoutOwnerInput
      | RosterUpsertWithWhereUniqueWithoutOwnerInput[];
    createMany?: RosterCreateManyOwnerInputEnvelope;
    set?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    disconnect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    delete?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    update?:
      | RosterUpdateWithWhereUniqueWithoutOwnerInput
      | RosterUpdateWithWhereUniqueWithoutOwnerInput[];
    updateMany?:
      | RosterUpdateManyWithWhereWithoutOwnerInput
      | RosterUpdateManyWithWhereWithoutOwnerInput[];
    deleteMany?: RosterScalarWhereInput | RosterScalarWhereInput[];
  };

  export type TransactionUpdateManyWithoutCreatorNestedInput = {
    create?:
      | XOR<TransactionCreateWithoutCreatorInput, TransactionUncheckedCreateWithoutCreatorInput>
      | TransactionCreateWithoutCreatorInput[]
      | TransactionUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCreatorInput
      | TransactionCreateOrConnectWithoutCreatorInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutCreatorInput
      | TransactionUpsertWithWhereUniqueWithoutCreatorInput[];
    createMany?: TransactionCreateManyCreatorInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutCreatorInput
      | TransactionUpdateWithWhereUniqueWithoutCreatorInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutCreatorInput
      | TransactionUpdateManyWithWhereWithoutCreatorInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type LeagueUncheckedUpdateManyWithoutUsersNestedInput = {
    create?:
      | XOR<LeagueCreateWithoutUsersInput, LeagueUncheckedCreateWithoutUsersInput>
      | LeagueCreateWithoutUsersInput[]
      | LeagueUncheckedCreateWithoutUsersInput[];
    connectOrCreate?:
      | LeagueCreateOrConnectWithoutUsersInput
      | LeagueCreateOrConnectWithoutUsersInput[];
    upsert?:
      | LeagueUpsertWithWhereUniqueWithoutUsersInput
      | LeagueUpsertWithWhereUniqueWithoutUsersInput[];
    set?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    disconnect?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    delete?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    connect?: LeagueWhereUniqueInput | LeagueWhereUniqueInput[];
    update?:
      | LeagueUpdateWithWhereUniqueWithoutUsersInput
      | LeagueUpdateWithWhereUniqueWithoutUsersInput[];
    updateMany?:
      | LeagueUpdateManyWithWhereWithoutUsersInput
      | LeagueUpdateManyWithWhereWithoutUsersInput[];
    deleteMany?: LeagueScalarWhereInput | LeagueScalarWhereInput[];
  };

  export type RosterUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?:
      | XOR<RosterCreateWithoutOwnerInput, RosterUncheckedCreateWithoutOwnerInput>
      | RosterCreateWithoutOwnerInput[]
      | RosterUncheckedCreateWithoutOwnerInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutOwnerInput
      | RosterCreateOrConnectWithoutOwnerInput[];
    upsert?:
      | RosterUpsertWithWhereUniqueWithoutOwnerInput
      | RosterUpsertWithWhereUniqueWithoutOwnerInput[];
    createMany?: RosterCreateManyOwnerInputEnvelope;
    set?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    disconnect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    delete?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    update?:
      | RosterUpdateWithWhereUniqueWithoutOwnerInput
      | RosterUpdateWithWhereUniqueWithoutOwnerInput[];
    updateMany?:
      | RosterUpdateManyWithWhereWithoutOwnerInput
      | RosterUpdateManyWithWhereWithoutOwnerInput[];
    deleteMany?: RosterScalarWhereInput | RosterScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutCreatorNestedInput = {
    create?:
      | XOR<TransactionCreateWithoutCreatorInput, TransactionUncheckedCreateWithoutCreatorInput>
      | TransactionCreateWithoutCreatorInput[]
      | TransactionUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCreatorInput
      | TransactionCreateOrConnectWithoutCreatorInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutCreatorInput
      | TransactionUpsertWithWhereUniqueWithoutCreatorInput[];
    createMany?: TransactionCreateManyCreatorInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutCreatorInput
      | TransactionUpdateWithWhereUniqueWithoutCreatorInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutCreatorInput
      | TransactionUpdateManyWithWhereWithoutCreatorInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type LeagueCreaterosterPositionsInput = {
    set: string[];
  };

  export type UserCreateNestedManyWithoutLeaguesInput = {
    create?:
      | XOR<UserCreateWithoutLeaguesInput, UserUncheckedCreateWithoutLeaguesInput>
      | UserCreateWithoutLeaguesInput[]
      | UserUncheckedCreateWithoutLeaguesInput[];
    connectOrCreate?:
      | UserCreateOrConnectWithoutLeaguesInput
      | UserCreateOrConnectWithoutLeaguesInput[];
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
  };

  export type RosterCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<RosterCreateWithoutLeagueInput, RosterUncheckedCreateWithoutLeagueInput>
      | RosterCreateWithoutLeagueInput[]
      | RosterUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutLeagueInput
      | RosterCreateOrConnectWithoutLeagueInput[];
    createMany?: RosterCreateManyLeagueInputEnvelope;
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
  };

  export type MatchupCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<MatchupCreateWithoutLeagueInput, MatchupUncheckedCreateWithoutLeagueInput>
      | MatchupCreateWithoutLeagueInput[]
      | MatchupUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutLeagueInput
      | MatchupCreateOrConnectWithoutLeagueInput[];
    createMany?: MatchupCreateManyLeagueInputEnvelope;
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
  };

  export type TransactionCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<TransactionCreateWithoutLeagueInput, TransactionUncheckedCreateWithoutLeagueInput>
      | TransactionCreateWithoutLeagueInput[]
      | TransactionUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutLeagueInput
      | TransactionCreateOrConnectWithoutLeagueInput[];
    createMany?: TransactionCreateManyLeagueInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TradedPickCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<TradedPickCreateWithoutLeagueInput, TradedPickUncheckedCreateWithoutLeagueInput>
      | TradedPickCreateWithoutLeagueInput[]
      | TradedPickUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutLeagueInput
      | TradedPickCreateOrConnectWithoutLeagueInput[];
    createMany?: TradedPickCreateManyLeagueInputEnvelope;
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
  };

  export type DraftCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<DraftCreateWithoutLeagueInput, DraftUncheckedCreateWithoutLeagueInput>
      | DraftCreateWithoutLeagueInput[]
      | DraftUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | DraftCreateOrConnectWithoutLeagueInput
      | DraftCreateOrConnectWithoutLeagueInput[];
    createMany?: DraftCreateManyLeagueInputEnvelope;
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
  };

  export type WeeklyMetricsCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutLeagueInput, WeeklyMetricsUncheckedCreateWithoutLeagueInput>
      | WeeklyMetricsCreateWithoutLeagueInput[]
      | WeeklyMetricsUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput[];
    createMany?: WeeklyMetricsCreateManyLeagueInputEnvelope;
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
  };

  export type UserUncheckedCreateNestedManyWithoutLeaguesInput = {
    create?:
      | XOR<UserCreateWithoutLeaguesInput, UserUncheckedCreateWithoutLeaguesInput>
      | UserCreateWithoutLeaguesInput[]
      | UserUncheckedCreateWithoutLeaguesInput[];
    connectOrCreate?:
      | UserCreateOrConnectWithoutLeaguesInput
      | UserCreateOrConnectWithoutLeaguesInput[];
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
  };

  export type RosterUncheckedCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<RosterCreateWithoutLeagueInput, RosterUncheckedCreateWithoutLeagueInput>
      | RosterCreateWithoutLeagueInput[]
      | RosterUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutLeagueInput
      | RosterCreateOrConnectWithoutLeagueInput[];
    createMany?: RosterCreateManyLeagueInputEnvelope;
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
  };

  export type MatchupUncheckedCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<MatchupCreateWithoutLeagueInput, MatchupUncheckedCreateWithoutLeagueInput>
      | MatchupCreateWithoutLeagueInput[]
      | MatchupUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutLeagueInput
      | MatchupCreateOrConnectWithoutLeagueInput[];
    createMany?: MatchupCreateManyLeagueInputEnvelope;
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<TransactionCreateWithoutLeagueInput, TransactionUncheckedCreateWithoutLeagueInput>
      | TransactionCreateWithoutLeagueInput[]
      | TransactionUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutLeagueInput
      | TransactionCreateOrConnectWithoutLeagueInput[];
    createMany?: TransactionCreateManyLeagueInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TradedPickUncheckedCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<TradedPickCreateWithoutLeagueInput, TradedPickUncheckedCreateWithoutLeagueInput>
      | TradedPickCreateWithoutLeagueInput[]
      | TradedPickUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutLeagueInput
      | TradedPickCreateOrConnectWithoutLeagueInput[];
    createMany?: TradedPickCreateManyLeagueInputEnvelope;
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
  };

  export type DraftUncheckedCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<DraftCreateWithoutLeagueInput, DraftUncheckedCreateWithoutLeagueInput>
      | DraftCreateWithoutLeagueInput[]
      | DraftUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | DraftCreateOrConnectWithoutLeagueInput
      | DraftCreateOrConnectWithoutLeagueInput[];
    createMany?: DraftCreateManyLeagueInputEnvelope;
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
  };

  export type WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutLeagueInput, WeeklyMetricsUncheckedCreateWithoutLeagueInput>
      | WeeklyMetricsCreateWithoutLeagueInput[]
      | WeeklyMetricsUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput[];
    createMany?: WeeklyMetricsCreateManyLeagueInputEnvelope;
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type LeagueUpdaterosterPositionsInput = {
    set?: string[];
    push?: string | string[];
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type UserUpdateManyWithoutLeaguesNestedInput = {
    create?:
      | XOR<UserCreateWithoutLeaguesInput, UserUncheckedCreateWithoutLeaguesInput>
      | UserCreateWithoutLeaguesInput[]
      | UserUncheckedCreateWithoutLeaguesInput[];
    connectOrCreate?:
      | UserCreateOrConnectWithoutLeaguesInput
      | UserCreateOrConnectWithoutLeaguesInput[];
    upsert?:
      | UserUpsertWithWhereUniqueWithoutLeaguesInput
      | UserUpsertWithWhereUniqueWithoutLeaguesInput[];
    set?: UserWhereUniqueInput | UserWhereUniqueInput[];
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[];
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    update?:
      | UserUpdateWithWhereUniqueWithoutLeaguesInput
      | UserUpdateWithWhereUniqueWithoutLeaguesInput[];
    updateMany?:
      | UserUpdateManyWithWhereWithoutLeaguesInput
      | UserUpdateManyWithWhereWithoutLeaguesInput[];
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[];
  };

  export type RosterUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<RosterCreateWithoutLeagueInput, RosterUncheckedCreateWithoutLeagueInput>
      | RosterCreateWithoutLeagueInput[]
      | RosterUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutLeagueInput
      | RosterCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | RosterUpsertWithWhereUniqueWithoutLeagueInput
      | RosterUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: RosterCreateManyLeagueInputEnvelope;
    set?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    disconnect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    delete?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    update?:
      | RosterUpdateWithWhereUniqueWithoutLeagueInput
      | RosterUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | RosterUpdateManyWithWhereWithoutLeagueInput
      | RosterUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: RosterScalarWhereInput | RosterScalarWhereInput[];
  };

  export type MatchupUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<MatchupCreateWithoutLeagueInput, MatchupUncheckedCreateWithoutLeagueInput>
      | MatchupCreateWithoutLeagueInput[]
      | MatchupUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutLeagueInput
      | MatchupCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | MatchupUpsertWithWhereUniqueWithoutLeagueInput
      | MatchupUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: MatchupCreateManyLeagueInputEnvelope;
    set?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    disconnect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    delete?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    update?:
      | MatchupUpdateWithWhereUniqueWithoutLeagueInput
      | MatchupUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | MatchupUpdateManyWithWhereWithoutLeagueInput
      | MatchupUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: MatchupScalarWhereInput | MatchupScalarWhereInput[];
  };

  export type TransactionUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<TransactionCreateWithoutLeagueInput, TransactionUncheckedCreateWithoutLeagueInput>
      | TransactionCreateWithoutLeagueInput[]
      | TransactionUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutLeagueInput
      | TransactionCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutLeagueInput
      | TransactionUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: TransactionCreateManyLeagueInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutLeagueInput
      | TransactionUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutLeagueInput
      | TransactionUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TradedPickUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<TradedPickCreateWithoutLeagueInput, TradedPickUncheckedCreateWithoutLeagueInput>
      | TradedPickCreateWithoutLeagueInput[]
      | TradedPickUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutLeagueInput
      | TradedPickCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | TradedPickUpsertWithWhereUniqueWithoutLeagueInput
      | TradedPickUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: TradedPickCreateManyLeagueInputEnvelope;
    set?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    disconnect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    delete?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    update?:
      | TradedPickUpdateWithWhereUniqueWithoutLeagueInput
      | TradedPickUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | TradedPickUpdateManyWithWhereWithoutLeagueInput
      | TradedPickUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: TradedPickScalarWhereInput | TradedPickScalarWhereInput[];
  };

  export type DraftUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<DraftCreateWithoutLeagueInput, DraftUncheckedCreateWithoutLeagueInput>
      | DraftCreateWithoutLeagueInput[]
      | DraftUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | DraftCreateOrConnectWithoutLeagueInput
      | DraftCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | DraftUpsertWithWhereUniqueWithoutLeagueInput
      | DraftUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: DraftCreateManyLeagueInputEnvelope;
    set?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    disconnect?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    delete?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    update?:
      | DraftUpdateWithWhereUniqueWithoutLeagueInput
      | DraftUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | DraftUpdateManyWithWhereWithoutLeagueInput
      | DraftUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: DraftScalarWhereInput | DraftScalarWhereInput[];
  };

  export type WeeklyMetricsUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutLeagueInput, WeeklyMetricsUncheckedCreateWithoutLeagueInput>
      | WeeklyMetricsCreateWithoutLeagueInput[]
      | WeeklyMetricsUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | WeeklyMetricsUpsertWithWhereUniqueWithoutLeagueInput
      | WeeklyMetricsUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: WeeklyMetricsCreateManyLeagueInputEnvelope;
    set?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    disconnect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    delete?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    update?:
      | WeeklyMetricsUpdateWithWhereUniqueWithoutLeagueInput
      | WeeklyMetricsUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | WeeklyMetricsUpdateManyWithWhereWithoutLeagueInput
      | WeeklyMetricsUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: WeeklyMetricsScalarWhereInput | WeeklyMetricsScalarWhereInput[];
  };

  export type UserUncheckedUpdateManyWithoutLeaguesNestedInput = {
    create?:
      | XOR<UserCreateWithoutLeaguesInput, UserUncheckedCreateWithoutLeaguesInput>
      | UserCreateWithoutLeaguesInput[]
      | UserUncheckedCreateWithoutLeaguesInput[];
    connectOrCreate?:
      | UserCreateOrConnectWithoutLeaguesInput
      | UserCreateOrConnectWithoutLeaguesInput[];
    upsert?:
      | UserUpsertWithWhereUniqueWithoutLeaguesInput
      | UserUpsertWithWhereUniqueWithoutLeaguesInput[];
    set?: UserWhereUniqueInput | UserWhereUniqueInput[];
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[];
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[];
    update?:
      | UserUpdateWithWhereUniqueWithoutLeaguesInput
      | UserUpdateWithWhereUniqueWithoutLeaguesInput[];
    updateMany?:
      | UserUpdateManyWithWhereWithoutLeaguesInput
      | UserUpdateManyWithWhereWithoutLeaguesInput[];
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[];
  };

  export type RosterUncheckedUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<RosterCreateWithoutLeagueInput, RosterUncheckedCreateWithoutLeagueInput>
      | RosterCreateWithoutLeagueInput[]
      | RosterUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | RosterCreateOrConnectWithoutLeagueInput
      | RosterCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | RosterUpsertWithWhereUniqueWithoutLeagueInput
      | RosterUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: RosterCreateManyLeagueInputEnvelope;
    set?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    disconnect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    delete?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    connect?: RosterWhereUniqueInput | RosterWhereUniqueInput[];
    update?:
      | RosterUpdateWithWhereUniqueWithoutLeagueInput
      | RosterUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | RosterUpdateManyWithWhereWithoutLeagueInput
      | RosterUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: RosterScalarWhereInput | RosterScalarWhereInput[];
  };

  export type MatchupUncheckedUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<MatchupCreateWithoutLeagueInput, MatchupUncheckedCreateWithoutLeagueInput>
      | MatchupCreateWithoutLeagueInput[]
      | MatchupUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutLeagueInput
      | MatchupCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | MatchupUpsertWithWhereUniqueWithoutLeagueInput
      | MatchupUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: MatchupCreateManyLeagueInputEnvelope;
    set?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    disconnect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    delete?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    update?:
      | MatchupUpdateWithWhereUniqueWithoutLeagueInput
      | MatchupUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | MatchupUpdateManyWithWhereWithoutLeagueInput
      | MatchupUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: MatchupScalarWhereInput | MatchupScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<TransactionCreateWithoutLeagueInput, TransactionUncheckedCreateWithoutLeagueInput>
      | TransactionCreateWithoutLeagueInput[]
      | TransactionUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutLeagueInput
      | TransactionCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutLeagueInput
      | TransactionUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: TransactionCreateManyLeagueInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutLeagueInput
      | TransactionUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutLeagueInput
      | TransactionUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TradedPickUncheckedUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<TradedPickCreateWithoutLeagueInput, TradedPickUncheckedCreateWithoutLeagueInput>
      | TradedPickCreateWithoutLeagueInput[]
      | TradedPickUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutLeagueInput
      | TradedPickCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | TradedPickUpsertWithWhereUniqueWithoutLeagueInput
      | TradedPickUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: TradedPickCreateManyLeagueInputEnvelope;
    set?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    disconnect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    delete?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    update?:
      | TradedPickUpdateWithWhereUniqueWithoutLeagueInput
      | TradedPickUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | TradedPickUpdateManyWithWhereWithoutLeagueInput
      | TradedPickUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: TradedPickScalarWhereInput | TradedPickScalarWhereInput[];
  };

  export type DraftUncheckedUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<DraftCreateWithoutLeagueInput, DraftUncheckedCreateWithoutLeagueInput>
      | DraftCreateWithoutLeagueInput[]
      | DraftUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | DraftCreateOrConnectWithoutLeagueInput
      | DraftCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | DraftUpsertWithWhereUniqueWithoutLeagueInput
      | DraftUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: DraftCreateManyLeagueInputEnvelope;
    set?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    disconnect?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    delete?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    connect?: DraftWhereUniqueInput | DraftWhereUniqueInput[];
    update?:
      | DraftUpdateWithWhereUniqueWithoutLeagueInput
      | DraftUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | DraftUpdateManyWithWhereWithoutLeagueInput
      | DraftUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: DraftScalarWhereInput | DraftScalarWhereInput[];
  };

  export type WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutLeagueInput, WeeklyMetricsUncheckedCreateWithoutLeagueInput>
      | WeeklyMetricsCreateWithoutLeagueInput[]
      | WeeklyMetricsUncheckedCreateWithoutLeagueInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput
      | WeeklyMetricsCreateOrConnectWithoutLeagueInput[];
    upsert?:
      | WeeklyMetricsUpsertWithWhereUniqueWithoutLeagueInput
      | WeeklyMetricsUpsertWithWhereUniqueWithoutLeagueInput[];
    createMany?: WeeklyMetricsCreateManyLeagueInputEnvelope;
    set?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    disconnect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    delete?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    update?:
      | WeeklyMetricsUpdateWithWhereUniqueWithoutLeagueInput
      | WeeklyMetricsUpdateWithWhereUniqueWithoutLeagueInput[];
    updateMany?:
      | WeeklyMetricsUpdateManyWithWhereWithoutLeagueInput
      | WeeklyMetricsUpdateManyWithWhereWithoutLeagueInput[];
    deleteMany?: WeeklyMetricsScalarWhereInput | WeeklyMetricsScalarWhereInput[];
  };

  export type RosterCreatecoOwnersInput = {
    set: string[];
  };

  export type RosterCreateplayersInput = {
    set: string[];
  };

  export type RosterCreatestartersInput = {
    set: string[];
  };

  export type RosterCreatereserveInput = {
    set: string[];
  };

  export type LeagueCreateNestedOneWithoutRostersInput = {
    create?: XOR<LeagueCreateWithoutRostersInput, LeagueUncheckedCreateWithoutRostersInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutRostersInput;
    connect?: LeagueWhereUniqueInput;
  };

  export type UserCreateNestedOneWithoutRostersInput = {
    create?: XOR<UserCreateWithoutRostersInput, UserUncheckedCreateWithoutRostersInput>;
    connectOrCreate?: UserCreateOrConnectWithoutRostersInput;
    connect?: UserWhereUniqueInput;
  };

  export type MatchupCreateNestedManyWithoutRosterInput = {
    create?:
      | XOR<MatchupCreateWithoutRosterInput, MatchupUncheckedCreateWithoutRosterInput>
      | MatchupCreateWithoutRosterInput[]
      | MatchupUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutRosterInput
      | MatchupCreateOrConnectWithoutRosterInput[];
    createMany?: MatchupCreateManyRosterInputEnvelope;
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
  };

  export type TradedPickCreateNestedManyWithoutCurrentOwnerInput = {
    create?:
      | XOR<
          TradedPickCreateWithoutCurrentOwnerInput,
          TradedPickUncheckedCreateWithoutCurrentOwnerInput
        >
      | TradedPickCreateWithoutCurrentOwnerInput[]
      | TradedPickUncheckedCreateWithoutCurrentOwnerInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput[];
    createMany?: TradedPickCreateManyCurrentOwnerInputEnvelope;
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
  };

  export type WeeklyMetricsCreateNestedManyWithoutRosterInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutRosterInput, WeeklyMetricsUncheckedCreateWithoutRosterInput>
      | WeeklyMetricsCreateWithoutRosterInput[]
      | WeeklyMetricsUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutRosterInput
      | WeeklyMetricsCreateOrConnectWithoutRosterInput[];
    createMany?: WeeklyMetricsCreateManyRosterInputEnvelope;
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
  };

  export type MatchupUncheckedCreateNestedManyWithoutRosterInput = {
    create?:
      | XOR<MatchupCreateWithoutRosterInput, MatchupUncheckedCreateWithoutRosterInput>
      | MatchupCreateWithoutRosterInput[]
      | MatchupUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutRosterInput
      | MatchupCreateOrConnectWithoutRosterInput[];
    createMany?: MatchupCreateManyRosterInputEnvelope;
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
  };

  export type TradedPickUncheckedCreateNestedManyWithoutCurrentOwnerInput = {
    create?:
      | XOR<
          TradedPickCreateWithoutCurrentOwnerInput,
          TradedPickUncheckedCreateWithoutCurrentOwnerInput
        >
      | TradedPickCreateWithoutCurrentOwnerInput[]
      | TradedPickUncheckedCreateWithoutCurrentOwnerInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput[];
    createMany?: TradedPickCreateManyCurrentOwnerInputEnvelope;
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
  };

  export type WeeklyMetricsUncheckedCreateNestedManyWithoutRosterInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutRosterInput, WeeklyMetricsUncheckedCreateWithoutRosterInput>
      | WeeklyMetricsCreateWithoutRosterInput[]
      | WeeklyMetricsUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutRosterInput
      | WeeklyMetricsCreateOrConnectWithoutRosterInput[];
    createMany?: WeeklyMetricsCreateManyRosterInputEnvelope;
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
  };

  export type RosterUpdatecoOwnersInput = {
    set?: string[];
    push?: string | string[];
  };

  export type RosterUpdateplayersInput = {
    set?: string[];
    push?: string | string[];
  };

  export type RosterUpdatestartersInput = {
    set?: string[];
    push?: string | string[];
  };

  export type RosterUpdatereserveInput = {
    set?: string[];
    push?: string | string[];
  };

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type LeagueUpdateOneRequiredWithoutRostersNestedInput = {
    create?: XOR<LeagueCreateWithoutRostersInput, LeagueUncheckedCreateWithoutRostersInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutRostersInput;
    upsert?: LeagueUpsertWithoutRostersInput;
    connect?: LeagueWhereUniqueInput;
    update?: XOR<
      XOR<LeagueUpdateToOneWithWhereWithoutRostersInput, LeagueUpdateWithoutRostersInput>,
      LeagueUncheckedUpdateWithoutRostersInput
    >;
  };

  export type UserUpdateOneWithoutRostersNestedInput = {
    create?: XOR<UserCreateWithoutRostersInput, UserUncheckedCreateWithoutRostersInput>;
    connectOrCreate?: UserCreateOrConnectWithoutRostersInput;
    upsert?: UserUpsertWithoutRostersInput;
    disconnect?: UserWhereInput | boolean;
    delete?: UserWhereInput | boolean;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutRostersInput, UserUpdateWithoutRostersInput>,
      UserUncheckedUpdateWithoutRostersInput
    >;
  };

  export type MatchupUpdateManyWithoutRosterNestedInput = {
    create?:
      | XOR<MatchupCreateWithoutRosterInput, MatchupUncheckedCreateWithoutRosterInput>
      | MatchupCreateWithoutRosterInput[]
      | MatchupUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutRosterInput
      | MatchupCreateOrConnectWithoutRosterInput[];
    upsert?:
      | MatchupUpsertWithWhereUniqueWithoutRosterInput
      | MatchupUpsertWithWhereUniqueWithoutRosterInput[];
    createMany?: MatchupCreateManyRosterInputEnvelope;
    set?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    disconnect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    delete?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    update?:
      | MatchupUpdateWithWhereUniqueWithoutRosterInput
      | MatchupUpdateWithWhereUniqueWithoutRosterInput[];
    updateMany?:
      | MatchupUpdateManyWithWhereWithoutRosterInput
      | MatchupUpdateManyWithWhereWithoutRosterInput[];
    deleteMany?: MatchupScalarWhereInput | MatchupScalarWhereInput[];
  };

  export type TradedPickUpdateManyWithoutCurrentOwnerNestedInput = {
    create?:
      | XOR<
          TradedPickCreateWithoutCurrentOwnerInput,
          TradedPickUncheckedCreateWithoutCurrentOwnerInput
        >
      | TradedPickCreateWithoutCurrentOwnerInput[]
      | TradedPickUncheckedCreateWithoutCurrentOwnerInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput[];
    upsert?:
      | TradedPickUpsertWithWhereUniqueWithoutCurrentOwnerInput
      | TradedPickUpsertWithWhereUniqueWithoutCurrentOwnerInput[];
    createMany?: TradedPickCreateManyCurrentOwnerInputEnvelope;
    set?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    disconnect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    delete?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    update?:
      | TradedPickUpdateWithWhereUniqueWithoutCurrentOwnerInput
      | TradedPickUpdateWithWhereUniqueWithoutCurrentOwnerInput[];
    updateMany?:
      | TradedPickUpdateManyWithWhereWithoutCurrentOwnerInput
      | TradedPickUpdateManyWithWhereWithoutCurrentOwnerInput[];
    deleteMany?: TradedPickScalarWhereInput | TradedPickScalarWhereInput[];
  };

  export type WeeklyMetricsUpdateManyWithoutRosterNestedInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutRosterInput, WeeklyMetricsUncheckedCreateWithoutRosterInput>
      | WeeklyMetricsCreateWithoutRosterInput[]
      | WeeklyMetricsUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutRosterInput
      | WeeklyMetricsCreateOrConnectWithoutRosterInput[];
    upsert?:
      | WeeklyMetricsUpsertWithWhereUniqueWithoutRosterInput
      | WeeklyMetricsUpsertWithWhereUniqueWithoutRosterInput[];
    createMany?: WeeklyMetricsCreateManyRosterInputEnvelope;
    set?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    disconnect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    delete?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    update?:
      | WeeklyMetricsUpdateWithWhereUniqueWithoutRosterInput
      | WeeklyMetricsUpdateWithWhereUniqueWithoutRosterInput[];
    updateMany?:
      | WeeklyMetricsUpdateManyWithWhereWithoutRosterInput
      | WeeklyMetricsUpdateManyWithWhereWithoutRosterInput[];
    deleteMany?: WeeklyMetricsScalarWhereInput | WeeklyMetricsScalarWhereInput[];
  };

  export type MatchupUncheckedUpdateManyWithoutRosterNestedInput = {
    create?:
      | XOR<MatchupCreateWithoutRosterInput, MatchupUncheckedCreateWithoutRosterInput>
      | MatchupCreateWithoutRosterInput[]
      | MatchupUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | MatchupCreateOrConnectWithoutRosterInput
      | MatchupCreateOrConnectWithoutRosterInput[];
    upsert?:
      | MatchupUpsertWithWhereUniqueWithoutRosterInput
      | MatchupUpsertWithWhereUniqueWithoutRosterInput[];
    createMany?: MatchupCreateManyRosterInputEnvelope;
    set?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    disconnect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    delete?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    connect?: MatchupWhereUniqueInput | MatchupWhereUniqueInput[];
    update?:
      | MatchupUpdateWithWhereUniqueWithoutRosterInput
      | MatchupUpdateWithWhereUniqueWithoutRosterInput[];
    updateMany?:
      | MatchupUpdateManyWithWhereWithoutRosterInput
      | MatchupUpdateManyWithWhereWithoutRosterInput[];
    deleteMany?: MatchupScalarWhereInput | MatchupScalarWhereInput[];
  };

  export type TradedPickUncheckedUpdateManyWithoutCurrentOwnerNestedInput = {
    create?:
      | XOR<
          TradedPickCreateWithoutCurrentOwnerInput,
          TradedPickUncheckedCreateWithoutCurrentOwnerInput
        >
      | TradedPickCreateWithoutCurrentOwnerInput[]
      | TradedPickUncheckedCreateWithoutCurrentOwnerInput[];
    connectOrCreate?:
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput
      | TradedPickCreateOrConnectWithoutCurrentOwnerInput[];
    upsert?:
      | TradedPickUpsertWithWhereUniqueWithoutCurrentOwnerInput
      | TradedPickUpsertWithWhereUniqueWithoutCurrentOwnerInput[];
    createMany?: TradedPickCreateManyCurrentOwnerInputEnvelope;
    set?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    disconnect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    delete?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    connect?: TradedPickWhereUniqueInput | TradedPickWhereUniqueInput[];
    update?:
      | TradedPickUpdateWithWhereUniqueWithoutCurrentOwnerInput
      | TradedPickUpdateWithWhereUniqueWithoutCurrentOwnerInput[];
    updateMany?:
      | TradedPickUpdateManyWithWhereWithoutCurrentOwnerInput
      | TradedPickUpdateManyWithWhereWithoutCurrentOwnerInput[];
    deleteMany?: TradedPickScalarWhereInput | TradedPickScalarWhereInput[];
  };

  export type WeeklyMetricsUncheckedUpdateManyWithoutRosterNestedInput = {
    create?:
      | XOR<WeeklyMetricsCreateWithoutRosterInput, WeeklyMetricsUncheckedCreateWithoutRosterInput>
      | WeeklyMetricsCreateWithoutRosterInput[]
      | WeeklyMetricsUncheckedCreateWithoutRosterInput[];
    connectOrCreate?:
      | WeeklyMetricsCreateOrConnectWithoutRosterInput
      | WeeklyMetricsCreateOrConnectWithoutRosterInput[];
    upsert?:
      | WeeklyMetricsUpsertWithWhereUniqueWithoutRosterInput
      | WeeklyMetricsUpsertWithWhereUniqueWithoutRosterInput[];
    createMany?: WeeklyMetricsCreateManyRosterInputEnvelope;
    set?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    disconnect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    delete?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    connect?: WeeklyMetricsWhereUniqueInput | WeeklyMetricsWhereUniqueInput[];
    update?:
      | WeeklyMetricsUpdateWithWhereUniqueWithoutRosterInput
      | WeeklyMetricsUpdateWithWhereUniqueWithoutRosterInput[];
    updateMany?:
      | WeeklyMetricsUpdateManyWithWhereWithoutRosterInput
      | WeeklyMetricsUpdateManyWithWhereWithoutRosterInput[];
    deleteMany?: WeeklyMetricsScalarWhereInput | WeeklyMetricsScalarWhereInput[];
  };

  export type MatchupCreatestartersInput = {
    set: string[];
  };

  export type MatchupCreateplayersInput = {
    set: string[];
  };

  export type LeagueCreateNestedOneWithoutMatchupsInput = {
    create?: XOR<LeagueCreateWithoutMatchupsInput, LeagueUncheckedCreateWithoutMatchupsInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutMatchupsInput;
    connect?: LeagueWhereUniqueInput;
  };

  export type RosterCreateNestedOneWithoutMatchupsInput = {
    create?: XOR<RosterCreateWithoutMatchupsInput, RosterUncheckedCreateWithoutMatchupsInput>;
    connectOrCreate?: RosterCreateOrConnectWithoutMatchupsInput;
    connect?: RosterWhereUniqueInput;
  };

  export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type MatchupUpdatestartersInput = {
    set?: string[];
    push?: string | string[];
  };

  export type MatchupUpdateplayersInput = {
    set?: string[];
    push?: string | string[];
  };

  export type LeagueUpdateOneRequiredWithoutMatchupsNestedInput = {
    create?: XOR<LeagueCreateWithoutMatchupsInput, LeagueUncheckedCreateWithoutMatchupsInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutMatchupsInput;
    upsert?: LeagueUpsertWithoutMatchupsInput;
    connect?: LeagueWhereUniqueInput;
    update?: XOR<
      XOR<LeagueUpdateToOneWithWhereWithoutMatchupsInput, LeagueUpdateWithoutMatchupsInput>,
      LeagueUncheckedUpdateWithoutMatchupsInput
    >;
  };

  export type RosterUpdateOneRequiredWithoutMatchupsNestedInput = {
    create?: XOR<RosterCreateWithoutMatchupsInput, RosterUncheckedCreateWithoutMatchupsInput>;
    connectOrCreate?: RosterCreateOrConnectWithoutMatchupsInput;
    upsert?: RosterUpsertWithoutMatchupsInput;
    connect?: RosterWhereUniqueInput;
    update?: XOR<
      XOR<RosterUpdateToOneWithWhereWithoutMatchupsInput, RosterUpdateWithoutMatchupsInput>,
      RosterUncheckedUpdateWithoutMatchupsInput
    >;
  };

  export type TransactionCreaterosterIdsInput = {
    set: number[];
  };

  export type TransactionCreateconsenterIdsInput = {
    set: string[];
  };

  export type LeagueCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<
      LeagueCreateWithoutTransactionsInput,
      LeagueUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: LeagueCreateOrConnectWithoutTransactionsInput;
    connect?: LeagueWhereUniqueInput;
  };

  export type UserCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutTransactionsInput;
    connect?: UserWhereUniqueInput;
  };

  export type TransactionUpdaterosterIdsInput = {
    set?: number[];
    push?: number | number[];
  };

  export type TransactionUpdateconsenterIdsInput = {
    set?: string[];
    push?: string | string[];
  };

  export type LeagueUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<
      LeagueCreateWithoutTransactionsInput,
      LeagueUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: LeagueCreateOrConnectWithoutTransactionsInput;
    upsert?: LeagueUpsertWithoutTransactionsInput;
    connect?: LeagueWhereUniqueInput;
    update?: XOR<
      XOR<LeagueUpdateToOneWithWhereWithoutTransactionsInput, LeagueUpdateWithoutTransactionsInput>,
      LeagueUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type UserUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutTransactionsInput;
    upsert?: UserUpsertWithoutTransactionsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutTransactionsInput, UserUpdateWithoutTransactionsInput>,
      UserUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type LeagueCreateNestedOneWithoutTradedPicksInput = {
    create?: XOR<LeagueCreateWithoutTradedPicksInput, LeagueUncheckedCreateWithoutTradedPicksInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutTradedPicksInput;
    connect?: LeagueWhereUniqueInput;
  };

  export type RosterCreateNestedOneWithoutTradedPicksInput = {
    create?: XOR<RosterCreateWithoutTradedPicksInput, RosterUncheckedCreateWithoutTradedPicksInput>;
    connectOrCreate?: RosterCreateOrConnectWithoutTradedPicksInput;
    connect?: RosterWhereUniqueInput;
  };

  export type LeagueUpdateOneRequiredWithoutTradedPicksNestedInput = {
    create?: XOR<LeagueCreateWithoutTradedPicksInput, LeagueUncheckedCreateWithoutTradedPicksInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutTradedPicksInput;
    upsert?: LeagueUpsertWithoutTradedPicksInput;
    connect?: LeagueWhereUniqueInput;
    update?: XOR<
      XOR<LeagueUpdateToOneWithWhereWithoutTradedPicksInput, LeagueUpdateWithoutTradedPicksInput>,
      LeagueUncheckedUpdateWithoutTradedPicksInput
    >;
  };

  export type RosterUpdateOneRequiredWithoutTradedPicksNestedInput = {
    create?: XOR<RosterCreateWithoutTradedPicksInput, RosterUncheckedCreateWithoutTradedPicksInput>;
    connectOrCreate?: RosterCreateOrConnectWithoutTradedPicksInput;
    upsert?: RosterUpsertWithoutTradedPicksInput;
    connect?: RosterWhereUniqueInput;
    update?: XOR<
      XOR<RosterUpdateToOneWithWhereWithoutTradedPicksInput, RosterUpdateWithoutTradedPicksInput>,
      RosterUncheckedUpdateWithoutTradedPicksInput
    >;
  };

  export type DraftCreateslotToRosterIdInput = {
    set: number[];
  };

  export type LeagueCreateNestedOneWithoutDraftsInput = {
    create?: XOR<LeagueCreateWithoutDraftsInput, LeagueUncheckedCreateWithoutDraftsInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutDraftsInput;
    connect?: LeagueWhereUniqueInput;
  };

  export type DraftPickCreateNestedManyWithoutDraftInput = {
    create?:
      | XOR<DraftPickCreateWithoutDraftInput, DraftPickUncheckedCreateWithoutDraftInput>
      | DraftPickCreateWithoutDraftInput[]
      | DraftPickUncheckedCreateWithoutDraftInput[];
    connectOrCreate?:
      | DraftPickCreateOrConnectWithoutDraftInput
      | DraftPickCreateOrConnectWithoutDraftInput[];
    createMany?: DraftPickCreateManyDraftInputEnvelope;
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
  };

  export type DraftPickUncheckedCreateNestedManyWithoutDraftInput = {
    create?:
      | XOR<DraftPickCreateWithoutDraftInput, DraftPickUncheckedCreateWithoutDraftInput>
      | DraftPickCreateWithoutDraftInput[]
      | DraftPickUncheckedCreateWithoutDraftInput[];
    connectOrCreate?:
      | DraftPickCreateOrConnectWithoutDraftInput
      | DraftPickCreateOrConnectWithoutDraftInput[];
    createMany?: DraftPickCreateManyDraftInputEnvelope;
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
  };

  export type DraftUpdateslotToRosterIdInput = {
    set?: number[];
    push?: number | number[];
  };

  export type LeagueUpdateOneRequiredWithoutDraftsNestedInput = {
    create?: XOR<LeagueCreateWithoutDraftsInput, LeagueUncheckedCreateWithoutDraftsInput>;
    connectOrCreate?: LeagueCreateOrConnectWithoutDraftsInput;
    upsert?: LeagueUpsertWithoutDraftsInput;
    connect?: LeagueWhereUniqueInput;
    update?: XOR<
      XOR<LeagueUpdateToOneWithWhereWithoutDraftsInput, LeagueUpdateWithoutDraftsInput>,
      LeagueUncheckedUpdateWithoutDraftsInput
    >;
  };

  export type DraftPickUpdateManyWithoutDraftNestedInput = {
    create?:
      | XOR<DraftPickCreateWithoutDraftInput, DraftPickUncheckedCreateWithoutDraftInput>
      | DraftPickCreateWithoutDraftInput[]
      | DraftPickUncheckedCreateWithoutDraftInput[];
    connectOrCreate?:
      | DraftPickCreateOrConnectWithoutDraftInput
      | DraftPickCreateOrConnectWithoutDraftInput[];
    upsert?:
      | DraftPickUpsertWithWhereUniqueWithoutDraftInput
      | DraftPickUpsertWithWhereUniqueWithoutDraftInput[];
    createMany?: DraftPickCreateManyDraftInputEnvelope;
    set?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    disconnect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    delete?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    update?:
      | DraftPickUpdateWithWhereUniqueWithoutDraftInput
      | DraftPickUpdateWithWhereUniqueWithoutDraftInput[];
    updateMany?:
      | DraftPickUpdateManyWithWhereWithoutDraftInput
      | DraftPickUpdateManyWithWhereWithoutDraftInput[];
    deleteMany?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[];
  };

  export type DraftPickUncheckedUpdateManyWithoutDraftNestedInput = {
    create?:
      | XOR<DraftPickCreateWithoutDraftInput, DraftPickUncheckedCreateWithoutDraftInput>
      | DraftPickCreateWithoutDraftInput[]
      | DraftPickUncheckedCreateWithoutDraftInput[];
    connectOrCreate?:
      | DraftPickCreateOrConnectWithoutDraftInput
      | DraftPickCreateOrConnectWithoutDraftInput[];
    upsert?:
      | DraftPickUpsertWithWhereUniqueWithoutDraftInput
      | DraftPickUpsertWithWhereUniqueWithoutDraftInput[];
    createMany?: DraftPickCreateManyDraftInputEnvelope;
    set?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    disconnect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    delete?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    connect?: DraftPickWhereUniqueInput | DraftPickWhereUniqueInput[];
    update?:
      | DraftPickUpdateWithWhereUniqueWithoutDraftInput
      | DraftPickUpdateWithWhereUniqueWithoutDraftInput[];
    updateMany?:
      | DraftPickUpdateManyWithWhereWithoutDraftInput
      | DraftPickUpdateManyWithWhereWithoutDraftInput[];
    deleteMany?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[];
  };

  export type DraftCreateNestedOneWithoutPicksInput = {
    create?: XOR<DraftCreateWithoutPicksInput, DraftUncheckedCreateWithoutPicksInput>;
    connectOrCreate?: DraftCreateOrConnectWithoutPicksInput;
    connect?: DraftWhereUniqueInput;
  };

  export type DraftUpdateOneRequiredWithoutPicksNestedInput = {
    create?: XOR<DraftCreateWithoutPicksInput, DraftUncheckedCreateWithoutPicksInput>;
    connectOrCreate?: DraftCreateOrConnectWithoutPicksInput;
    upsert?: DraftUpsertWithoutPicksInput;
    connect?: DraftWhereUniqueInput;
    update?: XOR<
      XOR<DraftUpdateToOneWithWhereWithoutPicksInput, DraftUpdateWithoutPicksInput>,
      DraftUncheckedUpdateWithoutPicksInput
    >;
  };

  export type LeagueCreateNestedOneWithoutWeeklyMetricsInput = {
    create?: XOR<
      LeagueCreateWithoutWeeklyMetricsInput,
      LeagueUncheckedCreateWithoutWeeklyMetricsInput
    >;
    connectOrCreate?: LeagueCreateOrConnectWithoutWeeklyMetricsInput;
    connect?: LeagueWhereUniqueInput;
  };

  export type RosterCreateNestedOneWithoutWeeklyMetricsInput = {
    create?: XOR<
      RosterCreateWithoutWeeklyMetricsInput,
      RosterUncheckedCreateWithoutWeeklyMetricsInput
    >;
    connectOrCreate?: RosterCreateOrConnectWithoutWeeklyMetricsInput;
    connect?: RosterWhereUniqueInput;
  };

  export type LeagueUpdateOneRequiredWithoutWeeklyMetricsNestedInput = {
    create?: XOR<
      LeagueCreateWithoutWeeklyMetricsInput,
      LeagueUncheckedCreateWithoutWeeklyMetricsInput
    >;
    connectOrCreate?: LeagueCreateOrConnectWithoutWeeklyMetricsInput;
    upsert?: LeagueUpsertWithoutWeeklyMetricsInput;
    connect?: LeagueWhereUniqueInput;
    update?: XOR<
      XOR<
        LeagueUpdateToOneWithWhereWithoutWeeklyMetricsInput,
        LeagueUpdateWithoutWeeklyMetricsInput
      >,
      LeagueUncheckedUpdateWithoutWeeklyMetricsInput
    >;
  };

  export type RosterUpdateOneRequiredWithoutWeeklyMetricsNestedInput = {
    create?: XOR<
      RosterCreateWithoutWeeklyMetricsInput,
      RosterUncheckedCreateWithoutWeeklyMetricsInput
    >;
    connectOrCreate?: RosterCreateOrConnectWithoutWeeklyMetricsInput;
    upsert?: RosterUpsertWithoutWeeklyMetricsInput;
    connect?: RosterWhereUniqueInput;
    update?: XOR<
      XOR<
        RosterUpdateToOneWithWhereWithoutWeeklyMetricsInput,
        RosterUpdateWithoutWeeklyMetricsInput
      >,
      RosterUncheckedUpdateWithoutWeeklyMetricsInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>;

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonFilterBase<$PrismaModel>>,
          Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>
        >,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>;

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type LeagueCreateWithoutUsersInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutUsersInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutUsersInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<LeagueCreateWithoutUsersInput, LeagueUncheckedCreateWithoutUsersInput>;
  };

  export type RosterCreateWithoutOwnerInput = {
    id: number;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutRostersInput;
    matchups?: MatchupCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutRosterInput;
  };

  export type RosterUncheckedCreateWithoutOwnerInput = {
    id: number;
    leagueId: string;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    matchups?: MatchupUncheckedCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutRosterInput;
  };

  export type RosterCreateOrConnectWithoutOwnerInput = {
    where: RosterWhereUniqueInput;
    create: XOR<RosterCreateWithoutOwnerInput, RosterUncheckedCreateWithoutOwnerInput>;
  };

  export type RosterCreateManyOwnerInputEnvelope = {
    data: RosterCreateManyOwnerInput | RosterCreateManyOwnerInput[];
    skipDuplicates?: boolean;
  };

  export type TransactionCreateWithoutCreatorInput = {
    id: string;
    type: string;
    status?: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutTransactionsInput;
  };

  export type TransactionUncheckedCreateWithoutCreatorInput = {
    id: string;
    leagueId: string;
    type: string;
    status?: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionCreateOrConnectWithoutCreatorInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutCreatorInput,
      TransactionUncheckedCreateWithoutCreatorInput
    >;
  };

  export type TransactionCreateManyCreatorInputEnvelope = {
    data: TransactionCreateManyCreatorInput | TransactionCreateManyCreatorInput[];
    skipDuplicates?: boolean;
  };

  export type LeagueUpsertWithWhereUniqueWithoutUsersInput = {
    where: LeagueWhereUniqueInput;
    update: XOR<LeagueUpdateWithoutUsersInput, LeagueUncheckedUpdateWithoutUsersInput>;
    create: XOR<LeagueCreateWithoutUsersInput, LeagueUncheckedCreateWithoutUsersInput>;
  };

  export type LeagueUpdateWithWhereUniqueWithoutUsersInput = {
    where: LeagueWhereUniqueInput;
    data: XOR<LeagueUpdateWithoutUsersInput, LeagueUncheckedUpdateWithoutUsersInput>;
  };

  export type LeagueUpdateManyWithWhereWithoutUsersInput = {
    where: LeagueScalarWhereInput;
    data: XOR<LeagueUpdateManyMutationInput, LeagueUncheckedUpdateManyWithoutUsersInput>;
  };

  export type LeagueScalarWhereInput = {
    AND?: LeagueScalarWhereInput | LeagueScalarWhereInput[];
    OR?: LeagueScalarWhereInput[];
    NOT?: LeagueScalarWhereInput | LeagueScalarWhereInput[];
    id?: StringFilter<'League'> | string;
    name?: StringFilter<'League'> | string;
    season?: StringFilter<'League'> | string;
    seasonType?: StringFilter<'League'> | string;
    status?: StringFilter<'League'> | string;
    sport?: StringFilter<'League'> | string;
    totalRosters?: IntFilter<'League'> | number;
    settings?: JsonNullableFilter<'League'>;
    scoringSettings?: JsonNullableFilter<'League'>;
    rosterPositions?: StringNullableListFilter<'League'>;
    metadata?: JsonNullableFilter<'League'>;
    previousLeagueId?: StringNullableFilter<'League'> | string | null;
    draftId?: StringNullableFilter<'League'> | string | null;
    playoffMatchups?: JsonNullableFilter<'League'>;
    createdAt?: DateTimeFilter<'League'> | Date | string;
    updatedAt?: DateTimeFilter<'League'> | Date | string;
  };

  export type RosterUpsertWithWhereUniqueWithoutOwnerInput = {
    where: RosterWhereUniqueInput;
    update: XOR<RosterUpdateWithoutOwnerInput, RosterUncheckedUpdateWithoutOwnerInput>;
    create: XOR<RosterCreateWithoutOwnerInput, RosterUncheckedCreateWithoutOwnerInput>;
  };

  export type RosterUpdateWithWhereUniqueWithoutOwnerInput = {
    where: RosterWhereUniqueInput;
    data: XOR<RosterUpdateWithoutOwnerInput, RosterUncheckedUpdateWithoutOwnerInput>;
  };

  export type RosterUpdateManyWithWhereWithoutOwnerInput = {
    where: RosterScalarWhereInput;
    data: XOR<RosterUpdateManyMutationInput, RosterUncheckedUpdateManyWithoutOwnerInput>;
  };

  export type RosterScalarWhereInput = {
    AND?: RosterScalarWhereInput | RosterScalarWhereInput[];
    OR?: RosterScalarWhereInput[];
    NOT?: RosterScalarWhereInput | RosterScalarWhereInput[];
    id?: IntFilter<'Roster'> | number;
    leagueId?: StringFilter<'Roster'> | string;
    ownerId?: StringNullableFilter<'Roster'> | string | null;
    coOwners?: StringNullableListFilter<'Roster'>;
    players?: StringNullableListFilter<'Roster'>;
    starters?: StringNullableListFilter<'Roster'>;
    reserve?: StringNullableListFilter<'Roster'>;
    settings?: JsonNullableFilter<'Roster'>;
    metadata?: JsonNullableFilter<'Roster'>;
    waiverBudget?: IntFilter<'Roster'> | number;
    waiverPosition?: IntNullableFilter<'Roster'> | number | null;
    createdAt?: DateTimeFilter<'Roster'> | Date | string;
    updatedAt?: DateTimeFilter<'Roster'> | Date | string;
  };

  export type TransactionUpsertWithWhereUniqueWithoutCreatorInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<
      TransactionUpdateWithoutCreatorInput,
      TransactionUncheckedUpdateWithoutCreatorInput
    >;
    create: XOR<
      TransactionCreateWithoutCreatorInput,
      TransactionUncheckedCreateWithoutCreatorInput
    >;
  };

  export type TransactionUpdateWithWhereUniqueWithoutCreatorInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<TransactionUpdateWithoutCreatorInput, TransactionUncheckedUpdateWithoutCreatorInput>;
  };

  export type TransactionUpdateManyWithWhereWithoutCreatorInput = {
    where: TransactionScalarWhereInput;
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyWithoutCreatorInput
    >;
  };

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
    OR?: TransactionScalarWhereInput[];
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
    id?: StringFilter<'Transaction'> | string;
    leagueId?: StringFilter<'Transaction'> | string;
    type?: StringFilter<'Transaction'> | string;
    status?: StringFilter<'Transaction'> | string;
    creatorId?: StringFilter<'Transaction'> | string;
    rosterIds?: IntNullableListFilter<'Transaction'>;
    adds?: JsonNullableFilter<'Transaction'>;
    drops?: JsonNullableFilter<'Transaction'>;
    draftPicks?: JsonNullableFilter<'Transaction'>;
    waiver?: JsonNullableFilter<'Transaction'>;
    settings?: JsonNullableFilter<'Transaction'>;
    leg?: IntFilter<'Transaction'> | number;
    consenterIds?: StringNullableListFilter<'Transaction'>;
    createdAt?: DateTimeFilter<'Transaction'> | Date | string;
    updatedAt?: DateTimeFilter<'Transaction'> | Date | string;
  };

  export type UserCreateWithoutLeaguesInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    rosters?: RosterCreateNestedManyWithoutOwnerInput;
    transactions?: TransactionCreateNestedManyWithoutCreatorInput;
  };

  export type UserUncheckedCreateWithoutLeaguesInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    rosters?: RosterUncheckedCreateNestedManyWithoutOwnerInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCreatorInput;
  };

  export type UserCreateOrConnectWithoutLeaguesInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutLeaguesInput, UserUncheckedCreateWithoutLeaguesInput>;
  };

  export type RosterCreateWithoutLeagueInput = {
    id: number;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    owner?: UserCreateNestedOneWithoutRostersInput;
    matchups?: MatchupCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutRosterInput;
  };

  export type RosterUncheckedCreateWithoutLeagueInput = {
    id: number;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    matchups?: MatchupUncheckedCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutRosterInput;
  };

  export type RosterCreateOrConnectWithoutLeagueInput = {
    where: RosterWhereUniqueInput;
    create: XOR<RosterCreateWithoutLeagueInput, RosterUncheckedCreateWithoutLeagueInput>;
  };

  export type RosterCreateManyLeagueInputEnvelope = {
    data: RosterCreateManyLeagueInput | RosterCreateManyLeagueInput[];
    skipDuplicates?: boolean;
  };

  export type MatchupCreateWithoutLeagueInput = {
    id?: string;
    week: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    roster: RosterCreateNestedOneWithoutMatchupsInput;
  };

  export type MatchupUncheckedCreateWithoutLeagueInput = {
    id?: string;
    week: number;
    rosterId: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MatchupCreateOrConnectWithoutLeagueInput = {
    where: MatchupWhereUniqueInput;
    create: XOR<MatchupCreateWithoutLeagueInput, MatchupUncheckedCreateWithoutLeagueInput>;
  };

  export type MatchupCreateManyLeagueInputEnvelope = {
    data: MatchupCreateManyLeagueInput | MatchupCreateManyLeagueInput[];
    skipDuplicates?: boolean;
  };

  export type TransactionCreateWithoutLeagueInput = {
    id: string;
    type: string;
    status?: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: UserCreateNestedOneWithoutTransactionsInput;
  };

  export type TransactionUncheckedCreateWithoutLeagueInput = {
    id: string;
    type: string;
    status?: string;
    creatorId: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionCreateOrConnectWithoutLeagueInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<TransactionCreateWithoutLeagueInput, TransactionUncheckedCreateWithoutLeagueInput>;
  };

  export type TransactionCreateManyLeagueInputEnvelope = {
    data: TransactionCreateManyLeagueInput | TransactionCreateManyLeagueInput[];
    skipDuplicates?: boolean;
  };

  export type TradedPickCreateWithoutLeagueInput = {
    id?: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    currentOwner: RosterCreateNestedOneWithoutTradedPicksInput;
  };

  export type TradedPickUncheckedCreateWithoutLeagueInput = {
    id?: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    ownerId: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TradedPickCreateOrConnectWithoutLeagueInput = {
    where: TradedPickWhereUniqueInput;
    create: XOR<TradedPickCreateWithoutLeagueInput, TradedPickUncheckedCreateWithoutLeagueInput>;
  };

  export type TradedPickCreateManyLeagueInputEnvelope = {
    data: TradedPickCreateManyLeagueInput | TradedPickCreateManyLeagueInput[];
    skipDuplicates?: boolean;
  };

  export type DraftCreateWithoutLeagueInput = {
    id: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    picks?: DraftPickCreateNestedManyWithoutDraftInput;
  };

  export type DraftUncheckedCreateWithoutLeagueInput = {
    id: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    picks?: DraftPickUncheckedCreateNestedManyWithoutDraftInput;
  };

  export type DraftCreateOrConnectWithoutLeagueInput = {
    where: DraftWhereUniqueInput;
    create: XOR<DraftCreateWithoutLeagueInput, DraftUncheckedCreateWithoutLeagueInput>;
  };

  export type DraftCreateManyLeagueInputEnvelope = {
    data: DraftCreateManyLeagueInput | DraftCreateManyLeagueInput[];
    skipDuplicates?: boolean;
  };

  export type WeeklyMetricsCreateWithoutLeagueInput = {
    id?: string;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    roster: RosterCreateNestedOneWithoutWeeklyMetricsInput;
  };

  export type WeeklyMetricsUncheckedCreateWithoutLeagueInput = {
    id?: string;
    rosterId: number;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WeeklyMetricsCreateOrConnectWithoutLeagueInput = {
    where: WeeklyMetricsWhereUniqueInput;
    create: XOR<
      WeeklyMetricsCreateWithoutLeagueInput,
      WeeklyMetricsUncheckedCreateWithoutLeagueInput
    >;
  };

  export type WeeklyMetricsCreateManyLeagueInputEnvelope = {
    data: WeeklyMetricsCreateManyLeagueInput | WeeklyMetricsCreateManyLeagueInput[];
    skipDuplicates?: boolean;
  };

  export type UserUpsertWithWhereUniqueWithoutLeaguesInput = {
    where: UserWhereUniqueInput;
    update: XOR<UserUpdateWithoutLeaguesInput, UserUncheckedUpdateWithoutLeaguesInput>;
    create: XOR<UserCreateWithoutLeaguesInput, UserUncheckedCreateWithoutLeaguesInput>;
  };

  export type UserUpdateWithWhereUniqueWithoutLeaguesInput = {
    where: UserWhereUniqueInput;
    data: XOR<UserUpdateWithoutLeaguesInput, UserUncheckedUpdateWithoutLeaguesInput>;
  };

  export type UserUpdateManyWithWhereWithoutLeaguesInput = {
    where: UserScalarWhereInput;
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutLeaguesInput>;
  };

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[];
    OR?: UserScalarWhereInput[];
    NOT?: UserScalarWhereInput | UserScalarWhereInput[];
    id?: StringFilter<'User'> | string;
    username?: StringFilter<'User'> | string;
    displayName?: StringFilter<'User'> | string;
    avatar?: StringNullableFilter<'User'> | string | null;
    metadata?: JsonNullableFilter<'User'>;
    isBot?: BoolFilter<'User'> | boolean;
  };

  export type RosterUpsertWithWhereUniqueWithoutLeagueInput = {
    where: RosterWhereUniqueInput;
    update: XOR<RosterUpdateWithoutLeagueInput, RosterUncheckedUpdateWithoutLeagueInput>;
    create: XOR<RosterCreateWithoutLeagueInput, RosterUncheckedCreateWithoutLeagueInput>;
  };

  export type RosterUpdateWithWhereUniqueWithoutLeagueInput = {
    where: RosterWhereUniqueInput;
    data: XOR<RosterUpdateWithoutLeagueInput, RosterUncheckedUpdateWithoutLeagueInput>;
  };

  export type RosterUpdateManyWithWhereWithoutLeagueInput = {
    where: RosterScalarWhereInput;
    data: XOR<RosterUpdateManyMutationInput, RosterUncheckedUpdateManyWithoutLeagueInput>;
  };

  export type MatchupUpsertWithWhereUniqueWithoutLeagueInput = {
    where: MatchupWhereUniqueInput;
    update: XOR<MatchupUpdateWithoutLeagueInput, MatchupUncheckedUpdateWithoutLeagueInput>;
    create: XOR<MatchupCreateWithoutLeagueInput, MatchupUncheckedCreateWithoutLeagueInput>;
  };

  export type MatchupUpdateWithWhereUniqueWithoutLeagueInput = {
    where: MatchupWhereUniqueInput;
    data: XOR<MatchupUpdateWithoutLeagueInput, MatchupUncheckedUpdateWithoutLeagueInput>;
  };

  export type MatchupUpdateManyWithWhereWithoutLeagueInput = {
    where: MatchupScalarWhereInput;
    data: XOR<MatchupUpdateManyMutationInput, MatchupUncheckedUpdateManyWithoutLeagueInput>;
  };

  export type MatchupScalarWhereInput = {
    AND?: MatchupScalarWhereInput | MatchupScalarWhereInput[];
    OR?: MatchupScalarWhereInput[];
    NOT?: MatchupScalarWhereInput | MatchupScalarWhereInput[];
    id?: StringFilter<'Matchup'> | string;
    leagueId?: StringFilter<'Matchup'> | string;
    week?: IntFilter<'Matchup'> | number;
    rosterId?: IntFilter<'Matchup'> | number;
    matchupId?: IntNullableFilter<'Matchup'> | number | null;
    points?: FloatFilter<'Matchup'> | number;
    customPoints?: FloatNullableFilter<'Matchup'> | number | null;
    starters?: StringNullableListFilter<'Matchup'>;
    startersPoints?: JsonNullableFilter<'Matchup'>;
    players?: StringNullableListFilter<'Matchup'>;
    playersPoints?: JsonNullableFilter<'Matchup'>;
    createdAt?: DateTimeFilter<'Matchup'> | Date | string;
    updatedAt?: DateTimeFilter<'Matchup'> | Date | string;
  };

  export type TransactionUpsertWithWhereUniqueWithoutLeagueInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<TransactionUpdateWithoutLeagueInput, TransactionUncheckedUpdateWithoutLeagueInput>;
    create: XOR<TransactionCreateWithoutLeagueInput, TransactionUncheckedCreateWithoutLeagueInput>;
  };

  export type TransactionUpdateWithWhereUniqueWithoutLeagueInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<TransactionUpdateWithoutLeagueInput, TransactionUncheckedUpdateWithoutLeagueInput>;
  };

  export type TransactionUpdateManyWithWhereWithoutLeagueInput = {
    where: TransactionScalarWhereInput;
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutLeagueInput>;
  };

  export type TradedPickUpsertWithWhereUniqueWithoutLeagueInput = {
    where: TradedPickWhereUniqueInput;
    update: XOR<TradedPickUpdateWithoutLeagueInput, TradedPickUncheckedUpdateWithoutLeagueInput>;
    create: XOR<TradedPickCreateWithoutLeagueInput, TradedPickUncheckedCreateWithoutLeagueInput>;
  };

  export type TradedPickUpdateWithWhereUniqueWithoutLeagueInput = {
    where: TradedPickWhereUniqueInput;
    data: XOR<TradedPickUpdateWithoutLeagueInput, TradedPickUncheckedUpdateWithoutLeagueInput>;
  };

  export type TradedPickUpdateManyWithWhereWithoutLeagueInput = {
    where: TradedPickScalarWhereInput;
    data: XOR<TradedPickUpdateManyMutationInput, TradedPickUncheckedUpdateManyWithoutLeagueInput>;
  };

  export type TradedPickScalarWhereInput = {
    AND?: TradedPickScalarWhereInput | TradedPickScalarWhereInput[];
    OR?: TradedPickScalarWhereInput[];
    NOT?: TradedPickScalarWhereInput | TradedPickScalarWhereInput[];
    id?: StringFilter<'TradedPick'> | string;
    leagueId?: StringFilter<'TradedPick'> | string;
    season?: StringFilter<'TradedPick'> | string;
    round?: IntFilter<'TradedPick'> | number;
    rosterId?: IntFilter<'TradedPick'> | number;
    previousOwnerId?: IntNullableFilter<'TradedPick'> | number | null;
    ownerId?: IntFilter<'TradedPick'> | number;
    createdAt?: DateTimeFilter<'TradedPick'> | Date | string;
    updatedAt?: DateTimeFilter<'TradedPick'> | Date | string;
  };

  export type DraftUpsertWithWhereUniqueWithoutLeagueInput = {
    where: DraftWhereUniqueInput;
    update: XOR<DraftUpdateWithoutLeagueInput, DraftUncheckedUpdateWithoutLeagueInput>;
    create: XOR<DraftCreateWithoutLeagueInput, DraftUncheckedCreateWithoutLeagueInput>;
  };

  export type DraftUpdateWithWhereUniqueWithoutLeagueInput = {
    where: DraftWhereUniqueInput;
    data: XOR<DraftUpdateWithoutLeagueInput, DraftUncheckedUpdateWithoutLeagueInput>;
  };

  export type DraftUpdateManyWithWhereWithoutLeagueInput = {
    where: DraftScalarWhereInput;
    data: XOR<DraftUpdateManyMutationInput, DraftUncheckedUpdateManyWithoutLeagueInput>;
  };

  export type DraftScalarWhereInput = {
    AND?: DraftScalarWhereInput | DraftScalarWhereInput[];
    OR?: DraftScalarWhereInput[];
    NOT?: DraftScalarWhereInput | DraftScalarWhereInput[];
    id?: StringFilter<'Draft'> | string;
    leagueId?: StringFilter<'Draft'> | string;
    status?: StringFilter<'Draft'> | string;
    type?: StringFilter<'Draft'> | string;
    season?: StringFilter<'Draft'> | string;
    settings?: JsonFilter<'Draft'>;
    metadata?: JsonNullableFilter<'Draft'>;
    slotToRosterId?: IntNullableListFilter<'Draft'>;
    createdAt?: DateTimeFilter<'Draft'> | Date | string;
    updatedAt?: DateTimeFilter<'Draft'> | Date | string;
  };

  export type WeeklyMetricsUpsertWithWhereUniqueWithoutLeagueInput = {
    where: WeeklyMetricsWhereUniqueInput;
    update: XOR<
      WeeklyMetricsUpdateWithoutLeagueInput,
      WeeklyMetricsUncheckedUpdateWithoutLeagueInput
    >;
    create: XOR<
      WeeklyMetricsCreateWithoutLeagueInput,
      WeeklyMetricsUncheckedCreateWithoutLeagueInput
    >;
  };

  export type WeeklyMetricsUpdateWithWhereUniqueWithoutLeagueInput = {
    where: WeeklyMetricsWhereUniqueInput;
    data: XOR<
      WeeklyMetricsUpdateWithoutLeagueInput,
      WeeklyMetricsUncheckedUpdateWithoutLeagueInput
    >;
  };

  export type WeeklyMetricsUpdateManyWithWhereWithoutLeagueInput = {
    where: WeeklyMetricsScalarWhereInput;
    data: XOR<
      WeeklyMetricsUpdateManyMutationInput,
      WeeklyMetricsUncheckedUpdateManyWithoutLeagueInput
    >;
  };

  export type WeeklyMetricsScalarWhereInput = {
    AND?: WeeklyMetricsScalarWhereInput | WeeklyMetricsScalarWhereInput[];
    OR?: WeeklyMetricsScalarWhereInput[];
    NOT?: WeeklyMetricsScalarWhereInput | WeeklyMetricsScalarWhereInput[];
    id?: StringFilter<'WeeklyMetrics'> | string;
    leagueId?: StringFilter<'WeeklyMetrics'> | string;
    rosterId?: IntFilter<'WeeklyMetrics'> | number;
    week?: IntFilter<'WeeklyMetrics'> | number;
    totalPoints?: FloatFilter<'WeeklyMetrics'> | number;
    expectedWins?: FloatFilter<'WeeklyMetrics'> | number;
    luckRating?: FloatFilter<'WeeklyMetrics'> | number;
    opponentPoints?: FloatFilter<'WeeklyMetrics'> | number;
    createdAt?: DateTimeFilter<'WeeklyMetrics'> | Date | string;
    updatedAt?: DateTimeFilter<'WeeklyMetrics'> | Date | string;
  };

  export type LeagueCreateWithoutRostersInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutRostersInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutRostersInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<LeagueCreateWithoutRostersInput, LeagueUncheckedCreateWithoutRostersInput>;
  };

  export type UserCreateWithoutRostersInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    leagues?: LeagueCreateNestedManyWithoutUsersInput;
    transactions?: TransactionCreateNestedManyWithoutCreatorInput;
  };

  export type UserUncheckedCreateWithoutRostersInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    leagues?: LeagueUncheckedCreateNestedManyWithoutUsersInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCreatorInput;
  };

  export type UserCreateOrConnectWithoutRostersInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutRostersInput, UserUncheckedCreateWithoutRostersInput>;
  };

  export type MatchupCreateWithoutRosterInput = {
    id?: string;
    week: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutMatchupsInput;
  };

  export type MatchupUncheckedCreateWithoutRosterInput = {
    id?: string;
    leagueId: string;
    week: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MatchupCreateOrConnectWithoutRosterInput = {
    where: MatchupWhereUniqueInput;
    create: XOR<MatchupCreateWithoutRosterInput, MatchupUncheckedCreateWithoutRosterInput>;
  };

  export type MatchupCreateManyRosterInputEnvelope = {
    data: MatchupCreateManyRosterInput | MatchupCreateManyRosterInput[];
    skipDuplicates?: boolean;
  };

  export type TradedPickCreateWithoutCurrentOwnerInput = {
    id?: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutTradedPicksInput;
  };

  export type TradedPickUncheckedCreateWithoutCurrentOwnerInput = {
    id?: string;
    leagueId: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TradedPickCreateOrConnectWithoutCurrentOwnerInput = {
    where: TradedPickWhereUniqueInput;
    create: XOR<
      TradedPickCreateWithoutCurrentOwnerInput,
      TradedPickUncheckedCreateWithoutCurrentOwnerInput
    >;
  };

  export type TradedPickCreateManyCurrentOwnerInputEnvelope = {
    data: TradedPickCreateManyCurrentOwnerInput | TradedPickCreateManyCurrentOwnerInput[];
    skipDuplicates?: boolean;
  };

  export type WeeklyMetricsCreateWithoutRosterInput = {
    id?: string;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutWeeklyMetricsInput;
  };

  export type WeeklyMetricsUncheckedCreateWithoutRosterInput = {
    id?: string;
    leagueId: string;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WeeklyMetricsCreateOrConnectWithoutRosterInput = {
    where: WeeklyMetricsWhereUniqueInput;
    create: XOR<
      WeeklyMetricsCreateWithoutRosterInput,
      WeeklyMetricsUncheckedCreateWithoutRosterInput
    >;
  };

  export type WeeklyMetricsCreateManyRosterInputEnvelope = {
    data: WeeklyMetricsCreateManyRosterInput | WeeklyMetricsCreateManyRosterInput[];
    skipDuplicates?: boolean;
  };

  export type LeagueUpsertWithoutRostersInput = {
    update: XOR<LeagueUpdateWithoutRostersInput, LeagueUncheckedUpdateWithoutRostersInput>;
    create: XOR<LeagueCreateWithoutRostersInput, LeagueUncheckedCreateWithoutRostersInput>;
    where?: LeagueWhereInput;
  };

  export type LeagueUpdateToOneWithWhereWithoutRostersInput = {
    where?: LeagueWhereInput;
    data: XOR<LeagueUpdateWithoutRostersInput, LeagueUncheckedUpdateWithoutRostersInput>;
  };

  export type LeagueUpdateWithoutRostersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutRostersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type UserUpsertWithoutRostersInput = {
    update: XOR<UserUpdateWithoutRostersInput, UserUncheckedUpdateWithoutRostersInput>;
    create: XOR<UserCreateWithoutRostersInput, UserUncheckedCreateWithoutRostersInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutRostersInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutRostersInput, UserUncheckedUpdateWithoutRostersInput>;
  };

  export type UserUpdateWithoutRostersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    leagues?: LeagueUpdateManyWithoutUsersNestedInput;
    transactions?: TransactionUpdateManyWithoutCreatorNestedInput;
  };

  export type UserUncheckedUpdateWithoutRostersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    leagues?: LeagueUncheckedUpdateManyWithoutUsersNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCreatorNestedInput;
  };

  export type MatchupUpsertWithWhereUniqueWithoutRosterInput = {
    where: MatchupWhereUniqueInput;
    update: XOR<MatchupUpdateWithoutRosterInput, MatchupUncheckedUpdateWithoutRosterInput>;
    create: XOR<MatchupCreateWithoutRosterInput, MatchupUncheckedCreateWithoutRosterInput>;
  };

  export type MatchupUpdateWithWhereUniqueWithoutRosterInput = {
    where: MatchupWhereUniqueInput;
    data: XOR<MatchupUpdateWithoutRosterInput, MatchupUncheckedUpdateWithoutRosterInput>;
  };

  export type MatchupUpdateManyWithWhereWithoutRosterInput = {
    where: MatchupScalarWhereInput;
    data: XOR<MatchupUpdateManyMutationInput, MatchupUncheckedUpdateManyWithoutRosterInput>;
  };

  export type TradedPickUpsertWithWhereUniqueWithoutCurrentOwnerInput = {
    where: TradedPickWhereUniqueInput;
    update: XOR<
      TradedPickUpdateWithoutCurrentOwnerInput,
      TradedPickUncheckedUpdateWithoutCurrentOwnerInput
    >;
    create: XOR<
      TradedPickCreateWithoutCurrentOwnerInput,
      TradedPickUncheckedCreateWithoutCurrentOwnerInput
    >;
  };

  export type TradedPickUpdateWithWhereUniqueWithoutCurrentOwnerInput = {
    where: TradedPickWhereUniqueInput;
    data: XOR<
      TradedPickUpdateWithoutCurrentOwnerInput,
      TradedPickUncheckedUpdateWithoutCurrentOwnerInput
    >;
  };

  export type TradedPickUpdateManyWithWhereWithoutCurrentOwnerInput = {
    where: TradedPickScalarWhereInput;
    data: XOR<
      TradedPickUpdateManyMutationInput,
      TradedPickUncheckedUpdateManyWithoutCurrentOwnerInput
    >;
  };

  export type WeeklyMetricsUpsertWithWhereUniqueWithoutRosterInput = {
    where: WeeklyMetricsWhereUniqueInput;
    update: XOR<
      WeeklyMetricsUpdateWithoutRosterInput,
      WeeklyMetricsUncheckedUpdateWithoutRosterInput
    >;
    create: XOR<
      WeeklyMetricsCreateWithoutRosterInput,
      WeeklyMetricsUncheckedCreateWithoutRosterInput
    >;
  };

  export type WeeklyMetricsUpdateWithWhereUniqueWithoutRosterInput = {
    where: WeeklyMetricsWhereUniqueInput;
    data: XOR<
      WeeklyMetricsUpdateWithoutRosterInput,
      WeeklyMetricsUncheckedUpdateWithoutRosterInput
    >;
  };

  export type WeeklyMetricsUpdateManyWithWhereWithoutRosterInput = {
    where: WeeklyMetricsScalarWhereInput;
    data: XOR<
      WeeklyMetricsUpdateManyMutationInput,
      WeeklyMetricsUncheckedUpdateManyWithoutRosterInput
    >;
  };

  export type LeagueCreateWithoutMatchupsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutMatchupsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutMatchupsInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<LeagueCreateWithoutMatchupsInput, LeagueUncheckedCreateWithoutMatchupsInput>;
  };

  export type RosterCreateWithoutMatchupsInput = {
    id: number;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutRostersInput;
    owner?: UserCreateNestedOneWithoutRostersInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutRosterInput;
  };

  export type RosterUncheckedCreateWithoutMatchupsInput = {
    id: number;
    leagueId: string;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutCurrentOwnerInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutRosterInput;
  };

  export type RosterCreateOrConnectWithoutMatchupsInput = {
    where: RosterWhereUniqueInput;
    create: XOR<RosterCreateWithoutMatchupsInput, RosterUncheckedCreateWithoutMatchupsInput>;
  };

  export type LeagueUpsertWithoutMatchupsInput = {
    update: XOR<LeagueUpdateWithoutMatchupsInput, LeagueUncheckedUpdateWithoutMatchupsInput>;
    create: XOR<LeagueCreateWithoutMatchupsInput, LeagueUncheckedCreateWithoutMatchupsInput>;
    where?: LeagueWhereInput;
  };

  export type LeagueUpdateToOneWithWhereWithoutMatchupsInput = {
    where?: LeagueWhereInput;
    data: XOR<LeagueUpdateWithoutMatchupsInput, LeagueUncheckedUpdateWithoutMatchupsInput>;
  };

  export type LeagueUpdateWithoutMatchupsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutMatchupsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type RosterUpsertWithoutMatchupsInput = {
    update: XOR<RosterUpdateWithoutMatchupsInput, RosterUncheckedUpdateWithoutMatchupsInput>;
    create: XOR<RosterCreateWithoutMatchupsInput, RosterUncheckedCreateWithoutMatchupsInput>;
    where?: RosterWhereInput;
  };

  export type RosterUpdateToOneWithWhereWithoutMatchupsInput = {
    where?: RosterWhereInput;
    data: XOR<RosterUpdateWithoutMatchupsInput, RosterUncheckedUpdateWithoutMatchupsInput>;
  };

  export type RosterUpdateWithoutMatchupsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutRostersNestedInput;
    owner?: UserUpdateOneWithoutRostersNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateWithoutMatchupsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutRosterNestedInput;
  };

  export type LeagueCreateWithoutTransactionsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutTransactionsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutTransactionsInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<
      LeagueCreateWithoutTransactionsInput,
      LeagueUncheckedCreateWithoutTransactionsInput
    >;
  };

  export type UserCreateWithoutTransactionsInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    leagues?: LeagueCreateNestedManyWithoutUsersInput;
    rosters?: RosterCreateNestedManyWithoutOwnerInput;
  };

  export type UserUncheckedCreateWithoutTransactionsInput = {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: boolean;
    leagues?: LeagueUncheckedCreateNestedManyWithoutUsersInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutOwnerInput;
  };

  export type UserCreateOrConnectWithoutTransactionsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>;
  };

  export type LeagueUpsertWithoutTransactionsInput = {
    update: XOR<
      LeagueUpdateWithoutTransactionsInput,
      LeagueUncheckedUpdateWithoutTransactionsInput
    >;
    create: XOR<
      LeagueCreateWithoutTransactionsInput,
      LeagueUncheckedCreateWithoutTransactionsInput
    >;
    where?: LeagueWhereInput;
  };

  export type LeagueUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: LeagueWhereInput;
    data: XOR<LeagueUpdateWithoutTransactionsInput, LeagueUncheckedUpdateWithoutTransactionsInput>;
  };

  export type LeagueUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type UserUpsertWithoutTransactionsInput = {
    update: XOR<UserUpdateWithoutTransactionsInput, UserUncheckedUpdateWithoutTransactionsInput>;
    create: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutTransactionsInput, UserUncheckedUpdateWithoutTransactionsInput>;
  };

  export type UserUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    leagues?: LeagueUpdateManyWithoutUsersNestedInput;
    rosters?: RosterUpdateManyWithoutOwnerNestedInput;
  };

  export type UserUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    leagues?: LeagueUncheckedUpdateManyWithoutUsersNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutOwnerNestedInput;
  };

  export type LeagueCreateWithoutTradedPicksInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutTradedPicksInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutTradedPicksInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<LeagueCreateWithoutTradedPicksInput, LeagueUncheckedCreateWithoutTradedPicksInput>;
  };

  export type RosterCreateWithoutTradedPicksInput = {
    id: number;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutRostersInput;
    owner?: UserCreateNestedOneWithoutRostersInput;
    matchups?: MatchupCreateNestedManyWithoutRosterInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutRosterInput;
  };

  export type RosterUncheckedCreateWithoutTradedPicksInput = {
    id: number;
    leagueId: string;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    matchups?: MatchupUncheckedCreateNestedManyWithoutRosterInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutRosterInput;
  };

  export type RosterCreateOrConnectWithoutTradedPicksInput = {
    where: RosterWhereUniqueInput;
    create: XOR<RosterCreateWithoutTradedPicksInput, RosterUncheckedCreateWithoutTradedPicksInput>;
  };

  export type LeagueUpsertWithoutTradedPicksInput = {
    update: XOR<LeagueUpdateWithoutTradedPicksInput, LeagueUncheckedUpdateWithoutTradedPicksInput>;
    create: XOR<LeagueCreateWithoutTradedPicksInput, LeagueUncheckedCreateWithoutTradedPicksInput>;
    where?: LeagueWhereInput;
  };

  export type LeagueUpdateToOneWithWhereWithoutTradedPicksInput = {
    where?: LeagueWhereInput;
    data: XOR<LeagueUpdateWithoutTradedPicksInput, LeagueUncheckedUpdateWithoutTradedPicksInput>;
  };

  export type LeagueUpdateWithoutTradedPicksInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutTradedPicksInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type RosterUpsertWithoutTradedPicksInput = {
    update: XOR<RosterUpdateWithoutTradedPicksInput, RosterUncheckedUpdateWithoutTradedPicksInput>;
    create: XOR<RosterCreateWithoutTradedPicksInput, RosterUncheckedCreateWithoutTradedPicksInput>;
    where?: RosterWhereInput;
  };

  export type RosterUpdateToOneWithWhereWithoutTradedPicksInput = {
    where?: RosterWhereInput;
    data: XOR<RosterUpdateWithoutTradedPicksInput, RosterUncheckedUpdateWithoutTradedPicksInput>;
  };

  export type RosterUpdateWithoutTradedPicksInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutRostersNestedInput;
    owner?: UserUpdateOneWithoutRostersNestedInput;
    matchups?: MatchupUpdateManyWithoutRosterNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateWithoutTradedPicksInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    matchups?: MatchupUncheckedUpdateManyWithoutRosterNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutRosterNestedInput;
  };

  export type LeagueCreateWithoutDraftsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutDraftsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    weeklyMetrics?: WeeklyMetricsUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutDraftsInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<LeagueCreateWithoutDraftsInput, LeagueUncheckedCreateWithoutDraftsInput>;
  };

  export type DraftPickCreateWithoutDraftInput = {
    id?: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftPickUncheckedCreateWithoutDraftInput = {
    id?: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftPickCreateOrConnectWithoutDraftInput = {
    where: DraftPickWhereUniqueInput;
    create: XOR<DraftPickCreateWithoutDraftInput, DraftPickUncheckedCreateWithoutDraftInput>;
  };

  export type DraftPickCreateManyDraftInputEnvelope = {
    data: DraftPickCreateManyDraftInput | DraftPickCreateManyDraftInput[];
    skipDuplicates?: boolean;
  };

  export type LeagueUpsertWithoutDraftsInput = {
    update: XOR<LeagueUpdateWithoutDraftsInput, LeagueUncheckedUpdateWithoutDraftsInput>;
    create: XOR<LeagueCreateWithoutDraftsInput, LeagueUncheckedCreateWithoutDraftsInput>;
    where?: LeagueWhereInput;
  };

  export type LeagueUpdateToOneWithWhereWithoutDraftsInput = {
    where?: LeagueWhereInput;
    data: XOR<LeagueUpdateWithoutDraftsInput, LeagueUncheckedUpdateWithoutDraftsInput>;
  };

  export type LeagueUpdateWithoutDraftsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutDraftsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type DraftPickUpsertWithWhereUniqueWithoutDraftInput = {
    where: DraftPickWhereUniqueInput;
    update: XOR<DraftPickUpdateWithoutDraftInput, DraftPickUncheckedUpdateWithoutDraftInput>;
    create: XOR<DraftPickCreateWithoutDraftInput, DraftPickUncheckedCreateWithoutDraftInput>;
  };

  export type DraftPickUpdateWithWhereUniqueWithoutDraftInput = {
    where: DraftPickWhereUniqueInput;
    data: XOR<DraftPickUpdateWithoutDraftInput, DraftPickUncheckedUpdateWithoutDraftInput>;
  };

  export type DraftPickUpdateManyWithWhereWithoutDraftInput = {
    where: DraftPickScalarWhereInput;
    data: XOR<DraftPickUpdateManyMutationInput, DraftPickUncheckedUpdateManyWithoutDraftInput>;
  };

  export type DraftPickScalarWhereInput = {
    AND?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[];
    OR?: DraftPickScalarWhereInput[];
    NOT?: DraftPickScalarWhereInput | DraftPickScalarWhereInput[];
    id?: StringFilter<'DraftPick'> | string;
    draftId?: StringFilter<'DraftPick'> | string;
    pickNo?: IntFilter<'DraftPick'> | number;
    round?: IntFilter<'DraftPick'> | number;
    rosterId?: IntFilter<'DraftPick'> | number;
    playerId?: StringFilter<'DraftPick'> | string;
    pickedBy?: StringNullableFilter<'DraftPick'> | string | null;
    metadata?: JsonNullableFilter<'DraftPick'>;
    isKeeper?: BoolFilter<'DraftPick'> | boolean;
    createdAt?: DateTimeFilter<'DraftPick'> | Date | string;
    updatedAt?: DateTimeFilter<'DraftPick'> | Date | string;
  };

  export type DraftCreateWithoutPicksInput = {
    id: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutDraftsInput;
  };

  export type DraftUncheckedCreateWithoutPicksInput = {
    id: string;
    leagueId: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftCreateOrConnectWithoutPicksInput = {
    where: DraftWhereUniqueInput;
    create: XOR<DraftCreateWithoutPicksInput, DraftUncheckedCreateWithoutPicksInput>;
  };

  export type DraftUpsertWithoutPicksInput = {
    update: XOR<DraftUpdateWithoutPicksInput, DraftUncheckedUpdateWithoutPicksInput>;
    create: XOR<DraftCreateWithoutPicksInput, DraftUncheckedCreateWithoutPicksInput>;
    where?: DraftWhereInput;
  };

  export type DraftUpdateToOneWithWhereWithoutPicksInput = {
    where?: DraftWhereInput;
    data: XOR<DraftUpdateWithoutPicksInput, DraftUncheckedUpdateWithoutPicksInput>;
  };

  export type DraftUpdateWithoutPicksInput = {
    id?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutDraftsNestedInput;
  };

  export type DraftUncheckedUpdateWithoutPicksInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type LeagueCreateWithoutWeeklyMetricsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutLeagueInput;
    drafts?: DraftCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueUncheckedCreateWithoutWeeklyMetricsInput = {
    id: string;
    name: string;
    season: string;
    seasonType?: string;
    status?: string;
    sport?: string;
    totalRosters: number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueCreaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: string | null;
    draftId?: string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: UserUncheckedCreateNestedManyWithoutLeaguesInput;
    rosters?: RosterUncheckedCreateNestedManyWithoutLeagueInput;
    matchups?: MatchupUncheckedCreateNestedManyWithoutLeagueInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutLeagueInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutLeagueInput;
    drafts?: DraftUncheckedCreateNestedManyWithoutLeagueInput;
  };

  export type LeagueCreateOrConnectWithoutWeeklyMetricsInput = {
    where: LeagueWhereUniqueInput;
    create: XOR<
      LeagueCreateWithoutWeeklyMetricsInput,
      LeagueUncheckedCreateWithoutWeeklyMetricsInput
    >;
  };

  export type RosterCreateWithoutWeeklyMetricsInput = {
    id: number;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    league: LeagueCreateNestedOneWithoutRostersInput;
    owner?: UserCreateNestedOneWithoutRostersInput;
    matchups?: MatchupCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickCreateNestedManyWithoutCurrentOwnerInput;
  };

  export type RosterUncheckedCreateWithoutWeeklyMetricsInput = {
    id: number;
    leagueId: string;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    matchups?: MatchupUncheckedCreateNestedManyWithoutRosterInput;
    tradedPicks?: TradedPickUncheckedCreateNestedManyWithoutCurrentOwnerInput;
  };

  export type RosterCreateOrConnectWithoutWeeklyMetricsInput = {
    where: RosterWhereUniqueInput;
    create: XOR<
      RosterCreateWithoutWeeklyMetricsInput,
      RosterUncheckedCreateWithoutWeeklyMetricsInput
    >;
  };

  export type LeagueUpsertWithoutWeeklyMetricsInput = {
    update: XOR<
      LeagueUpdateWithoutWeeklyMetricsInput,
      LeagueUncheckedUpdateWithoutWeeklyMetricsInput
    >;
    create: XOR<
      LeagueCreateWithoutWeeklyMetricsInput,
      LeagueUncheckedCreateWithoutWeeklyMetricsInput
    >;
    where?: LeagueWhereInput;
  };

  export type LeagueUpdateToOneWithWhereWithoutWeeklyMetricsInput = {
    where?: LeagueWhereInput;
    data: XOR<
      LeagueUpdateWithoutWeeklyMetricsInput,
      LeagueUncheckedUpdateWithoutWeeklyMetricsInput
    >;
  };

  export type LeagueUpdateWithoutWeeklyMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutWeeklyMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    users?: UserUncheckedUpdateManyWithoutLeaguesNestedInput;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type RosterUpsertWithoutWeeklyMetricsInput = {
    update: XOR<
      RosterUpdateWithoutWeeklyMetricsInput,
      RosterUncheckedUpdateWithoutWeeklyMetricsInput
    >;
    create: XOR<
      RosterCreateWithoutWeeklyMetricsInput,
      RosterUncheckedCreateWithoutWeeklyMetricsInput
    >;
    where?: RosterWhereInput;
  };

  export type RosterUpdateToOneWithWhereWithoutWeeklyMetricsInput = {
    where?: RosterWhereInput;
    data: XOR<
      RosterUpdateWithoutWeeklyMetricsInput,
      RosterUncheckedUpdateWithoutWeeklyMetricsInput
    >;
  };

  export type RosterUpdateWithoutWeeklyMetricsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutRostersNestedInput;
    owner?: UserUpdateOneWithoutRostersNestedInput;
    matchups?: MatchupUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutCurrentOwnerNestedInput;
  };

  export type RosterUncheckedUpdateWithoutWeeklyMetricsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    matchups?: MatchupUncheckedUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutCurrentOwnerNestedInput;
  };

  export type RosterCreateManyOwnerInput = {
    id: number;
    leagueId: string;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionCreateManyCreatorInput = {
    id: string;
    leagueId: string;
    type: string;
    status?: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type LeagueUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    rosters?: RosterUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    rosters?: RosterUncheckedUpdateManyWithoutLeagueNestedInput;
    matchups?: MatchupUncheckedUpdateManyWithoutLeagueNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutLeagueNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutLeagueNestedInput;
    drafts?: DraftUncheckedUpdateManyWithoutLeagueNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutLeagueNestedInput;
  };

  export type LeagueUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    seasonType?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    sport?: StringFieldUpdateOperationsInput | string;
    totalRosters?: IntFieldUpdateOperationsInput | number;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    scoringSettings?: NullableJsonNullValueInput | InputJsonValue;
    rosterPositions?: LeagueUpdaterosterPositionsInput | string[];
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    previousLeagueId?: NullableStringFieldUpdateOperationsInput | string | null;
    draftId?: NullableStringFieldUpdateOperationsInput | string | null;
    playoffMatchups?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RosterUpdateWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutRostersNestedInput;
    matchups?: MatchupUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    matchups?: MatchupUncheckedUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateManyWithoutOwnerInput = {
    id?: IntFieldUpdateOperationsInput | number;
    leagueId?: StringFieldUpdateOperationsInput | string;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUpdateWithoutCreatorInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutTransactionsNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutCreatorInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateManyWithoutCreatorInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RosterCreateManyLeagueInput = {
    id: number;
    ownerId?: string | null;
    coOwners?: RosterCreatecoOwnersInput | string[];
    players?: RosterCreateplayersInput | string[];
    starters?: RosterCreatestartersInput | string[];
    reserve?: RosterCreatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: number;
    waiverPosition?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MatchupCreateManyLeagueInput = {
    id?: string;
    week: number;
    rosterId: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionCreateManyLeagueInput = {
    id: string;
    type: string;
    status?: string;
    creatorId: string;
    rosterIds?: TransactionCreaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: number;
    consenterIds?: TransactionCreateconsenterIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TradedPickCreateManyLeagueInput = {
    id?: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    ownerId: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftCreateManyLeagueInput = {
    id: string;
    status?: string;
    type?: string;
    season: string;
    settings: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftCreateslotToRosterIdInput | number[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WeeklyMetricsCreateManyLeagueInput = {
    id?: string;
    rosterId: number;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type UserUpdateWithoutLeaguesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    rosters?: RosterUpdateManyWithoutOwnerNestedInput;
    transactions?: TransactionUpdateManyWithoutCreatorNestedInput;
  };

  export type UserUncheckedUpdateWithoutLeaguesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
    rosters?: RosterUncheckedUpdateManyWithoutOwnerNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCreatorNestedInput;
  };

  export type UserUncheckedUpdateManyWithoutLeaguesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    username?: StringFieldUpdateOperationsInput | string;
    displayName?: StringFieldUpdateOperationsInput | string;
    avatar?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isBot?: BoolFieldUpdateOperationsInput | boolean;
  };

  export type RosterUpdateWithoutLeagueInput = {
    id?: IntFieldUpdateOperationsInput | number;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    owner?: UserUpdateOneWithoutRostersNestedInput;
    matchups?: MatchupUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateWithoutLeagueInput = {
    id?: IntFieldUpdateOperationsInput | number;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    matchups?: MatchupUncheckedUpdateManyWithoutRosterNestedInput;
    tradedPicks?: TradedPickUncheckedUpdateManyWithoutCurrentOwnerNestedInput;
    weeklyMetrics?: WeeklyMetricsUncheckedUpdateManyWithoutRosterNestedInput;
  };

  export type RosterUncheckedUpdateManyWithoutLeagueInput = {
    id?: IntFieldUpdateOperationsInput | number;
    ownerId?: NullableStringFieldUpdateOperationsInput | string | null;
    coOwners?: RosterUpdatecoOwnersInput | string[];
    players?: RosterUpdateplayersInput | string[];
    starters?: RosterUpdatestartersInput | string[];
    reserve?: RosterUpdatereserveInput | string[];
    settings?: NullableJsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    waiverBudget?: IntFieldUpdateOperationsInput | number;
    waiverPosition?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    roster?: RosterUpdateOneRequiredWithoutMatchupsNestedInput;
  };

  export type MatchupUncheckedUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupUncheckedUpdateManyWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: UserUpdateOneRequiredWithoutTransactionsNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    creatorId?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateManyWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    creatorId?: StringFieldUpdateOperationsInput | string;
    rosterIds?: TransactionUpdaterosterIdsInput | number[];
    adds?: NullableJsonNullValueInput | InputJsonValue;
    drops?: NullableJsonNullValueInput | InputJsonValue;
    draftPicks?: NullableJsonNullValueInput | InputJsonValue;
    waiver?: NullableJsonNullValueInput | InputJsonValue;
    settings?: NullableJsonNullValueInput | InputJsonValue;
    leg?: IntFieldUpdateOperationsInput | number;
    consenterIds?: TransactionUpdateconsenterIdsInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    currentOwner?: RosterUpdateOneRequiredWithoutTradedPicksNestedInput;
  };

  export type TradedPickUncheckedUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    ownerId?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickUncheckedUpdateManyWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    ownerId?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    picks?: DraftPickUpdateManyWithoutDraftNestedInput;
  };

  export type DraftUncheckedUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    picks?: DraftPickUncheckedUpdateManyWithoutDraftNestedInput;
  };

  export type DraftUncheckedUpdateManyWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    status?: StringFieldUpdateOperationsInput | string;
    type?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    settings?: JsonNullValueInput | InputJsonValue;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    slotToRosterId?: DraftUpdateslotToRosterIdInput | number[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    roster?: RosterUpdateOneRequiredWithoutWeeklyMetricsNestedInput;
  };

  export type WeeklyMetricsUncheckedUpdateWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    rosterId?: IntFieldUpdateOperationsInput | number;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsUncheckedUpdateManyWithoutLeagueInput = {
    id?: StringFieldUpdateOperationsInput | string;
    rosterId?: IntFieldUpdateOperationsInput | number;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupCreateManyRosterInput = {
    id?: string;
    leagueId: string;
    week: number;
    matchupId?: number | null;
    points?: number;
    customPoints?: number | null;
    starters?: MatchupCreatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupCreateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TradedPickCreateManyCurrentOwnerInput = {
    id?: string;
    leagueId: string;
    season: string;
    round: number;
    rosterId: number;
    previousOwnerId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WeeklyMetricsCreateManyRosterInput = {
    id?: string;
    leagueId: string;
    week: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    opponentPoints: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MatchupUpdateWithoutRosterInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutMatchupsNestedInput;
  };

  export type MatchupUncheckedUpdateWithoutRosterInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MatchupUncheckedUpdateManyWithoutRosterInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    matchupId?: NullableIntFieldUpdateOperationsInput | number | null;
    points?: FloatFieldUpdateOperationsInput | number;
    customPoints?: NullableFloatFieldUpdateOperationsInput | number | null;
    starters?: MatchupUpdatestartersInput | string[];
    startersPoints?: NullableJsonNullValueInput | InputJsonValue;
    players?: MatchupUpdateplayersInput | string[];
    playersPoints?: NullableJsonNullValueInput | InputJsonValue;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickUpdateWithoutCurrentOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutTradedPicksNestedInput;
  };

  export type TradedPickUncheckedUpdateWithoutCurrentOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TradedPickUncheckedUpdateManyWithoutCurrentOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    season?: StringFieldUpdateOperationsInput | string;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    previousOwnerId?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsUpdateWithoutRosterInput = {
    id?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    league?: LeagueUpdateOneRequiredWithoutWeeklyMetricsNestedInput;
  };

  export type WeeklyMetricsUncheckedUpdateWithoutRosterInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WeeklyMetricsUncheckedUpdateManyWithoutRosterInput = {
    id?: StringFieldUpdateOperationsInput | string;
    leagueId?: StringFieldUpdateOperationsInput | string;
    week?: IntFieldUpdateOperationsInput | number;
    totalPoints?: FloatFieldUpdateOperationsInput | number;
    expectedWins?: FloatFieldUpdateOperationsInput | number;
    luckRating?: FloatFieldUpdateOperationsInput | number;
    opponentPoints?: FloatFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftPickCreateManyDraftInput = {
    id?: string;
    pickNo: number;
    round: number;
    rosterId: number;
    playerId: string;
    pickedBy?: string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DraftPickUpdateWithoutDraftInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftPickUncheckedUpdateWithoutDraftInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DraftPickUncheckedUpdateManyWithoutDraftInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pickNo?: IntFieldUpdateOperationsInput | number;
    round?: IntFieldUpdateOperationsInput | number;
    rosterId?: IntFieldUpdateOperationsInput | number;
    playerId?: StringFieldUpdateOperationsInput | string;
    pickedBy?: NullableStringFieldUpdateOperationsInput | string | null;
    metadata?: NullableJsonNullValueInput | InputJsonValue;
    isKeeper?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Aliases for legacy arg types
   */
  /**
   * @deprecated Use UserCountOutputTypeDefaultArgs instead
   */
  export type UserCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = UserCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use LeagueCountOutputTypeDefaultArgs instead
   */
  export type LeagueCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = LeagueCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use RosterCountOutputTypeDefaultArgs instead
   */
  export type RosterCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = RosterCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use DraftCountOutputTypeDefaultArgs instead
   */
  export type DraftCountOutputTypeArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = DraftCountOutputTypeDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use UserDefaultArgs instead
   */
  export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    UserDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use LeagueDefaultArgs instead
   */
  export type LeagueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    LeagueDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use RosterDefaultArgs instead
   */
  export type RosterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    RosterDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use MatchupDefaultArgs instead
   */
  export type MatchupArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    MatchupDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use TransactionDefaultArgs instead
   */
  export type TransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    TransactionDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use TradedPickDefaultArgs instead
   */
  export type TradedPickArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    TradedPickDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use DraftDefaultArgs instead
   */
  export type DraftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    DraftDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use DraftPickDefaultArgs instead
   */
  export type DraftPickArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    DraftPickDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use PlayerDefaultArgs instead
   */
  export type PlayerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    PlayerDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use PlayerStatsDefaultArgs instead
   */
  export type PlayerStatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    PlayerStatsDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use WeeklyMetricsDefaultArgs instead
   */
  export type WeeklyMetricsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = WeeklyMetricsDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use PositionVarianceDefaultArgs instead
   */
  export type PositionVarianceArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = PositionVarianceDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use PlayerVarianceDefaultArgs instead
   */
  export type PlayerVarianceArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = PlayerVarianceDefaultArgs<ExtArgs>;
  /**
   * @deprecated Use ProjectionErrorDefaultArgs instead
   */
  export type ProjectionErrorArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = ProjectionErrorDefaultArgs<ExtArgs>;

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
