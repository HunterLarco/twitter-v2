const Credentials = require('./helpers/credentials.js');
const Twitter = require('../src/twitter.js');

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const credentials = await Credentials.createFromCLI(args);

  const client = new Twitter(credentials);
  console.log(await client.get('tweets', { ids: '1228393702244134912' }));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
