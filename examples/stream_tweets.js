const Twitter = require('../build/twitter.js');

const credentials = require('./helpers/credentials.js');

async function main() {
  const client = new Twitter(await credentials.fromCommandLine());

  // Sampled Stream API Reference: https://bit.ly/31CU870
  const stream = client.stream('tweets/sample/stream');

  // Close the stream after 30 seconds
  setTimeout(() => {
    stream.close();
  }, 30 * 1000);

  // Read data from the stream
  for await (const { data, includes } of stream) {
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
