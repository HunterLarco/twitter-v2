import chalk from 'chalk';

if (process.env.TWITTER_DISABLE_E2E) {
  console.warn(chalk.yellow('e2e tests are disabled'));
} else if (
  !process.env.TWITTER_BEARER_TOKEN ||
  !process.env.TWITTER_CONSUMER_KEY ||
  !process.env.TWITTER_CONSUMER_SECRET
) {
  console.error(chalk.red('e2e tests require Twitter credentials.'));
  console.log();
  console.log('To provide credentials, define the environment variables:');
  console.log(chalk.dim('- TWITTER_CONSUMER_KEY'));
  console.log(chalk.dim('- TWITTER_CONSUMER_SECRET'));
  console.log(chalk.dim('- TWITTER_BEARER_TOKEN'));
  console.log();
  console.log('or, skip e2e tests with TWITTER_DISABLE_E2E');
  console.log();
  process.exit(1);
}
