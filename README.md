# Twitter V2 API for Node.js

[![v2](https://img.shields.io/endpoint?url=https%3A%2F%2Ftwbadges.glitch.me%2Fbadges%2Fv2)](https://developer.twitter.com/en/docs/twitter-api)

An asynchronous client library for the Twitter REST and Streaming
[V2 API's](https://developer.twitter.com/en/docs/twitter-api/early-access).

[Try it now](https://npm.runkit.com/twitter-v2)

```javascript
const Twitter = require('twitter-v2');

const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: '',
});

const { data } = await client.get('tweets', { ids: '1228393702244134912' });
console.log(data);
```

## Installation

`npm install twitter-v2`

[![NPM](https://nodei.co/npm/twitter-v2.png?compact=true)](https://nodei.co/npm/twitter-v2/)

## Quick Start

You will need valid Twitter developer credentials in the form of a set of
consumer keys. You can get early access V2 keys
[here](https://developer.twitter.com/en/apply-for-access).

## For user based authentication:

User authentication requires your app's consumer keys and access tokens obtained
from [oauth 1.0a](https://developer.twitter.com/en/docs/authentication/guides/log-in-with-twitter).

```javascript
const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: '',
});
```

## For app based authentication:

Alternatively, app authentication (which can only access public data but is
often suitable for server applications) only needs your app's consumer keys.

```javascript
const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
});
```

## REST API

You can make GET, POST, and DELETE requests against the REST API via the
convenience methods.

```javascript
client.get(path, urlParams);
client.post(path, body, urlParams);
client.delete(path, urlParams);
```

The REST API convenience methods return Promises.

## Streaming API

Use the streaming convenience methods for any stream APIs.

```javascript
client.stream(path, urlParams);
```

The Streaming API will return an async iterator with the convenience method `close()`.
Ensure that you call `close()` when done with a stream, otherwise it will
continue to download content from Twitter in the background.

```javascript
const stream = client.stream(path, urlParams);

for await (const { data } of stream) {
  console.log(data);
}

stream.close();
```

## V1.1 API Support

This module does not support previous versions of the Twitter API, however it
works well with the following V1.1 modules

[![NPM](https://nodei.co/npm/twitter.png?compact=true)](https://nodei.co/npm/twitter/)

[![NPM](https://nodei.co/npm/twit.png?compact=true)](https://nodei.co/npm/twit/)

## Pull Requests

Contributions are welcome! Please send a pull request or open an issue and I'll
make sure to provide review. Before sending, please make sure your PR passes
lint. You can manually check this with

```bash
npm run check-code
```

and you can automatically format your code with

```bash
npm run format-code
```
