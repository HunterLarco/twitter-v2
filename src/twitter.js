const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const split = require('split');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const TwitterError = require('./TwitterError.js');
const TwitterStream = require('./TwitterStream.js');

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

async function cleanResponse(response) {
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

  return body
}

function applyParameters(url, parameters, prefix) {
  prefix = prefix || ''

  if (!parameters) {
    return
  }

  for (const [key, value] of Object.entries(parameters)) {
    if (typeof value == 'object' && value instanceof Array) {
      url.searchParams.set(prefix + key, value.join(','));
    } else if (typeof value == 'object') {
      applyParameters(url, value, `${prefix}${key}.`)
    } else {
      url.searchParams.set(prefix + key, value);
    }
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

  async _createAuthorizationHeader(url) {
    if (usingAppAuth(this.credentials)) {
      await this._createBearerIfNeeded();
      return `Bearer ${this.credentials.bearer_token}`;
    }

    const oauth = OAuth({
      consumer: {
        key: this.credentials.consumer_key,
        secret: this.credentials.consumer_secret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });

    return oauth.toHeader(
      oauth.authorize(
        {
          url: url.toString(),
          method: 'get',
        },
        {
          key: this.credentials.access_token,
          secret: this.credentials.access_token_secret,
        }
      )
    ).Authorization;
  }

  async get(endpoint, parameters) {
    await this._createBearerIfNeeded();

    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters)

    return cleanResponse(
      await fetch(url.toString(), {
        headers: {
          Authorization: await this._createAuthorizationHeader(url),
        },
      })
    );
  }

  async post(endpoint, body, parameters) {
    await this._createBearerIfNeeded();

    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters)

    return cleanResponse(
      await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.credentials.bearer_token}`,
        },
        body: JSON.stringify(body || {}),
      })
    );
  }

  stream(endpoint, parameters) {
    const abortController = new AbortController();

    return new TwitterStream(
      async () => {
        const url = new URL(`https://api.twitter.com/2/${endpoint}`);
        applyParameters(url, parameters)

        await this._createBearerIfNeeded();

        return fetch(url.toString(), {
          signal: abortController.signal,
          headers: {
            Authorization: `Bearer ${this.credentials.bearer_token}`,
          },
        });
      },
      () => {
        abortController.abort();
      }
    );
  }
}

module.exports = Twitter;
