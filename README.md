# Twitter V2 API for Node.js

An asynchronous client library for the Twitter REST and Streaming [V2 API's](https://developer.twitter.com/en/docs/twitter-api/early-access).

[![NPM](https://nodei.co/npm/twitter-v2.png)](https://nodei.co/npm/twitter-v2/)

```javascript
const Twitter = require('twitter-v2');

const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

client.get('tweets', { ids: '1228393702244134912' }).then(({ data }) => {
  console.log(data);
});
```

## Installation

`npm install twitter-v2`

## Quick Start

You will need valid Twitter developer credentials in the form of a set of consumer and access tokens/keys. You can get early access V2 keys [here](https://developer.twitter.com/en/apply-for-access). 

## For User based authentication:

```javascript
const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});
```

## For App based authentication:

```javascript
const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
});
```

Note - You will not have access to all endpoints whilst using Application Only authentication, but you will have access to higher API limits.

## REST API

You now have the ability to make GET and POST requests against the REST API via the convenience methods.

```javascript
client.get(path, urlParams);
client.post(path, body, urlParams);
```

The REST API convenience methods return Promises.

## Streaming API

Use the streaming convenience methods for any stream APIs.

```javascript
const stream = client.stream(path, urlParams);
```

The Streaming API will return an async iterator with the convenience method `close()`.

```javascript
const client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
});

const stream = client.stream('tweets/sample/stream')

for await (const { data } of stream) {
  console.log(data)
}

stream.close()
```
