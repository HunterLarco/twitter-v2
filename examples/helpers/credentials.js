const chalk = require('chalk');
const enquirer = require('enquirer');
const minimist = require('minimist');

function enquirerNotEmptyValidation(value) {
  return value.length ? true : 'Cannot be empty';
}

// Creates the credentials object required to initialize the twitter-v2 client.
//
// Note that the `consumer_key` and `consumer_secret` must exist for any form of
// authentication and so if they are missing, the user will be prompted to
// provide them.
module.exports.fromCommandLine = async () => {
  const args = minimist(process.argv.slice(2));

  const credentials = {
    consumer_key: args['consumer-key'],
    consumer_secret: args['consumer-secret'],
    bearer_token: args['bearer-token'],
    access_token: args['access-token'],
    access_token_secret: args['access-token-secret'],
  };

  const prompts = [];
  if (!credentials.consumer_key) {
    prompts.push({
      type: 'input',
      name: 'consumer_key',
      message: `consumer-key:`,
      validate: enquirerNotEmptyValidation,
    });
  }
  if (!credentials.consumer_secret) {
    prompts.push({
      type: 'input',
      name: 'consumer_secret',
      message: `consumer-secret:`,
      validate: enquirerNotEmptyValidation,
    });
  }

  if (prompts.length) {
    console.log(
      chalk.yellow(
        'You need to specify authentication credentials to communicate with ' +
          'the Twitter V2 API.'
      )
    );
    console.log(
      chalk.yellow(
        'Visit https://developer.twitter.com/en/apply-for-access if you ' +
          "don't already have API access."
      )
    );
    console.log(
      chalk.dim(
        'Note that you can use --consumer-key and --consumer-secret to ' +
          'preemptively satisfy these prompts'
      )
    );
  }

  const promptResults = await enquirer.prompt(prompts);
  return { ...credentials, ...promptResults };
};
