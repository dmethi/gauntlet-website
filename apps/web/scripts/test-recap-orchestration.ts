#!/usr/bin/env tsx
/**
 * Test script for complete recap orchestration (RECAP-017 + RECAP-019)
 * Tests the full pipeline with all sections wired together + file storage.
 *
 * Usage:
 *   npm run test:recap-orchestration -- --week 5
 *   npm run test:recap-orchestration -- --week 5 --save          # Save to file system
 *   npm run test:recap-orchestration -- --week 5 --save --force  # Overwrite existing
 */

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateAndSave } from '../src/lib/reports/recap/integration';
import { generateWeeklyRecap } from '../src/lib/reports/recap/generate';

const program = new Command();

program
  .name('test-recap-orchestration')
  .description('Test complete recap report orchestration')
  .requiredOption('-w, --week <number>', 'NFL week number')
  .option('-s, --season <number>', 'NFL season year', '2025')
  .option('-o, --output <path>', 'Output markdown file path', 'week-recap-output.md')
  .option('--save', 'Save report to file system (data/reports/recap/)', false)
  .option('--force', 'Force regeneration if report already exists', false)
  .action(async options => {
    const week = parseInt(options.week);
    const season = parseInt(options.season);
    const outputPath = options.output;
    const saveToFile = options.save;
    const forceRegenerate = options.force;

    console.log(`\n🧪 Testing complete recap generation for Week ${week}, ${season} season\n`);

    try {
      let result;
      let storageResult;

      if (saveToFile) {
        // Use integrated generation + storage
        console.log('💾 Storage enabled - will save to file system\n');
        storageResult = await generateAndSave({
          week,
          season,
          forceRegenerate,
          saveToFile: true,
        });

        if (!storageResult.success) {
          console.error(`\n❌ Generation/Storage failed: ${storageResult.error}\n`);
          process.exit(1);
        }

        result = storageResult.report;
      } else {
        // Just generate without saving
        result = await generateWeeklyRecap(week, season);
      }

      console.log('\n📋 RESULT SUMMARY:');
      console.log('==================');
      console.log(`Week: ${result.week}`);
      console.log(`Season: ${result.season}`);
      console.log(`Generated At: ${result.generatedAt}`);
      console.log(`Total Errors: ${result.errors?.length || 0}`);

      if (saveToFile && storageResult) {
        console.log(`Saved: ${storageResult.saved ? '✅' : '❌'}`);
        if (storageResult.filePath) {
          console.log(`File: ${storageResult.filePath}`);
        }
        if (storageResult.backupCreated) {
          console.log(`Backup: Created ✅`);
        }
        console.log(`Duration: ${(storageResult.duration / 1000).toFixed(2)}s`);
      }

      console.log('\n📝 SECTIONS STATUS:');
      console.log('==================');
      console.log(`League Overview: ${result.leagueOverview ? '✅' : '❌'}`);
      console.log(`Hall of Fame: ${result.hallOfFame ? '✅' : '❌'}`);
      console.log(`Hall of Shame: ${result.hallOfShame ? '✅' : '❌'}`);
      console.log(`Power Rankings: ${result.powerRankings ? '✅' : '❌'}`);
      console.log(`Standings: ${result.standings ? '✅' : '❌'}`);
      console.log(`Matchup Narratives: ${result.matchupNarratives?.length || 0}/12 generated`);
      console.log(`Closing: ${result.closing ? '✅' : '❌'}`);

      if (result.errors && result.errors.length > 0) {
        console.log('\n⚠️  ERRORS:');
        console.log('==================');
        result.errors.forEach((err: string) => console.log(`- ${err}`));
      }

      // Build markdown output
      const markdown = buildMarkdownReport(result);
      const fullPath = join(process.cwd(), outputPath);
      writeFileSync(fullPath, markdown, 'utf-8');
      console.log(`\n📄 Generated narratives saved to: ${fullPath}`);

      console.log('\n✅ TEST PASSED: Orchestration completed successfully\n');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ TEST FAILED:', error);
      console.error('\nStack trace:', error instanceof Error ? error.stack : 'No stack trace');
      process.exit(1);
    }
  });

const buildMarkdownReport = (result: any): string => {
  const lines: string[] = [];

  lines.push(`# Week ${result.week} Recap - ${result.season} Season`);
  lines.push('');
  lines.push(`Generated: ${new Date(result.generatedAt).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // League Overview
  if (result.leagueOverview) {
    lines.push('## League Overview');
    lines.push('');
    lines.push(result.leagueOverview);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Hall of Fame
  if (result.hallOfFame) {
    lines.push('## Hall of Fame');
    lines.push('');
    lines.push(result.hallOfFame);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Hall of Shame
  if (result.hallOfShame) {
    lines.push('## Hall of Shame');
    lines.push('');
    lines.push(result.hallOfShame);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Power Rankings
  if (result.powerRankings) {
    lines.push('## Power Rankings');
    lines.push('');
    lines.push(result.powerRankings);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Standings
  if (result.standings) {
    lines.push('## Standings & Playoff Picture');
    lines.push('');
    lines.push(result.standings);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Matchup Narratives
  if (result.matchupNarratives && result.matchupNarratives.length > 0) {
    lines.push('## Matchup Narratives');
    lines.push('');
    result.matchupNarratives.forEach((narrative: any) => {
      lines.push(`### ${narrative.matchupId}`);
      lines.push('');
      lines.push(narrative.narrative || '_Failed to generate narrative_');
      lines.push('');
    });
    lines.push('---');
    lines.push('');
  }

  // Closing Commentary
  if (result.closing) {
    lines.push('## Closing Commentary');
    lines.push('');
    lines.push(result.closing);
    lines.push('');
  }

  // Errors
  if (result.errors && result.errors.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Generation Errors');
    lines.push('');
    result.errors.forEach((err: string) => {
      lines.push(`- ${err}`);
    });
    lines.push('');
  }

  return lines.join('\n');
};

program.parse();
