const Twitter = require('../src/twitter.js');

const credentials = require('./helpers/credentials.js');

async function main() {
  const client = new Twitter(await credentials.fromCommandLine());
  console.log(await client.get('tweets', { ids: '1228393702244134912' }));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
