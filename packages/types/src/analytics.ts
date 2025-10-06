/**
 * Analytics & Stats Type Definitions
 *
 * Types for fantasy football analytics that are shared across the application.
 * Note: Many analytics types remain as local implementations due to domain-specific
 * requirements. Only widely-used, stable types are centralized here.
 */

// ============================================================================
// Position Tracking Types
// ============================================================================

/**
 * NFL positions tracked for fantasy stats
 */
export type TrackedPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF';

/**
 * Position points breakdown
 */
export interface PositionPoints {
  [position: string]: number;
}
