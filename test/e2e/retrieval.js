import { expect } from 'chai';

import Twitter from '../../src/twitter';

if (!process.env.TWITTER_DISABLE_E2E) {
  describe('e2e retrieval', () => {
    it('should retrieve tweets with bearer token', async () => {
      const client = new Twitter({
        bearer_token: process.env.TWITTER_BEARER_TOKEN,
      });

      // Tweet Lookup API Reference: https://bit.ly/2QF58Kw
      const { data: tweet, errors } = await client.get('tweets', {
        ids: '1228393702244134912',
        tweet: {
          fields: ['created_at', 'entities', 'public_metrics', 'author_id'],
        },
      });

      expect(errors).to.be.undefined;
      expect(tweet[0]).to.include({
        author_id: '2244994945',
        created_at: '2020-02-14T19:00:55.000Z',
        id: '1228393702244134912',
      });
    });

    it('should retrieve tweets with consumer tokens', async () => {
      const client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      });

      // Tweet Lookup API Reference: https://bit.ly/2QF58Kw
      const { data: tweet, errors } = await client.get('tweets', {
        ids: '1228393702244134912',
        tweet: {
          fields: ['created_at', 'entities', 'public_metrics', 'author_id'],
        },
      });

      expect(errors).to.be.undefined;
      expect(tweet[0]).to.include({
        author_id: '2244994945',
        created_at: '2020-02-14T19:00:55.000Z',
        id: '1228393702244134912',
      });
    });
  });
}
