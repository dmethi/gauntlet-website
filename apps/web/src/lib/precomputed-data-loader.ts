/**
 * Precomputed Data Loader
 *
 * Loads precomputed analytics from JSON files for instant page loading.
 * Falls back to real-time computation if precomputed data is not available.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DraftAnalytics } from '@/features/draft-analysis/utils';
import { ManagerAnalytics } from './manager-analytics';
import { MockDraft } from './draft-generator';
import { debugLog } from '@/lib/debug-log';

// Cache for precomputed data
let precomputedDrafts: { draft1: MockDraft; draft2: MockDraft } | null = null;
let precomputedAnalytics: DraftAnalytics | null = null;
let precomputedManagerAnalytics: ManagerAnalytics | null = null;
let precomputedMetadata: any | null = null;
let isLoaded = false;

// Load precomputed data using fetch (client-side compatible)
const loadPrecomputedData = async (): Promise<void> => {
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

      debugLog('✅ Loaded precomputed analytics data from server');
      if (precomputedMetadata) {
        debugLog(`📊 Generated: ${new Date(precomputedMetadata.timestamp || 0).toLocaleString()}`);
        debugLog(`⚡ Generation time: ${precomputedMetadata.generationTime}ms`);
        debugLog(`🏈 Players: ${precomputedMetadata.playerCount}`);
      }
    } else {
      console.warn('⚠️ Precomputed data not found on server, will generate on demand');
      console.warn('Run: npm run precompute:real');
    }
  } catch (error) {
    console.warn('⚠️ Error loading precomputed data:', error);
  }

  isLoaded = true;
};

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
export const getPrecomputedDrafts = async (): Promise<{
  draft1: MockDraft;
  draft2: MockDraft;
} | null> => {
  await loadPrecomputedData();
  return precomputedDrafts;
};

/**
 * Get precomputed league analytics
 */
export const getPrecomputedAnalytics = async (): Promise<DraftAnalytics | null> => {
  await loadPrecomputedData();
  return precomputedAnalytics;
};

/**
 * Get precomputed manager analytics
 */
export const getPrecomputedManagerAnalytics = async (): Promise<ManagerAnalytics | null> => {
  await loadPrecomputedData();
  return precomputedManagerAnalytics;
};

/**
 * Get precomputed data status and metadata
 */
export const getPrecomputedDataStatus = (): PrecomputedDataStatus => {
  return {
    available: !!(precomputedDrafts && precomputedAnalytics && precomputedManagerAnalytics),
    timestamp: precomputedMetadata?.timestamp,
    generationTime: precomputedMetadata?.generationTime,
    playerCount: precomputedMetadata?.playerCount,
    teamCount: precomputedMetadata?.teamCount,
  };
};

/**
 * Check if precomputed data is fresh (less than 1 hour old)
 */
export const isPrecomputedDataFresh = (): boolean => {
  if (!precomputedMetadata?.timestamp) return false;

  const generated = new Date(precomputedMetadata.timestamp);
  const now = new Date();
  const ageHours = (now.getTime() - generated.getTime()) / (1000 * 60 * 60);

  return ageHours < 1; // Consider fresh if less than 1 hour old
};

/**
 * Get a summary of what data is available
 */
export const getDataSummary = () => {
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
};

// Development helper - log data status
if (typeof window === 'undefined') {
  const summary = getDataSummary();
  debugLog(`📈 Analytics Data Status: ${summary.status}`);
  debugLog(`⚡ Expected load time: ${summary.loadTime}`);
  if (summary.generationTime) {
    debugLog(`🔥 Pre-generation saved: ${summary.generationTime} of computation`);
  }
}
