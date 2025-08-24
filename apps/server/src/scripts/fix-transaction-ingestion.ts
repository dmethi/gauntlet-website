/**
 * Fixed Transaction Ingestion Script
 * Handles malformed timestamps gracefully
 */

import 'dotenv/config';
import prisma from '../lib/prisma.js';
import { createLogger } from './data-ingestion/logger.js';
import { createAPI } from './data-ingestion/api.js';
import { toPrismaJson } from './data-ingestion/config.js';

const logger = createLogger();
const api = createAPI(logger);

const TEST_LEAGUE_ID = '997670420490801152';

function safeCreateDate(unixTimestamp: number): Date {
  // Handle various timestamp formats
  if (!unixTimestamp || isNaN(unixTimestamp)) {
    logger.warn(`Invalid timestamp: ${unixTimestamp}, using current date`);
    return new Date();
  }

  // If timestamp is already in milliseconds (> year 3000), use as-is
  if (unixTimestamp > 32503680000) {
    const date = new Date(unixTimestamp);
    if (date.getFullYear() > 3000) {
      logger.warn(
        `Timestamp results in far future date: ${date.toISOString()}, using current date`
      );
      return new Date();
    }
    return date;
  }

  // If timestamp is in seconds, convert to milliseconds
  const date = new Date(unixTimestamp * 1000);
  if (date.getFullYear() > 3000 || date.getFullYear() < 1990) {
    logger.warn(`Timestamp results in invalid date: ${date.toISOString()}, using current date`);
    return new Date();
  }

  return date;
}

async function ingestTransactionsFixed(leagueId: string, week: number) {
  logger.info(`Ingesting transactions for league ${leagueId} week ${week} with timestamp fixes`);

  const transactions = await api.getTransactions(leagueId, week);
  if (!transactions || transactions.length === 0) {
    logger.info(`No transactions found for week ${week}`);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const tx of transactions) {
    try {
      const baseData = {
        type: tx.type,
        status: tx.status,
        creatorId: tx.creator,
        rosterIds: tx.roster_ids || [],
        adds: toPrismaJson(tx.adds),
        drops: toPrismaJson(tx.drops),
        draftPicks: toPrismaJson(tx.draft_picks),
        waiver: toPrismaJson(tx.waiver_budget),
        settings: toPrismaJson(tx.settings),
        leg: tx.leg,
        consenterIds: (tx.consenter_ids || []).map(String),
        transactionAt: safeCreateDate(tx.created),
      };

      await prisma.transaction.upsert({
        where: { id: tx.transaction_id },
        update: {
          leagueId,
          ...baseData,
        },
        create: {
          id: tx.transaction_id,
          leagueId,
          ...baseData,
        },
      });

      successCount++;
    } catch (error: any) {
      logger.error(`Failed to ingest transaction ${tx.transaction_id}: ${error.message}`);
      errorCount++;
    }
  }

  logger.info(
    `Transaction ingestion complete for week ${week}: ${successCount} success, ${errorCount} errors`
  );
}

async function main() {
  try {
    logger.info('Starting fixed transaction ingestion...');

    // Ingest transactions for weeks 1-18
    for (let week = 1; week <= 18; week++) {
      await ingestTransactionsFixed(TEST_LEAGUE_ID, week);
    }

    // Check results
    const totalTransactions = await prisma.transaction.count();
    logger.info(`✅ Total transactions in database: ${totalTransactions}`);

    if (totalTransactions > 0) {
      const sampleTransactions = await prisma.transaction.findMany({
        take: 3,
        include: {
          creator: { select: { displayName: true } },
        },
      });

      logger.info('Sample transactions:');
      sampleTransactions.forEach(tx => {
        logger.info(
          `  - ${tx.type} by ${tx.creator?.displayName || 'Unknown'} on ${tx.transactionAt}`
        );
      });
    }
  } catch (error) {
    logger.error('Error during transaction ingestion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
main().catch(console.error);
