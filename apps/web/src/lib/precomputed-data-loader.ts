/**
 * Precomputed Data Loader
 *
 * Loads precomputed analytics from JSON files for instant page loading.
 * Falls back to real-time computation if precomputed data is not available.
 */

import { DraftAnalytics } from './draft-analytics';
import { ManagerAnalytics } from './manager-analytics';
import { MockDraft } from './draft-generator';

// Cache for precomputed data
let precomputedDrafts: { draft1: MockDraft; draft2: MockDraft } | null = null;
let precomputedAnalytics: DraftAnalytics | null = null;
let precomputedManagerAnalytics: ManagerAnalytics | null = null;
let precomputedMetadata: any | null = null;
let isLoaded = false;

// Load precomputed data using fetch (client-side compatible)
async function loadPrecomputedData() {
  if (isLoaded) return;

  try {
    // Load all files in parallel
    const [draftsRes, analyticsRes, managerRes, metadataRes] = await Promise.all([
      fetch('/data/precomputed/drafts.json').catch(() => null),
      fetch('/data/precomputed/league-analytics.json').catch(() => null),
      fetch('/data/precomputed/manager-analytics.json').catch(() => null),
      fetch('/data/precomputed/metadata.json').catch(() => null),
    ]);

    if (draftsRes?.ok && analyticsRes?.ok && managerRes?.ok && metadataRes?.ok) {
      precomputedDrafts = await draftsRes.json();
      precomputedAnalytics = await analyticsRes.json();
      precomputedManagerAnalytics = await managerRes.json();
      precomputedMetadata = await metadataRes.json();

      console.log('✅ Loaded precomputed analytics data from server');
      if (precomputedMetadata) {
        console.log(
          `📊 Generated: ${new Date(precomputedMetadata.timestamp || 0).toLocaleString()}`
        );
        console.log(`⚡ Generation time: ${precomputedMetadata.generationTime}ms`);
        console.log(`🏈 Players: ${precomputedMetadata.playerCount}`);
      }
    } else {
      console.warn('⚠️ Precomputed data not found on server, will generate on demand');
      console.warn('Run: npm run precompute:real');
    }
  } catch (error) {
    console.warn('⚠️ Error loading precomputed data:', error);
  }

  isLoaded = true;
}

export interface PrecomputedDataStatus {
  available: boolean;
  timestamp?: string;
  generationTime?: number;
  playerCount?: number;
  teamCount?: number;
}

/**
 * Get precomputed drafts data
 */
export async function getPrecomputedDrafts(): Promise<{
  draft1: MockDraft;
  draft2: MockDraft;
} | null> {
  await loadPrecomputedData();
  return precomputedDrafts;
}

/**
 * Get precomputed league analytics
 */
export async function getPrecomputedAnalytics(): Promise<DraftAnalytics | null> {
  await loadPrecomputedData();
  return precomputedAnalytics;
}

/**
 * Get precomputed manager analytics
 */
export async function getPrecomputedManagerAnalytics(): Promise<ManagerAnalytics | null> {
  await loadPrecomputedData();
  return precomputedManagerAnalytics;
}

/**
 * Get precomputed data status and metadata
 */
export function getPrecomputedDataStatus(): PrecomputedDataStatus {
  return {
    available: !!(precomputedDrafts && precomputedAnalytics && precomputedManagerAnalytics),
    timestamp: precomputedMetadata?.timestamp,
    generationTime: precomputedMetadata?.generationTime,
    playerCount: precomputedMetadata?.playerCount,
    teamCount: precomputedMetadata?.teamCount,
  };
}

/**
 * Check if precomputed data is fresh (less than 1 hour old)
 */
export function isPrecomputedDataFresh(): boolean {
  if (!precomputedMetadata?.timestamp) return false;

  const generated = new Date(precomputedMetadata.timestamp);
  const now = new Date();
  const ageHours = (now.getTime() - generated.getTime()) / (1000 * 60 * 60);

  return ageHours < 1; // Consider fresh if less than 1 hour old
}

/**
 * Get a summary of what data is available
 */
export function getDataSummary() {
  const status = getPrecomputedDataStatus();

  if (!status.available) {
    return {
      status: 'unavailable',
      message: 'No precomputed data found. Run precompute script to generate.',
      loadTime: 'slow',
    };
  }

  const fresh = isPrecomputedDataFresh();

  return {
    status: fresh ? 'fresh' : 'stale',
    message: `Data generated ${new Date(status.timestamp!).toLocaleString()}`,
    loadTime: 'instant',
    generationTime: `${status.generationTime}ms`,
    playerCount: status.playerCount,
    teamCount: status.teamCount,
  };
}

// Development helper - log data status
if (typeof window === 'undefined') {
  const summary = getDataSummary();
  console.log(`📈 Analytics Data Status: ${summary.status}`);
  console.log(`⚡ Expected load time: ${summary.loadTime}`);
  if (summary.generationTime) {
    console.log(`🔥 Pre-generation saved: ${summary.generationTime} of computation`);
  }
}
