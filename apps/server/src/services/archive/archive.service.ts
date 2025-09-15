/**
 * Archive Service
 * Handles local JSON archiving of historical data
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface ArchiveMetadata {
  timestamp: string;
  type: string;
  identifier: string;
  version: string;
  checksum?: string;
  reason?: string;
  itemCount?: number;
  count?: number;
  week?: number;
  season?: string;
}

export class ArchiveService {
  private readonly archivePath: string;

  constructor(basePath?: string) {
    this.archivePath = basePath || path.join(process.cwd(), 'data', 'archive');
  }

  /**
   * Ensure archive directory exists
   */
  private async ensureDirectory(subPath?: string) {
    const fullPath = subPath ? path.join(this.archivePath, subPath) : this.archivePath;
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  }

  /**
   * Generate a checksum for data integrity
   */
  private generateChecksum(data: any): string {
    const stringified = JSON.stringify(data);
    return crypto.createHash('md5').update(stringified).digest('hex');
  }

  /**
   * Save a snapshot of data
   */
  async saveSnapshot(
    type: 'league' | 'matchups' | 'rosters' | 'transactions' | 'odds' | 'simulations',
    identifier: string,
    data: any,
    metadata?: Partial<ArchiveMetadata>
  ): Promise<string> {
    const directory = await this.ensureDirectory(type);

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    const filename = `${type}_${identifier}_${dateStr}.json`;
    const filepath = path.join(directory, filename);

    const archiveData = {
      metadata: {
        timestamp,
        type,
        identifier,
        version: process.env.APP_VERSION || '1.0.0',
        checksum: this.generateChecksum(data),
        ...metadata,
      },
      data,
    };

    await fs.writeFile(filepath, JSON.stringify(archiveData, null, 2));

    console.log(`📁 Archived: ${filename} (${archiveData.metadata.checksum})`);
    return filepath;
  }

  /**
   * Load a snapshot from archive
   */
  async loadSnapshot(type: string, identifier: string, date?: string): Promise<any | null> {
    const searchDate = date || new Date().toISOString().split('T')[0];
    const filename = `${type}_${identifier}_${searchDate}.json`;
    const filepath = path.join(this.archivePath, type, filename);

    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const archived = JSON.parse(content);

      // Verify checksum if available
      if (archived.metadata?.checksum) {
        const currentChecksum = this.generateChecksum(archived.data);
        if (currentChecksum !== archived.metadata.checksum) {
          console.warn(`⚠️ Checksum mismatch for ${filename}`);
        }
      }

      console.log(`📁 Loaded archive: ${filename}`);
      return archived.data;
    } catch (error) {
      console.log(`📁 No archive found: ${filename}`);
      return null;
    }
  }

  /**
   * List all archives for a type
   */
  async listArchives(type?: string): Promise<string[]> {
    const dirPath = type ? path.join(this.archivePath, type) : this.archivePath;

    try {
      const files = await fs.readdir(dirPath, { recursive: !type });
      return files.filter(f => f.endsWith('.json'));
    } catch {
      return [];
    }
  }

  /**
   * Get archive metadata without loading full data
   */
  async getArchiveMetadata(filepath: string): Promise<ArchiveMetadata | null> {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const archived = JSON.parse(content);
      return archived.metadata;
    } catch {
      return null;
    }
  }

  /**
   * Clean old archives
   */
  async cleanOldArchives(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;
    const archives = await this.listArchives();

    for (const file of archives) {
      const metadata = await this.getArchiveMetadata(path.join(this.archivePath, file));

      if (metadata && new Date(metadata.timestamp) < cutoffDate) {
        await fs.unlink(path.join(this.archivePath, file));
        deletedCount++;
        console.log(`🗑️ Deleted old archive: ${file}`);
      }
    }

    return deletedCount;
  }

  /**
   * Export archives to a backup location
   */
  async exportArchives(exportPath: string): Promise<void> {
    await fs.mkdir(exportPath, { recursive: true });

    const archives = await this.listArchives();
    for (const file of archives) {
      const source = path.join(this.archivePath, file);
      const dest = path.join(exportPath, file);
      await fs.copyFile(source, dest);
    }

    console.log(`📦 Exported ${archives.length} archives to ${exportPath}`);
  }

  /**
   * Archive current database data before migration
   */
  async archiveDatabase(data: {
    leagues?: any[];
    rosters?: any[];
    matchups?: any[];
    users?: any[];
    transactions?: any[];
    odds?: any[];
  }): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];

    for (const [type, items] of Object.entries(data)) {
      if (items && items.length > 0) {
        await this.saveSnapshot(type as any, 'full_backup', items, {
          reason: 'pre_migration_backup',
          itemCount: items.length,
        });
      }
    }

    console.log(`✅ Database archived for migration (${timestamp})`);
  }
}

export default ArchiveService;
