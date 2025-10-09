/**
 * File System Storage - Public API
 *
 * Exports all storage functions for saving, loading, and managing recap reports.
 */

export {
  saveReport,
  loadReport,
  loadBackup,
  reportExists,
  deleteReport,
  loadMetadata,
  getWeekMetadata,
  listReports,
  listSeasons,
} from './file-system';

export type {
  StorageConfig,
  GenerationMetadata,
  WeekMetadata,
  SaveResult,
  LoadResult,
} from './file-system';
