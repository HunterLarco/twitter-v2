const enquirer = require('enquirer');
const minimist = require('minimist');

async function fromCommandLine() {
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
    });
  }
  if (!credentials.consumer_secret) {
    prompts.push({
      type: 'input',
      name: 'consumer_secret',
      message: `consumer-secret:`,
    });
  }

  const promptResults = await enquirer.prompt(prompts);
  return { ...credentials, ...promptResults };
}

module.exports = {
  fromCommandLine,
};
