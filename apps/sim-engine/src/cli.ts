#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { runTestSimulation } from './simulations/test-sim';
import { runSeasonSimulation } from './simulations/season-sim';
import { runMatchupSimulation } from './simulations/matchup-sim';

const program = new Command();

program
  .name('gauntlet-sim')
  .description('The Gauntlet Fantasy Football Simulation Engine')
  .version('1.0.0');

program
  .command('test')
  .description('Run a test simulation with sample data')
  .action(async () => {
    const spinner = ora('Running test simulation...').start();
    try {
      const results = await runTestSimulation();
      spinner.succeed('Test simulation completed');
      console.log(chalk.green('\n🏈 Simulation Results:'));
      console.log(results);
    } catch (error) {
      spinner.fail('Test simulation failed');
      console.error(chalk.red(error));
    }
  });

program
  .command('season')
  .description('Run full season simulation')
  .option('-w, --weeks <number>', 'Number of weeks to simulate', '17')
  .action(async options => {
    const spinner = ora(`Simulating ${options.weeks} weeks...`).start();
    try {
      const results = await runSeasonSimulation(parseInt(options.weeks));
      spinner.succeed('Season simulation completed');
      console.log(chalk.green('\n🏆 Season Results:'));
      console.log(results);
    } catch (error) {
      spinner.fail('Season simulation failed');
      console.error(chalk.red(error));
    }
  });

program
  .command('matchup')
  .description('Simulate specific team matchup')
  .requiredOption('-t1, --team1 <id>', 'Team 1 ID')
  .requiredOption('-t2, --team2 <id>', 'Team 2 ID')
  .action(async options => {
    const spinner = ora(`Simulating ${options.team1} vs ${options.team2}...`).start();
    try {
      const results = await runMatchupSimulation(options.team1, options.team2);
      spinner.succeed('Matchup simulation completed');
      console.log(chalk.green('\n⚡ Matchup Results:'));
      console.log(results);
    } catch (error) {
      spinner.fail('Matchup simulation failed');
      console.error(chalk.red(error));
    }
  });

program.parse();
