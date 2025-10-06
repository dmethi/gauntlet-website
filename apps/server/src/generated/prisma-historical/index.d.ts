
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model LiveWinProbSample
 * Live win probability samples captured during NFL games
 * Purpose: Time-series charts showing how win probability changed during games
 * Written by: .github/workflows/live-odds-updates.yml (every 10 min during games)
 * Used by: Weekly recap reports, matchup excitement metrics
 */
export type LiveWinProbSample = $Result.DefaultSelection<Prisma.$LiveWinProbSamplePayload>
/**
 * Model MatchupOddsHistory
 * Historical odds for individual matchups
 * Purpose: Track how matchup odds changed over time
 * Written by: .github/workflows/live-odds-updates.yml (during games)
 * Used by: Matchup history charts, odds movement analysis
 */
export type MatchupOddsHistory = $Result.DefaultSelection<Prisma.$MatchupOddsHistoryPayload>
/**
 * Model LeagueOddsHistory
 * League-wide odds snapshots
 * Purpose: Track league-wide predictions (highest scorer, closest matchup, etc.)
 * Written by: .github/workflows/live-odds-updates.yml
 * Used by: Weekly recap reports, league-wide trends
 */
export type LeagueOddsHistory = $Result.DefaultSelection<Prisma.$LeagueOddsHistoryPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more LiveWinProbSamples
 * const liveWinProbSamples = await prisma.liveWinProbSample.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more LiveWinProbSamples
   * const liveWinProbSamples = await prisma.liveWinProbSample.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

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
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

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
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.liveWinProbSample`: Exposes CRUD operations for the **LiveWinProbSample** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LiveWinProbSamples
    * const liveWinProbSamples = await prisma.liveWinProbSample.findMany()
    * ```
    */
  get liveWinProbSample(): Prisma.LiveWinProbSampleDelegate<ExtArgs>;

  /**
   * `prisma.matchupOddsHistory`: Exposes CRUD operations for the **MatchupOddsHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MatchupOddsHistories
    * const matchupOddsHistories = await prisma.matchupOddsHistory.findMany()
    * ```
    */
  get matchupOddsHistory(): Prisma.MatchupOddsHistoryDelegate<ExtArgs>;

  /**
   * `prisma.leagueOddsHistory`: Exposes CRUD operations for the **LeagueOddsHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LeagueOddsHistories
    * const leagueOddsHistories = await prisma.leagueOddsHistory.findMany()
    * ```
    */
  get leagueOddsHistory(): Prisma.LeagueOddsHistoryDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

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
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

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
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
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
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    LiveWinProbSample: 'LiveWinProbSample',
    MatchupOddsHistory: 'MatchupOddsHistory',
    LeagueOddsHistory: 'LeagueOddsHistory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "liveWinProbSample" | "matchupOddsHistory" | "leagueOddsHistory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      LiveWinProbSample: {
        payload: Prisma.$LiveWinProbSamplePayload<ExtArgs>
        fields: Prisma.LiveWinProbSampleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LiveWinProbSampleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LiveWinProbSampleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>
          }
          findFirst: {
            args: Prisma.LiveWinProbSampleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LiveWinProbSampleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>
          }
          findMany: {
            args: Prisma.LiveWinProbSampleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>[]
          }
          create: {
            args: Prisma.LiveWinProbSampleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>
          }
          createMany: {
            args: Prisma.LiveWinProbSampleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LiveWinProbSampleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>[]
          }
          delete: {
            args: Prisma.LiveWinProbSampleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>
          }
          update: {
            args: Prisma.LiveWinProbSampleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>
          }
          deleteMany: {
            args: Prisma.LiveWinProbSampleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LiveWinProbSampleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LiveWinProbSampleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveWinProbSamplePayload>
          }
          aggregate: {
            args: Prisma.LiveWinProbSampleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLiveWinProbSample>
          }
          groupBy: {
            args: Prisma.LiveWinProbSampleGroupByArgs<ExtArgs>
            result: $Utils.Optional<LiveWinProbSampleGroupByOutputType>[]
          }
          count: {
            args: Prisma.LiveWinProbSampleCountArgs<ExtArgs>
            result: $Utils.Optional<LiveWinProbSampleCountAggregateOutputType> | number
          }
        }
      }
      MatchupOddsHistory: {
        payload: Prisma.$MatchupOddsHistoryPayload<ExtArgs>
        fields: Prisma.MatchupOddsHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MatchupOddsHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MatchupOddsHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>
          }
          findFirst: {
            args: Prisma.MatchupOddsHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MatchupOddsHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>
          }
          findMany: {
            args: Prisma.MatchupOddsHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>[]
          }
          create: {
            args: Prisma.MatchupOddsHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>
          }
          createMany: {
            args: Prisma.MatchupOddsHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MatchupOddsHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>[]
          }
          delete: {
            args: Prisma.MatchupOddsHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>
          }
          update: {
            args: Prisma.MatchupOddsHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>
          }
          deleteMany: {
            args: Prisma.MatchupOddsHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MatchupOddsHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MatchupOddsHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatchupOddsHistoryPayload>
          }
          aggregate: {
            args: Prisma.MatchupOddsHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMatchupOddsHistory>
          }
          groupBy: {
            args: Prisma.MatchupOddsHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<MatchupOddsHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.MatchupOddsHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<MatchupOddsHistoryCountAggregateOutputType> | number
          }
        }
      }
      LeagueOddsHistory: {
        payload: Prisma.$LeagueOddsHistoryPayload<ExtArgs>
        fields: Prisma.LeagueOddsHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeagueOddsHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeagueOddsHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>
          }
          findFirst: {
            args: Prisma.LeagueOddsHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeagueOddsHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>
          }
          findMany: {
            args: Prisma.LeagueOddsHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>[]
          }
          create: {
            args: Prisma.LeagueOddsHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>
          }
          createMany: {
            args: Prisma.LeagueOddsHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeagueOddsHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>[]
          }
          delete: {
            args: Prisma.LeagueOddsHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>
          }
          update: {
            args: Prisma.LeagueOddsHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>
          }
          deleteMany: {
            args: Prisma.LeagueOddsHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeagueOddsHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LeagueOddsHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeagueOddsHistoryPayload>
          }
          aggregate: {
            args: Prisma.LeagueOddsHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeagueOddsHistory>
          }
          groupBy: {
            args: Prisma.LeagueOddsHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeagueOddsHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeagueOddsHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<LeagueOddsHistoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
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
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
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
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model LiveWinProbSample
   */

  export type AggregateLiveWinProbSample = {
    _count: LiveWinProbSampleCountAggregateOutputType | null
    _avg: LiveWinProbSampleAvgAggregateOutputType | null
    _sum: LiveWinProbSampleSumAggregateOutputType | null
    _min: LiveWinProbSampleMinAggregateOutputType | null
    _max: LiveWinProbSampleMaxAggregateOutputType | null
  }

  export type LiveWinProbSampleAvgAggregateOutputType = {
    week: number | null
    matchupId: number | null
    rosterAId: number | null
    rosterBId: number | null
    gameProgress: number | null
    winProbA: number | null
    winProbB: number | null
    projectedFinalA: number | null
    projectedFinalB: number | null
    currentScoreA: number | null
    currentScoreB: number | null
    spread: number | null
    total: number | null
  }

  export type LiveWinProbSampleSumAggregateOutputType = {
    week: number | null
    matchupId: number | null
    rosterAId: number | null
    rosterBId: number | null
    gameProgress: number | null
    winProbA: number | null
    winProbB: number | null
    projectedFinalA: number | null
    projectedFinalB: number | null
    currentScoreA: number | null
    currentScoreB: number | null
    spread: number | null
    total: number | null
  }

  export type LiveWinProbSampleMinAggregateOutputType = {
    id: string | null
    leagueId: string | null
    week: number | null
    matchupId: number | null
    rosterAId: number | null
    rosterBId: number | null
    timestamp: Date | null
    gameProgress: number | null
    winProbA: number | null
    winProbB: number | null
    projectedFinalA: number | null
    projectedFinalB: number | null
    currentScoreA: number | null
    currentScoreB: number | null
    spread: number | null
    total: number | null
  }

  export type LiveWinProbSampleMaxAggregateOutputType = {
    id: string | null
    leagueId: string | null
    week: number | null
    matchupId: number | null
    rosterAId: number | null
    rosterBId: number | null
    timestamp: Date | null
    gameProgress: number | null
    winProbA: number | null
    winProbB: number | null
    projectedFinalA: number | null
    projectedFinalB: number | null
    currentScoreA: number | null
    currentScoreB: number | null
    spread: number | null
    total: number | null
  }

  export type LiveWinProbSampleCountAggregateOutputType = {
    id: number
    leagueId: number
    week: number
    matchupId: number
    rosterAId: number
    rosterBId: number
    timestamp: number
    gameProgress: number
    winProbA: number
    winProbB: number
    projectedFinalA: number
    projectedFinalB: number
    currentScoreA: number
    currentScoreB: number
    spread: number
    total: number
    _all: number
  }


  export type LiveWinProbSampleAvgAggregateInputType = {
    week?: true
    matchupId?: true
    rosterAId?: true
    rosterBId?: true
    gameProgress?: true
    winProbA?: true
    winProbB?: true
    projectedFinalA?: true
    projectedFinalB?: true
    currentScoreA?: true
    currentScoreB?: true
    spread?: true
    total?: true
  }

  export type LiveWinProbSampleSumAggregateInputType = {
    week?: true
    matchupId?: true
    rosterAId?: true
    rosterBId?: true
    gameProgress?: true
    winProbA?: true
    winProbB?: true
    projectedFinalA?: true
    projectedFinalB?: true
    currentScoreA?: true
    currentScoreB?: true
    spread?: true
    total?: true
  }

  export type LiveWinProbSampleMinAggregateInputType = {
    id?: true
    leagueId?: true
    week?: true
    matchupId?: true
    rosterAId?: true
    rosterBId?: true
    timestamp?: true
    gameProgress?: true
    winProbA?: true
    winProbB?: true
    projectedFinalA?: true
    projectedFinalB?: true
    currentScoreA?: true
    currentScoreB?: true
    spread?: true
    total?: true
  }

  export type LiveWinProbSampleMaxAggregateInputType = {
    id?: true
    leagueId?: true
    week?: true
    matchupId?: true
    rosterAId?: true
    rosterBId?: true
    timestamp?: true
    gameProgress?: true
    winProbA?: true
    winProbB?: true
    projectedFinalA?: true
    projectedFinalB?: true
    currentScoreA?: true
    currentScoreB?: true
    spread?: true
    total?: true
  }

  export type LiveWinProbSampleCountAggregateInputType = {
    id?: true
    leagueId?: true
    week?: true
    matchupId?: true
    rosterAId?: true
    rosterBId?: true
    timestamp?: true
    gameProgress?: true
    winProbA?: true
    winProbB?: true
    projectedFinalA?: true
    projectedFinalB?: true
    currentScoreA?: true
    currentScoreB?: true
    spread?: true
    total?: true
    _all?: true
  }

  export type LiveWinProbSampleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiveWinProbSample to aggregate.
     */
    where?: LiveWinProbSampleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveWinProbSamples to fetch.
     */
    orderBy?: LiveWinProbSampleOrderByWithRelationInput | LiveWinProbSampleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LiveWinProbSampleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveWinProbSamples from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveWinProbSamples.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LiveWinProbSamples
    **/
    _count?: true | LiveWinProbSampleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LiveWinProbSampleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LiveWinProbSampleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LiveWinProbSampleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LiveWinProbSampleMaxAggregateInputType
  }

  export type GetLiveWinProbSampleAggregateType<T extends LiveWinProbSampleAggregateArgs> = {
        [P in keyof T & keyof AggregateLiveWinProbSample]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLiveWinProbSample[P]>
      : GetScalarType<T[P], AggregateLiveWinProbSample[P]>
  }




  export type LiveWinProbSampleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LiveWinProbSampleWhereInput
    orderBy?: LiveWinProbSampleOrderByWithAggregationInput | LiveWinProbSampleOrderByWithAggregationInput[]
    by: LiveWinProbSampleScalarFieldEnum[] | LiveWinProbSampleScalarFieldEnum
    having?: LiveWinProbSampleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LiveWinProbSampleCountAggregateInputType | true
    _avg?: LiveWinProbSampleAvgAggregateInputType
    _sum?: LiveWinProbSampleSumAggregateInputType
    _min?: LiveWinProbSampleMinAggregateInputType
    _max?: LiveWinProbSampleMaxAggregateInputType
  }

  export type LiveWinProbSampleGroupByOutputType = {
    id: string
    leagueId: string
    week: number
    matchupId: number
    rosterAId: number
    rosterBId: number
    timestamp: Date
    gameProgress: number
    winProbA: number
    winProbB: number
    projectedFinalA: number
    projectedFinalB: number
    currentScoreA: number
    currentScoreB: number
    spread: number
    total: number
    _count: LiveWinProbSampleCountAggregateOutputType | null
    _avg: LiveWinProbSampleAvgAggregateOutputType | null
    _sum: LiveWinProbSampleSumAggregateOutputType | null
    _min: LiveWinProbSampleMinAggregateOutputType | null
    _max: LiveWinProbSampleMaxAggregateOutputType | null
  }

  type GetLiveWinProbSampleGroupByPayload<T extends LiveWinProbSampleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LiveWinProbSampleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LiveWinProbSampleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LiveWinProbSampleGroupByOutputType[P]>
            : GetScalarType<T[P], LiveWinProbSampleGroupByOutputType[P]>
        }
      >
    >


  export type LiveWinProbSampleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leagueId?: boolean
    week?: boolean
    matchupId?: boolean
    rosterAId?: boolean
    rosterBId?: boolean
    timestamp?: boolean
    gameProgress?: boolean
    winProbA?: boolean
    winProbB?: boolean
    projectedFinalA?: boolean
    projectedFinalB?: boolean
    currentScoreA?: boolean
    currentScoreB?: boolean
    spread?: boolean
    total?: boolean
  }, ExtArgs["result"]["liveWinProbSample"]>

  export type LiveWinProbSampleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leagueId?: boolean
    week?: boolean
    matchupId?: boolean
    rosterAId?: boolean
    rosterBId?: boolean
    timestamp?: boolean
    gameProgress?: boolean
    winProbA?: boolean
    winProbB?: boolean
    projectedFinalA?: boolean
    projectedFinalB?: boolean
    currentScoreA?: boolean
    currentScoreB?: boolean
    spread?: boolean
    total?: boolean
  }, ExtArgs["result"]["liveWinProbSample"]>

  export type LiveWinProbSampleSelectScalar = {
    id?: boolean
    leagueId?: boolean
    week?: boolean
    matchupId?: boolean
    rosterAId?: boolean
    rosterBId?: boolean
    timestamp?: boolean
    gameProgress?: boolean
    winProbA?: boolean
    winProbB?: boolean
    projectedFinalA?: boolean
    projectedFinalB?: boolean
    currentScoreA?: boolean
    currentScoreB?: boolean
    spread?: boolean
    total?: boolean
  }


  export type $LiveWinProbSamplePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LiveWinProbSample"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      leagueId: string
      week: number
      matchupId: number
      rosterAId: number
      rosterBId: number
      timestamp: Date
      gameProgress: number
      winProbA: number
      winProbB: number
      projectedFinalA: number
      projectedFinalB: number
      currentScoreA: number
      currentScoreB: number
      spread: number
      total: number
    }, ExtArgs["result"]["liveWinProbSample"]>
    composites: {}
  }

  type LiveWinProbSampleGetPayload<S extends boolean | null | undefined | LiveWinProbSampleDefaultArgs> = $Result.GetResult<Prisma.$LiveWinProbSamplePayload, S>

  type LiveWinProbSampleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LiveWinProbSampleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LiveWinProbSampleCountAggregateInputType | true
    }

  export interface LiveWinProbSampleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LiveWinProbSample'], meta: { name: 'LiveWinProbSample' } }
    /**
     * Find zero or one LiveWinProbSample that matches the filter.
     * @param {LiveWinProbSampleFindUniqueArgs} args - Arguments to find a LiveWinProbSample
     * @example
     * // Get one LiveWinProbSample
     * const liveWinProbSample = await prisma.liveWinProbSample.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LiveWinProbSampleFindUniqueArgs>(args: SelectSubset<T, LiveWinProbSampleFindUniqueArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LiveWinProbSample that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LiveWinProbSampleFindUniqueOrThrowArgs} args - Arguments to find a LiveWinProbSample
     * @example
     * // Get one LiveWinProbSample
     * const liveWinProbSample = await prisma.liveWinProbSample.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LiveWinProbSampleFindUniqueOrThrowArgs>(args: SelectSubset<T, LiveWinProbSampleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LiveWinProbSample that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleFindFirstArgs} args - Arguments to find a LiveWinProbSample
     * @example
     * // Get one LiveWinProbSample
     * const liveWinProbSample = await prisma.liveWinProbSample.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LiveWinProbSampleFindFirstArgs>(args?: SelectSubset<T, LiveWinProbSampleFindFirstArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LiveWinProbSample that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleFindFirstOrThrowArgs} args - Arguments to find a LiveWinProbSample
     * @example
     * // Get one LiveWinProbSample
     * const liveWinProbSample = await prisma.liveWinProbSample.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LiveWinProbSampleFindFirstOrThrowArgs>(args?: SelectSubset<T, LiveWinProbSampleFindFirstOrThrowArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LiveWinProbSamples that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LiveWinProbSamples
     * const liveWinProbSamples = await prisma.liveWinProbSample.findMany()
     * 
     * // Get first 10 LiveWinProbSamples
     * const liveWinProbSamples = await prisma.liveWinProbSample.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const liveWinProbSampleWithIdOnly = await prisma.liveWinProbSample.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LiveWinProbSampleFindManyArgs>(args?: SelectSubset<T, LiveWinProbSampleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LiveWinProbSample.
     * @param {LiveWinProbSampleCreateArgs} args - Arguments to create a LiveWinProbSample.
     * @example
     * // Create one LiveWinProbSample
     * const LiveWinProbSample = await prisma.liveWinProbSample.create({
     *   data: {
     *     // ... data to create a LiveWinProbSample
     *   }
     * })
     * 
     */
    create<T extends LiveWinProbSampleCreateArgs>(args: SelectSubset<T, LiveWinProbSampleCreateArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LiveWinProbSamples.
     * @param {LiveWinProbSampleCreateManyArgs} args - Arguments to create many LiveWinProbSamples.
     * @example
     * // Create many LiveWinProbSamples
     * const liveWinProbSample = await prisma.liveWinProbSample.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LiveWinProbSampleCreateManyArgs>(args?: SelectSubset<T, LiveWinProbSampleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LiveWinProbSamples and returns the data saved in the database.
     * @param {LiveWinProbSampleCreateManyAndReturnArgs} args - Arguments to create many LiveWinProbSamples.
     * @example
     * // Create many LiveWinProbSamples
     * const liveWinProbSample = await prisma.liveWinProbSample.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LiveWinProbSamples and only return the `id`
     * const liveWinProbSampleWithIdOnly = await prisma.liveWinProbSample.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LiveWinProbSampleCreateManyAndReturnArgs>(args?: SelectSubset<T, LiveWinProbSampleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a LiveWinProbSample.
     * @param {LiveWinProbSampleDeleteArgs} args - Arguments to delete one LiveWinProbSample.
     * @example
     * // Delete one LiveWinProbSample
     * const LiveWinProbSample = await prisma.liveWinProbSample.delete({
     *   where: {
     *     // ... filter to delete one LiveWinProbSample
     *   }
     * })
     * 
     */
    delete<T extends LiveWinProbSampleDeleteArgs>(args: SelectSubset<T, LiveWinProbSampleDeleteArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LiveWinProbSample.
     * @param {LiveWinProbSampleUpdateArgs} args - Arguments to update one LiveWinProbSample.
     * @example
     * // Update one LiveWinProbSample
     * const liveWinProbSample = await prisma.liveWinProbSample.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LiveWinProbSampleUpdateArgs>(args: SelectSubset<T, LiveWinProbSampleUpdateArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LiveWinProbSamples.
     * @param {LiveWinProbSampleDeleteManyArgs} args - Arguments to filter LiveWinProbSamples to delete.
     * @example
     * // Delete a few LiveWinProbSamples
     * const { count } = await prisma.liveWinProbSample.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LiveWinProbSampleDeleteManyArgs>(args?: SelectSubset<T, LiveWinProbSampleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LiveWinProbSamples.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LiveWinProbSamples
     * const liveWinProbSample = await prisma.liveWinProbSample.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LiveWinProbSampleUpdateManyArgs>(args: SelectSubset<T, LiveWinProbSampleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LiveWinProbSample.
     * @param {LiveWinProbSampleUpsertArgs} args - Arguments to update or create a LiveWinProbSample.
     * @example
     * // Update or create a LiveWinProbSample
     * const liveWinProbSample = await prisma.liveWinProbSample.upsert({
     *   create: {
     *     // ... data to create a LiveWinProbSample
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LiveWinProbSample we want to update
     *   }
     * })
     */
    upsert<T extends LiveWinProbSampleUpsertArgs>(args: SelectSubset<T, LiveWinProbSampleUpsertArgs<ExtArgs>>): Prisma__LiveWinProbSampleClient<$Result.GetResult<Prisma.$LiveWinProbSamplePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of LiveWinProbSamples.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleCountArgs} args - Arguments to filter LiveWinProbSamples to count.
     * @example
     * // Count the number of LiveWinProbSamples
     * const count = await prisma.liveWinProbSample.count({
     *   where: {
     *     // ... the filter for the LiveWinProbSamples we want to count
     *   }
     * })
    **/
    count<T extends LiveWinProbSampleCountArgs>(
      args?: Subset<T, LiveWinProbSampleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LiveWinProbSampleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LiveWinProbSample.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LiveWinProbSampleAggregateArgs>(args: Subset<T, LiveWinProbSampleAggregateArgs>): Prisma.PrismaPromise<GetLiveWinProbSampleAggregateType<T>>

    /**
     * Group by LiveWinProbSample.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveWinProbSampleGroupByArgs} args - Group by arguments.
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
      T extends LiveWinProbSampleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LiveWinProbSampleGroupByArgs['orderBy'] }
        : { orderBy?: LiveWinProbSampleGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LiveWinProbSampleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLiveWinProbSampleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LiveWinProbSample model
   */
  readonly fields: LiveWinProbSampleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LiveWinProbSample.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LiveWinProbSampleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LiveWinProbSample model
   */ 
  interface LiveWinProbSampleFieldRefs {
    readonly id: FieldRef<"LiveWinProbSample", 'String'>
    readonly leagueId: FieldRef<"LiveWinProbSample", 'String'>
    readonly week: FieldRef<"LiveWinProbSample", 'Int'>
    readonly matchupId: FieldRef<"LiveWinProbSample", 'Int'>
    readonly rosterAId: FieldRef<"LiveWinProbSample", 'Int'>
    readonly rosterBId: FieldRef<"LiveWinProbSample", 'Int'>
    readonly timestamp: FieldRef<"LiveWinProbSample", 'DateTime'>
    readonly gameProgress: FieldRef<"LiveWinProbSample", 'Float'>
    readonly winProbA: FieldRef<"LiveWinProbSample", 'Float'>
    readonly winProbB: FieldRef<"LiveWinProbSample", 'Float'>
    readonly projectedFinalA: FieldRef<"LiveWinProbSample", 'Float'>
    readonly projectedFinalB: FieldRef<"LiveWinProbSample", 'Float'>
    readonly currentScoreA: FieldRef<"LiveWinProbSample", 'Float'>
    readonly currentScoreB: FieldRef<"LiveWinProbSample", 'Float'>
    readonly spread: FieldRef<"LiveWinProbSample", 'Float'>
    readonly total: FieldRef<"LiveWinProbSample", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * LiveWinProbSample findUnique
   */
  export type LiveWinProbSampleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * Filter, which LiveWinProbSample to fetch.
     */
    where: LiveWinProbSampleWhereUniqueInput
  }

  /**
   * LiveWinProbSample findUniqueOrThrow
   */
  export type LiveWinProbSampleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * Filter, which LiveWinProbSample to fetch.
     */
    where: LiveWinProbSampleWhereUniqueInput
  }

  /**
   * LiveWinProbSample findFirst
   */
  export type LiveWinProbSampleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * Filter, which LiveWinProbSample to fetch.
     */
    where?: LiveWinProbSampleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveWinProbSamples to fetch.
     */
    orderBy?: LiveWinProbSampleOrderByWithRelationInput | LiveWinProbSampleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiveWinProbSamples.
     */
    cursor?: LiveWinProbSampleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveWinProbSamples from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveWinProbSamples.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiveWinProbSamples.
     */
    distinct?: LiveWinProbSampleScalarFieldEnum | LiveWinProbSampleScalarFieldEnum[]
  }

  /**
   * LiveWinProbSample findFirstOrThrow
   */
  export type LiveWinProbSampleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * Filter, which LiveWinProbSample to fetch.
     */
    where?: LiveWinProbSampleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveWinProbSamples to fetch.
     */
    orderBy?: LiveWinProbSampleOrderByWithRelationInput | LiveWinProbSampleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiveWinProbSamples.
     */
    cursor?: LiveWinProbSampleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveWinProbSamples from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveWinProbSamples.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiveWinProbSamples.
     */
    distinct?: LiveWinProbSampleScalarFieldEnum | LiveWinProbSampleScalarFieldEnum[]
  }

  /**
   * LiveWinProbSample findMany
   */
  export type LiveWinProbSampleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * Filter, which LiveWinProbSamples to fetch.
     */
    where?: LiveWinProbSampleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveWinProbSamples to fetch.
     */
    orderBy?: LiveWinProbSampleOrderByWithRelationInput | LiveWinProbSampleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LiveWinProbSamples.
     */
    cursor?: LiveWinProbSampleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveWinProbSamples from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveWinProbSamples.
     */
    skip?: number
    distinct?: LiveWinProbSampleScalarFieldEnum | LiveWinProbSampleScalarFieldEnum[]
  }

  /**
   * LiveWinProbSample create
   */
  export type LiveWinProbSampleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * The data needed to create a LiveWinProbSample.
     */
    data: XOR<LiveWinProbSampleCreateInput, LiveWinProbSampleUncheckedCreateInput>
  }

  /**
   * LiveWinProbSample createMany
   */
  export type LiveWinProbSampleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LiveWinProbSamples.
     */
    data: LiveWinProbSampleCreateManyInput | LiveWinProbSampleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LiveWinProbSample createManyAndReturn
   */
  export type LiveWinProbSampleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many LiveWinProbSamples.
     */
    data: LiveWinProbSampleCreateManyInput | LiveWinProbSampleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LiveWinProbSample update
   */
  export type LiveWinProbSampleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * The data needed to update a LiveWinProbSample.
     */
    data: XOR<LiveWinProbSampleUpdateInput, LiveWinProbSampleUncheckedUpdateInput>
    /**
     * Choose, which LiveWinProbSample to update.
     */
    where: LiveWinProbSampleWhereUniqueInput
  }

  /**
   * LiveWinProbSample updateMany
   */
  export type LiveWinProbSampleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LiveWinProbSamples.
     */
    data: XOR<LiveWinProbSampleUpdateManyMutationInput, LiveWinProbSampleUncheckedUpdateManyInput>
    /**
     * Filter which LiveWinProbSamples to update
     */
    where?: LiveWinProbSampleWhereInput
  }

  /**
   * LiveWinProbSample upsert
   */
  export type LiveWinProbSampleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * The filter to search for the LiveWinProbSample to update in case it exists.
     */
    where: LiveWinProbSampleWhereUniqueInput
    /**
     * In case the LiveWinProbSample found by the `where` argument doesn't exist, create a new LiveWinProbSample with this data.
     */
    create: XOR<LiveWinProbSampleCreateInput, LiveWinProbSampleUncheckedCreateInput>
    /**
     * In case the LiveWinProbSample was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LiveWinProbSampleUpdateInput, LiveWinProbSampleUncheckedUpdateInput>
  }

  /**
   * LiveWinProbSample delete
   */
  export type LiveWinProbSampleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
    /**
     * Filter which LiveWinProbSample to delete.
     */
    where: LiveWinProbSampleWhereUniqueInput
  }

  /**
   * LiveWinProbSample deleteMany
   */
  export type LiveWinProbSampleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiveWinProbSamples to delete
     */
    where?: LiveWinProbSampleWhereInput
  }

  /**
   * LiveWinProbSample without action
   */
  export type LiveWinProbSampleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveWinProbSample
     */
    select?: LiveWinProbSampleSelect<ExtArgs> | null
  }


  /**
   * Model MatchupOddsHistory
   */

  export type AggregateMatchupOddsHistory = {
    _count: MatchupOddsHistoryCountAggregateOutputType | null
    _avg: MatchupOddsHistoryAvgAggregateOutputType | null
    _sum: MatchupOddsHistorySumAggregateOutputType | null
    _min: MatchupOddsHistoryMinAggregateOutputType | null
    _max: MatchupOddsHistoryMaxAggregateOutputType | null
  }

  export type MatchupOddsHistoryAvgAggregateOutputType = {
    week: number | null
    matchupId: number | null
    team1WinPct: number | null
    team2WinPct: number | null
    spread: number | null
    total: number | null
    team1MoneyLine: number | null
    team2MoneyLine: number | null
    gameProgress: number | null
    computeTimeMs: number | null
    team1Score: number | null
    team2Score: number | null
  }

  export type MatchupOddsHistorySumAggregateOutputType = {
    week: number | null
    matchupId: number | null
    team1WinPct: number | null
    team2WinPct: number | null
    spread: number | null
    total: number | null
    team1MoneyLine: number | null
    team2MoneyLine: number | null
    gameProgress: number | null
    computeTimeMs: number | null
    team1Score: number | null
    team2Score: number | null
  }

  export type MatchupOddsHistoryMinAggregateOutputType = {
    id: string | null
    leagueId: string | null
    week: number | null
    matchupId: number | null
    team1WinPct: number | null
    team2WinPct: number | null
    spread: number | null
    total: number | null
    team1MoneyLine: number | null
    team2MoneyLine: number | null
    gameProgress: number | null
    isLive: boolean | null
    triggeredBy: string | null
    computeTimeMs: number | null
    createdAt: Date | null
    team1Score: number | null
    team2Score: number | null
  }

  export type MatchupOddsHistoryMaxAggregateOutputType = {
    id: string | null
    leagueId: string | null
    week: number | null
    matchupId: number | null
    team1WinPct: number | null
    team2WinPct: number | null
    spread: number | null
    total: number | null
    team1MoneyLine: number | null
    team2MoneyLine: number | null
    gameProgress: number | null
    isLive: boolean | null
    triggeredBy: string | null
    computeTimeMs: number | null
    createdAt: Date | null
    team1Score: number | null
    team2Score: number | null
  }

  export type MatchupOddsHistoryCountAggregateOutputType = {
    id: number
    leagueId: number
    week: number
    matchupId: number
    team1WinPct: number
    team2WinPct: number
    spread: number
    total: number
    team1MoneyLine: number
    team2MoneyLine: number
    gameProgress: number
    isLive: number
    triggeredBy: number
    computeTimeMs: number
    createdAt: number
    team1Score: number
    team2Score: number
    _all: number
  }


  export type MatchupOddsHistoryAvgAggregateInputType = {
    week?: true
    matchupId?: true
    team1WinPct?: true
    team2WinPct?: true
    spread?: true
    total?: true
    team1MoneyLine?: true
    team2MoneyLine?: true
    gameProgress?: true
    computeTimeMs?: true
    team1Score?: true
    team2Score?: true
  }

  export type MatchupOddsHistorySumAggregateInputType = {
    week?: true
    matchupId?: true
    team1WinPct?: true
    team2WinPct?: true
    spread?: true
    total?: true
    team1MoneyLine?: true
    team2MoneyLine?: true
    gameProgress?: true
    computeTimeMs?: true
    team1Score?: true
    team2Score?: true
  }

  export type MatchupOddsHistoryMinAggregateInputType = {
    id?: true
    leagueId?: true
    week?: true
    matchupId?: true
    team1WinPct?: true
    team2WinPct?: true
    spread?: true
    total?: true
    team1MoneyLine?: true
    team2MoneyLine?: true
    gameProgress?: true
    isLive?: true
    triggeredBy?: true
    computeTimeMs?: true
    createdAt?: true
    team1Score?: true
    team2Score?: true
  }

  export type MatchupOddsHistoryMaxAggregateInputType = {
    id?: true
    leagueId?: true
    week?: true
    matchupId?: true
    team1WinPct?: true
    team2WinPct?: true
    spread?: true
    total?: true
    team1MoneyLine?: true
    team2MoneyLine?: true
    gameProgress?: true
    isLive?: true
    triggeredBy?: true
    computeTimeMs?: true
    createdAt?: true
    team1Score?: true
    team2Score?: true
  }

  export type MatchupOddsHistoryCountAggregateInputType = {
    id?: true
    leagueId?: true
    week?: true
    matchupId?: true
    team1WinPct?: true
    team2WinPct?: true
    spread?: true
    total?: true
    team1MoneyLine?: true
    team2MoneyLine?: true
    gameProgress?: true
    isLive?: true
    triggeredBy?: true
    computeTimeMs?: true
    createdAt?: true
    team1Score?: true
    team2Score?: true
    _all?: true
  }

  export type MatchupOddsHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MatchupOddsHistory to aggregate.
     */
    where?: MatchupOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchupOddsHistories to fetch.
     */
    orderBy?: MatchupOddsHistoryOrderByWithRelationInput | MatchupOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MatchupOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchupOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchupOddsHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MatchupOddsHistories
    **/
    _count?: true | MatchupOddsHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MatchupOddsHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MatchupOddsHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MatchupOddsHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MatchupOddsHistoryMaxAggregateInputType
  }

  export type GetMatchupOddsHistoryAggregateType<T extends MatchupOddsHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateMatchupOddsHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMatchupOddsHistory[P]>
      : GetScalarType<T[P], AggregateMatchupOddsHistory[P]>
  }




  export type MatchupOddsHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatchupOddsHistoryWhereInput
    orderBy?: MatchupOddsHistoryOrderByWithAggregationInput | MatchupOddsHistoryOrderByWithAggregationInput[]
    by: MatchupOddsHistoryScalarFieldEnum[] | MatchupOddsHistoryScalarFieldEnum
    having?: MatchupOddsHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MatchupOddsHistoryCountAggregateInputType | true
    _avg?: MatchupOddsHistoryAvgAggregateInputType
    _sum?: MatchupOddsHistorySumAggregateInputType
    _min?: MatchupOddsHistoryMinAggregateInputType
    _max?: MatchupOddsHistoryMaxAggregateInputType
  }

  export type MatchupOddsHistoryGroupByOutputType = {
    id: string
    leagueId: string
    week: number
    matchupId: number
    team1WinPct: number
    team2WinPct: number
    spread: number
    total: number
    team1MoneyLine: number
    team2MoneyLine: number
    gameProgress: number
    isLive: boolean
    triggeredBy: string
    computeTimeMs: number | null
    createdAt: Date
    team1Score: number | null
    team2Score: number | null
    _count: MatchupOddsHistoryCountAggregateOutputType | null
    _avg: MatchupOddsHistoryAvgAggregateOutputType | null
    _sum: MatchupOddsHistorySumAggregateOutputType | null
    _min: MatchupOddsHistoryMinAggregateOutputType | null
    _max: MatchupOddsHistoryMaxAggregateOutputType | null
  }

  type GetMatchupOddsHistoryGroupByPayload<T extends MatchupOddsHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MatchupOddsHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MatchupOddsHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MatchupOddsHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], MatchupOddsHistoryGroupByOutputType[P]>
        }
      >
    >


  export type MatchupOddsHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leagueId?: boolean
    week?: boolean
    matchupId?: boolean
    team1WinPct?: boolean
    team2WinPct?: boolean
    spread?: boolean
    total?: boolean
    team1MoneyLine?: boolean
    team2MoneyLine?: boolean
    gameProgress?: boolean
    isLive?: boolean
    triggeredBy?: boolean
    computeTimeMs?: boolean
    createdAt?: boolean
    team1Score?: boolean
    team2Score?: boolean
  }, ExtArgs["result"]["matchupOddsHistory"]>

  export type MatchupOddsHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leagueId?: boolean
    week?: boolean
    matchupId?: boolean
    team1WinPct?: boolean
    team2WinPct?: boolean
    spread?: boolean
    total?: boolean
    team1MoneyLine?: boolean
    team2MoneyLine?: boolean
    gameProgress?: boolean
    isLive?: boolean
    triggeredBy?: boolean
    computeTimeMs?: boolean
    createdAt?: boolean
    team1Score?: boolean
    team2Score?: boolean
  }, ExtArgs["result"]["matchupOddsHistory"]>

  export type MatchupOddsHistorySelectScalar = {
    id?: boolean
    leagueId?: boolean
    week?: boolean
    matchupId?: boolean
    team1WinPct?: boolean
    team2WinPct?: boolean
    spread?: boolean
    total?: boolean
    team1MoneyLine?: boolean
    team2MoneyLine?: boolean
    gameProgress?: boolean
    isLive?: boolean
    triggeredBy?: boolean
    computeTimeMs?: boolean
    createdAt?: boolean
    team1Score?: boolean
    team2Score?: boolean
  }


  export type $MatchupOddsHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MatchupOddsHistory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      leagueId: string
      week: number
      matchupId: number
      team1WinPct: number
      team2WinPct: number
      spread: number
      total: number
      team1MoneyLine: number
      team2MoneyLine: number
      gameProgress: number
      isLive: boolean
      triggeredBy: string
      computeTimeMs: number | null
      createdAt: Date
      team1Score: number | null
      team2Score: number | null
    }, ExtArgs["result"]["matchupOddsHistory"]>
    composites: {}
  }

  type MatchupOddsHistoryGetPayload<S extends boolean | null | undefined | MatchupOddsHistoryDefaultArgs> = $Result.GetResult<Prisma.$MatchupOddsHistoryPayload, S>

  type MatchupOddsHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MatchupOddsHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MatchupOddsHistoryCountAggregateInputType | true
    }

  export interface MatchupOddsHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MatchupOddsHistory'], meta: { name: 'MatchupOddsHistory' } }
    /**
     * Find zero or one MatchupOddsHistory that matches the filter.
     * @param {MatchupOddsHistoryFindUniqueArgs} args - Arguments to find a MatchupOddsHistory
     * @example
     * // Get one MatchupOddsHistory
     * const matchupOddsHistory = await prisma.matchupOddsHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatchupOddsHistoryFindUniqueArgs>(args: SelectSubset<T, MatchupOddsHistoryFindUniqueArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MatchupOddsHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MatchupOddsHistoryFindUniqueOrThrowArgs} args - Arguments to find a MatchupOddsHistory
     * @example
     * // Get one MatchupOddsHistory
     * const matchupOddsHistory = await prisma.matchupOddsHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatchupOddsHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, MatchupOddsHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MatchupOddsHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryFindFirstArgs} args - Arguments to find a MatchupOddsHistory
     * @example
     * // Get one MatchupOddsHistory
     * const matchupOddsHistory = await prisma.matchupOddsHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatchupOddsHistoryFindFirstArgs>(args?: SelectSubset<T, MatchupOddsHistoryFindFirstArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MatchupOddsHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryFindFirstOrThrowArgs} args - Arguments to find a MatchupOddsHistory
     * @example
     * // Get one MatchupOddsHistory
     * const matchupOddsHistory = await prisma.matchupOddsHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatchupOddsHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, MatchupOddsHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MatchupOddsHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MatchupOddsHistories
     * const matchupOddsHistories = await prisma.matchupOddsHistory.findMany()
     * 
     * // Get first 10 MatchupOddsHistories
     * const matchupOddsHistories = await prisma.matchupOddsHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const matchupOddsHistoryWithIdOnly = await prisma.matchupOddsHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MatchupOddsHistoryFindManyArgs>(args?: SelectSubset<T, MatchupOddsHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MatchupOddsHistory.
     * @param {MatchupOddsHistoryCreateArgs} args - Arguments to create a MatchupOddsHistory.
     * @example
     * // Create one MatchupOddsHistory
     * const MatchupOddsHistory = await prisma.matchupOddsHistory.create({
     *   data: {
     *     // ... data to create a MatchupOddsHistory
     *   }
     * })
     * 
     */
    create<T extends MatchupOddsHistoryCreateArgs>(args: SelectSubset<T, MatchupOddsHistoryCreateArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MatchupOddsHistories.
     * @param {MatchupOddsHistoryCreateManyArgs} args - Arguments to create many MatchupOddsHistories.
     * @example
     * // Create many MatchupOddsHistories
     * const matchupOddsHistory = await prisma.matchupOddsHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MatchupOddsHistoryCreateManyArgs>(args?: SelectSubset<T, MatchupOddsHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MatchupOddsHistories and returns the data saved in the database.
     * @param {MatchupOddsHistoryCreateManyAndReturnArgs} args - Arguments to create many MatchupOddsHistories.
     * @example
     * // Create many MatchupOddsHistories
     * const matchupOddsHistory = await prisma.matchupOddsHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MatchupOddsHistories and only return the `id`
     * const matchupOddsHistoryWithIdOnly = await prisma.matchupOddsHistory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MatchupOddsHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, MatchupOddsHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MatchupOddsHistory.
     * @param {MatchupOddsHistoryDeleteArgs} args - Arguments to delete one MatchupOddsHistory.
     * @example
     * // Delete one MatchupOddsHistory
     * const MatchupOddsHistory = await prisma.matchupOddsHistory.delete({
     *   where: {
     *     // ... filter to delete one MatchupOddsHistory
     *   }
     * })
     * 
     */
    delete<T extends MatchupOddsHistoryDeleteArgs>(args: SelectSubset<T, MatchupOddsHistoryDeleteArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MatchupOddsHistory.
     * @param {MatchupOddsHistoryUpdateArgs} args - Arguments to update one MatchupOddsHistory.
     * @example
     * // Update one MatchupOddsHistory
     * const matchupOddsHistory = await prisma.matchupOddsHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MatchupOddsHistoryUpdateArgs>(args: SelectSubset<T, MatchupOddsHistoryUpdateArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MatchupOddsHistories.
     * @param {MatchupOddsHistoryDeleteManyArgs} args - Arguments to filter MatchupOddsHistories to delete.
     * @example
     * // Delete a few MatchupOddsHistories
     * const { count } = await prisma.matchupOddsHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MatchupOddsHistoryDeleteManyArgs>(args?: SelectSubset<T, MatchupOddsHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MatchupOddsHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MatchupOddsHistories
     * const matchupOddsHistory = await prisma.matchupOddsHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MatchupOddsHistoryUpdateManyArgs>(args: SelectSubset<T, MatchupOddsHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MatchupOddsHistory.
     * @param {MatchupOddsHistoryUpsertArgs} args - Arguments to update or create a MatchupOddsHistory.
     * @example
     * // Update or create a MatchupOddsHistory
     * const matchupOddsHistory = await prisma.matchupOddsHistory.upsert({
     *   create: {
     *     // ... data to create a MatchupOddsHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MatchupOddsHistory we want to update
     *   }
     * })
     */
    upsert<T extends MatchupOddsHistoryUpsertArgs>(args: SelectSubset<T, MatchupOddsHistoryUpsertArgs<ExtArgs>>): Prisma__MatchupOddsHistoryClient<$Result.GetResult<Prisma.$MatchupOddsHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MatchupOddsHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryCountArgs} args - Arguments to filter MatchupOddsHistories to count.
     * @example
     * // Count the number of MatchupOddsHistories
     * const count = await prisma.matchupOddsHistory.count({
     *   where: {
     *     // ... the filter for the MatchupOddsHistories we want to count
     *   }
     * })
    **/
    count<T extends MatchupOddsHistoryCountArgs>(
      args?: Subset<T, MatchupOddsHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MatchupOddsHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MatchupOddsHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MatchupOddsHistoryAggregateArgs>(args: Subset<T, MatchupOddsHistoryAggregateArgs>): Prisma.PrismaPromise<GetMatchupOddsHistoryAggregateType<T>>

    /**
     * Group by MatchupOddsHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatchupOddsHistoryGroupByArgs} args - Group by arguments.
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
      T extends MatchupOddsHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MatchupOddsHistoryGroupByArgs['orderBy'] }
        : { orderBy?: MatchupOddsHistoryGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MatchupOddsHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatchupOddsHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MatchupOddsHistory model
   */
  readonly fields: MatchupOddsHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MatchupOddsHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MatchupOddsHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MatchupOddsHistory model
   */ 
  interface MatchupOddsHistoryFieldRefs {
    readonly id: FieldRef<"MatchupOddsHistory", 'String'>
    readonly leagueId: FieldRef<"MatchupOddsHistory", 'String'>
    readonly week: FieldRef<"MatchupOddsHistory", 'Int'>
    readonly matchupId: FieldRef<"MatchupOddsHistory", 'Int'>
    readonly team1WinPct: FieldRef<"MatchupOddsHistory", 'Float'>
    readonly team2WinPct: FieldRef<"MatchupOddsHistory", 'Float'>
    readonly spread: FieldRef<"MatchupOddsHistory", 'Float'>
    readonly total: FieldRef<"MatchupOddsHistory", 'Float'>
    readonly team1MoneyLine: FieldRef<"MatchupOddsHistory", 'Int'>
    readonly team2MoneyLine: FieldRef<"MatchupOddsHistory", 'Int'>
    readonly gameProgress: FieldRef<"MatchupOddsHistory", 'Float'>
    readonly isLive: FieldRef<"MatchupOddsHistory", 'Boolean'>
    readonly triggeredBy: FieldRef<"MatchupOddsHistory", 'String'>
    readonly computeTimeMs: FieldRef<"MatchupOddsHistory", 'Int'>
    readonly createdAt: FieldRef<"MatchupOddsHistory", 'DateTime'>
    readonly team1Score: FieldRef<"MatchupOddsHistory", 'Float'>
    readonly team2Score: FieldRef<"MatchupOddsHistory", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * MatchupOddsHistory findUnique
   */
  export type MatchupOddsHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which MatchupOddsHistory to fetch.
     */
    where: MatchupOddsHistoryWhereUniqueInput
  }

  /**
   * MatchupOddsHistory findUniqueOrThrow
   */
  export type MatchupOddsHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which MatchupOddsHistory to fetch.
     */
    where: MatchupOddsHistoryWhereUniqueInput
  }

  /**
   * MatchupOddsHistory findFirst
   */
  export type MatchupOddsHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which MatchupOddsHistory to fetch.
     */
    where?: MatchupOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchupOddsHistories to fetch.
     */
    orderBy?: MatchupOddsHistoryOrderByWithRelationInput | MatchupOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MatchupOddsHistories.
     */
    cursor?: MatchupOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchupOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchupOddsHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MatchupOddsHistories.
     */
    distinct?: MatchupOddsHistoryScalarFieldEnum | MatchupOddsHistoryScalarFieldEnum[]
  }

  /**
   * MatchupOddsHistory findFirstOrThrow
   */
  export type MatchupOddsHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which MatchupOddsHistory to fetch.
     */
    where?: MatchupOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchupOddsHistories to fetch.
     */
    orderBy?: MatchupOddsHistoryOrderByWithRelationInput | MatchupOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MatchupOddsHistories.
     */
    cursor?: MatchupOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchupOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchupOddsHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MatchupOddsHistories.
     */
    distinct?: MatchupOddsHistoryScalarFieldEnum | MatchupOddsHistoryScalarFieldEnum[]
  }

  /**
   * MatchupOddsHistory findMany
   */
  export type MatchupOddsHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which MatchupOddsHistories to fetch.
     */
    where?: MatchupOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MatchupOddsHistories to fetch.
     */
    orderBy?: MatchupOddsHistoryOrderByWithRelationInput | MatchupOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MatchupOddsHistories.
     */
    cursor?: MatchupOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MatchupOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MatchupOddsHistories.
     */
    skip?: number
    distinct?: MatchupOddsHistoryScalarFieldEnum | MatchupOddsHistoryScalarFieldEnum[]
  }

  /**
   * MatchupOddsHistory create
   */
  export type MatchupOddsHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * The data needed to create a MatchupOddsHistory.
     */
    data: XOR<MatchupOddsHistoryCreateInput, MatchupOddsHistoryUncheckedCreateInput>
  }

  /**
   * MatchupOddsHistory createMany
   */
  export type MatchupOddsHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MatchupOddsHistories.
     */
    data: MatchupOddsHistoryCreateManyInput | MatchupOddsHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MatchupOddsHistory createManyAndReturn
   */
  export type MatchupOddsHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MatchupOddsHistories.
     */
    data: MatchupOddsHistoryCreateManyInput | MatchupOddsHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MatchupOddsHistory update
   */
  export type MatchupOddsHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * The data needed to update a MatchupOddsHistory.
     */
    data: XOR<MatchupOddsHistoryUpdateInput, MatchupOddsHistoryUncheckedUpdateInput>
    /**
     * Choose, which MatchupOddsHistory to update.
     */
    where: MatchupOddsHistoryWhereUniqueInput
  }

  /**
   * MatchupOddsHistory updateMany
   */
  export type MatchupOddsHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MatchupOddsHistories.
     */
    data: XOR<MatchupOddsHistoryUpdateManyMutationInput, MatchupOddsHistoryUncheckedUpdateManyInput>
    /**
     * Filter which MatchupOddsHistories to update
     */
    where?: MatchupOddsHistoryWhereInput
  }

  /**
   * MatchupOddsHistory upsert
   */
  export type MatchupOddsHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * The filter to search for the MatchupOddsHistory to update in case it exists.
     */
    where: MatchupOddsHistoryWhereUniqueInput
    /**
     * In case the MatchupOddsHistory found by the `where` argument doesn't exist, create a new MatchupOddsHistory with this data.
     */
    create: XOR<MatchupOddsHistoryCreateInput, MatchupOddsHistoryUncheckedCreateInput>
    /**
     * In case the MatchupOddsHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MatchupOddsHistoryUpdateInput, MatchupOddsHistoryUncheckedUpdateInput>
  }

  /**
   * MatchupOddsHistory delete
   */
  export type MatchupOddsHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
    /**
     * Filter which MatchupOddsHistory to delete.
     */
    where: MatchupOddsHistoryWhereUniqueInput
  }

  /**
   * MatchupOddsHistory deleteMany
   */
  export type MatchupOddsHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MatchupOddsHistories to delete
     */
    where?: MatchupOddsHistoryWhereInput
  }

  /**
   * MatchupOddsHistory without action
   */
  export type MatchupOddsHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatchupOddsHistory
     */
    select?: MatchupOddsHistorySelect<ExtArgs> | null
  }


  /**
   * Model LeagueOddsHistory
   */

  export type AggregateLeagueOddsHistory = {
    _count: LeagueOddsHistoryCountAggregateOutputType | null
    _avg: LeagueOddsHistoryAvgAggregateOutputType | null
    _sum: LeagueOddsHistorySumAggregateOutputType | null
    _min: LeagueOddsHistoryMinAggregateOutputType | null
    _max: LeagueOddsHistoryMaxAggregateOutputType | null
  }

  export type LeagueOddsHistoryAvgAggregateOutputType = {
    week: number | null
    computeTimeMs: number | null
  }

  export type LeagueOddsHistorySumAggregateOutputType = {
    week: number | null
    computeTimeMs: number | null
  }

  export type LeagueOddsHistoryMinAggregateOutputType = {
    id: string | null
    week: number | null
    isLive: boolean | null
    triggeredBy: string | null
    computeTimeMs: number | null
    createdAt: Date | null
  }

  export type LeagueOddsHistoryMaxAggregateOutputType = {
    id: string | null
    week: number | null
    isLive: boolean | null
    triggeredBy: string | null
    computeTimeMs: number | null
    createdAt: Date | null
  }

  export type LeagueOddsHistoryCountAggregateOutputType = {
    id: number
    week: number
    highestScorerOdds: number
    lowestScorerOdds: number
    closestMatchup: number
    biggestBlowout: number
    highestScoringMatchup: number
    lowestScoringMatchup: number
    isLive: number
    triggeredBy: number
    computeTimeMs: number
    createdAt: number
    _all: number
  }


  export type LeagueOddsHistoryAvgAggregateInputType = {
    week?: true
    computeTimeMs?: true
  }

  export type LeagueOddsHistorySumAggregateInputType = {
    week?: true
    computeTimeMs?: true
  }

  export type LeagueOddsHistoryMinAggregateInputType = {
    id?: true
    week?: true
    isLive?: true
    triggeredBy?: true
    computeTimeMs?: true
    createdAt?: true
  }

  export type LeagueOddsHistoryMaxAggregateInputType = {
    id?: true
    week?: true
    isLive?: true
    triggeredBy?: true
    computeTimeMs?: true
    createdAt?: true
  }

  export type LeagueOddsHistoryCountAggregateInputType = {
    id?: true
    week?: true
    highestScorerOdds?: true
    lowestScorerOdds?: true
    closestMatchup?: true
    biggestBlowout?: true
    highestScoringMatchup?: true
    lowestScoringMatchup?: true
    isLive?: true
    triggeredBy?: true
    computeTimeMs?: true
    createdAt?: true
    _all?: true
  }

  export type LeagueOddsHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeagueOddsHistory to aggregate.
     */
    where?: LeagueOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeagueOddsHistories to fetch.
     */
    orderBy?: LeagueOddsHistoryOrderByWithRelationInput | LeagueOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeagueOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeagueOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeagueOddsHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LeagueOddsHistories
    **/
    _count?: true | LeagueOddsHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeagueOddsHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeagueOddsHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeagueOddsHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeagueOddsHistoryMaxAggregateInputType
  }

  export type GetLeagueOddsHistoryAggregateType<T extends LeagueOddsHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateLeagueOddsHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeagueOddsHistory[P]>
      : GetScalarType<T[P], AggregateLeagueOddsHistory[P]>
  }




  export type LeagueOddsHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeagueOddsHistoryWhereInput
    orderBy?: LeagueOddsHistoryOrderByWithAggregationInput | LeagueOddsHistoryOrderByWithAggregationInput[]
    by: LeagueOddsHistoryScalarFieldEnum[] | LeagueOddsHistoryScalarFieldEnum
    having?: LeagueOddsHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeagueOddsHistoryCountAggregateInputType | true
    _avg?: LeagueOddsHistoryAvgAggregateInputType
    _sum?: LeagueOddsHistorySumAggregateInputType
    _min?: LeagueOddsHistoryMinAggregateInputType
    _max?: LeagueOddsHistoryMaxAggregateInputType
  }

  export type LeagueOddsHistoryGroupByOutputType = {
    id: string
    week: number
    highestScorerOdds: JsonValue
    lowestScorerOdds: JsonValue
    closestMatchup: JsonValue
    biggestBlowout: JsonValue
    highestScoringMatchup: JsonValue
    lowestScoringMatchup: JsonValue
    isLive: boolean
    triggeredBy: string
    computeTimeMs: number | null
    createdAt: Date
    _count: LeagueOddsHistoryCountAggregateOutputType | null
    _avg: LeagueOddsHistoryAvgAggregateOutputType | null
    _sum: LeagueOddsHistorySumAggregateOutputType | null
    _min: LeagueOddsHistoryMinAggregateOutputType | null
    _max: LeagueOddsHistoryMaxAggregateOutputType | null
  }

  type GetLeagueOddsHistoryGroupByPayload<T extends LeagueOddsHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeagueOddsHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeagueOddsHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeagueOddsHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], LeagueOddsHistoryGroupByOutputType[P]>
        }
      >
    >


  export type LeagueOddsHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    week?: boolean
    highestScorerOdds?: boolean
    lowestScorerOdds?: boolean
    closestMatchup?: boolean
    biggestBlowout?: boolean
    highestScoringMatchup?: boolean
    lowestScoringMatchup?: boolean
    isLive?: boolean
    triggeredBy?: boolean
    computeTimeMs?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["leagueOddsHistory"]>

  export type LeagueOddsHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    week?: boolean
    highestScorerOdds?: boolean
    lowestScorerOdds?: boolean
    closestMatchup?: boolean
    biggestBlowout?: boolean
    highestScoringMatchup?: boolean
    lowestScoringMatchup?: boolean
    isLive?: boolean
    triggeredBy?: boolean
    computeTimeMs?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["leagueOddsHistory"]>

  export type LeagueOddsHistorySelectScalar = {
    id?: boolean
    week?: boolean
    highestScorerOdds?: boolean
    lowestScorerOdds?: boolean
    closestMatchup?: boolean
    biggestBlowout?: boolean
    highestScoringMatchup?: boolean
    lowestScoringMatchup?: boolean
    isLive?: boolean
    triggeredBy?: boolean
    computeTimeMs?: boolean
    createdAt?: boolean
  }


  export type $LeagueOddsHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LeagueOddsHistory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      week: number
      highestScorerOdds: Prisma.JsonValue
      lowestScorerOdds: Prisma.JsonValue
      closestMatchup: Prisma.JsonValue
      biggestBlowout: Prisma.JsonValue
      highestScoringMatchup: Prisma.JsonValue
      lowestScoringMatchup: Prisma.JsonValue
      isLive: boolean
      triggeredBy: string
      computeTimeMs: number | null
      createdAt: Date
    }, ExtArgs["result"]["leagueOddsHistory"]>
    composites: {}
  }

  type LeagueOddsHistoryGetPayload<S extends boolean | null | undefined | LeagueOddsHistoryDefaultArgs> = $Result.GetResult<Prisma.$LeagueOddsHistoryPayload, S>

  type LeagueOddsHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LeagueOddsHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LeagueOddsHistoryCountAggregateInputType | true
    }

  export interface LeagueOddsHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LeagueOddsHistory'], meta: { name: 'LeagueOddsHistory' } }
    /**
     * Find zero or one LeagueOddsHistory that matches the filter.
     * @param {LeagueOddsHistoryFindUniqueArgs} args - Arguments to find a LeagueOddsHistory
     * @example
     * // Get one LeagueOddsHistory
     * const leagueOddsHistory = await prisma.leagueOddsHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeagueOddsHistoryFindUniqueArgs>(args: SelectSubset<T, LeagueOddsHistoryFindUniqueArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LeagueOddsHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LeagueOddsHistoryFindUniqueOrThrowArgs} args - Arguments to find a LeagueOddsHistory
     * @example
     * // Get one LeagueOddsHistory
     * const leagueOddsHistory = await prisma.leagueOddsHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeagueOddsHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, LeagueOddsHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LeagueOddsHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryFindFirstArgs} args - Arguments to find a LeagueOddsHistory
     * @example
     * // Get one LeagueOddsHistory
     * const leagueOddsHistory = await prisma.leagueOddsHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeagueOddsHistoryFindFirstArgs>(args?: SelectSubset<T, LeagueOddsHistoryFindFirstArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LeagueOddsHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryFindFirstOrThrowArgs} args - Arguments to find a LeagueOddsHistory
     * @example
     * // Get one LeagueOddsHistory
     * const leagueOddsHistory = await prisma.leagueOddsHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeagueOddsHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, LeagueOddsHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LeagueOddsHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LeagueOddsHistories
     * const leagueOddsHistories = await prisma.leagueOddsHistory.findMany()
     * 
     * // Get first 10 LeagueOddsHistories
     * const leagueOddsHistories = await prisma.leagueOddsHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leagueOddsHistoryWithIdOnly = await prisma.leagueOddsHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeagueOddsHistoryFindManyArgs>(args?: SelectSubset<T, LeagueOddsHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LeagueOddsHistory.
     * @param {LeagueOddsHistoryCreateArgs} args - Arguments to create a LeagueOddsHistory.
     * @example
     * // Create one LeagueOddsHistory
     * const LeagueOddsHistory = await prisma.leagueOddsHistory.create({
     *   data: {
     *     // ... data to create a LeagueOddsHistory
     *   }
     * })
     * 
     */
    create<T extends LeagueOddsHistoryCreateArgs>(args: SelectSubset<T, LeagueOddsHistoryCreateArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LeagueOddsHistories.
     * @param {LeagueOddsHistoryCreateManyArgs} args - Arguments to create many LeagueOddsHistories.
     * @example
     * // Create many LeagueOddsHistories
     * const leagueOddsHistory = await prisma.leagueOddsHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeagueOddsHistoryCreateManyArgs>(args?: SelectSubset<T, LeagueOddsHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LeagueOddsHistories and returns the data saved in the database.
     * @param {LeagueOddsHistoryCreateManyAndReturnArgs} args - Arguments to create many LeagueOddsHistories.
     * @example
     * // Create many LeagueOddsHistories
     * const leagueOddsHistory = await prisma.leagueOddsHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LeagueOddsHistories and only return the `id`
     * const leagueOddsHistoryWithIdOnly = await prisma.leagueOddsHistory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeagueOddsHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, LeagueOddsHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a LeagueOddsHistory.
     * @param {LeagueOddsHistoryDeleteArgs} args - Arguments to delete one LeagueOddsHistory.
     * @example
     * // Delete one LeagueOddsHistory
     * const LeagueOddsHistory = await prisma.leagueOddsHistory.delete({
     *   where: {
     *     // ... filter to delete one LeagueOddsHistory
     *   }
     * })
     * 
     */
    delete<T extends LeagueOddsHistoryDeleteArgs>(args: SelectSubset<T, LeagueOddsHistoryDeleteArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LeagueOddsHistory.
     * @param {LeagueOddsHistoryUpdateArgs} args - Arguments to update one LeagueOddsHistory.
     * @example
     * // Update one LeagueOddsHistory
     * const leagueOddsHistory = await prisma.leagueOddsHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeagueOddsHistoryUpdateArgs>(args: SelectSubset<T, LeagueOddsHistoryUpdateArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LeagueOddsHistories.
     * @param {LeagueOddsHistoryDeleteManyArgs} args - Arguments to filter LeagueOddsHistories to delete.
     * @example
     * // Delete a few LeagueOddsHistories
     * const { count } = await prisma.leagueOddsHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeagueOddsHistoryDeleteManyArgs>(args?: SelectSubset<T, LeagueOddsHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LeagueOddsHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LeagueOddsHistories
     * const leagueOddsHistory = await prisma.leagueOddsHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeagueOddsHistoryUpdateManyArgs>(args: SelectSubset<T, LeagueOddsHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LeagueOddsHistory.
     * @param {LeagueOddsHistoryUpsertArgs} args - Arguments to update or create a LeagueOddsHistory.
     * @example
     * // Update or create a LeagueOddsHistory
     * const leagueOddsHistory = await prisma.leagueOddsHistory.upsert({
     *   create: {
     *     // ... data to create a LeagueOddsHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LeagueOddsHistory we want to update
     *   }
     * })
     */
    upsert<T extends LeagueOddsHistoryUpsertArgs>(args: SelectSubset<T, LeagueOddsHistoryUpsertArgs<ExtArgs>>): Prisma__LeagueOddsHistoryClient<$Result.GetResult<Prisma.$LeagueOddsHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of LeagueOddsHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryCountArgs} args - Arguments to filter LeagueOddsHistories to count.
     * @example
     * // Count the number of LeagueOddsHistories
     * const count = await prisma.leagueOddsHistory.count({
     *   where: {
     *     // ... the filter for the LeagueOddsHistories we want to count
     *   }
     * })
    **/
    count<T extends LeagueOddsHistoryCountArgs>(
      args?: Subset<T, LeagueOddsHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeagueOddsHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LeagueOddsHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LeagueOddsHistoryAggregateArgs>(args: Subset<T, LeagueOddsHistoryAggregateArgs>): Prisma.PrismaPromise<GetLeagueOddsHistoryAggregateType<T>>

    /**
     * Group by LeagueOddsHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeagueOddsHistoryGroupByArgs} args - Group by arguments.
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
      T extends LeagueOddsHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeagueOddsHistoryGroupByArgs['orderBy'] }
        : { orderBy?: LeagueOddsHistoryGroupByArgs['orderBy'] },
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
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeagueOddsHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeagueOddsHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LeagueOddsHistory model
   */
  readonly fields: LeagueOddsHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LeagueOddsHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeagueOddsHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LeagueOddsHistory model
   */ 
  interface LeagueOddsHistoryFieldRefs {
    readonly id: FieldRef<"LeagueOddsHistory", 'String'>
    readonly week: FieldRef<"LeagueOddsHistory", 'Int'>
    readonly highestScorerOdds: FieldRef<"LeagueOddsHistory", 'Json'>
    readonly lowestScorerOdds: FieldRef<"LeagueOddsHistory", 'Json'>
    readonly closestMatchup: FieldRef<"LeagueOddsHistory", 'Json'>
    readonly biggestBlowout: FieldRef<"LeagueOddsHistory", 'Json'>
    readonly highestScoringMatchup: FieldRef<"LeagueOddsHistory", 'Json'>
    readonly lowestScoringMatchup: FieldRef<"LeagueOddsHistory", 'Json'>
    readonly isLive: FieldRef<"LeagueOddsHistory", 'Boolean'>
    readonly triggeredBy: FieldRef<"LeagueOddsHistory", 'String'>
    readonly computeTimeMs: FieldRef<"LeagueOddsHistory", 'Int'>
    readonly createdAt: FieldRef<"LeagueOddsHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LeagueOddsHistory findUnique
   */
  export type LeagueOddsHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which LeagueOddsHistory to fetch.
     */
    where: LeagueOddsHistoryWhereUniqueInput
  }

  /**
   * LeagueOddsHistory findUniqueOrThrow
   */
  export type LeagueOddsHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which LeagueOddsHistory to fetch.
     */
    where: LeagueOddsHistoryWhereUniqueInput
  }

  /**
   * LeagueOddsHistory findFirst
   */
  export type LeagueOddsHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which LeagueOddsHistory to fetch.
     */
    where?: LeagueOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeagueOddsHistories to fetch.
     */
    orderBy?: LeagueOddsHistoryOrderByWithRelationInput | LeagueOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeagueOddsHistories.
     */
    cursor?: LeagueOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeagueOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeagueOddsHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeagueOddsHistories.
     */
    distinct?: LeagueOddsHistoryScalarFieldEnum | LeagueOddsHistoryScalarFieldEnum[]
  }

  /**
   * LeagueOddsHistory findFirstOrThrow
   */
  export type LeagueOddsHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which LeagueOddsHistory to fetch.
     */
    where?: LeagueOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeagueOddsHistories to fetch.
     */
    orderBy?: LeagueOddsHistoryOrderByWithRelationInput | LeagueOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeagueOddsHistories.
     */
    cursor?: LeagueOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeagueOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeagueOddsHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeagueOddsHistories.
     */
    distinct?: LeagueOddsHistoryScalarFieldEnum | LeagueOddsHistoryScalarFieldEnum[]
  }

  /**
   * LeagueOddsHistory findMany
   */
  export type LeagueOddsHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * Filter, which LeagueOddsHistories to fetch.
     */
    where?: LeagueOddsHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeagueOddsHistories to fetch.
     */
    orderBy?: LeagueOddsHistoryOrderByWithRelationInput | LeagueOddsHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LeagueOddsHistories.
     */
    cursor?: LeagueOddsHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeagueOddsHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeagueOddsHistories.
     */
    skip?: number
    distinct?: LeagueOddsHistoryScalarFieldEnum | LeagueOddsHistoryScalarFieldEnum[]
  }

  /**
   * LeagueOddsHistory create
   */
  export type LeagueOddsHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * The data needed to create a LeagueOddsHistory.
     */
    data: XOR<LeagueOddsHistoryCreateInput, LeagueOddsHistoryUncheckedCreateInput>
  }

  /**
   * LeagueOddsHistory createMany
   */
  export type LeagueOddsHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LeagueOddsHistories.
     */
    data: LeagueOddsHistoryCreateManyInput | LeagueOddsHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeagueOddsHistory createManyAndReturn
   */
  export type LeagueOddsHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many LeagueOddsHistories.
     */
    data: LeagueOddsHistoryCreateManyInput | LeagueOddsHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeagueOddsHistory update
   */
  export type LeagueOddsHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * The data needed to update a LeagueOddsHistory.
     */
    data: XOR<LeagueOddsHistoryUpdateInput, LeagueOddsHistoryUncheckedUpdateInput>
    /**
     * Choose, which LeagueOddsHistory to update.
     */
    where: LeagueOddsHistoryWhereUniqueInput
  }

  /**
   * LeagueOddsHistory updateMany
   */
  export type LeagueOddsHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LeagueOddsHistories.
     */
    data: XOR<LeagueOddsHistoryUpdateManyMutationInput, LeagueOddsHistoryUncheckedUpdateManyInput>
    /**
     * Filter which LeagueOddsHistories to update
     */
    where?: LeagueOddsHistoryWhereInput
  }

  /**
   * LeagueOddsHistory upsert
   */
  export type LeagueOddsHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * The filter to search for the LeagueOddsHistory to update in case it exists.
     */
    where: LeagueOddsHistoryWhereUniqueInput
    /**
     * In case the LeagueOddsHistory found by the `where` argument doesn't exist, create a new LeagueOddsHistory with this data.
     */
    create: XOR<LeagueOddsHistoryCreateInput, LeagueOddsHistoryUncheckedCreateInput>
    /**
     * In case the LeagueOddsHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeagueOddsHistoryUpdateInput, LeagueOddsHistoryUncheckedUpdateInput>
  }

  /**
   * LeagueOddsHistory delete
   */
  export type LeagueOddsHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
    /**
     * Filter which LeagueOddsHistory to delete.
     */
    where: LeagueOddsHistoryWhereUniqueInput
  }

  /**
   * LeagueOddsHistory deleteMany
   */
  export type LeagueOddsHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeagueOddsHistories to delete
     */
    where?: LeagueOddsHistoryWhereInput
  }

  /**
   * LeagueOddsHistory without action
   */
  export type LeagueOddsHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeagueOddsHistory
     */
    select?: LeagueOddsHistorySelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const LiveWinProbSampleScalarFieldEnum: {
    id: 'id',
    leagueId: 'leagueId',
    week: 'week',
    matchupId: 'matchupId',
    rosterAId: 'rosterAId',
    rosterBId: 'rosterBId',
    timestamp: 'timestamp',
    gameProgress: 'gameProgress',
    winProbA: 'winProbA',
    winProbB: 'winProbB',
    projectedFinalA: 'projectedFinalA',
    projectedFinalB: 'projectedFinalB',
    currentScoreA: 'currentScoreA',
    currentScoreB: 'currentScoreB',
    spread: 'spread',
    total: 'total'
  };

  export type LiveWinProbSampleScalarFieldEnum = (typeof LiveWinProbSampleScalarFieldEnum)[keyof typeof LiveWinProbSampleScalarFieldEnum]


  export const MatchupOddsHistoryScalarFieldEnum: {
    id: 'id',
    leagueId: 'leagueId',
    week: 'week',
    matchupId: 'matchupId',
    team1WinPct: 'team1WinPct',
    team2WinPct: 'team2WinPct',
    spread: 'spread',
    total: 'total',
    team1MoneyLine: 'team1MoneyLine',
    team2MoneyLine: 'team2MoneyLine',
    gameProgress: 'gameProgress',
    isLive: 'isLive',
    triggeredBy: 'triggeredBy',
    computeTimeMs: 'computeTimeMs',
    createdAt: 'createdAt',
    team1Score: 'team1Score',
    team2Score: 'team2Score'
  };

  export type MatchupOddsHistoryScalarFieldEnum = (typeof MatchupOddsHistoryScalarFieldEnum)[keyof typeof MatchupOddsHistoryScalarFieldEnum]


  export const LeagueOddsHistoryScalarFieldEnum: {
    id: 'id',
    week: 'week',
    highestScorerOdds: 'highestScorerOdds',
    lowestScorerOdds: 'lowestScorerOdds',
    closestMatchup: 'closestMatchup',
    biggestBlowout: 'biggestBlowout',
    highestScoringMatchup: 'highestScoringMatchup',
    lowestScoringMatchup: 'lowestScoringMatchup',
    isLive: 'isLive',
    triggeredBy: 'triggeredBy',
    computeTimeMs: 'computeTimeMs',
    createdAt: 'createdAt'
  };

  export type LeagueOddsHistoryScalarFieldEnum = (typeof LeagueOddsHistoryScalarFieldEnum)[keyof typeof LeagueOddsHistoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    
  /**
   * Deep Input Types
   */


  export type LiveWinProbSampleWhereInput = {
    AND?: LiveWinProbSampleWhereInput | LiveWinProbSampleWhereInput[]
    OR?: LiveWinProbSampleWhereInput[]
    NOT?: LiveWinProbSampleWhereInput | LiveWinProbSampleWhereInput[]
    id?: StringFilter<"LiveWinProbSample"> | string
    leagueId?: StringFilter<"LiveWinProbSample"> | string
    week?: IntFilter<"LiveWinProbSample"> | number
    matchupId?: IntFilter<"LiveWinProbSample"> | number
    rosterAId?: IntFilter<"LiveWinProbSample"> | number
    rosterBId?: IntFilter<"LiveWinProbSample"> | number
    timestamp?: DateTimeFilter<"LiveWinProbSample"> | Date | string
    gameProgress?: FloatFilter<"LiveWinProbSample"> | number
    winProbA?: FloatFilter<"LiveWinProbSample"> | number
    winProbB?: FloatFilter<"LiveWinProbSample"> | number
    projectedFinalA?: FloatFilter<"LiveWinProbSample"> | number
    projectedFinalB?: FloatFilter<"LiveWinProbSample"> | number
    currentScoreA?: FloatFilter<"LiveWinProbSample"> | number
    currentScoreB?: FloatFilter<"LiveWinProbSample"> | number
    spread?: FloatFilter<"LiveWinProbSample"> | number
    total?: FloatFilter<"LiveWinProbSample"> | number
  }

  export type LiveWinProbSampleOrderByWithRelationInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    timestamp?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
  }

  export type LiveWinProbSampleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LiveWinProbSampleWhereInput | LiveWinProbSampleWhereInput[]
    OR?: LiveWinProbSampleWhereInput[]
    NOT?: LiveWinProbSampleWhereInput | LiveWinProbSampleWhereInput[]
    leagueId?: StringFilter<"LiveWinProbSample"> | string
    week?: IntFilter<"LiveWinProbSample"> | number
    matchupId?: IntFilter<"LiveWinProbSample"> | number
    rosterAId?: IntFilter<"LiveWinProbSample"> | number
    rosterBId?: IntFilter<"LiveWinProbSample"> | number
    timestamp?: DateTimeFilter<"LiveWinProbSample"> | Date | string
    gameProgress?: FloatFilter<"LiveWinProbSample"> | number
    winProbA?: FloatFilter<"LiveWinProbSample"> | number
    winProbB?: FloatFilter<"LiveWinProbSample"> | number
    projectedFinalA?: FloatFilter<"LiveWinProbSample"> | number
    projectedFinalB?: FloatFilter<"LiveWinProbSample"> | number
    currentScoreA?: FloatFilter<"LiveWinProbSample"> | number
    currentScoreB?: FloatFilter<"LiveWinProbSample"> | number
    spread?: FloatFilter<"LiveWinProbSample"> | number
    total?: FloatFilter<"LiveWinProbSample"> | number
  }, "id">

  export type LiveWinProbSampleOrderByWithAggregationInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    timestamp?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    _count?: LiveWinProbSampleCountOrderByAggregateInput
    _avg?: LiveWinProbSampleAvgOrderByAggregateInput
    _max?: LiveWinProbSampleMaxOrderByAggregateInput
    _min?: LiveWinProbSampleMinOrderByAggregateInput
    _sum?: LiveWinProbSampleSumOrderByAggregateInput
  }

  export type LiveWinProbSampleScalarWhereWithAggregatesInput = {
    AND?: LiveWinProbSampleScalarWhereWithAggregatesInput | LiveWinProbSampleScalarWhereWithAggregatesInput[]
    OR?: LiveWinProbSampleScalarWhereWithAggregatesInput[]
    NOT?: LiveWinProbSampleScalarWhereWithAggregatesInput | LiveWinProbSampleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LiveWinProbSample"> | string
    leagueId?: StringWithAggregatesFilter<"LiveWinProbSample"> | string
    week?: IntWithAggregatesFilter<"LiveWinProbSample"> | number
    matchupId?: IntWithAggregatesFilter<"LiveWinProbSample"> | number
    rosterAId?: IntWithAggregatesFilter<"LiveWinProbSample"> | number
    rosterBId?: IntWithAggregatesFilter<"LiveWinProbSample"> | number
    timestamp?: DateTimeWithAggregatesFilter<"LiveWinProbSample"> | Date | string
    gameProgress?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    winProbA?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    winProbB?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    projectedFinalA?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    projectedFinalB?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    currentScoreA?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    currentScoreB?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    spread?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
    total?: FloatWithAggregatesFilter<"LiveWinProbSample"> | number
  }

  export type MatchupOddsHistoryWhereInput = {
    AND?: MatchupOddsHistoryWhereInput | MatchupOddsHistoryWhereInput[]
    OR?: MatchupOddsHistoryWhereInput[]
    NOT?: MatchupOddsHistoryWhereInput | MatchupOddsHistoryWhereInput[]
    id?: StringFilter<"MatchupOddsHistory"> | string
    leagueId?: StringFilter<"MatchupOddsHistory"> | string
    week?: IntFilter<"MatchupOddsHistory"> | number
    matchupId?: IntFilter<"MatchupOddsHistory"> | number
    team1WinPct?: FloatFilter<"MatchupOddsHistory"> | number
    team2WinPct?: FloatFilter<"MatchupOddsHistory"> | number
    spread?: FloatFilter<"MatchupOddsHistory"> | number
    total?: FloatFilter<"MatchupOddsHistory"> | number
    team1MoneyLine?: IntFilter<"MatchupOddsHistory"> | number
    team2MoneyLine?: IntFilter<"MatchupOddsHistory"> | number
    gameProgress?: FloatFilter<"MatchupOddsHistory"> | number
    isLive?: BoolFilter<"MatchupOddsHistory"> | boolean
    triggeredBy?: StringFilter<"MatchupOddsHistory"> | string
    computeTimeMs?: IntNullableFilter<"MatchupOddsHistory"> | number | null
    createdAt?: DateTimeFilter<"MatchupOddsHistory"> | Date | string
    team1Score?: FloatNullableFilter<"MatchupOddsHistory"> | number | null
    team2Score?: FloatNullableFilter<"MatchupOddsHistory"> | number | null
  }

  export type MatchupOddsHistoryOrderByWithRelationInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    team1Score?: SortOrderInput | SortOrder
    team2Score?: SortOrderInput | SortOrder
  }

  export type MatchupOddsHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MatchupOddsHistoryWhereInput | MatchupOddsHistoryWhereInput[]
    OR?: MatchupOddsHistoryWhereInput[]
    NOT?: MatchupOddsHistoryWhereInput | MatchupOddsHistoryWhereInput[]
    leagueId?: StringFilter<"MatchupOddsHistory"> | string
    week?: IntFilter<"MatchupOddsHistory"> | number
    matchupId?: IntFilter<"MatchupOddsHistory"> | number
    team1WinPct?: FloatFilter<"MatchupOddsHistory"> | number
    team2WinPct?: FloatFilter<"MatchupOddsHistory"> | number
    spread?: FloatFilter<"MatchupOddsHistory"> | number
    total?: FloatFilter<"MatchupOddsHistory"> | number
    team1MoneyLine?: IntFilter<"MatchupOddsHistory"> | number
    team2MoneyLine?: IntFilter<"MatchupOddsHistory"> | number
    gameProgress?: FloatFilter<"MatchupOddsHistory"> | number
    isLive?: BoolFilter<"MatchupOddsHistory"> | boolean
    triggeredBy?: StringFilter<"MatchupOddsHistory"> | string
    computeTimeMs?: IntNullableFilter<"MatchupOddsHistory"> | number | null
    createdAt?: DateTimeFilter<"MatchupOddsHistory"> | Date | string
    team1Score?: FloatNullableFilter<"MatchupOddsHistory"> | number | null
    team2Score?: FloatNullableFilter<"MatchupOddsHistory"> | number | null
  }, "id">

  export type MatchupOddsHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    team1Score?: SortOrderInput | SortOrder
    team2Score?: SortOrderInput | SortOrder
    _count?: MatchupOddsHistoryCountOrderByAggregateInput
    _avg?: MatchupOddsHistoryAvgOrderByAggregateInput
    _max?: MatchupOddsHistoryMaxOrderByAggregateInput
    _min?: MatchupOddsHistoryMinOrderByAggregateInput
    _sum?: MatchupOddsHistorySumOrderByAggregateInput
  }

  export type MatchupOddsHistoryScalarWhereWithAggregatesInput = {
    AND?: MatchupOddsHistoryScalarWhereWithAggregatesInput | MatchupOddsHistoryScalarWhereWithAggregatesInput[]
    OR?: MatchupOddsHistoryScalarWhereWithAggregatesInput[]
    NOT?: MatchupOddsHistoryScalarWhereWithAggregatesInput | MatchupOddsHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MatchupOddsHistory"> | string
    leagueId?: StringWithAggregatesFilter<"MatchupOddsHistory"> | string
    week?: IntWithAggregatesFilter<"MatchupOddsHistory"> | number
    matchupId?: IntWithAggregatesFilter<"MatchupOddsHistory"> | number
    team1WinPct?: FloatWithAggregatesFilter<"MatchupOddsHistory"> | number
    team2WinPct?: FloatWithAggregatesFilter<"MatchupOddsHistory"> | number
    spread?: FloatWithAggregatesFilter<"MatchupOddsHistory"> | number
    total?: FloatWithAggregatesFilter<"MatchupOddsHistory"> | number
    team1MoneyLine?: IntWithAggregatesFilter<"MatchupOddsHistory"> | number
    team2MoneyLine?: IntWithAggregatesFilter<"MatchupOddsHistory"> | number
    gameProgress?: FloatWithAggregatesFilter<"MatchupOddsHistory"> | number
    isLive?: BoolWithAggregatesFilter<"MatchupOddsHistory"> | boolean
    triggeredBy?: StringWithAggregatesFilter<"MatchupOddsHistory"> | string
    computeTimeMs?: IntNullableWithAggregatesFilter<"MatchupOddsHistory"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"MatchupOddsHistory"> | Date | string
    team1Score?: FloatNullableWithAggregatesFilter<"MatchupOddsHistory"> | number | null
    team2Score?: FloatNullableWithAggregatesFilter<"MatchupOddsHistory"> | number | null
  }

  export type LeagueOddsHistoryWhereInput = {
    AND?: LeagueOddsHistoryWhereInput | LeagueOddsHistoryWhereInput[]
    OR?: LeagueOddsHistoryWhereInput[]
    NOT?: LeagueOddsHistoryWhereInput | LeagueOddsHistoryWhereInput[]
    id?: StringFilter<"LeagueOddsHistory"> | string
    week?: IntFilter<"LeagueOddsHistory"> | number
    highestScorerOdds?: JsonFilter<"LeagueOddsHistory">
    lowestScorerOdds?: JsonFilter<"LeagueOddsHistory">
    closestMatchup?: JsonFilter<"LeagueOddsHistory">
    biggestBlowout?: JsonFilter<"LeagueOddsHistory">
    highestScoringMatchup?: JsonFilter<"LeagueOddsHistory">
    lowestScoringMatchup?: JsonFilter<"LeagueOddsHistory">
    isLive?: BoolFilter<"LeagueOddsHistory"> | boolean
    triggeredBy?: StringFilter<"LeagueOddsHistory"> | string
    computeTimeMs?: IntNullableFilter<"LeagueOddsHistory"> | number | null
    createdAt?: DateTimeFilter<"LeagueOddsHistory"> | Date | string
  }

  export type LeagueOddsHistoryOrderByWithRelationInput = {
    id?: SortOrder
    week?: SortOrder
    highestScorerOdds?: SortOrder
    lowestScorerOdds?: SortOrder
    closestMatchup?: SortOrder
    biggestBlowout?: SortOrder
    highestScoringMatchup?: SortOrder
    lowestScoringMatchup?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type LeagueOddsHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LeagueOddsHistoryWhereInput | LeagueOddsHistoryWhereInput[]
    OR?: LeagueOddsHistoryWhereInput[]
    NOT?: LeagueOddsHistoryWhereInput | LeagueOddsHistoryWhereInput[]
    week?: IntFilter<"LeagueOddsHistory"> | number
    highestScorerOdds?: JsonFilter<"LeagueOddsHistory">
    lowestScorerOdds?: JsonFilter<"LeagueOddsHistory">
    closestMatchup?: JsonFilter<"LeagueOddsHistory">
    biggestBlowout?: JsonFilter<"LeagueOddsHistory">
    highestScoringMatchup?: JsonFilter<"LeagueOddsHistory">
    lowestScoringMatchup?: JsonFilter<"LeagueOddsHistory">
    isLive?: BoolFilter<"LeagueOddsHistory"> | boolean
    triggeredBy?: StringFilter<"LeagueOddsHistory"> | string
    computeTimeMs?: IntNullableFilter<"LeagueOddsHistory"> | number | null
    createdAt?: DateTimeFilter<"LeagueOddsHistory"> | Date | string
  }, "id">

  export type LeagueOddsHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    week?: SortOrder
    highestScorerOdds?: SortOrder
    lowestScorerOdds?: SortOrder
    closestMatchup?: SortOrder
    biggestBlowout?: SortOrder
    highestScoringMatchup?: SortOrder
    lowestScoringMatchup?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: LeagueOddsHistoryCountOrderByAggregateInput
    _avg?: LeagueOddsHistoryAvgOrderByAggregateInput
    _max?: LeagueOddsHistoryMaxOrderByAggregateInput
    _min?: LeagueOddsHistoryMinOrderByAggregateInput
    _sum?: LeagueOddsHistorySumOrderByAggregateInput
  }

  export type LeagueOddsHistoryScalarWhereWithAggregatesInput = {
    AND?: LeagueOddsHistoryScalarWhereWithAggregatesInput | LeagueOddsHistoryScalarWhereWithAggregatesInput[]
    OR?: LeagueOddsHistoryScalarWhereWithAggregatesInput[]
    NOT?: LeagueOddsHistoryScalarWhereWithAggregatesInput | LeagueOddsHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LeagueOddsHistory"> | string
    week?: IntWithAggregatesFilter<"LeagueOddsHistory"> | number
    highestScorerOdds?: JsonWithAggregatesFilter<"LeagueOddsHistory">
    lowestScorerOdds?: JsonWithAggregatesFilter<"LeagueOddsHistory">
    closestMatchup?: JsonWithAggregatesFilter<"LeagueOddsHistory">
    biggestBlowout?: JsonWithAggregatesFilter<"LeagueOddsHistory">
    highestScoringMatchup?: JsonWithAggregatesFilter<"LeagueOddsHistory">
    lowestScoringMatchup?: JsonWithAggregatesFilter<"LeagueOddsHistory">
    isLive?: BoolWithAggregatesFilter<"LeagueOddsHistory"> | boolean
    triggeredBy?: StringWithAggregatesFilter<"LeagueOddsHistory"> | string
    computeTimeMs?: IntNullableWithAggregatesFilter<"LeagueOddsHistory"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"LeagueOddsHistory"> | Date | string
  }

  export type LiveWinProbSampleCreateInput = {
    id?: string
    leagueId: string
    week: number
    matchupId: number
    rosterAId: number
    rosterBId: number
    timestamp?: Date | string
    gameProgress: number
    winProbA: number
    winProbB: number
    projectedFinalA: number
    projectedFinalB: number
    currentScoreA: number
    currentScoreB: number
    spread: number
    total: number
  }

  export type LiveWinProbSampleUncheckedCreateInput = {
    id?: string
    leagueId: string
    week: number
    matchupId: number
    rosterAId: number
    rosterBId: number
    timestamp?: Date | string
    gameProgress: number
    winProbA: number
    winProbB: number
    projectedFinalA: number
    projectedFinalB: number
    currentScoreA: number
    currentScoreB: number
    spread: number
    total: number
  }

  export type LiveWinProbSampleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    rosterAId?: IntFieldUpdateOperationsInput | number
    rosterBId?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    gameProgress?: FloatFieldUpdateOperationsInput | number
    winProbA?: FloatFieldUpdateOperationsInput | number
    winProbB?: FloatFieldUpdateOperationsInput | number
    projectedFinalA?: FloatFieldUpdateOperationsInput | number
    projectedFinalB?: FloatFieldUpdateOperationsInput | number
    currentScoreA?: FloatFieldUpdateOperationsInput | number
    currentScoreB?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
  }

  export type LiveWinProbSampleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    rosterAId?: IntFieldUpdateOperationsInput | number
    rosterBId?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    gameProgress?: FloatFieldUpdateOperationsInput | number
    winProbA?: FloatFieldUpdateOperationsInput | number
    winProbB?: FloatFieldUpdateOperationsInput | number
    projectedFinalA?: FloatFieldUpdateOperationsInput | number
    projectedFinalB?: FloatFieldUpdateOperationsInput | number
    currentScoreA?: FloatFieldUpdateOperationsInput | number
    currentScoreB?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
  }

  export type LiveWinProbSampleCreateManyInput = {
    id?: string
    leagueId: string
    week: number
    matchupId: number
    rosterAId: number
    rosterBId: number
    timestamp?: Date | string
    gameProgress: number
    winProbA: number
    winProbB: number
    projectedFinalA: number
    projectedFinalB: number
    currentScoreA: number
    currentScoreB: number
    spread: number
    total: number
  }

  export type LiveWinProbSampleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    rosterAId?: IntFieldUpdateOperationsInput | number
    rosterBId?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    gameProgress?: FloatFieldUpdateOperationsInput | number
    winProbA?: FloatFieldUpdateOperationsInput | number
    winProbB?: FloatFieldUpdateOperationsInput | number
    projectedFinalA?: FloatFieldUpdateOperationsInput | number
    projectedFinalB?: FloatFieldUpdateOperationsInput | number
    currentScoreA?: FloatFieldUpdateOperationsInput | number
    currentScoreB?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
  }

  export type LiveWinProbSampleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    rosterAId?: IntFieldUpdateOperationsInput | number
    rosterBId?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    gameProgress?: FloatFieldUpdateOperationsInput | number
    winProbA?: FloatFieldUpdateOperationsInput | number
    winProbB?: FloatFieldUpdateOperationsInput | number
    projectedFinalA?: FloatFieldUpdateOperationsInput | number
    projectedFinalB?: FloatFieldUpdateOperationsInput | number
    currentScoreA?: FloatFieldUpdateOperationsInput | number
    currentScoreB?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
  }

  export type MatchupOddsHistoryCreateInput = {
    id?: string
    leagueId: string
    week: number
    matchupId: number
    team1WinPct: number
    team2WinPct: number
    spread: number
    total: number
    team1MoneyLine: number
    team2MoneyLine: number
    gameProgress: number
    isLive?: boolean
    triggeredBy: string
    computeTimeMs?: number | null
    createdAt?: Date | string
    team1Score?: number | null
    team2Score?: number | null
  }

  export type MatchupOddsHistoryUncheckedCreateInput = {
    id?: string
    leagueId: string
    week: number
    matchupId: number
    team1WinPct: number
    team2WinPct: number
    spread: number
    total: number
    team1MoneyLine: number
    team2MoneyLine: number
    gameProgress: number
    isLive?: boolean
    triggeredBy: string
    computeTimeMs?: number | null
    createdAt?: Date | string
    team1Score?: number | null
    team2Score?: number | null
  }

  export type MatchupOddsHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    team1WinPct?: FloatFieldUpdateOperationsInput | number
    team2WinPct?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    team1MoneyLine?: IntFieldUpdateOperationsInput | number
    team2MoneyLine?: IntFieldUpdateOperationsInput | number
    gameProgress?: FloatFieldUpdateOperationsInput | number
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team1Score?: NullableFloatFieldUpdateOperationsInput | number | null
    team2Score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MatchupOddsHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    team1WinPct?: FloatFieldUpdateOperationsInput | number
    team2WinPct?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    team1MoneyLine?: IntFieldUpdateOperationsInput | number
    team2MoneyLine?: IntFieldUpdateOperationsInput | number
    gameProgress?: FloatFieldUpdateOperationsInput | number
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team1Score?: NullableFloatFieldUpdateOperationsInput | number | null
    team2Score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MatchupOddsHistoryCreateManyInput = {
    id?: string
    leagueId: string
    week: number
    matchupId: number
    team1WinPct: number
    team2WinPct: number
    spread: number
    total: number
    team1MoneyLine: number
    team2MoneyLine: number
    gameProgress: number
    isLive?: boolean
    triggeredBy: string
    computeTimeMs?: number | null
    createdAt?: Date | string
    team1Score?: number | null
    team2Score?: number | null
  }

  export type MatchupOddsHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    team1WinPct?: FloatFieldUpdateOperationsInput | number
    team2WinPct?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    team1MoneyLine?: IntFieldUpdateOperationsInput | number
    team2MoneyLine?: IntFieldUpdateOperationsInput | number
    gameProgress?: FloatFieldUpdateOperationsInput | number
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team1Score?: NullableFloatFieldUpdateOperationsInput | number | null
    team2Score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MatchupOddsHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueId?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    matchupId?: IntFieldUpdateOperationsInput | number
    team1WinPct?: FloatFieldUpdateOperationsInput | number
    team2WinPct?: FloatFieldUpdateOperationsInput | number
    spread?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    team1MoneyLine?: IntFieldUpdateOperationsInput | number
    team2MoneyLine?: IntFieldUpdateOperationsInput | number
    gameProgress?: FloatFieldUpdateOperationsInput | number
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team1Score?: NullableFloatFieldUpdateOperationsInput | number | null
    team2Score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type LeagueOddsHistoryCreateInput = {
    id?: string
    week: number
    highestScorerOdds: JsonNullValueInput | InputJsonValue
    lowestScorerOdds: JsonNullValueInput | InputJsonValue
    closestMatchup: JsonNullValueInput | InputJsonValue
    biggestBlowout: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: boolean
    triggeredBy: string
    computeTimeMs?: number | null
    createdAt?: Date | string
  }

  export type LeagueOddsHistoryUncheckedCreateInput = {
    id?: string
    week: number
    highestScorerOdds: JsonNullValueInput | InputJsonValue
    lowestScorerOdds: JsonNullValueInput | InputJsonValue
    closestMatchup: JsonNullValueInput | InputJsonValue
    biggestBlowout: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: boolean
    triggeredBy: string
    computeTimeMs?: number | null
    createdAt?: Date | string
  }

  export type LeagueOddsHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    highestScorerOdds?: JsonNullValueInput | InputJsonValue
    lowestScorerOdds?: JsonNullValueInput | InputJsonValue
    closestMatchup?: JsonNullValueInput | InputJsonValue
    biggestBlowout?: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeagueOddsHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    highestScorerOdds?: JsonNullValueInput | InputJsonValue
    lowestScorerOdds?: JsonNullValueInput | InputJsonValue
    closestMatchup?: JsonNullValueInput | InputJsonValue
    biggestBlowout?: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeagueOddsHistoryCreateManyInput = {
    id?: string
    week: number
    highestScorerOdds: JsonNullValueInput | InputJsonValue
    lowestScorerOdds: JsonNullValueInput | InputJsonValue
    closestMatchup: JsonNullValueInput | InputJsonValue
    biggestBlowout: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: boolean
    triggeredBy: string
    computeTimeMs?: number | null
    createdAt?: Date | string
  }

  export type LeagueOddsHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    highestScorerOdds?: JsonNullValueInput | InputJsonValue
    lowestScorerOdds?: JsonNullValueInput | InputJsonValue
    closestMatchup?: JsonNullValueInput | InputJsonValue
    biggestBlowout?: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeagueOddsHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    week?: IntFieldUpdateOperationsInput | number
    highestScorerOdds?: JsonNullValueInput | InputJsonValue
    lowestScorerOdds?: JsonNullValueInput | InputJsonValue
    closestMatchup?: JsonNullValueInput | InputJsonValue
    biggestBlowout?: JsonNullValueInput | InputJsonValue
    highestScoringMatchup?: JsonNullValueInput | InputJsonValue
    lowestScoringMatchup?: JsonNullValueInput | InputJsonValue
    isLive?: BoolFieldUpdateOperationsInput | boolean
    triggeredBy?: StringFieldUpdateOperationsInput | string
    computeTimeMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type LiveWinProbSampleCountOrderByAggregateInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    timestamp?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
  }

  export type LiveWinProbSampleAvgOrderByAggregateInput = {
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
  }

  export type LiveWinProbSampleMaxOrderByAggregateInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    timestamp?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
  }

  export type LiveWinProbSampleMinOrderByAggregateInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    timestamp?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
  }

  export type LiveWinProbSampleSumOrderByAggregateInput = {
    week?: SortOrder
    matchupId?: SortOrder
    rosterAId?: SortOrder
    rosterBId?: SortOrder
    gameProgress?: SortOrder
    winProbA?: SortOrder
    winProbB?: SortOrder
    projectedFinalA?: SortOrder
    projectedFinalB?: SortOrder
    currentScoreA?: SortOrder
    currentScoreB?: SortOrder
    spread?: SortOrder
    total?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MatchupOddsHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrder
    createdAt?: SortOrder
    team1Score?: SortOrder
    team2Score?: SortOrder
  }

  export type MatchupOddsHistoryAvgOrderByAggregateInput = {
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    computeTimeMs?: SortOrder
    team1Score?: SortOrder
    team2Score?: SortOrder
  }

  export type MatchupOddsHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrder
    createdAt?: SortOrder
    team1Score?: SortOrder
    team2Score?: SortOrder
  }

  export type MatchupOddsHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    leagueId?: SortOrder
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrder
    createdAt?: SortOrder
    team1Score?: SortOrder
    team2Score?: SortOrder
  }

  export type MatchupOddsHistorySumOrderByAggregateInput = {
    week?: SortOrder
    matchupId?: SortOrder
    team1WinPct?: SortOrder
    team2WinPct?: SortOrder
    spread?: SortOrder
    total?: SortOrder
    team1MoneyLine?: SortOrder
    team2MoneyLine?: SortOrder
    gameProgress?: SortOrder
    computeTimeMs?: SortOrder
    team1Score?: SortOrder
    team2Score?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type LeagueOddsHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    week?: SortOrder
    highestScorerOdds?: SortOrder
    lowestScorerOdds?: SortOrder
    closestMatchup?: SortOrder
    biggestBlowout?: SortOrder
    highestScoringMatchup?: SortOrder
    lowestScoringMatchup?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrder
    createdAt?: SortOrder
  }

  export type LeagueOddsHistoryAvgOrderByAggregateInput = {
    week?: SortOrder
    computeTimeMs?: SortOrder
  }

  export type LeagueOddsHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    week?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrder
    createdAt?: SortOrder
  }

  export type LeagueOddsHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    week?: SortOrder
    isLive?: SortOrder
    triggeredBy?: SortOrder
    computeTimeMs?: SortOrder
    createdAt?: SortOrder
  }

  export type LeagueOddsHistorySumOrderByAggregateInput = {
    week?: SortOrder
    computeTimeMs?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use LiveWinProbSampleDefaultArgs instead
     */
    export type LiveWinProbSampleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LiveWinProbSampleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MatchupOddsHistoryDefaultArgs instead
     */
    export type MatchupOddsHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MatchupOddsHistoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LeagueOddsHistoryDefaultArgs instead
     */
    export type LeagueOddsHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LeagueOddsHistoryDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}