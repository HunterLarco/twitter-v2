const Twitter = require('../build/twitter.js');

const credentials = require('./helpers/credentials.js');

async function resetRules(client, desiredRule) {
  const existingRules = await client.get('tweets/search/stream/rules');

  if (existingRules.data) {
    const rulesToDelete = existingRules.data.filter(
      (rule) => rule.value !== desiredRule
    );
    if (rulesToDelete.length) {
      console.log(
        'Deleting rules:',
        rulesToDelete.map((rule) => rule.value)
      );
      await client.post('tweets/search/stream/rules', {
        delete: {
          ids: rulesToDelete.map((rule) => rule.id),
        },
      });
    }
  }

  if (
    !existingRules.data ||
    !existingRules.data.some((rule) => rule.value === desiredRule)
  ) {
    console.log('Creating rule:', desiredRule);
    await client.post('tweets/search/stream/rules', {
      add: [
        {
          value: desiredRule,
          tag: Math.round(Math.random() * 10e16).toString(),
        },
      ],
    });
  }
}

async function main() {
  const client = new Twitter(await credentials.fromCommandLine());

  await resetRules(client, 'from:SpdpTest');
  const stream = client.stream('tweets/search/stream');

  console.log('start', new Date());

  // Read data from the stream
  for await (const { data } of stream) {
    console.log(`${data.id}: ${data.text.replace(/\s/g, ' ')}`);
  }

  console.log('end', new Date());

  console.log('Stream closed.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
