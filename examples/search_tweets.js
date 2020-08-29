const Twitter = require('../src/twitter.js');

const credentials = require('./helpers/credentials.js');

async function main() {
  const client = new Twitter(await credentials.fromCommandLine());

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
