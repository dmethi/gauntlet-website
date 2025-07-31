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
export declare function getCurrentWeek(): number;
/**
 * Check if current time is during NFL season
 */
export declare function isNFLSeason(): boolean;
