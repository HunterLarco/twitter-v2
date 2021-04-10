import { expect } from 'chai';

import Twitter from '../../src/twitter';

if (!process.env.TWITTER_DISABLE_E2E) {
  describe('e2e search', () => {
    it('should stream data without any rules', async () => {
      const client = new Twitter({
        bearer_token: process.env.TWITTER_BEARER_TOKEN,
      });

      // Sampled Stream API Reference: https://bit.ly/31CU870
      const stream = client.stream('tweets/sample/stream');

      // Read data from the stream
      for await (const { data } of stream) {
        expect(data.id).to.be.an('string');
        stream.close();
      }
    });
  });
}
