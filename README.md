# Twitter V2 API for Node.js

[![v2](https://img.shields.io/endpoint?url=https%3A%2F%2Ftwbadges.glitch.me%2Fbadges%2Fv2)](https://developer.twitter.com/en/docs/twitter-api)
![](https://github.com/hunterlarco/twitter-v2/workflows/ci/badge.svg?branch=master)

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
often suitable for server applications) only needs your app's consumer keys
and/or bearer token.

```javascript
const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
});
```

or

```javascript
const client = new Twitter({
  bearer_token: '',
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

// Close the stream after 30s.
setTimeout(() => {
  stream.close();
}, 30000);

for await (const { data } of stream) {
  console.log(data);
}
```

Note that reconnect logic is not handled by this package, you're responsible for
implementing it based on the needs of your application. The stream will close
itself in two cases:

1. If the stream becomes disconnected for an unknown reason, a `TwitterError`
   will be thrown.
2. If Twitter's backend disconnects the stream healthily, the stream will be
   closed with no error.

If you wish to continuously listen to a stream, you'll need to handle both of
these cases. For example:

```js
async function listenForever(streamFactory, dataConsumer) {
  try {
    for await (const { data } of streamFactory()) {
      dataConsumer(data);
    }
    // The stream has been closed by Twitter. It is usually safe to reconnect.
    console.log('Stream disconnected healthily. Reconnecting.');
    listenForever(streamFactory, dataConsumer);
  } catch (error) {
    // An error occurred so we reconnect to the stream. Note that we should
    // probably have retry logic here to prevent reconnection after a number of
    // closely timed failures (may indicate a problem that is not downstream).
    console.warn('Stream disconnected with error. Retrying.', error);
    listenForever(streamFactory, dataConsumer);
  }
}

listenForever(
  () => client.stream('tweets/search/stream'),
  (data) => console.log(data)
);
```

## V1.1 API Support

This module does not support previous versions of the Twitter API, however it
works well with the following V1.1 modules

[![NPM](https://nodei.co/npm/twitter.png?compact=true)](https://nodei.co/npm/twitter/)

[![NPM](https://nodei.co/npm/twit.png?compact=true)](https://nodei.co/npm/twit/)
