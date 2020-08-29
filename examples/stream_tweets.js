const Credentials = require('./helpers/credentials.js');
const Twitter = require('../src/twitter.js');

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const credentials = await Credentials.createFromCLI(args);

  const client = new Twitter(credentials);
  const stream = client.stream('tweets/sample/stream');

  // Close the stream after 30 seconds
  setTimeout(() => {
    stream.close();
  }, 30 * 1000);

  // Read data from the stream
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
