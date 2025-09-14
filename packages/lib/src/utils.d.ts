/**
 * Format a number to specified decimal places
 */
export declare function formatNumber(num: number, decimals?: number): string;
/**
 * Calculate percentage with proper rounding
 */
export declare function calculatePercentage(value: number, total: number): number;
/**
 * Generate random number within range
 */
export declare function randomBetween(min: number, max: number): number;
/**
 * Sleep utility for async operations
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Capitalize first letter of each word
 */
export declare function titleCase(str: string): string;
/**
 * Convert snake_case to camelCase
 */
export declare function toCamelCase(str: string): string;
/**
 * Convert camelCase to snake_case
 */
export declare function toSnakeCase(str: string): string;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Check if object is empty
 */
export declare function isEmpty(obj: object): boolean;
/**
 * Generate UUID v4
 */
export declare function generateId(): string;
/**
 * Calculate normalized error between projected and actual points
 */
export declare function calculateNormalizedError(projected: number, actual: number): number | null;
/**
 * Calculate standard deviation for an array of numbers
 */
export declare function calculateStdDev(values: number[]): number;
/**
 * NFL state structure from Sleeper API
 */
export interface NFLState {
    week: number;
    leg: number;
    season: string;
    season_type: 'pre' | 'regular' | 'post';
    league_season: string;
    previous_season: string;
    season_start_date: string;
    display_week: number;
    league_create_season: string;
    season_has_scores: boolean;
}
/**
 * Fetch current NFL state from Sleeper API
 */
export declare function fetchNFLState(): Promise<NFLState>;
/**
 * Get current NFL week from Sleeper API
 */
export declare function getCurrentWeek(): Promise<number>;
/**
 * Synchronous version of getCurrentWeek for backward compatibility
 * @deprecated Use getCurrentWeek() async version instead
 */
export declare function getCurrentWeekSync(): number;
/**
 * Check if current time is during NFL season
 */
export declare function isNFLSeason(): boolean;
