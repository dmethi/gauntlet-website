/**
 * Format a number to specified decimal places
 */
export function formatNumber(num, decimals = 2) {
    return Number(num.toFixed(decimals)).toString();
}
/**
 * Calculate percentage with proper rounding
 */
export function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100 * 100) / 100;
}
/**
 * Generate random number within range
 */
export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Sleep utility for async operations
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Capitalize first letter of each word
 */
export function titleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str) {
    return str.replace(/_([a-z])/g, g => g[1].toUpperCase());
}
/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
/**
 * Deep clone an object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Check if object is empty
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
/**
 * Generate UUID v4
 */
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * Calculate normalized error between projected and actual points
 */
export function calculateNormalizedError(projected, actual) {
    if (projected > 0) {
        return (actual - projected) / projected;
    }
    return null;
}
/**
 * Calculate standard deviation for an array of numbers
 */
export function calculateStdDev(values) {
    if (values.length < 2)
        return 0;
    // Calculate mean
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    // Calculate sum of squared differences from mean
    const squaredDiffs = values.map(x => Math.pow(x - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((a, b) => a + b, 0);
    // Calculate variance and standard deviation
    const variance = sumSquaredDiffs / (values.length - 1); // Use n-1 for sample variance
    return Math.sqrt(variance);
}
export function getCurrentWeek() {
    const now = new Date();
    const seasonStart = new Date('2024-09-05'); // Update each season
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1;
}
/**
 * Check if current time is during NFL season
 */
export function isNFLSeason() {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    // NFL season runs September through February
    return month >= 9 || month <= 2;
}
