import { expect } from 'chai';

import Twitter from '../../src/twitter';

if (!process.env.TWITTER_DISABLE_E2E) {
  describe('e2e search', () => {
    it('should search tweets with bearer token', async () => {
      const client = new Twitter({
        bearer_token: process.env.TWITTER_BEARER_TOKEN,
      });

      // Recent Tweet Search API Reference: https://bit.ly/3jqFjKF
      const { data: tweets, meta, errors } = await client.get(
        'tweets/search/recent',
        {
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
        }
      );

      expect(errors).to.be.undefined;
      expect(tweets).to.not.be.empty;
      expect(meta).to.include({
        result_count: tweets.length,
      });
    });

    it('should search tweets with consumer tokens', async () => {
      const client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      });

      // Recent Tweet Search API Reference: https://bit.ly/3jqFjKF
      const { data: tweets, meta, errors } = await client.get(
        'tweets/search/recent',
        {
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
        }
      );

      expect(errors).to.be.undefined;
      expect(tweets).to.not.be.empty;
      expect(meta).to.include({
        result_count: tweets.length,
      });
    });
  });
}
