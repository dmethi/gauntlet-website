import { CronJob } from 'cron';
import dotenv from 'dotenv';
import { scrapePlayerStats } from './scrapers/player-scraper';
import { scrapeGameSchedule } from './scrapers/schedule-scraper';
import { scrapeWeeklyStats } from './scrapers/stats-scraper';

dotenv.config();

console.log('🕷️  The Gauntlet Data Scraper starting...');

// Schedule player updates (daily at 3 AM)
const playerJob = new CronJob('0 3 * * *', async () => {
  console.log('Starting daily player scrape...');
  try {
    await scrapePlayerStats();
    console.log('Player scrape completed successfully');
  } catch (error) {
    console.error('Player scrape failed:', error);
  }
});

// Schedule stats updates (every hour during game days)
const statsJob = new CronJob('0 * * * 0,1,4', async () => {
  console.log('Starting stats scrape...');
  try {
    await scrapeWeeklyStats();
    console.log('Stats scrape completed successfully');
  } catch (error) {
    console.error('Stats scrape failed:', error);
  }
});

// Schedule updates (weekly on Tuesday)
const scheduleJob = new CronJob('0 2 * * 2', async () => {
  console.log('Starting schedule scrape...');
  try {
    await scrapeGameSchedule();
    console.log('Schedule scrape completed successfully');
  } catch (error) {
    console.error('Schedule scrape failed:', error);
  }
});

// Start cron jobs
playerJob.start();
statsJob.start();
scheduleJob.start();

console.log('All scraper jobs scheduled and running');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Stopping scraper jobs...');
  playerJob.stop();
  statsJob.stop();
  scheduleJob.stop();
  process.exit(0);
}); 