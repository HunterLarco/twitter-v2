const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const split = require('split');

const TwitterError = require('./TwitterError.js');

function validateCredentials(credentials) {
  const {
    consumer_key,
    consumer_secret,
    bearer_token,
    access_token,
    access_token_secret,
  } = credentials;

  if (!consumer_key || typeof consumer_key != 'string') {
    throw new Error('Missing or invalid required Twitter arg: consumer_key');
  }

  if (!consumer_secret || typeof consumer_secret != 'string') {
    throw new Error('Missing or invalid required Twitter arg: consumer_secret');
  }

  if (bearer_token && typeof bearer_token != 'string') {
    throw new Error('Invalid Twitter arg: bearer_token');
  }

  if (access_token && typeof access_token != 'string') {
    throw new Error('Invalid Twitter arg: access_token');
  }

  if (access_token_secret && typeof access_token_secret != 'string') {
    throw new Error('Invalid Twitter arg: access_token_secret');
  }

  if (!!access_token ^ !!access_token_secret) {
    throw new Error(
      'Invalid Twitter args: access_token and access_token_secret must both ' +
        'be defined when using user authorization'
    );
  }

  if ((access_token || access_token_secret) && bearer_token) {
    throw new Error(
      'Invalid Twitter args: access_token and access_token_secret should not ' +
        'be used with bearer_token'
    );
  }
}

function usingAppAuth(credentials) {
  return !credentials.access_token && !credentials.access_token_secret;
}

async function createBearerToken({ consumer_key, consumer_secret }) {
  const basicAuth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString(
    'base64'
  );

  const response = await fetch('https://api.twitter.com/oauth2/token', {
    method: 'post',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: 'grant_type=client_credentials',
  });
  const body = await response.json();

  if (body.errors) {
    const error = body.errors[0];
    throw new TwitterError(error.message, error.code, error.label);
  }

  if (body.token_type != 'bearer') {
    throw new TwitterError(
      'Unexpected reply from Twitter upon obtaining bearer token',
      undefined,
      `Expected "bearer" but found ${body.token_type}`
    );
  }

  return body.access_token;
}

class DeferredPromise {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class TwitterStream {
  constructor(client, url) {
    this.client = client;
    this.url = url;
    this._started = false;
    this._closed = false;
    this._deferred = null;
    this._backlog = [];
    this._abortController = new AbortController();
  }

  async _start() {
    if (this._closed) {
      throw new TwitterError('Stream already closed');
    }

    await this.client._createBearerIfNeeded();

    const response = await fetch(this.url.toString(), {
      signal: this._abortController.signal,
      headers: {
        Authorization: `Bearer ${this.client.credentials.bearer_token}`,
      },
    });

    response.body.pipe(split()).on('data', (buffer) => {
      if (buffer == 'Rate limit exceeded') {
        this._deferred.reject(new TwitterError('Rate limit exceeded'));
        this._deferred = null;
        this.close();
        return;
      }

      const data = JSON.parse(buffer);

      let next;
      if (data.status && data.status != 200) {
        next = Promise.reject(
          new TwitterError(data.title, data.status, data.detail)
        );
        this.close();
      } else if (data.errors) {
        const error = data.errors[0];
        next = Promise.reject(
          new TwitterError(
            `${data.title}: ${error.message}`,
            data.type,
            data.detail
          )
        );
        this.close();
      } else {
        next = Promise.resolve({ done: false, value: data });
      }

      if (this._deferred) {
        this._deferred.resolve(next);
        this._deferred = null;
      } else {
        this._backlog.push(next);
      }
    });
  }

  close() {
    this._closed = true;
    this._backlog = [];
    this._abortController.abort();
  }

  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        if (!this._started) {
          this._started = true;
          this._start().catch((error) => {
            if (this._deferred) {
              this._deferred.resolve(next);
              this._deferred = null;
            } else {
              this._backlog.push(next);
            }
          });
        }

        if (this._deferred) {
          return this._deferred.promise;
        }

        if (this._backlog.length) {
          return this._backlog.shift();
        }

        this._deferred = new DeferredPromise();
        return this._deferred.promise;
      },
    };
  }
}

class Twitter {
  constructor(args) {
    const {
      consumer_key,
      consumer_secret,
      bearer_token,
      access_token,
      access_token_secret,
    } = args || {};

    const credentials = {
      consumer_key,
      consumer_secret,
      bearer_token,
      access_token,
      access_token_secret,
    };

    validateCredentials(credentials);

    Object.defineProperty(this, 'credentials', {
      value: credentials,
      writable: false,
      enumerable: true,
    });
  }

  _createBearerIfNeeded() {
    if (this._bearerPromise) {
      return this._bearerPromise;
    }

    if (!usingAppAuth(this.credentials)) {
      return Promise.resolve();
    }

    if (this.credentials.bearer_token) {
      return Promise.resolve();
    }

    this._bearerPromise = createBearerToken(this.credentials).then((token) => {
      this.credentials.bearer_token = token;
    });
    return this._bearerPromise;
  }

  async get(endpoint, parameters) {
    await this._createBearerIfNeeded();

    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    if (parameters) {
      for (const [key, value] of Object.entries(parameters)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.credentials.bearer_token}`,
      },
    });

    const body = await response.json();
    if (body.status && body.status != 200) {
      throw new TwitterError(body.title, body.status, body.detail);
    }
    if (body.errors) {
      const error = body.errors[0];
      throw new TwitterError(
        `${body.title}: ${error.message}`,
        body.type,
        body.detail
      );
    }

    return body;
  }

  stream(endpoint, parameters) {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    if (parameters) {
      for (const [key, value] of Object.entries(parameters)) {
        url.searchParams.set(key, value);
      }
    }

    return new TwitterStream(this, url);
  }
}

module.exports = Twitter;
