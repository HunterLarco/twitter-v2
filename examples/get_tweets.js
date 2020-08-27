const enquirer = require('enquirer');

const Twitter = require('../src/twitter.js');

async function createClientArgs(args) {
  const clientArgs = {
    consumer_key: args['consumer-key'],
    consumer_secret: args['consumer-secret'],
    bearer_token: args['bearer-token'],
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

  //  console.log(await client.get('tweets', { ids: '1228393702244134912' }));
  //  console.log(await client.get('tweets/search/recent', { query: 'Mozilla' }))
  //  console.log(await client.get('users/by', { usernames: 'twitterdev' }))

  let i = 0;
  const stream = client.stream('tweets/sample/stream');
  for await (const data of stream) {
    console.log(data);
    if (++i == 15) {
      stream.close();
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
