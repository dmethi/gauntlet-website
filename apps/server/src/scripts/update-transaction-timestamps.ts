#!/usr/bin/env tsx

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

interface SleeperTransaction {
  transaction_id: string;
  type: string;
  status: string;
  roster_ids: number[];
  adds: Record<string, string> | null;
  drops: Record<string, string> | null;
  draft_picks: Record<string, any> | null;
  waiver_budget: Record<string, any> | null;
  settings: Record<string, any> | null;
  leg: number;
  creator: string;
  created: number; // Unix timestamp
  consenter_ids: string[];
}

async function fetchFromSleeper<T>(endpoint: string): Promise<T> {
  const url = `https://api.sleeper.app/v1${endpoint}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
  }

  return response.json() as T;
}

async function updateTransactionTimestamps() {
  console.log('Starting transaction timestamp update...');

  // Get all transactions without transactionAt set
  const transactionsToUpdate = await prisma.transaction.findMany({
    where: {
      transactionAt: null,
    },
    select: {
      id: true,
      leagueId: true,
      createdAt: true,
    },
  });

  console.log(`Found ${transactionsToUpdate.length} transactions to update`);

  if (transactionsToUpdate.length === 0) {
    console.log('No transactions need updating');
    return;
  }

  // Group transactions by league to minimize API calls
  const transactionsByLeague: Record<string, typeof transactionsToUpdate> = {};
  for (const tx of transactionsToUpdate) {
    if (!transactionsByLeague[tx.leagueId]) {
      transactionsByLeague[tx.leagueId] = [];
    }
    transactionsByLeague[tx.leagueId].push(tx);
  }

  let updatedCount = 0;
  let errorCount = 0;

  for (const [leagueId, transactions] of Object.entries(transactionsByLeague)) {
    console.log(`\nProcessing league ${leagueId} with ${transactions.length} transactions...`);

    // We need to fetch transactions week by week since Sleeper API requires a week parameter
    // For now, let's try to get all transactions for all weeks (1-18)
    const allSleeperTransactions: SleeperTransaction[] = [];

    for (let week = 1; week <= 18; week++) {
      try {
        const weekTransactions = await fetchFromSleeper<SleeperTransaction[]>(
          `/league/${leagueId}/transactions/${week}`
        );
        allSleeperTransactions.push(...weekTransactions);

        // Add small delay to be nice to Sleeper API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to fetch week ${week} for league ${leagueId}:`, error);
        // Continue with other weeks
      }
    }

    console.log(
      `Fetched ${allSleeperTransactions.length} total transactions for league ${leagueId}`
    );

    // Create a map of transaction_id -> created timestamp
    const sleeperTxMap = new Map<string, number>();
    for (const sleeperTx of allSleeperTransactions) {
      sleeperTxMap.set(sleeperTx.transaction_id, sleeperTx.created);
    }

    // Update our database transactions
    for (const dbTx of transactions) {
      const sleeperCreated = sleeperTxMap.get(dbTx.id);

      if (sleeperCreated) {
        try {
          // Handle timestamp conversion properly
          let transactionDate: Date;

          // Check if the timestamp looks like it's already in milliseconds or seconds
          if (sleeperCreated > 1000000000000) {
            // Looks like milliseconds (timestamps after 2001)
            transactionDate = new Date(sleeperCreated);
          } else {
            // Looks like seconds - convert to milliseconds
            transactionDate = new Date(sleeperCreated * 1000);
          }

          // Validate the date is reasonable (between 2020 and 2030)
          const year = transactionDate.getFullYear();
          if (year < 2020 || year > 2030) {
            console.warn(
              `⚠ Suspicious timestamp for transaction ${dbTx.id}: ${sleeperCreated} -> ${transactionDate.toISOString()}`
            );
            errorCount++;
            continue;
          }

          await prisma.transaction.update({
            where: { id: dbTx.id },
            data: {
              transactionAt: transactionDate,
            },
          });

          updatedCount++;
          console.log(
            `✓ Updated transaction ${dbTx.id} with timestamp ${transactionDate.toISOString()}`
          );
        } catch (error) {
          console.error(`Failed to update transaction ${dbTx.id}:`, error);
          errorCount++;
        }
      } else {
        console.warn(`⚠ Could not find Sleeper data for transaction ${dbTx.id}`);
        errorCount++;
      }
    }
  }

  console.log(`\n✅ Update complete!`);
  console.log(`Updated: ${updatedCount} transactions`);
  console.log(`Errors: ${errorCount} transactions`);
}

async function main() {
  try {
    await updateTransactionTimestamps();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if this script is being run directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateTransactionTimestamps };
