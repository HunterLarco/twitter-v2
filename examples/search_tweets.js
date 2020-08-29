const Credentials = require('./helpers/credentials.js');
const Twitter = require('../src/twitter.js');

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const credentials = await Credentials.createFromCLI(args);

  const client = new Twitter(credentials);
  const { data: tweets, meta } = await client.get('tweets/search/recent', {
    query: 'url:"https://medium.com" -is:retweet lang:en',
    max_results: 10,
    tweet: {
      fields: [
        'created_at',
        'entities',
        'in_reply_to_user_id',
        'public_metrics',
        'referenced_tweets',
        'source',
        'author_id',
      ],
    },
  });

  for (const tweet of tweets) {
    console.log(tweet);
  }
  console.log(meta);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
