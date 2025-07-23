import { REGEX_PATTERNS } from './constants';

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.email.test(email);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  return REGEX_PATTERNS.username.test(username);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return REGEX_PATTERNS.password.test(password);
}

/**
 * Validate league name
 */
export function isValidLeagueName(name: string): boolean {
  return name.length >= 3 && name.length <= 50 && name.trim().length > 0;
}

/**
 * Validate team name
 */
export function isValidTeamName(name: string): boolean {
  return name.length >= 1 && name.length <= 30 && name.trim().length > 0;
}

/**
 * Validate NFL week number
 */
export function isValidNFLWeek(week: number): boolean {
  return Number.isInteger(week) && week >= 1 && week <= 18;
}

/**
 * Validate roster size
 */
export function isValidRosterSize(size: number, maxSize: number = 20): boolean {
  return Number.isInteger(size) && size >= 10 && size <= maxSize;
}

/**
 * Validate team count for league
 */
export function isValidTeamCount(count: number): boolean {
  return Number.isInteger(count) && count >= 4 && count <= 20 && count % 2 === 0;
}

/**
 * Validate scoring system values
 */
export function isValidScoringValue(value: number): boolean {
  return typeof value === 'number' && value >= -10 && value <= 10;
}

/**
 * Sanitize user input string
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 255); // Limit length
}

/**
 * Validate numeric input within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Check if array has no duplicates
 */
export function hasNoDuplicates<T>(array: T[]): boolean {
  return new Set(array).size === array.length;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 