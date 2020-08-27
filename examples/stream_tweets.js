const enquirer = require('enquirer');

const Twitter = require('../src/twitter.js');

async function createClientArgs(args) {
  const clientArgs = {
    consumer_key: args['consumer-key'],
    consumer_secret: args['consumer-secret'],
    bearer_token: args['bearer-token'],
    access_token: args['access-token'],
    access_token_secret: args['access-token-secret'],
  };

  const prompts = [];
  if (!clientArgs.consumer_key) {
    prompts.push({
      type: 'input',
      name: 'consumer_key',
      message: `consumer-key:`,
    });
  }
  if (!clientArgs.consumer_secret) {
    prompts.push({
      type: 'input',
      name: 'consumer_secret',
      message: `consumer-secret:`,
    });
  }

  return { ...clientArgs, ...(await enquirer.prompt(prompts)) };
}

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const client = new Twitter(await createClientArgs(args));

  const stream = client.stream('tweets/sample/stream');

  // Close the stream after 30 seconds
  setTimeout(() => {
    stream.close();
  }, 30 * 1000);

  for await (const { data } of stream) {
    console.log(`${data.id}: ${data.text.replace(/\s/g, ' ')}`);
  }

  console.log('Stream closed.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
